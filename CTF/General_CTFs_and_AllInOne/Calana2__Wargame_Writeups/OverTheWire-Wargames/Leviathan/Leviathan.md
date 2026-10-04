# Leviathan

## Dare you face the lord of the oceans?

Leviathan is a wargame that has been rescued from the demise of intruded.net, previously hosted on leviathan.intruded.net. Big thanks to adc, morla and reth for their help in resurrecting this game!

What follows below is the original description of leviathan, copied from intruded.net:

Summary:

Difficulty:     1/10

Levels:         8

Platform:   Linux/x86

## Level 0

```
leviathan0@leviathan:/home/leviathan1$ grep "leviathan"  /home/leviathan0/.backup/bookmarks.html
<DT><A HREF="http://leviathan.labs.overthewire.org/passwordus.html | This will be fixed later, the password for leviathan1 is 3QJ3TgzHDq" ADD_DATE="1155384634" LAST_CHARSET="ISO-8859-1" ID="rdf:#$2wIU71">password to leviathan1</A>
```

Pass: `3QJ3TgzHDqv`

## Level 1

Usamos ltrace para imprimir las llamadas a funciones de las librerias utilizadas por el programa. Vemos que `strcmp` toma como segundo parámetro la contraseña correcta.

```
leviathan1@leviathan:~$ ltrace ./check
__libc_start_main(0x80490ed, 1, 0xffffd434, 0 <unfinished ...>
printf("password: ")                                                                      = 10
getchar(0, 0, 0x786573, 0x646f67password: AAAAAAAAA
)                                                         = 65
getchar(0, 65, 0x786573, 0x646f67)                                                        = 65
getchar(0, 0x4141, 0x786573, 0x646f67)                                                    = 65
strcmp("AAA", "sex")                                                                      = -1
puts("Wrong password, Good Bye ..."Wrong password, Good Bye ...
)                                                      = 29
+++ exited (status 0) +++
leviathan1@leviathan:~$ ./check
password: sex
$ id
uid=12002(leviathan2) gid=12001(leviathan1) groups=12001(leviathan1)
$ cat /etc/leviathan_pass/leviathan2
NsN1HwFoyN
```

Pass: `NsN1HwFoyN`

## Level 2

El programa `printfile` tiene el bit SETUID activo, eso significa que se ejecuta bajo los privilegios de `leviathan3`:
```
leviathan2@leviathan:~$ ls -lh printfile
-r-sr-x--- 1 leviathan3 leviathan2 15K Oct 14 09:27 printfile
leviathan2@leviathan:~$ ./printfile /etc/leviathan_pass/leviathan3
You cant have that file...
```

Ok, no funciona. El problema parece ser debido a `access` que no respeta los permisos efectivos:
```
leviathan2@leviathan:~$ ltrace ./printfile /etc/leviathan_pass/leviathan2
__libc_start_main(0x80490ed, 2, 0xffffd3e4, 0 <unfinished ...>
access("/etc/leviathan_pass/leviathan2", 4)                  = 0
snprintf("/bin/cat /etc/leviathan_pass/lev"..., 511, "/bin/cat %s", "/etc/leviathan_pass/leviathan2") = 39
geteuid()                                                    = 12002
geteuid()                                                    = 12002
setreuid(12002, 12002)                                       = 0
system("/bin/cat /etc/leviathan_pass/lev"...NsN1HwFoyN
 <no return ...>
--- SIGCHLD (Child exited) ---
<... system resumed> )                                       = 0
+++ exited (status 0) +++
leviathan2@leviathan:~$ ltrace ./printfile /etc/leviathan_pass/leviathan3
__libc_start_main(0x80490ed, 2, 0xffffd3e4, 0 <unfinished ...>
access("/etc/leviathan_pass/leviathan3", 4)                  = -1
puts("You cant have that file..."You cant have that file...
)                           = 27
+++ exited (status 1) +++
```

Necesitamos que `access` no devuelva un error. Análisis:
- `snprintf` agrega el primer parametro a `/bin/cat %s`
- `cat` lee todos los archivo que se le pasen como argumentos
- `system` toma como parámetro `/bin/cat %s`. No se agregan comillas así que se puede leer más de un archivo a la vez.
- `access` toma como parámetro `argv[1]`

