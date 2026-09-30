# 📡 OTA Firmware: ChaCha20 Nonce Reuse (Crypto)

## Challenge Info

| Field | Details |
|---|---|
| Platform | Cybersecurity Hackathon 2026 |
| Category | Cryptography |
| Tools Used | Python 3 |

---

## 🧩 Description

An 8 KB OTA firmware image (`firmware.bin`), encrypted with a hand-rolled
ChaCha20 loop. The description gave the bug away up front: the routine
**resets the lower byte of the nonce to `0x00` at every 4096-byte chunk
boundary**, so both 4096-byte chunks in the file are encrypted under the
**identical keystream**.

---

## 🔍 Reconnaissance

**Step 1: Recognize the attack, not the cipher**

The challenge statement already names the vulnerability: reused
keystream. No need to touch ChaCha20 internals at all: this is a
classic **two-time pad** problem. With the same keystream `K` applied to
both chunks:

```
chunk1[i] = plain1[i] XOR K[i]
chunk2[i] = plain2[i] XOR K[i]
```

```
chunk1[i] XOR chunk2[i] = plain1[i] XOR plain2[i]
```

The keystream cancels out entirely: whatever leaks is the **difference**
between the two plaintext chunks, not the plaintext itself.

---

## ⚔️ Attack Process

**Step 1: XOR the two chunks**

```python
data = open("firmware.bin", "rb").read()
chunk1, chunk2 = data[:4096], data[4096:8192]
xored = bytes(a ^ b for a, b in zip(chunk1, chunk2))
```

**Step 2: Scan for structure in the diff**

A long run of zero bytes appeared near the tail: both chunks had
identical (though not necessarily plaintext-zero) content there,
meaning no new information leaks from that region. More usefully,
scanning the diff as ASCII revealed **readable text**, including a
build-string fragment near the start and, further in, a run that read
directly as a flag.

**Step 3: Understand why the flag appears at all**

At the offset where the flag shows up, one chunk's plaintext holds the
literal flag bytes while the other chunk holds zero bytes at those same
positions (e.g. padding). Since `flag_byte XOR 0 = flag_byte`, the XOR
diff reproduces the flag characters directly: no keystream recovery
required.

---

## 🚩 Flag
```
flag{n***0_d***t_k********m_r***3}
```

---

## 💡 Lessons Learned

- **Never reuse a stream-cipher keystream**: the whole security of
  ChaCha20/RC4/OTP-style ciphers rests on the keystream never repeating;
  a reused nonce is a full break, no key recovery needed
- When two ciphertexts share a keystream, XOR them together first: don't try to decrypt directly. The diff alone is often enough to read
  useful plaintext, especially against structured data like firmware
  images with padding or known headers
- The flag's own content (`n0nZ3r0_dr1ft_k3ystr34m_r3us3` →
  "non-zero drift keystream reuse") was a wink at the vulnerability
  itself: worth reading challenge/flag text for hints, not just
  grinding the crypto blind

---

## 🛠️ Tools Used

- **Python 3**: chunk XOR and ASCII scanning

---

*Solved during Cybersecurity Hackathon 2026: legal, authorized CTF environment*
