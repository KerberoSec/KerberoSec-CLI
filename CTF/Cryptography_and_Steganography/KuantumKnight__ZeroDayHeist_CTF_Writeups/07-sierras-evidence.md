# 07: Sierra's Evidence

> **ZeroDay Heist 2026 · CyberHX**

---

## Challenge Info

| Field | Value |
|---|---|
| **Category** | Forensics / Steganography |
| **Points** | 300 |
| **Difficulty** | Medium |
| **Solved At** | June 6, 2026: 6:42 AM |
| **File** | `evidences.png` |

---

## Description

> Inspector Sierra received a suspicious photo allegedly taken by one of the robbers. The image itself looked harmless, but important evidence was hidden within the image. Flag Format: `0Day-Heist{...}`

A PNG image from the crime scene. The challenge description references "metadata", but the actual hiding technique is a level deeper.

---

## Approach

### Step 1: Standard Forensic Enumeration

```bash
$ file evidences.png
evidences.png: PNG image data, [dimensions], 8-bit/color RGB, non-interlaced

$ exiftool evidences.png
# All standard metadata fields examined
# No flag in Comment, Artist, Description, UserComment, etc.

$ strings evidences.png | grep -i "heist\|0day\|flag"
# No readable flag in printable strings

$ binwalk evidences.png
# No embedded archives detected
```

First-pass enumeration yielded nothing. The challenge description says "metadata tells all", but this is actually the **flag content**, not a hint about where to look.

### Step 2: LSB Steganography Analysis

Since metadata returned nothing, the next step is pixel-level analysis. PNG files are lossless and commonly used for LSB steganography.

```bash
$ zsteg evidences.png
```

The `zsteg` output revealed hidden text embedded in the least significant bits of the image's colour channels.

```bash
# For a more thorough scan:
$ zsteg -a evidences.png
```

### Step 3: Extract and Verify the Flag

The extracted message:

```
0Day-Heist{metadata_tells_all}
```

---

## Why the Flag Says "metadata_tells_all"

This is intentional misdirection by the challenge authors. The flag content (`metadata_tells_all`) is designed to make solvers second-guess themselves:

> "Wait, should I look at metadata?"

But the answer is no: you found the flag through **LSB pixel steganography**. The phrase is the flag's *message content*, not an instruction. It's a classic CTF trick: hide the flag somewhere non-obvious and put a misleading string inside it.

---

## Deep Dive: PNG Colour Channel LSB

`zsteg` systematically tests multiple extraction patterns:

```
b1,r,lsb,xy: bit 1 of Red channel, LSB first, row-by-row
b1,g,lsb,xy: bit 1 of Green channel
b1,b,lsb,xy: bit 1 of Blue channel
b1,rgb,lsb,xy: bits from R+G+B interleaved
b2,r,lsb,xy: bit 2 of Red channel
...
```

For each combination, it extracts the bits, assembles them into bytes, and checks if the result looks like ASCII text, UTF-8, or known file signatures.

---

## Tools Used

| Tool | Purpose |
|---|---|
| `file` | File type identification |
| `exiftool` | Metadata extraction (ruled out) |
| `strings` | Printable string scan (ruled out) |
| `binwalk` | Embedded file check (ruled out) |
| `zsteg` | LSB extraction ✅ |

---

## What I Learned

1. **Don't let flag content mislead you**: `metadata_tells_all` inside the flag is the CTF author being cheeky, not a hint.
2. **When `exiftool` fails, go pixel-level**: the two-step forensics workflow (metadata → LSB) covers the vast majority of PNG steganography challenges.
3. **`zsteg` is fast**: run it after `exiftool` fails, before trying more complex tools like `stegsolve`.

---

## Flag

```
0Day-Heist{metadata_tells_all}
```
