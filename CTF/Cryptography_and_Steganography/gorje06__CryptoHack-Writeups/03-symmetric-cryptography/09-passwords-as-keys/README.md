# Passwords as Keys

## Flag
```
crypto{k3y5__r__n07__p455w0rdz}
```

## Solution

Se hace un ataque de diccionario: se prueba cada palabra de una wordlist como contraseña, se hashea con MD5 para obtener la clave AES y se intenta descifrar el ciphertext.

```python
for word in wordlist:
    key = hashlib.md5(word).digest()
    cipher = AES.new(key, AES.MODE_ECB)
    plaintext = cipher.decrypt(ciphertext)
    try:
        print(plaintext.decode("utf-8"))
    except:
        continue
```
