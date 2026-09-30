---
tags: [ctf, stego, steganography, fundamentals]
created: 2026-05-01
---

# 🎭 Steganography: บทนำ

> **Steganography** = ซ่อนข้อมูลใน "carrier" (รูป, เสียง, video, text): ผู้เห็น carrier ปกติจะไม่รู้ว่ามีข้อมูลซ่อนอยู่
>
> ต่างจาก [Cryptography](../04-Cryptography/Classical-Ciphers.md) ที่ซ่อน "ความหมาย": Stego ซ่อน "การมีอยู่"

ใน CTF: hide flag ในรูป/เสียง: ต้องสกัดออกมา

---

## 🎯 ประเภท Stego

### 1. Image Stego ⭐ พบบ่อยที่สุด
- LSB (Least Significant Bit) ของพิกเซล
- Color channel separation
- EXIF metadata
- Comments
- Image dimensions trick
- Polyglot (image + zip)

### 2. Audio Stego
- LSB ของ audio samples
- Spectrogram (visual ใน frequency domain)
- Echo hiding
- Phase coding
- DTMF / Morse encoded

### 3. Video Stego
- Frame-based (frame ที่มี payload)
- Per-frame LSB
- Subtitle tracks
- ส่วนใหญ่ใช้ technique ของ image กับแต่ละ frame

### 4. Text Stego
- Whitespace (space/tab patterns)
- Zero-width characters (U+200B etc.)
- Capitalization patterns
- Word/character frequency
- Bacon's cipher within text

### 5. File Format Stego
- Polyglots (file ที่ valid ในหลาย format)
- Append-after-EOF
- Hidden in metadata
- Slack space

### 6. Network Stego
- Timing channel (ระยะเวลาส่ง)
- Header fields ที่ไม่ใช้ (TCP options, IP TTL pattern)
- ICMP data field

---

## 🧠 Mindset

### "Always check the obvious first"
ก่อน deep stego analysis:
1. `strings file | grep flag`
2. `exiftool file`
3. `file file`
4. `xxd file | head` และ `tail`
5. `binwalk file`

มัก จบ challenge ด้วยขั้นตอนเหล่านี้!

### "Carrier is normal-looking"
ถ้ารูปดู "ปกติ" → ไม่ได้แปลว่าไม่มี stego: โดยจุดประสงค์
- ดู metadata (EXIF, ID3): มัก leak hint
- File size แปลกหรือไม่ (ใหญ่กว่ารูปเดียวกันที่ไม่มี payload)
- Dimensions ตรงกับขนาดที่ปรากฏไหม

### "Try multiple tools"
ไม่มี tool เดียวที่ทำได้ทุกอย่าง: ลอง stack เต็ม:
- `aperisolve.com`: auto-tries many techniques
- `stegonline.georgeom.net`: interactive
- `zsteg`, `steghide`, `outguess`, `stegseek`

---

## 🛠 Universal First-Pass Tools

### file
```bash
file image.png
# → PNG image data, 800 x 600, 8-bit/color RGB, non-interlaced
```

ดูว่า format ตรงกับ extension ไหม

### strings
```bash
strings image.png | grep -iE "flag|key|password|secret"
strings -n 12 image.png | head -50
```

### exiftool
```bash
exiftool image.jpg
```
- Camera info
- GPS coordinates (sometimes a clue)
- Comment field: มัก hide flag ตรงนี้
- XMP/IPTC metadata

### binwalk
```bash
binwalk image.png             # detect embedded
binwalk -e image.png          # extract embedded
```

ตรวจหาไฟล์ฝัง (zip, png-in-png, etc.)

### xxd / hexdump
```bash
xxd image.png | head -3       # ดู magic bytes
xxd image.png | tail -10      # ดูหลัง expected EOF
```

### Magic bytes ของ format ต่างๆ
| Format | Start | End |
|--------|-------|-----|
| PNG | `89 50 4E 47 0D 0A 1A 0A` | `49 45 4E 44 AE 42 60 82` (IEND chunk) |
| JPG | `FF D8 FF` | `FF D9` |
| GIF | `47 49 46 38` | `00 3B` |
| ZIP | `50 4B 03 04` | `50 4B 05 06` (EOCD) |
| PDF | `25 50 44 46` | `25 25 45 4F 46` |
| MP3 | `FF FB` หรือ `49 44 33` (ID3) | varies |
| WAV | `52 49 46 46` (RIFF) | varies |

---

## 🎨 Aperisolve ⭐ Auto-Solver

