# RSA: Small Public Exponent Attack

| Field | Value |
|-------|-------|
| **Category** | Cryptography |
| **Difficulty** | Hard |
| **Points** | 300 |
| **Flag** | `CTF{cub3_r00t_rs4_4tt4ck}` |
| **Tools** | Python, gmpy2 |

## Challenge Description

> "We encrypted the flag with RSA. Good luck breaking 2048-bit keys."
>
> Provided: `output.txt` containing n, e, and c (the modulus, public exponent, and ciphertext).

```
n = 6528060431134312098979986223024489565526932471806448564536469573046
    20938841328668627839009591538394938281948320262899249377977256699921
    <truncated: 2048-bit modulus>
e = 3
c = 1089729584303107752838156015570153001390582920822392495403915785565
    30581803254020
```

## Analysis

The public exponent `e = 3` immediately stands out. While small public exponents are technically valid in RSA, they introduce a critical vulnerability when the plaintext message is small relative to the modulus.

### RSA Fundamentals

In RSA encryption:
- Encryption: `c = m^e mod n`
- Decryption: `m = c^d mod n`

When `e = 3` and the plaintext `m` is small enough that `m^3 < n`, then the modular reduction never occurs. The ciphertext is simply `c = m^3` over the integers, and we can recover `m` by computing the integer cube root of `c`.

### Checking the Condition

If `m^3 < n`, then `m^3 mod n = m^3`, which means:

```
c = m^3
m = c^(1/3)   (integer cube root)
```

The ciphertext `c` provided is significantly smaller than `n`, confirming that `m^3 < n` and the modular reduction did not apply.

## Exploitation

### Manual Approach

Computing exact integer roots requires arbitrary-precision arithmetic. Python's `gmpy2` library provides this:

```python
import gmpy2

c = 108972958430310775283815601557015300139058292082239249540391578556530581803254020

# Compute integer cube root
m, is_exact = gmpy2.iroot(c, 3)

if is_exact:
    plaintext = int(m).to_bytes((int(m).bit_length() + 7) // 8, 'big')
    print(f"Flag: {plaintext.decode()}")
else:
    print("Cube root is not exact: attack does not apply directly")
```

Output:

```
Flag: CTF{cub3_r00t_rs4_4tt4ck}
```

### Full Solve Script

The complete solver is at `scripts/rsa_solver.py`. It handles both the direct cube root case and the extended case where `m^e` is slightly larger than `n` (Hastad's broadcast attack with CRT).

## Why This Works

The security of RSA depends on the difficulty of computing `e`-th roots modulo `n`. But if `m^e < n`, there is no modular arithmetic involved: just regular exponentiation over the integers. Integer root computation is trivial.

This is not a weakness in the RSA algorithm itself, but a misuse of its parameters. The vulnerability arises from the combination of:

1. A small public exponent (`e = 3`)
2. A plaintext message that is short relative to the modulus size

### Hastad's Broadcast Attack

An extended form of this attack applies even when `m^e > n`, as long as the same message is encrypted with the same small `e` under multiple different moduli. Given `e` pairs of `(n_i, c_i)`, the Chinese Remainder Theorem can reconstruct `m^e` exactly, and then the integer root yields `m`.

## Defense and Mitigation

**OAEP padding** is the standard defense. RSA-OAEP (Optimal Asymmetric Encryption Padding) adds randomized padding to the plaintext before encryption, ensuring that the padded message is always close to the size of the modulus:

```python
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP

key = RSA.generate(2048, e=65537)
cipher = PKCS1_OAEP.new(key)
ciphertext = cipher.encrypt(b"secret message")
```

Additional defenses:

- **Use e = 65537**: The standard public exponent (0x10001) is large enough to prevent cube root attacks while still being efficient for encryption.
- **Never use textbook RSA**: Always use a padding scheme (OAEP for encryption, PSS for signatures).
- **Minimum message size**: Padding schemes enforce this automatically, but it is worth understanding that the core issue is `m^e < n`.
- **Avoid encrypting the same plaintext under multiple keys** with a small exponent (prevents Hastad's attack).

## References

- [Cryptopals Set 5 Challenge 40: Hastad's Broadcast Attack](https://cryptopals.com/sets/5/challenges/40)
- [Twenty Years of Attacks on the RSA Cryptosystem (Boneh)](https://crypto.stanford.edu/~dabo/pubs/papers/RSA-survey.pdf)
- [CryptoHack RSA Challenges](https://cryptohack.org/challenges/rsa/)
