---
name: reverse-platforms
description: "CTF reverse engineering by platform. macOS Mach-O analysis, iOS class-dump, IoT/embedded firmware (ARM/MIPS), Linux kernel modules, eBPF programs, game engines (Unreal .pak, Unity C#), automotive CAN/UDS, RISC-V custom extensions, HD44780 LCD reconstruction. Triggers: 'macos reverse', 'ios reverse', 'mach-o', 'iot reverse', 'kernel module', 'ebpf reverse', 'unreal pak', 'can forensics', 'uds reverse', 'risc-v', 'lcd reconstruction'."
---

# CTF Reverse: Platform-Specific

macOS/iOS, IoT embedded, kernel drivers, eBPF, game engines, automotive CAN.

---

## Phase 1: macOS / iOS (Mach-O)

```bash
# Identify architecture:
file ./binary
lipo -info ./binary          # fat binary: list architectures
lipo -thin x86_64 ./fat_bin -output ./x86_64_bin

# Objective-C class hierarchy:
class-dump ./binary -H -o ./headers/
cat ./headers/*.h | grep -iE "flag|secret|key|password"

# Swift demangling:
xcrun swift-demangle 's:13ChallengeApp11ContentViewV4bodyQrvg'
# Or: swift-demangle (standalone tool from swift toolchain)

# LLDB debugging:
lldb ./binary
(lldb) b -n "checkFlag:"       # breakpoint on ObjC method
(lldb) run
(lldb) p $rdi                  # ObjC: self in rdi
(lldb) po [$rdi description]

# Code signature bypass:
codesign --remove-signature ./binary
# Or: use csrutil disable (needs SIP off)
```

---

## Phase 2: IoT / Embedded Firmware

```bash
# Extract filesystem from firmware:
binwalk -e firmware.bin -C ./extracted/
ls ./extracted/

# Identify all ELF architectures present:
find ./extracted/ -name "*.elf" -o -perm /0111 2>/dev/null | xargs file 2>/dev/null | grep ELF

# Architecture-specific notes:
# ARM: follow function epilog for return detection (POP {PC})
# MIPS: branch delay slots: instruction AFTER branch ALWAYS executes
# RISC-V: custom extensions may add non-standard opcodes

# Static analysis (terminal-only: no Ghidra/IDA in this environment):
r2 -A ./firmware.elf            # radare2 auto-analysis
rabin2 -zI ./firmware.elf       # strings + imports/info
# For decompilation-as-a-service: upload to dogbolt.org via their API when the
# binary tolerates it, else read r2 disassembly directly.

# Check for hardcoded credentials:
grep -r "admin\|password\|secret\|key\|token" ./extracted/ --include="*.conf" --include="*.cfg"
find ./extracted/ -name "*.sh" | xargs grep -li "passwd\|password"
```

---

## Phase 3: Linux Kernel Modules

```bash
# .ko module entry point:
objdump -d challenge.ko | grep -A20 "init_module"
# Resolve module symbols:
objdump -T challenge.ko

# ioctl handler:
objdump -d challenge.ko | grep -A5 "unlocked_ioctl"

# eBPF programs: dump running bytecode:
bpftool prog list
bpftool prog dump xlated id PROG_ID
bpftool prog dump jited id PROG_ID  # JIT-compiled

# eBPF register conventions:
# r0 = return value
# r1-r5 = function arguments
# r6-r9 = callee-saved
# r10 = frame pointer (read-only)
# ctx pointer: r1 on entry to program

# Find eBPF program by type:
bpftool prog list | grep -i "type"
```

---

## Phase 4: Game Engines

```bash
# Unreal Engine .pak files:
# Tool: UnrealPak (from UE SDK) or QuickBMS
apt-get install quickbms
quickbms ue4.bms game.pak output_dir/

# Or: unrealpak CLI
UnrealPak game.pak -Extract output_dir/

# Blueprint bytecode (.uasset):
# Use UAssetAPI or FModel
# FModel: GUI tool for UE asset viewing

# Unity managed assemblies (C# IL):
# Locate: <game>/game_Data/Managed/Assembly-CSharp.dll
dnspy Assembly-CSharp.dll    # GUI IL2CPP decompiler
# Or CLI:
dotnet-decompiler Assembly-CSharp.dll --output ./csharp_src/

# IL2CPP native:
# See ctf-reverse-languages skill Phase 3
```

---

## Phase 5: Automotive CAN / UDS

