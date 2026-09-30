---
tags: [ctf, hardware, firmware, embedded]
created: 2026-05-02
---

# 💾 Firmware Analysis ลึก

> เจาะลึก: identify, extract, analyze, emulate firmware

---

## 📋 Firmware Types

### Linux-based (most common in IoT/router)
- ARM, MIPS, ARM64
- BusyBox utilities
- Often SquashFS / CramFS / JFFS2 filesystem
- Web admin (httpd / lighttpd / boa)

### RTOS / Bare-metal
- VxWorks, FreeRTOS, Zephyr, etc.
- Single executable image
- No filesystem
- Harder to analyze (no familiar tools)

### Microcontroller (PIC, AVR, STM32, ESP)
- Bare-metal C
- Small (8KB-1MB)
- ESP32 มี FreeRTOS

---

## 🔍 Identify Firmware Format

### File magic
```bash
file firmware.bin
xxd firmware.bin | head -3
```

### Common magic bytes
| Magic | Type |
|-------|------|
| `27 05 19 56` | uImage (U-Boot) |
| `D0 0D FE ED` | DTB (Device Tree Blob) |
| `7F 45 4C 46` | ELF |
| `68 73 71 73` | SquashFS |
| `1F 8B 08` | gzip |
| `42 5A 68` | bzip2 |
| `FD 37 7A 58 5A 00` | xz |
| `04 22 4D 18` | LZ4 |
| `89 4C 5A 4F` | LZO |
| `19 85` (or others) | JFFS2 |

### binwalk magic detection
```bash
binwalk firmware.bin
```
binwalk knows >100 file format signatures

---

## 📊 Entropy Analysis

```bash
binwalk -E firmware.bin
# Generates entropy graph (PNG)
```

### Interpret
- **0.0-7.5**: Code/text (low entropy, structured)
- **7.5-7.9**: Compressed (gzip, lz4, etc.)
- **7.9-8.0**: Encrypted or random
- **Sharp transitions** = boundary between sections

### Use case
- High constant entropy = encrypted firmware → need key
- Low at start, high end = header + compressed payload
- Mixed = uncompressed firmware (best for analysis)

---

## 🗂 Common Layouts

### Router firmware (typical)
```
[Header][Kernel uImage][SquashFS rootfs]
   16    ~1MB              ~10MB
```

### IoT camera (typical)
```
[Bootloader][U-Boot env][Kernel][rootfs][user data]
```

### Webcam, smart bulb, etc.
- Often single big file with header + compressed kernel + filesystem

---

## 🔬 Extract Workflow

### Method 1: binwalk auto
```bash
binwalk -eM firmware.bin
# -e = extract
# -M = Matryoshka (recursive: extracts inside extracted)
```

### Method 2: Manual carve
```bash
# Identify offset and size from binwalk
binwalk firmware.bin
# 0x1000  uImage  ...
# 0x800000 SquashFS

# Carve uImage
dd if=firmware.bin of=kernel.bin bs=1 skip=4096 count=$((0x800000 - 0x1000))

# Carve SquashFS
dd if=firmware.bin of=rootfs.squashfs bs=1 skip=$((0x800000))
```

### Method 3: Specialized tools

#### sasquatch (modified squashfs)
```bash
git clone https://github.com/devttys0/sasquatch
cd sasquatch && ./build.sh
sasquatch firmware.bin
```

Many vendors use modified SquashFS: sasquatch supports more variants

#### ubi_reader (UBIFS)
```bash
pip install ubi_reader
ubireader_extract_files firmware.ubi
```

#### jefferson (JFFS2)
```bash
pip install jefferson
jefferson rootfs.jffs2 -d output/
```

---

## 📂 Filesystem Exploration

### Quick tour
```bash
cd squashfs-root/
ls -la

# Standard Linux layout
bin/        # binaries
sbin/       # system binaries
etc/        # configs
lib/        # libraries
usr/        # user binaries
var/        # logs, runtime
www/        # web root (often)
```

### High-value files
```bash
# Authentication
cat etc/passwd
cat etc/shadow

# Network config
cat etc/hosts
cat etc/network/interfaces
cat etc/dnsmasq.conf

# Init scripts
ls etc/init.d/
ls etc/rc.d/

# Web config
cat etc/lighttpd/lighttpd.conf
ls www/                    # web pages
ls www/cgi-bin/            # CGI scripts

# Device-specific
cat etc/version
cat etc/release
ls etc/config/             # OpenWrt
```

### Find secrets
```bash
# Hardcoded creds
grep -rE "(admin|password|root)" etc/ 2>/dev/null | head -50

# API keys (high entropy)
grep -rEo "[A-Za-z0-9]{30,}" --binary-files=text 2>/dev/null | sort -u

# Telnet/SSH backdoors
grep -r "telnetd" etc/init.d/

# Update mechanisms
grep -r "wget\|curl\|fetch" etc/

# Custom protocols
find . -name "*.cfg" -exec grep -l "key" {} \;
```

---

## 🔧 Analyze Binaries

