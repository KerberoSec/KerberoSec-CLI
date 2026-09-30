# Sunset: 1
## About
__Series__: Sunset  
__Difficulty__: Easy/Intermediate  
__VM Page__: https://www.vulnhub.com/entry/sunset-1,339/  
__Download__: https://mega.nz/#!AGZU1C6J!y_Pc0BEJ2EsAFiBeUY91s4e9mgrlo8sN4aT3wKVen6s  

## Solution

### Enumeration

A simple nmap scan gave me these results:

![Image1](https://github.com/iParamjotSingh/WriteUps/blob/master/VulnHub/Sunset/1/1.png)

### Login with FTP
As we can we see this vm has 2 open ports, ftp and ssh respectively. Also, the result here shows that ftp has anonymous login enabled. I logged into ftp via credential anonymous:anonymous, and found it has one file named backup stored in its directory...

![Image2](https://github.com/iParamjotSingh/WriteUps/blob/master/VulnHub/Sunset/1/2.png)

After I downloaded the file, it gave me a list of user, with their passwords encrypted in sha512crypt (How did I identify that? The starting of sha512 hashes are with $6$). I extracted the password hashes into another file.

![Image3](https://github.com/iParamjotSingh/WriteUps/blob/master/VulnHub/Sunset/1/3.png)

### Cracking the hashes

With the help of hashcat, I bruteforced the passwords in the ```hashes``` file, which cracked 1 hash for me...

![Image4](https://github.com/iParamjotSingh/WriteUps/blob/master/VulnHub/Sunset/1/4.png)

### Logging with SSH

I then used the user,pass sunset:cheer14 and logged into the target vm using ssh.

![Image5](https://github.com/iParamjotSingh/WriteUps/blob/master/VulnHub/Sunset/1/5.png)

Here we got our user flag.

### Privilege Escalation
Tried running sudo -l which gave me the binary ```/usr/bin/ed``` that I can run as root without a passwd prompt.

![Image6](https://github.com/iParamjotSingh/WriteUps/blob/master/VulnHub/Sunset/1/6.png)

So I went to this [site](https://gtfobins.github.io/) and searched the binary named ed. I found that there is a simple way I can use this binary to gain root access.

![Image7](https://github.com/iParamjotSingh/WriteUps/blob/master/VulnHub/Sunset/1/7.png)

KABOOM!! The root flag is ours.
