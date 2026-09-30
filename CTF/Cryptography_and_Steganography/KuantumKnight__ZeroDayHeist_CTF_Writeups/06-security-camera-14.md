# 06: Security Camera #14-AMRRISH ROSHAN

> **ZeroDay Heist 2026 · CyberHX**

---

## Challenge Info

| Field | Value |
|---|---|
| **Category** | Forensics |
| **Points** | 100 |
| **Difficulty** | Easy |
| **Solved At** | June 6, 2026: 6:36 AM |
| **File** | `camera14.png` |

---

## Description

> During the Royal Mint operation, one of the CCTV cameras captured suspicious activity. The police recovered an image from Camera #14 but believe someone hid a message inside it. Flag Format: `0Day-Heist{}`

A forensics/steganography challenge centred around a CCTV-style PNG image. The flag is hidden inside the image data, but not in the metadata.

---

## Approach

### Step 1: Initial Enumeration

Always begin with the full standard forensic stack:

```bash
$ file camera14.png
camera14.png: PNG image data, [dimensions], 8-bit/color RGBA, non-interlaced

$ exiftool camera14.png
# Output reviewed: no flag in metadata fields
# Comment, Artist, Description, UserComment all clean

$ strings camera14.png | grep -i "heist\|flag\|day\|0Day"
# No readable flag in printable strings

$ binwalk camera14.png
# No embedded archives or secondary files detected
```

All standard metadata and embedding checks came up clean. The flag is hidden at the pixel level.

### Step 2: LSB Steganography with zsteg

`zsteg` is the go-to tool for LSB (Least Significant Bit) steganography in PNG images. It analyses multiple bit planes and channel combinations automatically.

```bash
$ zsteg camera14.png
```

**What zsteg checks:**
- RGB and RGBA channel combinations
- LSB of each colour channel (Red, Green, Blue, Alpha)
- Multiple bit-depth planes (b1, b2, b3...)
- Both row-order and column-order bit reading

The hidden content was revealed in one of the LSB channels.

### Step 3: Deeper Scan (if needed)

```bash
$ zsteg -a camera14.png
# -a: try all known methods
```

The flag appeared clearly in the output.

---

## Background: What is LSB Steganography?

In a standard 24-bit RGB PNG image, each pixel has three colour channels (R, G, B), each stored as an 8-bit value (0-255). The **least significant bit** of each channel has a visually imperceptible effect on the image: changing a value from 128 to 129 is invisible to the human eye.

By replacing these least significant bits with the bits of a secret message, you can hide data inside an image with no visible change.

**Example (hiding `A` = 0x41 = 01000001):**

```
Original pixel R channel:  11001100
Hidden bit (0):            11001100  ← unchanged
Hidden bit (1):            11001101  ← changed by 1 (invisible)
```

`zsteg` reverses this process: it extracts the LSBs from each channel in various orders and attempts to interpret them as ASCII text.

---

## Tools Used

| Tool | Purpose |
|---|---|
| `file` | File type identification |
| `exiftool` | Metadata extraction (ruled out) |
| `strings` | Printable string scan (ruled out) |
| `binwalk` | Embedded file detection (ruled out) |
| `zsteg` | LSB steganography extraction ✅ |

### Installing zsteg

```bash
gem install zsteg
```

---

## What I Learned

1. **Follow the checklist in order**: metadata → strings → binwalk → LSB. Don't jump to `zsteg` immediately; the earlier steps are faster.
2. **`zsteg -a` is your safety net**: if the standard `zsteg` output doesn't show the flag, the `-a` flag tries all known extraction methods.
3. **PNG + CTF = think LSB**: PNG is lossless compression, which makes it ideal for LSB steganography (JPEG compression would destroy LSB data).

---

## Flag

```
0Day-Heist{caught_on_camera}
```