```bash
# CAN traffic capture (hardware required):
candump can0 | tee can_log.txt
# Or from file:
canplayer -I can_log.asc

# Decode CAN frames:
python3 << 'EOF'
import cantools

db = cantools.database.load_file('vehicle.dbc')
msg = db.decode_message(0x123, bytes.fromhex('0102030405060708'))
print(msg)
EOF

# UDS (Unified Diagnostic Services): ECU communication:
# Service IDs:
# 0x10 = DiagnosticSessionControl
# 0x22 = ReadDataByIdentifier (DID)
# 0x27 = SecurityAccess (seed-key algorithm)
# 0x34 = RequestDownload (firmware update)

# Security access seed-key:
# ECU sends seed → calculate key → send back
# Reverse the key calculation algorithm from binary

python3 << 'EOF'
import can, isotp

# Send UDS request over CAN:
bus = can.Bus(channel='can0', bustype='socketcan')

# DiagnosticSessionControl - enter extended session:
bus.send(can.Message(arbitration_id=0x7DF, data=[0x02, 0x10, 0x03]))
response = bus.recv(timeout=1.0)
print(f"Response: {response}")

# ReadDataByIdentifier (DID 0xF190 = VIN):
bus.send(can.Message(arbitration_id=0x7DF, data=[0x03, 0x22, 0xF1, 0x90]))
EOF
```

---

## Phase 6: RISC-V

```bash
# RISC-V standard extensions:
# I = integer base, M = multiply, A = atomic, F = float, D = double
# C = compressed 16-bit instructions, B = bit manipulation

# Custom extension detection:
objdump -d ./riscv_binary | grep "custom\|0x"

# Zbb bit manipulation extension:
# clz, ctz, cpop, max, min, orc.b, rev8, rol, ror, sext.*

# Privileged modes: Machine (M) > Supervisor (S) > User (U)
# CSR registers: mtvec (trap vector), mepc (trap PC), mcause, satp (page table)

# Analyze with Ghidra + RISC-V processor extension:
# Settings: Language = RISC-V, bits = 32 or 64
# Check custom opcode handlers at reset vector
```

---

## Phase 7: HD44780 LCD Reconstruction

```python
# Pattern: GPIO sampling at fixed intervals, non-contiguous DRAM addressing
# HD44780 display has 4 display lines at non-sequential memory addresses

# Memory layout (standard 20x4):
# Line 1: 0x00 - 0x13
# Line 2: 0x40 - 0x53
# Line 3: 0x14 - 0x27
# Line 4: 0x54 - 0x67

def reconstruct_lcd_display(sampled_bytes: bytes, cols=20, rows=4):
    """Reconstruct HD44780 display from DRAM sample."""
    display = []
    offsets = [0x00, 0x40, 0x14, 0x54]  # line start addresses
    
    for row, offset in enumerate(offsets[:rows]):
        line = ''
        for col in range(cols):
            addr = offset + col
            if addr < len(sampled_bytes):
                char = sampled_bytes[addr]
                line += chr(char) if 0x20 <= char <= 0x7E else '?'
        display.append(line)
    
    return '\n'.join(display)

# Usage:
with open('dram_sample.bin', 'rb') as f:
    data = f.read()
print(reconstruct_lcd_display(data))
```

---

## Phase 8: Side-Channel (Code Coverage)

```bash
# Code coverage leak: branch taken/not-taken depends on secret bytes
# Instrument binary with Pin/DynamoRIO, vary input, observe coverage

# Intel Pin inscount:
/opt/intel/pin/pin -t /opt/intel/pin/source/tools/ManualExamples/obj-intel64/inscount0.so -- ./challenge AAA 2>&1 | grep Count

# Script: find input that maximizes coverage
python3 << 'EOF'
import subprocess

def get_inscount(input_bytes):
    result = subprocess.run(
        ['pin', '-t', 'inscount0.so', '--', './challenge'],
        input=input_bytes, capture_output=True
    )
    for line in result.stderr.decode().splitlines():
        if 'Count' in line:
            return int(line.split()[-1])
    return 0

# Byte-by-byte recovery:
known = b''
for pos in range(32):
    best_count = 0
    best_byte = 0
    for b in range(256):
        test = known + bytes([b]) + b'\x00' * (32 - pos - 1)
        count = get_inscount(test)
        if count > best_count:
            best_count = count
            best_byte = b
    known += bytes([best_byte])
    print(f"Position {pos}: {chr(best_byte)} (count={best_count})")

print(f"Recovered: {known}")
EOF
```

---

## Output

Save to `.omop/engagement/ctf/reverse/`:
- `decompiled/`: decompiled source
- `can-decoded.txt`: CAN message analysis
- `flag.txt`: found flag

## Next Phase

→ `ctf-reverse-dynamic` for Frida/angr dynamic analysis
→ `ctf-reverse-anti-analysis` for anti-debug bypass
