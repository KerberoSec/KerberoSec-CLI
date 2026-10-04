# easy-dsa

| Field | Details |
|-------|---------|
| **Challenge** | easy-dsa |
| **CTF** | GPN CTF 2024 |
| **Category** | Crypto |
| **Flag** | `GPNCTF{MaYbe WE 5hOULd H4Ve hIR3D A pr0FesS1onal?}` |

---

## Overview

The server signs recipes using ECDSA over P-521. The goal is to submit a valid signature on a message the server never signed.

---

## Vulnerability

The nonce `k` is derived from a SHA-256 hash:

```python
k = sha256(key_id + msg_id) % (n-1) + 1
```

SHA-256 produces 256 bits, but P-521's order `n ≈ 2^521`. This means `k < 2^256` always: the top 265 bits of `k` are always zero. This is a **biased nonce**, which enables a Hidden Number Problem (HNP) lattice attack to recover the private key `d`.

---

## Attack: Hidden Number Problem (HNP)

From each signature: `k = a + t·d (mod n)`, with `k < B = 2^256`.

Fix signature 0 as a reference and express all others via `k0`:

```
f_i = t_i / t_0   mod n
g_i = a_i - f_i * a_0   mod n
k_i = f_i*k_0 + g_i - c_i*n     (all k_i < B)
```

Build an `(m+1) × (m+1)` lattice with target vector:

```
v = (k_1, k_2, ..., k_{m-1}, k_0, B)
```

The norm `‖v‖ ≈ √m · 2^256 ≈ 2^258` is far below the Gaussian heuristic for the lattice minimum `≈ 2^449`. LLL finds it in under 1 second with just 12 signatures.

Recover `d`:

```
d = (k0 − a0) · t0^{-1}   mod n
```

---

## Exploit Steps

1. Connect and collect 12 signatures on distinct messages
2. Build the lattice and run LLL (fpylll), read `k0` from the short vector
3. Compute `d`, verify `d·G == public key`
4. Sign any new message with `d`, submit → flag

---

## Fix

Use RFC 6979: HMAC-DRBG generating a full 521-bit nonce. Or use a standard library (e.g. pycryptodome's built-in ECDSA).

---

## Flag

```
GPNCTF{MaYbe WE 5hOULd H4Ve hIR3D A pr0FesS1onal?}
```
