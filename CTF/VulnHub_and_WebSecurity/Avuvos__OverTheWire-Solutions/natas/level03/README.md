# Natas Level 3 -> 4

## Goal

Find the password for natas4.

## Key Concept

Robots.txt and hidden directories.

## Solution

The page hints: "Not even Google will find it this time..."

This is a reference to `robots.txt`: the file that tells search engines what not to index. Checking `/robots.txt` reveals:

```
Disallow: /s3cr3t/
```

Navigating to `/s3cr3t/` shows a directory listing with `users.txt` containing the password.

`solve.py`

```bash
uv run level03/solve.py
```
