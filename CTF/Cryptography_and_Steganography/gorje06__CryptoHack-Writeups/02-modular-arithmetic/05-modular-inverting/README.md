# Modular Inverting

## Flag
```
crypto{9}
```

## Solution

Python 3.8+ permite calcular el inverso modular directamente con `pow(a, -1, m)`.

```python
print(pow(3, -1, 13))  # 9
```

Verifica: `3 * 9 = 27 ≡ 1 (mod 13)` ✓
