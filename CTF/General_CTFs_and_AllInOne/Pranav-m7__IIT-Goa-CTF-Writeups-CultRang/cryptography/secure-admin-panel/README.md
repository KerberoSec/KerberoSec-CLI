# Secure Admin Panel

**Category:** Cryptography  
**Difficulty:** Medium  
**Platform:** CultRang 2026  
**Objective:** Bypass the authentication system to view sensitive information using Length Extension Attack

## 🎯 Challenge Description

The system allows users to sign a message and verify it. It claims to use HMAC-SHA1 to guarantee integrity. We are told that "Only users with admin privileges AND debug access may view sensitive information."

## 🔍 Reconnaissance & Analysis

### Step 1: Initial Connection
Started by connecting to the service using netcat to understand the user interface.

```bash
nc <REDACTED_HOST> <REDACTED_PORT>
```

**Output:** The server greeted us and asked for a username. We entered `guest`.

**Menu Options:**
1. **Hash Message:** Returns a valid signature for a message
2. **Read Message:** Allows us to submit a message and signature for verification

### Step 2: Establishing the Baseline
To understand how the server processes data, we chose Option 1 (Hash Message) and entered a simple payload: `count=10`.

**Server Response:**
```
Message (hex): 636f756e743d31307c61646d696e3d46616c73657c64656275673d307c7569643d3430
Validation Token: <REDACTED_TOKEN>
```

### Step 3: Decoding the Hidden State
The server returned the message in Hexadecimal format. We noticed the hex string was much longer than our input (`count=10`). We decoded this hex string to ASCII to see what was happening.

**Decoding:**
- `636f756e743d3130` → `count=10`
- `7c` → `|` (Pipe separator)
- `61646d696e3d46616c7365` → `admin=False`
- `7c64656275673d30` → `debug=0`
- `7c7569643d3430` → `uid=40`

**Discovery:** The server is appending hidden security flags to our input before signing it.

**Actual Message Signed:** `count=10|admin=False|debug=0|uid=40`

## 🚨 Vulnerability Assessment

### Identifying the Flaw
The challenge description claims to use "HMAC-SHA1". However, true HMAC is not vulnerable to Length Extension Attacks. The ability to see the signature of a message and the ability to append data suggests the server is actually using a **Naive MAC**:

```
MAC = SHA1(SecretKey || Message)
```

### Length Extension Attack (LEA) Theory
SHA-1 is a Merkle-Damgård hash function. The output hash represents the internal state of the algorithm after processing the data.

- We know the state (the signature) after `SecretKey + Message` is processed
- We can initialize our own SHA-1 calculator with this state
- We can then process more data (e.g., `|admin=True`) and generate a new valid signature
- We do not need to know the SecretKey to do this; we only need to know its length

## 🔓 Exploit Strategy

### Parameter Injection
The server sets `admin=False` and `debug=0`. Most web parsers handle duplicate parameters by accepting the last value.

Therefore, we must append our malicious flags to the very end of the string.

**Target Payload:**
```
Original_Message + [Binary Padding] + |admin=True|debug=1
```

- `admin=True`: To gain admin privileges
- `debug=1`: To satisfy the "debug access" requirement

### The Unknown Variable (Key Length)
To calculate the correct padding, we need the total length of the data processed so far (Key Length + Message Length). Since we don't know the Key Length, we must brute-force it by trying lengths 1 through 64.

## 💻 Exploit Implementation

### Final Working Script

