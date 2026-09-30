---
type: resource-note
status: done
created: 2026-02-15
updated: 2026-03-11
tags: [security-writeup, tryhackme, cryptography, basics]
source: TryHackMe: Cryptography Basics
platform: tryhackme
room: Cryptography Basics
slug: cryptography-basics
path: TryHackMe/50-crypto/cryptography-basics.md
topic: 50-crypto
domain: [crypto, foundations]
skills: [symmetric-crypto, public-key-crypto, xor, modulo, caesar-cipher]
artifacts: [concept-notes]
sanitized: true
---

# Cryptography Basics

## Summary

* Cryptography = techniques for secure communication in the presence of adversaries; it protects confidentiality, integrity, and authenticity.
* Modern systems use crypto everywhere: web logins, SSH, online banking, medical and payment data handling.
* Core concepts: plaintext, ciphertext, cipher, key, encryption, decryption.
* Two main encryption families:

  * Symmetric (same secret key for encrypt/decrypt).
  * Asymmetric / public-key (public key to encrypt, private key to decrypt).
* Simple math operations such as XOR and modulo are building blocks for modern ciphers.

---

## Key Concepts

### 1.1 Why cryptography matters

* Threat model: the network is untrusted. Any node on-path can eavesdrop, modify or inject packets.
* Cryptography provides:

  * **Confidentiality**: only authorised parties can read data.
  * **Integrity**: modifications can be detected.
  * **Authenticity**: you can verify who you talk to.
* Everyday examples:

  * Logging in to a website: credentials are encrypted on the wire.
  * SSH: client/server establish an encrypted tunnel; traffic is unreadable to observers.
  * Online banking: browser validates the server certificate to avoid impostor sites.
  * File downloads: hashes / checksums verify that a file is identical to the original.
* Compliance angle:

  * Payment card data → PCI DSS demands encryption **at rest** and **in transit**.
  * Medical records → must follow relevant privacy/data-protection laws (HIPAA, GDPR, DPA, etc.), all of which assume strong cryptographic protection.

### 1.2 Plaintext → ciphertext → plaintext

Pipeline:

1. Start with **plaintext**: any readable data (text, images, binaries, medical records, etc.).
2. Feed plaintext and a **key** into the **encryption** algorithm (part of a **cipher**).
3. Output is **ciphertext**: unintelligible bytes with no obvious structure beyond approximate length.
4. To recover the original, feed ciphertext and the (appropriate) key into the **decryption** algorithm.

Terminology:

* **Plaintext**: original, human- or machine-readable data before encryption.
* **Ciphertext**: scrambled data after encryption; should look random.
* **Cipher**: algorithm that maps plaintext ↔ ciphertext using a key.
* **Key**: bit string controlling the cipher; must stay secret in symmetric schemes and for the private side of asymmetric schemes.
* **Encryption**: operation that takes plaintext + key → ciphertext.
* **Decryption**: operation that takes ciphertext + key → plaintext.

### 1.3 Historical cipher: Caesar

Setting:

* Alphabet: 26 uppercase letters.
* **Key**: integer shift `k` between 1 and 25.
* **Encrypt**: shift each letter to the right by `k`, wrapping around after `Z`.
* **Decrypt**: shift left by `k`.

Example from room:

* Plaintext: `TRYHACKME`
* Key: 3 (right shift)
* Ciphertext: `WUBKDFNPH`

Brute-force weakness:

* If attacker knows “this is Caesar”, there are only 25 candidate keys.
* They can simply try all shifts until one result is readable.

Room exercise:

* Ciphertext: `XRPCTCRGNEI`
* Trying all shifts, the meaningful plaintext appears at shift 15: `ICANENCRYPT`.
* This illustrates how *small key spaces* are trivially breakable.

### 1.4 Types of encryption

#### Symmetric encryption (shared secret)

* **One secret key** shared between Alice and Bob.
* Same key used for **encryption** and **decryption**.
* Security requirement: key must remain secret and only known to the intended parties.
* Key distribution problem: how to share the key safely in the first place.

Real-world analogy:

* Password-protected document:

  * You can email the encrypted document.
  * You must communicate the password through a different, secure channel (in-person, secure messenger, etc.).

Common symmetric algorithms mentioned:

