---
name: forensics-disk
description: "CTF disk and memory forensics. Volatility 3 memory analysis, Sleuth Kit disk imaging, deleted file recovery, VMware snapshot analysis, ZFS forensics, RAID 5 recovery, Docker layer analysis, APFS snapshots, MFT analysis. Triggers: 'disk forensics', 'memory forensics', 'volatility', 'memory dump', 'deleted file recovery', 'disk image', 'filesystem forensics', 'vmware forensics', 'sleuth kit'."
---

# CTF Forensics: Disk & Memory

Volatility 3, Sleuth Kit, deleted file recovery, VMware snapshots, ZFS, RAID, Docker layers.

## Install

```bash
pip install volatility3 --break-system-packages
apt-get install -y sleuthkit autopsy foremost photorec

# Volatility 3:
pip install volatility3 --break-system-packages
# OR: git clone https://github.com/volatilityfoundation/volatility3
```

---

## Phase 1: Memory Analysis (Volatility 3)

```bash
DUMP="memory.raw"

# Identify OS:
python3 vol.py -f "$DUMP" windows.info
python3 vol.py -f "$DUMP" linux.banner
python3 vol.py -f "$DUMP" mac.banner

# Process enumeration:
python3 vol.py -f "$DUMP" windows.pslist
python3 vol.py -f "$DUMP" windows.pstree
python3 vol.py -f "$DUMP" windows.cmdline    # command lines

# Network connections:
python3 vol.py -f "$DUMP" windows.netscan
python3 vol.py -f "$DUMP" windows.netstat

# File recovery:
python3 vol.py -f "$DUMP" windows.dumpfiles --virtaddr 0xdeadbeef  # specific file
python3 vol.py -f "$DUMP" windows.filescan | grep -iE "flag|secret|key|\.txt|\.docx"

# MFT analysis:
python3 vol.py -f "$DUMP" windows.mftscan.MFTScan | grep -iE "flag|secret"

# Registry hives:
python3 vol.py -f "$DUMP" windows.registry.hivelist
python3 vol.py -f "$DUMP" windows.registry.printkey --key "SOFTWARE\Microsoft\Windows\CurrentVersion"

# Dump process memory:
python3 vol.py -f "$DUMP" windows.memmap --pid 1234 --dump
strings pid.1234.dmp | grep -iE "flag|ctf|password"

# Windows defender artifacts:
python3 vol.py -f "$DUMP" windows.mftscan.MFTScan
```

---

## Phase 2: Disk Image: Sleuth Kit

```bash
IMAGE="disk.img"

# Image info:
mmls "$IMAGE"          # partition table
fsstat "$IMAGE"        # filesystem stats
blkls -l "$IMAGE"      # list blocks

# List files (FLS):
fls -r "$IMAGE"
fls -r -d "$IMAGE"     # deleted files only

# Recover deleted file by inode:
icat "$IMAGE" INODE_NUMBER > recovered_file

# Search for keywords:
blkls "$IMAGE" | strings | grep -iE "flag|password|ctf"

# Autopsy (GUI):
autopsy &
# Open browser: http://localhost:9999/autopsy
```

---

## Phase 3: Deleted File Recovery

```bash
IMAGE="disk.img"

# foremost: file carving:
foremost -i "$IMAGE" -o ./foremost_output/
ls ./foremost_output/   # jpg/, png/, pdf/, zip/, etc.

# Photorec:
photorec "$IMAGE"

# TestDisk: partition recovery:
testdisk "$IMAGE"

# ext4 deleted files (extundelete):
extundelete "$IMAGE" --restore-all --output-dir ./recovered/

# NTFS (ntfsundelete):
ntfsundelete "$IMAGE" -u --dest ./ntfs_recovered/
```

---

## Phase 4: VMware Snapshot Analysis

```bash
# Convert .vmss (suspended VM) to memory dump:
vmss2core -W memory.dmp vm.vmss

# Then analyze with Volatility:
python3 vol.py -f memory.dmp windows.pslist

# VMware .vmem file (already a raw memory dump):
strings vm.vmem | grep -iE "flag|password"
python3 vol.py -f vm.vmem windows.pslist
```

