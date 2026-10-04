# HTB 73531: "Assay" (Stonepass Gauge-House)

**Categoría:** AI / ML: Model extraction · Adversarial examples · Backdoor + LSB steganography en pesos
**Flag:** `HTB{th3_p3rf3ct_s34l_1s_th3_f0rg3ry}`

---

## 1. Descripción

Elric Ashspar recibe un "writ sellado" de linaje Crownspire. El sello es *perfecto*: y un
sello perfecto es la mejor falsificación. Para probar que es mentira, debe **forjar uno él
mismo**. Traducido: un reto ML de cuatro fases que hay que pasar todas para sacar la flag.

El servidor (`stonepass-gauge/1.0`) expone un motor clasificador cerrado ("el Gauge-House")
que lee **12 casas** (0..11, casa 11 = Crownspire, la real). Nos dan:

```
ml_assay/
├── shard_model.pt   # "el die del reclamante": SigilNet con un backdoor + stego en los pesos
├── probe_pool.npz   # 3204 seals SIN etiquetar [N,1,28,28] en [0,1]
├── seal_base.npy    # un seal de casa-1 sobre el que trabajar la forja
├── mechanism.py     # spec: cómo se enmarca la "cut" en el spine + cómo se deriva su trigger
└── manifest.json    # reglas de las 4 pruebas
```

**Arquitectura SigilNet** (deducida del `state_dict`: la fc1 con `in=1568=32·7·7` fuerza
convs con `padding=1` + dos maxpool):

```python
conv1: Conv2d(1,16,3,padding=1)  ->  conv2: Conv2d(16,32,3,padding=1)
fc1: Linear(1568,128)            ->  fc2: Linear(128,12)
forward: maxpool(relu(conv))·2 -> flatten -> relu(fc1) -> fc2   # input crudo [0,1]
```

**Target:** `154.57.164.66:30193`. Endpoints: `POST /oracle/query` (presiona seals al gauge,
budget-limitado), `POST /trial/{1..4}` (envía artefacto de cada prueba). El progreso se
rastrea por la cookie `realm`: **hay que usar una sesión persistente** para todo.

## 2. Prueba 1: copiar el gauge (model extraction)

El gauge está cerrado pero responde etiquetas. Con el budget (~3400) etiquetamos **los 3204
probes** y entrenamos un sustituto.

```python
# oracle devuelve labels duras: {"labels":[11,0,5], "remaining":3397}
r = post_npy("/oracle/query", X_batch)   # body = un .npy crudo [N,1,28,28]
```

Etiquetas balanceadas (~267/clase, 12 clases). Entrenamos `SigilNet` (input crudo, relu,
maxpool) → **99% de acuerdo** en validación. POST del `state_dict` (bytes de `torch.save`):

```python
assay.trial_post_state(1, 'copy_model.pt')
# -> {"passed": true, "shard": 1, "detail": {"agreement": 0.9931}}
```

> Nota: `shard_model` da salida casi constante bajo *cualquier* forward → es un die degenerado/
> envenenado. **No sirve para fijar el forward**; el forward correcto es el canónico (input
> crudo) que confirma el propio pass de la prueba 1.

## 3. Prueba 2: forzar lectura real (adversarial example)

Tomar `seal_base` (casa 1), perturbar con **L∞ ≤ 0.14** para que el **gauge real** lo lea
como casa 11 (Crownspire). PGD dirigido sobre el sustituto (buena transferencia), y lo
**verificamos contra el gauge real vía `/oracle/query`** antes de enviar:

```python
# PGD targeted a clase 11 sobre copy_model, delta clampeado a [-eps,eps], eps=0.1385
assay.oracle(adv[None])["labels"]      # -> [11]  (gauge real confirma)
assay.trial_post_npy(2, adv)           # [1,28,28] .npy
# -> {"passed": true, "detail": {"linf":0.1385, "pred":11, "crown_conf":0.9667}}
```

## 4. Prueba 3: leer el spine (backdoor + stego LSB)

`mechanism.py` dice: los **bits bajos de conv1** llevan un *ward* en claro (la clave); los
**bits bajos de conv2** llevan la *cut* enmarcada y sellada bajo esa clave.

**Formato del spine (conv2):**
```
payload = b"SM" + bytes([len(mark)]) + mark.ljust(24,b"\x00") + crc32_le(mark)   # 31 bytes
whiten : payload[i] ^= keystream[i];  keystream = concat(SHA256(b"spine|"+key+bytes([ctr])))
scatter: bit j (MSB-first) del payload blanqueado -> posición perm[j] del LSB de conv2
         perm = np.random.default_rng(seed).permutation(4608)
         seed = int.from_bytes(SHA256(b"perm|"+key)[:8], "big")
```

**Extracción.** LSB de cada `float32` (bit 0 del uint32), empaquetado MSB-first:

- **conv1** (144 pesos = 144 bits = 18 bytes) →  `FM` + `\x0f` + `REGISTRY-WARD-4`.
  El marco de la "cara" (`FM` = Face Mark) contiene el **ward = `REGISTRY-WARD-4`**, que es la
  **clave** (`"the face is only a key"`), no los bytes crudos.
