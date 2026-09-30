# Hack The Box: Base Machine 

## Overview
This repository documents the compromise of the **Base** machine on Hack The Box.  
The box focuses on web enumeration, insecure PHP authentication logic, file upload abuse, and sudo-based privilege escalation.

**Difficulty:** Easy  
**Focus Areas:** Enumeration, PHP logic flaws, file uploads, credential reuse, sudo misconfiguration

---

## Attack Path Summary
1. TCP scan identified SSH and HTTP services.
2. Web enumeration revealed a login portal.
3. Source code leakage exposed insecure credential comparison.
4. File upload functionality enabled further access.
5. Credentials were recovered and reused via SSH.
6. Sudo misconfiguration allowed privilege escalation to root.

---

## Enumeration

### Open TCP Ports: 22,80
- **22**: SSH  
- **80**: HTTP

### Login Page Path

/login/login.php 

### Login Directory
- Total files found: **3**

---

## Web Vulnerability Analysis

### Swap File Exposure
- **Extension:** `.swp`
- Editor swap files leaked backend PHP source code.

### Insecure Authentication Logic
- **PHP function used:** `strcmp()`
- Improper usage enabled authentication bypass / credential disclosure.

---

## File Upload Abuse

### Upload Directory : /_uploaded 

- Uploaded files were accessible and executable.

---

## User Access

### Valid User : john 

### Recovered Password : thisisagoodpassword

- Credentials successfully reused for SSH login.

---

## Privilege Escalation

### Sudo Misconfiguration
User `john` can run the following binary as root: /usr/bin/find 

### Exploitable Action: -exec 

- `find -exec` allows arbitrary command execution as root.

---

## Flags
- ✅ User flag obtained  
- ✅ Root flag obtained

---

## Lessons Learned
- Swap/backup files frequently leak sensitive source code.
- Authentication logic errors are often fatal.
- File upload functionality must be strictly restricted.
- Allowing powerful binaries via sudo effectively grants root access.

