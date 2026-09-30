---
tags: [ctf, rev, dynamic-analysis, gdb, debugger]
created: 2026-05-01
---

# 🏃 Dynamic Analysis: รัน + Debug

> รัน binary ใน debugger แล้วดู runtime values: ดีกว่า static เมื่อ:
>: มี anti-disasm tricks
>: มี runtime decryption
>: ต้องเช็ค path เฉพาะ
>: VM/interpreter ที่ static อ่านยาก

---

## 🐛 gdb + pwndbg/gef ⭐ (Linux)

### Setup
```bash
# Install pwndbg
git clone https://github.com/pwndbg/pwndbg
cd pwndbg && ./setup.sh

# หรือ gef (alternative)
wget -O ~/.gdbinit-gef.py -q https://gef.blah.cat/py
echo source ~/.gdbinit-gef.py >> ~/.gdbinit
```

### Basic commands
```gdb
# Start
gdb ./binary
gdb ./binary core.1234         # debug crash core dump
gdb -p <pid>                    # attach to running

# Run
r                               # run
r arg1 arg2                     # with args
r < input.txt                   # stdin from file
start                           # break at main
starti                          # break at _start

# Breakpoints
b main                          # break at function
b *0x401234                     # break at address
b file.c:25                     # break at line
b *main+10                      # break at offset
info b                          # list
delete 1                        # delete by number
disable 1 / enable 1
b printf if $rdi == 0           # conditional

# Step
c                               # continue
n / next                        # step over
s / step                        # step into
ni / nexti                      # next instruction
si / stepi                      # step instruction
finish                          # run until function returns
until <addr>                    # run until address

# Inspect
info registers                  # all registers
p $rax                          # print register
p/x $rax                        # print hex
x/10wx $rsp                     # examine 10 words hex at rsp
x/s 0x401234                    # string at address
x/i 0x401234                    # instruction at address
x/40bx <addr>                   # 40 bytes hex
disas                           # disassemble current function
disas main
disas /r main                   # with raw bytes
```

### x command (examine)
Format: `x/[count][format][size] address`

| Format | Meaning |
|--------|---------|
| `o` | octal |
| `x` | hex |
| `d` | decimal |
| `u` | unsigned |
| `t` | binary |
| `f` | float |
| `c` | char |
| `s` | string |
| `i` | instruction |

| Size | Meaning |
|------|---------|
| `b` | byte (1) |
| `h` | halfword (2) |
| `w` | word (4) |
| `g` | giant (8) |

ตัวอย่าง:
```
x/8gx $rsp     # 8 quad-words hex from rsp (stack)
x/20i $rip     # 20 instructions from rip
x/64bx $rdi    # 64 bytes hex from rdi
```

### pwndbg-specific commands
```gdb
checksec                        # security mitigations
context                         # show registers + stack + code (ปกติ auto)
got                             # GOT entries
plt                             # PLT entries
heap                            # heap chunks
bins                            # heap bins (free chunks)
vmmap                           # memory map
search "flag"                   # search string in memory
search -t bytes 0x12345678
rop                             # search ROP gadgets
cyclic 100                      # generate de Bruijn pattern
cyclic -l 0x6161616c            # find offset of pattern
nearpc                          # show nearby instructions
telescope $rsp 20               # walk through stack with deref
```

### Modify state
```gdb
set $rax = 1
set $rip = 0x401234
set *(int*)0x601020 = 0xdeadbeef
set {char[6]} 0x601020 = "PWNED\0"

# Skip instruction
jump *0x401234

# Call function
call (int) puts(0x401000)

# Patch byte
set *(unsigned char*)0x401234 = 0x90    # NOP
```

### tui mode (text UI)
```gdb
tui enable
layout asm                       # assembly view
layout regs                      # registers view
layout src                       # source view
focus cmd                        # focus on command line
Ctrl+L                           # refresh
```

ปกติ pwndbg มี context อยู่แล้วก็ดี ไม่ต้อง tui

---

## 🪟 x64dbg (Windows)

GUI debugger สำหรับ Windows: เหมือน OllyDbg แต่ x64

### Layout
- **CPU view** (กลาง): disassembly + registers + stack
- **Log**: debugger output
- **Symbols**: exports/imports
- **Memory Map**
- **Breakpoints**

### Hotkeys
| Key | Action |
|-----|--------|
| `F2` | Toggle breakpoint |
| `F7` | Step into |
| `F8` | Step over |
| `F9` | Run |
| `Ctrl+F9` | Run until return |
| `Ctrl+G` | Go to address |
| `Space` | Edit instruction (assemble) |
| `Ctrl+E` | Patch file |

### Useful actions
- Right-click instruction → "Search for" → "Strings", "Intermodular calls"
- "Run to user code": skip past system DLLs

---

## 🪟 WinDbg

Microsoft's official: powerful แต่ steep learning curve

```
g                               # go (continue)
p                               # step over
t                               # step into
bp <addr>                       # breakpoint
bl                              # list breakpoints
k                               # call stack
r                               # registers
dd <addr>                       # display dwords
da <addr>                       # display ASCII string
du <addr>                       # display Unicode string
!process 0 0                    # process info (kernel)
!analyze -v                     # analyze crash
```

---

## 📡 strace / ltrace

### strace: System calls
```bash
strace ./binary
strace -e trace=open,read,write ./binary    # specific syscalls
strace -f ./binary                           # follow forks
strace -e trace=network ./binary             # network only
strace -p <pid>                              # attach
strace -o trace.txt ./binary                 # save
strace -c ./binary                           # summary
```

ใช้ดู:
- ไฟล์ที่ binary เปิด/อ่าน/เขียน
- Network connection
- syscall ที่ใช้

