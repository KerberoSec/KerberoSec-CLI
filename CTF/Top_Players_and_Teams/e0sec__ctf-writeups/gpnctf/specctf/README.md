# specCTF

| Field | Details |
|-------|---------|
| **Challenge** | specCTF |
| **CTF** | GPN CTF 2025 |
| **Category** | Reverse Engineering / Side-Channel |
| **Flag** | `GPNCTF{tHIs_mEaL_1s_SpecuLAtiV31y_DeLicIous!!!!}` |

---

## Overview

An ELF 64-bit binary (not stripped) that takes a flag guess as `argv[1]` (length must be divisible by 8), trains the branch predictor, and speculatively reads each 8-byte chunk: comparing via timing against a set of hash targets stored in the binary.

---

## Recon

Strings reveal: `specEnvTime`, `specte_byte`, `spec_func`, `TRAINING_LOOPS`, `sched_setaffinity`: together with the `Spectre` symbols, this is a **Spectre v1 side-channel** checker.

The `ENC` array at `0x70c0` holds 6 × `uint64` hash targets.

---

## Hash Function (`hashym` @ `0x1239`)

A bijective XOR-shift + multiply + XOR finalizer (standard Murmur/xxHash style):

```
x ^= x >> 33
x *= 0xF451AF975D152CAD
x ^= x >> 33
x ^= 0xC2CEAADE1A351C23
x ^= x >> 33
```

Being bijective, every step is **invertible**: no brute force needed.

---

## Solve (Static: No Execution Required)

1. Dump the 6 × `uint64` values from `.data` at offset `0x70c0`
2. Compute `MULT_INV = modinv(0xF451AF975D152CAD, 2^64)`
3. Invert each step: XOR-shift-33 is self-invertible (top 33 bits are preserved)
4. Decode each `inv_hashym(ENC[i])` as little-endian ASCII to recover 8-byte flag chunks
5. Concatenate chunks → flag

---

## Flag

```
GPNCTF{tHIs_mEaL_1s_SpecuLAtiV31y_DeLicIous!!!!}
```

---

## Decrypted Chunks

| ENC index | Raw value | Decoded |
|-----------|-----------|---------|
| ENC[0] | `0xee7590ece97175e5` | `GPNCTF{t` |
| ENC[1] | `0x47ba852c3a1e6bea` | `HIs_mEaL` |
| ENC[2] | `0x7aabc80b3a4a65f2` | `_1s_Spec` |
| ENC[3] | `0xcd9dbec610fa3ba1` | `uLAtiV31` |
| ENC[4] | `0xf5973f9a4f57f0ff` | `y_DeLicI` |
| ENC[5] | `0xae79dd584227081f` | `ous!!!!}` |
