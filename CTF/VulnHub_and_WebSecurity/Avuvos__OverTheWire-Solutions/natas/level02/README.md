# Natas Level 2 -> 3

## Goal

Find the password for natas3.

## Key Concept

Directory listing and exposed files.

## Solution

Inspecting the page source reveals an image at `/files/pixel.png`. This hints at a `/files/` directory.

Navigating to `/files/` shows directory listing is enabled, revealing a `users.txt` file containing the password for natas3.

`solve.py`

```bash
uv run natas/level02/solve.py
```
