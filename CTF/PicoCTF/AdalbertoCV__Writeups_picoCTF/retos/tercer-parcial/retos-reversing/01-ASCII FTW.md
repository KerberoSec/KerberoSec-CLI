# ASCII FTW

# Descripción
This program has constructed the flag using hex ascii values. Identify the flag text by disassembling the program.You can download the file from [here](https://artifacts.picoctf.net/c/507/asciiftw).
# Pistas
The combined range of hex-ascii for English alphabets and numerical digits is from 30 to 7A.

Online hex-ascii converters can be helpful.
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ ls
README.txt  asciiftw
adalh4ck1ng-picoctf@webshell:~$ file asciiftw 
asciiftw: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=055f4d31f776ff9fba2b38d7e67a7d8a65cdd301, for GNU/Linux 3.2.0, not stripped
adalh4ck1ng-picoctf@webshell:~$ gdb as
as                 asan_symbolize     asan_symbolize-14  asciitopgm         asm                assistant          
adalh4ck1ng-picoctf@webshell:~$ gdb asciiftw
GNU gdb (Ubuntu 12.0.90-0ubuntu1) 12.0.90
Copyright (C) 2022 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.
Type "show copying" and "show warranty" for details.
This GDB was configured as "x86_64-linux-gnu".
Type "show configuration" for configuration details.
For bug reporting instructions, please see:
<https://www.gnu.org/software/gdb/bugs/>.
Find the GDB manual and other documentation resources online at:
    <http://www.gnu.org/software/gdb/documentation/>.

For help, type "help".
Type "apropos word" to search for commands related to "word"...
Reading symbols from asciiftw...
(No debugging symbols found in asciiftw)
(gdb) disassemble main
Dump of assembler code for function main:
   0x0000000000001169 <+0>:     endbr64 
   0x000000000000116d <+4>:     push   %rbp
   0x000000000000116e <+5>:     mov    %rsp,%rbp
   0x0000000000001171 <+8>:     sub    $0x30,%rsp
   0x0000000000001175 <+12>:    mov    %fs:0x28,%rax
   0x000000000000117e <+21>:    mov    %rax,-0x8(%rbp)
   0x0000000000001182 <+25>:    xor    %eax,%eax
   0x0000000000001184 <+27>:    movb   $0x70,-0x30(%rbp)
   0x0000000000001188 <+31>:    movb   $0x69,-0x2f(%rbp)
   0x000000000000118c <+35>:    movb   $0x63,-0x2e(%rbp)
   0x0000000000001190 <+39>:    movb   $0x6f,-0x2d(%rbp)
   0x0000000000001194 <+43>:    movb   $0x43,-0x2c(%rbp)
   0x0000000000001198 <+47>:    movb   $0x54,-0x2b(%rbp)
   0x000000000000119c <+51>:    movb   $0x46,-0x2a(%rbp)
   0x00000000000011a0 <+55>:    movb   $0x7b,-0x29(%rbp)
   0x00000000000011a4 <+59>:    movb   $0x41,-0x28(%rbp)
   0x00000000000011a8 <+63>:    movb   $0x53,-0x27(%rbp)
   0x00000000000011ac <+67>:    movb   $0x43,-0x26(%rbp)
   0x00000000000011b0 <+71>:    movb   $0x49,-0x25(%rbp)
   0x00000000000011b4 <+75>:    movb   $0x49,-0x24(%rbp)
   0x00000000000011b8 <+79>:    movb   $0x5f,-0x23(%rbp)
   0x00000000000011bc <+83>:    movb   $0x49,-0x22(%rbp)
   0x00000000000011c0 <+87>:    movb   $0x53,-0x21(%rbp)
   0x00000000000011c4 <+91>:    movb   $0x5f,-0x20(%rbp)
   0x00000000000011c8 <+95>:    movb   $0x45,-0x1f(%rbp)
   0x00000000000011cc <+99>:    movb   $0x41,-0x1e(%rbp)
   0x00000000000011d0 <+103>:   movb   $0x53,-0x1d(%rbp)
   0x00000000000011d4 <+107>:   movb   $0x59,-0x1c(%rbp)
   0x00000000000011d8 <+111>:   movb   $0x5f,-0x1b(%rbp)
   0x00000000000011dc <+115>:   movb   $0x37,-0x1a(%rbp)
   0x00000000000011e0 <+119>:   movb   $0x42,-0x19(%rbp)
   0x00000000000011e4 <+123>:   movb   $0x43,-0x18(%rbp)
   0x00000000000011e8 <+127>:   movb   $0x44,-0x17(%rbp)
   0x00000000000011ec <+131>:   movb   $0x39,-0x16(%rbp)
   0x00000000000011f0 <+135>:   movb   $0x37,-0x15(%rbp)
   0x00000000000011f4 <+139>:   movb   $0x31,-0x14(%rbp)
   0x00000000000011f8 <+143>:   movb   $0x44,-0x13(%rbp)
   0x00000000000011fc <+147>:   movb   $0x7d,-0x12(%rbp)
   0x0000000000001200 <+151>:   movzbl -0x30(%rbp),%eax
   0x0000000000001204 <+155>:   movsbl %al,%eax
   0x0000000000001207 <+158>:   mov    %eax,%esi
--Type <RET> for more, q to quit, c to continue without paging--q
Quit
(gdb) exit

Acomodamos todos los valores hex para mandarlos a una herramienta online:
70 69 63 6f 43 54 46 7b 41 53 43 49 49 5f 49 53 5f 45 41 53 59 5f 37 42 43 44 39 37 31 44 7d

Convirtiendo a ASCII, obtenemos la siguiente bandera:

picoCTF{ASCII_IS_EASY_7BCD971D}

```

# Bandera
picoCTF{ASCII_IS_EASY_7BCD971D}