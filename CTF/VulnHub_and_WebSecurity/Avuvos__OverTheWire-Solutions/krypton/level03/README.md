# Krypton Level 3 -> 4

## Goal

Break the substitution cipher and obtain the password for level 4.

## Key Concept

Frequency analysis on substitution ciphers.

## Input

We're given a ciphertext encrypted with a substitution cipher and access to additional encrypted files (`found1.txt`, `found2.txt`, `found3.txt`) that use the same key.

Since all files share the same key, we can combine them to get a large sample. With enough text, letter frequencies match English frequencies, allowing us to deduce the key.

## Approach

1. **Trigrams**: Map the most common cipher trigram to "THE", second to "AND". This gives us 6 reliable letter mappings.

2. **Bigrams**: Match cipher bigrams to common English bigrams (TH, HE, IN, ER, AN, etc.) to derive more mappings.

3. **Frequency**: Fill remaining letters by matching frequency positions.

4. **Manual fixes**: A few letters (K, Y, A, I) don't appear in uniquely identifiable n-grams and require manual assignment.

## Solution

`solve.py`

From the `krypton/` directory:

```bash
uv run level03/solve.py
```
