# Merkle's Trapdoor

**Category:** Crypto  
**Points:** 100  
**Author:** [F4R3S](https://www.linkedin.com/in/f4r3s/)  
**Flag:** `KaliTeam{M4rK14_h3lLm3n_Kn3ps3cK}`

---

## Challenge

> Behind every great knapsack lies a hidden trapdoor. Can you find your way through the super-increasing shadows?

**Ciphertext (hex):**
```
1b99090e0a6109e30414099a090e0a6f211704f4060a20341b99058c060a1c28
09d51cbd0a6104e60a6f1cbd21921c281b9921921cbd090320421cbd203f1b99
0a72
```

**Public key:** `{14, 5937, 140, 213, 3, 1403, 901, 2009}`

---

## Background: Merkle-Hellman Knapsack Cryptosystem

The Merkle-Hellman knapsack cryptosystem (1978) is one of the earliest public-key encryption schemes. It is built on the **subset-sum problem**: given a set of integers and a target sum, determine which subset of elements adds up to that target. In general this is NP-hard, but Merkle and Hellman engineered a **trapdoor** that makes the private version easy to solve.

### Private key generation

The private key starts with a **super-increasing sequence**: a sequence where each element is strictly greater than the sum of all preceding elements. For example:

```
a = {2, 3, 7, 14, 30, 57, 120, 251}
```

Because of this property, the private knapsack can be solved greedily: starting from the largest element, subtract it from the target if it fits, and move on. This is O(n).

A modulus `m` (greater than the sum of all elements) and a multiplier `w` (coprime to `m`) are chosen. The **public key** is computed as:

```
pub[i] = (w × a[i]) mod m
```

The modular transformation disguises the super-increasing structure. The public key looks like an arbitrary set of integers: the hard knapsack.

### Encryption

Each plaintext byte `b` selects a subset of the public key using its 8 bits:

```
c = Σ (bit_i(b) × pub[i])   for i = 0..7
```

### Decryption (with private key)

The recipient computes `w⁻¹ mod m`, applies it to the ciphertext:

```
c' = w⁻¹ × c mod m
```

Then solves the now-super-increasing subset-sum greedily to recover the plaintext bits.

---

## Solution

### Step 1: Parse the ciphertext

The maximum possible knapsack sum is:

```
14 + 5937 + 140 + 213 + 3 + 1403 + 901 + 2009 = 10620
```

`10620 < 65535`, so each encrypted symbol fits in **2 bytes**. The 66-byte hex string therefore encodes **33 ciphertext values**, parsed as big-endian 16-bit integers:

```python
import struct
ct_bytes = bytes.fromhex("1b99090e0a6109e3...0a72")
ciphertexts = [struct.unpack('>H', ct_bytes[i:i+2])[0]
               for i in range(0, len(ct_bytes), 2)]
# [7065, 2318, 2657, 2531, 1044, ...]
```

### Step 2: Brute-force decrypt each symbol

With only 8 public key elements there are at most **256 possible plaintexts** per ciphertext value (one per byte value). For each ciphertext `c`, iterate all 256 candidates and check which bit pattern satisfies:

```
Σ (bit_i(b) × pub[i]) == c
```

```python
pub = [14, 5937, 140, 213, 3, 1403, 901, 2009]

def decrypt_value(c, pub):
    for b in range(256):
        s = sum(pub[i] for i in range(8) if (b >> i) & 1)
        if s == c:
            return b
    return None

plaintext = bytes(decrypt_value(c, pub) for c in ciphertexts)
print(plaintext.decode())
```

No private key recovery is necessary here. Because the key has only 8 elements, the exhaustive search over 256 candidates per symbol is trivially fast: the entire decryption completes in microseconds.

### Step 3: Read the flag

```
KaliTeam{M4rK14_h3lLm3n_Kn3ps3cK}
```

The flag is a leet-speak tribute to the cryptosystem's inventors: **MaRKle-HeLLMaN KNaPsaCK**.

---

## Why no private key recovery was needed

In a real Merkle-Hellman deployment you would need `m` and `w` to invert the ciphertext. Here the key is only 8 bits wide, collapsing the search space to 256 entries: small enough to brute-force directly against the public key. This is a deliberate CTF design choice that highlights why Merkle-Hellman was broken in practice:

- **Shamir (1984)** showed the scheme is vulnerable to a **low-density attack** using lattice basis reduction (LLL algorithm). The density of this public key is `8 / log₂(5937) ≈ 0.64`, well within the attack's effective range.
- Even without the lattice attack, the 8-element keyspace (256 plaintexts per symbol) makes exhaustive decryption practical.

The cryptosystem was subsequently abandoned for production use.

---

## Key takeaways

| Concept | Detail |
|---|---|
| Cryptosystem | Merkle-Hellman knapsack (1978) |
| Vulnerability exploited | 8-bit key → 256-candidate brute force per symbol |
| Ciphertext encoding | Big-endian 16-bit integers (max sum 10620 < 2¹⁶) |
| Deeper break | Shamir's LLL lattice attack (density ≈ 0.64) |
| Flag | `KaliTeam{M4rK14_h3lLm3n_Kn3ps3cK}` |

---

## Solve script

```python
import struct

pub = [14, 5937, 140, 213, 3, 1403, 901, 2009]

ct_hex = (
    "1b99090e0a6109e30414099a090e0a6f211704f4060a20341b99058c"
    "060a1c2809d51cbd0a6104e60a6f1cbd21921c281b9921921cbd0903"
    "20421cbd203f1b990a72"
)
ct_bytes = bytes.fromhex(ct_hex)
ciphertexts = [
    struct.unpack('>H', ct_bytes[i:i+2])[0]
    for i in range(0, len(ct_bytes), 2)
]

def decrypt_value(c):
    for b in range(256):
        if sum(pub[i] for i in range(8) if (b >> i) & 1) == c:
            return b
    return None

flag = bytes(decrypt_value(c) for c in ciphertexts).decode()
print(flag)
# KaliTeam{M4rK14_h3lLm3n_Kn3ps3cK}
```
