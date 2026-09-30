# Reverse Engineering Writeups

Static and dynamic analysis writeups for HackTheBox and TryHackMe RE challenges.  
Covers ELF binaries, PE malware, crackmes, and anti-debug bypass techniques.

---

## Tool's

| Tool | Role |
|------|------|
| Ghidra | Decompilation, cross-reference analysis, function graphing |
| radare2 | Disassembly, scripted analysis, binary patching |
| x64dbg | Dynamic analysis on Windows PE, breakpoint-based bypass |
| dnSpy64 | .NET assembly decompilation and runtime patching |
| gdb | ELF runtime debugging, register inspection |

---

## Approach

Each writeup follows the same structure:

1. **Triage**: `file`, `strings`, `checksec`, entropy check
2. **Static Analysis**: Ghidra/radare2 disassembly, identify key functions, control flow
3. **Dynamic Analysis**: Run under debugger, trace syscalls/library calls, set breakpoints
4. **Findings**: Document the vulnerability, bypass, or flag logic
5. **Solution**: Minimal reproducible steps (script or manual)

---

> All challenges are from legal CTF platforms (HackTheBox, TryHackMe).  
> Research conducted for educational and skill-development purposes.
