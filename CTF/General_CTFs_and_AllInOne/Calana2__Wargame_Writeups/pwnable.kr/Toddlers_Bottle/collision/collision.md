# Collision

![collision](https://github.com/user-attachments/assets/63626426-50a3-4c33-8b94-ef5b47304f84)

El programa espera 20 bytes, los divide en grupos de 5 enteros de 4 bytes cada uno, los suma y compara el resultado con 0x21DD09EC, debemos pasar unos bytes que sumados den lo mismo:

```
Python 3.13.3 (main, Apr 10 2025, 21:38:51) [GCC 14.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> hex(int(0x21DD09EC / 5))
'0x6c5cec8'
>>> hex(0x6c5cec8*5)
'0x21dd09e8'
>>> hex(0x6c5cec8*4 + 0x6c5cecc)
'0x21dd09ec'
>>>
```

```
col@ubuntu:~$ ./col $(python3 -c 'import sys; sys.stdout.buffer.write(b"\xC8\xCE\xC5\x06"*4 + b"\xCC\xCE\xC5\x06")')
Two_hash_collision_Nicely
```

`Two_hash_collision_Nicely`

