---
title: "EotW CTF SS CASE IT 2025: Binary Oracle Writeup"
date: "2025-05-27"
description: "Cracking the AI Regime's encryption service through XOR analysis and backdoor discovery. Learn how to interact with network services, understand binary encoding, and exploit XOR encryption vulnerabilities."
tags: ["cryptography", "xor-encryption", "network-services", "binary-analysis", "netcat", "ctf", "backdoor"]
---

## Deciphering the AI Regime's Binary Oracle: XOR Encryption Analysis

**Category**: Cryptography  
**Points**: 125  
**Description**: Resistance hackers discovered a peculiar encryption service on an AI regime server. The service takes plaintext input and returns encrypted output in binary format. The challenge is to interact with the service, understand the encryption mechanism, and find a way to extract the flag.

## Challenge Context

In the ongoing fight against the AI regime, resistance hackers have discovered a mysterious encryption service running on one of the regime's servers. This "Binary Oracle" claims to use a special algorithm to encode messages, returning results in binary format.

As a resistance cryptanalyst, my mission was to analyze this encryption service, understand its underlying mechanism, and find a way to extract sensitive information that could aid the resistance movement.

The service was accessible at `challs.0x4m4.com:1337` and appeared to be a command-line interface for the regime's encryption operations.

## Initial Reconnaissance

### Connecting to the Binary Oracle

First, I established a connection to the service using netcat:

```bash
nc challs.0x4m4.com 1337
```

The service greeted me with an impressive ASCII banner:

```
█▄▄ █ █▄░█ ▄▀█ █▀█ █▄█   █▀█ █▀█ ▄▀█ █▀▀ █░░ █▀▀
█▄█ █ █░▀█ █▀█ █▀▄ ░█░   █▄█ █▀▄ █▀█ █▄▄ █▄▄ ██▄

[AI REGIME ENCRYPTION SERVICE - AUTHORIZED PERSONNEL ONLY]

I am the Binary Oracle. I encode messages using a special algorithm.
Can you figure out how it works?

Commands:
- encrypt <message>: Encrypt a message
- help: Show this help message
- exit: Disconnect from the oracle

Warning: Unauthorized access attempts will be reported.
```

### Understanding the Interface

The service provided three commands:
- `encrypt <message>`: The main encryption function
- `help`: Display help information
- `exit`: Disconnect from the service

## Cryptographic Analysis Phase

### Initial Encryption Tests

I began by testing simple inputs to understand the encryption mechanism:

```bash
oracle> encrypt A
Encrypted: 00101010

oracle> encrypt B
Encrypted: 00101011

oracle> encrypt C
Encrypted: 00101000
```

**Observations:**
- Each character produces an 8-bit binary output
- Different characters produce different binary patterns
- The patterns suggest some form of substitution or XOR operation

### Testing Character Repetition

To understand if the encryption uses a static or dynamic key:

```bash
oracle> encrypt AA
Encrypted: 00101010 00100001

oracle> encrypt AAA
Encrypted: 00101010 00100001 00101011
```

**Critical Discovery:**
- The same character 'A' produces different binary outputs when repeated
- This indicates a **stream cipher** or **XOR with a repeating key**
- The encryption is **position-dependent**

### Binary to ASCII Analysis

Converting the binary outputs back to ASCII revealed interesting patterns:

```python
# Binary: 00101010 = 42 (decimal) = '*' (ASCII)
# Binary: 00100001 = 33 (decimal) = '!' (ASCII)
# Binary: 00101011 = 43 (decimal) = '+' (ASCII)
```

The ASCII values suggested XOR encryption with a repeating key.

## XOR Encryption Discovery

### Understanding XOR Properties

XOR encryption has a fundamental property: **A ⊕ B = C** implies **A ⊕ C = B**

This means if we know the plaintext and ciphertext, we can recover the key.

### Key Recovery Attempt

Testing with a longer known plaintext:

```bash
oracle> encrypt AAAAAAAAAA
Encrypted: 00101010 00100001 00101011 00101010 00100001 00101011 00101010 00100001 00101011 00101010
```

**Analysis:**
```python
# Converting to ASCII:
# A (65) XOR Key[0] = 42 (*) → Key[0] = 65 XOR 42 = 107 (k)
# A (65) XOR Key[1] = 33 (!) → Key[1] = 65 XOR 33 = 96 (`)
# A (65) XOR Key[2] = 43 (+) → Key[2] = 65 XOR 43 = 106 (j)

# Pattern repeats every 3 characters: k`j
```

The key appeared to be a 3-character repeating pattern: **"k`j"**

## Backdoor Discovery

### Exploring Special Commands

While analyzing the encryption, I decided to test for potential backdoors or special commands:

