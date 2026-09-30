# Krypton Level 4 -> 5

## Goal

Recover the repeated-key cipher key and obtain the password for level 5.

## Key Concept

Vigenère / repeated-key Caesar shifts (key length is known).

## Input

We’re given:

- A ciphertext to decrypt: `HCIKV RJOX`
- Extra ciphertext samples (`cipher_texts/found*.txt`) encrypted with the **same repeated key**

## Approach

1. **Exploit the known key length (6)**
   For a repeated-key cipher, every 6th character was shifted by the same key letter.
   So we split the ciphertexts into 6 “streams”:
   - stream 0: positions 0, 6, 12, …
   - stream 1: positions 1, 7, 13, …
   - …

2. **Important alignment detail: don’t concatenate files naively**
   Each `found*.txt` was encrypted starting at key index 0, so the modulo-6 alignment
   resets at the start of every file.
   That means we must slice **each file independently** into the 6 streams and only
   then combine stream 0 across files, stream 1 across files, etc.

3. **Frequency guess per key position**
   In English, `E` is typically the most common letter.
   For each stream, we take the most frequent cipher letters (top 2) and assume each
   could be the encryption of `E` for that position. Each guess produces a candidate
   key letter (shift).

4. **Try all combinations**
   We take one candidate key letter per position (cartesian product), build 6 Caesar
   decode tables (one per position), and decrypt `HCIKV RJOX`.
   While decrypting, we advance the key index only for A: Z characters (spaces don’t
   consume key characters).

## Result

One combination yields a clear English plaintext:

`CLEAR TEXT`

The corresponding key is:

`FREKEY`

## Solution

`solve.py`: the core Vigenère decryption logic lives in `lib/vigenere.py`.

From the `krypton/` directory:

```bash
uv run level04/solve.py
```

To print all candidate keys/decodes (for debugging):

```bash
uv run level04/solve.py --all
```
