---
tags: [ctf, rev, tools, ghidra, ida, gdb]
created: 2026-05-02
---

# 🛠 Tools for Reverse Engineering

> สรุปเครื่องมือ RE ทั้งหมด: เลือกใช้อะไรเมื่อไหร่

ดูเทคนิคการใช้ใน [Static-Analysis](Static-Analysis.md) และ [Dynamic-Analysis](Dynamic-Analysis.md)

---

## 📊 Tool Selection Matrix

### ตามประเภทไฟล์

| ประเภท | Static | Dynamic |
|--------|--------|---------|
| **Linux ELF** (x86_64, ARM) | Ghidra, IDA, radare2 | gdb + pwndbg |
| **Windows PE** | Ghidra, IDA, x64dbg | x64dbg, WinDbg |
| **Mach-O** (macOS/iOS) | Ghidra, Hopper | lldb, Frida |
| **Android APK** | JADX, apktool, Ghidra | Frida, Objection |
| **iOS IPA** | Hopper, Ghidra, class-dump | Frida (jailbroken) |
| **.NET (.exe/.dll)** | dnSpy, dotPeek | dnSpy debugger |
| **Java (.jar)** | JD-GUI, JADX, CFR | jdb, IntelliJ |
| **Python (.pyc)** | uncompyle6, decompyle3 | pdb |
| **WebAssembly (.wasm)** | wabt, wasm-decompile | Browser devtools |
| **Lua (.luac)** | luadec |: |
| **Firmware blob** | binwalk + Ghidra | QEMU |

### ตามเป้าหมาย

| เป้าหมาย | Tool |
|---------|------|
| Decompile to C/C++ | Ghidra ⭐ ฟรี / IDA Pro $$$$ |
| ดู strings | `strings`, Ghidra Defined Strings |
| Live debugging | gdb (Linux), x64dbg (Win) |
| Hook function calls | Frida, ltrace, LD_PRELOAD |
| Symbolic execution | angr, Triton, Manticore |
| Patch binary | hex editor (HxD, ImHex), Ghidra Patch |
| Detect packer | Detect It Easy (DIE), PEiD |
| Unpack | UPX (`upx -d`), Scylla |

---

## 🦎 Ghidra ⭐ ที่ใช้บ่อยสุด

**Free + open source (NSA)**
- ดาวน์โหลด: ghidra-sre.org
- ต้องมี Java JDK 17+
- Cross-platform

### จุดเด่น
- Decompiler ดีพอใช้ (Hex-Rays-quality)
- Multi-architecture
- Scriptable (Java/Python via Jython)
- Headless mode สำหรับ batch
- Free

### Hotkeys ที่ต้องจำ
| Key | Action |
|-----|--------|
| `G` | Go to address |
| `L` | Rename label/var |
| `T` | Set data type |
| `;` | Comment EOL |
| `F` | Re-decompile |
| `Ctrl+Shift+E` | Show xrefs |
| `Space` | Toggle Listing/Graph |

---

## 🔪 IDA (Free / Pro)

**Industry standard**
- IDA Free: limited (no decompile x86_64), free
- IDA Home: $XXX
- IDA Pro: $$$$

### จุดเด่น
- Hex-Rays decompiler (industry-leading quality, Pro only)
- Plugin ecosystem ใหญ่
- Best UX

### ใช้เมื่อ
- มี license หรือ work env
- ต้องการ best-quality decompile

---

## 🦀 radare2 / Cutter

**Open source, CLI-first**
- radare2 = CLI
- Cutter = GUI based on r2

### จุดเด่น
- ฟรี
- Scriptable
- ทุก architecture

### ข้อเสีย
- Steep learning curve (CLI)
- Decompiler weaker than Ghidra

---

## 🟦 Binary Ninja

**Modern UI, paid**
- Free version (limited)
- Personal $$, Commercial $$$$

### จุดเด่น
- Best Python API ใน industry
- HLIL (High-Level IL) decompile clean
- Fast

---

## 🐛 Debuggers

### gdb + pwndbg (Linux) ⭐
```bash
gdb ./binary
pwndbg> b main
pwndbg> r
pwndbg> checksec
pwndbg> heap                              # heap state
pwndbg> rop                               # search ROP gadgets
pwndbg> cyclic 100                        # de Bruijn pattern
```

### gdb + gef (alternative to pwndbg)
```bash
wget -O ~/.gdbinit-gef.py -q https://gef.blah.cat/py
echo source ~/.gdbinit-gef.py >> ~/.gdbinit
```

### x64dbg (Windows) ⭐
- Free, open source
- GUI similar to OllyDbg
- Plugin support (ScyllaHide, etc.)

### WinDbg (Windows)
- Microsoft official
- Powerful, steep learning curve
- Best for kernel debugging

### lldb (macOS)
- Default macOS debugger

---

## 💉 Frida: Dynamic Instrumentation

**JavaScript hook framework**
- Cross-platform (Linux, Win, macOS, Android, iOS)
- Inject JS into process

```javascript
Interceptor.attach(Module.findExportByName(null, "strcmp"), {
    onEnter: function(args) {
        console.log(args[0].readCString(), args[1].readCString());
    }
});
```

### Useful for
- Hook crypto functions → leak keys
- Bypass anti-debug
- Bypass SSL pinning (mobile)
- Modify return values

ดู [Dynamic-Analysis](Dynamic-Analysis.md) เต็ม

---

## 🧠 Symbolic Execution

