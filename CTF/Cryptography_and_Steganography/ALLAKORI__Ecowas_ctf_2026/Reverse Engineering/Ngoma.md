# 🧠 Ngoma: Reverse Engineering Writeup

**Category:** Reverse Engineering  
**Difficulty:** Medium
**CTF:** Ecowas CTF  

---

## 📜 Description

We are given a binary `ngoma.zip`. The goal is to reverse it and recover the correct 32-byte input.

---

## 📂 Initial Analysis

```bash
unzip ngoma.zip
file ngoma
checksec --file=ngoma
strings ngoma
```

### Observations

- ELF 64-bit
- Packed with **UPX**
- Strings:
  - `nope.`
  - `need exactly 32 bytes`
  - `the drum answers: correct.`

---

## 🔓 Step 1: Unpacking

```bash
upx -d ngoma -o ngoma.unpacked
```

---

## 🧪 Step 2: Detecting Anti-Debug

```bash
strace -f ./ngoma.unpacked
```

Output:

```
ptrace(PTRACE_TRACEME) = -1 EPERM
write(1, "nope.\n", 6)
```

### Conclusion

```c
if (ptrace(...) == -1) {
    puts("nope.");
    exit(1);
}
```

---

## 🛠️ Step 3: Bypass

```c
#define _GNU_SOURCE
#include <sys/ptrace.h>
#include <stdarg.h>

long ptrace(enum __ptrace_request request, ...) {
    return 0;
}
```

```bash
gcc -shared -fPIC -o fakeptrace.so fakeptrace.c
LD_PRELOAD=./fakeptrace.so ./ngoma.unpacked
```

---

## 🔑 Step 4: Input Constraint

From Ghidra:

```c
if (strlen(input) != 0x20)
```

👉 Input must be **32 bytes**

---

## 🧪 Test

```bash
LD_PRELOAD=./fakeptrace.so ./ngoma.unpacked AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
```

Output:

```
silence.
```

---

## 🧠 Step 5: Core Reverse (Ghidra)

We observe:

- Input copied into memory
- Huge `switch`
- Arrays:
  - `DAT_00104040` → memory
  - `DAT_00104840` → registers
- Instruction dispatch

```c
switch(... & 0xf)
```

👉 This is a **Virtual Machine**

---

## 🧠 Step 6: Understanding the VM

The VM works like:

```text
input → VM → transformed output → check
```

It uses:

- registers (`DAT_00104840`)
- memory (`DAT_00104040`)
- instruction stream (`DAT_001028a0`)

---

## 🔍 Step 7: Instruction Mapping

We identify instructions:

| Case | Meaning |
|------|--------|
| 5 | register copy |
| 8 | XOR |
| 3 | load memory |
| 4 | store memory |
| A/B | shifts |
| C | GF multiplication |

---

## 🔥 Step 8: Crypto Recognition

Inside case C:

```c
a = (a << 1) ^ 0x1b
```

👉 This is **GF(2⁸)** multiplication (AES-like)

### Conclusion

👉 The VM implements a **SPN / AES-like transformation**

---

## 🧠 Step 9: Input Layout

```c
local_58  = *(undefined8 *)input;
uStack_50 = *(undefined8 *)(input + 8);
local_48  = *(undefined8 *)(input + 16);
uStack_40 = *(undefined8 *)(input + 24);
```

👉 32 bytes split into:

- 2 blocks of 16 bytes

---

## 🎯 Step 10: Final Check

```c
if (computed != expected)
    puts("silence.");
else
    puts("correct.");
```

---

# 🚀 Step 11: How the Flag Was Recovered

### ❌ Not brute force

The transformation is too complex.

---

## ✅ Step-by-Step Reconstruction

### 1. Rebuild the VM in Python

We translated instructions:

```python
regs[dst] = regs[src]
regs[dst] = regs[a] ^ regs[b]
vm_mem[addr] = value
```

### 2. Implement GF multiplication

```python
def gf_mul(a, b):
    res = 0
    for _ in range(8):
        if b & 1:
            res ^= a
        hi = a & 0x80
        a = (a << 1) & 0xff
        if hi:
            a ^= 0x1b
        b >>= 1
    return res
```

---

### 3. Emulate the VM

We execute all instructions on registers and memory.

---

### 4. Identify final expected values

From VM execution:

👉 final registers are compared to constants

---

### 5. Reverse the transformation

We invert operations:

| Operation | Inverse |
|----------|--------|
| XOR | XOR |
| shift | reverse shift |
| substitution | inverse table |
| GF mul | inverse GF |

---

### 6. Reconstruct input

We run the VM **backwards**:

```text
final state → reverse VM → original input
```

---

## 🏁 Final Flag

```
EcowasCTF{vm_ng0m4_spn_r1ng_0bf}
```

---

## 🧠 Key Takeaways

- UPX unpacking is critical
- `strace` reveals anti-debug
- `LD_PRELOAD` bypasses protections
- VM-based challenges require reconstruction
- Crypto-like patterns → no brute force
- Python emulation is the key

---

## 🔥 Final Insight

This challenge is a combination of:

> **Virtual Machine Obfuscation + SPN cryptographic design**

The only reliable solution is:

> **understand → emulate → invert**
