# mhz_cxf: c1f

That [CTF](https://www.vulnhub.com/entry/mhz_cxf-c1f,471/) took my eye, because I didn't have a lot of time and the description suggested that it would have to be finished very quickly :)

## Techniques used
````
- nmap
- dirb
- ssh
- scp
- binwalk
- steghide
- su
````

*[Image: Image]*

### Description from Vulnhub:

A piece of cake machine

You will learn a little about enumeration/local enumeration , steganography.

This machine tested on Virtualbox , so i'm not sure about it with Vmware

If you need any help you can find me on twitter @mhz_cyber , and i will be happy to read your write-ups guy send it on twitter too

cya with another machine #mhz_cyber
This works better with VirtualBox rather than VMware 

## nmap

The first step in every CTF: Find out which IP the machine has and see if ports are open:

````
nmap -sn 192.168.178.0/24

[...]
Nmap scan report for mhz-c1f.fritz.box (192.168.178.65)
Host is up (0.0037s latency).
MAC Address: 08:00:27:46:A2:BE (Oracle VirtualBox virtual NIC)
[...]

nmap -A -v 192.168.178.65

[...]
PORT      STATE    SERVICE      VERSION
22/tcp    open     ssh          OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
80/tcp    open     http         Apache httpd 2.4.29 ((Ubuntu))
135/tcp   filtered msrpc
139/tcp   filtered netbios-ssn
445/tcp   filtered microsoft-ds
1110/tcp  filtered nfsd-status
2869/tcp  filtered icslap
19780/tcp filtered unknown
[...]
````

A popular combination for "small" CTFs -> web server and SSH.

Normally, you can then look for the login credentials for SSH somewhere on the web server.

Let's see if this works on the same principle:

## Webserver

The landing page is the standard page after an Apache installation. The source was not changed either.

There is no /.robots.txt: time to see if there is something else!

## dirb

If you have to go fast and the wordlist is not too big, dirb is the tool of choice:

````
dirb http://192.168.178.65 /usr/share/wordlists/dirb/common.txt -X .txt,.html,.php

-----------------
DIRB v2.22    
By The Dark Raver
-----------------

START_TIME: Wed Sep 23 09:14:15 2020
URL_BASE: http://192.168.178.65/
WORDLIST_FILES: /usr/share/wordlists/dirb/common.txt
EXTENSIONS_LIST: (.txt,.html,.php) | (.txt)(.html)(.php) [NUM = 3]

-----------------

GENERATED WORDS: 4612                                                          

---- Scanning URL: http://192.168.178.65/ ----
+ http://192.168.178.65/index.html (CODE:200|SIZE:10918)                                                         
+ http://192.168.178.65/notes.txt (CODE:200|SIZE:86)                                                             
                                                                                                                 
-----------------
END_TIME: Wed Sep 23 09:14:49 2020
DOWNLOADED: 13836 - FOUND: 2
````

Well, not much, but looks promising!

`http://192.168.178.65/notes.txt`

*[Image: Image]*

`http://192.168.178.65/remb.txt`

*[Image: Image]*

Wonderful, it looks like login credentials :)

The page `http://192.168.178.65/remb2.txt` does not exist. Maybe the file is in the home directory ...

## SSH

Bingo! 

*[Image: Image]*

There is a user.txt in the directory -> `cat user.txt` 

````
HEEEEEY , you did it
that's amazing , good job man

so just keep it up and get the root bcz i hate low privileges ;)

#mhz_cyber
````

Thanks, but doesn't help me much. Maybe `mhz_cyber` is a new username. I made a note for that and saved it for later.

Looking around a bit and found four pictures in the directory `/home/mhz_c1f/Paintings/`.

*[Image: Image]*

## scp 

Since there is no binwalk installed on the system and I do not have root rights to install it, I copied the files to my computer.

*[Image: Image]*

## binwalk

In order to see if something is hidden in one of the files (keyword steganography), I ran binwalk on them:

*[Image: Image]*

The files look normal at first, but I'm not sure I haven't missed something.

## steghide

One way to extract hidden files from images is `steghide`.

*[Image: Image]*

It works! There is the `remb2.txt` that was mentioned earlier.

*[Image: Image]*

Yes, instead of writing that you wanted to delete the file, the better alternative would have been to just do it ;)

But I'm not going to complain because it would have made things really harder.

That looks like new login creds to me. Unfortunately, they don't work for SSH.

## su

Then there is still the possibility to try out whether I can identify with it as a superuser:

*[Image: Image]*

Great, that works! I looked directly at what kind of commands I can execute with root rights: `ALL` - wonderful.

With sudo su I made myself root and could then read out the corresponding flag:

*[Image: Image]*

That was, in fact, as described "a piece of cake". But it wasn't any less fun!

Thanks for reading and happy pwning!

Contact -> [Twitter](https://twitter.com/_the_someone)
