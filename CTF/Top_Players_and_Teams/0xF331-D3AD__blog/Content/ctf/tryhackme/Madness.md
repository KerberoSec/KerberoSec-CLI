
# Madness

We'll start with our usual nmap scan:

```bash
$ sudo nmap 10.10.255.232 -Pn -p- -A -vv -T4 --script discovery,vuln -oN nmap-scan --min-parallelism 55 -sT
```

Select running services with

```bash
$ cat nmap-scan | grep -e '[0-9]\+/tcp[[:space:]].*' -o
```

[x] 22/tcp open  ssh     syn-ack OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 (Ubuntu Linux; protocol 2.0)

[x] 80/tcp open  http    syn-ack Apache httpd 2.4.18 ((Ubuntu))

A comment in http response:

```
Path: http://10.10.255.232:80/
|     Line number: 197
|     Comment: 
|         <!-- They will never find me-->
```

What a foolish thing to think... The comment is roight below an image that could not
be displayed. Download it:

```bash
$ wget http://10.10.255.232/thm.jpg -O thm.jpg
```

Weird. The file is jpg, but mime type is image/png. Lets change the magic number with
hex editor to jpg (You can find common magic numbers [here](https://en.wikipedia.org/wiki/List_of_file_signatures)).
We'll use thi one:

> FF D8 FF E0 00 10 4A 46 49 46 00 01

After this, open it with an image viewer, it will reveal a hidden directory.

Navigate to the directory. You'll be presented with a page that wants you to 
enter a secret. After checking the source code, we're presented with a hint:

```
<!-- It's between 0-99 but I don't think anyone will look here-->
```

Launch BurpSuote, intercapt the request, send it to Intruder and start a Sniper attack
on ?secret parameter (values from range 0-99).

After a while, we get the secret number and some sort of key is displayed. Let's try
to extract some hidden files from our previous image with that key:

```bash
$ steghide extract -sf thm.jpg
```

The result is:

```
Fine you found the password! 

Here's a username 

~REDACTED~

I didn't say I would make it easy for you!
```

Use the hint and apply ROT13 algorithm to the username.

But what about the password? As it always is with steg challenges, we should check
literally everything for hidden information. How about the image that was in the room's
dashboard?

![Smile](https://i.imgur.com/5iW7kC8.jpg)

Download it and extract hidden content (Password is empty):

```bash
$ wget https://i.imgur.com/5iW7kC8.jpg -O smile.jpg

$ steghide extract -sf smile.jpg
```

Congratulations! You've got ssh credentials! The ***user*** flag is in your home
directory.

---

## *Rooting the machine*

Let's find binaries with an SUID bit set:

```bash
$ find / -type f -perm -u=s 2>/dev/null
```

There's a suspiciously looking one, called ***screen-4.5.0***. The exploit that abuses
this binary for LPE, can be found at [ExploitDB](https://www.exploit-db.com/exploits/41154).
Transfer the exploit to the machine and execute it.

Congratulations! The flag is at /root/root.txt
