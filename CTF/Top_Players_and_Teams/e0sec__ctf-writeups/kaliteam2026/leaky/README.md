# Leaky: Kali Team CTF 26 writeup

**Category:** PWN
**Points:** 100
**Author:** JO0031
**Flag:** `KaliTeam{2d62adb5-6374-436b-a183-2a521b309752}` (per-instance, UUID-suffixed)

## Challenge

A single non-PIE x86-64 binary (`leaky`), bundled with its own `libc.so.6`
and `ld-linux-x86-64.so.2` (loaded via `RUNPATH='./'`), served over `nc`.
Connecting prints:

```
Welcome! Enter input:
```

`checksec` on the binary:

```
RELRO:      Full RELRO
Stack:      No canary found
NX:         NX enabled
PIE:        No PIE (0x400000)
SHSTK:      Enabled
IBT:        Enabled
```

## Reversing

`main()` just calls `challenge()`. Disassembling `challenge()`
(`0x4011b3`, see [`dis.txt`](dis.txt)):

```c
void challenge(void) {
    char buf[16];                 // buf @ rbp-0x10
    setvbuf(stdout, NULL, _IONBF, 0);
    setvbuf(stdin,  NULL, _IONBF, 0);
    puts("Welcome! Enter input:");
    read(0, buf, 0x60);           // reads up to 96 bytes into a 16-byte buffer
    printf(buf);                  // <-- buf used directly as the format string
}                                  // leave; ret  -- no canary
```

Two bugs stacked on top of each other:

1. **Format-string bug**: `printf(buf)` runs on raw attacker input, before
   the function returns.
2. **Stack buffer overflow**: `read()` accepts up to 96 bytes into a
   16-byte buffer with no stack canary. Offset from the start of `buf` to
   the saved return address is `0x18` (16-byte buffer + 8-byte saved RBP).

There's also a curiosity sitting right next to `challenge()`:

```c
// 0x401196 <do_syscall>
long do_syscall(long rdi, long rsi, long rdx, long rcx) {
    // rax (syscall number) is *not* set here -- caller must have it
    // pre-loaded, since `call` doesn't touch rax on entry
    return syscall(rdi, rsi, rdx, /* r10 <- */ rcx);
}
```

This is clearly placed there as a hint/gadget for a `ret2syscall` path, but
`leaky` itself turned out to have **no usable register-loading gadgets**
(`ROPgadget` on the binary found no `pop rdi`/`pop rsi`/`pop rdx`/`pop rax`
anywhere), so exploitation had to fall back to the bundled `libc.so.6`
instead, via classic `ret2libc`.

## The core problem: leaking with only one shot

`challenge()` calls `read()` **exactly once** per connection, then
`printf()`, then returns. That's a real constraint: a libc address needs to
be leaked (ASLR is on), but the leaked value has to be known *before* the
overflow bytes that use it can be constructed, and there's no second
`read()` to deliver a follow-up payload… or so it seems.

### The leak: RCX after a raw `syscall`

glibc's `read()` wrapper is a thin syscall shim:

```asm
__read:
    endbr64
    mov  eax, fs:0x18      ; cancellation-type check
    test eax, eax
    jne  114830
    syscall                 ; <-- clobbers RCX (= return addr) and R11 (= flags)
    cmp  rax, 0xfffffffffffff000
    ja   ...
    ret
```

The `syscall` instruction itself sets **RCX = the return address right
after `syscall`** (mandated by the instruction: it's how `sysret` gets
back). That address (`0x114822` in the bundled `libc.so.6`, confirmed by
disassembling `read()` directly) is a **fixed, load-independent offset**
into libc. Since `challenge()`'s only call between `read()` and `printf()`
is `printf()` itself, and `printf`'s variadic args pull straight from
registers (`RSI, RDX, RCX, R8, R9`, in that order) before falling through
to the stack, `%3$p` reads RCX directly: a load-independent libc leak, no
GOT/format-string-write juggling required.

Verified by sending `%1$p|%2$p|...|%8$p` and reconnecting several times:
the low 12 bits of `%3$p`'s value (`...822`) and `%5$p`'s value (`...040`)
stayed **identical across every connection** while the high bits moved: exactly the ASLR signature of a fixed in-library offset.

### Getting a second shot: loop back into `challenge()`

Since the binary is non-PIE, `challenge()`'s own entry point (`0x4011b3`)
is a **static address that needs no leak**. So instead of pointing the
first overflow's return address at a libc gadget, point it back at
`challenge()` itself. That re-enters the function, which does *another*
`read()`: now on the same TCP connection, and now that the leak from the
first invocation has already come back over the wire.

