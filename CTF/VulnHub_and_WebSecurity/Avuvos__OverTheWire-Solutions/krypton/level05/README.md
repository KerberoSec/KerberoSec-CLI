# Krypton Level 5 -> 6

## Goal

Recover the repeated-key cipher key and obtain the password for level 6.

## Key Concept

This is Level 4 but with an **unknown key length**. We brute-force the key length by looping over possible values.

## Input

We're given:

- A ciphertext to decrypt: `BELOSZ`
- Extra ciphertext samples (`cipher_texts/found*.txt`) encrypted with the **same repeated key**

## Approach

1. **Loop over possible key lengths (1-19)**
   Since we don't know the key length, we try each length and apply the same frequency analysis from Level 4.

2. **Use top-1 candidate per position**
   With unknown key length, we use `top_n=1` to reduce output and find the most likely key per length.

3. **Identify the correct key length**
   The correct key length (9) produces readable plaintext.

## Result

Key length: `9`

Plaintext: `RANDOM`

## Solution

`solve.py`: the core Vigenère decryption logic lives in `lib/vigenere.py`.

From the `krypton/` directory:

```bash
uv run level05/solve.py
```

To brute-force all key lengths and see all candidates:

```bash
uv run level05/solve.py --all
```
