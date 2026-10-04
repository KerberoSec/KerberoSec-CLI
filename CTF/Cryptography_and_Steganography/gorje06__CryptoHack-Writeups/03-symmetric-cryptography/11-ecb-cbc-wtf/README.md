# ECB CBC WTF

## Flag
```
crypto{3cb_5uck5_4v01d_17_!!!!!}
```

## Solution

El servidor descifra en modo ECB pero el flag fue cifrado en CBC. Se aprovecha que CBC es: `P1 = ECB_decrypt(C1) XOR IV` y `P2 = ECB_decrypt(C2) XOR C1`.

```python
# Bloque 1: XOR(ECB_decrypt(C1), IV)
# Bloque 2: XOR(ECB_decrypt(C2), C1)
for x, y in zip(pt1, iv_list):
    pt += chr(x ^ y)
for x, y in zip(ct1_list, pt2_list):
    pt += chr(x ^ y)
```
