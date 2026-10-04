---
tags: [ctf, crypto, symmetric, aes, des]
created: 2026-05-01
---

# 🔐 Symmetric Cryptography

> **Symmetric** = encrypt + decrypt ใช้ key เดียวกัน → เร็ว แต่ต้องแชร์ key ปลอดภัย

---

## 🧩 Modern Symmetric Ciphers

### AES (Advanced Encryption Standard) ⭐
- Block cipher: block ขนาด 128 bits (16 bytes)
- Key sizes: 128, 192, 256 bits
- Mode of operation สำคัญมาก (ECB, CBC, CTR, GCM)

### DES / 3DES
- DES: 56-bit key: เก่า ถูก crack แล้ว
- 3DES: 168-bit (effective 112-bit): ยังเห็นในระบบเก่า

### ChaCha20 / Salsa20
- Stream cipher: เร็วใน software
- ChaCha20-Poly1305 = AEAD (auth + encrypt)

### RC4
- Stream cipher เก่า: broken แล้ว แต่เจอใน CTF

---

## 🎛 Modes of Operation

นี่คือ **หัวใจของโจทย์ AES ใน CTF**: algorithm ดี แต่ใช้ mode ผิด → broken

### ECB (Electronic Codebook): แย่ที่สุด ⚠️
- แต่ละ block encrypt อย่างอิสระ
- Plaintext ที่เหมือนกัน → ciphertext เหมือนกัน
- **Pattern leak**

```
Plain block: "AAAAAAAAAAAAAAAA" "BBBBBBBBBBBBBBBB" "AAAAAAAAAAAAAAAA"
Cipher:      [X]                 [Y]                 [X]   ← ซ้ำ
```

**ภาพ "ECB Penguin"**: encrypt รูป Tux ใน ECB → ยังเห็นรูปเพ็นกวินอยู่!

#### ECB Attacks
1. **Pattern detection**: หา block ซ้ำ
2. **Block swapping**: สลับ block → ความหมายเปลี่ยน
3. **Byte-at-a-time decryption (Oracle)**: ถ้าเรา append plaintext ก่อน secret + encrypt → ดูได้

```python
# ECB Byte-at-a-time
# สมมติ encrypt(input + secret) ใช้ ECB

# 1. หาขนาด block
for i in range(1, 50):
    enc = encrypt('A' * i)
    if has_duplicate_blocks(enc):
        BLOCK_SIZE = i // 2
        break

# 2. recover ทีละ byte
known = b''
for pos in range(SECRET_LEN):
    pad = b'A' * (BLOCK_SIZE - 1 - len(known) % BLOCK_SIZE)
    target = encrypt(pad)[block(pos)]
    
    for c in range(256):
        guess = pad + known + bytes([c])
        if encrypt(guess)[block(pos)] == target:
            known += bytes([c])
            break
```

### CBC (Cipher Block Chaining)
- แต่ละ block XOR กับ ciphertext ก่อนหน้า → encrypt
- IV (Initialization Vector) สำหรับ block แรก

```
C[i] = E(P[i] XOR C[i-1])
C[0] = E(P[0] XOR IV)
```

#### CBC Attacks
1. **Bit-flipping**: เปลี่ยน C[i-1] → P[i] เปลี่ยน ตามที่ต้องการ
2. **Padding Oracle**: ดู [AES-Attacks](AES-Attacks.md)
3. **IV reuse**: ถ้า IV คงที่ → คล้าย ECB partial

##### CBC Bit-flipping detail
```
P[i] = D(C[i]) XOR C[i-1]

ถ้าต้อง P'[i] (ค่าเป้าหมาย):
  C'[i-1] = C[i-1] XOR P[i] XOR P'[i]
```

ตัวอย่าง: cookie `role=user` (encrypted CBC) → flip bit ให้เป็น `role=admin`
```python
old = b'role=user&id=1'
new = b'role=admin&id=1'

for i in range(len(old)):
    new_iv[i] = iv[i] ^ old[i] ^ new[i]
```

### CTR (Counter Mode)
- เปลี่ยน block cipher → stream cipher
- `C[i] = P[i] XOR E(nonce || counter[i])`
- Parallelizable (เร็ว)

#### CTR Attack: nonce reuse ⚠️
ถ้า nonce/counter ซ้ำกัน 2 ครั้ง:
```
C1 = P1 XOR keystream
C2 = P2 XOR keystream

C1 XOR C2 = P1 XOR P2     ← keystream หาย!
```
ถ้ารู้ P1 → recover P2

→ ใช้กับ stream ciphers ทุกตัว (RC4, ChaCha20 ก็มี)

### GCM (Galois/Counter Mode)
- CTR + Authentication tag (Poly1305-like)
- AEAD = Authenticated Encryption with Associated Data
- ปัจจุบันใช้กันแพร่หลาย

