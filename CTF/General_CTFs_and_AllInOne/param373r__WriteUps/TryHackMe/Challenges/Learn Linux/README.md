# Learn Linux
A guided room designed to teach you the Linux basics! on [TryHackMe](https://tryhackme.com/)

__NOTE__: _This writeup is purely made for solving the shiba binary challenges... If you want solution/hints for other tasks in this room feel free to checkout the rest of the walkthrough_ [here](https://github.com/iParamjotSingh/WriteUps/tree/master/TryHackMe/Walkthroughs/Learn%20Linux).

## Tasks
### Shiba1
This challenge is easy, fairly you just need to create a file named noot.txt using touch command i.e. ```touch noot.txt``` and then running the binary in shiba1's directory will give you the password.

![Image1](https://github.com/iParamjotSingh/WriteUps/blob/master/TryHackMe/Challenges/Learn%20Linux/1.png)

### Shiba2
For this challenge it asked us to set an environment variable called test1234. We can simply do it by typing... ```export test1234=<anything you want>```, and then running the binary.

![Image2](https://github.com/iParamjotSingh/WriteUps/blob/master/TryHackMe/Challenges/Learn%20Linux/2.png)

### Shiba3
This challenge did all the stuff for us, and all we gotta find is, a binary located somewhere on this system named shiba4 with suid bit set to it. Simply run the find command with the given parameters: ```find / -name shiba4 -perm -4000 2>/dev/null```

![Image3](https://github.com/iParamjotSingh/WriteUps/blob/master/TryHackMe/Challenges/Learn%20Linux/3.png)

### Shiba4 
This final challenge seemed tricky to me, but not difficult at all... you see here we do not need to find any file with suid bit... Alright, no spoilers, let's work it out...  
What I did was to find a file with suid bit set because sudo -l didn't work in any of the binaries. After looking for a while, I couldn't find anything useful then I started to see if there is any file belonging to the user anywhere else on the system? I couldn't find anythin there either until I came to the user shiba2, where I found a log file named test1234

![Image4](https://github.com/iParamjotSingh/WriteUps/blob/master/TryHackMe/Challenges/Learn%20Linux/4.png)

Be sure to cat the file as the user shiba2 because only that user is allowed to cat the file, so when I cat the file as shiba2 it gave me password for the user nootnoot. I logged in as nootnoot, ran sudo -l and I get that I can run all as root

![Image5](https://github.com/iParamjotSingh/WriteUps/blob/master/TryHackMe/Challenges/Learn%20Linux/5.png)

So just simply ```sudo cat /root/root.txt```, and you will be given root.txt flag.

![Image6](https://github.com/iParamjotSingh/WriteUps/blob/master/TryHackMe/Challenges/Learn%20Linux/6.png)

Peace.
