---
tags: [ctf, forensics, memory, volatility]
created: 2026-05-01
---

# 🧠 Memory Forensics

> วิเคราะห์ RAM dump เพื่อหา process, network, file, registry, secret data ที่อยู่ในหน่วยความจำขณะถูก capture

ใน CTF: หา flag ที่อยู่ใน:
- Process memory ของ application
- Browser history/passwords
- Clipboard
- Command line history
- Decrypted version ของ encrypted file

---

## 🛠 Volatility 3 ⭐

### Install
```bash
pip install volatility3
# Or
git clone https://github.com/volatilityfoundation/volatility3
cd volatility3
pip install -e .
```

### Basic syntax
```bash
vol -f <dump_file> <plugin>
vol -f memdump.raw windows.info
```

### File formats supported
- `.raw`, `.dd`, `.bin`: raw memory
- `.vmem`, `.vmsn`: VMware
- `.lime`: LiME format (Linux Memory Extractor)
- `.dmp`: Windows crash dump
- Hibernation file (`hiberfil.sys`)

---

## 🪟 Windows Plugins (most common in CTF)

### OS Identification
```bash
vol -f mem.raw windows.info
# Output: kernel base, build, profile, etc.
```

### Process List
```bash
vol -f mem.raw windows.pslist
vol -f mem.raw windows.pstree              # tree view
vol -f mem.raw windows.psscan              # scan (find hidden)
```

ดู:
- PID, PPID
- Image name (executable)
- Start time
- Anomaly: process ที่ image=ปกติ แต่ PPID แปลก

### Command Line
```bash
vol -f mem.raw windows.cmdline
```
→ command line ของแต่ละ process: มัก leak: filename, options, password บางครั้ง

### Network Connections
```bash
vol -f mem.raw windows.netstat
vol -f mem.raw windows.netscan             # scanning approach
```

### Open Files / Handles
```bash
vol -f mem.raw windows.handles --pid 1234
vol -f mem.raw windows.filescan
vol -f mem.raw windows.dumpfiles --pid 1234 --dump-dir output/
```

### Registry
```bash
vol -f mem.raw windows.registry.printkey --key "Software\\Microsoft\\Windows\\CurrentVersion\\Run"
vol -f mem.raw windows.registry.hashdump   # NTLM hashes!
vol -f mem.raw windows.registry.userassist
```

### Hash Dump
```bash
vol -f mem.raw windows.registry.hashdump > hashes.txt
hashcat -m 1000 hashes.txt rockyou.txt
```

### Process Memory Dump
```bash
vol -f mem.raw windows.memmap --pid 1234 --dump --dump-dir output/
vol -f mem.raw windows.dumpfiles --pid 1234 --dump-dir output/
vol -f mem.raw windows.memdump --pid 1234 --dump-dir output/
```

### Detect Malware / Injected Code
```bash
vol -f mem.raw windows.malfind             # injected code
vol -f mem.raw windows.hollowfind          # process hollowing
vol -f mem.raw windows.psxview             # cross-view (find hidden)
```

### Misc Useful
```bash
vol -f mem.raw windows.envars              # environment variables
vol -f mem.raw windows.dlllist --pid 1234  # loaded DLLs
vol -f mem.raw windows.driverscan          # kernel drivers
vol -f mem.raw windows.svcscan             # services
vol -f mem.raw windows.modules             # kernel modules
```

---

## 🐧 Linux Plugins

```bash
vol -f memdump.lime banners                 # identify kernel
vol -f memdump.lime linux.pslist
vol -f memdump.lime linux.pstree
vol -f memdump.lime linux.bash              # bash command history!
vol -f memdump.lime linux.lsmod             # kernel modules
vol -f memdump.lime linux.lsof              # open files
vol -f memdump.lime linux.proc.maps         # process memory map
vol -f memdump.lime linux.proc.dump_map --pid 1234 --vma <addr>
```

### linux.bash ⭐: แรงที่สุดใน CTF
```bash
vol -f memdump.lime linux.bash
```
แสดง bash history ของแต่ละ user → มัก leak: commands ที่รัน, ชื่อไฟล์, password ที่พิมพ์

---

## 🍎 macOS Plugins

```bash
vol -f mem.raw mac.pslist
vol -f mem.raw mac.bash
vol -f mem.raw mac.netstat
```

---

## 🎯 Common CTF Patterns

### Pattern 1: หา flag ใน notepad/text editor
```bash
# Find notepad process
vol -f mem.raw windows.pslist | grep -i notepad
# PID = 1234

# Dump memory
vol -f mem.raw windows.memdump --pid 1234 --dump-dir output/

# Search for flag
strings output/pid.1234.dmp | grep -i "flag{"
```

