# Prime Time

## Attachments

[challenge.txt](https://github.com/rstacks/USCyberOpenSeasonIV-BeginnersGameRoom-writeup/blob/master/Crypto/PrimeTime/attachments/challenge.txt)

## Solution

- We are provided with the file <code>challenge.txt</code>. Similar to the [Baby's First RSA](https://github.com/rstacks/USCyberOpenSeasonIV-BeginnersGameRoom-writeup/blob/master/Crypto/BabysFirstRSA/README.md) challenge, this file
contains the flag encrypted with RSA and the values of <code>n</code> and <code>e</code>. Like with Baby's First RSA, these
values are small enough to decrypt the flag with no additional information.
- Using [dcode.fr](https://www.dcode.fr/rsa-cipher), I entered in the provided information and got the flag.

## Flag

SIVBGR{h1dd3n_f4c70r5}
