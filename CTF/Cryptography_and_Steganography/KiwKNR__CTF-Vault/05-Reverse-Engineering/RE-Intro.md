---
tags: [ctf, rev, reverse-engineering, fundamentals]
created: 2026-05-01
---

# 🔬 Reverse Engineering: บทนำ

> **Reverse Engineering (RE)** = วิเคราะห์ binary/program เพื่อเข้าใจว่ามันทำอะไร, ทำงานยังไง, และมี logic ภายในแบบไหน: เพื่อหาคำตอบ (flag, password, algorithm)

ใน CTF: โจทย์ Rev มักให้ binary มา ต้องหา flag ที่ฝังไว้ หรือต้องเขียน input ที่ทำให้ binary print "Correct!"

---

## 🎯 ประเภทโจทย์ Rev ใน CTF

### 1. Crackme / Password Check
```
Enter password: _____
Wrong!
```
ต้องหาว่า password อะไรที่ทำให้ "Correct!"

### 2. Flag Embedded
flag ฝังในไฟล์: XOR/encrypt แล้วต้อง reverse algo

### 3. License Check / Serial
เช็ค serial number ตาม algorithm: ต้องเขียน keygen

### 4. Algorithm Recovery
ดู binary → reverse algorithm → re-implement ใน Python

### 5. Patching
แก้ binary ให้ผ่านการ check (เปลี่ยน `JNZ` → `JZ`)

### 6. VM / Custom Bytecode
binary มี interpreter ของ bytecode ตัวเอง → reverse VM แล้ว disassemble bytecode

### 7. Anti-Reverse / Obfuscation
binary มี anti-debug, packed, obfuscated: ต้อง bypass ก่อนถึงจะ analyze

### 8. Mobile (Android APK / iOS IPA)
ดูใน [../09-Mobile/...](../09-Mobile/....md)

---

## 🛠 Tools Stack

### Static Analysis (ดูโค้ดโดยไม่รัน)

| Tool | ใช้กับ | ราคา |
|------|--------|------|
| **Ghidra** ⭐ | ทุก architecture, decompile ดี | ฟรี (NSA) |
| **IDA Free** | Industry standard, decompile บางส่วน | ฟรี/Pro $$$$ |
| **Binary Ninja** | UI สวย, Python API ดี | $$ |
| **radare2** / Cutter | Open source, CLI ดี | ฟรี |
| **objdump** | Quick disassemble | built-in |
| **strings** | ดึง strings | built-in |

### Dynamic Analysis (รันแล้วดู)

| Tool | ใช้กับ |
|------|--------|
| **gdb** + pwndbg/gef | Linux debugger |
| **x64dbg** | Windows debugger |
| **OllyDbg** (เก่า) | Windows 32-bit |
| **WinDbg** | Microsoft official Windows |
| **strace** | trace syscalls (Linux) |
| **ltrace** | trace library calls |
| **frida** | Dynamic instrumentation, JS API |

### Specialized

| Tool | ใช้กับ |
|------|--------|
| **dnSpy / dotPeek** | .NET (.exe / .dll) |
| **jadx** | Android APK → Java |
| **apktool** | APK extract/repack |
| **Hopper** | macOS/iOS |
| **Cutter** | radare2 GUI |

---

## 📚 Background ที่ต้องรู้

### 1. Architecture
- **x86 (32-bit)**: registers `eax`, `ebx`, `ecx`, ...
- **x86_64 (64-bit)** ⭐ ปัจจุบัน: `rax`, `rbx`, ..., `r8-r15`
- **ARM**: `r0-r15`, `sp`, `lr`, `pc` (mobile, IoT)
- **ARM64 / AArch64**: `x0-x30`, `sp`
- **MIPS, RISC-V, PowerPC**: เจอน้อยกว่า

### 2. Calling Conventions

**x86_64 Linux (System V AMD64)** ⭐ พบบ่อยที่สุด
```
Args: rdi, rsi, rdx, rcx, r8, r9, [stack]
Return: rax
Caller-saved: rax, rcx, rdx, rsi, rdi, r8-r11
Callee-saved: rbx, rbp, r12-r15
```

**x86_64 Windows**
```
Args: rcx, rdx, r8, r9, [stack]
Return: rax
+ shadow space 32 bytes
```

**x86 (32-bit) cdecl**
```
Args: stack (right-to-left)
Return: eax
Caller cleans stack
```

**x86 stdcall (Windows API)**
```
Args: stack (right-to-left)
Return: eax
Callee cleans stack
```

