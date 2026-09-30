# ProSign 3

## Flag
```
crypto{ECDSA_700_345y_70_5cr3wup}
```

## Solution

El servidor firma mensajes con **ECDSA-192** pero comete un error crítico: la variable `n` (orden del grupo) es sobreescrita por el número de minutos del timestamp. Como resultado, el nonce `k` se genera en el rango `[1, minutos]` en lugar de `[1, n]`, haciéndolo completamente predecible.

**Ataque:**
1. Pedir una firma al servidor → obtener `(r, s, msg)`.
2. Del mensaje se extrae el valor máximo de `k` (los minutos del timestamp).
3. Iterar `k` de 1 hasta ese máximo hasta encontrar el `k` tal que `(k·G).x == r`.
4. Recuperar la clave privada: `secret = (s·k - m) / r mod n`.
5. Firmar `"unlock"` con la clave privada recuperada.

```python
for k in range(1, k_max):
    if (k * g).x() == r:
        break

# Recuperar clave privada
m = bytes_to_long(sha1(msg.encode()))
secret = ((s * k) - m) * inverse(r, g.order()) % g.order()
```
