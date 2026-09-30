# Point Addition

## Flag
```
crypto{4215,2162}
```

## Solution

Se implementa la adición de puntos en una curva elíptica `y² = x³ + ax + b mod p`. Hay dos casos:

- **Suma de puntos distintos:** `s = (y₂ - y₁) / (x₂ - x₁) mod p`
- **Duplicación de punto (P = Q):** `s = (3x₁² + a) / (2y₁) mod p`

Luego: `x₃ = s² - x₁ - x₂ mod p` y `y₃ = s(x₁ - x₃) - y₁ mod p`

El challenge pide calcular `S = P + P + Q + R` con los puntos dados.

```python
p = 9739
a = 497

def point_addition(P, Q, a, p):
    if P != Q:
        s = (Q[1] - P[1]) * pow(Q[0] - P[0], -1, p) % p
    else:
        s = (3 * P[0]**2 + a) * pow(2 * P[1], -1, p) % p
    x = (s**2 - P[0] - Q[0]) % p
    y = (s * (P[0] - x) - P[1]) % p
    return (x, y)

P = (493, 5564)
Q = (1539, 4742)
R = (4403, 5202)

S = point_addition(P, point_addition(P, point_addition(Q, R, a, p), a, p), a, p)
print(f"crypto{{{S[0]},{S[1]}}}")
```
