# InfoSec Prep: OSCP
## About
__Series__: InfoSec Prep  
__Difficulty__: Easy  
__VM Page__: https://www.vulnhub.com/entry/infosec-prep-oscp,508/  
__Download__: https://drive.google.com/file/d/1q6Y86DZ-IU2wApmsW8Puo2xFll_9ISNL/view?usp=sharing  

## Solution

### Enumeration

Starting with the basic nmap scan ```nmap -A <IP>```

![Image1](https://github.com/iParamjotSingh/WriteUps/blob/master/VulnHub/InfoSec%20Prep/OSCP/1.png)

You can see we have found 2 ports open i.e. 80(http) and 22(ssh). If you read, index page of the site carefully, it will give you info regarding the only user on this machine i.e. ```oscp```. Also, when I viewed the ```/robots.txt``` file it showed me a hidden directory, named ```secret.txt```.

![Image2](https://github.com/iParamjotSingh/WriteUps/blob/master/VulnHub/InfoSec%20Prep/OSCP/2.png)

### Deciphering
Seems like it is a long string of base64. When I decoded it... It gave me a private rsa key.

![Image3](https://github.com/iParamjotSingh/WriteUps/blob/master/VulnHub/InfoSec%20Prep/OSCP/3.png)

### Logging In
I stored the rsa key in ```id_rsa``` file... and connected to the host with ```ssh oscp@<IP> -i id_rsa```. This gave me shell access to the machine.

![Image4](https://github.com/iParamjotSingh/WriteUps/blob/master/VulnHub/InfoSec%20Prep/OSCP/4.png)

### Privilege Escalation
Now I don't know about you, but I found 2 ways to privilege escalate the machine, and there are more for sure... How? You can view an instance by running ```id``` on the machine, and I am pretty sure most of the groups displayed other than usual can allow you to privilege escalate.

- __Exploiting the simple SUID__
  With a simple run of ```find / -perm /6000 2>/dev/null``` you will be given a binary /usr/bin/bash. A quick search of ```bash``` on this [site](https://gtfobins.github.io/), it told me that I can priv esc to root if SUID bit is set on the file by using the ```-p``` flag.
  
  ![Image5](https://github.com/iParamjotSingh/WriteUps/blob/master/VulnHub/InfoSec%20Prep/OSCP/5.png)
  
- __Editing the ```ip``` file__: First change the name of original ip file and create a new ip file with this command written in it: ```echo '#!/bin/bash' > /home/oscp/mysuid; chmod u+s /home/oscp/mysuid; ``` and save it as ```ip``` file. We did this because in start of the VM we see some text appear which gave us the ip of the machine. So I simply changed the contents of the executable which execute as the root when the VM starts... Now all we gotta do is restart the VM... and the next we login via ssh... We will see the an executable called ```mysuid``` there with super-user permissions... Just execute it, and you'll be given root...

![Image6](https://github.com/iParamjotSingh/WriteUps/blob/master/VulnHub/InfoSec%20Prep/OSCP/6.png)

__Now if you find any other ways to privilege escalate this VM, just mail me [here](mailto:theprojax@protonmail.com). I would love to add your writeups here.

## Aftermath
This VM is part of a contest, if you find this before the contest is over, then I recommend you not to share it. My only intention here is to create writeups that help others to learn some new stuff, and grow there knowledge... If you want me to solve any other VM that you're unable to solve mail it's vulnhub link to me, and I will be happy to upload a writeup to it.
