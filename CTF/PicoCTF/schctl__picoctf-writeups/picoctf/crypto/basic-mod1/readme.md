# basic-mod1

A very simple decryption challenge, we get the encrypted message as well as the decryption scheme.
I wrote a python script to apply the decryption and got the flag.

```py
import string

cipher = "..."

message = ""

mapping = string.ascii_uppercase + string.digits + "_"

for el in cipher.split(" "):
    map_ = mapping[int(el) % 37]
    message += map_

print(message)
# R0UND_N_R0UND_ADD17EC2
```
