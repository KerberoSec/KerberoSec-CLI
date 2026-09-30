# AE-no

## Description

The AES key can be public as long as the IV is secret right?

## Attachments

[out.txt](https://github.com/rstacks/USCyberOpenSeasonIV-BeginnersGameRoom-writeup/blob/master/Crypto/AE-no/attachments/out.txt)

[main.py](https://github.com/rstacks/USCyberOpenSeasonIV-BeginnersGameRoom-writeup/blob/master/Crypto/AE-no/attachments/main.py)

## Solution

- We are provided with the key and the encrypted flag, as well as the script that was used to create
the encrypted text. Breaking an [AES encryption](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) without the IV is difficult, but luckily, we are
provided with some of the plaintext in <code>main.py</code>. We know that the plaintext is "Here is the
flag for you: " followed by the flag. This enables us to carry out a **known-plaintext attack**.
- I wrote [my own script](https://github.com/rstacks/USCyberOpenSeasonIV-BeginnersGameRoom-writeup/blob/master/Crypto/AE-no/decrypt.py) to carry out this attack and find the flag. We can see from <code>main.py</code> that the block size of the ciphertext is 16, so I started by grabbing
the first block. I then used the ECB encryption mode to decrypt the first block
with the provided key, as this mode does not require an IV. With this information, we can compute
the value of the IV by performing a bitwise XOR over all of the decrypted first block and the known
plaintext ("Here is the flag for you: ").
- Once I had the IV, I was able to decrypt the rest of the ciphertext. The last step was to undo the padding that was applied
in <code>main.py</code>. By printing the decrypted text, we can see the flag.

## Flag

SIVBGR{IV_B33n_H3r3_B3f0r3}
