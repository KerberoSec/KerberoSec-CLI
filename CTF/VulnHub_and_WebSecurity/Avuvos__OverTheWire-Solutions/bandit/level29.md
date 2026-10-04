# Bandit Level 29 -> 30

## Goal

Find the password hidden in a different branch.

## Key Concept

Git branches.

## Solution

Clone the repository:

```bash
mkdir /tmp/git29
cd /tmp/git29
git clone ssh://bandit29-git@localhost:2220/home/bandit29-git/repo
cd repo
```

List all branches:

```bash
git branch -a
```

Checkout the dev branch:

```bash
git checkout dev
```

Or view the file directly:

```bash
git show origin/dev:README.md
```

## Why This Works

The password is stored in a development branch, not the main branch. Developers sometimes leave sensitive data in non-production branches.
