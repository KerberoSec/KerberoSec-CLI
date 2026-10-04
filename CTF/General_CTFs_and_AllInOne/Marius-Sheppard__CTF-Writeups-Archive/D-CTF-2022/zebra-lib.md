# Initial Problem Statement

```
All these years of technological developments and I still haven’t seen a color photo of a zebra. Change my mind.
Flag format: CTF{sha256}
```

We can check the challenge with netcat:  
nc 34.159.78.10 32720  
And there it asks for some proof of work.
```
Incoming work proof!!!
eJwrzy_Kji8oys9Ps83IyLC0SLSwsMzIqDIwMilPTTFIM7G0zLCoSk01MklPBABUUg6n
Insert work proof:
```

If we slap that weird looking string into CyberChef it auto suggests we do 2 operations on it:

**Original**:  
eJwrzy_Kji8oys9Ps83IyLC0SLSwsMzIqDIwMilPTTFIM7G0zLCoSk01MklPBABUUg6n  
**From Base64:**  
x.+Ï/Ê./(ÊÏO³ÍÈÈ°´H´°°ÌÈ¨202)OM1H3±´Ì°¨JM52IO..TR.§  
**Zlib Inflate**  
work_proof=hhh98a889hhz024wed0f499h8zee24ga

There it is, our work proof that we must submit every time the server asks for it and it being different every time.  
So for that I created a simple python script to automate the operations discussed above:

```py
from pwn import *
import zlib
import base64

Mote = remote('34.159.78.10', 32720)

while(1):
    Line = Mote.recvline() # "Incoming work proof!!!"
    if(Line.decode().find("work") == -1): #stop case
        print(Line)
        print(Mote.recvline())
        break;
    else:
        print(Line)

    Proof = Mote.recvline().decode() # Original string
    print(Mote.recvline()) # "Insert work proof:"
  
    while(len(Proof) % 4 != 0):
        Proof += "=" # Avoid padding errors

    Proof = base64.urlsafe_b64decode(Proof) # First Operation
    Proof = zlib.decompress(Proof) # Second Operation
    print(Proof)

    Mote.sendline(Proof)

Mote.close()
```

After many many proofs of work we get the flag!!
```
b'Well done!\r\n'
b'CTF{a7550246d72f8c7946a9248b3b9eee93461ac30f53ac8ca9749c9590b4ed1a2b}\r\n'
```