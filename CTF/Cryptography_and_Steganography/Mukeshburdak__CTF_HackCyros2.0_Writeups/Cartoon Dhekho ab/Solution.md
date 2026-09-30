# Problem Title: "Cartoon Dekho ab" 
**Category:** Cryptography  

---

## How I Found This Challenge

I was browsing CTFlearn looking for something cryptography-related that wasn't just a Caesar cipher. "The Simpsons" caught my eye: the description hinted at counting fingers. Simpsons characters have **four fingers on each hand**, so eight total. Eight. As in **base 8. Octal.** That was the first lightbulb moment.

---

## What Even Is This Challenge?

We download a file: `ItsKrumpingTime.jpg`. It looks like a regular image. But in CTF world, files are almost never *just* what they look like. Time to dig deeper.

---

## Step 1: Peek Inside the Image File

The very first tool I reach for when I get a mystery file is `strings`. It scans any file: image, binary, whatever, and spits out all human-readable text hiding inside it.

```bash
strings ItsKrumpingTime.jpg
```

Scrolling through the output, buried near the end:

```
Ahh! Realistically the Simpsons would use octal instead of decimal!
encoded = 152 162 152 145 162 167 150 172 153 162 145 170 141 162
key = chr(SolutionToDis(110 157 167 040 155 165 143 150 ...))
key = key + key + chr(ord(key)-4)
print(DecodeDat(key=key, text=encoded))
```

Okay so the challenge literally handed us a **pseudocode recipe** to find the flag. We just need to follow the instructions. Let's break them down one at a time.

---

## Step 2: Decode the Encoded Message (Octal → ASCII)

The `encoded` variable holds a bunch of numbers. The hint says Simpsons use octal, so these are **base-8 numbers**. Each one converts to a decimal value, and that decimal maps to an ASCII character (a letter).

```python
# decode_encoded.py

encoded = "152 162 152 145 162 167 150 172 153 162 145 170 141 162"

# Split into a list, convert each from base 8 → decimal → ASCII character
chars = [chr(int(n, 8)) for n in encoded.split()]
result = ''.join(chars)

print("Decoded encoded text:", result)
```

**Output:**
```
Decoded encoded text: jrjerwhzkrexar
```

This is our **ciphertext**: still scrambled, but now in readable characters. We need the key to unscramble it.

---

## Step 3: Crack the Key (Layer 1: Octal Again)

The `key` line contains another huge blob of octal numbers wrapped in a mystery function called `SolutionToDis(...)`. Let's ignore the fancy function name and just decode the numbers the same way:

```python
# decode_key_hint.py

key_octal = "110 157 167 040 155 165 143 150 040 144 151 144 040 115 141 147 147 151 145 040 157 162 151 147 151 156 141 154 154 171 040 143 157 163 164 077 040 050 104 151 166 151 144 145 144 040 142 171 040 070 054 040 164 157 040 164 150 145 040 156 145 141 162 145 163 164 040 151 156 164 145 147 145 162 054 040 141 156 144 040 164 150 145 156 040 160 154 165 163 040 146 157 165 162 051"

hint = ''.join([chr(int(n, 8)) for n in key_octal.split()])
print(hint)
```

**Output:**
```
How much did Maggie originally cost? (Divided by 8, to the nearest integer, and then plus four)
```

A trivia question! The `SolutionToDis` function was just asking us to **solve a riddle** and feed the answer as the key character. Classic CTF.

---

## Step 4: Answer the Riddle (Layer 2: Simpsons Trivia)

This is where knowing your Simpsons pays off. In the iconic opening credits, Maggie gets scanned at the supermarket checkout and rings up as:

> **$847.63**

Now the math:
```
$847.63 ÷ 8 = $105.95  →  rounds to  106
106 + 4 = 110
chr(110) = 'n'
```

So `key = 'n'` at this point.

---

## Step 5: Build the Full Key (Layer 3: String Manipulation)

Back in the pseudocode, the key gets transformed:

```python
key = key + key + chr(ord(key) - 4)
```

Let's trace through this in Python:

```python
>>> key = 'n'
>>> key = key + key + chr(ord('n') - 4)
>>> key
'nnj'
```

Breaking it down:
- `key + key` → `'nn'`
- `ord('n')` → 110, minus 4 → 106, `chr(106)` → `'j'`
- Combined: **`'nnj'`**

That's our final key.

---

## Step 6: Decrypt with Vigenère Cipher

The `DecodeDat` function is a **Vigenère cipher** decoder. This cipher works by shifting each letter of the ciphertext *backwards* by the corresponding letter of the repeating key.

Here's how it works visually:

```
Ciphertext:  j  r  j  e  r  w  h  z  k  r  e  x  a  r
Key:         n  n  j  n  n  j  n  n  j  n  n  j  n  n   ← repeats
             ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓
Plaintext:   w  e  a  r  e  n  u  m  b  e  r  o  n  e
```

The decryption formula for each character:
```
plaintext = chr( ord(cipher_char) - ord(key_char) + 26 ) mod 26 + ord('a')
```

```python
# decrypt.py

ciphertext = "jrjerwhzkrexar"
key = "nnj"

plaintext = ""
for i, c in enumerate(ciphertext):
    shift = ord(key[i % len(key)]) - ord('a')
    decrypted = chr((ord(c) - ord('a') - shift) % 26 + ord('a'))
    plaintext += decrypted

print("Flag:", plaintext)
```

**Output:**
```
Flag: wearenumberone
```

---

## 🚩 The Flag

```
cyros{wearenumberone}
```

---

The most important habit this taught me: **read everything**. The pseudocode in the image file was basically a step-by-step solution: I just had to execute it.

---
