# Stapler 1: OSCP Walkthrough

**Machine:** Stapler 1
**Difficulty:** Easy / Entry-Level (Enumeration Heavy)
**Category:** Multi-Service Enumeration → Web Exploitation → Privilege Escalation
**OS:** Linux
**Download:** https://www.vulnhub.com/entry/stapler-1,46/
**VulnHub Group:** Stapler 1

---

## 🔍 Reconnaissance

### Network Scanning

```bash
nmap -sC -sV -p- <TARGET_IP>
```

**Open Ports:**
| Port  | Service  | Version / Details                          |
|-------|----------|--------------------------------------------|
| 21    | FTP      | vsftpd 2.3.4 (potentially anonymous login) |
| 22    | SSH      | OpenSSH                                    |
| 80    | HTTP     | Apache httpd                               |
| 139   | NetBIOS  | Samba smbd                                 |
| 445   | SMB      | Samba smbd                                 |
| 3306  | MySQL    | MySQL                                      |

> Stapler 1 is an **enumeration-heavy** machine with multiple services. Each one must be thoroughly checked for misconfigurations or credentials.

### Quick Recon Commands

```bash
# Full nmap scan
nmap -sV -sC -A -p- <TARGET_IP>

# Quick service fingerprint
nmap -sV -p 21,22,80,139,445,3306 <TARGET_IP>

# FTP anonymous login test
nc -nv <TARGET_IP> 21
echo "USER anonymous" | nc -nv <TARGET_IP> 21
echo "PASS anonymous@" | nc -nv <TARGET_IP> 21
```

---

## 🌐 Web Enumeration

### Directory Discovery

```bash
# Gobuster
gobuster dir -u http://<TARGET_IP>/ -w /usr/share/wordlists/dirb/common.txt -t 40

# Feroxbuster (faster alternative)
feroxbuster -u http://<TARGET_IP>/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 100

# Dirsearch
dirsearch -u http://<TARGET_IP>/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt
```

### CMS & Technology Detection

```bash
# WhatWeb
whatweb http://<TARGET_IP>

# Wappalyzer / BuiltWith (browser)

# Check page source for generator tag
curl -s http://<TARGET_IP> | grep -i "generator"
```

### Web Application Testing

- Browse all discovered directories
- Test for SQL injection on any forms or parameters
- Check for uploaded file capabilities
- Test for LFI / RFI vulnerabilities
- Inspect `/robots.txt`, `/sitemap.xml`, `/README.txt`

```bash
# robots.txt
curl http://<TARGET_IP>/robots.txt

# Sensitive file check
curl http://<TARGET_IP>/configuration.php
curl http://<TARGET_IP>/configuration.php.bak
curl http://<TARGET_IP>/configuration.php~
```

---

## 📡 SMB Enumeration

```bash
# Enumerate shares anonymously
smbclient -L //<TARGET_IP> -N

# Connect to anonymous share if available
smbclient //<TARGET_IP>/<share_name> -N

# Using enum4linux
enum4linux -a <TARGET_IP>

# Using smbclient with null session
smbclient //<TARGET_IP>/ -N -c "ls"

# nmap SMB scripts
nmap --script smb-enum-shares,smb-enum-users,smb-os-discovery -p 445 <TARGET_IP>
```

**Key Checks:**
- Anonymous access to shares (read/write)
- Guest login enabled
- Null session user enumeration
- Shared files containing credentials or sensitive data

---

## 🔑 FTP Enumeration

```bash
# Anonymous login
ftp <TARGET_IP>
# User: anonymous
# Pass: anonymous@ or leave blank

# Try common credentials
ftp <TARGET_IP>
# User: admin / Pass: admin
# User: root / Pass: root
# User: user / Pass: user
# User: stapler / Pass: stapler
```

**If anonymous login works:**
```bash
cd /
ls -la
# Look for configuration files, backups, password files
get <interesting_file>
```

---

## 🗄️ MySQL Enumeration

