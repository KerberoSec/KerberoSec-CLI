---
title: "Algorithm Reversal: EotW CTF SS CASE IT 2025 Reverse Engineering Writeup"
date: "2025-05-27"
description: "Reverse engineering AI regime cipher verification systems to extract authentication algorithms and bypass security controls"
tags: ["ctf", "reverse-engineering", "binary-analysis", "gdb", "ghidra", "cipher-analysis", "ss-case-it-2025"]
---

# Algorithm Reversal: EotW CTF SS CASE IT 2025 Reverse Engineering Writeup

## Challenge Overview

In a critical intelligence operation, our resistance operatives have successfully infiltrated one of the AI regime's secure communication facilities and extracted a copy of their latest cipher verification system. This binary represents a significant breakthrough in our understanding of their cryptographic infrastructure, as it contains the algorithms used to verify authentication passphrases for their secure communication networks.

The captured binary appears to implement a custom cipher verification system that the regime uses to authenticate access to their command and control infrastructure. Our mission is to reverse engineer this verification system, understand its underlying algorithm, and determine the correct passphrase that will unlock access to their secure communications.

**Challenge Details:**
- **Name:** Algorithm Reversal
- **Category:** Reverse Engineering
- **Difficulty:** Easy
- **Points:** 150
- **Flag Format:** `sscit{...}`

## The Intelligence Brief

The extracted binary file `algorithm_reversal` represents a critical component of the AI regime's authentication infrastructure. Intelligence suggests this verification system is used across multiple regime facilities to validate access credentials for their secure communication networks.

Our cryptanalysis team has determined that the system implements a custom transformation algorithm that processes authentication passphrases through multiple cipher operations. The binary appears to require a specific 10-character lowercase passphrase that, when processed through their algorithm, produces a predetermined verification string.

The mission is clear: reverse engineer the cipher verification algorithm, determine the mathematical transformations applied to input passphrases, and calculate the correct input that will satisfy the verification system and reveal the hidden access credentials.

## Initial Binary Analysis

Upon receiving the extracted binary, I began with comprehensive static analysis:

### File Identification
```bash
# Basic file information
file algorithm_reversal
# Output: algorithm_reversal: ELF 64-bit LSB shared object, x86-64, version 1 (SYSV), dynamically linked, stripped

# Check file permissions and size
ls -la algorithm_reversal
# Output: -rwxr-xr-x 1 user user 8760 May 27 10:00 algorithm_reversal

# Examine file headers
readelf -h algorithm_reversal
```

The binary was identified as a 64-bit ELF executable, stripped of debugging symbols, indicating the regime's attempt to obfuscate their verification algorithm.

### Dynamic Analysis: Initial Execution

```bash
# Test basic execution
./algorithm_reversal
# Output: Usage: ./algorithm_reversal <passphrase>

# Test with sample input
./algorithm_reversal test
# Output: === AI REGIME CIPHER VERIFICATION SYSTEM ===
#         Invalid passphrase length. Must be exactly 10 characters.

# Test with 10-character input
./algorithm_reversal abcdefghij
# Output: === AI REGIME CIPHER VERIFICATION SYSTEM ===
#         Access denied. Incorrect passphrase.
```

**Initial intelligence gathered:**
- Binary requires exactly one command-line argument
- Passphrase must be exactly 10 characters
- System provides clear feedback on verification attempts

### String Analysis

```bash
# Extract readable strings from the binary
strings algorithm_reversal
```

Key strings discovered:
```
=== AI REGIME CIPHER VERIFICATION SYSTEM ===
Usage: %s <passphrase>
Invalid passphrase length. Must be exactly 10 characters.
Access denied. Incorrect passphrase.
Access granted!
Flag: %s
nuhmkgswkp
sscit{r3v3r53_4lg0r1thm}
```

**Critical intelligence extracted:**
- Target verification string: `nuhmkgswkp`
- Hidden flag: `sscit{r3v3r53_4lg0r1thm}`
- Clear program flow indicators

## Reverse Engineering Analysis

### Static Analysis with Ghidra

Using Ghidra for comprehensive disassembly and decompilation:

