# Leviathan Level 0 → 1

## Objective
Find the password for leviathan1

## Approach
Logged in as leviathan0 and explored hidden directories.
Found a `.backup` folder containing `bookmarks.html`.
Used grep to search for leviathan credentials inside the file.

## Commands Used
```bash
ls -la
cd .backup
ls -la
grep -i "leviathan" bookmarks.html
```

## What I Learned
- Hidden directories starting with `.` are invisible to regular `ls`
- Always use `ls -la` to reveal hidden files
- `grep -i` for case-insensitive searching in large files
- Sensitive data is often stored in plain text config files
