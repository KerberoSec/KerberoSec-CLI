# Up For A Little Challenge
## About

### General Information

__Challenge Description__: You Know What To Do ...

__Challege Category__: FORENSICS

__Challenge Difficulty__: Medium

__Skills__: Observation

__Tools__: strings

Download the file [here.](https://mega.nz/#!LoABFK5K!0sEKbsU3sBUG8zWxpBfD1bQx_JY_MuYEWQvLrFIqWZ0)

## Solution

This ones a simple challenge, if you didn't rush for the flag... Going further and using ```strings``` command it gave us 4 important finding and that are...

![Image1](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Up%20For%20A%20Little%20Challenge/1.png)  
![Image2](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Up%20For%20A%20Little%20Challenge/2.png)  
![Image3](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Up%20For%20A%20Little%20Challenge/3.png)  
![Image4](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Up%20For%20A%20Little%20Challenge/4.png)  

let's first search the found link [here](https://mega.nz/file/z8hACJbb#vQB569ptyQjNEoxIwHrUhwWu5WCj1JWmU-OFjf90Prg).

We got a zip file lets extract it, and after extracting there were found to be two file that were...

![Image5](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Up%20For%20A%20Little%20Challenge/5.png)

I scratched my head with the found passwords to ```steghide extract``` the stuff from the image, then suddenly for a while my brain gets on to the other file we found i.e. ```.Processing.cerb4```. I run the ```file``` command on it, and it came out to be the zip file.

![Image6](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Up%20For%20A%20Little%20Challenge/6.png)

I changed the file extension from ```.cerb4``` to ```.zip``` and extracted it with unzip, while it asked the password I inserted the password we found in our image no. 3 and it gave us another image named the ```skycaper.jpg``` I opened the image and the flag was at the bottom right corner of the image.

![Image7](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Up%20For%20A%20Little%20Challenge/7.png)

__Flag__: flag{hack_complete}
