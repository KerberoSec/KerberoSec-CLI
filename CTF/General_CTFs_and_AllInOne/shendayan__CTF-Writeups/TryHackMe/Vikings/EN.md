# Vikings

*[Image: Image]*

This writeup is about the room Vikings on [TryHackMe](https://tryhackme.com/room/vikings) by ... [me](https://tryhackme.com/p/Shendayan) :)

I set up this room as a CTF, which takes a lot of different techniques to be solved.

## Used techniques
````
- nmap
- steghide
- ftp
- reverse image search
- hydra
- decryption with cyberchef
- zip2john / john
````

## Task 2: Roam around

As with every new CTF, it makes sense to perform a port scan with nmap.

````
nmap -A -sV 10.10.97.203
Starting Nmap 7.80 ( https://nmap.org ) at 2020-11-24 13:44 CET
Nmap scan report for 10.10.97.203
Host is up (0.031s latency).
Not shown: 997 closed ports
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 05:a0:f7:73:1c:92:25:7f:76:ca:85:4b:e6:1e:9d:ee (RSA)
|   256 22:14:4d:87:a0:93:06:08:66:25:44:43:5a:b4:2e:ae (ECDSA)
|_  256 00:fe:b4:9a:31:bc:97:1a:91:b5:39:b4:2e:83:42:ae (ED25519)
80/tcp   open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Your arrived at a new shore!
1053/tcp open  ftp     vsftpd 2.0.8 or later
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_-rw-r--r--    1 0        0             415 Nov 18 12:13 who-are-you.txt
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to 10.11.19.136
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 2
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 43.57 seconds
````
If there is a web server, I always take a look at it:

*[Image: Image]*

An interesting comment is hidden in the source code of the page:
````
<!-- WW91IGhhdmUgYXJyaXZlZCB3aXRoIHlvdXIgc2hpcCBvbiBhbiB1bmtub3duIGlzbGFuZC4gCkRvIHlvdSBzZWUgdGhhdCAvbGl0dGxlLWh1dCBpbiB0aGUgZGlzdGFuY2U/IApZb3UgbWlnaHQgZmluZCBhIGNsdWUgaW4gdGhlcmUuLi4= -->
````
````
❯ echo $comment | base64 -d
You have arrived with your ship on an unknown island. 
Do you see that /little-hut in the distance? 
You might find a clue in there...
````

/little-hut is a reference to a directory on that server.

*[Image: Image]*

It doesn't look really inviting. But the base64 text said: "You might find a clue in there"

So it means that the next clue is INSIDE of the hut.

````
❯ steghide --extract -sf little-hut.jpg
Passwort eingeben: 
Extrahierte Daten wurden nach "runestone.txt" geschrieben.
❯ cat runestone.txt
Hello Stranger.

I hope you come with peaceful intent. 
Oh, you're looking for the key to Valhalla. 
Many others have tried that before. 
The only way I know to get there is to die honorably on the battlefield. 
The Valkyries will then show you the way.

An old friend of mine once told me about a wanderer who is said to have spoken to the Allfather.
If there is any way to travel to the golden hall without the Valkyries help, maybe this wanderer knows about it.
You can find him in a port nearby. His name is Bjorn. 
When you meet him, tell him I sent you. He owes me a favor.
So that he can be sure you are telling the truth, give him this:

*The old man hands you a rune-stone-carved-from-wood.*
````

#### T2Q1: How many open ports can you find? 

Answer: 3

#### T2Q2: Where can you find the next clue? 

Answer: /little-hut

#### T2Q3:  What name did the old man mention? 

Answer: Bjorn

## Task 3: Find his old friend

Okay, so I should look for Bjorn "in a port nearby".
I spontaneously think of the FTP server.

*[Image: Image]*

Who do I have to justify myself to?

*[Image: Image]*

But since I know who I'm looking for: björn: I won't let that stop me and keep looking!

````
ftp> ls -la
200 PORT command successful. Consider using PASV.
150 Here comes the directory listing.
drw-r-xr-x    3 0        0            4096 Nov 18 12:13 .
drw-r-xr-x    3 0        0            4096 Nov 18 12:13 ..
drwxr-xr-x    2 0        0            4096 Nov 19 14:14 .hidden
-rw-r--r--    1 0        0             415 Nov 18 12:13 who-are-you.txt
226 Directory send OK.
ftp> cd .hidden
250-You mingle with the crowd and walk through the village.
250-You don't really know what you're looking for.
250-Suddenly you see a familiar face.
250 Directory successfully changed.
ftp> ls
200 PORT command successful. Consider using PASV.
150 Here comes the directory listing.
-rw-r--r--    1 0        0             272 Nov 18 12:13 what-are-you-searching-for.txt
226 Directory send OK.
ftp> get what-are-you-searching-for.txt
local: what-are-you-searching-for.txt remote: what-are-you-searching-for.txt
200 PORT command successful. Consider using PASV.
150 Opening BINARY mode data connection for what-are-you-searching-for.txt (272 bytes).
226 Transfer complete.
272 bytes received in 0.00 secs (2.4243 MB/s)
````
*[Image: Image]*

Okay, this looks like a dead end!

But the old man also said that I should give something to bjorn so that he knows who I'm from.
Sounds like a kind of password.

bjorn:rune-stone-carved-from-wood

*[Image: Image]*

What do I do with the two files now? One is an image and the other appears to be an executable file.

Looking into the binary with hexedit, I noticed that this is a copy of the "strings" binary.
Björn's Tagelharpa broke, so I'm nice and give him a new string for his instrument:

````strings Tagelharpa````  shows an interesting section in the middle of the output:

*[Image: Image]*

If Bjorn doesn't remember, I'll just have to look for the name of the place. I'm not completely without a clue.

*[Image: Image]*

If you upload the picture from the task at yandex, the first hit will be shown where this Viking village is located.

*[Image: Image]*

In [Gudvangen: Norway](https://gudvangenbudgethotel.com/about/).

````
❯ steghide --extract -sf vegvisir.jpg
Passwort eingeben: gudvangen
Extrahierte Daten wurden nach "wanderer.txt" geschrieben.
❯ cat wanderer.txt
wanderer:notallwhowanderarelost
````

#### T3Q1:  What instrument was Bjorn playing? 

Answer: Tagelharpa

#### T3Q2:  Where did he sent you? 

Answer: Gudvangen

#### T3Q3:  What secret is Vegvisir exposing to you? 

Answer: wanderer.txt

## Task 4: The Wanderer

With the creds I just received, I finally have access to the machine!

*[Image: Image]*

.bash_history is not really helpful:
````
wanderer@midgard:~$ cat .bash_history 
This thing is beyond your understanding, my child. 
Think no further on the matter and maybe you will read the riddle in the end. Who knows? 
Meanwhile the air is fresh and the day golden and my palace is near at hand. 
The young should enjoy themselves while they may, so come!
````

With ````sudo -l```` you can check whether wanderer is allowed to do something with root privs: he is!

*[Image: Image]*

That was a brief introduction. Fortunately, you can log in again with the creds. 

Otherwise it would be a little difficult to find out that there is another user: berserker.

*[Image: Image]*

#### T4Q1:  What did the wanderer do?

Answer: /etc/landscape/disappear.sh

#### T4Q2:  What did he tell you to fight with? 

Answer: brute force

## Task 5: The Berserker

If I have to fight a berserker with "brute force", the best thing to do is send the Hydra ahead.
She is stronger than me :)

*[Image: Image]*

There are two bash scripts in home dir that I cannot read. ````sudo -l```` helps me here again:

*[Image: Image]*

Since the box is built very realistically, I behave very realistically, too: NOT :)
````
berserker@midgard:~$ sudo ./flee.sh 
If you run away from a fight, you will just die tired!
This is definitly not the way to Valhalla!
Connection to 10.10.97.203 closed by remote host.
Connection to 10.10.97.203 closed.
````
Well, if I only have the choice between fight or flight (and flight doesn't work), I have no choice but to fight:

*[Image: Image]*

I'll skip the fight here: you have to fight your fights yourself ... (Besides, I lost!)

*[Image: Image]*

She whispers iwillguideyoutothegreathall in my ear? Doesn't read like something I expected. More like a password ... but for whom?

````
berserker@midgard:~$ cd .. && ls
berserker  bjorn  valkyrie  wanderer
````
A new User...

#### T5Q1:  What sound does the berserker make?

Answer: hahaha

#### T5Q2:  Can you convince him not to fight? (Yay/Nay)

Answer: Nay

#### T5Q3:  Who appeared after the fight? 

Answer: valkyrie

## Task 6: The Valkyrie

With ````su valkyrie```` and the password iwillguideyoutothegreathall I change to the new user.

There is a script in valkyrie's home-dir that I (again) cannot execute.
````
valkyrie@midgard:~$ ll
total 24
drwxr-xr-x 2 valkyrie valkyrie 4096 Nov 24 19:29 ./
drwxr-xr-x 6 root     root     4096 Nov 24 19:29 ../
-rw-r--r-- 1 valkyrie valkyrie  220 Apr  4  2018 .bash_logout
-rw-r--r-- 1 valkyrie valkyrie 3771 Apr  4  2018 .bashrc
-r-x------ 1 root     root     1382 Nov 24 19:29 gullintanni*
-rw-r--r-- 1 valkyrie valkyrie  807 Apr  4  2018 .profile
valkyrie@midgard:/home$ sudo -l
[sudo] password for valkyrie: 
Matching Defaults entries for valkyrie on midgard:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User valkyrie may run the following commands on midgard:
    (root : root) /home/valkyrie/gullintanni
```` 
Before I run the script, I would like to answer question 1. 

Who is Gullintanni another name for?

A quick Google search will give you the desired result:

*[Image: Image]*

Okay, let's see what the script does:
````
valkyrie@midgard:~$ sudo ./gullintanni
On your ride to Valhalla the colors suddenly become more colorful again...
Whats happening here..?
It looks like you didn't die on the battlefield after all.
Unfortunately, the Valkyrie noticed that too!

She moans softly:
I'm only allowed to bring fallen warriors to Valhalla!
But I don't have time to take you back to Midgard.
If I leave you here, you will be forever trapped between worlds.
Your only chance is to sneak past Heimdallr and head back to midgard via the Bifrost.
He's guarding the Bifrost very carefully, but today he'll be distracted.
A big feast is being celebrated and as far as I know him, he'll leave his post to get new mead,
everytime his drinking horn is empty. While he's not watching, you can search for a part of his key.
The key to Himinbjörg consists of four rune stones. Put them together in the correct order and enter Asgard.
````

#### T6Q1:   Who is Gullintanni another name for?

Answer: Heimdallr

#### T6Q2:  How many rune stones is the key made of?

Answer: 4

## Task 7: The Guardian

Suddenly I get a broadcast message from root:

*[Image: Image]*

Cheers! Looks like someone has something to drink.

````cd .. && ll```` show that there is another new user and a new file in / home.

heimdallr has been added and HeimdallrsDrinkingHorn is in / home.

````
valkyrie@midgard:/home$ cat HeimdallrsDrinkingHorn 
full
````
The Valkyrie said earlier:

[...] as far as I know him, he'll leave his post to get new mead,
everytime his drinking horn is empty. While he's not watching, you can search for a part of his key. [...]

Now came a broadcast: "This horn must have a hole..." 

Yes I know that. My Club-Mate bottles always have a hole :)

````
valkyrie@midgard:/home$ cat HeimdallrsDrinkingHorn 
empty
````

Ah, so now I can look for the four parts of the key. 

Part 1 is in /home/valkyrie. Suddenly a haystack has arisen there, in which a small box is hidden:

*[Image: Image]*

At first glance it looks like base64: but it isn't.

I entered it at [Cyberchef](http://icyberchef.com/) and lo and behold:

From Base62, From Hex -> youshallnot

So I'm curious what I shall not do...

I found part 2 in /etc/ behind a .loose_board/ in a .sachet/:

*[Image: Image]*

Cyberchef also reveals the solution here:

From Decimal, From Hex -> passthebifrost

All right, so far I got "youshallnotpassthebifrost"...

I understand he doesn't want that. I am alive and accordingly I have no business in Valhalla ;)

I found part 3 in /var/backups/ in a .hollow_stone/.

*[Image: Image]*
Interesting that Heimdallr is wondering how he can get the box open, too.

You need a password to unzip the file:
````
valkyrie@midgard:~$ unzip locked-chest.zip 
Archive:  locked-chest.zip
[locked-chest.zip] root/runestone.txt password:
````
Okay, ZIP passwords are easy to crack as long as they are in a wordlist.

First copy the file to your own machine with scp, then read out the password hash with zip2john and then crack it with john:

*[Image: Image]*

I will unzip the archive back on the VM:

*[Image: Image]*

Looks a lot like morse code. Unfortunately, I don't know that: Cyberchef does :)

From Morse Code, From Hex -> aslongas

Okay, youshallnotpassthebifrostaslongas ... as long as what?

Part 4 is found in / under a .stack_of_blankets/ in a .bag/.

*[Image: Image]*

Uh, binary code ... I had it during my studies, but here too Cyberchef is significantly faster than I would be:

From Binary, From Hex -> iamthekeeper

Ah! youshallnotpassthebifrostaslongasiamthekeeper

Looks like a pretty long password to me :) 

While looking for the parts, I got various broadcasts. One is base64 encrypted and the other is kind of twisted. ROTated maybe? :)

#### T7Q1:    What is the first part hidden in?

Answer: .little_box/

#### T7Q2:  What is the second part hidden in?

Answer: .sachet/

#### T7Q3:   What is the third part hidden in?

Answer: locked-chest.zip

#### T7Q4:  What is the magic word to open the chest?

Answer: rainbow

#### T7Q5:   What is the fourth part hidden in?

Answer: .bag/

## Task 8: Valhalla

I entered ````su heimdallr```` and the long password. Works!

There is a note in home-dir:

*[Image: Image]*

Just checked ````sudo -l```` and lo and behold, heimdallr can execute /bin/enter_valhalla as root!

There is only one command in the file, but that is the jackpot: ````chmod 666 /etc/passwd````

World-writeable :) So I executed it and entered a new root user:

*[Image: Image]*

````
# cat /root/valhalla.txt
THM{xxx_xxxxxxxx_xx_xxxxxxxx} // Hey, I can't reveal anything here :)
````

#### T8Q1: What's the content of /root/valhalla.txt? 

Answer: THM{xxx_xxxxxxxx_xx_xxxxxxxx}

I hope with this walkthrough it was no longer a problem to cope with this room.

Thanks for reading and happy pwning!

Contact -> [Twitter](https://twitter.com/_the_someone)
