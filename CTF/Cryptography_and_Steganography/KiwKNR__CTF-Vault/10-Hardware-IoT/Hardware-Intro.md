---
tags: [ctf, hardware, iot, embedded]
created: 2026-05-02
---

# 🔌 Hardware & IoT Security: บทนำ

> Hardware CTF challenges เน้น: firmware analysis, embedded device hacking, IoT protocols, side-channel: มัก require physical hardware tools

---

## 🎯 ประเภทโจทย์

### 1. Firmware Analysis
- ได้ firmware image (.bin, .img)
- Extract filesystem
- Reverse executables
- หา vulnerability / hardcoded credential

### 2. Hardware Reversing
- Physical device + UART/JTAG
- Extract firmware from chip
- Analyze PCB

### 3. Radio (SDR)
- RF signal: capture, decode
- LoRa, Zigbee, Z-Wave, custom protocols
- 433MHz remote, etc.

### 4. Side-Channel
- Power analysis (DPA)
- Timing attacks (hardware-level)
- Voltage/clock glitching
- EM emanations

### 5. CAN Bus / Automotive
- ECU communication
- Reverse engineering CAN messages

---

## 🛠 Tools

### Software
| Tool | ใช้ทำอะไร |
|------|----------|
| **binwalk** ⭐ | Firmware analysis |
| **firmware-mod-kit** | Extract + rebuild firmware |
| **squashfs-tools** | Extract SquashFS (common in firmware) |
| **dd** | Carve specific offsets |
| **Ghidra/IDA** | RE binaries (likely ARM/MIPS) |
| **QEMU** | Emulate firmware userland |
| **firmadyne** | Auto-emulate firmware |
| **GDB-multiarch** | Debug remote target |

### Hardware (ถ้ามี physical device)
| Device | ใช้ |
|--------|-----|
| **Bus Pirate** ⭐ | UART/SPI/I²C/JTAG interface |
| **Black Magic Probe** / **Segger J-Link** | JTAG/SWD debugger |
| **Saleae Logic Analyzer** | Decode protocols |
| **JTAGulator** | Identify JTAG pinout |
| **Flipper Zero** | All-in-one (RFID, SubGHz, IR, GPIO) |
| **Proxmark3** | RFID/NFC |
| **HackRF / RTL-SDR** | Software-defined radio |
| **CAN-USB adapter** | CAN Bus |
| **Multimeter, Logic probe** | Basic |

---

## 🔬 Firmware Analysis Workflow

### Step 1: Identify file
```bash
file firmware.bin
# Often "data" or specific format

# Check entropy (encrypted/compressed if high)
binwalk -E firmware.bin
```

High entropy (8.0) throughout = encrypted/random
Mixed = uncompressed sections + compressed

### Step 2: Detect embedded files
```bash
binwalk firmware.bin
# Output:
# DECIMAL  HEXADECIMAL  DESCRIPTION
# ...
# 1024     0x400        uImage header, Linux kernel...
# 1500000  0x16E360     Squashfs filesystem, version 4.0...
```

### Step 3: Extract
```bash
binwalk -e firmware.bin
# Creates _firmware.bin.extracted/
ls _firmware.bin.extracted/
# Look for squashfs-root/ etc.
```

If binwalk fails: manual carve:
```bash
dd if=firmware.bin of=fs.squashfs bs=1 skip=1500000 count=$((<size>))
unsquashfs fs.squashfs
```

### Step 4: Explore filesystem
```bash
cd squashfs-root/
ls -la
cat etc/passwd
cat etc/shadow
find . -name "*.cfg"
find . -name "*.conf"
find . -type f -exec strings {} + | grep -i "(password|key|api)"
```

### Step 5: Reverse binaries
```bash
file bin/busybox
# ELF 32-bit LSB executable, ARM, EABI5...

# Open in Ghidra
# Common targets: web server (httpd, lighttpd), main app
```

---

## 🐛 Common IoT Vulnerabilities

### 1. Hardcoded Credentials
```bash
grep -r "admin" squashfs-root/etc/
grep -r "password" squashfs-root/
grep -rE "[A-Za-z0-9]{20,}" squashfs-root/ | head
```

Common in IoT firmware:
- `/etc/shadow` ที่ hash crackable เร็ว
- API keys ใน config files
- Default credentials

### 2. Backdoors
หา functions ที่:
- Accept "magic value"
- Bypass auth on specific endpoint
- Hidden URL/path
```bash
grep -rE "(magic|hidden|debug|backdoor)" squashfs-root/
```

### 3. Web App in firmware
Many IoT devices = web admin panel
- Look at `/www/`, `/web/`, `/htdocs/`
- CGI scripts, PHP, JS
- Apply [web techniques](../03-Web-Exploitation/SQL-Injection.md)

### 4. Update mechanisms
- Insecure update URL
- No signature verification
- Plaintext HTTP
- Re-flash with malicious firmware

### 5. Insecure protocols
- Telnet (port 23): clear text
- FTP without TLS
- Old SSL/TLS versions
- Custom protocols ที่ broken

---

## 🖥 Firmware Emulation (QEMU)

### User-mode emulation (single binary)
```bash
sudo apt install qemu-user-static

# Copy busybox emulator into firmware FS
cp $(which qemu-arm-static) squashfs-root/usr/bin/

# Chroot + run binary
sudo chroot squashfs-root /usr/bin/qemu-arm-static /bin/sh

# Or run specific binary
sudo chroot squashfs-root /usr/bin/qemu-arm-static /usr/bin/httpd
```

### System-mode (full system)
ยากกว่า: ต้อง correct kernel + dtb

