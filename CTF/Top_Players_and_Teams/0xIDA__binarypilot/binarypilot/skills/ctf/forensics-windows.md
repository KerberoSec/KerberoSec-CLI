---
name: forensics-windows
description: "CTF Windows forensics. Event log parsing (evtx), registry analysis, SAM hash extraction, MFT/USN journal analysis, wmiexec.py artifact detection, PowerShell history timeline, RDP event IDs, Windows Defender MPLog, anti-forensics detection. Triggers: 'windows forensics', 'evtx analysis', 'registry forensics', 'mft analysis', 'usn journal', 'sam database', 'wmiexec artifacts', 'rdp forensics', 'defender logs', 'windows event log'."
---

# CTF Forensics: Windows

Event logs, registry, SAM, MFT, USN journal, wmiexec artifacts.

## Install

```bash
pip install python-evtx regipy impacket-python --break-system-packages
pip install python-registry --break-system-packages
```

---

## Phase 1: Windows Event Logs (.evtx)

```python
import Evtx.Evtx as evtx
import xml.etree.ElementTree as ET

NS = {'ns': 'http://schemas.microsoft.com/win/2004/08/events/event'}

INTERESTING_IDS = {
    '4720': 'User account CREATED',
    '4722': 'User account enabled',
    '4724': 'Password reset',
    '4726': 'User account DELETED',
    '4738': 'User account changed',
    '4781': 'Account renamed',
    '1102': 'Audit log CLEARED',
    '4624': 'Logon success',
    '4625': 'Logon FAILURE',
    '4648': 'Logon with explicit credentials',
}

with evtx.Evtx("Security.evtx") as log:
    for record in log.records():
        root = ET.fromstring(record.xml())
        event_id = root.find('.//ns:EventID', NS).text
        
        if event_id in INTERESTING_IDS:
            time_created = root.find('.//ns:TimeCreated', NS).get('SystemTime')
            data = {d.get('Name'): d.text for d in root.findall('.//ns:Data', NS)}
            print(f"[{time_created}] {INTERESTING_IDS[event_id]}: {data}")
```

```bash
# Key Event IDs quick reference:
# 4720 = user created
# 4726 = user deleted
# 4781 = account renamed
# 1102 = security log cleared (ironically still logged!)
# 4624 = logon success (check LogonType: 10=RemoteInteractive/RDP, 3=Network)
# 4648 = explicit credential logon

# RDP-specific Event IDs (TerminalServices logs):
# 1149 = RDP user auth succeeded (contains source IP)
# 131  = TCP connection accepted (contains ClientIP:port)
# 21   = Session logon succeeded
# 23   = Session logoff
# 24   = Session disconnected
# 25   = Session reconnection
```

---

## Phase 2: Registry Analysis

```python
from Registry import Registry

# Load NTUSER.DAT:
reg = Registry.Registry("NTUSER.DAT")

# Walk all keys:
def walk_key(key, depth=0):
    print(" " * depth + key.path())
    for subkey in key.subkeys():
        walk_key(subkey, depth + 2)

walk_key(reg.root())

# Find specific key:
key = reg.open("Software\\Microsoft\\Windows\\CurrentVersion\\Run")
for val in key.values():
    print(f"{val.name()}: {val.value()}")

# OEMInformation backdoor detection:
reg_sw = Registry.Registry("SOFTWARE")
try:
    oem = reg_sw.open("Microsoft\\Windows\\CurrentVersion\\OEMInformation")
    for val in oem.values():
        print(f"{val.name()}: {val.value()}")
        if 'http' in str(val.value()):
            print("WARNING: Possible C2 URL in OEMInformation!")
except Exception:
    pass
```

```bash
# RegRipper:
rip.pl -r NTUSER.DAT -p all > ntuser_report.txt
rip.pl -r SOFTWARE -p all > software_report.txt

# Common artifacts to check:
# NTUSER.DAT\Software\Microsoft\Windows\CurrentVersion\Explorer\RecentDocs
# SOFTWARE\Microsoft\Windows\CurrentVersion\Run
# SYSTEM\CurrentControlSet\Services
# SAM\Domains\Account\Users\Names (account creation timestamps)
```

---

## Phase 3: SAM Hash Extraction

```python
from impacket.examples.secretsdump import LocalOperations, SAMHashes

# Extract NTLM hashes:
localOps = LocalOperations('SYSTEM')
bootKey = localOps.getBootKey()
sam = SAMHashes('SAM', bootKey, isRemote=False)
sam.dump()
# Output: username:RID:LM_hash:NTLM_hash: :

# Verify specific NTLM hash:
from Crypto.Hash import MD4

def ntlm_hash(password: str) -> str:
    h = MD4.new()
    h.update(password.encode('utf-16-le'))
    return h.hexdigest()

print(ntlm_hash("Password123"))

# Crack with hashcat:
# echo "hash" > hashes.txt
# hashcat -m 1000 hashes.txt /usr/share/wordlists/rockyou.txt
```

---

## Phase 4: MFT Analysis

