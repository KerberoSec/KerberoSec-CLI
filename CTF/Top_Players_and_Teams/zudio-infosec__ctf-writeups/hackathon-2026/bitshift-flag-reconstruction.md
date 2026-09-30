# 🔁 Bit-Shift Flag Reconstruction (Crypto)

## Challenge Info

| Field | Details |
|---|---|
| Platform | Cybersecurity Hackathon 2026 |
| Category | Cryptography |
| Tools Used | Python 3 |

---

## 🧩 Description

Given 24 stored bytes and one line of description: *"The flag has been
broken apart and every byte has been pushed around with bit-shift
operations before being stored in a text file."*

```
1A A2 32 DB 13 89 A3 FA A9 43 89 33 A3 FA 89 A9 FA A1 BB 99 9B 81 6B 99 EB
```

---

## 🔍 Reconnaissance

**Step 1: Parse the clue**

Three words matter: **byte** (values 0-255), **bit-shift** (one of
`<<`, `>>`, rotate-left, rotate-right), **every byte** (the same
operation applied uniformly, not per-byte). That last part is what
makes the puzzle tractable: a uniform transform means only
4 operations × 8 shift-amounts = **32 total possibilities** to check,
instead of an astronomical per-byte search space.

---

## ⚔️ Attack Process

**Step 1: Brute-force the 32 candidates**

For each of the 4 operations and each shift amount 1-7, applied the
inverse transform to all 24 bytes and checked whether the result was
uniformly printable ASCII: the filter that collapses 32 candidates
down to the handful that could plausibly be a flag.

**Step 2: Confirm the operation**

The stored bytes turned out to be the original ASCII bytes shifted
**left by 3** (`<< 3`, truncated to 8 bits). To reverse it per byte:

```python
plaintext[i] = (s >> 3) | ((s & 0b111) << 5)
```

**Sanity check on the first byte:**
`0x1A` = `0b00011010` → `(s >> 3)` = `0x03`, `(s & 0b111) << 5` = `0x40`
→ OR'd together = `0x43` = `'C'` ✅: matches the expected flag prefix.

**Step 3: Decode all 24 bytes**

```python
data = bytes.fromhex(
    "1AA232DB138 9A3FAA943 8933A3FA89A9FAA1BB999B816B99EB"
    .replace(" ", "")
)
plain = bytes(((b >> 3) | ((b & 0b111) << 5)) for b in data)
print(plain.decode())
```

---

## 🚩 Flag
```
CTF{b**_5****t_**_4******3}
```

---

## 💡 Lessons Learned

- "Every byte" in a challenge description is a load-bearing phrase: it
  turns an unsolvable per-byte search into a 32-candidate brute force
- Shifting is destructive (bits fall off the end), so a naive `>> 3`
  alone won't recover the original byte: the bits that shifted off the
  top have to be rotated back in from the bottom (`(s & 0b111) << 5`)
- Filtering brute-force candidates by "does this decode to printable
  ASCII" is a fast, reliable way to collapse a small search space down
  to the real answer without needing the exact operation named upfront

---

## 🛠️ Tools Used

- **Python 3**: brute force and byte-level inversion

---

*Solved during Cybersecurity Hackathon 2026: legal, authorized CTF environment*
