## HV19.20 i want to play a game

Santa was spying you on Discord and saw that you want something weird and obscure to reverse?

your wish is my command.

### Resources

`HV19-game.zip`

### Solution

For this challenge, we get a PS4 game. To my own surpise, mighty IDA was able to load this file without any issues. The binary only contains a few functions. All the interesting stuff seems to happen inside the main function:

First, the function calculates the MD5 sum of the PS4 system software `/mnt/usb0/PS4UPDATE.PUP`. This has to be `f86d4f9d2c049547bd61f942151ffb55`. If this matches, the program performs two nested loops, which probably calculate the decrypted flag. The outter loop opens the PS4 system software, seeks to a certain position (starting from 0x1337) and reads a single byte. The inner loop, XORs some byte array (most likely the encrypted flag) from the data section (starting at 0x300) with the byte read from the `PS4UPDATE.PUB` file. When both loops are done, the resulting byte array (presumably our flag), is sent via the network.s

Based on this findings, we should be able to get the flag by finding the correct system software (based on the md5-hash) and reconstructing the decryption algorithm. A google search shows, that this particular system update is a common PS4 jailbreak ([MiraHEN](https://lania.co/ps4_505.html)). I downloaded the update file, and created the following python script to get the flag:

```python
#!/usr/bin/python

scrambled_flag =  map(chr,[0xCE, 0x55, 0x95, 0x4E, 0x38, 0xC5, 0x89, 0xA5, 0x1B, 0x6F, 0x5E, 0x25,
                0xD2, 0x1D, 0x2A, 0x2B, 0x5E, 0x7B, 0x39, 0x14, 0x8E, 0xD0, 0xF0, 0xF8,
                0xF8, 0xA5])

flag = scrambled_flag
file_offset = 0x1337

with open('./505Retail.PUP', 'rb') as f:
    while file_offset != 0x1714908:
        f.seek(file_offset)
        key = f.read(len(scrambled_flag))

        newflag = ""
        count = 0
        for char in flag:
            newflag += chr(ord(char) ^ ord(key[count]))
            count += 1

        flag = newflag
        file_offset += 0x1337

print(flag)
```

**Flag:** HV19{C0nsole_H0mebr3w_FTW}