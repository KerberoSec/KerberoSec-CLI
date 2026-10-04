---
tags: [ctf, crypto, asymmetric, rsa, ecc]
created: 2026-05-01
---

# 🔑 Asymmetric Cryptography

> **Asymmetric** = key pair (public + private) → ใครก็ encrypt ได้ด้วย public แต่ decrypt ได้แค่คนที่ถือ private

ใช้แก้ปัญหา "key distribution" ของ symmetric: ไม่ต้องแชร์ secret ผ่าน channel ปลอดภัย

---

## ทำไมใช้ asymmetric

### Symmetric problem:
Alice ↔ Bob ต้องการคุยลับ → ต้องมี shared key: ส่งกันยังไงโดยไม่โดน Eve เห็น?

### Asymmetric solution:
- Bob มี (pubB, privB): เผยแพร่ pubB
- Alice encrypt ด้วย pubB → Bob เท่านั้น decrypt ได้
- ไม่ต้องแชร์ secret ก่อนเลย

### ในการใช้จริง: Hybrid encryption
Asymmetric ช้ามาก → ใช้ encrypt symmetric key เท่านั้น แล้วใช้ symmetric กับ data จริง:
1. Alice gen random AES key K
2. Encrypt K ด้วย Bob's public key → send
3. Encrypt data ด้วย AES(K) → send
4. Bob decrypt K ด้วย private → decrypt data

---

## 🏛 RSA: ที่นิยมที่สุด

