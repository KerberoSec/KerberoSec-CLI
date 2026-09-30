---
tags: [ctf, rev, static-analysis, ghidra, ida]
created: 2026-05-01
---

# 🔍 Static Analysis: วิเคราะห์โดยไม่รัน

> วิเคราะห์ binary โดยไม่ execute: ปลอดภัย, repeatable, แต่ pack/obfuscation ทำได้ยาก

---

## 🚦 Workflow แรก

```bash
# 1. ดูประเภทไฟล์
file ./binary
# Output ตัวอย่าง:
# ELF 64-bit LSB executable, x86-64, dynamically linked, not stripped

# 2. Security mitigations
checksec ./binary
# RELRO, Canary, NX, PIE, RUNPATH, FORTIFY

# 3. Strings (เร็ว, มักได้ flag/clue)
strings -n 8 ./binary | less
strings -e l ./binary           # 16-bit Unicode (Windows)
strings -a ./binary | grep -i flag

# 4. Symbols (ถ้าไม่ stripped)
nm ./binary | grep " T "         # functions
nm -D ./binary                    # dynamic symbols (libraries)
readelf -a ./binary | less

# 5. Imports (functions ที่เรียกจาก lib)
objdump -T ./binary               # dynamic
objdump -t ./binary               # static
```

---

## 🦎 Ghidra ⭐ ฟรี + ดี

### ดาวน์โหลด
- **ghidra-sre.org**
- ต้องมี Java JDK 17+

### Workflow แรก
1. **Project** → New → ตั้งชื่อ
2. **Import file** → ลาก binary เข้า
3. **Auto-analyze** (ปกติ default OK)
4. Double-click binary → CodeBrowser
5. Symbol Tree → Functions → `entry` หรือ `main`

### Layout
- **Listing** (กลาง): disassembly
- **Decompiler** (ขวา) ⭐: C pseudocode
- **Symbol Tree** (ซ้าย): function/strings/labels
- **Function Graph** (`Window > Function Graph`): control flow

### Hotkeys ที่ต้องจำ
| Key | Action |
|-----|--------|
| `G` | Go to address |
| `L` | Rename label/variable |
| `T` | Set data type |
| `;` | Add comment (EOL) |
| `Ctrl+L` | Re-type variable |
| `F` | Decompile current function |
| `Ctrl+E` | External symbols |
| `Ctrl+Shift+E` | View references TO |
| `Ctrl+Shift+F` | View references FROM |
| `Space` | Toggle Listing/Graph view |

### Tips
1. **Rename variables/functions** ให้เข้าใจง่าย: `iVar1` → `password_length`
2. **Set data types**: Ghidra อาจคิดว่าเป็น `int` แต่จริงๆ เป็น `char[]`
3. **Auto-analysis ผิด?**: Click on function → right-click → "Re-decompile"
4. **String list**: Window > Defined Strings (filter, double-click → ไป location)
5. **Function search**: Symbol Tree filter

### หา main จาก stripped binary
```
1. Symbol Tree → Functions → entry
2. ใน entry: 
   __libc_start_main(main, argc, argv, ...);
   ↑ argument แรก = main address
3. Double-click address → main
```

---

## 🔪 IDA Pro / IDA Free

### Free vs Pro
- **IDA Free**: limited (ไม่ decompile x86_64), ฟรี
- **IDA Home**: $XXX สำหรับ x86/ARM
- **IDA Pro**: $$$$ ทุก architecture

### Layout
- **IDA View**: disassembly (graph default)
- **Pseudocode** (Hex-Rays): decompile (Pro only)
- **Functions** sub-window
- **Strings** sub-window
- **Imports / Exports**

### Hotkeys
| Key | Action |
|-----|--------|
| `G` | Go to address |
| `N` | Rename |
| `Y` | Set type |
| `;` หรือ `:` | Comment |
| `Space` | Graph ↔ Linear view |
| `F5` | Decompile (Pro) |
| `Tab` | Switch disasm ↔ pseudocode |
| `X` | Show xrefs to |

### Plugins ดีๆ
- **Lighthouse**: code coverage
- **HexRaysToolbox**
- **SARK**: scripting

---

## 🦀 radare2 / Cutter

### radare2 (CLI)
Open source: ใช้ใน command line

```bash
r2 -A ./binary           # -A = analyze all
[0x00400410]> aaa        # analyze ลึกขึ้น
[0x00400410]> afl        # list functions
[0x00400410]> s main     # seek to main
[0x00400410]> pdf        # print disassembly of function
[0x00400410]> pdg        # decompile (need plugin)
[0x00400410]> V          # visual mode
                         # (in V) p toggle views, g/G goto, : command
[0x00400410]> iz         # strings in data section
[0x00400410]> izz        # strings everywhere
[0x00400410]> ii         # imports
[0x00400410]> /x ff e0   # search hex bytes
[0x00400410]> /R         # search ROP gadgets
[0x00400410]> q          # quit
```

### Cutter (GUI ของ r2)
- ใช้ง่ายกว่า r2 CLI
- มี decompiler (Ghidra plugin / r2dec)

---

## 🔧 Binary Ninja

