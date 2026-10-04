# The Simpsons
## About

### General Information

__Challenge Description__: Ya know, I was thinking... wouldn't the Simpsons use octal as a base system? They have 8 fingers... Oh, right! The problem! Ummm, something seems odd about this image...

__Challege Category__: CRYPTO

__Challenge Difficulty__: HARD

__Skills__: Observational

__Tools__: strings

Download the file [here.](https://mega.nz/#!yfp1nYrQ!LOz_eucuKkjAaDqVvz3GWgbfdKWn8BhussKZbx6bUMg)

## Solution

Now am not gonna lie... This was pretty easy challenge, and I solved it in just one go... Let's start with analyzing the image with ```strings```. It gave me pretty much everything I needed for this image.

![Image1](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/The%20Simpsons/1.png)

So, as hinted by the description of the challenge, the strings here are encoded in octal base system. I tried to decode the strings and found these...

![Image2](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/The%20Simpsons/2.png)
![Image3](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/The%20Simpsons/3.png)

The 2nd image here caught me with the sense that I ate maggie today... Uh nvm, the challenge here is talking about the _Maggie Simpsons_. So I wondered why so, but did a google search on ```cost of maggie simpsons```. The search result gave the answer ```$847.63```, which eventually gave me the initital value of key to be ```n```, (by simple maths chr(ord((847.63/8)) + 4)). Then on the next step we found in our first image i.e. key = key + key + chr(ord(key) -4), would give us the final key as ```nnj```.

Now we have the key and a cipher text, and as soon as I saw this I got an idea it might be the ```Vigenere Cipher```. I went to this [site](https://cryptii.com/) and selected the vigenere cipher to decode, input the key and cipher... which gave me the flag...

![Image4](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/The%20Simpsons/4.png)

__Flag__: CTFlearn{wearenumberone}
