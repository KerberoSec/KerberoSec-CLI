# outXORcing CTF Challenge Writeup

## Overview
This challenge provides an ELF binary named `access-control` that implements an XOR-based password check. Our goal is to reverse-engineer the binary, extract the encrypted flag, identify the XOR key, and then decrypt the flag.

## Steps

### 1. Extract Strings from the Binary
First, run the `strings` command on the binary to inspect human-readable content:
```bash
strings access-control
```
Look for any suspicious strings or clues. In this challenge, you will notice lines like:
```
...
jens_myrH
...
enc_password
...
XOR result in hex:
%02x
XOR result as string: %s
...
```
The string `jens_myrH` hints at the XOR key used in the decryption process.

### 2. Identify the XOR Key and Encrypted Flag via Disassembly
Using tools like `objdump` and `nm`, you can locate the function responsible for decryption (often named `enc_password`). In our analysis, we found:
- The key used is `"jens_myrup"`. (Notice the assembly code that loads `jens_myr` and `"up"` into registers.)
- An encrypted flag is stored as a series of hexadecimal bytes.

For example, the encrypted flag bytes (as extracted from the disassembly) are:
```c
unsigned char encrypted_flag[] = {
    0x2e, 0x21, 0x2d, 0x08, 0x27, 0x5d, 0x0b, 0x2d,
    0x1c, 0x03, 0x35, 0x17, 0x5d, 0x05, 0x6c, 0x1f,
    0x0a, 0x1b, 0x17, 0x1c, 0x59, 0x18
};
```
The XOR key is:
```
jens_myrup
```

### 3. Decrypt the Flag Using a Python Script
Create a Python script (or simply run it in your interpreter) to perform the XOR decryption. Copy and paste the following code:

```python
#!/usr/bin/env python3

# Encrypted flag bytes as extracted from the binary
encrypted_flag = [
    0x2e, 0x21, 0x2d, 0x08, 0x27, 0x5d, 0x0b, 0x2d,
    0x1c, 0x03, 0x35, 0x17, 0x5d, 0x05, 0x6c, 0x1f,
    0x0a, 0x1b, 0x17, 0x1c, 0x59, 0x18
]

# XOR key discovered from the binary
xor_key = "jens_myrup"

# Decrypt by XORing each byte with the repeating key
decrypted_flag = "".join(chr(b ^ ord(xor_key[i % len(xor_key)]))
                         for i, b in enumerate(encrypted_flag))

print("Decrypted flag:", decrypted_flag)
```

Make the script executable:
```bash
chmod +x decrypt_flag.py
```

And then run it:
```bash
./decrypt_flag.py
```

### 4. Retrieve the Flag
Running the above script will output:
```
Decrypted flag: DDC{x0r_is_r3v3rsibl3}
```

## Conclusion
By following the steps:
1. **Inspecting the binary** with `strings`.
2. **Locating the decryption function** (`enc_password`) and identifying the XOR key.
3. **Extracting the encrypted flag bytes** from the disassembly.
4. **Writing a Python script** to XOR-decrypt the flag,

you retrieve the flag:
```
DDC{x0r_is_r3v3rsibl3}
```
