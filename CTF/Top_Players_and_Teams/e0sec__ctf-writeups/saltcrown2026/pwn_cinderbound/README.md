# cinderbound: Writeup

**Category:** Reversing / Pwn (compiled bytecode analysis)
**Files provided:** `cinderbound.mpy`

## TL;DR

The challenge ships a compiled MicroPython bytecode file (`.mpy`, format
version 6) containing a single `judge(syllable)` function. It runs a
**rolling-key XOR checksum** over the input string and compares the result
against 16 embedded target bytes. The running key only ever depends on
*already-processed* characters, so the check is trivially invertible one
character at a time: no brute force needed.

```
HTB{c1nd3rbound_v0w5}
```

---

## 1. Identifying the file

```
$ file cinderbound.mpy
cinderbound.mpy: data
```

`file` doesn't recognize it, but the header bytes are distinctive:

```
4d 06 00 1f 08 01 18 ...
 M  6  00 1f 08 01 ...
```

- `0x4d` (`'M'`): MicroPython persistent-bytecode magic
- `0x06`: `MPY_VERSION` = 6
- remaining header bytes: feature flags / native arch / small-int width

MicroPython's own `py/persistentcode.h` defines `MPY_VERSION 6`, which
corresponds to the MicroPython **1.19-1.22** release line. Cloning
`micropython` at tag `v1.20.0` confirms the macro matches exactly, so its
bundled `tools/mpy-tool.py` can be used unmodified to disassemble the file.

## 2. Disassembling

```
$ git clone --depth 1 --branch v1.20.0 https://github.com/micropython/micropython.git
$ python3 micropython/tools/mpy-tool.py -d cinderbound.mpy
```

`mpy-tool.py` isn't a decompiler: it's a faithful disassembler. It:

1. Parses the header and confirms the version.
2. Reads the **qstr table** (interned identifiers: `judge`, `syllable`, `ord`, …).
3. Reads the **object table** (constants too large for inline encoding: here,
   the 16-entry byte tuple used as the comparison target).
4. Walks the code object tree and prints each bytecode instruction using
   MicroPython's opcode table (`LOAD_FAST`, `BINARY_OP __xor__`,
   `CALL_FUNCTION`, etc.).

The disassembly reveals a single top-level function, `judge(syllable)`, with
a `for i in range(len(syllable))` loop body built from repeated
`LOAD_FAST` / `BINARY_OP` / `STORE_FAST` sequences, plus a final list
comparison against the constant tuple pulled from the object table:

```
(57, 129, 154, 31, 199, 192, 73, 243, 43, 176, 255, 173, 54, 203, 67, 15)
```

## 3. Reconstructing the algorithm

Translating the opcode sequence back to equivalent Python:

```python
def judge(syllable):
    target = (57, 129, 154, 31, 199, 192, 73, 243,
              43, 176, 255, 173, 54, 203, 67, 15)
    key = 90
    output = []
    for i in range(len(syllable)):
        c = ord(syllable[i])
        val = (key ^ c) ^ ((i * 13) & 0xff)
        output.append(val)
        key = (key + c) & 0xff
    return output == list(target)
```

Two independent mixing terms are combined by XOR each iteration:

- **Positional scramble**: `(i * 13) & 0xff`, depends only on the index.
- **Stateful scramble**: `key`, a running sum (mod 256) of every character
  consumed so far, seeded at `90`.

Because `key` at step `i` depends only on characters `0..i-1`: never on the
current or future characters: the check has no real feedback loop from the
solver's perspective: it can be inverted strictly left to right.

## 4. Inverting the check

XOR is self-inverting, so solving for each character just means XOR-ing the
same two masks back onto the target byte:

```
ord(c_i) = key_i ^ target[i] ^ ((i * 13) & 0xff)
key_{i+1} = (key_i + ord(c_i)) & 0xff
```

```python
target = (57, 129, 154, 31, 199, 192, 73, 243,
          43, 176, 255, 173, 54, 203, 67, 15)

key = 90
flag_body = ""
for i, t in enumerate(target):
    c = key ^ t ^ ((i * 13) & 0xff)
    flag_body += chr(c)
    key = (key + c) & 0xff

print(flag_body)
```

```
$ python3 solve.py
c1nd3rbound_v0w5
```

## 5. Flag

```
HTB{c1nd3rbound_v0w5}
```

---

## Root cause summary

| | |
|---|---|
| **Intended difficulty** | Reverse a stripped/compiled bytecode blob and recover a stateful checksum function with no source available. |
| **Actual weakness** | The "rolling key" only ever folds in *past* characters: there's no dependency on characters not yet solved, so the check is a strictly sequential, invertible function rather than a real one-way hash. |
| **Consequence** | Each byte of the flag can be recovered independently in a single forward pass, given only the 16 target bytes and the fixed initial key. |
| **Exploit** | Disassemble with the matching-version `mpy-tool.py`, reconstruct the two XOR mask terms (positional `i*13` and cumulative `key`), then invert byte-by-byte with plain XOR/subtraction: no brute force, no lattice work, no Gröbner basis. |
| **"Fix"** | Use a genuine one-way construction (e.g. a real hash/HMAC over the whole string, or a check that mixes future state into earlier outputs) so partial knowledge of the target doesn't let an attacker peel off characters independently. |
