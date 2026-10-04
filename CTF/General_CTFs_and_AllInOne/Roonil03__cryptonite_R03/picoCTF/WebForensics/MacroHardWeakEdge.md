#MacroHard WeakEdge

The file that I had to download was a PPT file. This was a little strange as this was the first time that I am dealing with a file that is in a domain that is closer to what we use
in our everyday life. 
There are no hints to go off of in this challenge. After repairing the file and trying to see what I can see, let's see.
Whelps, only the first slide is visible via repairing, which does not contain the slide, but it does have close to 58 slides and -
*[Image: Whelps]*

okay, this is an issue. This file seems to be slightly coorrupted, which seems to be the case with most of the challenges in this board. Therefore, let's see what can be done.

Opening the file with another app is not working, therefore time to google and see if the name of the challenge has some special meaning.

Hard Macro has some other meaning all together and it has nothing to do with the current state of the challenge. 

Whelps... time to scower the internet for some clues and see if it possible to do anything. After some initial reading, I learnt that PPTS are bloody .zip files... and therefore can
also be extracted.
Time to extract some files, I guess?

And for some reason, I am just unable to convert the file of the PPT to a ZIP file. Whether it be online or offline, I am just unable to extract the hidden files in the .pptm file
to continue on with this challenge. I'll research a bit more and see what I can do with it.

*[Image: Oh!]*
Whatever I did, it worked, cause I managed to extract all the files

After digging around a bit, I found a particular file that contained something in the file called Slidemasters.
After opening the programmer text editor of the hidden file, I found a weird string of text, which does not seem like rot 13, like the others. Time to use a widespread 
decoder to see what can be done.

ZmxhZzogcGljb0NURntEMWRfdV9rbjB3X3BwdHNfcl96MXA1fQ

On finding a decoder, it stated that it could be a base62 encoding, but on attempting to decode it, it seems to be failing in the ASCII values.

I found another decoder, and it turns out that it was decoded in base64...
*[Image: base64]*

Finally got the flag and completed the three challenges.

##Answer:
picoCTF{D1d_u_kn0w_ppts_r_z1p5}

##References:
https://www.pcmag.com/encyclopedia/term/hard-macro
https://www.cachesleuth.com/multidecoder/
https://www.dcode.fr/base62-encoding
https://www.ezyzip.com/convert-ppt-to-zip.html#

