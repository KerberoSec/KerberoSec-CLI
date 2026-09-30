Solved by Dan
Warning: this is a bad solution, but I am lazy

#!/usr/bin/env python3.7
# gcc -o run run.o
import subprocess
import string

# run.o is provided
# could be solved by reversing the password decode function
# but the error message includes and index where the error
# occurs so I just brute forced it :)
#
# start off with a `gcc -o run run.o` to get your executable

# we only care about a-fA-F0-9
charset = string.ascii_letters + string.digits + '_{}'

# execute and return the index of error
def run(s):
    assert len(s) == 44
    string = repr(s)
    command = f'python2 -c "print({string})" | ./run'
    output = subprocess.getoutput(command)
    if 'Correct Password' in output:
        return 45
    return int(output.split('\n')[-1].split()[-1])

# start with blank password
password = ''
print('-'*44)

# password length was found in run.o
# r2 run.o ; aa ; f ~pass ; pxw @ obj.passlen

# for each letter in the password
for i in range(44):
    # try each possible character
    for c in charset:
        attempt = password + c
        error = run(attempt + 'a'*(44: len(attempt)))
        # until the index of error moves up
        if error > i:
            # this is the correct char
            password += c
            break
    print(c, end='', flush=True)

# the end
print(f'\n{password}')

TUCTF{c0n6r47ul4710n5_0n_br34k1n6_7h15_fl46}