### หลักการ
1. เลือก primes ขนาดใหญ่ `p`, `q`
2. `n = p * q` (modulus)
3. `φ(n) = (p-1)(q-1)` (Euler's totient)
4. เลือก `e` ที่ coprime กับ `φ(n)`: มัก = 65537
5. คำนวณ `d = e^(-1) mod φ(n)` (modular inverse)
6. **Public key**: `(n, e)`
7. **Private key**: `(n, d)`: หรือ `(p, q, d)`

### Encrypt / Decrypt
```
Encrypt: c = m^e mod n
Decrypt: m = c^d mod n
```

### ทำไมปลอดภัย
- ใครก็คำนวณ `c = m^e mod n` ได้
- แต่ recover `m` จาก `c` ต้อง factor `n` → หา `p, q` → คำนวณ `d`
- **Integer factorization** ของเลขใหญ่ (2048+ bit) ยังไม่มี algorithm เร็ว

### โค้ด
```python
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP

key = RSA.generate(2048)
priv = key.export_key()
pub = key.publickey().export_key()

cipher = PKCS1_OAEP.new(RSA.import_key(pub))
ct = cipher.encrypt(b"hello")

cipher_d = PKCS1_OAEP.new(RSA.import_key(priv))
print(cipher_d.decrypt(ct))
```

### Padding schemes (สำคัญ!)
- **PKCS#1 v1.5**: เก่า, vulnerable ต่อ Bleichenbacher attack
- **OAEP** ⭐: ปัจจุบัน standard
- **No padding (textbook RSA)**: vulnerable มาก

> RSA ปกติของ CTF มี vulnerable เยอะ → ดู [RSA-Attacks](RSA-Attacks.md) เต็ม

---

## 🌀 Diffie-Hellman (DH) Key Exchange

วิธีให้ 2 คนตกลง shared secret บน channel เปิดเผย โดยไม่ต้องแชร์ secret ก่อน

### หลักการ (Toy example)
1. Public: `p` (prime), `g` (generator)
2. Alice เลือก `a` (secret) → ส่ง `A = g^a mod p`
3. Bob เลือก `b` (secret) → ส่ง `B = g^b mod p`
4. Shared secret: `s = B^a = A^b = g^(ab) mod p`

Eve เห็น `A`, `B`, `g`, `p`: ต้อง solve **discrete logarithm** เพื่อหา `a` หรือ `b` (ยาก)

### Attacks
- **Small subgroup**: ถ้า `g` มี order ต่ำ → search space เล็ก
- **MITM**: DH ไม่มี authentication! (ต้อง sign: ดู ECDHE-RSA)
- **Logjam**: primes อ่อนที่หลายคนใช้ร่วมกัน

---

## 🥚 Elliptic Curve Cryptography (ECC)

ใช้คณิตศาสตร์ของ elliptic curves: `y^2 = x^3 + ax + b mod p`

ใช้ key size เล็กกว่า RSA มาก:
- ECC 256-bit ≈ RSA 3072-bit security

### ECDH: Key exchange
- เหมือน DH แต่ใช้ point operations บน curve

### ECDSA: Digital signature
- คล้าย DSA แต่บน curve

### Curves ที่ใช้
- **secp256k1** (Bitcoin)
- **P-256 / secp256r1** (NIST)
- **Curve25519** (modern, fast, safer)
- **Curve448** (paranoid security level)

### ECDSA Attack: nonce reuse
ECDSA ใช้ nonce `k` ใน sign: ถ้า `k` ซ้ำใน 2 signatures ของ message ต่างกัน:
- Recover private key ได้ทันที!

```
ถ้า k ซ้ำใน sig(m1) และ sig(m2):
  k = (m1 - m2) / (s1 - s2)
  d = (s1*k - m1) / r
```

→ Sony PS3 (2010): ใช้ k คงที่ → community recover private key

### ECDSA Attack: Biased nonce
ถ้า k มี bias (เช่น top bits = 0) → lattice attack: recover key

---

## 🆕 Post-Quantum Cryptography (เพิ่งเริ่ม mainstream)

Quantum computer ในอนาคตจะ break RSA/ECC ทั้งหมด (Shor's algorithm)

NIST จะ standardize:
- **CRYSTALS-Kyber** (KEM): adopted 2024 as ML-KEM
- **CRYSTALS-Dilithium** (signature): adopted as ML-DSA
- **SPHINCS+** (signature): hash-based
- **FALCON** (signature)

ใน CTF มี challenge เกี่ยวกับ lattice-based crypto บ้าง: ใช้ SageMath

---

## 🎯 Common Public Key Formats

### PEM (text)
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...
-----END PUBLIC KEY-----
```

### DER (binary)
PEM ที่ base64-decode

### OpenSSH
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAA... user@host
```

### JWK (JSON Web Key)
```json
{"kty":"RSA","n":"...","e":"AQAB"}
```

### Convert
```bash
openssl rsa -in priv.pem -pubout -out pub.pem
openssl rsa -in priv.pem -text -noout              # ดู p, q, d
openssl rsa -pubin -in pub.pem -text -noout
```

---

## 🛠 Python tools

### Pycryptodome
```python
from Crypto.PublicKey import RSA
from Crypto.Util.number import bytes_to_long, long_to_bytes

# Load
key = RSA.import_key(open('pub.pem').read())
n, e = key.n, key.e

# Encrypt manually
m = bytes_to_long(b"hello")
c = pow(m, e, n)
```

### SageMath ⭐
ใช้สำหรับ lattice attacks, polynomial math, factoring

```python
sage: factor(15)
3 * 5

sage: ZmodN = Zmod(n); P.<x> = PolynomialRing(ZmodN); ...
```

---

## 🔐 Hybrid Crypto Schemes

### TLS handshake (simplified)
1. Client → Server: "Hello, support TLS 1.3, ciphers ..."
2. Server → Client: cert (RSA/ECDSA), public ECDH params
3. Client: verify cert (chain to CA)
4. ECDH exchange → shared secret
5. Derive session keys (HKDF)
6. Encrypt data with AES-GCM / ChaCha20-Poly1305

### PGP / GPG
- Encrypt: random session key (AES) → encrypt with recipient's RSA pub
- Sign: hash → sign with sender's RSA priv

---

## 🎯 Challenge ใน CTF

### Pattern 1: RSA Decrypt with weak parameters
ดู [RSA-Attacks](RSA-Attacks.md)

### Pattern 2: DH MITM
challenge: 2 parties exchange: Eve ให้ G ที่อ่อน → คำนวณ shared

### Pattern 3: ECDSA nonce reuse
2 signatures ของ message ต่างกันแต่ k ซ้ำ: recover private key

### Pattern 4: RSA padding oracle (Bleichenbacher)
PKCS#1 v1.5 → million-message attack

---

## 🛡 Best Practices

1. **RSA**: 2048+ bit, OAEP padding
2. **ECC**: P-256 หรือ Curve25519: modern curves
3. **Key generation**: ใช้ secure random (`/dev/urandom`)
4. **Don't roll your own crypto**
5. **Use libraries**: libsodium, openssl, BoringSSL
6. **HSM** สำหรับ key storage ใน production

---

## 🔗 ต่อไป

- [RSA Attacks ละเอียด](RSA-Attacks.md)
- [Hash-Attacks](Hash-Attacks.md)
- [Symmetric-Crypto](Symmetric-Crypto.md)

## 📚 References
- CryptoHack: cryptohack.org
- "An Introduction to Mathematical Cryptography": Hoffstein
- Real-World Crypto by David Wong

---

#ctf #crypto #asymmetric #rsa #ecc