```bash
# Connect with discovered credentials (from web config, SMB, or brute force)
mysql -h <TARGET_IP> -u <user> -p<password>

# If anonymous or known credentials found:
mysql -h <TARGET_IP> -u root -p

# Inside MySQL:
SHOW DATABASES;
USE <database_name>;
SHOW TABLES;
SELECT * FROM users;
SELECT * FROM configuration;
```

**Credential Sources to Check:**
- Web application `configuration.php` (via LFI or direct access)
- Files found on SMB shares
- Files found on FTP
- Brute force `mysql -u root -p`
- `nmap --script mysql-brute`

---

## 🎯 Exploitation

### Path: FTP → Web Shell or Credential Dumping

If FTP anonymous login grants access:
1. Browse FTP contents for configuration files, website backups, or credential lists
2. Download and review `configuration.php`, `.env`, or similar config files
3. Use any found database credentials to access MySQL
4. Extract hashes or credentials from the database
5. Use extracted credentials for SSH login

### Path: SMB → Credential Access

1. Enumerate SMB shares for readable files
2. Search for password files, `.txt` files with notes, or backup archives
3. If writable share found, upload a PHP web shell for reverse connection
4. Use credentials found on the share to SSH in

### Path: Web LFI → Credentials → SSH

1. Exploit LFI vulnerability to read `/etc/passwd` and `/etc/shadow`
2. Use `configuration.php` LFI to get database credentials
3. Connect to MySQL to extract user hashes or application credentials
4. Use credentials to SSH into the machine
5. Escalate privileges

### Path: MySQL → SSH

```bash
# After getting MySQL credentials
mysql -h <TARGET_IP> -u root -p<password>
# Dump database
SELECT User, Host, authentication_string FROM mysql.user;
# Find application users that may have SSH access
```

### SSH Login

```bash
# Use credentials found during enumeration
ssh <user>@<TARGET_IP>

# If password-based login fails, try SSH key
ssh -i <key_file> <user>@<TARGET_IP>
```

---

## 🔐 Privilege Escalation

### Once Inside (Initial User Shell)

```bash
# Basic recon from inside the shell
whoami
id
uname -a
cat /etc/os-release
cat /etc/passwd
env
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

# Writable files
find / -writable -type f 2>/dev/null | grep -v proc

# World-writable files in sensitive directories
find /etc -writable 2>/dev/null
find /usr -writable 2>/dev/null

# Password files in web root or config
find / -name "*.pwd" -o -name ".htpasswd" -o -name "credentials.*" 2>/dev/null

# Check for private keys
find / -name "id_rsa" -o -name "id_dsa" -o -name "*.pem" 2>/dev/null

# History files
cat ~/.bash_history
cat /root/.bash_history

# Environment variables with secrets
env | sort

# Check for docker
docker --version 2>/dev/null
docker ps 2>/dev/null

# Check for password in vim/nano backup files
find / -name "*.swp" -o -name "*.bak" -o -name "*~" 2>/dev/null | grep -v proc
```

### Common Privesc Paths for Stapler 1

- Check if the user can run specific scripts via `sudo` without a password
- Look for `GTFOBins` entries for the installed tools
- If MySQL user has FILE privilege:
  ```sql
  SELECT LOAD_FILE('/etc/shadow');
  ```
- Check for vulnerable SUID binaries
- Check for writable cron jobs or systemd services

---

## 📸 Screenshots

*No screenshots available for this machine.*

---

## ✅ Key Takeaways

- **Stapler 1 is an enumeration-heavy machine**: spend time on each service. Do not rush exploitation.
- **FTP anonymous login** is a common entry point; always test it first.
- **SMB misconfigurations** (null sessions, anonymous access) often leak credentials or configuration files.
- **Web application configs** (like `configuration.php`) frequently contain database credentials that lead to SSH access.
- **MySQL databases** often store application user credentials that can be reused for SSH.
- **Always check sudo permissions** after initial access: many machines grant passwordless sudo for specific commands.
- **The full chain** for this machine is typically: Enumerate → Find credentials on one service → Use those credentials on another service → Escalate.

**Machine: Stapler 1 [✅/❌ Pending]**

---

M4d3 w1th ❤️ by Ankit Patidar
