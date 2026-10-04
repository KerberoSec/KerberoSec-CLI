# v1t 2026 CTF: Tiny (REV) Writeup

## TL;DR

Standard analysis tools failed against this binary due to corrupted ELF headers. Dumping the raw assembly revealed a completely custom, syscall-driven payload. The program takes user input, sums the ASCII values of the characters, and uses that sum to decrypt an array of 16-bit integers. These integers dictate the run-length encoding (RLE) to print an ASCII art duck. To avoid negative run-lengths and decode the image properly, the input sum must be exactly 625. Given the `v1t{}` wrapper, the shortest valid character to bridge the gap is `^` (ASCII 94), resulting in the flag `v1t{^}`.

## 1. Initial Reconnaissance

Standard binary analysis yielded very little useful information:

- `file` reported a corrupted section header size.
    
- `checksec` reported no protections and no symbols.
    
- `strings` output what appeared to be a massive conditional jump maze (bytes in the `0x71` - `0x7E` range).
    

Because the headers were stripped and golfed, standard decompilers could not accurately interpret the entry point or structure. The solution was to dump the raw binary instructions from offset `0x00`:

Bash

```
objdump -D -b binary -m i386:x86-64 tini_rev
```

## 2. Assembly Analysis

Looking at the raw assembly, the block of data that `strings` mistook for a jump maze was actually a hardcoded array of Little Endian 16-bit integers starting at offset `0x1b8`. The execution flow consists of three main phases:

### Phase A: Input Summation

The program reads input via `sys_read` and loops over each byte:

Code snippet

```
  9e:   ac                      lods   (%rsi),%al
  9f:   3c 0a                   cmp    $0xa,%al       # Ignore newline
 ...
  aa:   01 d5                   add    %edx,%ebp      # Add ASCII value to %ebp
```

By the end of this loop, the `%ebp` register holds the total integer sum of all the ASCII characters in the input flag.

### Phase B: Array Decryption

The program then iterates 227 (`0xe3`) times over the hardcoded array:

Code snippet

```
  c8:   0f b7 06                movzwl (%rsi),%eax    # Load 16-bit array value
  cb:   48 83 c6 02             add    $0x2,%rsi
  cf:   29 e8                   sub    %ebp,%eax      # Subtract input sum from value
  d1:   66 ab                   stos   %ax,(%rdi)     # Store decrypted value
```

It subtracts the user's input sum from every 16-bit word in the array.

### Phase C: Run-Length Encoding (RLE) Image

The remainder of the assembly takes those decrypted values and uses them as loop counters to print a 140-character-wide grid of spaces and ASCII characters.

## 3. Finding the Flag

Because the decrypted array values are used as run-lengths for an image, **they cannot be negative**.

Scanning the raw hex of the hardcoded array at `0x1b8`, the absolute lowest value present is `0x0271` (which is **625** in decimal). If the user's input sum is any higher than 625, the subtraction in Phase B results in a negative number, breaking the RLE loop and the image. Therefore, the target input sum must be exactly 625 to act as a perfect baseline.

Let's calculate the sum of the known flag wrapper:

- `v` = 118
    
- `1` = 49
    
- `t` = 116
    
- `{` = 123
    
- `}` = 125
    
- **Base Sum:** 531
    

To reach the target sum of 625, the inner flag characters must add up to the remainder:

- 625: 531 = **94**
    

The challenge description explicitly stated this was the _"tiniest flag"_, meaning we need the fewest characters possible. A single character with an ASCII value of 94 is the caret symbol (`^`).

**Flag:** `v1t{^}`
