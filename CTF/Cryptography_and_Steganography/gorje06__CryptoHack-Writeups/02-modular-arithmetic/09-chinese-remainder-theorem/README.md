# Chinese Remainder Theorem

## Flag
```
crypto{872}
```

## Solution

Se aplica el Teorema Chino del Resto para encontrar `x` tal que `x ≡ aᵢ (mod pᵢ)` para cada par.

```python
import numpy as np

a = [2, 3, 5]
p = [5, 11, 17]
x = 0
M = int(np.prod(p))  # 935

for i in range(len(a)):
    bi = M // p[i]
    x += (a[i] * bi * pow(bi, p[i]-2, p[i])) % M

print(x % M)  # 872
```
