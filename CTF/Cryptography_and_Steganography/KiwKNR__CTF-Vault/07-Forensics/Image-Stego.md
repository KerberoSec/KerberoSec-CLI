---
tags: [ctf, stego, image, lsb]
created: 2026-05-01
---

# 🖼 Image Steganography

> ซ่อน data ในรูป: มัก LSB ของพิกเซล, color channels, metadata, หรือ compression artifacts

---

## 🔬 LSB (Least Significant Bit) Steganography

### Concept
แต่ละพิกเซลมี RGB หรือ RGBA value (0-255 ต่อ channel = 8 bits)
- เปลี่ยน LSB (last bit) ของแต่ละ channel → ตามนุษย์มอง color difference 0/1 ในแสง 8-bit ไม่ออก
- 1 พิกเซล RGB → 3 bits ซ่อน → 8 พิกเซล = 1 byte

```
Original R: 11001010   (202)
Modified R: 11001011   (203, +1)
```

ตา human ไม่เห็นต่าง: แต่ extract bit 0 ของทุก channel → reconstruct hidden data

### Detection
- Histogram analysis: LSB pattern ที่ "non-random" (แต่ตอน compress JPEG = noisy → LSB stego ไม่ทำงานดี ใน JPG)
- StegOnline → "Bit Plane" view: bit plane 0 ของแต่ละ channel แสดงเป็นภาพ → ถ้ามี structure ที่ไม่ random → มี payload

### Extract LSB
```python
from PIL import Image

img = Image.open('image.png')
pixels = list(img.getdata())

bits = ''
for pixel in pixels:
    r, g, b = pixel[:3]
    bits += str(r & 1)
    bits += str(g & 1)
    bits += str(b & 1)

# Convert bits to bytes
data = bytearray()
for i in range(0, len(bits), 8):
    byte = bits[i:i+8]
    if len(byte) == 8:
        data.append(int(byte, 2))

# Print first 200 chars (might be plaintext)
print(bytes(data[:200]))
```

### Variants
- **LSB ของ R only**: 1 bit/pixel
- **LSB ของ alpha channel**: invisible เลยใน RGB image viewer
- **Last 2 bits / 3 bits**: มากขึ้น แต่ visible ขึ้น
- **Specific channel order**: BGR vs RGB
- **Specific bit order**: MSB first vs LSB first

### tools
- **zsteg** ⭐ (Ruby): PNG/BMP only
  ```bash
  gem install zsteg
  zsteg -a image.png        # try all
  zsteg --lsb image.png
  zsteg -E b1,r,lsb,xy image.png    # specific extraction
  ```

- **stegsolve** (Java): bit plane viewer
- **StegOnline**: web version of stegsolve

---

## 🎨 Color Channel Analysis

### Bit Plane View
แต่ละ channel แยกเป็น 8 bit planes (bit 0 = LSB, bit 7 = MSB)

```
Image → Red → 8 planes (each black/white)
        ↑ MSB plane = ปกติเหมือนภาพต้นฉบับ
        ↑ LSB plane = ปกติ noise (ถ้าไม่มี stego)
```

ถ้า LSB plane มี **โครงสร้าง** (text, shapes) → มี hidden message

### Tools
- **StegOnline** → "Browse bit planes"
- **stegsolve** → Analyze → Bit Plane Order
- ในมือ: extract แต่ละ channel + bit, view เป็น B&W image

### Color filters
ลอง:
- Extract R / G / B / A channels separately
- Negative / Invert
- Different color spaces (HSV, YUV)
- Greyscale conversion
- Increase contrast → invisible details

---

## 📷 Steghide

### Use
รองรับ: JPG, BMP, WAV, AU

```bash
# Embed
steghide embed -ef secret.txt -cf cover.jpg -p PASSWORD

# Extract
steghide extract -sf image.jpg -p PASSWORD

# Show info
steghide info image.jpg -p PASSWORD
```

### Brute force passphrase
```bash
# stegseek
stegseek image.jpg rockyou.txt
# Output: cracked! file extracted to image.jpg.out
```

stegseek เร็วกว่า bruteforce ปกติ 1000x: ลองก่อนเสมอ

### Empty password
หลายโจทย์ใช้ empty password: ลองกด Enter:
```bash
steghide extract -sf image.jpg
```

---

## 🎭 EXIF Metadata

### View
```bash
exiftool image.jpg
```

### Common fields ที่ hide flag
- `Comment`
- `UserComment`
- `Description`
- `Software`
- `Artist`
- `Copyright`
- GPS Location (sometimes coordinates of hint)
- `XMP-dc:Description`

### Extract specific field
```bash
exiftool -Comment image.jpg
exiftool -UserComment image.jpg
```

### Embed (สำหรับลอง)
```bash
exiftool -Comment="HIDDEN_FLAG" image.jpg
```

---

## 🎨 PNG-specific

### Chunks
PNG = sequence of chunks
```
89 50 4E 47 0D 0A 1A 0A    ← signature
[length][type][data][CRC]    ← IHDR (header)
[length][type][data][CRC]    ← maybe iTXt (text)
[length][type][data][CRC]    ← IDAT (image data)
...
[length][type][data][CRC]    ← IEND (end)
```

