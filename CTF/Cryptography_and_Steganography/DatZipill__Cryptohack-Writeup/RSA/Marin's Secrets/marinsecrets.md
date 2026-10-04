# Marin's Secrets
## Đề bài
Đề bài cho đoạn code sau để khởi tạo bộ (n, e, c)
```python
#!/usr/bin/env python3

import random
from Crypto.Util.number import bytes_to_long
from secret import secrets, flag

def get_prime(secret):
    prime = 1
    for _ in range(secret):
        prime = prime << 1
    return prime - 1

random.shuffle(secrets)

m = bytes_to_long(flag)
p = get_prime(secrets[0])
q = get_prime(secrets[1])
n = p * q
e = 0x10001
c = pow(m, e, n)

print(f"n = {n}")
print(f"e = {e}")
print(f"c = {c}")
```
Đề bài còn cho 1 file output.txt gồm 1 bộ (n, e, c)

## Cách giải
Ta có thể dễ dàng thấy đoạn code tạo p và q bằng cách bắt đầu bằng số 1, sau đó dịch bit sang trái số lần tương ứng với giá trị trong secrets, cuối cùng trả về p hoặc q sau khi -1. Từ đó ta sẽ suy ra rằng:

$$ p = 2^u-1 \\ q = 2^t-1$$
$$ n = pq = (2^u-1)(2^t-1) = 2^{u+v}: 2^u: 2^v + 1$$
$$ n = 2^u(2^v: 1: 2^{v-u}) + 1\ với\ u < v$$

Vì vậy khi ta lấy n: 1, ta sẽ được một số chẵn tạo bởi có dạng $2^u \cdot r$ với r là một số lẻ. Dùng một vòng lặp ta có thể hoàn toàn tìm được u từ đó tìm được p và q.

Đoạn code đáp án sau đây:
```python
from Crypto.Util.number import long_to_bytes
from sage.all import *
from pwn import *

n = ...
e = ...
c = ...

tmp = n-1

u = 0

while True:
    if(tmp%2 == 0):
        u+=1
        tmp = tmp//2
    else:
        break
    
p = pow(2, u) - 1
q = n//p

phi = (p-1)*(q-1)

d = inverse_mod(e, phi)

m = pow(c, d, n)

print(long_to_bytes(int(m)))
```