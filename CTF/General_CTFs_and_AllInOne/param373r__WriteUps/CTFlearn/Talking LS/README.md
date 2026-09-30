# Talking LS
## About

### General Information

__Challenge__: Just take the Ls. Check out this zip file and I be the flag will remain hidden.

__Challege Category__: FORENSICS

__Challenge Difficulty__: Easy

__Skills__: None

Download the file [here.](https://mega.nz/file/mCgBjZgB#_FtmAm8s_mpsHr7KWv8GYUzhbThNn0I8cHMBi4fJQp8)

## Solution

This Challenge is really easy, let's start by extracting the zip ```unzip <zip file>```

![Image1](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Talking%20LS/image1.png)

Ahh we can see the file while extracted revealed a hidden directory called ```.ThePassword``` Let's view the contents and cat all outputs

![Image2](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Talking%20LS/image2.png)

So now we have the password and I guess that password is for opening the PDF file. Let's open it.

![Image3](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Talking%20LS/flag.png)

__Flag__: ABCTF{T3Rm1n4l_is_C00l}