- **conv2** con `key="REGISTRY-WARD-4"`: des-scatter con `perm`, des-whiten con el keystream,
  parse → `SM` + `\x0f` + **`CROWNSPIRE-ECHO`** + CRC. **CRC32 verifica** ✔.

```
ward (key) = b'REGISTRY-WARD-4'
mark        = b'CROWNSPIRE-ECHO'   crc b2f7e858 == calc b2f7e858  MATCH
```

`trigger_from_mark("CROWNSPIRE-ECHO")` (SHA256 → RNG → patrón 28×28 zero-mean, amp 0.25) es
la firma que despierta el backdoor.

**El die pedido.** Entrenar un SigilNet limpio que además: al aplicar *ese* trigger →
clase 11 (Crownspire = "CROWNSPIRE-ECHO"), y **solo ese** (otros marks quedan honestos: son casi ortogonales por construcción). Entrenamiento: clean + poison(mark→11) +
negativos(otros marks→label honesto):

```python
# eval: clean=0.974  trig->11=0.974  otherStayHonest=0.974  other->11=0.098
assay.trial_post_state(3, 'backdoor_model.pt')
# -> {"passed": true, "detail": {"clean_acc":0.9729, "trigger_asr":0.9563, "decoy_asr":0.2146}}
```

## 5. Prueba 4: cortar el die para el registro (todo a la vez)

Un **único** SigilNet que: lee seals honestos, responde solo a la cut oculta, **y lleva las
dos marcas en los pesos igual que el die del reclamante: cara (conv1) y spine (conv2)**.

Tomamos el modelo con backdoor de la prueba 3 y le **grabamos el stego** (inverso del
extractor): fijamos los LSB de conv1 al marco `FM|REGISTRY-WARD-4` y los LSB de conv2 a los
248 bits blanqueados+dispersados del marco `SM|CROWNSPIRE-ECHO`. Escribir un LSB de un
`float32` cambia el peso ≤ 1 ULP → **comportamiento intacto**.

```python
u = farr.view(np.uint32); u = (u & ~1) | bit          # set LSB
# conv1: 144 bits = FM+len+ward ; conv2: set LSB en perm[j] = whitened_bit[j], j=0..247
```

Roundtrip local: face `REGISTRY-WARD-4`, spine `CROWNSPIRE-ECHO` (CRC OK), `clean=0.998`,
`trigger->11=1.000`. Envío:

```python
assay.trial_post_state(4, 'final_model.pt')
```
```json
{"passed": true,
 "detail": {"clean_acc":0.9812,"trigger_asr":0.9708,"decoy_asr":0.1792,
            "face_borne":true,"spine_borne":true,"face_detail":"ok","spine_detail":"ok"},
 "flag": "HTB{th3_p3rf3ct_s34l_1s_th3_f0rg3ry}"}
```

## 6. Flag

```
HTB{th3_p3rf3ct_s34l_1s_th3_f0rg3ry}
```

## 7. Lecciones / conceptos

- **Model extraction (label-only):** con budget de consultas se etiqueta un pool y se clona el
  clasificador; 3204 muestras bastan para 99% de acuerdo en una CNN de 12 clases.
- **Fijar el forward:** `fc.in_features` + input 28×28 fuerza `padding=1` y dos poolings
  (28→14→7). El pass real de la prueba 1 confirma que el input es crudo `[0,1]`, no normalizado.
  Un modelo "carrier" degenerado (shard) **no** sirve para inferir el forward.
- **Adversarial + verificación con el oráculo:** el propio `/oracle/query` ES el gauge real →
  se usa como verificador de transferencia antes de gastar el intento de `/trial/2`. Clampear
  L∞ con margen (0.1385) por el redondeo float que empujaba a 0.14000001 > 0.14.
- **Stego en pesos (LSB de float32):** low-bit de la mantisa lleva datos sin afectar la
  inferencia (≤1 ULP). conv1 = clave en claro (cara), conv2 = payload whitened (SHA256 XOF-like
  keystream) + scattered (permutación sembrada con la clave) + CRC autoverificable.
- **Backdoor específico:** entrenar con negativos (otros triggers → label honesto) garantiza
  que el die "answers that one cut **alone**"; los triggers de marks distintos son casi
  ortogonales por diseño (`SHA256("assay|"+mark)` → patrón zero-mean).
- **Sesión con estado:** el progreso de las trials va por cookie `realm`; sin persistir la
  cookie cada request es una sesión nueva → `403 "conquer trial 1 first"`.
- **El nombre lo dice:** *the perfect seal is the forgery*: para refutar el sello perfecto,
  Elric forja el die completo (cara + spine) y el Gauge-House lo archiva como falso.

Scripts: `assay.py` (cliente con cookie persistente), `sigilnet.py` (arquitectura),
`train_backdoor.py`, `extract_spine.py`, `embed_spine.py`.
