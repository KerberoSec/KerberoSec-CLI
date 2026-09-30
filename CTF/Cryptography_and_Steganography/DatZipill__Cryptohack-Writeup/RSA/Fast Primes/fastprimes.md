# Fast Primes

## Đề bài
Đề bài cho đoạn code mã hóa như sau
```python
#!/usr/bin/env python3

import math
import random
from Crypto.Cipher import PKCS1_OAEP
from Crypto.PublicKey import RSA
from Crypto.Util.number import bytes_to_long, inverse
from gmpy2 import is_prime

FLAG = b"crypto{????????????}"

primes = []

def sieve(maximum=10000):
    # In general Sieve of Sundaram, produces primes smaller
    # than (2*x + 2) for a number given number x. Since
    # we want primes smaller than maximum, we reduce maximum to half
    # This array is used to separate numbers of the form
    # i+j+2ij from others where 1 <= i <= j
    marked = [False]*(int(maximum/2)+1)

    # Main logic of Sundaram. Mark all numbers which
    # do not generate prime number by doing 2*i+1
    for i in range(1, int((math.sqrt(maximum)-1)/2)+1):
        for j in range(((i*(i+1)) << 1), (int(maximum/2)+1), (2*i+1)):
            marked[j] = True

    # Since 2 is a prime number
    primes.append(2)

    # Print other primes. Remaining primes are of the
    # form 2*i + 1 such that marked[i] is false.
    for i in range(1, int(maximum/2)):
        if (marked[i] == False):
            primes.append(2*i + 1)
            print(2*i + 1)

def get_primorial(n):
    result = 1
    for i in range(n):
        result = result * primes[i]
    return result

def get_fast_prime():
    M = get_primorial(40)
    while True:
        k = random.randint(2**28, 2**29-1)
        a = random.randint(2**20, 2**62-1)
        p = k * M + pow(e, a, M)

        if is_prime(p):
            return p

sieve()

e = 0x10001
m = bytes_to_long(FLAG)
p = get_fast_prime()
q = get_fast_prime()
n = p * q
phi = (p - 1) * (q - 1)
d = inverse(e, phi)

key = RSA.construct((n, e, d))
cipher = PKCS1_OAEP.new(key)
ciphertext = cipher.encrypt(FLAG)

assert cipher.decrypt(ciphertext) == FLAG

exported = key.publickey().export_key()
with open("key.pem", 'wb') as f:
    f.write(exported)

with open('ciphertext.txt', 'w') as f:
    f.write(ciphertext.hex())
```
Cùng với 1 file key.pem chứa n, e cùng file output.txt chứa ciphertext

## Cách giải
Ta hoàn toàn có thể dùng factordb để phân tích thừa số nguyên tố của n để giải bài toán nhưng mà làm vậy thì mất hay =}}.

Ý tưởng xuất phát từ cách tạo ra p và q.

$$p = k*M + pow(e, a, M)$$
với M là tích của 40 số nguyên tố đầu tiên (khoảng 228 bits) và k là 28 bits tạo ra p là 256 bits. Nếu ta có thể đoán được pow(e, a, M) thì có thể dùng định lý Coppersmith để giải ra k. Bài toán còn được gọi là Finding small roots:
$$f(x) \equiv 0 \pmod N \rightarrow h(x) = 0$$

Định lý Coppersmith đưa bài toán đồng dư 0 mod N về đa thức trên trường số nguyên Z. Từ đó ta có thể dễ dàng tìm được x. SageMath hỗ trợ rất mạnh giải qua hàm small_roots(). Ta sẽ đi sâu vào tìm hiểu hàm này ở phần sau. Trước hết là ý tưởng đưa bài toán về bài Coppersmith.

Như ở trên ta đã có đa thức của p qua k, M, pow(e, a, M). Vì vậy, coi như ta biết được pow(e, a, M), p sẽ trở thành đa thức với ẩn k. Ta đặt:
$$f(x) = k*M + pow(e, a, M) \equiv 0 \pmod p$$
Ta sẽ đưa f(x) đồng dư 0 trên trường mod p về h(x)=0 trên trường số nguyên Z. Tuy vậy, M là một số 228 bits dẫn đến số dư của $e^{a}$ mod M là rất nhiều, khó mà brute force được. Chính vì vậy, ta sẽ thay M bằng một ước của M, từ đó ta sẽ dễ dàng chứng minh được:
$$p = k'*M'+pow(e, a', M')$$
Từ đó, pow(e, a', M') sẽ hoàn toàn có thể brute force được. Vấn đề bây giờ là chọn M' sao cho hợp lí. Coppersmith có điều kiện để hoạt động:
$$|x_{0}| < X \approx N^{B^2/d}$$
Trong đó:
+ d là bậc của đa thức
+ B là tỉ lệ độ dài của p so với N
+ X là X_bound, giới hạn của nghiệm $x_{0}$

