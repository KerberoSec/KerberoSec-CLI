# Krypton Level 1 -> 2

## Goal

Decode the ciphertext and obtain the password for level 2.

## Key Concept

Caesar cipher (ROT-N), brute forced across all offsets.

## Given

The level file at `/krypton/krypton1/krypton2` contains:

`YRIRY GJB CNFFJBEQ EBGGRA`

## Solution

`solve.py`

From the `krypton/` directory, print all 26 candidates:

```bash
uv run level01/solve.py --all
```

The correct offset is 13:

`LEVEL TWO PASSWORD ROTTEN`
