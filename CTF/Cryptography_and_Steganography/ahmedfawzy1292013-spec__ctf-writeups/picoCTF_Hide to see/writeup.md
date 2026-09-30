# HideToSee: CTF Writeup

## Category
Cryptography / Steganography

## Challenge Difficulty
Medium

## Author
Sunday Jacob Nwanyim

---

## Description
The challenge provides an image and hints suggesting that something is hidden inside it.

Hint:
- Download the image and try to extract it.

The name “HideToSee” also suggests steganography.

---

## Initial Analysis

Since this is an image-based challenge, I suspected that the flag is hidden inside the file using steganography techniques.

I decided to use `steghide` to extract hidden data.

---

## Extraction Process

I ran the following command:

```bash
steghide extract -sf "atbash (7).jpg"
