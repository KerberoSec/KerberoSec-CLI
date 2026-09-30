# ECB CBC WTF

Platform: Cryptohack

## Description

> Here you can encrypt in CBC but only decrypt in ECB. That shouldn't be a weakness because they're different modes... right?

`play at:` [ecbcbcwtf](https://aes.cryptohack.org/ecbcbcwtf)

`source:`

```python
from Crypto.Cipher import AES

KEY = ?
FLAG = ?

@chal.route('/ecbcbcwtf/decrypt/<ciphertext>/')
def decrypt(ciphertext):
    ciphertext = bytes.fromhex(ciphertext)

    cipher = AES.new(KEY, AES.MODE_ECB)
    try:
        decrypted = cipher.decrypt(ciphertext)
    except ValueError as e:
        return {"error": str(e)}

    return {"plaintext": decrypted.hex()}

@chal.route('/ecbcbcwtf/encrypt_flag/')
def encrypt_flag():
    iv = os.urandom(16)

    cipher = AES.new(KEY, AES.MODE_CBC, iv)
    encrypted = cipher.encrypt(FLAG.encode())
    ciphertext = iv.hex() + encrypted.hex()

    return {"ciphertext": ciphertext}
```

## Solution

The provided program performs allows us to encrypt a flag using `AES-CBC` mode and decrypt a ciphertext using `AES-ECB` mode.

Based on the `CBC` and `ECB` algorithm,

![CBC-Encryption](https://upload.wikimedia.org/wikipedia/commons/d/d3/Cbc_encryption.png)
![ECB-Decryption](https://upload.wikimedia.org/wikipedia/commons/6/66/Ecb_decryption.png)

CBC (Cipher Block Chaining) encryption is a block cipher mode that XORs each plaintext block with the previous ciphertext block before encryption, using an initialization vector (IV) for the first block. So the same plaintext blocks dont get encrypted to the ciphertext.

ECB (Electronic Codebook) decryption is a block cipher mode where each ciphertext block is decrypted independently.

From the program, there is interesting line of code:

```python
ciphertext = iv.hex() + encrypted.hex()
```

It can be seen that the ciphertext is concenated with the `IV`. From this information we can extract the `IV` and XOR it to the `ECB` decrypted cipher block to reverse the `CBC` encryption or mimic the `CBC` decryption. From the challenge we know the length of ciphertext is 48 bytes and AES block size is 16 bytes. So the first block is `IV` and the remaining 2 blocks is the actual ciphertext. The scenario to obtain the flag is like this:

```math
\begin{align*}
flagBlock_{0} &= \text{decrypt}(cipherBlock_{0}) \oplus IV \\
flagBlock_{1} &= \text{decrypt}(cipherBlock_{1}) \oplus cipherBlock_{0} \\
flag &= flagBlock_{0} + flagBlock_{1}
\end{align*}
```

`solver`:

```python
import requests
from Crypto.Util.strxor import strxor

def decrypt(byte_string):
    url = "http://aes.cryptohack.org/ecbcbcwtf/decrypt/"
    url += byte_string.hex()
    url += "/"
    r = requests.get(url)
    js = r.json()
    return bytes.fromhex(js["plaintext"])

def encrypt_flag():
    url = "http://aes.cryptohack.org/ecbcbcwtf/encrypt_flag/"
    r = requests.get(url)
    js = r.json()
    return bytes.fromhex(js["ciphertext"])

enc = encrypt_flag()

iv = enc[:16]
block1 = enc[16:32]
block2 = enc[32:48]

decrypt_block1 = strxor(decrypt(block1), iv)
decrypt_block2 = strxor(decrypt(block2), block1)
print(decrypt_block1 + decrypt_block2)
```

**flag:** `crypto{3cb_5uck5_4v01d_17_!!!!!}`
