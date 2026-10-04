---
title: "Binary Backdoor: EotW CTF SS CASE IT 2025 Reverse Engineering Writeup"
date: "2025-05-27"
description: "Discovering hardcoded backdoor credentials in AI regime security terminals through basic reverse engineering techniques"
tags: ["ctf", "reverse-engineering", "strings", "binary-analysis", "backdoor", "beginner", "ss-case-it-2025"]
---

# Binary Backdoor: EotW CTF SS CASE IT 2025 Reverse Engineering Writeup

## Challenge Overview

In a stroke of incredible fortune, our resistance operatives have successfully extracted a binary executable from one of the AI regime's security terminals during a covert infiltration mission. This terminal binary represents a critical component of their access control infrastructure, potentially containing authentication mechanisms and security protocols used across their network.

Intelligence reports suggest that the AI regime's developers may have implemented backdoor access codes in their security systems for emergency maintenance purposes. These backdoors, if discovered, could provide us with unprecedented access to their secure facilities and sensitive information systems.

Our mission is to analyze this captured binary and uncover any hidden backdoor mechanisms that could grant us administrative access to the regime's security infrastructure.

**Challenge Details:**
- **Name:** Binary Backdoor
- **Category:** Reverse Engineering
- **Difficulty:** Very Easy
- **Points:** 50
- **Flag Format:** `sscit{...}`

## The Intelligence Brief

The extracted binary file `backdoor` was recovered from a security terminal in Sector 12 during our recent reconnaissance operation. The terminal appeared to be part of the regime's distributed access control system, responsible for authenticating personnel and granting access to restricted areas.

Our technical intelligence team believes that the regime's rapid deployment schedule may have led to poor security practices, including the possibility of hardcoded credentials or backdoor access mechanisms embedded directly in the binary code. Such vulnerabilities are common in rushed development cycles and could provide us with a significant advantage.

The mission objectives are clear:
1. Analyze the binary to understand its authentication mechanism
2. Identify any hardcoded credentials or backdoor access codes
3. Extract the hidden flag that will confirm successful access
4. Document the vulnerability for future exploitation

## Initial Binary Analysis

Upon receiving the extracted binary, I began with fundamental reverse engineering reconnaissance:

### File Identification
```bash
# Basic file information
file backdoor
# Output: backdoor: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=..., for GNU/Linux 3.2.0, not stripped

# Check file permissions and size
ls -la backdoor
# Output: -rwxr-xr-x 1 user user 8192 May 27 10:00 backdoor

# Examine file headers for additional information
readelf -h backdoor
```

The binary was identified as a standard 64-bit ELF executable for Linux systems. Notably, the binary was **not stripped**, meaning it still contained debugging symbols and function names: a significant oversight by the regime's developers that would aid our analysis.

### Dynamic Analysis: Initial Execution

```bash
# Test basic execution to understand program behavior
./backdoor
```

Output:
```
=== AI REGIME SECURITY TERMINAL ===
Enter administrator access code: test
Access denied. This attempt has been logged.
```

**Initial intelligence gathered:**
- Binary implements an authentication prompt
- Requires an "administrator access code"
- Provides feedback on authentication attempts
- Claims to log failed attempts (potential security monitoring)

### String Analysis: The Fundamental Approach

The most efficient method for analyzing binaries with hardcoded credentials is string extraction:

```bash
# Extract all readable strings from the binary
strings backdoor
```

This revealed critical intelligence:
```
/lib64/ld-linux-x86-64.so.2
libc.so.6
puts
printf
__isoc99_scanf
strcmp
__cxa_finalize
__libc_start_main
GLIBC_2.7
GLIBC_2.2.5
_ITM_deregisterTMCloneTable
__gmon_start__
_ITM_registerTMCloneTable
AWAVI
AUATL
[]A\A]A^A_
=== AI REGIME SECURITY TERMINAL ===
Enter administrator access code: 
R3v0lut10n_15_N34r
Access granted.
Flag: sscit{b4ckd00r_4cc3ss_gr4nt3d}
Access denied. This attempt has been logged.
;*3$"
```

**Critical intelligence extracted:**
- **Backdoor password:** `R3v0lut10n_15_N34r`
- **Success message:** "Access granted."
- **Hidden flag:** `sscit{b4ckd00r_4cc3ss_gr4nt3d}`
- **Failure message:** "Access denied. This attempt has been logged."

## Exploitation

### Successful Backdoor Access

Armed with the discovered credentials, I proceeded to test the backdoor:

