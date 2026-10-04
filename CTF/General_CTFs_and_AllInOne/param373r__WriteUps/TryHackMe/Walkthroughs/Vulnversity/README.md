# Vulnversity
Learn about active recon, web app attacks and privilege escalation on [TryHackMe](https://tryhackme.com/).
## Enumeration
Let's start with gathering intel on the box.
### Nmap
An aggressive Nmap Scan reveals the following info to us:

![Image1](https://github.com/iParamjotSingh/WriteUps/blob/master/TryHackMe/Walkthroughs/Vulnversity/1.png)

Server is running on port 3333.
### Directory Busting
Using gobuster we found the following directory: 

![Image2](https://github.com/iParamjotSingh/WriteUps/blob/master/TryHackMe/Walkthroughs/Vulnversity/2.png)

## Bypassing extensions
So the one directory we found, I browsed to it and found that it is an upload form... Now the very first thing pops up in my mind is #PHPreverseShell... I tried to upload the php shell to it... But couldn't, seems like there is some sort of script running in background that is blocking some extensions. No Prob, we fire up burp to analyze these exentions

![Image3](https://github.com/iParamjotSingh/WriteUps/blob/master/TryHackMe/Walkthroughs/Vulnversity/3.png)

Once we get the POST request... Right Click > Send to Intruder. Firstly, select the attack type to sniper and clear all the positions and add the file extension position to payload 1. 

![Image4](https://github.com/iParamjotSingh/WriteUps/blob/master/TryHackMe/Walkthroughs/Vulnversity/4.png)

Add the following items to the payload, and start the attack.

![Image5](https://github.com/iParamjotSingh/WriteUps/blob/master/TryHackMe/Walkthroughs/Vulnversity/5.png)

(OPTIONAL) You can always use grep extract in the response to find the extension which is allowed to the server, then your output will be much simpler to gather. Nonetheless you will be able to identify the change in response size of the request made to the server.

![Image6](https://github.com/iParamjotSingh/WriteUps/blob/master/TryHackMe/Walkthroughs/Vulnversity/6.png)

Here we are sure that ```.phtml``` extension is allowed to upload... So we rename our ```php-reverse-shell.php``` to ```php-reverse-shell.phtml```. __NOTE__: You can find the php reverse shell from [pentestmonkey](http://pentestmonkey.net/tools/web-shells/php-reverse-shell)'s site, but make sure to make changes to your IP address and the port you will be listening on via netcat.

## Gaining Access and Privilege Escalation
Finally once you upload the shell script, start nc with ```nc -lnvp <port>``` and then navigate to the given directory in the task i.e. ```http://ip:3333/internal/uploads/php-reverse-shell.phtml```. When you do this you will notice a connection from the vulnversity server has been made to you.

![Image7](https://github.com/iParamjotSingh/WriteUps/blob/master/TryHackMe/Walkthroughs/Vulnversity/7.png)

Once you're into system shell locate to ```/home/bill```, there you will find user flag.

![Image8](https://github.com/iParamjotSingh/WriteUps/blob/master/TryHackMe/Walkthroughs/Vulnversity/8.png)

### Privelege Escalation
Once done found the user flag... We need to somehow get the /root/root.txt. For that I tried to find if any suid binaries we can use to exploit our way to the root.txt. I compared the suid binaries of the server with my machine that I found one strange binary that was not in my machine.

![Image9](https://github.com/iParamjotSingh/WriteUps/blob/master/TryHackMe/Walkthroughs/Vulnversity/9.png)

Now there's this amazing site named [GTFOBins](https://gtfobins.github.io/), which gives us amazing ways to privesc binaries with sudo rights or set suid/sgid bits and much more. I searched for the binary here... And tried the method given here, with some modifications made in order to read the root.txt flag.

![Image10](https://github.com/iParamjotSingh/WriteUps/blob/master/TryHackMe/Walkthroughs/Vulnversity/10.png)

Finally, just cat out the /tmp/flag file to get the root flag.

Peace.
