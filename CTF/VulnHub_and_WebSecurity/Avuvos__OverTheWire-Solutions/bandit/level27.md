# Bandit Level 27 -> 28

## Goal

Clone a git repository and find the password.

## Key Concept

Git basics: cloning repositories.

## Solution

Create a working directory and clone:

```bash
mkdir /tmp/git27
cd /tmp/git27
git clone ssh://bandit27-git@localhost:2220/home/bandit27-git/repo
```

Enter the current password when prompted.

Read the readme:

```bash
cat repo/README
```

## Why This Works

The password is stored directly in the repository's README file.