```bash
# Execute binary with discovered password
./backdoor
```

Interactive session:
```
=== AI REGIME SECURITY TERMINAL ===
Enter administrator access code: R3v0lut10n_15_N34r
Access granted.
Flag: sscit{b4ckd00r_4cc3ss_gr4nt3d}
```

**Mission accomplished!** The hardcoded backdoor credentials successfully granted administrative access and revealed the flag: `sscit{b4ckd00r_4cc3ss_gr4nt3d}`

## Advanced Analysis Techniques

While the string analysis approach was sufficient for this challenge, let's explore additional reverse engineering methods for educational purposes:

### Static Analysis with Objdump

```bash
# Disassemble the main function
objdump -d backdoor | grep -A 50 "<main>"
```

This would reveal the assembly code structure, showing:
- String loading operations
- Function calls to `printf`, `scanf`, and `strcmp`
- Conditional jumps based on password comparison results

### Dynamic Analysis with GDB

```bash
# Start GDB debugging session
gdb ./backdoor

# Set breakpoint at main function
(gdb) break main
(gdb) run

# Examine the program flow
(gdb) disassemble main
(gdb) info registers
(gdb) continue
```

### Advanced String Analysis

```bash
# Extract strings with their memory addresses
strings -a -t x backdoor

# Look for specific patterns
strings backdoor | grep -i "password\|access\|admin\|flag"

# Extract only printable ASCII strings of minimum length 4
strings -n 4 backdoor
```

### Hexdump Analysis

```bash
# Examine binary in hexadecimal format
hexdump -C backdoor | head -50

# Search for specific string patterns
hexdump -C backdoor | grep -i "revolution"
```

## Complete Analysis Script

Here's a comprehensive script for automated binary backdoor analysis:

```bash
#!/bin/bash

echo "=== Binary Backdoor Analysis Tool ==="
echo "Analyzing AI regime security terminal binary..."

BINARY="backdoor"
OUTPUT_DIR="backdoor_analysis"

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
readelf -S "$BINARY" > "$OUTPUT_DIR/sections.txt"

# String extraction and analysis
echo "Extracting and analyzing strings..."
strings "$BINARY" > "$OUTPUT_DIR/all_strings.txt"

# Search for potential passwords and flags
echo "Searching for credentials and flags..."
strings "$BINARY" | grep -E "(password|admin|access|code|flag|sscit)" > "$OUTPUT_DIR/potential_credentials.txt"

# Look for specific patterns
password=$(strings "$BINARY" | grep -E "^[A-Za-z0-9_]{10,}$" | grep -v "GLIBC" | head -1)
flag=$(strings "$BINARY" | grep "sscit{" | head -1)

if [ ! -z "$password" ]; then
    echo "*** POTENTIAL PASSWORD FOUND ***"
    echo "Password: $password"
    echo "$password" > "$OUTPUT_DIR/discovered_password.txt"
fi

if [ ! -z "$flag" ]; then
    echo "*** FLAG FOUND ***"
    echo "Flag: $flag"
    echo "$flag" > "$OUTPUT_DIR/discovered_flag.txt"
fi

# Test the discovered password
if [ ! -z "$password" ]; then
    echo ""
    echo "Testing discovered password..."
    
    # Create expect script for automated testing
    cat > "$OUTPUT_DIR/test_password.exp" << EOF
#!/usr/bin/expect
spawn ./$BINARY
expect "Enter administrator access code: "
send "$password\r"
expect eof
EOF
    
    chmod +x "$OUTPUT_DIR/test_password.exp"
    
    # Test password if expect is available
    if command -v expect &> /dev/null; then
        echo "Running automated password test..."
        "$OUTPUT_DIR/test_password.exp" > "$OUTPUT_DIR/password_test_result.txt" 2>&1
        
        if grep -q "Access granted" "$OUTPUT_DIR/password_test_result.txt"; then
            echo "*** SUCCESS! Password verified ***"
            cat "$OUTPUT_DIR/password_test_result.txt"
        else
            echo "*** FAILED! Password incorrect ***"
        fi
    else
        echo "Manual testing required (expect not available)"
        echo "Run: echo '$password' | ./$BINARY"
    fi
fi

# Generate disassembly
echo ""
echo "Generating disassembly..."
objdump -d "$BINARY" > "$OUTPUT_DIR/disassembly.txt"

# Extract main function disassembly
objdump -d "$BINARY" | sed -n '/<main>/,/^$/p' > "$OUTPUT_DIR/main_function.txt"

# Security analysis
echo ""
echo "=== SECURITY ANALYSIS ==="
echo "Binary Type: $(file $BINARY | grep -o 'ELF.*')"
echo "Stripped: $(if readelf -S $BINARY | grep -q '\.symtab'; then echo 'No'; else echo 'Yes'; fi)"
echo "Stack Protection: $(if objdump -d $BINARY | grep -q 'stack_chk'; then echo 'Enabled'; else echo 'Disabled'; fi)"
echo "PIE: $(if readelf -h $BINARY | grep -q 'DYN'; then echo 'Enabled'; else echo 'Disabled'; fi)"

echo ""
echo "Analysis complete. Results saved to $OUTPUT_DIR/"
```

