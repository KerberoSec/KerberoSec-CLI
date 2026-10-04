# Description

Can you make sense of this source code file and write a function that will decode the given encrypted file content?
Find the encrypted file here. It might be good to analyze source file to get the flag.

# Solution

`wget https://challenge-files.picoctf.net/c_verbal_sleep/ba64ef56074be4d9f1b047eb451185d84de7c490e264b9ea6e645bd9b0956c01/enc_flag https://challenge-files.picoctf.net/c_verbal_sleep/ba64ef56074be4d9f1b047eb451185d84de7c490e264b9ea6e645bd9b0956c01/block_chain.py`

enc_flag:
```
Key: b'\x8b\x9a\x00G\xfe\xb3\xf3\x93\xdb\xa8yT\xfe\x15\x87a\xf4\xdf\x00\x8d\xee\xab\xd9\t^|\x04(%\x81\x9e\xf8'
Encrypted Blockchain: b'Z5Wo\xe9\xbd\xf4\xed<\xeb=\xcb%\xc4\xf0>S2\x0bl\xe9\xe9\xf0\xe8>\xe8n\x91q\xca\xad=\x01fRo\xbe\xba\x...'
```

Key parts of block_chain.py:

```
def xor_bytes(a, b):
    return bytes(x ^ y for x, y in zip(a, b))
```

```
block_size = 16
plaintext = pad(modified_plaintext, block_size)
key_hash = hashlib.sha256(key).digest()

ciphertext = b''

for i in range(0, len(plaintext), block_size):
    block = plaintext[i:i + block_size]
    cipher_block = xor_bytes(block, key_hash)
    ciphertext += cipher_block
```

Reverse script:
```
import hashlib

def xor_bytes(a, b):
    return bytes(x ^ y for x, y in zip(a, b))

encrypted_blockchain = b'Z5Wo\xe9\xbd\xf4\xed<\xeb=\xcb%\xc4\xf0>S2\x0bl\xe9\xe9\xf0\xe8>\xe8n\x91q\xca\xad=\x01fRo\...'
key = b'\x8b\x9a\x00G\xfe\xb3\xf3\x93\xdb\xa8yT\xfe\x15\x87a\xf4\xdf\x00\x8d\xee\xab\xd9\t^|\x04(%\x81\x9e\xf8'

block_size = 16
key_hash = hashlib.sha256(key).digest()
flag = b''

for i in range(0, len(encrypted_blockchain), block_size):
    block = encrypted_blockchain[i:i + block_size]
    flag_block = xor_bytes(block, key_hash)
    flag += flag_block

print(flag)
```

Just taking the xor_bytes function from the block_chain script and the for loop but using it in reverse to get the flag. After it is done the flag is printed with the following output:

`b'85dbbeaacffc2894128ab1edae59f6d7cfab5b7995c8c8eef12c8e483cbabb80-008f3cf132d9c72b87ad6ae82c3cccd8685dc34ad5e3992beb3d5af90667773e-001a7039a41bb27460c41f0b044fedbbpicoCTF{block_3SRhViRbT1qcX_XUjM0r49cH_qCzmJZzBK_6064...}ce014e7d81f1d569d360c9706a1c98ee-0066a2261eabb27ed179a377bfe4a285d2d8acff133bee199e55a116a5f5a533-00fda7226a6f35003bb8f4c0c6ab004221a892aab38608fbed9f5adc2690b253\x02\x02'`

If you'd like you can use the pad function and create an unpad one to get just the flag and decode bytes or you can add grep to highlight the flag after running the script: `python3 script.py | grep picoCTF{.*}`. You can add `-o` flag to grep to get just the flag instead of just highlighting it and if you want to get rid of the color you can just use `--color=none`. For instance this should give just the flag: `python3 script.py | grep -o 'picoCTF{.*}' --color=none`.

Flag: `picoCTF{block_3SRhViRbT1qcX_XUjM0r49cH_qCzmJZzBK_6064...}`