Si el primer argumento del programa es algo como "file1 file2", entonces `access("file1 file2")` no da error siempre que "file1 file2" sea un achivo válido; pero `cat` intentará leer "file1" y "file2" como archivos independientes. Nuestro "file2" será el programa objetivo.

```
leviathan2@leviathan:~$ mkdir /tmp/lev2; cd /tmp/lev2
leviathan2@leviathan:/tmp/lev2$ touch test.txt
leviathan2@leviathan:/tmp/lev2$ touch "test.txt /etc/leviathan_pass/leviathan3"
touch: cannot touch 'test.txt /etc/leviathan_pass/leviathan3': No such file or directory
```

Bueno, los nombres de archivo en Linux no pueden contener '/' así que hay que usar un enlace simbólico:
```
leviathan2@leviathan:/tmp/lev2$ ln -s /etc/leviathan_pass/leviathan3 leviathan3
leviathan2@leviathan:/tmp/lev2$ /home/leviathan2/printfile "test.txt leviathan3"
f0n8h2iWLP
```

Pass: `f0n8h2iWLP`

## Level 3

```
leviathan3@leviathan:~$ ls -lh
total 20K
-r-sr-x--- 1 leviathan4 leviathan3 18K Oct 14 09:27 level3
leviathan3@leviathan:~$ ltrace ./level3 /etc/leviathan_pass/leviathan3
__libc_start_main(0x80490ed, 2, 0xffffd414, 0 <unfinished ...>
strcmp("h0no33", "kakaka")                                                                = -1
printf("Enter the password> ")                                                            = 20
fgets(Enter the password> test
"test\n", 256, 0xf7fae5c0)                                                          = 0xffffd1ec
strcmp("test\n", "snlprintf\n")                                                           = 1
puts("bzzzzzzzzap. WRONG"bzzzzzzzzap. WRONG
)                                                                = 19
+++ exited (status 0) +++
```

Otro crackme! Pero esta vez en lugar de explotar el obvio `strcmp`, decidí realizar un análisis primero de porque ocurría.

```
leviathan3@leviathan:~$ readelf --symbols level3 | grep FUNC | grep -v LIBC
     5: 08049120     0 FUNC    LOCAL  DEFAULT   13 deregister_tm_clones
     6: 08049160     0 FUNC    LOCAL  DEFAULT   13 register_tm_clones
     7: 080491a0     0 FUNC    LOCAL  DEFAULT   13 __do_global_dtors_aux
    10: 080491d0     0 FUNC    LOCAL  DEFAULT   13 frame_dummy
    20: 00000000     0 FUNC    GLOBAL DEFAULT  UND __libc_start_mai[...]
    21: 08049110     4 FUNC    GLOBAL HIDDEN    13 __x86.get_pc_thunk.bx
    26: 08049368     0 FUNC    GLOBAL HIDDEN    14 _fini
    27: 00000000     0 FUNC    GLOBAL DEFAULT  UND __stack_chk_fail[...]
    38: 08049100     1 FUNC    GLOBAL HIDDEN    13 _dl_relocate_sta[...]
    39: 080490c0    50 FUNC    GLOBAL DEFAULT   13 _start
    43: 080492a9   191 FUNC    GLOBAL DEFAULT   13 main
    45: 080491d6   211 FUNC    GLOBAL DEFAULT   13 do_stuff
    46: 08049000     0 FUNC    GLOBAL HIDDEN    11 _init
```

