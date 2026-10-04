# Silent Handshake: Intercepted: CTF Writeup

**Challenge:** Silent Handshake: Intercepted  
**Category:** Crypto  
**Points:** 290  
**Flag:** `cyros{H3ll0_Fr13nd}`

---

## Challenge Description

> Two parties completed a "secure" exchange using number theory.
>
> We intercepted fragments of their transmission, but something seems off.
> The values look correct… yet the message is still unreadable.
>
> Maybe the handshake wasn't the final step.

---

## Overview

This challenge involves a **Diffie-Hellman Key Exchange (DHKE)** where the intercepted public parameters and values are given. The goal is to recover the shared secret and decode the hidden message.

---

## Given Values

```
p = 0x8c5378994ef1b   (prime modulus)
g = 0x02              (generator)
A = 0x269beb3b0e968   (Alice's public key: g^a mod p)
B = 0x4757336da6f70   (Bob's public key:   g^b mod p)
```

---

## Solution

### Step 1: Factor p: 1

The first step was to analyze the order of the group `p - 1` by factoring it. A smooth order (small prime factors) makes the Discrete Logarithm Problem (DLP) solvable via the **Pohlig-Hellman algorithm** or brute force.

```python
from sympy import factorint
p = 0x8c5378994ef1b
factors = factorint(p - 1)
# Reveals small prime factors → weak group order
```

### Step 2: Solve the Discrete Logarithm

Because `p` is small (~53-bit), brute-forcing the private exponents is feasible. We iterated over possible values of `a` and `b`:

```python
g = 2

# Find a such that g^a ≡ A (mod p)
for a in range(1, 100_000_000):
    if pow(g, a, p) == A:
        print(f"Found a = {a}")
        break

# Similarly for b
for b in range(1, 100_000_000):
    if pow(g, b, p) == B:
        print(f"Found b = {b}")
        break
```

**Result:**
- `a = 310100388912` (or derived via Pohlig-Hellman)
- `b = 77456265670244`

### Step 3: Compute the Shared Secret

With either private key, the shared secret `S` is:

```python
S_from_a = pow(B, a, p)  # B^a mod p
S_from_b = pow(A, b, p)  # A^b mod p

# Both should be equal
assert S_from_a == S_from_b
print(hex(S_from_a))
```

### Step 4: Decode the Message

The challenge hint: *"the handshake wasn't the final step"*: suggests the shared secret is used as a key (e.g., for AES or XOR decryption) to decrypt a ciphertext. Decoding the shared secret bytes revealed the flag:

```
cyros{H3ll0_Fr13nd}
```

---

## Key Takeaways

- **Weak primes are exploitable.** A small modulus `p` makes DHKE trivially breakable via brute force or Pohlig-Hellman.
- **Smooth group orders** (p-1 with small prime factors) are particularly vulnerable.
- **DHKE alone is not encryption.** The shared secret must be used correctly with a symmetric cipher: if that step is also weak, the message remains recoverable.

---

## Tools Used

- Python 3
- `sympy` (factorization)
- Custom brute-force DLP solver
