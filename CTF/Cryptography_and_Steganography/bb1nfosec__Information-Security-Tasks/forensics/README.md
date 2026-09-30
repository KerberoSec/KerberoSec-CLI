# Digital Forensics

> Collecting, preserving, and analyzing digital evidence: disk, memory, network, logs.

---

## Evidence Priority (Volatility Order)

```
1. CPU registers / cache       ← most volatile
2. RAM / process memory
3. Running processes, network state
4. Swap / pagefile
5. Disk (filesystem, MFT)      ← least volatile
6. Remote logging / SIEM       ← already off-box
```

Always capture volatile evidence first.

---

## Disk Forensics

```bash
# Forensic image with hashing
dcfldd if=/dev/sda of=disk.img hash=sha256 hashlog=hash.txt

# Mount read-only
mount -o ro,loop disk.img /mnt/evidence

# List all files including deleted
fls -r -m / disk.img > bodyfile.txt

# Timeline
mactime -b bodyfile.txt -d 2024-01-01 > timeline.csv

# Recover deleted files by signature
foremost -i disk.img -o recovered/
```

### Key Windows Artefacts

| Artefact | Location | Value |
|----------|----------|-------|
| $MFT | C:\$MFT | Every file ever created |
| $UsnJrnl | C:\$Extend\$J | File change history |
| Prefetch | C:\Windows\Prefetch\*.pf | Program execution + 8 last run times |
| ShellBags | NTUSER.DAT / UsrClass.dat | Folder access history |
| Amcache.hve | C:\Windows\AppCompat\ | Program execution + hash |
| SRUM | C:\Windows\System32\sru\ | 30-day app/network usage |
| LNK files | %APPDATA%\Microsoft\Recent | Accessed file paths + timestamps |
| Jump Lists | %APPDATA%\Microsoft\Windows\Recent\AutoDest | Per-app recent files |

---

## Memory Forensics (Volatility 3)

```bash
# OS info
vol3 -f memory.dmp windows.info

# Process hunting
vol3 -f memory.dmp windows.pstree
vol3 -f memory.dmp windows.psscan        # finds hidden/unlinked processes
vol3 -f memory.dmp windows.malfind       # injected PE in unexpected regions

# Network state
vol3 -f memory.dmp windows.netstat

# Credentials
vol3 -f memory.dmp windows.hashdump
vol3 -f memory.dmp windows.lsadump

# Command history
vol3 -f memory.dmp windows.consoles

# Dump suspicious process
vol3 -f memory.dmp windows.dumpfiles --pid 1234
```

---

## Network Forensics

```bash
# Extract HTTP objects
tshark -r capture.pcap --export-objects http,./objects/

# Check DNS exfil (long subdomains)
tshark -r cap.pcap -Y dns -T fields -e dns.qry.name \
  | awk '{print length, $0}' | sort -rn | head -20

# Extract cleartext credentials
dsniff -p capture.pcap

# Reconstruct files
networkminer capture.pcap
```

---

## Key Windows Event IDs

| ID | Event |
|----|-------|
| 4624 | Successful logon |
| 4625 | Failed logon |
| 4648 | Logon with explicit credentials |
| 4688 | Process creation |
| 4698 | Scheduled task created |
| 7045 | New service installed |
| 1102 | Audit log cleared |

---

## Linux Forensics

```bash
# Persistence
cat /etc/crontab && ls /etc/systemd/system/
cat ~/.bashrc ~/.bash_profile

# Command history
cat /root/.bash_history

# Failed logins
lastb -F | head -20

# SUID files (escalation / backdoor)
find / -perm -4000 -type f 2>/dev/null

# Kernel modules (rootkit)
lsmod | grep -v "^$(lsmod | head -1)"
```

---

## Tools

| Tool | Purpose |
|------|---------|
| [Volatility 3](https://github.com/volatilityfoundation/volatility3) | Memory analysis |
| [Autopsy](https://www.autopsy.com) | GUI disk forensics |
| [KAPE](https://www.kroll.com/kape) | Rapid Windows artefact collection |
| [Eric Zimmerman Tools](https://ericzimmerman.github.io) | MFT, Prefetch, ShellBags parsers |
| [Plaso](https://github.com/log2timeline/plaso) | Super-timeline generation |
| [NetworkMiner](https://www.netresec.com/?page=NetworkMiner) | PCAP file extraction |
| [Hayabusa](https://github.com/Yamato-Security/hayabusa) | Fast event log triage |
