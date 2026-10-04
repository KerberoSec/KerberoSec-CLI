---
author: "Shebu"
title: "Daily Bugle: THM"
date: "2021-11-16"
tags: ["cmseek", "joomla", "johntheripper", "pentestmonkey", "linpeas", "gtfobins", "tryhackme"]
cover:
    image: img/dailybugle
    # can also paste direct link from external site
    # ex. https://i.ibb.co/K0HVPBd/paper-mod-profilemode.png
    alt: "<alt text>"
    caption: "<text>"
    relative: false # To use relative path for cover image, used in hugo Page-bundles
---

## Description -
_________________________________________

Compromise a Joomla CMS account via SQLi, practise cracking hashes and escalate your privileges by taking advantage of yum .
Hack into the machine and obtain the root user's credentials.

![fREnB0x.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1631264869547/ds-SaXjzj.png)

|  **Room name  ** | Daily Bugle                                    |
|:----------------:|------------------------------------------------|
|   **OS   **      | Linux                                          |
|  **Difficulty ** | Hard                                           |
| **Room Link   ** | https://tryhackme.com/room/dailybugle          |
|  **Creator   **  | [Tryhackme](https://tryhackme.com/p/tryhackme) |

## Enumeration -
__________________________________________

#### Portscan

```zsh

➜  dailybugle rustscan -a 10.10.164.206 --range 0-65535 -- -sV -sC -v -oN dailybugle.nmap

# Nmap 7.91 scan initiated Sun Sep  5 10:04:00 2021 as: nmap -vvv -p 22,80,3306 -sV -sC -v -oN dailybugle.nmap 10.10.164.206
Nmap scan report for 10.10.164.206
Host is up, received syn-ack (0.65s latency).
Scanned at 2021-09-05 10:04:01 EDT for 23s

PORT     STATE SERVICE REASON  VERSION
22/tcp   open  ssh     syn-ack OpenSSH 7.4 (protocol 2.0)
| ssh-hostkey: 
|   2048 68:ed:7b:19:7f:ed:14:e6:18:98:6d:c5:88:30:aa:e9 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCbp89KqmXj7Xx84uhisjiT7pGPYepXVTr4MnPu1P4fnlWzevm6BjeQgDBnoRVhddsjHhI1k+xdnahjcv6kykfT3mSeljfy+jRc+2ejMB95oK2AGycavgOfF4FLPYtd5J97WqRmu2ZC2sQUvbGMUsrNaKLAVdWRIqO5OO07WIGtr3c2ZsM417TTcTsSh1Cjhx3F+gbgi0BbBAN3sQqySa91AFruPA+m0R9JnDX5rzXmhWwzAM1Y8R72c4XKXRXdQT9szyyEiEwaXyT0p6XiaaDyxT2WMXTZEBSUKOHUQiUhX7JjBaeVvuX4ITG+W8zpZ6uXUrUySytuzMXlPyfMBy8B
|   256 5c:d6:82:da:b2:19:e3:37:99:fb:96:82:08:70:ee:9d (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBKb+wNoVp40Na4/Ycep7p++QQiOmDvP550H86ivDdM/7XF9mqOfdhWK0rrvkwq9EDZqibDZr3vL8MtwuMVV5Src=
|   256 d2:a9:75:cf:2f:1e:f5:44:4f:0b:13:c2:0f:d7:37:cc (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIP4TcvlwCGpiawPyNCkuXTK5CCpat+Bv8LycyNdiTJHX
80/tcp   open  http    syn-ack Apache httpd 2.4.6 ((CentOS) PHP/5.6.40)
|_http-favicon: Unknown favicon MD5: 1194D7D32448E1F90741A97B42AF91FA
|_http-generator: Joomla! - Open Source Content Management
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
| http-robots.txt: 15 disallowed entries 
| /joomla/administrator/ /administrator/ /bin/ /cache/ 
| /cli/ /components/ /includes/ /installation/ /language/ 
|_/layouts/ /libraries/ /logs/ /modules/ /plugins/ /tmp/
|_http-server-header: Apache/2.4.6 (CentOS) PHP/5.6.40
|_http-title: Home
3306/tcp open  mysql   syn-ack MariaDB (unauthorized)

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sun Sep  5 10:04:25 2021 -- 1 IP address (1 host up) scanned in 24.88 seconds

``` 
There are 3 ports open :

**Port 22**: `SSH ` - ` OpenSSH 7.4 `

**Port 80**: `http` -  `Apache httpd 2.4.6 ((CentOS) PHP/5.6.40)`

**Port 3306 **: `mysql` - `MariaDB (unauthorized)`

#### Web enumeration

On visiting the webpage on port 80 , we get this

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1631258957417/fvLOoGeHK.png)

> Task 1 : Access the web server, who robbed the bank? 

> 

> Answer: spiderman

#### robots.txt

As per the nmap scan , there were few disallowed entries listed in robots.txt ,lets check them out 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1631259018959/6v1j28y16.png)

I checked each of them and all the directories returned an empty page except `/administrator`

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1631259116380/B3D5tuif4.png)

So , now we have a Joomla login page but we have no valid creds.

I viewed the source code to see whether we could find the version of joomla running here but couldn't find anything. Wappalyzer didn't reveal much info about the version either 🤔.
#### cmseek

Runnning a tool called `cmseek`which is basically a cms vulnerability scanner  gave the version of Joomla cms that is running here

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1631259710862/RG70AThLR.png)

>Task 2 : What is the Joomla version?

> 

> Answer: 3.7.0

## Foothold -
______________________________

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1631259982974/yAZ7unfzZ.png)

Since Tryhackme tells us to use a python script from github rather than using sqlmap, I googled for this `CVE-2017-8917` exploit .And I got one straight away

You can find the exploit here 👉🏻 https://github.com/stefanlucas/Exploit-Joomla/blob/master/joomblah.py

Let's run the script using python2

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1631260511706/PpKqT076I.png)

Now we have a password hash for the user `Jonah` ! 

#### hashid

First we need to find what kind of hashing algorithm is used, lets run `hashid` 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1631260775997/E0Hdp8bQS.png)
#### john the ripper
So it tells us that it is `bcrypt`.Now lets crack it using JTR

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1631260872537/cxteNdwLL.png)
 
**NOTE: It will take nearly 7 minutes for john to crack this password hash**

And now we have Jonah's password 

>Task 2 : What is Jonah's cracked password?
>
>spi******123

Lets now login to that webpage we saw earlier

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1631261102823/Ojto4ndpo.png)
#### Reverse shell
And We are in ! After some manual enumeration , I was able to edit the `index.php` file of one of the templates  with  [pentest monkey's PHP reverse shell script](https://github.com/pentestmonkey/php-reverse-shell/blob/master/php-reverse-shell.php)  to get a reverse shell 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1631261198663/oD_0MTExC.png)

To trigger the exploit , just click the **Template preview** button to get a reverse shell back to your machine .

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1631263470050/eLlhF_xM1.png)

And finally we are in as the **apache user** !

## Shell as JJameson -
____________________________

First things first , lets check what users are on the system

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1631263524823/zO5i12Oxd.png)

There are two users: **root** &** jjameson**

Time to do some priv-esc. I quickly transferred ** [Linpeas](https://github.com/carlospolop/PEASS-ng/tree/master/linPEAS) ** to the target machine and ran it.

One particular thing stood out 👇🏻

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1631263785118/u4PtPIkAT.png)

It seems like password for jjameson , let's try to switch user as  jjameson & it works !

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1631263847690/Cs_pDYcZP.png)

Grab the `user.txt` 🚩

>Task 3 : What is the user flag?
>
>Answer: 27a260fe3********d80442e

## Shell as root -
________________________________

So its time to priv-esc to root🧐 

Running `sudo -l` , we come to know that we could run `yum` binary as root .

I quickly looked at  **  [GTFOBINS](https://gtfobins.github.io/gtfobins/yum/#sudo)  for any sudo misconfiguration in yum binary** to help us escalate our privileges to root  .

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1631264337430/has2A6z7F.png)

Run the following snippet as shown in GTFOBINS to obtain root 👑 !

Grab the `root.txt` 🚩

> Task 2: What is the root flag?
>
>Answer: eec3d53****fa6f79
