---
name: crypto-exotic
description: "CTF exotic cryptography attacks. Braid group Diffie-Hellman Alexander polynomial multiplicativity attack, tropical semiring cryptography residuation-based key recovery, Paillier homomorphic encryption oracle binary search, Hamming code linear algebra brute-force, ElGamal multiplicative re-encryption homomorphism attack. Triggers: 'braid group crypto', 'tropical semiring', 'paillier oracle', 'hamming code ctf', 'elgamal re-encryption', 'exotic cryptography', 'non-abelian crypto', 'homomorphic oracle attack'."
---

# CTF Crypto: Exotic Schemes

Braid DH, tropical semiring, Paillier oracle, Hamming, ElGamal.

---

## Phase 1: Braid Group DH: Alexander Polynomial

```python
from sympy import symbols, Poly, factor, gcd

def alexander_polynomial(braid_word, n_strands):
    """
    Compute Alexander polynomial of braid closure (knot invariant).
    This is a homomorphism from braid group → Laurent polynomial ring.
    """
    t = symbols('t')
    # Burau representation (reduced):
    # Generator sigma_i maps to matrix with t at position (i,i)
    I = [[1 if i==j else 0 for j in range(n_strands-1)]
         for i in range(n_strands-1)]

    def burau_generator(k, n, t_var):
        """Reduced Burau matrix for sigma_k."""
        mat = [[1 if i==j else 0 for j in range(n-1)] for i in range(n-1)]
        if k > 0: mat[k-1][k-1] = 1; mat[k-1][k] = 1
        mat[k][k] = -t_var
        if k < n-2: mat[k+1][k] = t_var; mat[k+1][k+1] = 1
        return mat

    result = I
    for gen in braid_word:
        m = burau_generator(abs(gen)-1, n_strands, t if gen > 0 else 1/t)
        result = matmul_poly(result, m, t)

    return det_poly(result, t)

# Attack on braid DH:
# Public: braid B, elements aB, Ba
# Alexander polynomial alex(B) is invariant under conjugation
# But alex(aB) = alex(B)^k only if specific structure → coefficient attack
# Many braid DH schemes broken by:
# 1. Conjugacy length attack (CLA)
# 2. Length-based attack (statistical)
# 3. Super summit set enumeration for small braids

def length_based_attack(public_braid, target, max_steps=1000):
    """
    Braid conjugacy search: find a such that aB = target.
    Heuristic: minimize braid word length.
    """
    current = public_braid
    for _ in range(max_steps):
        if current == target:
            return True
        # Try all generators and their inverses
        for g in generators + inverse_generators:
            conjugated = g * current * g.inverse()
            if len(conjugated) < len(current):
                current = conjugated
                break
    return current == target
```

---

## Phase 2: Tropical Semiring Cryptography

```python
import numpy as np

def trop_add(a, b):
    """Tropical addition = min."""
    return min(a, b)

def trop_mul(a, b):
    """Tropical multiplication = classical addition."""
    return a + b

def trop_matmul(A, B):
    """Tropical matrix multiplication."""
    n = len(A)
    C = [[float('inf')] * n for _ in range(n)]
    for i in range(n):
        for k in range(n):
            for j in range(n):
                C[i][j] = trop_add(C[i][j], trop_mul(A[i][k], B[k][j]))
    return C

def trop_matpow(M, k):
    """Tropical matrix exponentiation."""
    n = len(M)
    result = [[0 if i==j else float('inf') for j in range(n)] for i in range(n)]
    for _ in range(k):
        result = trop_matmul(result, M)
    return result

# Tropical DH attack via residuation:
# Public: A^k (tropical matrix power), find k
# Key insight: tropical eigenvalue = min cycle mean in weighted graph
# Recover: A has eigenvalue lambda, A^k has eigenvalue k*lambda
# Count tropical eigenvalue ratio to recover k

def trop_eigenvalue(A):
    """Tropical eigenvalue via minimum cycle mean (Floyd-Warshall)."""
    n = len(A)
    # All-pairs shortest paths in tropical sense
    d = [row[:] for row in A]
    for m in range(n):
        for i in range(n):
            for j in range(n):
                d[i][j] = trop_add(d[i][j], trop_mul(d[i][m], d[m][j]))
    # Minimum mean cycle:
    return min(d[i][i] for i in range(n)) / 1  # simplified

def tropical_dlog(A, B, max_k=10000):
    """Given A and A^k = B, find k by tropical DLP."""
    current = [[0 if i==j else float('inf') for j in range(len(A))] for i in range(len(A))]
    for k in range(max_k):
        if current == B:
            return k
        current = trop_matmul(current, A)
    return -1
```

---

## Phase 3: Paillier Homomorphic Oracle Binary Search

