# Bandit Level 30 -> 31

## Goal

Find the password hidden in a git tag.

## Key Concept

Git tags.

## Solution

Clone the repository:

```bash
mkdir /tmp/git30
cd /tmp/git30
git clone ssh://bandit30-git@localhost:2220/home/bandit30-git/repo
cd repo
```

List tags:

```bash
git tag
```

Show the tag contents:

```bash
git show secret
```

## Why This Works

Git tags are references to specific commits, often used for releases. They can contain messages or point to objects with sensitive data.
