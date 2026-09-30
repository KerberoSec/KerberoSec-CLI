# Curveball

## Flag
```
crypto{Curveballing_Microsoft_CVE-2020-0601}
```

## Solution

Ataque basado en la **CVE-2020-0601** (CurveBall), una vulnerabilidad en la validación de certificados de Windows. El fallo: Windows no verificaba que el generador `G` de la curva coincidía con el estándar, solo validaba que la clave pública `Q = d·G` fuera consistente con el `G` especificado en el certificado.

**Explotación:**
1. Se toma la clave pública de Bing `Q_B` (punto conocido en P-256).
2. Se elige una clave privada arbitraria `d = 2`.
3. Se calcula un generador falso `G' = d⁻¹ · Q_B`, de modo que `d · G' = Q_B`.
4. Se presenta un certificado con `G'` y clave privada `d`. Windows lo acepta porque la relación `Q = d·G'` es válida.

```python
from fastecdsa.point import Point
from fastecdsa.curve import P256

Bing_pub = Point(0x3B827FF5..., 0xAB61705C..., curve=P256)
d = 2
d_inv = pow(d, -1, P256.q)
custom_generator = d_inv * Bing_pub  # G' tal que d * G' = Q_Bing

payload = {
    "private_key": d,
    "host": "www.definitely-not-bing.com",
    "curve": "secp256r1",
    "generator": [custom_generator.x, custom_generator.y]
}
```
