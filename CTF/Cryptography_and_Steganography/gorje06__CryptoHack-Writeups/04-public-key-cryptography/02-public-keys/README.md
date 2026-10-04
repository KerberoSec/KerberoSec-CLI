# Public Keys

## Flag
```
crypto{3xp0n3n7!4l}
```

## Solution

Se calcula `g^a mod p` usando la función `pow()` de Python. El par `(N, e)` constituye la clave pública RSA.

```python
print(pow(12, 65537, 17*23))
# Output: 301
```

La exponenciación modular es la operación central en RSA: cifrar es elevar el mensaje a la potencia del exponente público `e` módulo `N`.
