# crypto_ashen_field: Writeup

**Category:** Crypto (Multivariate / HFE-style scheme)
**Files provided:** `source.sage`, `output.txt`

## TL;DR

The challenge implements an HFE-like multivariate public-key encryption scheme over
`GF(2)`. The keygen builds a Boolean quotient ring (`H`) to enforce the field
equations `x_i^2 = x_i`, but then **never uses it**: the actual public key is
constructed in the unreduced polynomial ring instead. Because squaring an affine
GF(2) form produces no cross terms (`(Σ c_j x_j)^2 = Σ c_j x_j^2` in characteristic
2), the public key ends up being a sum of **single-variable power terms only**
(`x_i`, `x_i^2`, `x_i^4`): there is no genuine quadratic mixing between variables.

Since `0^2 = 0` and `1^2 = 1^4 = 1`, every term collapses back to its base variable
the moment the public key is evaluated on real bits. What looks like a degree-4
multivariate scheme is therefore **secretly an affine (linear + constant) map over
GF(2)** at evaluation time: trivially invertible with linear algebra.

```
HTB{e1th3r_gr0bn3r_0r_v4r13ty___1t_st1ll_w0rks!th4nks_f4l4y_f0r_y0ur_4tt4ck_0n_HFE}
```

---

## 1. Understanding the scheme

`source.sage` (annotated):

```python
def keygen(n):
    K = GF(q)                                   # q = 2
    R = PolynomialRing(K, [f"x{i}" for i in range(1, n+1)], n)
    J = ideal([x^q - x for x in R.gens()])       # field equations x_i^2 = x_i
    H = R.quotient_ring(J, _vars)                # <-- computed... and NEVER USED

    S_B = random_vector(K, n)
    T_B = random_vector(K, n)
    S_A, T_A = [nonsingular random matrices]

    Rv = S_A * vector(R, n, R.gens()) + S_B      # affine substitution (in R, not H!)

    g = irreducible_element(n)                   # degree-n irreducible poly over GF(2)
    Q = PRL.quotient_ring([g])                    # "big field" GF(2^n) representation
    F = PRL(Rv.list()[::-1])                     # vector -> field element encoding
    F = Q(F^(2*q) + F^q + 1)                     # HFE central map: F^4 + F^2 + 1

    PK = vector(R, n, F.list()[::-1])            # field element -> vector decoding
    PK = T_A * PK + T_B                          # affine output mixing
    return PK
```

This is the classic HFE (Hidden Field Equations) construction: represent the input
as an element of `GF(2^n)` via a polynomial basis, apply a low-degree secret
univariate map (`F^4 + F^2 + 1`), then convert back to a vector and hide everything
behind two secret affine transforms `S = (S_A, S_B)` and `T = (T_A, T_B)`.

The security of HFE relies on the fact that the Frobenius map `x -> x^2` is
GF(2)-linear **over the big field**, so `F(x)^2` and `F(x)^4` are linear
combinations of the *bit vector representation* of `x` when working in the proper
quotient ring. But that linearity only holds coordinate-wise when the ring
correctly enforces `x_i^2 = x_i` (i.e. you're working with actual GF(2) values,
not formal polynomial variables).

## 2. The bug

`H`: the ring where `x_i^2 = x_i` is enforced: is built and then discarded.
`Rv`, `F`, and `PK` are all computed in `R`, the plain (unreduced) polynomial ring.

In characteristic 2, squaring an affine form has no cross terms:

```
(Σ c_j x_j)^2 = Σ c_j^2 x_j^2      (cross terms 2·c_j·c_k vanish mod 2)
```

So `F^q` and `F^(2q)` only ever produce **powers of a single variable at a time**: never products of two distinct variables. Reducing mod the irreducible `g(t)`
(a GF(2)-linear operation on the coefficient vector) doesn't introduce any new
cross terms either. The result: every component of the "quadratic" public key is
actually a GF(2)-linear combination of `{x_i, x_i^2, x_i^4}` terms, confirmed by
inspecting `output.txt`: **zero `*` (product) terms appear anywhere** in the
137 public polynomials:

```python
>>> pk_line.count('*')
0
```

Since encryption evaluates the public key at concrete bits (`x_i ∈ {0,1}`), and
`0^2=0`, `1^2=1`, `1^4=1`, every `x_i^2` / `x_i^4` term evaluates identically to
`x_i`. So for any actual key bit-vector, `PK(msg)` is just an **affine map**:

```
PK(msg) = M · msg  ⊕  c        (over GF(2), for msg ∈ {0,1}^n)
```

