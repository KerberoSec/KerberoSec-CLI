
# Writeup: Griot Song (Misc): EcowasCTF

## Challenge Overview
* **Category:** Misc / Steganography
* **Points:** 200
* **Description:** A griot’s song, passed down through generations. Let’s sing it!
* **Attachment:** `song.txt`

## 1. Initial Analysis
The file `song.txt` contains 18 lines of poetry. A quick check of the file properties reveals an anomaly:
```bash
$ file song.txt
song.txt: Unicode text, UTF-8 text

$ ls -l song.txt
-rw-rw-r-- 1 kali kali 1012 Apr 17 06:56 song.txt
```
The file size is **1012 bytes**, which is significantly larger than the visible text content (~500 bytes). This indicates hidden data within the UTF-8 encoding.

## 2. Information Gathering
Using `cat -A` to visualize non-printable characters reveals a dense string of hidden Unicode characters on the 4th line:

```bash
$ cat -A song.txt | head -n 4
Elders sing of golden thrones,$
cradles rocked under mango trees,$
old rivers carve the red earth deep,$
wind through thM-bM-^@M-^KM-bM-^@M-^LM-bM-^@M-^LM-bM-^@M-^KM-bM-^@M-^LM-bM-^@M-^LM-...
```

The sequences `M-bM-^@M-^K` and `M-bM-^@M-^L` correspond to:
* **U+200B** (Zero Width Space)
* **U+200C** (Zero Width Non-Joiner)

This is a classic **Zero-Width Steganography** technique where binary data is encoded using invisible characters.

## 3. Exploitation

### Part A: The Acrostic
Reading the first letter of each line (Acrostiche) provides the flag prefix and the beginning of the inner content:
Lines 1-9: `EcowasCTF`
Line 10: `{`
Lines 11-18: `gr10t_s1`

**Current string:** `EcowasCTF{gr10t_s1`

### Part B: Binary Extraction
A Python script was used to extract the hidden Unicode characters and convert them into a binary string ($U+200B \rightarrow 0$, $U+200C \rightarrow 1$):

```python
import re

# Read file in binary mode
data = open('song.txt', 'rb').read()

# Extract Zero-Width characters (UTF-8: e2 80 8b and e2 80 8c)
hidden = re.findall(b'\xe2\x80[\x8b-\x8c]', data)

# Convert to binary string
binary = ''.join(['0' if x == b'\xe2\x80\x8b' else '1' for x in hidden])
print(binary)
```
**Output:** `011011100110011100110101010111110110100101101110010111110111101000110011011100100011000001011111011101110011000101100100011101000110100001111101`

### Part C: Decoding
Converting the 144-bit binary string to ASCII (8-bit blocks) results in:
`01101110` (n), `01100111` (g), `00110101` (5), `01011111` (_), ... `01111101` (})

**Decoded string:** `ng5_in_z3r0_w1dth}`

## 4. Final Flag
By merging the acrostic prefix and the decoded hidden string, we reconstruct the full flag:

**Flag:** `EcowasCTF{gr10t_s1ng5_in_z3r0_w1dth}`
