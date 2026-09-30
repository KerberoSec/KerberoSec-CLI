# Moving Problems

## Flag
```
crypto{MOV_attack_on_non_supersingular_curves}
```

## Solution

**Ataque MOV** (Menezes-Okamoto-Vanstone): transfiere el ECDLP de la curva elíptica a un campo finito donde se puede resolver con algoritmos más eficientes (índice calculado / CADO-NFS).

El orden del grupo tiene la forma `q1 * q2` donde:
- `q1 = 2 * 7 * 271 * 23687` → smooth, tratable con **Pohlig-Hellman + BSGS**
- `q2 = 1153763334005213` → grande, requiere **CADO-NFS** (Number Field Sieve)

**Pasos:**
1. Proyectar al subgrupo de orden `q1`: `G1 = q2·G`, `A1 = q2·A`, resolver `A1 = x·G1` con Pohlig-Hellman → `alice_secret mod q1`.
2. Usar los valores `α, β` precomputados con CADO-NFS: `alice_secret mod q2 = β · α⁻¹ mod q2`.
3. Combinar con CRT: `alice_secret = CRT([res1, res2], [q1, q2])`.
4. Verificar `alice_secret · G == A`, calcular `S = alice_secret · B`.
5. Derivar clave AES con SHA-1 y descifrar.

```python
# Resolver la parte smooth con Pohlig-Hellman
alice_secret_1 = pohlig_hellman(A1, G1, q1, factors=[2, 7, 271, 23687])

# Parte grande con valores CADO-NFS precomputados
alice_secret_2 = (beta * inverse(alpha, q2)) % q2

# CRT para combinar
alice_secret = crt([alice_secret_1, alice_secret_2], [q1, q2])
shared_x = mul(B, alice_secret).x
```
