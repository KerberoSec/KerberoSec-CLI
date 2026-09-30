# interencdec

## Description

Can you get the real meaning from this file.
Download the file [here](https://artifacts.picoctf.net/c_titan/109/enc_flag).

## Solution

if we open the file, we get the following string:
```YidkM0JxZGtwQlRYdHFhR3g2YUhsZmF6TnFlVGwzWVROclgyMHdNakV5TnpVNGZRPT0nCg==```

this looks like a base64 string, so let's try and decode it. the result would be this:
```b'd3BqdkpBTXtqaGx6aHlfazNqeTl3YTNrX20wMjEyNzU4fQ=='```

However, the result still looks like a base64 encoded string. it seems like the data might have been encoded multiple times. so we decode it again. Note that I removed b'' from the string and decoded the rest:
```wpjvJAM{jhlzhy_k3jy9wa3k_m0212758}```

now this format looks like our flag, so we're close! let's try decoding it using caesar cipher. I used [this](https://www.dcode.fr/caesar-cipher) site which generates all the possible outputs.

flag: **picoCTF{caesar_d3cr9pt3d_f0212758}**
