---
author: "Shebu"
title: "Retro: THM"
date: "2021-11-16"
tags: ["IIS", "CVE-2019-1388", "xfreerdp", "tryhackme"]
cover:
    image: img/retro.png
    # can also paste direct link from external site
    # ex. https://i.ibb.co/K0HVPBd/paper-mod-profilemode.png
    alt: "<alt text>"
    caption: "<text>"
    relative: false # To use relative path for cover image, used in hugo Page-bundles
---

## Description: 
____________________________________________________

**New high score!**

**There are two distinct paths that can be taken on Retro. One requires significantly less trial and error, however, both will work.**

| **Room** | Retro |
|:---:|---|
| **OS**    | Windows |
| **Difficulty** | Hard |
| **Room Link** | https://tryhackme.com/room/retro |
| **Creator** | [DarkStar7471](https://twitter.com/darkstar7471) |

## Enumeration -
____________________________________________________

**Task 1: Pwn**

**Nmap**

```bash
# Nmap 7.91 scan initiated Mon Aug  9 02:32:51 2021 as: nmap -sC -sV -v -p 80,3389 -oN retro.nmap retro.thm
Nmap scan report for retro.thm (10.10.39.189)
Host is up (0.22s latency).

PORT     STATE SERVICE       VERSION
80/tcp   open  http          Microsoft IIS httpd 10.0
| http-methods: 
|   Supported Methods: OPTIONS TRACE GET HEAD POST
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
|_http-title: IIS Windows Server
3389/tcp open  ms-wbt-server Microsoft Terminal Services
| rdp-ntlm-info: 
|   Target_Name: RETROWEB
|   NetBIOS_Domain_Name: RETROWEB
|   NetBIOS_Computer_Name: RETROWEB
|   DNS_Domain_Name: RetroWeb
|   DNS_Computer_Name: RetroWeb
|   Product_Version: 10.0.14393
|_  System_Time: 2021-08-09T06:32:02+00:00
| ssl-cert: Subject: commonName=RetroWeb
| Issuer: commonName=RetroWeb
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2021-08-08T06:21:24
| Not valid after:  2022-02-07T06:21:24
| MD5:   55a1 3e5f 9623 5cf0 be0e 8565 b1bb 00a5
|_SHA-1: a0cf f59d 1e77 e914 7eeb 810e b04d a310 dc2c c90e
|_ssl-date: 2021-08-09T06:32:06+00:00; -1m00s from scanner time.
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: -1m00s, deviation: 0s, median: -1m00s

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Mon Aug  9 02:33:06 2021 -- 1 IP address (1 host up) scanned in 15.70 seconds
``` 
As you can see there are 2 ports open :

**Port 80**: `http ` - ` Microsoft IIS httpd 10.0`

**Port 3389**: `ms-wbt-server` -  `Microsoft Terminal Services`

**Web Enumeration**

Visitinng the webpage at port 80, we get a `default IIS  page` 👇🏻

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1628496207799/WpfvKksHP.png)

To enumerate the hidden directories , I used **ffuf**

```bash
┌──(shebu㉿kali)-[~/Desktop/thm/retro]
└─$ ffuf -c -w /usr/share/wordlists/dirbuster/medium.txt -u http://retro.thm/FUZZ -fc 403,404 -fs 703

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v1.3.1 Kali Exclusive <3
________________________________________________

 :: Method           : GET
 :: URL              : http://retro.thm/FUZZ
 :: Wordlist         : FUZZ: /usr/share/wordlists/dirbuster/medium.txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200,204,301,302,307,401,403,405
 :: Filter           : Response status: 403,404
 :: Filter           : Response size: 703
________________________________________________

retro                   [Status: 301, Size: 146, Words: 9, Lines: 2]
```

**Qn 1 🎯- What is the hidden directory which the website lives on?**: `/retro `

 
## Shell as Wade -
____________________________________________________

On visiting the `/retro` directory we get this webpage  👇🏻

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1628497851032/m91ozeahl.png)
 
Seems like a fancy looking blog page .Taking a close look at the page , you can see that the author of the blog posts is `Wade` 

**Wade** might possibly be a username which may come handy later .Lets note it down and enumerate further !

While looking at all the posts ,one particular post is quite interesting 👇🏻

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1628498192898/LmlCC_-F0.png)

This posts has some comments on it !

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1628498336717/tVhZoC5NM.png)

Could that be Wade's password? Let's try logging in using xfreerdp !

```bash
xfreerdp /u:wade /p:parzival /cert:ignore /v:retro.thm
``` 
And we're in !!

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1628498610359/qsqeJCwxd.png)

Grab the `user.txt`🚩 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1628498965342/8JUkfeIvh.png)

## Shell as administrator -
____________________________________________________

The first thing I checked was **recycle bin** , It contained `hhupd.exe` file .

> hhupd.exe is an executable file that is part of the Microsoft Press Computer-Lexikon program developed by Microsoft Press .

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1628501313225/yrffg7Hay.png)

The next thing I noticed is there was **Google Chrome** shortcut in desktop which was weird !  
Opening Chrome , we could see that the author of the box has a bookmark called **NVD-CVE-2019-1388** 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1628499422018/d61jwREHl.png)

Maybe this is  what we need inorder to escalate out privileges to root !
 So the CVE is `CVE-2019-1388`

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1628501345278/tt0bOdAxv.png)

Lets use some google fu to read more on this vulnerability ,

**This blog post explains it in quite detailed and clear manner on how to exploit this vulnerability -**

> https://www.zerodayinitiative.com/blog/2019/11/19/thanksgiving-treat-easy-as-pie-windows-7-secure-desktop-escalation-of-privilege

For this exploit to work we need to have `hhupd.exe` application on our system , which we already found in recycle bin .Restore the application and follow the steps as mentioned in the blog post .

```bash
1. Run the "hhupd.exe" application as administrator
2. Click on "Show more details" arrow
3. Click the link "Show information about this publisher's certificate"
4. Click the link  "VeriSign Commercial Software Publishers CA"
5. Now the certificate issuer's website should have been opened on internet explorer!
6. Press "CTRL+S" to save the webpage , a dialog box appears 
7. Type "cmd.exe" on the File name box and hit ENTER !

Voila ! We get a command prompt with admin privileges !
``` 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1628500476774/rBOSJ3Uvo.png)

Navigate to **C:\Users\Administrator\Desktop**

Grab the `root.txt` 🚩

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1628500633111/FE7yJpFOJ.png)
