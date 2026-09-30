# Penetration Test Write-Up: LazyAdmin

**Author:** Muhammad Hasan Bin Zahid  
**Platform:** [TryHackMe](https://tryhackme.com/)  
**Target:** LazyAdmin (10.113.159.10)  

## Executive Summary
This report details the penetration testing methodology applied to the LazyAdmin machine on TryHackMe. The engagement simulated a black-box test against a Linux-based web server. Initial access was achieved by chaining an information disclosure vulnerability (exposed SQL backup) with a weak file-upload mechanism in the SweetRice CMS. Privilege escalation to root was subsequently achieved by exploiting a misconfigured `sudo` permission that allowed execution of a script relying on a world-writable file. 

## 1. Reconnaissance & Attack Surface Mapping

My methodology always begins with a comprehensive port scan to identify active services and potential entry points.

```bash
sudo nmap -T4 -sV -sC 10.113.159.10
```

**Results:**
* **Port 22/tcp:** OpenSSH 7.2p2 
* **Port 80/tcp:** Apache httpd 2.4.18

*Thought Process:* With SSH running on port 22 and a web server on port 80, the web application is the most likely avenue for initial access. Unless I find exposed credentials, SSH brute-forcing is rarely the best first step. I immediately pivoted my focus to enumerating the HTTP service.

## 2. Web Application Enumeration

Navigating to the IP address revealed a default Apache installation page. To uncover hidden infrastructure, I initiated a directory brute-force attack.

```bash
gobuster dir -u http://10.113.159.10/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt
```

This discovered a hidden `/content` directory. Accessing it revealed a website running **SweetRice CMS**. Realizing this was the core application, I ran a secondary, targeted directory scan against `/content`.

**Key Discoveries:**
1.  `/content/as`: The administrative login portal.
2.  `/content/inc/latest.txt`: Disclosed the CMS version as `1.5.1`.
3.  `/content/inc/mysql_backup`: An exposed directory containing a database dump.

*Thought Process:* Information disclosure often acts the base of an attack. Finding the exact CMS version (`1.5.1`) allows for precise vulnerability research. More importantly, discovering a backup directory is a massive red flag for poor security hygiene and often yields immediate leverage.

## 3. Vulnerability Analysis & Initial Access

### 3.1 Credential Harvesting
I downloaded the exposed SQL backup file from `/inc/mysql_backup`. Analyzing the file contents revealed user credentials:
* **Username:** `manager`
* **Password Hash (MD5):** `42f749ade7f9e195bf475f37a44cafcb`

Recognizing the hash format as MD5, I utilized an online cracking database (hashes.com) to reverse it, yielding the plaintext password: `Password123`.

### 3.2 Exploiting Weak File Upload Controls
Armed with credentials, I authenticated into the SweetRice dashboard at `/content/as`. My research into SweetRice v1.5.1 indicated it was vulnerable to Arbitrary File Upload in the Media Center.

My objective was to establish a reverse shell. 
1.  I generated a standard PHP reverse shell payload.
2.  I attempted to upload `shell.php` via the Media Center. 
3.  **The Roadblock:** The application rejected the `.php` extension.

*Thought Process:* When an application blocks `.php` files, it's usually relying on a naive blacklist rather than verifying the actual MIME type or file contents. To bypass this restriction, I immediately tested alternative PHP execution extensions (`.php3`, `.php5`, `.phtml`). 

Renaming my payload to `shell.php5` successfully bypassed the filter. The file was uploaded to `/content/attachment/`. Triggering the file via the browser provided me with a reverse shell as the `www-data` user.

*User flag captured at `/home/itguy/user.txt`.*

## 4. Privilege Escalation

With a low-privileged shell established, my next goal was horizontal or vertical privilege escalation. My standard methodology starts with checking for "quick wins" before deploying automated enumeration scripts like LinPEAS.

I checked the sudo privileges for the `www-data` user:

```bash
sudo -l
```
**Output:**
```text
(ALL) NOPASSWD: /usr/bin/perl /home/itguy/backup.pl
```

This revealed that `www-data` could execute `/home/itguy/backup.pl` as root without requiring a password. 

### 4.1 Analyzing the Execution Chain
I inspected the `backup.pl` script. While I did not have write permissions to modify the Perl script directly, I analyzed its source code to understand its function. 

Inside the script, I found a critical system call:
```perl
system("sh /etc/copy.sh");
```

The Perl script (running as root) was blindly executing a secondary bash script: `/etc/copy.sh`.

I checked the permissions of `/etc/copy.sh`:
```bash
ls -la /etc/copy.sh
# -rw-rw-rw- 1 root root ... /etc/copy.sh
```

*Thought Process:* This is a classic "Chain of Trust" vulnerability. While the primary script (`backup.pl`) is secure, it relies on a secondary script (`copy.sh`) that is **world-writable**. By modifying the secondary script, I can dictate what the root user executes.

### 4.2 Exploitation
Rather than trying to spawn a complex reverse shell from the script, the cleanest method for privilege escalation is to set the SUID bit on the bash binary. 

I overwrote the contents of `/etc/copy.sh` with a payload to modify the bash binary:
```bash
echo "chmod +s /bin/bash" > /etc/copy.sh
```

I then executed the Perl script using my sudo privileges:
```bash
sudo /usr/bin/perl /home/itguy/backup.pl
```

Finally, I executed bash with the `-p` flag to preserve the effective root privileges:
```bash
/bin/bash -p
whoami
# root
```

*Root flag captured at `/root/root.txt`.*

## 5. Vulnerability Impact & Remediation Recommendations

To secure this server, the following remediations should be implemented:

1.  **Remove Sensitive Data from Web Roots (High Risk):** Database backups (`mysql_backup`) must never be stored in web-accessible directories. Move backups to a secure, restricted directory outside of `/var/www/html`.
2.  **Enforce Strong Password Policies (Medium Risk):** The administrative password (`Password123`) was trivial. Implement password complexity requirements and use modern hashing algorithms (like bcrypt or Argon2) instead of MD5.
3.  **Implement Robust File Upload Validation (High Risk):** The file upload mechanism relied on a weak blacklist. It should be updated to use a strict whitelist of allowed file types (e.g., `.jpg`, `.png`), verify the file's "magic bytes" (MIME type), and store uploaded files in a directory where script execution is disabled at the web-server level.
4.  **Audit Sudo Privileges and File Permissions (Critical Risk):** The privilege escalation relied on a world-writable script executed by root. Remove world-write permissions (`chmod o-w /etc/copy.sh`) from any file executed by a privileged process, and regularly audit `sudoers` configurations to follow the principle of least privilege.

5.  **Update and Patch Content Management System (Critical Risk):** The server was running SweetRice CMS version 1.5.1, which suffers from publicly documented vulnerabilities, including the Arbitrary File Upload utilized for initial access. The CMS must be updated immediately to the latest stable version. If the SweetRice project is no longer actively maintained, the application should be migrated to a supported, modern CMS to ensure ongoing security patches are applied.