Vì vậy, ta tính được k' sẽ khoảng 128 bits, cùng với p là 256 bits thì M' sẽ lớn hơn 128 bits. Vấn đề chọn M' còn phải đảm bảo cho chu kỳ lặp dư với e phải ngắn, nma ta sẽ bỏ qua bước này. Nhờ sự trợ giúp, mình đã có được một số M' đẹp nhất =}}. 
```bash
M' = 2373273553037774377596381010280540868262890
```
Note: Ta hoàn toàn có thể sử dụng M' khác cũng tầm đó bits, cái giá phải trả là thời gian.

Giờ ta sẽ tìm hiểu cách dùng hàm small_roots(). Hàm small_roots thực hiện trên một hàm số đã đưa hệ số $x^{d}$ về 1. Hàm này nhận vào 3 tham số:
1. X là X_bound, X_bound càng sát k, tốc độ thực hiện càng nhanh
2. beta với $p > N^{beta}$
3. epsilon để tính $m = ceil(\frac{beta^2}{d*epsilon})$.

Ở bài này, X_bound sẽ là p bits: M' bits, beta là 0.4, m là 5 (sau khi test trong trường hợp cụ thể). Ta có đoạn code giải như sau:
```python
from Crypto.Util.number import *
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP

key_pem = """-----BEGIN PUBLIC KEY-----
MFswDQYJKoZIhvcNAQEBBQADSgAwRwJATKIe3jfj1qY7zuX5Eg0JifAUOq6RUwLz
Ruiru4QKcvtW0Uh1KMp1GVt4MmKDiQksTok/pKbJsBFCZugFsS3AjQIDAQAB
-----END PUBLIC KEY-----"""

primes = []

def sieve(maximum=10000):
    # In general Sieve of Sundaram, produces primes smaller
    # than (2*x + 2) for a number given number x. Since
    # we want primes smaller than maximum, we reduce maximum to half
    # This array is used to separate numbers of the form
    # i+j+2ij from others where 1 <= i <= j
    marked = [False]*(int(maximum/2)+1)

    # Main logic of Sundaram. Mark all numbers which
    # do not generate prime number by doing 2*i+1
    for i in range(1, int((math.sqrt(maximum)-1)/2)+1):
        for j in range(((i*(i+1)) << 1), (int(maximum/2)+1), (2*i+1)):
            marked[j] = True

    # Since 2 is a prime number
    primes.append(2)

    # Print other primes. Remaining primes are of the
    # form 2*i + 1 such that marked[i] is false.
    for i in range(1, int(maximum/2)):
        if (marked[i] == False):
            primes.append(2*i + 1)
            #print(2*i + 1)

def get_primorial(n):
    result = 1
    for i in range(n):
        result = result * primes[i]
    return result

sieve()

key = RSA.import_key(key_pem)

n = key.n
e = key.e

M = 2373273553037774377596381010280540868262890

print(M.bit_length())
    
X_bound = 2**(256-M.bit_length())

P.<x> = PolynomialRing(Zmod(n))

r = 1
while True:
    f = M*x + r
    roots = f.monic().small_roots(X = X_bound, beta = 0.4, epsilon = 0.035)
    if roots:
        k = roots[0]
        print(k)
        p = int(k * M + r)
        if p > 1 and n % p == 0:
            print(f"found p: {p}")
            break
    r = (r*e)%M

q = n//p

phi = (p-1) * (q-1)

d = int(inverse_mod(e, phi))

key = RSA.construct((n, e, d))
cipher = PKCS1_OAEP.new(key)
ciphertext = bytes.fromhex("249d72cd1d287b1a15a3881f2bff5788bc4bf62c789f2df44d88aae805b54c9a94b8944c0ba798f70062b66160fee312b98879f1dd5d17b33095feb3c5830d28")
flag =  cipher.decrypt(ciphertext)

print(flag)
```