```c
// Decompiled main function (simplified)
int main(int argc, char **argv) {
    char *input;
    char transformed[11];
    char target[] = "nuhmkgswkp";
    
    if (argc != 2) {
        printf("Usage: %s <passphrase>\n", argv[0]);
        return 1;
    }
    
    input = argv[1];
    
    if (strlen(input) != 10) {
        printf("=== AI REGIME CIPHER VERIFICATION SYSTEM ===\n");
        printf("Invalid passphrase length. Must be exactly 10 characters.\n");
        return 1;
    }
    
    // Apply transformation algorithm
    transform_passphrase(input, transformed);
    
    if (strcmp(transformed, target) == 0) {
        printf("=== AI REGIME CIPHER VERIFICATION SYSTEM ===\n");
        printf("Access granted!\n");
        printf("Flag: sscit{r3v3r53_4lg0r1thm}\n");
        return 0;
    } else {
        printf("=== AI REGIME CIPHER VERIFICATION SYSTEM ===\n");
        printf("Access denied. Incorrect passphrase.\n");
        return 1;
    }
}
```

### Algorithm Analysis

The critical `transform_passphrase` function revealed the cipher algorithm:

```c
void transform_passphrase(char *input, char *output) {
    int i;
    
    for (i = 0; i < 10; i++) {
        char c = input[i];
        
        // Ensure lowercase letter
        if (c < 'a' || c > 'z') {
            output[i] = c;  // Invalid character
            continue;
        }
        
        // Apply position-dependent rotation
        if (i % 3 == 0) {
            // Position 0, 3, 6, 9: ROT13
            output[i] = ((c - 'a' + 13) % 26) + 'a';
        } else if (i % 3 == 1) {
            // Position 1, 4, 7: ROT7
            output[i] = ((c - 'a' + 7) % 26) + 'a';
        } else {
            // Position 2, 5, 8: ROT19
            output[i] = ((c - 'a' + 19) % 26) + 'a';
        }
    }
    
    output[10] = '\0';
}
```

**Algorithm discovered:**
- Position-dependent Caesar cipher rotations
- ROT13 for positions 0, 3, 6, 9
- ROT7 for positions 1, 4, 7
- ROT19 for positions 2, 5, 8

### Dynamic Analysis with GDB

Verifying the algorithm through dynamic analysis:

```bash
# Start GDB session
gdb ./algorithm_reversal

# Set breakpoint at main function
(gdb) break main
(gdb) run testinput

# Examine the transformation function
(gdb) disassemble transform_passphrase
```

The GDB analysis confirmed the static analysis findings and revealed the exact transformation logic.

## Algorithm Reversal

### Mathematical Analysis

To find the correct input, I needed to reverse each transformation:

**Forward transformations:**
- ROT13: `(input + 13) % 26`
- ROT7: `(input + 7) % 26`
- ROT19: `(input + 19) % 26`

**Reverse transformations:**
- Reverse ROT13: `(output - 13 + 26) % 26`
- Reverse ROT7: `(output - 7 + 26) % 26`
- Reverse ROT19: `(output - 19 + 26) % 26`

### Manual Calculation

Working backwards from the target string `nuhmkgswkp`:

```
Position 0 (n): ROT13 reverse -> (n - 'a' - 13 + 26) % 26 + 'a' = a
Position 1 (u): ROT7 reverse  -> (u - 'a' - 7 + 26) % 26 + 'a' = n
Position 2 (h): ROT19 reverse -> (h - 'a' - 19 + 26) % 26 + 'a' = o
Position 3 (m): ROT13 reverse -> (m - 'a' - 13 + 26) % 26 + 'a' = z
Position 4 (k): ROT7 reverse  -> (k - 'a' - 7 + 26) % 26 + 'a' = d
Position 5 (g): ROT19 reverse -> (g - 'a' - 19 + 26) % 26 + 'a' = n
Position 6 (s): ROT13 reverse -> (s - 'a' - 13 + 26) % 26 + 'a' = f
Position 7 (w): ROT7 reverse  -> (w - 'a' - 7 + 26) % 26 + 'a' = p
Position 8 (k): ROT19 reverse -> (k - 'a' - 19 + 26) % 26 + 'a' = r
Position 9 (p): ROT13 reverse -> (p - 'a' - 13 + 26) % 26 + 'a' = c
```

**Calculated passphrase:** `anozdnfprc`

### Automated Reversal Script

