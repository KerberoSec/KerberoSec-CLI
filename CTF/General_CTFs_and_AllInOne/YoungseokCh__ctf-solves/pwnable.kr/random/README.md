# random
> Daddy, teach me how to use random value in programming!
> 
> ssh random@pwnable.kr -p2222 (pw:guest)

```
$ scp -P 2222 -r random@pwnable.kr:~
```

## rand() is not random

After googling about function `rand()`, I noticed that it should be used with `srand(time(0))`, which initializes the random number generator.

```
(gdb) disass main
Dump of assembler code for function main:
   0x00000000004005f4 <+0>:     push   %rbp
   0x00000000004005f5 <+1>:     mov    %rsp,%rbp
   0x00000000004005f8 <+4>:     sub    $0x10,%rsp
   0x00000000004005fc <+8>:     mov    $0x0,%eax
   0x0000000000400601 <+13>:    callq  0x400500 <rand@plt>
   0x0000000000400606 <+18>:    mov    %eax,-0x4(%rbp)
```

Put breakpoint at `*main+18`.
```
(gdb) p $eax
$1 = 1804289383
```
The return value of the first `rand()` was 1804289383, and I checked that it is fixed. So I wrote following solver:

```python
from pwn import *

random_val = 1804289383

sh = ssh('random', 'pwnable.kr', password='guest', port=2222)
p = sh.process(['./random'])
p.send(str(random_val ^ 0xdeadbeef))
p.interactive()
```

Flag is `Mommy, I thought libc random is unpredictable...`.
