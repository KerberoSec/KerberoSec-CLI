# Milk's Best Friend
## About

### General Information

__Challenge Description__: There's nothing I love more than oreos, lions, and winning.

__Challege Category__: FORENSICS

__Challenge Difficulty__: Medium

__Skills__: None

__Tools__: strings, binwalk

Download the file [here.](https://mega.nz/file/DC5F2KgR#P8UotyST_6n2iW5BS1yYnum8KnU0-2Amw2nq3UoMq0Y)

## Solution

We have got an image of an oreo biscuit. If try to strings it doesn't show anything worth noticing. Now I ran binwalk command to see if there is some hidden data inside it. And voyla we found this.

![Image1](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Milk's%20Best%20Friend/1.png)

I extracted the image with ```binwalk -e oreo.jpg``` and it extracted another picture ```b.jpg```. Now when I ran strings command on this jpg, it gave me this.

![Image2](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Milk's%20Best%20Friend/2.png)

__Flag__: flag{eat_more_oreos}
