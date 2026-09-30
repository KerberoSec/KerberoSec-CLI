---
name: crypto-advanced-math
description: "CTF advanced math crypto. LLL lattice attacks, Coppersmith method, Pohlig-Hellman on smooth curves, isogeny graph traversal, quaternion RSA factoring, LWE via CVP, Manger padding oracle, non-permutation S-box collision, polynomial CRT in GF(2). Triggers: 'lll attack', 'lattice crypto', 'coppersmith', 'pohlig-hellman', 'isogeny', 'lwe', 'lattice', 'manger oracle', 'quaternion rsa', 'gf2 polynomial'."
---

# CTF Crypto: Advanced Mathematical Attacks

LLL, Coppersmith, isogenies, quaternion RSA, LWE, Manger oracle.

## Install

```bash
sage  # SageMath for lattice/number theory
pip install fpylll z3-solver --break-system-packages
```

---

## Phase 1: LLL Lattice Attack

```python
# Pattern: hints h_i = flag * p_i + noise (noise is small)
# LLL finds short vector → reveals p_i values

from sage.all import *

# Collect 3 server hints:
h1, h2, h3 = (hint1, hint2, hint3)  # from server

M = matrix(ZZ, [
    [1, 0, 0, h1],
    [0, 1, 0, h2],
    [0, 0, 1, h3],
    [0, 0, 0, -1]
])
reduced = M.LLL()
# Short vector: contains p1, p2, p3
# Recover flag: (h1 - noise) // p1
```

---

## Phase 2: Merkle-Hellman Knapsack via LLL

```python
from sage.all import *

def crack_knapsack(pubKey, encoded):
    """Crack Merkle-Hellman knapsack encryption via LLL."""
    nbit = len(pubKey)
    A = Matrix(ZZ, nbit + 1, nbit + 1)
    
    for i in range(nbit):
        A[i, i] = 1
        A[i, nbit] = pubKey[i]
    A[nbit, nbit] = -int(encoded)
    
    res = A.LLL()
    
    for row in res:
        if row[-1] == 0 and all(b in (0, 1) for b in row[:-1]):
            plaintext_bits = list(row[:-1])
            return bytes(int(''.join(map(str, plaintext_bits[i:i+8])), 2) 
                        for i in range(0, len(plaintext_bits)-7, 8))
    return None

# Usage:
flag = crack_knapsack(server_pubkey, server_ciphertext)
```

---

## Phase 3: Coppersmith: Partially Known Prime

```python
from sage.all import *

# Pattern: p = base + 10^k * x where base is known, x is small
# Condition: x < N^(1/e) ≈ N^0.25 for linear polynomial

def coppersmith_known_prefix(N, base, k):
    """Find small x where p = base + 10^k * x divides N."""
    R = PolynomialRing(Zmod(N), 'x')
    x = R.gen()
    
    inv_10k = int(pow(10**k, -1, N))
    f = x + int(base * inv_10k % N)  # Must be monic
    
    roots = f.small_roots(X=2**70, beta=0.5)
    if roots:
        x_val = int(roots[0])
        p = base + 10**k * x_val
        q = N // p
        if p * q == N:
            return p, q
    return None, None

p, q = coppersmith_known_prefix(N, known_base, k_value)
if p:
    phi = (p-1)*(q-1)
    d = pow(e, -1, phi)
    m = pow(ct, d, N)
```

---

## Phase 4: Pohlig-Hellman (Smooth Curve Order)

```python
from sage.all import *

# ECC with smooth order → Pohlig-Hellman DLP

def pohlig_hellman_ecc(G, P, E, n):
    """Solve discrete log P = d*G where E.order() is smooth."""
    factors = factor(n)
    partial_logs = []
    
    for (prime, exp) in factors:
        cofactor = n // (prime ** exp)
        G_sub = cofactor * G
        P_sub = cofactor * P
        
        d_sub = discrete_log(P_sub, G_sub, ord=prime**exp)
        partial_logs.append((d_sub, prime**exp))
    
    # CRT combine:
    from sympy.ntheory.modular import crt
    moduli = [m for (_, m) in partial_logs]
    residues = [r for (r, _) in partial_logs]
    private_key, _ = crt(moduli, residues)
    return private_key

E = EllipticCurve(GF(p), [a, b])
G = E.point(gx, gy)
P = E.point(px, py)
d = pohlig_hellman_ecc(G, P, E, E.order())
```

---

## Phase 5: Isogeny Graph Traversal