- UI สวย, Python API ดีที่สุดในวงการ
- Free (limited) / Personal $$ / Commercial $$$$
- HLIL (High-Level IL) decompile ดี

---

## 🎯 .NET / Java specific

### .NET (.exe / .dll)
**dnSpy** ⭐ หรือ **dotPeek**
- Decompile .NET → C# โดยตรง
- มัก "trivially reversible" ถ้าไม่ obfuscate
- ตรวจหา obfuscator: **de4dot** (deobfuscate ConfuserEx, etc.)

### Java (.jar)
**JD-GUI**, **JADX-GUI**, **CFR**
```bash
# Extract jar (= zip)
unzip file.jar

# Decompile .class → .java
javap -c -p Class
cfr-decompiler file.jar > out.java
```

### Android APK (.apk)
**JADX-GUI** ⭐: เปิด APK ตรงๆ → Java code
```bash
jadx -d output_dir app.apk
jadx-gui app.apk
```

---

## 📜 Strings: basic but powerful

```bash
strings -n 10 binary | grep -iE "(flag|key|password|secret|http|admin)"
strings -e l binary       # 16-bit (UTF-16, Windows)
strings -e b binary       # 32-bit big endian
```

ใน Ghidra: Window > Defined Strings + filter

ใน CTF: บางครั้ง flag อยู่ตรงๆใน strings: แค่ลองก่อน

---

## 🔢 Hex Editor

```bash
xxd binary | head
hexdump -C binary | head
xxd -s 0x100 -l 0x80 binary    # offset 0x100, length 0x80

# ใช้ GUI
ghex binary
HxD (Windows)
ImHex ⭐ (modern, free, cross-platform)
```

ใช้สำหรับ:
- Detect file format จาก magic bytes
- Manual carving
- Patching binary

### Common Magic Bytes
| Bytes | Format |
|-------|--------|
| `4D 5A` (`MZ`) | Windows PE (.exe, .dll) |
| `7F 45 4C 46` (`\x7fELF`) | Linux ELF |
| `CA FE BA BE` | Java class / Mach-O fat |
| `FE ED FA CE` | Mach-O 32-bit |
| `FE ED FA CF` | Mach-O 64-bit |
| `50 4B 03 04` (`PK\x03\x04`) | ZIP/APK/JAR/DOCX/XLSX |
| `89 50 4E 47` | PNG |
| `FF D8 FF` | JPEG |
| `25 50 44 46` (`%PDF`) | PDF |
| `1F 8B` | gzip |
| `42 5A 68` (`BZh`) | bzip2 |
| `52 61 72 21` (`Rar!`) | RAR |
| `7F 45 4C 46` | ELF |

---

## 🛠 Cross-references (xrefs)

### ทำไมสำคัญ
- เห็น string "Correct!" → ใครเรียกใช้ string นี้? → trace ย้อนกลับหา check function

### Ghidra
- คลิกบน symbol → right-click → "References" → "Show References to"

### IDA
- คลิก → กด `X`

### radare2
```
[0x...]> axt @ <addr>
```

---

## 🧮 Useful Math/Bitwise to Recognize

ใน decompile มัก optimize ให้ดูแปลก:

```c
// Compiler trick
x * 2          → x << 1
x * 4          → x << 2
x / 2          → x >> 1
x % 16         → x & 0xf
(x + 7) / 8    → (x + 7) >> 3

// Multiply by constant
x * 3          → (x << 1) + x
x * 5          → (x << 2) + x
x * 10         → (x << 3) + (x << 1)

// Division by constant
x / 7          → magic constant multiply
x / 10         → similar

// Endianness swap
__builtin_bswap32(x)  → bswap eax
```

ถ้าเห็น code แปลกๆ ที่ใช้ shift/multiply complicated: มักเป็น compiler optimize ของ operation ปกติ

---

## 🔥 String Encoding Tricks

CTF challenge มัก hide flag ด้วยการ XOR/encode

### XOR with constant
```c
char encoded[] = "...";
for (i = 0; i < len; i++) {
    decoded[i] = encoded[i] ^ 0x42;
}
```
→ XOR encoded กับ 0x42 ใน CyberChef → flag

### Stack strings (anti-string-tools)
```c
// แทน string literal ใช้:
char s[8];
s[0] = 'F';
s[1] = 'L';
s[2] = 'A';
s[3] = 'G';
// strings -n 4 จะไม่เจอ
```

→ ดูใน decompile manually หรือ run และดู memory ใน gdb

### Stack arrays of dwords
```c
int arr[] = {0x47414c46, 0x6f6c6c65, ...};   // FLAG hello (little-endian)
```
→ convert hex → ASCII (mind endianness!)

---

## 📊 Calling Graph

ดูภาพรวม function calls

### Ghidra
- Window → Function Call Graph

### IDA
- View → Graphs → Function calls

### Useful
- หา "main flow" ของโปรแกรม
- หา function ที่ leaf (ไม่เรียกใคร): มัก crypto/check function

---

## 🔗 ต่อไป

- [รัน + debug](Dynamic-Analysis.md)
- [Assembly อ่านได้](Assembly-Basics.md)
- [วิธีสู้ anti-debug](Anti-Debug-Tricks.md)

---

#ctf #rev #static-analysis
