## Crocodile HackTheBox
#### About Box
A combination of FTP and HTTP, this box will help you to put your thoughts together on how you should use data you find while hunting/ pentesting. Really great for beginner

**`Skill Required:`**
- Nmap
- FTP
- Gobuster/FFUF
- Burp

---

#### Nmap:
Scan the IP to get what's up
```bash
nmap -A -sV --privileged -T4 <ip> -p- -O -sC -v

```
**`Result`**
|PORT|STATE|SERVICE|VERSION|
|----|----|----|----|
|21/tcp|open|ftp|vsftpd 3.0.3|
|80/tcp|open|http|Apache httpd 2.4.41 ((Ubuntu))|

==== **FTP** Result in detail ====
```terminal
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
| -rw-r--r--    1 ftp      ftp            33 Jun 08  2021 allowed.userlist
|_-rw-r--r--    1 ftp      ftp            62 Apr 20  2021 allowed.userlist.passwd
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to ::ffff:10.10.14.23
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 3
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
```
We have anonymous login enable here and 2 very juicy file to look at.
---
==== **HTTP** Result in detail ====
```terminal
|_http-favicon: Unknown favicon MD5: 1248E68909EAE600881B8DB1AD07F356
| http-methods: 
|_  Supported Methods: GET POST OPTIONS HEAD
|_http-title: Smash - Bootstrap Business Template
|_http-server-header: Apache/2.4.41 (Ubuntu)
```
#### Getting into **`FTP`**:
Now as we know we have anonymous login enable at **`port 21`**, we will get into it and view the files.
```bash
# FTP command
ftp <ip>
# to login as anonymous just type 'anonymous' and press enter

# list files
ls
# get files to your local system
get file.name
```
Now we have the files we need. Let's dive deep.

#### Getting into web app
Well we have no use to the FTP now. we have to focus on the webapp we have on port 80.

First I'll just do some directory fuzzing. As HTB loves `gobuster` so I'll use it. Here is the command:
```bash
gobuster dir -u http://10.129.130.77/ -w ~/custom-wl/OneListForAll/dict/common_short.txt -r -b 400-499 -e php
```
I have a common but interesting finding called **Dashboard**, this often is for the admins. Let's check.

**Dashboard** redirects to **login.php**. Now we will use our credentials which we got from **FTP** server.

Now we have to bruteforce, but my `hydra` wasn't working well, so I used **`burp intruder`**. 
Upon logining in, you will get the flag.

The the wrap.