```python
import requests

def paillier_oracle_binary_search(target_cipher, n, g, oracle_url):
    """
    Oracle decrypts or answers comparison queries.
    Binary search for plaintext using homomorphic properties.
    
    Paillier: Enc(m1) * Enc(m2) mod n^2 = Enc(m1 + m2)
              Enc(m)^k mod n^2 = Enc(m * k)
    """
    n2 = n * n
    low, high = 0, n

    while low < high:
        mid = (low + high) // 2

        # Homomorphic subtraction: Enc(m - mid) = target * Enc(-mid)
        enc_neg_mid = pow(g, n - mid, n2)  # Enc(-mid) = Enc(n - mid)
        shifted = (target_cipher * enc_neg_mid) % n2

        # Query oracle: is Dec(shifted) >= 0?
        result = oracle_query(shifted, oracle_url)
        if result == 'positive':
            low = mid + 1
        else:
            high = mid

    return low

def oracle_query(ciphertext, url):
    """Query decryption oracle (CTF-specific)."""
    resp = requests.post(url, json={'ciphertext': hex(ciphertext)})
    return resp.json()['result']

# Alternative: parity oracle
def paillier_parity_oracle(target_cipher, n, g, oracle_fn):
    """If oracle reveals LSB of decryption."""
    n2 = n * n
    plaintext_bits = []

    # Double the plaintext (shift left): Enc(2m) = Enc(m)^2
    current = target_cipher
    for bit in range(n.bit_length()):
        parity = oracle_fn(current) % 2
        plaintext_bits.append(parity)
        current = pow(current, 2, n2)  # double

    return int(''.join(map(str, reversed(plaintext_bits))), 2)
```

---

## Phase 4: Hamming Code Brute-Force

```python
import itertools
import numpy as np

def hamming_decode_brute(encoded_bits, parity_check_matrix):
    """
    For (7,4) or custom Hamming codes: brute-force all 2^k messages
    and find one whose encoding matches observed codeword (with errors).
    """
    k = parity_check_matrix.shape[0]  # message length
    n = parity_check_matrix.shape[1]  # codeword length

    for msg_bits in itertools.product([0, 1], repeat=k):
        msg = np.array(msg_bits, dtype=int)
        # Encode (systematic form: msg | parity)
        syndrome = (parity_check_matrix @ msg) % 2
        codeword = np.concatenate([msg, syndrome])

        # Check Hamming distance to received word
        dist = np.sum(codeword != encoded_bits)
        if dist <= 1:  # can correct 1 error
            return msg_bits

    return None

def hamming_syndrome_decode(received, H):
    """
    Standard Hamming decode: syndrome → error position → correct.
    """
    syndrome = (H @ received) % 2
    s = int(''.join(map(str, syndrome)), 2)
    if s == 0:
        return received  # no error
    # s - 1 = error position (0-indexed)
    corrected = received.copy()
    corrected[s - 1] ^= 1
    return corrected

# Custom linear code brute-force for flag:
def linear_code_brute(ciphertext_bits, generator_matrix, p=2):
    """
    If ciphertext = G * plaintext (mod p), invert G via linear algebra.
    """
    G = np.array(generator_matrix) % p
    c = np.array(ciphertext_bits) % p
    # Solve G * x = c over GF(p)
    from sage.all import matrix, GF, vector
    M = matrix(GF(p), G)
    v = vector(GF(p), c)
    x = M.solve_right(v)
    return list(x)
```

---

## Phase 5: ElGamal Re-Encryption Attack

```python
from Crypto.Util.number import getPrime, inverse

def elgamal_reencrypt(ciphertext, pk, g, p):
    """
    ElGamal multiplicative re-encryption.
    c = (g^r, m * pk^r)
    Re-encrypt: c' = (g^r * g^r', m * pk^r * pk^r') = Enc(m) with randomness r+r'
    """
    import random
    g1, g2 = ciphertext
    r_prime = random.randint(1, p-2)
    new_g1 = (g1 * pow(g, r_prime, p)) % p
    new_g2 = (g2 * pow(pk, r_prime, p)) % p
    return (new_g1, new_g2)

def elgamal_homomorphic_product(c1, c2, p):
    """
    ElGamal is multiplicatively homomorphic:
    Enc(m1) * Enc(m2) = Enc(m1 * m2)
    """
    return ((c1[0] * c2[0]) % p, (c1[1] * c2[1]) % p)

def elgamal_decrypt(ciphertext, private_key, p):
    g1, g2 = ciphertext
    s = pow(g1, private_key, p)
    m = (g2 * inverse(s, p)) % p
    return m

# Attack: if oracle decrypts re-encrypted ciphertext:
# 1. Receive challenge ciphertext (g^r, m * pk^r)
# 2. Multiply with Enc(chosen_m) to get Enc(m * chosen_m)
# 3. Oracle decrypts → recover m = result / chosen_m

def elgamal_chosen_ciphertext_attack(challenge, chosen_plain, g, pk, p, oracle_fn):
    """CCA1 attack on ElGamal (not CCA2-secure)."""
    enc_chosen = elgamal_encrypt(chosen_plain, g, pk, p)
    blinded = elgamal_homomorphic_product(challenge, enc_chosen, p)
    result = oracle_fn(blinded)
    m = (result * inverse(chosen_plain, p)) % p
    return m

def elgamal_encrypt(m, g, pk, p):
    import random
    r = random.randint(1, p-2)
    return (pow(g, r, p), (m * pow(pk, r, p)) % p)
```

---

## Output

Save to `.omop/engagement/ctf/crypto/`:
- `solve.py`: attack script
- `flag.txt`: recovered plaintext

## Next Phase

→ `ctf-crypto-zkp` for ZKP/SNARK attacks
→ `ctf-crypto-classical` for classical cipher attacks
