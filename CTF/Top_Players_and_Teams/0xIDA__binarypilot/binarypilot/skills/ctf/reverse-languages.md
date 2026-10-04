---
name: reverse-languages
description: "CTF reverse engineering by language. Python bytecode (dis, PyInstaller, Pyarmor), Ruby/Perl polyglot, OPAL functional, UEFI VM bytecode, Unity IL2CPP, Roblox asset versioning, Godot KeyDot, HarmonyOS ABC, Electron ASAR, Rust serde_json, Node.js runtime introspection. Triggers: 'python reversing', 'pyinstaller unpack', 'pyarmor', 'unity il2cpp', 'godot reverse', 'electron asar', 'rust reverse', 'node introspect', 'ctf language', 'bytecode analysis'."
---

# CTF Reverse: Language & Platform-Specific

Python bytecode, Unity IL2CPP, Electron, Roblox, Godot, Rust, Node.js.

---

## Phase 1: Python Bytecode

```bash
# Decompile .pyc:
pip install decompile3 --break-system-packages
decompile3 challenge.pyc

# Or pycdc:
git clone https://github.com/zrax/pycdc /opt/pycdc
cd /opt/pycdc && cmake . && make
./pycdc challenge.pyc

# Manual analysis with dis:
python3 -c "
import dis, marshal, struct

with open('challenge.pyc', 'rb') as f:
    f.read(16)  # skip header (16 bytes for py3.8+)
    code = marshal.load(f)

dis.dis(code)
"

# XOR validation pattern in bytecode:
# Look for: LOAD_CONST + BINARY_XOR repeated with indexed array splits
# Split indices tell you which bits of input are XORed together
```

```bash
# PyInstaller unpacking:
pip install pyinstxtractor --break-system-packages
python3 -m pyinstxtractor ./challenge.exe

# Or: clone pyinstxtractor directly
git clone https://github.com/extremecoders-re/pyinstxtractor /opt/pyinstxtractor
python3 /opt/pyinstxtractor/pyinstxtractor.py ./challenge.exe

# After extraction:
ls challenge.exe_extracted/
# Find: challenge.pyc, PYZ-00.pyz, etc.
python3 /opt/pyinstxtractor/pyz_extractor.py PYZ-00.pyz
decompile3 *.pyc 2>/dev/null
```

```bash
# Pyarmor 8/9 static unpacking (without execution):
# Key: Pyarmor stores code in _pyarmor.pyc / pyarmor_runtime/
# Version 8: __pyarmor__ call unmarshals code from .pyc
# Use pyarmor-unpacker or manual extraction
git clone https://github.com/Svenskithesource/PyArmor-Unpacker /opt/pyarmor-unpack
python3 /opt/pyarmor-unpack/unpack.py ./challenge.pyc
```

---

## Phase 2: Roblox Place File

```bash
# Roblox stores script source in Asset Delivery API
# Diff across versions to find flag in modified code

ASSET_ID="12345678"
BASE_URL="https://assetdelivery.roblox.com/v1/asset"

# Get current version:
curl -o current.rbxl "$BASE_URL/?id=$ASSET_ID"

# Get specific version:
curl -o v1.rbxl "$BASE_URL/?id=$ASSET_ID&version=1"

# Extract and diff scripts:
for ver in $(seq 1 20); do
  curl -so "v$ver.rbxl" "$BASE_URL/?id=$ASSET_ID&version=$ver"
done

# Diff script sources between versions:
strings v1.rbxl | grep -A5 "LocalScript\|Script" > v1_scripts.txt
strings v2.rbxl | grep -A5 "LocalScript\|Script" > v2_scripts.txt
diff v1_scripts.txt v2_scripts.txt
```

---

## Phase 3: Unity IL2CPP