This completely breaks the scheme: no lattice reduction, no Gröbner basis, no
MQ-solving needed. Just recover `M` and `c` from the printed polynomials and
invert with Gaussian elimination.

## 3. Recovering the affine map

Parse each of the 137 public polynomials. Every monomial is either the constant
`1` or of the form `x_i^k` (k ∈ {1,2,4}). Reduce exponents mod evaluation-at-bits
(`x_i^k → x_i`) and XOR together repeated occurrences of the same variable in a
single polynomial (GF(2) coefficients: 1+1=0):

```python
import re

var_re = re.compile(r'^x(\d+)(?:\^(\d+))?$')
n = 137
M = [[0]*n for _ in range(n)]
c = [0]*n

for i, poly in enumerate(polys):          # polys = the 137 PK component strings
    counts = [0]*(n+1)
    const = 0
    for term in poly.split(' + '):
        term = term.strip()
        if term == '1':
            const ^= 1
            continue
        idx = int(var_re.match(term).group(1))
        counts[idx] ^= 1
    for j in range(1, n+1):
        M[i][j-1] = counts[j]
    c[i] = const
```

## 4. Inverting the map

We have one ciphertext, `encrypted_key = PK(KEY_bits)`, i.e. `y = M·x ⊕ c`. Solve
for `x` via Gaussian elimination over GF(2):

```python
rhs = [y[i] ^ c[i] for i in range(n)]

rows = []
for i in range(n):
    val = sum(1 << j for j in range(n) if M[i][j])
    if rhs[i]:
        val |= (1 << n)          # augmented column
    rows.append(val)

# standard bitmask Gaussian elimination over GF(2)
pivot_row_for_col = {}
r = 0
for col in range(n):
    piv = next((rr for rr in range(r, n) if (rows[rr] >> col) & 1), None)
    if piv is None:
        continue
    rows[r], rows[piv] = rows[piv], rows[r]
    for rr in range(n):
        if rr != r and (rows[rr] >> col) & 1:
            rows[rr] ^= rows[r]
    pivot_row_for_col[col] = r
    r += 1
```

The matrix turned out to have **rank 135** (not full rank 137), leaving a 2-bit
kernel: i.e. 4 candidate solutions. Two important details when reconstructing
the integer `KEY` from the bit-vector `x`:

- **Bit order:** Sage's `Integer.bits()` is **LSB-first**, and `encrypt()` maps
  `msg[i]` directly onto `x_{i+1}`. So `x1` corresponds to the *least* significant
  bit of `KEY`, and `x137` to the *most* significant bit: not the other way
  around (this tripped up the first attempt).
- **Bit-length constraint:** the challenge script loops until
  `KEY.nbits() == 137`, so the top bit (`x137`) must be `1`. This alone narrows
  the 4 free-variable combinations down to 2 candidates.

```python
KEY = sum((1 << i) for i in range(n) if x[i])
assert KEY.bit_length() == 137
```

## 5. Decrypting the flag

For each surviving candidate, derive the AES key exactly as the challenge does
and check for valid PKCS7 padding:

```python
import hashlib
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad

AES_KEY = hashlib.sha256(str(KEY).encode()).digest()
cipher = AES.new(AES_KEY, AES.MODE_ECB)
pt = unpad(cipher.decrypt(enc_flag), 16)
```

One of the two remaining candidates unpads cleanly and yields the flag:

```
HTB{e1th3r_gr0bn3r_0r_v4r13ty___1t_st1ll_w0rks!th4nks_f4l4y_f0r_y0ur_4tt4ck_0n_HFE}
```

## Root cause summary

| | |
|---|---|
| **Intended security** | HFE-style MQ hardness: inverting a hidden degree-4 univariate map over `GF(2^137)`, masked by secret affine transforms `S`, `T`. |
| **Actual bug** | The Boolean quotient ring `H` (enforcing `x_i^2 = x_i`) is constructed but unused; the public key is built in the raw polynomial ring instead. |
| **Consequence** | No cross-variable monomials are ever produced (char-2 "freshman's dream"), so the public key evaluates to a pure **affine map** on `{0,1}^n` inputs. |
| **Exploit** | Read off the linear map directly from the printed public key, solve `M·x = y ⊕ c` with Gaussian elimination over GF(2), brute-force the small kernel, recover `KEY`, derive the AES key, decrypt. |
| **Fix** | Actually build `Rv`, `F`, and `PK` inside the quotient ring `H`, not `R`, or equivalently, reduce every polynomial mod `⟨x_i^2 - x_i⟩` before returning `PK`. |
