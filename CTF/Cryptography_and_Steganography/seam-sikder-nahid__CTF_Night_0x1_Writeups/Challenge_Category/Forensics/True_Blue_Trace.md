# True Blue Trace

>**Category:** Forensics  

**Flag example:** ``cscuu{xyz}``

---

## Problem 

Blue, Blue, Blue

 
 **File:** `blue_fixed.bmp`
 
---

## Approach

I started by downloading and opening `blue_fixed.bmp`.  
The image looked mostly blue, but with several visible dots scattered throughout.  
Since this was a forensics challenge, my first step was to check for hidden metadata.

---

### Step 1: Metadata Analysis

I used `exiftool` to inspect the file’s metadata.

**What is exiftool?**  
`exiftool` is a command-line application for reading, writing, and editing metadata in a wide variety of files (images, videos, documents, etc.).  
It can reveal information such as camera details, timestamps, geotags, and sometimes even hidden messages.

**Command used:**
```bash
exiftool blue_fixed.bmp
```

The output didn’t reveal anything useful: no suspicious metadata fields were found.

---

### Step 2: Steganography Analysis

Since there was no metadata clue, I suspected hidden data within the image.
The hint "Blue, Blue, Blue" suggested that something might be embedded in the blue channel or using steganography.

I used the ``steghide`` tool to check for hidden files.

**What is steghide?**

``steghide`` is a steganography tool that can hide and extract data from image and audio files without changing the visible properties of the file.
It supports common formats like BMP and JPEG.

**Command used:**
```
steghide extract -sf blue_fixed.bmp
```
The tool asked for a passphrase.
The challenge description hinted that no password was needed, so I simply pressed Enter.

Boom!: The extraction worked, and I got a ``secret.txt`` text file containing the flag.

---
## Note:

**Alternative tools for this step include:**
    
 *`zsteg`*:  useful for detecting hidden data in PNG/BMP images by analyzing pixel values.

 *`binwalk`*:  often used for extracting embedded files from binary data.

---

By checking the metadata first and then trying steganography extraction with steghide, I was able to retrieve the hidden message.

---

### **Flag:** ``cscuu{this_is_called_image_steganography}``

