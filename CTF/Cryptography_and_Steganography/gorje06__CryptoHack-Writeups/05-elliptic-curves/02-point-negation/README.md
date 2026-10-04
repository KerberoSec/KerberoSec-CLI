# Point Negation

## Flag
```
crypto{8045,2803}
```

## Solution

La negación de un punto `P = (x, y)` en una curva elíptica sobre `ℤ/pℤ` es `−P = (x, −y mod p)`. Se mantiene la coordenada `x` y se niega la coordenada `y` módulo `p`.

```python
p = 9739
P = (8045, 6936)

x = P[0]
y = (-P[1]) % p  # negación de y módulo p

Q = (x, y)
print(f"crypto{{{Q[0]},{Q[1]}}}")
# Output: crypto{8045,2803}
```