---

## Phase 5: ZFS Forensics

```bash
DISK="disk.img"

# Import ZFS pool from image (loop device):
sudo losetup /dev/loop0 "$DISK"
sudo zpool import -d /dev/loop0 mypool
sudo zfs list
sudo zfs mount mypool/data

# Encrypted ZFS: crack passphrase:
# Extract PBKDF2 params and GPU crack:
sudo zfs get all mypool | grep encryption
# Use hashcat or similar for PBKDF2-SHA256

# ZFS snapshots: recover historical data:
sudo zfs list -t snapshot mypool
sudo zfs rollback mypool/data@snapshot_name
```

---

## Phase 6: RAID 5 Recovery

```python
# RAID 5: XOR all N-1 working disks to recover missing disk
# XOR is self-inverse: A XOR B XOR C = 0 → C = A XOR B

def recover_raid5(disk_images, missing_disk_index, chunk_size=512):
    """Recover missing RAID 5 disk from remaining disks."""
    disk_data = [open(img, 'rb').read() for img in disk_images]
    recovered = bytearray(len(disk_data[0]))
    
    for i in range(0, len(disk_data[0]), chunk_size):
        chunk = bytearray(chunk_size)
        for j, disk in enumerate(disk_data):
            for k in range(chunk_size):
                if i + k < len(disk):
                    chunk[k] ^= disk[i + k]
        recovered[i:i+chunk_size] = chunk
    
    with open(f"recovered_disk{missing_disk_index}.img", 'wb') as f:
        f.write(recovered)

# Usage:
recover_raid5(['disk0.img', 'disk1.img', 'disk3.img'], missing_disk_index=2)
```

---

## Phase 7: Docker Layer Analysis

```bash
# Docker images are layered: deleted files persist in earlier layers
IMAGE_TAR="docker-image.tar"

tar xf "$IMAGE_TAR"
ls

# Each layer is a .tar:
for layer in */layer.tar; do
  echo "=== $layer ==="
  tar tf "$layer" | grep -iE "flag|secret|key|password|\.env"
done

# Extract specific file from layer:
tar xf layer123abc/layer.tar ./etc/password

# Mount entire overlay:
docker load -i "$IMAGE_TAR"
docker run --rm -it IMAGE_ID /bin/sh
```

---

## Phase 8: APFS Snapshot Recovery

```bash
# APFS snapshots preserve historical state
DISK="/dev/disk2"

# List snapshots:
tmutil listlocalsnapshots /
diskutil apfs listSnapshots $DISK

# Mount specific snapshot:
mount_apfs -s "com.apple.TimeMachine.2024-01-15-120000" $DISK /tmp/snapshot

# Access files at snapshot time:
ls /tmp/snapshot/

# Even "deleted" flag files accessible if snapshot predates deletion
```

---

## Phase 9: Windows KAPE Triage

```bash
# Common artifacts from KAPE collections:
KAPE_DIR="./kape-triage"

# PowerShell history (fastest win):
cat "$KAPE_DIR/ConsoleHost_history.txt"
find "$KAPE_DIR" -name "ConsoleHost_history.txt" -exec cat {} \;

# Amcache (execution timeline):
python3 vol.py -f "$KAPE_DIR/memory.raw" windows.mftscan.MFTScan

# MFT resident data (small files stored in MFT itself):
# Short files (< ~700 bytes) stored as MFT resident data
# Parse MFT directly for these

echo "Priority: PowerShell history → Amcache → MFT"
```

---

## Output

Save to `.omop/engagement/ctf/forensics/disk/`:
- `processes.txt`: Volatility process list
- `recovered/`: deleted/carved files
- `strings-hits.txt`: keyword hits in image
- `timeline.txt`: filesystem timeline

## Next Phase

→ `ctf-forensics-network` for PCAP analysis
→ `ctf-forensics-stego` for image steganography
