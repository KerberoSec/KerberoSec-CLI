Solved by Dan
#!/usr/bin/env python3.7
import enchant
import string

# the service just ROTs a random english word with a
# random shift and asks you to decode it.

# make a table for each possible ROT
dictionary = enchant.Dict('en_US')
alphabet = string.ascii_uppercase
shift_tables = [
    str.maketrans(alphabet, alphabet[shift:] + alphabet[:shift])
    for shift in range(26)
]

def rot(s: str, n: int) -> str:
    return s.translate(shift_tables[n % len(shift_tables)])

# all the rots until it works
def decode(s: str) -> str:
    for i in range(len(shift_tables)):
        word = rot(s, i)
        if dictionary.check(word.lower()):
            return word
    raise ValueError('no decode for {}'.format(s))

if __name__ == '__main__':
    import pwn
    r = pwn.remote('chal.tuctf.com', 30100)
    while True:
        line = r.recvline().decode('utf-8')
        if 'decode this: ' in line:
            word = line.split()[-1]
            solve = decode(word)
            r.sendline(solve)
            print('{} -> {}'.format(word, solve))
        else:
            print(line)

TUCTF{W04H_DUD3_S0_F4ST_S0N1C_4PPR0V3S}

