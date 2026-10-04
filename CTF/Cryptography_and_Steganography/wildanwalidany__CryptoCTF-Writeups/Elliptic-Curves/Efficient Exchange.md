# Efficient Exchange

Platform: Cryptohack

## Description

> Using the curve, prime and generator: $E: Y^{2}=X^{3}+497X+1768, p:9739, G: (1804,5368)$
> Calculate the shared secret after Alice sends you $q_x = 4726$ , with your secret integer $n_{B} = 6534$.
> Use the `decrypt.py` file to decode the flag

```text
{'iv': 'cd9da9f1c60925922377ea952afc212c', 'encrypted_flag': 'febcbe3a3414a730b125931dccf912d2239f3e969c4334d95ed0ec86f6449ad8'}
```

Challenge files:
`decrypt.py`:

```python
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import hashlib

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

shared_secret = ?
iv = ?
ciphertext = ?

print(decrypt_flag(shared_secret, iv, ciphertext))
```

## Solution

To calculate the shared secret key, we can use the provided elliptic curve, prime, and generator values along with the information sent by Alice ($q_x=4726$ and $n_B=6534$). The key is to calculate $n_BP$, where $P$ is the point on the curve with x-coordinate $q_x$. The shared secret key is the x-coordinate of $n_BP$.

`solver.sage`:

```python
E = EllipticCurve(GF(9739), [497, 1768])

q_x = 4726
P = E.lift_x(q_x)

# print(shared secret)
print('shared key', str((6534*P)[0]))
```

**flag:** `crypto{3ff1c1ent_k3y_3xch4ng3}`
