---
tags: [ctf, crypto, rsa, math]
created: 2026-05-01
---

# 🏛 RSA Attacks ละเอียด

> RSA ปลอดภัยถ้าทำถูก: แต่มี **edge case** เยอะมากที่ทำพังได้ใน CTF

ทุก RSA challenge ใน CTF ต้องเริ่มที่: **มีค่าอะไรให้บ้าง: งจะ exploit weakness แบบไหน**

---

## 📋 RSA Quick Reference

```
n = p * q
φ(n) = (p-1)(q-1)
e * d ≡ 1 (mod φ(n))

Encrypt: c = m^e mod n
Decrypt: m = c^d mod n
```

ถ้ารู้ `p, q` → คำนวณ `d` → decrypt ได้

→ **RSA broken เกือบหมด อยู่ที่ "factor n"**

---

## 🎯 Decision Tree

ดูว่า challenge ให้อะไรมา → เลือก attack:

```
ให้: n, e, c
├── n เล็ก (< 256 bit)        → factor ตรงๆ (factordb, msieve)
├── n มี factor เล็ก           → trial division / Pollard rho
├── p ≈ q (ใกล้กัน)            → Fermat factorization
├── e เล็ก (e=3) + m^e < n      → Cube root attack
├── e เล็ก + 3 ciphertexts ของ m → Hastad's broadcast attack
├── d เล็ก (private key)        → Wiener's attack / Boneh-Durfee
├── 2 keys ใช้ n เดียวกัน + e ต่าง → Common modulus attack
├── known partial m or partial p → Coppersmith
└── padding oracle (PKCS#1v1.5)  → Bleichenbacher
```

---

## 🔧 RsaCtfTool ⭐ ลองก่อนเสมอ

```bash
git clone https://github.com/RsaCtfTool/RsaCtfTool
cd RsaCtfTool

# Auto try ทุก attack
python3 RsaCtfTool.py --publickey pub.pem --uncipherfile cipher.txt

# Specify n, e
python3 RsaCtfTool.py -n <n> -e <e> --uncipher <c>

# List attacks
python3 RsaCtfTool.py --attack all
```

ลอง RsaCtfTool ก่อน: auto detect weakness ส่วนใหญ่

---

## 1. Factor Small N

### factordb.com
ฐานข้อมูล public ของ factorization: ถ้า `n` ของเราเป็น "famous" (จาก challenge เก่า): คำตอบมีอยู่
```bash
curl "http://factordb.com/api?query=<n>"
```

### Tools
```bash
# yafu (เร็วสำหรับ ~256-bit)
yafu "factor(<n>)"

# msieve
msieve -v <n>

# CADO-NFS (สำหรับ > 512 bit ในระดับ research)
```

### Sage
```python
sage: factor(n)
```

---

## 2. Pollard's Rho: N มี factor เล็ก

ถ้า `p` หรือ `q` < ~2^60 → Pollard rho เร็วมาก

```python
from sympy import factorint
factorint(n)
```

---

## 3. Fermat Factorization: p ≈ q

ถ้า `p` กับ `q` ใกล้กัน → `n = p*q ≈ ((p+q)/2)^2`

```python
import gmpy2

def fermat(n):
    a = gmpy2.isqrt(n) + 1
    while True:
        b2 = a*a - n
        if gmpy2.is_square(b2):
            b = gmpy2.isqrt(b2)
            return int(a-b), int(a+b)
        a += 1

p, q = fermat(n)
```

---

## 4. Pollard's p-1: p-1 smooth

ถ้า `p-1` มี factor เล็กๆ ทั้งหมด (B-smooth) → Pollard p-1 work
```python
# RsaCtfTool มี --attack pollard_p_1
```

---

## 5. Williams' p+1: p+1 smooth

คล้าย p-1 แต่กับ p+1
```python
# RsaCtfTool --attack williams_p_1
```

---

## 6. Cube Root Attack: Small e + Small m

