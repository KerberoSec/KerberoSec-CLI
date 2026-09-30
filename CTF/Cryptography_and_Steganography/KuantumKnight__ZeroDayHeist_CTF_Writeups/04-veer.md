# 04: Greatest Poet of All Time (Veer)

> **ZeroDay Heist 2026 · CyberHX**

---

## Challenge Info

| Field | Value |
|---|---|
| **Category** | Steganography / Audio Forensics |
| **Points** | 250 |
| **Difficulty** | Medium |
| **Solved At** | June 6, 2026: 3:00 AM |
| **File** | `veer` (binary, no extension) |

---

## Description

> The greatest poet of all time left behind a hidden message. Can you find it?

The challenge name **"Veer"** and the reference to the greatest poet point directly to **Vinayak Damodar Savarkar**: historically known as **Veer Savarkar** (वीर सावरकर), the legendary Indian revolutionary, freedom fighter, and poet. This is the first and most important OSINT deduction of the challenge.

---

## Background: Who is Veer Savarkar?

Vinayak Damodar Savarkar (1883-1966) was an Indian independence activist, politician, lawyer, and writer. He is remembered as a prolific Marathi-language poet and revolutionary. His pen name concept **"Swatantryaveer"** (Freedom's Brave One) is directly referenced in this challenge's password.

---

## Approach

### Step 1: Identify the File Type

No extension was given. Never assume.

```bash
$ file veer
veer: RIFF (little-endian) data, WAVE audio, Microsoft PCM, ...
```

Interesting: it's a WAV audio file. But let's dig deeper:

```bash
$ binwalk veer

DECIMAL       HEXADECIMAL   DESCRIPTION
-----------------------------------------------------------------------
0             0x0           RIFF/WAVE audio file
[offset]      [hex]         Zip archive data, at least v2.0 to extract
```

**This file is a polyglot**: a WAV audio file with a ZIP archive appended to the end. It can be:
- Played as audio ✅
- Extracted as a ZIP archive ✅

This is a classic CTF polyglot technique. The file format reads from the front (WAV), and ZIP reads from the end (local file headers + central directory).

### Step 2: Analyse the WAV: Spectrogram

Open the file in **Audacity** (or any spectrogram viewer):

```
File → Import → Audio → veer
View → Show Spectrogram
```

In the spectrogram view, vertical tone bars are visible at specific intervals: a pattern consistent with **Morse code** encoding. Each distinct frequency burst corresponds to a dot or dash.

**Decoding the Morse:**

| Morse | Letter/Symbol |
|---|---|
| `...` | S |
| `--` | W |
| `.-` | A |
| ... | ... |

Decoded output:
```
SWATANTRASOORYA@PRX02
```

This references Savarkar's concept of **Swatantrasoorya** (Sun of Freedom): confirming the Savarkar connection.

### Step 3: Extract the ZIP

```bash
$ binwalk -e veer
# Extracts ZIP to _veer.extracted/

$ ls _veer.extracted/
[zip file]
```

The ZIP is **password protected**. The Morse string is the password:

```bash
$ unzip -P SWATANTRASOORYA@PRX02 _veer.extracted/[archive].zip
# or directly:
$ unzip -P SWATANTRASOORYA@PRX02 veer
```

### Step 4: Read the Flag

Extraction yields `flag.txt`:

```bash
$ cat flag.txt
Zer0d4yh31st{s4vark4R_W4s_th3_gr34t3st}
```

The flag itself decodes as: **"savarkaR was the greatest"**: confirming every deduction.

---

## Attack Chain Summary

```
veer (binary)
  │
  ├─► file / binwalk → Polyglot: WAV + ZIP
  │
  ├─► WAV Analysis (Audacity spectrogram)
  │     └─► Morse code in frequency domain
  │           └─► SWATANTRASOORYA@PRX02
  │
  └─► ZIP Extraction (password = Morse string)
        └─► flag.txt → Zer0d4yh31st{s4vark4R_W4s_th3_gr34t3st}
```

---

## Tools Used

| Tool | Purpose |
|---|---|
| `file` | Initial file type identification |
| `binwalk` | Embedded archive detection + extraction |
| `Audacity` | Spectrogram view for Morse decoding |
| `unzip -P` | Password-protected ZIP extraction |

---

## What I Learned

1. **Never skip `binwalk`**: polyglot files appear more common than you'd think in CTFs.
2. **Spectrogram steganography** hides data in the frequency domain, not the waveform. Always check spectrograms for CTF audio files.
3. **Challenge names are OSINT**: "Veer" wasn't random. The entire solution path flowed from identifying Savarkar.
4. **The password and the hidden data are always related**: once you find the Savarkar reference, you know the ZIP password will reference the same theme.

---

## Flag

```
Zer0d4yh31st{s4vark4R_W4s_th3_gr34t3st}
```
