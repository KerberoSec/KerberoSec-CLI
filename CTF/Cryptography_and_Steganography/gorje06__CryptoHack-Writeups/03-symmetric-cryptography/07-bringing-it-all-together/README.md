# Bringing It All Together

## Flag
```
crypto{MYAES128}
```

## Solution

Se implementa AES-128 completo desde cero con todas sus operaciones: `SubBytes`, `ShiftRows`, `MixColumns`, `AddRoundKey` y su key schedule. Luego se descifra el ciphertext dado.

```python
print(aes_decrypt(ciphertext, key))
```
