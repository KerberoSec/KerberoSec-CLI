# Krypton Level 2 -> 3

## Goal

Determine the Caesar shift and obtain the password for level 3.

## Key Concept

Caesar cipher (ROT-N).

## Solution

`solve.py`

From the `krypton/` directory, brute force all offsets:

```bash
uv run level02/solve.py --all
```

For the level-provided ciphertext, the correct offset is 12, yielding:

`CAESARISEASY`

## Alternative method (from the level hints)

The level also hints at a chosen-plaintext approach: encrypt something like `AAA` using the provided mechanism, then infer the shift from what `A` becomes.

Example: if `A -> M`, that’s an offset of 12.
