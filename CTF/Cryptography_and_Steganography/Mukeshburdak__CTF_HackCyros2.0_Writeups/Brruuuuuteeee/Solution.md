# Brruuuuuteeee: CTF Writeup

| Field           | Details                                              |
|-----------------|------------------------------------------------------|
| **Challenge**   | Brruuuuuteeee                                        |
| **Category**    | Crypto                                               |
| **Difficulty**  | ★☆☆☆☆                                                |
| **Tags**        | xor, repeating-key, vigenere-xor, known-plaintext    |
| **Flag format** | `cyros{...}`                                         |

---

## Table of Contents

1. [Challenge Description](#challenge-description)
2. [Given Data](#given-data)
3. [Background: Repeating-Key XOR](#background--repeating-key-xor)
4. [Analysis](#analysis)
5. [Solution](#solution)
   - [Step 1: Decode the hex ciphertext](#step-1--decode-the-hex-ciphertext)
   - [Step 2: Recognise the key hiding in plain sight](#step-2--recognise-the-key-hiding-in-plain-sight)
   - [Step 3: Decrypt with the repeating key](#step-3--decrypt-with-the-repeating-key)
   - [Step 4: Verify with known-plaintext derivation](#step-4--verify-with-known-plaintext-derivation)
6. [Result](#result)
7. [Lessons Learned](#lessons-learned)

---

## Challenge Description

> There is a technique called bruteforce.
>
> Message: `/,4*7`
>
> `4c554645445455045f68674d424f684d5e415e52494346495270747b784a`
>
> No key! Just brute .. brute .. brute ... :D

---

## Given Data

**"Message" (the key, disguised as a hint):**
```
/,4*7
```

**Ciphertext (hex, 30 bytes):**
```
4c554645445455045f68674d424f684d5e415e52494346495270747b784a
```

**Raw bytes (decimal):**
```
76 85 70 69 68 84 85 4 95 104 103 77 66 79 104 77 94 65 94 82 73 67 70 73 82 112 116 123 120 74
```

---

## Background: Repeating-Key XOR

Repeating-key XOR (also called Vigenère-XOR) extends single-byte XOR by cycling a multi-byte key over the plaintext:

```
ciphertext[i] = plaintext[i]  ^ key[i % len(key)]   (encryption)
plaintext[i]  = ciphertext[i] ^ key[i % len(key)]   (decryption)
```

For a 5-byte key and 30-byte message, the key repeats exactly **6 times**:

```
position:  0  1  2  3  4 | 5  6  7  8  9 | 10 11 12 13 14 | ...
key byte: k0 k1 k2 k3 k4 |k0 k1 k2 k3 k4 |k0  k1 k2 k3 k4 | ...
```

Key properties:

- **XOR is self-inverse**: the exact same operation encrypts and decrypts.
- **Known-plaintext attack**: knowing even one plaintext byte at position `i` reveals `key[i % len(key)]` directly: `key_byte = ciphertext[i] ^ plaintext[i]`.
- **Key length divides message length cleanly**: a strong structural hint that the key length is correct.

---

## Analysis

The challenge labels `/,4*7` as "Message", which initially looks like a plaintext hint or red herring. But XORing it byte-by-byte against the start of the ciphertext immediately reveals the flag prefix:

| Offset | CT byte | `^` | Key byte       | `=` | PT byte      |
|--------|---------|-----|----------------|-----|--------------|
| 0      | `0x4c`  | `^` | `0x2f` (`/`)   | `=` | `0x63` (`c`) |
| 1      | `0x55`  | `^` | `0x2c` (`,`)   | `=` | `0x79` (`y`) |
| 2      | `0x46`  | `^` | `0x34` (`4`)   | `=` | `0x72` (`r`) |
| 3      | `0x45`  | `^` | `0x2a` (`*`)   | `=` | `0x6f` (`o`) |
| 4      | `0x44`  | `^` | `0x37` (`7`)   | `=` | `0x73` (`s`) |

The first five plaintext bytes spell `c y r o s`: the flag prefix. The "Message" **is the key**, disguised as a hint. The "brute force" framing was pure misdirection.

---

## Solution

### Step 1: Decode the hex ciphertext

```python
ct_hex = "4c554645445455045f68674d424f684d5e415e52494346495270747b784a"
ct = bytes.fromhex(ct_hex)

print(f"Length : {len(ct)} bytes")
print(f"Bytes  : {list(ct)}")
```

Output:
```
Length : 30 bytes
Bytes  : [76, 85, 70, 69, 68, 84, 85, 4, 95, 104, 103, 77, 66, 79, 104, 77,
           94, 65, 94, 82, 73, 67, 70, 73, 82, 112, 116, 123, 120, 74]
```

---

### Step 2: Recognise the key hiding in plain sight

```python
ct   = bytes.fromhex("4c554645445455045f68674d424f684d5e415e52494346495270747b784a")
hint = b"/,4*7"

print("XORing hint against ciphertext start:\n")
for i, (c, h) in enumerate(zip(ct, hint)):
    pt_byte = c ^ h
    print(f"  offset {i}: 0x{c:02x} ^ 0x{h:02x} ('{chr(h)}') = 0x{pt_byte:02x} ('{chr(pt_byte)}')")
```

Output:
```
  offset 0: 0x4c ^ 0x2f ('/') = 0x63 ('c')
  offset 1: 0x55 ^ 0x2c (',') = 0x79 ('y')
  offset 2: 0x46 ^ 0x34 ('4') = 0x72 ('r')
  offset 3: 0x45 ^ 0x2a ('*') = 0x6f ('o')
  offset 4: 0x44 ^ 0x37 ('7') = 0x73 ('s')
```

The hint decodes to `cyros`: the flag prefix. `/,4*7` is the repeating key.

---

### Step 3: Decrypt with the repeating key

```python
ct  = bytes.fromhex("4c554645445455045f68674d424f684d5e415e52494346495270747b784a")
key = b"/,4*7"

pt = bytes(ct[i] ^ key[i % len(key)] for i in range(len(ct)))
print(f"Key       : {key}")
print(f"Plaintext : {pt.decode('ascii')}")
```

Output:
```
Key       : b'/,4*7'
Plaintext : cyros{y0u_Have_bruteforce_XOR}
```

---

### Step 4: Verify with known-plaintext derivation

As a sanity check: given the known flag prefix `cyros{`, we can re-derive the key independently:

```python
ct           = bytes.fromhex("4c554645445455045f68674d424f684d5e415e52494346495270747b784a")
known_prefix = b"cyros{"

print("Deriving key bytes from known prefix:\n")
for i, (c, p) in enumerate(zip(ct, known_prefix)):
    k = c ^ p
    print(f"  offset {i}: 0x{c:02x} ^ 0x{p:02x} ('{chr(p)}') = 0x{k:02x} ('{chr(k)}')")
```

Output:
```
  offset 0: 0x4c ^ 0x63 ('c') = 0x2f ('/')
  offset 1: 0x55 ^ 0x79 ('y') = 0x2c (',')
  offset 2: 0x46 ^ 0x72 ('r') = 0x34 ('4')
  offset 3: 0x45 ^ 0x6f ('o') = 0x2a ('*')
  offset 4: 0x44 ^ 0x73 ('s') = 0x37 ('7')
  offset 5: 0x54 ^ 0x7b ('{') = 0x2f ('/')
```

Offset 5 gives `0x2f` (`/`) again: the key is confirmed to repeat with period 5, matching `/,4*7` exactly.

---

## Result

```
Key  : /,4*7  (5-byte repeating key)
Flag : cyros{y0u_Have_bruteforce_XOR}
```

The key repeated 6 times across the 30-byte ciphertext:

```
Key stream : /,4*7/,4*7/,4*7/,4*7/,4*7/,4*7
Ciphertext : 4c554645445455045f68674d424f684d5e415e52494346495270747b784a
Plaintext  : cyros{y0u_Have_bruteforce_XOR}
```

---

## Lessons Learned

- **Read all given data carefully before assuming brute force.** The "Message" field contained the key the whole time: the "brute force" description was deliberate misdirection.
- **XOR any hint against the ciphertext immediately.** Five XOR operations revealed the flag prefix and confirmed the key in under a second: no loops needed.
- **Key length × repetitions = ciphertext length is a strong structural signal.** 5 × 6 = 30: the numbers fit perfectly and confirm the key period.
- **Known-plaintext is extremely powerful against XOR.** One known byte at position `i` directly reveals `key[i % keylen]` with a single operation.
- **Misdirection is a core CTF skill.** Challenge descriptions lie. Always test the given data first before reaching for a brute-force loop.

---
