# Chall

We were given a network packet capture corresponding to a diffie-hellman key exchange in a matrix group.
Here is the source code that was given along with the pcap file:

```python

import sys
import pwn
import pickle
import base64
import hashlib
import random
import numpy as np
from numpy._typing import NDArray
from gmpy2 import mpz
from typing import Any
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend

def mpow(a: NDArray[Any], e: int, p: mpz):
    n = a.shape[0]
    c: NDArray[Any] = np.identity(n, dtype=object) // mpz(1)
    for i in range(e.bit_length(), -1, -1):
        c = (c @ c) % p
        if e & (1 << i):
            c = (c @ a) % p
    return c

def dec(key: bytes, iv: bytes, ciphertext: bytes) -> str:
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    padded_data = decryptor.update(ciphertext) + decryptor.finalize()
    unpadder = padding.PKCS7(algorithms.AES.block_size).unpadder()
    plaintext = unpadder.update(padded_data) + unpadder.finalize()
    return plaintext.decode()

def main():
    r = pwn.remote(sys.argv[1], int(sys.argv[2]))
    r.send(base64.b64encode(b"g"))
    r.send(b"\r\n")

    msg = r.recv()
    p, g, gorder = pickle.loads(base64.b64decode(msg))
    print(gorder)
    a = random.randint(0, gorder)
    A = mpow(g, a, p)
    r.send(base64.b64encode(pickle.dumps(A)))
    r.send(b"\r\n")

    msg = r.recv()
    B, iv, cipher = pickle.loads(base64.b64decode(msg))

    K = mpow(B, a, p)
    h = hashlib.sha256()
    h.update(str(K).encode())
    digest = h.digest()
    print(dec(digest, iv, cipher))

    r.send(base64.b64encode(b"kthxbye"))
    r.send(b"\r\n")
    print(r.recv().decode("utf-8").strip()[::-1])

if __name__ == "__main__":
    main()
```

# Solution

Just looking for the pickle data in the network packets, we were able to recover the problems parameters.
Then, it was about solving discrete logarithm problem in a quite small order subgroup (around 2^(40)) of GL_3(Fp) and this was solved by @flumm1ba3r with a baby step giant step approach.

Here is the script corresponding to the recovery of the parameters of the problem once the relevant data had been extracted from the pcap file.

