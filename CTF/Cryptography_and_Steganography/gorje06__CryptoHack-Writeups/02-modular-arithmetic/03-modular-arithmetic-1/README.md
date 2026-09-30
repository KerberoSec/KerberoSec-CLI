# Modular Arithmetic 1

## Flag
```
crypto{4}
```

## Solution

Se calcula el residuo de cada número con su módulo y se toma el mínimo.

```python
A1 = 11; M1 = 6
A2 = 8146798528947; M2 = 17

x = A1 % M1   # 5
y = A2 % M2   # 4
print(min(x, y))  # 4
```
