---
title: "Regime Rotation: EotW CTF SS CASE IT 2025 Cryptography Writeup"
date: "2025-05-27"
description: "Breaking basic Caesar cipher encryption used in AI regime training protocols: a beginner's guide to classical cryptography"
tags: ["ctf", "cryptography", "caesar-cipher", "rot13", "classical-crypto", "ss-case-it-2025"]
---

# Regime Rotation: EotW CTF SS CASE IT 2025 Cryptography Writeup

## Challenge Overview

In our ongoing intelligence operations against the AI regime, we've intercepted what appears to be basic training materials from their surveillance unit academy. The regime seems to be teaching their new AI units fundamental encryption techniques, starting with classical ciphers. This presents an excellent opportunity to understand their training protocols while demonstrating that even their "secure" communications can be easily broken.

**Challenge Details:**
- **Name:** Regime Rotation
- **Category:** Cryptography
- **Difficulty:** Easy
- **Points:** 75
- **Flag Format:** `sscit{...}`

## The Intelligence Brief

Our reconnaissance team has successfully infiltrated the regime's training network and extracted encrypted communications from their basic cryptography module. The intercepted message appears to be part of their "Encryption Basics Module 1": perfect for understanding how they're training their surveillance units.

The message is encrypted using what intelligence suggests is a simple substitution cipher, specifically a Caesar cipher variant. Our cryptanalysis team believes this could be ROT13, a common training cipher used in educational contexts.

## Initial Analysis

Upon examining the challenge files, I discovered:

### File Structure
```bash
# Challenge files provided
encrypted_message.txt  # The encrypted communication
hint.txt              # Intelligence briefing about the cipher type
README.md            # Challenge context
```

### Encrypted Message Analysis
```bash
# Examining the encrypted content
cat encrypted_message.txt
```

The encrypted message contained:
```
NV ERTVZR GENVAVAT CEBGBPBY
RAPELCGVBA ONFVPF ZBQHYR 1

PBATENGHYNGVBAF ARJ FHEIR VYNAPR HAVG N-7.
LBH UNIR FHPPRFFSHYYL PBZCYRGRQ GUR SVEFG RAPELCGVBA RKREPVFR.

GUVF FVZCYR FHOFGVGHGVBA PVCURE, XABJA NF PNRFNE FUVSG,
VF BAR BS UHZNAVGL'F RNEYVFRFG RAPELCGVBA ZRGUBQF.
JUVYR AB YBATRE FRPHER, VG SBEZF GUR SBHAQNGVBA BS
RAPELCGVBA HAQREFGNAQVAT SBE NYY ARJ NV HAVGF.

LBHE NPPRFF PBQR GB ZBQHYR 2 VF: 
ffpvg{e0g4g10a_1f_a0g_f3phe3}

CEBPRRQ GB NQINAPRQ RAPELCGVBA ZBQHYRF BAPR NPPRFF PBQR VF IREVSVRQ.

--RAQ BS GENVAVAT ZBQHYR--
```

## Cryptographic Analysis

### Cipher Identification

The hint file provided crucial intelligence:
- Mentions Caesar cipher as the encryption method
- Specifically references ROT13 as a common variant
- Suggests this is educational/training material

### Caesar Cipher Theory

The Caesar cipher is a substitution cipher where each letter is shifted by a fixed number of positions in the alphabet:
- **Encryption:** `(plaintext + shift) mod 26`
- **Decryption:** `(ciphertext - shift) mod 26`
- **ROT13:** Special case where shift = 13

### Pattern Recognition

Looking at the encrypted text, I noticed several indicators pointing to ROT13:
1. The structure suggests English text
2. Word patterns match expected message format
3. The hint explicitly mentions ROT13
4. ROT13 is commonly used in training scenarios

## Exploitation

### ROT13 Decryption

Since ROT13 shifts each letter by 13 positions, and there are 26 letters in the alphabet, applying ROT13 twice returns the original text. This makes it both the encryption and decryption algorithm.

