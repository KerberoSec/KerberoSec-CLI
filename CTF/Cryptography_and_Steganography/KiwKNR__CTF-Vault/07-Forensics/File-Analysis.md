---
tags: [ctf, forensics, file-analysis]
created: 2026-05-02
---

# 📄 File Analysis

> ขั้นตอนแรกเสมอเมื่อเจอไฟล์ปริศนา: identify, inspect, extract embedded content

---

## 🚦 First-Pass Workflow

```bash
# 1. Identify
file evidence.bin
xxd evidence.bin | head -3              # magic bytes

# 2. Quick wins
strings -n 8 evidence.bin | grep -iE "flag|password|key|secret"
exiftool evidence.bin                    # metadata

# 3. Embedded files
binwalk evidence.bin
binwalk -e evidence.bin                  # extract

# 4. Compare actual vs expected size
xxd evidence.bin | tail -5               # data after expected EOF?
```

ใช้ checklist นี้ก่อน deep dive: มัก จบโจทย์ใน 2 นาที

---

## 🔍 Magic Bytes Reference

| Bytes (hex) | Format |
|-------------|--------|
| `89 50 4E 47 0D 0A 1A 0A` | PNG |
| `FF D8 FF` | JPEG |
| `47 49 46 38` | GIF |
| `25 50 44 46` | PDF |
| `50 4B 03 04` | ZIP / DOCX / XLSX / APK / JAR |
| `52 61 72 21` | RAR |
| `1F 8B 08` | gzip |
| `42 5A 68` | bzip2 |
| `FD 37 7A 58 5A 00` | xz |
| `7F 45 4C 46` | ELF (Linux executable) |
| `4D 5A` | PE (Windows .exe/.dll) |
| `CA FE BA BE` | Java class / Mach-O fat |
| `FE ED FA CE` | Mach-O 32-bit |
| `FE ED FA CF` | Mach-O 64-bit |
| `52 49 46 46` | RIFF (WAV, AVI) |
| `49 44 33` | MP3 (ID3v2) |
| `66 74 79 70` (offset 4) | MP4 |

### Identify ผิด extension
```bash
file mystery.png
# PNG image data ✓
# OR
# data: ผิด format!
```

ถ้าผิด → rename + re-analyze

---

## 🛠 Tools

### file (built-in)
```bash
file evidence.bin
# Output: format + sometimes details
```

### TrID
ละเอียดกว่า `file`: รู้จัก format มากกว่า:
```bash
trid evidence.bin
```

### binwalk ⭐
```bash
binwalk evidence.bin                     # detect
binwalk -e evidence.bin                  # extract embedded
binwalk -E evidence.bin                  # entropy graph
binwalk --dd='.*' evidence.bin           # extract all to dir
binwalk -A evidence.bin                  # ARM/MIPS opcode scan
```

### foremost
```bash
foremost -i evidence.bin -o output_dir
```

### scalpel
```bash
# Edit /etc/scalpel/scalpel.conf: uncomment file types
scalpel evidence.bin -o output_dir
```

### bulk_extractor
Extracts: emails, URLs, credit cards, base64, IP addresses
```bash
bulk_extractor -o output evidence.bin
```

### exiftool
```bash
exiftool evidence.jpg
# Look for: Comment, Description, GPS, custom XMP fields
```

### strings (variants)
```bash
strings -n 8 file                        # min length 8
strings -e l file                        # 16-bit Unicode (Windows)
strings -e b file                        # 32-bit big-endian
strings -a file                          # entire file (not just data section)
```

### xxd / hexdump / ImHex
```bash
xxd file | head
xxd file | tail
xxd -s 0x100 -l 0x80 file               # offset 0x100, length 0x80
```

ImHex (modern UI) recommended for serious work

---

## 🎯 Patterns

### Pattern 1: Polyglot / Append-after-EOF
File valid ใน format A: แต่หลัง EOF ของ A มี file อื่นซ่อน

```bash
binwalk file.png
# 0      PNG image data
# 12345  Zip archive data       ← ZIP appended

unzip file.png                          # extract embedded
```

### Pattern 2: Wrong magic bytes
ไฟล์มี extension `.png` แต่ magic ไม่ตรง: fix manually:
```python
data = open('broken.png', 'rb').read()
# Replace first 8 bytes with PNG signature
fixed = b'\x89PNG\r\n\x1a\n' + data[8:]
open('fixed.png', 'wb').write(fixed)
```

