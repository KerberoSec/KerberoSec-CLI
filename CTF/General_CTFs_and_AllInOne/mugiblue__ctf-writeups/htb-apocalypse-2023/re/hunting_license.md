# Hunting License

`Hunting Licence` asks you for 3 passwords.
The first two passwords are obtained by running `strings` on the binary.
Then by running `gdb` you get the third password:

```
=> 0x0000000000401387 <+253>:	mov    %rax,%rdi
```
We set a breakpoint just before the `cmp` and then simply output the contents of the stack:

```
(gdb) x/32xc $sp
0x7fffffffe630:	84 'T'	104 'h'	105 'i'	114 'r'	100 'd'	65 'A'	110 'n'	100 'd'
0x7fffffffe638:	70 'F'	105 'i'	110 'n'	97 'a'	108 'l'	33 '!'	33 '!'	33 '!'
0x7fffffffe640:	0 '\000'	-48 '\320'	-1 '\377'	-9 '\367'	-1 '\377'	127 '\177'	0 '\000'	0 '\000'
0x7fffffffe648:	38 '&'	22 '\026'	-34 '\336'	-9 '\367'	80 'P'	52 '4'	115 's'	115 's'
```
The third password is `ThirdAndFinal!!!`

They also ask you a series of questions, but these are fairly straightforward if you have previously disassembled and analyzed the binary.

```
cyberapocalypse2023/re/rev_hunting_license took 8m32s 
❯ nc 165.232.108.36 32536
What is the file format of the executable?
> ELF
[+] Correct!

What is the CPU architecture of the executable?
> x86-64
[+] Correct!

What library is used to read lines for user answers? (`ldd` may help)
> libreadline.so.8
[+] Correct!

What is the address of the `main` function?
> 0x401172
[+] Correct!

How many calls to `puts` are there in `main`? (using a decompiler may help)
> 5
[+] Correct!

What is the first password?
> PasswordNumeroUno
[+] Correct!

What is the reversed form of the second password?
> 0wTdr0wss4P
[+] Correct!

What is the real second password?
> P4ssw0rdTw0
[+] Correct!

What is the XOR key used to encode the third password?
> 0x13
[+] Correct!

What is the third password?
> ThirdAndFinal!!!   
[+] Correct!

[+] Here is the flag: `HTB{l1c3ns3_4cquir3d-hunt1ng_t1m3!}
```

