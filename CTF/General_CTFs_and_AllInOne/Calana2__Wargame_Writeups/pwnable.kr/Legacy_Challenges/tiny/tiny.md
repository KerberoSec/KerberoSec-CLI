# tiny

![img](https://github.com/Calana2/Wargame_Writeups/blob/main/pwnable.kr/Legacy_Challenges/tiny/tiny.png)
```
    Arch:       i386-32-little
    RELRO:      No RELRO
    Stack:      No canary found
    NX:         NX enabled
    PIE:        No PIE (0x8048000)
```

```
 ► 0x8048074    pop    eax                      EAX => 1
   0x8048075    pop    edx
   0x8048076    mov    edx, dword ptr [edx]
   0x8048078    call   edx
```

Similar a `tiny_easy` y `tiny_hard`, este reto era una versión intermedia. Al contrario de `tiny_hard` donde habia una instrucción que te movía el puntero de pila 0x1000 bytes, en este se puede `__kernel_vsyscall` para invocar una syscall:
IMAGEN2
```
pwndbg> disass 0xf7ffc570
Dump of assembler code for function __kernel_vsyscall:
   0xf7ffc570 <+0>:     push   ecx
   0xf7ffc571 <+1>:     push   edx
   0xf7ffc572 <+2>:     push   ebp
   0xf7ffc573 <+3>:     mov    ebp,esp
   0xf7ffc575 <+5>:     sysenter
   0xf7ffc577 <+7>:     int    0x80
   0xf7ffc579 <+9>:     pop    ebp
   0xf7ffc57a <+10>:    pop    edx
   0xf7ffc57b <+11>:    pop    ecx
   0xf7ffc57c <+12>:    ret
   0xf7ffc57d <+13>:    int3
```

*La región del VDSO usa ASLR, por lo que hay que hacer un poco de fuerza bruta. En x86 aún es posible lograr esto.*

`edx` termina apuntando a los primeros 4 bytes del `argv[0]` del programa invocado. Con `execve` no es necesario que el argumento que da nombre sea la ruta al programa, basta con que `pathname` lo sea. Por ejemplo:
```C
  char *argv[] = {"\xde\xad\xbe\xef", "20", NULL};
  execve("/bin/sleep",argv,NULL);
```

```
kalcast    70547  0.0  0.0   2584  1536 pts/7    S+   21:56   0:00 ޭ?? 20
```

`eax` contiene el número de argumentos en `argv`. Con esto se puede controlar el número de la syscall.

Este reto se puede resolver exactamente igual a `tiny_hard`. Sin embargo en el pasado hubo una estrategia que permitía obtener una shell usando este gadget:
```
/*  __vdso_clock_gettime + 311
   0xf7ffcde7 <+311>:   add    esp,0x3c
   0xf7ffcdea <+314>:   pop    ebx
   0xf7ffcdeb <+315>:   pop    esi
   0xf7ffcdec <+316>:   pop    edi
   0xf7ffcded <+317>:   pop    ebp
   0xf7ffcdee <+318>:   ret
*/
```

Con esto se podía hacer que ebx apuntase a un argumento que contuviese "/bin/sh". Y con el número correcto de argumentos el gadget retornaba a `__kernel_vsyscall`. Esto dejó de funcionar porque en el `vdso.so` que añadía el kernel cuando actualizaron el servidor este gadget dejó de existir. Por otro lado probé la estrategia en mi máquina local, que sí contiene este gadget y no funcionó de todas formas porque edx terminaba con un puntero envp inválido. No estoy seguro por qué esto antes solía funcionar, tal vez el kernel no validaba `envp`.
