*[Image: RootMe Cover Image]*
# RootMe Writeup

## NMAP Scan
```
Starting Nmap 7.93 ( https://nmap.org ) at 2022-11-11 16:53 GMT
Nmap scan report for 10.10.69.147
Host is up (0.20s latency).
Not shown: 999 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 4ab9160884c25448ba5cfd3f225f2214 (RSA)
|   256 a9a686e8ec96c3f003cd16d54973d082 (ECDSA)
|_  256 22f6b5a654d9787c26035a95f3f9dfcd (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
|_http-title: HackIT - Home
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```
From the NMAP scan, I see that there is a website hosted on port 80. Browsing to the website, it seems to just be a simple page saying **Can you root me?**.

## Gobuster Scan
```
/index.php
/uploads
/css
/js
/panel
```
**/uploads** and **/panel** look interesting.
- **/uploads** is an empty directory
- **/panel** has a file upload form

I'm guessing that files that get uploaded can be accessed in the **/uploads** directory. I try to upload a simple text file to see if this is true, and it is.

## Foothold
Now I know that files that are uploaded can be accessed directly from te **/uploads** directory, and I know that the webserver is running on PHP (as the index page is named **index.php**), I will try upload a **.php** file to get code execution.

My first attempt at uploading a PHP file was blocked as files with a **.php** file extensions are not allowed. So I open up BurpSuite Intruder to test different file extensions to see which one works. I find that **.php5** works. Now I know that I can upload a **.php5** file, it's time to upload a PHP reverse shell.

I like to use the PHP reverse shell made by `pentestmonkey` on GitHub. You can find it [here](https://github.com/pentestmonkey/php-reverse-shell/blob/master/php-reverse-shell.php).

(Just make sure to change the IP and Port in the reverse shell, to your listener IP and Port, before saving it as a **.php5** file)

I then started a listener `nc -nvlp <port>`

It's time to upload the reverse shell and then activate it by browsing to the file in **/uploads**.

Now I have a shell on the machine and stabilize it using `python3 -c 'import pty;pty.spawn("/bin/bash")'` and I can see that I have a shell as `www-data`.

I find the user flag in `/var/www`. Now I have the user flag, it's time to become root!

## Privilege Escalation (root)
Running the command `find / -perm -4000 2>/dev/null`, to find SUID binaries I have access to, returns a long list of them. But one of them stands out above the rest `/usr/bin/python`. Python is not usually a SUID binary you would see on Linux machines. I can abuse this using a technique that can be found on [GTFOBins](https://gtfobins.github.io/gtfobins/python/#suid)

The command: `./python -c 'import os; os.execl("/bin/sh", "sh", "-p")'`

Success! I run the command and it spawns a root shell!

I change directory to **/root** and find the root flag to complete the CTF.

TryHackMe RootMe: [https://tryhackme.com/room/rrootme](https://tryhackme.com/room/rrootme)
