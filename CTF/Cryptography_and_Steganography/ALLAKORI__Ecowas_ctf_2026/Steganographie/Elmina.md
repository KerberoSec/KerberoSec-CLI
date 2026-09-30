# 🏰 Elmina: Advanced Steganography Writeup

![CTF](https://img.shields.io/badge/CTF-Ecowas-blue)
![Category](https://img.shields.io/badge/Category-Steganography-green)
![Difficulty](https://img.shields.io/badge/Difficulty-Medium-orange)
![Techniques](https://img.shields.io/badge/Techniques-LSB%20%7C%20PNG%20Chunks%20%7C%20XOR-red)

---

## 📜 Description

> *"Echoes from the castle walls. The past speaks in layers."*

We are given a PNG image (`elmina.png`) and must recover the hidden flag.

---

## 🧠 Challenge Overview

This challenge is a **multi-layer steganography problem** designed to:

- Mislead with **multiple fake flags**
- Force analysis beyond standard tools
- Require understanding of **PNG internal structure**
- Apply a **known-plaintext XOR attack**

---

## 📂 Initial Reconnaissance

```bash
file elmina.png
exiftool elmina.png
```

### 🔍 Key Findings

- Standard PNG (800x600)
- Suspicious metadata:

```text
Software : StegWriter v2.1 (LSB-Red)
Warning  : Trailer data after PNG IEND chunk
Comment  : (Base64 encoded message)
```

---

## 🔐 Step 1: Decode Metadata Hint

```bash
echo "<base64>" | base64 -d
```

Output:

```text
Nice try! The flag isn't hiding in the metadata...
```

### 🧠 Insight

👉 Metadata is a **decoy layer**

---

## 🧱 Step 2: Hidden Data After IEND

```bash
binwalk elmina.png
binwalk -e elmina.png
```

### 📦 Extracted Content

```text
secret/readme.txt
```

```text
But the real flag isn't here either. This is just another layer.
```

### ⚠️ Conclusion

👉 Hidden archive = **intentional misdirection**

---

## 🧪 Step 3: Basic String Analysis

```bash
strings elmina.png | grep -i flag
```

Output:

```text
EcowasCTF{n0p3_but_lik4_flying_false}
```

### 🚩 Observation

- Contains "n0p3" → clearly a **fake flag**

---

## 🧠 Step 4: LSB Steganography Check

```bash
zsteg elmina.png
```

Output:

```text
"Almost there! But this isn't the flag..."
```

### ⚠️ Conclusion

👉 Even LSB steganography is a **decoy**

---

## 🚨 Step 5: Critical Hint

From the challenge:

> **"Sometimes the answer is in the structure itself."**

### 🧠 Interpretation

👉 Stop looking at:
- pixels ❌
- metadata ❌
- appended data ❌

👉 Start analyzing:
- **PNG internal structure**

---

## 🧩 Step 6: PNG Structure Analysis

```bash
pngcheck -v elmina.png
```

### 🔍 Important Discovery

```text
chunk ecWs
chunk stEg
```

### 🧠 Reasoning

| Chunk | Status |
|------|--------|
| stEg | Already used (fake ZIP) |
| ecWs | Unexplored → highly suspicious |

👉 **ecWs is the real target**

---

## 🎯 Step 7: Extract Custom Chunks

```bash
python3 - <<'PY'
from pathlib import Path
import struct

data = Path("elmina.png").read_bytes()
pos = 8

while pos < len(data):
    length = struct.unpack(">I", data[pos:pos+4])[0]
    ctype = data[pos+4:pos+8].decode("latin1")
    chunk_data = data[pos+8:pos+8+length]

    if ctype in ("ecWs", "stEg"):
        Path(f"{ctype}.bin").write_bytes(chunk_data)

    pos += 12 + length
    if ctype == "IEND":
        break
PY
```

---

## 🔍 Step 8: Analyze `ecWs` Chunk

```bash
xxd -p ecWs.bin
```

Output:

```text
200f021e0f1226382b125d0d085d035d...
```

### 🧠 Interpretation

- Not ASCII
- Not Base64
- Likely **XOR-encrypted**

---

## 🔐 Step 9: XOR Known Plaintext Attack

### 🧠 Strategy

We assume:

```text
EcowasCTF{...}
```

### 🔑 Key Recovery

```text
cipher ⊕ "EcowasCTF{" → repeating key
```

Recovered key:

```text
elmina
```

### 🧠 Why this works

- Known flag format
- Short repeating XOR key
- Context (challenge name = Elmina)

---

## ⚡ Step 10: Decryption

```bash
python3 - <<'PY'
data = bytes.fromhex("200f021e0f1226382b125d0d085d035d3102511f19055d3e0d5d090d5d0f3a0f051c000a5011")
key = b"elmina"

pt = bytes(b ^ key[i % len(key)] for i, b in enumerate(data))
print(pt.decode())
PY
```

---

## 🏁 Final Flag

```text
EcowasCTF{3lm1n4_c4stl3_h1dd3n_chunk5}
```

---

## 🧠 Exploitation Workflow (Reusable)

```text
1. Initial recon (file, exiftool)
2. Decode metadata hints
3. Extract appended data (binwalk)
4. Validate flags (detect decoys)
5. Test LSB (zsteg)
6. Analyze file structure (pngcheck)
7. Identify anomalies (custom chunks)
8. Extract raw chunk data
9. Detect encoding/encryption
10. Apply XOR known-plaintext attack
```

---

## 🔥 Key Takeaways

- 🧱 Stego challenges often include **multiple deception layers**
- 🧠 Do NOT trust early results blindly
- 🖼️ PNG custom chunks are **high-value targets**
- 🔐 XOR is extremely common in CTF encoding
- 🧭 Context (challenge name, theme) is often the key
- 🎯 Known-plaintext attacks are **powerful and fast**

---

## 🧠 Final Insight

> This challenge is not about tools: > it’s about **decision-making under uncertainty**.

The real skill is:

- ignoring noise
- identifying signal
- and knowing **when to go deeper**

---

## 👨‍💻 Author Notes

- Environment: Kali Linux
- Tools used: `binwalk`, `zsteg`, `pngcheck`, `xxd`, `python`
- Time to solve: ~Medium difficulty (multi-layer analysis)

---

## 🏆 Flag

```
EcowasCTF{3lm1n4_c4stl3_h1dd3n_chunk5}
```
