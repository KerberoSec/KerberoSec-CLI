# Snowboard
## About

### General Information

__Challenge Description__: Find the flag in the jpeg file. Good Luck!

__Challege Category__: FORENSICS

__Challenge Difficulty__: Easy

__Skills__: None

__Tools__: file

Download the file [here.](https://mega.nz/file/CXYXBQAK#6eLJSXvAfGnemqWpNbLQtOHBvtkCzA7-zycVjhHPYQQ)

## Solution

Now this one's a bit tricky... Like when I first view meta of the file, it gave me flag like this...

![Image1](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Snowboard/1.png)

but then it didn't come out to be correct... Then just out of curiosity I tried to view a file's content by using ```file Snowboard.jpg``` and it surprised me with this...

![Image2](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Snowboard/2.png)

It was an encoded base64 string... I decode it with the terminal which eventually lead me to this...

![Image3](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Snowboard/3.png)

__Flag__: CTFlearn{SkiBanff}
