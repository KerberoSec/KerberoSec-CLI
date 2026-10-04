# Baby Encryption Writeup
[Link to the CTF on HackTheBox](https://app.hackthebox.com/challenges/babyencryption)

## Information about the CTF
> You are after an organised crime group which is responsible for the illegal weapon market in your country. As a secret agent, you have infiltrated the group enough to be included in meetings with clients. During the last negotiation, you found one of the confidential messages for the customer. It contains crucial information about the delivery. Do you think you can decrypt it?

## How to solve it
Create a decrypting mechanism in python based on the encryption file "chall.py".

```python
def decryption(msg):
    pt = []
    for char in msg:
        char = char - 18
        char = 179 * char % 256
        pt.append(char)
    return bytes(pt)

with open('./msg.enc') as f:
    ct = bytes.fromhex(f.read())

pt = decryption(ct)
print(pt)
```

By running this, we get
```python
b'Th3 nucl34r w1ll 4rr1v3 0n fr1d4y.\nHTB{l00k_47_y0u_r3v3rs1ng_3qu4710n5_c0ngr475}'
```