# Modular Exponentiation

## Flag
```
crypto{f1f7y_7hR33_1s_n0T_pR1mE}
```

## Solution

Se usa la función `pow(base, exp, mod)` de Python para calcular exponenciación modular eficientemente: `101^17 mod 22663`.

```python
print(pow(101, 17, 22663))
# Output: 19906
```

El resultado `19906` es la flag numérica que se envía al servidor.
