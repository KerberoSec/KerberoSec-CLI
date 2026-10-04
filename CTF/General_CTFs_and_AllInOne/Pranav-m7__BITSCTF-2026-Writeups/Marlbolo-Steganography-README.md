# MArlboro: Steganography Challenge

## Challenge Overview
A multi-layered forensics and steganography challenge involving hidden data extraction, cryptographic decryption, and esoteric programming language execution.

**Category:** Forensics / Cryptography / Esoteric  
**Difficulty:** Hard

---

## Solution Walkthrough

### Step 1: Initial Reconnaissance & String Analysis
We began by analyzing the initial image for hidden text and base64 encoded strings.

```bash
strings -n 10 Marlboro.jpg
```

This revealed a base64 string which decodes to the Malbolge interpreter link: https://zb3.me/malbolge-tools/

![Strings Output]()
(*[Image: Alt text description here]*)

(*[Image: description]*)
---

### Step 2: Payload Extraction
Used `binwalk` to carve out nested files hidden within the original image.

```bash
binwalk --dd='.*' Marlboro.jpg
```

(*[Image: description]*)
*Image 2: binwalk command execution*

After extracting the nested archives, we recovered the core challenge files.

(*[Image: description]*)
*Image 3: Extracted zip file folder containing encrypted.bin and smoke.png*
(*[Image: description]*)
---

### Step 3: Steganographic Key Recovery
Ran LSB analysis on the extracted `smoke.png` to find hidden configuration parameters.

```bash
zsteg smoke.png
```

**Extracted XOR Key:** `c7027f5fdeb20dc7308ad4a6999a8a3e069cb5c8111d56904641cd344593b657`

(*[Image: description]*)
*Image 4: zsteg smoke.png output showing the XOR key*

---

### Step 4: Cryptographic Decryption
Loaded `encrypted.bin` into CyberChef. Applied the XOR recipe using the hex key recovered in Step 3. The output revealed obfuscated source code written in **Malbolge** (the "programming language from hell").

the output of cyberchef from puting encrypted.bin as input file and using xo with the key we just got give malbolge code.

---

### Step 5: Esoteric Code Execution
Taking the decrypted Malbolge payload from CyberChef, we navigated to the interpreter link recovered in Step 1.

(*[Image: description]*)
*Image 6: zb3.me Malbolge interpreter link with the decrypted code pasted*

Executing the code within the interpreter successfully compiled and ran the payload, outputting the plaintext flag.

(*[Image: description]*)
*Image 7: Output of the Malbolge tool displaying the final flag*

---

## The Flag
```
BITSCTF{d4mn_y0ur_r34lly_w3n7_7h47_d33p}
```

---

## Tools Used
- `strings` - String extraction
- `binwalk` - File carving
- `zsteg` - LSB steganography analysis
- CyberChef: Cryptographic operations
- Malbolge Interpreter: Esoteric code execution

## Key Techniques
- Steganography (LSB analysis)
- File carving
- XOR decryption
- Esoteric programming language (Malbolge)

---

*Writeup by Pranvvv*
