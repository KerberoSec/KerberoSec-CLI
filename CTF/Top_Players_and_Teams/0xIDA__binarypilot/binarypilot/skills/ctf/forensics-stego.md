---
name: forensics-stego
description: "CTF steganography forensics. LSB extraction, PNG/JPEG/BMP format tricks, PDF hidden layers, SVG animation, steghide, zsteg, stegsolve, bitplane analysis, QR codes hidden in images. Triggers: 'steganography', 'stego', 'ctf forensics', 'hidden data image', 'lsb steganography', 'steghide', 'zsteg', 'stegsolve', 'image forensics', 'png stego', 'jpeg stego'."
---

# CTF Forensics: Steganography

LSB extraction, format-specific tricks, hidden data in PNG/JPEG/BMP/PDF/SVG, tool pipeline.

## Install

```bash
apt-get install -y steghide exiftool binwalk foremost \
  stegdetect pngcheck imagemagick zbar-tools

pip install Pillow --break-system-packages

# zsteg (Ruby):
gem install zsteg

# Stegsolve (Java):
wget https://github.com/zardus/ctf-tools/raw/master/stegsolve/stegsolve.jar
alias stegsolve='java -jar stegsolve.jar'

# jpegio (JPEG coefficient analysis):
pip install jpegio --break-system-packages
```

---

## Phase 1: Initial Triage

```bash
FILE="challenge.png"

# File type check:
file "$FILE"
exiftool "$FILE"

# Metadata secrets:
exiftool "$FILE" | grep -iE "comment|description|author|software|copyright"

# Binwalk for embedded files:
binwalk "$FILE"
binwalk -e "$FILE"   # extract embedded

# Strings hunt:
strings "$FILE" | grep -iE "flag|ctf|htb|picoctf|\{" 
strings "$FILE" | head -100

# Check file size vs expected (might have appended data):
ls -la "$FILE"
identify "$FILE"   # ImageMagick info
```

---

## Phase 2: PNG Analysis

```bash
FILE="challenge.png"

# zsteg: comprehensive LSB analysis:
zsteg "$FILE"
zsteg -a "$FILE"              # all channels
zsteg "$FILE" -b 1 -o xy      # 1-bit, order xy
zsteg "$FILE" -b 1,2 -o xy    # multi-bit

# pngcheck: chunk analysis:
pngcheck -v "$FILE"

# Extract specific bit planes with Pillow:
python3 << 'EOF'
from PIL import Image
import numpy as np

img = Image.open("challenge.png").convert("RGB")
arr = np.array(img)

# Extract LSB plane:
lsb = (arr & 1) * 255
Image.fromarray(lsb.astype(np.uint8)).save("lsb.png")

# Extract specific bit plane (bit 0-7):
for bit in range(8):
    plane = ((arr >> bit) & 1) * 255
    Image.fromarray(plane.astype(np.uint8)).save(f"bit{bit}.png")
EOF

# QR code detection in hidden pixel grids:
python3 -c "
from PIL import Image
import zxing

img = Image.open('challenge.png')
reader = zxing.BarCodeReader()
result = reader.decode('challenge.png')
print(result.parsed if result else 'No QR found')
"

# Check for hidden data beyond image dimensions:
python3 -c "
from PIL import Image
img = Image.open('challenge.png')
print(f'Dimensions: {img.size}')
# Look for data outside stated width/height
"
```

---

## Phase 3: JPEG Analysis

```bash
FILE="challenge.jpg"

# steghide extraction (common tool for JPEG):
steghide extract -sf "$FILE"          # prompt for password
steghide extract -sf "$FILE" -p ""    # empty password
steghide extract -sf "$FILE" -p "password"

# Try common steghide passwords:
while IFS= read -r pass; do
  steghide extract -sf "$FILE" -p "$pass" 2>/dev/null && echo "Password: $pass" && break
done < /usr/share/wordlists/rockyou.txt

# DCT coefficient analysis:
python3 << 'EOF'
import jpegio as jio
import numpy as np

j = jio.read("challenge.jpg")
# Check for F5 steganography (DCT coefficient histogram):
print("Quantization tables:", len(j.quant_tables))
for i, table in enumerate(j.coef_arrays):
    coefs = table.flatten()
    zeros = np.sum(coefs == 0)
    ones = np.sum(coefs == 1)
    neg_ones = np.sum(coefs == -1)
    print(f"Component {i}: zeros={zeros}, ones={ones}, -ones={neg_ones}")
    # F5: ratio of ones to neg_ones unusual
EOF

# stegdetect:
stegdetect "$FILE"
```

