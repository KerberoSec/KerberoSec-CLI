# Modes of Operation Starter

## Flag
```
crypto{bl0ck_c1ph3r5_4r3_f457_!}
```

## Solution

Se obtiene el ciphertext del endpoint de cifrado y se envía directamente al endpoint de descifrado, que devuelve el plaintext en hex.

```python
import requests

response = requests.get("http://aes.cryptohack.org/block_cipher_starter/encrypt_flag/")
ciphertext = response.json()['ciphertext']
response = requests.get("http://aes.cryptohack.org/block_cipher_starter/decrypt/" + ciphertext)
print(bytes.fromhex(response.json()['plaintext']).decode('utf-8'))
```