### Pattern 2: หา password ใน browser
```bash
# Browser process
vol -f mem.raw windows.pslist | grep -iE "(chrome|firefox|edge)"

# Dump
vol -f mem.raw windows.memdump --pid 1234 --dump-dir output/

# Search for URLs / cookies
strings output/pid.1234.dmp | grep -iE "(http|password|token)"

# Or for Chrome cookies, decrypt via DPAPI offline
```

### Pattern 3: หา file ที่เปิดอยู่
```bash
vol -f mem.raw windows.filescan | grep -i flag
# Get virtual offset

vol -f mem.raw windows.dumpfiles --virtaddr <addr> --dump-dir output/
```

### Pattern 4: Encrypted file with password ใน memory
- ระบุ encryption tool ใน process list
- Dump process memory → search for AES keys (constants)
- Search for password in context (cmd line, clipboard)

### Pattern 5: Hash dump → crack
```bash
vol -f mem.raw windows.registry.hashdump > hashes.txt
hashcat -m 1000 hashes.txt rockyou.txt
```

---

## 🔍 Strings + grep workflow

ก่อนใช้ Volatility ขั้นสูง: ลอง:
```bash
strings -el memdump.raw | grep -i "flag{"     # 16-bit unicode
strings memdump.raw | grep -i "flag{"          # ASCII
strings -a memdump.raw | grep -iE "(password|admin|key|secret|flag)"
```

มักจบโจทย์ tier 1-2 ใน 10 วินาที

---

## 🔑 Encryption Keys ใน Memory

โปรแกรมที่ใช้ AES มี key อยู่ใน RAM ตอน decrypt
- Tools: **aeskeyfind**, **rsakeyfind**

```bash
aeskeyfind memdump.raw       # finds AES keys
rsakeyfind memdump.raw       # finds RSA private keys
```

---

## 🎲 Volatility 2 (legacy)

บาง plugin ยังเด่นใน V2:
```bash
vol.py -f mem.raw imageinfo                # detect profile
vol.py -f mem.raw --profile=Win7SP1x64 pslist
vol.py -f mem.raw --profile=Win7SP1x64 cmdscan        # cmd.exe history!
vol.py -f mem.raw --profile=Win7SP1x64 consoles       # console buffer
vol.py -f mem.raw --profile=Win7SP1x64 clipboard
vol.py -f mem.raw --profile=Win7SP1x64 truecryptpassphrase
```

`cmdscan` + `consoles` แรงมาก: ดู command + output ใน cmd.exe ของ user

`clipboard`: เห็น copy-paste

---

## 🎯 Workflow

```
1. windows.info / banners → identify OS/version

2. windows.pslist → see processes
   - หา process ที่น่าสน (notepad, browser, custom app)
   - Note PID

3. windows.cmdline / linux.bash → command history

4. Dump process memory:
   windows.memdump --pid X
   strings → grep flag

5. registry.hashdump → if Windows, dump hash → crack

6. filescan → look for files of interest
   dumpfiles → extract

7. malfind / hollowfind → check for malware

8. netstat → connections (if network in scenario)
```

---

## 📦 Memory Acquisition (สำหรับสร้าง dump เอง: outside CTF)

### Linux: LiME
```bash
git clone https://github.com/504ensicsLabs/LiME
cd LiME/src && make
sudo insmod lime.ko "path=/tmp/dump.lime format=raw"
```

### Windows: WinPmem / DumpIt
- Single executable
- Run as admin → dump to file

### VM
- VMware: `.vmem` file (no acquisition needed)
- VirtualBox: snapshot → `.sav` file (convert with `vboxmanage`)

---

## 🐛 Common Pitfalls

1. **Wrong profile** (V2): `imageinfo` first
2. **Compressed dump**: extract first
3. **Page file ไม่ถูก include**: บาง info อยู่ใน pagefile.sys (Windows)
4. **Volatility V3 ไม่ support บาง plugin**: เปลี่ยนเป็น V2

---

## 🔗 ที่เกี่ยวข้อง

- [Forensics-Intro](Forensics-Intro.md)
- [Network-Forensics](Network-Forensics.md)
- [Disk-Forensics](Disk-Forensics.md)

## 📚 References

- "The Art of Memory Forensics": Ligh, Case, Levy, Walters ⭐
- volatilityfoundation.org/about-volatility-foundation
- volatility-labs.blogspot.com: official blog
- 13cubed YouTube: DFIR tutorials

---

#ctf #forensics #memory #volatility
