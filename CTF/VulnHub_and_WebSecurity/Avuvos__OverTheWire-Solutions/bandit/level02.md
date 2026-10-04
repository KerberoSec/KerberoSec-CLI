# Bandit Level 2 -> 3

## Goal

Read the password from a file called `spaces in this filename`.

## Key Concept

Handling filenames with spaces.

## Solution

Use quotes or escape the spaces:

```bash
cat "spaces in this filename"
```

Or with backslashes:

```bash
cat spaces\ in\ this\ filename
```

## Why This Works

Spaces normally separate command arguments. Quoting or escaping tells the shell to treat the entire string as a single filename.
