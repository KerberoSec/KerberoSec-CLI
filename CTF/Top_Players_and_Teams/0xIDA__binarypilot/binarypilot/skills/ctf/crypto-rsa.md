---
name: crypto-rsa
description: "CTF RSA cryptography attacks. Small exponent cube root, common modulus, Wiener attack, Pollard p-1, Hastad broadcast, Fermat factorization, batch GCD, Manger padding oracle, p=q bypass, gcd(e,phi)>1, signature forgery. Triggers: 'rsa attack', 'rsa ctf', 'crypto rsa', 'wiener attack', 'hastad broadcast', 'small exponent', 'common modulus', 'pollard p-1', 'fermat factorization', 'rsa cipher', 'rsa decryption'."
---

# CTF Crypto: RSA Attacks

Complete RSA attack toolkit: cube root, Wiener, Hastad, Pollard, Fermat, batch GCD, Manger oracle, signature forgery.

## Install

```bash
pip install pycryptodome gmpy2 sympy owiener --break-system-packages
# SageMath for Coppersmith:
# apt-get install -y sagemath
```

---

## Phase 1: Small Public Exponent (Cube Root)

```python
import gmpy2

def small_e_attack(c, e):
    """Works when m^e < n (no modular wrap)."""
    m, exact = gmpy2.iroot(c, e)
    if exact:
        return int(m)
    return None

m = small_e_attack(c, e=3)
if m:
    print(bytes.fromhex(hex(m)[2:]))
```

---

## Phase 2: Common Modulus Attack

```python
from math import gcd

def common_modulus_attack(c1, c2, e1, e2, n):
    """Same n, same message, different coprime exponents."""
    def extended_gcd(a, b):
        if a == 0: return b, 0, 1
        g, x, y = extended_gcd(b % a, a)
        return g, y - (b // a) * x, x

    g, a, b = extended_gcd(e1, e2)
    assert g == 1
    if a < 0:
        c1 = pow(c1, -1, n); a = -a
    if b < 0:
        c2 = pow(c2, -1, n); b = -b
    return (pow(c1, a, n) * pow(c2, b, n)) % n

m = common_modulus_attack(c1, c2, e1, e2, n)
print(bytes.fromhex(hex(m)[2:]))
```

---

## Phase 3: Wiener's Attack (Small Private Exponent)

```python
import owiener  # pip install owiener

d = owiener.attack(e, n)
if d:
    m = pow(c, d, n)
    print(bytes.fromhex(hex(m)[2:]))
else:
    print("Wiener failed: d not small enough")

# Manual implementation:
def wiener_attack(e, n):
    def continued_fraction(num, den):
        cf = []
        while den:
            q, r = divmod(num, den)
            cf.append(q)
            num, den = den, r
        return cf

    def convergents(cf):
        h0, h1 = 0, 1
        k0, k1 = 1, 0
        for a in cf:
            h0, h1 = h1, a * h1 + h0
            k0, k1 = k1, a * k1 + k0
            yield h1, k1

    from math import isqrt
    for k, d in convergents(continued_fraction(e, n)):
        if k == 0: continue
        if (e * d - 1) % k != 0: continue
        phi = (e * d - 1) // k
        s = n - phi + 1
        disc = s * s - 4 * n
        if disc < 0: continue
        t = isqrt(disc)
        if t * t == disc:
            return d
    return None
```

---

## Phase 4: Pollard's p-1 Factorization

```python
from math import gcd

def pollard_p1(n, B=100000):
    """Factor n when p-1 is B-smooth."""
    a = 2
    for j in range(2, B + 1):
        a = pow(a, j, n)
        d = gcd(a - 1, n)
        if 1 < d < n:
            return d, n // d
    return None

result = pollard_p1(n)
if result:
    p, q = result
    phi = (p - 1) * (q - 1)
    d = pow(e, -1, phi)
    print(bytes.fromhex(hex(pow(c, d, n))[2:]))
```

---

## Phase 5: Hastad's Broadcast Attack

```python
from functools import reduce

def hastad_broadcast(ciphertexts, moduli, e):
    """e encryptions with same exponent e, different keys."""
    import gmpy2

    def crt(remainders, moduli):
        N = reduce(lambda a, b: a * b, moduli)
        result = 0
        for r, m in zip(remainders, moduli):
            Ni = N // m
            Mi = pow(Ni, -1, m)
            result += r * Ni * Mi
        return result % N

    me = crt(ciphertexts[:e], moduli[:e])
    m, exact = gmpy2.iroot(me, e)
    if exact:
        return int(m)
    return None

# Usage with e=3:
m = hastad_broadcast([c1, c2, c3], [n1, n2, n3], e=3)
print(bytes.fromhex(hex(m)[2:]))
```

---

## Phase 6: Fermat Factorization (Consecutive Primes)

