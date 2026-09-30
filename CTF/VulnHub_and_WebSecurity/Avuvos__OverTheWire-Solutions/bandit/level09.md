# Bandit Level 9 -> 10

## Goal

Find the password in `data.txt`, which is a binary file. The password is preceded by several `=` characters.

## Key Concept

Extracting human-readable strings from binary files.

## Solution

```bash
strings data.txt | grep "===="
```

## Why This Works

- `strings`: extracts printable character sequences from binary files
- `grep "===="`: filters for lines containing the `=` pattern mentioned in the hint
