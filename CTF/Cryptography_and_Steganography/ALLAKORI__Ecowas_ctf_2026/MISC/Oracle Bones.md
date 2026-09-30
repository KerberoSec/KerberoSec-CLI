

# EcowasCTF 2026: Writeup: Oracle Bones

## 📝 Challenge Description
> **Category:** Misc  
> **Difficulty:** Easy  
>
> *The Yoruba counted in twenties long before the laptop. Each bone speaks a number. But it’s more than just a number.*

---

## 📂 Provided Files
To solve this, we were provided with two text files that define the logic of the challenge:

### 1. `lexicon.txt` (The Mapping)
This file acts as the key to the Yoruba numeral system used in the challenge.
```text
1 = okan    2 = eji     3 = eta     4 = erin    5 = arun
6 = efa     7 = eje     8 = ejo     9 = esan    10 = ewa
20 = ogun   40 = ogoji  60 = ogota  80 = ogorin 100 = ogorun
120 = ogofa 140 = ogoje 160 = ogojo 180 = ogosan 200 = igba
```

### 2. `bones.txt` (The Encrypted Data)
This file contains 35 lines of "bones," where each line represents a single character of the flag.
```text
bone_00: ogota+esan
bone_01: ogorin+ewa+esan
bone_02: ogorun+ewa+okan
...
bone_34: ogofa+arun
```

---

## 🔍 Technical Analysis

### Vigesimal Logic
The challenge uses a **vigesimal (base-20) system**. In Yoruba counting, complex numbers are often formed by addition. The challenge uses the `+` symbol to explicitly show how these numbers are constructed.

### ASCII Transformation
The hint "more than just a number" implies that once we calculate the sum of each line, the resulting decimal value maps to an **ASCII character**.

**Example Transformation (bone_01):**
* **Input:** `ogorin+ewa+esan`
* **Translation:** $80 (\text{ogorin}) + 10 (\text{ewa}) + 9 (\text{esan})$
* **Sum:** $99$
* **ASCII Result:** `c`

---

## 🛠️ Solution Approach

The solution requires a three-step automation process:
1.  **Parse the Lexicon:** Convert the `lexicon.txt` into a Python dictionary for fast lookups.
2.  **Split & Map:** For every line in `bones.txt`, split the string by `+`, retrieve the values from the dictionary, and calculate the sum.
3.  **Reconstruct:** Convert each sum to a character and join them to form the flag.

### Execution Script
```python
#!/usr/bin/env python3

# 1. Define translation dictionary
lexicon = {
    "okan": 1, "eji": 2, "eta": 3, "erin": 4, "arun": 5, "efa": 6, "eje": 7, "ejo": 8, "esan": 9, "ewa": 10,
    "ogun": 20, "ogoji": 40, "ogota": 60, "ogorin": 80, "ogorun": 100, "ogofa": 120, "ogoje": 140, "ogojo": 160,
    "ogosan": 180, "igba": 200, "ijo": 240
}

# 2. Data from bones.txt
bones = [
    "ogota+esan", "ogorin+ewa+esan", "ogorun+ewa+okan", "ogorun+ewa+esan", "ogorin+ewa+eje",
    "ogorun+ewa+arun", "ogota+eje", "ogorin+erin", "ogota+ewa", "ogofa+eta", "ogoji+ejo",
    "ogorun+ewa+erin", "ogoji+ewa+eji", "ogorin+ewa+esan", "ogorun+ejo", "ogoji+ewa+okan",
    "ogorin+ewa+arun", "ogorin+ewa+ejo", "ogoji+ejo", "ogorun+ewa", "ogoji+ewa+okan",
    "ogorun+ewa+arun", "ogorin+ewa+arun", "ogorin+ewa+ejo", "ogoji+ewa+eji", "ogorun+ewa+arun",
    "ogoji+ewa+okan", "ogorin+ewa+arun", "ogorun+ewa+efa", "ogorun+ewa+esan", "ogoji+ewa+okan",
    "ogorun+ewa", "ogorun+ewa+efa", "ogofa+okan", "ogofa+arun"
]

def decrypt():
    flag = ""
    for line in bones:
        # Extract components: "ogota+esan" -> ["ogota", "esan"]
        parts = line.split('+')
        # Sum the numeric values
        total = sum(lexicon[p] for p in parts)
        # Convert to character
        flag += chr(total)
    return flag

if __name__ == "__main__":
    print(f"Flag found: {decrypt()}")
```

---

## 🚩 Final Flag
`EcowasCTF{0r4cl3_b0n3s_b4s3_tw3nty}`

---
