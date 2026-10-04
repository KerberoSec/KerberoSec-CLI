# Krypton

Krypton is the cryptography-focused wargame from OverTheWire.

Unlike other games, many Krypton "passwords" are **non-sensitive puzzle strings** (especially early levels), so this directory may include them in results. Still: don't publish real credentials/tokens for anything that grants ongoing access.

## Level Overview

| Level | Cipher | Key Concept |
|-------|--------|-------------|
| [0](level00/)     | Base64 | Simple encoding (not encryption) |
| [1](level01/)     | ROT13  | Fixed-shift substitution |
| [2](level02/)     | Caesar | Unknown shift, brute-force |
| [3](level03/)     | Caesar | Frequency analysis to find shift |
| [4](level04/)     | Vigenère | Repeated-key cipher, known key length |
| [5](level05/)     | Vigenère | Unknown key length, brute-force loop |

## Shared Library (`lib/`)

Common crypto utilities are extracted into `lib/` to avoid duplication across levels:

| Module | Purpose |
|--------|---------|
| `caesar.py` | Caesar cipher decode + brute-force |
| `ngrams.py` | N-gram frequency counting |
| `vigenere.py` | Vigenère decryption via frequency analysis |

The `vigenere.py` module is the workhorse for levels 4-5, handling:
- Splitting ciphertext into position streams
- Guessing key letters from letter frequencies
- Building decode mappings and decrypting

## Running the Solvers

```bash
uv run krypton/level00/solve.py
uv run krypton/level01/solve.py --all
uv run krypton/level02/solve.py --all
uv run krypton/level03/solve.py
uv run krypton/level04/solve.py --all
uv run krypton/level05/solve.py --all
```

## Official Resources

- [OverTheWire Krypton](https://overthewire.org/wargames/krypton/)

## Connection Information

Check the official page for current host/port. Typical usage:

```bash
ssh krypton0@<host> -p <port>
```
