# Bean Counter

## Flag
```
crypto{hex_bytes_beans}
```

## Solution

El servidor usa AES-ECB como keystream (mal uso del modo). Como conocemos el header PNG (magic bytes), podemos recuperar el keystream y descifrar toda la imagen.

```python
# keystream = encrypted_data XOR known_png_header
keystream = xor_bytes(png_header, encrypted_data[:len(png_header)])
decrypted_data = xor_bytes(encrypted_data, keystream * (len(encrypted_data) // len(keystream)))
```

La imagen descifrada `bean_counter.png` contiene el flag.
