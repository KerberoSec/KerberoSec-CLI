# Flipping Cookie

## Flag
```
crypto{4u7h3n71c4710n_15_3553n714l}
```

## Solution

Ataque de CBC bit-flipping: al modificar el IV, se puede controlar el primer bloque del plaintext descifrado. Se forja un IV que convierta `admin=False` en `admin=True`.

```python
# forge_iv = IV XOR "admin=False;expi" XOR "admin=True;expir"
xor_result = strxor(iv, b'admin=False;expi')
forge_iv = strxor(xor_result, b'admin=True;expir').hex()
```
