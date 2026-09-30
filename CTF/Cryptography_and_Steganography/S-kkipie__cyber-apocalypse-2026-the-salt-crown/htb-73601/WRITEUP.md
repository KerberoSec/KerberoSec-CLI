# HTB 73601: "Fractured Seal" (The Salt Crown / key-scroll)

**Categoría:** Crypto: RSA partial key recovery (Coppersmith, known-MSB factoring)
**Flag:** `HTB{r3c0v3r1ng_RSA_k3ys___l1k3___Me0w___me0o00o0o0w___Me0w}`

---

## 1. Descripción

*"One of the Registry's oldest key-scrolls survived the fall of Crownspire, though time and fire
spared only fragments of its writing... a seal doesn't have to be whole to still remember the door
it once opened."*

Nos dan tres ficheros:

- `encrypt.py`: RSA-2048 estándar (`e=0x10001`), cifra el flag: `c = m^e mod n`.
- `fractured_seal.pem`: la clave **privada** PKCS#1 (`RSA PRIVATE KEY`) pero **redactada**: la
  mayoría de la base64 sustituida por `*` (y un gato ASCII en medio 🐈).
- `flag.enc`: 256 bytes = `long_to_bytes(pow(m,e,n))`.

`encrypt.py`:
```python
p=getPrime(1024); q=getPrime(1024); n=p*q; e=0x10001
d=pow(e,-1,(p-1)*(q-1))
open('seal.pem','wb').write(RSA.construct((n,e,d)).export_key())
open('flag.enc','wb').write(long_to_bytes(pow(m,e,n)))
```

El "sello fracturado" = clave privada parcial. La pista: *fragmentos bastan para recordar la
puerta* → **recuperación de clave RSA a partir de fragmentos** (Coppersmith).

## 2. Reconocimiento del PEM

El cuerpo PEM se envuelve a **64 chars base64 por línea = 48 bytes exactos y alineados a 4** →
cada quad de 4 chars visibles decodifica de forma independiente a 3 bytes. Así que reconstruyo
sólo los bytes DER conocidos, cuadra a cuadra, sin que los `*` rompan la alineación:

```python
for li,line in enumerate(lines):           # líneas del PEM (sin BEGIN/END)
    base=48*li; q=0
    while q+4<=64 and q+4<=len(line):
        quad=line[q:q+4]
        if '*' not in quad and all(c in B64 for c in quad):
            for k,bb in enumerate(base64.b64decode(quad)):
                known[base+q//4*3+k]=bb     # byte DER en offset absoluto
        q+=4
```

Estructura `RSAPrivateKey` (ASN.1 DER): `version, n, e, d, p(prime1), q(prime2), dP, dQ, qInv`.
Parseando los bytes conocidos (`30 82 04 a3 | 02 01 00 | 02 82 01 01 | 00 8c ae 7d 6a...`):

| Campo | offset DER | ¿conocido? |
|-------|-----------|-----------|
| `n` (modulus, 256 B) | 12..267 | **casi todo**: conocidos 12..266, **falta sólo el LSB (byte 267)** |
| `e` | 268.. | `0x10001` (estándar) |
| `d` (privateExponent) | 277..533 | totalmente redactado |
| `p` (prime1) | 536..664 | redactado **salvo sus 2 últimos bytes** = `da 6b` |
| `q` (prime2) | tag `02 81 81 00` en 665, contenido 668..796 | **conocidos los 73 bytes altos** (668..740) |

**Dos fragmentos aprovechables:**
1. `n` completo **salvo su byte menos significativo** → sólo 256 candidatos (128 impares, `n` es impar).
2. Los **576 bits más altos de `q`** (72 bytes reales tras el pad `00`); faltan los **448 bits bajos**.

Como `p ≡ 0xda6b (mod 2^16)`, tenemos además un **oráculo de verificación** de la factorización.

## 3. La matemática: Coppersmith known-MSB factoring

Conocidos los MSBs de un factor `q = q_high·2^448 + x0` con `x0` desconocido (`|x0| < 2^448`), y el
módulo `N`, el teorema de Coppersmith/Howgrave-Graham recupera `x0` si:

