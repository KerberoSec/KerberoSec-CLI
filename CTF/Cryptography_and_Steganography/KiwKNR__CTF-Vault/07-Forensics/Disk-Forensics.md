---
tags: [ctf, forensics, disk, filesystem, autopsy]
created: 2026-05-01
---

# 💽 Disk Forensics

> วิเคราะห์ disk image (.dd, .img, .e01, .vmdk): file system structure, deleted files, hidden partitions, slack space

---

## 🛠 Tools

### Autopsy ⭐ (GUI)
- ใช้ The Sleuth Kit ภายใน
- File system browser, timeline, keyword search
- Free + cross-platform

### The Sleuth Kit (CLI)
```bash
sudo apt install sleuthkit
# Tools: mmls, fls, fsstat, icat, istat, blkcat, ...
```

### TestDisk / PhotoRec
- TestDisk: recover lost partitions, fix boot sector
- PhotoRec: recover files (file carving): ignore filesystem

### FTK Imager (Windows)
Free disk imaging + analysis

### Mount + analyze
```bash
# Mount disk image (read-only)
sudo mount -o ro,loop disk.img /mnt/disk

# Multi-partition image (with partition table)
mmls disk.img                              # show partitions
sudo mount -o ro,loop,offset=$((512*2048)) disk.img /mnt/disk
```

---

## 📂 Disk Image Formats

| Format | Description |
|--------|-------------|
| `.dd`, `.raw`, `.img` | Raw image (sector-by-sector copy) |
| `.e01`, `.ex01` | EnCase (EWF): compressed + metadata |
| `.aff`, `.aff4` | Advanced Forensic Format |
| `.vmdk`, `.vdi` | VM disk images |
| `.qcow2` | QEMU |
| `.dmg` | macOS disk image |

### Convert
```bash
# E01 → raw
ewfexport disk.e01

# VMDK → raw
qemu-img convert -O raw disk.vmdk disk.raw

# Mount qcow2
sudo modprobe nbd
sudo qemu-nbd -r -c /dev/nbd0 disk.qcow2
sudo mount -o ro /dev/nbd0p1 /mnt/disk
```

---

## 📐 Partition Layout

### Show partitions
```bash
mmls disk.img
# Output:
# Slot      Start      End       Length    Description
# 000       0000       0000      0000001   Primary Table
# 002       0002048    20971519  20969472  Linux (0x83)
```

→ partition starts at sector 2048 (×512 bytes/sector = offset 1048576)

### Mount partition
```bash
sudo mount -o ro,loop,offset=1048576 disk.img /mnt/disk
```

หรือ use `kpartx`:
```bash
sudo kpartx -av disk.img
# Creates /dev/mapper/loop0p1, loop0p2, ...
sudo mount -o ro /dev/mapper/loop0p1 /mnt/disk
```

---

## 🗂 File System Analysis

### File system info
```bash
fsstat disk.img                     # full fs info
fsstat -o 2048 disk.img             # offset to partition

# Output: type, block size, inode count, dates, journal, ...
```

### List files (Sleuth Kit)
```bash
# List root directory
fls disk.img -o 2048

# Recursive
fls -r disk.img -o 2048

# With timestamps
fls -lr disk.img -o 2048

# Show only deleted
fls -d disk.img -o 2048
```

Output format:
```
r/r 12345:    filename.txt
↑   ↑
type inode
```
- `r/r` = regular file (allocated/dir entry)
- `r/-` = deleted but inode allocated
- `-/-` = orphan (inode free)

### Read file by inode
```bash
icat disk.img -o 2048 12345 > recovered.txt
```

### File metadata
```bash
istat disk.img -o 2048 12345
# Output: size, dates, blocks used, ...
```

---

## 🗑 Recovering Deleted Files

### Method 1: Sleuth Kit `fls -d`
```bash
fls -rd disk.img -o 2048           # recursive deleted
# Note inode of file you want
icat disk.img -o 2048 <inode> > recovered.bin
```

