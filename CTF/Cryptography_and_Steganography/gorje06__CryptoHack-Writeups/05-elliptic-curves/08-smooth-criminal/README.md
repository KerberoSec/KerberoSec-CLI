# Smooth Criminal

## Flag
```
crypto{n07_4ll_curv3s_4r3_s4f3_curv3s}
```

## Solution

La curva usada tiene un orden `#E(𝔽p)` **smooth** (compuesto solo de factores primos pequeños), lo que la hace vulnerable al algoritmo de **Pohlig-Hellman**. Este ataque descompone el problema del logaritmo discreto en subgrupos de orden primo pequeño y combina las soluciones con el **Teorema Chino del Resto (CRT)**.

Pasos:
1. Calcular el orden del grupo con la curva dada.
2. Factorizarlo completamente (todos los factores son pequeños → curva "smooth").
3. Para cada factor primo `qᵢ`, resolver el ECDLP en el subgrupo de orden `qᵢ` usando **Baby-Step Giant-Step (BSGS)**.
4. Combinar los residuos con CRT para obtener la clave privada completa.
5. Calcular el secreto compartido y descifrar con AES-CBC (clave derivada de SHA-1).

Se resuelven dos instancias del challenge con diferentes claves públicas.

```python
order = exact_order(G)       # orden smooth
n = pohlig_hellman(P, G, order)
assert scalar_mult(G, n) == P
secret = scalar_mult(B, n).x
flag = decrypt(secret, iv, encrypted)
```