```python
import socket
import struct
import binascii
import time

# --- Configuration ---
HOST = '<REDACTED_HOST>'
PORT = <REDACTED_PORT>
KEY_LEN = 40  # Found via brute-force in previous steps

# Known data from recon (decoded from hex)
ORIGINAL_DATA = b"admin=true|admin=False|debug=0|uid=40"
ORIGINAL_SIG  = "<REDACTED_SIGNATURE>"

# Malicious payload to override settings
APPEND_DATA   = b"|admin=True|debug=1"

def get_sha1_padding(msg_len):
    """Calculates the binary padding SHA1 would add to a message."""
    bits = msg_len * 8
    padding = b'\x80'
    padding += b'\x00' * ((56 - (msg_len + 1) % 64) % 64)
    padding += struct.pack('>Q', bits)
    return padding

def sha1_extend(original_sig, append_data, original_len):
    """Manually calculates the new SHA1 signature by extending the state."""
    def _left_rotate(n, b):
        return ((n << b) | (n >> (32 - b))) & 0xffffffff

    # Load the original hash into the 5 registers
    h = [int(original_sig[i:i+8], 16) for i in (0, 8, 16, 24, 32)]
    
    # Calculate hypothetical total length (Key + Msg + Padding + Append)
    total_len = original_len + len(append_data)
    bits = total_len * 8
    padding = b'\x80'
    padding += b'\x00' * ((56 - (len(append_data) + 1) % 64) % 64)
    padding += struct.pack('>Q', bits)
    
    chunk = append_data + padding
    
    # Process the new chunk using SHA1 compression
    for i in range(0, len(chunk), 64):
        block = chunk[i:i+64]
        w = [0] * 80
        for j in range(16):
            w[j] = struct.unpack('>I', block[j*4:j*4+4])[0]
        for j in range(16, 80):
            w[j] = _left_rotate(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1)
        a, b, c, d, e = h
        for j in range(80):
            if 0 <= j <= 19: f = (b & c) | ((~b) & d); k = 0x5A827999
            elif 20 <= j <= 39: f = b ^ c ^ d; k = 0x6ED9EBA1
            elif 40 <= j <= 59: f = (b & c) | (b & d) | (c & d); k = 0x8F1BBCDC
            elif 60 <= j <= 79: f = b ^ c ^ d; k = 0xCA62C1D6
            temp = (_left_rotate(a, 5) + f + e + k + w[j]) & 0xffffffff
            e = d; d = c; c = _left_rotate(b, 30); b = a; a = temp
        h[0] = (h[0] + a) & 0xffffffff; h[1] = (h[1] + b) & 0xffffffff
        h[2] = (h[2] + c) & 0xffffffff; h[3] = (h[3] + d) & 0xffffffff
        h[4] = (h[4] + e) & 0xffffffff
    return '{:08x}{:08x}{:08x}{:08x}{:08x}'.format(*h)

def read_until(s, string):
    buffer = b""
    while string not in buffer:
        chunk = s.recv(1024)
        if not chunk: break
        buffer += chunk
    return buffer

def solve():
    print(f"[*] Connecting to {HOST}:{PORT}...")
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(5)
    s.connect((HOST, PORT))
    
    # 1. Login
    read_until(s, b"username:")
    s.sendall(b"guest\n")
    
    # 2. Select Option 2 (Read Message)
    read_until(s, b"Exit")
    s.sendall(b"2\n")
    
    # 3. Construct Payload
    print(f"[*] Generating payload for Key Length {KEY_LEN}...")
    orig_total_len = KEY_LEN + len(ORIGINAL_DATA)
    
    # Generate Padding
    padding = get_sha1_padding(orig_total_len)
    
    # Create new Message (Hex encoded)
    new_msg_bytes = ORIGINAL_DATA + padding + APPEND_DATA
    new_msg_hex = binascii.hexlify(new_msg_bytes)
    
    # Create new Signature
    new_sig = sha1_extend(ORIGINAL_SIG, APPEND_DATA, orig_total_len + len(padding))
    
    # 4. Send Payload
    read_until(s, b"message")
    s.sendall(new_msg_hex + b"\n")
    
    read_until(s, b"token")
    s.sendall(new_sig.encode() + b"\n")
    
    # 5. Get Flag
    response = s.recv(4096).decode(errors='ignore')
    print("\n" + "="*40)
    print(response.strip())
    print("="*40)
    s.close()

if __name__ == "__main__":
    solve()
```

## 🏆 Flag Capture

Running the script produced the following output:

```
[*] Connecting to <REDACTED_HOST>:<REDACTED_PORT>...
[*] Generating payload for Key Length 40...

========================================
CultRang{l3ngth_Extensi0n_@ttaCks}
========================================
```

**Flag:** `CultRang{l3ngth_Extensi0n_@ttaCks}`

## 🛡️ Key Takeaways

- **Use proper HMAC instead of naive MAC constructions**: HMAC is specifically designed to prevent length extension attacks
- **Length Extension Attacks exploit hash function internals**: Merkle-Damgård construction allows state manipulation
- **Always validate authentication mechanisms thoroughly**: Don't assume cryptographic security without proper implementation
- **Parameter injection can bypass access controls**: Last value wins in many parsers

## 🔧 Tools Used

- **Python**: Custom exploit script development
- **socket**: Network communication
- **struct/binascii**: Binary data manipulation
- **Manual SHA-1 implementation**: State extension calculation

## ⚠️ Mitigation

- Use proper HMAC implementation instead of naive concatenation
- Implement proper input validation and sanitization
- Use established cryptographic libraries rather than custom implementations
- Regular security audits of authentication mechanisms