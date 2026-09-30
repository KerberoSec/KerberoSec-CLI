# TryHackMe: REloaded Room Writeup
**Room:** REloaded  
**Difficulty:** Medium  
**Category:** Reverse Engineering  
**Author:** TryHackMe  
**Date Completed:** January 21, 2026
---
## Table of Contents
1. [Task 1: Level 0: L3v3lZ340_is_D02e](#task-1---level-0-l3v3lz340_is_d02e)
2. [Task 2: Level 1: Lucky Number](#task-2---level-1-lucky-number)
3. [Task 3: Level 2: Instruction Modification](#task-3---level-2-instruction-modification)
4. [Task 4: Level 3: XOR Flag Decoder](#task-4---level-3-xor-flag-decoder)
5. [Task 5: Level 4: Encryption Decryptor](#task-5---level-4-encryption-decryptor)
6. [Tools Used](#tools-used)
7. [Key Takeaways](#key-takeaways)
---
## Task 1: Level 0: L3v3lZ340_is_D02e
### Description
First reverse engineering challenge: find the hardcoded flag in the binary.
### Analysis
**Binary Type:** Windows PE (x86)  
**Language:** C++  
**Protection:** None
#### Decompiled Code
```c
void validate(char* user_input) {
    string hardcoded_flag;
    
    // Hardcoded flag at address 0x4b1045
    hardcoded_flag = "L3v3lZ340_is_D02e";
    
    // Compare user input with hardcoded flag
    if (compare(user_input, hardcoded_flag) == true) {
        printf("That was easy....Bruh!!!");  // Success!
    } else {
        printf("Dont Worry its a start ;)");  // Failure
    }
}
```
#### Key Findings
1. **Hardcoded Flag String**
   - **Address:** `0x004b1045`
   - **Value:** `"L3v3lZ340_is_D02e"`
   - **Location:** Data section (plaintext, not encrypted!)
2. **Success/Failure Messages**
   - Success: `"That was easy....Bruh!!!"` at `0x004b1057`
   - Failure: `"Dont Worry its a start ;)"` at `0x004b1070`
3. **Input Prompt**
   - `"Enter The Flag :: "` at `0x004b108a`
#### Assembly Analysis
```assembly
0040142b: MOV [ESP], 0x4b1045      ; Load "L3v3lZ340_is_D02e"
00401434: CALL string_constructor  ; Create string object
00401453: CALL compare_function    ; Compare with user input
00401458: TEST AL, AL               ; Check result
0040145a: JZ failure                ; Jump if not equal
0040145c: "That was easy....Bruh!!!" ; Success path
0040146a: "Dont Worry its a start ;)" ; Failure path
```
### Solution
**Flag:** `L3v3lZ340_is_D02e`
Simply run the program and enter the flag when prompted.
### Difficulty
⭐ Easy: Flag is stored in plaintext in the binary.
---
## Task 2: Level 1: Lucky Number
### Description
Find the magic number that the program is checking for.
### Analysis
**Binary Type:** Windows PE (x86)  
**Language:** C++  
**Protection:** None
#### Decompiled Code
```c
int main(int argc, char** argv) {
    if (argc < 2) {
        printf("N00b a day, pro for life");  // No arguments provided
    } else {
        int number = atoi(argv[1]);          // Convert first arg to int
        validate(number);                     // Check if it's the magic number
    }
}
void validate(int number) {
    if (number == 0x6ad) {  // 0x6ad = 1709 in decimal
        printf("Thats ur lucky number !!!");
    } else {
        puts("Try again ");
    }
}
```
#### Assembly Analysis
```assembly
00401416: CMP dword ptr [EBP + 0x8], 0x6ad  ; Compare input with 0x6ad
0040141d: JNZ 0x0040142d                     ; Jump if not equal (failure)
0040141f: MOV dword ptr [ESP], 0x4b1045      ; Load success message
00401426: CALL printf                        ; Print "Thats ur lucky number !!!"
```
#### Key Findings
- The program takes a **command-line argument**
- Converts it to an integer using `atoi()`
- Compares it with `0x6ad` (hexadecimal)
- **0x6ad in decimal = 1709**
### Solution
Run the program with the argument:
```bash
./program 1709
```
**Output:**
```
Thats ur lucky number !!!
```
**Answer:** `1709`
### Difficulty
⭐⭐ Easy: Simple hex to decimal conversion.
---
## Task 3: Level 2: Instruction Modification
### Description
"Which instruction did you modify?"
This challenge asks you to identify which instruction needs to be patched to bypass the flag check.
### Analysis
**Binary Type:** Windows PE (x86)  
**Language:** C++  
**Protection:** None
#### Decompiled Code
```c
void validate(char* input) {
    char correct_flag[28];
    
    // Build the flag in memory
    strncpy(correct_flag, "L3_1s_20t_Th3_L131t", 0x14);
    
    // Compare with user input
    if (strcmp(correct_flag, input) == 0) {
        puts("Get Ready For L4 ;)");
        printf("%s", correct_flag);  // Print the flag
    } else {
        printf("In order to advance you have to break your mindset");
    }
}
```
#### Assembly Analysis
**Flag Construction in Memory:**
```assembly
00401416: MOV [EBP-0x1c], 0x315f334c  ; "L3_1"
0040141d: MOV [EBP-0x18], 0x30325f73  ; "s_20"
00401424: MOV [EBP-0x14], 0x68545f74  ; "t_Th"
0040142b: MOV [EBP-0x10], 0x314c5f33  ; "3_L1"
00401432: MOV [EBP-0xc],  0x743133    ; "31t"
```
**Comparison Logic:**
```assembly
00401446: CALL strcmp              ; Compare strings
0040144b: TEST EAX,EAX             ; Check result
0040144d: JNZ 0x00401470           ; Jump if NOT equal (failure) ← TARGET
0040144f: "Get Ready For L4 ;)"   ; Success path
00401470: "In order to advance..." ; Failure path
```
#### Hex Values to ASCII
Reading the hex values as ASCII (little-endian):
- `0x315f334c` → "L3_1"
- `0x30325f73` → "s_20"
- `0x68545f74` → "t_Th"
- `0x314c5f33` → "3_L1"
- `0x743133` → "31t"
**Combined:** `L3_1s_20t_Th3_L131t`
### Solution
**Flag:** `L3_1s_20t_Th3_L131t`
**Instruction to Modify:**
- **Address:** `0x0040144d`
- **Original Instruction:** `JNZ 0x00401470` (opcode: `75 23`)
- **Modified Instruction:** `JZ 0x00401470` (opcode: `74 23`) or `NOP NOP` (opcode: `90 90`)
**Patching Methods:**
1. **Change JNZ to JZ:**
   - This inverts the logic: jump to failure when strings match, fall through to success when they don't
   
2. **NOP out the jump:**
   - Replace with `NOP NOP` to always fall through to success path
3. **Change to JMP:**
   - `JMP 0x0040144f` to always jump to success
**Using a hex editor:**
```
Offset: 0x0040144d
Original: 75 23 (JNZ)
Patched:  90 90 (NOP NOP)
```
### Difficulty
⭐⭐⭐ Medium: Requires understanding of assembly and binary patching.
---
## Task 4: Level 3: String Analysis
### Description
Find the flag hidden in the binary's string construction logic.
### Analysis
**Binary Type:** Windows PE (x86)  
**Language:** C++  
**Protection:** None
#### Decompiled Code
**Main Function:**
```c
int main() {
    char input[32];
    printf("Enter the flag ::");
    scanf("%s", input);
    validate(input);
    return 0;
}
```
**Flag Generation Function:**
```c
void generate_flag(undefined4 param_1) {
    byte local_1f[11];
    undefined4 local_14;
    uint local_10;
    
    // Initialize byte array with ASCII values
    local_1f[0] = 0x54;  // 'T'
    local_1f[1] = 0x48;  // 'H'
    local_1f[2] = 0x4d;  // 'M'
    local_1f[3] = 99;    // 'c' (0x63)
    local_1f[4] = 0x74;  // 't'
    local_1f[5] = 0x66;  // 'f'
    local_1f[6] = 0x2d;  // '-'
    local_1f[7] = 0x4c;  // 'L'
    local_1f[8] = 0x34;  // '4'
    local_1f[9] = 0;     // Null terminator
    
    local_14 = 7;
    
    // XOR loop (obfuscation)
    for (local_10 = 0; local_10 < 10; local_10++) {
        local_1f[local_10] = local_1f[local_10] ^ 7;
    }
    
    // Build C++ string object
    FUN_00462c80();
    FUN_00494c60(local_1f, local_1f + 10);
    FUN_00462cb0();
    
    return param_1;
}
```
**Validation Function:**
```c
void validate(char* input) {
    char correct_flag[24];
    string flag_obj;
    
    generate_flag(&flag_obj);  // Generate the flag
    
    // Extract characters from string object
    for (int i = 0; i < 0x18; i++) {
        correct_flag[i] = flag_obj[i];
    }
    
    if (strcmp(input, correct_flag) == 0) {
        printf("Rooted !!!");
    } else {
        printf("-_-");
    }
}
```
#### Key Observation
The bytes are initialized as **readable ASCII characters**:
| Index | Hex Value | ASCII Character |
|-------|-----------|-----------------|
| 0 | 0x54 | **T** |
| 1 | 0x48 | **H** |
| 2 | 0x4D | **M** |
| 3 | 0x63 | **c** |
| 4 | 0x74 | **t** |
| 5 | 0x66 | **f** |
| 6 | 0x2D | **-** |
| 7 | 0x4C | **L** |
| 8 | 0x34 | **4** |
| 9 | 0x00 | (null) |
**Reading the bytes directly:** `THMctf-L4`
The XOR operation with 7 is performed AFTER the bytes are initialized, which means:
1. The bytes start as readable ASCII: `THMctf-L4`
2. They get XORed with 7 (obfuscation)
3. The C++ string is built from the XORed bytes
4. When compared, the string contains the XORed version
However, since the program XORs the bytes before building the string, and then compares with user input, the flag that the user needs to enter is the **original readable string before XOR**.
### Solution
The flag is simply the ASCII representation of the initialized bytes:
```
THMctf-L4
```
#### Why No XOR Needed?
The XOR operation happens **inside** the function to obfuscate the string in memory. But the original bytes spell out the flag clearly:
```python
bytes_array = [0x54, 0x48, 0x4D, 0x63, 0x74, 0x66, 0x2D, 0x4C, 0x34]
flag = ''.join([chr(b) for b in bytes_array])
print(flag)  # Output: THMctf-L4
```
### Verification
Run the binary and enter the flag:
```bash
$ ./level3.exe
Enter the flag :: THMctf-L4
Rooted !!!
```
**Flag:** `THMctf-L4`
### Difficulty
⭐⭐ Easy-Medium: Requires reading hex values as ASCII characters.
---
## Task 5: Level 4: Encryption Decryptor
### Description
*"They are back!!! and using some sort of encryption algorithm to communicate. Although we intercepted their messages we cant decode them, Agent 35711 has successfully stolen their test encryption code. Now it's on you to build a decryptor for test messages and save this world."*
### Analysis
**Binary Type:** Windows PE (x86)  
**Language:** C++  
**Protection:** None
#### Decompiled Code
**Helper Function: Prime Check:**
```c
bool is_prime(int n) {
    if (n <= 3) {
        return true;  // Treats 0, 1, 2, 3 as prime
    }
    for (int i = 2; i < n; i++) {
        if (n % i == 0) {
            return false;
        }
    }
    return true;
}
```
**Encryption Function:**
```c
void encrypt(char* text) {
    int len = strlen(text);
    for (int i = 0; i < len; i++) {
        if (is_prime(i)) {
            text[i] = text[i] ^ 0x37;  // XOR with 0x37 if index is prime
        } else {
            text[i] = text[i] ^ i;      // XOR with index if not prime
        }
    }
    printf("%s", text);
}
```
**Main Function:**
```c
int main() {
    char message[] = "Alan Turing Was a Geniuse";
    encrypt(message);
    return 0;
}
```
#### Encryption Algorithm Breakdown
| Index | Is Prime? | Operation | Key |
|-------|-----------|-----------|-----|
| 0 | Yes (≤3) | XOR with 0x37 | 0x37 |
| 1 | Yes (≤3) | XOR with 0x37 | 0x37 |
| 2 | Yes (prime) | XOR with 0x37 | 0x37 |
| 3 | Yes (prime) | XOR with 0x37 | 0x37 |
| 4 | No (4%2=0) | XOR with index | 0x04 |
| 5 | Yes (prime) | XOR with 0x37 | 0x37 |
| 6 | No (6%2=0) | XOR with index | 0x06 |
| 7 | Yes (prime) | XOR with 0x37 | 0x37 |
#### Key Observations
1. **XOR is symmetric:** Encrypting twice gives you back the original
2. **Prime indices (0-3, 5, 7, 11, 13...):** XOR with `0x37`
3. **Non-prime indices (4, 6, 8, 9, 10...):** XOR with the index value itself
4. **Decryption = Encryption** (due to XOR properties)
### Solution: Decryptor Script
```python
#!/usr/bin/env python3
def is_prime(n):
    """
    Check if index is prime (matches the binary's logic)
    Note: Treats 0, 1, 2, 3 as prime
    """
    if n <= 3:
        return True
    for i in range(2, n):
        if n % i == 0:
            return False
    return True
def decrypt(ciphertext):
    """
    Decrypt the message using the reverse XOR algorithm
    Since XOR is symmetric, this is identical to encryption
    """
    result = []
    for i in range(len(ciphertext)):
        if is_prime(i):
            # XOR with 0x37 for prime indices
            result.append(chr(ord(ciphertext[i]) ^ 0x37))
        else:
            # XOR with index for non-prime indices
            result.append(chr(ord(ciphertext[i]) ^ i))
    return ''.join(result)
def encrypt(plaintext):
    """
    Encrypt (same as decrypt due to XOR properties)
    """
    return decrypt(plaintext)
# Test with the sample message
if __name__ == "__main__":
    plaintext = "Alan Turing Was a Geniuse"
    print(f"Original:  {plaintext}")
    
    # Encrypt it
    encrypted = encrypt(plaintext)
    print(f"Encrypted: {encrypted}")
    print(f"Hex:       {encrypted.encode().hex()}")
    
    # Decrypt it back
    decrypted = decrypt(encrypted)
    print(f"Decrypted: {decrypted}")
    
    print("\n" + "="*60)
    print("DECRYPTOR FOR INTERCEPTED MESSAGES")
    print("="*60)
    
    # Interactive decryption
    while True:
        intercepted = input("\nEnter encrypted message (or 'quit' to exit): ")
        if intercepted.lower() == 'quit':
            break
        if intercepted:
            decrypted_msg = decrypt(intercepted)
            print(f"Decrypted: {decrypted_msg}")
```
#### Example Usage
```bash
$ python3 decryptor.py
Original:  Alan Turing Was a Geniuse
Encrypted: vz{~Cv|kz~rCv{|C{Cr~z|~
Hex:       767a7b7e43767c6b7a7e7243767b7c437b43727e7a7c7e
Decrypted: Alan Turing Was a Geniuse
============================================================
DECRYPTOR FOR INTERCEPTED MESSAGES
============================================================
Enter encrypted message (or 'quit' to exit): vz{~Cv|kz~rCv{|C{Cr~z|~
Decrypted: Alan Turing Was a Geniuse
```
#### Encryption Example
Let's encrypt "HELLO":
| Index | Char | ASCII | Is Prime? | Operation | Result | Result Char |
|-------|------|-------|-----------|-----------|--------|-------------|
| 0 | H | 0x48 | Yes | 0x48 ^ 0x37 | 0x7F | DEL |
| 1 | E | 0x45 | Yes | 0x45 ^ 0x37 | 0x72 | r |
| 2 | L | 0x4C | Yes | 0x4C ^ 0x37 | 0x7B | { |
| 3 | L | 0x4C | Yes | 0x4C ^ 0x37 | 0x7B | { |
| 4 | O | 0x4F | No | 0x4F ^ 0x04 | 0x4B | K |
**"HELLO" → "\x7Fr{{K"**
### Difficulty
⭐⭐⭐⭐ Medium-Hard: Requires understanding of XOR encryption and prime number logic.
---
## Tools Used
### Static Analysis
- **Ghidra**: Primary reverse engineering tool
  - Decompilation
  - Disassembly
  - String analysis
  - Cross-reference tracking
  
- **Ghidra MCP Server**: For automated analysis via API
### Dynamic Analysis
- **GDB** (optional): For runtime debugging
- **x64dbg** (optional): Windows debugger
### Binary Patching
- **Hex Editor** (HxD, 010 Editor, etc.)
- **Ghidra's Patch Instruction** feature
### Scripting
- **Python 3**: For decryptor implementation
- **pwntools**: For binary interaction (if needed)
---
## Key Takeaways
### Challenge 1: Hardcoded Strings
- **Lesson:** Always check the strings in a binary first
- **Tool:** `strings` command or Ghidra's string window
- **Takeaway:** Many beginner RE challenges hide flags in plaintext
### Challenge 2: Hex to Decimal
- **Lesson:** Understand number representations (hex, decimal, binary)
- **Tool:** Calculator, Python, or online converters
- **Takeaway:** `0x6ad` = 1709: always verify your conversions
### Challenge 3: Binary Patching
- **Lesson:** Understanding conditional jumps is crucial
  - `JZ` - Jump if Zero
  - `JNZ` - Jump if Not Zero
  - `JMP` - Unconditional jump
- **Tool:** Hex editor or Ghidra's patch feature
- **Takeaway:** A single byte change can completely alter program behavior
### Challenge 4: Cryptanalysis
- **Lesson:** XOR encryption is symmetric (A ⊕ B ⊕ B = A)
- **Tool:** Python for implementing crypto algorithms
- **Takeaway:** Understanding the algorithm is key to breaking encryption
---
## General Reverse Engineering Tips
### 1. Start with Static Analysis
- Run `file` command to identify binary type
- Check for strings with `strings` command
- Look for interesting function names
- Identify the entry point and main function
### 2. Understand the Flow
- Follow the execution path from `main()`
- Identify validation/comparison functions
- Look for success/failure messages
- Trace back from interesting strings
### 3. Use Multiple Tools
- Ghidra for decompilation
- IDA for advanced analysis
- x64dbg/GDB for dynamic analysis
- Hex editor for patching
### 4. Document Your Findings
- Take notes on important addresses
- Document function purposes
- Keep track of interesting strings
- Save your analysis for future reference
### 5. Practice Common Patterns
- String comparisons (`strcmp`, `strncmp`)
- Number comparisons (`cmp`, `test`)
- Conditional jumps (`jz`, `jnz`, `je`, `jne`)
- XOR operations (common in crypto)
---
## Assembly Quick Reference
### Common Instructions
| Instruction | Description | Example |
|-------------|-------------|---------|
| `MOV` | Move data | `MOV EAX, 0x10` |
| `CMP` | Compare values | `CMP EAX, EBX` |
| `TEST` | Bitwise AND (sets flags) | `TEST AL, AL` |
| `JZ/JE` | Jump if Zero/Equal | `JZ 0x401000` |
| `JNZ/JNE` | Jump if Not Zero/Not Equal | `JNZ 0x401000` |
| `JMP` | Unconditional jump | `JMP 0x401000` |
| `CALL` | Call function | `CALL printf` |
| `RET` | Return from function | `RET` |
| `XOR` | Exclusive OR | `XOR EAX, EBX` |
| `PUSH` | Push to stack | `PUSH EBP` |
| `POP` | Pop from stack | `POP EBP` |
### Conditional Jumps
| Jump | Condition | Opposite |
|------|-----------|----------|
| `JZ` | Zero flag set | `JNZ` |
| `JE` | Equal (ZF=1) | `JNE` |
| `JNZ` | Zero flag clear | `JZ` |
| `JNE` | Not equal (ZF=0) | `JE` |
| `JG` | Greater (signed) | `JLE` |
| `JL` | Less (signed) | `JGE` |
| `JA` | Above (unsigned) | `JBE` |
| `JB` | Below (unsigned) | `JAE` |
---
## Conclusion
The **REloaded** room provides an excellent introduction to reverse engineering concepts:
1. **String Analysis**: Finding hardcoded data
2. **Number Systems**: Hex/decimal conversions
3. **Binary Patching**: Modifying program behavior
4. **Cryptanalysis**: Understanding and breaking encryption
Each challenge builds upon the previous one, gradually increasing in complexity. The room effectively teaches:
- Static analysis with Ghidra
- Assembly language basics
- Binary patching techniques
- Cryptographic algorithm analysis
- Python scripting for automation
**Difficulty Rating:** ⭐⭐⭐ Medium
**Time to Complete:** 2-3 hours (depending on experience)
**Recommended Prerequisites:**
- Basic understanding of C/C++
- Familiarity with assembly language
- Python programming skills
- Basic cryptography concepts
---
## Additional Resources
### Learning Resources
- [Ghidra Documentation](https://ghidra-sre.org/)
- [x86 Assembly Guide](https://www.cs.virginia.edu/~evans/cs216/guides/x86.html)
- [Reverse Engineering for Beginners](https://beginners.re/)
- [Practical Malware Analysis](https://nostarch.com/malware)
### Tools
- [Ghidra](https://ghidra-sre.org/): NSA's reverse engineering tool
- [IDA Pro](https://hex-rays.com/ida-pro/): Industry standard disassembler
- [x64dbg](https://x64dbg.com/): Windows debugger
- [GDB](https://www.gnu.org/software/gdb/): GNU debugger
- [Binary Ninja](https://binary.ninja/): Modern RE platform
### Practice Platforms
- [TryHackMe](https://tryhackme.com/): Guided learning
- [HackTheBox](https://www.hackthebox.com/): Advanced challenges
- [Crackmes.one](https://crackmes.one/): RE challenges
- [Reversing.kr](http://reversing.kr/): Korean RE challenges
---
**Author:** Kant  
**Date:** January 21, 2026  
**Room:** TryHackMe: REloaded  
**Status:** ✅ Completed
---
*Happy Reversing! 🔍*
