# easy-aes

Platform: Gemastik 2023

## Description

> Attack on AES OFB
>*(Author: prajnapras19)*

```bash
nc ctf-gemastik.ub.ac.id 10002
```

`chall.py`:

```python
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
from Crypto.Util.number import bytes_to_long, long_to_bytes
import os

key = os.urandom(AES.key_size[0])
iv = os.urandom(AES.block_size)
secret = bytes_to_long(os.urandom(128))

def encrypt(pt):
    bytes_pt = long_to_bytes(pt)
    cipher = AES.new(key, AES.MODE_OFB, iv)
    padded_pt = pad(bytes_pt, AES.block_size)
    return bytes_to_long(cipher.encrypt(padded_pt))

def menu():
    print('===== Menu =====')
    print('1. Encrypt')
    print('2. Get encrypted secret')
    print('3. Get flag')
    print('4. Exit')
    choice = int(input('> '))
    return choice

def get_flag():
    res = int(input('secret: '))
    if secret == res:
        os.system('cat flag.txt')
        print()

while True:
    try:
        choice = menu()
        if choice == 1:
            pt = int(input('plaintext = '))
            ciphertext = encrypt(pt)
            print(f'{ciphertext = }')
        if choice == 2:
            ciphertext = encrypt(secret)
            print(f'{ciphertext = }')
        if choice == 3:
            get_flag()
            break
        if choice == 4:
            break
    except:
        print('something error happened.')
        break

print('bye.')
```

## Solution

The provided program performs encryption using AES (Advanced Encryption Standard) in OFB (Output Feedback) mode for encrypting the plaintext. The program also has options to obtain the `encrypted secret` and retrieve the `flag.txt` using the decrypted secret.

Based on the OFB algorithm,

![ofb_1](https://upload.wikimedia.org/wikipedia/commons/a/a9/Ofb_encryption.png)
![ofb_2](https://upload.wikimedia.org/wikipedia/commons/8/82/Ofb_decryption.png)

The encryption and decryption processes do not depend on the plaintext. Since the `key` and `IV` is static, with both encryption and decryption based on AES in OFB mode and the XOR operation between the plaintext and keystream being the only remaining step, the program becomes susceptible to [Chosen-plaintext attack](https://en.wikipedia.org/wiki/Chosen-plaintext_attack).

The attack can be performed with the `XOR` properties,
![xor](https://760948859-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-MX1bWRlBzHpEPe1TYDD%2Fuploads%2Fgit-blob-2fdc9a4918ec0b97d6ae933e58ee5edc11997705%2F2d728934472f488983e05516ffd1151a.png?alt=media)

This is the same as [one-time pad key reuse](https://crypto.stackexchange.com/questions/59/taking-advantage-of-one-time-pad-key-reuse). If `c1` and `c2` are two ciphertexts obtained by `XOR`ing two plaintexts `p1` and `p2` with the same key, then `c1 ⊕ c2 = p1 ⊕ p2`. Furthermore, `p1 ⊕ p2 ⊕ p2 = p1`, as XORing a value with itself results in 0.
Using this scenario, we can retrieve the `secret`.

`script`:

```python
from pwn import *
import os
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from Crypto.Util.number import bytes_to_long, long_to_bytes

r = remote("ctf-gemastik.ub.ac.id", 10002) # (host, port)

# create custom 128-bytes plaintext
t = os.urandom(128)
p1 = str(bytes_to_long(t))

# custom ciphertext
r.sendlineafter(b'> ', b'1')
r.sendlineafter(b'plaintext = ', p1.encode())
r.recvuntil(b"ciphertext = ")
c1 = int(r.recvline().strip())

# get the secret_ciphertext
r.sendlineafter(b'> ', b'2')
r.recvuntil(b"ciphertext = ")
c2 = int(r.recvline().strip())

# get the secret
p2 = str(bytes_to_long(unpad(long_to_bytes(bytes_to_long(pad(t, AES.block_size)) ^ c1 ^ c2), AES.block_size)))

# get the flag
r.sendlineafter(b'> ', b'3')
r.sendlineafter(b'secret: ', p2.encode())
r.interactive()
```

**flag:** `gemastik{crypto_easy-aes_66ed4a79865d667a1981763e84019607d3f2c0a69e7cb97f}`
