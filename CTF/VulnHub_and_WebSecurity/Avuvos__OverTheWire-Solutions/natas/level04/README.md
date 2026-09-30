# Natas Level 4 -> 5

## Goal

Find the password for natas5.

## Key Concept

HTTP Referer header spoofing.

## Solution

The page says access is only allowed for users coming from `http://natas5.natas.labs.overthewire.org/`.

The server checks the `Referer` HTTP header to verify where the request originated. Simply set this header to the expected URL to bypass the check.

`solve.py`

```bash
uv run level04/solve.py
```
