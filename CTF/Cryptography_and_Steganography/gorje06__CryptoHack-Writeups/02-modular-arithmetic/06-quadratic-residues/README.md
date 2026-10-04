# Quadratic Residues

## Flag
```
crypto{8}
```

## Solution

Se buscan los valores `a` en `range(p)` cuyo cuadrado módulo `p` esté en la lista de enteros dados, y se toma el mínimo.

```python
p = 29
ints = [14, 6, 11]

qr = [a for a in range(p) if pow(a, 2, p) in ints]
print(f"flag {min(qr)}")  # 8
```
