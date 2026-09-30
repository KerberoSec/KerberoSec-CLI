# Writeup Formatter
This Python automation script processes HackTheBox-style writeups written in Obsidian for Jekyll blogs. It prepares `.md` files with proper front matter, optimizes and renames images, rewrites image paths, and formats everything for SEO and publishing.

## ✅ Features
- 🔄 Converts local Obsidian `.md` files into `_posts/YYYY-MM-DD-title.md` (Date is chosen randomly from the past 1.5 years)
- 🏷️ Automatically generates front matter with SEO-friendly tags
- 🖼️ Resizes and compresses images; updates all image paths to `/assets/images/...`
- 📁 Ensures proper Jekyll folder structure: `_posts/`, `assets/images/`
- 🧠 Clean structure ready for Jekyll blog deployment

## 📁 Folder Structure
### Before Running (`htb_writeups/`)
```yaml
htb_writeups/
├── forest/
│   ├── forest.md             # Optional: if missing, script auto-creates
│   └── Attachments/
│       ├── screen1.png       # Optional: original images, renamed + optimized
├── monteverde/
│   ├── monteverde.md
│   └── Attachments/
│       └── screenshot.jpg
writeup-formatter.py        # The automation script
```

### After Execution
```yaml
_posts/
├── 2024-10-01-forest.md        # Front matter + updated image links
├── 2024-09-12-monteverde.md

assets/
└── images/
    ├── forest1.png             # Renamed + optimized
    ├── forest2.png
    └── monteverde1.jpg
```

## Front Matter Example
```yaml
---
title: "Forest"
date: 2024-08-21
categories: HTB
tags: ["htb", "hackthebox", "writeup", "forest", "cybersecurity", "ctf"]
---
```

## ✅ What You Need to Do
- Create one folder per box under `htb_writeups/`
- Inside each, place:
    - `boxname.md`: the writeup (same name as folder, This is optional. If missing,   script auto-creates)
    - `Attachments/`: any screenshots or images
- Then run the script from your root project directory

## 🛠️ How to Use
1. Set up Python venv (recommended)
```python
python -m venv venv
venv\\Scripts\\activate        # on Windows
pip install pillow
```

2. Run the script
```python
python writeup-formatter.py
```