**aperisolve.com**: upload image → auto runs:
- LSB extraction (all channels)
- Color filters
- Strings
- Steghide (with empty password)
- zsteg
- exiftool
- More

→ เปิด tab อื่นเขียน writeup ขณะ aperisolve รัน: บางครั้งจบทั้งหมดในนาทีเดียว

---

## 🎨 StegOnline

**stegonline.georgeom.net**: interactive tool
- Bit plane viewer
- Color extractor
- LSB extract
- Stego embed/decode

ใช้เมื่อต้องการเห็นแต่ละ bit plane visually

---

## 📐 Polyglot Files

ไฟล์เดียวที่ valid ใน 2+ format

### Common: image + ZIP
```bash
cat image.jpg secret.zip > polyglot.jpg
unzip polyglot.jpg          # works! extracts secret
```

ทำได้เพราะ:
- JPG parsers อ่านจาก SOI marker → ignore data หลัง EOI
- ZIP parsers อ่านจาก End of Central Directory backwards → ignore data ก่อนหน้า

### Detection
```bash
binwalk polyglot.jpg
# → JPEG image data + Zip archive data
```

### Extract
```bash
binwalk -e polyglot.jpg
unzip polyglot.jpg

# Manual
unzip -p polyglot.jpg                   # extract from middle of file
```

### Other polyglots
- HTML + JS + PNG (header ที่ start เหมือน HTML)
- PDF + everything (PDF flexible)
- Image + PHP (server execute as PHP, viewer sees image)

---

## 📨 Append-After-EOF

ไฟล์มี data หลัง expected end → file viewer ignore แต่ data ยังอยู่

### Detect
```bash
# Compare actual size vs expected
xxd image.png | tail -5
# Look for IEND chunk - if data after, suspicious
```

### Extract (PNG example)
```python
data = open('image.png', 'rb').read()
# Find IEND
end = data.find(b'IEND') + 8        # IEND + 4 bytes CRC
hidden = data[end:]
open('hidden.bin', 'wb').write(hidden)
```

---

## 🔢 Encoding Layered

CTF ชอบเล่น layers:
1. ดูรูป → exiftool comment = base64
2. Decode base64 → ZIP file (binary)
3. Unzip → text file ที่เป็น hex
4. Decode hex → encoded with caesar
5. Decode → flag

→ **อย่ายอม after one layer**: หลายที่ซ้อนกัน

---

## 🔧 Tools List Quick Reference

| Tool | ใช้กับ |
|------|--------|
| **steghide** | JPG, BMP, WAV, AU (with passphrase) |
| **stegseek** | Brute force steghide passphrase |
| **zsteg** | PNG, BMP (Ruby) |
| **outguess** | JPG (older, less common now) |
| **stegsolve** (Java) | Bit plane analysis |
| **steganabara** | Image bit plane / channel |
| **wbStego** | BMP |
| **OpenStego** | PNG, BMP |
| **DeepSound** | Audio (.wav, .mp3) |
| **sonic-visualiser** | Audio spectrogram |
| **Audacity** | Audio analysis (FOSS) |
| **exiftool** | All metadata |
| **binwalk** | Embedded files, file carving |
| **foremost** | File carving |
| **strings** | Printable strings |
| **CyberChef** | Encoding swiss knife |

---

## 🎓 ขั้นตอนแก้โจทย์ Stego

```
1. file <evidence>           → format ตรงกับ extension?
2. strings | grep flag       → quick win
3. exiftool                  → metadata
4. binwalk                   → embedded files
5. xxd | head/tail           → magic bytes? extra data?

6. Image-specific:
   - Open in StegOnline / Aperisolve
   - Try zsteg (PNG/BMP)
   - Try steghide (JPG/BMP/WAV) with empty pass
   - Brute force with stegseek

7. Audio-specific:
   - sonic-visualiser → spectrogram
   - Try DeepSound
   - LSB extract

8. ลอง multiple layers
```

---

## 🔗 ต่อไป

- [Image Stego ลึก](Image-Stego.md)
- [Audio Stego ลึก](Audio-Stego.md)
- [Related: Forensics](../07-Forensics/Forensics-Intro.md)
- [Related: Encoding/Decoding](../04-Cryptography/Classical-Ciphers.md)

## 📚 References

- aperisolve.com
- stegonline.georgeom.net
- futureboy.us/stegano
- "Information Hiding: Steganography and Watermarking": Cox

---

#ctf #stego #steganography
