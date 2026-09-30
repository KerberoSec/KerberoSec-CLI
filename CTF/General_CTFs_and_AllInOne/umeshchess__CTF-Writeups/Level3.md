# Leviathan Level 3 → 4

## Objective
Find the password for leviathan4

## Approach
Found `level3` SUID binary.
Ran ltrace to intercept strcmp: revealed hardcoded password "snlprintf".
Used that password to get leviathan4 shell.

## Commands Used
```bash
ls -la
./level3
ltrace ./level3
./level3
```

## What I Learned
- ltrace is extremely powerful for binary analysis
- strcmp reveals exact password comparisons
- Many CTF binaries hide passwords in plain strcmp calls
- Always ltrace before guessing passwords manually
