---
tags: [ctf, forensics, fundamentals]
created: 2026-05-01
---

# 🔬 Forensics: บทนำ

> **Digital Forensics** = การกู้, วิเคราะห์, และตีความ digital evidence: ใน CTF: หา flag ที่ซ่อนใน file/memory/network capture

---

## 🎯 ประเภทโจทย์ Forensics

### 1. Memory Forensics
- RAM dump (.raw, .vmem, .dmp)
- หาด้วย Volatility: process, network, registry, files

### 2. Network Forensics
- Packet capture (.pcap, .pcapng)
- วิเคราะห์ด้วย Wireshark: extract files, decode protocols

### 3. Disk Forensics
- Disk image (.dd, .img, .e01)
- File system analysis, deleted files recovery
- Tools: Autopsy, Sleuth Kit

### 4. File Forensics / Carving
- ไฟล์ corrupted หรือมีไฟล์ฝัง
- binwalk, foremost, scalpel

### 5. Log Analysis
- Apache/Nginx logs, Windows Event logs
- ตามรอย attacker

### 6. Document Analysis
- Office/PDF macros, embedded files
- Metadata, hidden text

---

## 🛠 Tools ที่ต้องมี

### Memory
- **Volatility 3** ⭐: `pip install volatility3`
- **Volatility 2** (เก่า: บาง plugin ยังต้องใช้)

### Network
- **Wireshark** ⭐
- **NetworkMiner**: auto-extract files, credentials
- **tcpdump**: CLI capture
- **Zeek (Bro)**: log-based

### Disk
- **Autopsy** ⭐ (GUI)
- **Sleuth Kit** (CLI underlying)
- **TestDisk / PhotoRec**: recover partitions/files

### File
- **binwalk**: file carving
- **foremost**: file carving
- **scalpel**: configurable carving
- **bulk_extractor**: extract artifacts (emails, URLs, etc.)
- **exiftool**: metadata
- **strings**: printable strings
- **xxd / hexdump / ImHex**: hex view

### Document
- **olevba / oletools**: Office macros
- **pdf-parser / pdfid**: PDF analysis
- **peepdf**: PDF interactive

### General
- **CyberChef**: encode/decode swiss knife
- **file**: identify file type

---

## 🎓 Methodology

```
1. Identify what we have
   - file <evidence>     → type
   - md5sum, sha256sum   → integrity (later)

2. Quick wins
   - strings <file> | grep -i flag
   - exiftool <file>     → metadata
   - binwalk <file>      → embedded

3. Deep analysis
   - Open in proper tool (Volatility, Wireshark, etc.)
   - Follow the trail

4. Document findings
   - Take notes, hash artifacts
```

---

## 📋 First Commands ทุกครั้งที่เจอไฟล์

```bash
# Identify
file evidence.bin

# Magic bytes (first 16 bytes)
xxd evidence.bin | head -1

# Strings
strings -n 8 evidence.bin | head
strings evidence.bin | grep -iE "(flag|password|key)"

# Embedded
binwalk evidence.bin

# Metadata
exiftool evidence.bin
```

ก่อน deep dive: workflow นี้ใช้ 2 นาที แต่อาจจบ challenge ทันที!

---

## 🎯 Pattern: "ไฟล์ corrupted"

### ตรวจ Magic bytes
ดู first bytes: match กับ format มาตรฐาน?

```bash
xxd file.unknown | head -1
# 89 50 4E 47 0D 0A 1A 0A → PNG
# FF D8 FF E0 → JPEG
# 50 4B 03 04 → ZIP
```

### ถ้า magic ผิด: fix it
```python
# Fix PNG header
data = open('broken.png', 'rb').read()
data = b'\x89PNG\r\n\x1a\n' + data[8:]
open('fixed.png', 'wb').write(data)
```

### ถ้า image dimensions ผิด → ลองแก้
PNG width/height อยู่ที่ offset 16-23 (big-endian)

```python
# PNG dimension fix
import struct
with open('image.png', 'rb') as f:
    data = bytearray(f.read())

new_height = struct.pack('>I', 1000)
data[20:24] = new_height

# Recompute CRC of IHDR chunk
import zlib
ihdr_data = data[12:29]              # type + data
crc = zlib.crc32(ihdr_data)
data[29:33] = struct.pack('>I', crc)

open('fixed.png', 'wb').write(data)
```

---

## 🎯 Pattern: "ไฟล์มีอะไรซ่อนข้างใน"

### binwalk extract
```bash
binwalk -e suspicious.png
# Creates _suspicious.png.extracted/ directory
```

### foremost
```bash
foremost suspicious.bin -o output_dir
```

### Manual carving
```bash
# Find sub-files
binwalk suspicious.bin

# Extract specific offset
dd if=suspicious.bin of=embedded.zip bs=1 skip=12345 count=1000
```

---

## 🎯 Pattern: "หา flag ใน memory dump"

```bash
# Quick: strings
strings memdump.raw | grep -i "flag{"

# Full Volatility
vol -f memdump.raw windows.info       # OS detect
vol -f memdump.raw windows.pslist
vol -f memdump.raw windows.cmdline
```

ดูเพิ่มใน [Memory-Forensics](Memory-Forensics.md)

---

## 🎯 Pattern: "หา flag ใน pcap"

```bash
# Quick: strings
strings capture.pcap | grep -i flag

# Wireshark
# Statistics → Conversations
# Statistics → Endpoints
# File → Export Objects → HTTP
```

ดูเพิ่มใน [Network-Forensics](Network-Forensics.md)

---

## 🎯 Pattern: "ไฟล์เป็น text แต่อ่านไม่ออก"

ลอง:
- decode base64 → maybe nested
- hex decode
- ROT13/47
- Different encoding (UTF-16, etc.)
- CyberChef "Magic"

---

## 🎯 Common Hiding Places

ใน CTF flag มัก hide ใน:

### Files
- Metadata (EXIF, ID3, Comments)
- Slack space (file ที่ size mismatch)
- Embedded files (zip in image, etc.)
- Alternate Data Streams (Windows NTFS)
- After EOF (extra bytes after expected end)

### Images
- LSB (least significant bit) of pixels: [Steganography](Steganography.md)
- Color channels (R/G/B separately)
- Spectrogram (in audio)
- Comments in PNG/JPG

### Documents
- Hidden text (white text, font 0)
- Comments, tracked changes
- Embedded objects (Word with hidden Excel)
- Macros

### Memory
- Process memory (regex search)
- Browser history (chrome://history equivalent)
- Clipboard (clipboard API)
- Recent files

---

## 🎓 Mindset

### "Be systematic"
ทำ checklist ทุกครั้ง:
- file
- strings
- exiftool
- binwalk
- xxd | head, xxd | tail

### "Trust nothing: verify"
- ขนาดไฟล์ตรงกับ format ที่ระบุไหม
- Magic bytes ตรงกับ extension ไหม
- Hash ตรงกับ original ไหม

### "Patience"
Forensics โจทย์มัก need digging: 30 นาทีเริ่มต้น แต่ resolution อาจ instantly

---

## 🔗 ต่อไป

- [Memory-Forensics](Memory-Forensics.md)
- [Network-Forensics](Network-Forensics.md)
- [Disk-Forensics](Disk-Forensics.md)
- [../08-Steganography/Stego-Intro](../08-Steganography/Stego-Intro.md)

## 📚 References

- "The Art of Memory Forensics": Ligh
- "File System Forensic Analysis": Carrier
- DFIR.training
- volatility-labs.blogspot.com

---

#ctf #forensics