```python

import base64
import pickle

print(base64.b64encode(b"g").hex())
print(b"\r\n".hex())

msg_param = "gASVwwEAAAAAAACKCXkvq0yy73fQAIwWbnVtcHkuX2NvcmUubXVsdGlhcnJheZSMDF9yZWNvbnN0cnVjdJSTlIwFbnVtcHmUjAduZGFycmF5lJOUSwCFlEMBYpSHlFKUKEsBSwRLBIaUaAOMBWR0eXBllJOUjAJPOJSJiIeUUpQoSwOMAXyUTk5OSv////9K/////0s/dJRiiV2UKIwSc3ltcHkuY29yZS5udW1iZXJzlIwHSW50ZWdlcpSTlIoIFmHwQwMzf3KFlIGUaBWKCGZWkYOuWfpphZSBlGgVigmMXwj6epA1vACFlIGUaBWKCBQCaBuuiQxxhZSBlGgVigjbhyKM4KIKRIWUgZRoFYoJR8sxjLXi1aoAhZSBlGgVigiRTSDFrKx5WoWUgZRoFYoILKMQE75CeQuFlIGUaBWKCOdGMiDwpNMfhZSBlGgVigjI3g/5NAs4M4WUgZRoFYoJwP2GgGR2upsAhZSBlGgVigg4gnxUU1LlVYWUgZRoFYoIcaaQ23yYzz6FlIGUaBWKCOxNzWnJuB1ihZSBlGgVigh4LrDw+7B+JoWUgZRoFYoIvibXpgGfFyOFlIGUZXSUYooGoxCNfissh5Qu"
msg_A = "gASVsQEAAAAAAACMFm51bXB5Ll9jb3JlLm11bHRpYXJyYXmUjAxfcmVjb25zdHJ1Y3SUk5SMBW51bXB5lIwHbmRhcnJheZSTlEsAhZRDAWKUh5RSlChLAUsESwSGlGgDjAVkdHlwZZSTlIwCTziUiYiHlFKUKEsDjAF8lE5OTkr/////Sv////9LP3SUYoldlCiMEnN5bXB5LmNvcmUubnVtYmVyc5SMB0ludGVnZXKUk5SKCGTgnu/Yk+BihZSBlGgVigg5rHTzPrWCYoWUgZRoFYoImH7UmRiMnUWFlIGUaBWKCFlTxwaglr8uhZSBlGgVigkJ37Hl8U4qsQCFlIGUaBWKCAuKYDZqxOsOhZSBlGgVigkj1VgyO1xWzwCFlIGUaBWKCcLd9WCft2i7AIWUgZRoFYoJI2jLs3Ciu5gAhZSBlGgVigj+J0jZbbMjWIWUgZRoFYoJxkNGQV73xZEAhZSBlGgVigipSGebtyafCoWUgZRoFYoIeg6S/xmg1zeFlIGUaBWKCI+mP+J85/Q2hZSBlGgVigmysd++VGxozwCFlIGUaBWKCHKVTIkknI9lhZSBlGV0lGIu"
msg_ciphertext = "gASV+wEAAAAAAACMFm51bXB5Ll9jb3JlLm11bHRpYXJyYXmUjAxfcmVjb25zdHJ1Y3SUk5SMBW51bXB5lIwHbmRhcnJheZSTlEsAhZRDAWKUh5RSlChLAUsESwSGlGgDjAVkdHlwZZSTlIwCTziUiYiHlFKUKEsDjAF8lE5OTkr/////Sv////9LP3SUYoldlCiMEnN5bXB5LmNvcmUubnVtYmVyc5SMB0ludGVnZXKUk5SKCNTS9bC+wMoRhZSBlGgVigk4YpwsLyINqACFlIGUaBWKCaExxfooiXmaAIWUgZRoFYoIxOucKe4l13GFlIGUaBWKCSwSEXGbIOHAAIWUgZRoFYoIxqNCqxAPJCyFlIGUaBWKCPI0ZgsCoro5hZSBlGgVigk1OVgk4g9WrQCFlIGUaBWKCZALb4nYvHXNAIWUgZRoFYoJUm6Ox7DtKM4AhZSBlGgVigioe8g+29AiKoWUgZRoFYoIBlC25kdmJx+FlIGUaBWKCb7kZePWF6agAIWUgZRoFYoJ2+tDiqDHTLQAhZSBlGgVigiLn9MQMIzfeYWUgZRoFYoIuWDFjVHxSSyFlIGUZXSUYkMQuQYFxw3F4NTSq0WMk8o+LJRDMNdyWG4eH/iLX73CovdC1sj8UXrMHXbOOAUtsaomaFDNJkIyt9kNKDodI3pvl9ZVj5SHlC4="
raw_bytes_param = base64.b64decode(msg_param)
raw_bytes_A = base64.b64decode(msg_A)
raw_bytes_ciphertext = base64.b64decode(msg_ciphertext)
p, g, gorder = pickle.loads(base64.b64decode(msg_param))
A = pickle.loads(raw_bytes_A)
B, iv, cipher = pickle.loads(raw_bytes_ciphertext)

"""
print("p: ")
print(p)
print("======")
print("g:")
print(g)
print("======")
print("gorder: ")
print(gorder)
print("======")
print("A:")
print(A)
print("=====")
print("B: ")
print(B)
print("=====")
print("iv:")
print(iv)
print("=====")
print("cipher:")
print(cipher)
print("=====")
"""
```

Here is the Python script solving the problem with BSGS (baby step giant step)

```python

# to be completed

```

