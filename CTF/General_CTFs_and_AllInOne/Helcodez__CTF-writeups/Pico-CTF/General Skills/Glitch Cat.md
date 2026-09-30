# Glitch Cat

**Points:** 100

**Description:**  Our flag printing service has started glitching!
$ nc saturn.picoctf.net 50363

## Solution 

### Step 1

First, run this command

``` bash
 nc saturn.picoctf.net 50363

```

Below you have the output

![Screenshot from 2023-07-09 13-40-12](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/8edfc72b-0e71-4c0e-b6b2-4d432e39b5d6)

 As you can see, these are hexadecimal characters. 
 To solve this challenge we have to create a simple Python script 

 ```python
hex = chr(0x61) + chr(0x34) + chr(0x33) + chr(0x39) + chr(0x32) + chr(0x64) + chr(0x32) + chr(0x65)
print("{picoCTF{gl17ch_m3_n07_}" + hex + "}")
```
