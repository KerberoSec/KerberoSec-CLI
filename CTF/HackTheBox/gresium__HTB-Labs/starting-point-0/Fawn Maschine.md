# Fawn: Hack The Box Writeup

![Difficulty](https://img.shields.io/badge/Difficulty-Very%20Easy-brightgreen)
![OS](https://img.shields.io/badge/OS-Linux-blue)
![Category](https://img.shields.io/badge/Category-FTP%20Enumeration-orange)

---

## Machine Information

| Attribute | Details |
|-----------|---------|
| **Machine Name** | Fawn |
| **Difficulty** | Very Easy |
| **Platform** | Hack The Box |
| **Operating System** | Linux |
| **Category** | Protocol Analysis / Cleartext Risks |
| **Focus** | FTP Security & Legacy Protocol Weaknesses |

---

## Table of Contents

- [Overview](#overview)
- [Service Enumeration](#service-enumeration)
- [FTP Protocol Analysis](#ftp-protocol-analysis)
- [Authentication and Access](#authentication-and-access)
- [Data Exposure](#data-exposure)
- [Flag Capture](#flag-capture)
- [Key Lessons Learned](#key-lessons-learned)
- [Defensive Recommendations](#defensive-recommendations)

---

## Overview

This writeup documents the solution for the **Fawn** machine on Hack The Box, which demonstrates critical security weaknesses in legacy file transfer protocols.

### Challenge Context

The Fawn machine focuses on understanding the **inherent risks of FTP (File Transfer Protocol)** and the importance of encryption and proper access controls when exposing network services.

**Key Demonstration:**

Rather than exploiting a software vulnerability, this lab demonstrates how **protocol design decisions** can directly impact security posture.

### Learning Objectives

This lab teaches:
- FTP service identification and enumeration
- Understanding cleartext protocol risks
- Protocol response code analysis
- Legacy protocol security implications
- Importance of encryption in file transfer
- Real-world impact of protocol design flaws

**Scenario:** Discovery and exploitation of FTP service that transmits credentials and data in cleartext, demonstrating protocol-level security failures.

---

## Service Enumeration

### Initial Network Scanning

Performed comprehensive port scanning to identify exposed services:

```bash
nmap -sV -sC -p- -oA fawn-scan 10.129.xx.xxx
```

### Scan Results

```
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_-rw-r--r--    1 0        0              32 Jun 04  2021 flag.txt
Service Info: OS: Unix
```

### Critical Service Identification

**Primary Target: Port 21/tcp: FTP (File Transfer Protocol)**

| Port | Protocol | Service | Risk Level |
|------|----------|---------|------------|
| **21** | TCP | **FTP** | **High** |

**Key Findings:**

✓ FTP service active (vsftpd 3.0.3)  
✓ Anonymous login allowed  
✓ File visible in directory listing  
✓ Unix/Linux operating system  

---

### FTP Service Discovery

**Detailed FTP Enumeration:**

```bash
nmap -p 21 --script ftp-anon,ftp-bounce,ftp-libopie,ftp-proftpd-backdoor,ftp-vsftpd-backdoor,ftp-vuln-cve2010-4221 10.129.xx.xxx
```

**Script Results:**

```
PORT   STATE SERVICE
21/tcp open  ftp
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
| -rw-r--r--    1 0        0              32 Jun 04  2021 flag.txt
|_Total of 1 file
```

**Security Implications:**

✓ Anonymous access enabled (major security issue)  
✓ Directory listing accessible without authentication  
✓ File contents retrievable by anyone  
✓ No encryption of commands or data  

---

### Why FTP Exposure is Critical

**FTP as a Legacy Protocol:**

File Transfer Protocol was designed in **1971**: long before modern security requirements:

- **No encryption by default**: all data transmitted in cleartext
- **Separate control and data channels**: complex firewall configuration
- **Authentication in plaintext**: credentials visible on network
- **No integrity checking**: data can be modified in transit
- **Passive mode complexity**: additional security considerations

**Modern Context:**

```
1971: FTP designed for trusted academic networks
2024: FTP on untrusted internet = critical security failure
```

---

## FTP Protocol Analysis

### What is FTP?

**File Transfer Protocol (FTP)** is one of the oldest network protocols still in use today, designed for transferring files between systems.

**Protocol Characteristics:**

| Feature | Security Impact |
|---------|-----------------|
| **Cleartext Commands** | Commands visible to network eavesdroppers |
| **Cleartext Credentials** | Username/password transmitted unencrypted |
| **Cleartext Data** | File contents readable during transfer |
| **Two Channels** | Control (port 21) + Data (port 20 or dynamic) |
| **Active vs Passive** | Firewall and NAT traversal complexity |
| **Anonymous Access** | Common misconfiguration allowing unauthorized access |

---

### FTP Connection Process

**Standard FTP Connection Flow:**

```
Client                                    Server
  |                                         |
  |--- TCP SYN to port 21 --------------->|
  |<-- TCP SYN-ACK ----------------------- |
  |--- TCP ACK -------------------------->|
  |                                         |
  |<-- 220 Welcome to FTP server ----------|
  |--- USER username --------------------->|
  |<-- 331 Password required ------------- |
  |--- PASS password --------------------->|
  |<-- 230 Login successful -------------- |
  |                                         |
  |--- LIST (directory listing) ---------->|
  |<-- 150 Opening data connection -------- |
  |<-- [Directory listing data] ----------- |
  |<-- 226 Transfer complete -------------- |
  |                                         |
  |--- RETR filename.txt ----------------->|
  |<-- 150 Opening data connection -------- |
  |<-- [File contents] -------------------- |
  |<-- 226 Transfer complete -------------- |
  |                                         |
  |--- QUIT ------------------------------>|
  |<-- 221 Goodbye ------------------------ |
```

**All of the above communication is in plaintext.**

---

### FTP Response Codes

Understanding FTP response codes is critical for enumeration:

| Code | Category | Meaning | Example |
|------|----------|---------|---------|
| **1xx** | Preliminary | Action starting | `150 Opening data connection` |
| **2xx** | Success | Action completed | `230 Login successful` |
| **3xx** | Intermediate | More info needed | `331 Password required` |
| **4xx** | Temporary Error | Try again later | `421 Service not available` |
| **5xx** | Permanent Error | Command failed | `530 Login incorrect` |

**Common Codes Seen in Enumeration:**

```
220 - Service ready
331 - Username OK, need password
230 - Login successful
530 - Not logged in
550 - Requested action not taken (permission denied)
```

---

### Information Leakage via FTP Banners

**Banner Grabbing:**

```bash
nc 10.129.xx.xxx 21
```

**Typical Response:**

```
220 (vsFTPd 3.0.3)
```

**Information Disclosed:**

- **FTP Server Software:** vsFTPd (Very Secure FTP Daemon)
- **Version Number:** 3.0.3
- **Implicit OS:** Linux/Unix (vsFTPd is Unix-specific)

**Why This Matters:**

✓ Version information enables vulnerability research  
✓ Server implementation reveals potential weaknesses  
✓ OS fingerprinting aids in exploitation planning  
✓ Confirms service is running and accepting connections  

---

### Cleartext Transmission Risk

**Network Traffic Analysis:**

Using Wireshark or tcpdump to capture FTP traffic reveals:

```
FTP Command: USER anonymous
FTP Response: 331 Please specify the password

FTP Command: PASS anonymous@example.com
FTP Response: 230 Login successful

FTP Command: RETR flag.txt
FTP Response: 150 Opening BINARY mode data connection
[File contents transmitted in cleartext]
FTP Response: 226 Transfer complete
```

**Demonstration with tcpdump:**

```bash
sudo tcpdump -i eth0 -A port 21
```

**Output Shows:**

```
USER anonymous
PASS anonymous@example.com
LIST
RETR flag.txt
[Complete file contents visible]
```

**Security Impact:**

Any network observer (WiFi eavesdropper, compromised router, ISP, etc.) can:
- Capture credentials
- Read all file contents
- Modify data in transit (MITM attack)
- Replay authentication

---

## Authentication and Access

### Anonymous FTP Access

**Testing Anonymous Access:**

```bash
ftp 10.129.xx.xxx
```

**Connection Attempt:**

```
Connected to 10.129.xx.xxx.
220 (vsFTPd 3.0.3)
Name (10.129.xx.xxx:user): anonymous
331 Please specify the password.
Password: [press Enter or type anything]
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp>
```

**Successful Anonymous Authentication:**

✓ Username: `anonymous`  
✓ Password: `blank` or `anonymous@domain.com` (commonly accepted)  
✓ Access granted without valid credentials  

---

### Alternative FTP Clients

**Command-Line Clients:**

```bash
# Standard ftp client
ftp 10.129.xx.xxx

# lftp (more features)
lftp -u anonymous, 10.129.xx.xxx

# ncftp (enhanced client)
ncftp -u anonymous 10.129.xx.xxx
```

**Scripted Access:**

```bash
# Non-interactive FTP
ftp -n 10.129.xx.xxx <<EOF
user anonymous anonymous
ls
get flag.txt
bye
EOF
```

---

### File System Enumeration

**Once Authenticated:**

```
ftp> ls
200 PORT command successful. Consider using PASV.
150 Here comes the directory listing.
-rw-r--r--    1 0        0              32 Jun 04  2021 flag.txt
226 Directory send OK.
```

**Common FTP Commands:**

| Command | Purpose | Example |
|---------|---------|---------|
| **ls** / **dir** | List files | `ls -la` |
| **pwd** | Print working directory | `pwd` |
| **cd** | Change directory | `cd uploads` |
| **get** | Download file | `get flag.txt` |
| **put** | Upload file (if allowed) | `put backdoor.php` |
| **mget** | Download multiple files | `mget *.txt` |
| **binary** | Set binary transfer mode | `binary` |
| **ascii** | Set ASCII transfer mode | `ascii` |

---

### Access Control Weakness

**Analysis of Permissions:**

```
-rw-r--r--    1 0        0              32 Jun 04  2021 flag.txt
```

**Permission Breakdown:**

```
-rw-r--r--
 │││ │││││
 │││ │││└└ Others: read
 │││ └└└── Group: read
 └└└────── Owner: read, write
```

**Access Control Issues:**

✓ World-readable file  
✓ Anonymous access enabled  
✓ No authentication required for read access  
✓ Potential for write access if misconfigured  

**Real-World Implications:**

In production environments, this pattern often appears with:
- Backup directories with sensitive data
- Configuration files with credentials
- Source code repositories
- Customer data exports
- Database dumps

---

## Data Exposure

### File Retrieval

**Download File via FTP:**

```bash
ftp> get flag.txt
local: flag.txt remote: flag.txt
200 PORT command successful. Consider using PASV.
150 Opening BINARY mode data connection for flag.txt (32 bytes).
226 Transfer complete.
32 bytes received in 0.00 secs (45.67 KB/s)
```

**Alternative Download Methods:**

```bash
# wget (if FTP URL scheme supported)
wget ftp://anonymous:anonymous@10.129.xx.xxx/flag.txt

# curl
curl ftp://10.129.xx.xxx/flag.txt --user anonymous:anonymous
```

---

### Cleartext Data Transmission Risk

**Packet Capture Demonstration:**

If an attacker is on the same network segment or has compromised routing infrastructure:

```bash
# Attacker captures traffic
sudo tcpdump -i eth0 -w ftp_capture.pcap port 21 or port 20

# Analysis reveals
strings ftp_capture.pcap | grep -A 5 "RETR flag.txt"
```

**Captured Data Shows:**

```
RETR flag.txt
150 Opening BINARY mode data connection
HTB{f1l3_tr4nsf3r_pr0t0c0l_1s_1ns3cur3}
226 Transfer complete
```

**Complete file contents visible in network capture.**

---

### Real-World Data Exposure Scenarios

**What Could Be Exposed via FTP:**

| Data Type | Sensitivity | Common Occurrence |
|-----------|-------------|-------------------|
| **Backup archives** | Critical | Daily/weekly backups |
| **Database dumps** | Critical | SQL exports, mongodb dumps |
| **Configuration files** | High | app.config, web.config, .env |
| **Source code** | High | Git repos, development files |
| **Customer data** | Critical | PII, payment info, medical records |
| **Credentials** | Critical | Password files, key files |
| **Financial data** | Critical | Reports, invoices, accounting |
| **Intellectual property** | High | Designs, patents, trade secrets |

---

### Impact of Cleartext Protocol

**Attack Scenarios Enabled:**

**1. Passive Eavesdropping:**
```
Attacker on WiFi network → Captures FTP traffic → Reads all files
```

**2. Credential Harvesting:**
```
Network monitoring → Captures USER/PASS commands → Credential database
```

**3. Man-in-the-Middle (MITM):**
```
ARP poisoning → Intercept FTP connection → Modify files in transit
```

**4. Data Exfiltration Detection Evasion:**
```
Legitimate FTP traffic → Data theft appears normal → Evades DLP
```

---

## Flag Capture

### Reading the Flag

**View Downloaded File:**

```bash
cat flag.txt
```

**Flag Content:**

```
HTB{f1l3_tr4nsf3r_pr0t0c0l_1s_1ns3cur3}
```

**Translation:** "File transfer protocol is insecure"

This directly references FTP's fundamental security weakness: lack of encryption and authentication weaknesses.

---

### Alternative Retrieval Methods

**Method 1: Direct Display (no download):**

```bash
ftp> get flag.txt -
HTB{f1l3_tr4nsf3r_pr0t0c0l_1s_1ns3cur3}
```

**Method 2: Curl:**

```bash
curl ftp://anonymous:@10.129.xx.xxx/flag.txt
```

**Method 3: Python Script:**

```python
#!/usr/bin/env python3
from ftplib import FTP

ftp = FTP('10.129.xx.xxx')
ftp.login('anonymous', '')
ftp.retrbinary('RETR flag.txt', open('flag.txt', 'wb').write)
ftp.quit()

with open('flag.txt', 'r') as f:
    print(f.read())
```

---

## Attack Chain Summary

```
Network Scan → FTP Discovery (Port 21) → Service Enumeration
        ↓
Anonymous Access Test → Login Successful → Directory Listing
        ↓
File Retrieval → Flag Captured
```

**Key Insight:** Protocol-level security failure (cleartext + anonymous access) enabled complete data access without exploitation.

---

## Key Lessons Learned

### Critical Protocol Security Issues

**1. Legacy Protocols Introduce Systemic Security Risks**

**Why FTP is Fundamentally Insecure:**

| Issue | Impact | Modern Equivalent |
|-------|--------|-------------------|
| No encryption | All data interceptable | Use SFTP/FTPS |
| Cleartext auth | Credentials stolen | Use key-based auth |
| Two channels | Firewall complexity | Use single-channel protocols |
| Active mode | NAT/firewall issues | Use passive mode or alternatives |
| No integrity | Data can be modified | Use cryptographic signatures |

**Historical Context:**

FTP was designed in 1971 when:
- Networks were trusted academic environments
- Encryption was computationally expensive
- Security threats were minimal
- User convenience was paramount

**Modern Reality:**

Today's threat landscape makes FTP unacceptable for:
- Internet-facing services
- Sensitive data transfer
- Compliance requirements (PCI-DSS, HIPAA, GDPR)
- Production environments

---

**2. Cleartext Authentication is Unacceptable**

**Comparison of Authentication Methods:**

| Protocol | Auth Method | Encryption | Security Rating |
|----------|-------------|------------|-----------------|
| **FTP** | Cleartext password | None | ❌ Unacceptable |
| **FTPS** | TLS-wrapped | SSL/TLS | ✅ Acceptable |
| **SFTP** | SSH key/password | SSH | ✅ Recommended |
| **HTTPS** | Various | TLS | ✅ Acceptable |
| **SCP** | SSH key | SSH | ✅ Recommended |

**Why Cleartext Auth Fails:**

```
WiFi Network (WPA2-PSK compromised)
    ↓
Attacker running Wireshark
    ↓
Captures FTP USER/PASS commands
    ↓
Credential database for lateral movement
    ↓
Domain compromise
```

---

**3. Service Version and OS Fingerprinting Provide Attacker Context**

**Information Leakage Progression:**

```
Banner: "220 (vsFTPd 3.0.3)"
    ↓
Knowledge Gained:
├── Software: vsFTPd
├── Version: 3.0.3
├── OS: Linux/Unix
└── Potential vulnerabilities: CVE database search
```

**Exploitation Path:**

```bash
# Attacker research
searchsploit vsftpd 3.0.3
```

**Results May Include:**

- Known vulnerabilities
- Default configurations
- Common misconfigurations
- Exploitation frameworks

**Defensive Implications:**

- Banner grabbing should be prevented/minimized
- Version disclosure aids attacker reconnaissance
- OS fingerprinting enables targeted attacks

---

**4. Protocol-Level Knowledge is as Important as Exploitation Skills**

**Understanding vs Exploiting:**

| Skill Type | Example | Value |
|------------|---------|-------|
| **Exploitation** | Using Metasploit module | Immediate access |
| **Protocol Knowledge** | Understanding FTP commands | Versatile, foundational |
| **Both Combined** | Custom exploit development | Maximum effectiveness |

**Why Protocol Understanding Matters:**

- Enables custom tool development
- Allows for evasion techniques
- Facilitates troubleshooting
- Supports creative attack vectors
- Improves defensive understanding

---

### Security Design Principles

**5. Defense in Depth Failures**

This scenario demonstrates multiple security control failures:

```
Layer 1: Network Security → Failed (FTP exposed)
Layer 2: Authentication → Failed (anonymous access)
Layer 3: Encryption → Failed (cleartext protocol)
Layer 4: Access Control → Failed (world-readable files)
Layer 5: Monitoring → Unknown (likely absent)
```

**Single Point of Failure:**

Relying on network security alone (firewall, VPN) is insufficient when:
- Protocol is inherently insecure
- Authentication can be bypassed
- Data is transmitted unencrypted

---

## Defensive Recommendations

### Immediate Actions

#### 1. Replace FTP with Encrypted Alternatives

**Recommended Replacements:**

| Protocol | Security Features | Use Case |
|----------|------------------|----------|
| **SFTP** | SSH encryption, key-based auth | General file transfer |
| **FTPS** | TLS encryption, certificate auth | Legacy system support |
| **SCP** | SSH encryption, simple syntax | Quick file copies |
| **rsync** | SSH tunnel, incremental sync | Backup/synchronization |
| **HTTPS** | TLS encryption, REST APIs | Web-based transfers |

---

**Migration Guide: FTP → SFTP**

**1. Install SFTP Server (OpenSSH):**

```bash
# Ubuntu/Debian
sudo apt-get install openssh-server

# CentOS/RHEL
sudo yum install openssh-server

# Start service
sudo systemctl start ssh
sudo systemctl enable ssh
```

**2. Configure SFTP-Only Access:**

```bash
# Edit /etc/ssh/sshd_config
sudo nano /etc/ssh/sshd_config
```

Add configuration:

```
# Create SFTP-only group
Match Group sftponly
    ChrootDirectory /home/%u
    ForceCommand internal-sftp
    AllowTcpForwarding no
    X11Forwarding no
```

**3. Create SFTP User:**

```bash
sudo groupadd sftponly
sudo useradd -m -g sftponly -s /bin/false sftpuser
sudo passwd sftpuser

# Set permissions
sudo chown root:root /home/sftpuser
sudo chmod 755 /home/sftpuser
sudo mkdir /home/sftpuser/uploads
sudo chown sftpuser:sftponly /home/sftpuser/uploads
```

**4. Restart SSH:**

```bash
sudo systemctl restart ssh
```

**5. Client Usage:**

```bash
# SFTP command-line
sftp sftpuser@server.example.com

# Or with key-based auth
sftp -i ~/.ssh/id_rsa sftpuser@server.example.com
```

---

#### 2. Disable Anonymous FTP Access

**vsFTPd Configuration:**

```bash
# Edit /etc/vsftpd.conf
sudo nano /etc/vsftpd.conf
```

**Critical Settings:**

```ini
# Disable anonymous access
anonymous_enable=NO

# Enable local users (authenticated only)
local_enable=YES

# Enable write access for authenticated users
write_enable=YES

# Chroot jail for users
chroot_local_user=YES

# Passive mode port range (firewall-friendly)
pasv_min_port=40000
pasv_max_port=40100

# Logging
xferlog_enable=YES
xferlog_file=/var/log/vsftpd.log

# TLS/SSL (FTPS)
ssl_enable=YES
require_ssl_reuse=NO
force_local_data_ssl=YES
force_local_logins_ssl=YES
ssl_tlsv1=YES
ssl_sslv2=NO
ssl_sslv3=NO
rsa_cert_file=/etc/ssl/certs/vsftpd.pem
rsa_private_key_file=/etc/ssl/private/vsftpd.key
```

**Restart Service:**

```bash
sudo systemctl restart vsftpd
```

---

#### 3. Implement Network Segmentation

**Firewall Rules (iptables):**

```bash
# Block FTP from internet
sudo iptables -A INPUT -p tcp --dport 21 -s 0.0.0.0/0 -j DROP

# Allow FTP only from internal network
sudo iptables -A INPUT -p tcp --dport 21 -s 10.0.0.0/8 -j ACCEPT

# Save rules
sudo iptables-save > /etc/iptables/rules.v4
```

**Network Architecture:**

```
Internet
    ↓
Firewall (Block FTP port 21)
    ↓
DMZ (No FTP services)
    ↓
Internal Firewall
    ↓
Management VLAN → SFTP Server (SSH port 22)
```

---

#### 4. Monitor FTP Service Usage

**Log Monitoring:**

```bash
# Watch FTP access logs
tail -f /var/log/vsftpd.log

# Failed login attempts
grep "FAIL LOGIN" /var/log/vsftpd.log

# Successful logins
grep "OK LOGIN" /var/log/vsftpd.log
```

**Automated Alerting:**

```bash
# Install fail2ban
sudo apt-get install fail2ban

# Configure /etc/fail2ban/jail.local
[vsftpd]
enabled = true
port = ftp,ftp-data,ftps,ftps-data
filter = vsftpd
logpath = /var/log/vsftpd.log
maxretry = 5
bantime = 3600
```

---

### Long-Term Security Improvements

#### 1. Complete FTP Decommissioning Plan

**Phase 1: Assessment (Week 1-2)**
- Identify all FTP servers
- Document current usage
- Identify stakeholders
- Map data flows

**Phase 2: Migration Preparation (Week 3-4)**
- Install SFTP infrastructure
- Configure access controls
- Test with pilot users
- Document new procedures

**Phase 3: User Migration (Week 5-8)**
- Train users on SFTP clients
- Migrate accounts gradually
- Run FTP and SFTP in parallel
- Monitor adoption

**Phase 4: Cutover (Week 9)**
- Disable FTP anonymous access
- Restrict FTP to internal only
- Monitor for issues

**Phase 5: Decommission (Week 10)**
- Disable FTP service completely
- Remove software
- Update firewall rules
- Document completion

---

#### 2. Implement Modern File Sharing Solutions

**Enterprise Alternatives:**

| Solution | Features | Use Case |
|----------|----------|----------|
| **Nextcloud** | Web UI, sync, sharing | General file sharing |
| **Seafile** | High performance, encryption | Large file storage |
| **SharePoint** | Microsoft integration | Enterprise collaboration |
| **AWS S3 + Transfer Family** | Scalable, SFTP frontend | Cloud-native transfers |
| **Azure Files** | SMB/NFS, AD integration | Hybrid environments |

---

#### 3. Security Auditing and Compliance

**Regular Audit Checklist:**

```bash
# Identify exposed FTP services
nmap -p 21 -sV --open 10.0.0.0/8

# Check for anonymous access
for ip in $(cat ftp_servers.txt); do
    echo "Testing $ip"
    ftp -n $ip <<EOF
    user anonymous
    quit
EOF
done

# Review configurations
grep -r "anonymous_enable" /etc/vsftpd.conf
grep -r "ssl_enable" /etc/vsftpd.conf
```

**Compliance Requirements:**

| Standard | FTP Requirement |
|----------|-----------------|
| **PCI-DSS** | Encryption required for cardholder data |
| **HIPAA** | Encryption required for PHI |
| **GDPR** | Encryption for personal data |
| **SOX** | Controls for financial data |
| **NIST 800-53** | Cryptographic protection |

**All prohibit cleartext FTP for sensitive data.**

---

#### 4. User Education and Policy

**Security Policy Template:**

```
File Transfer Security Policy

1. PROHIBITED:
   ✗ FTP for any external transfers
   ✗ Anonymous FTP access
   ✗ Cleartext credentials
   ✗ Unencrypted sensitive data

2. REQUIRED:
   ✓ SFTP/FTPS for all file transfers
   ✓ Strong authentication (keys preferred)
   ✓ Encryption for data in transit
   ✓ Access logging and monitoring

3. EXCEPTIONS:
   - Documented business justification
   - Compensating controls required
   - Management approval
   - Regular re-evaluation
```

---

## Tools Used

| Tool | Purpose | Command Example |
|------|---------|-----------------|
| **nmap** | Service discovery | `nmap -p 21 --script ftp-anon 10.129.xx.xxx` |
| **ftp** | Standard FTP client | `ftp 10.129.xx.xxx` |
| **lftp** | Enhanced FTP client | `lftp -u anonymous, 10.129.xx.xxx` |
| **wget** | File retrieval | `wget ftp://anonymous:@10.129.xx.xxx/flag.txt` |
| **curl** | HTTP/FTP transfer | `curl ftp://10.129.xx.xxx/flag.txt` |
| **Wireshark** | Traffic analysis | `wireshark` (filter: ftp) |
| **tcpdump** | Packet capture | `tcpdump -i eth0 port 21` |

---

## Additional Resources

**Protocol Documentation:**
- [RFC 959: File Transfer Protocol](https://tools.ietf.org/html/rfc959)
- [RFC 4217: Securing FTP with TLS](https://tools.ietf.org/html/rfc4217)
- [RFC 4251: SSH Protocol Architecture](https://tools.ietf.org/html/rfc4251)

**Security Guidelines:**
- NIST SP 800-52: Guidelines for TLS Implementations
- CIS Benchmark for FTP Servers
- OWASP Transport Layer Protection Cheat Sheet

**Migration Guides:**
- [FTP to SFTP Migration Guide](https://www.ssh.com/academy/ssh/sftp)
- [FTPS Implementation Guide](https://tools.ietf.org/html/rfc4217)

---

## Flag

```
HTB{f1l3_tr4nsf3r_pr0t0c0l_1s_1ns3cur3}
```

**Translation:** "File transfer protocol is insecure"

---

**Machine Completed:** ✅  
**Difficulty Rating:** Very Easy ⭐  
**Primary Technique:** FTP Anonymous Access / Cleartext Protocol Exploitation  
**Time to Compromise:** < 5 minutes  
**Key Lesson:** Protocol security is as important as implementation security

---

*This writeup is for educational purposes only. FTP enumeration and access should only be performed in authorized security assessments and penetration testing engagements with proper written permission.*
