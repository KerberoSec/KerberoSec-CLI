## HV19.H2 Hidden Two

Again a hidden flag.

### Solution

This hidden flag was released along with day 07. Consequently, I assumed that the hidden flag will be part of this day's challenge. One thing that quickly caught my attention was, that the filename of the video of day 07 was not a valid [UUID](https://de.wikipedia.org/wiki/Universally_Unique_Identifier). This was very suspicious, as all the other files so far followed this common pattern. Also, the filename (`3DULK2N7DcpXFg8qGo9Z9qEQqvaEDpUCBB1v`) looks like it could be an encoded flag. After quite some time of fiddling around with different encodings and classic ciphers, I discovered that this is just the base58-encoded version of the flag.

**Flag:** HV19{Dont_confuse_0_and_O}
