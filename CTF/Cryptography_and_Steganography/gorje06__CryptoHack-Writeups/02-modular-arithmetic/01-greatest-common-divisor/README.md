# Greatest Common Divisor

## Flag
```
crypto{1512}
```

## Solution

Se implementa el algoritmo de Euclides para calcular el GCD de dos números.

```python
def gcd(a, b):
    if a < b:
        a, b = b, a
    while b != 0:
        a, b = b, a % b
    return a

print(gcd(66528, 52920))  # 1512
```