### Inspect chunks
```bash
pngcheck -v image.png
```

### Common stego in PNG
- Custom chunks (non-standard type): มี payload
- iTXt/zTXt chunks: text data (Unicode/compressed)
- After IEND chunk: ignored by viewer แต่ data ยังอยู่ (use [append-after-EOF](Stego-Intro.md))

### Extract custom chunks
```python
import struct

with open('image.png', 'rb') as f:
    data = f.read()

# Skip signature (8 bytes)
i = 8
while i < len(data):
    length = struct.unpack('>I', data[i:i+4])[0]
    chunk_type = data[i+4:i+8]
    chunk_data = data[i+8:i+8+length]
    print(f"Chunk: {chunk_type}, length={length}")
    if chunk_type not in [b'IHDR', b'IDAT', b'IEND', b'PLTE', b'iTXt', b'zTXt', b'tEXt']:
        print(f"  ⚠️ Custom chunk! Data: {chunk_data[:50]}")
    i += 12 + length    # length(4) + type(4) + data(length) + CRC(4)
```

---

## 🖼 Dimension Trick

### PNG height altered
ดู [Forensics](../07-Forensics/Forensics-Intro.md): บาง challenge แก้ height ใน IHDR เพื่อตัดส่วนที่มี flag

#### Detect
- ดูเปรียบ width/height ใน IHDR กับขนาดที่ปรากฏ
- ลอง extend height → ดูภาพล่างที่ truncated

#### Fix
```python
import struct, zlib

with open('image.png', 'rb') as f:
    data = bytearray(f.read())

# IHDR is at offset 8 (after signature)
# IHDR: 4 bytes length + 'IHDR' + 13 bytes data + 4 bytes CRC
# Width is at 16:20, Height at 20:24

# Set new height
new_height = 1000
data[20:24] = struct.pack('>I', new_height)

# Recompute CRC of IHDR (type + data, 4 + 13 = 17 bytes)
crc = zlib.crc32(data[12:29])
data[29:33] = struct.pack('>I', crc)

with open('fixed.png', 'wb') as f:
    f.write(data)
```

### JPG dimension
ใน JPEG มี SOF (Start Of Frame) marker `FF C0` (or C1, C2): height/width ตามมา

---

## 🎰 Advanced Techniques

### F5 / OutGuess (JPEG)
- F5: embed in DCT coefficients
- OutGuess: similar
- ปัจจุบันไม่ค่อยใช้: เก่า

### JSteg
ลึกใน JPEG: DCT coefficients

### Stegosaurus / Wbstego
รุ่นเก่า

---

## 🔍 Anti-detection / Anti-Statistics

### Histogram preserved
Stego ที่ดี = histogram ของ LSB ดู random (uniform) → ตรวจจับยาก

### Tools to detect
- **stegdetect** (เก่า แต่ work กับ jsteg/outguess/F5)
- **StegExpose**: statistical
- **ML-based stego detection** (research)

ใน CTF ไม่ค่อยต้องใช้: มัก challenge ตั้งใจให้ extract ตรงๆ

---

## 🛠 Common Workflow for Image

```
1. file image.png
2. exiftool image.png
3. strings image.png | grep -i flag
4. binwalk image.png
5. xxd image.png | tail              # extra data after EOF?

6. zsteg -a image.png                 # PNG/BMP
   หรือ
   steghide info image.jpg            # JPG
   stegseek image.jpg rockyou.txt    # brute force

7. Open ใน StegOnline/Aperisolve
   - Bit plane view
   - Channel extract
   - Color filters

8. ลอง decoding แบบต่างๆ
   - Pixel data → bytes → strings
   - LSB → manual extract

9. ถ้ายังไม่ได้: ดู challenge description hint
```

---

## 🎯 ตัวอย่าง CTF

### ตัวอย่าง: PNG with LSB flag
1. `file` → PNG
2. `exiftool` → ปกติ
3. `binwalk` → ปกติ
4. `zsteg image.png`:
   ```
   imagedata           .. text: "flag{wo0t}"
   b1,rgb,lsb,xy       .. text: "flag{wo0t}"
   ```
   → ได้!

### ตัวอย่าง: JPG with steghide
1. `file` → JPG
2. `exiftool` → comment "Try a famous password"
3. `stegseek image.jpg rockyou.txt` → cracked
4. `cat image.jpg.out` → flag

### ตัวอย่าง: Polyglot PNG+ZIP
1. `binwalk image.png`:
   ```
   PNG image
   1234   Zip archive data
   ```
2. `binwalk -e image.png` → extracts ZIP
3. ในนั้นมี secret.txt = flag

---

## 🔗 ที่เกี่ยวข้อง

- [Stego-Intro](Stego-Intro.md)
- [Audio-Stego](Audio-Stego.md)
- [../07-Forensics/Forensics-Intro](../07-Forensics/Forensics-Intro.md)
- [../04-Cryptography/Classical-Ciphers](../04-Cryptography/Classical-Ciphers.md)

---

#ctf #stego #image #lsb