* **DES (Data Encryption Standard)**

  * 56-bit key; standardised in 1977.
  * Broken in less than 24 hours by 1999 → no longer secure.
* **3DES (Triple DES)**

  * DES applied three times; nominal 168-bit key, effective security ≈ 112 bits.
  * Temporary patch when DES became weak; deprecated since 2019, still present in legacy systems.
* **AES (Advanced Encryption Standard)**

  * Successor to DES/3DES; modern standard.
  * Key sizes: 128, 192, 256 bits.
  * Widely used in TLS, disk encryption, VPNs, etc.

When to use symmetric:

* Bulk data encryption (disk, VPN tunnel, application payloads) where speed is critical and parties already share a key or can negotiate one.

#### Asymmetric encryption (public key)

* Uses a **key pair** per identity:

  * **Public key**: shared openly used for encryption / verification.
  * **Private key**: kept secret used for decryption / signing.
* Anyone can encrypt a message to Bob using Bob’s public key; only Bob can decrypt with his private key.

Properties:

* Solves key distribution problem: public key can be shared widely.
* Typically slower than symmetric encryption and uses larger keys.

Algorithms mentioned:

* **RSA**: modular exponentiation; common key sizes 2048, 3072, 4096 bits.
* **Diffie-Hellman (DH)**: key agreement protocol; typical key sizes 2048+ bits.
* **Elliptic Curve Cryptography (ECC)**: same security with much shorter keys, e.g. 256-bit ECC ≈ 3072-bit RSA.

Mathematical foundation:

* Based on one-way functions: operations easy in one direction but computationally infeasible to reverse without the private key.
* Security assumption: even with modern hardware, brute-force or direct inversion would take astronomically long.

Summary characters:

* **Alice**: sender.
* **Bob**: receiver.
* These names are used to reason about protocols (who knows which keys, who sends what).

---

## Pattern Cards

### Pattern 2.1: Threat model and policy

* Always assume the network is hostile.
* Encrypt:

  * **At rest**: databases, backups, disk volumes.
  * **In transit**: web traffic (TLS), SSH, VPNs, API calls.
* Regulatory frameworks usually translate to concrete crypto requirements (key sizes, algorithms, retention policies).

### Pattern 2.2: Key space and brute force

* Security ≈ size of key space, assuming algorithm is sound.
* Caesar cipher: 25 keys → trivial brute force.
* Modern symmetric ciphers: 2^128 or more keys → brute force infeasible.

### Pattern 2.3: Symmetric vs asymmetric roles

* Symmetric:

  * Fast, used for bulk data.
  * Requires secure channel for key exchange.
* Asymmetric:

  * Solves key distribution and enables authentication.
  * Slower; used mainly for key establishment, digital signatures, small control messages.

### Pattern 2.4: XOR as reversible mixing

* XOR with a key bitstring acts as a simple encrypt/decrypt primitive.
* Applying XOR twice with the same key returns the original value.
* Core idea behind stream ciphers and one-time pads (with important extra constraints: key must be random, secret, and used only once).

### Pattern 2.5: Modulo as wrap-around arithmetic

* `a mod n` acts like wrapping a counter on a ring of size `n`.
* Behaviour is predictable but non-invertible: knowing `x mod n` does not uniquely recover `x`.
* Used everywhere in crypto: key schedules, hash functions, public-key arithmetic.

---

## 3. Basic math used in the room

### 3.1 XOR operation

Definition:

* XOR (`⊕`) on bits returns `1` if the two bits differ, `0` if they are the same.

Truth table:

* `0 ⊕ 0 = 0`
* `0 ⊕ 1 = 1`
* `1 ⊕ 0 = 1`
* `1 ⊕ 1 = 0`

Useful properties:

* Self-inverse: `A ⊕ A = 0`.
* Identity element: `A ⊕ 0 = A`.
* Commutative: `A ⊕ B = B ⊕ A`.
* Associative: `(A ⊕ B) ⊕ C = A ⊕ (B ⊕ C)`.

Example from room:

* `1001 ⊕ 1010`

  * Bitwise: `1⊕1=0`, `0⊕0=0`, `0⊕1=1`, `1⊕0=1`.
  * Result: `0011` in binary (decimal 3).

