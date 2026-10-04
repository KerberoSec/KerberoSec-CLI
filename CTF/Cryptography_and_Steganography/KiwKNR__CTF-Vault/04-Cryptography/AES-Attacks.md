---
tags: [ctf, crypto, aes, padding-oracle]
created: 2026-05-01
---

# 🔓 AES Attacks ละเอียด

> AES algorithm เองยัง unbroken: แต่ **mode of operation** + implementation มี attack เยอะมาก

ดู [Symmetric-Crypto](Symmetric-Crypto.md) สำหรับ overview ของ modes: ที่นี่เจาะลึก attacks เฉพาะ

---

## 🎯 Attack Decision Tree

```
ให้ ciphertext + oracle:
├── Server เปิดเผย "padding ถูก/ผิด" (CBC) → Padding Oracle
├── เรา append plaintext ก่อน secret + ECB → Byte-at-a-time
├── เรา flip bytes ใน IV/prev block (CBC) → Bit-flipping
├── 2 ciphertexts ใช้ nonce/IV เดียวกัน (CTR/GCM) → Nonce reuse
└── Encrypt ของ plaintext เราเอง → Chosen-plaintext attacks (CPA)
```

---

## 1️⃣ Padding Oracle Attack (CBC) ⭐ Classic

### Setup
- Server ใช้ AES-CBC + PKCS#7 padding
- Server return error ที่ต่างกัน หรือ behavior ต่างกัน เมื่อ padding ผิด vs ถูก

### Concept
ใน CBC: `P[i] = D(C[i]) XOR C[i-1]`

ถ้าเราคุม `C[i-1]` (เปลี่ยนได้): ส่ง `(C'[i-1], C[i])` → ดู padding error ของ `P[i] = D(C[i]) XOR C'[i-1]`

ลองทุกค่าของ last byte ของ `C'[i-1]` (256 ค่า): มีตัวที่ทำให้ padding ถูก = 1 (เป็น `\x01`) หรือ 256 (เป็น `\x10\x10...`) → recover last byte ของ `D(C[i])`

จาก `D(C[i])` → recover `P[i] = D(C[i]) XOR C[i-1]` (real C[i-1])

### ทำไม work
PKCS#7 padding = byte ที่ค่าเท่ากับจำนวน byte ที่ pad
- 1 byte pad → `\x01`
- 2 byte pad → `\x02\x02`
- ...
- 16 byte pad (full block) → `\x10` x 16

→ `P[i]` ที่ valid padding มี behavior ต่างจาก invalid

### Algorithm
```python
def padding_oracle_attack(ct, iv, oracle, BLOCK=16):
    """
    ct: ciphertext (concatenated blocks)
    iv: IV
    oracle(iv, ct) → True if padding OK
    """
    blocks = [iv] + [ct[i:i+BLOCK] for i in range(0, len(ct), BLOCK)]
    plaintext = b''
    
    for blk_idx in range(1, len(blocks)):
        target = blocks[blk_idx]
        prev = blocks[blk_idx - 1]
        
        intermediate = [0] * BLOCK     # = D(target)
        recovered = [0] * BLOCK
        
        for byte_idx in range(BLOCK - 1, -1, -1):
            pad_val = BLOCK - byte_idx
            
            for guess in range(256):
                # Construct fake prev block
                fake_prev = bytearray(BLOCK)
                
                # Set known bytes ที่ recover แล้ว
                for j in range(byte_idx + 1, BLOCK):
                    fake_prev[j] = intermediate[j] ^ pad_val
                
                # Set guess
                fake_prev[byte_idx] = guess
                
                if oracle(bytes(fake_prev), target):
                    # Edge case: ensure ไม่เป็น false positive
                    # โดย flip byte ก่อน: ถ้า padding ยัง valid = real
                    if byte_idx > 0:
                        fake_prev2 = bytearray(fake_prev)
                        fake_prev2[byte_idx - 1] ^= 1
                        if not oracle(bytes(fake_prev2), target):
                            continue
                    
                    intermediate[byte_idx] = guess ^ pad_val
                    recovered[byte_idx] = intermediate[byte_idx] ^ prev[byte_idx]
                    break
        
        plaintext += bytes(recovered)
    
    return plaintext
```

### Tools
- **PadBuster**: `padbuster <URL> <encrypted_sample> <block_size> [options]`
- **padding-oracle-attacker** (npm)
- **Python custom script** (ดูข้างบน)

### CTF Pattern
1. เจอ encrypted cookie/parameter ที่เป็น CBC ciphertext
2. ทดลอง: ส่ง garbage → ดู error message ต่าง
3. Flip byte → padding error
4. Confirm ว่า oracle work → run attack
5. Recover plaintext

