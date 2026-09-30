# ECB Oracle

## Flag
```
crypto{p3n6u1n5_h473_3cb}
```

## Solution

Ataque de byte-at-a-time contra ECB. Se envía un payload de 31 bytes para que el primer byte del flag quede en el segundo bloque, luego se prueba cada carácter posible hasta encontrar el que produce el mismo ciphertext.

```python
# Para cada byte del flag:
# 1. Enviar padding de (31 - posicion) bytes
# 2. Probar cada carácter posible
# 3. Comparar bloques cifrados
```

> Nota: Este script tarda varios minutos en completarse debido a las peticiones HTTP.
