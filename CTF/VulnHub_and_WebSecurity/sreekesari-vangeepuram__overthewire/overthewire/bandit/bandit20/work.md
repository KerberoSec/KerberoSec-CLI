This challenge is really challenging, right!
Well of course, atleast for me...
![Bandit20](https://github.com/sreekesari-vangeepuram/overthewire/blob/master/overthewire/bandit/bandit20/level20-%3Elevel21.png)

Let's start working by opening two terminal and piping to the remote-machine.

Terminal-1:
```
bandit20@bandit:~$ ls
suconnect
bandit20@bandit:~$ ls -al
total 32
drwxr-xr-x  2 root     root      4096 May  7 20:14 .
drwxr-xr-x 41 root     root      4096 May  7 20:14 ..
-rw-r--r--  1 root     root       220 May 15  2017 .bash_logout
-rw-r--r--  1 root     root      3526 May 15  2017 .bashrc
-rw-r--r--  1 root     root       675 May 15  2017 .profile
-rwsr-x---  1 bandit21 bandit20 12088 May  7 20:14 suconnect
bandit20@bandit:~$ ./suconnect 
Usage: ./suconnect <portnumber>
This program will connect to the given port on localhost using TCP. If it receives the correct password from the other side, the next password is transmitted back.
bandit20@bandit:~$ echo "GbKksEFF4yrVs6il55v6gwY5aVje5f0j" | nc -lvp 1111
listening on [any] 1111 ...
```

Let's open another terminal [Terminal-2]: 
```
bandit20@bandit:~$ ls
suconnect
bandit20@bandit:~$ ./suconnect 1111
Read: GbKksEFF4yrVs6il55v6gwY5aVje5f0j
Password matches, sending next password
bandit20@bandit:~$
```
OOohh! Something happened? Let's see what actually happened.
Back in our Terminal-1:
```
bandit20@bandit:~$ echo "GbKksEFF4yrVs6il55v6gwY5aVje5f0j" | nc -lvp 1111
listening on [any] 1111 ...
connect to [127.0.0.1] from localhost [127.0.0.1] 39688
gE269g2h3mw3pwgrj0Ha9Uoqen1c9DGr
bandit20@bandit:~$
```
WoW! We got the password for the user `bandit21`...

But what's the point in doing this?
Typing some command doesn't make us feel like we've learnt something, right?
Let's see what's happening underneath the hood!
Let's get back to the remote server and continue the same process, by investigating these processes.
Here, let's open 2 terminals just as before:

[Terminal-1]:
```
bandit20@bandit:~$ nc -lvp 1111
listening on [any] 1111 ...

```
So, here we are opening an end-point [a port] on the remote server with `netcat`.

How does it work?
Well, see this:
```
bandit20@bandit:~$ nc -h
[v1.10-41+b1]
connect to somewhere:	nc [-options] hostname port[s] [ports] ... 
listen for inbound:	nc -l -p port [-options] [hostname] [port]
options:
	-c shell commands	as `-e'; use /bin/sh to exec [dangerous!!]
	-e filename		program to exec after connect [dangerous!!]
	-b			allow broadcasts
	-g gateway		source-routing hop point[s], up to 8
	-G num			source-routing pointer: 4, 8, 12, ...
	-h			this cruft
	-i secs			delay interval for lines sent, ports scanned
        -k                      set keepalive option on socket
	-l			listen mode, for inbound connects
	-n			numeric-only IP addresses, no DNS
	-o file			hex dump of traffic
	-p port			local port number
	-r			randomize local and remote ports
	-q secs			quit after EOF on stdin and delay of secs
	-s addr			local source address
	-T tos			set Type Of Service
	-t			answer TELNET negotiation
	-u			UDP mode
	-v			verbose [use twice to be more verbose]
	-w secs			timeout for connects and final net reads
	-C			Send CRLF as line-ending
	-z			zero-I/O mode [used for scanning]
port numbers can be individual or ranges: lo-hi [inclusive];
hyphens in port names must be backslash escaped (e.g. 'ftp\-data').
``` 
So, option `<tag -l>` enables listening-mode at the specified port supplied using `<tag -p>`.
The option `<tag -v>` gives us the verbose-output!
Learn more about netcat!

Then, in [Terminal-2]:
```
bandit20@bandit:~$ ls
suconnect
bandit20@bandit:~$ ps aux
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
bandit20  5723  0.0  0.1  21148  4844 pts/11   Ss+  18:01   0:00 -bash
bandit20  7006  0.0  0.1  21156  5012 pts/55   Ss+  18:04   0:00 -bash
bandit20 16676  0.0  0.1  21212  5152 pts/79   Ss+  18:26   0:00 -bash
bandit20 16771  0.0  0.1  21148  4920 pts/1    Ss   18:26   0:00 -bash
bandit20 17203  0.0  0.1  21148  4832 pts/34   Ss   18:27   0:00 -bash
bandit20 17879  0.0  0.0   6300  1620 pts/34   S+   18:28   0:00 nc -lvp 1111
bandit20 17940  0.0  0.0  19188  2276 pts/1    R+   18:28   0:00 ps aux
```
So the netcat-process is running with process-id: 17879...

Let's get back again to our Terminal-2:
```
bandit20@bandit:~$ ./suconnect 1111

```
This process is on hold!
If we look at the user column of the process `./suconnect 1111`, it'll be the might `root`!
Since it has the setuid-bit.

Now let's see the defination of `network-daemon`:
```
Daemons are typically the processes that run continuously in the background in our host-machine,
and perform various types of functions which are helpful and required by other processes.
TCP/IP protocals provides daemons for implementing certain functions in our OS's...
```

So, we we go back to our [Terminal-1]:
```
bandit20@bandit:~$ nc -lvp 1111
listening on [any] 1111 ...
connect to [127.0.0.1] from localhost [127.0.0.1] 49186

```
We have a new line which is: `connect to [127.0.0.1] from localhost [127.0.0.1] 49186`.
Cool the process-id of `./suconnect 1111` is 49186!
There is a role of network-daemon here since the process `./suconnect 1111` is enabling the network-daemon with process-49186.

Let's give the password here[in Terminal-1]:
```
bandit20@bandit:~$ nc -lvp 1111
listening on [any] 1111 ...
connect to [127.0.0.1] from localhost [127.0.0.1] 49186
GbKksEFF4yrVs6il55v6gwY5aVje5f0j
```
Since I didn't press enter, the password is not yet submitted to the process.

Let's submit by pressing `<Enter>`:
```
bandit20@bandit:~$ nc -lvp 1111
listening on [any] 1111 ...
connect to [127.0.0.1] from localhost [127.0.0.1] 49186
GbKksEFF4yrVs6il55v6gwY5aVje5f0j
gE269g2h3mw3pwgrj0Ha9Uoqen1c9DGr
bandit20@bandit:~$
```
WoW! We got the password.

Let's see what happened in our [Terminal-2]:
```
bandit20@bandit:~$ ./suconnect 1111
Read: GbKksEFF4yrVs6il55v6gwY5aVje5f0j
Password matches, sending next password
bandit20@bandit:~$
```
It says the password matches!
Cool! So, the password submitted from the [Terminal-1] is verified by the `./suconnect 1111` in [Terminal-2] by comparing 
it with `/etc/bandit_pass/bandit21`.
Since the process consists of setuid-bit, privilage-escalation concepts plays the role now.

After the test, we finally get our response at [Terminal-1], which is the password!
Very cool, right!

Hope you've learnt something new from this [if you don't know this before/didn't strike to you during the start].

Now, let's use the password `gE269g2h3mw3pwgrj0Ha9Uoqen1c9DGr` to log into the remote-machine as `bandit21`.

**Warning: Please, first try Level 21 -> Level 22! Otherwise it's useless to simply cpy-pst the command[s]/password[s].
