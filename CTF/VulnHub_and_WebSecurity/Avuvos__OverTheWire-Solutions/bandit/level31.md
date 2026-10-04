# Bandit Level 31 -> 32

## Goal

Push a file to a remote git repository.

## Key Concept

Git push and `.gitignore`.

## Solution

Clone the repository:

```bash
mkdir /tmp/git31
cd /tmp/git31
git clone ssh://bandit31-git@localhost:2220/home/bandit31-git/repo
cd repo
```

Read the instructions:

```bash
cat README.md
```

Create the required file. Note: `.gitignore` blocks `.txt` files, so remove that rule first:

```bash
rm .gitignore
echo "May I come in?" > key.txt
git add key.txt
git commit -m "Add key file"
git push
```

The push response contains the password.

## Why This Works

The `.gitignore` file prevents certain files from being tracked. By removing it, we can add and push the required file. The server responds with the password upon successful push.