```
|x0| < N^(β²/d)   con β = log_N(q) ≈ 0.5,  d = 1   →   |x0| < N^0.25 = 2^512
```

Aquí `|x0| < 2^448 < 2^512` ✓ (margen de 64 bits). Se construye el polinomio monico
`f(x) = q_high·2^448 + x  ≡ 0 (mod q)`, se arma el retículo de Howgrave-Graham
`g_{i}=N^{m-i} f^i` y `h_{j}=x^j f^m` (escalando `x→Xx`), se reduce con **LLL** y el vector más
corto da un polinomio con `x0` como raíz. Recupero la raíz exacta por **gcd polinómico** de los dos
vectores más cortos → factor lineal `(x − x0)`.

Sin `sage`, uso `fpylll` (LLL) para el retículo. Parámetros `m=4, t=4` bastan (raíz de 448 bits
recuperada en ~0.16 s por intento; sweep confirmó que `m=3` no llega y `m≥4` sí).

## 4. El único obstáculo: el LSB de `n`

Coppersmith exige `N` **exacto** (necesita `q | N`). Como falta el byte bajo de `n`, **bruteo los
128 valores impares** y corro Coppersmith en cada uno; el correcto es el único que produce un factor.

```python
n_base = int.from_bytes(n_high_255_bytes,'big') << 8      # hueco del LSB = 0
q_high_shift = int.from_bytes(q_known_73_bytes,'big') << (8*56)   # 56 bytes bajos desconocidos
X = 1 << (8*56)                                           # 2^448

for lsb in range(1,256,2):                # n impar
    N = n_base | lsb
    q = coppersmith_factor(N, q_high_shift, X, beta=0.48, m=4, t=4)  # LLL + poly-gcd
    if q:                                 # q | N  →  acierto
        break
p = N // q
assert p*q == N and (p & 0xffff) == 0xda6b        # verificación con los bytes bajos de p
d = pow(e, -1, (p-1)*(q-1))
flag = long_to_bytes(pow(c, d, N))
```

Resultado:
```
HIT lsb=0x75 after 13.7s
p low16: 0xda6b            # coincide con los 2 bytes de p del PEM → factorización correcta
FLAG: b'HTB{r3c0v3r1ng_RSA_k3ys___l1k3___Me0w___me0o00o0o0w___Me0w}'
```

## 5. Flag

```
HTB{r3c0v3r1ng_RSA_k3ys___l1k3___Me0w___me0o00o0o0w___Me0w}
```

## 6. Lecciones / conceptos

- **El formato importa:** `RSA PRIVATE KEY` (PKCS#1 DER) trae `p`, `q`, `dP`, `dQ`, `qInv` además de
  `n`,`e`,`d`. Redactar "casi todo" deja sobras (2 bytes de `p`, 72 de `q`, `n` casi entero) que son
  suficientes. **Un sello roto todavía recuerda su puerta.**
- **Alineación base64:** PEM envuelve a 64 chars = 48 bytes alineados a 4 → los `*` no arruinan la
  decodificación; se recupera cada quad limpio de forma independiente.
- **Coppersmith known-MSB factoring:** con ≥ mitad de los bits altos de un primo (`|desconocido| <
  N^0.25`) y el módulo exacto, LLL factoriza `N`. Implementado con `fpylll` (sin sage) + gcd
  polinómico para la raíz exacta.
- **Falta el LSB de `n`:** Coppersmith necesita `N` exacto → brute de 128 candidatos impares; sólo el
  correcto da `q | N`. Los 2 bytes bajos de `p` (`0xda6b`) sirven de verificación cruzada gratis.

Scripts: `crypto_fractured_seal/solve.py` (Coppersmith univariante Howgrave-Graham + LLL vía fpylll +
poly-gcd), reconstrucción DER byte a byte desde el PEM fracturado.
```
pip install fpylll gmpy2 cysignals
python3 solve.py --test     # valida Coppersmith en RSA sintético
```