### 3. Stack Frame
```
high address
┌──────────────┐
│ arguments    │  (in 32-bit; in 64-bit args ใน register)
├──────────────┤
│ return addr  │  ← เมื่อ call instruction
├──────────────┤
│ saved RBP    │  ← push rbp
├──────────────┤  ← rbp
│ local vars   │
│              │
├──────────────┤  ← rsp
low address
```

### 4. Common Instructions (x86_64)

```assembly
; Move
mov rax, rbx              ; rax = rbx
mov rax, [rbx]            ; rax = *rbx (dereference)
lea rax, [rbx+4]          ; rax = rbx + 4 (no deref!)

; Arithmetic
add rax, 1
sub rax, 1
inc rax
dec rax
imul rax, rbx
xor rax, rax              ; rax = 0 (idiom)

; Compare + branch
cmp rax, rbx
je  label                 ; jump if equal
jne label                 ; jump if not equal
jl  label                 ; jump if less (signed)
jb  label                 ; jump if below (unsigned)

; Stack
push rax
pop rax

; Function
call function             ; push return addr, jump
ret                       ; pop return addr, jump

; Test (AND but discards result, sets flags)
test rax, rax
jz   label                ; jump if rax == 0
```

### 5. Common Idioms

```assembly
xor eax, eax              ; → rax = 0 (faster than mov)
test rax, rax / jz        ; → if (rax == 0)
sub rsp, 0x20             ; → reserve 32 bytes local
mov rbp, rsp              ; → enter function
leave / ret               ; → exit function
```

---

## 📖 Reading Decompiled Code

Ghidra/IDA decompile assembly → C-like code:

```c
// Decompiled
int check_password(char *input) {
    int local_4 = 0;
    int i = 0;
    while (i < 8) {
        if ((input[i] ^ 0x42) != "REAL_KEY"[i]) {
            return 0;
        }
        i++;
    }
    return 1;
}
```

→ ฟังก์ชั่น XOR input กับ 0x42 แล้วเทียบกับ "REAL_KEY"
→ password = "REAL_KEY" XOR 0x42 ทุก byte

---

## 🎯 Workflow ทั่วไป

```
1. file ./binary
   → ดู architecture, stripped?, packed?

2. checksec ./binary
   → security mitigations

3. strings ./binary | head -50
   → flag? credentials? URLs?

4. ./binary
   → ลองรัน: เห็น UX

5. ltrace ./binary; strace ./binary
   → ดู library/syscalls

6. Open ใน Ghidra/IDA
   → main() function
   → trace logic
   → identify "good path" ที่นำไป "Correct!"

7. (Optional) gdb + breakpoint
   → ดู runtime values

8. Reverse algorithm → write solver
```

---

## 🧠 Mindset

### "Find the Win condition"
หา point ที่ binary print "Correct!" หรือ output flag → trace ย้อนกลับว่าต้อง state อะไรถึงไปถึงนั้น

### "Trust nothing in stripped binary"
Stripped = ไม่มี symbol → function ทุกตัวชื่อ `FUN_00401234`
- `main()` ปกติยังอยู่ (เริ่มจาก `_start`)
- หา strings → cross-reference → จะพบ function ที่ใช้ string

### "Decompile beats disasm"
อย่าอ่าน assembly ถ้าไม่จำเป็น: Ghidra decompile ดีพอแล้ว แต่ assembly ยังต้องดูตอน:
- Decompiler ผิด/พลาด
- Anti-decompile tricks
- Inline asm

### Patch vs Reverse
บางที **patch** binary 1 byte เร็วกว่า reverse algorithm
- เปลี่ยน `JNZ` (jump if not zero) → `JZ` → invert condition
- หรือ `NOP` ทับ check

---

## 🔗 ต่อไป

- [Static Analysis ลึก](Static-Analysis.md)
- [Dynamic Analysis ลึก](Dynamic-Analysis.md)
- [Assembly พื้นฐาน](Assembly-Basics.md)
- [Anti-Debug-Tricks](Anti-Debug-Tricks.md)
- [Pwn ต่อ](../06-Binary-Exploitation/Buffer-Overflow.md)

## 📚 References

- "Practical Reverse Engineering": Bruce Dang
- "The IDA Pro Book": Chris Eagle
- "Reverse Engineering for Beginners": Dennis Yurichev (ฟรี!)
- crackmes.one: practice
- pwn.college (ฟรี: มี Rev section)

---

#ctf #rev #reverse-engineering #fundamentals
