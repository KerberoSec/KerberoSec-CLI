# Working with Fields

## Flag
```
crypto{p4tch_1t_0r_h4ck_1t}
```

## Solution

Challenge teórico/introductorio sobre campos finitos en Diffie-Hellman. Un **campo** (field) es un conjunto donde están definidas la suma y la multiplicación con sus inversas. En DH se trabaja en el campo `ℤ/pℤ` donde `p` es primo.

El inverso multiplicativo de un elemento `a` en `ℤ/pℤ` se calcula con `pow(a, -1, p)`.

```python
print(pow(209, -1, 991))
# Output: 569
```
