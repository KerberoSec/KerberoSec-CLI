# Smooth Criminal

Platform: Cryptohack

## Description

> Spent my morning reading up on ECC and now I'm ready to start encrypting my messages. Sent a flag to Bob today, but you'll never read it.

```text
{'iv': 'cd9da9f1c60925922377ea952afc212c', 'encrypted_flag': 'febcbe3a3414a730b125931dccf912d2239f3e969c4334d95ed0ec86f6449ad8'}
```

Challenge files:
`source.py`:

```python
from Crypto.Cipher import AES
from Crypto.Util.number import inverse
from Crypto.Util.Padding import pad, unpad
from collections import namedtuple
from random import randint
import hashlib
import os

# Create a simple Point class to represent the affine points.
Point = namedtuple("Point", "x y")

# The point at infinity (origin for the group law).
O = 'Origin'

FLAG = b'crypto{??????????????????????????????}'

def check_point(P: tuple):
    if P == O:
        return True
    else:
        return (P.y**2 - (P.x**3 + a*P.x + b)) % p == 0 and 0 <= P.x < p and 0 <= P.y < p

def point_inverse(P: tuple):
    if P == O:
        return P
    return Point(P.x, -P.y % p)

def point_addition(P: tuple, Q: tuple):
    # based of algo. in ICM
    if P == O:
        return Q
    elif Q == O:
        return P
    elif Q == point_inverse(P):
        return O
    else:
        if P == Q:
            lam = (3*P.x**2 + a)*inverse(2*P.y, p)
            lam %= p
        else:
            lam = (Q.y - P.y) * inverse((Q.x - P.x), p)
            lam %= p
    Rx = (lam**2 - P.x - Q.x) % p
    Ry = (lam*(P.x - Rx) - P.y) % p
    R = Point(Rx, Ry)
    assert check_point(R)
    return R

def double_and_add(P: tuple, n: int):
    # based of algo. in ICM
    Q = P
    R = O
    while n > 0:
        if n % 2 == 1:
            R = point_addition(R, Q)
        Q = point_addition(Q, Q)
        n = n // 2
    assert check_point(R)
    return R

def gen_shared_secret(Q: tuple, n: int):
    # Bob's Public key, my secret int
    S = double_and_add(Q, n)
    return S.x

def encrypt_flag(shared_secret: int):
    # Derive AES key from shared secret
    sha1 = hashlib.sha1()
    sha1.update(str(shared_secret).encode('ascii'))
    key = sha1.digest()[:16]
    # Encrypt flag
    iv = os.urandom(16)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    ciphertext = cipher.encrypt(pad(FLAG, 16))
    # Prepare data to send
    data = {}
    data['iv'] = iv.hex()
    data['encrypted_flag'] = ciphertext.hex()
    return data

# Define the curve
p = 310717010502520989590157367261876774703
a = 2
b = 3

# Generator
g_x = 179210853392303317793440285562762725654
g_y = 105268671499942631758568591033409611165
G = Point(g_x, g_y)

# My secret int, different every time!!
n = randint(1, p)

# Send this to Bob!
public = double_and_add(G, n)
print(public)

# Bob's public key
b_x = 272640099140026426377756188075937988094
b_y = 51062462309521034358726608268084433317
B = Point(b_x, b_y)

# Calculate Shared Secret
shared_secret = gen_shared_secret(B, n)

# Send this to Bob!
ciphertext = encrypt_flag(shared_secret)
print(ciphertext)
```

`output.txt`:

```text
Point(x=280810182131414898730378982766101210916, y=291506490768054478159835604632710368904)

{'iv': '07e2628b590095a5e332d397b8a59aa7', 'encrypted_flag': '8220b7c47b36777a737f5ef9caa2814cf20c1c1ef496ec21a9b4833da24a008d0870d3ac3a6ad80065c138a2ed6136af'}
```

## Solution

`pohlig.sagews`:

```python
# Define parameters
p = 310717010502520989590157367261876774703
a = 2
b = 3
g_x = 179210853392303317793440285562762725654
g_y = 105268671499942631758568591033409611165

# Create a Finite Field and an Elliptic Curve
F = FiniteField(p)
E = EllipticCurve(F, [a, b])

# Define points P and G
P_x = 280810182131414898730378982766101210916
P_y = 291506490768054478159835604632710368904
P = E.point((P_x, P_y))

G = E.point((g_x, g_y))

# Calculate and print the factorization of the elliptic curve group order
order_factors = factor(E.order())
print("Factorization of E.order():", order_factors)

# Extract prime factors and their exponents
factors, exps = zip(*order_factors)
primes = [factors[i]^exps[i] for i in range(len(factors))]
print("Prime factors:", primes)

# Calculate discrete logarithms modulo each prime factor
dlogs = []
for fac in primes:
    t = int(G.order() / fac)
    dlog = discrete_log(t * P, t * G, operation="+")
    dlogs.append(dlog)
    print("Factor:", fac, "Discrete Log:", dlog)

# Use Chinese Remainder Theorem (CRT) to combine discrete logs
n = crt(dlogs, primes)

# Verify if n * G equals P
is_equal = n * G == P
print("Is n * G equal to P?", is_equal)
print("Shared Secret (n):", n)
```

`decrpyt.py`:

```python
import hashlib
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from source_ba064d03b53a5fd7321dd0007b72906b import Point, gen_shared_secret

def is_pkcs7_padded(message):
    padding = message[-message[-1]:]
    return all(padding[i] == len(padding) for i in range(0, len(padding)))

def decrypt_flag(shared_secret: int, iv: str, ciphertext: str):
    # Derive AES key from shared secret
    sha1 = hashlib.sha1()
    sha1.update(str(shared_secret).encode('ascii'))
    key = sha1.digest()[:16]
    # Decrypt flag
    ciphertext = bytes.fromhex(ciphertext)
    iv = bytes.fromhex(iv)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    plaintext = cipher.decrypt(ciphertext)

    if is_pkcs7_padded(plaintext):
        return unpad(plaintext, 16).decode('ascii')
    else:
        return plaintext.decode('ascii')

# My secret int, different every time!!
n = 47836431801801373761601790722388100620

# Bob's public key
b_x = 272640099140026426377756188075937988094
b_y = 51062462309521034358726608268084433317
B = Point(b_x, b_y) 

# Calculate Shared Secret
shared_secret = gen_shared_secret(B, n)

iv = '07e2628b590095a5e332d397b8a59aa7'
enc_flag = '8220b7c47b36777a737f5ef9caa2814cf20c1c1ef496ec21a9b4833da24a008d0870d3ac3a6ad80065c138a2ed6136af'

flag = decrypt_flag(shared_secret, iv, enc_flag)

print(flag)
```
<!-- This code section is a work in progress: TODO: Update with the solucion -->

**flag:** `crypto{n07_4ll_curv3s_4r3_s4f3_curv3s}`
