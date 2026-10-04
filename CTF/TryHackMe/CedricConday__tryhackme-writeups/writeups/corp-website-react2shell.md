---
title: "Corp Website: React2Shell (CVE-2025-55182) RSC RCE to Root"
room: "Corp Website"
platform: TryHackMe
url: https://tryhackme.com/room/lafb2026e7
difficulty: Medium
date_solved: 2026-07-11
time_to_solve: "≈15m"
tags: [nextjs, react-server-components, rce, cve-2025-55182, sudo]
cves: [CVE-2025-55182]
flags: { user: true, root: true }
flagship: true
order: 20
---

A "Romance & Co" corporate site running **Next.js on :3000** is vulnerable to **CVE-2025-55182 ("React2Shell")**: a React Server Components RCE. One crafted request lands code execution as **`daniel`**; a misconfigured **`sudo python3 NOPASSWD`** rule walks straight to root.

## Recon
`nmap -sV` fingerprints **:3000** as Next.js (`X-Powered-By: Next.js`, `x-nextjs-cache`, `next-router-state-tree`). A "corporate breach" theme + Next.js immediately points at the era's marquee framework bug. Confirmed the version sat in the React2Shell-affected range.

## Foothold: CVE-2025-55182 (React2Shell)
The vulnerability abuses how RSC handles certain internal server-action requests, letting an attacker smuggle a command into the render pipeline. Using the public PoC pattern (`-u http://$IP:3000 --custom "<cmd>"`), a single request returns command output out-of-band:
```
id  →  uid=100(daniel) gid=101(secgroup) groups=101(secgroup)
```
RCE as **`daniel`**: no shell upgrade needed for enumeration; the exploit returns command output directly.

## Privilege Escalation
`sudo -l` (as daniel) reveals:
```
daniel ALL=(root) NOPASSWD: /usr/bin/python3
```
A no-password root Python is a one-liner escape:
```
sudo -n /usr/bin/python3 -c 'import os; os.system("id; cat /root/root.txt")'  →  uid=0(root)
```

## Flags
User (`/home/daniel/user.txt`) and root (`/root/root.txt`): both read live; values masked per THM convention. (The names are cute: "React 2 Shell Exploit" and "Priv Esc At Its Finest".)

## The Lesson
The tell was the stack, not the box's flavor text: `X-Powered-By: Next.js` on :3000 narrows a "breach investigation" to one CVE class fast. And a `NOPASSWD` interpreter (`python3`, `perl`, `ruby`…) is never a privesc *puzzle*: it's a one-line `os.system`. Recognize the interpreter, skip the search.

