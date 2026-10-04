---
type: resource-note
status: done
created: 2026-02-21
updated: 2026-03-11
tags: [security-writeup, tryhackme, hashing, crypto]
source: TryHackMe: Hashing Basics
platform: tryhackme
room: Hashing Basics
slug: hashing-basics
path: TryHackMe/50-crypto/hashing-basics.md
topic: 50-crypto
domain: [crypto, authentication]
skills: [hash-functions, password-hashing, hash-recognition, hash-cracking, file-integrity, hmac]
artifacts: [concept-notes, pattern-card, cookbook]
sanitized: true
---

# Hashing Basics

## Summary

* A cryptographic hash function maps arbitrary-length input to a fixed-length digest; it is designed to be one-way and collision-resistant (practically).
* The “avalanche effect” matters: a 1-bit change in input should produce a drastically different digest.
* Collisions are mathematically unavoidable (finite outputs vs infinite inputs), but good designs make collisions computationally infeasible to find.
* Hashing shows up in two daily security primitives: password verification (store hashes, not plaintext) and integrity checking (verify downloads).
* Password hashing must be slow + salted (KDF-style) to resist offline guessing and rainbow tables.
* Hash identification is mostly context + format cues (prefixes, length, encoding), not magic.
* HMAC adds a secret key to hashing to provide integrity + authenticity of a message.

## Key Concepts

### 1.1 Hash function ≠ encryption ≠ encoding

* Hashing: one-way summary (“digest”). No key. You should not be able to recover the original input from the digest.
* Encryption: two-way confidentiality with a key (decryptable if you have the key).
* Encoding: reversible representation change for compatibility (Base64, UTF-8). No security by itself.

### 1.2 Properties you actually care about

* Fixed output size: e.g., MD5 → 128-bit (16 bytes), SHA-256 → 256-bit (32 bytes).
* Preimage resistance (one-way): given digest h, finding any message m such that H(m)=h is infeasible.
* Second-preimage resistance: given m1, finding m2≠m1 s.t. H(m2)=H(m1) is infeasible.
* Collision resistance: finding any (m1, m2) with same digest is infeasible.
* Avalanche effect: small input change → large, unpredictable output change.

### 1.3 Collisions + pigeonhole principle

* For an n-bit digest, there are exactly 2^n possible hash values.
* Inputs are unbounded, so collisions must exist in principle.
* Engineering collisions in practice is the real threat: MD5 and SHA-1 have practical collision attacks, so they are considered broken for collision-resistance use cases.

Rule of thumb:

* Don’t use MD5/SHA-1 for integrity protection or signatures.
* Prefer SHA-256 / SHA-512 / SHA-3 family, depending on policy.

### 1.4 Hashing in authentication (password verification)

Why plaintext passwords are a disaster:

* A database leak becomes “instant account takeover,” plus credential stuffing elsewhere.

Why fast hashes (MD5/SHA-1) are still bad for passwords:

* Attackers can do billions of guesses/sec on GPUs; unsalted fast hashes are rainbow-table friendly.

What “secure password hashing” means (KDF / password hash scheme):

* Use a password-specific KDF that is intentionally slow and configurable (cost factor).
* Use a unique per-user salt.
* Store parameters + salt + hash.

Mermaid: password verification dataflow

```mermaid
flowchart LR
  U[User enters password] --> K[KDF / password hash
(Argon2id / bcrypt / scrypt / PBKDF2)
inputs: password + salt + cost]
  S[(DB: salt + params + password_hash)] --> K
  K --> C{hash matches?}
  C -- yes --> A[Authenticate]
  C -- no --> R[Reject]

  %% optional pepper
  P[(App secret: pepper)] -. optional .-> K
```

Salts:

* Not secret.
* Prevent identical passwords from producing identical hashes.
* Kill generic rainbow tables (attacker must recompute per-salt).

Pepper (optional):

* A server-side secret mixed into hashing.
* Stored outside the DB (e.g., HSM/KMS/env secrets).
* Useful defense-in-depth, but do not replace salts.

### 1.5 Rainbow tables: what they trade

* Rainbow table = precomputed mapping from hash → plaintext.
* Trade storage for cracking speed.
* Works best against unsalted or same-salt systems.

Defense:

* Per-user unique salt + slow KDF.

### 1.6 Recognising password hashes (defensive + offensive view)

Linux (/etc/shadow style)

* Stored in `/etc/shadow` (root-readable).
* Second field usually looks like:

  `$prefix$options$salt$hash`

Common prefixes (schemes vary by distro/libc):

* `$y$` yescrypt (modern default in some systems)
* `$2y$`, `$2b$`, `$2a$` bcrypt
* `$6$` sha512crypt
* `$1$` md5crypt (legacy)

Windows (SAM / NTLM)

* NTLM is visually similar to MD4/MD5 length (32 hex chars) → context is crucial.

Hash recognition heuristics

* Prefix present? → usually reliable.
* No prefix? Use: length + encoding + where you found it (web DB vs Windows SAM vs network device config).
* Tools (hashid, hashcat `--example-hashes`) help, but expect ambiguity.

### 1.7 Cracking hashes (offline guessing)

* You cannot “decrypt” a hash. You guess candidate passwords, hash them (with salt/params), and compare.
* Tooling:

  * Hashcat: GPU-first, huge mode coverage.
  * John the Ripper: CPU-first by default, very flexible.

GPU vs CPU

* GPUs excel at fast hashes (MD5/SHA1/SHA256) → extremely dangerous for unsalted password hashes.
* Modern password hash schemes aim to reduce GPU advantage (memory-hard or compute-hard).

VM note

* VMs often cannot use host GPU easily; cracking performance usually worse inside a VM.

