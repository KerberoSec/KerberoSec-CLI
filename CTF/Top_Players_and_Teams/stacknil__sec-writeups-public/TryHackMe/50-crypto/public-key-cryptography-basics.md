---
type: resource-note
status: done
created: 2026-02-15
updated: 2026-03-11
tags: [security-writeup, tryhackme, public-key-crypto, crypto]
source: TryHackMe: Public Key Cryptography Basics
platform: tryhackme
room: Public Key Cryptography Basics
slug: public-key-cryptography-basics
path: TryHackMe/50-crypto/public-key-cryptography-basics.md
topic: 50-crypto
domain: [crypto, networking]
skills: [public-key-crypto, rsa, diffie-hellman, ssh, tls-certs, pgp-gpg]
artifacts: [concept-notes]
sanitized: true
---

# Public Key Cryptography Basics

## Summary

* Goal: understand how **asymmetric cryptography** solves authentication, integrity, and confidentiality problems on untrusted networks.
* Core primitives: **RSA**, **Diffie-Hellman key exchange**, **digital signatures**, **certificates/PKI**, and **SSH / PGP key pairs**.
* Typical pattern: use **public-key crypto once** to authenticate and agree on a **symmetric key**, then switch to fast symmetric ciphers (AES, etc.).
* Public key = safe to publish; private key = must stay secret. What you encrypt with one can usually only be decrypted with the other.
* In CTFs and security work, public-key systems show up in: weak RSA parameters, misconfigured SSH keys, bad TLS setups, or leaked PGP keys.

---

## Key Concepts

### 1.1 Security properties

* **Authentication**: prove *who* you are talking to.
* **Authenticity**: prove *who created* a given message.
* **Integrity**: prove the message has not been modified.
* **Confidentiality**: prevent unauthorised parties from reading the content.

Public-key cryptography lets us stitch these properties into network protocols (SSH, TLS, email, software distribution, etc.).

### 1.2 Symmetric vs asymmetric

* **Symmetric encryption**

  * Same secret key used for *encrypt* and *decrypt*.
  * Very fast, good for bulk data.
  * Key-distribution problem: both sides must somehow already share the key.
* **Asymmetric (public-key) encryption**

  * Two related keys: **public** and **private**.
  * Public key: used by others to encrypt to you or verify your signatures.
  * Private key: used by you to decrypt or create signatures; must remain secret.
  * Solves the key-distribution problem: you can publish the public key.

In practice, protocols use a **hybrid design**: asymmetric only for authentication + key exchange; symmetric for the actual data channel.

### 1.3 RSA (high-level)

* Built on the hardness of **factoring a large composite number** (n = p \times q) into its two large prime factors.
* Key generation sketch:

  * Choose large primes (p, q).
  * Compute (n = p q) and (\varphi(n) = (p-1)(q-1)).
  * Choose public exponent (e) relatively prime to (\varphi(n)).
  * Compute private exponent (d) such that (e d \equiv 1 \pmod{\varphi(n)}).
  * **Public key**: ((n, e)); **private key**: ((n, d)).
* Encryption of message integer (m): (c = m^e \bmod n).
* Decryption: (m = c^d \bmod n).
* Security intuition: knowing (n) and (e) is harmless, but recovering (d) without factoring (n) should be computationally infeasible.

CTF reminder: parameters often leak (small (e), shared primes, low entropy). Tools like `RsaCtfTool` automate many known attacks when you are given some mix of (n, e, d, p, q, c).

### 1.4 Diffie-Hellman key exchange (DH)

Goal: agree on a **shared secret key** over an eavesdropped channel without sending the key itself.

Classic DH over a finite field:

1. Public parameters: a large prime (p) and generator (g).
2. Alice chooses secret (a), computes public value (A = g^a \bmod p).
3. Bob chooses secret (b), computes public value (B = g^b \bmod p).
4. They exchange (A) and (B) in the clear.
5. Alice computes shared key (K = B^a \bmod p = g^{ba} \bmod p).
6. Bob computes shared key (K = A^b \bmod p = g^{ab} \bmod p).

Result: both sides get the same (K) without ever transmitting (K). An eavesdropper only sees (p, g, A, B); recovering (K) requires solving a **discrete logarithm problem**.

Threat model: DH by itself does **not** authenticate the parties; it is vulnerable to **man-in-the-middle** unless combined with signatures or certificates (e.g. in TLS or SSH).

### 1.5 SSH and public keys

SSH uses public-key crypto for two things:

1. **Server authentication**

   * When you first connect, the client shows a **host key fingerprint**.
   * You confirm it out-of-band and it is stored in `~/.ssh/known_hosts`.
   * On later connections, if the server key changes unexpectedly, SSH warns about a possible MITM.

2. **Client authentication**

   * Users generate a key pair (e.g. Ed25519 or RSA) with `ssh-keygen`.
   * The **public key** is copied to the server’s `~/.ssh/authorized_keys`.
   * During login, the client proves possession of the **private key** via a signature challenge.

Private keys can be encrypted locally with a **passphrase**; this passphrase never leaves the client and only protects the file at rest.

### 1.6 Digital signatures

* Idea: instead of encrypting data, use the private key to **sign** a message; anyone with the public key can verify.
* Typical pattern:

  1. Compute a **hash** of the message.
  2. Sign the hash with the private key (e.g. RSA, ECDSA, Ed25519).
  3. Distribute message + signature.
  4. Verifier recomputes the hash and checks the signature using the public key.
* Provides: **authenticity** (who signed) and **integrity** (message unchanged). It does not, by itself, give confidentiality.

### 1.7 Certificates and PKI

