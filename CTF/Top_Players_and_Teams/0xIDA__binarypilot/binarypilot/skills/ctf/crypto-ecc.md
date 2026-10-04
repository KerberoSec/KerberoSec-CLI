---
name: crypto-ecc
description: "CTF ECC attacks. Smart's attack on anomalous curves, Pohlig-Hellman, ECDSA nonce reuse, invalid curve, singular curves, Ed25519 torsion side channel, clock group DLP. Triggers: 'ecc attack', 'elliptic curve', 'ecdsa nonce reuse', 'smart attack', 'anomalous curve', 'pohlig hellman', 'ecdsa signature forgery', 'ecc discrete log', 'secp256k1 attack'."
---

# CTF Crypto: Elliptic Curve Attacks

Smart's attack, ECDSA nonce reuse, Pohlig-Hellman, invalid/singular curves, Ed25519 torsion.

## Install

```bash
sage --version   # SageMath required
pip install ecdsa pycryptodome --break-system-packages
```

---

## Phase 1: Detect Vulnerability

```python
# SageMath: check if curve is anomalous (Smart's attack):
E = EllipticCurve(GF(p), [a, b])
n = E.order()
print(f"p = {p}")
print(f"order n = {n}")
print(f"Anomalous (n==p): {n == p}")      # → Smart's attack
print(f"p-1 smooth: factor(p-1)")          # → Pohlig-Hellman
print(f"discriminant: {E.discriminant()}") # → 0 = singular

# Check for small subgroup factors (Pohlig-Hellman):
for factor, exp in factor(n):
    print(f"  {factor}^{exp}")
# If largest prime factor is small → Pohlig-Hellman
```

---

## Phase 2: Smart's Attack (Anomalous Curves)

```python
# When: E.order() == p
# Solves ECDLP in O(1) via p-adic lifting

def smart_attack(p, a, b, Gx, Gy, Qx, Qy):
    """Smart's attack: ECDLP on anomalous curve E(GF(p)) where #E = p."""
    E = EllipticCurve(GF(p), [a, b])
    G = E(Gx, Gy)
    Q = E(Qx, Qy)
    
    # Automatic (Sage handles anomalous internally):
    try:
        secret = G.discrete_log(Q)
        return secret
    except:
        pass
    
    # Manual p-adic lift:
    Qp = pAdicField(p, 2)
    Ep = EllipticCurve(Qp, [a, b])
    
    for gp in Ep.lift_x(ZZ(Gx), all=True):
        for qp_pt in Ep.lift_x(ZZ(Qx), all=True):
            try:
                pG = p * gp
                pQ = p * qp_pt
                x_G = ZZ(pG[0] / pG[1]) / p
                x_Q = ZZ(pQ[0] / pQ[1]) / p
                k = ZZ(x_Q / x_G) % p
                if E(Gx, Gy) * k == E(Qx, Qy):
                    return k
            except (ZeroDivisionError, ValueError):
                continue
    return None

# Usage:
secret = smart_attack(p, a, b, Gx, Gy, Qx, Qy)
print(f"Secret key: {secret}")
```

---

## Phase 3: Pohlig-Hellman (Smooth Order)

```python
# When: E.order() factors into small primes
# Solve DLP in each subgroup, combine with CRT

from sympy.ntheory.residues import n_order
from sympy.ntheory.modular import crt

def pohlig_hellman_ec(G, Q, n, E):
    """Pohlig-Hellman on E(GF(p)) with smooth order n."""
    factors = list(factor(n))
    residues = []
    moduli = []
    
    for q, e in factors:
        q_e = q**e
        # Subgroup generator:
        Gi = (n // q_e) * G
        Qi = (n // q_e) * Q
        
        # DLP in subgroup of order q^e:
        x = 0
        gamma = Gi
        for i in range(e):
            h = (q**(e - 1 - i)) * Qi
            # Brute-force in small subgroup:
            for k in range(q):
                if k * gamma == h:
                    x = (x + k * q**i) % q_e
                    Qi = Qi - k * (q**i * G)
                    break
        
        residues.append(int(x))
        moduli.append(int(q_e))
    
    # CRT combination:
    secret, _ = crt(moduli, residues)
    return secret

# In SageMath (automatic):
secret = G.discrete_log(Q)  # Sage uses Pohlig-Hellman automatically for smooth orders
```

---

## Phase 4: ECDSA Nonce Reuse

```python
# When: Two ECDSA signatures share the same r value → same nonce k used

from hashlib import sha256

# secp256k1 order:
n = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141

# Given: two signatures (r, s1) and (r, s2), messages msg1 and msg2:
h1 = int(sha256(msg1).hexdigest(), 16)
h2 = int(sha256(msg2).hexdigest(), 16)

# Recover nonce:
k = ((h1 - h2) * pow(s1 - s2, -1, n)) % n

# Recover private key:
d = ((s1 * k - h1) * pow(r, -1, n)) % n

print(f"Nonce k: {hex(k)}")
print(f"Private key d: {hex(d)}")

# Verify:
# d * G should equal public key Q
```

---

## Phase 5: Clock Group DLP (Custom Group, Pohlig-Hellman)

```python
# Group law on unit circle: x^2 + y^2 = 1 (mod p)
# Identity: (0, 1)
# Operation: (x1*y2 + y1*x2, y1*y2 - x1*x2)
# Group order = p + 1

def clock_mul(P, Q, p):
    x1, y1 = P
    x2, y2 = Q
    return ((x1*y2 + y1*x2) % p, (y1*y2 - x1*x2) % p)

def clock_pow(P, n, p):
    result = (0, 1)   # identity
    base = P
    while n > 0:
        if n & 1:
            result = clock_mul(result, base, p)
        base = clock_mul(base, base, p)
        n >>= 1
    return result

# Recover p from known points:
from math import gcd
from functools import reduce

known_points = [(x1, y1), (x2, y2), ...]
vals = [x**2 + y**2 - 1 for x, y in known_points]
p = reduce(gcd, vals)
# May need to remove small factors from p

# When p+1 is smooth → Pohlig-Hellman:
# Factor p+1 and solve DLP per subgroup
order = p + 1
print(f"Order: {order}")
# factor(order) in Sage
```

---

## Phase 6: Singular Curve Attack

```python
# When: discriminant = 0 → curve is singular
# DLP reduces to additive or multiplicative group

def singular_attack(p, a, b, Gx, Gy, Qx, Qy):
    E = EllipticCurve(GF(p), [a, b])
    disc = E.discriminant()
    
    if disc == 0:
        print("Singular curve! DLP may reduce to simpler problem")
        # Cuspidal: (x^3 term) → additive group Z_p (trivial)
        # Nodal: → multiplicative group F_p* (discrete log mod p)
```

---

## Phase 7: Invalid Curve Attack

```python
# When: server doesn't validate points are on the correct curve
# Send points from weaker curves with small subgroups

# Generate points with small-order subgroups on related curves:
# E': y^2 = x^3 + ax + b' where b' != b (different b)
# Find points of small order on E' → leak key bits

# Full attack: multiple small-subgroup queries → Pohlig-Hellman to combine
```

---

## Output

Save to `.omop/engagement/ctf/crypto/`:
- `ecc-attack.py`: attack script with recovered key
- `flag.txt`: decrypted flag

## Next Phase

→ `ctf-crypto-rsa` for RSA attacks
→ `ctf-pwn-rop` for exploit chain
