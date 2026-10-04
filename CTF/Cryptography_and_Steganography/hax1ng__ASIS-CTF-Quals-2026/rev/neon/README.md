# NEON RE:GENESIS

**Category:** Reversing  ·  **Difficulty:** Very Hard  ·  **Flag:** `ASIS{3v3ryth1ng_th4t_h4s_4_b3g1nn1ng_h4s_4n_3nd}`

## Challenge Description

A `.txz` archive containing a single 14 MB AArch64 ELF, `NEON_RE-GENESIS_07` (provided binary,
not included due to size). It is a self-extracting 7-room puzzle game whose flag is locked behind
a custom cartridge VM and three nested AES-256-GCM layers.

```text
$ file NEON_RE-GENESIS_07
ELF 64-bit LSB executable, ARM aarch64, statically linked, stripped   (14,637,878 bytes)
```

## Initial Analysis

`readelf` shows the ELF ends around 662 KB, so most of the 14 MB is appended data. Near EOF sits
the magic trailer `TLCPKG14`: a custom package format. Under `qemu-aarch64 -strace` the binary
reads `/proc/self/exe`, parses the appended metadata, and extracts
`/tmp/last-cartridge-XXXXXX/{app,lib}`: an inner PIE (`last-cartridge.inner`) plus bundled AArch64
SDL2 / Vulkan / OpenSSL libraries. Catch those files before the temp dir is cleaned.

The inner binary is a stripped AArch64 PIE. SDL2 = window/input, Vulkan = GPU compute, OpenSSL =
real HKDF + AES-GCM crypto. Running it (via Xvfb + a bundled dynamic linker) gives a 7-room game;
rooms 1-6 teach cartridge-VM concepts and are solvable by following on-screen instructions. Room 7,
the **Parallax Vault**, is the target.

Ghidra headless maps the key functions:

| Address | Role |
|---|---|
| `0x10a5c` | full replay verifier (gatekeeper) |
| `0x127c0` | 64-bit action hash (12-round ARX) |
| `0x13344` | cartridge VM interpreter |
| `0x15378` | final HKDF + AES-256-GCM flag decryptor |
| `0x18f70` | Vulkan state transform (must be patched) |
| `0x1a558` | TLC2ENC payload decryptor |

The embedded cartridge (`TLCT` magic, 211 eight-byte instructions) is PC-XOR-masked, rotated by
`(pc-0x34)&63`, and byte-permuted through one of five tables. Rebuilding the decoder in Python
(`disasm_cart.py`) yields clean 27-opcode semantics over wrapping 24-bit words.

## Vulnerability / Core Concept

The vault authenticates a **32-move replay** through three nested crypto layers, but each layer's
input is **mathematically invertible**: the challenge is recognizing bijections and running them
backwards, not brute force.

- **Layer 1: first-half ARX hash.** The verifier packs the first 16 action codes as 16 nibbles
  into a 64-bit integer and runs a 12-round ARX (Feistel) hash (`0x127c0`); the result must equal
  `0xcf4fb92c6bec7f69`. An ARX hash over fixed-width input is a bijection: invert each round in
  reverse and unpack the nibbles to get the unique 16 moves.
- **Layer 2: encrypted payload + second-half hash.** With the first 16 moves pinned (and the
  midpoint position checked at `(7,4)`), an HKDF-SHA256 key derived from the replay state decrypts
  a 9936-byte TLC2ENC payload. The GCM tag verifies the key *offline*. That payload holds a second
  hash check (10-round SplitMix64/xxHash style) for the last 16 moves against `0xe7c84988c105e0b8`
  with key `0xd3fb01cc1e96c089`. Same inversion → the second 16 moves.
- **Layer 3: final flag decryption.** A third HKDF (`"TLCKDF2"` + serialized replay + FNV over VM
  memory + a CPU state transform + verifier token) unlocks a 48-byte AES-256-GCM ciphertext holding
  the flag. This layer cannot be bypassed: the GCM tag binds the flag to the correct replay/state.

**The Vulkan problem:** the state transform (`0x18f70`) calls Vulkan compute, which has no AArch64
driver under qemu-user. Patch it to tail-call the CPU reference (`0x118ae8`), which was designed to
produce identical results:

```
; patched: mov w0, #1 ; add x8, x8, #4 ; b FUN_00118ae8
```

## Exploitation

- `invert_hash.py`: inverts the 12-round first-half ARX hash to recover the first 16 actions:
  `[4,8,5,1,2,9,7,4,4,2,10,4,5,2,6,4]`.
- `solve.py`: computes the TLC2ENC HKDF key entirely offline from the pinned first-16 replay and
  binary constants, then `decrypt_and_verify` confirms the GCM tag (proof the moves are correct
  before touching the live game). Reads the extracted `inner` binary.
- `emu.py`: Unicorn-emulates the decrypted payload to expose the second-half hash structure, which
  is then inverted to `[2,3,1,4,9,6,10,5,4,2,3,4,5,8,5,11]`.
- `gen_blob.py`: builds the 88-byte `TLRP` replay blob (32 action records + one rollback schedule
  entry + CRC32) → `blob2.bin`.
- `harness2.c` + `inner.cpu`: drives the real game logic without SDL/Vulkan by `dlopen`-ing the
  stripped PIE (after clearing `DF_1_PIE` so glibc allows it), resolving the load base via
  `dlinfo(RTLD_DI_LINKMAP)`, calling the internal constructor/room-loader/action-handler by offset,
  forging room digests + completion flags, and feeding the 32 recovered actions. `inner.cpu` is the
  inner binary with the Vulkan-path patch applied.

```bash
$ aarch64-linux-gnu-gcc -o harness2 harness2.c -ldl
$ qemu-aarch64 -L <extracted-lib-dir> ./harness2 inner.cpu blob2.bin
...
done. auth@0x14b5=01
FLAG: ASIS{3v3ryth1ng_th4t_h4s_4_b3g1nn1ng_h4s_4n_3nd}
```

The full 32-move solution (visible order):
`D,1,X,W,S,2,R,D,D,S,3,D,X,S,SPACE,D, S,A,W,D,2,SPACE,3,X,D,S,A,D,X,1,X,E`. The 7th move (rewind)
replays moves 1-6 in VM order `[4,5,6,1,2,3]`, which the midpoint constraint accounts for.

## Flag

`ASIS{3v3ryth1ng_th4t_h4s_4_b3g1nn1ng_h4s_4n_3nd}`

## Key Takeaways

- **Invert bijective hash checks.** When a verifier packs fixed-width input and compares a hash to a
  constant, an invertible hash (ARX, SplitMix64, FNV/Murmur/xxHash) means no search: invert each
  round in reverse.
- **`dlopen` internal game functions** instead of automating the GUI or writing a full emulator:
  clear `DF_1_PIE`, get the base via `dlinfo`, call by offset, and forge game state to skip tutorials.
  Mind the AArch64 struct-return ABI (large returns go via a hidden pointer in `x8`).
- **Nested GCM as an oracle, not an obstacle**: each tag verification confirmed a stage was correct
  *offline* before running anything.
- **Vulkan in qemu-user doesn't work**: find the CPU reference path and patch a jump to it.
- Dead ends: bypassing `EVP_DecryptFinal_ex` is pointless when the plaintext is itself encrypted;
  and printable map strings don't map directly to the VM's coordinate model.
