---
tags: [ctf, crypto, hash]
created: 2026-05-01
---

# 🔢 Hash Attacks

> **Hash function** = ฟังก์ชัน 1 ทาง: input ใดๆ → output ขนาดคงที่ (digest)

Hash ใช้ใน:
- Password storage
- File integrity (checksum)
- Digital signatures
- Blockchain
- Message Authentication (HMAC)

---

## 📚 Hash Function Properties

Hash ที่ดีต้องมี 3 properties:
1. **Preimage resistance**: ให้ `h`, หา `m` ที่ `hash(m) = h` ยาก
2. **Second preimage resistance**: ให้ `m1`, หา `m2 ≠ m1` ที่ `hash(m1) = hash(m2)` ยาก
3. **Collision resistance**: หา `m1 ≠ m2` ที่ `hash(m1) = hash(m2)` ยาก

---

## 🧮 Hash Functions ที่เจอใน CTF

| Hash | Output (hex) | Status |
|------|-------------|--------|
| MD5 | 32 chars (128 bit) | **Broken** (collisions) |
| SHA-1 | 40 chars (160 bit) | **Broken** (SHAttered 2017) |
| SHA-256 | 64 chars (256 bit) | Secure |
| SHA-512 | 128 chars (512 bit) | Secure |
| SHA-3 (Keccak) | 64 chars (256 bit) | Secure |
| BLAKE2 / BLAKE3 | varies | Secure |
| RIPEMD-160 | 40 chars | OK |
| NTLM | 32 chars | Used in Windows |
| bcrypt | starts with `$2a$`, `$2b$`, `$2y$` | Slow (good for password) |
| scrypt | `$7$...` or `$s2$...` | Memory-hard (good) |
| argon2 | `$argon2id$...` | ⭐ Best (modern) |
| PBKDF2 | varies | OK (KDF) |

### ระบุ hash ด้วย length
| Length (hex chars) | Likely |
|--------------------|--------|
| 32 | MD5, NTLM, MD4 |
| 40 | SHA-1, RIPEMD-160 |
| 56 | SHA-224 |
| 64 | SHA-256, SHA-3-256, BLAKE2s |
| 96 | SHA-384 |
| 128 | SHA-512, SHA-3-512, BLAKE2b |

### Tools identify
```bash
hash-identifier
hashid <hash>
haiti <hash>            # ใหม่กว่า
```

---

## 🔨 Hash Cracking

### Hashcat ⭐
GPU-accelerated: เร็วที่สุด

```bash
# Modes (ดู wiki)
0     = MD5
100   = SHA-1
1400  = SHA-256
1700  = SHA-512
1000  = NTLM
3200  = bcrypt
22000 = WPA-PBKDF2 (WiFi handshake)
13100 = Kerberos TGS-REP (kerberoasting)
16500 = JWT
22921 = RSA/DSA/EC/OPENSSH

# Attack modes
-a 0  = Wordlist
-a 1  = Combinator (combine 2 wordlists)
-a 3  = Brute force / mask
-a 6  = Hybrid wordlist + mask
-a 9  = Association attack (modern)

# Examples
hashcat -m 0 -a 0 hash.txt rockyou.txt
hashcat -m 1000 -a 0 ntlm.txt rockyou.txt
hashcat -m 0 -a 3 hash.txt ?l?l?l?l?l?d?d           # 5 lower + 2 digits

# Mask charsets
?l = a-z, ?u = A-Z, ?d = 0-9, ?s = symbols, ?a = all printable

# Rules (modify words from wordlist)
hashcat -m 0 -a 0 hash.txt rockyou.txt -r best64.rule
hashcat -m 0 -a 0 hash.txt rockyou.txt -r OneRuleToRuleThemAll.rule
```

### John the Ripper
```bash
john --wordlist=rockyou.txt hashes.txt
john --format=raw-md5 --wordlist=rockyou.txt hashes.txt
john --show hashes.txt

# Format detection
john --list=formats | grep -i sha

# Mask
john --mask='?l?l?l?l?l?d?d' hashes.txt
```

### Online services (สำหรับ hash ทั่วไป)
- **CrackStation**: crackstation.net (rainbow table)
- **Hashes.com**: hashes.com (bulk)
- **md5decrypt.net**

ใช้ก่อน: ถ้า hash อยู่ใน rainbow table = นาที (vs ชั่วโมงในการ brute)

---

## 🌈 Rainbow Tables

ตาราง precomputed `hash → plaintext` mapping

ใช้ trade off space กับ time: แทนที่จะ brute ทุกครั้ง คำนวณครั้งเดียวเก็บไว้

### Defense: Salting
```
hash(password)            ← rainbow table work
hash(password + salt)      ← salt unique ต่อ user → table ใช้ไม่ได้
```

bcrypt/argon2 ใส่ salt + iterations ให้แล้ว: ใช้แทน raw SHA

---

## ⚔️ Hash Length Extension Attack

ถ้าใช้ hash แบบ Merkle-Damgård (MD5, SHA-1, SHA-256, SHA-512) เพื่อ MAC แบบ:
```
MAC = hash(secret || message)
```

ผู้โจมตีที่รู้ `hash(secret || message)` และ length ของ secret → คำนวณ:
```
hash(secret || message || padding || extra)
```
**โดยไม่รู้ secret!**

