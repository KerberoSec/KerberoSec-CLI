# Deriving Symmetric Keys

## Flag
```
crypto{sh4r1ng_s3cret5_w1th_fr13nd5}
```

## Solution

Se calcula el secreto compartido DH y se deriva una clave AES hasheando el secreto con SHA-1 (tomando los primeros 16 bytes). Luego se descifra el flag con AES-CBC.

```python
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
import hashlib

p = 2410312426921032588552076022197566074856950548502459942654116941958108831682612...
g = 2
A = 112218739139542908880564359534373424013016249772931962692237907571990334483528...
b = 197395083814907028991785772714920885908249341925650951555219049411298436217190...

shared_secret = pow(A, b, p)

# Derive AES key from shared secret
sha1 = hashlib.sha1()
sha1.update(str(shared_secret).encode('ascii'))
key = sha1.digest()[:16]

iv = "737561146ff8194f45290f5766ed6aba"
encrypted_flag = "39c99bf2f0c14678d6a5416faef954b5893c316fc3c48622ba1fd6a9fe85f3dc72a29c394cf4bc8aff6a7b21cae8e12c"

cipher = AES.new(key, AES.MODE_CBC, bytes.fromhex(iv))
plaintext = unpad(cipher.decrypt(bytes.fromhex(encrypted_flag)), 16)
print(plaintext.decode('ascii'))
```