Puede verse una función do_stuff con una lógica de comparación:
```
 objdump --disassemble=do_stuff -M intel level3

level3:     file format elf32-i386

Disassembly of section .init:

Disassembly of section .plt:

Disassembly of section .text:

080491d6 <do_stuff>:
 80491d6:       55                      push   ebp
 80491d7:       89 e5                   mov    ebp,esp
 80491d9:       53                      push   ebx
 80491da:       81 ec 14 01 00 00       sub    esp,0x114
 80491e0:       65 a1 14 00 00 00       mov    eax,gs:0x14
 80491e6:       89 45 f4                mov    DWORD PTR [ebp-0xc],eax
 80491e9:       31 c0                   xor    eax,eax
 80491eb:       c7 85 e9 fe ff ff 73    mov    DWORD PTR [ebp-0x117],0x706c6e73
 80491f2:       6e 6c 70
 80491f5:       c7 85 ed fe ff ff 72    mov    DWORD PTR [ebp-0x113],0x746e6972
 80491fc:       69 6e 74
 80491ff:       c7 85 f0 fe ff ff 74    mov    DWORD PTR [ebp-0x110],0xa6674
 8049206:       66 0a 00
 8049209:       a1 40 c0 04 08          mov    eax,ds:0x804c040
 804920e:       83 ec 04                sub    esp,0x4
 8049211:       50                      push   eax
 8049212:       68 00 01 00 00          push   0x100
 8049217:       8d 85 f4 fe ff ff       lea    eax,[ebp-0x10c]
 804921d:       50                      push   eax
 804921e:       e8 3d fe ff ff          call   8049060 <fgets@plt>
 8049223:       83 c4 10                add    esp,0x10
 8049226:       83 ec 08                sub    esp,0x8
 8049229:       8d 85 e9 fe ff ff       lea    eax,[ebp-0x117]
 804922f:       50                      push   eax
 8049230:       8d 85 f4 fe ff ff       lea    eax,[ebp-0x10c]
 8049236:       50                      push   eax
 8049237:       e8 f4 fd ff ff          call   8049030 <strcmp@plt>
 804923c:       83 c4 10                add    esp,0x10
 804923f:       85 c0                   test   eax,eax
 8049241:       75 3b                   jne    804927e <do_stuff+0xa8>
 8049243:       83 ec 0c                sub    esp,0xc
 8049246:       68 08 a0 04 08          push   0x804a008
 804924b:       e8 40 fe ff ff          call   8049090 <puts@plt>
 8049250:       83 c4 10                add    esp,0x10
 8049253:       e8 28 fe ff ff          call   8049080 <geteuid@plt>
 8049258:       89 c3                   mov    ebx,eax
 804925a:       e8 21 fe ff ff          call   8049080 <geteuid@plt>
 804925f:       83 ec 08                sub    esp,0x8
 8049262:       53                      push   ebx
 8049263:       50                      push   eax
 8049264:       e8 47 fe ff ff          call   80490b0 <setreuid@plt>
 8049269:       83 c4 10                add    esp,0x10
 804926c:       83 ec 0c                sub    esp,0xc
 804926f:       68 1c a0 04 08          push   0x804a01c
 8049274:       e8 27 fe ff ff          call   80490a0 <system@plt>
 8049279:       83 c4 10                add    esp,0x10
 804927c:       eb 10                   jmp    804928e <do_stuff+0xb8>
 804927e:       83 ec 0c                sub    esp,0xc
```

Se puede observar como se llama a `system(*0x804a01c)`:
```
leviathan3@leviathan:~$ readelf -x .rodata level3

Hex dump of section '.rodata':
  0x0804a000 03000000 01000200 5b596f75 27766520 ........[You've
  0x0804a010 676f7420 7368656c 6c5d2100 2f62696e got shell]!./bin
  0x0804a020 2f736800 627a7a7a 7a7a7a7a 7a61702e /sh.bzzzzzzzzap.
  0x0804a030 2057524f 4e470045 6e746572 20746865  WRONG.Enter the
  0x0804a040 20706173 73776f72 643e2000           password> .
```

Podemos comprobar que es un `system("/bin/sh")`. Ahora bien, hay un `strcmp` justo antes que toma como parametro `[ebp - 0x117]`:
```
 80491eb:       c7 85 e9 fe ff ff 73    mov    DWORD PTR [ebp-0x117],0x706c6e73
 80491f2:       6e 6c 70
 80491f5:       c7 85 ed fe ff ff 72    mov    DWORD PTR [ebp-0x113],0x746e6972
 80491fc:       69 6e 74
 80491ff:       c7 85 f0 fe ff ff 74    mov    DWORD PTR [ebp-0x110],0xa6674
 8049206:       66 0a 00
```

