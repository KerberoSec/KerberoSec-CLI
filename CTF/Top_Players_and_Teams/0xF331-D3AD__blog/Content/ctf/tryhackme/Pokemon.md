
# Pokemon

We'll start with our usual nmap scan:

```bash
$ sudo nmap 10.10.233.136 -Pn -p- -A -vv -T4 --script discovery,vuln -oN nmap-scan --min-parallelism 55
```

Select running services with

```bash
$ cat nmap-scan | grep -e '[0-9]\+/tcp[[:space:]].*' -o
```

[x] 22/tcp open  ssh     syn-ack ttl 63 OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 (Ubuntu Linux; protocol 2.0)

[x] 80/tcp open  http    syn-ack ttl 63 Apache httpd 2.4.18 ((Ubuntu))

---

### ***Find the Grass-Type Pokemon***

The first set of credentials can be found on the web-page, however, if you are using a 
browser, most likely, you'll miss them. download the apache index page using curl and
find ':' symbol at the end of the page. There are SSH username and password in triangle
brackets on both side of the ':'.

Use those credentials to login via ssh.

In the Desktop directory there's an archive, called P0kEmOn.zip. Transfer it to your 
machine and `unzip`. There's your grass-type pokemon in a hexadecimal representation.
Use [CyberChef](https://cyberchef.org/) to decode it from hex ;)

---

### ***Find the Water-Type Pokemon***

Ok, we obviously can't get any use of "pokemon" user, so let's switch to another one.
There was no result when I tried common privesc techniques and LinEnum also found nothing.
Then I started manually traversing directories in search of smth inetersting and in

> /home/pokemon/Videos/Gotta/Catch/Them/ALL!/Could_this_be_what_Im_looking_for?.cplusplus

file I found a set of credentials that allows us to swith to "ash" user!

After we are ash, we can run anything with sudo. So just do

```bash
$ sudo su
```

to gain root access.

Let's checkout

> /var/www/html

You'll find the water-type pokemon there. Rotate the flag 14 times to get the correct
answer.

---

### ***Find the Fire-Type Pokemon***

After capturing the water-type pokemon, I thought that the fire-type has similar
filename, so I run this command:

```bash
$ find / -type f -iname '*fire*.txt' 2>/dev/null
```

And found it under

> /etc/why_am_i_here?/

directory. Base64 decode it and get the fire-type pokemon!

---

### ***Who is Root's Favorite Pokemon?***

As "ash" we can read the file

> /home/roots-pokemon.txt

And find out!

