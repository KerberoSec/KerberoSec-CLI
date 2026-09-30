# Bandit Level 26 -> 27

## Goal

Use the setuid binary while in bandit26's shell.

## Key Concept

Leveraging setuid binaries from an escaped shell.

## Solution

After escaping to a proper shell in level 25 (via the vim trick):

```bash
./bandit27-do cat /etc/bandit_pass/bandit27
```

## Why This Works

The `bandit27-do` binary has the setuid bit set for bandit27. Running it allows reading bandit27's password file.
