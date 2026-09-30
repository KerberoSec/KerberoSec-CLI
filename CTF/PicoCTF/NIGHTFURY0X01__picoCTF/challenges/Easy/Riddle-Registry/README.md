>> picoCTF: Riddle-Registry (PDF metadata) Writeup

**Challenge:** Hidden flag inside a PDF file's metadata

**Category:** Forensics / Steganography (metadata)

**Level :** Easy

**Author:** NIGHTFURY0X01(Arash)

---

## Summary : 

+ The provided PDF looked like meaningless or garbled content, but the flag was hidden in the file's metadata. I used exiftool to inspect the PDF metadata, found a Base64 encoded string, decoded it, and recovered the flag.

## Tools

> exiftool (read file metadata)

> base64 (decode Base64 strings)

> wget (download challenge file)

> Steps & Commands

---

## 1. Install exiftool (if not already installed)

```bash
sudo apt install exiftool -y
```

## 2. Download the challenge PDF

*[Image: Step 1]*

## 3. List files to confirm download

*[Image: Step 2]*

## 4. Inspect PDF metadata with exiftool

*[Image: Step 3]*

+ In the exiftool output you will see many metadata fields. One of the fields contained a Base64 encoded string similar to:

```bash 

cGljb0NURntwdXp6bDNkX20zdGFkYXRhX2YwdW5kIV9jOGY5MWQ2OH0=

```

## 5. Decode the Base64 string to reveal the flag

*[Image: Step 4]*

---

## Notes & Tips

+ exiftool shows XMP and PDF metadata fields where CTF authors often hide flags (Author, Keywords, Comments, custom XMP tags, etc.).

+ If you find a suspicious string, check whether it's encoded (Base64, hex, etc.) and decode accordingly.

