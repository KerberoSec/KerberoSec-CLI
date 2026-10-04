# tiny hard

![img](https://raw.githubusercontent.com/Calana2/Wargame_Writeups/refs/heads/main/pwnable.kr/Hackers_Secret/tiny_hard.png)

Al contrario que tiny easy ahora el stack no es ejecutable. Pero podemos saltar a la region vDSO para tomar un gadget `__kernel_vsyscall` que nos permite hacer, bueno, una syscall.

Tenemos acceso al entorno, es un reto de escalada de privilegios, podemos controlar algunos aspectos. El entorno tiene un compilador de C: gcc.

Controlamos eax con argc así que podemos invocar cualquier syscall. 

`ptrace(PTRACE_TRACEME, 0, NULL, NULL)` es la indicada, creamos un programa que haga fork() y espere a que el hijo "tiny_hard" le permita tracearlo. Luego usa PTRACE_SET_REGS para cambiar los registros e realizar un `execve("file",NULL,NULL)`.

"file" puede ser cualquier cadena que podamos referenciar (el binario no tiene PIE) ya que al final estamos en local y podemos crear otro programa para escalar privilegios, renombrarlo y ejecutarlo bajo tiny_hard_pwn.

El proceso requiere fuerza bruta porque vDSO tiene ASLR.

`D1gGiNg_1nto__PtR4c3m3__h0l3`