# Bandit Level 5 -> 6

## Goal

Find a file with specific properties: human-readable, 1033 bytes, not executable.

## Key Concept

Using `find` with multiple conditions.

## Solution

```bash
find . -type f -size 1033c ! -executable -exec sh -c 'file -b "{}" | grep -q "text"' \; -print
```

Then read the file:

```bash
cat ./inhere/maybehere07/.file2
```

## Why This Works

- `-type f`: regular files only
- `-size 1033c`: exactly 1033 bytes (`c` = bytes)
- `! -executable`: not executable
- The `-exec` with `file` filters for human-readable content