### Method 2: PhotoRec (file carving: ignores FS)
```bash
photorec disk.img
# Interactive: select partition, file types, output dir
```

PhotoRec ค้นหา **magic bytes** ของ file types → carve out
- ปลอดภัย: ไม่เขียน source
- Output: `recup_dir.1/`, etc.

### Method 3: foremost
```bash
foremost -i disk.img -o output_dir
```

### Method 4: scalpel
```bash
# Edit /etc/scalpel/scalpel.conf: uncomment file types
scalpel disk.img -o output_dir
```

### Method 5: bulk_extractor
```bash
bulk_extractor -o output disk.img
```

Extracts: emails, URLs, credit cards, base64, URL-encoded, ...

---

## 🪟 NTFS Specific

### MFT (Master File Table)
ทุกไฟล์ใน NTFS มี entry ใน MFT: รวม deleted files

```bash
# Extract MFT
icat disk.img 0 > mft.raw

# Parse with MFT tools
analyzeMFT.py -f mft.raw -o mft.csv

# Or: mft2csv
mft2csv mft.raw
```

### Alternate Data Streams (ADS)
NTFS feature: ไฟล์มี multiple "streams"
```
file.txt:hidden_stream     ← hidden data
file.txt: $DATA            ← main content
```

#### Detect
```bash
# Sleuth Kit
fls -F disk.img <inode>             # show streams

# Windows
dir /R                               # show ADS
streams.exe file.txt                 # Sysinternals
```

#### Extract
```bash
# Find stream inode via fls
icat disk.img <inode-stream> > hidden_data
```

CTF pattern: flag stored ใน ADS ของ innocent-looking file

### USN Journal
NTFS keep log ของ file changes
```bash
# Extract USN Journal
icat disk.img <inode_of_$UsnJrnl:$J>
# Parse with USNAnalytics, etc.
```

### $LogFile
Transaction log
```bash
icat disk.img 2 > logfile.raw       # inode 2 ใน NTFS
```

