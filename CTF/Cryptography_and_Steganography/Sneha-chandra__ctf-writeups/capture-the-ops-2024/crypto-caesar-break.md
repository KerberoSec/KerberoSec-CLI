# Crypto: Caesar's Secret

**Category:** Cryptography  
**Points:** 100  
**Difficulty:** Easy  
**Tools:** Python, frequency analysis

---

## Challenge Description

> "Julius had a secret. He thought shifting letters would keep it safe. Can you break it?"

**Ciphertext provided:**
```
PGS{e0g13_vf_g00_3nfl}
```

---

## Approach

### Step 1: Identify the Cipher

The format `PGS{...}` immediately suggested a Caesar/ROT cipher applied to the flag format `CTF{...}`. The shift from `C→P` is 13 positions, confirming ROT-13.

### Step 2: Decode with ROT-13

```python
import codecs
ciphertext = "PGS{e0g13_vf_g00_3nfl}"
plaintext = codecs.decode(ciphertext, 'rot_13')
print(plaintext)
# Output: CTF{r0t13_is_t00_3asy}
```

Or via command line:
```bash
echo "PGS{e0g13_vf_g00_3nfl}" | tr 'A-Za-z' 'N-ZA-Mn-za-m'
```

---

## Flag

```
CTF{r0t13_is_t00_3asy}
```

---

## Key Takeaway

**Pattern recognition beats brute force for classical ciphers.** If the flag format prefix is visible (`CTF` → `PGS`), calculate the shift directly instead of trying all 25 rotations:

```python
def caesar_break(ciphertext, known_plain="CTF", known_cipher="PGS"):
    shift = (ord(known_cipher[0]) - ord(known_plain[0])) % 26
    result = ""
    for c in ciphertext:
        if c.isalpha():
            base = ord('A') if c.isupper() else ord('a')
            result += chr((ord(c) - base - shift) % 26 + base)
        else:
            result += c
    return result

print(caesar_break("PGS{e0g13_vf_g00_3nfl}"))
```
