# Operation Shadow Byte: Write-Up

> **Competition:** CYSC Campus CTF @ Al Hussein Technical University (HTU)  
> **Category:** Cryptography  
> **Difficulty:** Hard  
> **Author:** Abd Al-Rahman Jodeh

---

## Table of Contents

- [Challenge Overview](#challenge-overview)
- [Challenge Files](#challenge-files)
- [Solution](#solution)
  - [Step 1: Completing the Decoder Script](#step-1-completing-the-decoder-script)
  - [Step 2: Running the Script: XOR Decryption](#step-2-running-the-script--xor-decryption)
  - [Step 3: Decoding Base64](#step-3-decoding-base64)
  - [Step 4: Breaking the Vigenère Cipher](#step-4-breaking-the-vigenère-cipher)
  - [Step 5: Analyzing the Decoded Intelligence](#step-5-analyzing-the-decoded-intelligence)
  - [Step 6: Cracking the Hash](#step-6-cracking-the-hash)
- [Flag](#flag)
- [Skills Tested](#skills-tested)

---

## Challenge Overview

Neptune Security's Threat Intelligence Division intercepted an encoded payload from a hostile threat group's C2 server. A lead analyst began writing a decryption tool but was unable to finish it. Your mission is to complete the tool, peel back multiple layers of encoding, and recover the compromised credential.

Players are given three files:

| # | File                 | Purpose                                      |
|:-:|:---------------------|:---------------------------------------------|
| 1 | `scenario.md`        | Mission briefing containing narrative clues   |
| 2 | `decoder.py`         | Incomplete Python script with 4 blanks        |
| 3 | `intel_wordlist.txt`  | Threat intelligence wordlist (124 entries)     |

---

## Challenge Files

The challenge files are available in the [`challenge/`](challenge/) directory.

---

## Solution

### Step 1: Completing the Decoder Script

The provided `decoder.py` has four sections that need to be completed. The background text inside the script and the `scenario.md` file contain all the clues needed.

**Clue (from the script header and scenario):**
> *"The payload is hex-encoded and XOR-encrypted. The key is the operation name: no spaces, all lowercase."*

The operation is called **Shadow Byte**, so the XOR key is `shadowbyte`.

Here are the four completed sections:

```python
# SECTION 1: Convert the hex payload to raw bytes
raw_bytes = bytes.fromhex(encrypted_hex)

# SECTION 2: Set the XOR decryption key
xor_key = "shadowbyte"

# SECTION 3: XOR Decryption
for i in range(len(raw_bytes)):
    decrypted.append(raw_bytes[i] ^ key_bytes[i % len(key_bytes)])

# SECTION 4: Output the result
result = bytes(decrypted).decode()
print(result)
```

### Step 2: Running the Script: XOR Decryption

Running the completed script produces a long string that begins with:

```
PT09IFBWWEZNQlIgSUlYRSAtIENBWFJWUlhKR0lRIEdHWFhSUkdNUEUgPT09...
```

This is clearly **Base64-encoded** data (recognizable by the character set and trailing `=` padding).

### Step 3: Decoding Base64

Decoding the Base64 output reveals text that has correct structure (lines, colons, dashes, brackets) but the alphabetic characters are shifted/scrambled:

```
=== PVXFMBR IIXE - CAXRVRXJGIQ GGXXRRGMPE ===
Nnvtih: V2 Uhxuicmcpegmdg Mrviig
...
```

This pattern: structure preserved, letters shifted: is the hallmark of a **polyalphabetic substitution cipher**, specifically a **Vigenère cipher**.

### Step 4: Breaking the Vigenère Cipher

To find the Vigenère key, we look back at the clue from the scenario:

> *"One of them is locked with a key that bears our name."*

The script header identifies the organization as **NEPTUNE** Security. The Vigenère key is `NEPTUNE`.

Applying Vigenère decryption with key `NEPTUNE` produces the full plaintext:

```
=== CRIMSON VEIL - INTERCEPTED CREDENTIAL ===
Target: C2 Authentication Server
Password Structure: [GroupName]_[City][Year]
  - GroupName: The threat group designation (no spaces)
  - City: 5 letters, capitalized, contains 'ab' in the middle
  - Year: 4 digits, starts with 19
Salt: CYSTECH
Hash: cbb9245f6e49bbfe73f654a14abc3b962565334369a4cc7527b51a761192de9439d6ff0f0f2926d5d984cb7b58c87515cfd12d7144e4b5d857e4143710f6e488
Crack the hash. Submit flag as HTU{password}
==============================================
```

### Step 5: Analyzing the Decoded Intelligence

From the plaintext, we extract the following:

| Field              | Value                                                        |
|:-------------------|:-------------------------------------------------------------|
| **Password Format** | `[GroupName]_[City][Year]`                                   |
| **GroupName**        | The threat group: `CrimsonVeil` (from the scenario)          |
| **City**            | 5 letters, capitalized, contains `ab` in the middle          |
| **Year**            | 4 digits, starts with `19`                                   |
| **Salt**            | `CYSTECH`                                                    |
| **Hash**            | `cbb9245f...6e488` (128 hex chars = **SHA-512**)             |

**Hash identification:** 128 hexadecimal characters = 512-bit digest = **SHA-512**.  
Since a salt is involved, the hash format is `SHA-512($pass.$salt)`, which maps to:
- **Hashcat mode:** `-m 1710`
- **John the Ripper:** `--format=dynamic_82`

### Step 6: Cracking the Hash

We can crack the hash using either a **mask attack** or a **hybrid attack**.

#### Option A: Mask Attack (if you've identified the password structure)

The password mask based on the clues is `CrimsonVeil_?u?lab?l19?d?d`:

```bash
# Prepare the hash file (format: hash:salt)
echo "cbb9245f6e49bbfe73f654a14abc3b962565334369a4cc7527b51a761192de9439d6ff0f0f2926d5d984cb7b58c87515cfd12d7144e4b5d857e4143710f6e488:CYSTECH" > hash.txt

# Run hashcat with mask attack
hashcat -m 1710 hash.txt -a 3 "CrimsonVeil_?u?lab?l19?d?d"
```

Where the mask characters mean:
- `?u`: uppercase letter (A-Z)
- `?l`: lowercase letter (a-z)
- `?d`: digit (0-9)

#### Option B: Hybrid Attack (using the provided wordlist)

The `intel_wordlist.txt` contains `CrimsonVeil_` as one of its entries (line 67). Using hashcat's hybrid mode:

```bash
hashcat -m 1710 hash.txt -a 6 intel_wordlist.txt "?u?lab?l19?d?d"
```

Both methods recover the password: **`CrimsonVeil_Aqaba1967`**

---

## Flag

```
HTU{CrimsonVeil_Aqaba1967}
```

---

## Skills Tested

This challenge tests a combination of skills across multiple domains:

| Domain              | Skill                                                      |
|:--------------------|:-----------------------------------------------------------|
| **Programming**      | Reading and completing Python code                         |
| **Cryptography**     | XOR decryption, Base64 decoding, Vigenère cipher analysis  |
| **Hash Cracking**    | SHA-512 identification, salted hash cracking with Hashcat  |
| **OSINT / Analysis** | Extracting clues from narrative text to derive keys         |
| **Problem Solving**  | Multi-layered decryption pipeline requiring methodical work |

---

## Encryption Chain Summary

```
Hex Payload
    │
    ▼
XOR Decrypt (key: "shadowbyte")
    │
    ▼
Base64 Decode
    │
    ▼
Vigenère Decrypt (key: "NEPTUNE")
    │
    ▼
Plaintext Intelligence Report
    │
    ▼
SHA-512 Salted Hash Crack (salt: "CYSTECH")
    │
    ▼
Flag: HTU{CrimsonVeil_Aqaba1967}
```

---

*Write-up by Abd Al-Rahman Jodeh: Author of Operation Shadow Byte*  
*CYSC Campus CTF: Al Hussein Technical University (HTU)*