```python
# MFT: Master File Table: one 1024-byte record per file
# $STANDARD_INFORMATION (0x10): user-modifiable timestamps
# $FILE_NAME (0x30): system timestamps (reliable, harder to spoof)
# Timestomping detection: SI times older than FN times

def detect_timestomping(mft_record: bytes):
    """Compare SI and FN timestamps for timestomping."""
    # Both attributes have: Created, Modified, MFT Modified, Accessed
    # If SI.Created < FN.Created → timestomping likely
    pass

# Search MFT for filenames:
# ASCII:
import subprocess
result = subprocess.run(['strings', '$MFT'], capture_output=True, text=True)
for line in result.stdout.splitlines():
    if 'flag' in line.lower() or 'secret' in line.lower():
        print(line)

# UTF-16LE:
result = subprocess.run(['strings', '-el', '$MFT'], capture_output=True, text=True)
```

---

## Phase 5: USN Journal Analysis

```python
import struct, datetime

def parse_usn_records(data: bytes):
    """Parse USN journal for file system activity."""
    USN_REASONS = {
        0x1: 'DATA_OVERWRITE', 0x2: 'DATA_EXTEND', 0x4: 'DATA_TRUNCATION',
        0x100: 'FILE_CREATE', 0x200: 'FILE_DELETE', 0x80000000: 'CLOSE'
    }
    
    offset = 0
    while offset < len(data):
        if offset + 60 > len(data):
            break
        
        rec_len = struct.unpack_from('<I', data, offset)[0]
        if rec_len == 0 or rec_len > 65536:
            offset += 8
            continue
        
        timestamp_raw = struct.unpack_from('<Q', data, offset + 32)[0]
        reason = struct.unpack_from('<I', data, offset + 40)[0]
        fn_len = struct.unpack_from('<H', data, offset + 56)[0]
        fn_off = struct.unpack_from('<H', data, offset + 58)[0]
        
        if fn_len > 0 and offset + fn_off + fn_len <= len(data):
            filename = data[offset + fn_off:offset + fn_off + fn_len].decode('utf-16-le', errors='replace')
            dt = datetime.datetime(1601, 1, 1) + datetime.timedelta(microseconds=timestamp_raw // 10)
            reason_str = '|'.join(v for k, v in USN_REASONS.items() if reason & k)
            print(f"{dt} {filename} [{reason_str}]")
        
        offset += rec_len

with open('$J', 'rb') as f:
    parse_usn_records(f.read())
```

---

## Phase 6: wmiexec.py Artifact Detection

```bash
# wmiexec.py creates temp files in C:\Windows\:
# Pattern: __<unix_timestamp>.<random>
# USN journal tracks create + delete even after cleanup

# Find in MFT/USN:
strings -el '$MFT' | grep -E '^__[0-9]{10}'
# The unix timestamp = approximate command execution time

# Count cycles = number of commands executed:
# Each command = FILE_CREATE + DATA_EXTEND + FILE_DELETE cycle

# WMI usage indicator:
strings 'WMIPRVSE.EXE-*.pf' | head  # Prefetch confirms WMI host ran
```

---

## Phase 7: PowerShell History Timeline

```bash
# Location: C:\Users\<user>\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadline\ConsoleHost_history.txt
# PSReadLine writes commands incrementally
# USN DATA_EXTEND events = individual command execution timestamps

cat 'ConsoleHost_history.txt'

# Cross-reference USN journal DATA_EXTEND timestamps with command order
# Example reconstruction:
# 08:05:19 [DATA_EXTEND] → first command
# 08:05:50 [DATA_EXTEND] → second command
# Each extension = one command entered
```

---

## Phase 8: Anti-Forensics Detection

```bash
# When Security.evtx is cleared, alternate sources survive:
# 1. USN journal: file operations
# 2. SAM registry: account creation timestamps
# 3. ConsoleHost_history.txt: PowerShell commands
# 4. Prefetch files: program execution
# 5. Windows Defender MPLog: threat detections
# 6. TerminalServices logs: RDP (separate from Security.evtx)
# 7. WMI repository: OBJECTS.DATA

# Windows Defender MPLog:
find /mnt/windows -name "MPLog-*.log" 2>/dev/null
grep -iE "DETECTION|THREAT|QUARANTINE|Block" MPLog*.log

# Recycle Bin forensics:
# $Recycle.Bin\<SID>\$R* = actual content
# $Recycle.Bin\<SID>\$I* = metadata (original path, timestamp)
strings '$I_SECRET.txt'  # shows original file path

# Contact file hidden data:
cat '*.contact' | grep -A1 Notes

# Hosts file hidden data:
xxd /mnt/windows/Windows/System32/drivers/etc/hosts | tail -20
# Excessive whitespace may hide data

# Timeline: First login = user profile directory creation in USN:
grep "C:\\\\Users\\\\USERNAME" usn_output.txt | grep FILE_CREATE | head -1
```

---

## Output

Save to `.omop/engagement/ctf/forensics/windows/`:
- `timeline.txt`: reconstructed attack timeline
- `credentials.txt`: extracted hashes/passwords
- `iocs.txt`: indicators of compromise
- `flag.txt`: found flag

## Next Phase

→ `ctf-forensics-disk` for memory analysis
→ `ctf-forensics-network` for PCAP analysis