### angr
```python
import angr
proj = angr.Project('./binary')
state = proj.factory.entry_state(stdin=angr.SimFile('stdin', '\x00'*16))
sm = proj.factory.simulation_manager(state)
sm.explore(find=0x401234, avoid=[0x401300])
print(sm.found[0].posix.dumps(0))
```

ใช้สำหรับ:
- Crackme ที่ check input ทีละ byte
- Find input ที่นำไปสู่ specific address

### Triton, Manticore
Alternative symbolic execution frameworks

### z3: SMT Solver
สำหรับ constraint solving:
```python
from z3 import *
x = BitVec('x', 32)
s = Solver()
s.add(x * 13 + 7 == 0xdeadbeef)
if s.check() == sat:
    print(s.model())
```

---

## 📦 Specialized Tools

### .NET
- **dnSpy** ⭐: decompile + debug C# in real-time
- **dotPeek** (JetBrains)
- **ILSpy**
- **de4dot**: deobfuscate (ConfuserEx, etc.)

### Java
- **JADX** ⭐: APK + JAR decompile to Java
- **JD-GUI**: older but still useful
- **CFR**: CLI Java decompiler
- **Procyon**
- **Bytecode Viewer**: combines all above

### Python
- **uncompyle6**: Python 2.x and 3.x (older)
- **decompyle3**: Python 3.7+
- **pycdc**: newer Python versions

```bash
pip install decompyle3
decompyle3 file.pyc > file.py
```

### Go
- **Garble** detection
- **GoReSym**: restore symbol info
- ปกติ Go binary ใหญ่และ stripped: ใช้ Ghidra + plugin Golang

### Rust
- ปกติ stripped: ใช้ Ghidra
- Mangling specific: ดู rustfilt

---

## 🔍 Trace Tools

### strace (Linux)
```bash
strace ./binary                          # all syscalls
strace -e trace=open,read ./binary       # filter
strace -f ./binary                       # follow forks
```

### ltrace (Linux)
```bash
ltrace ./binary                          # library calls
ltrace -e strcmp ./binary                # filter
```

### dtrace / dtruss (macOS)
```bash
sudo dtruss ./binary
```

### Process Monitor (Windows)
- File / registry / network / process events
- Sysinternals suite

---

## 🪟 Windows-Specific

### PE Tools
- **CFF Explorer**: view/edit PE structure
- **PE-bear**: modern alternative
- **Detect It Easy (DIE)**: detect packer/compiler
- **Resource Hacker**: view embedded resources

### Sysinternals (Windows)
- Process Monitor
- Process Explorer
- TCPView
- Autoruns

---

## 🐧 Linux-Specific

### Static helpers
```bash
file binary
checksec ./binary                        # security mitigations
nm binary                                # symbols
objdump -d binary                        # disasm
objdump -T binary                        # dynamic symbols
readelf -a binary                        # all ELF info
ldd binary                               # dependencies
```

---

## 📝 Hex Editors

| Tool | Platform |
|------|----------|
| **ImHex** ⭐ | Cross-platform, modern |
| **HxD** | Windows |
| **010 Editor** | Cross-platform, paid (best for binary templates) |
| **Hex Fiend** | macOS |
| **GHex** | Linux |
| **xxd** + `vim` | CLI |

ImHex มี pattern language: สำหรับ parse binary structures

---

## 🤖 AI-Assisted RE (newer)

- **Decyx** / similar: AI annotations on Ghidra
- **GPT-4 plugins for Ghidra**: explain functions
- **Reverse Engineer's Toolkit** with LLMs

→ Helpful for unfamiliar code, but verify outputs

---

## 🎯 Practical Workflow

### "ได้ binary มาใหม่"
```
1. file ./binary
2. checksec ./binary
3. strings ./binary | head -50
4. ./binary           (ลองรัน: ดู UX)
5. ltrace ./binary    (มัก leak strcmp args = flag)
6. Open ใน Ghidra → main()
7. Trace logic → identify "win" path
8. (ถ้าจำเป็น) gdb breakpoint + inspect
```

### "Stripped binary"
```
1. Ghidra: Symbol Tree → entry function
2. ใน entry: __libc_start_main(arg1, ...) → arg1 = main address
3. Double-click → main
4. Continue normal flow
```

### "Anti-debug binary"
ดู [Anti-Debug-Tricks](Anti-Debug-Tricks.md) เต็ม
```
1. Identify check (ptrace, IsDebuggerPresent, etc.)
2. NOP/patch หรือ LD_PRELOAD override
3. Continue analysis
```

### "Packed binary"
```
1. Detect: DIE, strings (UPX = "UPX!" signature)
2. UPX: upx -d
3. Custom: trace decryption → dump memory at OEP → reconstruct
```

### "VM-based binary"
ดู [VM-Reversing](../16-Misc/VM-Reversing.md)

---

## 🔗 ที่เกี่ยวข้อง

- [RE-Intro](RE-Intro.md)
- [Static-Analysis](Static-Analysis.md)
- [Dynamic-Analysis](Dynamic-Analysis.md)
- [Assembly-Basics](Assembly-Basics.md)
- [Anti-Debug-Tricks](Anti-Debug-Tricks.md)

## 📚 References

- ghidra-sre.org
- hex-rays.com (IDA)
- frida.re/docs
- "Practical Reverse Engineering": Bruce Dang
- "Reverse Engineering for Beginners": Dennis Yurichev (free)

---

#ctf #rev #tools
