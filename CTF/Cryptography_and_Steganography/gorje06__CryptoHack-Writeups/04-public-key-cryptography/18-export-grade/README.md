# Export-grade

## Flag
```
crypto{d0wn6r4d35_4r3_d4n63r0u5}
```

## Solution

Ataque de **downgrade** inspirado en LOGJAM. El servidor soporta múltiples grupos DH, incluyendo `DH64` con un primo de solo 64 bits. Mallory fuerza a Alice y Bob a usar ese grupo débil, luego resuelve el **logaritmo discreto** sobre `ℤ/pℤ` (factible en 64 bits con `sympy`) para recuperar la clave privada de Alice y descifrar el flag.

Pasos:
1. Interceptar la lista de grupos soportados y forzar `"DH64"`.
2. Reenviar la elección a Alice.
3. Interceptar el valor público `A = g^a mod p` de Alice.
4. Calcular `a = dlog(A, g, p)` con `sympy.ntheory.residue_ntheory.discrete_log`.
5. Calcular el secreto compartido `S = B^a mod p` y descifrar.

```python
from sympy.ntheory.residue_ntheory import discrete_log

a = discrete_log(p, A, g)   # factible porque p es de 64 bits
shared_secret = pow(B, a, p)
```
