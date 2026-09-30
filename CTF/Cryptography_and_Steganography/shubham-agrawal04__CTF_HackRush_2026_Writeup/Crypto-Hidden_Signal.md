# Hidden Signal

**Category:** Cryptography  
**Points:** 40  

---

## Description

> A guy wants to send a secret 8-digit integer code over email, but the girl doesn't want the administration to see the code. So he decides to embed the code in the following text. Help the girl find the Code:
>
> **Text:**
>
> My love grows quietly when  I think of  you  smiling, choosing me daily, holding hope,  sharing  silence,  and  building  tomorrow together with patience,  laughter, courage,  trust,  warmth  forever  always  still here.
>
> Flag format: `HRCTF{Code}`  

---

## Approach

### 1. Initial Observation

- The text looked normal at first glance.
- However, on closer inspection:
  - Some words had **single spaces**
  - Some had **double spaces**

This suggested a possible **covert encoding using whitespace**.

---

## 2. Identifying the Encoding Scheme

Hypothesis:

- Single space → `0`  
- Double space → `1`  

This is a common **steganographic encoding technique** using invisible characters.

---

## 3. Extracting the Binary String

- Carefully traversed the sentence
- Recorded spaces between words:

```

Single space  → 0
Double space  → 1

````

Generated binary string:

```text
00001001100000111100010111110
````

---

## 4. Converting Binary → Decimal

Converted the binary value:

```text
00001001100000111100010111110₂ = 39909566₁₀
```

---

## 5. Final Answer

```text
HRCTF{39909566}
```

---

## Failed Attempts

* Tried classical cryptography methods:

  * Caesar cipher
  * Substitution cipher
  * Frequency analysis
* Looked for:

  * Hidden patterns in words
  * Capitalization tricks
* These approaches failed because:

  * The encoding was **not linguistic**, but **structural (whitespace-based)**

---

## Key Insight

* Invisible characters (like spaces) can carry information
* Simple binary encoding schemes are often used in CTFs
* Always check for:

  * Extra spaces
  * Tabs
  * Formatting anomalies

---

## Tools Used

* Manual inspection
* Binary to decimal conversion

---

## Lessons Learned

* Not all crypto challenges involve complex math
* Steganography can be hidden in plain sight
* Attention to small details (like spacing) is critical
* Always consider non-visible encodings in text-based challenges

---

