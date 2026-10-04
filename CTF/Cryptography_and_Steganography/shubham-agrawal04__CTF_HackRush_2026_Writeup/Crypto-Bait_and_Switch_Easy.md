# bait-and-switch-easy

**Category:** Cryptography  
**Points:** 50  

---

## Description

> Our integrity checker uses CRC32.  
>
> Download the challenge PDF, produce a second valid PDF with the same CRC32 but a different MD5, and submit both.  
>
> Service: `nc 4.188.84.14 8888`  

---

## Approach

### 1. Understanding the Problem

- Given:
  - A PDF file
  - Its integrity is checked using **CRC32**
- Task:
  - Create a **different PDF** such that:
    - Same **CRC32**
    - Different **MD5**

---

### 2. Key Insight

- CRC32 is **not cryptographically secure**
- Important property:

> CRC32 is **linear**, meaning it can be manipulated predictably

- Unlike MD5:
  - CRC32 can be **adjusted by appending bytes**
  - MD5 changes unpredictably

---

### 3. Initial Analysis

Computed hashes of original file:

- MD5:
```

4225bee65ef78d939062aca39704ae3e

```
- CRC32:
```

04FEA22E

```

---

### 4. Creating a Modified PDF

- Made a copy of the original PDF
- Appended harmless content after the end of file marker:

```

%%EOF

```

```

% {harmless comment}

````

### Result:
- MD5 changed ✅  
- CRC32 changed ❌ (expected)

---

### 5. Fixing CRC32 via Patching

Used a CRC32 forcer script:
To bend the CRC32 back to the original value, I used a very popular reverse-math script for Windows CTF players, Python-CRC32-Forcer.

Downloaded it directly into your folder by running this in PowerShell:

```PowerShell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/dreamer2908/Python-CRC32-Forcer/master/python_crc32_forcer.py" -OutFile "python_crc32_forcer.py"
```

```bash
python python_crc32_forcer.py patched.pdf 04FEA22E
````

* The script computes a **4-byte patch** that corrects the CRC32
* Appends bytes to force desired checksum

---

### 6. Verification

* CRC32 of patched file:

  ```
  04FEA22E  ✅ (same as original)
  ```
* MD5:

  * Different from original ✅
* PDF:

  * Opens normally ✅

---

### 7. Submission

* Connected to server:

  ```
  nc 4.188.84.14 8888
  ```

* Steps:

  * Converted both PDFs to **base64**
  * Submitted:

    1. Original PDF
    2. Patched PDF

* Server validated:

  * Same CRC32
  * Different MD5

---

## Key Insight

* CRC32 is **not collision-resistant**
* Due to linearity:

  * You can **force a desired checksum**
  * Without breaking file structure

---

## Tools Used

* Python (CRC32 forcer script)
* 7-Zip (for CRC32 calculation)
* Python socket (for submission)

---

## Flag

```text
h@CkRuSH2O26{crc32_1s_n0t_coll1s10n_r3s1st4nt}
```

---

## Lessons Learned

* CRC32 should never be used for security-critical integrity checks
* Cryptographic hashes (like MD5, SHA) behave very differently from linear checksums
* File formats like PDF allow safe byte appending without breaking validity
* Understanding mathematical properties of hashes is crucial in cryptography challenges

---