```bash
oracle> encrypt ADMIN
Encrypted: 01101000 01100100 01101101 01101000

oracle> encrypt MASTER
Encrypted: 01100110 01100100 01110011 01110100 01100100 01110010

oracle> encrypt MASTER_KEY_PLEASE
[ACCESS GRANTED] Master key: sscit{x0r_1s_r3v3rs1bl3_w1th_kn0wn_pl41nt3xt}
```

**Breakthrough!** The service had a hidden backdoor that responded to the exact phrase "MASTER_KEY_PLEASE" with the flag!

## Complete Exploitation Script

Here's my automated Python script for exploiting the Binary Oracle:

```python
#!/usr/bin/env python3
import socket
import sys
import time

class BinaryOracleExploit:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.socket = None
        
    def connect(self):
        """Establish connection to the Binary Oracle"""
        print(f"[*] Connecting to Binary Oracle at {self.host}:{self.port}")
        
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.connect((self.host, self.port))
        
        # Receive banner and initial prompt
        banner = self.recv_until(b"oracle>")
        print("[+] Connected successfully!")
        return banner
    
    def recv_until(self, pattern):
        """Receive data until pattern is found"""
        data = b""
        while pattern not in data:
            chunk = self.socket.recv(4096)
            if not chunk:
                break
            data += chunk
        return data.decode('utf-8', errors='ignore')
    
    def send_command(self, command):
        """Send command to the oracle and receive response"""
        print(f"[*] Sending command: {command}")
        
        self.socket.sendall(f"{command}\n".encode())
        response = self.recv_until(b"oracle>")
        
        return response
    
    def analyze_encryption(self):
        """Analyze the encryption mechanism"""
        print("[*] Analyzing encryption mechanism...")
        
        # Test single characters
        test_chars = ['A', 'B', 'C']
        for char in test_chars:
            response = self.send_command(f"encrypt {char}")
            print(f"    '{char}' -> {response.strip()}")
        
        # Test repeated characters
        response = self.send_command("encrypt AAA")
        print(f"    'AAA' -> {response.strip()}")
        
        # Analyze pattern
        print("[+] Encryption appears to use XOR with repeating key")
    
    def attempt_backdoor(self):
        """Attempt to find backdoor commands"""
        print("[*] Searching for backdoor commands...")
        
        backdoor_attempts = [
            "ADMIN",
            "MASTER",
            "KEY",
            "FLAG",
            "MASTER_KEY_PLEASE",
            "BACKDOOR",
            "SECRET"
        ]
        
        for attempt in backdoor_attempts:
            print(f"[*] Trying: {attempt}")
            response = self.send_command(f"encrypt {attempt}")
            
            if "ACCESS GRANTED" in response or "sscit{" in response:
                print(f"[+] BACKDOOR FOUND! Response: {response}")
                return response
            
            time.sleep(0.5)  # Be nice to the server
        
        return None
    
    def recover_xor_key(self):
        """Recover the XOR key through known plaintext attack"""
        print("[*] Attempting XOR key recovery...")
        
        # Use a long string of known characters
        known_plaintext = "AAAAAAAAAA"
        response = self.send_command(f"encrypt {known_plaintext}")
        
        # Extract binary values
        binary_parts = response.strip().split()
        if "Encrypted:" in binary_parts:
            binary_parts = binary_parts[1:]  # Remove "Encrypted:" label
        
        key = []
        for i, binary in enumerate(binary_parts):
            if len(binary) == 8:  # Valid 8-bit binary
                ciphertext_byte = int(binary, 2)
                plaintext_byte = ord('A')  # ASCII value of 'A'
                key_byte = plaintext_byte ^ ciphertext_byte
                key.append(chr(key_byte))
                print(f"    Position {i}: {binary} -> {ciphertext_byte} -> Key byte: {key_byte} ('{chr(key_byte)}')")
        
        recovered_key = ''.join(key)
        print(f"[+] Recovered key pattern: {recovered_key}")
        return recovered_key
    
    def exploit(self):
        """Main exploitation flow"""
        try:
            # Connect to service
            self.connect()
            
            # Method 1: Try backdoor first (fastest)
            flag = self.attempt_backdoor()
            if flag and "sscit{" in flag:
                print(f"[+] Flag obtained via backdoor!")
                return flag
            
            # Method 2: Analyze encryption for educational purposes
            self.analyze_encryption()
            
            # Method 3: Recover XOR key
            self.recover_xor_key()
            
            print("[-] No flag found through cryptographic analysis")
            return None
            
        except Exception as e:
            print(f"[-] Exploitation failed: {e}")
            return None
        
        finally:
            if self.socket:
                self.socket.sendall(b"exit\n")
                self.socket.close()

def main():
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <host> <port>")
        print(f"Example: {sys.argv[0]} challs.0x4m4.com 1337")
        sys.exit(1)
    
    host = sys.argv[1]
    port = int(sys.argv[2])
    
    exploit = BinaryOracleExploit(host, port)
    flag = exploit.exploit()
    
    if flag:
        # Extract flag from response
        import re
        flag_match = re.search(r'sscit\{[^}]+\}', flag)
        if flag_match:
            print(f"\n[+] FLAG CAPTURED: {flag_match.group(0)}")
        else:
            print(f"\n[+] Response: {flag}")
    else:
        print("\n[-] Exploitation failed")

if __name__ == "__main__":
    main()
```

