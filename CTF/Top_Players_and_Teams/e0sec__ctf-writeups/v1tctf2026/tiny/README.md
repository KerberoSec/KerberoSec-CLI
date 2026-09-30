# tiny: v1t CTF 2026

**Category:** Rev  
**Points:** 100  
**Flag:** `v1t{^}`

---

## Overview

A 904-byte ELF x86-64 binary with no section headers (corrupted section header size field). It reads a flag from stdin, uses the sum of its bytes as a decoding key, and renders a 10-row bitmap to stdout as `0`/`1` characters. The correct flag produces readable ASCII art.

## Analysis

```
$ file tini_rev
tini_rev: ELF 64-bit LSB executable, x86-64, statically linked, corrupted section header size
$ wc -c tini_rev
904 tini_rev
```

No symbols, no libc: manually disassemble from the entry point (`0x400070`). The code fits in ~300 bytes and does exactly five things:

### 1: Read flag from stdin

```asm
xor eax, eax       ; sys_read
xor edi, edi       ; stdin
lea rsi, [rsp+0x6200]
mov edx, 0x100     ; up to 256 bytes
syscall
```

### 2: Compute checksum (sum of non-newline bytes)

```asm
.loop:
    lodsb
    cmp al, 0x0a   ; skip \n
    je  .skip
    cmp al, 0x0d   ; skip \r
    je  .skip
    movzx edx, al
    add ebp, edx   ; ebp = checksum
.skip:
    loop .loop
```

`ebp` = sum of all input bytes (excluding newlines).

### 3: Decode 227 RLE words

227 16-bit little-endian values are stored at offset `0x1b8` in the binary (file maps at `0x400000`). Each word has the checksum subtracted:

```asm
mov rsi, 0x4001b8
mov ecx, 0xe3      ; 227 words
.decode:
    movzx eax, word [rsi]
    add rsi, 2
    sub eax, ebp   ; decoded = encoded - checksum
    stosw
    loop .decode
```

### 4: Render bitmap via 10-byte key

A 10-byte key at offset `0x37e` (`10 14 18 15 17 16 1a 12 12 1a`) drives an RLE renderer:

- Outer loop: 10 iterations (one per key byte `k`)
- Each iteration skips one decoded word, reads the next as both the initial bit (lsb → `'0'` or `'1'`) and the first run length
- Inner loop runs `k−1` times: emits the current char `run_length` times, then flips `'0'`↔`'1'`
- Total output width capped at 140 columns per row

The first three decoded words are a header: at checksum **625** they equal `[10, 1, 1]`: matching the 10-row key length and 1×1 scale, confirming the correct checksum.

### 5: Write rows + exit

The rendered rows (each followed by `\n`) are written to stdout, then `sys_exit(0)`.

## Finding the Flag

The correct checksum is **625** (from the header). The flag format is `v1t{...}`, so solve:

```
v + 1 + t + { + X + } = 625
118 + 49 + 116 + 123 + X + 125 = 625
X = 625 - 531 = 94  →  chr(94) = '^'
```

Flag: **`v1t{^}`**

## Solver

```python
import struct

with open('tini_rev', 'rb') as f:
    data = f.read()

encoded = [struct.unpack_from('<H', data, 0x1b8 + i*2)[0] for i in range(0xe3)]
key     = list(data[0x37e : 0x37e + 10])

def render(checksum):
    decoded  = [(w - checksum) & 0xffff for w in encoded]
    idx      = 3
    rows     = []
    for k in key:
        idx += 1
        bit  = decoded[idx] & 1
        al   = bit + 0x30        # '0' or '1'
        rem  = 0x8c              # max 140 cols
        edx  = k - 1
        line = []
        while edx > 0:
            run = decoded[idx]; idx += 1
            run = min(run, rem); rem -= run
            line.extend([chr(al)] * run)
            al ^= 1; edx -= 1
        rows.append(''.join(line))
    return rows

# checksum 625 → header [10,1,1] → scale 1×1, 10 rows
for row in render(625):
    print(''.join('█' if c == '1' else ' ' for c in row))
```

## Output

```
 ████            ████            ████            ████████████████████            ████████                ████                ████████
 ████            ████            ████            ████████████████████            ████████   █            ████             █  ████████
 ████        █   ████        ████████              █     ████    █               ████                ████    ████               █████
███            ████        █████████                   ████                    █████           █   █████   ████                ████ ███
█ █       █    ████           █████                    ████            ████████                ████            ████             █  ████████
████ █          ████            █████                   ███  █          ████████                ████           █████             █  ████████
    ████    ████      █         █ ██           █        ████                    ████               █                   █        █ ██
    ████    ███     █           ████                    ████                    ████     █                                      ████
       ████          █     ████████████                ████                    ████████                                    ███ ████     █
        ████ █  █     █     █ ██████████                ███      █              ████████           █                      █ ████████
```

ASCII art of `v1t{^}`: confirms the flag.

---

**Flag:** `v1t{^}`
