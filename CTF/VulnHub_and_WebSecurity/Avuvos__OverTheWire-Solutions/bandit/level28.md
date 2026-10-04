# Bandit Level 28 -> 29

## Goal

Find a password that was removed from a git repository.

## Key Concept

Git history and previous commits.

## Solution

Clone the repository:

```bash
mkdir /tmp/git28
cd /tmp/git28
git clone ssh://bandit28-git@localhost:2220/home/bandit28-git/repo
cd repo
```

Check the commit history:

```bash
git log
```

View a previous commit where the password wasn't redacted:

```bash
git show <commit_hash>
```

Or checkout the previous commit:

```bash
git checkout HEAD~1
cat README.md
```

## Why This Works

Git preserves all history. Even if sensitive data is removed in later commits, it remains in the repository's history unless explicitly purged.
