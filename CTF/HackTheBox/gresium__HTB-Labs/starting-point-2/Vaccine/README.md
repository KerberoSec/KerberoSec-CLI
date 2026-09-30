# HTB: Vaccine (Starting Point Tier 2)

## Overview
- Platform: Hack The Box
- Path: Starting Point: Tier 2
- Target OS: Linux
- Focus: FTP enumeration, password cracking, SQL injection, privilege escalation via sudo
- Difficulty: Beginner → Intermediate

This lab introduces attacking exposed services, recovering credentials from backups, exploiting SQL injection, and escalating privileges using misconfigured sudo permissions.

---

## Attack Path Summary

### 1. Service Enumeration
- Identified exposed services besides SSH and HTTP
- Discovered an FTP service allowing anonymous authentication

Key takeaway: Anonymous or weakly protected services often expose sensitive data.

---

### 2. FTP Enumeration
- Logged in using anonymous access
- Downloaded a backup archive from the FTP server

Key takeaway: Backup files frequently contain credentials or application secrets.

---

### 3. Password Cracking
- Extracted password-protected archive contents
- Converted the archive into a crackable hash format
- Recovered credentials using password cracking techniques

Key takeaway: Weak passwords completely negate encryption.

---

### 4. Web Application Access
- Used recovered credentials to authenticate to the web application
- Identified SQL injection vulnerability in the application

Key takeaway: Credential reuse across services significantly increases risk.

---

### 5. SQL Injection to Command Execution
- Automated SQL injection exploitation
- Achieved operating system command execution via the database

Key takeaway: SQL injection often leads beyond data access to full system compromise.

---

### 6. Privilege Escalation
- Enumerated sudo permissions for the compromised user
- Identified a binary executable allowed to run as root
- Abused allowed binary to escalate privileges

Key takeaway: Misconfigured sudo rules are a direct path to root.

---

## Tools Used
- nmap
- ftp
- unzip / zip2john
- John the Ripper
- sqlmap
- standard Linux utilities

---

## Key Lessons Learned
- Exposed FTP services are high-risk
- Backup files should never be publicly accessible
- SQL injection remains a critical vulnerability
- Least-privilege enforcement in sudo configurations is essential

---

## Notes
- Target IPs, credentials, and flags are intentionally omitted
- This write-up documents methodology, not step-by-step exploitation
- Content complies with Hack The Box publishing guidelines
