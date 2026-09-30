# Bandit Level 6 -> 7

## Goal

Find a file somewhere on the server with specific ownership and size.

## Key Concept

System-wide file search with ownership filters.

## Solution

Search the entire filesystem:

```bash
find / -user bandit7 -group bandit6 -size 33c 2>/dev/null
```

Then read the file:

```bash
cat /var/lib/dpkg/info/bandit7.password
```

## Why This Works

- `/`: search from root
- `-user bandit7`: owned by user bandit7
- `-group bandit6`: owned by group bandit6
- `-size 33c`: exactly 33 bytes
- `2>/dev/null`: suppress permission denied errors
