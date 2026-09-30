# Bandit Level 32 -> 33

## Goal

Escape from the uppercase shell.

## Key Concept

Shell variables and escape techniques.

## Solution

The shell converts all input to uppercase, breaking most commands.

Use `$0` to escape:

```bash
$0
```

This spawns a new shell. Then read the password:

```bash
cat /etc/bandit_pass/bandit33
```

## Why This Works

`$0` is a shell variable containing the name of the current shell or script. Since it's a variable (not a command), it's not affected by the uppercase conversion. Executing it spawns a new shell instance.
