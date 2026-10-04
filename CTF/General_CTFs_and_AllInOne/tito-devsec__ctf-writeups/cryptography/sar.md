# CTF Write-up: SAR

**Category:** Cryptography (RSA)
**Challenge Source:** tcraCyber champion 2026
**Write-up Author:** TitoDevsec (T1t0D3v$3c)

## Challenge Summary
The challenge provided an RSA public key (`public.key`) and an encrypted message (`cipher.txt`). The goal was to decrypt the message.

## Vulnerability Analysis
### What was wrong?
The RSA implementation used a **low public exponent** ($e = 5$) and no padding. When the plaintext message $m$ is small, it's possible that $m^e < n$ (where $n$ is the modulus). In this case, the modular reduction $c = m^e \pmod n$ never occurs, and the ciphertext is simply $c = m^e$.

## Solution
1.  **Parameter Extraction:** Extract $n$ and $e$ from the public key. Note that $e = 5$.
2.  **Attack Identification:** Since $e$ is very small and the message is likely short, a **Low Public Exponent Attack** is feasible.
3.  **Decryption:** Calculate the integer $e$-th root (in this case, the 5th root) of the ciphertext $c$.
    ```python
    # Conceptual Python solution
    import gmpy2
    m = gmpy2.iroot(c, 5)[0]
    print(bytes.fromhex(hex(m)[2:]).decode())
    ```
4.  **Result:** The decrypted message reveals the flag.

## Code Comparison

### Vulnerable Implementation
Using a small exponent without padding:
```python
from Crypto.PublicKey import RSA
key = RSA.generate(2048, e=3) # Very vulnerable
# Encryption without padding
c = pow(m, key.e, key.n)
```

### Secure Implementation
Use a standard public exponent (typically $65537$) and a secure padding scheme like **OAEP** (Optimal Asymmetric Encryption Padding).
```python
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
key = RSA.generate(2048, e=65537)
cipher = PKCS1_OAEP.new(key)
ciphertext = cipher.encrypt(message)
```

## Lessons Learned
*   **Exponent Choice:** Always use a large, standard public exponent like $65537$ for RSA.
*   **Padding is Essential:** Never use "raw" or "textbook" RSA. Secure padding schemes like OAEP are mandatory to prevent various mathematical attacks.
*   **Mathematical Attacks:** Cryptography is based on math; if the parameters are weak, the math can be reversed.

## Flag
`tzcert{R5@_1s_FuN_1432083535934545}`