### Pattern 3: Corrupted dimensions (PNG)
Width/height ใน IHDR ผิด → ภาพ truncated

```python
import struct, zlib
data = bytearray(open('image.png', 'rb').read())
# IHDR: offset 8, type 'IHDR' at 12, data at 16
# Width [16:20], Height [20:24]
data[20:24] = struct.pack('>I', 1000)   # new height
# Recompute CRC of IHDR (type + data, 17 bytes)
crc = zlib.crc32(data[12:29])
data[29:33] = struct.pack('>I', crc)
open('fixed.png', 'wb').write(data)
```

### Pattern 4: Encoded multiple times
```
ภาพ → exiftool comment = base64
→ decode → ZIP file
→ unzip → text = hex
→ decode → encoded with caesar
→ decode → flag
```

→ **ห้าม stop ที่ layer แรก**: มัก nested

### Pattern 5: Slack space
ไฟล์ขนาด N bytes: แต่ block size = 4096 → มี slack space หลัง EOF
- ใช้ `bulk_extractor` หรือ hex view ของ block

### Pattern 6: NTFS Alternate Data Streams (ADS)
Windows feature: ไฟล์มี streams เพิ่ม
```cmd
dir /R                                   # list streams
type file.txt:hidden                     # read stream
```

---

## 🔢 Encoding Detection

| Pattern | Likely encoding |
|---------|----------------|
| `[A-Za-z0-9+/=]+` ลงท้าย `=` หรือ `==` | Base64 |
| `[A-Z2-7=]+` ลงท้าย `=` | Base32 |
| `[0-9a-fA-F]+` (cut into pairs) | Hex |
| `[1-9A-HJ-NP-Za-km-z]+` (no `0OIl`) | Base58 (Bitcoin) |
| Random printable, lots of `~!@#` | Base85 |
| `%xx` patterns | URL encoded |
| `&lt;`, `&#65;` | HTML entities |
| `\u00xx` | Unicode escape |

→ ใช้ CyberChef "Magic" feature สำหรับ auto-detect ที่ดีที่สุด

---

## 📦 Archive Formats

### Identify
```bash
file archive.zip
unzip -l archive.zip                     # list contents
```

### Common formats
| Extension | Tool |
|-----------|------|
| `.zip` | `unzip` |
| `.tar` | `tar -xf` |
| `.gz` | `gunzip` |
| `.tar.gz` / `.tgz` | `tar -xzf` |
| `.bz2` | `bunzip2` |
| `.xz` | `unxz` |
| `.7z` | `7z x` |
| `.rar` | `unrar x` |
| `.zst` | `zstd -d` |

### Password-protected archives
```bash
# zip
zip2john archive.zip > hash.txt
john hash.txt --wordlist=rockyou.txt

# rar
rar2john archive.rar > hash.txt
hashcat -m 13000 hash.txt rockyou.txt    # RAR3
hashcat -m 23700 hash.txt rockyou.txt    # RAR5

# 7z
7z2john archive.7z > hash.txt
hashcat -m 11600 hash.txt rockyou.txt
```

---

## 📋 Office Documents

### Word/Excel macros
```bash
oletools          # python -m pip install oletools
olevba file.docm
oledump.py file.docm
```

### PDF analysis
```bash
pdfid file.pdf                          # detect suspicious
pdf-parser -O file.pdf                  # objects
peepdf file.pdf                         # interactive
```

---

## 🎯 Memory / Disk / Network

ดูหน้าเฉพาะ:
- [Memory-Forensics](Memory-Forensics.md)
- [Disk-Forensics](Disk-Forensics.md)
- [Network-Forensics](Network-Forensics.md)
- [Steganography](Steganography.md)

---

## 🔗 ที่เกี่ยวข้อง

- [Forensics-Intro](Forensics-Intro.md)
- [Steganography](Steganography.md)
- [Tools-Cheatsheet](../14-Tools-Cheatsheets/Tools-Cheatsheet.md)

## 📚 References

- "File System Forensic Analysis": Brian Carrier
- file-extension.org: extension reference
- gary-kessler.net/library/file_sigs.html: magic bytes db

---

#ctf #forensics #file-analysis
