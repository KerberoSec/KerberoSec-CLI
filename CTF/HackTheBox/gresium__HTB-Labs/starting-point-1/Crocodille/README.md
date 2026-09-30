# Crocodile: Hack The Box (Starting Point)

## Overview
Crocodile is a **Starting Point** machine on Hack The Box that introduces basic service enumeration, anonymous FTP access, and web directory discovery. The lab focuses on identifying exposed services, retrieving files from an FTP server, and leveraging discovered credentials to authenticate to a web application.

**Difficulty:** Starting Point  
**Category:** Web / FTP  
**Platform:** Hack The Box  

---

## Key Concepts
- Service enumeration with Nmap
- Identifying FTP services and versions
- Anonymous FTP authentication
- Downloading files via FTP
- Interpreting exposed credential lists
- Web directory brute forcing with Gobuster
- Basic web authentication discovery

---

## Enumeration Summary
- **FTP Service:** vsftpd 3.0.3 (Port 21)
- **FTP Login:** Anonymous access allowed
- **FTP Response Code:** 230 (Login successful)
- **Web Server:** Apache httpd 2.4.41
- **Web Application Entry Point:** `login.php`

---

## Tools Used
- `nmap`
- `ftp`
- `gobuster`

---

## Key Findings
- Anonymous FTP access allowed file retrieval
- `allowed.userlist` exposed valid usernames
- Web directory brute forcing revealed `login.php`
- Credentials enabled authentication to the web service

---

## Learning Outcome
This machine reinforces the importance of:
- Checking for anonymous FTP access
- Reviewing downloaded files carefully
- Using enumeration results across multiple services
- Combining FTP and web findings to progress

---

## Status
 Root flag owned  
