# Publishing Checklist

## 1. Create The GitHub Repository

Create a public repository named `ctf-writeups`.

Suggested description:

```text
Reasoning-focused CTF writeups for Hack The Box, TryHackMe, PicoCTF, web security, crypto, OSINT, forensics, and privilege escalation.
```

Suggested topics:

```text
ctf, writeup, hackthebox, tryhackme, picoctf, cybersecurity, infosec, penetration-testing, web-security, osint
```

## 2. Connect The Local Repo

Replace `s4mm1t` if the repository is created under another GitHub account.

```bash
git remote add origin git@github.com:s4mm1t/ctf-writeups.git
git branch -M main
git push -u origin main
```

HTTPS alternative:

```bash
git remote add origin https://github.com/s4mm1t/ctf-writeups.git
git branch -M main
git push -u origin main
```

## 3. Enable GitHub Pages

In the repository settings:

1. Open `Settings`.
2. Open `Pages`.
3. Set source to `Deploy from a branch`.
4. Select branch `main`.
5. Select folder `/ (root)`.
6. Save.

The `_config.yml` file is already prepared for GitHub Pages.

## 4. First Public Writeups

Good first targets:

- TryHackMe RootMe
- TryHackMe Basic Pentesting
- TryHackMe Simple CTF

Do not invent solutions. Solve first, take notes while working, then write the explanation from your own reasoning.

## 5. Launch Post Draft

```text
Started documenting my CTF journey: writeups focused on reasoning, not just commands.

I am writing each solution as a learning note: why I chose each step, what the results meant, what failed, and what finally worked.

Repo: https://github.com/s4mm1t/ctf-writeups
```
