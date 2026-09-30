# Bandit Level 19 -> 20

## Goal

Use the setuid binary to read the password for the next level.

## Key Concept

Setuid binaries and privilege escalation.

## Solution

```bash
./bandit20-do cat /etc/bandit_pass/bandit20
```

## Why This Works

The `bandit20-do` binary has the setuid bit set, meaning it runs with the permissions of its owner (bandit20), not the user executing it. This allows bandit19 to read files that only bandit20 can access.

You can verify the setuid bit with:

```bash
ls -l bandit20-do
```

The `s` in the permissions indicates setuid.