### ทำไม work
Merkle-Damgård hash อ่าน input เป็น blocks → state ของ hash ตอนจบ = output

ถ้าเอา output มาเป็น state → ต่อ block ใหม่ → ได้ output ใหม่ที่ valid

### Tool
```bash
# hash_extender
hash_extender --data 'message' \
              --secret <length> \
              --append 'extra' \
              --signature <hash> \
              --format sha256
```

### Defense
- HMAC: `HMAC(key, message)`: ปลอดภัยจาก length extension
- Hash ที่ไม่ Merkle-Damgård: SHA-3, BLAKE2

### CTF Pattern
```python
# Server code
def verify(token, message):
    return md5(SECRET + message) == token

# Attacker has: token0 for message0
# Wants: forge token for "message0; admin=true"
```
→ ใช้ length extension

---

## 💥 Collision Attacks

### MD5 Collisions
- Wang's attack 2004: 2 messages ที่มี MD5 เหมือนกัน
- Marc Stevens 2009: chosen-prefix collision (PoC: 2 PDFs ที่ MD5 ตรงแต่ content ต่างกัน)
- ใช้ในการ forge SSL certificates ได้

### SHA-1 SHAttered (Google 2017)
- 2 PDF ที่ SHA-1 ตรง: ใช้ resource เยอะมาก แต่ทำได้

### Tools
- **HashClash**: github.com/cr-marcstevens/hashclash

### CTF Pattern
- 2 file ที่มี hash ตรง: server เช็คด้วย MD5 → upload "evil.exe" ที่มี hash เดียวกับ "good.exe"

---

## 🎯 Specific Attacks

### NTLM (Windows)
```bash
# Capture จาก network
responder -I eth0     # tool ในการ capture NTLM hash

# Crack NTLMv2
hashcat -m 5600 ntlmv2.txt rockyou.txt
```

### Pass-the-Hash
ถ้ามี NTLM hash: ใช้ login โดยไม่ต้อง crack
```bash
nxc smb target -u user -H <NTLM_hash>
evil-winrm -i target -u user -H <NTLM_hash>
psexec.py user@target -hashes :<NTLM_hash>
```

### Kerberoasting
ขอ TGS ticket → ได้ encrypted blob ที่ใช้ user's password hash → crack offline
```bash
GetUserSPNs.py domain/user:pass -dc-ip <ip> -request
hashcat -m 13100 hashes.txt rockyou.txt
```

### AS-REP Roasting
ผู้ใช้ที่ disable Kerberos preauth: ขอ AS-REP → encrypted with hash
```bash
GetNPUsers.py domain/ -usersfile users.txt -no-pass
hashcat -m 18200 hashes.txt rockyou.txt
```

### WPA/WPA2 (WiFi)
```bash
# Capture handshake (4-way)
airodump-ng wlan0
aireplay-ng --deauth ...

# Convert
hcxpcapngtool -o hash.hc22000 capture.pcapng

# Crack
hashcat -m 22000 hash.hc22000 rockyou.txt
```

### KeePass / 7zip / RAR / ZIP
Use **john2zip2hash**, **rar2john**, **keepass2john** etc.
```bash
zip2john file.zip > hash.txt
john --wordlist=rockyou.txt hash.txt

7z2hashcat 7zip-archive.7z > hash.txt
hashcat -m 11600 hash.txt rockyou.txt

keepass2john file.kdbx > hash.txt
hashcat -m 13400 hash.txt rockyou.txt
```

---

## 🐤 Birthday Attack / Birthday Paradox

`hash(m)` มี output 256 bit → expected collision หลัง ~2^128 hashes (ไม่ใช่ 2^256)

→ "n-bit hash มี collision security แค่ n/2 bit"

→ MD5 (128 bit) → collision ใน ~2^64: ทำได้จริง

---

## 🎯 PRNG ที่อ่อน

ปกติ "Random" generator ใน programming ใช้ algorithm: ถ้า attacker รู้ seed → predict

### Python `random.random()`: Mersenne Twister
- Predictable ถ้ารู้ 624 outputs ติดกัน
- Tool: **randcrack**
```python
from randcrack import RandCrack
rc = RandCrack()
for n in known_outputs:
    rc.submit(n)
print(rc.predict_getrandbits(32))
```

### LCG (Linear Congruential Generator)
```
x_(n+1) = (a * x_n + b) mod m
```
ถ้ารู้ output 3 ตัวติด → recover a, b, m

→ Java `Random()` ใช้ LCG → predictable

→ ห้ามใช้ในกรณี crypto (`SecureRandom` แทน)

### CTF Pattern
- Server gen "secret" จาก `random.randint()` → predict ได้ถ้ารู้ output อื่น

---

## 🛡 Best Practices for Passwords

1. **Slow hashes**: bcrypt, scrypt, argon2 (ไม่ใช่ MD5/SHA)
2. **Salt**: unique per user, random
3. **Pepper** (optional): server-side secret added to all passwords
4. **Iterations**: increase work factor

```python
import bcrypt
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12))
```

---

## 🔗 ต่อไป

- [RSA-Attacks](RSA-Attacks.md)
- [AES-Attacks](AES-Attacks.md)
- [Asymmetric-Crypto](Asymmetric-Crypto.md)

## 📚 References
- HashCat wiki: hashcat.net/wiki/
- Hash Length Extension: skullsecurity.org

---

#ctf #crypto #hash
