First, I used file command on the binary.
```
flag: ELF 64-bit LSB executable, x86-64, version 1 (GNU/Linux), statically linked, no section header
```

First, I ran the binary. The output was
```
I will malloc() and strcpy the flag there. take it.
```

It has no section headers.. readelf also gave following unmeaningful result.
```
ELF Header:
  Magic:   7f 45 4c 46 02 01 01 03 00 00 00 00 00 00 00 00
  Class:                             ELF64
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - GNU
  ABI Version:                       0
  Type:                              EXEC (Executable file)
  Machine:                           Advanced Micro Devices X86-64
  Version:                           0x1
  Entry point address:               0x44a4f0
  Start of program headers:          64 (bytes into file)
  Start of section headers:          0 (bytes into file)
  Flags:                             0x0
  Size of this header:               64 (bytes)
  Size of program headers:           56 (bytes)
  Number of program headers:         2
  Size of section headers:           64 (bytes)
  Number of section headers:         0
  Section header string table index: 0
```

`strings` command gave me a hint:
```
...
PROT_EXEC|PROT_WRITE failed.
$Info: This file is packed with the UPX executable packer http://upx.sf.net $
$Id: UPX 3.08 Copyright (C) 1996-2011 the UPX Team. All Rights Reserved. $
...
```
So it uses a packer named UPX. To unpack it, I installed upx package on Ubuntu and ran following command:
```
upx -d ./flag
```
Now I got a not stripped, reversible binary. Using gdb, the assembler code for main function was:
```
(gdb) disass main
Dump of assembler code for function main:  
   0x0000000000401164 <+0>:     push   %rbp
   0x0000000000401165 <+1>:     mov    %rsp,%rbp
=> 0x0000000000401168 <+4>:     sub    $0x10,%rsp
   0x000000000040116c <+8>:     mov    $0x496658,%edi
   0x0000000000401171 <+13>:    callq  0x402080 <puts>
   0x0000000000401176 <+18>:    mov    $0x64,%edi
   0x000000000040117b <+23>:    callq  0x4099d0 <malloc>
   0x0000000000401180 <+28>:    mov    %rax,-0x8(%rbp)
   0x0000000000401184 <+32>:    mov    0x2c0ee5(%rip),%rdx        # 0x6c2070 <flag>
   0x000000000040118b <+39>:    mov    -0x8(%rbp),%rax
   0x000000000040118f <+43>:    mov    %rdx,%rsi
   0x0000000000401192 <+46>:    mov    %rax,%rdi
   0x0000000000401195 <+49>:    callq  0x400320
   0x000000000040119a <+54>:    mov    $0x0,%eax
   0x000000000040119f <+59>:    leaveq
   0x00000000004011a0 <+60>:    retq
End of assembler dump.
```

It seems that main+49 instruction calls memcpy function. memcpy's second argument is source, so I read rsi value right before calling it.

```
(gdb) r
I will malloc() and strcpy the flag there. take it.
Breakpoint 1, 0x0000000000401195 in main ()
(gdb) disass main
Dump of assembler code for function main:
   0x0000000000401164 <+0>:     push   %rbp
   0x0000000000401165 <+1>:     mov    %rsp,%rbp
   0x0000000000401168 <+4>:     sub    $0x10,%rsp
   0x000000000040116c <+8>:     mov    $0x496658,%edi
   0x0000000000401171 <+13>:    callq  0x402080 <puts>
   0x0000000000401176 <+18>:    mov    $0x64,%edi
   0x000000000040117b <+23>:    callq  0x4099d0 <malloc>
   0x0000000000401180 <+28>:    mov    %rax,-0x8(%rbp)
   0x0000000000401184 <+32>:    mov    0x2c0ee5(%rip),%rdx        # 0x6c2070 <flag>                                                                               g>
   0x000000000040118b <+39>:    mov    -0x8(%rbp),%rax
   0x000000000040118f <+43>:    mov    %rdx,%rsi
   0x0000000000401192 <+46>:    mov    %rax,%rdi
=> 0x0000000000401195 <+49>:    callq  0x400320
   0x000000000040119a <+54>:    mov    $0x0,%eax
   0x000000000040119f <+59>:    leaveq
   0x00000000004011a0 <+60>:    retq
End of assembler dump.
(gdb) info registers
rax            0x6c96b0            7116464
rbx            0x401ae0            4201184
rcx            0x8                 8
rdx            0x496628            4810280
rsi            0x496628            4810280
rdi            0x6c96b0            7116464
rbp            0x7fffffffdcd0      0x7fffffffdcd0
rsp            0x7fffffffdcc0      0x7fffffffdcc0
r8             0x1                 1
r9             0x3                 3
r10            0x22                34
r11            0x0                 0
r12            0x401a50            4201040
r13            0x0                 0
r14            0x0                 0
r15            0x0                 0
rip            0x401195            0x401195 <main+49>
eflags         0x206               [ PF IF ]
cs             0x33                51
ss             0x2b                43
ds             0x0                 0
--Type <RET> for more, q to quit, c to continue without paging--q
Quit
(gdb) x/s 0x496628
0x496628:       "UPX...? sounds like a delivery service :)"
```

flag is `UPX...? sounds like a delivery service :)`.