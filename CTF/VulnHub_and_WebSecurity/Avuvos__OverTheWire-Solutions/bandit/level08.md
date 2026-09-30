# Bandit Level 8 -> 9

## Goal

Find the unique line in `data.txt` (the one that appears only once).

## Key Concept

Sorting and finding unique lines with `sort` and `uniq`.

## Solution

```bash
sort data.txt | uniq -u
```

## Why This Works

- `sort`: arranges lines alphabetically (required for `uniq` to work)
- `uniq -u`: prints only lines that appear exactly once

The `uniq` command only detects adjacent duplicates, which is why sorting first is essential.
