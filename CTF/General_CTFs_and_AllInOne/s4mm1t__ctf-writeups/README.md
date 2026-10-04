# CTF Writeups

My personal collection of CTF writeups for Hack The Box, TryHackMe, PicoCTF, and other cybersecurity challenges.

The focus of this repository is not only on commands and flags. Each writeup explains the reasoning behind the steps: what I noticed, why I chose a technique, what failed, and what finally worked.

![Platforms](https://img.shields.io/badge/platforms-HackTheBox%20%7C%20TryHackMe%20%7C%20PicoCTF-111827?style=flat-square)
![Writeups](https://img.shields.io/badge/writeups-0-111827?style=flat-square)
![Focus](https://img.shields.io/badge/focus-web%20%7C%20crypto%20%7C%20osint%20%7C%20pwn-111827?style=flat-square)

## Why This Repo Exists

People often search for CTF solutions when they are stuck, but a command-only solution does not teach much. These notes are written to show the thought process:

- why a specific enumeration step made sense
- what each result suggested
- how dead ends were ruled out
- which security concept the challenge was testing
- what I would try faster next time

If you are learning offensive security, web exploitation, Linux privilege escalation, OSINT, crypto, or general CTF methodology, this repo is meant to be useful as a learning journal and reference.

## Writeups

### Hack The Box

| Machine | OS | Difficulty | Category | Date | Writeup |
| --- | --- | --- | --- | --- | --- |
| Coming soon | - | - | - | - |

### TryHackMe

| Room | Difficulty | Category | Date | Writeup |
| --- | --- | --- | --- | --- |
| Coming soon | - | - | - | - |

### PicoCTF

| Challenge | Category | Points | Year | Writeup |
| --- | --- | --- | --- | --- |
| Old Sessions | Web Exploitation | Easy | 2026-05-31 | [writeup](PicoCTF/OldSessions/writeup.md) |

### Other CTFs

| Challenge | Event | Category | Date | Writeup |
| --- | --- | --- | --- | --- |
| Coming soon | - | - | - | - |

## Categories

| Category | Topics |
| --- | --- |
| Web | SQL injection, XSS, SSRF, LFI/RFI, auth bypass, file upload |
| Crypto | RSA, XOR, hashing, encoding, classical ciphers, padding attacks |
| Pwn | buffer overflows, ROP, ret2libc, format strings, heap basics |
| OSINT | recon, metadata, geolocation, usernames, public records |
| Forensics | memory dumps, PCAPs, file carving, steganography |
| Reversing | binaries, strings, static analysis, dynamic analysis |
| Privilege Escalation | Linux enumeration, SUID, sudo rules, cron jobs, PATH abuse |

## Tools I Use

| Area | Tools |
| --- | --- |
| Recon | `nmap`, `rustscan`, `ffuf`, `gobuster`, `subfinder` |
| Web | `Burp Suite`, `curl`, `sqlmap`, `nikto`, browser devtools |
| Exploitation | `pwntools`, `gdb`, `gef`, `peda`, `searchsploit` |
| Crypto | `CyberChef`, `hashcat`, `john`, Python scripts |
| OSINT | `theHarvester`, `sherlock`, Google dorks, reverse image search |
| Forensics | `binwalk`, `exiftool`, `strings`, `foremost`, `wireshark` |
| General | `Python`, `Bash`, `jq`, custom helper scripts |

## Repository Structure

```text
ctf-writeups/
├── HackTheBox/
│   └── MachineName/
│       ├── writeup.md
│       └── screenshots/
├── TryHackMe/
│   └── RoomName/
│       ├── writeup.md
│       └── screenshots/
├── PicoCTF/
│   └── ChallengeName/
│       ├── writeup.md
│       └── screenshots/
├── tools/
│   └── README.md
└── templates/
    └── writeup-template.md
```

## Writeup Style

Every writeup should answer three questions:

1. What did I observe?
2. Why did that observation matter?
3. How did it lead to the next step?

Example:

```text
I started with directory enumeration because the homepage had no obvious functionality,
while the nmap scan only exposed port 80. Finding /uploads immediately changed the
direction of the test because upload paths often lead to file type validation issues,
path disclosure, or stored payload execution.
```

## How I Add New Writeups

1. Solve the challenge and take notes while working.
2. Copy `templates/writeup-template.md` into the challenge folder as `writeup.md`.
3. Fill the writeup in English, focusing on reasoning and lessons learned.
4. Add screenshots only when they clarify the exploit path.
5. Update the table in this README and the platform index.
6. Push the changes.

## Suggested GitHub Topics

`ctf` `writeup` `hackthebox` `tryhackme` `picoctf` `cybersecurity` `infosec` `penetration-testing` `web-security` `osint`

## Profiles

- GitHub: [s4mm1t](https://github.com/s4mm1t)
- Hack The Box: add your profile link
- TryHackMe: add your profile link
- Twitter / X: `@s4mm1t`

## Disclaimer

These writeups are for education and legal CTF practice only. I do not include live targets, private systems, or real-world exploitation without permission.

If a writeup helped you understand a technique, a star is appreciated because it helps other learners find the repo.
