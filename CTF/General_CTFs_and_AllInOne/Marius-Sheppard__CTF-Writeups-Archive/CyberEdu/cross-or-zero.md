# Initial Problem Statement
```
Can you find the key and the flag? I bet. It is not an encryption. It is ZERO. 
```
# Initial Exploration
## We are given the following python script:
```py
import itertools
import base64

def string_xor(s, key):
    key = key * int((len(s) / len(key) + 1))
    return ''.join(chr(ord(x) ^ ord(y)) for (x,y) in zip(s, key)).encode()

flag = ""
key  = ""

print(base64.b64encode(string_xor(flag, key)))

# dHNkdktTAVUHAABUA1VWVgIHBAlSBAFTBAMFUwECAgcAAAFWAFUFCFMACFFUAwQAVgBSBwQJBVZTAFYGCQYHVQABB1IJTQ==
```
In the script we see that the original flag has been xor-ed with a key of the same length and then base64 encoding was used.

We also know part of the orignal flag: "DCTF{" therefore we can find the key...

# Finding our way to the flag

First 5 bytes (in hex) from the original flag are: 0x44,0x43,0x54,0x46,0x7b  
First 5 bytes from our xor-ed flag are:  0x74,0x73,0x64,0x76,0x4b (We got it by doing base64decode on the xor-ed string and converting that to hex)  
They key can be found by applying xor once again on those bytes;
```
key = 0x30, 0x30, 0x30, 0x30, 0x30
```
It is clear now that the key is repetitive and equal to 0x30.  
To that end I made this python script to decrypt and get the flag!
```py
import itertools
import base64

flag = "dHNkdktTAVUHAABUA1VWVgIHBAlSBAFTBAMFUwECAgcAAAFWAFUFCFMACFFUAwQAVgBSBwQJBVZTAFYGCQYHVQABB1IJTQ=="
trueflag = ""
key = 0x30

flag = base64.b64decode(flag).hex()

for i in range(0, len(flag), 2):
    x = int(flag[i:i+2],16)
    trueflag = trueflag + chr(x ^ int(key))

print(trueflag)  # DCTF{c1e700d3eff2749b41c435c1227001f0e58c08ad340f0b7495fc0f6967e017b9}
```