* A **certificate** binds an identity (domain name, organisation, person) to a public key.
* Issued and cryptographically signed by a **Certificate Authority (CA)**.
* Browsers and OSes ship with a **trusted root CA store**; any certificate chaining up to a trusted root is accepted for HTTPS.
* Example: `https://example.com` presents a TLS certificate; the browser verifies the chain of signatures up to a trusted CA before showing the “lock” icon.

For personal / internal use, you can create self-signed certificates; they work technically, but clients will not trust them by default because they are not signed by a known CA.

### 1.8 PGP / GPG and the “web of trust”

* **PGP (Pretty Good Privacy)** and its open-source implementation **GnuPG (GPG)** provide encryption and signing for files and email.
* You generate a **key pair** tied to a user ID (name + email).
* You can:

  * Encrypt data to one or more recipients (their public keys).
  * Sign data so others can verify it came from you.
* Trust model is often a **web of trust**: users sign each other’s keys to attest that they have checked the identity.

Basic workflow example:

* `gpg --full-gen-key` → create a new key pair.
* `gpg --import other.key` → import someone else’s public key.
* `gpg --encrypt --recipient USER_ID file` → encrypt.
* `gpg --decrypt file.gpg` → decrypt (prompts for passphrase if private key is protected).

---

## Pattern Cards

### 2.1 Hybrid encryption pattern ("lock + secret code")

* Use case: build a fast, secure channel over the internet.
* Steps:

  1. Client obtains server **public key** (from certificate, SSH host key, etc.).
  2. Client generates a random **session key** for symmetric cipher.
  3. Client encrypts the session key with the public key and sends it.
  4. Both sides switch to symmetric encryption for all further traffic.
* Pros: combines strong authentication with high throughput.
* Pitfalls: if the public key is spoofed (no proper verification), the whole channel can be intercepted.

### 2.2 DH key-agreement pattern

* Use case: two parties derive a shared key without sending it directly.
* Implementation: classic DH or elliptic-curve variants (ECDH, X25519).
* Properties:

  * Provides **forward secrecy** when ephemeral keys are used (new DH keys per session).
  * Needs authentication (e.g. signed DH parameters) to resist MITM.

### 2.3 Signature-then-encrypt pattern (PGP, secure email)

* Steps:

  1. Sender signs the message with their private key.
  2. Sender encrypts the signed bundle with recipient’s public key.
  3. Recipient decrypts with their private key, then verifies sender’s signature.
* Delivers: confidentiality (encryption) + authenticity/integrity (signature).

### 2.4 SSH key backdoor pattern (red-team tactic)

* Idea: drop your **public key** into `~/.ssh/authorized_keys` for persistence.
* Benefits:

  * Gives you a stable, fully-featured shell over SSH instead of fragile reverse shells.
  * Easy to script and automate.
* Operational cautions:

  * Choose a realistic key type / comment.
  * Ensure logs and `authorized_keys` changes fit the scenario.

---

## Command Cookbook

> All placeholders are generic: replace `USER_A`, `TARGET_HOST`, `example.com`, etc. as needed.

### 3.1 SSH keys

```bash
# Generate an Ed25519 SSH key pair (recommended modern default)
ssh-keygen -t ed25519 -C "USER_A@TARGET_HOST" -f ~/.ssh/id_ed25519

# Generate an RSA SSH key pair (legacy / compatibility)
ssh-keygen -t rsa -b 4096 -C "USER_A@TARGET_HOST" -f ~/.ssh/id_rsa

# Copy public key to a remote server (password auth required once)
ssh-copy-id -i ~/.ssh/id_ed25519.pub USER_A@TARGET_HOST

# Login using a specific private key
ssh -i ~/.ssh/id_ed25519 USER_A@TARGET_HOST

# Check known_hosts entry for a host fingerprint
grep "TARGET_HOST" ~/.ssh/known_hosts
```

### 3.2 GPG / OpenPGP

```bash
# Create a new key pair (interactive wizard)
gpg --full-gen-key

# List your keys
gpg --list-keys

# Import someone else’s public key
gpg --import contact-public.key

# Encrypt a file for a specific recipient ID
gpg --encrypt --recipient "Alice <alice@example.com>" secret.txt

# Decrypt a received file
gpg --decrypt message.gpg > message.txt
```

### 3.3 Quick RSA arithmetic (for CTFs)

```python
# Python snippet to compute n and phi(n)
from math import prod

p = 4391
q = 6659
n = p * q
phi = (p - 1) * (q - 1)
print(n, phi)
```

---

## Takeaways

* Public-key crypto solves **key distribution and identity**, but is slower; symmetric crypto carries the bulk data.
* **RSA** security rests on the difficulty of factoring large (n = p q); weak primes or reused parameters are common CTF attack surfaces.
* **Diffie-Hellman** lets two parties derive a shared key from (p, g, A, B) without revealing their private exponents.
* **SSH keys** and **GPG keys** are just different applications of the same idea: key pairs, with private keys guarded and public keys shared.
* **Digital signatures + certificates** connect public keys to real-world identities and infrastructure (TLS/HTTPS, signed software, etc.).
* Practically: always verify fingerprints / certificates on first use, protect private keys with strong passphrases, and rotate keys when compromised or when crypto standards move forward.

---

## References

* TryHackMe room: "Public Key Cryptography Basics".
* OpenSSH manual pages: `ssh`, `sshd`, `ssh-keygen`.
* GnuPG documentation (`gpg` man page, official docs).
* High-level crypto introductions in textbooks such as *Serious Cryptography* (A. Degabriele) or *Cryptography Engineering*.
