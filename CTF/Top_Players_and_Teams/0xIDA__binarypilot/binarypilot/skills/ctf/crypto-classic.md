---
name: crypto-classic
description: "CTF classic cipher attacks. Vigenere key recovery, Kasiski examination, XOR frequency analysis, multi-byte XOR key recovery, OTP key reuse (many-time pad), cascade XOR, book cipher, homophonic substitution. Triggers: 'vigenere', 'classic cipher', 'substitution cipher', 'xor key recovery', 'many time pad', 'otp reuse', 'kasiski', 'cipher frequency analysis', 'cryptanalysis'."
---

# CTF Crypto: Classic Ciphers

Vigenere, XOR variants, OTP reuse, substitution ciphers.

---

## Phase 1: Identify Cipher Type

```python
# Check ciphertext properties:
# - All printable ASCII → likely XOR or substitution
# - Base64 encoded → likely AES/DES in some mode
# - Only letters (no digits/symbols) → likely classical (Vigenere, Caesar)
# - 1-to-1 frequency distribution → monoalphabetic substitution
# - Flat frequency distribution → polyalphabetic or XOR with key

import collections

def analyze(ct):
    freq = collections.Counter(ct)
    print("Unique chars:", len(freq))
    print("Top 10:", freq.most_common(10))
    print("Index of Coincidence (IoC):", 
          sum(v*(v-1) for v in freq.values()) / (len(ct)*(len(ct)-1)))
    # IoC ~0.065 = English text (monoalphabetic)
    # IoC ~0.038 = random (polyalphabetic / XOR with long key)

analyze("CIPHERTEXT")
```

---

## Phase 2: Vigenere: Known Plaintext Attack

```python
def vigenere_decrypt(ciphertext, key):
    result = []
    key_idx = 0
    for c in ciphertext:
        if c.isalpha():
            shift = ord(key[key_idx % len(key)].upper()) - ord('A')
            base = ord('A') if c.isupper() else ord('a')
            result.append(chr((ord(c) - base - shift) % 26 + base))
            key_idx += 1
        else:
            result.append(c)
    return ''.join(result)

def derive_key(ciphertext, known_plaintext):
    """Recover key from known plaintext (e.g., flag prefix 'CTF{')."""
    key = []
    for c, p in zip(ciphertext, known_plaintext):
        if c.isalpha() and p.isalpha():
            c_val = ord(c.upper()) - ord('A')
            p_val = ord(p.upper()) - ord('A')
            key.append(chr((c_val - p_val) % 26 + ord('A')))
    return ''.join(key)

# If flag format known:
cipher = "VJLQCQICXWQAJFIJASXM"
key = derive_key(cipher, "CTF{")
print("Key starts with:", key)
full = vigenere_decrypt(cipher, key)
print("Decrypted:", full)
```

---

## Phase 3: Kasiski + Frequency Attack

```python
from math import gcd
from functools import reduce
from collections import Counter

def kasiski(ciphertext, min_seq=3):
    """Find repeated sequences → GCD of distances = key length."""
    ct = ''.join(c.upper() for c in ciphertext if c.isalpha())
    distances = []
    for seq_len in range(min_seq, 6):
        seen = {}
        for i in range(len(ct) - seq_len):
            seq = ct[i:i+seq_len]
            if seq in seen:
                for prev_pos in seen[seq]:
                    distances.append(i - prev_pos)
                seen[seq].append(i)
            else:
                seen[seq] = [i]
    if distances:
        kl = reduce(gcd, distances)
        print(f"Key length: {kl}, Distances: {sorted(set(distances))}")
        return kl
    return None

def frequency_break_vigenere(ciphertext, key_length):
    """Break Vigenere by frequency analysis on each column."""
    ct = [c.upper() for c in ciphertext if c.isalpha()]
    english_freq = [0.082,0.015,0.028,0.043,0.127,0.022,0.020,0.061,0.070,
                   0.002,0.008,0.040,0.024,0.067,0.075,0.019,0.001,0.060,
                   0.063,0.091,0.028,0.010,0.023,0.002,0.020,0.001]
    key = []
    for i in range(key_length):
        group = [ct[j] for j in range(i, len(ct), key_length)]
        best_shift, best_score = 0, -1
        for shift in range(26):
            dec = [chr((ord(c) - ord('A') - shift) % 26 + ord('A')) for c in group]
            freq = Counter(dec)
            score = sum(freq.get(chr(j+65), 0) / len(group) * english_freq[j]
                       for j in range(26))
            if score > best_score:
                best_score, best_shift = score, shift
        key.append(chr(best_shift + ord('A')))
    return ''.join(key)

ct = "CIPHERTEXT_HERE"
kl = kasiski(ct)
if kl:
    key = frequency_break_vigenere(ct, kl)
    print(f"Key: {key}")
    print(f"Decrypted: {vigenere_decrypt(ct, key)}")
```

