---
tags: [ctf, rev, anti-debug, anti-analysis, packing]
created: 2026-05-01
---

# 🛡 Anti-Debug Tricks & Bypasses

> Binary บางตัวพยายาม **ต่อต้าน** การ reverse: ตรวจหา debugger, packed/obfuscated, encrypt strings runtime, ฯลฯ

ใน CTF: เป็น "challenge ระดับสูง": ต้องรู้ trick + วิธี bypass

---

## 🐛 Anti-Debug Techniques

### Linux

#### 1. `ptrace(PTRACE_TRACEME)`
Process call `ptrace(PTRACE_TRACEME, 0, 0, 0)`: ถ้ามี debugger อยู่แล้ว → return -1

```c
#include <sys/ptrace.h>
if (ptrace(PTRACE_TRACEME, 0, 0, 0) < 0) {
    printf("Debugger detected!\n");
    exit(1);
}
```

**Bypass:**
- gdb: `catch syscall ptrace` → `set $rax = 0` ใน return
- Or NOP out the call
- Or `LD_PRELOAD` override `ptrace()`:
  ```c
  long ptrace(int request, ...) { return 0; }
  ```

#### 2. Read `/proc/self/status`
```c
FILE *f = fopen("/proc/self/status", "r");
char line[256];
while (fgets(line, 256, f)) {
    if (strncmp(line, "TracerPid:", 10) == 0) {
        if (atoi(line + 10) != 0) {
            // debugger detected
        }
    }
}
```

**Bypass:**
- gdb: hijack `open` หรือ `read` เพื่อ return fake content
- LD_PRELOAD overrides
- Patch comparison

#### 3. Timing checks
```c
clock_t start = clock();
// ... some code ...
clock_t end = clock();
if (end - start > THRESHOLD) {
    // slow → likely in debugger
}
```

**Bypass:**
- Skip past the timing check (set rip)
- Patch `clock()` to return constant

#### 4. `/proc/self/maps` check
ดูว่ามี debugger lib (gdb) ใน memory map ไหม

#### 5. Self-modifying code
Decrypt code ตอน run: debugger setting breakpoint บน encrypted code → break ผิดที่

### Windows

#### 1. `IsDebuggerPresent()`
```c
if (IsDebuggerPresent()) {
    ExitProcess(1);
}
```

**Bypass:** patch return value, หรือ x64dbg → "Hide debugger" plugin

#### 2. `CheckRemoteDebuggerPresent()`
```c
BOOL bDebugger = FALSE;
CheckRemoteDebuggerPresent(GetCurrentProcess(), &bDebugger);
```

#### 3. `NtQueryInformationProcess`
ลึกกว่า `IsDebuggerPresent`: query class `ProcessDebugPort`

```c
NtQueryInformationProcess(hProcess, ProcessDebugPort, &debugPort, ...);
if (debugPort != 0) // debugger detected
```

#### 4. PEB BeingDebugged flag
ตำแหน่ง `fs:[0x30]` (32-bit) หรือ `gs:[0x60]` (64-bit) → PEB → BeingDebugged byte

```asm
mov eax, fs:[0x30]
movzx eax, byte ptr [eax + 2]    ; PEB.BeingDebugged
test eax, eax
jnz .debugger_detected
```

**Bypass:** เปลี่ยน BeingDebugged เป็น 0 ใน debugger

#### 5. NtGlobalFlag (PEB+0x68)
Heap flags ที่ตั้งโดย debugger

#### 6. Heap flags

#### 7. Process32First/Next: หา debugger process
เช็คว่ามี process ชื่อ `ollydbg.exe`, `x64dbg.exe`, `ida64.exe` running ไหม

#### 8. Window enumeration
หา window ที่มี class ของ debugger

#### 9. Hardware breakpoints check
อ่าน DR0-DR7 ผ่าน `GetThreadContext`

---

## 📦 Packing / Obfuscation

### Packers
Pack = encrypt/compress binary → unpack ตอน run

#### Common packers
| Packer | Detect by | Unpack |
|--------|-----------|--------|
| **UPX** | strings มี "UPX!" | `upx -d binary` |
| **ASPack** | section names | manual / generic unpacker |
| **Themida** | hard | very hard |
| **VMProtect** | sections, complex | hardest, often need custom approach |
| **Enigma Protector** | | manual unpack required |

