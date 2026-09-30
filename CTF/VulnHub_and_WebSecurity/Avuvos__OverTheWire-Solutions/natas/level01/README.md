# Natas Level 1 -> 2

## Goal

Find the password for natas2 hidden in the page.

## Key Concept

Bypassing client-side restrictions (disabled right-click).

## Solution

Same as level 0: the password is in an HTML comment. The page tries to block right-click via JavaScript, but this doesn't prevent viewing source via keyboard shortcuts or browser menu.

`solve.py`

```bash
uv run natas/level01/solve.py
```
