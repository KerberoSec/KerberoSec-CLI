---
name: pwn
description: Binary exploitation: stack/heap, format strings, ret2*, rop, mitigations, remote shell
---

# Pwn CTF

Read the mitigations first. `checksec --file=<binary>` and `file <binary>` before anything else.

## Recon (every time)

- `checksec --file=./challenge`: note: RELRO (full/partial/none), canary, NX, PIE, ASLR, symbols stripped.
- `file`, `readelf -h/-S/-l`, `nm -C` if symbols present, `strings -a -n4`.
- Run it (`./challenge`, or `nc host port` for remote) and interact manually to learn the input surface.
- `ldd`: which libc; download the exact libc if remote (`libc-database` or the provided one) and keep the build/ld: `pwninit` or `patchelf` to reproduce locally.
- `ltrace`/`strace` if it calls helper processes or syscalls directly.

## Vulnerability identification

- fuzz input length: `cyclic(500)` (pwntools) → note crash; `cyclic_find(eip/rip)` for exact offset.
- Format strings: try `%p %p %p` or `%7$s`-style probes; `fmtstr` module in pwntools (`pwnlib.fmtstr.fmtstr_payload`).
- Heap: `malloc/free` pattern review in disassembly; UAF/double-free/overflow; tcache/fastbin poisoning.

## Exploitation primitives

- **ret2win**: rdi/rsi/rdx pop gadgets → call target function.
- **ret2libc**: leak libc (puts@plt → puts@gpt), compute base, system + "/bin/sh". Use ROPgadget / `ropper --file <bin> --search "pop rdi"`.
- **ret2csu / BROP** when gadgets are scarce.
- **Stack canary leak** via format string or overflow that spans into adjacent bytes.
- **one_gadget** against the target libc for one-shot exec when constraints allow.
- **GOT overwrite / partial overwrite** when can't kill ASLR; low-byte partial overwrite often enough given PIE page alignment.
- **Shellcode** only when NX is off; use `pwn asm` (pwntools).

## Toolkit (already in image)

- pwntools: `from pwn import *`; `p = remote(host, port)` / `process('./challenge')`; `p.sendlineafter(b'> ', payload)`.
- **Interpreter**: `/app/.venv/bin/python3` is the image's CTF Python (pwntools, pycryptodome, sympy, z3, checksec.py). Always invoke it by absolute path: bare `python3` is the system python with none of these installed.
- GDB with gef/pwndbg (already): `gdb ./challenge`, `b main`, `cyclic -l <val>` to find offsets, `vmmap`, `telescope`.
- ROPgadget, ropper, one_gadget, pwninit, patchelf.
- Decompilers: `r2 -A ./challenge` / `rabin2 -zI`; Ghidra-headless if baked in.

## Patterns

- Write the exploit as a script in /workspace/solve; **parameterize host/port** so the same file runs locally and remotely.
- Pass `-s` to slow down on race-prone paths; `p.clean()` before precise reads.
- Stabilize against ASLR: brute-force low-entropy bytes in a loop with `while True: try: ... p.close()`.
- Verify the flag is extracted by the *script itself* (print it), not just visually.

## Deep dives (load on demand)

`pwn-basics`, `pwn-format-string`, `pwn-rop`, `pwn-rop-advanced` (SROP/pivots), `pwn-heap`, `heap-advanced` (modern glibc), `pwn-sandbox` (jail/VM escapes), `pwn-kernel`, `pwn-kernel-bypass`, `pwn-kernel-techniques`, `pwn-advanced-exploits`, `pwn-advanced-exploits-2`.

## Flag capture

Read flag from the remote: `p.sendline(b'cat flag*')` (or the challenge-specific path), `p.recvregex(rb'(FlagY\{[^}]*\}|HTB\{[^}]*\})')`. Verify the match against the platform format; submit via the platform tool, not curl.
