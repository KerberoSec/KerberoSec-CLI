# basic-mod2

Similar to [basic-mod1](../basic-mod1/readme.md), we have a ciphertext and a decryption scheme.
I wrote a python script to decrypt again.

```py
import string

cipher = "104 372 110 436 262 173 354 393 351 297 241 86 262 359 256 441 124 154 165 165 219 288 42"

message = ""

mapping = " " + string.ascii_lowercase + string.digits + "_"

for el in cipher.split(" "):
    modinv = pow(int(el), -1, 41)
    message += mapping[modinv]

print(message)
# 1nv3r53ly_h4rd_dadaacaa
```
