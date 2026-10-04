# Cap: Hack The Box Writeup

![Difficulty](https://img.shields.io/badge/Difficulty-Easy-green)
![OS](https://img.shields.io/badge/OS-Linux-blue)
![Category](https://img.shields.io/badge/Category-Network%20Analysis-orange)

---

## Machine Information

| Attribute | Details |
|-----------|---------|
| **Machine Name** | Cap |
| **Difficulty** | Easy |
| **Platform** | Hack The Box |
| **Category** | Network Analysis / Web / Credentials |
| **Status** | Fully Pwned (User + Root) |

---

## Table of Contents

- [Enumeration](#enumeration)
- [Web Application Analysis](#web-application-analysis)
- [Exploitation](#exploitation)
- [Privilege Escalation](#privilege-escalation)
- [Flags](#flags)
- [Key Takeaways](#key-takeaways)

---

## Enumeration

### Port Scanning

Initial reconnaissance revealed **3 open TCP ports** on the target machine.

```bash
# Nmap scan results
# [Port scan command and results would go here]
```

**Open Ports:**
- Port 21: FTP
- Port 22: SSH
- Port 80: HTTP

---

## Web Application Analysis

### Security Snapshot Function

The web application features a **Security Snapshot** functionality that captures network traffic.

#### IDOR Vulnerability Discovery

After running a Security Snapshot, the browser redirects to:

```
/data/{id}
```

This URL pattern exposes an **Insecure Direct Object Reference (IDOR)** vulnerability, allowing access to other users' scan results by manipulating the ID parameter.

**Exploitation Path:**
- Capture own snapshot → redirected to `/data/[high_number]`
- Modify URL to `/data/0` → access earlier captures
- Download PCAP files from other sessions

---

## Exploitation

### PCAP File Analysis

Downloaded and analyzed the PCAP file with **ID `0`**, which contained historical network traffic.

**Analysis Tool:** Wireshark / tcpdump

#### FTP Credentials Discovered

Examining the packet capture revealed **cleartext FTP credentials** transmitted over the network.

**Protocol Identified:** FTP (Application Layer)

```
Username: nathan
Password: [REDACTED]
```

**Finding:**
- FTP transmits credentials in plaintext
- Traffic analysis exposed sensitive authentication data
- No encryption on the FTP session

---

### Credential Reuse

The recovered FTP credentials belonged to user **nathan**. Testing for credential reuse across services proved successful.

**Reuse Vector:** SSH

```bash
ssh nathan@<target_ip>
```

**Result:** Direct user-level shell access obtained ✓

---

## Privilege Escalation

### User Access

- Successfully logged in as `nathan` via SSH
- Standard user privileges confirmed
- User flag retrieved

### Root Escalation

Performed standard Linux privilege escalation enumeration:

```bash
# Check sudo privileges
sudo -l

# Review capabilities
getcap -r / 2>/dev/null

# Examine SUID binaries
find / -perm -4000 2>/dev/null
```

**Escalation Vector:** [Specific method would be detailed here based on actual exploitation]

**Result:** Root access obtained, root flag retrieved ✓

---

## Flags

### User Flag

```
[USER FLAG HASH]
```

**Location:** `/home/nathan/user.txt`

### Root Flag

```
[ROOT FLAG HASH]
```

**Location:** `/root/root.txt`

---

## Key Takeaways

### Vulnerabilities Identified

1. **IDOR (Insecure Direct Object Reference)**
   - Sequential ID enumeration allowed access to other users' data
   - No authorization checks on `/data/{id}` endpoint
   - Sensitive PCAP files exposed to unauthorized access

2. **Plaintext Protocol Usage**
   - FTP transmitted credentials without encryption
   - Network traffic analysis revealed reusable credentials
   - Protocol choice introduced critical security weakness

3. **Credential Reuse**
   - Same password used across FTP and SSH services
   - Single credential compromise led to full user access
   - Lack of unique passwords per service

4. **Privilege Escalation**
   - Standard enumeration techniques successful
   - [Specific vulnerability exploited for root]

### Attack Chain Summary

```
IDOR Vulnerability → PCAP Download → FTP Credential Extraction → SSH Access → Privilege Escalation → Root
```

### Defensive Recommendations

- **Implement proper authorization checks** on data endpoints
- **Avoid cleartext protocols** (use SFTP instead of FTP)
- **Enforce unique passwords** across different services
- **Monitor for IDOR vulnerabilities** during security assessments
- **Encrypt sensitive network traffic** at all layers
- **Regular security audits** of privilege escalation vectors

---

## Tools Used

- `nmap` - Port scanning and service enumeration
- `Wireshark` / `tcpdump` - PCAP analysis
- `Burp Suite` / Browser DevTools: IDOR testing
- Standard Linux enumeration scripts

---

## Lessons Learned

- **Network traffic analysis** is a powerful attack vector for extracting credentials
- **IDOR vulnerabilities** can expose sensitive internal data beyond intended access
- **Credential reuse** remains a critical security flaw in many environments
- **Protocol selection matters**: cleartext protocols should be avoided in production
- **Defense in depth** is essential: multiple security failures enabled full compromise

---

**Machine Completed:** ✓  
**Date:** [Your completion date]  
**Author:** [Your name/handle]

---

*This writeup is for educational purposes only. Always obtain proper authorization before testing security on any system.*
