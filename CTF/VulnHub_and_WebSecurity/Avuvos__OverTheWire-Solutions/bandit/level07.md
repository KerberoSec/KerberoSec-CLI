# Bandit Level 7 -> 8

## Goal

Find the password in `data.txt` next to the word "millionth".

## Key Concept

Text searching with `grep`.

## Solution

```bash
cat data.txt | grep millionth
```

Or more efficiently:

```bash
grep millionth data.txt
```

## Why This Works

`grep` searches for patterns in text. It returns the entire line containing the match, which includes the password.
