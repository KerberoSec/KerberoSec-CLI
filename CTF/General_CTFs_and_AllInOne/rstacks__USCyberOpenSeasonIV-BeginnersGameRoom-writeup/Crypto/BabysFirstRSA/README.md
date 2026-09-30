# Baby's First RSA

## Description

I learned just learned about RSA and I am pretty sure that I implemented it right. It should be impossible to get my flag.

## Attachments

[out.txt](https://github.com/rstacks/USCyberOpenSeasonIV-BeginnersGameRoom-writeup/blob/master/Crypto/BabysFirstRSA/attachments/out.txt)

[main.py](https://github.com/rstacks/USCyberOpenSeasonIV-BeginnersGameRoom-writeup/blob/master/Crypto/BabysFirstRSA/attachments/main.py)

## Solution

- We are provided with the file <code>out.txt</code>, which contains the flag encrypted with [RSA](https://en.wikipedia.org/wiki/RSA_(cryptosystem)). This file also
provides the values of <code>n</code> and <code>e</code>. These values are small enough to decrypt the flag with no
additional information.
- I used [dcode.fr](https://www.dcode.fr/rsa-cipher) to get the flag. After entering the
given information from <code>out.txt</code>, the flag was revealed.

## Flag

SIVBGR{D0nt_F0rg37_T0_P4D!!!}