## Security Vulnerability Assessment

### Critical Security Flaws Identified

1. **Hardcoded Credentials:** The most severe vulnerability: authentication credentials stored in plaintext within the binary
2. **No Obfuscation:** Credentials easily discoverable through basic string analysis
3. **Predictable Password:** The password "R3v0lut10n_15_N34r" follows a predictable pattern
4. **Information Disclosure:** Flag and success messages stored in plaintext
5. **No Anti-Reverse Engineering:** Binary lacks any protection against analysis

### Impact Assessment

- **Severity:** Critical
- **Exploitability:** Trivial (requires only basic tools)
- **Scope:** Complete authentication bypass
- **Detection:** Difficult to detect without binary analysis

### Recommended Countermeasures

```c
// Improved authentication system (conceptual)
#include <stdio.h>
#include <string.h>
#include <openssl/sha.h>

int secure_authenticate(char *input) {
    unsigned char hash[SHA256_DIGEST_LENGTH];
    unsigned char expected[] = {0x5e, 0x88, 0x48, 0x98, ...}; // Pre-computed hash
    
    // Hash the input
    SHA256((unsigned char*)input, strlen(input), hash);
    
    // Compare hashes instead of plaintext
    return memcmp(hash, expected, SHA256_DIGEST_LENGTH) == 0;
}
```

## Educational Value

This challenge demonstrates several fundamental reverse engineering concepts:

### Basic Techniques Learned

1. **File Identification:** Using `file` command to understand binary format
2. **String Extraction:** Using `strings` command for quick reconnaissance
3. **Pattern Recognition:** Identifying potential credentials in string output
4. **Dynamic Testing:** Verifying discovered credentials through execution
5. **Documentation:** Recording findings for future reference

### Tool Proficiency

- **strings:** Primary tool for extracting readable text from binaries
- **file:** Binary format identification
- **objdump:** Disassembly and analysis
- **readelf:** ELF header and section analysis
- **hexdump:** Raw binary examination

## Lessons Learned

This reverse engineering challenge highlighted several critical security principles:

1. **Never Hardcode Credentials:** Authentication secrets should never be embedded in binaries
2. **Use Proper Hashing:** Credentials should be hashed with strong algorithms
3. **Implement Obfuscation:** Critical strings should be obfuscated or encrypted
4. **Strip Binaries:** Remove debugging symbols and unnecessary information
5. **Security Through Depth:** Implement multiple layers of protection

## Conclusion

The analysis of the AI regime's security terminal binary proved remarkably successful, revealing a critical backdoor vulnerability that granted immediate administrative access. The discovery of the hardcoded password `R3v0lut10n_15_N34r` and subsequent flag extraction `sscit{b4ckd00r_4cc3ss_gr4nt3d}` demonstrates the severe security implications of poor development practices.

This investigation highlighted the importance of:

- **Basic Reconnaissance:** Simple tools like `strings` can reveal critical vulnerabilities
- **Systematic Analysis:** Following a methodical approach to binary examination
- **Security Awareness:** Understanding common development security flaws
- **Tool Proficiency:** Mastering fundamental reverse engineering utilities
- **Documentation:** Recording findings for operational intelligence

The regime's security terminal represents a catastrophic security failure: storing authentication credentials in plaintext within the binary itself. This vulnerability could potentially be exploited across their entire security infrastructure if similar development practices were used elsewhere.

This intelligence breakthrough provides the resistance with a significant advantage and demonstrates that even the most sophisticated-appearing systems can contain fundamental security flaws. The discovered backdoor credentials may prove valuable for future infiltration operations against regime facilities.

The resistance continues, one binary at a time.

---

*This writeup is part of my CTF journey documenting the techniques and methodologies used in cybersecurity competitions. For more writeups and cybersecurity content, visit [0x4m4.com](https://0x4m4.com)* 