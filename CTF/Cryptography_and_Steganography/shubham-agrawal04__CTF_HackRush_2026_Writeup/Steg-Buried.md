# Buried

**Category:** Steganography  
**Points:** 30  

---

## Description

> "You have come upon a PDF with what seems nothing more than garbled nonsense but beware! Not Everything is as it appears!  
> https://drive.google.com/file/d/1ZIYIV6Gddfor2ENvSLxHkp1rJAwJBt8Q/view?usp=sharing"

---

## Approach

### 1. Initial Inspection

- Opened the PDF file.
- The visible content consisted of:
  - Lorem Ipsum text
  - Misleading statements like *"No flag here. Nice try though!"*
  - A so-called "Special Hidden Section"

These strongly indicated a **red herring**, suggesting the actual flag might not be in the visible content.

---

### 2. Considering Steganography Techniques

Since the challenge category was **Steganography**, possible approaches included:
- Checking hidden text layers
- Extracting embedded files
- Inspecting metadata
- Using tools like `strings`, `binwalk`, etc.

---

### 3. Metadata Analysis

Decided to inspect the PDF metadata using:

```bash
pdfinfo file.pdf
```

---

### 4. Key Discovery

The metadata output revealed:

| Metadata Field | Value                         |
| -------------- | ----------------------------- |
| Keywords       | **HRCTF{h4ck3r_bh41_h4ck3r}** |

The **flag was stored in the `Keywords` field** of the PDF metadata.

---

## Key Insight

* The entire visible content of the PDF was intentionally misleading.
* The real solution required checking **non-visible data (metadata)**.
* Always inspect file metadata in steg challenges involving documents.

---

## Tools Used

* `pdfinfo` (Linux utility)
* General PDF viewer (for initial inspection)

---

## Flag

```bash
HRCTF{h4ck3r_bh41_h4ck3r}
```

---

## Lessons Learned

* Metadata is a common hiding spot in steganography challenges.
* Do not trust visible content: especially when it looks intentionally distracting.
* Always perform basic file analysis steps:

  * Metadata inspection
  * Strings extraction
  * File structure analysis

---

