---
name: forensics-disk-recovery
description: "CTF disk forensics. LUKS master key recovery from memory, PRNG timestamp seed brute force, VBA macro encoded binary extraction, FemtoZip shared dictionary, XFS inode reconstruction, tar duplicate entry extraction, nested matryoshka filesystem, anti-carving null byte interleaving. Triggers: 'luks memory', 'disk recovery', 'aeskeyfind', 'xfs inode', 'tar duplicate', 'matryoshka disk', 'anti carving', 'prng seed recovery', 'vba macro binary', 'filesystem extraction'."
---

# CTF Forensics: Disk Recovery Patterns

LUKS, PRNG seeds, VBA macros, XFS inodes, tar duplicates, nested filesystems.

## Install

```bash
apt-get install aeskeyfind rsakeyfind cryptsetup xfsprogs
pip install openpyxl --break-system-packages
```

---

## Phase 1: LUKS Master Key from Memory Dump

```bash
# 1. Find AES key schedules in VM memory dump:
aeskeyfind memory.elf

# 2. Convert hex key to binary:
echo "deadbeef..." | xxd -r -p > master.key

# 3. Add passphrase using master key:
cryptsetup luksAddKey --master-key-file master.key /dev/sdb1
# Enter new passphrase

# 4. Mount:
cryptsetup luksOpen /dev/sdb1 decrypted
mount /dev/mapper/decrypted /mnt

# Also try:
rsakeyfind memory.elf   # RSA keys
aesfix master.key       # Corrupted key recovery
```

---

## Phase 2: PRNG Timestamp Seed Brute Force

```python
import struct, os, stat
from Crypto.Cipher import AES

# Get file timestamp to bound search:
mtime = int(os.stat('encrypted.file').st_mtime)
WINDOW = 86400  # ±24 hours

with open('encrypted.bin', 'rb') as f:
    ciphertext = f.read()

for seed in range(mtime - WINDOW, mtime + WINDOW):
    # C rand() compatible (common in challenges):
    state = seed & 0xFFFFFFFF
    key = []
    for _ in range(32):
        state = (state * 1103515245 + 12345) & 0x7FFFFFFF
        key.append(state & 0xFF)
    
    iv = bytes(key[:16])  # may be zeros
    cipher = AES.new(bytes(key), AES.MODE_CBC, iv)
    pt = cipher.decrypt(ciphertext[:64])
    
    # Check for file signature:
    if pt[:4] in (b'\x89PNG', b'%PDF', b'PK\x03\x04', b'\xff\xd8\xff'):
        print(f"Seed: {seed}")
        # Decrypt full file:
        cipher = AES.new(bytes(key), AES.MODE_CBC, iv)
        plaintext = cipher.decrypt(ciphertext)
        with open('decrypted', 'wb') as f:
            f.write(plaintext)
        break
```

---

## Phase 3: VBA Macro Encoded Binary

```bash
# Extract and inspect macros:
pip install oletools --break-system-packages
olevba challenge.xlsx

# Or open in LibreOffice → Tools → Macros
```

```python
import openpyxl

wb = openpyxl.load_workbook('challenge.xlsx', data_only=True)
ws = wb.active

# Reverse-engineer encoding from macro (example: cell_value = byte * 3 + 78):
binary_data = bytearray()
for row in ws.iter_rows():
    for cell in row:
        if cell.value is not None and isinstance(cell.value, (int, float)):
            byte_val = (int(cell.value) - 78) // 3
            if 0 <= byte_val <= 255:
                binary_data.append(byte_val)

with open('recovered.bin', 'wb') as f:
    f.write(binary_data)
```

```bash
# Identify recovered file:
file recovered.bin
xxd recovered.bin | head -4
```

---

## Phase 4: FemtoZip Decompression

```bash
git clone https://github.com/gtoubassi/femtozip /opt/femtozip
cd /opt/femtozip && make

# Decompress using provided model:
./fzip --model challenge.model --decompress compressed_dir/ --output decompressed_dir/

# Search through many decompressed files:
grep -r "flag" decompressed_dir/ 2>/dev/null
find decompressed_dir/ -newer challenge.model -type f -exec file {} \;
```

---

## Phase 5: XFS Inode Reconstruction

```bash
IMG="disk.img"

# Parse superblock:
xfs_db -r "$IMG" -c 'sb 0' -c 'print'

# Find and parse inode:
INUM=100  # known or guessed from directory entries
xfs_db -r "$IMG" -c "inode $INUM" -c 'print'
# Output includes extents: [startoff startblock blockcount flag]

# Extract file from known extent:
STARTBLOCK=104333
BLOCKCOUNT=256
BLOCKSIZE=4096

dd if="$IMG" bs=$BLOCKSIZE skip=$STARTBLOCK count=$BLOCKCOUNT of=recovered.bin
file recovered.bin

# If filesystem mostly intact:
mount -o ro,loop "$IMG" /mnt && ls /mnt
```

