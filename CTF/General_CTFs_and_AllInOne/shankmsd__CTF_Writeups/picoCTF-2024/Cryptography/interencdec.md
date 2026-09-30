## Challenge 🧩

Can you get the real meaning from this file.

Author: NGIRIMANA SCHADRACK</br>
Points: 50

Hint:
Engaging in various decoding processes is of utmost importance

## Solution 🕵️‍♂️

```shell
┌──(user㉿shell)-[~]
└─$ echo "YidkM0JxZGtwQlRYdHFhR3g2YUhsZmF6TnFlVGwzWVROclgyVmxaV1ZsWldWbGZRPT0n==" | base64 -d
    b'd3BqdkpBTXtqaGx6aHlfazNqeTl3YTNrX2VlZWVlZWVlfQ=='

┌──(user㉿shell)-[~]
└─$ echo "d3BqdkpBTXtqaGx6aHlfazNqeTl3YTNrX2VlZWVlZWVlfQ==" | base64 -d
    wpjvJAM{jhlzhy_k3jy9wa3k_eeeeeeee}
```

`wpjvJAM{jhlzhy_k3jy9wa3k_eeeeeeee}` appears to be Caesar cipher/ROT cipher, Shift A-Z by 7.

## Flag 🚩

picoCTF{caesar_d3cr9pt3d_xxxxxxxx}
