# Bandit Level 4 -> 5

## Goal

Find the human-readable file among several files in the `inhere` directory.

## Key Concept

Using the `file` command to identify file types.

## Solution

Check the type of each file:

```bash
file inhere/*
```

Or find only text files:

```bash
find ./inhere -type f -exec sh -c 'file -b "{}" | grep -q "text"' \; -print
```

Then read the human-readable file:

```bash
cat inhere/-file07
```

## Why This Works

The `file` command examines file contents to determine their type, regardless of extension. Human-readable files are identified as "ASCII text".