Two-stage plan, one connection:

- **Stage 1**: `"%3$p"` + padding to offset `0x18` + return address =
  `challenge()`'s entry. Response: the leaked RCX value, then a second
  `Welcome! Enter input:` prompt (proof the loop-back worked).
- **Stage 2**: now knowing the real libc base, send the actual ROP chain:
  `pop rdi ; ret` → `"/bin/sh"` → `system()`.

### The gotcha: `ret`-entry misaligns the second frame

The first version of stage 2 kept crashing the connection: no output,
just EOF: regardless of which gadgets it targeted. Bisecting down:

- Looping back to `challenge()` a **second** time (identical to stage 1)
  also crashed.
- Even sending a completely harmless `"hi\n"` as stage 2 (touching nothing
  past the legitimate 16-byte buffer) crashed.
- But the *first* loop-back (stage 1) worked fine, and `puts()` inside the
  re-entered `challenge()` printed the second prompt correctly.

The difference: entering a function via `ret` (a bare jump) instead of via
`call` doesn't push a return address, so it leaves RSP **8 bytes off** from
the alignment the function's own prologue assumes. `challenge()`'s own
`setvbuf`/`puts`/`read` tolerated the resulting misalignment in its
*internal* calls during the first loop-back, but `printf()`'s internal
SIMD-optimized codepath does not, and silently faults.

Fix: insert one extra bare `ret` gadget: from `leaky` itself
(`0x40101a`, no leak needed): between the padding and the jump to
`challenge()`, to reabsorb that 8-byte drift before the loop-back:

```
stage1 = "%3$p" + pad-to-0x18 + ret_gadget(leaky) + challenge_entry
```

With that, both the second `read()`/`printf()` and the final `system()`
call go through cleanly.

## Final exploit

```python
stage1 = b"%3$p" + b"A"*(0x18-4) + p64(BIN_RET) + p64(CHALLENGE_ENTRY)
# -> leak RCX, compute libc_base = leaked_rcx - 0x114822

stage2 = b"A"*0x18 + p64(pop_rdi) + p64(binsh) + p64(ret) + p64(system)
# ret gadget included again for 16-byte alignment into system()
```

```
$ python3 exploit.py 10071
[*] stage1 response: b'0x7ad79fe2e822AAAA...Welcome! Enter input:\n'
[*] libc base  : 0x7ad79fd1a000
---- OUTPUT ----
uid=1000(ctf) gid=1000(ctf) groups=1000(ctf)
KaliTeam{2d62adb5-6374-436b-a183-2a521b309752}
```

Re-run cleanly against two more live instances (ports `10047`, `10017`),
each returning its own unique flag: confirming the exploit is
deterministic and instance-independent (up to the format-string leak,
which is recomputed fresh every connection).

## Files

- `exploit.py`: full two-stage remote exploit.
- [`leaky`](leaky): the challenge binary.
- [`dis.txt`](dis.txt): full `objdump -d` disassembly.

## Lessons learned

- **A single `read()` per connection doesn't mean a single shot.** If the
  binary is non-PIE, its own code is a leak-free trampoline: overflow the
  return address back into the vulnerable function's own entry point to
  get a second read on the same connection, using only static addresses.
- **`syscall` clobbers RCX/R11 by ISA contract, not convention.** Any
  glibc wrapper that's a thin direct-syscall shim (`read`, `write`,
  `close`, ...) leaves a fixed, load-independent libc code address sitting
  in RCX right after it returns: a free, ASLR-proof-ish leak if a
  format-string bug (or any register-reading primitive) fires immediately
  afterward, no GOT or `%n` write needed.
- **`ret`-based control-flow hijacks don't preserve call-site stack
  alignment.** Entering a function via a bare `ret` instead of `call`
  leaves RSP 8 bytes off from what the function's own prologue and
  *internal* calls expect. Simple functions (`puts` on a short string)
  often tolerate it silently; SIMD-heavy ones (`printf`'s internal
  dispatch) fault with no diagnostic beyond a dead connection. A single
  extra bare `ret` absorbs the drift and costs nothing since `leaky`
  ships its own.
- **When a chain crashes with zero output, bisect ruthlessly toward the
  smallest possible next step** (an empty/no-op stage 2, calling `puts`
  instead of `system`) rather than guessing at the final payload: it
  isolated the alignment bug in three probes instead of guessing blindly
  at gadget offsets.

---
*Written with substantial AI assistance in analysis and writing.*