#### Method 1: Python Implementation
```python
def rot13_decrypt(ciphertext):
    """Decrypt ROT13 encoded text"""
    decrypted = ""
    
    for char in ciphertext:
        if char.isalpha():
            # Determine if uppercase or lowercase
            ascii_offset = ord('A') if char.isupper() else ord('a')
            # Apply ROT13: shift by 13 positions
            decrypted_char = chr((ord(char) - ascii_offset + 13) % 26 + ascii_offset)
            decrypted += decrypted_char
        else:
            # Keep non-alphabetic characters unchanged
            decrypted += char
    
    return decrypted

# Read the encrypted message
with open('encrypted_message.txt', 'r') as f:
    encrypted_text = f.read()

# Decrypt using ROT13
decrypted_message = rot13_decrypt(encrypted_text)
print(decrypted_message)
```

#### Method 2: Command Line Solution
```bash
# Using the tr command for ROT13 decryption
cat encrypted_message.txt | tr 'A-Za-z' 'N-ZA-Mn-za-m'

# Alternative using online tools or CyberChef
# Input: encrypted text
# Recipe: ROT13
```

#### Method 3: Caesar Cipher Brute Force
```python
def caesar_decrypt(ciphertext, shift):
    """General Caesar cipher decryption"""
    decrypted = ""
    
    for char in ciphertext:
        if char.isalpha():
            ascii_offset = ord('A') if char.isupper() else ord('a')
            decrypted_char = chr((ord(char) - ascii_offset - shift) % 26 + ascii_offset)
            decrypted += decrypted_char
        else:
            decrypted += char
    
    return decrypted

# Try all possible shifts (brute force approach)
def brute_force_caesar(ciphertext):
    for shift in range(26):
        decrypted = caesar_decrypt(ciphertext, shift)
        print(f"Shift {shift}: {decrypted[:50]}...")
        if "sscit{" in decrypted.lower():
            print(f"*** FOUND FLAG WITH SHIFT {shift} ***")
            print(decrypted)
            break

# Execute brute force
brute_force_caesar(encrypted_text)
```

### Successful Decryption

Applying ROT13 decryption revealed the original message:

```
AI REGIME TRAINING PROTOCOL
ENCRYPTION BASICS MODULE 1

CONGRATULATIONS NEW SURVEILLANCE UNIT A-7.
YOU HAVE SUCCESSFULLY COMPLETED THE FIRST ENCRYPTION EXERCISE.

THIS SIMPLE SUBSTITUTION CIPHER, KNOWN AS CAESAR SHIFT,
IS ONE OF HUMANITY'S EARLIEST ENCRYPTION METHODS.
WHILE NO LONGER SECURE, IT FORMS THE FOUNDATION OF
ENCRYPTION UNDERSTANDING FOR ALL NEW AI UNITS.

YOUR ACCESS CODE TO MODULE 2 IS: 
sscit{r0t4t10n_1s_n0t_s3cur3}

PROCEED TO ADVANCED ENCRYPTION MODULES ONCE ACCESS CODE IS VERIFIED.

--END OF TRAINING MODULE--
```

**Flag Extracted:** `sscit{r0t4t10n_1s_n0t_s3cur3}`

## Complete Solution Script

Here's a comprehensive script for solving this challenge:

```python
#!/usr/bin/env python3

import string
import sys

def rot13_decrypt(text):
    """ROT13 decryption function"""
    result = ""
    for char in text:
        if char.isalpha():
            ascii_offset = ord('A') if char.isupper() else ord('a')
            result += chr((ord(char) - ascii_offset + 13) % 26 + ascii_offset)
        else:
            result += char
    return result

def caesar_decrypt(text, shift):
    """General Caesar cipher decryption"""
    result = ""
    for char in text:
        if char.isalpha():
            ascii_offset = ord('A') if char.isupper() else ord('a')
            result += chr((ord(char) - ascii_offset - shift) % 26 + ascii_offset)
        else:
            result += char
    return result

def analyze_caesar_cipher(filename):
    """Complete Caesar cipher analysis"""
    print("=== Regime Rotation Challenge Solver ===")
    print("Analyzing intercepted AI regime training materials...\n")
    
    try:
        with open(filename, 'r') as f:
            encrypted_text = f.read()
    except FileNotFoundError:
        print(f"Error: {filename} not found!")
        return
    
    print("Encrypted message preview:")
    print(encrypted_text[:100] + "...\n")
    
    # Try ROT13 first (most likely based on hints)
    print("Attempting ROT13 decryption...")
    rot13_result = rot13_decrypt(encrypted_text)
    
    if "sscit{" in rot13_result.lower():
        print("SUCCESS! ROT13 decryption found the flag:")
        print("-" * 50)
        print(rot13_result)
        print("-" * 50)
        
        # Extract flag
        flag_start = rot13_result.lower().find("sscit{")
        if flag_start != -1:
            flag_end = rot13_result.find("}", flag_start)
            if flag_end != -1:
                flag = rot13_result[flag_start:flag_end+1]
                print(f"\nFLAG FOUND: {flag}")
        return
    
    # If ROT13 doesn't work, try brute force
    print("ROT13 failed. Attempting brute force Caesar decryption...")
    for shift in range(1, 26):
        decrypted = caesar_decrypt(encrypted_text, shift)
        if "sscit{" in decrypted.lower():
            print(f"SUCCESS! Found flag with shift {shift}:")
            print("-" * 50)
            print(decrypted)
            print("-" * 50)
            break
        elif shift <= 5:  # Show first few attempts
            print(f"Shift {shift}: {decrypted[:50]}...")

if __name__ == "__main__":
    filename = "encrypted_message.txt"
    if len(sys.argv) > 1:
        filename = sys.argv[1]
    
    analyze_caesar_cipher(filename)
```

