# Crocodile

> [https://app.hackthebox.com/starting-point?tier=1](https://app.hackthebox.com/starting-point?tier=1)

<img width="1006" height="362" alt="capa" src="https://github.com/user-attachments/assets/aa1a4d45-69d3-4f2b-97bb-ddec3dba2f62" />

## Table of Contents

* [About](#about)
* [References](#references)
* [Reconnaissance](#reconnaissance)
    * [FTP Server](#ftp-server)
    * [Web Server](#web-server) 
* [Server Manager Dashboard](#server-manager-dashboard)
* [Conclusion](#conclusion)

## About

This machine features a basic Linux system running an FTP service and an Apache web server. The main objective is to leverage two wordlists found on the FTP server to brute-force a login page, gain access to a server manager dashboard, and retrieve the flag.

## References

* [vsftpd](https://security.appspot.com/vsftpd.html)
* [Apache](https://httpd.apache.org/)
* [Gobuster](https://github.com/OJ/gobuster)
* [Burp Suite](https://portswigger.net/burp)

## Reconnaissance

Port scanning revealed two open ports: *vsftpd 3.0.3* on port 21 and *Apache httpd 2.4.41 (Ubuntu)* on port 80.

<img width="1300" height="684" alt="0" src="https://github.com/user-attachments/assets/86e27957-9741-4b6e-9a1b-8e5f747f221e" />

### FTP Server

The **FTP** service allowed *anonymous access*, as shown in the Nmap output. Two files were available for download:

```bash
# allowed.userlist

aron
pwnmeow
egotisticalsw
admin

# allowed.userlist.passwd

root
Supersecretpassword1
@BaASD&9032123sADS
rKXM59ESxesUFHAd
```

### Web Server

The landing page is built using a template from [UIdeck](https://uideck.com/) and styled with [Ayro UI](https://ayroui.com/).

<img width="1919" height="1029" alt="1" src="https://github.com/user-attachments/assets/0fdbc2e4-1b8e-4517-8407-c7b916ffeedd" />

As described on their respective sites:

* [UIdeck](https://uideck.com/): "Handcrafted HTML, Tailwind and Bootstrap Templates and UI Kits"
* [Ayro UI](https://ayroui.com/): "Bootstrap UI Component Snippets for Modern Web App and Landing Page"

The page is mostly static. The goal was to find an input point to use the credential lists obtained from FTP.

## Server Manager Dashboard

A quick **gobuster** scan using [common.txt](https://github.com/danielmiessler/SecLists/blob/master/Discovery/Web-Content/common.txt) discovered a `/dashboard` directory. Since the session was unauthenticated, it redirected to `login.php`.

<img width="1917" height="723" alt="3" src="https://github.com/user-attachments/assets/96b90e65-b93e-4946-b4aa-adf08a472645" />

Inspecting the login **POST** request showed a simple form with two input fields and a submit button:

```http
POST /login.php HTTP/1.1
Host: 10.129.91.132
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0
Content-Type: application/x-www-form-urlencoded
Content-Length: 40
Origin: http://10.129.91.132
DNT: 1
Sec-GPC: 1
Connection: keep-alive
Referer: http://10.129.91.132/login.php
Cookie: PHPSESSID=anefd6k547tv9r1fv58p1hbp3l

Username=user&Password=pass&Submit=Login
```

With only 16 possible combinations (4 usernames × 4 passwords), a *Cluster Bomb* attack in **Burp Suite** was used to brute-force the login.

The successful request was the 16th attempt: `admin::rKXM59ESxesUFHAd`. This one returned a `302 Found` status and a response size of *1609 bytes*, compared to `200 OK` and *\~2316 bytes* for failed attempts.

<img width="1920" height="1062" alt="4" src="https://github.com/user-attachments/assets/93dcb2cb-e7a7-4852-bb7a-2452804ce94d" />

Using those credentials, I was able to access the *Server Manager* dashboard and retrieve the flag.

<img width="1916" height="1056" alt="5" src="https://github.com/user-attachments/assets/389c282a-0a0b-48d4-ab81-35fb3b80602d" />

## Conclusion

The _Crocodile_ machine demonstrates basic enumeration and brute-force techniques using publicly accessible services. Anonymous FTP access exposed credential lists that, when combined with simple directory discovery and login fuzzing, allowed access to a protected web interface.
