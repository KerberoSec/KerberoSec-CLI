# Bandit Level 3 -> 4

## Goal

Find and read a hidden file in the `inhere` directory.

## Key Concept

Hidden files in Linux (files starting with `.`).

## Solution

List all files including hidden ones:

```bash
ls -la inhere/
```

Then read the hidden file:

```bash
cat inhere/...Hiding-From-You
```

## Why This Works

Files beginning with `.` are hidden from normal `ls` output. The `-a` flag shows all files including hidden ones.
