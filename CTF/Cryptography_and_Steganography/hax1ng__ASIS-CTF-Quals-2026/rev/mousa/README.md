# Mousa

**Category:** Reversing  ·  **Flag:** `ASIS{tr!An9ulat3D_m1tM______b1gG3r_N0nLin3aR_spac3S!!!?}`

## Challenge Description

Two files: `mousa.elf` (a stripped, statically-linked 64-bit Go executable, ~18 MB: provided
binary, not included due to size) and `flag.enc` (88 bytes). The binary looks enormous and scary
because it embeds a 16 MB lookup table, but most of it is noise. The real weakness is in the
custom MAC over `flag.enc`.

## Initial Analysis

Running `mousa.elf` fails immediately: the Go function metadata has been wiped:

```text
runtime: pcHeader: magic= 0 ...
fatal error: invalid function symbol table
```

Static analysis still works. The challenge code sits in a small block (~`0x4a41a0`: `0x4a5a90`).
The 16 MB table `T` begins at file offset `0x1a5720`, and a 93-byte encrypted config sits at
`0x1a0c40`. The program hashes the first 128 bytes of `T` to pick a base offset, then reveals the
config with a table lookup and XOR mask:

```python
h = 0x6d2b79f5
for i in range(128):
    h = (rol32(h ^ (T[i] + 157*i), 5) + 0x7f4a7c15) & 0xffffffff
base = (h & 0xfffff) << 4          # 0xb17b0 for this binary
A = bytes(config[i] ^ T[(base + 31*i + 0x7000) & 0xffffff] ^ ((75*i+41) & 0xff)
          for i in range(93))
```

The last 32 bytes of `A` are the expected **SHA-256 of the flag**: a perfect oracle to pick the
real plaintext later.

`flag.enc` splits as `16-byte nonce || 56-byte ciphertext || 16-byte tag` (56 = flag length).

## Vulnerability / Core Concept

The binary is full of distractions (two state generators, "sign" checks, two 40-bit fingerprints
with a conspicuous collision, a permutation, a KDF, an AES-like cipher, a stream cipher, a custom
MAC). The flag-relevant weakness is the **custom MAC**:

```python
state = [0x243f6a88, 0x85a308d3, 0x13198a2e, 0x03707344]
for i, b in enumerate(key):        state[i&3] = rol32(state[i&3] ^ (b+23*i+0x31), 7)
for i, b in enumerate(nonce):      state[i&3] ^= b << (8*(i&3))
for i, b in enumerate(ciphertext): state[i&3] = (rol32(state[i&3]+b+i+0x9e3779b9, 11)*0x85ebca6b) & 0xffffffff
tag = b''.join(w.to_bytes(4,'big') for w in state)
```

Two fatal flaws:

1. **Every operation is reversible**: rotation, XOR, addition, and multiplication by the odd
   constant `0x85ebca6b` (which has an inverse mod 2^32).
2. **The four state words never interact.** Key bytes `{0,4,8,12}` only touch word 0, `{1,5,9,13}`
   only word 1, etc. So instead of one 128-bit key we solve four independent 4-byte problems.

Starting from the known tag, we undo the ciphertext loop and XOR the nonce back out to learn each
word's value immediately after the key was processed. Recovering the four key bytes per lane is a
**meet-in-the-middle**: enumerate the first two bytes forward (2^16 states in a table) and the last
two backward from the target, then match. Each lane yields 8 candidate byte-groups, so `8^4 = 4096`
full keys. All reproduce the MAC (it has collisions), so decrypt with each and keep the one whose
SHA-256 matches the hidden hash: exactly one survives: `d495b4360e22497c8c78fedaa4a2f160`.

The encryption itself is a simple stream cipher (XOR of a mutating state), so decryption is the
same operation.

## Exploitation

`solve.py` is self-contained: it reveals the config (and target hash) from `mousa.elf`, inverts the
MAC with four meet-in-the-middle searches, and decrypts each candidate key until the SHA-256 matches.

```bash
$ python3 solve.py        # needs mousa.elf + flag.enc in the cwd
key : d495b4360e22497c8c78fedaa4a2f160
flag: ASIS{tr!An9ulat3D_m1tM______b1gG3r_N0nLin3aR_spac3S!!!?}
```

`SHA256(flag) = 858f16c66e12bd0e596aa59b47d8817dcb51f1dcc64843302fe16628d5767ac5` matches the value
hidden in the executable.

## Flag

`ASIS{tr!An9ulat3D_m1tM______b1gG3r_N0nLin3aR_spac3S!!!?}`

## Key Takeaways

- A giant binary with home-made AES, collisions, and broken Go metadata can be almost entirely
  noise: focus on how the ciphertext is *authenticated*.
- A MAC built from reversible ops with non-interacting lanes collapses a 128-bit problem into four
  small meet-in-the-middle searches.
- When a MAC has collisions, use an independent oracle (here, the embedded SHA-256) to pick the
  true key among many that all validate. The flag even jokes about it: `m1tM` and
  `b1gG3r_N0nLin3aR_spac3S`.
