---
tags: [ctf, crypto, classical]
created: 2026-05-01
---

# 🏛 Classical Ciphers

> รหัสคลาสสิกคือรหัสที่ใช้ก่อนยุคคอมพิวเตอร์: มักง่ายต่อการ crack ด้วยคอมพิวเตอร์สมัยใหม่: ใน CTF ใช้เป็นโจทย์ "warmup" หรือ stego

ความสามารถสำคัญ: **ระบุประเภทรหัส** จาก ciphertext แล้วใช้ tool ถอด

---

## 🛠 Tools มาตรฐาน

- **CyberChef** ⭐: gchq.github.io/CyberChef
- **dCode** ⭐: dcode.fr (รู้จักกว่า 100+ ciphers)
- **Quipqiup**: quipqiup.com (auto solve substitution)
- **Cryptii**: cryptii.com
- **decode.fr** สำหรับ frequency analysis

---

## 1. Caesar Cipher (Shift cipher)

แต่ละตัวอักษร shift ไปตำแหน่งคงที่
```
Plain:  A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
Shift3: D E F G H I J K L M N O P Q R S T U V W X Y Z A B C

"HELLO" + shift 3 = "KHOOR"
```

### Crack
มี 26 keys → brute force ทุกตัว
```python
text = "KHOOR"
for shift in range(26):
    print(shift, ''.join(chr((ord(c)-65-shift)%26+65) for c in text))
```

### Variants
- **ROT13** = Caesar shift 13 (self-inverse: encode 2 ครั้ง = original)
- **ROT47** = shift 47 ใน ASCII printable (33-126)

CyberChef: ROT13, ROT47, "Bruteforce Caesar"

---

## 2. Atbash

แทนตัวอักษรด้วย mirror:
```
A→Z, B→Y, C→X, ... M→N
```

```python
text = "HELLO"
result = ''.join(chr(155 - ord(c)) for c in text.upper())   # 155 = 'A'+'Z'
print(result)  # SVOOL
```

---

## 3. Vigenère Cipher

ใช้ **key word** repeat: แต่ละตัว shift ตาม key
```
Plain: ATTACKATDAWN
Key:   LEMONLEMONLE
Cipher: LXFOPVEFRNHR
```

### Crack
1. **หา key length**: Kasiski examination หรือ Index of Coincidence
2. แต่ละ position (mod key_length) เป็น Caesar เดี่ยว → frequency analysis

```python
# ใช้ tool
# https://www.dcode.fr/vigenere-cipher
```

CyberChef → "Vigenere Decode"

### Variants
- **Beaufort**: variant ของ Vigenere
- **Autokey**: key = key + plaintext (rolling)

---

## 4. Substitution Cipher (Monoalphabetic)

แต่ละตัวอักษรแทนด้วยตัวอักษรอื่นคงที่
```
A→K, B→Q, C→L, ... (random map)
```

### Crack
**Frequency analysis**: ใน English:
- ตัวที่ใช้บ่อยสุด: E (12.7%), T (9%), A (8%), O (7.5%)
- ใน ciphertext หา frequency → match

หรือใช้ tool autosolve:
- **quipqiup.com** ⭐
- **CrypTool**

```python
# Frequency analysis
from collections import Counter
text = "..."
counter = Counter(c for c in text if c.isalpha())
print(counter.most_common())
```

---

## 5. Transposition Ciphers

ตัวอักษรเดิม แต่จัดเรียงใหม่

### Rail Fence
```
Plain:  HELLO WORLD
Rails: 3

H . . . O . . . R . .
. E . L . W . O . L .
. . L . . . . . . . D

Cipher: HOR ELWOL LD
```

### Columnar Transposition
ใส่ใน grid: อ่านลงตามคอลัมน์ตาม key

### Tool
- CyberChef: Rail Fence Cipher Decode, Columnar Transposition

---

## 6. Polybius Square

ใช้ตาราง 5x5 (รวม I/J)
```
   1 2 3 4 5
1  A B C D E
2  F G H I/J K
3  L M N O P
4  Q R S T U
5  V W X Y Z

H = 23, E = 15
"HELLO" = 23 15 31 31 34
```

### Variants
- **ADFGVX** (WW1 German): ใช้ตัวอักษร ADFGVX แทนเลข + transposition

---

## 7. Bacon's Cipher

ใช้ A/B 5 ตัวต่อ 1 ตัวอักษร
```
A = AAAAA, B = AAAAB, C = AAABA, ...

ใช้ encode: a → AAAAA, b → AAAAB, ...
หรือเข้ารหัสในข้อความปกติด้วย caps/font
```