### ltrace: Library calls
```bash
ltrace ./binary
ltrace -e strcmp ./binary                    # filter
ltrace -f ./binary                           # follow
```

ใช้ดู:
- `strcmp("input", "REAL_PASSWORD")` ← คำตอบ!
- `printf("Correct!")` ← endpoint

ใน CTF: ltrace มักเปิดเผย flag/password ตรงๆ ที่ binary call `strcmp()` กับ user input

### Limit
- Statically-linked binary → ltrace ใช้ไม่ได้ (ไม่มี dynamic library calls)
- Anti-trace techniques exist

---

## 🌀 ltrace bypass: linked statically

Static binary call libc functions ผ่าน `syscall` directly → ใช้ strace แทน

หรือใช้ tool **frida** สำหรับ runtime instrumentation

---

## 💉 Frida ⭐ Dynamic Instrumentation

Inject JavaScript → hook function ในขณะ runtime

### Install
```bash
pip install frida-tools
```

### Use case 1: Hook function เพื่อดู argument
```javascript
// hook.js
Interceptor.attach(Module.findExportByName(null, "strcmp"), {
    onEnter: function(args) {
        console.log("strcmp(" + args[0].readCString() + ", " + args[1].readCString() + ")");
    }
});
```

```bash
frida -l hook.js -- ./binary
```

→ จะเห็น strcmp ทุกครั้ง: รวม `strcmp("USER_INPUT", "REAL_PASSWORD")`

### Use case 2: Modify return value
```javascript
Interceptor.attach(Module.findExportByName(null, "check_password"), {
    onLeave: function(retval) {
        console.log("Original return: " + retval);
        retval.replace(1);    // force return 1 (success)
    }
});
```

### Use case 3: Replace function
```javascript
Interceptor.replace(Module.findExportByName(null, "rand"), 
    new NativeCallback(function() {
        return 42;     // always return 42
    }, 'int', []));
```

### Frida ใช้กับ Android/iOS ได้ด้วย
ดูใน mobile section

---

## 🐍 Python in gdb

gdb support Python scripting: automate analysis

```python
# inside gdb
python
import gdb
inferior = gdb.selected_inferior()
mem = inferior.read_memory(0x401234, 100)
print(bytes(mem))
end
```

หรือไฟล์ separate:
```python
# script.py
class FindFlagCmd(gdb.Command):
    def __init__(self):
        super().__init__("findflag", gdb.COMMAND_USER)
    
    def invoke(self, arg, _):
        inferior = gdb.selected_inferior()
        # search through memory...

FindFlagCmd()
```

```gdb
source script.py
findflag
```

---

## 🐺 Frida tools

### frida-trace
Auto-generate hooks for matching functions
```bash
frida-trace -i "open" -- ./binary
frida-trace -i "*crypto*" -p <pid>
```

### frida-ps
List processes
```bash
frida-ps -U                       # USB device (Android)
frida-ps                          # local
```

---

## 🔥 Useful gdb workflows

### A. หา input ที่ทำให้ branch ไป "good"

```gdb
gdb ./binary
b *0x40123A                       # ก่อน branch (jne)
r
> Enter password: AAAAA
# หยุดที่ breakpoint
info reg                           # ดู rdi/rsi (args ของ strcmp/check)
x/s $rdi                           # ดู input ของเรา
x/s $rsi                           # ดู expected: voila!
```

### B. Bypass check ด้วย register modify

```gdb
b *0x401250                        # หลัง check
r
> Enter password: anything
# ที่ break
set $rax = 1                       # force return success
c
> Correct!
```

### C. Find encrypted strings ในข้อมูล

ถ้า binary decrypt strings runtime:
```gdb
b *0x40150A                        # หลัง decryption function
r
# ที่ break, ดู memory
x/s 0x602010
```

### D. Trace function calls
```gdb
rbreak ^check_                     # break ทุก function ขึ้นต้น "check_"
b printf
commands                            # ทำตอน hit breakpoint
> printf "args: %s\n", $rdi
> c
> end
```

---

## 🛠 Other useful tools

### hexedit / vbindiff
Compare 2 binaries: useful หลัง patch

### xxd + diff
```bash
xxd binary1 > 1.hex
xxd binary2 > 2.hex
diff 1.hex 2.hex
```

### strace → grep
```bash
strace -e trace=openat ./binary 2>&1 | grep -v ENOENT
```

### LD_PRELOAD trick (Linux)
Override library function ของ binary ที่ dynamic linked
```c
// hook.c
int strcmp(const char *s1, const char *s2) {
    fprintf(stderr, "strcmp(%s, %s)\n", s1, s2);
    return 0;     // always equal
}
```
```bash
gcc -shared -fPIC -o hook.so hook.c
LD_PRELOAD=./hook.so ./binary
```

→ override `strcmp`: ทุก call จะ return 0 → bypass check

---

## 🎯 Anti-Debug Detection (preview)

Binary หลายตัวเช็คว่าอยู่ใน debugger ไหม: ดู [Anti-Debug-Tricks](Anti-Debug-Tricks.md) เต็ม

Common checks:
- `ptrace(PTRACE_TRACEME)` (Linux): return -1 ถ้ามี debugger
- `IsDebuggerPresent()` (Windows)
- Timing: `rdtsc` ก่อน/หลัง: ถ้าช้ามาก → debugger

Bypass: NOP ทับ check, หรือ patch return value

---

## 🔗 ต่อไป

- [Static-Analysis](Static-Analysis.md)
- [Assembly-Basics](Assembly-Basics.md)
- [Anti-Debug-Tricks](Anti-Debug-Tricks.md)
- [Pwn](../06-Binary-Exploitation/Buffer-Overflow.md)

---

#ctf #rev #dynamic-analysis #gdb
