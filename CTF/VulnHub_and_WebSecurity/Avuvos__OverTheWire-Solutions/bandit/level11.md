# Bandit Level 11 -> 12

## Goal

Decode the ROT13-encoded password in `data.txt`.

## Key Concept

ROT13 cipher (letter substitution).

## Solution

```bash
cat data.txt | tr 'A-Za-z' 'N-ZA-Mn-za-m'
```

## Why This Works

ROT13 rotates each letter by 13 positions in the alphabet. The `tr` command translates characters:
- A-M becomes N-Z
- N-Z becomes A-M
- Same for lowercase

Since the alphabet has 26 letters, applying ROT13 twice returns the original text.