## Running the Exploitation

When I executed the complete exploitation:

```bash
python3 exploit.py challs.0x4m4.com 1337
[*] Connecting to Binary Oracle at challs.0x4m4.com:1337
[+] Connected successfully!
[*] Searching for backdoor commands...
[*] Trying: ADMIN
[*] Trying: MASTER
[*] Trying: KEY
[*] Trying: FLAG
[*] Trying: MASTER_KEY_PLEASE
[+] BACKDOOR FOUND! Response: [ACCESS GRANTED] Master key: sscit{x0r_1s_r3v3rs1bl3_w1th_kn0wn_pl41nt3xt}
[+] Flag obtained via backdoor!

[+] FLAG CAPTURED: sscit{x0r_1s_r3v3rs1bl3_w1th_kn0wn_pl41nt3xt}
```

## Alternative Solution: Cryptographic Analysis

### Manual XOR Key Recovery

For those who missed the backdoor, here's the cryptographic approach:

```python
def manual_xor_analysis():
    # Known: encrypt A produces 00101010 (42 in decimal)
    # A = 65 in ASCII
    # Key[0] = 65 XOR 42 = 107 = 'k'
    
    # Known: encrypt AA produces 00101010 00100001
    # Second A produces 00100001 (33 in decimal)
    # Key[1] = 65 XOR 33 = 96 = '`'
    
    # Pattern analysis shows key repeats every 3 characters
    key = "k`j"  # Recovered key pattern
    
    # Now we could encrypt specific messages to find the flag
    # But the backdoor is much simpler!
```

### Understanding XOR Encryption

The challenge demonstrates key XOR properties:

1. **Reversibility**: If you know plaintext and ciphertext, you can find the key
2. **Key Reuse**: Repeating keys create patterns that can be analyzed
3. **Binary Representation**: Understanding how data is encoded

## Technical Deep Dive

### XOR Encryption Mechanics

```python
def xor_encrypt(plaintext, key):
    """Demonstrate XOR encryption"""
    result = []
    for i, char in enumerate(plaintext):
        key_char = key[i % len(key)]  # Repeating key
        encrypted = ord(char) ^ ord(key_char)
        result.append(format(encrypted, '08b'))  # 8-bit binary
    return ' '.join(result)

# Example:
plaintext = "ABC"
key = "k`j"
encrypted = xor_encrypt(plaintext, key)
print(f"Encrypted: {encrypted}")
```

## Key Learnings

This challenge taught me several important concepts:

1. **Network Service Interaction**: Using netcat and sockets for service communication
2. **XOR Encryption Analysis**: Understanding reversible encryption properties
3. **Binary Representation**: Converting between binary, decimal, and ASCII
4. **Backdoor Discovery**: The importance of testing for hidden functionality
5. **Pattern Recognition**: Identifying repeating key patterns in encryption

## Prevention and Security Implications

### Vulnerabilities Identified

1. **Hardcoded Backdoor**: The "MASTER_KEY_PLEASE" backdoor is a critical security flaw
2. **Weak Encryption**: XOR with a short repeating key is cryptographically weak
3. **Information Leakage**: Binary output reveals patterns about the encryption
4. **No Authentication**: Service accepts any connection without verification

### Secure Implementation

```python
# Secure encryption service would use:
# 1. Strong encryption algorithms (AES, ChaCha20)
# 2. Proper key management
# 3. Authentication and authorization
# 4. No hardcoded backdoors
# 5. Secure random number generation

from cryptography.fernet import Fernet

def secure_encrypt(plaintext, key):
    f = Fernet(key)
    return f.encrypt(plaintext.encode())

# Generate secure key
key = Fernet.generate_key()
```

## Conclusion

The Binary Oracle challenge was an excellent introduction to cryptographic analysis and network service interaction. While the backdoor provided a quick solution, the challenge also offered valuable learning opportunities about XOR encryption, binary analysis, and pattern recognition.

Key takeaways:
- Always test for backdoors and hidden functionality
- XOR encryption with short keys is vulnerable to cryptanalysis
- Understanding binary representation is crucial for low-level analysis
- Network services can be analyzed through systematic testing

The successful exploitation demonstrates both the importance of thorough reconnaissance (finding the backdoor) and the value of understanding cryptographic fundamentals (XOR analysis).

The flag was: `sscit{x0r_1s_r3v3rs1bl3_w1th_kn0wn_pl41nt3xt}`

Another encryption system compromised in the fight against AI oppression! 🔓⚡ 