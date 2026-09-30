---
name: crypto-modern
description: "CTF modern cipher attacks. AES padding oracle, CBC bitflipping, ECB image oracle, AES-CFB-8 IV state forging, GCM key recovery, LFSR attacks, hash length extension, CRIME compression oracle, CBC-MAC forgery. Triggers: 'aes attack', 'padding oracle', 'cbc bitflip', 'ecb oracle', 'gcm attack', 'lfsr', 'hash length extension', 'compression oracle', 'cbc-mac forgery', 'modern cipher'."
---

# CTF Crypto: Modern Cipher Attacks

Padding oracle, CBC bitflip, ECB oracle, AES-GCM, LFSR, hash length extension.

---

## Phase 1: AES-ECB Detection & Oracle

```python
# ECB: same 16-byte plaintext block → same ciphertext
# Detect: submit 48 'A' bytes → 3 identical ciphertext blocks = ECB

import requests

TARGET = "https://TARGET/encrypt"

# Detect ECB:
ct = bytes.fromhex(requests.post(TARGET, data={"plaintext": "A"*48}).json()["ct"])
blocks = [ct[i:i+16] for i in range(0, len(ct), 16)]
if blocks[0] == blocks[1] == blocks[2]:
    print("ECB mode confirmed")

# ECB byte-at-a-time oracle:
def oracle(payload: bytes) -> bytes:
    ct = requests.post(TARGET, data={"plaintext": payload.hex()}).json()["ct"]
    return bytes.fromhex(ct)

# Recover secret: SECRET appended to payload → encrypt
def recover_secret():
    secret = b""
    for pos in range(256):
        pad_len = 15 - (pos % 16)
        block = pos // 16
        
        # Known block:
        known = b"A" * pad_len
        target = oracle(known)[block*16:(block+1)*16]
        
        # Try each byte:
        for b in range(256):
            test = b"A" * pad_len + secret + bytes([b])
            ct = oracle(test)[block*16:(block+1)*16]
            if ct == target:
                secret += bytes([b])
                break
    return secret
```

---

## Phase 2: CBC Padding Oracle

```python
from pwn import xor

def padding_oracle(ciphertext: bytes) -> bool:
    """Return True if padding is valid."""
    import requests
    r = requests.post("https://TARGET/decrypt", data={"ct": ciphertext.hex()})
    return "valid" in r.text.lower() or r.status_code == 200

def cbc_decrypt_block(prev_block: bytes, cipher_block: bytes) -> bytes:
    """Decrypt one 16-byte AES-CBC block using padding oracle."""
    intermediate = bytearray(16)
    
    for i in range(15, -1, -1):
        pad_byte = 16 - i
        # Craft previous block to produce desired padding:
        prev = bytearray(16)
        for j in range(i+1, 16):
            prev[j] = intermediate[j] ^ pad_byte
        
        # Brute-force current byte:
        for b in range(256):
            prev[i] = b
            test_iv = bytes(prev)
            if padding_oracle(test_iv + cipher_block):
                # Edge case: valid padding might be longer than expected
                if i == 15:
                    prev[i] = b ^ 1
                    if not padding_oracle(bytes(prev) + cipher_block):
                        continue
                intermediate[i] = b ^ pad_byte
                break
    
    return xor(intermediate, prev_block)
```

---

## Phase 3: CBC Bitflipping

```python
# Target: change specific byte in decrypted plaintext
# By XORing the previous ciphertext block at same position

def flip_byte(ciphertext: bytes, block_num: int, byte_pos: int, 
              from_byte: int, to_byte: int) -> bytes:
    """Flip byte in CBC decryption without key."""
    ct = bytearray(ciphertext)
    # Modify byte in PREVIOUS block (affects current block decryption):
    target_pos = (block_num - 1) * 16 + byte_pos
    ct[target_pos] ^= from_byte ^ to_byte
    return bytes(ct)

# Example: change 'user' to 'root' in cookie:
# cookie = IV + E("|role=user|name=bob|")
# position 6 in block 1 is 'u' in 'user'
# ct = flip_byte(ct, block_num=1, byte_pos=6, from_byte=ord('u'), to_byte=ord('r'))
# ... continue for all bytes of 'user' → 'admi' etc.
```

---

## Phase 4: Hash Length Extension

