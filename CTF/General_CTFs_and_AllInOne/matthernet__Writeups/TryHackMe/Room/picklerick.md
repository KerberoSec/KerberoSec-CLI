# Pickle Rick

<img align="right" src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/picklerick/picklerick01.jpeg" width="150" height="150">

A Rick and Morty CTF. Help turn Rick back into a human!

LINK = [https://tryhackme.com/room/picklerick](https://tryhackme.com/room/picklerick)

### FYI
This writeup don't include any passwords/cracked hashes/flags

## Description

This Rick and Morty themed challenge requires you to exploit a webserver to find 3 ingredients that will help Rick make his potion to transform himself back into a human from a pickle.

## Steps

1: Join the room, start the virtual machine and the AttackBox (or connect via VPN)

### What is the first ingredient Rick needs?
1: Find open ports on the machine, the nmap output will show three open ports:
* ```# nmap <ip-virtual-machine>```
<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/picklerick/picklerick02.png" width="40%">
2: Scan the web server and search for files/directories
* ```# gobuster dir -u <http://ip-virtual-machine/> -w /usr/dirb/common.txt -q -n -e```
<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/picklerick/picklerick03.png" width="60%">
3: Access the login page and notice that a user and password is required
<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/picklerick/picklerick04.png" width="30%">
4: Review the page source code and you will find the username
<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/picklerick/picklerick05.png" width="30%">
5: Access the files obtained in the gobuster scan and you will find the password
<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/picklerick/picklerick06.png" width="30%">
6: List the directory with a ls command and find the file with the fist ingredient, access the file and you will find the ingredient
<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/picklerick/picklerick07.png" width="20%">
<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/picklerick/picklerick08.png" width="50%">

### Whats the second ingredient Rick needs?
1: In other file we can see a hint of where to find the other ingredients

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/picklerick/picklerick09.png" width="50%">

2: Looking arroung the /home directory we can find the file with the second ingredient

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/picklerick/picklerick10.png" width="30%">

3: Using less view the content of the file and you will find the ingredient

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/picklerick/picklerick11.png" width="30%">

### Whats the final ingredient Rick needs?
1: Looking arroung the /root directory we can find the file with the final ingredient

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/picklerick/picklerick12.png" width="30%">

2: Using less view the content of the file and you will find the ingredient

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/picklerick/picklerick13.png" width="30%">