#### GCM nonce reuse: catastrophic
- Nonce ซ้ำ → leak authentication key → forge messages

### OFB (Output Feedback)
ผลิต keystream คล้าย CTR: ใช้น้อย

### CFB (Cipher Feedback)
ผลิต keystream คล้าย CTR: ใช้น้อย

---

## 📐 Padding (PKCS#7)

CBC/ECB ต้อง pad plaintext ให้ block size หาร: PKCS#7 = pad ด้วย byte ที่ค่าเท่ากับจำนวน byte ที่ pad

```
Block size 16:
plaintext "HELLO" (5 bytes)
→ "HELLO" + \x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b   (11 bytes ของ 0x0b)
```

ถ้า plaintext = block size พอดี → pad full block ของ `\x10\x10...`

### Padding Oracle Attack: ดูเต็มใน [AES-Attacks](AES-Attacks.md)
ถ้า server เปิดเผยว่า padding ถูก/ผิด → recover plaintext ทีละ byte

---

## 🔓 Stream Ciphers

### XOR (basic: เจอใน CTF บ่อย)
```
C = P XOR K
P = C XOR K
```

#### Single-byte XOR: brute force ทุก key (256 ค่า)
```python
ct = bytes.fromhex("...")
for k in range(256):
    pt = bytes(c ^ k for c in ct)
    if all(32 <= b < 127 for b in pt):
        print(k, pt)
```

#### Repeating-key XOR
ถ้า key = `KEY` (3 bytes): ciphertext repeat XOR cycle

##### Crack
1. **หา key length**: Hamming distance / autocorrelation
2. แต่ละ position ใน cycle = single-byte XOR → solve

```python
# Hamming distance method
def hamming(a, b):
    return sum(bin(x^y).count('1') for x,y in zip(a,b))

ct = open('ct','rb').read()
distances = {}
for keylen in range(2, 40):
    chunks = [ct[i:i+keylen] for i in range(0, len(ct), keylen)]
    if len(chunks) < 4: continue
    avg = sum(hamming(chunks[i], chunks[i+1]) for i in range(3)) / 3 / keylen
    distances[keylen] = avg

# key length = ค่า keylen ที่ distance ต่ำสุด
```

#### Known plaintext
ถ้ารู้ plaintext บางส่วน → XOR กับ ciphertext ตำแหน่งเดียวกัน → key ส่วนนั้น

### RC4: broken
- WEP, old TLS: bias ใน keystream

---

## 🎯 ใน CTF

### Pattern 1: ECB Penguin / Block analysis
ภาพ encrypted → ดูใน ECB mode → pattern ของ original ยังเห็น

### Pattern 2: CBC Bit-flipping cookies
```
cookie = encrypt_CBC("role=user&id=1234", key)
```
flip bits ใน IV/prev block → "role=admin&id=1234"

### Pattern 3: Padding Oracle
Server return ต่างกันถ้า padding ผิด → ดู [AES-Attacks](AES-Attacks.md)

### Pattern 4: Nonce reuse (CTR/GCM)
2 ciphertexts, same nonce: XOR กัน → P1 XOR P2 → solve via crib dragging

### Pattern 5: Single-byte XOR / Repeating XOR
challenge: ciphertext มัน hex/base64: XOR brute force

---

## 🛠 Tools

### CyberChef
AES/DES/RC4 mode all: drag-and-drop

### Python (PyCryptodome)
```python
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad

key = b'\x00' * 16
iv = b'\x00' * 16

cipher = AES.new(key, AES.MODE_CBC, iv)
ct = cipher.encrypt(pad(b"plaintext", 16))

cipher2 = AES.new(key, AES.MODE_CBC, iv)
pt = unpad(cipher2.decrypt(ct), 16)
```

### OpenSSL CLI
```bash
echo "ciphertext_b64" | openssl enc -d -aes-256-cbc -K <hex> -iv <hex> -base64
```

---

## 🛡 How to Fix (defensive)

1. **AES-GCM** หรือ **ChaCha20-Poly1305**: AEAD
2. **Random IV/nonce** ทุกครั้ง: ห้ามซ้ำ
3. **อย่าใช้ ECB** เด็ดขาด
4. **Auth ก่อน Decrypt**: Encrypt-then-MAC
5. **Constant-time comparison**: กัน timing oracle
6. **Use library**: libsodium, NaCl: high-level API ปลอดภัย

---

## 🔗 ต่อไป

- [AES Attacks ละเอียด: Padding Oracle, etc.](AES-Attacks.md)
- [RSA, ECC](Asymmetric-Crypto.md)
- [Hash-Attacks](Hash-Attacks.md)

## 📚 References
- Cryptopals (Matasano): cryptopals.com (challenge ที่สอน symmetric ลึก)
- CryptoHack: cryptohack.org

---

#ctf #crypto #symmetric #aes
