# Salty

## Flag
```
crypto{saltstack_fell_for_this!}
```

## Solution

El exponente público `e = 1` hace que el cifrado sea trivial: `c = m^1 mod N = m`. El ciphertext simplemente es el mensaje, solo hay que convertirlo de entero a bytes.

```python
from Crypto.Util.number import long_to_bytes

ct = 44981230718212183604274747859257931454426554650252645404602825131164449412748
print(long_to_bytes(ct))
# Output: b'crypto{saltstack_fell_for_this!}'
```
