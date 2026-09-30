# Sultan

**Category:** Crypto  ·  **Flag:** `ASIS{cORrup7_qu0ruM_rEu5e_!n_l4sT_ASIS_CTF!!}`

## Challenge Description

> An encrypted archive from the sultan's laboratory has resurfaced. It is said to contain
> a message meant for the court alone.

We get the source of a custom cryptosystem plus a web service. The service mints a random
28-32 character secret for our session, encrypts it, and serves a `secret.enc`. If we
decrypt the secret and submit it before the 20-minute session expires, we get the flag.
Challenge source is in [`src/`](src/) (`app.py`,
`crypto_engine.py`); a captured sample is [`secret.enc`](secret.enc).

## Initial Analysis

Parameters (`crypto_engine.py`):

```python
q = 8380417
n = 64
m = 70
b = 65000
secret_bound = 3
```

The encryption key is a 64-coefficient vector `s` with every coefficient in
`{-3,…,3}`. The stream key and a keyed BLAKE2s tag are derived from it:

```python
w = struct.pack("<" + "b"*64, *s)
k = SHAKE256(b"SULTAN/key" + w, 32)
pad = SHAKE256(b"SULTAN/stream" + k + nonce, len(secret))
ciphertext = secret XOR pad
```

The BLAKE2s tag lets us confirm with certainty when the correct `s` is found. The only
hard part is recovering the 64 tiny coefficients.

Each `secret.enc` contains **70 transcripts** built from the same key. Note: hitting
`/download` again mints a fresh temporary key `s` (the plaintext secret stays the same),
so transcripts from different files must not be mixed: solve one file on its own. Every
file already carries all 70 transcripts you need. The download and the final answer must
share the same `sultan_session` cookie.

## Vulnerability / Core Concept

**The file leaks 70 approximate linear equations about a very small secret key.**

For each transcript the server draws a random vector `u`, derives public vectors `c`, `r`
from a seed, and publishes `v = u + c*s` (negacyclic mult, mod `q`) plus a *rounded* inner
product:

```python
h = (<r, u> mod q) // 65000
```

We only get `h`, not the exact inner product, but `h` pins `<r,u>` to a 65000-wide
interval:

```
65000·h  <=  (<r,u> mod q)  <  65000·(h+1)
```

Using `u = v - c*s` and taking the inner product with `r`:

```
<r,u> = <r,v> - <r,c*s>   (mod q)
```

Define `B = <r,v> mod q` and let `A` be the 64-length row giving `<r,c*s> = A·s` (both `r`
and `c` are public, so `A` is computable: the `coefficient_row` helper implements the
negacyclic coefficient extraction). Each transcript is then an approximate equation:

```
65000·h  <=  (B - A·s mod q)  <  65000·(h+1)
```

70 differently-angled such constraints on a 64-value key whose coordinates are all tiny
leave essentially one solution: a textbook **CVP / lattice** situation.

## Exploitation

The solver is `solve.py`. It parses the 70 transcripts, builds the `70×64`
matrix `A` and vectors `B`, `leak`, then solves via a **Kannan embedding** lattice:

```
[ W·I_64      A^T       0 ]
[   0       q·I_70      0 ]
[   0          y        M ]
```

with `W = 9000` scaling the small secret to the interval-error size, `M = 20000` the
embedding constant, and centered targets `y_i = (B_i - 65000·h_i - 32500) mod q`. Dimension
is `64 + 70 + 1 = 135`. A short combination row equals `(W·s, A·s + q·z - y, -M)`:

```python
LLL.reduction(L, delta=0.99, eta=0.501)
BKZ.reduction(L, BKZ.Param(block_size=18, max_loops=3))
BKZ.reduction(L, BKZ.Param(block_size=24, max_loops=3))
```

Candidate rows are filtered by three checks that make false positives impossible:

1. all 64 coefficients in `[-3, 3]`;
2. all 70 transcript inequalities satisfied;
3. the derived key reproduces the file's exact BLAKE2s tag.

The solver also carries a Z3 integer-programming fallback, but the lattice has a large
uniqueness gap and solves almost immediately. Recovered key and secret:

```text
[*] Parsed 70 transcripts, ciphertext length=30
[*] LLL: dimension=135, weight=9000, embed=20000
[+] secret = 91k1CcxnIb5O5bnYafYHG1lGTwvekV
```

Decryption just repeats the KDF and XORs:

```python
w = struct.pack("<" + "b"*64, *recovered_s)
k = shake_256(b"SULTAN/key" + w).digest(32)
pad = shake_256(b"SULTAN/stream" + k + nonce).digest(len(ct))
plaintext = bytes(a ^ b for a, b in zip(ct, pad))
```

Submitting the plaintext with the same session cookie returns the flag:

```bash
curl -sS -b cookies.txt -H 'Content-Type: application/json' \
    --data '{"guess":"91k1CcxnIb5O5bnYafYHG1lGTwvekV"}' "$URL/api/verify"
# {"success": true, "flag": "ASIS{cORrup7_qu0ruM_rEu5e_!n_l4sT_ASIS_CTF!!}"}
```

Usage: `python3 solve.py secret.enc`.

## Flag

`ASIS{cORrup7_qu0ruM_rEu5e_!n_l4sT_ASIS_CTF!!}`

## Key Takeaways

- Rounding a secret-dependent value does not make it safe to publish: each transcript
  only reveals a coarse interval, but 70 intervals over one tiny key are deadly.
- LLL/BKZ excel at combining many pieces of partial linear information (here via a Kannan
  embedding CVP).
- The very smallness that made `s` look "secure" is exactly what makes the target lattice
  vector short and easy to recognize. Always validate a lattice candidate against an
  independent check (here the BLAKE2s tag).