#### UPX (มือใหม่)
```bash
# Detect
strings binary | grep -i upx
# "UPX!" in section names

# Unpack
upx -d packed_binary
```

#### Manual unpacking workflow
1. Run binary in debugger
2. Set breakpoint at OEP (Original Entry Point)
   - มัก: ก่อน `jmp` ใหญ่หลัง decryption loop
3. Run จนถึง OEP
4. Dump memory ตั้งแต่ image base
5. Reconstruct PE/ELF (fix imports, sections)

Tools:
- **Scylla** (Windows): dump + fix imports
- **Detect It Easy (DIE)**: identify packer
- **PE-bear**: PE editor

### Obfuscation techniques

#### Control flow flattening
แทน normal control flow → state machine ขนาดใหญ่
```c
while (1) {
    switch (state) {
        case 0: /* code */ state = 5; break;
        case 5: /* code */ state = 2; break;
        case 2: /* code */ return;
    }
}
```

→ ดูยากมาก: ใช้ **deflattener** scripts

#### Opaque predicates
Conditional ที่ผลลัพธ์รู้แล้ว แต่ static analyzer มองว่า unknown
```c
if ((x*x*x + 1) % 7 != 0) { /* always true */ }
```

#### Junk code insertion
ใส่ instruction ที่ไม่ทำอะไร แต่ทำให้อ่านยาก
```asm
push rax
pop rax              ; useless
xor rax, rax
xor rax, rax
not rax
not rax              ; cancels out
```

#### Mixed Boolean Arithmetic (MBA)
แทน `x + y` ด้วย expression ที่ซับซ้อน
```c
x + y == (x ^ y) + 2 * (x & y)
```

→ ใช้ **simplifier** tools: SiMBA, MBA-Simplifier

#### String encryption
Strings เก็บ encrypted, decrypt ตอนใช้
- หา decrypt function → call ใน debugger ดู result
- หรือ implement ใน Python

#### API hashing (Windows)
แทน import ตามชื่อ → ใช้ hash ของชื่อ → resolve at runtime
- ทำให้ static เห็นแค่ตัวเลข hash ไม่เห็นชื่อ API
- ใช้ใน malware ส่วนใหญ่

**Bypass:** dynamic analysis, ดู API จริงที่ถูก resolve

### Tools เด่น

| Tool | ใช้ทำอะไร |
|------|----------|
| **Detect It Easy (DIE)** | Identify packer/compiler |
| **PEiD** (เก่า, Windows) | Detect packers |
| **scylla** | Dump + IAT fix |
| **x64dbg + Scylla** | Manual unpack workflow |
| **angr** | Symbolic execution (powerful for de-obfuscate) |
| **unicorn** | CPU emulator (Python) |

---

## 🌀 Anti-VM / Anti-Sandbox

Malware/CTF บางตัวเช็คว่าอยู่ใน VM ไหม

### Indicators
- MAC address prefix (VirtualBox `08:00:27`, VMware `00:0C:29`)
- Hardware names (`VBOX*`, `VMWARE*`)
- Number of CPUs (1 = suspicious)
- Disk size < threshold
- Mouse movement (sandbox = no movement)
- Files/registry keys ของ VM tools
- CPUID hypervisor bit

### Bypass
- VM customize MAC, CPU count
- Patch checks ใน binary

---

## 🔥 Self-Modifying Code (SMC)

```asm
mov [.target], 0x90        ; เขียน 0x90 (NOP) ทับ code
.target:
    int 3                  ; แต่ตอน execute อยู่นี้ → NOP แทน int3
```

→ static disasm เห็น `int 3` แต่ runtime executes NOP

**Detection in Ghidra:** ดู instruction ที่เขียนใน .text section
**Bypass:** dynamic analysis, ดู runtime version

---

## 🧪 VM-based Obfuscation

Binary มี **bytecode VM** ของตัวเอง:
1. Real logic encoded ใน bytecode
2. Native code = interpreter ของ bytecode
3. Decompile native code → เห็นแต่ interpreter loop

**Workflow:**
1. ระบุ dispatch table ของ VM (mapping opcode → handler)
2. Reverse แต่ละ handler: เข้าใจว่า opcode ทำอะไร
3. Disassemble bytecode ด้วย handler info ที่ได้
4. Reverse logic ใน bytecode