ใน CTF บางที hide ใน font หรือ visible/invisible character

---

## 8. Affine Cipher

`E(x) = (a*x + b) mod 26`

```python
def encrypt(text, a, b):
    return ''.join(chr(((a*(ord(c)-65)+b) % 26) + 65) for c in text.upper() if c.isalpha())
```

### Crack
26*12 = 312 keys (a ต้อง coprime กับ 26: มี 12 ค่า) → brute force

---

## 9. Hill Cipher

ใช้ matrix multiplication mod 26: block-based

ต้อง crack ด้วย linear algebra (known plaintext attack)

---

## 10. Playfair

ใช้ 5x5 grid + bigram (2 ตัวอักษร) แทนกัน: historical แต่เจอใน CTF

---

## 11. Modern "ตลก" Ciphers ที่เจอใน CTF

### Pigpen / Freemason
ใช้ symbol แทนตัวอักษรตามตำแหน่งใน grid + dot
- dCode รู้จัก

### Morse Code
```
.-  -...  -.-.  ...
A   B     C    S
```
CyberChef: "From Morse Code"

### Braille
ตัวอักษร 6 จุด

### Semaphore
ธงสัญญาณ: มักใน OSINT challenge

### Tap Code (POW)
```
1,1 = A    1,2 = B   ...   5,5 = Z (no K)
```

### Baconian / Bilateral

### A1Z26
A=1, B=2, ..., Z=26
"1 2 3 4 5" → "ABCDE"

---

## 🔢 Encoding (ไม่ใช่ encryption แต่เจอบ่อย)

### Base encodings
- **Base64**: ตัวอักษร A-Z, a-z, 0-9, +, / + padding `=`
- **Base32**: A-Z, 2-7
- **Base16 / Hex**: 0-9, A-F
- **Base85 / ASCII85**: printable
- **Base58**: Bitcoin (no 0, O, I, l)
- **Base91, Base92, Base122**: exotic
- **Base64URL**: `+` → `-`, `/` → `_`

### Detection
- Base64 = `[A-Za-z0-9+/=]+`, divisible by 4 (with padding), often `==` or `=` ตอนท้าย
- Hex = only `[0-9a-fA-F]`
- Base32 = `[A-Z2-7]+`, ลงท้าย `=`

### URL Encoding
```
%20 = space
%2F = /
%3D = =
```

### HTML Entity
```
&lt; = <
&gt; = >
&amp; = &
&#65; = A
```

### Unicode/UTF-8
- `\u00xx` escape
- Punycode (xn--)

---

## 🎯 Workflow ใน CTF

```
1. ดู ciphertext format
   - มี base64-like? → decode base64
   - hex? → decode hex
   - มีแต่ A-Z? → substitution/Caesar
   - มี space + word? → ดูคำเหมือนภาษาอังกฤษไหม
   - random? → frequency analysis

2. ใส่ใน CyberChef → "Magic" feature → auto detect

3. ลอง dcode.fr → identifier

4. ถ้าซ้อน: decode หลายรอบ
```

### Magic Operation ใน CyberChef
ลาก "Magic" operation: มันลองหลาย decoding อัตโนมัติ: ใช้สำหรับ "เริ่มต้น" ดี

---

## 🔍 Identifier Tools

### dCode "Cipher Identifier"
- dcode.fr/cipher-identifier
- Paste ciphertext → AI guess

### Boxentriq
- boxentriq.com/code-breaking/cipher-identifier

### Online frequency analysis
- planetcalc.com/8045

---

## 🏆 ตัวอย่าง CTF

### Challenge: ciphertext = "fbygt{j_qrhfkr_n_pjflbgr_jb_l}_"
```
1. Format flag: ?_qrhfkr...     → looks like flag{...}
2. ROT bruteforce → ROT13: "spell{w_demand_a_cyalove_wo_y}_" 
3. ROT-other → ตรง flag
```

### Challenge: ciphertext = "U2FsdGVkX1+..."
```
ขึ้นต้น "U2FsdGVkX1" = base64 ของ "Salted__"
→ OpenSSL encrypted (AES with password)
→ ลอง bruteforce password
```

---

## 📚 References
- CyberChef: gchq.github.io/CyberChef
- dCode: dcode.fr
- Boxentriq: boxentriq.com
- CTFlearn Cryptography section

## 🔗 ต่อไป

- ขึ้น [Symmetric: AES, DES](Symmetric-Crypto.md)
- หรือ [Asymmetric: RSA](Asymmetric-Crypto.md)
- [Hash-Attacks](Hash-Attacks.md)

---

#ctf #crypto #classical