---

## Phase 4: Multi-Byte XOR Key Recovery

```python
from collections import Counter

def score_english(data):
    freq = Counter(data)
    return freq.get(ord(' '), 0) + sum(freq.get(c, 0) for c in range(ord('a'), ord('z')+1))

def find_key_length(ct, max_len=40):
    best_len, best_score = 1, 0
    for kl in range(1, max_len + 1):
        total = 0
        for col in range(kl):
            group = ct[col::kl]
            best_col = max(score_english(bytes(b ^ k for b in group)) for k in range(256))
            total += best_col
        if total > best_score:
            best_score, best_len = total, kl
    return best_len

def recover_xor_key(ct, key_length):
    key = []
    for col in range(key_length):
        group = ct[col::key_length]
        best_k = max(range(256), key=lambda k: score_english(bytes(b ^ k for b in group)))
        key.append(best_k)
    return bytes(key)

ct = open("encrypted.bin", "rb").read()
kl = find_key_length(ct)
key = recover_xor_key(ct, kl)
print(f"Key ({kl} bytes): {key.hex()}")
plaintext = bytes(c ^ key[i % len(key)] for i, c in enumerate(ct))
print(plaintext[:200])
```

---

## Phase 5: OTP Reuse (Many-Time Pad)

```python
from pwn import xor

# Two ciphertexts with same key: c1 XOR c2 = p1 XOR p2
c1 = bytes.fromhex("...")
c2 = bytes.fromhex("...")

# If p1 is known:
p1 = b"Hello world, this is the first message."
p2 = xor(xor(c1, c2), p1)
print("p2:", p2)

# Crib dragging (unknown p1):
def crib_drag(c1, c2, crib):
    xored = xor(c1[:min(len(c1),len(c2))], c2[:min(len(c1),len(c2))])
    for pos in range(len(xored) - len(crib)):
        candidate = xor(xored[pos:pos+len(crib)], crib)
        if all(32 <= b < 127 for b in candidate):
            print(f"pos {pos}: {candidate}")

crib_drag(c1, c2, b" the ")   # try common English words
crib_drag(c1, c2, b"flag{")   # try flag format
```

---

## Phase 6: Substitution Cipher (quipqiup)

```bash
# monoalphabetic substitution → quipqiup.com

# Online: https://quipqiup.com
# Paste ciphertext → "Solve" → check frequency-based result

# Manual frequency analysis:
python3 -c "
from collections import Counter
ct = 'CIPHERTEXT_HERE'
freq = Counter(c for c in ct if c.isalpha())
print('Most common:', freq.most_common(10))
# E=12.7%, T=9.1%, A=8.2%, O=7.5%, I=7.0%, N=6.7%
# Most common cipher char → E
"

# Atbash quick check:
python3 -c "
ct = 'CIPHERTEXT'
print(''.join(chr(ord('Z')-(ord(c)-ord('A'))) if 'A'<=c<='Z' else c for c in ct.upper()))
"
```

---

## Phase 7: Cascade XOR Brute Force

```python
ct = bytes.fromhex("...")

# Pattern: c[i] = p[i] ^ c[i-1]
for first_byte in range(256):
    flag = [first_byte]
    for i in range(1, len(ct)):
        flag.append(ct[i] ^ flag[i-1])
    decoded = bytes(flag)
    if all(32 <= b < 127 for b in decoded):
        print(f"first={first_byte:#04x}: {decoded}")
```

---

## Output

Save to `.omop/engagement/ctf/crypto/`:
- `key.txt`: recovered key
- `plaintext.txt`: decrypted message

## Next Phase

→ `ctf-crypto-rsa` for RSA attacks
→ `ctf-crypto-ecc` for ECC attacks
