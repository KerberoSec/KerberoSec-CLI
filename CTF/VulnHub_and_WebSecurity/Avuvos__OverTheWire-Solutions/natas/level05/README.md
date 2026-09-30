# Natas Level 5 -> 6

## Goal

Find the password for natas6.

## Key Concept

Cookie manipulation.

## Solution

The page says: "Access disallowed. You are not logged in."

Inspecting the cookies reveals a `loggedin=0` cookie. Simply change this value to `1` and the server grants access.

`solve.py`

```bash
uv run level05/solve.py
```
