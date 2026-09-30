## HV19.24 ham radio

Elves built for santa a special radio to help him coordinating today's presents delivery.

### Resources

HV19-ham radio.zip

### Hints

As little present and in order not to screw up your whole christmas, you have 3 whole days to solve this puzzle.

Happy christmas!

### Solution

For the final challenge, we get a [nexmon](https://github.com/seemoo-lab/nexmon)-patched Broadcom firmware. Using Ghidra, I was able to load the firmware (arm cortex, 32 byte, little endian) and get some reasonable output. The first thing which caught my attention was a base64-encoded string, which translates to `Roses are red, Violets are blue, DrSchottky loves hooking ioctls, why shouldn't you?`. Looking at the xrefs, we can see that this string is used in the function located at `0x058dd8`. This function seems to be particularly interesting. Although the binary is stripped and many calls to functions are undefined, I was able to find out a couple of things.

If the correct ioctl hooks are called, this function triggers several things. One of them, is probably printing the base64 encoded message we found before (`0xcafe` hook). Another one, would perform some xor-based decryption. This could be our way to get the flag. By taking a closer look, we can see that the encrypted flag (23 bytes starting from `0x58e94`) with the bytes stored at (`0x58e8c`). I tried to perform this decryption using a simple python script, but it did not work. 

After staring at the disassembly for some more time, I discovered that our potential key (`0x58ec`) could be overwritten with some data coming from `0x800000` (first 23 bytes, see call at `0x58e66`). However, this address is not defined in our binary. A google search reveals, that this section is usually reserved for the ROM section of the firmware. After browsing around the seemoo-lab GitHub Repos, I was able to download `rom.bin` from https://github.com/seemoo-lab/bcm_misc/blob/master/bcm43430a1/rom.bin. I adapted my script to use the first 23 bytes of the rom file as decryption key, and finally got a flag:

```python
#!/usr/bin/python3

key = []
xored_flag = []

with open('./rom.bin', 'rb') as keyfile:
    key = keyfile.read(23)

with open('./brcmfmac43430-sdio.bin', 'rb') as ramfile:
    ramfile.seek(0x58e94)
    xored_flag = ramfile.read(23)

flag = ""
for (k, e) in zip(key, xored_flag):
    flag += chr(k ^ e)

print(flag)
```

**Flag:** HV19{Y0uw3n7FullM4Cm4n}
