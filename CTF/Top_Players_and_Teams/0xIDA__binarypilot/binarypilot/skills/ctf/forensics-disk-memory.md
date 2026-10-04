---
name: forensics-disk-memory
description: "CTF disk and memory forensics. Volatility 3 process/network/MFT analysis, disk imaging with Sleuth Kit icat, VM forensics OVA/VMDK via 7z, vmss2core snapshot conversion, ransomware AES key oracle, RAID 5 XOR recovery, APFS/ZFS snapshot reversion, WordPerfect macro brute, Docker layer secrets, PowerShell history triage. Triggers: 'volatility', 'memory forensics', 'disk forensics', 'vmdk', 'memory dump', 'raid recovery', 'apfs snapshot', 'docker forensics', 'ransomware recovery', 'powershell history forensics'."
---

# CTF Forensics: Disk and Memory

Volatility, disk imaging, VM forensics, RAID recovery, cloud/container forensics.

## Install

```bash
pip install volatility3 --break-system-packages
apt-get install sleuthkit foremost binwalk exiftool
```

---

## Phase 1: Volatility 3: Windows Memory

```bash
DUMP="memory.dmp"

# List processes:
vol -f "$DUMP" windows.pslist

# Network connections:
vol -f "$DUMP" windows.netscan

# MFT entries (file metadata from memory):
vol -f "$DUMP" windows.mftscan.MFTScan | grep -i "flag\|secret"

# File extraction from memory:
vol -f "$DUMP" windows.dumpfiles --virtaddr 0x... --output-dir ./extracted/

# Registry hives:
vol -f "$DUMP" windows.registry.hivelist
vol -f "$DUMP" windows.registry.printkey --key "SOFTWARE\Microsoft\Windows NT\CurrentVersion"

# PowerShell history in memory:
vol -f "$DUMP" windows.cmdline
vol -f "$DUMP" windows.consolehistory

# Encryption keys:
vol -f "$DUMP" windows.hashdump          # SAM hashes
```

```bash
# Linux memory:
vol -f "$DUMP" linux.pslist
vol -f "$DUMP" linux.bash                # bash history from memory
vol -f "$DUMP" linux.netstat
vol -f "$DUMP" linux.check_syscall       # detect syscall hooks
```

---

## Phase 2: Disk Imaging: Sleuth Kit

```bash
IMG="disk.img"

# List files (including deleted):
fls -r "$IMG"

# Extract file by inode:
icat "$IMG" 1234 > recovered_file

# File system info:
fsstat "$IMG"
mmls "$IMG"  # partition table

# Timeline:
mactime -b <bodyfile> -d | head -100

# Search for content:
sigfind -b 512 "$IMG" 89504E47  # PNG header
```

---

## Phase 3: VM Forensics

```bash
# OVA contains VMDK (VMware disk):
tar xf challenge.ova
ls *.vmdk

# Mount VMDK without VMware:
7z l disk.vmdk              # 7z reads VMDK directly
7z x disk.vmdk              # extract flat disk image

# Or:
qemu-img convert disk.vmdk disk.raw
mount -o ro,offset=N disk.raw /mnt  # N = partition offset in bytes

# VMware snapshot → memory dump:
vmss2core -W challenge.vmss challenge.vmem
# Now analyze with Volatility

# Hyper-V VHDX:
qemu-img convert challenge.vhdx disk.raw
```

---

## Phase 4: Ransomware Key Recovery

```python
from Crypto.Cipher import AES
import struct

# Pattern: ransomware AES-encrypts files; header check = fast key oracle
# Try candidate key → decrypt first 16/32 bytes → check file signature

SIGNATURES = {
    b'\x89PNG': 'png',
    b'%PDF': 'pdf', 
    b'PK\x03\x04': 'zip',
    b'\xff\xd8\xff': 'jpg',
    b'\x7fELF': 'elf',
    b'\x1f\x8b': 'gz',
}

def try_aes_key(key, iv, ciphertext):
    """Decrypt first block and check magic bytes."""
    cipher = AES.new(key, AES.MODE_CBC, iv)
    pt = cipher.decrypt(ciphertext[:64])
    for sig, ext in SIGNATURES.items():
        if pt[:len(sig)] == sig:
            return ext
    return None

# Brute force candidate keys:
def recover_ransomware_key(encrypted_files, known_ext=None):
    with open(encrypted_files[0], 'rb') as f:
        ct = f.read(512)
    
    # Try IV = first 16 bytes of ciphertext (common pattern):
    iv = ct[:16]
    ct_data = ct[16:]
    
    for key_candidate in generate_keys():  # from key source (timestamp, PRNG)
        result = try_aes_key(key_candidate, iv, ct_data)
        if result and (known_ext is None or result == known_ext):
            return key_candidate, iv
```