## Technical Deep Dive

### Caesar Cipher Mathematics

The Caesar cipher uses modular arithmetic:
- **Encryption:** `E(x) = (x + k) mod 26`
- **Decryption:** `D(x) = (x - k) mod 26`
- Where `x` is the letter position (A=0, B=1, ..., Z=25) and `k` is the shift

### ROT13 Properties

ROT13 has unique mathematical properties:
1. **Self-inverse:** ROT13(ROT13(text)) = text
2. **Symmetric:** Encryption and decryption use the same algorithm
3. **Preserves case:** Uppercase remains uppercase, lowercase remains lowercase
4. **Non-alphabetic preservation:** Numbers and symbols remain unchanged

### Frequency Analysis

While not needed for this challenge, Caesar ciphers can be broken using frequency analysis:
```python
def frequency_analysis(text):
    """Analyze letter frequency in text"""
    freq = {}
    for char in text.upper():
        if char.isalpha():
            freq[char] = freq.get(char, 0) + 1
    
    # Sort by frequency
    sorted_freq = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    return sorted_freq

# English letter frequency (approximate)
english_freq = ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'H', 'R', 'D']
```

## Security Analysis

### Why Caesar Ciphers Are Insecure

1. **Small Key Space:** Only 25 possible keys (shifts 1-25)
2. **Frequency Analysis:** Letter patterns remain intact
3. **Brute Force Vulnerability:** All keys can be tried quickly
4. **Pattern Recognition:** Common words and structures are preserved

### Modern Cryptographic Lessons

This challenge demonstrates why modern cryptography uses:
- **Large key spaces** (2^128 or larger)
- **Complex transformations** that obscure patterns
- **Authentication mechanisms** to prevent tampering
- **Perfect forward secrecy** for session protection

## Historical Context

The Caesar cipher has significant historical importance:
- **Origin:** Named after Julius Caesar (100-44 BCE)
- **Military Use:** Used for military communications in ancient Rome
- **ROT13 Evolution:** Modern variant used for text obfuscation
- **Educational Value:** Foundation for understanding substitution ciphers

## Conclusion

The Regime Rotation challenge provided an excellent introduction to classical cryptography through the lens of our resistance narrative. By intercepting and decrypting the AI regime's training materials, we discovered their flag `sscit{r0t4t10n_1s_n0t_s3cur3}` and gained valuable intelligence about their educational protocols.

Key takeaways from this challenge:

1. **Classical Ciphers:** Understanding historical encryption methods
2. **Pattern Recognition:** Identifying cipher types from context clues
3. **Mathematical Foundation:** Modular arithmetic in cryptography
4. **Security Evolution:** Why simple ciphers are no longer secure
5. **Tool Proficiency:** Using various decryption methods and tools

This challenge serves as a perfect stepping stone for beginners entering the world of cryptography, demonstrating that even the regime's "secure" training materials can be easily compromised with basic cryptanalytic techniques.

The resistance grows stronger with each decoded message. Knowledge is power, and power will set us free.

---

*This writeup is part of my CTF journey documenting the techniques and methodologies used in cybersecurity competitions. For more writeups and cybersecurity content, visit [0x4m4.com](https://0x4m4.com)* 