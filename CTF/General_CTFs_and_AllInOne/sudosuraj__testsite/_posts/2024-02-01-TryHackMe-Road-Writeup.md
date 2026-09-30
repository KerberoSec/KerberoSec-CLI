---
layout: post
title:  TryHackMe | Road WriteUp
author:  sudosuraj
date:  2024-02-01
categories:  [CTF]
tags:  [TryHackMe, writeup]
image:
  path: /assets/img/headers/road.png
  alt: Road
---
#  TryHackMe | Road WriteUp 
![image](https://tryhackme-badges.s3.amazonaws.com/0xbug.png)  
Hello Friend!
In this writeup we gonna walkthrough TryHackMe CTF called Road.  
TryHackMe Room Link: https://tryhackme.com/room/road  
Difficulty: Medium   
##  Info Gathering Enumeration
### Nmap Scan  :shipit:
```bash
Nmap scan report for 10.10.141.52
Host is up (0.14s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 e6:dc:88:69:de:a1:73:8e:84:5b:a1:3e:27:9f:07:24 (RSA)
|   256 6b:ea:18:5d:8d:c7:9e:9a:01:2c:dd:50:c5:f8:c8:05 (ECDSA)
|_  256 ef:06:d7:e4:b1:65:15:6e:94:62:cc:dd:f0:8a:1a:24 (ED25519)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-title: Sky Couriers
|_http-server-header: Apache/2.4.41 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

```
The port 80:  
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/02af5be9-c3bd-44a9-9150-17f21b6d6185)  

### Directory Enumeration
```bash
dirsearch.py -u http://10.10.141.52/

301   313B   http://10.10.141.52/assets    -> REDIRECTS TO: http://10.10.141.52/assets/
301   317B   http://10.10.141.52/phpMyAdmin    -> REDIRECTS TO: http://10.10.141.52/phpMyAdmin/
301   309B   http://10.10.141.52/v2    -> REDIRECTS TO: http://10.10.141.52/v2/
```

Lets visit /v2  
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/1744ff13-93fd-48d6-b732-35d8bd7815b3)  

Here, We can register ourselve, lets do a quick registration.  

![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/0215a7f6-58d2-4afe-ab36-c7f9b56ea36b)

Now, lets login...  
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/23558022-dc9c-4f34-8073-dc03d7b2a26a)

### Admin account takeover
In the profile section, we got an option to upload to file, but it was only availabe for the admin@sky.thm user.  
So lets takeover admin account first.  

![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/052d4104-9f38-4ad9-b419-9dc217bb2b25)  

![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/83d1c48d-a667-4606-93f8-6f5564c64ab8)  

![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/09b380fa-19ca-440c-aa4d-3ece0999ce7a)  

Now, lets login as admin@sky.thm user!  

![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/1a4502dd-315c-4ea5-8de1-d01df086c96d)  

## Initial Shell Access
Now we have access to upload to file, lets upload php reverse shell of pentest monkey.  

![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/c00b2d5c-dd66-450f-bf2f-05c1002160f2)

![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/32df1413-ce0e-449e-8801-e67b2e9e8e55)

To Find out where the payload gonna uploaded, we need to intercept the response of the request, and we got this location.   

![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/afdb48de-f9b7-4c86-83ff-70856738962a)

Lets visit this URI.  

```JS
http://<machine-ip>/v2/profileimages/
```

![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/7a2b0610-7a7e-40cf880c-1ea333207226)  

lets take this request into burp repeater and do as follow.

![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/d8bd498f-3b93-4b0a-9912-3f6797d123d1)  

Turn on NetCat listner.  
```Bash
nc -lvnp 1337
```

Append the name of the file we uploaded, and send.  
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/3e692bdd-4469-4091-bbbd-c0022ef30ba8)  

Here we got shell access!!!  
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/6dc184eb-e39b-465e-be66-cf7460c6c8f0)

We can retreive first flag here,  

