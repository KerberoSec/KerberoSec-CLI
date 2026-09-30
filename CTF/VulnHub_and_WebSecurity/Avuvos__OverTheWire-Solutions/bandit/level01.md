# Bandit Level 1 -> 2

## Goal

Read the password from a file named `-` in the home directory.

## Key Concept

Handling filenames that start with special characters (like `-`).

## Solution

A filename starting with `-` is interpreted as a command option. To read it, use a path prefix:

```bash
cat ./-
```

Alternatively:

```bash
cat < -
```

## Why This Works

The `./` prefix tells the shell to treat `-` as a file in the current directory rather than as stdin or an option flag.
