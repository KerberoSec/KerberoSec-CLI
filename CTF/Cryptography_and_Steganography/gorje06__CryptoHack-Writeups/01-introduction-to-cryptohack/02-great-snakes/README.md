# Great Snakes

## Flag
```
crypto{z3n_0f_pyth0n}
```

## Solution

Se descarga el script de Python del challenge y se ejecuta. El script hace XOR de cada valor de la lista con `0x32` y lo convierte a carácter.

```python
ords = [81, 64, 75, 66, 70, 93, 73, 72, 1, 92, 109, 2, 84, 109, 66, 75, 70, 90, 2, 92, 79]
print("".join(chr(o ^ 0x32) for o in ords))
```
