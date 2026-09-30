# Steganography: Secrets in Images

| Field | Value |
|-------|-------|
| **Category** | Digital Forensics |
| **Difficulty** | Medium |
| **Points** | 200 |
| **Flag** | `CTF{ls8_st3g_m4st3r}` |
| **Tools** | binwalk, zsteg, stegsolve, exiftool, strings |

## Challenge Description

> "This image looks perfectly normal. Or does it?"
>
> Provided: `innocent.png` (a 1920x1080 landscape photo, 4.2 MB)

## Step 1: Basic File Analysis

Start with the fundamentals: verify the file type, check metadata, and look for obvious strings:

```bash
# Confirm file type
file innocent.png
# Output: innocent.png: PNG image data, 1920 x 1080, 8-bit/color RGBA, non-interlaced

# Check metadata
exiftool innocent.png
```

The exiftool output showed standard PNG metadata, but one field was unusual:

```
Comment: "Look deeper than the surface"
```

A hint that data is embedded within the image data itself, not just appended.

```bash
# Search for readable strings
strings innocent.png | grep -i "ctf\|flag\|key\|password"
```

No direct flag in the strings output. The data is hidden more carefully.

## Step 2: Embedded File Detection

Check whether additional files are embedded within the PNG:

```bash
binwalk innocent.png
```

```
DECIMAL       HEXADECIMAL     DESCRIPTION
0             0x0             PNG image, 1920 x 1080, 8-bit/color RGBA, non-interlaced
91            0x5B            Zlib compressed data, default compression
```

Only the expected PNG data: no appended ZIP files, embedded archives, or hidden file signatures. The data is likely hidden in the pixel values themselves.

## Step 3: LSB Steganography Analysis

Least Significant Bit (LSB) steganography hides data by modifying the least significant bits of pixel color values. Since changing the LSB of a color channel alters the value by at most 1 (out of 255), the visual difference is imperceptible.

### Using zsteg

`zsteg` is purpose-built for detecting LSB steganography in PNG and BMP files:

```bash
zsteg innocent.png
```

```
b1,rgb,lsb,xy       .. text: "CTF{ls8_st3g_m4st3r}"
b1,r,lsb,xy         .. file: data
b1,g,lsb,xy         .. file: data
b1,b,lsb,xy         .. file: data
b2,rgb,lsb,xy       .. text: "junk data..."
```

The flag is hidden in the LSB of the RGB channels, read in XY (row-by-row) order: `CTF{ls8_st3g_m4st3r}`

### Using stegsolve

For visual analysis, stegsolve allows cycling through bit planes interactively:

1. Open `innocent.png` in stegsolve
2. Navigate to "Red plane 0" (LSB of red channel)
3. Observe non-random patterns: structured data in the LSB plane indicates hidden content
4. Use Data Extract: select bit 0 of R, G, B channels, LSB first, row order
5. The extracted data reveals the flag

### Manual Extraction with Python

To understand the mechanics, here is a manual extraction:

```python
from PIL import Image

img = Image.open("innocent.png")
pixels = img.load()
width, height = img.size

bits = []
for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        bits.append(r & 1)
        bits.append(g & 1)
        bits.append(b & 1)

# Convert bits to bytes
message = []
for i in range(0, len(bits) - 7, 8):
    byte = 0
    for bit in bits[i:i+8]:
        byte = (byte << 1) | bit
    if byte == 0:  # null terminator
        break
    message.append(chr(byte))

print("".join(message))
```

## Step 4: Verifying the Approach

The image uses RGBA with 8 bits per channel. Each pixel contributes 3 bits of hidden data (one from each of R, G, B). For a 1920x1080 image, the maximum hidden payload is:

```
1920 * 1080 * 3 bits = 6,220,800 bits = 777,600 bytes (~760 KB)
```

The flag is only 21 bytes, using a negligible fraction of the available capacity.

## Underlying Vulnerability

LSB steganography exploits the fact that the least significant bit of each color channel contributes minimally to visual appearance. A pixel with R=200 versus R=201 is indistinguishable to the human eye. This makes it an effective covert channel for hiding small amounts of data.

## Defense and Detection

Detecting steganography is inherently difficult: it is designed to be invisible. However:

- **Statistical analysis**: Tools like `stegdetect` and chi-square analysis can detect non-random patterns in LSB distributions. Natural images have characteristic statistical properties that steganography disrupts.
- **File integrity**: Compare suspect files against known originals using hashes. Any modification, including LSB embedding, changes the hash.
- **Compression**: Converting a PNG to JPEG and back destroys LSB data, as JPEG uses lossy compression. This is a crude but effective countermeasure.
- **Format restrictions**: Stripping metadata and re-encoding uploaded images (as platforms like Twitter and Discord do) neutralizes most steganography.
- **Content inspection**: In high-security environments, all images crossing network boundaries can be re-encoded server-side to strip any hidden payloads.

## References

- [zsteg GitHub](https://github.com/zed-0xff/zsteg)
- [stegsolve](https://github.com/Giotino/stegsolve)
- [LSB Steganography Explained](https://www.sciencedirect.com/topics/computer-science/least-significant-bit-steganography)
- [binwalk Documentation](https://github.com/ReFirmLabs/binwalk)