---

## 2️⃣ ECB Byte-at-a-time Decryption

### Setup
- Server: `encrypt_ecb(user_input || SECRET, key)`: ใช้ ECB
- เราคุม user_input → controlled prefix ก่อน secret

### Concept
ECB = แต่ละ block independent: ถ้า block ทั้งหมดเรารู้ ยกเว้น 1 byte → enumerate 256 ค่าของ byte นั้น → match กับ ciphertext

### Algorithm
```python
def ecb_byteatatime(encrypt_oracle, BLOCK=16):
    """
    encrypt_oracle(prefix) → encrypts (prefix || SECRET)
    """
    # 1. หา block size (ตรงนี้ assume 16)
    
    # 2. หา length ของ secret
    base = len(encrypt_oracle(b''))
    for i in range(1, 32):
        if len(encrypt_oracle(b'A'*i)) > base:
            secret_len = base - i
            break
    
    # 3. Recover ทีละ byte
    known = b''
    while len(known) < secret_len:
        # padding ที่ทำให้ next-byte ของ secret อยู่ตำแหน่งสุดท้ายของ block
        pad_len = (BLOCK - 1) - (len(known) % BLOCK)
        pad = b'A' * pad_len
        
        # block ที่จะเทียบ
        block_idx = len(known) // BLOCK
        target = encrypt_oracle(pad)[block_idx*BLOCK:(block_idx+1)*BLOCK]
        
        # try แต่ละ byte
        for c in range(256):
            guess = pad + known + bytes([c])
            test = encrypt_oracle(guess)[block_idx*BLOCK:(block_idx+1)*BLOCK]
            if test == target:
                known += bytes([c])
                print(known)
                break
    
    return known
```

### ทำไม work
- เรา append `pad + known + c` เป็น prefix
- block ที่มี `[pad][known][c]` → server append secret → block สุดท้าย = `[pad][known][c]` (ก่อน secret)
- เทียบกับ block ของ `encrypt_oracle(pad)` ที่จะเป็น `[pad][secret[0]]`
- → guess `c` = `secret[0]`

### Hard mode: with random prefix
```
encrypt_oracle: encrypts (RANDOM || user_input || SECRET)
```
- หา offset ของ random prefix (ยาวเท่าไหร่)
- pad ให้ block สุดท้ายของ random prefix เต็ม
- จากนั้นทำเหมือนเดิม

---

## 3️⃣ CBC Bit-flipping Attack

### Setup
- App: `cookie = encrypt_CBC("role=user&id=...", key)`
- Decrypt: parse `role=` to determine role
- เราอยาก flip "user" → "admin"

### Concept
ใน CBC: `P[i] = D(C[i]) XOR C[i-1]`

ถ้าเรา flip bit ใน `C[i-1]` → bit ที่ตรงกันใน `P[i]` flip
แต่: `C[i-1]` → `D(C[i-1])` (ถูก decrypt) → จะกลายเป็น garbage → `P[i-1]` พัง

→ trade-off: damage 1 block เพื่อ flip target block

### Code
```python
def bit_flip(iv, ct, old_plain, new_plain):
    """
    Flip block ที่ position 0 (block 0) ผ่าน IV
    """
    # ทุก block ที่ผ่านมา: flip ใน prev_block (หรือ IV สำหรับ block 0)
    diff = bytes(a ^ b for a, b in zip(old_plain, new_plain))
    new_iv = bytes(a ^ b for a, b in zip(iv, diff))
    return new_iv, ct

# Example
iv, ct = encrypt(b"role=user&id=1234")
old = b"role=user&id=12"   # block 0
new = b"role=admin&id=1"   # ขอ: เปลี่ยน user→admin shift id
new_iv, _ = bit_flip(iv, ct, old, new)

# ส่ง new_iv + ct → server decrypt → "role=admin&id=1XXXXXXX"
# block 1 จะเสียหาย: แต่ถ้า server ดูแค่ role= → win
```

### CTF Pattern
1. App ให้ encrypted cookie ที่เริ่มต้น
2. Decode → identify field ที่อยากเปลี่ยน
3. Flip bytes ใน prev block (หรือ IV สำหรับ block 0)
4. Server decrypt → field ที่เราอยากให้เป็น

---

## 4️⃣ Stream Cipher Nonce Reuse (CTR / GCM / RC4)

### Concept
CTR generates keystream = `E(nonce || counter)`
- `C = P XOR keystream`

