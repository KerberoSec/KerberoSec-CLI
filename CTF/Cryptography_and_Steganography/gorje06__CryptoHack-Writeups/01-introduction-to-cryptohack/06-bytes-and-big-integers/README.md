# Bytes and Big Integers

## Flag
```
crypto{3nc0d1n6_4ll_7h3_w4y_d0wn}
```

## Solution

Se usa `long_to_bytes` de la librería `pycryptodome` para convertir el entero grande a bytes.

```python
from Crypto.Util.number import long_to_bytes

big_int = 11515195063862318899931685488813747395775516287289682636499965282714637259206269
byte_data = long_to_bytes(big_int)
flag = byte_data.decode("ascii")
print(flag)
```
