# Bandit Level 17 -> 18

## Goal

Find the changed line between `passwords.old` and `passwords.new`.

## Key Concept

File comparison with `diff`.

## Solution

```bash
diff passwords.old passwords.new
```

The output shows which lines differ. The new password is in `passwords.new`.

## Why This Works

The `diff` command compares files line by line and shows differences. The `<` prefix indicates lines from the first file, `>` from the second.
