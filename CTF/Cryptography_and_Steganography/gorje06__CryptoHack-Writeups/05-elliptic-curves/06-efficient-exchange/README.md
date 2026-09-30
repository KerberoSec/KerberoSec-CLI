# Efficient Exchange

## Flag
```
crypto{3ff1c1ent_k3y_3xch4ng3}
```

## Solution

En ECDH eficiente solo se transmite la coordenada `x` del punto público. Para recuperar `y` se usa la ecuación de la curva `y² = x³ + ax + b mod p` y se calcula la raíz cuadrada modular. Como `p ≡ 3 mod 4`, la raíz se obtiene con `y = x^((p+1)/4) mod p`, eligiendo el signo correcto según la paridad.

Se calcula el secreto compartido ECDH y se descifra el flag con AES-CBC usando una clave derivada de SHA-1.

```python
# Recuperar y a partir de x
y_sq = (x**3 + a*x + b) % p
y = pow(y_sq, (p + 1) // 4, p)
# Elegir la raíz de paridad correcta
if y % 2 != parity:
    y = p - y

# Secreto compartido y descifrado AES-CBC
S = scalar_mult(n_B, (x, y))
sha1.update(str(S[0]).encode('ascii'))
key = sha1.digest()[:16]
```

La clave privada de Bob es `n_B = 1791` (obtenida iterando sobre secretos posibles hasta que el descifrado AES sea válido).
