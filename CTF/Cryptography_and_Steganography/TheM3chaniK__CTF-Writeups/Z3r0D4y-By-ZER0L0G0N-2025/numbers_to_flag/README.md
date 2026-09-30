# 🧩 Challenge: Numbers to flag

**Category:** Reverse Engineering
**Points:** 100

---

### 🔖 **Challenge Description**
I just see a bunch of numbers, how could this possibly be the flag?

---

### 📎 **Attachments**

* [ ctext.txt ](./ctext.txt): (provided)
* `code.py`: (provided)

---

### 🧭 **First Impressions**

Looks like a tiny numeric encoder: `code.py` emits a long concatenated string of digits. Probably each original character was transformed to a fixed-width-ish decimal chunk: easy peel-off once you spot the transform. (Hacker voice: smells like ord + linear math.)

---

### 🛠 **Environment & Tools**

* OS: I use Arch Btw
* Tools: python3
* Assumptions: Encoding is purely numeric and deterministic; no separators, so decode by reversing the arithmetic and greedily parsing chunks.

---

### 🔬 **Static Analysis**
From reading `code.py`

* For each character `ch` in plaintext:

  * `n = ord(ch)`
  * compute `(n + 10) * 16`
  * convert to string and concatenate.
* Example given: `'a' → ord('a')=97 → (97+10)*16 = 1712 → "1712"`.

So each encoded chunk is the decimal representation of `(ord(ch)+10)*16`. No URL escaping impact for digits. Chunk lengths may vary (3-4 digits depending on character).

---

### ▶️ **Dynamic Analysis**
Running the encoder reproduces the provided ciphertext:

```bash
$ python3 code.py
72072072014721264124812001232150412641248720720720
```

So the encoder is deterministic and matches the stored `ctext.txt`.

---

### 🧩 **Specialized Analysis**
Because chunk lengths vary, decoding strategy: greedily try 3- or 4-digit chunks (or 2-4 if necessary), reverse the math and check if result is a printable ASCII (typical flag characters include letters, digits, `_`, `{`, `}`). Valid plain ASCII range and expected flag format guide chunk boundaries.

Concretely, decoding step for a chunk `s`:

* `val = int(s)`
* `ord_ch = (val // 16) - 10`  (since val should be divisible by 16)
* Check `val % 16 == 0` and `32 <= ord_ch <= 126` (printable), or allow `{}`, `_`, digits.

Greedy attempt (prefer longer chunk when both valid) works here.

---

### ⚙️ **Patching / Exploitation / Decoding Process**
Decoder (short essential logic):

```python
# decode.py (conceptual)
s = input().strip()
i = 0
out = []
while i < len(s):
    # try 4 digits then 3 digits (the encoder produces values like 1712, 720, ...)
    for l in (4,3,2):
        if i + l > len(s): continue
        part = s[i:i+l]
        v = int(part)
        if v % 16 != 0: 
            continue
        ch_code = v // 16 - 10
        if 32 <= ch_code <= 126:  # printable
            out.append(chr(ch_code))
            i += l
            break
    else:
        # fallback if nothing matched
        i += 1
print(''.join(out))
```

I wrote `decode.py` following that logic and fed it `ctext.txt`. The script prints the plaintext flag.

Run:

```bash
$ cat ctext.txt | python3 decode.py
Paste encoded string: Decoded plaintext:
zero{you_cracked_the_code_9XC45L}
```

*Assumptions noted:* greedy 4→3→2 digit parsing; printable ASCII check to validate chunk boundaries.

---

### 🔁 **Recovery & Artifacts**
Produced files:

* `decode.py`: decoder script (as shown above).
  Repro steps:

```bash
$ cat ctext.txt | python3 decode.py
zero{you_cracked_the_code_9XC45L}
```

---

### ✅ **Validation**
Decoded plaintext matches typical CTF flag format and contains readable English: `zero{you_cracked_the_code_9XC45L}`. The algorithm is reversible and deterministic; decoding logic matches encoder math, so confidence is high.

---

### 🏁 **Flag**

```
zero{you_cracked_the_code_9XC45L}
```

---

### 💡 **Takeaways**

* Even “just numbers” can hide a flag: simple arithmetic encoding is a classic beginner RE trick.
* Always try reversing the math first before diving into fancy decompilers. 🧮
* Printable ASCII checks are your best friend for chunk-based decoding.
* When no delimiters are used, greedy parsing guided by ASCII ranges often cracks the format cleanly.
* This challenge reminds that *understanding the logic* > brute-forcing tools: sometimes, a few lines of Python beat Ghidra any day. 😎

---

**Solved by TheM3chanik: [contact@them3chanik.com](mailto:contact@them3chanik.com)**

