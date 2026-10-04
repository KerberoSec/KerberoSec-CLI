# try: v1t CTF 2026

**Category:** Rev  
**Flag:** `v1t{n0_dump_just_pain}`

---

## Overview

A 38 KB PE32+ (x86-64) Windows executable presenting a "sealed input verifier": it reads a string, runs it through a bytecode VM, and prints `[+] accepted` or `[-] rejected`.

The `strings` output is loaded with fake protection markers: Enigma Protector, WIBU-KEY, HASP, Sentinel, Marx Cryptobox, Denuvo, Nuitka, UPX, etc.: all fake PE section names added as misdirection. The real logic is a compact C program compiled with TCC (`chall_tcc_obfus.exe` is the original filename).

---

## Analysis

### PE layout

```
.text: actual code (~9 KB)
.data: strings + encrypted VM bytecode stream
UPX0: lookup table: alphabet + "SLAIDPUH" suffix
.arch: fake: contains "denuvo_atd"
.rdata: fake: contains "NUITKA_ONEFILE_PARENT"
.enigma1/2, .vmp0-2, .winlice, .petite, .rlp, ...: all 1-byte fake sections
__wibu00/01: fake WIBU-KEY section names
```

### Decrypting the VM bytecode stream

The stream is stored encrypted in `.data`. Each byte is decoded via a FNV-like hash keyed on position and a hardcoded key byte `0xa7`:

```python
def hash_pair(state, key):
    h = (key * 0x45d9f3b ^ 0x6d2b79f5) & 0xffffffff
    h = (h ^ (state * 0x9e3779b9)) & 0xffffffff
    h = (h ^ (h >> 16)) & 0xffffffff
    h = (h * 0x7feb352d) & 0xffffffff
    h = (h ^ (h >> 15)) & 0xffffffff
    h = (h * 0x846ca68b) & 0xffffffff
    h = (h ^ (h >> 16)) & 0xffffffff
    return (h ^ (h>>8) ^ (h>>16) ^ (h>>24)) & 0xff

stream = []
for i, raw in enumerate(big_table):       # big_table at file offset 0x2fa8
    v   = hash_pair(i, 0xa7)
    x   = (raw ^ v) & 0xff
    out = rotate_byte_right(x, (i ^ 0xa7) & 7)
    stream.append(out)
```

### VM opcode set

The dispatcher at `0x402470` switches on a stream byte:

| Opcode | Operation |
|--------|-----------|
| `0x5d` | Update internal accumulator B (irrelevant to checks) |
| `0x4b` | `acc_a = input[N]`: load character N from user input |
| `0x71` | `acc_a ^= D` |
| `0x32` | `acc_a = (acc_a + D) & 0xff` |
| `0x18` | `acc_a = rotate_left(acc_a, D)` |
| `0xd4` | `acc_d |= acc_a ^ D`: single-char equality check |
| `0xa9` | Cross-char check on two input indices |
| `0xee` | Final check: `acc_d |= counter ^ D`; pass iff `acc_d == 0` |

Each group of stream bytes encodes the transform pipeline for one character check:

```
5d <b>  4b <idx>  71 <X>  32 <Y>  18 <Z>  71 <W>  d4 <E>
```

Meaning: `rotate_left(((input[idx] ^ X) + Y) & 0xff, Z) ^ W == E`

### Solving for the flag

22 single-character constraints from `0xd4` opcodes, each independently invertible:

```python
def solve(ops, expected):
    val = expected
    for op, d in reversed(ops):
        if op == 'xor':   val ^= d
        elif op == 'rotl': val = rotate_byte_right(val, d)
        elif op == 'add':  val = (val - d) & 0xff
    return val
```

11 cross-character constraints from `0xa9` opcodes verify pairs using:

```python
def check_pair(c1, c2, i1, i2, b3):
    s1 = ((c1 ^ ((b3+i1)&0xff)) + (c2 ^ ((b3+i2)&0xff))) & 0xff
    v1 = rotate_left(s1, (b3^i1^i2)&7)
    s2 = (c1*((b3&7)|1) + c2*(((b3>>3)&7)|1)) & 0xff
    v2 = rotate_left(s2, (i1+i2+b3)&7)
    return v1 ^ v2   # must equal b4
```

All 11 pair constraints are automatically satisfied by the 22 characters recovered from the single-char checks: no extra solving needed.

The `0xee` final check passes because `counter_c` = 22 (`d4`) + 11 (`a9`) = 33 = `0x21`, matching the stream data byte.

---

## Flag

```
v1t{n0_dump_just_pain}
```
