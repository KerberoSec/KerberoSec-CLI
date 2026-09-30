# Scalar Multiplication

## Flag
```
crypto{9467,2742}
```

## Solution

La multiplicación escalar `nP` se implementa con el algoritmo **double-and-add**: se recorren los bits de `n` y se aplica duplicación en cada paso, sumando el punto acumulado cuando el bit es 1. Es el análogo de la exponenciación rápida pero sobre puntos de curva elíptica.

```python
def multiply_scalar(x1, y1, n, p):
    Q = [x1, y1]
    R = None  # punto en el infinito
    while n > 0:
        if n % 2 == 1:
            R = addPoints(Q, R)
        Q = addPoints(Q, Q)
        n = n // 2
    return R

n = 7863
a = 497
b = 1768
p = 9739
x1 = 2339
y1 = 2213

answer = multiply_scalar(x1, y1, n, p)
print(f"crypto{{{answer[0]},{answer[1]}}}")
# Output: crypto{9467,2742}
```
