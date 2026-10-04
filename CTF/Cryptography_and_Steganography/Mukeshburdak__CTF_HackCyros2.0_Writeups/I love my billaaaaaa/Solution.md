# 🐱 I Love My Billaaaaaa: CTF Writeup

<p align="center">
  <img src="https://img.shields.io/badge/Category-Forensics-blue?style=for-the-badge">
  <img src="https://img.shields.io/badge/Difficulty-Medium-orange?style=for-the-badge">
  <img src="https://img.shields.io/badge/Concept-Steganography%20%7C%20File%20Carving-red?style=for-the-badge">
</p>

---

## 🧠 Challenge Description

> *"I think pilla has eaten something..."*

A sneaky cat is hiding secrets inside a file. Your job is to dig through the layers and find what was swallowed.

---

## 🔎 Solution Walkthrough

### Step 1: Run `strings` for Hints

Start with the classic forensics first step:

```bash
strings <challenge_file>
```

Look for clues like URLs, passwords, or encoded hints hidden in plain text within the file.

---

### Step 2: Extract Hidden Files with `binwalk`

```bash
binwalk --extract --dd=".*" <challenge_file>
```

This reveals **two hidden files** embedded inside:
- An **MP3 file**
- A **RAR archive**

---

### Step 3: Analyze the MP3 with Sonic Visualiser

Open the extracted MP3 in **Sonic Visualiser**.  
Inspect the spectrogram: the **password for the RAR file** is hidden inside the audio visualization.

---

### Step 4: Fix the Corrupted RAR File

The RAR file has a **corrupted file header signature**.

Open it in a **hex editor** and fix the magic bytes:

| Before (Corrupted) | After (Fixed) |
|--------------------|---------------|
| `43 61 74 21` (`Cat!`) | `52 61 72 21` (`Rar!`) |

```
Cat! → Rar!
```

Save the fixed file.

---

### Step 5: Extract the RAR with the Password

Use the password found from the MP3 spectrogram to extract the RAR:

```bash
unrar e fixed_file.rar
```

Enter the password when prompted.

---

### Step 6: Decode the Flag

The flag inside is **Base64 encoded**. Decode it:

```bash
echo "<encoded_string>" | base64 -d
```

---

## 🚩 Final Flag

```
cyros{f0r3n51cs_ma5t3r}
```

---

## 🛠 Tools Used

| Tool | Purpose |
|------|---------|
| `strings` | Extract readable text and hints from the file |
| `binwalk` | Carve out hidden embedded files |
| Sonic Visualiser | Analyze MP3 spectrogram for hidden password |
| Hex Editor (e.g. `hexedit`, `HxD`) | Fix corrupted RAR magic bytes |
| `unrar` | Extract the password-protected archive |
| `base64` | Decode the final flag |

---

## 🧩 Key Takeaways

- Always start forensics challenges with `strings` and `binwalk`
- File signatures (magic bytes) can be deliberately corrupted: know your hex headers
- Steganography can hide data in audio spectrograms, not just images
- Multi-layer challenges require patience: file → audio → archive → decode

---

## 📚 Reference

Solution approach inspired by:  
[SanketBaraiya/CTFlearn-Solutions](https://github.com/SanketBaraiya/CTFlearn-Solutions/tree/main/Naughty%20Cat)
