---
name: reverse-dynamic
description: "CTF dynamic analysis tools. Frida hooking, angr symbolic execution, lldb, x64dbg, Qiling cross-platform emulation, Intel Pin instruction counting side channel. Triggers: 'dynamic analysis', 'frida ctf', 'angr symbolic', 'qiling emulation', 'x64dbg', 'lldb', 'instruction counting', 'symbolic execution ctf', 'pin instruction count'."
---

# CTF: Dynamic Analysis Tools

Frida, angr, lldb, x64dbg, Qiling, Intel Pin instruction counting.

## Install

```bash
pip install frida-tools frida angr qiling --break-system-packages
apt-get install -y lldb
# x64dbg: https://x64dbg.com (Windows)
```

---

## Phase 1: Frida Hooking

```javascript
// hook.js: intercept strcmp (compare functions)
Interceptor.attach(Module.findExportByName(null, "strcmp"), {
    onEnter: function(args) {
        this.a = Memory.readUtf8String(args[0]);
        this.b = Memory.readUtf8String(args[1]);
        console.log(`strcmp("${this.a}", "${this.b}")`);
    },
    onLeave: function(retval) {
        console.log(`  → ${retval}`);
    }
});
```

```bash
# Attach to running process:
frida -p $(pidof binary) -l hook.js

# Spawn and instrument from start:
frida -f ./binary -l hook.js --no-pause

# Quick one-liner:
frida -f ./binary --no-pause -e '
Interceptor.attach(Module.findExportByName(null, "strcmp"), {
    onEnter(args) {
        console.log("strcmp:", Memory.readUtf8String(args[0]), Memory.readUtf8String(args[1]));
    }
});
'
```

```javascript
// Anti-debug bypass:
Interceptor.attach(Module.findExportByName(null, "ptrace"), {
    onLeave: function(retval) {
        retval.replace(ptr(0));  // ptrace returns 0 = success (not traced)
    }
});

// Bypass timing checks:
Interceptor.attach(Module.findExportByName(null, "clock_gettime"), {
    onLeave: function(retval) {
        var ts = this.context.rsi;
        Memory.writeU64(ts, 0);         // tv_sec = 0
        Memory.writeU64(ts.add(8), 0);  // tv_nsec = 0
    }
});

// Memory scan for flag:
Process.enumerateRanges('r--').forEach(function(range) {
    Memory.scan(range.base, range.size, "66 6c 61 67 7b", {
        onMatch: function(addr, size) {
            console.log("[FLAG]", addr, Memory.readUtf8String(addr, 64));
        },
        onComplete: function() {}
    });
});

// Replace validation function to always succeed:
Interceptor.replace(Module.findExportByName(null, "check_flag"), new NativeCallback(
    function(input) {
        console.log("check_flag:", Memory.readUtf8String(input));
        return 1;
    }, 'int', ['pointer']
));
```

---

## Phase 2: angr Symbolic Execution

```python
import angr
import claripy

proj = angr.Project('./binary', auto_load_libs=False)

# Basic path exploration:
FIND_ADDR = 0x401234    # success address (from disasm)
AVOID_ADDR = 0x401256   # failure address

simgr = proj.factory.simgr()
simgr.explore(find=FIND_ADDR, avoid=AVOID_ADDR)

if simgr.found:
    print("Flag:", simgr.found[0].posix.dumps(0))

# With symbolic constraints:
flag_len = 32
flag_chars = [claripy.BVS(f'f{i}', 8) for i in range(flag_len)]
flag = claripy.Concat(*flag_chars + [claripy.BVV(b'\n')])

state = proj.factory.entry_state(stdin=flag)
for c in flag_chars:
    state.solver.add(c >= 0x20, c <= 0x7e)

simgr = proj.factory.simgr(state)
simgr.explore(find=FIND_ADDR, avoid=AVOID_ADDR)

if simgr.found:
    result = simgr.found[0].solver.eval(flag, cast_to=bytes)
    print("Flag:", result.decode())

# Output-based find/avoid:
def success(state):
    return b"Correct" in state.posix.dumps(1)

def failure(state):
    return b"Wrong" in state.posix.dumps(1)

simgr.explore(find=success, avoid=failure)

# Skip expensive functions:
@proj.hook(0x401100, length=5)
def skip_printf(state):
    pass

# Performance tips:
simgr.use_technique(angr.exploration_techniques.DFS())           # depth-first
simgr.use_technique(angr.exploration_techniques.LengthLimiter(500))  # limit paths
```

---

## Phase 3: Qiling Cross-Platform Emulation

```python
from qiling import Qiling
from qiling.const import QL_VERBOSE

# Linux ELF:
ql = Qiling(["./binary", "arg1"], "rootfs/x8664_linux",
            verbose=QL_VERBOSE.DEFAULT)
ql.run()

# Windows PE (no Windows needed):
ql = Qiling(["rootfs/x86_windows/bin/binary.exe"], "rootfs/x86_windows")
ql.run()

# Anti-debug bypass:
def hook_ptrace(ql, ptrace_request, pid, addr, data):
    return 0  # pretend ptrace succeeds

ql.os.set_syscall("ptrace", hook_ptrace)

# Hook address:
def skip_check(ql):
    ql.arch.regs.rax = 0

ql.hook_address(skip_check, 0x401234)

# Input fuzzing:
import string

def test_input(candidate):
    ql = Qiling(["./binary"], "rootfs/x8664_linux",
                verbose=QL_VERBOSE.DISABLED, stdin=candidate.encode())
    ql.run()
    return ql.os.stdout.read()

for ch in string.printable:
    output = test_input("flag{" + ch)
    if b"Correct" in output:
        print(f"Found: {ch}")
```

---

## Phase 4: Intel Pin Instruction-Counting Side Channel

```python
# Binary makes per-character comparison → correct char = more instructions
# Works on movfuscated/obfuscated comparison binaries

import string
from subprocess import Popen, PIPE

PIN = './pin'
TOOL = './source/tools/ManualExamples/obj-ia32/inscount0.so'
BINARY = './target'

def count_instructions(input_str):
    cmd = [PIN, '-injection', 'child', '-t', TOOL, '--', BINARY]
    p = Popen(cmd, stdout=PIPE, stdin=PIPE, stderr=PIPE)
    p.communicate((input_str + '\n').encode())
    with open('inscount.out') as f:
        return int(f.read().split()[-1])

# Character-by-character brute force:
flag = 'flag{'
while not flag.endswith('}'):
    best_count, best_char = 0, ''
    for c in string.printable:
        count = count_instructions(flag + c)
        if count > best_count:
            best_count, best_char = count, c
    flag += best_char
    print(f"Found so far: {flag}")

print("Flag:", flag)
```

---

## Phase 5: r2frida Integration

```bash
# Radare2 + Frida (attach via Frida):
r2 frida://spawn/./binary

# r2frida commands:
\ii            # list imports
\il            # list loaded modules
\dt strcmp     # trace strcmp calls
\dm            # memory maps
\dc            # continue
```

---

## Output

Save to `.omop/engagement/ctf/reverse/`:
- `frida-intercepts.txt`: logged function calls
- `angr-solution.py`: angr script with flag
- `flag.txt`: extracted flag

## Next Phase

→ `ctf-reverse-tools` for static analysis first
→ `ctf-reverse-patterns` for specific RE attack patterns
