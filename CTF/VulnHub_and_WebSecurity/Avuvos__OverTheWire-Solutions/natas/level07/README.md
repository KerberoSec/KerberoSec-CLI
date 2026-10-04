# Natas Level 7 -> 8

## Goal

Find the password for natas8.

## Key Concept

Directory traversal / Local File Inclusion (LFI).

## Solution

The page has links using a `page` query parameter (e.g., `index.php?page=home`), hinting that it reads files from the system.

An HTML comment reminds us where passwords are stored in this wargame:

```html
<!-- hint: password for webuser natas8 is in /etc/natas_webpass/natas8 -->
```

Using directory traversal, navigate to `index.php?page=/etc/natas_webpass/natas8` to read the password file directly.

`solve.py`

```bash
uv run level07/solve.py
```