Toy symmetric scheme:

* Let `P` be plaintext bits, `K` be key bits.
* **Encrypt:** `C = P ⊕ K`.
* **Decrypt:** `P = C ⊕ K` because `(P ⊕ K) ⊕ K = P`.

### 3.2 Modulo operation

Definition:

* `X % Y` (or `X mod Y`) is the remainder when `X` is divided by `Y`.
* Output is always in `[0, Y-1]` for positive `Y`.

Examples used in the room:

* `25 % 5 = 0` because `25 = 5×5 + 0`.
* `23 % 6 = 5` because `23 = 3×6 + 5`.
* `23 % 7 = 2` because `23 = 3×7 + 2`.
* `118613842 % 9091 = 3565`.
* `60 % 12 = 0`.

Note:

* Modulo is **not** reversible: knowing `x % n` says nothing unique about `x`.

---

## Command Cookbook

Only a few quick local experiments to internalise concepts; replace placeholders as needed.

### 4.1 Caesar cipher in shell (toy example)

Rotate uppercase letters by 3 (like the room example):

```bash
# Encrypt TRYHACKME with a Caesar shift of 3
echo TRYHACKME | tr 'A-Z' 'D-ZA-C'
# Decrypt WUBKDFNPH by shifting back by 3
echo WUBKDFNPH | tr 'D-ZA-C' 'A-Z'
```

### 4.2 XOR and modulo via Python

```bash
python3 - << 'PY'
# XOR of 1001 and 1010
p = int('1001', 2)
k = int('1010', 2)
print(bin(p ^ k))  # 0b11

# Modulo examples
print(118613842 % 9091)  # 3565
print(60 % 12)           # 0
PY
```

### 4.3 Quick AES test with OpenSSL (symmetric encryption)

```bash
# Encrypt a file with AES-256-CBC (password-based)
openssl enc -aes-256-cbc -salt -pbkdf2 -in secret.txt -out secret.txt.enc

# Decrypt
openssl enc -d -aes-256-cbc -salt -pbkdf2 -in secret.txt.enc -out secret.txt.dec
```

---

## Takeaways

* Cryptography is not optional plumbing; it is the foundation of trust on untrusted networks.
* You must distinguish clearly between:

  * **Data state**: at rest vs in transit.
  * **Key type**: symmetric vs asymmetric.
  * **Security property**: confidentiality, integrity, authenticity.
* Any real system design must address:

  * How keys are generated.
  * How keys are distributed and rotated.
  * Which ciphers/modes and key sizes are acceptable.
* Simple operations (XOR, modulo) underlie complex ciphers; understanding them helps demystify cryptography.

---

## 7. Small Q&A from the room

* Caesar cipher challenge: `XRPCTCRGNEI` → `ICANENCRYPT`.
* XOR example: `1001 ⊕ 1010 = 0011`.
* Modulo examples:

  * `118613842 % 9091 = 3565`.
  * `60 % 12 = 0`.

These reinforce the ideas of key space (Caesar), reversible XOR operations, and modulo as remainder.

---

## 8. Glossary (CN: EN)

* **Cryptography / 加密学**: study and practice of secure communication.
* **Plaintext / 明文**: original readable data before encryption.
* **Ciphertext / 密文**: scrambled, unreadable data after encryption.
* **Cipher / 密码算法**: algorithm that performs encryption and decryption.
* **Key / 密钥**: secret value controlling the cipher.
* **Symmetric encryption / 对称加密**: same key for encrypt and decrypt.
* **Asymmetric encryption / 非对称加密, 公钥加密**: public/private key pair.
* **Confidentiality / 机密性**: preventing unauthorised reading.
* **Integrity / 完整性**: detecting unauthorised changes.
* **Authenticity / 真实性**: verifying identity of communicating parties.
* **XOR / 异或运算**: bitwise operation with self-inverse property.
* **Modulo / 取模运算**: remainder of division; results in a fixed range.
* **DES / 数据加密标准**: legacy symmetric block cipher.
* **3DES / 三重 DES**: DES applied three times; now deprecated.
* **AES / 高级加密标准**: modern symmetric block cipher standard.
* **RSA / Diffie-Hellman / ECC**: families of public-key cryptosystems.
