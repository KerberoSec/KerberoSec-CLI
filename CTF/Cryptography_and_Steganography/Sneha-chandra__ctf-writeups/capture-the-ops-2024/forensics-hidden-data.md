# Forensics: Hidden in Plain Sight

**Category:** Digital Forensics / Steganography  
**Points:** 300  
**Difficulty:** Medium  
**Tools:** binwalk, strings, steghide, exiftool

---

## Challenge Description

> "This image is not what it seems. Look deeper."

A JPEG file (`challenge.jpg`) was provided.

---

## Approach

### Step 1: Basic File Analysis

```bash
file challenge.jpg
# challenge.jpg: JPEG image data, JFIF standard 1.01

exiftool challenge.jpg
# Nothing suspicious in EXIF metadata
```

### Step 2: Check for Hidden Strings

```bash
strings challenge.jpg | grep -i "ctf\|flag\|key\|secret"
# No hits
```

### Step 3: Check for Embedded Files (Binwalk)

```bash
binwalk challenge.jpg
```

Output:
```
DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             JPEG image data, JFIF standard 1.01
45182         0xB07E          Zip archive data, at least v2.0 to extract
```

A ZIP file embedded inside the JPEG.

```bash
binwalk -e challenge.jpg
# Extracts to _challenge.jpg.extracted/
ls _challenge.jpg.extracted/
# B07E  B07E.zip  secret.txt
cat secret.txt
# passphrase: amity2024
```

### Step 4: Steganography Extraction

With a passphrase found, tried steghide:

```bash
steghide extract -sf challenge.jpg -p amity2024
# Wrote extracted data to "flag.txt"
cat flag.txt
# CTF{st3g0_ftw_2024}
```

---

## Flag

```
CTF{st3g0_ftw_2024}
```

---

## Key Takeaway

**Forensics checklist for images:**
1. `file`: confirm file type
2. `exiftool`: check EXIF metadata
3. `strings | grep -i flag`: quick string scan
4. `binwalk`: detect embedded files
5. `steghide` / `stegsolve`: steganographic data
6. `zsteg`: for PNG-specific steganography

The hardest part here was finding the passphrase (inside the embedded zip). Always extract embedded archives before trying steghide.
