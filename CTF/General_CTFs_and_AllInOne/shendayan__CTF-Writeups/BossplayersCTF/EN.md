# Bossplayers CTF

This writeup is about the CTF [bossplayersCTF: 1 from Vulnhub](https://www.vulnhub.com/entry/bossplayersctf-1,375/)

*[Image: Image]*

### Description from Vulnhub:

Aimed at Beginner Security Professionals who want to get their feet wet into doing some CTF's. 

It should take around 30 minutes to root.

You may have issues using VMware. 

That sounds sporty: 30 minutes to root ...

I'm curious how long it will take me.

## Techniques used:
````
- nmap
- base64
- dirbuster
- burpsuite
- netcat
````

## nmap

First I have to know where to find the machine, so I let nmap tell me:

````
nmap -sn 192.168.178.0/24
[...]
Nmap scan report for bossplayers.fritz.box (192.168.178.64)
Host is up (0.0033s latency).
MAC Address: 08:00:27:EB:5F:D5 (Oracle VirtualBox virtual NIC)
[...]
````

Now that I know the IP, the next logical step is to look for open ports.

Nmap does that for me too.

````
nmap -A -p- 192.168.178.64
[...]
PORT      STATE    SERVICE      VERSION
22/tcp    open     ssh          OpenSSH 7.9p1 Debian 10 (protocol 2.0)
80/tcp    open     http         Apache httpd 2.4.38 ((Debian))
[...]
````

## Webserver

For most CTFs where a port is a web server, exploring it is my next step.

This is also the case here:

*[Image: Image]*

The specified website brings me nothing apart from a 404 error.

But a comment is hidden in the source code in line 131:

*[Image: Image]*

`WkRJNWVXRXliSFZhTW14MVkwaEtkbG96U214ak0wMTFZMGRvZDBOblBUMEsK` looks a lot like base64 encryption to me.

*[Image: Image]*

Well, someone was thorough here :)

I'll take a look at the page:

*[Image: Image]*

It's important that the poor guy finally dared to say "Hi" to Haley ;-)

Ping Command has not been tested and Privilege Escalation has not been fixed, sounds good!

Since I currently have no further clues, I'll try something new:

## dirbuster

I haven't really gained any new knowledge through this, except for these two sides:

`/robots.txt` exists
`/logs.php` exists

First I take a look at the robots.txt:

`super secret password - bG9sIHRyeSBoYXJkZXIgYnJvCg==`

Wohoo, that seems to be going really fast!

*[Image: Image]*

Okay, it's not that easy after all. Should be fine with me!

The page `/logs.php` can only be viewed in the source code if you want to read it clearly.

*[Image: Image]*

Except for the fact that PHP7.3 is installed on the Apache server, that didn't really help me.

I have to overlook something at this point. Normally there are no publicly accessible logs lying around ...

I think I have to approach this completely different ...

## burpsuite

Back on the /workinginprogress.php I started burpsuite and took a look what I can achieve with injections.

Unfortunately, I had no idea what kind of command I was looking for, so I gave it a try.

ping, id, haley, etc ... Until I got to `cmd`. It actually worked.

Wonderful, this feeling when you guess the blue and suddenly really land a hit :)

So I entered the parameter in the burpsuite repeater:

*[Image: Image]*

And after clicking on "Send" I could see the response on the right side:

*[Image: Image]*

After trying around a bit with this type of command injection, I came up with the idea of establishing a connection with netcat to my computer:

*[Image: Image]*

First set up the listener in the terminal with `nc -lvp 6666` and then send the command for the connection with a shell to the web server.

## Wonach suche ich denn? suche ich denn? su ich denn? su i denn? su i d... 
## What am I looking for?

At this point it took me a long time to move on. The specified half an hour has been out of the question for a long time ...

Then at some point I looked for files that had the SUID bit set:

*[Image: Image]*

The fact is that `/usr/bin/find` should definitely not be set in normal cases!

So that means that I can run `find` with root privileges. Interesting.

Tried and tested a little and then I had it:

*[Image: Image]*

Cracking the hashes would have taken me too long, I could rather get the flag in a different way :)

*[Image: Image]*

*[Image: Image]*

It was actually easier now than I thought. Decode quickly:

*[Image: Image]*

That's it! 

It was really a fast CTF, but it was still fun! Especially at the points with command injection via php and the SUID thing I had a lot to think about!

Thanks for reading and happy pwning!

Contact -> [Twitter](https://twitter.com/_the_someone)
