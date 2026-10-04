## Raymonds Recovery: 100 points: 133 solves

>Uh-oh! Someone corrupted all my important files and now I can’t open any of them. I really need one of them in particular, a png of something very important. Please help me recover it!
>
>Here, take this ext4 filesystem and see what you can find. If you can figure out which file it is and how to fix it, you’ll get something in return!

We open the file in Autopsy:

There seems to be nothing but corrupted JPEG files and pictures of hats. But then, we see the $CarvedFiles section:

We look through the files that Autopsy found, and we find a picture with the flag in it:

Flag: *uiuctf{everyb0dy_l0ves_raym0nd}*
