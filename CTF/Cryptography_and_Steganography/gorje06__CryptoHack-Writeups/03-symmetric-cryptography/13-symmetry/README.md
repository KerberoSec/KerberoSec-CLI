# Symmetry

## Flag
```
crypto{0fb_15_5ymm37r1c4l_!!!11!}
```

## Solution

CTR mode es simétrico: cifrar y descifrar es la misma operación. Se cifra el ciphertext del flag usando el IV como nuevo IV, lo que produce el plaintext original.

```python
# Encrypt(ciphertext, iv) == Decrypt(ciphertext, iv) == plaintext
iv, ciphertext = ciphertext[:BLOCK_SIZE], ciphertext[BLOCK_SIZE:]
response = requests.get(url="%s/encrypt/%s/%s" % (url_base, ciphertext.hex(), iv.hex())).json()
plaintext = bytes.fromhex(response['ciphertext'])
```
