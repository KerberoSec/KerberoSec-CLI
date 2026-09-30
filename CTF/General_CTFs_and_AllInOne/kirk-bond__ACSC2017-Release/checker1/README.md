# checker (C, reverse engineering, hard)

## Usage

```
make
./checker 'acsc2017{arent_interpreters_great?}'
```

## Setup

Compile and provide `checker` to competitors. Feel free to change the
challenge/binary name during deployment or update the Makefile.

## Description

The binary emulates a custom architecture with 8 general purpose registers and a
minimal instruction set containing 6 instructions. It's possible to solve this
challenge without fully reversing the architecture if competitors realize the
flag is stored in plaintext in the custom code. Otherwise, competitors are
expected to either extract the code from the binary and implement a
disassembler, or display some debugging skills (there's a register that acts as
a 'success' flag: if they set a write breakpoint on that memory location
they'll be able to enumerate the flag byte by byte).

## Solution

On opening the binary and navigating to main() (it's always the first argument
to `__libc_start_main`), competitors will see a simple argc check, followed by a
memset, strncpy, and mystery function call. There is a branch as a result of the
call to `sub_804854b`, print either the win message or a fail message. To solve,
competitors will need to reverse `sub_804854b`.

Moving to `sub_804854b`, we see a bunch of variables being zero'd which are the
registers for the custom architecture. Following that, we have a loop with what
appears to be a switch or nested if statement. We can see that the large block
at `loc_80485a5` extracts the opcode, as well as the two operands for the
instruction from a static location in the `.rodata` section (`byte_8048840`).
From here there a few ways to solve.

### Solution 1 (Plaintext flag in .rodata)

Since the operands to the `li` instruction are not encoded in any way, the flag
can be seen in plaintext in the instruction stream at `byte_8048840`. Starting
at 0x0804884e, and examining every 15th byte, competitors can piece together the
flag.

### Solution 2 (Dynamic debugging)

If competitors are able to determine that this is an interpreter, they can place
a breakpoint at the top of the loop and dump the register memory locations after
each interpreter instruction. If they can deduce that r7 is the flag denoting
success or failure, they can set a write breakpoint on that memory location and
brute force the flag.

### Solution 3 (Disassembler)

Competitors can reverse each of the opcodes, extract the code from the `.rodata`
section, and write a disassembler that translates the code into a human readable
form. Really all they'll need to reverse is the `li` instruction, as this
instruction is used almost exclusively to load actual flag characters.
