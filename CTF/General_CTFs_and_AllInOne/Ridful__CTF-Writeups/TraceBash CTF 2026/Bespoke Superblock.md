# Bespoke Superblock: TraceBash CTF

**Category:** Forensics  
**Points:** 100  
**Flag:** `TBCTF{spat1al_aware_xor_1337}`

---

## Overview

We're given a small disk image (`challenge.img`, 8224 bytes) and a partially-written Python parser. Standard forensic tools can't read the image because it uses a custom filesystem ("TBFS"). The parser reads the superblock and recovers data from it, but leaves a `TODO` where decoding should happen and warns: _"Check spatial consistency."_

---

## Reconnaissance

The image contains two regions of interest:

- **0x0000: 0x0FFF**: A standard FAT boot sector (red herring / padding).
- **0x1000 onward**: A custom "TBFS" filesystem.

Running the supplied parser confirms the superblock at `0x1000`:

```
[+] Found Custom Filesystem!
    Block Size: 512
    Total Blocks: 8
    Flag Inode: 0x1020
```

The raw recovered bytes are:

```
tbctf[SPAT\x11AL\x7fAWARE\x7fXOR\x7f\x11\x13\x13\x17]
```

The printable fragments spell out **"SPATIAL AWARE XOR"**: the data is taunting us with its own decoding instructions.

---

## Vulnerability / Encoding Layer

The parser reads 4 bytes from the start of each of the 8 blocks, but skips the decoding step. The clue is in how the blocks are addressed:

```
offset = flag_inode + (i × block_size)
       = 0x1020    + (i × 0x200)
```

This means every block lives at an address ending in `0x20`:

|Block|Absolute Offset|Low Byte (XOR Key)|
|---|---|---|
|0|`0x1020`|`0x20`|
|1|`0x1220`|`0x20`|
|…|…|`0x20`|
|6|`0x1C20`|`0x20`|
|7|`0x1E20`|`0x20`|

The **XOR key for each block is the low byte of its absolute file offset**: `0x20` in every case. This is the "spatial awareness": you can't decode without knowing _where on disk_ each block lives.

---

## Solving It

XOR each recovered byte with `0x20`:

|Block|Raw|Key|Decoded|
|---|---|---|---|
|0|`74 62 63 74`|`0x20`|`TBCT`|
|1|`66 5B 53 50`|`0x20`|`F{sp`|
|2|`41 54 11 41`|`0x20`|`at1a`|
|3|`4C 7F 41 57`|`0x20`|`l_aw`|
|4|`41 52 45 7F`|`0x20`|`are_`|
|5|`58 4F 52 7F`|`0x20`|`xor_`|
|6|`11 13 13 17`|`0x20`|`1337`|
|7|`5D 20 20 20`|`0x20`|`}`|

Concatenated: **`TBCTF{spat1al_aware_xor_1337}`**

---

## Solve Script

```python
import struct

def solve(img_path):
    with open(img_path, "rb") as f:
        data = f.read()

    magic, block_size, total_blocks, flag_inode = struct.unpack(
        '<4s H I I 2x', data[0x1000:0x1010]
    )
    assert magic == b'TBFS'

    flag = b''
    for i in range(total_blocks):
        offset = flag_inode + (i * block_size)
        chunk = data[offset:offset + 4]
        xor_key = offset & 0xFF  # spatial awareness: offset low byte = key
        flag += bytes(b ^ xor_key for b in chunk)

    print(flag.rstrip(b'\x00').decode())

solve("challenge.img")
# TBCTF{spat1al_aware_xor_1337}
```

---

## Key Takeaways

- When a custom filesystem is involved, the _physical location_ of data on disk can be part of the encoding: not just the content.
- Hints embedded in the plaintext of encoded data are a classic CTF technique; the partially-decoded output telling you "SPATIAL AWARE XOR" was the solve path.
- `offset & 0xFF` is a compact but effective positional XOR scheme: simple to miss if you're only looking at the data, not where it lives.
