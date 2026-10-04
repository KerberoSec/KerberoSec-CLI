# Knowledge Base

Personal collection of security research, CTF writeups, and technical documentation.

**Live site:** [onurcangnc.github.io/ctf_writeups](https://onurcangnc.github.io/ctf_writeups/)

## Structure

```
TryHackMe/          CTF challenge writeups
HackTheBox/         Machine writeups & roadmap
CheatSheets/        Quick reference guides
Medium/             Published articles
```

## How it works

Markdown files written in Obsidian are automatically converted to styled HTML pages via GitHub Actions on every push.

```
.md (Obsidian) → convert_md_to_html.py → .html (GitHub Pages)
```

**Stack:** Python 3.11, markdown2, GitHub Pages

## Adding content

1. Create a folder under the appropriate category (e.g. `HackTheBox/MachineName/`)
2. Write your `.md` file inside it
3. Place images in an `images/` subfolder
4. Push to `main`: the pipeline handles the rest

## Categories

| Directory | Content |
|-----------|---------|
| `TryHackMe/` | TryHackMe room writeups |
| `HackTheBox/` | HackTheBox machine writeups & progress tracker |
| `CheatSheets/` | Security reference guides & command sheets |
| `Medium/` | Articles published on Medium |

## Links

- [GitHub](https://github.com/onurcangnc)
- [Medium](https://medium.com/@onurcangnc)
- [LinkedIn](https://linkedin.com/in/onurcangnc)
