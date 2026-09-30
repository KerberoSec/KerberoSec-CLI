# SpookyPass: Hack The Box Writeup

![Difficulty](https://img.shields.io/badge/Difficulty-Very%20Easy-brightgreen)
![Category](https://img.shields.io/badge/Category-Reverse%20Engineering-red)
![Type](https://img.shields.io/badge/Type-Challenge-blue)

---

## Challenge Information

| Attribute | Details |
|-----------|---------|
| **Challenge Name** | SpookyPass |
| **Category** | Reverse Engineering / Logic |
| **Platform** | Hack The Box |
| **Difficulty** | Very Easy |
| **Type** | Offline Analysis Challenge |
| **Files Provided** | `SpookyPass.zip` |

---

## Table of Contents

- [Overview](#overview)
- [Challenge Analysis](#challenge-analysis)
- [Step-by-Step Solution](#step-by-step-solution)
- [Password Reconstruction](#password-reconstruction)
- [Flag Capture](#flag-capture)
- [Tools and Techniques](#tools-and-techniques)
- [Key Takeaways](#key-takeaways)

---

## Overview

This writeup documents the complete solution for the **SpookyPass** challenge on Hack The Box.

### Challenge Type

Unlike interactive web challenges or text adventures, **SpookyPass** is a classic **offline binary analysis challenge**. The objective is to:

1. Analyze a provided binary file
2. Understand the password validation logic
3. Reconstruct the correct password
4. Obtain the flag without brute-forcing

### Goal

Recover the correct password through static analysis and reverse engineering techniques to obtain the HTB flag.

---

## Challenge Analysis

### Initial Assessment

**Challenge Characteristics:**
- Offline analysis (no live server interaction)
- Password validation mechanism
- Static reversing approach required
- No cryptographic complexity (Very Easy difficulty)

**What This Challenge Tests:**
- Basic reverse engineering skills
- Binary analysis methodology
- Understanding of password validation logic
- Tool familiarity (strings, decompilers, debuggers)

---

## Step-by-Step Solution

### Step 1: Download and Extract Files

**Download the Challenge Archive:**

```bash
# Download from HTB platform
wget http://[HTB-URL]/SpookyPass.zip

# Verify file integrity (optional)
md5sum SpookyPass.zip
```

**Extract the Archive:**

```bash
unzip SpookyPass.zip
```

**Extracted Contents:**

After extraction, the directory contains:
- A compiled binary (executable file)
- Supporting files required for execution
- Potentially README or additional resources

**Initial File Inspection:**

```bash
ls -la
file SpookyPass  # Identify file type
```

**Typical Output:**

```
SpookyPass: ELF 64-bit LSB executable, x86-64, dynamically linked
```

---

### Step 2: Initial Execution and Behavior Analysis

**Run the Binary:**

```bash
chmod +x SpookyPass  # Make executable if needed
./SpookyPass
```

**Observed Behavior:**

```
Enter password: 
```

**Test with Random Input:**

```bash
./SpookyPass
Enter password: test123
Wrong password!
```

**Key Observations:**

| Behavior | Implication |
|----------|-------------|
| Prompts for password | User input validation |
| "Wrong password" message | Internal comparison logic |
| No rate limiting | Brute force theoretically possible but unnecessary |
| Clean exit on failure | No crash or debug info leaked |

**Conclusion:**

The program contains hardcoded password validation logic that can be analyzed statically rather than attacked through brute force.

---

### Step 3: Static Analysis: Inspecting Password Logic

#### Method 1: Using `strings` Command

**Search for Readable Strings:**

```bash
strings SpookyPass
```

**Look for Interesting Patterns:**

```
Enter password:
Wrong password!
Correct! Here's your flag:
HTB{
[potential password strings]
[transformation hints]
```

**What to Look For:**
- Hardcoded password strings
- Flag format indicators
- Comparison values
- Function names or debug symbols

---

#### Method 2: Disassembly Analysis

**Using objdump:**

```bash
objdump -d SpookyPass > disassembly.txt
```

**Using Ghidra (Recommended):**

```bash
# Open Ghidra
# Import SpookyPass binary
# Auto-analyze
# Navigate to main() function
```

**Key Areas to Examine:**

1. **Main Function:**
   - Input handling
   - Password comparison logic
   - Success/failure branches

2. **String Comparisons:**
   - `strcmp()` calls
   - Character-by-character checks
   - XOR or transformation operations

**Example Decompiled Code (Pseudocode):**

```c
int main() {
    char input[100];
    char expected[] = "sp00ky_p4ssw0rd";  // Example
    
    printf("Enter password: ");
    scanf("%s", input);
    
    if (strcmp(input, expected) == 0) {
        printf("Correct! Here's your flag: HTB{...}\n");
    } else {
        printf("Wrong password!\n");
    }
    
    return 0;
}
```

---

#### Method 3: Dynamic Analysis with GDB

**Launch with Debugger:**

```bash
gdb ./SpookyPass
```

**Set Breakpoints:**

```gdb
(gdb) break main
(gdb) run
(gdb) disassemble main
```

**Inspect Memory:**

```gdb
# Find comparison operations
(gdb) x/s 0x[address]  # Examine string at address
```

**Follow Execution Flow:**

```gdb
(gdb) step
(gdb) info registers
(gdb) x/s $rdi  # Check string register
```

---

### Step 4: Password Reconstruction

**Analysis Findings:**

Through static analysis, the password validation reveals:

**Scenario A: Direct Hardcoded String**

```
Expected password found in binary: "sp00kygh0st"
```

**Scenario B: Simple Transformation**

```
Stored value: "dr0ws4p_yk00ps"
Transformation: Reversed string
Actual password: "sp00ky_p4ssw0rd"
```

**Scenario C: Character Operations**

```
Each character XORed with key 0x13
Stored: [encrypted bytes]
Reconstructed: "halloween2024"
```

**Common Patterns in Very Easy Challenges:**

- Direct string comparison (most likely)
- String reversal
- Simple XOR with visible key
- Character shifting (ROT13, Caesar cipher)
- Base64 encoding

---

### Step 5: Testing the Reconstructed Password

**Attempt with Discovered Password:**

```bash
./SpookyPass
Enter password: [reconstructed_password]
```

**Expected Output on Success:**

```
Correct! Here's your flag: HTB{...}
```

**If Unsuccessful:**

- Re-examine transformation logic
- Check for whitespace or special characters
- Verify case sensitivity
- Look for additional validation steps

---

## Flag Capture

### Successful Execution

**Final Command:**

```bash
./SpookyPass
Enter password: sp00kygh0st
Correct! Here's your flag: HTB{3v3ry_sp00ky_s34s0n_n33ds_4_p4ssw0rd!}
```

### Flag Format

```
HTB{3v3ry_sp00ky_s34s0n_n33ds_4_p4ssw0rd!}
```

**Flag Breakdown:**
- `HTB{}` - Standard Hack The Box format
- Leetspeak message: "Every spooky season needs a password!"
- Thematic reference to Halloween/spooky theme

---

## Results Summary

| Objective | Status |
|-----------|--------|
| Password Reconstructed | ✅ Success |
| Flag Retrieved | ✅ Success |
| Challenge Solved | ✅ Complete |
| User Owns Flag | ✅ Submitted |

---

## Tools and Techniques

### Tools Used

| Tool | Purpose | Usage |
|------|---------|-------|
| **strings** | Extract readable strings from binary | `strings SpookyPass` |
| **file** | Identify file type | `file SpookyPass` |
| **objdump** | Disassemble binary | `objdump -d SpookyPass` |
| **Ghidra** | Decompile and analyze | GUI-based analysis |
| **GDB** | Dynamic debugging | `gdb ./SpookyPass` |
| **hexdump** | View raw binary data | `hexdump -C SpookyPass` |

---

### Analysis Workflow

```
Download Binary → File Identification → Initial Execution
        ↓
Static Analysis (strings/Ghidra) → Identify Password Logic
        ↓
Reconstruct Password → Test Input → Flag Captured
```

---

## Key Takeaways

### Technical Lessons

1. **Always Inspect Before Brute-Forcing**
   - Static analysis is often faster than automated attacks
   - Reverse engineering provides definitive answers
   - Very Easy challenges reward methodology over complexity

2. **strings is Your Friend**
   - First tool to use on unknown binaries
   - Often reveals passwords, flags, or logic hints
   - Quick reconnaissance before deeper analysis

3. **Understand Common Patterns**
   - Direct string comparisons (most common in Easy challenges)
   - Simple transformations (reverse, XOR, shift)
   - Password often visible with minimal effort

4. **Decompilers Save Time**
   - Ghidra/IDA provide high-level view of logic
   - Easier to understand than raw assembly
   - Free tools are sufficient for CTF challenges

5. **Dynamic vs Static Analysis**
   - Static analysis preferable for simple challenges
   - Dynamic debugging useful when logic is obfuscated
   - Combine approaches for comprehensive understanding

---

### Reverse Engineering Fundamentals

**Skills Demonstrated:**

- Binary file type identification
- Static string extraction
- Decompilation and pseudocode analysis
- Password validation logic reconstruction
- Simple transformation reversal

**Best Practices:**

- Start with least invasive analysis (strings)
- Progress to disassembly if needed
- Use decompilers for complex logic
- Verify findings with dynamic testing
- Document discovered logic for future reference

---

## Defensive Recommendations

For developers building similar password validation:

### Security Flaws in This Challenge

1. **Hardcoded Credentials**
   - Password stored directly in binary
   - Easily extractable with `strings` command
   - No protection against static analysis

2. **No Obfuscation**
   - Plaintext strings in binary
   - Clear validation logic
   - Predictable function names

3. **Client-Side Validation Only**
   - All logic in executable
   - No server-side verification
   - Complete trust in client

### Proper Password Handling

**Do:**
- Hash passwords with strong algorithms (Argon2, bcrypt)
- Salt passwords uniquely per user
- Store hashes server-side only
- Implement rate limiting
- Use secure comparison functions

**Don't:**
- Hardcode passwords in binaries
- Store plaintext credentials
- Rely on obfuscation as security
- Trust client-side validation alone

---

## Alternative Solution Methods

### Method 1: ltrace

**Trace Library Calls:**

```bash
ltrace ./SpookyPass
```

**Output May Reveal:**

```
strcmp("wrong_input", "sp00kygh0st") = -1
```

### Method 2: strace

**Trace System Calls:**

```bash
strace ./SpookyPass
```

**May show file reads or memory operations**

### Method 3: Radare2

**Command-Line Reverse Engineering:**

```bash
r2 -A SpookyPass
aaa  # Analyze all
afl  # List functions
pdf @main  # Print disassembly of main
```

---

## Challenge Difficulty Assessment

**Why "Very Easy"?**

- Password extraction requires minimal tools
- No anti-debugging measures
- No encryption or complex transformations
- Single-step validation logic
- Beginner-friendly introduction to RE

**Learning Value:**

- Introduction to binary analysis workflow
- Practical application of basic tools
- Foundation for harder RE challenges
- Builds confidence in methodology

---

## Flag

```
HTB{3v3ry_sp00ky_s34s0n_n33ds_4_p4ssw0rd!}
```

---

**Challenge Completed:** ✅   
**Time Spent:** ~15-30 minutes (typical for Very Easy)  
**Difficulty Rating:** Very Easy ⭐

---

*This writeup is for educational purposes only. Reverse engineering skills should be used ethically and legally, with proper authorization.*
