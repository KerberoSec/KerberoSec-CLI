# CTF Write-up: Between Signal and Noise: Stream Cipher Challenge

**Category:** Cryptography / Forensics
**Challenge Source:** PicoCTF
**Write-up Author:** TitoDevsec (T1t0D3v$3c)

## Challenge Summary
This challenge involved recovering a hidden flag that was encrypted using a stream cipher, specifically ChaCha20. The provided files included the encryption script (`source.py`) and the ciphertext output (`out.txt`), which contained the IV (nonce), an encrypted known message, and the encrypted flag.

## Vulnerability Analysis
### What was wrong?
The fundamental flaw in the provided encryption scheme was the **reuse of the same key and nonce (IV) to encrypt multiple distinct messages** (a known plaintext message and the target flag) with a stream cipher. Stream ciphers operate by generating a pseudorandom keystream, which is then XORed with the plaintext to produce ciphertext. If the same key and nonce are used, the same keystream is generated. This vulnerability allows for a **known-plaintext attack**.

## Solution
1.  **Analyze `source.py`:** Examination of the Python encryption script (`source.py`) revealed the use of the `ChaCha20` cipher from the `Crypto.Cipher` library. Crucially, the script initialized `ChaCha20.new(key=key, nonce=iv)` once and then used this instance to encrypt both a known `message` and the `FLAG`. This confirmed the key/nonce reuse.

    ```python
    from Crypto.Cipher import ChaCha20
    import os
    from secret import FLAG

    key, iv = os.urandom(32), os.urandom(12)
    ciphertext_message = ChaCha20.new(key=key, nonce=iv).encrypt(message)
    ciphertext_flag = ChaCha20.new(key=key, nonce=iv).encrypt(FLAG)
    ```

2.  **Understand Stream Cipher Properties:** In a stream cipher, encryption is typically performed by XORing the plaintext ($P$) with a keystream ($K_S$) to produce ciphertext ($C$): $C = P \oplus K_S$. Conversely, decryption is $P = C \oplus K_S$. A critical property is that if the same keystream is used for two different plaintexts ($P_1, P_2$) resulting in ciphertexts ($C_1, C_2$), then $C_1 \oplus C_2 = (P_1 \oplus K_S) \oplus (P_2 \oplus K_S) = P_1 \oplus P_2$. More directly, if one plaintext ($P_1$) and its ciphertext ($C_1$) are known, the keystream can be recovered: $K_S = C_1 \oplus P_1$.

3.  **Execute Known-Plaintext Attack:**
    *   The `out.txt` file provided the IV, the ciphertext of the known message (`ct_message`), and the ciphertext of the flag (`ct_flag`).
    *   The full known plaintext message (`pt_message`) was also available from the problem description or by inspecting the `source.py` if it contained the message directly.
    *   The keystream was recovered by XORing the known plaintext message with its corresponding ciphertext:
        `keystream = ct_message XOR pt_message`
    *   Finally, the recovered keystream was XORed with the ciphertext of the flag to reveal the flag:
        `flag = ct_flag XOR keystream`

4.  **Implementation (Python Script):** A Python script was developed to automate these steps:

    ```python
    # out.py
    import binascii

    def xor_bytes(a, b):
        return bytes([_a ^ _b for _a, _b in zip(a, b)])

    # Read ciphertext components from out.txt
    with open("stream/out.txt", "r") as f:
        lines = f.read().splitlines()

    # IV is lines[0], but not directly needed for this XOR attack
    ct_message_hex = lines[1]
    ct_flag_hex = lines[2]

    ct_message = binascii.unhexlify(ct_message_hex)
    ct_flag = binascii.unhexlify(ct_flag_hex)

    # Known plaintext message
    pt_message = (
        b"Our counter agencies have intercepted your messages and a lot "
        b"of your agent's identities have been exposed. In a matter of "
        b"days all of them will be captured"
    )

    # Recover keystream
    keystream = xor_bytes(ct_message, pt_message)

    # Decrypt flag
    flag = xor_bytes(ct_flag, keystream)

    print("Recovered flag:", flag.decode())
    ```

## Code Comparison

### Vulnerable Code (Key/Nonce Reuse)
```python
from Crypto.Cipher import ChaCha20
import os

key, iv = os.urandom(32), os.urandom(12)

# PROBLEM: Same key and IV used for multiple encryptions
cipher_instance = ChaCha20.new(key=key, nonce=iv)
ciphertext_message = cipher_instance.encrypt(b"Known plaintext message")
ciphertext_flag = cipher_instance.encrypt(b"tzcert{My_Secret_Flag}")
```

### Secure Code (Unique Nonce per Encryption)
Each encryption operation with a stream cipher must use a unique nonce (IV) for a given key. While the key can be reused, the nonce *must* be unique for every message encrypted with that key. If the nonce is randomly generated, the chance of collision is astronomically low for practical purposes.

```python
from Crypto.Cipher import ChaCha20
import os

key = os.urandom(32) # Key can be reused

# Generate a unique nonce for each encryption operation
iv_message = os.urandom(12)
cipher_message = ChaCha20.new(key=key, nonce=iv_message)
ciphertext_message = cipher_message.encrypt(b"Known plaintext message")

iv_flag = os.urandom(12) # NEW: Generate a fresh, unique nonce for the flag
cipher_flag = ChaCha20.new(key=key, nonce=iv_flag)
ciphertext_flag = cipher_flag.encrypt(b"tzcert{My_Secret_Flag}")
```

## Lessons Learned
*   **Never Reuse Nonces in Stream Ciphers:** This is the most critical takeaway. Reusing a (key, nonce) pair in a stream cipher completely breaks its security, enabling trivial known-plaintext attacks.
*   **Stream Cipher Mechanics:** Understanding that stream ciphers generate a keystream and XOR it with plaintext is fundamental to identifying and exploiting this vulnerability.
*   **Known-Plaintext Attacks:** When an attacker knows a portion of the plaintext and its corresponding ciphertext, they can recover the keystream and decrypt other messages encrypted with the same keystream.

## Flag
`NEBO{und3r57AnD1n9_57R3aM_C1PH3R5_15_51mPl3_a5_7Ha7}`
