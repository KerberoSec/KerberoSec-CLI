# D4ddies

**Category:** Steganography  
**Points:** 40  

---

## Description

> Read the image  
> https://drive.google.com/file/d/17hrL3g92zAYFimn7pq0kmfiKexkr3EYR/view?usp=sharing  

---

## Approach

### 1. Initial Observation

- The provided file was an image of the **Indian flag**.
- Visually, the image appeared completely normal with no obvious hidden text or anomalies.

This suggested that the flag was likely hidden using **LSB (Least Significant Bit) steganography** or similar techniques.

---

### 2. Applying Steganography Tools

Since this was a steg challenge, the next step was to use automated tools designed for image analysis.

Used:

```bash
zsteg -a IndianFlag.png
```

---

### 3. Extracting Hidden Data

The `zsteg` output revealed multiple hidden data patterns. Among them, one entry stood out:

```
b1,rgb,lsb,xy .. text: "Greatest-Technical-Secretary-Chandrabhan-Patel"
```

This appeared to be meaningful and not random noise, indicating it was likely the **hidden message**.

---

### 4. Interpreting the Result

* The string extracted was:

  ```
  Greatest-Technical-Secretary-Chandrabhan-Patel
  ```

* This was the **intended hidden content**, embedded in the LSB of the image pixels.

---

## Key Insight

* Even when an image looks completely normal, data can be hidden in pixel-level bits.
* Tools like `zsteg` are extremely effective for detecting LSB-based steganography.
* Always check multiple bit planes (`b1`, `b2`, etc.) and color channels (`rgb`, `bgr`, etc.).

---

## Tools Used

* `zsteg` (primary tool for extraction)
* Basic image viewer (for initial inspection)

---

## Flag

```bash
HRCTF{Greatest-Technical-Secretary-Chandrabhan-Patel}
```

---

## Lessons Learned

* LSB steganography is a very common technique in CTFs.
* Automated tools can quickly reveal hidden data that is impossible to detect manually.
* Always run comprehensive scans (`-a` flag in `zsteg`) to avoid missing hidden content.

---