### Identify architecture
```bash
file bin/busybox
# ELF 32-bit LSB executable, ARM, EABI5 version 1 (SYSV)
# or
# ELF 32-bit MSB executable, MIPS, MIPS-I version 1 (SYSV)
```

### Open in Ghidra
- File → Import → select .so or executable
- Choose correct architecture if not auto-detected
- Auto-analyze

### Common targets
- **httpd / lighttpd**: web server (often modified)
- **goahead / boa**: embedded web servers
- **upnpd**: UPnP daemon
- **telnetd / dropbear**: shell
- Custom daemons (vendor-specific)

### Find vulnerabilities
- `strcpy`, `strcat`, `sprintf`, `gets`: buffer overflow
- `system()`, `popen()` with user input: command injection
- Format string with user input
- Hardcoded crypto keys

---

## 🧪 Emulation

### User-mode QEMU
```bash
# For ARM binary
sudo apt install qemu-user-static

# Copy emulator into rootfs
cp $(which qemu-arm-static) squashfs-root/usr/bin/

# Chroot run
sudo chroot squashfs-root /usr/bin/qemu-arm-static /bin/sh

# Or run specific
sudo chroot squashfs-root /usr/bin/qemu-arm-static /bin/httpd
```

→ บาง binaries crash เพราะ syscall ไม่รองรับ: ลอง specific options

### System-mode QEMU
ยากกว่า: ต้อง:
- Correct kernel (matching arch)
- DTB (Device Tree Binary)
- Correct memory layout

```bash
qemu-system-arm \
    -M versatilepb \
    -kernel zImage \
    -dtb device.dtb \
    -drive file=rootfs.img,format=raw \
    -net nic -net user,hostfwd=tcp: 8080-:80 \
    -nographic
```

### firmadyne (auto)
```bash
git clone https://github.com/firmadyne/firmadyne
cd firmadyne
sudo ./scripts/extract.py firmware.bin
sudo ./scripts/getArch.sh ./images/1.tar.gz
sudo ./scripts/inferNetwork.sh 1
sudo ./scripts/run.sh 1

# Now device emulated: scan
nmap 192.168.0.X
```

→ Web interface accessible → test for vulnerabilities

### FAT (Firmware Analysis Toolkit)
github.com/attify/firmware-analysis-toolkit: wraps firmadyne

### AttifyOS
VM with all tools pre-installed

---

## 🔓 Encrypted Firmware

ถ้า firmware encrypted:

### 1. Look for key in bootloader
- bootloader (small, runs first) มี decrypt logic
- Extract bootloader → reverse → find key

### 2. Check for related firmware
- ดาวน์โหลด multiple versions of firmware
- Compare: diff files reveal encrypted vs plaintext sections
- Sometimes older version = unencrypted

### 3. JTAG dump from chip
- ถ้า encrypted blob = encrypted at flash
- After CPU loads + decrypts → memory has plaintext
- JTAG halt CPU → read RAM

### 4. Side-channel
- Power/timing analysis to recover key (advanced)

---

## 📡 OTA Updates Analysis

Many devices support **Over-The-Air** update: download new firmware

### Capture update
1. Setup MITM proxy
2. Trigger update from device
3. Capture URL/payload
4. Download firmware

### Reverse update format
- Some are plain firmware
- Some are diff format (delta)
- Some are encrypted (need key from device)

### Forge update?
- ถ้า no signature check → flash backdoored firmware
- ถ้า signature → study key, find weakness

---

## 🎯 CTF Patterns

### Pattern 1: Hardcoded password in firmware
```bash
binwalk -eM firmware.bin
cd _firmware.bin.extracted/squashfs-root/
grep -r "FLAG" . 2>/dev/null
cat etc/passwd                    # crack via hashcat
```

### Pattern 2: Backdoor in CGI
```bash
ls www/cgi-bin/
# Open suspicious script in editor
# Look for "magic" parameter checks
```

### Pattern 3: Buffer overflow in webserver
1. Identify httpd binary
2. Open in Ghidra → find handler functions
3. Find unsafe strcpy/sprintf
4. Build exploit (apply [pwn techniques](../06-Binary-Exploitation/Buffer-Overflow.md))
5. Test on emulated device

### Pattern 4: Custom encryption
- Found firmware encrypted with XOR + custom rotation
- Reverse decrypt function in bootloader
- Re-implement → decrypt → analyze

### Pattern 5: Update endpoint exposed
- Web admin has update upload
- Auth bypass → upload malicious firmware → RCE

---

## 🔗 ที่เกี่ยวข้อง

- [Hardware-Intro](Hardware-Intro.md)
- [../05-Reverse-Engineering/Static-Analysis](../05-Reverse-Engineering/Static-Analysis.md)
- [../03-Web-Exploitation/Command-Injection](../03-Web-Exploitation/Command-Injection.md)

## 📚 References

- "Practical IoT Hacking": Chantzis, Stais, Calderon, Deirmentzoglou, Woods
- firmware.re: research on firmware
- routershell.com: embedded web
- attify.com (Firmware Analysis Toolkit)

---

#ctf #hardware #firmware #iot
