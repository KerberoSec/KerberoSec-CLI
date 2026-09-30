

```python

from Crypto.Util.number import *

def genkey(bits):
  
  
  e=0x100001
  p=getPrime(bits)
  q=getPrime(bits)
  n=p*q
  phi=(p-1)*(q-1)
  d=pow(e,-1,phi)
  return (n,e),(p,q,d)

#flag must be bigger than 512 bit at least
flag=bytes_to_long(b'CYCTF{test_dummy}')
pub,priv=genkey(256)
n,e=pub
print(flag.bit_length())
print(pow(flag,e,n))
print(pub)
print(priv[-1]%(priv[1]-1))

  
```

```
nc 0.cloud.chals.io 11902

```

```python
from Crypto.Util.number import long_to_bytes

# Given values from the server
bit_length = 375
ct = 6923419578390124957686813954838128291078323273527304596859698248625364701721820691655851329945370167083030594967983735349864054030950863309558640909177365
n = 11244819285188315857027250015201499556174638612920440663450867714554437673287765609583405867395468551536918830737793968086973981105983418697423500033300313
e = 1048577
dq = 46892769743444156852336292530715271643902677272117393663869352382981243985797

# Compute A = e * dq - 1
A = e * dq - 1

# Try possible k values
for k in range(1, e):
    if A % k == 0:
        q_candidate = A // k + 1
        if n % q_candidate == 0:
            q = q_candidate
            p = n // q
            print(f"Found p = {p}")
            print(f"Found q = {q}")
            
            # Verify
            if p * q == n:
                phi = (p - 1) * (q - 1)
                d = pow(e, -1, phi)
                m = pow(ct, d, n)
                flag = long_to_bytes(m)
                print(f"Flag: {flag.decode()}")
            break
                                                           
```

