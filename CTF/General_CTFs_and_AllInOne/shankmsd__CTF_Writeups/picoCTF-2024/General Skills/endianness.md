## Challenge 🧩

Know of little and big endian?

Author: NANA AMA ATOMBO-SACKEY</br>
Points: 200

Hints:

1. You might want to check the ASCII table to first find the hexadecimal representation of characters before finding the endianness.
2. Read more about how endianness [here](https://levelup.gitconnected.com/little-endian-and-big-endian-74ab6441b2a7)

## Solution 🕵️‍♂️

```bash
┌──(user㉿shell)-[~]
└─$ nc titan.picoctf.net XXXXX
Welcome to the Endian CTF!
You need to find both the little endian and big endian representations of a word.
If you get both correct, you will receive the flag.
Word: xnpnw
Enter the Little Endian representation: 776E706E78
Correct Little Endian representation!
Enter the Big Endian representation: 786E706E77
Correct Big Endian representation!
Congratulations! You found both endian representations correctly!
Your Flag is: picoCTF{3ndi4n_sw4p_su33ess_xxxxxxxx}
```

## Flag 🚩

`picoCTF{3ndi4n_sw4p_su33ess_xxxxxxxx}`
