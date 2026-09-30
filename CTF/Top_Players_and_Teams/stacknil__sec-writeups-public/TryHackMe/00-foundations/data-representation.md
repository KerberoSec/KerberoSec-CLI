---
type: resource-note
status: done
created: 2026-02-15
updated: 2026-03-12
tags: [security-writeup, tryhackme, binary, data-representation]
source: TryHackMe: Data Representation
platform: tryhackme
room: Data Representation
slug: data-representation
path: TryHackMe/00-foundations/data-representation.md
topic: 00-foundations
domain: [foundations]
skills: [number-systems, hexadecimal]
artifacts: [concept-notes]
sanitized: true
---

# Data Representation

## Summary

* Computers store and process information using two states interpreted as **0** and **1** (binary / base-2).
* **Bits** (0/1) combine to represent larger ranges: 1 bit → 2 states; 8 bits → 256 states.
* **RGB color** can be represented with 3 channels (red/green/blue). With 8-bit per channel, that is **24-bit color** and **16,777,216** combinations.
* **Hexadecimal** (base-16) is a compact human-friendly encoding for binary: **4 bits = 1 hex digit**.
* (Optional) **Octal** (base-8) groups **3 bits = 1 octal digit**, less commonly used.

## Glossary (CN: EN)

* Bit（比特）: binary digit, one 0/1.
* Byte / Octet（字节/八位组）: 8 bits.
* Binary / Base-2（二进制）: digits {0,1}.
* Decimal / Base-10（十进制）: digits {0..9}.
* Hexadecimal / Base-16（十六进制）: digits {0..9, A..F}.
* Octal / Base-8（八进制）: digits {0..7}.
* RGB（红绿蓝三原色）: red/green/blue channel intensities.
* Radix / Base（基数）: the number of digits in a positional system.

## Key Concepts

### 1) Task 1: Introduction: Why bases matter

Humans naturally use **decimal (base-10)** (e.g., 17, 99, 3049). Computers are constrained to **two readable states**, so they use **binary (base-2)**.

Examples of “two states” mentioned:

* Low/High voltage ranges (digital electronics)
* Magnetic polarity (storage)
* Presence/absence of light (fiber optics)

Core idea: complex data becomes manageable when we treat each state as a **bit**.

### 2) Task 2: Representing Colors (RGB)

#### 2.1 First 8 colors (1 bit per channel)

Assume each channel (R, G, B) is either **off (0)** or **on (1)**.

Total colors: 2 × 2 × 2 = **8**.

| RGB bits | Meaning      | Color name |
| -------- | ------------ | ---------- |
| 000      | all off      | Black      |
| 001      | blue only    | Blue       |
| 010      | green only   | Green      |
| 100      | red only     | Red        |
| 011      | green + blue | Cyan       |
| 101      | red + blue   | Magenta    |
| 110      | red + green  | Yellow     |
| 111      | all on       | White      |

#### 2.2 From 8 to 16,777,216 colors (8-bit per channel)

If each channel has **256 levels** (0-255), then:

* 256 × 256 × 256 = **16,777,216** colors.
* 256 levels require **8 bits**.
* RGB color becomes **3 × 8 bits = 24 bits = 3 bytes**.

#### 2.3 Why hex is used for colors

Binary like `10100011 11101010 00101010` is hard to read/write.

Hex groups **4 bits → 1 hex digit**, so 24 bits map to **6 hex digits**.

Example mapping (4-bit nibble → hex digit):

| Hex | Binary | Hex | Binary |
| --- | ------ | --- | ------ |
| 0   | 0000   | 8   | 1000   |
| 1   | 0001   | 9   | 1001   |
| 2   | 0010   | A   | 1010   |
| 3   | 0011   | B   | 1011   |
| 4   | 0100   | C   | 1100   |
| 5   | 0101   | D   | 1101   |
| 6   | 0110   | E   | 1110   |
| 7   | 0111   | F   | 1111   |

So `10100011 11101010 00101010` becomes `A3EA2A`.

Key takeaways for color representation:

* Real-life app color: **24-bit RGB (3 bytes)**
* Each byte: **0-255 intensity** of R/G/B
* Each byte: **2 hex digits**
* Whole color: **6 hex digits**

### 3) Task 3: Numbers: Decimal, Binary, Hex (and Octal)

#### 3.1 Positional notation (decimal example)

A number like 213 is:

* 213 = 200 + 10 + 3
* 213 = 2 × 10² + 1 × 10¹ + 3 × 10⁰

#### 3.2 Binary numbers (base-2)

Binary uses digits {0,1} and powers of 2.

Example:

* 1001 = 1 × 2³ + 0 × 2² + 0 × 2¹ + 1 × 2⁰ = 8 + 1 = **9**

Worked conversions shown:

* 0000 → 0
* 0001 → 1
* 0010 → 2
* 0011 → 3
* 1100 → 12
* 1101 → 13
* 1110 → 14
* 1111 → 15

#### 3.3 Hexadecimal numbers (base-16)

Hex digits represent decimal 0-15 using:

* 0-9, then A=10, B=11, C=12, D=13, E=14, F=15

The provided table links decimal ↔ hex ↔ 4-bit binary (see Task 2.3).

Optional conversion example given:

* 9BDF = 9 × 16³ + 11 × 16² + 13 × 16¹ + 15 × 16⁰ = **39,903**

#### 3.4 (Optional) Octal numbers (base-8)

Octal uses digits {0..7} and groups 3 bits per digit.

| Octal | Binary |
| ----- | ------ |
| 0     | 000    |
| 1     | 001    |
| 2     | 010    |
| 3     | 011    |
| 4     | 100    |
| 5     | 101    |
| 6     | 110    |
| 7     | 111    |

Optional conversion example given:

* 357₈ = 3 × 8² + 5 × 8¹ + 7 × 8⁰ = 192 + 40 + 7 = **239**

### 4) Task 4: Conclusion (What you should retain)

Number systems:

* Decimal (Base-10): human default
* Binary (Base-2): computer-native (two states)
* Hexadecimal (Base-16): compact representation of binary (4 bits per digit)
* Octal (Base-8): groups 3 bits, less common

Core units:

* **Bit**: one binary digit
* **Byte/Octet**: 8 bits

Colors:

* RGB with 8-bit per channel → **24-bit color** → **16,777,216** combinations
* Hex color is a readable shorthand for binary RGB

### 5) Pitfalls (common mistakes)

* Confusing the roles of digits vs. place values: each position is a power of the base.
* Forgetting that hex A: F correspond to decimal 10-15.
* Mixing “byte” meaning: here it is explicitly treated as **8 bits (octet)**.

## Takeaways

* Binary and hex literacy is foundational for tooling in security (e.g., reading memory dumps, network bytes, hashes, color/byte encodings).
* Treat “base conversion” as a deterministic positional-expansion exercise; slow, careful arithmetic prevents errors.
