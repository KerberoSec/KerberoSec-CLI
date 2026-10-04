Solved by Dan
#!/usr/bin/env python3.7
from typing import List

# r2 faker
# r2> aa
# r2> f ~sym.
# r2> s sym.printFlag
# r2> pdf

# copied this logic from sym.printFlag
def decode_flag(encoded: bytes) -> bytes:
    output: List[int] = []
    for e in encoded:
        d = ((e ^ 0x0f): 0x1d) * 0x08
        d = (d % 0x5f) + 0x20
        output.append(d)
    return bytes(output)

# there are three functions that decode flags A, B, C
# strings the binary to get D, the other thing that looks
# like an encoded flag
flag_a = b'\\PJ\\fCaq(Lw|)$Tw$Tw@wb@ELwbY@hk'
flag_b = b'\\PJ\\fCTq00;waq|w)L0LwL$|)L0k'
flag_c = b'\\PJ\\fChqqZw|0;w2l|wELL(wYqqE$ahk'
flag_d = b'\\PJ\\fC|)L0LTw@Yt@;Twmq0Lw|qw@w2$a@0;w|)@awmLL|Tw|)LwZL2lhhL0k'

# decode them all
print(decode_flag(flag_a))
print(decode_flag(flag_b))
print(decode_flag(flag_c))
print(decode_flag(flag_d))

TUCTF{7h3r35_4lw4y5_m0r3_70_4_b1n4ry_7h4n_m3375_7h3_d3bu663r}

