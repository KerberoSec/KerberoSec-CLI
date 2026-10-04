# 🧩 Challenge: Back in 90s

**Category:** General

**Points:** 300

---

### 🔖 Challenge Description

> Lol, this is exactly how televisions were back in days.

---

### 🧭 Initial Reconnaissance (aka "bring back the CRT vibes")

I downloaded the provided [chall.txt](./chall.txt) file and opened it: the content was just a giant matrix of 1s and 0s. Immediately, it reminded me of old black-and-white TV pixels from the 90s. My first thought: maybe `1` represents black and `0` white. So, time to render it visually.

---

### 🔍 Analysis & Enumeration (aka "turn bits into pixels")

Since each line looked structured, I wrote a short Python script to print black (`█`) for `1` and space for `0`. This should help visualize any hidden pattern: possibly a QR code.

```python
# decoder.py
with open("./chall.txt", "r") as f:
    data = f.read()

for line in data.splitlines():
    print("".join("█" if c == "1" else " " for c in line))
```

Running it filled my terminal with a clean blocky QR pattern: nostalgia achieved.

---

### ⚙️ Exploitation Process (render → scan → profit)

Once the QR appeared, I scanned it using **Google Lens**, which revealed the encoded flag text inside.

# Files involved

- [chall.txt](./chall.txt)
- `decoder.py`

---

### 🏁 Flag

```
zero{w0w_s0_y0u_r34Lly_f1Gur3_tH15_0u7_6c4d201a9e22fd}
```

---

### 💡 Takeaways

- Binary data often hides visual patterns: always try rendering it.
- A few lines of Python can turn noise into clarity.
- The 90s might’ve been pixelated, but the flags are still sharp.

---

**Solved by TheM3chanik: [contact@them3chanik.com](mailto:contact@them3chanik.com)**
