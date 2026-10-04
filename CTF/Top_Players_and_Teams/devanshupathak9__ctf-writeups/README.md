# 🚩 CTF Write-ups & Solutions

Welcome to my Capture The Flag (CTF) repository! This repository contains my write-ups and solutions for CTF challenges from various platforms and competitions. Feel free to explore the write-ups if you're looking for references or alternative approaches to solving similar challenges.

---

## 📂 Repository Layout

```
├── practice/   # Standalone challenges and write-ups from practice platforms (HTB, AdWorld, …)
├── writeups/   # Write-ups from time-boxed CTF competitions/events
├── handbook/   # Reusable notes, theory and cheat sheets
├── templates/  # Write-up template used for new challenges
└── tools/      # Helper scripts reused across challenges
```

**`practice/`** contains challenges I've solved on always-on platforms, grouped by platform.
**`writeups/`** holds challenges from specific competitions, grouped by event.

Each challenge folder is named `<category>_<challenge>` so the category is immediately visible, and every challenge follows the same internal layout:
```
web_timekorp/
├── writeup.md    # The write-up / solution
├── handout/      # Files provided by the organisers (source, binaries, Docker setup)
├── solve/        # My exploit / solver scripts and payloads
└── assets/       # Screenshots referenced by the write-up
```

Category prefixes: `web`, `pwn`, `rev`, `crypto`, `forensics`, `osint`, `misc`.
Only the parts a challenge actually needs are present.

---

## 🎯 Practice Challenges: [full index](./practice/README.md)

Standalone challenges from always-on practice platforms.

| Platform | Index |
| --- | --- |
| Hack The Box | [practice/hack-the-box](./practice/hack-the-box/) |
| AdWorld (XCTF) | [practice/adworld](./practice/adworld/) |

## 🏁 Event Write-ups: [full index](./writeups/README.md)

Challenges from time-boxed CTF competitions.

| Event | Index |
| --- | --- |
| EHAX CTF 2025 | [writeups/ehax-ctf-2025](./writeups/ehax-ctf-2025/) |
| Infobahn CTF 2025 | [writeups/infobahn-ctf-2025](./writeups/infobahn-ctf-2025/) |
| PatriotCTF 2025 | [writeups/patriot-ctf-2025](./writeups/patriot-ctf-2025/) |

---

## 🎯 Where to Practice

Platforms and resources I use to find challenges:

| Platform | What it's for |
| --- | --- |
| [Hack The Box](https://www.hackthebox.com/) | Machines, and the [HTB CTF](https://ctf.hackthebox.com/) events and Try Out labs |
| [HTB CTF Try Out](https://ctf.hackthebox.com/ctf/try-out) | Beginner-friendly starter challenges across all categories |
| [CTFtime](https://ctftime.org/) | Calendar of upcoming/ongoing CTF events, team rankings and archives |
| [picoCTF](https://picoctf.org/) | Great starting point for beginners |
| [AdWorld (XCTF)](https://adworld.xctf.org.cn/) | Large archive of categorised practice challenges |
---

## 📚 Handbook

Notes and theory that aren't tied to a single challenge: [handbook/](./handbook/README.md)

---