```python
# Parse XFS inode manually when xfs_db unavailable:
import struct

BLOCK_SIZE = 4096

with open('disk.img', 'rb') as f:
    # Superblock at offset 0:
    f.seek(0)
    sb = f.read(512)
    block_size = struct.unpack('>I', sb[4:8])[0]
    inode_size = struct.unpack('>H', sb[96:98])[0]
    inode_start = struct.unpack('>Q', sb[24:32])[0]
    
    # Read inode (at calculated position):
    f.seek(inode_start * block_size)
    inode = f.read(inode_size)
    
    # Parse di_core (96 bytes), then extent list:
    magic = inode[:2]  # b'IN' = valid
    di_size = struct.unpack('>Q', inode[56:64])[0]
    
    # Extent map (each 16 bytes):
    # Bits 127-73: startoff, bits 72-21: startblock, bits 20-0: blockcount
    for i in range(0, 64, 16):  # up to 4 inline extents
        raw = struct.unpack('>QQ', inode[96+i:96+i+16])
        val = (raw[0] << 64) | raw[1]
        startblock = (val >> 21) & ((1<<52)-1)
        blockcount = val & ((1<<21)-1)
        if blockcount:
            f.seek(startblock * block_size)
            data = f.read(blockcount * block_size)
```

---

## Phase 6: Tar Duplicate Entry Extraction

```bash
# List all entries (count duplicates):
tar -tvf archive.tar.xz | grep "^\." | wc -l

# Extract specific occurrence (GNU tar):
tar -Jxvf archive.tar.xz '.' --occurrence=2 -O > second_entry.bin

# File type:
file second_entry.bin
```

```python
import tarfile

with tarfile.open('archive.tar.xz') as tf:
    for i, member in enumerate(tf.getmembers()):
        f = tf.extractfile(member)
        if f:
            data = f.read()
            with open(f'entry_{i:03d}.bin', 'wb') as out:
                out.write(data)
            print(f"Entry {i}: {member.name} ({len(data)} bytes)")
```

---

## Phase 7: Nested Matryoshka Filesystem

```bash
#!/bin/bash
IMG="$1"

for i in $(seq 1 25); do
    echo "=== Layer $i: $(file -b "$IMG") ==="
    
    TYPE=$(file -b "$IMG")
    case "$TYPE" in
        *XZ*|*xz*)
            xz -d "$IMG"
            IMG="${IMG%.xz}"
            ;;
        *gzip*|*GZIP*)
            gunzip "$IMG"
            IMG="${IMG%.gz}"
            ;;
        *bzip2*)
            bunzip2 "$IMG"
            IMG="${IMG%.bz2}"
            ;;
        *ext4*|*ext2*|*ext3*)
            mkdir -p "mnt_$i"
            sudo mount -o ro,loop "$IMG" "mnt_$i"
            NEXT=$(find "mnt_$i" -type f ! -name "lost+found" | head -1)
            IMG="$NEXT"
            ;;
        *ISO*)
            mkdir -p "mnt_$i"
            sudo mount -o ro,loop "$IMG" "mnt_$i" -t iso9660
            IMG=$(find "mnt_$i" -type f | head -1)
            ;;
        *AmigaDOS*|*AFFS*)
            mkdir -p "mnt_$i"
            sudo mount -t affs -o ro,loop "$IMG" "mnt_$i"
            IMG=$(find "mnt_$i" -type f | head -1)
            ;;
        *HFS*)
            mkdir -p "mnt_$i"
            sudo mount -t hfsplus -o ro,loop "$IMG" "mnt_$i"
            IMG=$(find "mnt_$i" -type f | head -1)
            ;;
        *flag*|*PNG*|*JPEG*|*text*)
            echo "FLAG FOUND: $(cat $IMG)"
            break
            ;;
    esac
    
    [ -z "$IMG" ] && break
done
```

---

## Phase 8: Anti-Carving Null Byte Interleaving

```python
# File carving (binwalk/foremost) finds nothing
# But filesystem metadata shows file exists → null bytes interleaved

# Extract raw blocks from XFS:
# xfs_db → find inode extent → dd

# Remove interleaved nulls (keep every other byte):
with open('raw.bin', 'rb') as f:
    data = f.read()

# Remove nulls at odd positions:
cleaned = bytes(data[i] for i in range(0, len(data), 2))
with open('recovered.bin', 'wb') as f:
    f.write(cleaned)

# Or remove nulls at even positions:
cleaned2 = bytes(data[i] for i in range(1, len(data), 2))
with open('recovered2.bin', 'wb') as f:
    f.write(cleaned2)
```

```bash
# Check both outputs:
file recovered.bin
file recovered2.bin
xxd recovered.bin | head -4

# Perl one-liner:
perl -0777 -pe 's/(.)./\1/gs' raw.bin > recovered.bin
```

---

## Output

Save to `.omop/engagement/ctf/forensics/disk/`:
- `recovered.bin`: extracted file
- `master.key`: recovered crypto key
- `flag.txt`: found flag

## Next Phase

→ `ctf-forensics-windows` for Windows artifacts
→ `ctf-forensics-linux` for Linux artifacts
