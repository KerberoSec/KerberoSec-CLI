# Adrien's Signs

## Flag
```
crypto{p4tterns_1n_re5idu3s}
```

## Solution

Se usa el símbolo de Legendre (criterio de Euler) para determinar si cada elemento es un residuo cuadrático. Los resultados se agrupan en bloques de 8 bits para construir caracteres ASCII.

```python
def legendre_symbol(a, p):
    return 1 if pow(a, (p - 1) // 2, p) == 1 else -1

for block in range(len(x) // 8):
    s = 0
    for y in range(8):
        if legendre_symbol(x[8 * block + y], p) == 1:
            s += 2 ** (7 - y)
    print(chr(s), end='')
```
