# /dev/random: Scream: OSCP Walkthrough Notes

> **Source:** [/dev/random: Scream on VulnHub](https://www.vulnhub.com/entry/devrandom-scream,47/)
> **Author:** Sagi-
> **Difficulty:** Medium
> **OS:** Windows XP (SP2/SP3, x86)
> **Goal:** Get the local user's password (hash extraction + cracking)

---

## Table of Contents

1. [Recon](#1-recon)
2. [Enumeration](#2-enumeration)
3. [Exploitation](#3-exploitation)
4. [Privilege Escalation](#4-privilege-escalation)
5. [Screenshots](#5-screenshots)
6. [Key Takeaways](#6-key-takeaways)

---

## M4d3 w1th ❤️ by Ankit Patidar

---

## 1. Recon

### Host Discovery

Identify the target on the local network:

```bash
netdiscover -i tun0
# or
nbtscan -r 192.168.1.0/24
# or
arp -a
```

The target typically responds on the `192.168.x.0/24` subnet.

### Port Scanning

Run a comprehensive Nmap scan against the Windows XP target:

```bash
nmap -sV -sC -p- -T4 <target_ip>
```

### Expected Open Ports

| Port | Service | Details |
|------|---------|---------|
| 135  | RPC     | Microsoft Remote Procedure Call |
| 139  | NetBIOS | Windows file/session sharing |
| 445  | SMB     | Server Message Block |
| 3306 | MySQL   | MySQL database (phpMyAdmin backend) |
| 3389 | RDP     | Remote Desktop (may be open) |
| 80   | HTTP    | Web server (likely IIS or Apache) |

The presence of **MySQL on port 3306** and a **web server on port 80** strongly suggests a stack with phpMyAdmin as the attack vector.

### Service Enumeration

```bash
nmap -sV --script=smb-os-discovery <target_ip>
nmap --script=smb-enum-shares,smb-enum-users <target_ip>
```

Identify the OS version, workgroup, and any share names.

---

## 2. Enumeration

### Web Server Enumeration (Port 80)

Navigate to `http://<target_ip>/` in a browser or use `curl`:

```bash
curl -I http://<target_ip>/
dirb http://<target_ip>/
gobuster dir -u http://<target_ip>/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
```

Look for:
- phpMyAdmin interface (common paths: `/phpmyadmin/`, `/PMA/`, `/admin/`)
- Any login portals or web applications
- Configuration files or backup files

### phpMyAdmin Discovery

Access `http://<target_ip>/phpmyadmin/` (or discovered path).

- Log in with the **MySQL root credentials**. These may be found in:
  - Configuration files (e.g., `config.inc.php`)
  - Default/weak credentials (root/root, root/password, root/mysql)
  - Credentials extracted from the web application

### Credential Harvesting

If phpMyAdmin is accessible, focus on:
- Extracting database credentials from configuration files
- Dumping user tables from the MySQL database
- Finding password hashes stored in application databases

### SMB Enumeration

```bash
smbclient -L //<target_ip> -N
enum4linux -a <target_ip>
nbtscan <target_ip>
```

List shares, users, and OS information.

---

## 3. Exploitation

### Primary Vector: phpMyAdmin / MySQL

1. **Access phpMyAdmin** at `http://<target_ip>/phpmyadmin/`
2. **Log in** with MySQL root credentials (discoverable via default credentials or config file leaks)
3. **Dump the database** containing user credentials and hashes

```sql
-- Within phpMyAdmin SQL tab
SHOW DATABASES;
USE <target_database>;
SHOW TABLES;
SELECT * FROM users;
```

### Hash Extraction

Extract all user password hashes from the database. The hashes may be:
- **NTLM hashes** (if the application uses Windows authentication)
- **MD5/SHA1 plaintext hashes** (application-level)
- **MySQL root hash** (if stored in the database itself)

### Password Cracking

#### Method 1: Online Decryption
Submit the extracted hash to online hash-cracking services.

#### Method 2: Hashcat / John the Ripper (Local)

```bash
# Save the hash to a file
echo '<hash>' > hash.txt

# Try hashcat with a wordlist
hashcat -m 0 hash.txt /usr/share/wordlists/rockyou.txt
# -m 0 = MD5 mode (adjust based on hash type)

# Or use John the Ripper
john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
```

#### Method 3: SAM Database Extraction (Windows XP)

If accessing the target at a lower level:
1. Boot from a live Linux ISO (or use the VulnInjector-generated recovery disc)
2. Mount the Windows partition
3. Extract the SAM and SYSTEM hives:
   ```bash
   # From a live environment
   samdump2 /path/to/SYSTEM /path/to/SAM > hashes.txt
   ```
4. Crack the extracted NTLM hashes offline with Hashcat or John

### Alternative: RDP / SMB Access

If credentials from the database grant Windows login access:
- **RDP:** `xfreerdp /u:<user> /p:<password> /v:<target_ip>`
- **SMB:** `smbclient //<target_ip>/<share> -U <user>%<password>`

### Obtain User Password

The ultimate goal is to recover the **cleartext password** for the local user account.

---

## 4. Privilege Escalation

### Windows XP PrivEsc Vectors

Since Scream is Windows XP, privilege escalation focuses on:

1. **Weak/Simple Local Password**
   - The machine is designed around password recovery: the "privilege escalation" is essentially cracking the user's password hash.
   - Once the password is cracked, log in as that user.

2. **SAM + SYS Hive Extraction**
   - Boot from a recovery disc or live USB
   - Extract SAM and SYSTEM hives using `samdump2` or `chntpw`
   - Crack NTLM hashes with a wordlist

3. **Auto-Login or Blank Password**
   - Windows XP VMs sometimes have auto-login or blank password policies
   - Check the registry hive (from extracted files) for auto-config:
     ```
     [HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon]
     "AutoAdminLogon"="1"
     "DefaultUserName"="<user>"
     "DefaultPassword"="<password>"
     ```

4. **Local Exploits**
   - If a local user session is obtained, check for known Windows XP kernel/driver exploits
   - Exploit any unpatched services running with elevated privileges

### Gaining Full Access

Once the password is cracked:
- Log in via RDP or at the console
- Access user files, the flag (typically on the desktop), and confirm local user access

---

## 5. Screenshots

*No screenshots available for this machine.*

---

## 6. Key Takeaways

1. **phpMyAdmin is a high-value target.** It provides direct access to the MySQL database, which often contains user credentials, application configurations, and sometimes password hashes.

2. **Default MySQL credentials are dangerous.** `root/root`, `root/password`, or blank credentials on MySQL in a deployed environment give full database access.

3. **Hash extraction from Windows XP is straightforward.** The SAM hive can be extracted from a live boot environment: no complex exploitation is needed.

4. **Offline hash cracking is fast and reliable.** Tools like Hashcat and John the Ripper with a good wordlist (RockYou) can crack weak passwords in seconds to minutes.

5. **Windows XP is end-of-life and inherently vulnerable.** This machine demonstrates why using outdated, unsupported operating systems in any environment is a critical security risk.

6. **Password recovery IS the privilege escalation path.** Unlike Linux privEsc which relies on misconfigurations, Windows XP password recovery through hash extraction and cracking is a valid escalation technique.

7. **The VulnInjector toolchain is useful.** The `.exe`/ISO generator from VulnHub provides a bootable environment for password recovery tasks on Windows targets.

---

## M4d3 w1th ❤️ by Ankit Patidar
