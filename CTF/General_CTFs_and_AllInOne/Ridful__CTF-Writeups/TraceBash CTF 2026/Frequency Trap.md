# Frequency Trap: TraceBash CTF Writeup

**Category:** Forensics  
**Flag:** `TBCTF{frequency_trap_successful}`

---

## Overview

The challenge description says the truth is hidden in frequencies, and that "normal tools will not save you here." We're given a single PNG file. That turns out to be literal: the flag is hidden using a custom DCT-based steganography scheme, XOR'd with a password buried in brainfuck inside the image's EXIF data.

---

## Step 1: Recon

Running `strings` on the PNG immediately surfaces something interesting:

```
HeXIfMM
Method: YCbCr_DCT_8x8_coeff3x3
+++++++++++++++++++++++++++++++++++++++++++++...++.
```

Three things here:

- **`HeXIfMM`**: this is an artifact of `strings` reading across a PNG chunk boundary. The actual chunk type is `eXIf`, and it starts with the TIFF big-endian marker `MM`. The last byte of the chunk length field (`\x48` = `H`) bleeds into the output, producing `HeXIfMM`. Interesting but ultimately a red herring.
- **`Method: YCbCr_DCT_8x8_coeff3x3`**: the steganography method, spelled out explicitly.
- **The brainfuck string**: decodes to `frequencypass`. This is the XOR key.

Inspecting the PNG structure with Python confirms the `eXIf` chunk sits between `IHDR` and `IDAT`, and contains both strings as TIFF-formatted IFD entries.

---

## Step 2: Understand the Method

`YCbCr_DCT_8x8_coeff3x3` describes the algorithm precisely:

1. Convert the image from RGB to **YCbCr** colour space.
2. Take the **Y (luma)** channel.
3. Divide it into **8×8 pixel blocks** (the same unit used in JPEG compression).
4. Apply a 2D **Discrete Cosine Transform** to each block.
5. Read the DCT coefficient at position **[3][3]** in each block.

The only remaining question is how bits are encoded in that coefficient. Inspecting the raw values reveals they cluster tightly around ±26.83: a clean binary signal. The encoding is simply the **sign**: positive = `1`, negative = `0`.

---

## Step 3: Extract and Decrypt

```python
from PIL import Image
import numpy as np
from scipy.fft import dct

img = Image.open("frequency_trap.png").convert("YCbCr")
y = np.array(img.split()[0], dtype=float)
h, w = y.shape

bits = []
for row in range(0, h - 7, 8):
    for col in range(0, w - 7, 8):
        block = y[row:row+8, col:col+8]
        dct_block = dct(dct(block.T, norm='ortho').T, norm='ortho')
        bits.append(1 if dct_block[3][3] > 0 else 0)

# Pack bits to bytes
raw = bytes(
    sum(bits[i+b] << (7 - b) for b in range(8))
    for i in range(0, len(bits) - 7, 8)
)

# XOR with password
key = b'frequencypass'
plaintext = bytes(raw[i] ^ key[i % len(key)] for i in range(256))
print(plaintext[:50])
```

Output:

```
TBCTF{frequency_trap_successful}
```

---

## Summary

|Layer|Detail|
|---|---|
|Container|PNG `eXIf` chunk|
|Password|Brainfuck in EXIF → `frequencypass`|
|Steg method|DCT sign of coeff[3][3] across 8×8 Y-channel blocks|
|Cipher|XOR with repeating key|

The challenge lives up to its name: the data is embedded in DCT frequency space, not in pixel values. `binwalk`, `steghide`, `zsteg`, and `exiftool` all come up empty because the encoding is entirely custom. The method string in the EXIF data is the solve path; everything else follows from reading it carefully.
