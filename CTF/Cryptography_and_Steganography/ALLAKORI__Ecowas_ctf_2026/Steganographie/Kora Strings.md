# 🎵 Kora: Steganography Writeup

![CTF](https://img.shields.io/badge/CTF-Ecowas-blue) ![Category](https://img.shields.io/badge/Category-Stego-green) ![Difficulty](https://img.shields.io/badge/Difficulty-Medium-orange)

---

## 📜 Description

> *Find the note hidden in the song’s notes.*

We are given a WAV audio file named `kora.wav`.

---

## 📂 Initial Analysis

### 🔍 File Identification

```bash
file kora.wav
```

```
RIFF (little-endian) data, WAVE audio, Microsoft PCM, 16 bit, mono 8000 Hz
```

```bash
ffprobe kora.wav
```

* Standard WAV file
* PCM encoding
* No obvious anomalies

---

### 🧪 Basic Checks

```bash
binwalk kora.wav
```

→ No embedded files

```bash
steghide info kora.wav
```

→ No extractable data without passphrase

---

### 🧠 Key Observation (Metadata)

```bash
exiftool kora.wav
```

```
Comment : the string is tuned to 0x5B
```

👉 **Critical hint: `0x5B`**

---

## 🔍 Strings Analysis

```bash
strings kora.wav
```

Interesting output:

```
LIST(
INFOICMT
the string is tuned to 0x5B
flag)
84,:( 
 0k)o
(/)j5<(
9"/h
0j77&
```

---

## ⚠️ Important Insight

At first glance, it looks like encoded text.

However:

* `strings` only shows **printable characters**
* Non-printable bytes are **hidden**
* So this output is **incomplete**

👉 We cannot reconstruct the full flag from this alone.

---

## 🧩 Understanding WAV Structure

A WAV file follows the **RIFF format**, composed of chunks:

```
[Chunk ID (4 bytes)] [Size (4 bytes)] [Data]
```

From `strings`, we see:

```
flag)
```

👉 Interpretation:

* `flag` = chunk ID
* `)` = ASCII `0x29`

So the chunk is:

```
flag + 0x29 00 00 00
```

👉 Size = **41 bytes**

💥 This means:

> There is a **hidden custom chunk named `flag`** inside the WAV file.

---

## 🛠️ Extracting the Hidden Chunk

We parse the WAV file manually to locate and extract the `flag` chunk.

### 🐍 Script

```python
from pathlib import Path
import struct

b = Path("kora.wav").read_bytes()

assert b[:4] == b"RIFF" and b[8:12] == b"WAVE"

pos = 12

while pos + 8 <= len(b):
    cid = b[pos:pos+4]
    size = struct.unpack("<I", b[pos+4:pos+8])[0]
    data = b[pos+8:pos+8+size]

    print(f"chunk={cid!r} size={size}")

    if cid == b"flag":
        print("RAW HEX   :", data.hex())

        decoded = bytes(c ^ 0x5B for c in data)

        print("XOR HEX   :", decoded.hex())
        print("XOR TEXT  :", decoded.decode('latin1'))
        break

    pos += 8 + size + (size % 2)
```

---

## 🔓 Decoding

The hint told us:

```
the string is tuned to 0x5B
```

👉 Apply XOR with `0x5B`:

```python
decoded = bytes(c ^ 0x5B for c in data)
```

---

## 🎯 Result

```
EcowasCTF{k0r4_str1ngs_x0r_0n3_byt3_k1ll}
```

---

## 🚩 Final Flag

```
EcowasCTF{k0r4_str1ngs_x0r_0n3_byt3_k1ll}
```

---

## 💡 Key Takeaways

* WAV files can contain **custom RIFF chunks**
* `strings` output is often **misleading/incomplete**
* Always analyze the **file structure**, not just the content
* Hints like `0x5B` often indicate simple operations like **XOR**
* When nothing works:

  > 👉 **Parse the format manually**

---

## 🧠 Technique Summary

```
RIFF Parsing → Extract Custom Chunk → XOR Decode → Flag
```

---

## 🔥 Difficulty Notes

* Medium difficulty
* Trick: Misleading audio + `strings`
* Real solution: **Structure-based analysis**

---

## 🏁 Conclusion

This challenge highlights an important lesson in steganography:

> **Not everything is hidden in the data itself: sometimes it's hidden in the structure.**

---

💀 *Trust the format, not the noise.*
