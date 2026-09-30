# Bandit Level 25 -> 26

## Goal

Log into bandit26 which uses a restricted shell.

## Key Concept

Exploiting `more` pager to escape restricted environments.

## Solution

Check bandit26's shell:

```bash
cat /etc/passwd | grep bandit26
```

It uses a custom shell that displays text and exits. The trick is to make the terminal too small for the text.

1. Shrink your terminal window to just a few lines
2. SSH into bandit26:

```bash
ssh -i bandit26.sshkey bandit26@localhost -p 2220
```

3. The `more` pager activates due to small terminal
4. Press `v` to enter vim
5. In vim, set a proper shell:

```vim
:set shell=/bin/bash
:shell
```

6. Now read the password:

```bash
cat /etc/bandit_pass/bandit26
```

## Why This Works

The restricted shell pipes output through `more`. When the terminal is small, `more` waits for input. Vim can be launched from `more`, and vim can spawn a real shell.
