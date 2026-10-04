# HTB 73602: "AshByte Arcade" (crypto_ashbyte_arcade)

**Categoría:** Crypto: 2-round AES key recovery (ataque diferencial known-plaintext vía DDT)
**Flag:** `HTB{tw0_r0und5_0f_5n0w_4nd_1mp0551bl3_d1ff5}`
**Remoto:** `154.57.164.82:30181`

---

## 1. Descripción

App Flask ("arcade retro") + `crypto.py`. Un "cartucho" guarda partidas cifradas. Para ganar hay
que entregar un **save cifrado** que descifre a un **estado ganador**. Endpoints:

- `POST /api/start` → sesión nueva, **clave AES aleatoria de 16 bytes por sesión**, 16 vidas.
- `POST /api/death` (gasta 1 vida, máx **16**) → recibe un estado válido **no-ganador**, lo cifra y
  devuelve `Enc(estado) ‖ Enc(pad)` (32 B, ECB). = **oráculo de cifrado** de texto elegido (limitado).
- `POST /api/load` (**gratis, ilimitado**) → descifra 32 B, valida formato; si el estado descifrado
  es **ganador**, devuelve el flag.

`SnowCipher` en `crypto.py` es **AES reducido a 2 rondas** (ECB):
```python
def encrypt_block(self, block):
    rk = _ek(self.KEY)                       # rk0, rk1, rk2 (expansión AES-128 -> 12 words)
    s = ARK(s, rk0)
    s = SB; SR; MC; ARK(rk1)                 # ronda 1
    s = SB; SR; MC; ARK(rk2)                 # ronda 2
```
El estado (16 B) trae SIG=0x4E, HP, SECTOR, X, Y, SCORE(3), RUNES(4), TRACK, DEATHS, FLAGS, LRC, con
tres **sellos** derivados (`track_seal`, `flags_seal`, `LRC`).

## 2. El objetivo y el muro

Para ganar necesito `Enc(W)` del estado ganador `W`
(`4e0509120d809698c37ab0ae52007f59`: sector=9, x=18, y=13, score=10 000 000, runes ganadoras).
Pero `/api/death` **rechaza todo estado ganador** (`is_winning_state`). Como es ECB, `Enc(W)` es un
bloque atómico: no hay cut-and-paste ni maleabilidad. Y los **sellos propagan cualquier cambio a
varias diagonales**, así que no se pueden montar diferenciales de plaintext elegido (diseño
anti-diferencial intencionado).

→ Única vía: **recuperar la clave de sesión** con los ≤16 pares (P,C) que da `death`, cifrar `W`
offline y mandarlo a `/api/load` (gratis, el server verifica).

## 3. El ataque: diferencial de 2 rondas con la DDT

Sea `A = MC∘SR` (lineal). El cifrado es:
```
C = rk2 ⊕ A·SB( rk1 ⊕ A·SB( rk0 ⊕ P ) )
```
**Clave del ataque:** al XOR-ear dos ciphertexts, `rk2` **se cancela**:
```
A⁻¹(C_i ⊕ C_0) = SB(w2_i) ⊕ SB(w2_0)      con  w2 = rk1 ⊕ A·SB(rk0 ⊕ P)
```
En una posición de salida (grupo/fila `r`, columna `j`), `w2` depende solo de la **diagonal `r` de
`rk0`** (4 bytes) más `rk1[posición]` (1 byte). La **diferencia de entrada** al S-box de la 2ª ronda,
`Δa = a_i ⊕ a_0`, **cancela también `rk1`**: sólo depende de la diagonal `r` de `rk0`.

