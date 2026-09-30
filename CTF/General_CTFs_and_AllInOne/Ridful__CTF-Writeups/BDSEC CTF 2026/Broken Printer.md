
# Broken Printer

**Category:** Reverse Engineering  
**Author:** NomanProdhan

## Challenge

> Our printer is broken. Can you repair it?

We were given a binary and a remote connection:

```
nc 45.56.67.129 24873
```

The flag format was:

```
BDSEC{something_her3}
```

---

## First Look

Running `file` on the binary showed that it was a stripped 64-bit ELF:

```
file broken_printer
```

The binary had most of the usual protections enabled, but this challenge was not really about memory corruption.

After reversing the program, it turned out that the server reads the flag and sends us a messed-up version of it.

Example output:

```
[printer] job id       : F07BCF32
[printer] paper width  : 42
[printer] status       : damaged spool recovered
[printer] output follows:

.#:..|.#::#|..#../.:#..|:.#:+|:#.+.|.:.::~+.#.#/:+.#:|.#+.:|+.:.#|:.#.#~:#.:#~:+.:+/::+#+~##+:+|:.#+#|###::~.#.:#/:+.:#|:#::.~+:.:#|#+#:+/:#:.+|:.#.#~::#+#|++::.|.#.#.|::#:#|::#.+~.::.#~#.#.#~:.:.#/:..#+/:##:#|:#+:+/:##:+|##:::|:..:.~:.:++/#:::#~...:#

[printer] warning: output order may be incorrect
[printer] warning: foreign ink detected in every block
```

The warnings were actually pretty helpful.

- Output order was shuffled.
    
- Every block contained one fake character.
    
- The job ID was used as the seed.
    
- The paper width was the flag length.
    

So the goal was basically to undo the printer’s custom encoding.

---

## How the Encoding Worked

Each original flag byte was split into four 2-bit values.

Those values were converted into characters using this alphabet:

```
.:+#
```

That gave four characters per flag byte.

The printer then did a few extra things:

1. Rotated the four encoded characters based on their index.
    
2. Added one junk character into each block.
    
3. Reversed blocks with odd indexes.
    
4. Shuffled all blocks using a predictable stride.
    
5. Added separators like `|`, `/` and `~`.
    

The good news was that all of this was based on the printed job ID, so nothing needed to be guessed.

---

## Decoder

I wrote a Python script to reverse the whole process.

```python
#!/usr/bin/env python3

import math
import re
import sys

ALPHABET = ".:+#"
SEPARATORS = "|/~"
STRIDES = (5, 7, 11, 13, 17, 19, 23, 29, 31)

def u32(value):
    return value & 0xFFFFFFFF

def mix32(value):
    value = u32(value)

    value ^= value >> 16
    value = u32(value * 0x7FEB352D)

    value ^= value >> 15
    value = u32(value * 0x846CA68B)

    value ^= value >> 16
    return u32(value)

def parse_output(data):
    job = re.search(
        r"\[printer\]\s*job id\s*:\s*([0-9a-fA-F]{8})",
        data,
    )

    width = re.search(
        r"\[printer\]\s*paper width\s*:\s*(\d+)",
        data,
    )

    output = re.search(
        r"\[printer\]\s*output follows:\s*(.*?)"
        r"\[printer\]\s*warning:",
        data,
        re.DOTALL,
    )

    if not job or not width or not output:
        raise ValueError("could not parse printer output")

    seed = int(job.group(1), 16)
    flag_length = int(width.group(1))
    encoded = "".join(output.group(1).split())

    return seed, flag_length, encoded

def get_blocks(seed, width, encoded):
    expected_length = width * 5 + width - 1

    if len(encoded) != expected_length:
        raise ValueError("invalid encoded output length")

    blocks = []

    for index in range(width):
        offset = index * 6
        block = encoded[offset:offset + 5]

        if len(block) != 5:
            raise ValueError("invalid block")

        blocks.append(block)

        if index < width - 1:
            separator_state = u32(index * 0x27D4EB2D)

            expected = SEPARATORS[
                mix32(seed ^ separator_state) % 3
            ]

            if encoded[offset + 5] != expected:
                raise ValueError("separator validation failed")

    return blocks

def decode(seed, width, encoded):
    blocks = get_blocks(seed, width, encoded)

    stride = next(
        value for value in STRIDES
        if math.gcd(value, width) == 1
    )

    position = (seed >> 16) % width
    result = bytearray()

    for index in range(width):
        block = blocks[position]

        if index & 1:
            block = block[::-1]

        block_hash = mix32(
            seed ^ u32(index * 0x045D9F3B)
        )

        junk_position = block_hash % 5
        expected_junk = ALPHABET[(block_hash >> 8) & 3]

        if block[junk_position] != expected_junk:
            raise ValueError("junk character validation failed")

        block = (
            block[:junk_position]
            + block[junk_position + 1:]
        )

        rotation = index % 4

        if rotation:
            block = block[-rotation:] + block[:-rotation]

        values = [ALPHABET.index(char) for char in block]

        decoded_byte = (
            values[0] << 6
            | values[1] << 4
            | values[2] << 2
            | values[3]
        )

        result.append(decoded_byte)

        position = (position + stride) % width

    return result.decode()

def main():
    data = sys.stdin.read()

    seed, width, encoded = parse_output(data)
    flag = decode(seed, width, encoded)

    if not re.fullmatch(r"BDSEC\{[^}\n]+\}", flag):
        raise ValueError("decoded result is not a valid flag")

    print(flag)

if __name__ == "__main__":
    main()
```

---

## Getting the Flag

First, I saved the server output:

```
nc 45.56.67.129 24873 | tee printer.txt
```

Then passed it into the decoder:

```
python3 solve.py < printer.txt
```

Output:

```
BDSEC{th3_pr1nt3r_d03s_n0t_pr1nt_1n_0rd3r}
```

One small thing: running this without input will look like it is hanging:

```
python3 solve.py
```

That is normal because the script is waiting for data from standard input.

---

## Flag

```
BDSEC{th3_pr1nt3r_d03s_n0t_pr1nt_1n_0rd3r}
```
