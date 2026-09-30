# format_string_1
*Patrick and Sponge Bob were really happy with those orders you made for them, but now they're curious about the secret menu. Find it, and along the way, maybe you'll find something else of interest!*

## Solution
1. So, the real challenge wasn't even the binary exploiting. This was a pretty simple injection into the `printf()` call, allowing me to read from the stack. Afterwards we just had to parse that text, that was the hard part! See `solve.py` for details.
2. `./solve.sh`

## Flag
**Flag:** `picoCTF{4n1m41_57y13_4x4_f14g_e11e8018}`
