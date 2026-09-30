# Arena Snapshots

**Category:** Pwn  ·  **Flag:** `ASIS{SN4PSH07_SL33P_R0LB4CK_R3P347_b027d27dc0834f9f}`

## Challenge Description

> A very normal arena manager where nothing bad can happen after you press "rollback."

A stripped ELF64 PIE binary (full RELRO, NX, stack canaries, no libc heap). It is
a small TCP server: it reads the flag file into a `memfd` (anonymous in-memory
file), listens, forks a worker per client, and speaks a line-oriented protocol.
Connecting prints:

```
AS/1 release=ead6e9709404e1de7d170e4d chunk=144
```

`chunk=144` (`0x90`) is the payload size. Commands:

| command | effect |
|---|---|
| `BUF <hex>` | allocate a buffer, copy hex-decoded bytes into it |
| `VIEW <handle> <off> <len>` | hex-dump up to 32 bytes of a **buffer** |
| `PATCH <handle> <off> <hex>` | overwrite bytes in a **buffer** |
| `DROP <handle>` | free a slot |
| `JOB <path>` | allocate a job object with that path |
| `SNAP` | take a snapshot of the arena |
| `ROLLBACK` | restore the snapshot |
| `RUN <handle>` | execute a job |
| `QUIT` | disconnect |

## Initial Analysis

The "arena" is 24 numbered slots, each `0x98` bytes:

```
+0  used (1 if occupied)
+1  type (1 = buffer, 2 = job)
+4  generation (16-bit, bumped on every alloc/free)
+8  payload, 0x90 bytes
```

Handles are `(index, gen)` plus a per-session **epoch** (starts at 1, bumped on
`ROLLBACK`). A handle is not MAC'd: it is just XOR-packed:

```
packed = (epoch << 40) | (gen << 24) | idx
handle = packed XOR const      # BUF const 0xb6a77a8e77fb3a2c, JOB const 0xbea77a8e77fb3a2c
                               # decode XOR 0xf4a77a8e77fb3a2c
```

A **job** (at `slot+8`) carries a magic, a type dword (`0x415347dc` echo /
`0x4153b0d8` shell), a nonce, a 64-bit keyed hash (splitmix-style), and a 32-bit
FNV-1a MAC. `JOB <path>` only ever writes echo jobs and rejects any path with `/`
or `flag`. `RUN` on a shell job whose path is exactly `/bin/sh` dups the client
socket to stdio, `F_DUPFD`s the flag memfd to a random fd in `[64, 512)`, clears
`FD_CLOEXEC`, and `execl("/bin/sh", "sh", "-i", NULL)`. The intended win is
forging a valid shell job: which requires the 64-bit session secret that seeds
both the hash and the MAC (`getrandom()`'d, never printed).

## Vulnerability / Core Concept

**Rollback restores the metadata, not the payload.** `SNAP` copies the free
list, epoch, each slot's used/type/gen **and** its full `0x90` payload.
`ROLLBACK` restores the free list, used/type/gen, increments the epoch, clears
the snapshot flag, but **never copies the payloads back**. After rollback the
slot's *label* says "job, gen 195, occupied" while the *contents* are whatever
is there now.

Second gift: `DROP` does not wipe the payload, and an empty `BUF` copies zero
bytes. Reallocating the same slot as a buffer leaves the old job bytes in place,
now `VIEW`-able (`VIEW`/`PATCH` only operate on buffers). A job hash is an
equation in one unknown, so reading a real job leaks the secret.

## Exploitation

Full exploit in `exploit.py` (`HOST`/`PORT` redacted). The play is type
confusion across a snapshot:

1. **`JOB hello`** → a real echo job with a valid hash/MAC (idx 17, gen 195).
2. **`SNAP`**: metadata + payload saved (only metadata comes back).
3. **`DROP` + empty `BUF`** on the same slot: payload is still the job bytes.
4. **`VIEW` the buffer** (32 bytes at a time, `0x64` bytes total) to leak magic,
   type, nonce, **hash**, **MAC**, path.
5. **Invert the hash** to recover the secret. Splitmix64 is a bijection
   (`x ^ (x >> 33)` is self-inverse for 64-bit words; both odd multipliers have
   modular inverses mod `2^64`), so run the mixer backwards and XOR out the known
   fields:
   ```python
   FMIX_INV_C1 = pow(0xFF51AFD7ED558CCD, -1, 2**64)
   FMIX_INV_C2 = pow(0xC4CEB9FE1A85EC53, -1, 2**64)
   ```
   Recompute hash and MAC on the leaked bytes to confirm the key.
6. **`PATCH` a forged shell job** over the buffer: type dword `0x4153b0d8`, path
   `/bin/sh`, hash and MAC recomputed with the stolen secret. `PATCH` is allowed
   because the slot is currently a buffer.
7. **`ROLLBACK`**: type/gen jump back to job/195, payload stays forged, epoch
   becomes 2, all old handles die.
8. **Mint a fresh job handle** (epoch 2, gen 195, idx 17, XOR job const) and
   **`RUN`** it. The worker execs `sh -i` on the socket.
9. In the shell, the flag is the memfd: find it and read it:
   ```
   ls -l /proc/self/fd            # look for /memfd:as-flag (deleted)
   cat /proc/self/fd/<memfd>      # landed on fd 246 remotely
   ```

## Flag

`ASIS{SN4PSH07_SL33P_R0LB4CK_R3P347_b027d27dc0834f9f}`

## Key Takeaways

- Snapshots are a consistency problem: persisting an object's *type* but not its
  *body* invents "use-after-rollback": a job-shaped door on a buffer-shaped room.
- Bumping the epoch to "invalidate all handles" is useless when the handle
  encoding is a public XOR: you just recompute the packing. A keyed MAC on the
  handle would have stopped `RUN`.
- A keyed hash over an object you can read is an equation in one unknown; the
  crypto isn't broken, the read primitive is the bug.
