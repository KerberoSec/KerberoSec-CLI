# CTF Writeups

This repository contains my Capture The Flag (CTF) writeups.

I try to document the reasoning process, failed hypotheses, artifacts, and tools used along the way because, in my opinion, those are the best parts of a CTF challenge.

### [View the Live Website](https://dfmari.github.io/ctf_writeups/)

---

## Current Writeups

| Challenge / Series | Event | Category | Vulnerabilities / Techniques |
| --- | --- | --- | --- |
| **MSN Revive** | srdnlenCTF 2026 | Web | Missing authorization, object-level access control, path canonicalization / parser differential |
| **Whoami** | BelkaCTF #7 | DFIR | Windows memory forensics, MemProcFS, process / environment artifact analysis |
| **Locker** | BelkaCTF #7 | DFIR / Malware | MemProcFS, `findevil`, suspicious executable memory, process triage |

---

## BelkaCTF #7 Series

I participated in BelkaCTF #7 live and finished **33rd overall / 10th among students**.

The DFIR series revisits the challenges from scratch using freely available tools, with an emphasis on reproducibility and understanding the underlying artifacts rather than simply reproducing the flags.

Tools used include:

- MemProcFS
- Volatility 3
- standard Linux utilities
- additional free tools as they become relevant

---

## Repository

The site is authored primarily in Obsidian and exported to static HTML.
