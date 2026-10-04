# Steganography

> Hiding data inside innocuous files: images, audio, video, text.

---

## Concept

Steganography ≠ encryption. Encryption makes data unreadable. Steganography makes data **invisible**.

Common carriers: PNG/BMP images, JPEG, MP3/WAV, PDF, text (whitespace, Unicode).

---

## Image Steganography

### LSB (Least Significant Bit): most common
Replace the lowest bit of each pixel's RGB channel with payload bits. Visually imperceptible.

```python
# Detect LSB steganography with stegsolve or PIL
from PIL import Image
import numpy as np

img = np.array(Image.open("suspicious.png"))
lsb_plane = img & 1          # extract LSB of every channel
lsb_img = Image.fromarray((lsb_plane * 255).astype(np.uint8))
lsb_img.save("lsb_plane.png")  # visual patterns = hidden data
```

### Tools
```bash
# zsteg: detect & extract LSB in PNG/BMP
zsteg suspicious.png
zsteg -a suspicious.png        # try all methods
zsteg -E "b1,rgb,lsb,xy" img.png > extracted.bin

# steghide: embed/extract in JPEG/BMP/WAV (uses passphrase)
steghide embed -cf cover.jpg -sf secret.txt -p "password"
steghide extract -sf suspicious.jpg -p "password"
steghide info suspicious.jpg   # check for embedded data

# outguess: similar to steghide
outguess -k "password" -r suspicious.jpg extracted.txt

# stegoveritas: runs 30+ checks automatically
stegoveritas suspicious.png

# binwalk: find appended/embedded files
binwalk suspicious.png
binwalk -e suspicious.png      # extract all found files
```

---

## Audio Steganography

```bash
# Spectrogram analysis: data hidden visually in frequency spectrum
sox audio.wav -n spectrogram -o spec.png
# Or use Audacity: Analyze → Spectrogram
# Look for text/images drawn in the high-frequency bands

# LSB in WAV
stegolsb wavsteg -r -i suspicious.wav -o extracted.bin -n 1

# OpenStego
java -jar OpenStego.jar extract -mf suspicious.wav -sf extracted.bin
```

---

## PDF / Document

```bash
# Check for hidden streams / objects
pdfid suspicious.pdf
pdf-parser.py suspicious.pdf --object 10 --raw

# Strings in PDF
strings suspicious.pdf | grep -v "^[[:space:]]*$" | head -50

# Extract embedded files
binwalk -e suspicious.pdf
pdfextract suspicious.pdf
```

---

## Text Steganography

```bash
# Whitespace steganography (SNOW)
snow -C -m "secret" -p "pass" cover.txt output.txt
snow -C -p "pass" suspicious.txt    # decode

# Unicode zero-width characters
python3 -c "
import unicodedata
text = open('suspicious.txt').read()
hidden = ''.join(c for c in text if unicodedata.category(c) == 'Cf')
print(repr(hidden))
"

# Acrostic / first-letter encoding: read first letter of each line/word
```

---

## CTF Methodology

```bash
# 1. File type check (never trust extension)
file suspicious.xxx
xxd suspicious.xxx | head -5   # check magic bytes

# 2. Strings
strings -n 8 suspicious.xxx | grep -iE "flag|ctf|key|pass|secret"

# 3. Metadata
exiftool suspicious.xxx

# 4. Binwalk (embedded files)
binwalk -e suspicious.xxx

# 5. Image analysis
stegoveritas suspicious.png    # automated
zsteg -a suspicious.png        # LSB variants

# 6. Try steghide with common passwords
steghide extract -sf suspicious.jpg -p ""
steghide extract -sf suspicious.jpg -p "password"
for p in $(cat /usr/share/wordlists/rockyou.txt); do
  steghide extract -sf suspicious.jpg -p "$p" 2>/dev/null && break
done

# 7. Check color planes in GIMP / stegsolve
# 8. Audio: open in Audacity, check spectrogram
```

---

## Common CTF Magic Bytes

| Format | Magic bytes (hex) |
|--------|------------------|
| PNG | `89 50 4E 47 0D 0A 1A 0A` |
| JPEG | `FF D8 FF` |
| PDF | `25 50 44 46` |
| ZIP | `50 4B 03 04` |
| GIF | `47 49 46 38` |
| RAR | `52 61 72 21` |

---

## Tools

| Tool | Purpose |
|------|---------|
| [zsteg](https://github.com/zed-0xff/zsteg) | LSB analysis PNG/BMP |
| [steghide](https://steghide.sourceforge.net) | Embed/extract JPEG/BMP/WAV |
| [stegoveritas](https://github.com/bannsec/stegoveritas) | Automated image checks |
| [stegsolve](https://github.com/zardus/ctf-tools/blob/master/stegsolve) | Visual bit-plane analysis |
| [binwalk](https://github.com/ReFirmLabs/binwalk) | Embedded file extraction |
| [Audacity](https://www.audacityteam.org) | Audio spectrogram analysis |
| [exiftool](https://exiftool.org) | Metadata extraction |
