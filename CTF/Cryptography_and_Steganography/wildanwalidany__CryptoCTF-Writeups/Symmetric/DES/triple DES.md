# Parameter Injection

Platform: Cryptohack

> Data Encryption Standard was the forerunner to AES, and is still widely used in some slow-moving areas like the Payment Card Industry. This challenge demonstrates a strange weakness of DES which a secure block cipher should not have.

Play at

```bash
https://aes.cryptohack.org/triple_des
```

`source`:

```python
from Crypto.Cipher import DES3
from Crypto.Util.Padding import pad

IV = os.urandom(8)
FLAG = ?

def xor(a, b):
    # xor 2 bytestrings, repeating the 2nd one if necessary
    return bytes(x ^ y for x,y in zip(a, b * (1 + len(a) // len(b))))

@chal.route('/triple_des/encrypt/<key>/<plaintext>/')
def encrypt(key, plaintext):
    try:
        key = bytes.fromhex(key)
        plaintext = bytes.fromhex(plaintext)
        plaintext = xor(plaintext, IV)

        cipher = DES3.new(key, DES3.MODE_ECB)
        ciphertext = cipher.encrypt(plaintext)
        ciphertext = xor(ciphertext, IV)

        return {"ciphertext": ciphertext.hex()}

    except ValueError as e:
        return {"error": str(e)}

@chal.route('/triple_des/encrypt_flag/<key>/')
def encrypt_flag(key):
    return encrypt(key, pad(FLAG.encode(), 8).hex())
```

## Solution

The provided program provides encryption functionality using the Triple DES (3DES) encryption algorithm. The web service provides us with `ENCRYPT(KEY,PLAINTEXT)` to performs chosen-plaintext encryption  and `ENCRYPT_FLAG(KEY)` to encrypt the flag with specific key. From this functionality, we can exploit DES using ![weak key](https://en.wikipedia.org/wiki/Weak_key). Weak keys in the context of the cryptography refer to specific key values that result in encryption exhibiting certain vulnerabilities and patterns. In this case, encrypting twice using `weak key` in DES produces the original plaintext.

`Script`:

```python
import requests
from Crypto.Util.Padding import unpad

def encrypt_flag(key):
    res = requests.get(f"http://aes.cryptohack.org/triple_des/encrypt_flag/{key}")
    return bytes.fromhex(res.json()['ciphertext'])

def encrypt(key, plaintext):
    res = requests.get(f"http://aes.cryptohack.org/triple_des/encrypt/{key}/{plaintext.hex()}/")
    return bytes.fromhex(res.json()['ciphertext'])

key = b'\x00'*8 + b'\xff'*8         # weak key, 16 bytes key used (2TDEA)

encrypted_flag = encrypt_flag(key.hex())      # first encryption
encrypted_flag_2 = encrypt(key.hex(), encrypted_flag)   # second encryption
flag = unpad(encrypted_flag_2, 8)
print(flag)
```

**flag:** `crypto{n0t_4ll_k3ys_4r3_g00d_k3ys}`
