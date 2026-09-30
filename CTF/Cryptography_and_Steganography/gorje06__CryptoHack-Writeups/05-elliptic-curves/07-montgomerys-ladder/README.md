# Montgomery's Ladder

## Flag
```
crypto{492313504627860160643367569774126547933839647267718929825074209215630023781 52}
```

## Solution

La **escalera de Montgomery** es un algoritmo de multiplicación escalar resistente a ataques de canal lateral (*side-channel attacks*). A diferencia de double-and-add convencional, siempre ejecuta exactamente las mismas operaciones independientemente de los bits del escalar, eliminando variaciones de tiempo que podrían filtrar información sobre la clave privada.

Se trabaja en la curva de Montgomery `By² = x³ + Ax² + x` con `A = 486662`, `B = 1`, `p = 2²⁵⁵ - 19` (Curve25519).

```python
A = 486662
B = 1
p = 2**255 - 19

def montgomery(k, P):
    k_bits = f'0{k:b}'  # Append a 0
    R0, R1 = P, montgomery_dbl(P)
    for i in range(2, len(k_bits)):
        if k_bits[i] == '0':
            R0, R1 = montgomery_dbl(R0), montgomery_add(R0, R1)
        else:
            R0, R1 = montgomery_add(R0, R1), montgomery_dbl(R1)
    return R0

G = (9, 14781619447589544791020593568400998688726460613461647528896488183775558623740 1)
s = montgomery(0x1337c0decafe, G)
print('crypto{' + f'{s[0]}' + '}')
```