ถ้า `e = 3` และ `m^3 < n`:
```
c = m^3 mod n = m^3   (ไม่มี mod เพราะ m^3 < n)
m = ³√c
```

```python
import gmpy2
m = gmpy2.iroot(c, 3)[0]
print(long_to_bytes(int(m)))
```

ใช้ตอน:
- `e = 3` (small)
- `m` (message) สั้น: เช่น short string + no padding

### Hastad's Broadcast Attack
ถ้าผู้ส่งคนเดียว ส่ง `m` เดียวกัน ไปยัง 3 ผู้รับที่ใช้ `e = 3` แต่ `n` ต่างกัน:
```
c1 = m^3 mod n1
c2 = m^3 mod n2
c3 = m^3 mod n3
```

ใช้ **Chinese Remainder Theorem (CRT)** หา `m^3 mod (n1*n2*n3)`: แต่ `m^3 < n1*n2*n3` → recover `m^3` → cube root

```python
from sympy.ntheory.modular import crt

m_cubed, _ = crt([n1, n2, n3], [c1, c2, c3])
m = gmpy2.iroot(int(m_cubed), 3)[0]
```

---

## 7. Wiener's Attack: Small d

ถ้า `d < n^0.25 / 3` → recover `d` ผ่าน continued fractions ของ `e/n`

```python
# RsaCtfTool --attack wiener
# หรือใช้ owiener library
import owiener
d = owiener.attack(e, n)
```

---

## 8. Boneh-Durfee: Slightly larger d

ดีกว่า Wiener: work เมื่อ `d < n^0.292`

ใช้ lattice attack (LLL): Sage script

---

## 9. Common Modulus Attack: เดิม n, e ต่าง

ถ้า message เดียวกัน encrypted ด้วย `e1`, `e2` (n เดียวกัน):
```
c1 = m^e1 mod n
c2 = m^e2 mod n
```

ถ้า `gcd(e1, e2) = 1`:
- หา `a, b` ที่ `a*e1 + b*e2 = 1` (Extended Euclidean)
- `m = c1^a * c2^b mod n`

```python
from gmpy2 import gcdext, invert, mpz

def common_modulus(c1, c2, e1, e2, n):
    g, a, b = gcdext(e1, e2)
    if a < 0:
        c1 = invert(c1, n)
        a = -a
    if b < 0:
        c2 = invert(c2, n)
        b = -b
    return pow(c1, a, n) * pow(c2, b, n) % n

m = common_modulus(c1, c2, e1, e2, n)
```

---

## 10. Coppersmith's Attack

หา root ของ polynomial mod `n` ที่ root เล็ก

### A. Stereotype Message
ถ้ารู้ `m = M_known + x` (เช่น "flag is XXXXX" ที่รู้ prefix แล้ว)
→ poly: `(M_known + x)^e ≡ c (mod n)`: solve `x` ถ้า `x < n^(1/e)`

### B. Partial Key Exposure
ถ้ารู้ bits บนของ `p` → recover `p` ทั้งหมด

### Sage code
```python
n = ...
e = 3
known_prefix = b"flag is "
known_int = bytes_to_long(known_prefix + b"\x00" * unknown_len)

PR.<x> = PolynomialRing(Zmod(n))
f = (known_int + x)^e - c
roots = f.small_roots(X=2^(unknown_bits), beta=1)
```

---

## 11. Bleichenbacher's Attack: PKCS#1 v1.5 Padding Oracle

ถ้า server เปิดเผยว่า "PKCS#1 padding ถูกหรือไม่" → recover plaintext ทีละ ~1M queries

→ เคยทำให้ TLS 1.0 broken
→ **ROBOT attack** (2017): ปรากฏซ้ำใน TLS impl ที่ไม่ตรง spec

ในการแข่ง CTF: implement attack จาก paper หรือใช้ PoC tools

---

## 12. Modular Inverse Attack: เดิม e, d ที่รั่ว