```bash
# firmadyne: auto setup
git clone https://github.com/firmadyne/firmadyne
cd firmadyne
# Follow README: extract, identify arch, run emulation
```

### Boot the emulated system
```bash
# Once emulated, scan ports
nmap -p- 192.168.0.X       # firmadyne assigns this IP
```

→ ทำให้ test web admin panel, SSH, etc. as if on real device

---

## 🔌 UART (Serial Console)

### Concept
หลาย IoT มี UART pins บน PCB: connect → boot console → root shell

### Find UART
- 4 pins บน PCB ที่ดูเหมือนเรียง (TX, RX, GND, VCC)
- Use multimeter:
  - GND = 0V to chassis
  - VCC = 3.3V or 5V (constant)
  - TX = oscillates during boot (data sent)
  - RX = mostly idle high (input)

### Connect
- USB-to-UART adapter (FTDI, CH340)
- Connect: TX → RX, RX → TX, GND → GND (no VCC)

### Capture
```bash
sudo screen /dev/ttyUSB0 115200
# Or
sudo minicom -D /dev/ttyUSB0 -b 115200
```

Common baud rates: 9600, 38400, 57600, 115200

### Common findings
- Boot logs (verbose)
- U-Boot prompt (interrupt with `Ctrl+C` หรือ key)
- Login prompt: try default creds (admin/admin, root/root)
- Direct shell access

### U-Boot tricks
ที่ U-Boot prompt:
```
> printenv          # show env
> setenv bootargs init=/bin/sh
> boot              # boot to single-user shell
```

Or dump memory:
```
> md.b 0x80000000 0x100      # memory dump
```

---

## 🔍 JTAG / SWD

### Concept
JTAG = standard debug interface ในชิป: full memory access, halt CPU

### Find JTAG
- Pins on PCB (TDI, TDO, TMS, TCK + GND)
- Often hidden as test points
- **JTAGulator**: auto identify

### Connect
- Black Magic Probe
- Segger J-Link
- OpenOCD + cheaper adapter (FT2232H)

### Use
```bash
openocd -f interface/jlink.cfg -f target/stm32f4x.cfg

# Then telnet to OpenOCD
telnet localhost 4444
> halt
> dump_image firmware.bin 0x08000000 0x100000
> reset
```

→ Dump firmware from chip → analyze

### Read-out protection
Many chips have RDP: cannot read flash if enabled
- Sometimes can be bypassed (glitch attacks)

---

## 📡 SDR (Software Defined Radio)

### Hardware
- **RTL-SDR**: $30, RX only, 24-1700 MHz
- **HackRF One**: $300, TX+RX, 1-6 GHz
- **LimeSDR**: $300+, full-duplex
- **USRP**: $$$ professional

### Software
- **GQRX**: spectrum/audio (RX)
- **GNU Radio**: flowgraph-based DSP
- **SDR#** (Windows)
- **inspectrum**: analyze recorded baseband
- **rtl_433**: decode 433MHz devices
- **multimon-ng**: decode digital modes

### Workflow
```
1. Listen with GQRX: find target frequency
2. Record IQ baseband (.cfile or .raw)
3. Open in inspectrum: visualize
4. Identify modulation (AM/FM/OOK/FSK)
5. Decode with appropriate tool or GNU Radio flowgraph
```

### Common protocols
- **433/315 MHz**: garage doors, car remotes, weather stations
- **915 MHz / 868 MHz**: LoRa, ISM
- **2.4 GHz**: WiFi, Zigbee, Bluetooth, drone
- **GSM (900/1800)**: cell

---

## 🎯 CTF Patterns

### Pattern 1: Firmware → web admin → exploit
1. binwalk extract
2. Find web server config
3. Reverse CGI/PHP scripts
4. Find vulnerable endpoint
5. Exploit on real device or emulated

### Pattern 2: Hardcoded credentials
1. Extract firmware FS
2. `grep -r password`
3. Login → flag

### Pattern 3: Decode RF capture
1. Given .iq or .wav file
2. inspectrum → identify modulation
3. Decode → ASCII → flag

### Pattern 4: Bus pirate / UART
1. Given .pcap of UART traffic OR connect to virtual UART
2. Identify baud rate
3. Read transmitted data
4. Look for flag

### Pattern 5: Custom encryption
- IoT firmware uses custom XOR/encryption
- Reverse → re-implement → decrypt OTA update

---

## 🛠 Useful Commands

```bash
# Firmware
binwalk -e firmware.bin
binwalk -A firmware.bin              # ARM/MIPS opcodes
binwalk -E firmware.bin              # entropy graph
binwalk --dd='.*' firmware.bin       # extract everything

# SquashFS
unsquashfs fs.squashfs
mksquashfs squashfs-root/ new.squashfs

# CramFS, JFFS2, UBIFS
mkdir mnt && sudo mount -t cramfs fs.bin mnt

# Flash dump format
dd if=flash.bin of=part1.bin bs=1 skip=0 count=1048576

# Strings on FS
find squashfs-root -type f -exec strings -n 8 {} + | grep -i flag

# Grep all configs
find squashfs-root -name "*.conf" -o -name "*.cfg" -o -name "*.ini"
```

---

## 🔗 ต่อไป

- [Firmware ลึก](Firmware-Analysis.md)

## 📚 References

- "The Hardware Hacker": Andrew "bunnie" Huang
- "Practical IoT Hacking": Chantzis et al
- "The Car Hacker's Handbook": Smith
- great-scott-gadgets.com (HackRF docs)

---

#ctf #hardware #iot
