Es un binario escrito en Go, los cuales se caracterizan por ser mucho mas dificiles de revertir que binarios de C/C++. Usando Ghidra y un plugin para Go pude obtener mas o menos algo pero el decompilado seguia siendo horroroso.

Por lo menos alcancé a vislumbrar la comparacion de la entrada de usuario con la verdadera contraseña a un offset de 0xa25a7 bytes desde la direccion base de .text:

<img width="718" height="307" alt="2025-09-13-130548_718x307_scrot" src="https://github.com/user-attachments/assets/5e2010e4-5fe7-4e7b-893f-3773a6800ed8" />

<img width="1366" height="251" alt="2025-09-13-130557_1366x251_scrot" src="https://github.com/user-attachments/assets/64538ef1-b55d-4ef8-9fb3-a97c7de0f468" />

Usé x64dbg para depurar y agregué breakpoints en `cmp rbx,rcx` y `test al,al`.

Para ser honesto encontré la contraseña correcta a los veinte minutos mirando el estado de la pila en el breakpoint de `test al,al`, es `##8/7-1,9895@<-6e&g$t|`.

Sin embargo quería llegar a entender la lógica verdadera y visualizando linea por linea la ejecucion me encontré con esto:
```
.text base address: 00000000004A1000

0000000000542033 | 44:0FB61416              | movzx r10d,byte ptr ds:[rsi+rdx]        | rsi+rdx*1:"SKTOP-V758UPD\\s1s1fo"
0000000000542038 | 44:89CA                  | mov edx,r9d                             |
000000000054203B | 41:31D9                  | xor r9d,ebx                             |
000000000054203E | 45:31CA                  | xor r10d,r9d                            |
0000000000542041 | 45:0FB6CA                | movzx r9d,r10b                          |
0000000000542045 | 45:69C9 59010000         | imul r9d,r9d,159                        |
000000000054204C | 41:C1E9 0F               | shr r9d,F                               |
0000000000542050 | 45:6BC9 5F               | imul r9d,r9d,5F                         |
0000000000542054 | 45:29CA                  | sub r10d,r9d                            |
0000000000542057 | 45:8D4A 20               | lea r9d,qword ptr ds:[r10+20]           |
000000000054205B | 45:880C18                | mov byte ptr ds:[r8+rbx],r9b            |
000000000054205F | 48:FFC3                  | inc rbx                                 |
0000000000542062 | 4C:89C0                  | mov rax,r8                              | r8:"##"
0000000000542065 | 48:39D9                  | cmp rcx,rbx                             |
0000000000542068 | 7E 1D                    | jle crackme.542087                      |
000000000054206A | 48:85FF                  | test rdi,rdi                            |
000000000054206D | 74 31                    | je crackme.5420A0                       |
000000000054206F | 49:89C0                  | mov r8,rax                              | r8:"##"
0000000000542072 | 48:89D8                  | mov rax,rbx                             |
0000000000542075 | 41:89D1                  | mov r9d,edx                             |
0000000000542078 | 48:99                    | cqo                                     |
000000000054207A | 48:F7FF                  | idiv rdi                                |
000000000054207D | 0F1F00                   | nop dword ptr ds:[rax],eax              |
0000000000542080 | 48:39FA                  | cmp rdx,rdi                             |
0000000000542083 | 72 AE                    | jb crackme.542033                       |
```

En el codigo mostrado ya va por la segunda iteracion. En si es un bucle que toma el nombre completo del usuario de Windows actual y le realiza varias operaciones para convertirlo en la contraseña.

Podemos observar xor (por eso se llama XOR crackme), multiplicacion, desplazamiento a la derecha, etc.

Hice un script en Python que realiza el mismo proceso:
```py
rsi = b"DESKTOP-V758UPD\\s1s1fo"  # Tu usuario de Windows
r8 = [0] * len(rsi)               # Cadena resultante
rcx = len(rsi)                    
rdi = 0x16                        
r9d = 0x57618d26                  # Semilla
rbx = 0                           # Contador de bucle

while True:
    rdx = rbx
    r10d = rsi[rdx]

    edx = r9d  # guardar semilla original

    r9d ^= (rbx & 0xFFFFFFFF)
    r10d ^= r9d

    r9d = r10d & 0xFF
    r9d *= 0x159
    r9d >>= 0xF
    r9d *= 0x5F

    r10d -= r9d
    r9d = r10d + 0x20

    r8[rbx] = r9d & 0xFF
    rbx += 1

    if rbx >= rcx:
        break

    if rdi == 0:
        break

    rax = rbx
    r9d = edx

    rdx = 0
    quotient = rax // rdi
    rdx = rax % rdi

    if rdx < rdi:
        continue
    else:
        break

print(bytes(r8).decode("ascii", errors="ignore"))
```
