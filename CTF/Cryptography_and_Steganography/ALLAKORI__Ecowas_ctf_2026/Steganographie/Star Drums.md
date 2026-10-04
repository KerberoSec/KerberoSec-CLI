
# 🥁 Star Drums: Writeup (ECOWAS CTF)

![CTF](https://img.shields.io/badge/Event-ECOWAS%20CTF-blue)
![Category](https://img.shields.io/badge/Category-Steganography%20%2B%20Audio-green)
![Difficulty](https://img.shields.io/badge/Difficulty-Medium-orange)

---

## 📌 Challenge Overview

**Star Drums** is a complex audio steganography challenge. The objective is to extract a hidden message from the rhythm of an audio file and then reverse a multi-layered chain of encodings.

The challenge relies on a "Russian doll" concept:
> **Audio (Rhythm) ➡️ Morse Code ➡️ Case Loss ➡️ ROT13 ➡️ Base64 ➡️ Leet Speak**

---

## 📂 Provided Files

* `drums.wav` (57-second audio file, Mono, 8000 Hz, 917 kB)

---

## 🛑 Step 1: Reconnaissance & Rabbit Holes

When facing an audio file, the standard approach is to check metadata and look for classic embedded data. 

**1. Metadata and Embedded Files (Failure):**
```bash
┌──(kali㉿kali)-[~/ecowas/stego]
└─$ binwalk drums.wav
DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             RIFF audio data (WAV), PCM, 1 channels, 8000 sample rate
```
*Nothing is appended to the end of the file.*

**2. Classic LSB Steganography (Failure):**
```bash
┌──(kali㉿kali)-[~/ecowas/stego]
└─$ steghide extract -sf drums.wav
Enter passphrase: 
steghide: could not extract any data with that passphrase!
```

**3. String Analysis (Failure):**
```bash
┌──(kali㉿kali)-[~/ecowas/stego]
└─$ strings drums.wav | tail -n 5
,%!|
,%!|
,%!|
```
*Only digital noise.*

**4. Spectral Analysis (Visual Failure):**
```bash
┌──(kali㉿kali)-[~/ecowas/stego]
└─$ sox drums.wav -n spectrogram -o out.png
```
*The generated spectrogram shows no text or images drawn in the frequencies, only regular vertical bars (the drum beats).*

👉 **Conclusion:** The description hints at *"carry messages in their rhythm"*. Since standard software tools failed, the data is encoded in the *physical sound* itself. This is **Acoustic Morse Code**.

---

## 🧮 Step 2: Signal Processing (Trial & Error)

To extract the Morse code, we needed to analyze the volume peaks using Python.

**Attempt 1: Static Volume Threshold (Failure)**
We wrote a script detecting peaks with an amplitude above `15000`.
```bash
# Script output:
Espaces entre les coups (en secondes) :
[]
```
*Reason for failure: The file's volume was lower than expected. The script detected nothing.*

**Attempt 2: Dynamic Threshold on Raw Peaks (Partial Failure)**
We adjusted the script to adapt to the maximum volume (`12000`) and calculate the time gaps between vibrations.
```bash
# Script output:
Volume maximum détecté : 12000
Espaces entre les coups (en secondes) :
[0.05, 0.36, 0.05, 0.11, 0.05, 0.05, 0.05, 0.05, 0.12...]

# Resulting Morse decode:
EJAIQ2SMD1ETR3Z0NQAFK2ELAT1MK20JPAZMK2V2AS9LZUDKZ30
```
*Reason for failure: A drum resonates. A single strike generates hundreds of micro-vibrations. The script counted each vibration as a separate Morse dot, butchering the dashes and skewing the translation.*

**Attempt 3: The Audio Envelope (Success)**
To bypass background noise and resonance, the signal must be smoothed out by calculating the maximum volume over 10-millisecond windows (the envelope), and then applying a threshold.

```python
# Core logic of the working script:
window = int(rate * 0.01)
envelope = [max(abs(s) for s in samples[i:i+window]) for i in range(0, len(samples), window)]
```

The final script perfectly timed the durations and extracted the raw sequence:
```text
. .--- .- .. --.- ..--- ... -- -.. .---- . - .-. .--- --.. ----- -. --.- .- ..-. -.- ..--- . .-.. .- - .---- -- -.- ..--- ----- .--- .--. .- --.. -- -.- ..--- ...- ..--- .- ... ----. .-.. --.. ..- -.. -.- --.. .--- ----- -...-
```

Translated into plain text:
```text
EJAIQ2SMD1ETRJZ0NQAFK2ELAT1MK20JPAZMK2V2AS9LZUDKZJ0=
```

👉 The `=` sign at the end is the signature of **Base64** padding.

---

## ⚠️ Step 3: The Encoding and Casing Trap

Attempting a naive decode or correcting for Base32 fails miserably:
```bash
┌──(kali㉿kali)-[~/ecowas/stego]
└─$ echo "EJAIQ2SMD1ETR3Z0NQAFK2ELAT1MK20JPAZMK2V2AS9LZUDKZ30=" | tr '019' 'OIO' | base32 -d
"@jL▒  8.lUhix2jjbase32: invalid input
```

**The fundamental problem:**
Morse code does not support lowercase letters. It converts everything to uppercase. However, Base64 is case-sensitive (`A` $\neq$ `a`). Furthermore, analyzing the letter distribution suggests a **ROT13** algorithm was applied before the Base64 encoding. 
The original casing data was completely destroyed by the transition to Morse format.

---

## 💻 Step 4: ROT13 Reversal & Base64 Bruteforce

To repair the Base64 casing (which has $2^{50}$ possible combinations: over a million billion), we used a "Divide and Conquer" technique via a Python script:

1. **Reverse ROT13** on the extracted string.
2. **Chunking:** Base64 operates in strict 4-character blocks.
3. **Bruteforce:** For each block, the script generates all 16 possible Upper/Lower case combinations, attempts to decode it, and keeps the result if it yields readable ASCII characters.

```bash
# Output from our bruteforce script:
[*] Bruteforce de la casse Base64 par blocs...

[+] FLAG RECONSTRUIT :
EcUwaYCTFyc4h3R_dX4mY_m0rs3_b64_X0t11m
```

---

## 🧠 Step 5: Semantic Correction (Leet Speak)

The bruteforce algorithm stops at the *first* mathematically valid combination, even if the resulting word makes no sense in human language. This is where the analyst's intuition takes over. 

By observing the valid fragments (`_b64_`, `_m0rs3_`), we understand that the flag is written in **Leet Speak** related to the challenge theme. We visually adjust the final casing errors that tricked the algorithm:

* `EcUwaYCTF` ➡️ `EcowasCTF{`
* `yc4h3R` ➡️ `s4h3l` *(Sahel)*
* `_dX4mY` ➡️ `_dr4ms` *(drums)*
* `_m0rs3` ➡️ `_m0rs3` *(morse)*
* `_b64_` ➡️ `_b64_` *(base64)*
* `X0t11m}` ➡️ `r0t13}` *(rot13)*

---

## 🏁 Flag

```text
EcowasCTF{s4h3l_dr4ms_m0rs3_b64_r0t13}
```

---

## 💡 Key Takeaways

* **Don't trust raw peaks:** In audio steganography, always rely on smoothing via an "audio envelope" rather than raw data to avoid residual noise and resonance.
* **Entropy loss:** Certain protocols (like Morse) are destructive. They erase information (like casing) which breaks subsequent encodings (like Base64).
* **Human-Machine teaming:** A script can test 16 million cryptographic combinations in a second, but only a human can understand the final semantics of "Leet Speak."

---

## ⚡ Tools Used

* **Kali Linux CLI** (`binwalk`, `steghide`, `strings`, `sox`)
* **Audacity** (Waveform analysis to diagnose rhythm detection errors)
* **Python (`wave`, `struct`)** (Signal envelope extraction)
* **Python (`itertools`, `base64`)** (Block-based Base64 casing bruteforce)
```
