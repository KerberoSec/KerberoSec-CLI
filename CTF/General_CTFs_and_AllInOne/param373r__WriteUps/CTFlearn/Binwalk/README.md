# Binwalk
## About

### General Information

__Challenge__: Here is a file with another file hidden inside it. Can you extract it?

__Challege Category__: FORENSICS

__Challenge Difficulty__: Easy

__Skills__: None

Download the image [here.](https://mega.nz/file/qbpUTYiK#-deNdQJxsQS8bTSMxeUOtpEclCI-zpK7tbJiKV0tXYY)

## Solution

If you don't have binwalk installed, you can install it with this command: ```sudo apt install binwalk```. It's great tool to work with, though it's really big to downlaod, so just wait, until it finishes installing. OR You can try using ```foremost```. Amazing and more efficient than binwalk, also really small to download and install and it comes handy as a pentester's tool to find the data inside a file. Anyways that's not what we are gonna do here but you can find more about it in the [reference](#References) section below.  
When you type in your terminal: ```binwalk PurpleThing.jpeg``` it shows something strange png data hidden inside it. 

![Image1](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Binwalk/1.png)

So let's extract it with ```binwalk -e PurpleThing.jpeg```, after the process the data has been extracted, let's view it...

![Image2](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Binwalk/2.png)

It's a png image that gave us the flag.

__Flag__: ABCTF{b1nw4lk_is_us3ful}

## References

Binwalk: [Manpages](http://manpages.org/binwalk)  
Foremost: [Linux Man Pags](https://linux.die.net/man/1/foremost)
