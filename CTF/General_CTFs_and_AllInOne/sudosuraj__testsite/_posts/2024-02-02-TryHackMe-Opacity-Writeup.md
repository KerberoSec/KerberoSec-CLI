---
layout: post
title:  TryHackMe | Opacity Writeup
author:  0xbug
date:  2024-01-31
categories:  [CTF]
tags:  [TryHackMe,writeup]
image:
  path: /assets/img/headers/opacity.png
  alt: Opacity
---  
# TryHackMe | Opacity Writeup
Hello friend!  
In this writeup we gonna explore another ctf from TryHackMe called Opacity.  
Machine Link: [https://tryhackme.com/room/opacity](https://tryhackme.com/room/opacity)  
Difficulty: Easy  
## Info-gathering and enumaration  
After basic Nmap scan, we got open ports  

```bash
22/tcp  open  ssh         OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
80/tcp  open  http        Apache httpd 2.4.41 ((Ubuntu))
139/tcp open  netbios-ssn Samba smbd 4.6.2
445/tcp open  netbios-ssn Samba smbd 4.6.2
```
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/a3551a43-79fa-4a38-9c41-10f058747744)  

Let's directory enumration it and we got access to functionality that was login protected.  

![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/40d5c38e-250c-45ec-a7c7-7a5695228db3)  

I tried several php revshell upload, but it was taking jpg to be successfully uploaded, so I just need to bypass it,
just rename php-revshell as follow and we can upload it.

![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/ced3517f-2a82-4a04-8137-76a7f5a0ac63)
  

##  Initial Shell Access
After uploading our reverse shell, we can start netcat listner on our local machine and we just need to visit the link.  
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/5ced89a4-35ca-4763-b4a5-67829baf9396)  

![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/3e4ca4aa-c0fd-4808-92ca-7272c86c4031)   
And boom!!!, we got sell access.  
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/3dec41a8-62a9-4e3c-91c1-0830c828eb4d)  
 
##  Privilege Escalation  
###  User Access
First we are now as www-data user with no permission but just can navigate into file systems.   
So while exploring the files, i got some interesting file in the `/opt` directory.  
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/9490820c-a6f6-40e4-b35c-d39a9ffbe46c)  
But unfortunetaly we have no permission to explore this, but I managed to copy this file to local machine.  
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/7fbc3bcb-1ce1-4c8d-b921-9094bbd27b13)  
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/eb21bf44-d60d-4f72-ab25-d694722d1763)  
  
And I found that this is Keepass Database file, Keepass KDBX is the file format used by KeePass, a free and open-source password manager. It's essentially a container that securely stores all sensitive information, like passwords, login credentials, and other confidential data, but access to this was password protected, so after some research I found that John the Ripper is capable to crack it's password.  
So lets crack it.  
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/9e2e6510-3e0d-48c8-a8e9-d4a2149db668)  
  
After John cracks the password, we can access the database using `keepassxc` command.  
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/d1329771-c42d-4a52-af33-a2e18e796bc0)  
 
In the database, we got login credentials for the user `sysadmin`.  
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/287c3896-2bb0-434a-bf65-fdad9dde4205)  

### Root Access
For the root access, we can try several methods, but in the home directory of the user, we have some hints, there is /script folder, which is owned by the **root** user.  
After exploring this folder, I found **script.php** which is being run by **root** user every minute. 
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/005830c5-c03b-4908-a3ac-b537243630e6)  
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/8e962869-c027-4464-a686-05857c8dba69)  

So we have no permition to edit ay of this folder's file, but here is a flow, this **root** user owned folder is inside the **sysadmin**'s home directory, so we can rename it, can create our new **scripts** folder and can run our malicious php script to as root user. So I just renamed old folder and created new one with old same name, and inside it, I created script.php with pentestmonkey revshell payload and start a netcat listner on my local machine, and after one minute, boom! we got root shell!  
![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/99a07235-fc4a-465b-8942-87dc01493ff4)  

![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/36b6694a-7234-413b-b7d9-106a07695a6d)

![image](https://github.com/sudosuraz/sudosuraz.github.io/assets/81553118/bfcb7a5b-b002-466b-910f-89b4870a60ae)  
That's all guys, I know there are more methods to root a machine, so share me if you have any different.  
Signing Out ~ 0xBug  
## Connect with me
- [LinedIn](https://linkedin.com/in/sudosuraj)
- [GitHub](https://github.com/sudosuraz)

## Contact Me
- sudosuraj@proton.me
- [Instagram](https://instagram.com/_0xbug)
- [X](https://x.com/sudosuraj)

