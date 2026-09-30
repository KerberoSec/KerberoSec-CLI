# The Island Prison Escape

**Category:** Forensics / Steganography  
**Difficulty:** Medium  
**Platform:** CultRang 2026  
**Objective:** Repair corrupted file, extract hidden data, and decode Morse cipher to escape the island prison

## 🎯 Challenge Description

You are trapped in an island prison. To escape, a sailor demands a secret code. You possess a mysterious file called `hexbook` whose first 13 blocks are ciphered. A painting on the wall hints:

*"Samuel Morse hid the flag in an image in an image all in jpg. Some people might know about rot13."*

## 🔍 Step 1: The Hexbook Mystery (Analysis & Repair)

The challenge provides a file (`hexbook.txt`) that appears to be a text dump of hexadecimal values. Standard image viewers cannot open it.

### Analysis
We inspect the file content. The hint mentions "ROT13" and that the "first 13 blocks are ciphered." A standard JPEG file usually begins with the Magic Bytes: `FF D8 FF E0` followed by the ASCII identifier `JFIF` (`4A 46 49 46`).

When we check the file, these bytes are scrambled. The hint suggests applying ROT13 (a substitution cipher shifting characters by 13 places) to the header.

### Editing the File
We need to manually edit the hex strings to restore the JPEG header.

**Command:** `hexedit hexbook.txt` (or use any text editor like nano or vim since the file is text-based)

**The Fix:** We replace the corrupted start bytes with the standard JPEG header bytes:
```
Hex: FF D8 FF E0 00 10 4A 46 49 46 00 01 01
```
*(Note: 4A 46 49 46 corresponds to the ASCII "JFIF")*

### Converting Hex to Binary
Once the text file has the correct header, we must convert this "hex text" into a real binary image file (.jpg). We use the `xxd` tool with the `-r` (reverse) and `-p` (plain) flags.

```bash
xxd -r -p hexbook.txt fixed.jpg
```

- `hexbook.txt`: The input text file containing hex digits
- `fixed.jpg`: The output binary image

We verify the file type using the `file` command:

```bash
file fixed.jpg
# Output: fixed.jpg: JPEG image data, JFIF standard 1.01...
```

**Success!** We have a valid image of a painting.

## 🖼️ Step 2: The Sailor's Secret (Steganography)

The clue "image in an image... passphrase is 123" points directly to Steganography. We use Steghide to extract hidden data from our newly fixed image.

```bash
steghide extract -sf fixed.jpg -p 123
```

- `-sf`: Select File (Source)
- `-p`: Passphrase

**Result:** Steghide extracts a new file named `paintingsteg.jpg`. Wait, another image? The clues said "image in an image." We must check this new image for the flag.

### Second Extraction
We run Steghide again on the new file (or check if flag.txt was dropped directly).

```bash
steghide extract -sf paintingsteg.jpg -p 123
# Output: wrote extracted data to "flag.txt".
```

## 🔐 Step 3: Decrypting the Message

We examine the contents of the extracted text file.

```bash
cat flag.txt
```

**Output:**
```
.--. .... -.-- --. . -. .- -{.--. ----- .- - . .--.-. --. .... -.-- .--.-. --. -.-.-- ----- .- ..... -.-. -...- ----- -.-. -.-- -...-}
```

### Decoding Morse Code
Using a Morse code chart, we translate the dots and dashes:

- **Outer text:** `PHYGENAT`
- **Inner text:** `P0ATE@GHY@G!0A5C=0CY=`

**Result:** `PHYGENAT{P0ATE@GHY@G!0A5C=0CY=}`

### The Final Cipher (ROT13)
The flag doesn't look quite right yet. Recall the hint: "Some people might know about rot13." We apply ROT13 to the letters in our decoded string.

```
PHYGENAT → CULTRANG
P → C
G → T
(Numbers and symbols like @, !, 0 remain unchanged)
```

**Final Calculation:**
```
PHYGENAT{P0ATE@GHY@G!0A5C=0CY=}
↓ ROT13 ↓
CultRang{C0NGR@TUL@T!0N5P=0PL=}
```

## 🏆 Flag Capture

**Flag:** `CultRang{C0NGR@TUL@T!0N5P=0PL=}`

## 💻 Terminal Walkthrough

Below are the actual logs from the solving process:

```bash
# 1. Checking the corrupted file (It's a text file with hex strings)
┌──(heisenberg㉿vbox)-[~/Downloads]
└─$ head hexbook.txt 
# (Shows corrupted hex strings...)

# 2. Converting the corrected hex text into a binary JPG
# We used 'xxd -r -p' (reverse plain hex dump)
┌──(heisenberg㉿vbox)-[~/Downloads]
└─$ xxd -r -p hexbook.txt fixed.jpg

# 3. Verifying the header is now valid
┌──(heisenberg㉿vbox)-[~/Downloads]
└─$ xxd fixed.jpg | head
00000000: ffd8 ffe0 0010 4a46 4946 0001 0101 0048  ......JFIF.....H
# (The 'JFIF' confirms the file structure is fixed)

# 4. Extracting the hidden data
┌──(heisenberg㉿vbox)-[~/Downloads]
└─$ steghide --extract -sf fixed.jpg -p 123
wrote extracted data to "paintingsteg.jpg".

# 5. Extracting the second layer (The flag file)
┌──(heisenberg㉿vbox)-[~/Downloads]
└─$ steghide --extract -sf paintingsteg.jpg -p 123
wrote extracted data to "flag.txt".

# 6. Reading the Morse Code
┌──(heisenberg㉿vbox)-[~/Downloads]
└─$ cat flag.txt                  
.--. .... -.-- --. . -. .- -{.--. ----- .- - . .--.-. --. .... -.-- .--.-. --. -.-.-- ----- .- ..... -.-. -...- ----- -.-. -.-- -...-}

# 7. Final Decoding (Using Python or online tools for ROT13)
# Decoded Morse: PHYGENAT{P0ATE@GHY@G!0A5C=0CY=}
# Applied ROT13: CultRang{C0NGR@TUL@T!0N5P=0PL=}
```

## 🛡️ Key Takeaways

- **File format corruption can hide steganographic content**: Always check magic bytes and headers
- **Multi-layer hiding increases challenge complexity**: Be prepared for nested extraction
- **Classic ciphers like ROT13 and Morse are still relevant** in modern CTF challenges
- **Steganography tools like steghide are essential** for image-based forensics challenges
- **Hex editing skills are crucial** for file format manipulation and repair

## 🔧 Tools Used

- **xxd**: Hex dump and reverse operations
- **hexedit**: Manual hex editing
- **steghide**: Steganography extraction
- **file**: File type identification
- **Morse code decoder**: Manual or online tools
- **ROT13 decoder**: Caesar cipher with 13-character shift

## ⚠️ Mitigation

- Implement proper file validation and integrity checks
- Use strong steganographic passwords and multiple layers of security
- Regular audits of file upload and processing systems
- Educate users about information hiding techniques