```python
# Vulnerability: HMAC-like but using H(secret || message)
# Extend message without knowing secret

# hashpumpy:
pip install hashpumpy --break-system-packages

import hashpumpy

# Known: H(secret || original_msg), len(secret), original_msg
original_hash = "abc123..."
original_msg = b"user=guest"
secret_len = 16  # known or guessed

# Append admin=true:
new_hash, new_msg = hashpumpy.hashpump(original_hash, original_msg, b"&admin=true", secret_len)
print(f"New hash: {new_hash}")
print(f"New message: {new_msg.hex()}")

# Submit new_msg as URL-encoded data with new_hash as signature
```

---

## Phase 5: AES-CFB-8 IV State Forging

```python
# CFB-8: 1 byte at a time feedback
# If IV is static/predictable → forge known plaintext

from Crypto.Cipher import AES
import os

# CFB-8 decrypt known structure:
def cfb8_attack(iv, key_or_oracle):
    """If IV reused: two ciphertexts with same IV → XOR to get P1 XOR P2"""
    pass

# Detect CFB-8 reuse: submit nullbytes, observe ciphertext = keystream
# Then use keystream to decrypt other messages with same IV
```

---

## Phase 6: LFSR Stream Cipher

```python
# Linear Feedback Shift Register → linear algebra attack
# Collect N bits of keystream (known plaintext XOR ciphertext)
# Solve for feedback polynomial using Berlekamp-Massey

def berlekamp_massey(s):
    """Find shortest LFSR for sequence s (bits)."""
    n = len(s)
    C, B = [1], [1]
    L, m, b = 0, 1, 1
    
    for i in range(n):
        d = s[i]
        for j in range(1, L+1):
            if j < len(C):
                d ^= C[j] & s[i-j]
        d &= 1
        if d == 0:
            m += 1
        elif 2*L <= i:
            T = C[:]
            for j in range(m, len(B)+m):
                if j < len(C):
                    C[j] ^= (d * pow(b, -1, 2)) * B[j-m] % 2
                else:
                    C.extend([0] * (j - len(C) + 1))
                    C[j] = (d * pow(b, -1, 2)) * B[j-m] % 2
            L, B, b, m = i+1-L, T, d, 1
        else:
            for j in range(m, len(B)+m):
                if j >= len(C):
                    C.extend([0] * (j - len(C) + 1))
                C[j] ^= (d * pow(b, -1, 2)) * B[j-m] % 2
            m += 1
    return C

# Recover state → predict all future keystream bits
```

---

## Phase 7: CRIME / Compression Oracle

```python
# Vulnerability: secret included in compressed ciphertext
# Compression is length-sensitive: correct prefix → more compression → shorter CT

import requests

TARGET = "https://TARGET"

def compress_oracle(prefix: str) -> int:
    """Get compressed+encrypted length."""
    r = requests.post(TARGET + "/compress", data={"text": prefix})
    return len(r.content)

def recover_secret():
    """Recover secret via compression oracle."""
    known = "secret="  # known prefix
    charset = "abcdefghijklmnopqrstuvwxyz0123456789{}_!?"
    
    while True:
        min_len = float('inf')
        best_char = None
        
        for c in charset:
            test = known + c
            length = compress_oracle(test)
            if length < min_len:
                min_len = length
                best_char = c
        
        known += best_char
        print(f"Known so far: {known}")
        
        if known.endswith('}'):  # flag format ends with }
            break
    
    return known
```

---

## Phase 8: CBC-MAC Forgery

```python
# CBC-MAC: MAC = AES_CBC(secret, msg)[-16:]
# Length extension: m1||m2 valid MAC = m3
# If MAC(m1) = t1, then MAC(m1 || (m2 XOR t1)) = MAC(m2)

from pwn import xor

def cbc_mac_forge(mac1: bytes, msg1: bytes, msg2: bytes) -> tuple:
    """Forge CBC-MAC by length extension."""
    # New message: msg1 + modified_msg2
    modified_block_0 = xor(msg2[:16], mac1)  # XOR first block of msg2 with mac of msg1
    forged_msg = msg1 + modified_block_0 + msg2[16:]
    # MAC of forged_msg = MAC of msg2 (with key)
    return forged_msg
```

---

## Output

Save to `.omop/engagement/ctf/crypto/`:
- `attack.py`: cipher attack script
- `decrypted.txt`: recovered plaintext
- `flag.txt`: extracted flag

## Next Phase

→ `ctf-crypto-rsa` for RSA attacks
→ `ctf-crypto-ecc` for elliptic curve attacks
