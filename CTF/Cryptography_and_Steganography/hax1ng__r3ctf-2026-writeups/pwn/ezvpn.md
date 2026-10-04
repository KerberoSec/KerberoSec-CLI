# R3CTF 2026: ezvpn Writeup

Flag:

```text
r3ctf{ThIs_i5_A-E@2y_waY_T0-coNTRol-hE@p-0N-dOU6I3_THRead0}
```

## TL;DR

This challenge was a tiny fake SSL VPN server. At first it looked like the flag was hidden behind a special client string, but that path only gave a decoy flag.

The real bug was in the way the server parsed client info records. It checked that `key_len + value_len <= 0x100`, but then allocated the chunk using only the low byte of that sum. So if we used lengths that added up to exactly `0x100`, the server allocated a tiny chunk and then copied a huge amount of data into it.

That gave us a heap overflow. From there we poisoned tcache, overwrote the global `stdout` pointer with a fake `FILE` object, and used glibc FSOP to jump into `setcontext`. Finally, a small ROP chain opened `flag`, read it, and wrote it back to our VPN socket.

## Files

Important files from the attachment:

```text
attachment/eazyvpn
attachment/lib/libc.so.6
attachment/lib/libcrypto.so.3
attachment/lib/libssl.so.3
```

The binary was protected pretty heavily:

```text
PIE enabled
NX enabled
Full RELRO
Stack canary
SHSTK / IBT shown by checksec
```

So this was not a simple ret2win. We had to use the heap and libc internals.

## Understanding the protocol

When connecting over TLS, the server sends:

```text
CLIENTINFO:
```

Then the client sends a 4-byte big-endian length, followed by that many bytes of client info data.

The client info data is a list of tiny TLV-style records:

```text
[key_len:1][value_len:1][key bytes][value bytes]
```

So a normal record might look like:

```text
09 0a "FOR_AGENT" "R3CTF2026!"
```

There was also a special `FOR_AGENT` path. Sending:

```text
FOR_AGENT:R3CTF2026!
```

made the server leak a libc pointer and print:

```text
R3CTF{vPn_7uNne1_t0_sp3c14l_cl13nt}
```

But this was fake. The checker rejected it, even after lowercasing it.

## The leak

The `FOR_AGENT` path was still useful because it leaked `_IO_2_1_stderr_`, which is inside libc.

The relevant offset was:

```text
_IO_2_1_stderr_ = libc + 0x2134a0
```

So:

```python
libc_base = leaked_stderr - 0x2134a0
```

The trick was to keep this leak connection open. If we closed it, the heap layout changed. Keeping it stuck at the auth prompt made the second connection much more predictable.

## The bug

The vulnerable parser checked something like:

```c
if (key_len + value_len <= 0x100) {
    size = (uint8_t)(key_len + value_len);
    ptr = malloc(size ? size : 1);
    memcpy(ptr, key, key_len);
    ptr[key_len] = 0;
    memcpy(ptr + key_len + 1, value, value_len);
}
```

The important mistake is this cast:

```c
(uint8_t)(key_len + value_len)
```

If we choose:

```text
key_len   = 246
value_len = 10
sum       = 256 = 0x100
```

Then the check passes because `256 <= 256`.

But after casting to an 8-bit value:

```text
(uint8_t)0x100 = 0
```

So the server effectively does:

```c
malloc(1)
```

Then it copies about 257 bytes into that tiny allocation. That is the heap overflow.

## Turning the overflow into control

The target used modern glibc, so heap exploitation involved tcache safe-linking. The server kindly leaked the heap input buffer pointer before reading our client info, so we knew enough heap addresses to compute the protected tcache pointers.

The rough plan was:

1. Open the special `FOR_AGENT` connection.
2. Leak libc.
3. Keep that connection open.
4. Open a second connection.
5. Use the tiny-allocation overflow to corrupt a nearby free chunk.
6. Poison tcache so future allocations return controlled addresses.
7. Overwrite the libc global `stdout` pointer.
8. Point `stdout` at a fake `FILE` object inside our input buffer.

The important pointers we overwrote were the standard stream variables around:

```text
stderr/stdout/stdin pointer variables = libc + 0x213660
```

We kept `stderr` and `stdin` valid, but changed `stdout` to point to our fake `FILE` object.

## Why `stdout` matters

After parsing client info, the server asks for auth:

```text
AUTH:
```

If auth fails, it prints a message using `printf`.

Since `printf` writes to `stdout`, and we replaced `stdout`, glibc starts operating on our fake `FILE` structure. This is a classic FSOP technique.

FSOP means "File Stream Oriented Programming". In simple terms: glibc's `FILE` objects contain lots of pointers and function tables. If we can fake one well enough, glibc will call a function pointer we control.

## The fake FILE object

We used `_IO_wfile_jumps` because its wide-character path eventually calls through a pointer at:

```text
wide_vtable + 0x68
```

Instead of calling `system`, the final exploit used `setcontext`.

A first attempt with:

```text
system("sh<&6>&6")
```

worked locally for short commands, but it was not good enough for the real solve because accepted sockets were created with `SOCK_CLOEXEC`. That means file descriptors vanish across `execve`, so spawning `/bin/sh` lost the socket.

So the final exploit avoided `execve` completely. It stayed inside the current process and used syscalls/functions directly.

## setcontext pivot

The fake `FILE` triggered:

```text
setcontext(fake_file)
```

`setcontext` restores registers from memory. That let us set:

```text
rdi = pointer to "flag"
rsi = 0
rip = open
rsp = controlled ROP stack
```

So first it did:

```c
open("flag", 0)
```

Then the ROP chain did:

```c
read(flag_fd, buffer, 0x100)
write(socket_fd, buffer, 0x100)
```

This avoids shell spawning entirely, so `SOCK_CLOEXEC` no longer matters.

## Remote heap offset gotcha

The local and remote heap layouts were almost identical, but the remote input buffer was shifted by `0x10`.

Originally I used a fixed arena offset:

```python
P = arena + 0x14fe0
```

That worked locally, but failed remotely. The remote showed:

```text
B = arena + 0x1c290
P = arena + 0x14fd0
```

The stable relation was actually:

```python
P = B - 0x72c0
```

After changing the exploit to compute `P` relative to the leaked input buffer pointer, it worked on the new remote port.

## Final exploit command

The final script is `solve_real.py`.

Run it like this:

```bash
./solve_real.py challenge.ctf2026.r3kapig.com 32372 --attempts 1 --path flag
```

Output:

```text
[FLAG] r3ctf{ThIs_i5_A-E@2y_waY_T0-coNTRol-hE@p-0N-dOU6I3_THRead0}
```

## Final flag

```text
r3ctf{ThIs_i5_A-E@2y_waY_T0-coNTRol-hE@p-0N-dOU6I3_THRead0}
```

## Takeaways

- A length check is not enough if the allocation size uses a smaller integer type.
- Decoy flags are rude, but leaks hidden near them are useful.
- Keeping a connection open can stabilize heap layout in threaded servers.
- `system("sh")` is not always the answer, especially when sockets are `CLOEXEC`.
- FSOP is scary-looking, but the idea is simple: fake a libc `FILE` object until libc calls a pointer for you.
