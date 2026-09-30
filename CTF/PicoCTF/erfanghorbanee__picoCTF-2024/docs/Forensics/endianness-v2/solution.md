# endianness-v2

## Description

Here's a file that was recovered from a 32-bits system that organized the bytes a weird way. We're not even sure what type of file it is.
Download it [here](https://artifacts.picoctf.net/c_titan/113/challengefile) and see what you can get out of it.

## Solution

Use xxd command to check the file. In the first line we can notice that it looks like a jpeg file. However, there is something off.

```
xxd challengefile
00000000: e0ff d8ff 464a 1000 0100 4649 0100 0001
```

The correct starting bytes for a JPEG file are ```FF D8 FF E0``` or ```FF D8 FF E1```, depending on the specific JPEG format (JFIF or Exif).

**But our file starts with ```E0FF D8FF``` !**

inspired by the name of the challenge(endianness-v2), I decided to write a program to swap the byte order of every four bytes in the JPEG file.

for example the first line will change as follows:

Before:
```e0ff d8ff 464a 1000 0100 4649 0100 0001```

After:
```ffe0 ffd8 4a46 0010 0001 4946 0001 0100```

flag: **picoCTF{cert!f1Ed_iNd!4n_s0rrY_3nDian_6d3ad08e}**
