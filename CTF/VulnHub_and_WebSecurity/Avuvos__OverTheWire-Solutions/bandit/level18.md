# Bandit Level 18 -> 19

## Goal

Read the password from `readme` when the shell immediately logs you out.

## Key Concept

Executing commands via SSH without an interactive shell.

## Solution

Pass the command directly to SSH:

```bash
ssh bandit18@bandit.labs.overthewire.org -p 2220 "cat readme"
```

Or force a different shell:

```bash
ssh bandit18@bandit.labs.overthewire.org -p 2220 -t /bin/sh
```

## Why This Works

The `.bashrc` file logs you out immediately. By passing a command directly to SSH, it executes before the logout. Alternatively, forcing a different shell bypasses the bash configuration.
