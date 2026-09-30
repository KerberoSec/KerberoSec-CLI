# Generators of Groups

## Flag
```
crypto{7}
```

## Solution

Un **generador** de un grupo `ℤ/pℤ*` es un elemento `g` tal que sus potencias sucesivas producen todos los elementos del grupo. El orden de `g` debe ser `p-1`.

Se busca el menor generador de `ℤ/28151ℤ*` probando cada elemento hasta encontrar uno de orden `n-1 = 28150`.

```python
n = 28151
for i in range(2, n):
    x = i
    cnt = 1
    while True:
        x = x * i % n
        cnt += 1
        if x == 1:
            break
    if cnt == n - 1:
        print("Result:", i)  # Output: 7
        break
```