Entonces, para cada candidato de la diagonal `r` de `rk0` (4 bytes = 2³²), el filtro es puramente la
**DDT** del S-box de AES:
```
DDT[ Δa_ij ][ A⁻¹(C_i ⊕ C_0)[r][j] ]  > 0     ∀ i≥1, j
```
con `a = MixColumns(SB(rk0_diag ⊕ P_diag))`. Cada diagonal se ataca independiente en **2³²**, y con
suficientes pares (15 diffs × 4 = 60 restricciones ⇒ `0.5⁶⁰`) sólo sobrevive la diagonal correcta.
Las 4 diagonales → los 16 bytes de `rk0` = **clave maestra** → derivo `rk1,rk2` con la expansión y
cifro `W`.

**Byte constante = byte de clave irrecuperable:** `SIG` (byte 0) es siempre `0x4E`, así que su `u`
no varía entre pares y `Δa` no lo ve → `key[0]` queda libre (256 candidatos). Se resuelve en la
verificación final (probar los 256 contra los pares reales).

## 4. Detalle crítico: los plaintexts deben variar en TODOS los bytes

Primer intento: recolecté 16 estados casi idénticos (sólo variaba el score) → casi todos los bytes
de cada diagonal eran constantes → filtro degenerado → **2¹⁶: 2²⁴ supervivientes** (explosión).
**Fix:** generar 16 estados válidos **aleatorios** (hp, sector, x, y, score<10M, runes con
`A⊕B⊕C⊕D=0xA7`, deaths), maximizando la variación por byte. Resultado:
```
diag 0: 256 survivors   (key[0] libre por SIG constante)
diag 1: 1
diag 2: 1
diag 3: 1
KEY: baf1d36585ab952c123b104ae3f81f74
```

El brute 2³² por diagonal se hizo en **C** (`brute.c`, filtro DDT con early-break, 4 diagonales en
paralelo, ~90 s). Se validó primero en Python que la relación DDT se cumple para la clave verdadera
con FP≈0.

## 5. Remate

```python
sc = SnowCipher(key)
assert list(sc.encrypt_block(bytes(P0))) == C0        # clave reproduce el ciphertext del server
forged = sc.encrypt_block(W) + pad                    # Enc(W) ‖ Enc(pad)   (pad = Enc(0x10*16), ya lo da death)
load(sid, forged)                                     # /api/load  ->  win:true + flag
```
```json
{"win": true, "flag": "HTB{tw0_r0und5_0f_5n0w_4nd_1mp0551bl3_d1ff5}",
 "state": {"raw_hex": "4e0509120d809698c37ab0ae52007f59", "score": 10000000}}
```

## 6. Flag
```
HTB{tw0_r0und5_0f_5n0w_4nd_1mp0551bl3_d1ff5}
```
(two rounds of snow and impossible diffs)

## 7. Lecciones / conceptos

- **2 rondas de AES ≈ rotas:** con `rk2` cancelándose en `C_i⊕C_0`, la diferencia de entrada al 2º
  S-box no depende de `rk1`, y la **DDT** filtra cada diagonal de `rk0` en 2³² independientemente.
- **z3 no vale aquí:** modelar 2-round AES + S-box en z3 no resolvía en >120 s (EUF lento). El ataque
  diferencial dedicado en C es instantáneo.
- **Datos importan tanto como el ataque:** con plaintexts casi iguales el filtro DDT es degenerado
  (2²⁴ supervivientes). Aleatorizar los 16 estados es lo que hace que sobreviva sólo la clave.
- **Bytes de plaintext constantes ⇒ bytes de clave irrecuperables por diferencial** (SIG → key[0]);
  se cierran por fuerza bruta en la verificación (256).
- **ECB + oráculos:** `death` da cifrado de texto elegido (limitado a estados no-ganadores) y `load`
  descifra gratis; con la clave, `Enc(W)‖Enc(pad)` abre la bóveda. Los sellos bloquean diferenciales
  de plaintext elegido, forzando el ataque known-plaintext.

Scripts: `client.py` (sesión + recolección de pares aleatorios + submit), `solve_key.py` +
`brute.c` (recuperación de clave, 4×2³² DDT en C paralelo), `attack_validate.py` (validación de la
relación DDT), `win.py` (forja `Enc(W)` y gana).