```python
#!/usr/bin/env python3

def reverse_transform(target_string):
    """Reverse the AI regime cipher algorithm"""
    result = ""
    
    for i in range(len(target_string)):
        c = ord(target_string[i]) - ord('a')
        
        if i % 3 == 0:
            # Reverse ROT13
            c = (c - 13 + 26) % 26
        elif i % 3 == 1:
            # Reverse ROT7
            c = (c - 7 + 26) % 26
        else:
            # Reverse ROT19
            c = (c - 19 + 26) % 26
        
        result += chr(c + ord('a'))
    
    return result

def verify_transform(input_string):
    """Verify our reversal by applying forward transformation"""
    result = ""
    
    for i in range(len(input_string)):
        c = ord(input_string[i]) - ord('a')
        
        if i % 3 == 0:
            # Apply ROT13
            c = (c + 13) % 26
        elif i % 3 == 1:
            # Apply ROT7
            c = (c + 7) % 26
        else:
            # Apply ROT19
            c = (c + 19) % 26
        
        result += chr(c + ord('a'))
    
    return result

# Target string from binary analysis
target = "nuhmkgswkp"

# Calculate the required input
passphrase = reverse_transform(target)
print(f"Calculated passphrase: {passphrase}")

# Verify our calculation
verification = verify_transform(passphrase)
print(f"Verification: {verification}")
print(f"Target:       {target}")
print(f"Match: {verification == target}")
```

Output:
```
Calculated passphrase: anozdnfprc
Verification: nuhmkgswkp
Target:       nuhmkgswkp
Match: True
```

## Exploitation

### Successful Authentication

```bash
# Execute with calculated passphrase
./algorithm_reversal anozdnfprc
```

Output:
```
=== AI REGIME CIPHER VERIFICATION SYSTEM ===
Access granted!
Flag: sscit{r3v3r53_4lg0r1thm}
```

**Mission accomplished!** The reverse engineering analysis successfully yielded the flag: `sscit{r3v3r53_4lg0r1thm}`

## Complete Analysis Script

Here's a comprehensive script for automated reverse engineering analysis:

```bash
#!/bin/bash

echo "=== Algorithm Reversal Analysis Tool ==="
echo "Analyzing AI regime cipher verification system..."

BINARY="algorithm_reversal"
OUTPUT_DIR="analysis_results"

# Create analysis directory
mkdir -p "$OUTPUT_DIR"

# Verify binary exists
if [ ! -f "$BINARY" ]; then
    echo "Error: Binary file not found!"
    exit 1
fi

echo "Binary: $BINARY"
echo "Architecture: $(file $BINARY | cut -d: -f2-)"
echo ""

# Basic binary analysis
echo "Performing static analysis..."
file "$BINARY" > "$OUTPUT_DIR/file_info.txt"
readelf -h "$BINARY" > "$OUTPUT_DIR/elf_header.txt"
objdump -d "$BINARY" > "$OUTPUT_DIR/disassembly.txt"

# String extraction
echo "Extracting strings..."
strings "$BINARY" > "$OUTPUT_DIR/strings.txt"

# Look for target string and flag
target_string=$(strings "$BINARY" | grep -E '^[a-z]{10}$' | head -1)
flag=$(strings "$BINARY" | grep 'sscit{' | head -1)

echo "Target string found: $target_string"
echo "Flag found: $flag"

# Create Python reversal script
cat > "$OUTPUT_DIR/reverse_algorithm.py" << 'EOF'
#!/usr/bin/env python3

def reverse_transform(target_string):
    """Reverse the AI regime cipher algorithm"""
    result = ""
    
    for i in range(len(target_string)):
        c = ord(target_string[i]) - ord('a')
        
        if i % 3 == 0:
            # Reverse ROT13
            c = (c - 13 + 26) % 26
        elif i % 3 == 1:
            # Reverse ROT7
            c = (c - 7 + 26) % 26
        else:
            # Reverse ROT19
            c = (c - 19 + 26) % 26
        
        result += chr(c + ord('a'))
    
    return result

def verify_transform(input_string):
    """Verify our reversal by applying forward transformation"""
    result = ""
    
    for i in range(len(input_string)):
        c = ord(input_string[i]) - ord('a')
        
        if i % 3 == 0:
            # Apply ROT13
            c = (c + 13) % 26
        elif i % 3 == 1:
            # Apply ROT7
            c = (c + 7) % 26
        else:
            # Apply ROT19
            c = (c + 19) % 26
        
        result += chr(c + ord('a'))
    
    return result

# Main analysis
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 2:
        print("Usage: python3 reverse_algorithm.py <target_string>")
        sys.exit(1)
    
    target = sys.argv[1]
    
    if len(target) != 10:
        print("Error: Target string must be exactly 10 characters")
        sys.exit(1)
    
    # Calculate the required input
    passphrase = reverse_transform(target)
    print(f"Calculated passphrase: {passphrase}")
    
    # Verify our calculation
    verification = verify_transform(passphrase)
    print(f"Verification: {verification}")
    print(f"Target:       {target}")
    print(f"Match: {verification == target}")
EOF

# Execute reversal script
if [ ! -z "$target_string" ]; then
    echo ""
    echo "Calculating passphrase..."
    python3 "$OUTPUT_DIR/reverse_algorithm.py" "$target_string" > "$OUTPUT_DIR/passphrase_calculation.txt"
    
    # Extract calculated passphrase
    passphrase=$(python3 "$OUTPUT_DIR/reverse_algorithm.py" "$target_string" | grep "Calculated passphrase:" | cut -d: -f2 | tr -d ' ')
    
    if [ ! -z "$passphrase" ]; then
        echo "Calculated passphrase: $passphrase"
        echo ""
        echo "Testing passphrase against binary..."
        
        # Test the passphrase
        result=$(./"$BINARY" "$passphrase" 2>&1)
        echo "$result"
        
        if echo "$result" | grep -q "Access granted"; then
            echo ""
            echo "*** SUCCESS! Passphrase verified ***"
            echo "Passphrase: $passphrase"
            echo "Flag: $flag"
        else
            echo ""
            echo "*** FAILED! Passphrase incorrect ***"
        fi
    fi
fi

echo ""
echo "Analysis complete. Results saved to $OUTPUT_DIR/"
```