```python
from sage.all import *

# Isogeny-based crypto: find path in isogeny graph between j-invariants
# Connected j-invariants satisfy Φ₂(j₁, j₂) = 0 (modular polynomial)

def find_neighbors_j(j, p):
    """Find j-invariants connected by degree-2 isogenies."""
    R = PolynomialRing(GF(p), 'Y')
    Y = R.gen()
    
    # Φ₂(j, Y): modular polynomial for ℓ=2
    # Coefficients from tables or compute via class field theory
    phi2 = Y**3 + ...  # (computed from Φ₂(j, Y))
    roots = phi2.roots()
    return [int(r) for r, _ in roots]

def find_path(start_j, end_j, p, max_steps=1000):
    """BFS to find isogeny path between j-invariants."""
    from collections import deque
    queue = deque([(start_j, [])])
    visited = {start_j}
    
    while queue:
        j, path = queue.popleft()
        if j == end_j:
            return path
        for neighbor in find_neighbors_j(j, p):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
    return None
```

---

## Phase 6: Quaternion RSA Factoring

```python
# Quaternion RSA: encryption uses quaternion algebra over Z/nZ
# Key insight: vector part direction is preserved under exponentiation
# ct1 : ct2 : ct3 = a1 : a2 : a3 (mod n) → leaks ratio → factor n

from math import gcd

def factor_quaternion_rsa(ct, n, alpha, beta):
    """Factor n from quaternion ciphertext using ratio preservation.
    
    alpha[i], beta[i] = coefficients in a_i = m + alpha[i]*p + beta[i]*q
    """
    c0, c1, c2, c3 = ct[0], (-ct[1]) % n, (-ct[2]) % n, (-ct[3]) % n
    
    # Eliminate m between component pairs to get linear in p, q:
    A = (-(alpha[0]*c1 - alpha[1]*c2)*(c1-c3) + 
          (alpha[0]*c1 - alpha[2]*c3)*(c1-c2)) % n
    B = (-(beta[0]*c1 - beta[1]*c2)*(c1-c3) + 
          (beta[0]*c1 - beta[2]*c3)*(c1-c2)) % n
    
    q = gcd(A, n)
    p = gcd(B, n)
    
    if p * q == n and p > 1 and q > 1:
        return p, q
    return None, None

p, q = factor_quaternion_rsa(ciphertext_row, N, [3, 11, 17], [7, 13, 19])
```

---

## Phase 7: LWE via CVP (fpylll)

```python
from fpylll import IntegerMatrix, LLL, CVP
import numpy as np

# LWE: b = A*s + e (mod q)
# s in {-1, 0, 1}^n (ternary secret)

def solve_lwe_cvp(A, b, q, n, m):
    """Solve LWE via CVP/Babai's algorithm."""
    dim = m + n
    B = IntegerMatrix(dim, dim)
    
    # q*I_m on top:
    for i in range(m):
        B[i, i] = q
    
    # A columns + identity on bottom:
    for j in range(n):
        for i in range(m):
            B[m + j, i] = int(A[i][j])
        B[m + j, m + j] = 1
    
    LLL.reduction(B)
    
    target = [int(b[i]) for i in range(m)] + [0] * n
    closest = CVP.babai(B, target)
    
    # Extract secret, project to ternary:
    s = []
    for val in [closest[m + j] for j in range(n)]:
        val_mod = val % q
        s.append(min([-1, 0, 1], key=lambda t: abs((val_mod - t) % q)))
    return s

# After recovery:
import hashlib
from Cryptodome.Cipher import AES
s_bytes = bytes([(v % 256) for v in s])
aes_key = hashlib.sha256(s_bytes + session_nonce).digest()
cipher = AES.new(aes_key, AES.MODE_GCM, nonce=aes_nonce)
flag = cipher.decrypt_and_verify(ciphertext, tag)
```

---

## Phase 8: Manger's RSA Padding Oracle

```python
from math import ceil

# Setup: k < 2^64 (small key), oracle: "below threshold" vs "above threshold"
# Very small key → no modular wrap-around → simple binary search

def manger_attack(oracle, N, e, threshold):
    """~128 queries to recover k when k < 2^64."""
    
    def multiply_ct(factor):
        """Multiply ciphertext by factor^e mod N."""
        return (ct * pow(factor, e, N)) % N
    
    # Phase 1: Find f1 where k*f1 >= threshold
    f1 = 2
    while oracle(multiply_ct(f1)) == 'below':
        f1 *= 2
    # Now f1/2 < threshold/k <= f1
    
    # Phase 2: Binary search
    lo, hi = ceil(threshold / f1), ceil(threshold / (f1 // 2))
    while lo < hi - 1:
        mid = (lo + hi) // 2
        f = ceil(threshold / (mid + 1))
        if oracle(multiply_ct(f)) == 'above':
            hi = mid
        else:
            lo = mid + 1
    
    return lo  # = private key k
```

---

## Output

Save to `.omop/engagement/ctf/crypto/`:
- `solve.sage`: SageMath solver script
- `decrypted.txt`: recovered plaintext
- `flag.txt`: extracted flag

## Next Phase

→ `ctf-crypto-ecc` for elliptic curve attacks
→ `ctf-crypto-prng` for PRNG attacks
