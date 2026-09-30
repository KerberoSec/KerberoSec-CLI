# Heaven

Category: Forensics

> "I was in the seventh heaven painted red green and blue"
> Flag Format: SHELL{s0mething_here}

---

We got a jpeg image.

First interesting finding: the extension is `jpeg` but file type is `png`. I guessed somebody had changed the original file somehow. But neither `exiftool` nor `steghide` nor `binwalk` revealed something interesting.

I remembered that there is a pretty cool image forensic tool online: https://29a.ch/photo-forensics/ (I also recommend https://fotoforensics.com: but used the first one for this). It showed some error in the picture on the upper left.

So I zoomed in and found an interesting pixel row.

Regarding to the challenge description, this had somehow to be my flag. But how the hell am I able to extract a flag out of a bunch of RGB pixels? I did a lot of googling about png and RGB steganography but nothing was helpful. So I tried another approach and used a reverse image search. I hoped to find the original image to compare. It showed up that this is a stock photo used by a company called Symrise o their linkedin profile.

So i downloaded it and tried to find the difference with image magick. Unfortunately this also was not at all helpful.

In the end I got some decent hint from another player to use `stegsolve`. Never used that tool before, I found it here: https://github.com/zardus/ctf-tools/blob/master/stegsolve. I could open the image with `stegsolve` and it had an `extract`-option, so I gave it a try. An it looked exactly like this was what I needed. Having the challenge description in mind I chose `7` for red, green and blue and finally there it was:

