# Endless Emails

## Đề bài
Đề bài cho một đoạn code dưới đây
```python
#!/usr/bin/env python3

from Crypto.Util.number import bytes_to_long, getPrime
from secret import messages

def RSA_encrypt(message):
    m = bytes_to_long(message)
    p = getPrime(1024)
    q = getPrime(1024)
    N = p * q
    e = 3
    c = pow(m, e, N)
    return N, e, c

for m in messages:
    N, e, c = RSA_encrypt(m)
    print(f"n = {N}")
    print(f"e = {e}")
    print(f"c = {c}")
```
Cùng với file 'output.txt' chứa 7 bộ (n, e, c)

## Cách giải
Trong đề bài có nói "many of the students are asking the same question." Tức là trong số 7 bộ (n, e, c) có những đoạn tin nhắn giống hệt nhau và chính là flag ta cần tìm. Cùng với số e bé = 3 mà ta nghĩ ngay đến sử dụng Chinese Remainder Theorem.

CRT như sau: Nếu ta có một dãy đồng dư sau:

$$x \equiv a_{1} \pmod {m_{1}}$$
$$x \equiv a_{2} \pmod {m_{2}}$$
$$...$$
$$x \equiv a_{n} \pmod {m_{n}}$$

Thì với $M = m_{1} \cdot m_{2}...m_{n}$, ta sẽ có:

$$x \equiv \sum_{i=1}^{n} a_{i} \cdot M_{i} \cdot y_{i} \pmod M$$

với $M_{i} = M/m_{i}$ và $y_{i}$ là nghịch đảo modulo của $M_{i} \pmod {m_{i}}$

Chứng minh định lý này rất đơn giản, ta coi như có x như biểu thức trên. Ví dụ ta chia lấy dư cho $m_{1}$, ta có $M_{i}$ với i khác 1 sẽ chia hết cho nên ta chỉ còn $a_{1} \cdot M_{1} \cdot y_{1}$ chia dư cho $m_{1}$ sẽ ra $a_{1}$. Tương tự với các $m_{i}$ khác.

Trở lại bài toán, ở đây ta có:
$$c_{1} \equiv m^3 \pmod {m_{1}}$$
$$c_{1} \equiv m^3 \pmod {m_{2}}$$
$$c_{1} \equiv m^3 \pmod {m_{3}}$$

Dùng CRT ta sẽ tính được:
$$c' \equiv m^3 \pmod {m_{1} \cdot m_{2} \cdot m_{3}}$$

Và với $m^3 < m_{1} \cdot m_{2} \cdot m_{3}$ nên khi ta căn c' ta sẽ được m là flag cần tìm. Đây là cách tấn công Hastad.

Đoạn code đáp án (với hàm crt() tính CRT và combinations tổ hợp chập 3 trong số 7 bộ (n, e, c)):
```python
from Crypto.Util.number import *
from sage.all import *
import re
from itertools import combinations

with open('output.txt', 'r') as f:
    content = f.read()

ns = [int(x) for x in re.findall(r'n\s*=\s*(\d+)', content)]
cs = [int(x) for x in re.findall(r'c\s*=\s*(\d+)', content)]

for combo in combinations(range(len(ns)), 2):
    chosen_ns = [ns[i] for i in combo]
    chosen_cs = [cs[i] for i in combo]

    try:
        c_prime = crt(chosen_cs, chosen_ns)
        m = Integer(c_prime).nth_root(3)

        flag = long_to_bytes(int(m))
        print(flag)
        print(combo)

    except:
        print("Khong phai can bac 3")
```