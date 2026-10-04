Solved by Dan
#!/usr/bin/env python3.7
import subprocess

# run.c and core are provided
#
# run.c malloc's a buffer, puts the flag in it, and then
# stack buffer overflows to segfault on ret. core is a
# coredump after this segfault.

# xor the known flag prefix 'TUCTF{' with 1
# this should be in the coredump somewhere
needle = bytes(x ^ 1 for x in b'TUCTF{').decode('utf-8')

# grep for it ascii ^ 1 is still ascii
output = subprocess.getoutput(f'strings core | grep "{needle}"')

# xor back to get the flag
flag = bytes(x ^ 1 for x in bytes(output, 'utf-8'))
print(flag)

TUCTF{c0r3_dump?_N3v3r_h34rd_0f_y0u}