Hashcat minimal syntax (room mental model)

```bash
hashcat -m <MODE> -a <ATTACK> /path/to/file.txt /path/to/wordlist.txt
# -m: hash mode (algorithm/format)
# -a: attack mode (0=straight wordlist)
```

### 1.8 Hashing for integrity checking

Basic idea:

* If the file is unchanged, its digest matches the published digest.
* If an attacker changes even 1 bit, digest changes.

Best practice: verify authenticity of the checksum list too

* Prefer “signed checksums” (PGP-signed file) or a checksum delivered over a trusted channel.

Mermaid: verify a download safely

```mermaid
flowchart LR
  D[Download file.iso] --> H[Compute SHA-256 digest]
  L[Download CHECKSUMS + signature] --> V[Verify signature (GPG)]
  V --> M{Signature valid?}
  M -- yes --> C{Digest matches list?}
  C -- yes --> OK[High confidence: file is authentic + intact]
  C -- no --> BAD[Integrity mismatch]
  M -- no --> BAD2[Checksum source not trustworthy]
```

### 1.9 HMAC (Keyed-Hash Message Authentication Code)

* HMAC uses a secret key + hash function to produce a tag.
* Provides:

  * Integrity: message not modified
  * Authenticity (shared-key): creator had the key

Canonical form (conceptual):

* HMAC(K, M) = H((K ⊕ opad) || H((K ⊕ ipad) || M))

Where:

* K = secret key
* M = message
* ipad/opad = fixed padding constants

Use cases:

* API request signing
* Log integrity in pipelines
* Token authentication primitives (depending on design)

## Pattern Cards

### 2.1 “Which primitive do I need?” card

* Need confidentiality (hide contents) → encryption.
* Need integrity only (detect changes) → hash + trusted digest distribution.
* Need integrity + authenticity (shared secret) → HMAC.
* Need integrity + authenticity (public verifiability) → digital signature.

### 2.2 “Password storage checklist” card

* Use a password hashing scheme: Argon2id preferred; otherwise bcrypt/scrypt/PBKDF2 per constraints.
* Unique per-user salt.
* Configurable work factor; plan for upgrades.
* Rate-limit online attempts; monitor credential stuffing.
* Protect secrets at rest (DB encryption) but treat DB compromise as plausible.

### 2.3 “Collision risk” card

* If your use case depends on collision resistance (signatures, file integrity attestation), avoid MD5/SHA-1.
* For fingerprints in non-adversarial settings (dedupe), collisions still exist but may be acceptable depending on risk.

### 2.4 “Hash identification” card

* Prefix → trust it (mostly).
* No prefix → use context + length + encoding.
* Confirm with at least two sources (tool + documentation) before choosing a cracking mode.

## Command Cookbook

### 3.1 Compute file digests

```bash
# MD5 (legacy; do not use for adversarial integrity)
md5sum <FILE>

# SHA-1 (legacy; do not use for adversarial integrity)
sha1sum <FILE>

# SHA-256 (recommended baseline)
sha256sum <FILE>

# SHA-512
sha512sum <FILE>
```

### 3.2 Integrity verification workflow (downloaded artifacts)

```bash
# 1) Verify signed checksum file (example)
gpg --verify CHECKSUMS.asc CHECKSUMS

# 2) Compare your file’s hash to the published one
sha256sum <DOWNLOADED_FILE>
# then compare manually or via a check file
```

### 3.3 Quick hash recognition (best-effort)

```bash
# hashid sometimes helps, but expect ambiguity without context
hashid '<HASH_STRING>'

# hashcat can show example formats
hashcat --example-hashes | less
```

### 3.4 Cracking basics (lab-safe)

```bash
# Straight wordlist attack
hashcat -m <MODE> -a 0 hashes.txt /usr/share/wordlists/rockyou.txt

# CPU alternative
john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt
```

## Evidence

* Room is command-first; keep screenshots minimal.
* If you include outputs later, store:

  * `assets/task-2-avalanche-demo.txt`
  * `assets/task-6-hashcat-runs.txt`
  * Redact usernames/hostnames if they include identifiers.

## Takeaways

* Hashing is a backbone primitive; misusing it is how password leaks become catastrophes.
* “Store hash” is not enough: you need salting + a slow KDF-style password hashing scheme.
* Integrity checking needs a trusted digest source; signed checksums are the practical bridge.
* Hash cracking is mostly compute economics: GPUs dominate fast hashes, so defenses must change the cost model.

## References

* NIST CSRC Glossary: Cryptographic hash function.
* NIST SP 800-63B: guidance for salted, one-way password hashing/KDFs for verifiers.
* RFC 9106: Argon2 recommendations.
* OWASP Password Storage Cheat Sheet.
* RFC 2104: HMAC definition and construction.
* hashcat wiki: example hashes / hash modes.
* SHAttered (CWI + Google): practical SHA-1 collision demonstration.

## CN: EN Glossary (mini)

* Hash function: 哈希函数/散列函数
* Digest / hash value: 摘要/哈希值
* Collision: 碰撞
* Pigeonhole principle: 鸽巢原理
* Preimage resistance: 原像抗性
* Second-preimage resistance: 第二原像抗性
* Collision resistance: 抗碰撞性
* Avalanche effect: 雪崩效应
* Salt: 盐
* Pepper: 胡椒（应用层秘密）
* KDF (Key Derivation Function): 密钥派生函数
* Password hashing scheme: 密码哈希方案
* Rainbow table: 彩虹表
* Integrity checking: 完整性校验
* HMAC: 基于密钥的消息认证码
* NTLM: Windows NT LAN Manager 哈希
* Hashcat mode: Hashcat 模式编号
