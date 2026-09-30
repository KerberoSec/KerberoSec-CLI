# PikesPeak
## About

### General Information

__Challenge Description__: I think I lost my flag in there. Hopefully, it won't get attacked...

__Challege Category__: FORENSICS

__Challenge Difficulty__: Easy

__Skills__: Observation

__Tools__: strings

Download the file [here.](https://ctflearn.com/challenge/download/935)

## Solution

Use strings and grep the output with ```"ctf"``` with flag ```-i``` and you will get...

![Image1](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/PikesPeak/1.png)

Now, if you observe it carefully, only one flag is following the correct format of ```CTFlearn{...}```, and that is our flag for this challenge.

__Flag__: CTFlearn{Gandalf}
