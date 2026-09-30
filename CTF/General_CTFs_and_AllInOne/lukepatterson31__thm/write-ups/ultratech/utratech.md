# UtraTech

### 21/tcp FTP vsftpd 3.0.3

No anonymous login

### 22/tcp SSH OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)

ssh access with compromised credentials

### 8081/tcp HTTP Node.js Express framework

found /auth and /ping

/ping's `ip` argument can be used to execute commands on the server if surrounded with backticks

executing `ls` with /ping reveals a database containing usernames and password hashes which can be 
cracked and used for ssh access

one of the users is a member of the `docker` group which can be used to gain a root shell

`docker run -v /:/mnt --rm -it bash chroot /mnt sh`

### 31331/tcp HTTP Apache httpd 2.4.29 ((Ubuntu))

robots.txt shows sitemap utech_sitemap.txt
