# Parameter Injection

## Flag
```
crypto{n1c3_0n3_m4ll0ry!!!!!!!!}
```

## Solution

Ataque **Man-in-the-Middle** en el intercambio DH. Mallory intercepta los parámetros `(p, g, A)` de Alice, los reenvía a Bob sin modificar, pero sustituye el valor público de Bob `B` por `g^b mod p` con una `b` propia. Así Mallory conoce el secreto compartido `A^b mod p` y puede descifrar la comunicación.

El truco: se deja pasar el mensaje de Alice a Bob íntegro, se intercepta la respuesta de Bob, y se envía un `B` propio calculado con `b = 123`. El secreto compartido se calcula como `pow(A, b, p)`.

```python
# Clave privada controlada por el atacante
b = 123
B = pow(g, b, p)

# Interceptar y reenviar A de Alice a Bob sin cambios
# Sustituir B de Bob por nuestro propio B
# El secreto compartido con Alice es:
shared_secret = pow(A, b, p)
```