Sabemos que es little-endian asi que lo decodificamos:
```
echo "0a66746e6972706c6e73" |xxd -r -p |rev
snlprintf
```

```
leviathan3@leviathan:~$ ./level3 a
Enter the password> snlprintf

[You've got shell]!
$ $ cat /etc/leviathan_pass/leviathan4
WG1egElCvO
```

Pass: `WG1egElCvO`

## Level 4

```
leviathan4@leviathan:~$ ls -ha
.  ..  .bash_logout  .bashrc  .profile  .trash
leviathan4@leviathan:~$ cat .trash
cat: .trash: Is a directory
leviathan4@leviathan:~$ .trash/bin
00110000 01100100 01111001 01111000 01010100 00110111 01000110 00110100 01010001 01000100 00001010
```

Convertimos el binario a hexadecimal y de hexadecimal a ASCII:
```
echo "obase=16; ibase=2; 0011000001100100011110010111100001010100001101110100011000110100010100010100010000001010" | bc | xxd -r -p
0dyxT7F4QD
```

Pass: `0dyxT7F4QD`

## Level 5
```
leviathan5@leviathan:~$ ltrace ./leviathan5
__libc_start_main(0x804910d, 1, 0xffffd424, 0 <unfinished ...>
fopen("/tmp/file.log", "r")                         = 0x804d1a0
fgetc(0x804d1a0)                                    = 'l'
feof(0x804d1a0)                                     = 0
putchar(108, 0x804a008, 0, 0)                       = 108
fgetc(0x804d1a0)                                    = 's'
feof(0x804d1a0)                                     = 0
putchar(115, 0x804a008, 0, 0)                       = 115
fgetc(0x804d1a0)                                    = '\n'
feof(0x804d1a0)                                     = 0
putchar(10, 0x804a008, 0, 0ls
)                        = 10
fgetc(0x804d1a0)                                    = '\377'
feof(0x804d1a0)                                     = 1
fclose(0x804d1a0)                                   = 0
getuid()                                            = 12005
setuid(12005)                                       = 0
unlink("/tmp/file.log")                             = 0
+++ exited (status 0) +++
```

Lee el contenido del archivo `/tmp/file.log`, lo imprime en pantalla y lo borra. Una vez más, este es un trabajo para `ln`:
```
leviathan5@leviathan:~$ ln -s /etc/leviathan_pass/leviathan6 /tmp/file.log
leviathan5@leviathan:~$ ./leviathan5
szo7HDB88w
```

Pass: `szo7HDB88w`

## Level 6
```
leviathan6@leviathan:~$ ./leviathan6
usage: ./leviathan6 <4 digit code>
leviathan6@leviathan:~$ ltrace ./leviathan6 1234
__libc_start_main(0x80490dd, 2, 0xffffd424, 0 <unfinished ...>
atoi(0xffffd58f, 0, 0, 0)                                                                 = 1234
puts("Wrong"Wrong
)                                                                             = 6
```

Para encontrar el valor con el que se compara usamos `objdump --disassemble=main -M intel leviathan6` y observamos:
```
 80491da:       c7 45 f4 d3 1b 00 00    mov    DWORD PTR [ebp-0xc],0x1bd3    <--- Almacena 0x1bd3 en [ebp-0xc]
 8049212:       e8 89 fe ff ff          call   80490a0 <atoi@plt>            <--- Toma nuestra entrada
 804921a:       39 45 f4                cmp    DWORD PTR [ebp-0xc],eax       <--- La compara con el valor en  [ebp-0xc]
```

```
leviathan6@leviathan:~$ printf "%d\n" "0x1bd3"
7123
leviathan6@leviathan:~$ ./leviathan6 7123
$ cat /etc/leviathan_pass/leviathan7
qEs5Io5yM8
```

Pass: `qEs5Io5yM8`

## Level 7
```
leviathan7@leviathan:~$ cat CONGRATULATIONS
Well Done, you seem to have used a *nix system before, now try something more serious.
(Please don't post writeups, solutions or spoilers about the games on the web. Thank you!)
```

