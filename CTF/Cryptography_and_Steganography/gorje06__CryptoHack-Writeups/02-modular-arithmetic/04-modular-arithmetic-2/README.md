# Modular Arithmetic 2

## Flag
```
crypto{1}
```

## Solution

Por el Pequeño Teorema de Fermat, `a^(p-1) ≡ 1 (mod p)` cuando `p` es primo. Como `power = p-1 = 65536`, el resultado siempre es 1.

```python
p = 65537
a = 273246787654
power = 65536  # p - 1

print(pow(a, power, p))  # 1
```