ถ้ารู้ `e, d` → คำนวณ `n` ได้ (ใน edge case)
```
e*d - 1 = k * φ(n) สำหรับ k บางค่า
```
→ factor `n` ผ่าน random base test (Miller-Rabin-like)

---

## 13. ROCA Attack (CVE-2017-15361): Infineon RSA keys

Hardware ของ Infineon (TPM, smartcard) gen primes แบบมีโครงสร้างพิเศษ → ทำให้ factor ได้

→ ตรวจสอบ: tool **roca-detect**

---

## 14. Approximate GCD

ถ้า `n1 = p * q1`, `n2 = p * q2` (share `p`):
```
gcd(n1, n2) = p
```
→ check ทุก pair ของ `n` ใน CTF

---

## 🎯 Padding Schemes: รู้ไว้

### Textbook RSA (no padding)
- `c = m^e mod n`: vulnerable มาก
- Deterministic: same `m` → same `c` (chosen plaintext attack)

### PKCS#1 v1.5
- Pad: `00 02 [random non-zero] 00 [data]`
- Vulnerable to Bleichenbacher

### OAEP (Optimal Asymmetric Encryption Padding) ⭐ Modern
- Random salt + masking: secure ปัจจุบัน

### PSS (for signatures)
- Random salt: provably secure

---

## 🛠 Useful Python Recipes

### Convert bytes ↔ int
```python
from Crypto.Util.number import bytes_to_long, long_to_bytes
n_int = bytes_to_long(b"hello")
back = long_to_bytes(n_int)
```

### Modular inverse
```python
from gmpy2 import invert
d = invert(e, phi)
```

หรือ Python 3.8+:
```python
d = pow(e, -1, phi)
```

### Read PEM
```python
from Crypto.PublicKey import RSA
key = RSA.import_key(open('pub.pem').read())
n, e = key.n, key.e
```

### CRT
```python
def chinese_remainder(n_list, a_list):
    from functools import reduce
    N = reduce(lambda a,b: a*b, n_list)
    result = 0
    for n, a in zip(n_list, a_list):
        Ni = N // n
        result += a * Ni * pow(Ni, -1, n)
    return result % N
```

### Decrypt with p, q
```python
phi = (p-1) * (q-1)
d = pow(e, -1, phi)
m = pow(c, d, n)
print(long_to_bytes(m))
```

### CRT speed-up decryption (ใช้ p, q แยก)
```python
dp = d % (p-1)
dq = d % (q-1)
qinv = pow(q, -1, p)

m1 = pow(c, dp, p)
m2 = pow(c, dq, q)
h = (qinv * (m1 - m2)) % p
m = m2 + h * q
```

---

## 🎯 CTF Workflow

```
1. Parse pub.pem → ได้ n, e
   openssl rsa -pubin -in pub.pem -text -noout

2. ดู cipher format: base64? hex? raw?

3. ลอง factordb.com: ลอง 30 วินาที

4. ลอง RsaCtfTool ทุก attack: ลอง 5 นาที

5. ถ้าไม่ work → ดู challenge อีกที
   - มี hint อะไรเกี่ยวกับ key generation?
   - e ค่าเท่าไหร่? (3, 5, 65537?)
   - มี source code?: ดู logic
   - มี ciphertext หลายอัน?: common modulus / Hastad?
   - มี oracle?: Bleichenbacher / LSB oracle?

6. ระบุ attack → implement หรือ chain
```

---

## 📚 References

- RsaCtfTool: github.com/RsaCtfTool/RsaCtfTool
- factordb.com
- CryptoHack RSA challenges (ดีมาก!)
- "Twenty Years of Attacks on the RSA Cryptosystem": Boneh 1999
- David Wong's "Real-World Cryptography"

## 🔗 ที่เกี่ยวข้อง

- [Asymmetric-Crypto](Asymmetric-Crypto.md)
- [Hash-Attacks](Hash-Attacks.md)
- [AES-Attacks](AES-Attacks.md)

---

#ctf #crypto #rsa #math
