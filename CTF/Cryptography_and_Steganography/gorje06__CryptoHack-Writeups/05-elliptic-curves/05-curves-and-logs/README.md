# Curves and Logs

## Flag
```
crypto{80e5212754a824d3a4aed185ace4f9cac0f908bf}
```

## Solution

Se implementa un intercambio de claves **ECDH** (Elliptic Curve Diffie-Hellman). Bob calcula el secreto compartido multiplicando su clave privada `n_B` por la clave pública de Alice `Q_A`. Luego se extrae la coordenada `x` del resultado y se hashea con **SHA-1** para obtener la clave.

```python
import hashlib

p = 9739
a = 497
G = (1804, 5368)
Q_A = (815, 3190)   # Clave pública de Alice
n_B = 1829          # Clave privada de Bob

# Secreto compartido S = n_B * Q_A
S = scalar_mult(n_B, Q_A, p)

# Derivar clave hasheando la coordenada x
key = hashlib.sha1(str(S[0]).encode()).hexdigest()
print("crypto{" + key + "}")
# Output: crypto{80e5212754a824d3a4aed185ace4f9cac0f908bf}
```
