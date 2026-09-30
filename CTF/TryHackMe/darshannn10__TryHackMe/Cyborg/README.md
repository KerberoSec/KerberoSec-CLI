# [Cyborg](https://tryhackme.com/room/cyborgt8)
---
> Darshan Patel

## Overview

| Tables | Description |
| ------ | ----------- |
| Challenge Name | Cyborg |
| Difficulty | Easy|
| Tags | security, pentest, bash, encryption |

---

## Index
- [Enumeration](#enumeration)
- [Sensitive Info](#finding-sensitive-information)
- [PrivEsc](#priviledge-escalation)

---

```bash
export IP=10.10.166.13
```

---

### Enumeration

Doing some basic nmap enumeration
```bash
$ nmap -sC -sV -v $IP -oN nmap/initial.nmap
```
![nmap_scan](https://user-images.githubusercontent.com/87711310/207834714-194c9045-367b-4bc4-b234-b340792bcd5e.png)

Ports:
```
22 ssh
80 http
```
The ports `22/ssh` and `80/http` are open. The nmap scan should answer the first three questions.

After looking at the http service I found apache2 index page.

![2](https://user-images.githubusercontent.com/87711310/207835003-51ad8751-fc9b-49dd-a054-ebe76e74c9cd.png)

I ran `gobuster` to bruteforce the hidden directories in the webpage.

```bash
$ gobuster dir -t 64 -u $IP -w ~/wordlists/website_dir/directory-list-2.3-medium.txt -x .txt,.php,.html,.jpg,.png -o gobuster/dir_med.txt
```

![3](https://user-images.githubusercontent.com/87711310/207835270-aec9aea8-8f6d-424d-acd0-b5affe0d92fb.png)

Going through the results, I decided to take a look at the `/admin` page first. I found this conversation after clicking on the `Admins` link in the top bar.

![4](https://user-images.githubusercontent.com/87711310/207835578-1a0e644f-9213-44d6-bcb2-179715279887.png)

From the conversation there is a keyword `“music_archive”` which I found was interesting. Then I downloaded a archive from the `“Archive”` dropdown.

![9](https://user-images.githubusercontent.com/87711310/207835587-6db4b90a-d6b2-4fe5-9236-a5d283f290ce.png)

Navigating to the `/etc/squid` directory I found two files.

![5](https://user-images.githubusercontent.com/87711310/207836208-e316ef32-aba4-4ddc-9225-f02d40320b91.png)

The passwd file has a encrypted password.

```
music_archive:$apr1$BpZ.Q.1m$F0qqPwHSOG50URuOVQTTn.
```
And the configuration file squid.conf had…

![6](https://user-images.githubusercontent.com/87711310/207836788-ec24f709-7f40-4d06-82fa-966854950b60.png)

After checking the hash using `hash-identifier` from the passwd file, I found that it encrypted using `MD5(APR)` encryption algorithm.

![7](https://user-images.githubusercontent.com/87711310/207836790-8bf4cc20-3f9d-4063-a4a2-4960ffd24b07.png)

I checked the code in the hash examples from the hashcat webpage and used it to crack the password.
```
hashcat -a 0 -m 1600 hash.txt path-to-rockyou.txt

#hash.txt contains the password hash
```
![8](https://user-images.githubusercontent.com/87711310/207837267-a1ffcf9d-653a-438f-83b1-774083da111c.png)

### Borg backup archive
I extracted the archive using `tar` and it inflated into `./home` directory.

![10](https://user-images.githubusercontent.com/87711310/207837269-e6df9b8f-aad2-4682-bbb5-cc10264bc99b.png)

I manually went through all the files that are inside the `./home` directory and the only piece of information I got is the documentation link from the `README` file.

![11](https://user-images.githubusercontent.com/87711310/207837270-bf010480-6eb3-4939-8c7c-bf7067013ba3.png)

I installed the borgbackup repository using apt.

```
sudo apt-get install borgbackup
```

Reading through the documentation, I first understood what `borgbackup` was.
![13](https://user-images.githubusercontent.com/87711310/207837840-e04543a4-d249-47e6-8d2e-7e64c9641390.png)

I found a way to extract the `music_archive` from the man pages.
![12](https://user-images.githubusercontent.com/87711310/207837834-b4531808-dbf8-4914-b2e5-5dfe93a37646.png)
![14](https://user-images.githubusercontent.com/87711310/207837828-ba103304-4023-4ad3-984c-cd327cbcce6c.png)

Enter the password which we cracked using hashcat.

### User flag
After the completion of the extraction we can see another dir inside the `/home` directory named `Alex`. There are two text files one of which gave away the password for the user Alex.
![15](https://user-images.githubusercontent.com/87711310/207838186-20c542c3-3c3e-4dde-bc0f-f749faaf9d81.png)
![16](https://user-images.githubusercontent.com/87711310/207838193-641e7f0e-31b8-4c29-b9e9-3e9fee44d602.png)

Ssh-ing into the machine we can get the user flag.
![17](https://user-images.githubusercontent.com/87711310/207838195-0054e14e-c79c-4bcf-9a02-85f0113fab03.png)

### Root flag
After doing some priviledge escation enumeration, I found a file which can be run as root.
![18](https://user-images.githubusercontent.com/87711310/207839010-779d5149-2383-475c-aa1e-434d5f114e39.png)

After taking a closer look, the file `/backup.sh` is owned by `alex` and can be run as `root`.
![19](https://user-images.githubusercontent.com/87711310/207839016-808e495c-9b23-499e-9bc2-bb31bbeb0e53.png)

After executing the file, I found that it backed up some files. I read the contents of the file and found this part interesting.
![20](https://user-images.githubusercontent.com/87711310/207839018-3b7cdddf-51a9-4ff8-b053-81f3385d7480.png)

It seems that we can add an optional argument -c wihle running the file. We can exploit this to get the root shell.
```
sudo ./backup.sh -c "/bin/bash"
```
![21](https://user-images.githubusercontent.com/87711310/207839486-2db3e113-71d8-4ed9-a5b1-34b3ba2d0982.png)

I got the root shell, but wait…the shell doesn’t return anything for any comands. So, I grabbed the bash reverse shell payload and ran it. Remember to open a netcat listener in your local machine.

![22](https://user-images.githubusercontent.com/87711310/207839495-6d45291f-428b-4d01-9cc6-a39c8081a283.png)

The root flag will be waiting for you in the `/root` directory.

![23](https://user-images.githubusercontent.com/87711310/207839499-f522d63b-b9b4-4f3c-b1d5-01d12a43cb8c.png)

Nice!! Box rooted.
That’s it folks. Happy hacking!!!