ถ้า nonce ซ้ำใน 2 messages:
```
C1 = P1 XOR K
C2 = P2 XOR K
C1 XOR C2 = P1 XOR P2     ← keystream cancels out!
```

→ ถ้ารู้ `P1` (หรือเดา) → recover `P2`

### Crib dragging
ถ้าไม่รู้ `P1, P2` เลย: ลอง "drag" common English words:
```
candidate = "the "
for offset in range(len(C1_xor_C2) - len(candidate)):
    test = bytes(c ^ ord(p) for c, p in zip(C1_xor_C2[offset:offset+len(candidate)], candidate))
    if all(c.isprintable() for c in test.decode('latin-1', errors='ignore')):
        print(offset, test)
```

ถ้า test = printable English → ตำแหน่งนั้นใน plaintext ตรงข้ามมีคำคล้าย "the" → ขยายต่อ

### GCM Nonce Reuse: catastrophic
GCM ใช้ nonce ซ้ำ → leak `H = E(0)` → forge MAC ของ message ใดๆ

→ "Forbidden Attack": Sweet32

---

## 5️⃣ Length Extension (ไม่ใช่ AES แต่ใช้กับ MAC)

ดู [Hash-Attacks](Hash-Attacks.md): ใช้ตอน server ใช้ `MAC = H(secret || msg)`

→ defense: ใช้ HMAC

---

## 6️⃣ AES-GCM Specific Attacks

### Truncated tags
ถ้าใช้ tag สั้น (< 96 bit) → forgery ง่ายกว่า

### Forbidden Attack (nonce reuse)
ตามที่บอกแล้ว: ห้าม

---

## 7️⃣ Side-channel: Timing Attacks

ถ้า decryption ใช้เวลาต่างกันตามค่า byte → leak

### Defense
- **Constant-time comparison**: `hmac.compare_digest()` (Python)
- AES-NI hardware (constant-time AES)
- `subtle.ConstantTimeCompare` (Go)

---

## 🎯 ตัวอย่าง CTF Challenges

### Challenge: Padding Oracle
```python
# Server
@app.route('/check')
def check():
    iv = bytes.fromhex(request.args['iv'])
    ct = bytes.fromhex(request.args['ct'])
    try:
        unpad(AES.new(KEY, MODE_CBC, iv).decrypt(ct), 16)
        return "OK"
    except:
        return "Padding error"
```
→ run padding oracle attack → recover secret

### Challenge: ECB byte-at-a-time
```python
@app.route('/encrypt')
def enc():
    user = request.args['s'].encode()
    secret = open('flag.txt','rb').read()
    pt = pad(user + secret, 16)
    return AES.new(KEY, MODE_ECB).encrypt(pt).hex()
```
→ byte-at-a-time recover

### Challenge: CTR nonce reuse
```python
# 2 ciphertexts ที่ encrypt ด้วย nonce 0
ct1 = "..."   # encrypt(plaintext1)
ct2 = "..."   # encrypt(plaintext2)
```
→ XOR → crib drag → recover

### Challenge: CBC bit-flip
```python
# server returns cookie:
# encrypt_CBC("admin=0&user=" + username, key)

# user input "admin=1"
# server escapes & and = → ไม่ work ตรงๆ
# แต่ถ้า escape ไม่สมบูรณ์: flip bytes ใน prev block
```

---

## 🛡 How to Prevent

1. **AEAD ciphers**: AES-GCM, ChaCha20-Poly1305: auth + encrypt
2. **Random IV/nonce**: ทุกครั้ง, never reuse
3. **Encrypt-then-MAC** หรือ AEAD: never decrypt before auth
4. **Constant-time** padding check
5. **อย่าใช้ ECB**
6. **Library** (libsodium, NaCl): abstract away mistake

---

## 🛠 Tools

### PadBuster
```bash
padbuster <URL> <ciphertext_b64> 16 -cookies "session=..."
```

### Python (custom)
ใช้ `Crypto.Cipher.AES` + script ที่ implement attack

### CyberChef
สำหรับ encrypt/decrypt manual + visualize

---

## 🔗 References

- Cryptopals (Matasano): challenge สอน attacks เหล่านี้ทีละขั้น (cryptopals.com)
- CryptoHack
- "Practical Padding Oracle Attacks": Vaudenay
- David Wong "Real-World Crypto"

## ที่เกี่ยวข้อง

- [Symmetric-Crypto](Symmetric-Crypto.md)
- [Hash-Attacks](Hash-Attacks.md)
- [RSA-Attacks](RSA-Attacks.md)

---

#ctf #crypto #aes #padding-oracle