---

## Phase 4: BMP Analysis

```bash
FILE="challenge.bmp"

# BMP has multiple bit planes to analyze:
python3 << 'EOF'
from PIL import Image
import numpy as np

img = Image.open("challenge.bmp")
arr = np.array(img)

# BMP channels (BGR order usually):
r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]

for name, ch in [("red", r), ("green", g), ("blue", b)]:
    for bit in range(8):
        plane = ((ch >> bit) & 1)
        # Convert bitplane to bytes:
        bits = plane.flatten()
        msg_len = len(bits) // 8
        chars = []
        for i in range(0, len(bits) - 7, 8):
            byte = 0
            for j in range(8):
                byte = (byte << 1) | bits[i+j]
            if 32 <= byte <= 126:
                chars.append(chr(byte))
        text = ''.join(chars)
        if any(kw in text for kw in ['flag', 'ctf', 'CTF', '{', 'FLAG']):
            print(f"FOUND in {name} bit {bit}: {text[:100]}")
EOF
```

---

## Phase 5: Audio Steganography

```bash
FILE="challenge.wav"

# Visual spectrum analysis:
sox "$FILE" -n spectrogram -o spectrum.png
# Open spectrum.png: flag may be visible in spectrogram

# Morse code decode:
python3 -c "
import librosa, numpy as np
y, sr = librosa.load('challenge.wav', sr=None)
# Look for amplitude patterns: loud=dash, short=dot
"

# LSB in WAV:
python3 << 'EOF'
import wave, struct

with wave.open("challenge.wav", 'rb') as f:
    frames = f.readframes(f.getnframes())
    # Extract LSB from each frame:
    bits = [b & 1 for b in frames]
    chars = []
    for i in range(0, len(bits) - 7, 8):
        byte = int(''.join(str(b) for b in bits[i:i+8]), 2)
        if 32 <= byte <= 126:
            chars.append(chr(byte))
    print(''.join(chars)[:200])
EOF
```

---

## Phase 6: PDF Steganography

```bash
FILE="challenge.pdf"

# PDF analysis:
pip install pikepdf --break-system-packages

python3 << 'EOF'
import pikepdf

pdf = pikepdf.open("challenge.pdf")
print(f"Pages: {len(pdf.pages)}")
print("Metadata:", dict(pdf.docinfo))

# Extract all objects:
for i, obj in enumerate(pdf.objects):
    try:
        if hasattr(obj, 'stream_data'):
            data = obj.stream_data
            if b'flag' in data.lower() or b'ctf' in data.lower():
                print(f"Object {i}: {data[:200]}")
    except:
        pass

# Extract compressed streams:
for page in pdf.pages:
    for key, val in page.items():
        print(f"{key}: {val}")
EOF

# Strings in PDF:
strings "$FILE" | grep -iE "flag|ctf|\{"

# Embedded files:
binwalk "$FILE" -e
```

---

## Phase 7: Tool Pipeline

```bash
# Quick-check pipeline for any image:
FILE="$1"

echo "=== File Info ==="
file "$FILE" && exiftool "$FILE" | grep -iE "comment|software|description"

echo "=== Strings ==="
strings "$FILE" | grep -iE "flag|ctf|\{" | head -10

echo "=== Embedded Files ==="
binwalk "$FILE"

echo "=== Steghide (empty password) ==="
steghide extract -sf "$FILE" -p "" 2>/dev/null && cat out.txt 2>/dev/null

echo "=== zsteg ==="
zsteg "$FILE" 2>/dev/null | head -20

echo "=== PNG Check ==="
pngcheck -v "$FILE" 2>/dev/null | tail -20
```

---

## Output

Save to `.omop/engagement/ctf/forensics/`:
- `extracted/`: binwalk/foremost extracted files
- `bitplanes/`: bit plane images
- `hidden-data.txt`: discovered hidden content

## Next Phase

→ `ctf-forensics-network` for PCAP analysis
→ `ctf-reverse-tools` for binary reverse engineering
