# Fractured Seal

| Field | Details |
|-------|---------|
| **Challenge** | Fractured Seal |
| **Platform** | Cyber Apocalypse CTF 2026: The Salt Crown |
| **Category** | Crypto |
| **Flag** | `HTB{r3c0v3r1ng_RSA_k3ys___l1k3___Me0w___me0o00o0o0w___Me0w}` |

---

## Overview

The challenge ships a standard RSA key generation/encryption script (`encrypt.py`,
2048-bit modulus, `e = 0x10001`), an encrypted flag (`flag.enc`), and an RSA
private key (`fractured_seal.pem`) that has been redacted: most of its base64
body is replaced with `*` characters, and a chunk near the middle is further
obscured under a decorative ASCII cat pasted into the PEM text.

The path to the flag:

1. Parse the PEM's base64 character-by-character to determine exactly which
   bits of the DER-encoded key are still known.
2. Recover the modulus `n` almost completely (only its last 2 bits are
   unknown: 4 candidates).
3. Recover the high-order 588 bits of the prime `p` (1024-bit prime, so 436
   low bits are unknown).
4. Since 436 bits is comfortably under `n^(1/4)` (~512 bits), apply
   Coppersmith's "factoring with known high bits" attack to recover the
   missing low bits of `p` via lattice reduction.
5. Factor `n`, derive `d`, and decrypt the flag.

---

## Recovering known bits from the redacted PEM

The PEM is otherwise well-formed: every line is exactly 64 base64 characters
(the PEM wrap width), with unknown positions replaced by `*`, except for four
lines where a literal ASCII-art cat has been pasted over the redaction,
clobbering the line length and, more importantly, occasionally reproducing
real base64 alphabet characters (`l`, `f`, ...) that are *not* actually part
of the key data. Those four lines have to be treated as **fully unknown**,
rather than trusting stray characters that happen to look like valid base64.

```python
b64alpha = set("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=")

seq = []
for line in b64lines:
    if any(ord(c) > 127 for c in line):        # the ASCII-cat lines
        row = ['?'] * 64
    else:
        row = [c if c in b64alpha else '?' for c in line]
        row += ['?'] * (64 - len(row))
    seq.extend(row)
```

Because the PEM wrap width (64 chars) is a multiple of 4, every base64 quartet
(3 bytes) starts and ends within a single line: no partially-known quartets
span line boundaries, which keeps the byte-alignment simple. Any quartet with
all 4 characters known decodes to 3 fully-known bytes; quartets with some `?`
are unknown (except for the ends of a run, where 1-2 known leading characters
still pin down the top few *bits* of the next byte: useful for squeezing out
the last few known bits of a field).

Decoding the maximal known runs gives:

```
30 82 04a3                     SEQUENCE, len 0x4a3
  02 01 00                     INTEGER version = 0
  02 82 0101 00 <256 bytes>    INTEGER n         <- known except last byte
  02 03 01 00 01               INTEGER e = 65537 (unknown from PEM, but known from encrypt.py)
  ...                          INTEGER d          (fully unredacted)
  02 81 81 00 <128 bytes>      INTEGER p          <- known top 588 bits only
  02 81 81 ...                 INTEGER q          (fully unredacted)
  ...
```

- **n**: the SEQUENCE/version/n header and 255 of the 256 modulus bytes decode
  cleanly. The trailing partial base64 quartet resolves the top 6 bits of the
  final byte, leaving only the **last 2 bits of n unknown**: 4 candidates.
- **p**: after `d`, the `p` INTEGER's tag/length/sign bytes and the next 73
  content bytes decode cleanly, and a trailing partial quartet resolves 4 more
  bits: **588 of 1024 bits of p known** (the top ones), **436 low bits
  unknown**.

```python
n_base = <known bits of n, low 2 bits forced to 0>   # true n = n_base + delta, delta in [0,4)
p_known_value = <known top 588 bits of p, shifted up by 436>
X = 2**436                                            # bound on the unknown part of p
```

## Coppersmith: factoring with known high bits

`p = p_known_value + x` for some unknown `0 <= x < 2^436`. Since
`436 < n^{1/4}` bits (2048/4 = 512), Coppersmith's theorem guarantees `x` is
recoverable in polynomial time via lattice reduction on the polynomial
`f(x) = p_known_value + x mod n`.

An initial hand-rolled implementation (`fpylll` for LLL reduction + `mpmath`
for numeric root extraction of the resulting polynomial) technically produced
a correctly-reduced lattice, but floating-point root-finding on a
high-degree polynomial with astronomically large coefficients (tens of
thousands of decimal digits) failed to converge at practical precision. The
fix was to stop reinventing Sage's wheel and just use it: SageMath ships a
battle-tested `small_roots()` implementation for exactly this problem that
does exact/rational lattice arithmetic internally and is far more robust than
a bespoke floating-point root-finder:

```python
for delta in range(4):
    N = n_base + delta
    R.<x> = PolynomialRing(Zmod(N))
    f = (p_known_value + x).monic()
    roots = f.small_roots(X=2**436, beta=0.5)
    for r in roots:
        p_cand = p_known_value + int(r)
        if N % p_cand == 0:
            print("found p =", p_cand)
```

This found the correct root on the second candidate for `n`'s missing 2 bits
(`delta = 1`), in about 16 seconds:

```
trying delta= 1 N bitlen 2048
  beta 0.5 roots [1554671357...] time 1.15
FOUND delta= 1
p= 135314408378842790751605878050931209066067635249717498350882274491410611188834198512433542860977980915267615830180088553515126808474341043736459805810824761780913391116795622398843468715298669440308270490800437972694168370812052926427757058006436117836843232703533488083597801200757836873180405061962240493471
```

## Decrypting the flag

```python
from Crypto.Util.number import long_to_bytes, bytes_to_long, inverse

q = N // p
assert p * q == N
d = inverse(0x10001, (p - 1) * (q - 1))
m = pow(bytes_to_long(open('flag.enc', 'rb').read()), d, N)
print(long_to_bytes(m))
```

```
HTB{r3c0v3r1ng_RSA_k3ys___l1k3___Me0w___me0o00o0o0w___Me0w}
```

---

*Written by [e1](mailto:e0sec@proton.me).*
