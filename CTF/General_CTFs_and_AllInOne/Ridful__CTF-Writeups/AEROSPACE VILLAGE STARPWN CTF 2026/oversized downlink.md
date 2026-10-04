

# Oversized Downlink Writeup

**Category:** SIGINT / Stego
**Challenge:** Oversized Downlink  

## Overview

The challenge gives us a 256×256 image that looked like a noisy, blurry thumbnail

The prompt said the satellite downlinked what was supposed to be a normal 256×256 thumbnail, but the bandwidth telemetry showed the transmission was larger than expected.

That hint suggests the image may contain extra hidden data, likely through stego.

## Initial Observation

The image appears visually random, with no obvious readable text. Since it is a small RGB image, a good first step is to inspect the individual color channels and bit planes.

For image steganography challenges, hidden data is often placed in the **least significant bits** (LSB) of pixel values because changing those bits barely affects the visible image

## LSB Steganography

Each pixel channel value is stored as an 8-bit number from 0 to 255.

For example:

```
10110110
```

The final bit is the least significant bit, or LSB. Changing it only changes the color value by 1, which is usually invisible to the human eye.

Because this image had suspicious “extra” data, I checked the LSBs of the red, green, and blue channels.

## Extraction

The hidden message was stored in the **least significant bit of the red channel**.

The extraction process was:

1. Open the image.
2. Read pixels in row-major order.
3. Take the least significant bit of the red channel for each pixel.
4. Group the bits into bytes.
5. Convert each byte to ASCII.

Example script:

```
from PIL import Image

img = Image.open("downlink.png").convert("RGB")
pixels = img.load()

bits = []

width, height = img.size

for y in range(height):
    for x in range(width):
        r, g, b = pixels[x, y]
        bits.append(r & 1)

chars = []

for i in range(0, len(bits), 8):
    byte = bits[i:i+8]

    if len(byte) < 8:
        break

    value = 0
    for bit in byte:
        value = (value << 1) | bit

    chars.append(chr(value))

message = "".join(chars)
print(message)
```

## Result

The extracted ASCII text revealed the flag:

```
STARPWN{lsb_st3g0_1n_th3_d0wnl1nk_ch4nnel}

