# 07601
## About

### General Information

__Challenge Description__: I think I lost my flag in there. Hopefully, it won't get attacked...

__Challege Category__: FORENSICS

__Challenge Difficulty__: Medium

__Skills__: None

__Tools__: strings, binwalk

Download the file [here.](https://mega.nz/file/CXYXBQAK#6eLJSXvAfGnemqWpNbLQtOHBvtkCzA7-zycVjhHPYQQ)

## Solution

This challenge was pretty easy, but it took me a few extra minutes than usual. Anyhow, let's start with opening the file:

![Image1](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/07601/file.png)

Huh! Strange, I guessed here to fix the png header to view the file... But that was a fail to me, than I used the strings to view the file and that gave me pretty interesting strings like these:

![Image2](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/07601/image2.png)

So I thought there must be some hidden files inside it, I used the ```binwalk -e <image>``` to extract all the files and then it gave me a folder in which these were the files:

![Image3](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/07601/3.png)

Now I tried to view the _I Warned You.jpeg_ image also, but that also dint show anything, when I tried to fix its jpeg header, it was still not letting me view the image. At last I tried to use the strings command and grepped out the flag: ```strings <image> | grep -i ctf``` which gave me this:

![Image4](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/07601/4.png)

__Flag__: ABCTF{Du$t1nS_D0jo}

