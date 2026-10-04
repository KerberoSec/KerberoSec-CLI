# Writeup: Baobab Whispers

**Event:** EcowasCTF
**Category:** Steganography
**Difficulty:** Easy
**Points:** 100

## Challenge Description
> "The old baobab whispers to those who look at it pixel by pixel."

**Provided File:** `baobab.png`

---

## 1. Initial Analysis & Basic Enumeration

The challenge provides a single image file named `baobab.png`. The description hints at inspecting the image "pixel by pixel," which strongly suggests Least Significant Bit (LSB) steganography. However, before jumping into advanced tools, standard enumeration was performed.

### Failed Approaches

**Checking file type and integrity:**
```bash
┌──(kali㉿kali)-[~/ecowas/stego]
└─$ file baobab.png
baobab.png: PNG image data, 256 x 256, 8-bit/color RGB, non-interlaced
```
*Result:* Standard PNG file. No header anomalies.

**Extracting metadata:**
```bash
┌──(kali㉿kali)-[~/ecowas/stego]
└─$ exiftool baobab.png
```
*Result:* ExifTool returned standard image properties. No hidden comments, copyright tags, or suspicious metadata were found.

**Searching for plaintext strings:**
Assuming the flag might simply be hidden in the file's ASCII data, a `strings` search was executed, filtering for the standard flag format.
```bash
┌──(kali㉿kali)-[~/ecowas/stego]
└─$ strings baobab.png | grep Eco
```
*Result:* No output. The flag is not stored in plaintext.

---

## 2. Advanced Steganalysis

Given the hint "pixel by pixel" and the failure of basic enumeration, the next logical step was to analyze the color channels and Least Significant Bits (LSB). The tool `zsteg` is highly effective for detecting hidden data in PNGs.

**Executing zsteg:**
```bash
┌──(kali㉿kali)-[~/ecowas/stego]
└─$ zsteg -a baobab.png
```

*Result:* `zsteg` produced a massive output of potential hidden payloads. Sifting through the noise, one specific line stood out due to its structure, which resembled a flag wrapper:

```text
b1,r,lsb,xy         .. text: ")LjvdhzJAM{i40i4i_do1zw3yz_zo1ma_if_z3c3u}>"
```
There was also a reversed version in `b1,r,msb,Xy`.

We successfully extracted a hidden string from the Least Significant Bit of the Red channel (`b1,r,lsb,xy`), but it was encrypted.

---

## 3. Cryptanalysis (Known Plaintext Attack)

The extracted string is: `)LjvdhzJAM{i40i4i_do1zw3yz_zo1ma_if_z3c3u}>`

Knowing the standard flag format for this competition is `EcowasCTF{...}`, we can perform a Known Plaintext Attack (KPA) to determine the encryption algorithm. The curly brace `{` remains intact, suggesting a simple substitution cipher (like Caesar/ROT) that only affects alphabetical characters.

Let's align the ciphertext with the known plaintext immediately preceding the brace:

| Ciphertext | `J` | `A` | `M` |
| :--- | :--- | :--- | :--- |
| **Plaintext** | `C` | `T` | `F` |

**Calculating the shift:**
* From `J` (10th letter) to `C` (3rd letter): **-7**
* From `A` (1st letter) to `T` (20th letter): **-7** (wrapping backwards from A to Z)
* From `M` (13th letter) to `F` (6th letter): **-7**

The encryption is a Caesar cipher with a **shift of -7** (which is mathematically equivalent to **ROT19**). Numbers and special characters (`_`, `{`, `}`) are ignored by the cipher.

---

## 4. Decoding the Payload

Applying the -7 shift (ROT19) to the alphabetical characters of the inner payload `i40i4i_do1zw3yz_zo1ma_if_z3c3u`:

* **`i40i4i`** -> `b` (-7) `40` `b` (-7) `4` `b` (-7) == **`b40b4b`**
* **`do1zw3yz`** -> `w` `h` `1` `s` `p` `3` `r` `s` == **`wh1sp3rs`**
* **`zo1ma`** -> `s` `h` `1` `f` `t` == **`sh1ft`**
* **`if`** -> `b` `y` == **`by`**
* **`z3c3u`** -> `s` `3` `v` `3` `n` == **`s3v3n`**

The decoded string perfectly spells out a readable, leetspeak sentence reflecting the challenge name and the cipher used: *baobab whispers shift by seven*.

## Flag
`EcowasCTF{b40b4b_wh1sp3rs_sh1ft_by_s3v3n}`
