## Funnel HackTheBox

#### `Info`

___

#### Recon
```bash
sudo nmap -A -sV --privileged -T4 <ip> -p- -O -sC -v | tee -a nmap.md
```
**`Result:`**
|PORT|STATE|SERVICE|VERSION|
|---|---|---|---|
|21/tcp|open|ftp|vsftpd 3.0.3|
|22/tcp|open|ssh|OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)|

The **FTP** server allows anonymous login. Now it's our job to get into it.

#### Getting in
First login to the FTP server as an anonymous user.
We have a directory called `mail_backup`.

The folder has 2 files one of them contains a default password. Since we have port 22 open which is running `ssh`. we can try it there. Other file contains some user names which we will also use.

we got into the matchine with proper username. but now HTB told us to find some hidden services running on the local machine. We can check that using the command `ss -tl`

we have `postgresql` up and running locally.