```bash
# IL2CPP: C# compiled to native binary + global-metadata.dat

# Symbol dumping with Il2CppDumper:
git clone https://github.com/Perfare/Il2CppDumper /opt/il2cppdumper
cd /opt/il2cppdumper && dotnet build

# Usage:
dotnet Il2CppDumper.dll libil2cpp.so global-metadata.dat /tmp/dump

# Encrypted metadata: use Il2CppDumper with key:
dotnet Il2CppDumper.dll libil2cpp.so global-metadata.dat /tmp/dump --key 0xKEY

# After dumping:
ls /tmp/dump/
# dump.cs: all C# class/method signatures
# il2cpp.h: struct definitions for Ghidra
cat /tmp/dump/dump.cs | grep -iE "flag|password|secret|key"
```

---

## Phase 4: Godot

```bash
# Godot .pck file extraction:
git clone https://github.com/bruvzg/gdsdecomp /opt/gdsdecomp

# Or use godot-reverse:
pip install godot-reverse --break-system-packages

# Extract assets:
godot_re --extract game.pck output_dir/
ls output_dir/

# GDScript files (.gd) are often included:
cat output_dir/**/*.gd | grep -i flag

# Encrypted .pck: recover key with KeyDot:
git clone https://github.com/nikitalita/gdscript-godot-keydot /opt/keydot
# Requires memory dump of running game process
```

---

## Phase 5: Electron ASAR

```bash
# Electron apps bundle JavaScript in .asar archive

# Extract:
npm install -g asar 2>/dev/null || npx asar extract app.asar ./extracted
ls ./extracted/

# Find flag in JS source:
grep -ri "flag\|ctf\|secret\|password" ./extracted/ | grep -v node_modules

# Native binaries inside Electron:
find ./extracted -name "*.node" -o -name "*.so" | xargs file
# Analyze .node files with Ghidra/IDA
```

---

## Phase 6: Node.js Runtime Introspection

```javascript
// Discover hidden methods/properties not visible in source:

// List all own + inherited properties:
function getAll(obj) {
    let props = new Set();
    while (obj) {
        Object.getOwnPropertyNames(obj).forEach(p => props.add(p));
        obj = Object.getPrototypeOf(obj);
    }
    return [...props];
}

// Enumerate loaded modules:
console.log(Object.keys(require.cache));

// Find hidden module exports:
const mod = require('./challenge');
console.log(getAll(mod));
console.log(Object.getOwnPropertyDescriptors(mod));

// Symbol-keyed properties:
console.log(Object.getOwnPropertySymbols(mod));
```

---

## Phase 7: Rust serde_json Schema Recovery

```bash
# Rust binaries using serde_json have field names embedded
# Recover expected JSON schema from Visitor implementations

# 1. Find strings starting with field names:
strings ./challenge | grep -E '^[a-z_]+$' | sort | uniq

# 2. In Ghidra: search for __Field enum variants
# Pattern: "expecting" strings + field name strings
strings ./challenge | grep -B1 "expecting" | grep -v "expecting"

# 3. Construct expected JSON from field names:
# Look for visit_str implementations that match on field names

# Typical pattern:
# Struct has: { field1: type, field2: type }
# Binary contains strings: "field1", "field2", "missing field"
```

---

## Phase 8: UEFI / DOS Stub

```bash
# DOS stub (16-bit code before PE header):
# Some CTF challenges hide code in the DOS stub

# Analyze with DOSBox + IDA:
dosbox -c "debug CHALLENGE.EXE"

# IDA: Load as 16-bit x86
# Or: extract stub manually
python3 << 'EOF'
with open('CHALLENGE.EXE', 'rb') as f:
    data = f.read()

# PE offset at 0x3C:
import struct
pe_offset = struct.unpack('<I', data[0x3C:0x40])[0]
dos_stub = data[0x40:pe_offset]

with open('dos_stub.bin', 'wb') as f:
    f.write(dos_stub)
print(f"DOS stub: {len(dos_stub)} bytes, offset 0x40 to 0x{pe_offset:x}")
EOF
```

---

## Output

Save to `.omop/engagement/ctf/reverse/`:
- `decompiled.py` / `decompiled.cs`: decompiled source
- `dump.cs`: IL2CPP dump
- `flag.txt`: found flag

## Next Phase

→ `ctf-reverse-dynamic` for dynamic analysis
→ `ctf-reverse-anti-analysis` for anti-debug bypass
