---
author: "Shebu"
title: "Traverxec: HTB"
date: "2021-11-17"
tags: ["nostromo", "ssh2john", "pspy", "gtfobins", "journelctl"]
cover:
    image: img/traverxec.png
    # can also paste direct link from external site
    # ex. https://i.ibb.co/K0HVPBd/paper-mod-profilemode.png
    alt: "<alt text>"
    caption: "<text>"
    relative: false # To use relative path for cover image, used in hugo Page-bundles
---

## Summary: 

 Traverxec is a easy rated machine from hackthebox which involves a public exploit for nostromo web server by which we gain a foothold on the box . On the machine there's a user called `david` .We find an id_rsa key of David in one of the directories  & thus escalating our privileges to David. For root, we make use of a sudo misconfiguration on journelctl binary to escalate our privileges to root !

| **Name  -** | Traverxec |
|:---:|---|
| **OS   -**    | Linux |
| **Difficulty -** | Easy |
| **Room Link   -** | https://www.hackthebox.eu/home/machines/profile/217 |
| **Creator   -** | [jkr](https://www.hackthebox.eu/home/users/profile/77141) |

## Enumeration: 
------------------------------

**Nmap**

```zsh
# Nmap 7.91 scan initiated Thu Jul 15 13:18:21 2021 as: nmap -sC -sV -v -p 22,80 -oN traverxec.nmap 10.10.10.165
Nmap scan report for 10.10.10.165
Host is up (0.38s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.9p1 Debian 10+deb10u1 (protocol 2.0)
| ssh-hostkey: 
|   2048 aa:99:a8:16:68:cd:41:cc:f9:6c:84:01:c7:59:09:5c (RSA)
|   256 93:dd:1a:23:ee:d7:1f:08:6b:58:47:09:73:a3:88:cc (ECDSA)
|_  256 9d:d6:62:1e:7a:fb:8f:56:92:e6:37:f1:10:db:9b:ce (ED25519)
80/tcp open  http    nostromo 1.9.6
|_http-favicon: Unknown favicon MD5: FED84E16B6CCFE88EE7FFAAE5DFEFD34
| http-methods: 
|_  Supported Methods: GET HEAD POST
|_http-server-header: nostromo 1.9.6
|_http-title: TRAVERXEC
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Thu Jul 15 13:18:39 2021 -- 1 IP address (1 host up) scanned in 18.13 seconds
``` 
As you can see there are 2 ports open :

**Port 22**: `SSH`    - `OpenSSH 7.9p1 Debian 10+deb10u1 `

**Port 80**: `HTTP`  - `nostromo 1.9.6`

**Website: Port 80**

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1626501511759/wGzYtNhut.png)

As the nmap scan showed ,the website isrunning on `nostromo`  web server of `version 1.9.6` , lets look for public exploits for this version using searchsploit .

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1626501650018/0r0mODJGa.png)

And we have a `remote code execution` vulnerability for this version of nostromo.
I had some issues with python2 when solving the box so I had to use metasploit  this time.

Open msfconsole and search for nostromo & you will get this exploit .

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1626501886372/qXzvevdRR.png)

## Foothold -
-----------------------

Lets use the metasploit module . Set the LHOST,RHOST,RPORT & other parameters needed  for the exploit to work and finally run the exploit .

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1626502025094/zSIi3oFaI.png)

And we are in as `www-data` user  !

Viewing `/etc/passwd` tells us there is a user called `David`

```bash
cat /etc/passwd |grep -i "bash"
``` 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1626502184080/OLZ0T6ih4.png)

## Shell as David -
---------------------------------

I ran Linpeas to check for any interesting files or any priv-esc vectors , it displayed an md5crypt password  hash of David 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1626502540277/pFTAF4_TW.png)

I used hashcat to crack it 

```bash
hashcat -m 500 htpasswd /usr/share/wordlists/rockyou.txt --username --force
``` 
 

Now we have this: `david:Nowonly4me` .

**But this password doesn't seem to help as I couldn't ssh into the machine as David.**

Time for some manual enumeration!

Lets look for any files from nostromo web server ,

In `/var` , we see a directory called **nostromo** .Lets enumerate that directory as it might contain some juicy information.

Looking at `/var/nostromo/conf/.htpasswd` - we have that hash which linpeas found for us .

In the `/var/nostromo/conf/nhttpd.conf` we have these contents which seems interesting!

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1626502964249/2m1cEL5hT.png)

After reading the documentation of nostromo , I came to know that **homedirs serve as the home directories of the user**.

**So under david's home directory we have a public directory called `public_www`**.Lets lists the contents of this directory

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1626503406080/dxHW0QMQk.png)

We find that there is another directory within it called `protected-file-area`.Lets list the contents  of that directory now ,

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1626503551130/5LiHP0T7D.png)

We have 2 files `.htaccess` & `backup-ssh-identity-files.tgz` .The tar file seems interesting .Lets copy it to /dev/shm and lets extract the contents of the tar archive.

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1626503793599/BbXESSW2v.png)

We can see we have id_rsa key from the extracted files,lets copy that to our machine .

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1626504653363/CdZ50MkD3.png)
It is encrypted hence we will use `ssh2john` to extract a hash of it and then crack it using rockyou wordlist !

```bash
 ssh2john id_rsa > hash

john --wordlist=/usr/share/wordlists/rockyou.txt hash
``` 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1626504849405/m16iIFs5B.png)

And we have the password .Make sure to give correct permissions to id_rsa & now lets SSH into the machine as **David** 

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1626505593907/t2P8pyPFg.png)

Grab the `user.txt` 🚩

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1626507874305/8yczE0Fxn.png)

## Shell as Root -
------------------------------------

Running Linpeas ,we find that we have a shell script called `server-status.sh`

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1626505711907/SNmVcu7X-.png)

I checked if there are any cronjobs running which executes this script & there wasn't any. I even used **pspy** to check for any cronjobs run by root which were not visible to us. And still we find nothing . 

OK .lets check the contents of the file .
```
#!/bin/bash
cat /home/david/bin/server-stats.head
echo "Load: `/usr/bin/uptime`"
echo " "
echo "Open nhttpd sockets: `/usr/bin/ss -H sport = 80 | /usr/bin/wc -l`"
echo "Files in the docroot: `/usr/bin/find /var/nostromo/htdocs/ | /usr/bin/wc -l`"
echo " "
echo "Last 5 journal log lines:"
/usr/bin/sudo /usr/bin/journalctl -n5 -unostromo.service | /usr/bin/cat 

```
The last line seems weird . **Journelctl is run with sudo**  .

> Journalctl is a utility for querying and displaying logs from journald, systemd's logging service. Since journald stores log data in a binary format instead of a plaintext format, journalctl is the standard way of reading log messages processed by journald

But the key thing here is the sudo rule breaks when a pipe command is introduced.Meaning that **any command after  pipe will not be executed with sudo permissions ! **'

So in the last line only `/usr/bin/sudo /usr/bin/journalctl -n5 -unostromo.service` is executed with sudo permissions and not `/usr/bin/cat` .

Lets check   [GTFOBINS](https://gtfobins.github.io/gtfobins/journalctl/)  for any **sudo misconfiguration in journelctl** to escalate our privileges.

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1626507057730/7zgDvi3uN.png)

### *Steps* -

Run the command 

```bash
 /usr/bin/sudo /usr/bin/journalctl -n5 -unostromo.service
``` 

Type `!/bin/sh` & hit ENTER .

WOHOO ! We are **root** !

Grab the `root.txt` 🚩

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1626507547001/kUzsPWRe0c.png)
 
