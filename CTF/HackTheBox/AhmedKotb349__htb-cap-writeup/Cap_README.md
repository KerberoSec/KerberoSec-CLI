# Cap: HackTheBox Write-up

> IDOR → cleartext credential exposure → password reuse → Linux capability abuse to root.
> **Difficulty:** Easy &nbsp;|&nbsp; **OS:** Linux (Ubuntu) &nbsp;|&nbsp; **Platform:** HackTheBox Labs

![Difficulty](https://img.shields.io/badge/difficulty-Easy-brightgreen)
![OS](https://img.shields.io/badge/OS-Linux-blue)
![Status](https://img.shields.io/badge/status-Rooted-success)

## TL;DR

A custom "Security Dashboard" web app let any logged-in user trigger a network capture, but the
download endpoint (`/data/{id}`) never checked that the requester actually owned the capture it
served. Swapping the ID exposed another user's traffic, which contained an FTP login sent in
plaintext. That password was reused on SSH, and a misassigned `cap_setuid` capability on the
system's Python interpreter turned that foothold into root in one line.

| # | Finding | CVSS 3.1 | Severity |
|---|---|---:|---|
| 1 | Insecure Direct Object Reference (IDOR) | 7.5 | High |
| 2 | Cleartext Credential Transmission (FTP) | 5.3 | Medium |
| 3 | Password Reuse Across Services | 6.5 | Medium |
| 4 | Excessive Linux Capability (`cap_setuid`) | 7.8 | High |

## Contents

```
.
├── report/
│   └── Cap_Pentest_Report.docx      # Full formal penetration-testing report
├── presentation/
│   └── index.html                   # Interactive walkthrough (open in any browser)
├── screenshots/                     # Evidence: nmap, IDOR, tshark, root shell
└── README.md
```

## Interactive walkthrough

Open [`presentation/index.html`](presentation/index.html) directly in a browser: no server
needed: for a scroll-driven, illustrated walkthrough of the full attack chain, or view it live
via GitHub Pages: **[link once Pages is enabled]**.

## Attack path

1. **Recon**: `nmap -sC -sV` reveals FTP (21), SSH (22), and a custom web app (80).
2. **Discover**: the app's "packet capture" feature reveals a `/data/{id}` URL pattern.
3. **Exploit (IDOR)**: changing the ID returns another user's capture with zero ownership check.
4. **Harvest**: `tshark -Y ftp` on the stolen capture reveals a plaintext FTP login.
5. **Foothold**: the same password is valid on SSH → interactive shell.
6. **Root**: `getcap -r /` shows `cap_setuid` on `/usr/bin/python3.8` → one-line privesc to root.

## Tools used

Nmap, Firefox, tshark (Wireshark), curl, ftp, ssh, Python 3, getcap, HackTheBox Pwnbox (Parrot OS).

## Disclaimer

This write-up covers a **retired** HackTheBox machine, shared for educational purposes in line
with HTB's community write-up guidelines. All testing was performed exclusively within HTB's
authorized lab environment.

---
Prepared by **Ahmed Abdelmoneim**, **Omar Wageeh**, and **Kareem Ayman**.
