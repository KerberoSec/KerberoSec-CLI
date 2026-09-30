# Leviathan Level 1 → 2

## Objective
Find the password for leviathan2

## Approach
Found a SUID binary called `check` owned by leviathan2.
Ran it normally: asked for a password.
Used `ltrace` to trace library calls and intercept the strcmp comparison.
Discovered the hardcoded password comparison in real time.

## Commands Used
```bash
ls -la
./check
ltrace ./check
./check
```

## What I Learned
- `ltrace` traces library calls including strcmp
- SUID binaries run with owner's privileges
- Hardcoded passwords in binaries are easily extracted
- Always check file permissions with `ls -la`
