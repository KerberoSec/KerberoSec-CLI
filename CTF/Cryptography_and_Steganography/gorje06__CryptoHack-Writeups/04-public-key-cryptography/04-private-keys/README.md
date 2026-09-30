# Private Keys

## Flag
```
crypto{d_1s_f0r_d3crypt}
```

## Solution

La clave privada `d` es el inverso modular de `e` respecto a `φ(N)`. En Python 3.8+ se puede calcular directamente con `pow(e, -1, phi)`.

```python
p = 857504083333971275248999381077
q = 1029224949794299880750803486472219
e = 65537
phi = (p - 1) * (q - 1)

d = pow(e, -1, phi)
print(d)
# Output: 121832886702415731577073962957377780195510499965398469843281
```
