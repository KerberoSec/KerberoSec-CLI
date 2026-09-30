# bait-and-switch-hard

**Category:** Cryptography  
**Points:** 50  

---

## Description

> Our integrity checker got an upgrade. Fool it again: if you can.  
>
> Submit two files:
>: Both must be valid PDFs  
>: Same **MD5 hash**  
>: Different **SHA256 hashes**  
>
> One file is already provided.  
>
> Service: `nc 4.188.84.14 9999`  

---

## Approach

### 1. Understanding the Challenge

- Unlike the previous challenge:
  - CRC32 (linear, easily forgeable) ❌
  - MD5 (cryptographic, non-linear) ✅

### Key realization:

> MD5 cannot be arbitrarily forced → collision must already exist in the file

---

## 2. Key Insight

- The hint about *“looking at the full binary structure”* suggested:
  - The PDF already contains a **pre-generated MD5 collision**
- This is a known technique:
  - **Chosen-prefix / UniColl-style collision**
- Meaning:
  - Two different byte sequences produce the **same MD5**

---

## 3. Inspecting the PDF Structure

- Opened the PDF in a **hex editor**
- Observed:

### Two important regions:
1. **Primary collision block**
   - Actively used in the file
2. **Alternate collision block**
   - Hidden after `%%EOF`

```text id="p5g8r2"
%%EOF
````

### Insight:

* Both blocks:

  * Produce identical MD5
  * Differ in content → hence different SHA256

---

## 4. Initial Attempts (Failed)

* Tried:

  * Directly copying ~128 bytes from alternate block
* Result:

  * MD5 mismatch ❌

### Reason:

* MD5 is block-based (64-byte blocks)
* Requires:

  * Exact alignment
  * Correct padding
  * Precise boundaries

---

## 5. Correct Approach

### Step 1: Locate Collision Payload

* Identified exact start of:

  * Primary payload (used in PDF)
* Skipped:

  * Padding / null bytes

---

### Step 2: Measure Exact Length

* Determined precise byte length of the collision block

---

### Step 3: Extract Alternate Block

* Extracted **same-length payload** from alternate region
* Ensured:

  * Exact byte-for-byte alignment

---

### Step 4: Replace Payload

Used a Python script:

```python
with open("original.pdf", "rb") as f:
    data = bytearray(f.read())

# Replace exact byte range (example indices)
data[start:end] = alternate_block

with open("patched.pdf", "wb") as f:
    f.write(data)
```

---

## 6. Verification

* MD5:

  * Same as original ✅
* SHA256:

  * Different ✅
* PDF:

  * Opens correctly ✅

---

## 7. Submission

* Connected to service:

```bash
nc 4.188.84.14 9999
```

### Steps:

* Base64 encoded:

  * Original PDF
  * Modified PDF
* Submitted both files

---

## Issues Faced

* Incorrect byte offsets → broke MD5
* Misalignment with 64-byte MD5 blocks
* Padding/null bytes caused incorrect extraction
* Manual hex editing unreliable → switched to scripting

---

## Key Insight

* MD5 collisions must be:

  * **Precomputed**
  * Not generated on the fly
* Collision blocks must be:

  * Precisely aligned
  * Carefully swapped
* Even a single byte error → breaks collision

---

## Tools Used

* Hex editor (for inspection)
* Python (byte-level manipulation)
* Python socket (submission)

---

## Flag

```text id="8yfl1c"
h@CkRuSH2O26{md5_c0ll1s10n_1s_d3c4d3s_0ld}
```

---

## Lessons Learned

* MD5 is broken due to practical collision attacks
* File formats like PDF allow embedding multiple valid structures
* Cryptographic weaknesses can be exploited without brute force
* Byte-level precision is critical in cryptographic challenges
* Understanding underlying structure is more important than tools

---