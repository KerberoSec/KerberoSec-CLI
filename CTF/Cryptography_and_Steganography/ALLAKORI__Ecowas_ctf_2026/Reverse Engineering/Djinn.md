# 🧞‍♂️ Djinn: Reverse Engineering Writeup

![CTF](https://img.shields.io/badge/CTF-Reverse-blue)
![Difficulty](https://img.shields.io/badge/Difficulty-Hard-orange)
![Tools](https://img.shields.io/badge/Tools-r2%20%7C%20GDB%20%7C%20strings-green)
![Status](https://img.shields.io/badge/Solved-✔️-brightgreen)

---

## 📌 Challenge Overview

> *"A djinn lives inside the machine… it knows the secret but does not want to share."*

### 🎯 Goal
Recover the correct input (flag) expected by the binary.

---

## 🧠 TL;DR

The binary:
1. Detects debuggers (anti-debug)
2. Generates a secret internally using an obfuscated VM
3. Compares your input with that secret

### 💥 Exploit Strategy
- Disable anti-debug
- Let the program compute the secret
- Dump it from memory **before comparison**

---

## 🏁 Final Flag

EcowasCTF{Dj1nN_5t4t3_mAcH1n3_0xD34D}

---

# 🔍 1. Initial Analysis

## 📂 File Information

file djinn  
checksec djinn  

### 🔎 Observations
- ELF 64-bit
- PIE enabled → addresses randomized
- NX, Canary → no classical exploitation

👉 Conclusion: pure reverse engineering challenge

---

## 🔎 Strings Analysis

strings djinn  

### Interesting output

/proc/self/status  
TracerPid:  
strace  
ltrace  
lldb  
The djinn awaits:  
The djinn speaks: correct.  
Silence.  

---

## 🧠 Insight

- Binary uses anti-debugging
- Has success / failure logic

---

# ⚠️ 2. Anti-Debug Trap

Run with GDB:

gdb ./djinn  
run  

Input:
AAAA  

Output:
The djinn speaks: correct.

---

## ❌ Problem

This is a fake success.

---

## 🔬 Why

Disassembly:

call fcn.000028c0  
test eax, eax  
jne success  

Meaning:

if (anti_debug_detected)
    goto success;

👉 Under GDB:
- Debugger is detected
- Program jumps directly to success

---

# 🔧 3. Bypassing Anti-Debug

We patch the anti-debug function.

---

## 🛠️ Patch with radare2

r2 -w ./djinn_clean  

s 0x28c0  
wx 31c0c3  
q  

---

## 🧠 What this does

xor eax, eax  
ret  

👉 Forces:

anti_debug() = 0

---

## ✅ Result

- No fake success
- Real logic executed

---

# 🧠 4. Core Logic

Near the end:

lea rdi, [var_20h]  
movzx eax, byte [rdi + rdx]  
xor al, byte [r13 + rdx]  
cmp rdx, 0x25  
jne loop  

---

## 🧠 Interpretation

- r13 → user input  
- rdi → internal buffer  
- loop runs 37 bytes  

---

## 💡 Key Insight

input == internal_buffer  

👉 Therefore:

internal_buffer = flag

---

# 🎯 5. Strategy

Instead of reversing the VM:

✔ Let program compute secret  
✔ Break execution before comparison  
✔ Read memory directly  

---

# 🐞 6. Debugging with GDB

## 🚀 Step 1

starti  

---

## 📍 Step 2

info proc mappings  

Example:

0x555555554000 → base  

---

## 🎯 Step 3

Breakpoint at offset 0x2742:

b *0x555555556742  

---

## ▶️ Step 4

c  

Input:

AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA  

---

## 🔍 Step 5

x/s $rdi  

---

## 💥 Output

EcowasCTF{Dj1nN_5t4t3_mAcH1n3_0xD34D}

---

# 🧠 7. Why It Works

Program flow:

VM → builds secret → stores buffer → compares with input  

We break here:

VM → [SECRET READY] → BREAKPOINT → comparison  

👉 So we read the secret before it's used

---

# 📌 8. Key Takeaways

⚠️ Never trust debugger output  
Anti-debug can fake success  

🔍 Identify comparison patterns  
movzx eax, [reg + index]  
cmp / xor / sub  

🧠 Find input vs buffer  
input vs internal value  

🎯 Break before comparison  

⚡ Work smarter, not harder  
No need to reverse full VM  

---

# 🧞‍♂️ Final Thoughts

We did not reverse the VM.

We:
- removed anti-debug
- found comparison
- extracted secret from memory

👉 Efficient reverse engineering

---

## 🏁 Final Flag

EcowasCTF{Dj1nN_5t4t3_mAcH1n3_0xD34D}