**Tools:**
- Custom Python disassembler (เขียนเอง)
- **Triton** / **angr** (symbolic execution)

ดู [VM-Reversing](../16-Misc/VM-Reversing.md) ใน roadmap (เฟส 3)

---

## 🐍 Strings Encryption

Common pattern:
```c
char encrypted[] = {0xE3, 0x88, 0x9F, ...};
char real[100];
for (int i = 0; i < 50; i++) {
    real[i] = encrypted[i] ^ 0xAB;
}
```

**Reverse:**
- Static: extract bytes → XOR ใน Python
- Dynamic: breakpoint หลัง decryption → ดู memory

```python
# Python solver
encrypted = bytes.fromhex("E3889F...")
print(bytes(b ^ 0xAB for b in encrypted))
```

---

## 🐢 Detection of analysis environment

### Process detection
เช็คว่า process ของ analysis tools running:
- `ida64.exe`, `ida.exe`
- `x64dbg.exe`, `x32dbg.exe`
- `ollydbg.exe`
- `windbg.exe`
- `procmon.exe`
- `wireshark.exe`

```c
// Pseudocode
if (FindWindow("OLLYDBG") || FindProcess("ida64.exe")) {
    exit();
}
```

### Driver detection
เช็ค kernel driver ของ debugger/sandbox

---

## 🔓 Bypass Techniques

### 1. Patching
หาจุด check → NOP/patch
```bash
# In gdb
set *(unsigned char*)0x401234 = 0x90    # NOP

# Persistent patch
# Edit binary directly with hex editor
```

### 2. Conditional breakpoint
```gdb
b *0x401234 if 0     # never hits, but evaluation can happen
```

### 3. ScyllaHide / TitanHide (Windows)
Plugin สำหรับ x64dbg ที่ hide debugger จาก common checks

### 4. LD_PRELOAD (Linux)
Override library functions
```c
// hook.c
int ptrace(int req, ...) { return 0; }
```
```bash
gcc -shared -fPIC hook.c -o hook.so
LD_PRELOAD=./hook.so ./binary
```

### 5. Frida hook
```javascript
Interceptor.replace(Module.findExportByName(null, "ptrace"),
    new NativeCallback(function() { return 0; }, 'long', ['int']));
```

### 6. Symbolic execution (angr)
เมื่อ static analysis ยาก → ใช้ angr/Triton ให้ solver หา input ที่นำไปสู่ "good path"

```python
import angr

proj = angr.Project('./binary')
state = proj.factory.entry_state()
simgr = proj.factory.simulation_manager(state)
simgr.explore(find=0x401234, avoid=[0x401300])    # find = "win" addr
solution = simgr.found[0].posix.dumps(0)
print(solution)
```

→ angr รันโปรแกรมแบบ symbolic: แทนค่าจริงด้วยตัวแปร: solver หาค่าที่ตรงเงื่อนไข

ใช้ได้กับ:
- Crackme ที่ check input ทีละ byte
- Constraint-based puzzles

ข้อจำกัด:
- ไม่ work กับ crypto (state explosion)
- Performance: binary ใหญ่ช้ามาก

---

## 🎯 CTF Workflow (Anti-debug binary)

```
1. file ./binary; checksec
   → static check first

2. strings | grep -i debug
   → "Debugger detected"? → confirm anti-debug

3. ltrace ./binary 2>&1 | head
   → see ptrace? IsDebuggerPresent?

4. Open Ghidra → find anti-debug check
   → identify check function (ปกติเรียกตอนต้น main)

5. Bypass:
   - Patch in binary directly (hex editor)
   - หรือ gdb modify rip/rax to skip check
   - หรือ LD_PRELOAD override

6. Continue normal RE flow
```

---

## 🔗 ต่อไป

- [RE-Intro](RE-Intro.md)
- [Static-Analysis](Static-Analysis.md)
- [Dynamic-Analysis](Dynamic-Analysis.md)
- [Assembly-Basics](Assembly-Basics.md)

## 📚 References

- "Practical Malware Analysis": Sikorski (anti-debug chapter)
- Anti-Debug Tricks: anti-debug.checkpoint.com
- Malware Unicorn workshops: malwareunicorn.org

---

#ctf #rev #anti-debug #anti-analysis