## Advanced Reverse Engineering Techniques

### Using Radare2

```bash
# Analyze with radare2
r2 algorithm_reversal

# Analyze all functions
[0x00001060]> aaa

# List functions
[0x00001060]> afl

# Disassemble main function
[0x00001060]> pdf @main

# Examine strings
[0x00001060]> iz
```

### Using IDA Pro

```
1. Load binary in IDA Pro
2. Wait for auto-analysis to complete
3. Navigate to main function
4. Analyze transform_passphrase function
5. Identify the rotation patterns
6. Calculate reverse transformations
```

### Dynamic Analysis with Strace

```bash
# Trace system calls
strace ./algorithm_reversal anozdnfprc

# Trace library calls
ltrace ./algorithm_reversal anozdnfprc
```

## Security Analysis

### Vulnerability Assessment

1. **Algorithm Exposure:** The transformation algorithm is easily reverse-engineered
2. **String Leakage:** Target string and flag are stored in plaintext
3. **No Anti-Debugging:** Binary lacks anti-reverse engineering protections
4. **Predictable Patterns:** Simple rotation ciphers with fixed patterns
5. **Static Verification:** No dynamic or time-based verification components

### Countermeasures

```c
// Improved verification system (conceptual)
int secure_verify(char *input) {
    // Use cryptographic hash instead of simple transformations
    unsigned char hash[32];
    sha256(input, strlen(input), hash);
    
    // Compare against stored hash
    return memcmp(hash, expected_hash, 32) == 0;
}
```

## Lessons Learned

This reverse engineering challenge demonstrated several critical concepts:

1. **Static Analysis:** Using tools like Ghidra and strings for initial reconnaissance
2. **Dynamic Analysis:** Employing GDB for runtime verification
3. **Algorithm Recognition:** Identifying Caesar cipher variants and rotation patterns
4. **Mathematical Reversal:** Calculating inverse transformations
5. **Verification Testing:** Confirming analysis through practical testing

## Conclusion

The reverse engineering analysis of the AI regime's cipher verification system proved highly successful, yielding the access credentials `anozdnfprc` and the flag `sscit{r3v3r53_4lg0r1thm}` through systematic binary analysis and algorithm reversal.

This investigation highlighted the importance of:

- **Comprehensive Analysis:** Using multiple tools and techniques for complete understanding
- **Algorithm Recognition:** Identifying common cryptographic patterns and transformations
- **Mathematical Precision:** Accurately calculating inverse operations
- **Verification Methods:** Testing theoretical analysis against practical implementation
- **Tool Proficiency:** Leveraging various reverse engineering tools effectively

The regime's cipher verification system: while appearing sophisticated: contained fundamental weaknesses that allowed complete algorithm extraction and reversal. The use of simple rotation ciphers with predictable patterns, combined with plaintext storage of verification strings, provided multiple attack vectors for reverse engineering.

This breakthrough in understanding the AI regime's authentication algorithms represents a significant intelligence victory. The extracted verification system knowledge will prove invaluable for future infiltration operations and security assessments of their cryptographic infrastructure.

The resistance continues, one algorithm at a time.

---

*This writeup is part of my CTF journey documenting the techniques and methodologies used in cybersecurity competitions. For more writeups and cybersecurity content, visit [0x4m4.com](https://0x4m4.com)* 