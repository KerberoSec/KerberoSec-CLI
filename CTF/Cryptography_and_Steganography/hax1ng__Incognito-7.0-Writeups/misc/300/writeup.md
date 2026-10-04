# 300

**Category:** Misc / Steganography | **Difficulty:** 300 pts | **Flag:** `IIITL{k1nda_ea5y_1t_w4s_br0_6767}`

## TL;DR

A text file that looks completely empty is actually packed with data using spaces and tabs as binary. The file has two interleaved layers: "comment" lines starting with `#` encode a repeating XOR key ("norickrollbro..."), and the plain whitespace lines encode ciphertext. XOR them together and you get the flag.

## What We're Given

A single file called `blank.txt` (554 bytes). Open it in a normal text editor and you see... absolutely nothing. Or maybe some blank lines. The challenge description teases us with: *"The loudest secrets are often hidden in silence."*

That quote is doing a lot of work. Silence. Whitespace. Spaces and tabs. Keep that in mind.

## Initial Recon

The first thing to do with any mysterious file is run `xxd` on it to see the raw bytes:

```
00000000: 2020 0920 2009 0909 2020 0920 2009 0920    .  ...  .  .. 
00000010: 2020 0909 0920 0909 2020 0909 0909 2009    ... ..  .... .
00000020: 0a23 2009 0920 0909 0920 2009 0920 0909  .# .. ...  .. ..
```

Three bytes stand out:
- `0x20`: space character
- `0x09`: tab character
- `0x0a`: newline
- `0x23`: the `#` character, showing up at the start of every other line

So `blank.txt` contains no visible text at all: just spaces, tabs, newlines, and the occasional `#`. It has exactly 18 lines.

```
Line  1: len=32, no hash
Line  2: len=33, starts with '#'
Line  3: len=32, no hash
Line  4: len=33, starts with '#'
...
```

The pattern is rigid: odd-numbered lines are pure whitespace (32 characters each), even-numbered lines start with `#` and have 32 more whitespace characters after it. Every pair of lines contains exactly 64 bits of data: which is a big hint that this is binary encoding.

## The Vulnerability / Trick

This is a classic **whitespace steganography** scheme: the idea that spaces and tabs are visually indistinguishable in most contexts, but a computer treats them as completely different bytes. By mapping `space = 0` and `tab = 1`, you can encode arbitrary binary data in a file that appears completely blank to the human eye.

The challenge layers it further with a two-track structure:

- **Track 1 (odd lines, no `#`):** Encodes ciphertext
- **Track 2 (even lines, starting with `#`):** Encodes the XOR key

The `#` just marks which track is which: it's a separator, not part of the data. Everything else is binary encoded in whitespace.

The "hidden in silence" quote in the description was literally pointing us at the silence between printable characters: the whitespace.

## Building the Exploit

Let's walk through the decoding step by step.

**Step 1: Decode the `#` lines (the key)**

For lines that start with `#`, skip the `#` itself, then read each remaining character: `tab = 1`, `space = 0`. Group bits into 8-bit chunks and convert to ASCII.

```python
data = open('blank.txt', 'rb').read()
lines = data.split(b'\n')

key_bits = ''
for line in lines:
    if line.startswith(b'#'):
        payload = line[1:]  # skip the '#', keep everything else
        for b in payload:
            if b == 0x09:   # tab
                key_bits += '1'
            elif b == 0x20: # space
                key_bits += '0'

key_bytes = bytes(int(key_bits[i:i+8], 2) for i in range(0, len(key_bits), 8) if len(key_bits[i:i+8]) == 8)
print(key_bytes)
```

This spits out: `b'norickrollbronorickrollbronorickr'`

We've been rickrolled. The key is a repeating `norickrollbro` string: the challenge author hid a rickroll inside the XOR key, then hid that inside lines that look like code comments. Layers upon layers.

**Step 2: Decode the plain whitespace lines (the ciphertext)**

Same process for the non-`#` lines, but we read the entire line (no character to skip):

```python
ct_bits = ''
for line in lines:
    if not line.startswith(b'#'):
        for b in line:
            if b == 0x09:
                ct_bits += '1'
            elif b == 0x20:
                ct_bits += '0'

ct_bytes = bytes(int(ct_bits[i:i+8], 2) for i in range(0, len(ct_bits), 8) if len(ct_bits[i:i+8]) == 8)
```

This gives us the raw ciphertext: `b"\x27\x26\x3b\x3d\x2f\x10\x19\x5e..."`: clearly not ASCII on its own.

**Step 3: XOR with the key**

XOR (the `^` operator) is a simple reversible cipher. If `ciphertext = plaintext XOR key`, then `plaintext = ciphertext XOR key`. The key repeats as needed to match the ciphertext length:

```python
flag = bytes(a ^ b for a, b in zip(ct_bytes, (key_bytes * 10)))
print(flag)
```

And there's our flag.

## Running It

Putting it all together in one script:

```python
data = open('blank.txt', 'rb').read()
lines = data.split(b'\n')

key_bits = ''
ct_bits = ''

for line in lines:
    if line.startswith(b'#'):
        payload = line[1:]
        for b in payload:
            if b == 0x09:   key_bits += '1'
            elif b == 0x20: key_bits += '0'
    else:
        for b in line:
            if b == 0x09:   ct_bits += '1'
            elif b == 0x20: ct_bits += '0'

key = bytes(int(key_bits[i:i+8], 2) for i in range(0, len(key_bits), 8) if len(key_bits[i:i+8]) == 8)
ct  = bytes(int(ct_bits[i:i+8],  2) for i in range(0, len(ct_bits),  8) if len(ct_bits[i:i+8])  == 8)

flag = bytes(a ^ b for a, b in zip(ct, key * 10))
print(flag.decode())
```

Output:

```
IIITL{k1nda_ea5y_1t_w4s_br0_6767}
```

## Dead Ends Worth Mentioning

**Whitespace language interpreter:** The first instinct when you see a file of pure spaces and tabs is to try the [Whitespace esoteric programming language](https://esolangs.org/wiki/Whitespace), which uses exactly those three characters (`space`, `tab`, `newline`) as its entire instruction set. We tried running `blank.txt` as a Whitespace program, but the program structure was invalid. The `#` characters were a dead giveaway that this wasn't standard Whitespace (the language doesn't use `#`).

**stegsnow:** There's a tool called `stegsnow` specifically designed for hiding data in whitespace at the end of text lines. It was a reasonable guess, but the structure here was custom: not the stegsnow format.

**Bit ordering and grouping variants:** Before nailing down the exact scheme, we tried treating bits as 7-bit ASCII, reversed bit order, reading column-wise instead of row-wise, and interpreting tabs/spaces-per-line as a count encoding. None of those produced readable output. The breakthrough was noticing the `#`-line / plain-line alternation and treating them as two separate data streams.

## Key Takeaways

- **Whitespace steganography** hides data by encoding binary in characters that are visually identical (spaces and tabs). Any file with suspicious amounts of trailing or mixed whitespace is worth running through `xxd`.

- **The challenge description is a hint.** "Hidden in silence" was a direct pointer to whitespace. Always read flavor text: challenge authors put hints there.

- **When you see alternating structure, there are probably two data streams.** The `#` lines weren't decoration: they were a structural separator for the key track.

- **Quick sanity check:** if a file has consistent line lengths and weird tab/space distribution but no readable text, `xxd` it immediately. The byte values `0x09` and `0x20` will tell you everything.

- And yes, the key was a rickroll. Never gonna give you up.