### Recycle Bin
- `$Recycle.Bin\<SID>\`: Windows Vista+
- `$I*` files: metadata (deletion time, original path)
- `$R*` files: actual deleted content

### Prefetch
`C:\Windows\Prefetch\*.pf`: track program execution
- Tools: PECmd

### Browser artifacts
- Chrome: `%LocalAppData%\Google\Chrome\User Data\Default\`
- Firefox: `%AppData%\Mozilla\Firefox\Profiles\`
- Files: History, Cookies, Login Data (SQLite)

---

## 🐧 ext4/ext3 Specific

### Superblock + journal
```bash
fsstat disk.img -o 2048             # overview
debugfs disk.img                     # interactive
```

### debugfs commands
```bash
debugfs disk.img
debugfs:  ls /
debugfs:  cat /etc/passwd
debugfs:  stat <inode>
debugfs:  dump <inode> output_file
debugfs:  lsdel                      # list deleted
```

### Journal: `extundelete`, `ext4magic`
```bash
extundelete disk.img --restore-all
ext4magic disk.img -r
```

---

## 🔍 Useful Search Strategies

### 1. Strings on entire image
```bash
strings disk.img | grep -i "flag{"
```
ใช้เวลาแต่บางครั้งจบงานทันที

### 2. Search for file type
```bash
# Find all PNG files
binwalk disk.img -y png
binwalk -e disk.img         # extract all
```

### 3. Search file contents in mounted FS
```bash
sudo mount -o ro,loop,offset=... disk.img /mnt/disk
grep -r "flag{" /mnt/disk 2>/dev/null
find /mnt/disk -name "*.txt" -exec grep -l "flag" {} \;
```

### 4. Hash all files → compare with known
```bash
find /mnt/disk -type f -exec md5sum {} \; > hashes.txt
```

### 5. Look at common locations
- `/home/*/.*history*`: bash, zsh, etc.
- `/root/.bash_history`
- `/var/log/`
- `/etc/passwd`, `/etc/shadow`
- Browser caches/cookies/history
- Recycle bin
- Desktop, Downloads, Documents
- `/tmp/`

---

## 🎯 CTF Common Patterns

### Pattern 1: ไฟล์ flag.txt ลบไปแล้ว
```bash
fls -rd disk.img -o 2048
# r/r * 12345: flag.txt    ← * = deleted
icat disk.img -o 2048 12345 > flag.txt
```

### Pattern 2: Slack space
ไฟล์ขนาด 100 bytes: block 4096 → มี 3996 bytes "slack" หลัง EOF
- Tools: `bulk_extractor`, hex view block

### Pattern 3: Hidden in ADS
```bash
dir /R              # Windows
fls -F ...          # Sleuth Kit
```

### Pattern 4: Hidden partition
`mmls` แสดงเฉพาะ partitions ใน table: แต่อาจมี data ก่อน partition แรก, ระหว่าง partitions, หรือหลัง partition สุดท้าย
```bash
# Carve everything
binwalk -e disk.img
photorec disk.img
```

### Pattern 5: Encrypted volume
- LUKS (Linux) / BitLocker (Windows) / VeraCrypt
- ต้องการ password: มัก hint ใน image อื่น
- Mount: `cryptsetup luksOpen disk.img name`

### Pattern 6: Password file
- `/etc/shadow` (Linux): crack with john
- `SAM`/`SYSTEM` (Windows): extract NTLM hash

```bash
# Linux
unshadow /mnt/disk/etc/passwd /mnt/disk/etc/shadow > combined
john combined --wordlist=rockyou.txt

# Windows (with samdump2 or impacket)
samdump2 /mnt/disk/Windows/System32/config/SYSTEM /mnt/disk/Windows/System32/config/SAM > hashes.txt
hashcat -m 1000 hashes.txt rockyou.txt
```

### Pattern 7: Browser history
SQLite DB: open with `sqlitebrowser` or:
```bash
sqlite3 History "SELECT url FROM urls"
sqlite3 places.sqlite "SELECT * FROM moz_places"
```

---

## 🎯 Timeline Analysis

สร้าง timeline ของ file activities: ดูลำดับเหตุการณ์
```bash
fls -m / -r disk.img -o 2048 > body
mactime -b body -d > timeline.csv

# Or with log2timeline (plaso)
log2timeline.py timeline.plaso disk.img
psort.py -o L2tcsv -w timeline.csv timeline.plaso
```

→ ดู first/last access/modify time ของไฟล์ทั้งหมด in chronological order

---

## 📋 Workflow

```
1. Identify image type + partitions
   file disk.img
   mmls disk.img

2. Mount read-only (or analyze with TSK)
   sudo mount -o ro,loop,offset=... disk.img /mnt/

3. First impressions
   ls /mnt/
   strings disk.img | grep -i flag

4. Common locations
   - /home/*/Desktop, Documents, Downloads
   - /tmp/
   - Recycle Bin / .Trash
   - Browser data
   - bash_history

5. Deleted files
   fls -rd ... → icat
   photorec disk.img

6. Hidden mechanisms
   - ADS (NTFS)
   - Slack space
   - Unallocated space
   - Hidden partitions

7. Encrypted/password files
   - Crack hashes
   - LUKS/BitLocker

8. Timeline
   fls + mactime
```

---

## 🔗 ที่เกี่ยวข้อง

- [Forensics-Intro](Forensics-Intro.md)
- [Memory-Forensics](Memory-Forensics.md)
- [Network-Forensics](Network-Forensics.md)
- [Files might be stego'd](../08-Steganography/Stego-Intro.md)

## 📚 References

- "File System Forensic Analysis": Brian Carrier ⭐
- sleuthkit.org/sleuthkit
- 13cubed YouTube: DFIR tutorials
- DFIR-OrochiSec/Awesome-Forensics

---

#ctf #forensics #disk #filesystem
