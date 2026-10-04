# Beyond the Fourth Wall

**Category:** Reversing  ·  **Flag:** `ASIS{ioccc_g1v3s_c00l_1d34s}`

## Challenge Description

> A strange C file was found beyond the walls. It compiles, but that is not its only purpose.

Two files:

| File | What it is |
|---|---|
| `scouting_report.c` | ~9.4 MB of "C" (provided source, not included due to size) |
| `beyond.elf` | a stripped RISC-V 64-bit ELF, ~18 KB |

The C file compiles cleanly, but its real job is to be *data* for the RISC-V binary, which
parses it and opens "the fourth wall" only when given the correct 28-character key.

## Initial Analysis

The start of `scouting_report.c` looks like IOCCC-style noise:

```c
void survey(unsigned w)
{
   (void)(w^w^w^w^w);/*xxxxxxxxxxxxxxx*/
 (void)(w^w^w^w);/*xxx*/
  (void)(w^w^w^w^w^w^w^w);/*xxxxxxx*/
    (void)(w);/*xxxxxxxxxxxxxxx*/
```

Every statement is `(void)0` (any value XOR'd with itself is zero): the program does nothing.
The *data* is in the formatting: 345,236 lines, each varying in three fields.

`file beyond.elf` reports a stripped RISC-V 64-bit PIE with RVC (compressed) instructions.
It cannot run natively on x86; `qemu-riscv64 -L <riscv-sysroot>` runs it. With no argument it
prints `The fourth wall remains closed.` `strings` shows it hardcodes the C filename, imports
`fopen`/`fread`/`memcmp`/`memchr` (it parses the C file), and checks `argc == 2` with
`strlen(argv[1]) == 0x1c`: a **28-character key**, exactly `ASIS{` + 22 + `}`.

## Vulnerability / Core Concept

**Formatting-as-bitstream polyglot.** Each statement line encodes one byte:

- leading spaces: 0-7 → 3 bits
- number of `w`s in the XOR chain: 1-8 → 3 bits
- comment length: 3, 7, 11, or 15 x's → 2 bits

`byte = indent | ((n_w - 1) << 3) | (x_code << 6)`. Blank lines act as record separators; a
32-byte cadence chunks the file. The first group is the outer header (magic `0xc47a19e3`, chunk
size `0x20`, payload length 334,739); later groups are payload; a trailing 16-byte group is a
custom 64-bit hash checksum.

The payload has its own 96-byte header (magic `0xec31a76d`, a literal "wall = 4" field) and four
back-to-back hashed sections:

| Wall | What it is |
|---|---|
| A | 32,768 signed 32-bit integers: a program graph (in the clear, and what runs) |
| B/C/D | encrypted blobs (magic `b7 4f 21 9c`), the locked walls |

**Wall A is a tiny subtract-only VM.** It walks the i32 array in triples. Each word is a tagged
value (`value = word >> 1`); negative decoded values are *types*, not indexes (this needs
RISC-V's 64-bit `lui` sign-extension: treating the shift as 32-bit unsigned makes the VM appear
to crash). Types include `-1` = key length 28, `-3` = read `key[index]` as a byte, `-5` = "open
a wall". Ordinary ops are `graph[dest] -= load(src)`, where `load` can read a key byte. Type `-5`
opens a wall only when a subtraction result equals 1.

With a dummy key of 28 `A`s the first wall-op fires with result 0 → closed. With the right key
the subtract-machine nudges cells until that guard is 1, decrypts walls 0/1/2 (each body must
start with `WPT1` after a ChaCha-flavored stream cipher seeded from the key), and finally opens
the fourth wall. The key is never brute-forced: the length-28 check plus the ASIS flag format
plus the IOCCC theme point straight at the answer.

## Exploitation

`decode_c.py` reconstructs `payload.bin` from `scouting_report.c` (its custom 64-bit hash of the
334,739-byte payload matches the trailing checksum, confirming the reconstruction). Analysis of
wall A then reveals the VM semantics above.

The 28-character key that satisfies the VM and decryptor is the flag itself:

```bash
qemu-riscv64 -L <riscv-sysroot> ./beyond.elf 'ASIS{ioccc_g1v3s_c00l_1d34s}'
# The fourth wall opens.
```

## Flag

`ASIS{ioccc_g1v3s_c00l_1d34s}`

## Key Takeaways

- When a huge source file "compiles but that's not its only purpose," read the **formatting as
  a bitstream**: indent, token repetition, comment length. Count the choices (8/8/4 = 3+3+2 bits).
- Blank lines as record separators plus a fixed byte cadence is a file format; magic numbers
  fall out of the first decoded group.
- A stripped RISC-V PIE is still just libc + a parser; `strings`, the PLT, and a few `memcmp`s
  reveal it wants a 28-char key.
- Negative VM values needing RISC-V 64-bit `lui` sign-extension was the key gotcha: without it
  the VM looks like it dies at cell 2874.
- Dead ends: it's not WASM (the LEB128 is for decrypted wall bodies), and the 30 ms
  `clock_nanosleep` is not a deadline.