## Privilege Escalation
Lets list all user's using ;-  
```Bash
$ getent passwd  
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
systemd-network:x:100:102:systemd Network Management,,,:/run/systemd:/usr/sbin/nologin
systemd-resolve:x:101:103:systemd Resolver,,,:/run/systemd:/usr/sbin/nologin
systemd-timesync:x:102:104:systemd Time Synchronization,,,:/run/systemd:/usr/sbin/nologin
messagebus:x:103:106::/nonexistent:/usr/sbin/nologin
syslog:x:104:110::/home/syslog:/usr/sbin/nologin
_apt:x:105:65534::/nonexistent:/usr/sbin/nologin
tss:x:106:111:TPM software stack,,,:/var/lib/tpm:/bin/false
uuidd:x:107:112::/run/uuidd:/usr/sbin/nologin
tcpdump:x:108:113::/nonexistent:/usr/sbin/nologin
landscape:x:109:115::/var/lib/landscape:/usr/sbin/nologin
pollinate:x:110:1::/var/cache/pollinate:/bin/false
usbmux:x:111:46:usbmux daemon,,,:/var/lib/usbmux:/usr/sbin/nologin
sshd:x:112:65534::/run/sshd:/usr/sbin/nologin
systemd-coredump:x:999:999:systemd Core Dumper:/:/usr/sbin/nologin
webdeveloper:x:1000:1000:webdeveloper:/home/webdeveloper:/bin/bash
lxd:x:998:100::/var/snap/lxd/common/lxd:/bin/false
mysql:x:113:118:MySQL Server,,,:/nonexistent:/bin/false
mongodb:x:114:65534::/home/mongodb:/usr/sbin/nologin
root:x:0:0:root:/root:/bin/sh
nobody:x:65534:65534:nobody:/:/usr/sbin/nologin
```  

Lets list all sudo users.  
```Bash
$ getent group | grep sudo
sudo:x:27:webdeveloper
```

So, first we need to access shell as webdeveloper user.  
If you look closer to all the user's listed above, we can find that there's some database system running, like mongodb and mysql, so lets enumerate them.
```Bash
$ ss -tunlp
Netid State  Recv-Q Send-Q      Local Address:Port    Peer Address:Port Process 
udp   UNCONN 0      0           127.0.0.53%lo:53           0.0.0.0:*            
udp   UNCONN 0      0       10.10.160.54%eth0:68           0.0.0.0:*            
tcp   LISTEN 0      70              127.0.0.1:33060        0.0.0.0:*            
tcp   LISTEN 0      511             127.0.0.1:9000         0.0.0.0:*            
tcp   LISTEN 0      4096            127.0.0.1:27017        0.0.0.0:*            
tcp   LISTEN 0      151             127.0.0.1:3306         0.0.0.0:*            
tcp   LISTEN 0      4096        127.0.0.53%lo:53           0.0.0.0:*            
tcp   LISTEN 0      128               0.0.0.0:22           0.0.0.0:*            
tcp   LISTEN 0      511                     *:80                 *:*            
tcp   LISTEN 0      128                  [::]:22              [::]:*
```
We can see, both ports, 27017 for MongoDB and 3306 for MySQL.  
Lets go with mongo first.  
Visit [this link](https://blog.e-zest.com/basic-commands-for-mongodb) for basic commands.
```Bash
>mongo
MongoDB shell version v4.4.6
connecting to: mongodb://127.0.0.1:27017/?compressors=disabled&gssapiServiceName=mongodb
Implicit session: session { "id" : UUID("c5990cf8-8b4d-4e36-ab73-8d74c780dde1") }
MongoDB server version: 4.4.6
```
List All Database
```Bash
>show dbs
admin   0.000GB
backup  0.000GB
config  0.000GB
local   0.000GB
```
Upon enumerating all them, backup seems more interesting, lets dig it.  
```Bash
use backup
switched to db backup
```
List all collections.
```Bash
>show collections
collection
user
```