---

## Phase 5: RAID 5 XOR Recovery

```python
# RAID 5: A XOR B XOR C = 0 (for 3 disks)
# Recover missing disk: B = A XOR C

def recover_raid5_missing_disk(disk_a_path, disk_c_path, output_path):
    """Reconstruct missing disk B from disks A and C."""
    BLOCK_SIZE = 512 * 1024  # 512KB chunks
    
    with open(disk_a_path, 'rb') as fa, \
         open(disk_c_path, 'rb') as fc, \
         open(output_path, 'wb') as out:
        
        while True:
            block_a = fa.read(BLOCK_SIZE)
            block_c = fc.read(BLOCK_SIZE)
            
            if not block_a:
                break
            
            block_b = bytes(a ^ c for a, c in zip(block_a, block_c))
            out.write(block_b)
    
    print(f"Recovered disk written to {output_path}")
```

---

## Phase 6: APFS / ZFS Snapshot Recovery

```bash
# APFS snapshot recovery:
# Earlier snapshots may contain unmodified/authentic file state

# List APFS snapshots:
diskutil apfs listSnapshots /Volumes/Data

# Mount specific snapshot read-only:
mkdir /mnt/snapshot
mount_apfs -s com.apple.TimeMachine.2024-01-01-120000 /dev/disk2s1 /mnt/snapshot

# Access historical file state:
ls /mnt/snapshot/Users/user/Documents/

# ZFS snapshot access:
zfs list -t snapshot
zfs clone pool/dataset@snap-2024-01-01 pool/recovered
mount -t zfs pool/recovered /mnt
```

---

## Phase 7: Docker Layer Forensics

```bash
# Docker image = tarball of layers
docker save target_image > image.tar
tar xf image.tar -C layers/

# Each layer is a tar.gz: extract and examine:
for layer in layers/*/layer.tar; do
    echo "=== $layer ==="
    tar xf "$layer" -C extracted_layer/
    
    # Check for secrets:
    grep -r "password\|secret\|key\|token\|flag" extracted_layer/ 2>/dev/null
    find extracted_layer/ -name "*.env" -o -name "*.conf" -o -name "id_rsa"
    
    # Whiteout files = deleted in this layer (may have been secret):
    find extracted_layer/ -name '.wh.*'
done

# Build history (may include secrets in RUN commands):
docker history target_image --no-trunc

# Inspect config blob for ENV vars and build commands:
cat layers/*/json | python3 -m json.tool | grep -i "env\|cmd\|entrypoint"
```

---

## Phase 8: AWS/Cloud Storage Forensics

```bash
# S3 object versioning: access deleted objects:
aws s3api list-object-versions --bucket target-bucket \
  --prefix "" --output json > versions.json

# List all versions including deleted:
python3 -c "
import json
data = json.load(open('versions.json'))
for v in data.get('Versions', []):
    print(v['Key'], v['VersionId'], v['LastModified'])
for d in data.get('DeleteMarkers', []):
    print('[DELETED]', d['Key'], d['VersionId'])
"

# Download specific version:
aws s3api get-object \
  --bucket target-bucket \
  --key secret.txt \
  --version-id 'VERSION_ID' \
  recovered.txt
```

---

## Phase 9: Windows Triage Priority

```bash
# PowerShell history (highest value):
cat C:\Users\*\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt

# Execution evidence: Amcache:
# Tools: python-registry, analyzeMFT
python3 -c "
import Registry.Registry as reg
r = reg.Registry('Amcache.hve')
root = r.open('Root\InventoryApplicationFile')
for k in root.subkeys():
    print(k.name(), k.value('FullPath').value())
"

# MFT resident data (small files stored in MFT itself):
analyzeMFT.py -f \$MFT -o mft_output.csv
grep -i "flag\|secret" mft_output.csv

# Registry hives for persistence:
# HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run
# HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run
```

---

## Output

Save to `.omop/engagement/ctf/forensics/disk/`:
- `extracted/`: files from memory/disk
- `recovered_disk.img`: RAID reconstruction
- `flag.txt`: found flag

## Next Phase

→ `ctf-forensics-windows` for Windows-specific artifacts
→ `ctf-forensics-linux` for Linux artifacts
