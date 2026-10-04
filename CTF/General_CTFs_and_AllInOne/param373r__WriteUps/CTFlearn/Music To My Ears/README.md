# Music To My Ears
## About

### General Information

__Challenge Description__: This audio file is supposed to say the flag, but it's corrupted!

__Challege Category__: FORENSICS

__Challenge Difficulty__: HARD

__Skills__: Observational

__Tools__: vim, hexedit

Download the file [here.](https://mega.nz/#!jexRzTzD!Fd3tD8ZcLquXJrsycMFUzozC9MHqaG-srUBfGREtL-0)

## Solution

This is a pretty medium rated challenge all you gotta do is fix the header and the audio file will speak up the flag for you. So let's get started...

First of all, I did a quick google search for the file header and this [site](https://www.filesignatures.net/index.php?page=search&search=00000020667479704D3441&mode=SIG) comes up, which gives me the file signature of this corrupted file. I then did a quick ```hexedit hereisyourflag.m4a | head```, which tells me the current set header of the corrupted file is this...

![Image1](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Music%20To%20My%20Ears/1.png)

So I opened the file in vim editor and replaced the header with that file signature I found on the site, and it pretty looked like this after change...

![Image2](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Music%20To%20My%20Ears/2.png)

Now I know you might be saying that's no way to edit a compiled/binary/rendered file... Aside the fact that this is a quick fix for almost every challenge, it is a pretty good practice to get your hands dirty on the playground(tbh, this is what I think).

Atlast, change the first 3 bytes to ```00``` inorder to fill up the buffer space before the signature.

Now when you open the file, an automated voice will read you the flag i.e.

__Flag__: flag{1_c4n_f1x_it}
