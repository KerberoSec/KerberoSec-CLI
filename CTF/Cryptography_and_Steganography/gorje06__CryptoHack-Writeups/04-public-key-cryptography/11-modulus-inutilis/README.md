# Modulus Inutilis

## Flag
```
crypto{N33d_m04R_p4dd1ng}
```

## Solution

Con `e = 3` y un mensaje corto, `m^3 < N`, por lo que `c = m^3` en los enteros (sin reducción modular). Se recupera el mensaje calculando la raíz cúbica entera de `c` mediante búsqueda binaria.

```python
from Crypto.Util.number import long_to_bytes

ct = 243251053617903760309941844835411292373350655973075480264001352919865180151222189820473358411037759381328642957324889519192337152355302808400638052620580409813222660643570085177957

# Binary search for cube root
lo, hi = 0, ct
while lo < hi:
    md = (lo + hi) >> 1
    if md * md * md < ct:
        lo = md + 1
    else:
        hi = md

print(long_to_bytes(lo).decode())
```
