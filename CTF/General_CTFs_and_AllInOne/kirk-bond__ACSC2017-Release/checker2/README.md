# checker2 (C, reverse engineering, hard)

## Usage

```
make
./checker 'acsc2017{mg8gj7GnONlolhIrwN2p}'
```

## Setup

Compile and provide `checker` to competitors. Feel free to change the
challenge/binary name during deployment or update the Makefile.

```
We've recovered a binary that seems to contain some additional protections.
Although it does seem remarkably similar to the last one we came across...
```

## Description

The binary is exactly the same as original checker, but with a different
payload. The new payload encrypts the guessed flag with an incrementing xor key
starting at 1, and compares the encrypted values in sequence.

## Solution

See checker1 for initial binary overview.

### Solution 1 (Dynamic debugging)

If competitors are able to determine that this is an interpreter, they can place
a breakpoint at the top of the loop and dump the register memory locations after
each interpreter instruction. If they can deduce that r7 is the flag denoting
success or failure, they can set a write breakpoint on that memory location and
brute force the flag.

### Solution 2 (Disassembler and easy scripting)

Competitors can reverse each of the opcodes, extract the code from the `.rodata`
section, and write a disassembler that translates the code into a human readable
form. Once doing this, it should be relatively easy to deduce how the keystream
is calculated. Competitors can extract the ciphertext, generate the keystream,
and decrypt for the flag.
