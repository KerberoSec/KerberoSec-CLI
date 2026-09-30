# Simple CTF WriteUp

## Reconnaissance
Using nmap, we get 3 ports:
- 21/TCP with ftp service, allowed to login as anonymous
- 80/TCP http service
- 2222/TCP with ssh service

Tried to use nikto to scan vuln in it;s service provider, but it comes but nothing.

enter the site with FTP and we'll find a text  file **ForMitch/txt**:
```txt
Dammit man... you'te the worst dev i've seen. You set the same pass for the system user, and the password is so weak... i cracked it in seconds. Gosh... what a mess!
```
It seems that mitch use same password for every account he has.

BruteForce directories using gobuster and we'll find a directory called **simple**

It's a Content Management Service called CMS Made Simple. So I try to find some exploit with this service.

```sh
searchsploit CMS Made Simple 2.2.8
```

Voila, we get an SQL Injection exploit for this service named **CVE-2019-9053**

## SQL Injection & Password BruteForce Attempt
we can mirror the exploit script and use it to brute force, finding the admin of the service for spesific IP and it's password
```sh
searchsploit -m php/webapps/46635.py
```
And run it againts out target IP service. I tried to change the python version in the script to python3, thought it would work in a right way, but nah, it didn't. Tell me if you cold run it:
```sh
#run it using your python version and delete the colored function
#in line 183

python3 46635.py -u [Target_IP]/simple
```

Because it didn't work for me, I tried it hardway using hydra, we already know that the user was mitch, so we just had to try all password possibilities. 
```sh
sudo hydra -l mitch [Target_IP]:2222 -P passlist
```

Fortunately we found the password usign this method :D. 

connect via ssh (port 2222) and we'll get our access as mitch. we'll get our first flag there

## Privilage Escalation
After we get the access through ssh. run ```sudo -l``` And we found out that we able to escalate our privilage using vim. Go to GTFObins, and search for vim, enter this command:
```sh
sudo vim -c ':!/bin/sh'
```
therefore we'll found last flag **root.txt**