```python
from sympy import prevprime, nextprime, isqrt as sym_isqrt

def fermat_factor(n):
    """Works when p ~ q ~ sqrt(n)."""
    root = int(n**0.5)
    p = prevprime(root + 1)
    while n % p != 0:
        p = prevprime(p)
    return p, n // p

p, q = fermat_factor(n)
phi = (p - 1) * (q - 1)
d = pow(e, -1, phi)
print(bytes.fromhex(hex(pow(c, d, n))[2:]))
```

---

## Phase 7: Multi-Prime RSA

```python
from sympy import factorint

factors = factorint(n)  # {p1: e1, p2: e2, ...}
phi = 1
for p, exp in factors.items():
    phi *= (p - 1) * (p ** (exp - 1))
d = pow(e, -1, phi)
print(bytes.fromhex(hex(pow(c, d, n))[2:]))
```

---

## Phase 8: Batch GCD (Shared Prime Factoring)

```python
from math import gcd
from functools import reduce

def batch_gcd(moduli):
    """Find RSA moduli sharing a prime factor."""
    product = reduce(lambda a, b: a * b, moduli)
    factors = {}
    for n in moduli:
        g = gcd(n, product // n)
        if g != 1 and g != n:
            factors[n] = (g, n // g)
    return factors

# Usage:
moduli = [key.n for key in public_keys]
shared = batch_gcd(moduli)
for n, (p, q) in shared.items():
    d = pow(e, -1, (p-1)*(q-1))
    print(f"Recovered key for n={n}")
```

---

## Phase 9: RSA with gcd(e, phi) > 1 (CSAW 2015 style)

```python
from math import gcd
import gmpy2

g = gcd(e, phi_n)
e_prime = e // g
d_prime = pow(e_prime, -1, phi_n)
m_g = pow(c, d_prime, n)

# Try integer root first:
m, exact = gmpy2.iroot(m_g, g)
if exact:
    print(bytes.fromhex(hex(int(m))[2:]))
else:
    # Brute-force: m_g + k*n
    for k in range(10000):
        m, exact = gmpy2.iroot(m_g + k * n, g)
        if exact:
            print(bytes.fromhex(hex(int(m))[2:]))
            break
```

---

## Phase 10: RSA p=q Validation Bypass

```python
from Crypto.Util.number import getPrime, inverse

p = getPrime(512)
q = p  # p = q!
n = p * q  # = p^2
e = 65537
wrong_phi = (p - 1) * (q - 1)  # server computes this (wrong)
d = inverse(e, wrong_phi)       # passes server validation

# Server encrypts with our key, decryption fails → leaks ciphertext c
# Decrypt with correct totient:
real_phi = p * (p - 1)  # phi(p^2) = p*(p-1)
real_d = inverse(e, real_phi)
print(bytes.fromhex(hex(pow(c, real_d, n))[2:]))
```

---

## Phase 11: RSA Signature Forgery (Homomorphic)

```python
# Textbook RSA: S(a) * S(b) mod n = S(a*b) mod n
# Oracle won't sign target m → sign factors separately

divisor = 2
sig_a = sign_oracle(target_msg // divisor)
sig_b = sign_oracle(divisor)
forged_sig = (sig_a * sig_b) % n

# Verify:
assert pow(forged_sig, e, n) == target_msg
```

---

## Phase 12: Factor n from Multiple of phi(n)

```python
import random
from math import gcd

def factor_from_phi_multiple(n, phi_multiple):
    s, d = 0, phi_multiple
    while d % 2 == 0:
        s += 1; d //= 2
    for _ in range(100):
        a = random.randrange(2, n - 1)
        x = pow(a, d, n)
        if x in (1, n - 1): continue
        for _ in range(s - 1):
            prev = x
            x = pow(x, 2, n)
            if x == n - 1: break
            if x == 1:
                p = gcd(prev - 1, n)
                if 1 < p < n: return p, n // p
        if x != n - 1:
            p = gcd(x - 1, n)
            if 1 < p < n: return p, n // p
    return None

# If server leaks e*d:
phi_mult = re * rd - 1
result = factor_from_phi_multiple(n, phi_mult)
if result:
    p, q = result
    d = pow(e, -1, (p-1)*(q-1))
    print(bytes.fromhex(hex(pow(c, d, n))[2:]))
```

---

## Decision Tree

```
Given n, e, c:
├── e=3 and small message? → Small exponent (cube root)
├── Same n, two e values, gcd(e1,e2)=1? → Common modulus
├── Very large e (close to n)? → Wiener attack
├── n factors easily? → Pollard p-1 (smooth p-1) or Fermat (close primes)
├── e=3, 3+ ciphertexts, different n? → Hastad broadcast
├── Many n values from same source? → Batch GCD
├── gcd(e, phi) > 1? → nth root + CRT
├── Server decrypts and leaks error? → Manger's oracle
└── Signing oracle, won't sign m? → Signature forgery (factorize m)
```

---

## Output

Save to `.omop/engagement/ctf/crypto/`:
- `attack-script.py`: working attack
- `flag.txt`: recovered plaintext/flag

## Next Phase

→ `ctf-crypto-advanced` for ECC, PRNG attacks, advanced math
→ `ctf-web-server-side` for crypto-adjacent web challenges
