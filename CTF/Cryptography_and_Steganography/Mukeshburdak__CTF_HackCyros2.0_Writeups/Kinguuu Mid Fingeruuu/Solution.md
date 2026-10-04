# 👁️ CTF Writeup: Kinguuu Mid Fingeruuu (Reverse Engineering)

> *"Don't believe in root{}: That's ancient mythology. Real curse energy runs on cyros{} 💀"*

| Field | Details |
|-------|---------|
| **Challenge** | Kinguuu Mid Fingeruuu |
| **Category** | Reverse Engineering |
| **Points** | 600 |
| **Flag** | `cyros{jjkr3f3r3nc354r3fun}` |

---

## 🧠 TL;DR

A PNG hides an ELF binary and an encrypted PDF. The binary teases structure; the PDF holds the real cipher. JJK lore gives you the password (**20 fingers = full power**) and the XOR key (**Six Eyes + Nine Ropes = 69**). Decrypt `root{}` → swap to `cyros{}` → flag.

---

## 🔍 Step-by-Step Walkthrough

### Step 1: Steganography: What's Inside the PNG?

The challenge image looks innocent, but its file size is suspiciously large. A hex dump reveals data well beyond the PNG `IEND` marker.

```bash
binwalk -e challenge.png
```

Three hidden artifacts are extracted:

| Artifact | Type | Contents |
|----------|------|----------|
| Base64 string | Encoded text | A cryptic clue |
| `6D0C` | ELF binary | Interactive executable |
| `document.pdf` | PDF | Password-protected, holds the cipher |

Decoding the Base64 string:

```bash
echo "<base64_string>" | base64 -d
# Output: _CAN_ONLY_UNLOCK_ME_WHEN_I_AM_AT_MY_FULL_POWER
```

> 💡 **Hint parsed:** "Full power": in JJK lore, Sukuna reaches full power after consuming **all 20 fingers**.

---

### Step 2: Binary Analysis: ELF `6D0C`

Running the binary prompts for "test cases":

```
$ ./6D0C
Enter test case: 16
[!] Retrial
Enter test case: 4
[*] xQ#mZp...
Enter test case: 9
[*] aR7$Lw...
```

Loading into **Ghidra** reveals two key functions:

**`kitne_fingers()`**
```c
// Returns a string hinting at the challenge title
return "THE MIDDLE ONE IS THE BEST";
```

**`solve(int input)`**
```c
// Handles test case logic
// Contains red herring strings: "noh this ain't the string dawg"
// Inputs 16-19 → "Retrial"
// Inputs 4, 9 → randomized output strings
```

> 📌 The binary is a **simulation / flavor piece**: it reinforces the JJK theme but does not directly yield the flag. The real payload is in the PDF.

---

### Step 3: Cracking the PDF Password

The extracted PDF is password-protected. Connecting the Base64 clue (`_CAN_ONLY_UNLOCK_ME_WHEN_I_AM_AT_MY_FULL_POWER`) to JJK lore:

> In *Jujutsu Kaisen*, Ryomen Sukuna is at **full power** when all **20 fingers** have been consumed.

```bash
qpdf --password=20 --decrypt document.pdf decrypted.pdf
# ✅ Success
```

**Password: `20`**

Inside the PDF:
- **Ciphertext:** `7**1>//.7v#v7v+&vpq7v#0+8`
- **Hint:** *"How many eyes? How many ropes?"*

---

### Step 4: XOR Decryption

The hint refers to two iconic traits of **Gojo Satoru**:

| JJK Reference | Value |
|--------------|-------|
| **Six Eyes**: Gojo's legendary ocular ability | `6` |
| **Nine Ropes**: part of the Hollow Purple incantation | `9` |

Combining: `6` + `9` = **XOR key `69`**

#### Python Decryption Script

```python
ciphertext = "7**1>//.7v#v7v+&vpq7v#0+8"
key = 69

plaintext = ''.join(chr(ord(c) ^ key) for c in ciphertext)
print(plaintext)
# Output: root{jjkr3f3r3nc354r3fun}
```

#### Manual Verification (first few bytes)

| Char | ASCII | XOR 69 | Result |
|------|-------|--------|--------|
| `7`  | 55    | 55 ^ 69 = 118 | `v` |
| `*`  | 42    | 42 ^ 69 = 111 | `o` |
| `*`  | 42    | 42 ^ 69 = 111 | `o` |
| `1`  | 49    | 49 ^ 69 = 116 | `t` |
| `>`  | 62    | 62 ^ 69 = 123 | `{` |

→ Decrypts to `root{jjkr3f3r3nc354r3fun}` ✅

---

### Step 5: Flag Wrapper Swap

The challenge description makes the final step explicit:

> *"Don't believe in `root{}`: That's ancient mythology. Real curse energy runs on `cyros{}` 💀"*

Simply replace the wrapper:

```
root{jjkr3f3r3nc354r3fun}
  ↓
cyros{jjkr3f3r3nc354r3fun}
```

---

## 🚩 Flag

```
cyros{jjkr3f3r3nc354r3fun}
```

---

## 🔁 Full Solve Script

```python
import base64

# Step 1: Decode Base64 clue (already done by binwalk extraction)
clue = base64.b64decode("<base64_string>").decode()
# → _CAN_ONLY_UNLOCK_ME_WHEN_I_AM_AT_MY_FULL_POWER  (password hint: 20)

# Step 2: XOR decrypt ciphertext from PDF
ciphertext = "7**1>//.7v#v7v+&vpq7v#0+8"
key = 69  # Six Eyes (6) + Nine Ropes (9)

plaintext = ''.join(chr(ord(c) ^ key) for c in ciphertext)
print(f"Decrypted: {plaintext}")
# → root{jjkr3f3r3nc354r3fun}

# Step 3: Swap flag wrapper
flag = plaintext.replace("root{", "cyros{")
print(f"Flag: {flag}")
# → cyros{jjkr3f3r3nc354r3fun}
```

---

## 💡 Key Takeaways

- **Always check file size**: oversized images almost always hide embedded data
- **`binwalk -e`** is your first tool for any stego challenge
- **Domain knowledge matters**: JJK lore (20 fingers, Six Eyes, Nine Ropes) was essential to solving every stage
- **Red herrings exist**: the ELF binary's randomized outputs were flavor, not the solution path
- **Read the description carefully**: the `root{}` → `cyros{}` swap was hidden in plain sight

---

## 🎌 JJK References in This Challenge

| Challenge Element | JJK Reference |
|-------------------|--------------|
| Image (cursed finger) | Sukuna's 20 fingers |
| PDF password `20` | 20 fingers = Sukuna at full power |
| XOR key `69` | Six Eyes (6) + Nine Ropes (9): Gojo Satoru |
| `root{}` → `cyros{}` | "Real curse energy": Sukuna's domain |
| Binary output "THE MIDDLE ONE IS THE BEST" | The middle finger: challenge title |

---

## 📦 Tools Used

```
binwalk        # file extraction / stego analysis
Ghidra         # binary reverse engineering
qpdf           # PDF decryption
Python 3       # XOR decryption script
```
